/* CabsWay V2 — admin/fleet.html logic */

var cwAllVehicles = [];

document.addEventListener('DOMContentLoaded', async function () {
  await loadFleet();
  document.getElementById('fl-search').addEventListener('input', renderFleet);
  document.getElementById('fl-filter-status').addEventListener('change', renderFleet);
  document.getElementById('vehicle-form').addEventListener('submit', onSaveVehicle);
});

async function loadFleet() {
  cwAllVehicles = await cwApiCall('getVehicles');
  renderFleet();
}

function renderFleet() {
  var q = document.getElementById('fl-search').value.toLowerCase();
  var statusFilter = document.getElementById('fl-filter-status').value;

  var rows = cwAllVehicles.filter(function (v) {
    var matchesQ = !q || (v.carId + v.model).toLowerCase().indexOf(q) !== -1;
    var matchesStatus = !statusFilter || v.status === statusFilter;
    return matchesQ && matchesStatus;
  });

  document.getElementById('fl-count').textContent = rows.length + ' vehicle(s)';
  document.getElementById('fleet-body').innerHTML = rows.length ? rows.map(function (v) {
    var pillClass = v.status === 'Available' ? 'pill-open' : 'pill-partial';
    return '<tr>' +
      '<td><img src="../' + v.img + '" alt="" style="width:52px;"></td>' +
      '<td>' + v.carId + '</td><td>' + v.model + '</td><td>' + v.type + '</td><td>' + v.capacity + '</td>' +
      '<td><span class="pill ' + pillClass + '">' + v.status + '</span></td>' +
      '<td class="action-row">' +
        '<button class="btn btn-ghost btn-sm" onclick="cwOpenVehicleModal(\'' + v.carId + '\')">Edit</button>' +
        '<button class="btn btn-sm ' + (v.status === 'Available' ? 'btn-dark' : 'btn-primary') + '" onclick="cwToggleVehicleStatus(\'' + v.carId + '\',\'' + (v.status === 'Available' ? 'Maintenance' : 'Available') + '\')">' +
          (v.status === 'Available' ? 'Mark Maintenance' : 'Mark Available') +
        '</button>' +
      '</td></tr>';
  }).join('') : '<tr><td colspan="7" class="empty-state">No vehicles match these filters.</td></tr>';
}

function cwOpenVehicleModal(carId) {
  var form = document.getElementById('vehicle-form');
  form.reset();
  document.getElementById('v-original-carId').value = '';
  document.getElementById('vehicle-modal-title').textContent = 'New Vehicle';
  document.getElementById('v-carId').disabled = false;
  if (carId) {
    var v = cwAllVehicles.find(function (x) { return x.carId === carId; });
    if (v) {
      document.getElementById('vehicle-modal-title').textContent = 'Edit ' + v.carId;
      document.getElementById('v-original-carId').value = v.carId;
      document.getElementById('v-carId').value = v.carId;
      document.getElementById('v-carId').disabled = true;
      document.getElementById('v-model').value = v.model;
      document.getElementById('v-type').value = v.type;
      document.getElementById('v-capacity').value = v.capacity;
      document.getElementById('v-status').value = v.status;
    }
  }
  cwOpenModal('vehicle-modal');
}

async function onSaveVehicle(e) {
  e.preventDefault();
  var payload = {
    carId: document.getElementById('v-carId').value,
    model: document.getElementById('v-model').value,
    type: document.getElementById('v-type').value,
    capacity: Number(document.getElementById('v-capacity').value),
    status: document.getElementById('v-status').value
  };
  var originalCarId = document.getElementById('v-original-carId').value;
  if (originalCarId) {
    payload.originalCarId = originalCarId;
    await cwApiCall('updateVehicle', payload);
    cwToast('Vehicle ' + payload.carId + ' updated.');
  } else {
    await cwApiCall('createVehicle', payload);
    cwToast('Vehicle ' + payload.carId + ' added.');
  }
  cwCloseModal('vehicle-modal');
  await loadFleet();
}

async function cwToggleVehicleStatus(carId, newStatus) {
  await cwApiCall('updateVehicleStatus', { carId: carId, status: newStatus });
  cwToast(carId + ' set to ' + newStatus + '.');
  await loadFleet();
}
