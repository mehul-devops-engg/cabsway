# CabsWay — Outstation Cab Booking Website

**Live at:** cabsway.in
**Contact:** +91 91588 18546 · rushikeshahire125@gmail.com

A full outstation cab booking website for CabsWay, Nashik — built with plain
HTML/CSS/JS on the frontend, hosted free on GitHub Pages, with Google Sheets
(via Google Apps Script) as the backend. No paid hosting, no database
server, no build tools required.

---

## 1. What's in this project

```
cabsway/
├── CNAME                    GitHub Pages custom domain file (cabsway.in)
├── 404.html                 Custom not-found page
├── index.html               Home
├── booking.html             Booking form (fixed routes + custom destinations)
├── routes.html               The 4 fixed routes, no prices shown
├── about.html / contact.html / faq.html / reviews.html
├── sitemap.xml, robots.txt   SEO
├── css/
│   ├── style.css            Design system (colors, layout, responsive rules)
│   └── admin.css            Admin panel layout
├── js/
│   ├── main.js               Shared nav / FAQ accordion / toast messages
│   ├── api.js                 Talks to the Google Apps Script backend
│   ├── demo-data.js           Local fallback data (only used if API_URL isn't set)
│   ├── booking.js             Booking page logic
│   └── admin-*.js             One file per admin page
├── data/
│   ├── routes.txt             Reference copy of the 4 fixed routes
│   └── vehicles.txt           Reference copy of the 32-vehicle fleet
├── images/                    Logo, icons, vehicle illustrations, favicon
├── backend/
│   └── Code.js                 Paste into Google Apps Script (see below)
└── admin/                     Password-protected operator panel
    ├── login.html
    ├── dashboard.html          Today's revenue, trips, bookings, seats
    ├── trips.html              Create/edit/delete/complete trips
    ├── bookings.html            Create/edit/cancel/complete bookings
    ├── fleet.html                Vehicle list (Available/Maintenance)
    ├── reports.html               Daily/weekly/monthly stats
    └── settings.html              Business details, admin password
```

A ready-to-use spreadsheet (**CabsWay-Google-Sheet.xlsx**) is provided
separately — upload it to Google Drive and it becomes your database with
zero manual typing. See section 3.

---

## 2. Hosting on GitHub Pages with your domain (cabsway.in)

1. Create a GitHub repository and upload every file/folder from this
   project to its **root** (not inside a subfolder — GitHub Pages needs
   `index.html` sitting directly at the top level).
2. The `CNAME` file is already included with `cabsway.in` in it — keep it.
3. In the repo: **Settings → Pages**
   - Source: your branch (e.g. `main`), root folder
   - Custom domain: `cabsway.in` → Save
4. At your domain registrar, add:
   - **A records** for the apex domain → `185.199.108.153`,
     `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - **CNAME record** for `www` → `yourusername.github.io`
5. Wait for DNS to propagate (minutes to a few hours), then tick
   **Enforce HTTPS** in Settings → Pages once it's available.
6. To update the live site later: delete the old files in the repo (or
   just re-upload files with the same names — GitHub overwrites them),
   upload the new ones, commit. Pages rebuilds automatically in 1–2
   minutes. Hard-refresh your browser (Ctrl+Shift+R) to see changes.

---

## 3. Setting up the Google Sheets backend

**Easiest path — use the ready-made spreadsheet:**
1. Upload `CabsWay-Google-Sheet.xlsx` to Google Drive → right-click →
   **Open with → Google Sheets**. It converts automatically and already
   contains the real 32-vehicle fleet, the 4 fixed routes, and your
   contact details.
2. **Extensions → Apps Script** → delete the placeholder code → paste in
   the entire contents of `backend/Code.js`.
3. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Copy the `/exec` URL it gives you.
5. Open `js/api.js` and confirm/paste that URL into `CW_CONFIG.API_URL`
   (already set to the current deployment as of this build).
6. Redeploy (**Deploy → Manage deployments → Edit → New version**)
   any time you change `backend/Code.js` — the URL stays the same.

**Starting from a blank sheet instead:** create a new Google Sheet, paste
in `backend/Code.js` the same way, then run the `setupSheets()` function
once from the Apps Script editor (pick it from the function dropdown,
click ▶ Run, approve the permissions prompt). This builds all 6 tabs with
the same seed data as the ready-made spreadsheet.

### What's in each tab
| Tab | Purpose | Edit by hand? |
|---|---|---|
| **Vehicles** | 32 real cars: Swift, Aura, Ciaz, Ertiga, XL6, Innova, Innova Crysta, Kia Carens (4 each) | Yes, if your fleet changes |
| **Routes** | The 4 fixed routes (Nashik–Pune, Nashik–Mumbai, Nashik–Chhatrapati Sambhaji Nagar, Mumbai–Pune) | Rarely |
| **Trips** | Created by the admin panel | No — leave empty |
| **Bookings** | Created by the website and admin panel | No — leave empty |
| **Settings** | Business name, phone, email, GST, admin password | Yes — set a real admin password |
| **Reviews** | Shown on the Reviews page | Optional |

The **Settings → adminPassword** field is what you log into `/admin/`
with. Change it from the default before treating the site as fully live.

---

## 4. What changed in this build (bug fixes + new requirements)

**Fixed a root-cause bug affecting the whole admin panel:** Google Sheets
was silently converting date/time text into real Date values, which
displayed as garbled timestamps (e.g. `2026-07-22T18:30:00.000Z`) and
broke every "today" comparison — which is why the dashboard, today's
trips, and reports weren't updating. The backend now force-formats those
columns as plain text on write, and cleans up any value it reads back, so
dates/times always stay as clean `YYYY-MM-DD` / `HH:mm` strings.

**Trips (admin)**
- Vehicles under Maintenance no longer appear in the "+ New Trip" vehicle
  list (they still show, greyed out, if already assigned to a trip you're
  editing, so editing doesn't silently break).
- Total Seats is now auto-filled from the selected vehicle's real
  capacity and locked — it can no longer be typed to exceed what the car
  actually holds.
- Creating an identical trip twice (same pickup, drop, date, time,
  vehicle and driver) is now blocked with a clear message instead of
  silently duplicating.

**Bookings (admin)**
- A trip that's already Full can no longer be selected for a new booking
  (shown disabled in the list, with seats-left noted); the backend also
  rejects it server-side as a second layer of protection.
- The Cancel button no longer appears on bookings already marked
  Completed.

**Fleet / vehicles**
- The real fleet is now seeded in: **Swift, Aura, Ciaz, Ertiga, XL6,
  Innova, Innova Crysta, Kia Carens** — 4 of each, 32 total. Tempo
  Traveller has been removed everywhere.
- On the **public booking page**, customers now see only **one card per
  model** (e.g. one "Swift" card, not four identical ones) — the admin
  panel still shows and manages all 32 individual vehicles.

**Public site content**
- The Fleet page has been removed from the public site entirely (vehicle
  choices now appear directly inside the booking flow).
- Custom Destination bookings now work as: **pick a starting city from
  Nashik / Pune / Mumbai / Chhatrapati Sambhaji Nagar, then type any
  destination anywhere in India** (free text, no restrictive dropdown).
  Fixed Routes are unchanged.
- Removed the heavy focus on Shirdi/Trimbakeshwar as flagship custom-trip
  examples; copy across Home, Routes, About and FAQ now describes custom
  trips generically as "from these 4 cities to anywhere in India."
- All contact details updated to the real phone (+91 91588 18546),
  WhatsApp, and email (rushikeshahire125@gmail.com).

**Performance & mobile**
- Google Fonts now load fewer weights (noticeably faster first paint).
- Vehicle/icon images use `loading="lazy"` so only what's visible loads
  immediately.
- The backend caches read-mostly data (vehicles, routes, reviews,
  settings) for 2 minutes so pages don't wait on a fresh Sheets read
  every time.
- Several admin pages now fire their initial data requests in parallel
  instead of one-after-another, cutting page-load time roughly in half.
- Fixed two-column layouts (Booking, Contact) that were previously
  hard-coded and didn't collapse to one column on phones — they now do.

---

## 5. Testing checklist after upload

- [ ] Visit `cabsway.in` — confirm the homepage loads and looks right on
      both a phone and a desktop browser.
- [ ] Book a **Fixed Route** end-to-end and confirm the WhatsApp message
      opens with the right number.
- [ ] Book a **Custom Destination**, confirm pickup is restricted to the
      4 cities and drop accepts free text.
- [ ] Log into `/admin/` with your Settings-tab password.
- [ ] Create a trip; confirm the date/time show cleanly (not as long
      ISO/UTC strings) and the seat count matches the vehicle capacity.
- [ ] Try creating the exact same trip again — it should be blocked.
- [ ] Create a booking against a trip until it's Full, then try to add
      one more — it should be blocked.
- [ ] Complete a booking, confirm its Cancel button disappears.
- [ ] Check the Dashboard and Reports pages show non-zero numbers that
      match what you just created.
- [ ] Mark a vehicle as Maintenance in Fleet, confirm it disappears from
      both the public booking page and the "+ New Trip" vehicle list.

## 6. If something looks wrong

Most issues trace back to one of:
1. `js/api.js` — is `API_URL` the real deployed `/exec` link, not the
   placeholder?
2. Did you **redeploy** (new version) after last editing `Code.js`?
3. Hard-refresh (Ctrl+Shift+R) — browsers cache JS aggressively.
4. Check the Apps Script **Executions** log (left sidebar in the Apps
   Script editor) for the exact error if a save/booking silently fails.
