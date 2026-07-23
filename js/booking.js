/* CabsWay V2 — booking.html logic (fixed route / custom destination, no on-site fare) */

var cwVehicles = [];
var cwRoutePairs = [];   // [{from, to}] — canonical pairs from the backend
var cwFixedRoutes = [];  // both directions, built from cwRoutePairs, for the dropdown
var cwSelectedVehicle = null;

document.addEventListener('DOMContentLoaded', async function () {
  prefillFromQuery();
  document.getElementById('b-date').min = new Date().toISOString().split('T')[0];

  try {
    cwVehicles = await cwApiCall('getVehicles');
    cwRoutePairs = await cwApiCall('getRoutes');
  } catch (e) { /* toast already shown */ }

  buildFixedRouteOptions();
  renderVehiclePicker();
  setupModeToggle();
  updateTripTicket();

  ['b-pickup', 'b-drop', 'b-date', 'b-time', 'b-passengers', 'b-trip-type'].forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener('input', updateTripTicket);
    el.addEventListener('change', updateTripTicket);
  });

  document.getElementById('booking-form').addEventListener('submit', onSubmitBooking);
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
  if (mode === 'fixed' || mode === 'custom') {
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

function setupModeToggle() {
  var modeSelect = document.getElementById('b-mode');
  var fixedFields = document.getElementById('fixed-route-fields');
  var customFields = document.getElementById('custom-route-fields');

  function applyMode() {
    var isFixed = modeSelect.value === 'fixed';
    fixedFields.style.display = isFixed ? 'block' : 'none';
    customFields.style.display = isFixed ? 'none' : 'block';
    document.getElementById('b-pickup').readOnly = isFixed;
    document.getElementById('b-drop').readOnly = isFixed;
    if (isFixed) applyFixedRouteSelection();
    updateTripTicket();
  }
  modeSelect.addEventListener('change', applyMode);
  applyMode();
}

function renderVehiclePicker() {
  var wrap = document.getElementById('vehicle-pick');
  wrap.innerHTML = '';
  var available = cwVehicles.filter(function (v) { return v.status === 'Available'; });
  available.forEach(function (v, idx) {
    var el = document.createElement('label');
    el.className = 'vehicle-option' + (idx === 0 ? ' selected' : '');
    el.innerHTML =
      '<input type="radio" name="vehicle" value="' + v.type + '" ' + (idx === 0 ? 'checked' : '') + '>' +
      '<img src="' + v.img + '" alt="' + v.model + '">' +
      '<strong>' + v.type + '</strong>' +
      '<small>' + v.model + ' · up to ' + v.capacity + ' seats</small>';
    el.addEventListener('click', function () {
      wrap.querySelectorAll('.vehicle-option').forEach(function (o) { o.classList.remove('selected'); });
      el.classList.add('selected');
      cwSelectedVehicle = v;
      updateTripTicket();
    });
    if (idx === 0) cwSelectedVehicle = v;
    wrap.appendChild(el);
  });
}

/** Live, fare-free trip summary — a preview of what gets sent on WhatsApp. */
function updateTripTicket() {
  var pickup = document.getElementById('b-pickup').value || '—';
  var drop = document.getElementById('b-drop').value || '—';
  var date = document.getElementById('b-date').value;
  var time = document.getElementById('b-time').value;
  var passengers = document.getElementById('b-passengers').value;
  var tripType = document.getElementById('b-trip-type').value;

  document.getElementById('ticket-route').textContent = pickup + ' → ' + drop;
  document.getElementById('ticket-datetime').textContent = (date || '—') + (time ? ' · ' + time : '');
  document.getElementById('ticket-passengers').textContent = passengers + ' passenger(s) · ' + tripType;
  document.getElementById('ticket-vehicle').textContent = cwSelectedVehicle ? (cwSelectedVehicle.type + ' — ' + cwSelectedVehicle.model) : '—';
}

async function onSubmitBooking(e) {
  e.preventDefault();
  if (!cwSelectedVehicle) { cwToast('Please select a vehicle.'); return; }
  var pickupVal = document.getElementById('b-pickup').value.trim();
  var dropVal = document.getElementById('b-drop').value.trim();
  if (!pickupVal || !dropVal) { cwToast('Please fill in both pickup and drop locations.'); return; }

  var mode = document.getElementById('b-mode').value;
  var data = {
    pickup: document.getElementById('b-pickup').value,
    drop: document.getElementById('b-drop').value,
    date: document.getElementById('b-date').value,
    time: document.getElementById('b-time').value,
    passengers: document.getElementById('b-passengers').value,
    tripType: document.getElementById('b-trip-type').value,
    routeType: mode === 'fixed' ? 'Fixed Route' : 'Custom Destination',
    vehicleType: cwSelectedVehicle.type,
    customerName: document.getElementById('b-name').value,
    customerPhone: document.getElementById('b-phone').value,
    notes: document.getElementById('b-notes').value
  };

  var submitBtn = e.target.querySelector('button[type=submit]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Booking…';

  try {
    var booking = await cwApiCall('createBooking', data);
    cwToast('Booking ' + booking.bookingId + ' created — opening WhatsApp…');

    var summary =
      'New CabsWay Booking Request\n' +
      'Booking ID: ' + booking.bookingId + '\n' +
      'Name: ' + data.customerName + '\n' +
      'Phone: ' + data.customerPhone + '\n' +
      'Route Type: ' + data.routeType + '\n' +
      'Pickup: ' + data.pickup + '\n' +
      'Drop: ' + data.drop + '\n' +
      'Date/Time: ' + data.date + ' ' + data.time + '\n' +
      'Passengers: ' + data.passengers + '\n' +
      'Trip Type: ' + data.tripType + '\n' +
      'Vehicle: ' + data.vehicleType + '\n' +
      (data.notes ? ('Notes: ' + data.notes + '\n') : '') +
      'Please confirm the fare, driver and car for this trip.';

    window.open(cwBuildWhatsAppLink(summary), '_blank');
  } catch (err) {
    /* toast already shown by cwApiCall */
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Book Now — Confirm on WhatsApp';
  }
}
