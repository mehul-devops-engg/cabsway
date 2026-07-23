/* CabsWay V2 — admin/reports.html logic */

document.addEventListener('DOMContentLoaded', async function () {
  var data = await cwApiCall('getReports');
  document.getElementById('rp-range').addEventListener('change', function () { render(data); });
  document.getElementById('export-pdf').addEventListener('click', function () { cwToast('PDF export is coming in a future release.'); });
  document.getElementById('export-excel').addEventListener('click', function () { cwToast('Excel export is coming in a future release.'); });
  render(data);
});

function cwDateInRange(dateStr, range) {
  var d = new Date(dateStr);
  var now = new Date();
  var start = new Date(now);
  if (range === 'daily') { start.setHours(0, 0, 0, 0); }
  else if (range === 'weekly') { start.setDate(now.getDate() - 7); }
  else { start.setDate(now.getDate() - 30); }
  return d >= start && d <= now;
}

function render(data) {
  var range = document.getElementById('rp-range').value;
  var labels = { daily: 'Today', weekly: 'Last 7 Days', monthly: 'Last 30 Days' };
  document.getElementById('rp-range-label').textContent = labels[range];

  var bookings = data.bookings.filter(function (b) { return cwDateInRange(b.date, range); });
  var trips = data.trips.filter(function (t) { return cwDateInRange(t.date, range); });

  var revenue = bookings.reduce(function (s, b) { return s + (Number(b.amountPaid) || 0); }, 0);
  var completed = bookings.filter(function (b) { return b.status === 'Completed'; }).length;
  var cancelled = bookings.filter(function (b) { return b.status === 'Cancelled'; }).length;

  var cards = [
    { label: 'Revenue', value: cwFormatINR(revenue), icon: '💰' },
    { label: 'Trips', value: trips.length, icon: '🚖' },
    { label: 'Bookings', value: bookings.length, icon: '🎫' },
    { label: 'Completed / Cancelled', value: completed + ' / ' + cancelled, icon: '✅' }
  ];
  document.getElementById('rp-cards').innerHTML = cards.map(function (c) {
    return '<div class="stat-card"><div class="stat-label">' + c.icon + ' ' + c.label + '</div><div class="stat-value">' + c.value + '</div></div>';
  }).join('');

  document.getElementById('rp-bookings-body').innerHTML = bookings.length ? bookings.map(function (b) {
    return '<tr><td>' + b.bookingId + '</td><td>' + b.customerName + '</td><td>' + b.date + '</td><td>' + cwFormatINR(b.fare) + '</td><td>' + cwStatusPill(b.status) + '</td></tr>';
  }).join('') : '<tr><td colspan="5" class="empty-state">No bookings in this range.</td></tr>';

  document.getElementById('rp-trips-body').innerHTML = trips.length ? trips.map(function (t) {
    return '<tr><td>' + t.tripId + '</td><td>' + t.pickup + ' → ' + t.drop + '</td><td>' + t.date + '</td><td>' + cwStatusPill(t.status) + '</td></tr>';
  }).join('') : '<tr><td colspan="4" class="empty-state">No trips in this range.</td></tr>';
}
