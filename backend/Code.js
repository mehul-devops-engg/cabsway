/**
 * =====================================================================
 * CabsWay V2 — Google Apps Script backend
 * =====================================================================
 * SETUP
 * 1. Create a new Google Sheet (or use the ready-made CabsWay-Google-Sheet.xlsx
 *    — upload it to Drive, open with Google Sheets, and skip to step 4).
 * 2. Open Extensions > Apps Script, delete any starter code, and paste
 *    this entire file in as Code.gs.
 * 3. Run setupSheets() once from the Apps Script editor. This creates all
 *    tabs with headers and seed data if they don't already exist. Grant
 *    the permissions it asks for.
 * 4. Deploy > New deployment > type "Web app".
 *      Execute as:      Me
 *      Who has access:  Anyone
 * 5. Copy the generated Web app URL and paste it into
 *    js/api.js as CW_CONFIG.API_URL.
 * 6. Re-deploy (Deploy > Manage deployments > Edit > New version)
 *    whenever you change this script.
 *
 * SHEET TABS
 *   Vehicles, Routes, Trips, Bookings, Settings, Reviews
 * =====================================================================
 */

var SHEET_NAMES = {
  VEHICLES: 'Vehicles',
  ROUTES: 'Routes',
  TRIPS: 'Trips',
  BOOKINGS: 'Bookings',
  SETTINGS: 'Settings',
  REVIEWS: 'Reviews'
};

// Columns that must never be auto-converted to Date objects by Sheets,
// and how to format them back to plain strings if they already were.
var DATE_ONLY_FIELDS = ['date'];
var TIME_ONLY_FIELDS = ['time'];
var DATETIME_FIELDS = ['createdAt'];

// Cache TTL (seconds) for read-mostly public data, to keep the site fast.
var CACHE_TTL_SECONDS = 120;

/* ---------------------------------------------------------------------
   Entry points
--------------------------------------------------------------------- */

function doPost(e) {
  var response;
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var payload = body.payload || {};
    var data = routeAction(action, payload);
    response = { ok: true, data: data };
  } catch (err) {
    response = { ok: false, error: err.message };
  }
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, data: 'CabsWay API is running.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function routeAction(action, payload) {
  switch (action) {
    case 'getVehicles': return getVehicles();
    case 'getRoutes': return getRoutes();
    case 'getReviews': return getReviews();
    case 'createBooking': return createBooking(payload);

    case 'login': return login(payload);

    case 'getTrips': return getTrips();
    case 'createTrip': return createTrip(payload);
    case 'updateTrip': return updateTrip(payload);
    case 'deleteTrip': return deleteTrip(payload);
    case 'completeTrip': return completeTrip(payload);

    case 'getBookings': return getBookings();
    case 'updateBooking': return updateBooking(payload);
    case 'cancelBooking': return cancelBooking(payload);
    case 'completeBooking': return completeBooking(payload);

    case 'createVehicle': return createVehicle(payload);
    case 'updateVehicle': return updateVehicle(payload);
    case 'updateVehicleStatus': return updateVehicleStatus(payload);
    case 'deleteVehicle': return deleteVehicle(payload);

    case 'getSettings': return getSettings();
    case 'updateSettings': return updateSettings(payload);

    case 'getReports': return getReports();

    default: throw new Error('Unknown action: ' + action);
  }
}

/* ---------------------------------------------------------------------
   Generic sheet helpers
--------------------------------------------------------------------- */

function getSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Sheet not found: ' + name + '. Run setupSheets() first.');
  return sheet;
}

/** Converts a Date value Sheets may have auto-parsed back into a plain string. */
function normalizeCellValue_(header, value) {
  if (Object.prototype.toString.call(value) !== '[object Date]') return value;
  var tz = Session.getScriptTimeZone() || 'Asia/Kolkata';
  if (DATE_ONLY_FIELDS.indexOf(header) !== -1) return Utilities.formatDate(value, tz, 'yyyy-MM-dd');
  if (TIME_ONLY_FIELDS.indexOf(header) !== -1) return Utilities.formatDate(value, tz, 'HH:mm');
  if (DATETIME_FIELDS.indexOf(header) !== -1) return value.toISOString();
  return value.toISOString();
}

/** Reads a sheet into an array of plain objects keyed by header row. */
function sheetToObjects(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  var rows = values.slice(1);
  return rows
    .filter(function (row) { return row.join('') !== ''; })
    .map(function (row) {
      var obj = {};
      headers.forEach(function (h, i) { obj[h] = normalizeCellValue_(h, row[i]); });
      return obj;
    });
}

/** Forces the date/time columns of one row to plain-text format so Sheets can't re-parse them as dates. */
function forceTextFormatForRow_(sheet, rowNum, headers) {
  headers.forEach(function (h, i) {
    if (DATE_ONLY_FIELDS.indexOf(h) !== -1 || TIME_ONLY_FIELDS.indexOf(h) !== -1 || DATETIME_FIELDS.indexOf(h) !== -1) {
      sheet.getRange(rowNum, i + 1).setNumberFormat('@');
    }
  });
}

/** Appends one object as a new row, in the sheet's existing header order. */
function appendObject(sheet, obj) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = headers.map(function (h) { return obj[h] !== undefined ? obj[h] : ''; });
  var targetRow = sheet.getLastRow() + 1;
  forceTextFormatForRow_(sheet, targetRow, headers);
  sheet.getRange(targetRow, 1, 1, headers.length).setValues([row]);
}

/** Finds the 1-indexed sheet row number where idColumn === idValue. Returns -1 if not found. */
function findRowIndex(sheet, idColumn, idValue) {
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var idIdx = headers.indexOf(idColumn);
  for (var r = 1; r < values.length; r++) {
    if (String(values[r][idIdx]) === String(idValue)) return r + 1; // 1-indexed sheet row
  }
  return -1;
}

/** Merges `updates` into the row identified by idColumn/idValue. */
function updateRow(sheet, idColumn, idValue, updates) {
  var rowNum = findRowIndex(sheet, idColumn, idValue);
  if (rowNum === -1) throw new Error('Record not found: ' + idValue);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var currentRow = sheet.getRange(rowNum, 1, 1, headers.length).getValues()[0];
  var merged = {};
  headers.forEach(function (h, i) { merged[h] = normalizeCellValue_(h, currentRow[i]); });
  Object.keys(updates).forEach(function (k) { if (headers.indexOf(k) !== -1) merged[k] = updates[k]; });
  var newRow = headers.map(function (h) { return merged[h]; });
  forceTextFormatForRow_(sheet, rowNum, headers);
  sheet.getRange(rowNum, 1, 1, headers.length).setValues([newRow]);
  return merged;
}

function deleteRow(sheet, idColumn, idValue) {
  var rowNum = findRowIndex(sheet, idColumn, idValue);
  if (rowNum === -1) throw new Error('Record not found: ' + idValue);
  sheet.deleteRow(rowNum);
}

function nextId(sheet, idColumn, prefix) {
  var objs = sheetToObjects(sheet);
  var max = 0;
  objs.forEach(function (o) {
    var n = parseInt(String(o[idColumn]).replace(prefix + '-', ''), 10);
    if (!isNaN(n) && n > max) max = n;
  });
  return prefix + '-' + (max + 1);
}

/** Small read-through cache for data that rarely changes, to keep page loads fast. */
function cached_(key, producerFn) {
  var cache = CacheService.getScriptCache();
  var hit = cache.get(key);
  if (hit) return JSON.parse(hit);
  var value = producerFn();
  try { cache.put(key, JSON.stringify(value), CACHE_TTL_SECONDS); } catch (e) { /* value too large for cache, ignore */ }
  return value;
}
function clearCache_(key) {
  CacheService.getScriptCache().remove(key);
}

/* ---------------------------------------------------------------------
   Public site actions
--------------------------------------------------------------------- */

function getVehicles() {
  return cached_('vehicles', function () {
    return sheetToObjects(getSheet(SHEET_NAMES.VEHICLES)).map(function (v) {
      v.features = String(v.features || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      return v;
    });
  });
}

function getRoutes() { return cached_('routes', function () { return sheetToObjects(getSheet(SHEET_NAMES.ROUTES)); }); }
function getReviews() { return cached_('reviews', function () { return sheetToObjects(getSheet(SHEET_NAMES.REVIEWS)); }); }

/** Looks up a trip and throws a friendly error if it can't currently accept more passengers. */
function assertTripHasRoom_(tripId, extraPassengers, excludeBookingId) {
  if (!tripId) return;
  var trips = sheetToObjects(getSheet(SHEET_NAMES.TRIPS));
  var trip = trips.filter(function (t) { return t.tripId === tripId; })[0];
  if (!trip) throw new Error('That trip no longer exists — please pick another.');
  if (trip.status === 'Completed') throw new Error('That trip is already completed and can\'t take new bookings.');

  var bookings = sheetToObjects(getSheet(SHEET_NAMES.BOOKINGS));
  var alreadyBooked = bookings
    .filter(function (b) { return b.tripId === tripId && b.status !== 'Cancelled' && b.bookingId !== excludeBookingId; })
    .reduce(function (sum, b) { return sum + (Number(b.passengers) || 0); }, 0);

  if (alreadyBooked + Number(extraPassengers || 0) > Number(trip.totalSeats)) {
    throw new Error('This trip only has ' + Math.max(0, Number(trip.totalSeats) - alreadyBooked) + ' seat(s) left — reduce passengers or pick another trip.');
  }
}

function createBooking(payload) {
  var sheet = getSheet(SHEET_NAMES.BOOKINGS);
  if (payload.tripId) assertTripHasRoom_(payload.tripId, payload.passengers, null);

  var id = nextId(sheet, 'bookingId', 'BK');
  var booking = Object.assign({
    bookingId: id,
    tripId: payload.tripId || '',
    fare: payload.fare || 0, // fare is confirmed by the team on WhatsApp, not shown on the site
    amountPaid: payload.amountPaid || 0,
    status: 'Booked',
    createdAt: new Date().toISOString()
  }, payload);
  appendObject(sheet, booking);
  if (booking.tripId) recalcTripSeats(booking.tripId);
  return booking;
}

/* ---------------------------------------------------------------------
   Admin auth
--------------------------------------------------------------------- */

function login(payload) {
  var settings = getSettingsRaw();
  return { ok: String(payload.password) === String(settings.adminPassword) };
}

/* ---------------------------------------------------------------------
   Admin: Trips
--------------------------------------------------------------------- */

function getTrips() { return sheetToObjects(getSheet(SHEET_NAMES.TRIPS)); }

/** True if another trip already has the same pickup/drop/date/time/car/driver. */
function isDuplicateTrip_(payload, excludeTripId) {
  var trips = sheetToObjects(getSheet(SHEET_NAMES.TRIPS));
  var norm = function (s) { return String(s || '').trim().toLowerCase(); };
  return trips.some(function (t) {
    if (excludeTripId && t.tripId === excludeTripId) return false;
    return norm(t.pickup) === norm(payload.pickup) &&
      norm(t.drop) === norm(payload.drop) &&
      norm(t.date) === norm(payload.date) &&
      norm(t.time) === norm(payload.time) &&
      norm(t.carId) === norm(payload.carId) &&
      norm(t.driverName) === norm(payload.driverName);
  });
}

function assertVehicleAvailableAndFits_(carId, totalSeats) {
  var vehicles = sheetToObjects(getSheet(SHEET_NAMES.VEHICLES));
  var vehicle = vehicles.filter(function (v) { return v.carId === carId; })[0];
  if (!vehicle) throw new Error('Selected vehicle was not found.');
  if (vehicle.status !== 'Available') throw new Error('That vehicle is under maintenance and can\'t be assigned to a trip.');
  if (Number(totalSeats) > Number(vehicle.capacity)) {
    throw new Error('This vehicle only has ' + vehicle.capacity + ' seats — total seats can\'t be higher than the vehicle\'s capacity.');
  }
}

function createTrip(payload) {
  var sheet = getSheet(SHEET_NAMES.TRIPS);
  assertVehicleAvailableAndFits_(payload.carId, payload.totalSeats);
  if (isDuplicateTrip_(payload, null)) {
    throw new Error('An identical trip already exists (same pickup, drop, date, time, vehicle and driver).');
  }
  var tripId = nextId(sheet, 'tripId', 'TR');
  var trip = Object.assign({ tripId: tripId, bookedSeats: 0, status: 'Open' }, payload);
  appendObject(sheet, trip);
  return trip;
}

function updateTrip(payload) {
  if (payload.carId && payload.totalSeats) assertVehicleAvailableAndFits_(payload.carId, payload.totalSeats);
  if (isDuplicateTrip_(payload, payload.tripId)) {
    throw new Error('Another trip already has the same pickup, drop, date, time, vehicle and driver.');
  }
  return updateRow(getSheet(SHEET_NAMES.TRIPS), 'tripId', payload.tripId, payload);
}

function deleteTrip(payload) {
  deleteRow(getSheet(SHEET_NAMES.TRIPS), 'tripId', payload.tripId);
  return { deleted: true };
}

function completeTrip(payload) {
  var trip = updateRow(getSheet(SHEET_NAMES.TRIPS), 'tripId', payload.tripId, { status: 'Completed' });
  // mark linked bookings as Completed too
  var bookingsSheet = getSheet(SHEET_NAMES.BOOKINGS);
  var bookings = sheetToObjects(bookingsSheet);
  bookings.forEach(function (b) {
    if (b.tripId === payload.tripId && b.status === 'Booked') {
      updateRow(bookingsSheet, 'bookingId', b.bookingId, { status: 'Completed' });
    }
  });
  return trip;
}

/** Recomputes bookedSeats and Open/Full status for a trip from its bookings. */
function recalcTripSeats(tripId) {
  var tripsSheet = getSheet(SHEET_NAMES.TRIPS);
  var trips = sheetToObjects(tripsSheet);
  var trip = trips.filter(function (t) { return t.tripId === tripId; })[0];
  if (!trip || trip.status === 'Completed') return;

  var bookings = sheetToObjects(getSheet(SHEET_NAMES.BOOKINGS));
  var booked = bookings
    .filter(function (b) { return b.tripId === tripId && b.status !== 'Cancelled'; })
    .reduce(function (sum, b) { return sum + (Number(b.passengers) || 0); }, 0);

  var status = booked >= Number(trip.totalSeats) ? 'Full' : 'Open';
  updateRow(tripsSheet, 'tripId', tripId, { bookedSeats: booked, status: status });
}

/* ---------------------------------------------------------------------
   Admin: Bookings
--------------------------------------------------------------------- */

function getBookings() { return sheetToObjects(getSheet(SHEET_NAMES.BOOKINGS)); }

function updateBooking(payload) {
  if (payload.tripId && payload.passengers) {
    assertTripHasRoom_(payload.tripId, payload.passengers, payload.bookingId);
  }
  var updated = updateRow(getSheet(SHEET_NAMES.BOOKINGS), 'bookingId', payload.bookingId, payload);
  if (updated.tripId) recalcTripSeats(updated.tripId);
  return updated;
}

function cancelBooking(payload) {
  var updated = updateRow(getSheet(SHEET_NAMES.BOOKINGS), 'bookingId', payload.bookingId, { status: 'Cancelled' });
  if (updated.tripId) recalcTripSeats(updated.tripId);
  return updated;
}

function completeBooking(payload) {
  return updateRow(getSheet(SHEET_NAMES.BOOKINGS), 'bookingId', payload.bookingId, { status: 'Completed' });
}

/* ---------------------------------------------------------------------
   Admin: Fleet (vehicles) — no driver management here
--------------------------------------------------------------------- */

function createVehicle(payload) {
  var sheet = getSheet(SHEET_NAMES.VEHICLES);
  var vehicle = Object.assign({ img: 'images/vehicles/sedan.svg', features: '' }, payload);
  appendObject(sheet, vehicle);
  clearCache_('vehicles');
  return vehicle;
}

function updateVehicle(payload) {
  var sheet = getSheet(SHEET_NAMES.VEHICLES);
  var updates = Object.assign({}, payload);
  delete updates.originalCarId;
  var result = updateRow(sheet, 'carId', payload.originalCarId, updates);
  clearCache_('vehicles');
  return result;
}

function updateVehicleStatus(payload) {
  var result = updateRow(getSheet(SHEET_NAMES.VEHICLES), 'carId', payload.carId, { status: payload.status });
  clearCache_('vehicles');
  return result;
}

function deleteVehicle(payload) {
  deleteRow(getSheet(SHEET_NAMES.VEHICLES), 'carId', payload.carId);
  clearCache_('vehicles');
  return { deleted: true };
}

/* ---------------------------------------------------------------------
   Admin: Settings
--------------------------------------------------------------------- */

function getSettingsRaw() {
  var rows = sheetToObjects(getSheet(SHEET_NAMES.SETTINGS));
  return rows[0] || {};
}

function getSettings() { return cached_('settings', getSettingsRaw); }

function updateSettings(payload) {
  var sheet = getSheet(SHEET_NAMES.SETTINGS);
  var rows = sheetToObjects(sheet);
  var merged;
  if (!rows.length) {
    appendObject(sheet, payload);
    merged = payload;
  } else {
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    merged = Object.assign({}, rows[0], payload);
    var newRow = headers.map(function (h) { return merged[h]; });
    sheet.getRange(2, 1, 1, headers.length).setValues([newRow]);
  }
  clearCache_('settings');
  return merged;
}

/* ---------------------------------------------------------------------
   Admin: Reports
--------------------------------------------------------------------- */

function getReports() {
  var bookings = getBookings();
  var trips = getTrips();
  var totalRevenue = bookings.reduce(function (s, b) { return s + (Number(b.amountPaid) || 0); }, 0);
  var completed = bookings.filter(function (b) { return b.status === 'Completed'; }).length;
  var cancelled = bookings.filter(function (b) { return b.status === 'Cancelled'; }).length;
  return {
    totalRevenue: totalRevenue,
    totalTrips: trips.length,
    totalBookings: bookings.length,
    completed: completed,
    cancelled: cancelled,
    bookings: bookings,
    trips: trips
  };
}

/* ---------------------------------------------------------------------
   One-time setup — run this manually once from the Apps Script editor.
   Safe to re-run: it only creates tabs that don't already exist.
--------------------------------------------------------------------- */

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  createTabIfMissing_(ss, SHEET_NAMES.VEHICLES,
    ['carId', 'model', 'type', 'capacity', 'status', 'img', 'features'],
    buildVehicleSeedRows_());

  createTabIfMissing_(ss, SHEET_NAMES.ROUTES,
    ['from', 'to', 'distanceKm'],
    [
      ['Nashik', 'Pune', 210],
      ['Nashik', 'Mumbai', 170],
      ['Nashik', 'Chhatrapati Sambhaji Nagar', 235],
      ['Mumbai', 'Pune', 150]
    ]);

  createTabIfMissing_(ss, SHEET_NAMES.TRIPS,
    ['tripId', 'date', 'time', 'pickup', 'drop', 'vehicleType', 'carId', 'driverName', 'totalSeats', 'bookedSeats', 'status'],
    []);

  createTabIfMissing_(ss, SHEET_NAMES.BOOKINGS,
    ['bookingId', 'tripId', 'customerName', 'customerPhone', 'pickup', 'drop', 'date', 'time', 'passengers', 'vehicleType', 'tripType', 'fare', 'amountPaid', 'status', 'notes', 'createdAt'],
    []);

  createTabIfMissing_(ss, SHEET_NAMES.SETTINGS,
    ['businessName', 'phone', 'email', 'address', 'gst', 'defaultFare', 'logo', 'adminPassword'],
    [['CabsWay', '+91 91588 18546', 'rushikeshahire125@gmail.com', 'Nashik, Maharashtra', '', 250, 'images/logo.svg', 'cabsway123']]);

  createTabIfMissing_(ss, SHEET_NAMES.REVIEWS,
    ['name', 'route', 'rating', 'text'],
    [
      ['Ashish Patil', 'Nashik ⇄ Mumbai', 5, 'Clean car, on-time pickup, driver called 20 minutes before arriving.'],
      ['Sneha Kulkarni', 'Nashik ⇄ Pune', 5, 'Booked same-day, confirmation on WhatsApp within minutes.'],
      ['Rohit Deshmukh', 'Custom trip from Nashik', 4, 'Reliable pickup at 4 AM, smooth trip.'],
      ['Meera Joshi', 'Nashik ⇄ Chhatrapati Sambhaji Nagar', 5, 'Driver knew the route well, comfortable ride.']
    ]);

  // Reformat existing Trips/Bookings date & time columns as plain text, in
  // case they were created before this fix and already hold real Date values.
  fixDateColumns();

  SpreadsheetApp.flush();
  Logger.log('Setup complete. Tabs created: Vehicles, Routes, Trips, Bookings, Settings, Reviews.');
}

/** 8 models × 4 units each = 32 vehicles, no Tempo Traveller. */
function buildVehicleSeedRows_() {
  var models = [
    ['Swift', 'Hatchback', 4, 'images/vehicles/hatchback.svg', 'AC, Music System, Budget Friendly', 'SWI'],
    ['Aura', 'Sedan', 4, 'images/vehicles/sedan.svg', 'AC, Music System, 2 Bags', 'AUR'],
    ['Ciaz', 'Sedan', 4, 'images/vehicles/sedan.svg', 'AC, Premium Interior, 2 Bags', 'CIA'],
    ['Ertiga', 'MUV', 6, 'images/vehicles/suv.svg', 'AC, 3rd Row, 4 Bags', 'ERT'],
    ['XL6', 'MUV', 6, 'images/vehicles/suv.svg', 'AC, Captain Seats, 4 Bags', 'XL6'],
    ['Innova', 'SUV', 7, 'images/vehicles/suv.svg', 'AC, Spacious, 5 Bags', 'INV'],
    ['Innova Crysta', 'SUV', 7, 'images/vehicles/suv.svg', 'AC, Premium, Captain Seats', 'ICR'],
    ['Kia Carens', 'MUV', 6, 'images/vehicles/suv.svg', 'AC, Modern Interior, 4 Bags', 'KIA']
  ];
  var rows = [];
  models.forEach(function (m) {
    for (var i = 1; i <= 4; i++) {
      var carId = 'CW-' + m[5] + '-0' + i;
      rows.push([carId, m[0], m[1], m[2], 'Available', m[3], m[4]]);
    }
  });
  return rows;
}

/** One-time maintenance helper: reformats Trips/Bookings date & time columns as plain text. */
function fixDateColumns() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  [SHEET_NAMES.TRIPS, SHEET_NAMES.BOOKINGS].forEach(function (name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) return;
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var lastRow = Math.max(sheet.getLastRow(), 2);
    headers.forEach(function (h, i) {
      if (DATE_ONLY_FIELDS.indexOf(h) !== -1 || TIME_ONLY_FIELDS.indexOf(h) !== -1 || DATETIME_FIELDS.indexOf(h) !== -1) {
        sheet.getRange(2, i + 1, lastRow - 1, 1).setNumberFormat('@');
      }
    });
    // Re-save any already-corrupted Date values back as clean text strings.
    var data = sheetToObjects(sheet); // this already normalizes Date -> string in memory
    data.forEach(function (row, idx) {
      var rowNum = idx + 2;
      var values = headers.map(function (h) { return row[h]; });
      sheet.getRange(rowNum, 1, 1, headers.length).setValues([values]);
    });
  });
}

function createTabIfMissing_(ss, name, headers, seedRows) {
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;
  sheet = ss.insertSheet(name);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  if (seedRows.length) {
    // Write date/time columns as plain text from the start.
    headers.forEach(function (h, i) {
      if (DATE_ONLY_FIELDS.indexOf(h) !== -1 || TIME_ONLY_FIELDS.indexOf(h) !== -1 || DATETIME_FIELDS.indexOf(h) !== -1) {
        sheet.getRange(2, i + 1, seedRows.length, 1).setNumberFormat('@');
      }
    });
    sheet.getRange(2, 1, seedRows.length, headers.length).setValues(seedRows);
  }
  return sheet;
}
