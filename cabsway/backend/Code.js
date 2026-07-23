/**
 * =====================================================================
 * CabsWay V2 — Google Apps Script backend
 * =====================================================================
 * SETUP
 * 1. Create a new Google Sheet named "CabsWay DB".
 * 2. Open Extensions > Apps Script, delete any starter code, and paste
 *    this entire file in as Code.gs.
 * 3. Run setupSheets() once from the Apps Script editor (select the
 *    function in the dropdown and click Run). This creates all tabs
 *    with headers and seed data. Grant the permissions it asks for.
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
      headers.forEach(function (h, i) { obj[h] = row[i]; });
      return obj;
    });
}

/** Appends one object as a new row, in the sheet's existing header order. */
function appendObject(sheet, obj) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = headers.map(function (h) { return obj[h] !== undefined ? obj[h] : ''; });
  sheet.appendRow(row);
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
  headers.forEach(function (h, i) { merged[h] = currentRow[i]; });
  Object.keys(updates).forEach(function (k) { if (headers.indexOf(k) !== -1) merged[k] = updates[k]; });
  var newRow = headers.map(function (h) { return merged[h]; });
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

/* ---------------------------------------------------------------------
   Public site actions
--------------------------------------------------------------------- */

function getVehicles() {
  return sheetToObjects(getSheet(SHEET_NAMES.VEHICLES)).map(function (v) {
    v.features = String(v.features || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    return v;
  });
}

function getRoutes() { return sheetToObjects(getSheet(SHEET_NAMES.ROUTES)); }
function getReviews() { return sheetToObjects(getSheet(SHEET_NAMES.REVIEWS)); }

function createBooking(payload) {
  var sheet = getSheet(SHEET_NAMES.BOOKINGS);
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

function createTrip(payload) {
  var sheet = getSheet(SHEET_NAMES.TRIPS);
  var tripId = nextId(sheet, 'tripId', 'TR');
  var trip = Object.assign({ tripId: tripId, bookedSeats: 0, status: 'Open' }, payload);
  appendObject(sheet, trip);
  return trip;
}

function updateTrip(payload) {
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
  return vehicle;
}

function updateVehicle(payload) {
  var sheet = getSheet(SHEET_NAMES.VEHICLES);
  var updates = Object.assign({}, payload);
  delete updates.originalCarId;
  return updateRow(sheet, 'carId', payload.originalCarId, updates);
}

function updateVehicleStatus(payload) {
  return updateRow(getSheet(SHEET_NAMES.VEHICLES), 'carId', payload.carId, { status: payload.status });
}

function deleteVehicle(payload) {
  deleteRow(getSheet(SHEET_NAMES.VEHICLES), 'carId', payload.carId);
  return { deleted: true };
}

/* ---------------------------------------------------------------------
   Admin: Settings
--------------------------------------------------------------------- */

function getSettingsRaw() {
  var rows = sheetToObjects(getSheet(SHEET_NAMES.SETTINGS));
  return rows[0] || {};
}

function getSettings() {
  var s = getSettingsRaw();
  return s;
}

function updateSettings(payload) {
  var sheet = getSheet(SHEET_NAMES.SETTINGS);
  var rows = sheetToObjects(sheet);
  if (!rows.length) { appendObject(sheet, payload); return payload; }
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var merged = Object.assign({}, rows[0], payload);
  var newRow = headers.map(function (h) { return merged[h]; });
  sheet.getRange(2, 1, 1, headers.length).setValues([newRow]);
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
   One-time setup — run this manually once from the Apps Script editor
--------------------------------------------------------------------- */

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  createTabIfMissing_(ss, SHEET_NAMES.VEHICLES,
    ['carId', 'model', 'type', 'capacity', 'status', 'img', 'features'],
    [
      ['CW-101', 'Swift Dzire', 'Sedan', 4, 'Available', 'images/vehicles/sedan.svg', 'AC, Music System, 2 Bags'],
      ['CW-102', 'Ertiga', 'SUV', 6, 'Available', 'images/vehicles/suv.svg', 'AC, 3rd Row, 4 Bags'],
      ['CW-103', 'WagonR', 'Hatchback', 4, 'Available', 'images/vehicles/hatchback.svg', 'AC, Budget Friendly'],
      ['CW-104', 'Tempo Traveller', 'Tempo Traveller', 12, 'Maintenance', 'images/vehicles/tempo.svg', 'AC, Pushback Seats, Group Travel'],
      ['CW-105', 'Innova Crysta', 'SUV', 7, 'Available', 'images/vehicles/suv.svg', 'AC, Premium, Captain Seats']
    ]);

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
    [['CabsWay', '+91 12345 67890', 'hello@cabsway.in', 'Shop 4, Highway Complex, Nashik, Maharashtra 422001', '', 250, 'images/logo.svg', 'cabsway123']]);

  createTabIfMissing_(ss, SHEET_NAMES.REVIEWS,
    ['name', 'route', 'rating', 'text'],
    [
      ['Ashish Patil', 'Mumbai → Shirdi', 5, 'Clean car, on-time pickup, driver called 20 minutes before arriving.'],
      ['Sneha Kulkarni', 'Pune → Nashik', 5, 'Booked same-day for a wedding, confirmation on WhatsApp within minutes.'],
      ['Rohit Deshmukh', 'Mumbai Airport Transfer', 4, 'Reliable airport pickup at 4 AM.'],
      ['Meera Joshi', 'Nashik → Trimbakeshwar', 5, 'Driver knew the temple timings and traffic patterns well.']
    ]);

  SpreadsheetApp.flush();
  Logger.log('Setup complete. Tabs created: Vehicles, Routes, Trips, Bookings, Settings, Reviews.');
}

function createTabIfMissing_(ss, name, headers, seedRows) {
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;
  sheet = ss.insertSheet(name);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  if (seedRows.length) {
    sheet.getRange(2, 1, seedRows.length, headers.length).setValues(seedRows);
  }
  return sheet;
}
