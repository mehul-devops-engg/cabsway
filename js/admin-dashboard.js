/* CabsWay V2 — admin/dashboard.html logic */

document.addEventListener('DOMContentLoaded', async function () {
  document.getElementById('today-label').textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  var today = new Date().toISOString().split('T')[0];
  var trips = await cwApiCall('getTrips');
  var bookings = await cwApiCall('getBookings');

  var todaysTrips = trips.filter(function (t) { return t.date === today; });
  var todaysBookings = bookings.filter(function (b) { return b.date === today; });
  var revenueToday = todaysBookings.reduce(function (s, b) { return s + (Number(b.amountPaid) || 0); }, 0);
  var availableSeats = todaysTrips.reduce(function (s, t) { return s + Math.max(0, t.totalSeats - t.bookedSeats); }, 0);

  var cards = [
    { label: "Today's Revenue", value: cwFormatINR(revenueToday), icon: '💰' },
    { label: "Today's Trips", value: todaysTrips.length, icon: '🚖' },
    { label: "Today's Bookings", value: todaysBookings.length, icon: '🎫' },
    { label: 'Available Seats', value: availableSeats, icon: '💺' }
  ];
  document.getElementById('quick-cards').innerHTML = cards.map(function (c) {
    return '<div class="stat-card"><div class="stat-label">' + c.icon + ' ' + c.label + '</div><div class="stat-value">' + c.value + '</div></div>';
  }).join('');

  document.getElementById('today-trips-body').innerHTML = todaysTrips.length ? todaysTrips.map(function (t) {
    return '<tr><td>' + t.tripId + '<br><span class="text-sm muted">' + t.driverName + '</span></td>' +
      '<td>' + t.pickup + ' → ' + t.drop + '</td><td>' + t.time + '</td>' +
      '<td>' + t.bookedSeats + '/' + t.totalSeats + '</td><td>' + cwStatusPill(t.status) + '</td></tr>';
  }).join('') : '<tr><td colspan="5" class="empty-state">No trips scheduled for today.</td></tr>';

  var recent = bookings.slice(-6).reverse();
  document.getElementById('recent-activity').innerHTML = recent.length ? recent.map(function (b) {
    return '<div class="flex between" style="padding:10px 0;border-bottom:1px solid var(--line);">' +
      '<div><strong>' + b.bookingId + '</strong><div class="text-sm muted">' + b.customerName + ' · ' + b.pickup + ' → ' + b.drop + '</div></div>' +
      cwStatusPill(b.status) +
    '</div>';
  }).join('') : '<p class="muted">No recent bookings yet.</p>';
});
