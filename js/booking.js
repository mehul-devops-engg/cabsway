/* CabsWay V2 — booking.html logic (fixed route / custom destination / share a cab) */

var cwVehicles = [];
var cwRoutePairs = [];   // [{from, to}] — canonical pairs from the backend
var cwFixedRoutes = [];  // both directions, built from cwRoutePairs, for the dropdown
var cwSelectedVehicle = null;
var cwPendingBookingData = null; // set right before WhatsApp opens; only saved once the customer confirms they sent it
var CW_ORIGINAL_TITLE = document.title;
var CW_PENDING_TITLE = "⏳ Confirm your booking — CabsWay";

// Share a Cab — fixed to one vehicle model, one route, one published rate.
var CW_SHARE_MODEL = 'Ertiga';
var CW_SHARE_RATE_PER_SEAT = 600;
var CW_SHARE_ROUTE = { from: 'Nashik', to: 'Pune' };

document.addEventListener('DOMContentLoaded', async function () {
  prefillFromQuery();
  document.getElementById('b-date').min = new Date().toISOString().split('T')[0];

  try {
    cwVehicles = await cwApiCall('getVehicles');
    cwRoutePairs = await cwApiCall('getRoutes');
  } catch (e) { /* toast already shown */ }

  buildFixedRouteOptions();
  document.getElementById('b-share-direction').addEventListener('change', applyShareRouteSelection);
  setupModeToggle(); // also does the first vehicle-picker render, based on the initial mode
  updateTripTicket();

  ['b-pickup', 'b-drop', 'b-date', 'b-time', 'b-passengers', 'b-trip-type'].forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener('input', updateTripTicket);
    el.addEventListener('change', updateTripTicket);
  });

  document.getElementById('booking-form').addEventListener('submit', onSubmitBooking);
  var sentBtn = document.getElementById('confirm-sent-btn');
  var cancelBtn = document.getElementById('confirm-cancel-btn');
  if (sentBtn && cancelBtn) {
    sentBtn.addEventListener('click', onConfirmSent);
    cancelBtn.addEventListener('click', onConfirmCancel);
  } else {
    console.error('CabsWay: confirm-sent-btn/confirm-cancel-btn not found — booking.html may be out of date.');
  }

  // If a booking is still awaiting confirmation when the customer comes back to this tab
  // (after switching to WhatsApp to send the message), nudge them so they don't miss it.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && cwPendingBookingData) {
      cwToast("Welcome back! Tap \"Yes, I've Sent It\" below to finish your booking.");
    }
  });

  // Warn if they try to close/navigate away with a booking still unconfirmed, so it
  // doesn't silently vanish just because they forgot to come back and confirm it.
  window.addEventListener('beforeunload', function (e) {
    if (cwPendingBookingData) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
});

function prefillFromQuery() {
  var q = new URLSearchParams(location.search);
  ['pickup', 'drop', 'date', 'time'].forEach(function (key) {
    var val = q.get(key);
    var el = document.getElementById('b-' + key);
    if (val && el) el.value = val;
  });
  var pax = q.get('passengers');
  if (pax) {
    var sel = document.getElementById('b-passengers');
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === pax) sel.selectedIndex = i;
    }
  }
  // Deep-links from the homepage quick search / routes.html carry an explicit mode
  var mode = q.get('mode');
  if (mode === 'fixed' || mode === 'custom' || mode === 'share') {
    var modeSelect = document.getElementById('b-mode');
    if (modeSelect) modeSelect.value = mode;
  }
}

/** Builds the bidirectional fixed-route list (Nashik→Pune, Pune→Nashik, …) from the route pairs. */
function buildFixedRouteOptions() {
  cwFixedRoutes = [];
  cwRoutePairs.forEach(function (r) {
    cwFixedRoutes.push({ from: r.from, to: r.to });
    cwFixedRoutes.push({ from: r.to, to: r.from });
  });
  var select = document.getElementById('b-fixed-route');
  select.innerHTML = cwFixedRoutes.map(function (r, i) {
    return '<option value="' + i + '">' + r.from + ' → ' + r.to + '</option>';
  }).join('');

  // If the page was opened with a pickup/drop that matches a known fixed route, preselect it.
  var pickup = document.getElementById('b-pickup').value.trim().toLowerCase();
  var drop = document.getElementById('b-drop').value.trim().toLowerCase();
  if (pickup && drop) {
    var idx = cwFixedRoutes.findIndex(function (r) { return r.from.toLowerCase() === pickup && r.to.toLowerCase() === drop; });
    if (idx !== -1) select.value = idx;
  }

  select.addEventListener('change', applyFixedRouteSelection);
}

function applyFixedRouteSelection() {
  var idx = Number(document.getElementById('b-fixed-route').value);
  var r = cwFixedRoutes[idx];
  if (!r) return;
  document.getElementById('b-pickup').value = r.from;
  document.getElementById('b-drop').value = r.to;
  updateTripTicket();
}

/** Share a Cab only ever runs Nashik ⇄ Pune — direction just flips which end is pickup vs. drop. */
function applyShareRouteSelection() {
  var isReversed = document.getElementById('b-share-direction').value === '1';
  document.getElementById('b-pickup').value = isReversed ? CW_SHARE_ROUTE.to : CW_SHARE_ROUTE.from;
  document.getElementById('b-drop').value = isReversed ? CW_SHARE_ROUTE.from : CW_SHARE_ROUTE.to;
  updateTripTicket();
}

function setupModeToggle() {
  var modeSelect = document.getElementById('b-mode');
  var fixedFields = document.getElementById('fixed-route-fields');
  var customFields = document.getElementById('custom-route-fields');
  var shareFields = document.getElementById('share-route-fields');
  var tripTypeField = document.getElementById('b-trip-type-field');
  var passengersLabel = document.getElementById('b-passengers-label');

  function applyMode() {
    var mode = modeSelect.value;
    fixedFields.style.display = mode === 'fixed' ? 'block' : 'none';
    customFields.style.display = mode === 'custom' ? 'block' : 'none';
    shareFields.style.display = mode === 'share' ? 'block' : 'none';
    document.getElementById('b-drop').readOnly = (mode === 'fixed');
    tripTypeField.style.display = mode === 'share' ? 'none' : 'block';
    passengersLabel.textContent = mode === 'share' ? 'Seats to Share (₹600 each)' : 'Passenger Count';

    if (mode === 'fixed') applyFixedRouteSelection();
    if (mode === 'share') { applyShareRouteSelection(); renderShareVehiclePicker(); }
    else { renderVehiclePicker(); }

    updateTripTicket();
  }
  modeSelect.addEventListener('change', applyMode);
  applyMode();
}

function renderVehiclePicker() {
  var wrap = document.getElementById('vehicle-pick');
  wrap.innerHTML = '';
  // Show one card per unique model — customers pick "Innova Crysta", not a specific
  // individual car. The exact vehicle is assigned by the operator when the trip is created.
  var seenModels = {};
  var models = [];
  cwVehicles.forEach(function (v) {
    if (v.status !== 'Available') return;
    if (seenModels[v.model]) return;
    seenModels[v.model] = true;
    models.push(v);
  });

  models.forEach(function (v, idx) {
    var el = document.createElement('label');
    el.className = 'vehicle-option' + (idx === 0 ? ' selected' : '');
    el.innerHTML =
      '<input type="radio" name="vehicle" value="' + v.model + '" ' + (idx === 0 ? 'checked' : '') + '>' +
      '<img src="' + v.img + '" alt="' + v.model + '" loading="lazy" decoding="async">' +
      '<strong>' + v.model + '</strong>' +
      '<small>' + v.type + ' · up to ' + v.capacity + ' seats</small>';
    el.addEventListener('click', function () {
      wrap.querySelectorAll('.vehicle-option').forEach(function (o) { o.classList.remove('selected'); });
      el.classList.add('selected');
      cwSelectedVehicle = v;
      applyPassengerCapacityLimit();
      updateTripTicket();
    });
    if (idx === 0) cwSelectedVehicle = v;
    wrap.appendChild(el);
  });
}

/** Share a Cab only offers one vehicle — shown as a single, pre-selected card with its per-seat rate. */
function renderShareVehiclePicker() {
  var wrap = document.getElementById('vehicle-pick');
  wrap.innerHTML = '';
  var ertiga = cwVehicles.find(function (v) { return v.model === CW_SHARE_MODEL && v.status === 'Available'; });
  if (!ertiga) {
    wrap.innerHTML = '<p class="text-sm muted">Shared Ertiga seats aren\'t available right now — please check back soon or choose a Fixed Route.</p>';
    cwSelectedVehicle = null;
    return;
  }
  cwSelectedVehicle = ertiga;
  var el = document.createElement('label');
  el.className = 'vehicle-option selected';
  el.innerHTML =
    '<input type="radio" name="vehicle" value="' + ertiga.model + '" checked>' +
    '<img src="' + ertiga.img + '" alt="' + ertiga.model + '" loading="lazy" decoding="async">' +
    '<strong>' + ertiga.model + ' (Shared)</strong>' +
    '<small>₹' + CW_SHARE_RATE_PER_SEAT + '/seat · up to ' + ertiga.capacity + ' seats</small>';
  wrap.appendChild(el);
  applyPassengerCapacityLimit();
}

/** Disables passenger-count options above the selected vehicle's real capacity,
 *  and clamps the current selection down if it no longer fits. */
function applyPassengerCapacityLimit() {
  if (!cwSelectedVehicle) return;
  var capacity = Number(cwSelectedVehicle.capacity) || 0;
  var select = document.getElementById('b-passengers');
  var options = Array.prototype.slice.call(select.options);
  var validValues = [];

  options.forEach(function (opt) {
    var numeric = parseInt(opt.value, 10);
    var fits = numeric <= capacity;
    opt.disabled = !fits;
    if (fits) validValues.push(opt.value);
  });

  var currentNumeric = parseInt(select.value, 10);
  var currentFits = currentNumeric <= capacity;
  if (!currentFits && validValues.length) {
    select.value = validValues[validValues.length - 1]; // snap down to the highest that still fits
    cwToast('Passenger count adjusted to fit the ' + cwSelectedVehicle.model + '\'s ' + capacity + '-seat capacity.');
  }
}

/** Live trip summary — fare is shown only for Share a Cab; other modes are confirmed on WhatsApp. */
function updateTripTicket() {
  var mode = document.getElementById('b-mode').value;
  var pickup = document.getElementById('b-pickup').value || '—';
  var drop = document.getElementById('b-drop').value || '—';
  var date = document.getElementById('b-date').value;
  var time = document.getElementById('b-time').value;
  var passengers = document.getElementById('b-passengers').value;
  var tripType = document.getElementById('b-trip-type').value;

  document.getElementById('ticket-route').textContent = pickup + ' → ' + drop;
  document.getElementById('ticket-datetime').textContent = (date || '—') + (time ? ' · ' + time : '');
  document.getElementById('ticket-passengers').textContent = mode === 'share'
    ? (passengers + ' seat(s) shared')
    : (passengers + ' passenger(s) · ' + tripType);
  document.getElementById('ticket-vehicle').textContent = cwSelectedVehicle ? (cwSelectedVehicle.model + ' (' + cwSelectedVehicle.type + ')') : '—';

  var fareRow = document.getElementById('ticket-fare-row');
  var noteEl = document.getElementById('ticket-note');
  if (mode === 'share') {
    var seats = Number(passengers) || 0;
    fareRow.style.display = 'flex';
    document.getElementById('ticket-fare').textContent = '₹' + (seats * CW_SHARE_RATE_PER_SEAT).toLocaleString('en-IN') + ' (' + seats + ' × ₹' + CW_SHARE_RATE_PER_SEAT + ')';
    noteEl.textContent = 'Shared Ertiga seats are ₹600 each, Nashik ⇄ Pune only. Tap "Book Now" to confirm on WhatsApp.';
  } else {
    fareRow.style.display = 'none';
    noteEl.textContent = 'Fares aren\'t published on the site — every trip is quoted directly by our team. Tap "Book Now" and we\'ll confirm your fare, driver and car on WhatsApp within minutes.';
  }
}

/** Shows the WhatsApp confirmation modal. Falls back to a native confirm() dialog
 *  if the modal element is missing for any reason (e.g. an out-of-date HTML file),
 *  so a customer's booking can never silently fail to save. */
function cwShowConfirmModal() {
  var modal = document.getElementById('whatsapp-confirm-modal');
  if (modal) {
    modal.classList.add('open');
    document.title = CW_PENDING_TITLE;
  } else {
    console.error('CabsWay: #whatsapp-confirm-modal not found on this page — falling back to a plain confirm() dialog. This usually means booking.html is out of date; re-upload it.');
    if (window.confirm("Did you send the WhatsApp message?\n\nClick OK to save your booking.")) {
      onConfirmSent();
    } else {
      cwPendingBookingData = null;
    }
  }
}

function cwHideConfirmModal() {
  var modal = document.getElementById('whatsapp-confirm-modal');
  if (modal) modal.classList.remove('open');
  document.title = CW_ORIGINAL_TITLE;
}

async function onSubmitBooking(e) {
  e.preventDefault();
  if (!cwSelectedVehicle) { cwToast('Please select a vehicle.'); return; }
  var pickupVal = document.getElementById('b-pickup').value.trim();
  var dropVal = document.getElementById('b-drop').value.trim();
  if (!pickupVal || !dropVal) { cwToast('Please fill in both pickup and drop locations.'); return; }

  var passengers = Number(document.getElementById('b-passengers').value);
  if (passengers > Number(cwSelectedVehicle.capacity)) {
    cwToast('The ' + cwSelectedVehicle.model + ' seats up to ' + cwSelectedVehicle.capacity + '. Please reduce passengers or choose a larger vehicle.');
    return;
  }

  var mode = document.getElementById('b-mode').value;
  var routeTypeLabel = mode === 'fixed' ? 'Fixed Route' : (mode === 'share' ? 'Share a Cab' : 'Custom Destination');
  var isShare = mode === 'share';
  var shareFare = isShare ? passengers * CW_SHARE_RATE_PER_SEAT : 0;

  var data = {
    pickup: document.getElementById('b-pickup').value,
    drop: document.getElementById('b-drop').value,
    date: document.getElementById('b-date').value,
    time: document.getElementById('b-time').value,
    passengers: document.getElementById('b-passengers').value,
    tripType: isShare ? 'Shared' : document.getElementById('b-trip-type').value,
    routeType: routeTypeLabel,
    vehicleType: cwSelectedVehicle.model,
    fare: isShare ? shareFare : 0,
    customerName: document.getElementById('b-name').value,
    customerPhone: document.getElementById('b-phone').value,
    notes: document.getElementById('b-notes').value
  };

  // Nothing is saved yet — we only open WhatsApp with the details prefilled.
  // The booking is recorded only once the customer confirms below that they actually sent it,
  // so abandoned/unsent requests never clutter the admin panel.
  cwPendingBookingData = data;

  var summary =
    'New CabsWay Booking Request\n' +
    'Name: ' + data.customerName + '\n' +
    'Phone: ' + data.customerPhone + '\n' +
    'Route Type: ' + data.routeType + '\n' +
    'Pickup: ' + data.pickup + '\n' +
    'Drop: ' + data.drop + '\n' +
    'Date/Time: ' + data.date + ' ' + data.time + '\n' +
    (isShare ? ('Seats to Share: ' + data.passengers + '\n' + 'Rate: ₹' + CW_SHARE_RATE_PER_SEAT + '/seat\n' + 'Total Fare: ₹' + shareFare.toLocaleString('en-IN') + '\n')
             : ('Passengers: ' + data.passengers + '\n' + 'Trip Type: ' + data.tripType + '\n')) +
    'Vehicle: ' + data.vehicleType + (isShare ? ' (Shared)' : '') + '\n' +
    (data.notes ? ('Notes: ' + data.notes + '\n') : '') +
    (isShare ? 'Please confirm my shared seat(s) for this ride.' : 'Please confirm the fare, driver and car for this trip.');

  window.open(cwBuildWhatsAppLink(summary), '_blank');
  cwShowConfirmModal();
}

async function onConfirmSent() {
  if (!cwPendingBookingData) return;
  var btn = document.getElementById('confirm-sent-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
  try {
    var booking = await cwApiCall('createBooking', cwPendingBookingData);
    cwToast('Booking ' + booking.bookingId + ' saved — our team will confirm shortly.');
    cwHideConfirmModal();
    cwPendingBookingData = null;
    document.getElementById('booking-form').reset();
    setupModeToggle();
    updateTripTicket();
  } catch (err) {
    /* cwApiCall already showed the reason */
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "Yes, I've Sent It — Save My Booking"; }
  }
}

function onConfirmCancel() {
  cwHideConfirmModal();
  cwPendingBookingData = null;
}
