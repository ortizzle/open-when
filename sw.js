/* Open When — service worker.
 *
 * Network-first with cache fallback, scoped to the app SHELL ONLY. Cross-origin
 * requests (the GitHub Gist API, the private media repo, the Claude API, Google
 * Fonts) are never intercepted or cached — they always hit the network. This is
 * deliberate: caching an API response could show a phone stale letters or a
 * deletion that was already merged away, which is exactly the class of bug the
 * family-app-standards warn about. Keep this cache to the four shell files.
 *
 * Bump CACHE on any shell-file change so returning phones pick up new code
 * instead of a stale cache. Keep it in step with APP_VERSION in index.html.
 */
const CACHE = 'open-when-v1.5.1';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Navigations race the network against this timer. Without it, a flaky
// connection (reachable but silent) leaves the launch hanging on a splash
// screen for 30s+; with it, the cached shell takes over and the network
// response still lands in the cache for the next launch.
const NAV_TIMEOUT_MS = 3500;

function cachedShell(req) {
  return caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('./index.html'));
}

function navFetch(req) {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      cachedShell(req).then((hit) => {
        if (hit && !settled) { settled = true; resolve(hit); }
        // no cache yet (first-ever visit): keep waiting on the network
      });
    }, NAV_TIMEOUT_MS);
    fetch(req).then((res) => {
      clearTimeout(timer);
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      if (!settled) { settled = true; resolve(res); }
    }).catch(() => {
      clearTimeout(timer);
      cachedShell(req).then((hit) => {
        if (!settled) { settled = true; resolve(hit || Response.error()); }
      });
    });
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only ever touch same-origin GETs. Everything else (the Gist/media/Claude
  // APIs, fonts) passes straight through untouched.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(navFetch(req));
    return;
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('./index.html')))
  );
});
