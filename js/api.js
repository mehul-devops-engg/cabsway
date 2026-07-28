/* ===================================================================
   CabsWay V2 — API bridge to Google Apps Script backend
   -------------------------------------------------------------------
   1. Deploy backend/Code.gs as a Web App (Deploy > New deployment >
      Web app > Execute as: Me > Who has access: Anyone).
   2. Paste the generated /exec URL below as CW_API_URL.
   3. Every call is a POST with { action, payload } and the script
      replies with JSON { ok: true/false, data / error }.
   =================================================================== */

var CW_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycby_lxPdUXL2vB9FWYoB4WHxQjSbFvx6MZIE_pUJ_7q8dFjY3KGqXAfaQeau-rmqzg/exec',
  WHATSAPP_NUMBER: '919158818546', // business WhatsApp number, country code + number, no + or spaces
  BUSINESS_NAME: 'CabsWay'
};

/**
 * Calls the Apps Script backend. Falls back to local demo data
 * (see js/demo-data.js) when CW_CONFIG.API_URL has not been set yet,
 * so the site is fully clickable before the backend is deployed.
 */
async function cwApiCall(action, payload) {
  try {
    if (!CW_CONFIG.API_URL || CW_CONFIG.API_URL.indexOf('PASTE_YOUR') === 0) {
      return await cwDemoFallback(action, payload);
    }
    var res = await fetch(CW_CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight on Apps Script
      body: JSON.stringify({ action: action, payload: payload || {} })
    });
    var json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Something went wrong. Please try again.');
    return json.data;
  } catch (err) {
    console.error('CabsWay API error:', err);
    var message = (err && err.message) ? err.message : 'Could not reach the server. Please try again.';
    cwToast(message);
    throw err;
  }
}

/** Builds a wa.me deep link with a prefilled booking summary message. */
function cwBuildWhatsAppLink(summary) {
  var text = encodeURIComponent(summary);
  return 'https://wa.me/' + CW_CONFIG.WHATSAPP_NUMBER + '?text=' + text;
}
