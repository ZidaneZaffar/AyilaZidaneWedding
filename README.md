# Ayila & Zidane — Digital Wedding Invitation

A mobile-first, single-page wedding invitation with live RSVP, a real-time wishes wall backed by Google Sheets, a countdown, Google Maps and Google Calendar integration.

**Stack:** plain HTML + CSS + vanilla JS (no build step, no dependencies) · Google Apps Script + Google Sheets as the database · GitHub Pages for hosting.

---

## 1 · Files

```
├── index.html                    the whole page (structure only)
├── styles.css                    Ivory & Sage theme
├── app.js                        countdown, RSVP, wishes, music, links
├── config.js        ← EDIT THIS  all names, dates, addresses, bank details
├── apps-script/Code.gs           the Google Apps Script backend
├── tools/link-generator.html     make personalised links per guest
├── assets/img/                   photos (groom.jpg, bride.jpg, og-cover.jpg)
├── assets/audio/                 song.mp3
├── .github/workflows/deploy.yml  auto-deploy to GitHub Pages
├── .nojekyll                     stops Pages from mangling the files
└── deploy.sh                     one-command publish
```

**`config.js` is the only file you ever need to touch for content.** Everything on the page reads from it.

---

## 2 · Google Sheets + Apps Script setup (~5 min)

1. Go to **[sheets.new](https://sheets.new)** and name the file, e.g. *RSVP Ayila & Zidane*.
2. **Extensions ▸ Apps Script.** Delete the sample `myFunction`, paste the whole of `apps-script/Code.gs`.
3. Leave `SHEET_ID = ""` (the script is bound to this sheet already).
4. Click **Save**, then choose `setup` in the function dropdown and press **Run**.
   Google will ask for authorisation → *Review permissions* → pick your account →
   *Advanced* → *Go to <project> (unsafe)* → **Allow**.
   *(That warning is normal for personal scripts — you're authorising your own code.)*
   Two tabs appear in the sheet: **RSVP** and **Ringkasan**.
5. **Deploy ▸ New deployment ▸** gear icon **▸ Web app**
   - Description: `RSVP v1`
   - Execute as: **Me**
   - Who has access: **Anyone** ← required, otherwise guests get a login screen
   - **Deploy** → copy the **Web app URL** (ends in `/exec`).
6. Paste that URL into `config.js`:

```js
rsvp: {
  scriptUrl: "https://script.google.com/macros/s/AKfy…/exec",
  ...
}
```

**Test it:** open `<your-exec-url>?action=ping` in a browser. You should see
`{"ok":true,"message":"Wedding RSVP endpoint is live",...}`.

### Sheet structure

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Timestamp | Nama | Kehadiran | Jumlah Tamu | Ucapan & Doa | Sumber |
| 2026-08-25 19:04:11 | Ade Fitriyani | Hadir | 2 | Wishing you both a lifetime of happiness! | Website |

The **Ringkasan** tab live-counts total responses, attending, not attending, and total head count. Export any time with **File ▸ Download ▸ .xlsx / .csv**.

> ⚠️ **After editing `Code.gs` you must re-deploy:** *Deploy ▸ Manage deployments ▸ ✏️ ▸ Version: New version ▸ Deploy.* The `/exec` URL stays the same.

---

## 3 · Deploy to GitHub Pages

### Option A — one command (needs the [`gh` CLI](https://cli.github.com), logged in with `gh auth login`)

```bash
chmod +x deploy.sh
./deploy.sh YOUR_GITHUB_USERNAME wedding-ayila-zidane
```

### Option B — manual

```bash
git init
git add -A
git commit -m "Wedding invitation"
git branch -M main
git remote add origin https://github.com/USERNAME/wedding-ayila-zidane.git
git push -u origin main
```

Then **Settings ▸ Pages ▸ Source = GitHub Actions**. The included workflow publishes on every push.

Live at `https://USERNAME.github.io/wedding-ayila-zidane/` within ~60 seconds.

**Custom domain (optional):** add a file named `CNAME` containing e.g. `ayilazidane.com`, point an `A` record at GitHub's IPs (`185.199.108–111.153`), then set the domain under Settings ▸ Pages.

---

## 4 · Personalised guest links

Open `tools/link-generator.html` in a browser, paste your invitation URL and a list of names, and it produces one link per guest:

```
https://username.github.io/wedding-ayila-zidane/?to=Ade%20Fitriyani
```

The guest's name then appears under *"Kepada Yth."* on the cover and pre-fills the RSVP form. Export the whole list as CSV for WhatsApp blasting.

---

## 5 · Maintenance cheatsheet

| I want to… | Do this |
|---|---|
| Change names / parents | `config.js ▸ couple` |
| Change the date | `config.js ▸ wedding` **and** `events[].startISO/endISO` **and** `calendar` |
| Change the countdown target | `config.js ▸ wedding.countdownTo` |
| Change the venue or map pin | `config.js ▸ venue` (`mapsUrl` = the share link, `mapsEmbedQuery` = plain-text address) |
| Add the bank account | `config.js ▸ gift.accounts[0]` — replace `BANK_NAME` / `0000000000` |
| Add a second bank account | copy the commented-out block in `gift.accounts` |
| Add photos | drop `bride.jpg` / `groom.jpg` into `assets/img/` (portrait, ~800×1000, under 300 KB) |
| Add music | drop `song.mp3` into `assets/audio/` (under 4 MB). Set `music.src = ""` to hide the button |
| Change the max guest count | `config.js ▸ rsvp.maxGuests` |
| Hide wishes from non-attendees | `Code.gs ▸ HIDE_NON_ATTENDING_WISHES = true`, then re-deploy |
| Delete a rude message | delete the row in the Google Sheet — it disappears from the site within 30 s |
| Get an email per RSVP | in Apps Script: **Triggers ▸ Add trigger ▸ `onFormSubmitNotify` ▸ From spreadsheet ▸ On change** |
| Change the wishes refresh rate | `config.js ▸ rsvp.pollInterval` (ms) |
| Preview the wishes wall before Sheets is wired up | add `demoWishes: [{name,attendance,guests,message,timestamp}]` inside `rsvp` in `config.js` — used only while `scriptUrl` is empty. **Delete it before going live.** |
| Preview locally | `python3 -m http.server 8080` then open `localhost:8080` |

After any edit: `git add -A && git commit -m "update" && git push` — Pages redeploys automatically.

---

## 6 · Troubleshooting

| Symptom | Fix |
|---|---|
| "RSVP belum aktif" under the form | `config.js ▸ rsvp.scriptUrl` is still empty |
| "Gagal mengirim" | Deployment access isn't **Anyone**, or you edited `Code.gs` without re-deploying a new version |
| Wishes never appear | Open `<exec-url>?action=wishes` directly — it should return JSON. If it asks you to sign in, the deployment access is wrong |
| Map iframe blank | Check `venue.mapsEmbedQuery` is a plain address string, not a shortened `maps.app.goo.gl` link |
| Music doesn't autoplay | Expected — iOS and Android block autoplay until the guest taps. The button starts it; the "Buka Undangan" tap usually counts as the gesture |
| Countdown shows 00 everywhere | `wedding.countdownTo` is in the past, or missing the `+07:00` offset |

---

## 7 · Requirements checklist

- [x] RSVP form: full name, attendance, number of guests, wishes
- [x] Every submission appends a new row to Google Sheets in real time
- [x] Data exportable (CSV/XLSX) and manageable, plus a live summary tab
- [x] Wishes appear below the RSVP section, newest first, auto-refreshing every 30 s
- [x] Wishes show guest name, attendance badge, relative time and message
- [x] Countdown with days / hours / minutes / seconds
- [x] Venue address is clickable → opens Google Maps
- [x] Embedded map preview
- [x] Date & time clickable → Google Calendar prefilled with title, date, time, venue, description
- [x] Separate "Save the Date" buttons for Akad and Resepsi
- [x] All couple/family/venue data isolated in `config.js`
- [x] Gift section — "Wanna give us some gifts?" with bank account + delivery address, one-tap copy
- [x] Sections: cover · couple · countdown · events · maps · RSVP · wishes · gift · closing
- [x] Elegant, modern, premium, mobile-first, responsive, smooth scrolling
- [x] Fade-in scroll animations, floating music button, safe-area insets for iPhone
- [x] Deployed via GitHub Pages, no build step, ~40 KB total
- [x] Google Apps Script backend included
- [x] Maintenance instructions (this file)
- [x] Bonus: personalised guest links + link generator tool
