# Kerala by road — 2026

**Live at <https://abdul-alim.github.io/>** — open it in Safari on the iPhone, then
Share → Add to Home Screen.

A nine-day road trip app for the drive from Potheri to Madurai, up to Munnar,
a birthday night on an Alleppey houseboat, then Kochi and home through Salem.
Built as an installable, offline-capable web app (PWA) for a phone.

Hosted on GitHub Pages from the `abdul-alim.github.io` repository (user site,
`main` branch, root folder). Pushing to `main` redeploys automatically.

## What is in here

| File | Purpose |
| --- | --- |
| `index.html` | The whole app. Data, styles and logic in one file — no build step. |
| `manifest.webmanifest` | Makes it installable, sets the home-screen name and colours. |
| `sw.js` | Service worker. Caches the app so it opens with no signal. |
| `photos/` | The family photo used on the Route page. |
| `icons/` | Home-screen icons (`icon-*`), Android maskable icons, and the iOS `apple-touch-icon`. |
| `favicon.ico` | Browser tab icon. |
| `_headers` | Netlify only: correct type for the manifest, no-cache for `sw.js`. |
| `.nojekyll` | GitHub Pages only: serve the files as-is. |

## Putting it online

The app must be served over **HTTPS** for offline caching and "Add to Home
Screen" to work. Upload the **contents** of this folder, not the folder itself,
so `index.html` sits at the top level.

### Netlify Drop — no account needed

1. Go to <https://app.netlify.com/drop>.
2. Drag this `kerala-trip-app` folder onto the page.
3. You get an HTTPS link straight away, like `https://calm-otter-1a2b3c.netlify.app`.
4. Open that link on your phone. Claim the site if you want to keep it, rename
   it, or update it later by dragging the folder again.

### GitHub Pages — if you would rather own the repo

1. Create a new **public** repository, for example `kerala-trip-2026`.
2. Upload the contents of this folder to the repository root.
3. In the repository: **Settings → Pages → Source: Deploy from a branch**,
   then **`main`** and **`/ (root)`**, and save.
4. After about a minute the app is at
   `https://<your-username>.github.io/kerala-trip-2026/`.

From the command line instead of the web upload:

```bash
cd kerala-trip-app
git init && git add . && git commit -m "Kerala trip app"
git branch -M main
git remote add origin https://github.com/<your-username>/kerala-trip-2026.git
git push -u origin main
```

Then do step 3 above.

Both routes work with the same files. Every path in the app is relative, so it
works from a subfolder (`/kerala-trip-2026/`) or from a domain root.

## Installing it on the iPhone

**Use Safari.** Chrome and other browsers on iOS cannot install a web app to the
home screen.

1. Open the hosted link in Safari.
2. Tap the **Share** button.
3. Scroll down and tap **Add to Home Screen**, then **Add**.
4. Open it from the home screen. It runs full screen, with no browser bars.

The app shows this instruction once by itself the first time it is opened in
Safari on an iPhone.

## Using it

- **Day** — the day you are on, with a photo, the day's numbers and the next
  stop. Tap **Navigate** to open it in Google Maps, or the second button to mark
  it reached.
- Tap any stop row for the note, a photo and directions.
- The **Tonight** panel names the hotel for the night and has its own
  **Navigate** button. **Set location** lets you swap in a different hotel,
  address or pin — press `Cancel` and nothing changes. A set location is used
  everywhere in the app, including the Navigate button on that row.
- **Route** — all nine days with the night's stay and distances. Tap a day to
  jump to it.
- **Money** — costs and the packing and booking checklists.
- Reached marks, skipped stops and checklist ticks are saved on the device.
  They are per-device and are not shared between phones.
- Photos come from Wikipedia and need a connection. Everything else works
  offline, including the notes and the maps links (which open when you get signal).

### The stays on the itinerary

| Night | Where |
| --- | --- |
| 24 Oct | Sterling V Grand Madurai |
| 25 Oct | Avadale Munnar |
| 26–27 Oct | The Regalia Munnar |
| 28 Oct | Alleppey houseboat — birthday dinner on board, night on the boat |
| 29–30 Oct | Ernakulam hotel |
| 31 Oct | Salem hotel |

## Updating the app

Edit `index.html`, then **bump the cache name in `sw.js`**:

```js
const CACHE = "kerala-v2";      // -> "kerala-v3"
const RUNTIME = "kerala-rt-v2"; // -> "kerala-rt-v3"
```

Then re-upload or push. Page loads prefer the network, so edits show up on the
next open; bumping the cache clears the old assets out of storage.

## Testing on the computer

A service worker will not run from a `file://` path, so serve the folder:

```bash
cd kerala-trip-app
python3 -m http.server 8899
```

Then open <http://127.0.0.1:8899>.

To preview a specific day or a state other than the real date, add `?now=`:

```
http://127.0.0.1:8899/?now=2026-10-28T14:00   # day 5, mid-afternoon
http://127.0.0.1:8899/?now=2026-10-11T09:00   # before the trip starts
```

## Notes

- All timings, fares and opening hours are planning estimates. Confirm them
  when you book.
- iOS may clear storage for a site that has not been opened for several weeks.
  During the trip it is used daily, so the ticks will hold.
