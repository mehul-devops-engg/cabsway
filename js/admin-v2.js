// Your Google Apps Script Web App URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzSQCwytw93-CFNTWbsgh3QDW7paXy09ilKy6NZyThDkMYHsxj7etWeU95wCn7iFu1TiQ/exec";
let editingTripId = null;
const menuItems = document.querySelectorAll(".menu-item");
const pages = document.querySelectorAll(".page");

menuItems.forEach(item=>{

    item.addEventListener("click",()=>{

        menuItems.forEach(i=>i.classList.remove("active"));

        item.classList.add("active");

        pages.forEach(page=>{

            page.classList.remove("active-page");

        });

        document
            .getElementById(item.dataset.page)
            .classList.add("active-page");

    });

});

document.getElementById("closeTripModal").onclick = closeTripModal;
document.getElementById("cancelTripBtn").onclick = closeTripModal;

function closeTripModal(){
    tripModal.style.display = "none";
}

window.onclick = function(e){
    if(e.target === tripModal){
        closeTripModal();
    }
};
const tripModal = document.getElementById("tripModal");
const addTripBtn = document.getElementById("addTripBtn");

console.log(tripModal);
console.log(addTripBtn);

addTripBtn.onclick = function () {
    tripModal.style.display = "flex";
};

document.getElementById("closeTripModal").onclick = function () {
    tripModal.style.display = "none";
};

document.getElementById("cancelTripBtn").onclick = function () {
    tripModal.style.display = "none";
};
document.getElementById("saveTripBtn").onclick = saveTrip;
function saveTrip() {

    const date = document.getElementById("tripDate").value;
    const pickup = document.getElementById("tripPickup").value;
    const destination = document.getElementById("tripDestination").value;
    const departure = document.getElementById("tripDeparture").value;
    const vehicle = document.getElementById("tripVehicle").value;
    const driver = document.getElementById("tripDriver").value;
    const capacity = document.getElementById("tripCapacity").value;

    const route = pickup + " → " + destination;

    const action = editingTripId ? "updateTrip" : "createTrip";
    const url =
        SCRIPT_URL +
        "?action=" + action +
        "&date=" + encodeURIComponent(date) +
        "&route=" + encodeURIComponent(route) +
        "&pickup=" + encodeURIComponent(pickup) +
        "&destination=" + encodeURIComponent(destination) +
        "&departure=" + encodeURIComponent(departure) +
        "&vehicle=" + encodeURIComponent(vehicle) +
        "&driver=" + encodeURIComponent(driver) +
        "&capacity=" + encodeURIComponent(capacity) +
"&tripId=" + encodeURIComponent(editingTripId || "");
    

    jsonp(url, function (res) {

       if (res.ok) {

    alert(editingTripId ? "Trip Updated Successfully!" : "Trip Created Successfully!");

editingTripId = null;

document.getElementById("saveTripBtn").textContent = "Save Trip";

    closeTripModal();

    loadTrips();



        } else {

            alert(res.error || "Failed to create trip.");

        }

    });

}
function jsonp(url, callback) {

    const callbackName = "cb_" + Date.now();

    window[callbackName] = function (data) {

        callback(data);

        delete window[callbackName];

        document.body.removeChild(script);

    };

    const script = document.createElement("script");

    script.src = url + "&callback=" + callbackName;

    document.body.appendChild(script);

}
window.addEventListener("load", loadFleet);

function loadFleet() {

    const url = SCRIPT_URL + "?action=fleet";

    jsonp(url, function(res) {

        if (!res.ok) return;

        const vehicle = document.getElementById("tripVehicle");

        vehicle.innerHTML = '<option value="">Select Vehicle</option>';

       res.fleet.forEach(car => {

    vehicle.innerHTML += `
        <option
            value="${car.carId}"
            data-model="${car.model}"
            data-capacity="${car.capacity}">
            ${car.carId} - ${car.model}
        </option>`;

});

        });

    };


document.getElementById("tripVehicle").addEventListener("change", function () {

    const option = this.options[this.selectedIndex];

    document.getElementById("tripCapacity").value =
        option.dataset.capacity || "";

});
window.addEventListener("load", loadTrips);

function loadTrips() {

    jsonp(SCRIPT_URL + "?action=listTrips", function(res){

        if(!res.ok) return;

        const tbody = document.getElementById("tripTableBody");

        tbody.innerHTML = "";

        if(res.trips.length === 0){

            tbody.innerHTML =
            `<tr>
                <td colspan="10" style="text-align:center;">
                    No trips available
                </td>
            </tr>`;

            return;
        }

        res.trips.forEach(function(trip){

            tbody.innerHTML += `
            <tr>
                <td>${trip.tripId}</td>
                <td>${new Date(trip.date).toLocaleDateString("en-GB")}</td>
                <td>${trip.route}</td>
                <td>${new Date(trip.departure).toLocaleTimeString("en-IN",{
hour:"2-digit",
minute:"2-digit"
})}</td>
                <td>${trip.vehicle}</td>
                <td>${trip.driver}</td>
                <td>${trip.capacity}</td>
                <td>${trip.booked}</td>
                <td>${trip.available}</td>
                <td>${trip.status}</td>
<td>
    <button class="edit-btn" onclick='editTrip(${JSON.stringify(trip)})'>
        Edit
    </button>

    <button class="delete-btn" onclick="deleteTrip('${trip.tripId}')">
        Delete
    </button>
</td>
            </tr>`;
        });

    });

}
window.addEventListener("load", loadDashboard);

function loadDashboard() {

    jsonp(SCRIPT_URL + "?action=listTrips", function(res){

        if(!res.ok) return;

        const trips = res.trips || [];

        document.getElementById("todayTrips").textContent = trips.length;

        let booked = 0;
        let available = 0;

        const dashboard = document.getElementById("dashboardTrips");

        dashboard.innerHTML = "";

        trips.forEach(function(trip){

            booked += Number(trip.booked);
            available += Number(trip.available);

            dashboard.innerHTML += `
            <div class="dashboard-trip">

                <div class="dashboard-trip-top">
                    <h3>${trip.tripId}</h3>
                    <span class="trip-status">${trip.status}</span>
                </div>

                <div class="trip-route">
                    ${trip.route}
                </div>

                <div class="trip-info">
                    <div>🕒 ${new Date(trip.departure).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</div>
                    <div>🚗 ${trip.vehicle}</div>
                    <div>👤 ${trip.driver}</div>
                    <div>💺 ${trip.booked}/${trip.capacity}</div>
                </div>

            </div>`;
        });

        document.getElementById("todayBookings").textContent = booked;
        document.getElementById("todaySeats").textContent = available;

        document.getElementById("todayRevenue").textContent = "₹0";

    });

}
window.addEventListener("load", loadBookings);

function loadBookings() {

    jsonp(SCRIPT_URL + "?action=list", function(res){

        if(!res.ok) return;

        const tbody = document.getElementById("bookingTableBody");

        tbody.innerHTML = "";

        if(res.rows.length === 0){

            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;padding:30px;">
                        No bookings found
                    </td>
                </tr>
            `;

            return;
        }

        res.rows.forEach(function(row){

            tbody.innerHTML += `
                <tr>
                    <td>${row.bookingId}</td>
                    <td>${row.date}</td>
                    <td>${row.name}</td>
                    <td>${row.phone}</td>
                    <td>${row.car}</td>
                    <td>${row.seats}</td>
                    <td>₹${row.fare}</td>
                    <td>${row.status}</td>
                </tr>
            `;
        });

    });

}
function editTrip(trip) {
    editingTripId = trip.tripId;

    document.getElementById("tripDate").value =
    new Date(trip.date).toISOString().split("T")[0];
    document.getElementById("tripPickup").value = trip.pickup;
    document.getElementById("tripDestination").value = trip.destination;
    document.getElementById("tripDeparture").value =
    new Date(trip.departure).toTimeString().slice(0, 5);
    document.getElementById("tripVehicle").value = trip.vehicle;
    document.getElementById("tripDriver").value = trip.driver;
    document.getElementById("tripCapacity").value = trip.capacity;

    document.getElementById("saveTripBtn").textContent = "Update Trip";
    tripModal.style.display = "flex";
}
function deleteTrip(tripId) {

    if (!confirm("Delete this trip?")) return;

    const url =
        SCRIPT_URL +
        "?action=deleteTrip" +
        "&tripId=" + encodeURIComponent(tripId);

    jsonp(url, function(res){

        if(res.ok){

            alert("Trip deleted successfully!");

            loadTrips();
            loadDashboard();

        }else{

            alert(res.error || "Failed to delete trip.");

        }

    });

}
