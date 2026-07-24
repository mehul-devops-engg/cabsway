/* CabsWay V2 — admin/trips.html logic */

var cwAllTrips = [];
var cwAllVehiclesForTrips = [];

document.addEventListener('DOMContentLoaded', async function () {
  var results = await Promise.all([cwApiCall('getVehicles'), cwApiCall('getTrips')]);
  cwAllVehiclesForTrips = results[0];
  cwAllTrips = results[1];

  populateVehicleDropdown();
  document.getElementById('t-carId').addEventListener('change', applySelectedVehicleCapacity);
  applySelectedVehicleCapacity();

  renderTrips();
  document.getElementById('trip-search').addEventListener('input', renderTrips);
  document.getElementById('trip-filter-status').addEventListener('change', renderTrips);
  document.getElementById('trip-filter-date').addEventListener('change', renderTrips);
  document.getElementById('trip-form').addEventListener('submit', onSaveTrip);
});

/** Only Available vehicles can be picked for a new/edited trip — Maintenance ones are excluded,
 *  unless a trip already has one assigned (kept visible, greyed out, so editing doesn't break it). */
function populateVehicleDropdown(keepCarId) {
  var select = document.getElementById('t-carId');
  var available = cwAllVehiclesForTrips.filter(function (v) { return v.status === 'Available'; });
  var extra = keepCarId ? cwAllVehiclesForTrips.filter(function (v) { return v.carId === keepCarId && v.status !== 'Available'; }) : [];
  var options = available.concat(extra);
  select.innerHTML = options.map(function (v) {
    var label = v.carId + ' — ' + v.model + ' (' + v.capacity + ' seats)' + (v.status !== 'Available' ? ' — under maintenance' : '');
    return '<option value="' + v.carId + '" data-capacity="' + v.capacity + '" data-type="' + v.type + '">' + label + '</option>';
  }).join('');
  if (keepCarId) select.value = keepCarId;
}

/** Seats can't be typed by hand — they always match the selected vehicle's real capacity. */
function applySelectedVehicleCapacity() {
  var opt = document.getElementById('t-carId').selectedOptions[0];
  var seatsInput = document.getElementById('t-totalSeats');
  seatsInput.value = opt ? opt.dataset.capacity : '';
  seatsInput.readOnly = true;
}

async function loadTrips() {
  cwAllTrips = await cwApiCall('getTrips');
  renderTrips();
}

function renderTrips() {
  var q = document.getElementById('trip-search').value.toLowerCase();
  var statusFilter = document.getElementById('trip-filter-status').value;
  var dateFilter = document.getElementById('trip-filter-date').value;
  var today = new Date().toISOString().split('T')[0];

  var rows = cwAllTrips.filter(function (t) {
    var matchesQ = !q || (t.tripId + t.pickup + t.drop + t.driverName).toLowerCase().indexOf(q) !== -1;
    var matchesStatus = !statusFilter || t.status === statusFilter;
    var matchesDate = !dateFilter || (dateFilter === 'today' ? t.date === today : t.date >= today);
    return matchesQ && matchesStatus && matchesDate;
  });

  document.getElementById('trip-count').textContent = rows.length + ' trip(s)';
  document.getElementById('trips-body').innerHTML = rows.length ? rows.map(function (t) {
    return '<tr><td>' + t.tripId + '</td>' +
      '<td>' + t.pickup + ' → ' + t.drop + '</td>' +
      '<td>' + t.date + ' · ' + t.time + '</td>' +
      '<td>' + t.carId + ' (' + t.vehicleType + ')</td>' +
      '<td>' + t.driverName + '</td>' +
      '<td>' + t.bookedSeats + '/' + t.totalSeats + '</td>' +
      '<td>' + cwStatusPill(t.status) + '</td>' +
      '<td class="action-row">' +
        '<button class="btn btn-ghost btn-sm" onclick="cwOpenTripModal(\'' + t.tripId + '\')">Edit</button>' +
        (t.status !== 'Completed' ? '<button class="btn btn-dark btn-sm" onclick="cwCompleteTrip(\'' + t.tripId + '\')">Complete</button>' : '') +
        '<button class="btn btn-danger btn-sm" onclick="cwDeleteTrip(\'' + t.tripId + '\')">Delete</button>' +
      '</td></tr>';
  }).join('') : '<tr><td colspan="8" class="empty-state">No trips match these filters.</td></tr>';
}

function cwOpenTripModal(tripId) {
  var form = document.getElementById('trip-form');
  form.reset();
  document.getElementById('t-tripId').value = '';
  document.getElementById('trip-modal-title').textContent = 'New Trip';
  populateVehicleDropdown(); // reset to Available-only by default

  if (tripId) {
    var t = cwAllTrips.find(function (x) { return x.tripId === tripId; });
    if (t) {
      document.getElementById('trip-modal-title').textContent = 'Edit Trip ' + t.tripId;
      document.getElementById('t-tripId').value = t.tripId;
      document.getElementById('t-pickup').value = t.pickup;
      document.getElementById('t-drop').value = t.drop;
      document.getElementById('t-date').value = t.date;
      document.getElementById('t-time').value = t.time;
      document.getElementById('t-driverName').value = t.driverName;
      populateVehicleDropdown(t.carId); // include its own vehicle even if now under maintenance
    }
  }
  applySelectedVehicleCapacity();
  cwOpenModal('trip-modal');
}

async function onSaveTrip(e) {
  e.preventDefault();
  var carOpt = document.getElementById('t-carId').selectedOptions[0];
  var payload = {
    pickup: document.getElementById('t-pickup').value,
    drop: document.getElementById('t-drop').value,
    date: document.getElementById('t-date').value,
    time: document.getElementById('t-time').value,
    carId: document.getElementById('t-carId').value,
    vehicleType: carOpt ? carOpt.dataset.type : '',
    totalSeats: Number(document.getElementById('t-totalSeats').value),
    driverName: document.getElementById('t-driverName').value
  };
  var existingId = document.getElementById('t-tripId').value;
  try {
    if (existingId) {
      payload.tripId = existingId;
      await cwApiCall('updateTrip', payload);
      cwToast('Trip ' + existingId + ' updated.');
    } else {
      var created = await cwApiCall('createTrip', payload);
      cwToast('Trip ' + created.tripId + ' created.');
    }
    cwCloseModal('trip-modal');
    await loadTrips();
  } catch (err) {
    /* cwApiCall already showed the reason (e.g. duplicate trip, vehicle in maintenance) — keep the modal open so it can be fixed */
  }
}

async function cwCompleteTrip(tripId) {
  await cwApiCall('completeTrip', { tripId: tripId });
  cwToast('Trip ' + tripId + ' marked completed.');
  await loadTrips();
}

async function cwDeleteTrip(tripId) {
  if (!confirm('Delete trip ' + tripId + '? This cannot be undone.')) return;
  await cwApiCall('deleteTrip', { tripId: tripId });
  cwToast('Trip ' + tripId + ' deleted.');
  await loadTrips();
}
