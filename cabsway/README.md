# CabsWay V2

Nashik-based outstation cab booking website + single-operator admin panel,
built with plain HTML / CSS / JS on the frontend and Google Sheets (via
Google Apps Script) as the backend. No external database, no build step.
Fares are never published on the site — every trip is quoted directly by
the operator on WhatsApp.

## Folder guide

```
cabsway/
├── CNAME                   GitHub Pages custom domain file (cabsway.in)
├── 404.html                Custom not-found page
├── index.html              Home
├── booking.html            Fixed route / custom destination booking + WhatsApp confirm
├── fleet.html               Available vehicles
├── routes.html              Fixed routes: Nashik⇄Pune, Nashik⇄Mumbai, Nashik⇄Chhatrapati
│                            Sambhaji Nagar, Mumbai⇄Pune, plus custom-destination content
├── about.html / contact.html / faq.html / reviews.html
├── sitemap.xml, robots.txt  SEO
├── css/
│   ├── style.css           Public site design system
│   └── admin.css           Admin panel layout
├── js/
│   ├── main.js             Shared nav / FAQ / reveal-on-scroll / toast
│   ├── api.js              Talks to the Apps Script backend (or demo fallback)
│   ├── demo-data.js         In-browser demo data, used until the backend is deployed
│   ├── booking.js           Fixed/custom route toggle, trip ticket preview, WhatsApp
│   └── admin-*.js           One file per admin page (unchanged from V2 launch)
├── data/
│   ├── routes.txt           Seed data for the Routes sheet tab (4 fixed routes)
│   └── vehicles.txt         Seed data for the Vehicles sheet tab
├── images/                  Logo, icons, vehicle illustrations, favicon, OG image
├── backend/
│   └── Code.js              Paste into Google Apps Script as Code.gs
└── admin/                    Unchanged — dashboard, trips, bookings, fleet, reports, settings
```

## What changed in this update

- **Fixed Route / Custom Destination** toggle added to the homepage quick
  search and the booking page. Fixed routes: Nashik ⇄ Pune, Nashik ⇄ Mumbai,
  Nashik ⇄ Chhatrapati Sambhaji Nagar, Mumbai ⇄ Pune (unchanged). Custom
  Destination is a plain free-text pickup/drop — no suggestion dropdown —
  so customers can type any location anywhere in India, not just Maharashtra.
- **Fare Calculator removed entirely** — the page, its script, and every
  link to it. The booking page no longer shows any fare number; it shows a
  fare-free "Trip Ticket" preview instead, and the WhatsApp message asks
  the team to confirm the fare, driver and car.
- **Popular Routes page rebuilt** around the four fixed routes, with no
  prices and no "Calculate Fare" button — just a "Book" button per
  direction that pre-fills the booking form.
- **Homepage / About / Contact / FAQ copy rewritten** to remove all
  "upfront fare" language and add brand-recognition SEO copy (see below).
- **Contact page**: office/address card replaced with an "on-call, no
  walk-in office" note, since CabsWay doesn't have a physical office.
- **Backend**: `estimateFare` action removed; the `Routes` sheet tab now
  only stores `from`, `to`, `distanceKm` (no public fare columns). The
  admin panel itself is unchanged — fare and payment are still entered
  manually per booking on the Bookings page, exactly as before.

## Hosting on GitHub Pages with cabsway.in

1. Push this whole folder to a GitHub repository (root of the repo, or a
   `/docs` folder — either works, just set it in step 3).
2. The `CNAME` file is already included with `cabsway.in` in it — don't
   delete it, GitHub Pages reads this to know your custom domain.
3. In your repo: **Settings → Pages**
   - Source: the branch/folder your site lives in
   - Custom domain: `cabsway.in` → Save
   - Once DNS (next step) is verified, tick **Enforce HTTPS**
4. At your domain registrar, set these DNS records:
   - **A records** for the apex (`cabsway.in`) pointing to GitHub Pages' IPs:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - **CNAME record** for `www` → `<your-github-username>.github.io`
   - This makes both `cabsway.in` and `www.cabsway.in` resolve, with GitHub
     automatically redirecting `www` to the primary `cabsway.in` domain.
5. DNS can take a few hours to propagate. Once it does, GitHub issues a
   free HTTPS certificate automatically.
6. In **Google Search Console**, add and verify both `https://cabsway.in`
   and `https://www.cabsway.in` as properties (domain-level verification
   via DNS TXT record covers both at once), then submit
   `https://cabsway.in/sitemap.xml`.
7. Create/claim a **Google Business Profile** for CabsWay in Nashik — this
   is the single biggest lever for ranking on brand and local searches
   like "cabsway", "cabs way", "cab's way", and "nashik cab service", far
   more than any on-page change.

## Running it without any setup

Every page works immediately — open `index.html` in a browser. Until you
deploy the backend, `js/demo-data.js` simulates the Google Sheet in
`localStorage`, so you can click through booking and the admin panel with
realistic sample data. Admin demo password: `cabsway123`.

## Connecting the real Google Sheets backend

1. Create a new Google Sheet, e.g. "CabsWay DB".
2. **Extensions → Apps Script**, delete the placeholder code, paste in
   `backend/Code.js`.
3. Run `setupSheets()` once from the Apps Script editor and approve the
   permissions prompt. This creates all tabs with headers and seed rows,
   including the four fixed routes.
4. **Deploy → New deployment → Web app** — Execute as **Me**, access
   **Anyone**.
5. Copy the `/exec` URL into `js/api.js` as `CW_CONFIG.API_URL`.
6. Set your real WhatsApp number in the same file:
   ```js
   WHATSAPP_NUMBER: '91XXXXXXXXXX' // country code + number, digits only
   ```
7. Redeploy (**Deploy → Manage deployments → Edit → New version**)
   whenever you edit `backend/Code.js`.

## On-page SEO already in place

- Canonical URLs, Open Graph tags (with absolute image URLs), and
  `TaxiService` schema with `alternateName` covering "Cabs Way", "Cab's
  Way", "Cabsway Nashik" and "cab'sway" for brand-variant searches.
- `aggregateRating` schema matching the reviews actually shown on the
  Reviews page (kept in sync — update both together if reviews change).
- `sitemap.xml` and `robots.txt` pointing at `cabsway.in`, with `/admin/`,
  `/backend/` and `/data/` disallowed from crawling.
- A custom `404.html` so broken links don't produce a generic GitHub
  "File not found" page.

### A realistic note on ranking #1

On-page work like this makes CabsWay very easy for Google to understand
and gives it a strong shot at ranking #1 for the brand itself — "CabsWay",
"Cabs Way", "Cab's Way", "cabsway.in" — since there's little to no
competition for your own brand name. Ranking for broader, non-branded
terms ("nashik pune cab", "outstation cabs nashik") takes longer and
depends on things outside this codebase: a verified Google Business
Profile, consistent NAP (name/address/phone) citations, genuine reviews
over time, and other sites linking to yours. No website file can
guarantee a #1 ranking for competitive local terms — that part is ongoing
off-site work, not a one-time setup.

## Notes / next steps

- Export to PDF/Excel on the admin Reports page are still stubbed with a
  "coming soon" toast, unchanged from the V2 launch.
- Replace the placeholder phone number (`+91 12345 67890`) throughout the
  HTML, and in `js/api.js`, with your real WhatsApp/booking number.
- The admin panel is unchanged in this update — vehicles, trips, bookings,
  reports and settings all work exactly as before.
