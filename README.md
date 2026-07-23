# Open When

A private legacy time capsule for Sedona and River. Chris and Kat write
letters, prompt answers, photo stories, and voice notes, sealed into
"open when…" milestone envelopes that unlock over the years — some by
birthday, some when the moment is right.

Live at **https://ortizzle.github.io/open-when/**

## How it's put together

Single `index.html`, no build step, no framework — deployed straight to GitHub
Pages. Installs to the home screen as a PWA (`manifest.json` + `sw.js`).

- **Text** (entries, unlocks, settings) lives in one secret Gist
  (`open-when-data` / `data.json`), synced with a safe-merge + tombstone model:
  newest `updatedAt` wins per record, deletes are tombstones that never
  resurrect, tombstones prune after 60 days.
- **Media** (photos, voice notes) lives in the private repo
  **`ortizzle/open-when-media`**, uploaded via the GitHub contents API and
  fetched back through the API with auth (raw URLs don't work on private repos).
  Only the repo path is stored in the entry record.
- **Nothing personal is in the code.** First names, birthdates, the keeper
  passphrase hash, and both tokens all live behind the GitHub token, in the
  Gist or on the device — never in this repository.

All dates use Arizona time (no DST). The service worker caches the app shell
only; it never caches the Gist, media, or Claude APIs, so a phone can't show
stale letters or a merged-away deletion.

## Unlock model

Unlocks are synced records (`unlock_<who>_<milestone>`):

- **Birthday envelopes** (13, 16, 18) auto-unlock the first time any device
  notices the birthday has passed, computed from birthdates stored in the
  synced settings record.
- **Moment envelopes** (heartbreak, hard day, wedding, becoming a parent,
  missing me) need the keeper passphrase, entered by Kat when the time is right.
  The real passphrase never leaves the device — only its SHA-256 hash syncs.
- **Custom envelopes** can be added from the shelf ("+ A new envelope") and
  open by keeper passphrase, by hand, or on a chosen date. They sync as
  `milestone` records and can be removed only while empty.
- **"Open whenever"** holds the one-line quick captures (little notes) and is
  never sealed — the girls can read it the day they get the book.
- **Anything** can be unsealed by hand in author mode.

A welcome note (written in Settings) greets the girls before any envelope the
first time reader mode opens. When Mom and Dad answer the same prompt for the
same girl, readers see both answers together on one card.

## First-run setup

**Author phone (Chris or Kat):**

1. Open the app → gear → "I have the key."
2. Choose who's writing on this device.
3. Paste the GitHub token (fine-grained: Contents read/write on
   `open-when-media`, Gists read/write).
4. Tap "Create a fresh Gist for this book" — the id fills in automatically.
5. Enter Sedona's and River's birthdates; Kat sets the keeper passphrase.

**Second author phone:** same token, same Gist id (copy it from the first
phone's Settings). Both phones now sync.

**Reader phones (the girls, someday):** same token, role "Reader." The keeper
sheet the app generates walks through exactly this.

## Backups

Three layers:

1. **Automatic daily mirror** — each day's first successful sync also writes
   `backup/data.json` into the private media repo, so a Gist mishap alone can
   never erase the book.
2. **Settings → Backup, the words** — a light JSON snapshot (media as repo
   paths).
3. **Settings → Backup, everything** — the full bundle with photos and voice
   embedded. This is the real "if anything happens" file; keep a copy
   somewhere that isn't a phone.

**Settings → Restore from a backup file** loads either format back in. Restore
merges — per record, the newest version wins — so an old backup can never
overwrite newer writing. Bundles also offer to re-upload their embedded media
into the media repo.

The app also warns (quietly, via the API's token-expiration header) when the
GitHub key is within 30 days of expiring.
