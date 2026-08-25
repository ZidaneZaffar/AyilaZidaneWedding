/*****************************************************************
 * WEDDING RSVP — Google Apps Script backend
 * Ayila Adzkiya Sucahyo & M Zidane Zaffar
 *
 * WHAT IT DOES
 *   • Appends every RSVP submission as a new row in a Google Sheet
 *   • Serves the wishes feed back to the website (JSONP — no CORS setup)
 *   • Creates + formats the sheet automatically on first run
 *
 * SETUP (5 minutes) — see README.md for screenshots-level detail
 *   1. Create a Google Sheet. Copy its ID from the URL:
 *        docs.google.com/spreadsheets/d/<<THIS PART>>/edit
 *   2. Extensions ▸ Apps Script. Delete the sample code, paste this file.
 *   3. Put the ID in SHEET_ID below (or leave "" if you used
 *      Extensions ▸ Apps Script from inside the sheet itself).
 *   4. Run ▸ setup   → authorise when prompted.
 *   5. Deploy ▸ New deployment ▸ Web app
 *        Execute as:      Me
 *        Who has access:  Anyone
 *      Copy the /exec URL into config.js → rsvp.scriptUrl
 *****************************************************************/

/* ============ CONFIG ============ */
var SHEET_ID    = "";            // "" = the sheet this script is bound to
var SHEET_NAME  = "RSVP";
var MAX_WISHES  = 500;           // how many wishes to send to the website
var HIDE_NON_ATTENDING_WISHES = false;  // true = only show wishes from guests who are coming

var HEADERS = ["Timestamp", "Nama", "Kehadiran", "Jumlah Tamu", "Ucapan & Doa", "Sumber"];


/* ============ ENTRY POINT ============
   Everything comes through doGet so the site never needs CORS.  */
function doGet(e) {
  var p        = (e && e.parameter) || {};
  var action   = p.action || "wishes";
  var callback = p.callback;
  var out;

  try {
    if (action === "submit") {
      out = handleSubmit(p);
    } else if (action === "wishes") {
      out = { ok: true, data: getWishes() };
    } else if (action === "ping") {
      out = { ok: true, message: "Wedding RSVP endpoint is live", time: new Date().toISOString() };
    } else {
      out = { ok: false, error: "UNKNOWN_ACTION" };
    }
  } catch (err) {
    out = { ok: false, error: String(err && err.message || err) };
  }

  return reply(out, callback);
}

/* Also accept real POSTs, in case you wire up a different frontend later. */
function doPost(e) {
  var p = (e && e.parameter) || {};
  if (e && e.postData && e.postData.contents) {
    try {
      var body = JSON.parse(e.postData.contents);
      for (var k in body) { if (body.hasOwnProperty(k)) p[k] = body[k]; }
    } catch (_) { /* form-encoded body already in e.parameter */ }
  }
  var out;
  try { out = handleSubmit(p); }
  catch (err) { out = { ok: false, error: String(err && err.message || err) }; }
  return reply(out, p.callback);
}

function reply(obj, callback) {
  var json = JSON.stringify(obj);
  if (callback && /^[A-Za-z_$][\w$]*$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}


/* ============ WRITE ============ */
function handleSubmit(p) {
  var name    = clean(p.name, 80);
  var att     = clean(p.attendance, 20);
  var message = clean(p.message, 500);
  var guests  = parseInt(p.guests, 10);

  if (!name || name.length < 2) return { ok: false, error: "INVALID_NAME" };
  if (!att)                     return { ok: false, error: "INVALID_ATTENDANCE" };
  if (!message)                 return { ok: false, error: "INVALID_MESSAGE" };
  if (isNaN(guests) || guests < 0) guests = 0;
  if (guests > 20) guests = 20;

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);                       // keeps concurrent submits from colliding
  try {
    var sheet = getSheet();
    sheet.appendRow([new Date(), name, att, guests, message, "Website"]);
    var row = sheet.getLastRow();
    sheet.getRange(row, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
    sheet.getRange(row, 1, 1, HEADERS.length)
         .setVerticalAlignment("top").setWrap(true);
    return { ok: true, row: row };
  } finally {
    lock.releaseLock();
  }
}


/* ============ READ ============ */
function getWishes() {
  var sheet = getSheet();
  var last  = sheet.getLastRow();
  if (last < 2) return [];

  var count = Math.min(MAX_WISHES, last - 1);
  var start = last - count + 1;
  var rows  = sheet.getRange(start, 1, count, HEADERS.length).getValues();

  var out = [];
  for (var i = rows.length - 1; i >= 0; i--) {   // newest first
    var r = rows[i];
    if (!r[1] || !r[4]) continue;
    if (HIDE_NON_ATTENDING_WISHES && String(r[2]).toLowerCase().indexOf("tidak") > -1) continue;
    out.push({
      name:       String(r[1]),
      attendance: String(r[2]),
      guests:     Number(r[3]) || 0,
      message:    String(r[4]),
      timestamp:  (r[0] instanceof Date) ? r[0].toISOString() : String(r[0])
    });
  }
  return out;
}


/* ============ SHEET HELPERS ============ */
function getSheet() {
  var ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("Spreadsheet not found — set SHEET_ID at the top of Code.gs");

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    initSheet(sheet);
  } else if (sheet.getLastRow() === 0) {
    initSheet(sheet);
  }
  return sheet;
}

function initSheet(sheet) {
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1, 1, HEADERS.length)
       .setFontWeight("bold")
       .setBackground("#66755a")
       .setFontColor("#ffffff")
       .setVerticalAlignment("middle");
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 160);  // Timestamp
  sheet.setColumnWidth(2, 200);  // Nama
  sheet.setColumnWidth(3, 120);  // Kehadiran
  sheet.setColumnWidth(4, 110);  // Jumlah Tamu
  sheet.setColumnWidth(5, 420);  // Ucapan
  sheet.setColumnWidth(6, 100);  // Sumber
  sheet.setRowHeight(1, 34);
}

/* Run this once from the editor to create + format the sheet
   and to trigger the authorisation prompt. */
function setup() {
  var sheet = getSheet();
  buildSummary(sheet.getParent());
  Logger.log("Ready. Sheet: " + sheet.getParent().getUrl());
}

/* Creates a small live dashboard tab (attending / not attending / head count). */
function buildSummary(ss) {
  var name = "Ringkasan";
  var s = ss.getSheetByName(name) || ss.insertSheet(name);
  s.clear();
  s.getRange("A1").setValue("RINGKASAN RSVP").setFontWeight("bold").setFontSize(14);
  var rows = [
    ["Total respon",          '=COUNTA(' + SHEET_NAME + '!B2:B)'],
    ["Hadir (respon)",        '=COUNTIF(' + SHEET_NAME + '!C2:C,"Hadir")'],
    ["Tidak hadir (respon)",  '=COUNTIF(' + SHEET_NAME + '!C2:C,"Tidak Hadir")'],
    ["Total tamu yang hadir", '=SUM(' + SHEET_NAME + '!D2:D)'],
    ["Total ucapan",          '=COUNTA(' + SHEET_NAME + '!E2:E)']
  ];
  s.getRange(3, 1, rows.length, 2).setValues(rows);
  s.getRange(3, 1, rows.length, 1).setFontWeight("bold");
  s.setColumnWidth(1, 220);
  s.setColumnWidth(2, 120);
}

/* Optional: get an email whenever someone RSVPs.
   To enable — Triggers ▸ Add trigger ▸ onFormSubmitNotify ▸ From spreadsheet ▸ On change */
function onFormSubmitNotify() {
  var sheet = getSheet();
  var last  = sheet.getLastRow();
  if (last < 2) return;
  var r = sheet.getRange(last, 1, 1, HEADERS.length).getValues()[0];
  MailApp.sendEmail({
    to: Session.getEffectiveUser().getEmail(),
    subject: "RSVP baru: " + r[1] + " — " + r[2],
    body: "Nama: " + r[1] + "\nKehadiran: " + r[2] + "\nJumlah tamu: " + r[3] +
          "\n\nUcapan:\n" + r[4] + "\n\n" + sheet.getParent().getUrl()
  });
}
