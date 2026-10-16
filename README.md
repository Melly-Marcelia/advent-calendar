# Advent Calendar

Build a 24-door advent calendar for someone, with no account needed. Write a message and add a
picture for each December day, then send the share link. The person you made it for opens one
door a day.

Built with Vue 3 + Vite from the
[Figma prototype](https://www.figma.com/design/ZL236Ych7Vv7VZv85JYsIm/Side-Fun-Project---Advent-Calendar).

**Live demo:** https://melly-marcelia.github.io/advent-calendar/

## How to use it

1. **Create**: on the home page, click **Create your calendar**. You land on your dashboard.
2. **Save your links**: the dashboard shows two links:
   - **Share link**: send this to the person the calendar is for. They can only view it.
   - **Edit link**: keep this private. It's the only way back into the dashboard, since there's no login.
3. **Fill the days**: each day card has a message, a gift image, and an optional "gift code"
   image (e.g. a Spotify code). Click **Save day N**, or **Save all changed** to save every edited day at once.
4. **Settings & theme** (collapsible section):
   - Change the title and subtitle.
   - **Unlock mode**: *Date-gated* opens each door on its December date; *Always unlocked* lets
     every door open right away.
   - **Upload a new theme**: replace the door artwork. Pick files named `day01-default.png`,
     `day01-hover.png`, … `day24-hover.png` (png/jpg/svg). Files with other names are skipped.
5. **Preview**: the **Preview** button next to the share link shows exactly what the recipient sees.
6. **Delete**: **Delete this calendar** removes it and all its images permanently.

The **see the demo** button on the home page opens a pre-filled example calendar with every door unlocked.

## Two modes

| | Demo mode (GitHub Pages) | Full mode (Supabase) |
|---|---|---|
| When | No Supabase keys at build time | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` set |
| Where data lives | This browser only (localStorage + IndexedDB) | Supabase database + storage |
| Share links work | On the same browser/device only | Anywhere |
| New calendars start | Always unlocked, so you can try every door | Date-gated |

Demo mode lets anyone try the whole flow (create, edit, upload, share preview, delete) on
the static GitHub Pages site, with no server. A banner at the bottom of the page tells visitors
they're in demo mode. The code is in [src/lib/localClient.js](src/lib/localClient.js): it copies the
Supabase RPC functions from [supabase/migrations](supabase/migrations), so the views don't change.

## Getting started

```bash
npm install
npm run dev       # local dev server
npm run build     # production build to dist/
npm run preview   # preview the production build
```

To use full mode locally, create `.env.local`:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
VITE_UNLOCK_ALL_FRAMES=true   # optional: ignore dates so every door opens during development
```

Leave out the Supabase lines to run in demo mode instead.

### Supabase setup (full mode)

Run the files in [supabase/migrations](supabase/migrations) in order in the Supabase SQL editor.
They create the tables, the token-checked RPC functions, and the `calendar-assets` storage bucket.

## Deploying to GitHub Pages

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds and deploys on every push to `main`.

1. In the repo, go to **Settings → Pages → Source** and pick **GitHub Actions**.
2. Push to `main`. The site is published at `https://<user>.github.io/advent-calendar/`.
3. Optional: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repository secrets
   (**Settings → Secrets and variables → Actions**) to deploy full mode instead of demo mode.

The site uses hash URLs (`/#/s/…`) so deep links work on a static host. The base path
`/advent-calendar/` is set in [vite.config.js](vite.config.js). Change it if you rename the repo.

## Project structure

```
src/
  assets/frames/         built-in door artwork (default + hover per day)
  assets/gifts/          demo calendar gift images
  components/            calendar grid, frame, modal, page shell, demo-mode banner
  components/edit/       dashboard pieces: links panel, settings, theme uploader, day card
  composables/           date-based unlock logic
  data/                  demo calendar content + built-in theme lookup
  lib/
    supabase.js          picks the real Supabase client or the local one
    localClient.js       browser-only backend for demo mode
    storage.js           image upload/remove helpers
    imageCompression.js  downscales big photos before upload
  views/                 Create, Edit (dashboard), Share, Demo
supabase/migrations/     database schema + RPC functions
```
