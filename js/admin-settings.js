/* CabsWay V2 — admin/settings.html logic */

document.addEventListener('DOMContentLoaded', async function () {
  var s = await cwApiCall('getSettings');
  document.getElementById('s-businessName').value = s.businessName || '';
  document.getElementById('s-phone').value = s.phone || '';
  document.getElementById('s-email').value = s.email || '';
  document.getElementById('s-address').value = s.address || '';
  document.getElementById('s-gst').value = s.gst || '';
  document.getElementById('s-defaultFare').value = s.defaultFare || 0;
  document.getElementById('s-logo').value = s.logo || '';
  document.getElementById('s-password').value = s.adminPassword || '';

  document.getElementById('settings-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var payload = {
      businessName: document.getElementById('s-businessName').value,
      phone: document.getElementById('s-phone').value,
      email: document.getElementById('s-email').value,
      address: document.getElementById('s-address').value,
      gst: document.getElementById('s-gst').value,
      defaultFare: Number(document.getElementById('s-defaultFare').value),
      logo: document.getElementById('s-logo').value,
      adminPassword: document.getElementById('s-password').value
    };
    await cwApiCall('updateSettings', payload);
    cwToast('Settings saved.');
  });
});
