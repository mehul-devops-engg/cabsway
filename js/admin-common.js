/* CabsWay V2 — shared admin panel behaviour */

(function () {
  // Simple client-side session guard. Real access control is enforced by
  // your Google Apps Script deployment; this just avoids showing the UI
  // to someone who hasn't entered the admin password in this browser.
  var isLoginPage = location.pathname.indexOf('login.html') !== -1;
  var loggedIn = sessionStorage.getItem('cw_admin_session') === 'yes';
  if (!isLoginPage && !loggedIn) {
    location.href = 'login.html';
  }
})();

document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.admin-menu-toggle');
  var sidebar = document.querySelector('.admin-sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', function () { sidebar.classList.toggle('open'); });
  }

  var here = location.pathname.split('/').pop();
  document.querySelectorAll('.admin-nav a').forEach(function (a) {
    if (a.getAttribute('href') === here) a.classList.add('active');
  });

  var logoutBtn = document.getElementById('admin-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      sessionStorage.removeItem('cw_admin_session');
      location.href = 'login.html';
    });
  }
});

function cwOpenModal(id) { document.getElementById(id).classList.add('open'); }
function cwCloseModal(id) { document.getElementById(id).classList.remove('open'); }

function cwPaymentPill(status) {
  var map = { Paid: 'pill-paid', Pending: 'pill-pending', Partial: 'pill-partial', Cancelled: 'pill-cancelled' };
  return '<span class="pill ' + (map[status] || 'pill-completed') + '">' + status + '</span>';
}
function cwStatusPill(status) {
  var map = { Open: 'pill-open', Full: 'pill-full', Completed: 'pill-completed', Booked: 'pill-open', Cancelled: 'pill-cancelled' };
  return '<span class="pill ' + (map[status] || 'pill-completed') + '">' + status + '</span>';
}
