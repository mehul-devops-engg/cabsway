/* CabsWay V2 — admin/bookings.html logic */

var cwAllBookings = [];
var cwTripsForBookings = [];

document.addEventListener('DOMContentLoaded', async function () {
  var results = await Promise.all([cwApiCall('getTrips'), cwApiCall('getBookings')]);
  cwTripsForBookings = results[0].filter(function (t) { return t.status !== 'Completed'; });
  cwAllBookings = results[1];

  populateTripDropdown();
  renderBookings();
  document.getElementById('bk-search').addEventListener('input', renderBookings);
  document.getElementById('bk-filter-status').addEventListener('change', renderBookings);
  document.getElementById('bk-filter-payment').addEventListener('change', renderBookings);
  document.getElementById('booking-admin-form').addEventListener('submit', onSaveBooking);
});

/** Full trips are shown but disabled, so it's obvious why they can't be picked. */
function populateTripDropdown(keepTripId) {
  var select = document.getElementById('bk-trip');
  var options = '<option value="">— Not linked —</option>' + cwTripsForBookings.map(function (t) {
    var seatsLeft = Math.max(0, Number(t.totalSeats) - Number(t.bookedSeats));
    var isFull = t.status === 'Full';
    var disabled = (isFull && t.tripId !== keepTripId) ? 'disabled' : '';
    var label = t.tripId + ' — ' + t.pickup + ' → ' + t.drop + ' (' + t.date + ' ' + t.time + ') — ' +
      (isFull ? 'FULL' : seatsLeft + ' seat(s) left');
    return '<option value="' + t.tripId + '" ' + disabled + '>' + label + '</option>';
  }).join('');
  select.innerHTML = options;
  if (keepTripId) select.value = keepTripId;
}

async function loadBookings() {
  cwAllBookings = await cwApiCall('getBookings');
  renderBookings();
}

function renderBookings() {
  var q = document.getElementById('bk-search').value.toLowerCase();
  var statusFilter = document.getElementById('bk-filter-status').value;
  var paymentFilter = document.getElementById('bk-filter-payment').value;
  var today = new Date().toISOString().split('T')[0];

  var rows = cwAllBookings.filter(function (b) {
    var matchesQ = !q || (b.bookingId + b.customerName + b.customerPhone).toLowerCase().indexOf(q) !== -1;
    var payStatus = cwPaymentStatus(b.fare, b.amountPaid);
    var matchesStatus = !statusFilter || (statusFilter === 'today' ? b.date === today : b.status === statusFilter);
    var matchesPayment = !paymentFilter || payStatus === paymentFilter;
    return matchesQ && matchesStatus && matchesPayment;
  });

  document.getElementById('bk-count').textContent = rows.length + ' booking(s)';
  document.getElementById('bookings-body').innerHTML = rows.length ? rows.map(function (b) {
    var balance = Math.max(0, (Number(b.fare) || 0) - (Number(b.amountPaid) || 0));
    var payStatus = cwPaymentStatus(b.fare, b.amountPaid);
    return '<tr><td>' + b.bookingId + '</td>' +
      '<td>' + b.customerName + '<br><span class="text-sm muted">' + b.customerPhone + '</span></td>' +
      '<td>' + b.pickup + ' → ' + b.drop + '</td>' +
      '<td>' + b.date + ' ' + b.time + '</td>' +
      '<td>' + cwFormatINR(b.fare) + '</td>' +
      '<td>' + cwFormatINR(b.amountPaid) + '</td>' +
      '<td>' + cwFormatINR(balance) + '</td>' +
      '<td>' + cwPaymentPill(payStatus) + '</td>' +
      '<td>' + cwStatusPill(b.status) + '</td>' +
      '<td class="action-row">' +
        '<button class="btn btn-ghost btn-sm" onclick="cwOpenBookingModal(\'' + b.bookingId + '\')">Edit</button>' +
        (b.status === 'Booked' ? '<button class="btn btn-dark btn-sm" onclick="cwCompleteBooking(\'' + b.bookingId + '\')">Complete</button>' : '') +
        (b.status === 'Booked' ? '<button class="btn btn-danger btn-sm" onclick="cwCancelBooking(\'' + b.bookingId + '\')">Cancel</button>' : '') +
      '</td></tr>';
  }).join('') : '<tr><td colspan="10" class="empty-state">No bookings match these filters.</td></tr>';
}

function cwOpenBookingModal(bookingId) {
  var form = document.getElementById('booking-admin-form');
  form.reset();
  document.getElementById('bk-bookingId').value = '';
  document.getElementById('booking-modal-title').textContent = 'New Booking';
  populateTripDropdown();

  if (bookingId) {
    var b = cwAllBookings.find(function (x) { return x.bookingId === bookingId; });
    if (b) {
      document.getElementById('booking-modal-title').textContent = 'Edit Booking ' + b.bookingId;
      document.getElementById('bk-bookingId').value = b.bookingId;
      document.getElementById('bk-name').value = b.customerName;
      document.getElementById('bk-phone').value = b.customerPhone;
      document.getElementById('bk-pickup').value = b.pickup;
      document.getElementById('bk-drop').value = b.drop;
      document.getElementById('bk-date').value = b.date;
      document.getElementById('bk-time').value = b.time;
      document.getElementById('bk-passengers').value = b.passengers;
      document.getElementById('bk-fare').value = b.fare;
      document.getElementById('bk-paid').value = b.amountPaid;
      populateTripDropdown(b.tripId); // keep its own trip selectable even if that trip is now Full
    }
  }
  cwOpenModal('booking-modal');
}

async function onSaveBooking(e) {
  e.preventDefault();
  var payload = {
    customerName: document.getElementById('bk-name').value,
    customerPhone: document.getElementById('bk-phone').value,
    pickup: document.getElementById('bk-pickup').value,
    drop: document.getElementById('bk-drop').value,
    date: document.getElementById('bk-date').value,
    time: document.getElementById('bk-time').value,
    passengers: document.getElementById('bk-passengers').value,
    tripId: document.getElementById('bk-trip').value,
    fare: Number(document.getElementById('bk-fare').value),
    amountPaid: Number(document.getElementById('bk-paid').value)
  };
  var existingId = document.getElementById('bk-bookingId').value;
  try {
    if (existingId) {
      payload.bookingId = existingId;
      await cwApiCall('updateBooking', payload);
      cwToast('Booking ' + existingId + ' updated.');
    } else {
      var created = await cwApiCall('createBooking', payload);
      cwToast('Booking ' + created.bookingId + ' created.');
    }
    cwCloseModal('booking-modal');
    await loadBookings();
    cwTripsForBookings = (await cwApiCall('getTrips')).filter(function (t) { return t.status !== 'Completed'; });
  } catch (err) {
    /* cwApiCall already showed the reason (e.g. trip is full) — keep the modal open so it can be fixed */
  }
}

async function cwCompleteBooking(bookingId) {
  await cwApiCall('completeBooking', { bookingId: bookingId });
  cwToast('Booking ' + bookingId + ' marked as completed ride.');
  await loadBookings();
}

async function cwCancelBooking(bookingId) {
  if (!confirm('Cancel booking ' + bookingId + '?')) return;
  await cwApiCall('cancelBooking', { bookingId: bookingId });
  cwToast('Booking ' + bookingId + ' cancelled.');
  await loadBookings();
}
