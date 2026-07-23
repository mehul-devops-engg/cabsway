/* CabsWay V2 — admin/trips.html logic */

var cwAllTrips = [];
var cwAllVehiclesForTrips = [];

document.addEventListener('DOMContentLoaded', async function () {
  cwAllVehiclesForTrips = await cwApiCall('getVehicles');
  document.getElementById('t-carId').innerHTML = cwAllVehiclesForTrips.map(function (v) {
    return '<option value="' + v.carId + '" data-capacity="' + v.capacity + '" data-type="' + v.type + '">' + v.carId + ' — ' + v.model + ' (' + v.capacity + ' seats)</option>';
  }).join('');
  document.getElementById('t-carId').addEventListener('change', function () {
    var opt = this.selectedOptions[0];
    if (opt) document.getElementById('t-totalSeats').value = opt.dataset.capacity;
  });
  document.getElementById('t-carId').dispatchEvent(new Event('change'));

  await loadTrips();
  document.getElementById('trip-search').addEventListener('input', renderTrips);
  document.getElementById('trip-filter-status').addEventListener('change', renderTrips);
  document.getElementById('trip-filter-date').addEventListener('change', renderTrips);
  document.getElementById('trip-form').addEventListener('submit', onSaveTrip);
});

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
  if (tripId) {
    var t = cwAllTrips.find(function (x) { return x.tripId === tripId; });
    if (t) {
      document.getElementById('trip-modal-title').textContent = 'Edit Trip ' + t.tripId;
      document.getElementById('t-tripId').value = t.tripId;
      document.getElementById('t-pickup').value = t.pickup;
      document.getElementById('t-drop').value = t.drop;
      document.getElementById('t-date').value = t.date;
      document.getElementById('t-time').value = t.time;
      document.getElementById('t-carId').value = t.carId;
      document.getElementById('t-totalSeats').value = t.totalSeats;
      document.getElementById('t-driverName').value = t.driverName;
    }
  }
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
