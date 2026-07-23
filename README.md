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
- **Anything** can be unsealed by hand in author mode.

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

Settings → Download the archive saves a JSON snapshot of everything (media as
repo paths). Keep a copy somewhere that isn't a phone. This is the
"if something happens to this phone" backup.
