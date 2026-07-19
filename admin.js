// ============ EDIT THIS BEFORE PUBLISHING ============
  
  // =======================================================

  const CARS = ["Swift","Ciaz","Aura","Ertiga","XL6","Innova","Innova Crysta","Kia Carens"];
  const UNLOCK_KEY = "cabsway_admin_unlocked";

  // ================= EDIT THESE TWO LINES =================
  // Paste your Apps Script Web App URL here (ends in /exec). See setup steps.
  const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzSQCwytw93-CFNTWbsgh3QDW7paXy09ilKy6NZyThDkMYHsxj7etWeU95wCn7iFu1TiQ/exec";
  // Must exactly match SECRET in your Apps Script code.
  const SHEET_SECRET = "cabswayownerking";
  // ===========================================================

  // Loads data via a <script> tag instead of fetch() — this avoids the
  // CORS block that Google Apps Script triggers when called from a real
  // website with fetch. Visiting the URL directly in a browser still works
  // exactly the same as before; this only changes how the page calls it.
  function jsonpRequest(url){
    return new Promise((resolve, reject)=>{
      const cbName = 'jsonp_cb_' + Math.random().toString(36).slice(2);
      const script = document.createElement('script');
      const cleanup = ()=>{ delete window[cbName]; script.remove(); };
      window[cbName] = (data)=>{ cleanup(); resolve(data); };
      script.onerror = ()=>{ cleanup(); reject(new Error('Request failed to load')); };
      const sep = url.includes('?') ? '&' : '?';
      script.src = url + sep + 'callback=' + cbName;
      document.body.appendChild(script);
      setTimeout(()=>{ if(window[cbName]){ cleanup(); reject(new Error('Request timed out')); } }, 10000);
    });
  }

  function todayStr(){
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
  }

  // in-memory cache of all rows fetched from the sheet: { "date|car": {status,name,phone,route,notes,updatedAt} }
  let rowsByKey = {};
  let log = [];

  async function loadData(){
    if(SHEET_API_URL.includes("PASTE_YOUR")){
      showApiWarning();
      return;
    }
    try{
      const json = await jsonpRequest(SHEET_API_URL);
      if(!json.ok) throw new Error(json.error || "unknown error");
      rowsByKey = {};
      log = [];
      json.rows.forEach(r=>{
        rowsByKey[r.date + "|" + r.car] = r;
        log.push(r);
      });
      log.sort((a,b)=> (b.updatedAt||"").localeCompare(a.updatedAt||""));
    }catch(err){
      console.error("Failed to load bookings:", err);
      document.getElementById('summaryText').textContent = "Couldn't load live data — check your internet connection or API URL.";
    }
  }

  async function writeRow(action, car, extra){
    if(SHEET_API_URL.includes("PASTE_YOUR")){ showApiWarning(); return false; }
    try{
      const params = new URLSearchParams(Object.assign({ secret: SHEET_SECRET, action, date: selectedDate, car }, extra || {}));
      const json = await jsonpRequest(SHEET_API_URL + "?" + params.toString());
      if(!json.ok) throw new Error(json.error || "unknown error");
      return true;
    }catch(err){
      alert("Couldn't save — check your internet connection and try again.");
      console.error(err);
      return false;
    }
  }

  function showApiWarning(){
    document.getElementById('summaryText').innerHTML =
      '⚠️ Live sync isn\'t set up yet — paste your Apps Script URL into SHEET_API_URL near the top of this file\'s &lt;script&gt;.';
  }

  let selectedDate = todayStr();
  let pendingCar = null;

  // ---------- lock screen ----------
  async function login() {

    document.getElementById("loginError").style.display = "none";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {

        const params = new URLSearchParams({
            action: "login",
            username: username,
            password: password
        });

        const json = await jsonpRequest(
            SHEET_API_URL + "?" + params.toString()
        );

        if (json.ok) {

            sessionStorage.setItem(UNLOCK_KEY, "1");
            showDashboard();

        } else {

            document.getElementById("loginError").style.display = "block";

        }

    } catch (e) {

        alert("Login failed. Check your internet connection.");
        console.error(e);

    }
}

  if (
      username === ADMIN_USERNAME &&
      password === ADMIN_PASSWORD
  ) {

      sessionStorage.setItem(UNLOCK_KEY, "1");
      showDashboard();

  } else {

      document.getElementById("loginError").style.display = "block";

  }

}
  function lockAgain(){
    sessionStorage.removeItem(UNLOCK_KEY);
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('lockScreen').style.display = 'flex';
    document.getElementById("username").value="";
document.getElementById("password").value="";
document.getElementById("loginError").style.display="none";
  }
  async function showDashboard(){
    document.getElementById('lockScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('dateInput').value = selectedDate;
    document.getElementById('summaryText').textContent = 'Loading…';
    await loadData();
    render();
  }
  if(sessionStorage.getItem(UNLOCK_KEY) === "1"){ showDashboard(); }

  // ---------- date handling ----------
  document.getElementById('dateInput').addEventListener('change', async e=>{
    selectedDate = e.target.value || todayStr();
    closeBookForm();
    document.getElementById('summaryText').textContent = 'Loading…';
    await loadData();
    render();
  });
  async function goToday(){
    selectedDate = todayStr();
    document.getElementById('dateInput').value = selectedDate;
    closeBookForm();
    await loadData();
    render();
  }

  // ---------- rendering ----------
  function render(){
    const grid = document.getElementById('carGrid');
    grid.innerHTML = '';
    let freeCount = 0;

    CARS.forEach(car=>{
      const info = rowsByKey[selectedDate + "|" + car];
      const isBooked = info && info.status === 'booked';
      if(!isBooked) freeCount++;

      const tile = document.createElement('div');
      tile.className = 'car-tile ' + (isBooked ? 'booked' : 'available');

      let detailsHtml = '';
      if(isBooked){
        detailsHtml = `<div class="details">${info.name ? info.name : 'No name'}${info.phone ? ' · ' + info.phone : ''}${info.route ? '<br>' + info.route : ''}${info.notes ? '<br>' + info.notes : ''}</div>`;
      }

      tile.innerHTML = `
        <div class="name">${car}</div>
        <span class="status ${isBooked ? 'booked':'available'}">${isBooked ? 'Booked' : 'Available'}</span>
        ${detailsHtml}
        <button onclick="onTileClick('${car.replace(/'/g,"\\'")}')">${isBooked ? 'Free up this car' : 'Mark as booked'}</button>
      `;
      grid.appendChild(tile);
    });

    document.getElementById('summaryText').innerHTML = `<b>${freeCount}</b> of ${CARS.length} cars free on ${selectedDate}`;
    renderLog();
  }

  async function onTileClick(car){
    const info = rowsByKey[selectedDate + "|" + car];
    if(info && info.status === 'booked'){
      if(confirm(car + ' will be marked available again on ' + selectedDate + '. Continue?')){
        const okay = await writeRow('free', car);
        if(okay){ await loadData(); render(); }
      }
    } else {
      openBookForm(car);
    }
  }

  // ---------- book form ----------
  function openBookForm(car){
    pendingCar = car;
    document.getElementById('bookFormTitle').textContent = 'Mark ' + car + ' as booked — ' + selectedDate;
    document.getElementById('bfName').value = '';
    document.getElementById('bfPhone').value = '';
    document.getElementById('bfRoute').value = '';
    document.getElementById('bfNotes').value = '';
    document.getElementById('bookForm').style.display = 'block';
    document.getElementById('bookForm').scrollIntoView({behavior:'smooth', block:'center'});
  }
  function closeBookForm(){
    pendingCar = null;
    document.getElementById('bookForm').style.display = 'none';
  }
  async function saveBooking(){
    if(!pendingCar) return;
    const extra = {
      name: document.getElementById('bfName').value.trim(),
      phone: document.getElementById('bfPhone').value.trim(),
      route: document.getElementById('bfRoute').value.trim(),
      notes: document.getElementById('bfNotes').value.trim()
    };
    const okay = await writeRow('book', pendingCar, extra);
    if(okay){
      closeBookForm();
      await loadData();
      render();
    }
  }

  function exportCsv(){
    if(!log.length){ alert('Nothing to export yet.'); return; }
    const headers = ['Date','Car','Status','Name','Phone','Route','Notes','UpdatedAt'];
    const rows = log.map(r => headers.map(h => {
      const val = String(r[h.charAt(0).toLowerCase() + h.slice(1)] || '').replace(/"/g,'""');
      return `"${val}"`;
    }).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cabsway-bookings-' + todayStr() + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---------- activity log ----------
  function renderLog(){
    const list = document.getElementById('logList');
    if(!log.length){
      list.innerHTML = '<div class="empty-note">Nothing marked yet — completed bookings will show up here.</div>';
      return;
    }
    list.innerHTML = log.slice(0,20).map(item => `
      <div class="log-item">
        <div class="l-main"><b>${item.car}</b> — ${item.date} · ${item.status}${item.name ? ' · ' + item.name : ''}${item.route ? ' · ' + item.route : ''}</div>
        <div class="l-date">${item.updatedAt ? new Date(item.updatedAt).toLocaleString() : ''}</div>
      </div>
    `).join('');
  }