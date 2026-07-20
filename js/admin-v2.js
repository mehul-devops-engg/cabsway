// Your Google Apps Script Web App URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzSQCwytw93-CFNTWbsgh3QDW7paXy09ilKy6NZyThDkMYHsxj7etWeU95wCn7iFu1TiQ/exec";
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

    const url =
        SCRIPT_URL +
        "?action=createTrip" +
        "&date=" + encodeURIComponent(date) +
        "&route=" + encodeURIComponent(route) +
        "&pickup=" + encodeURIComponent(pickup) +
        "&destination=" + encodeURIComponent(destination) +
        "&departure=" + encodeURIComponent(departure) +
        "&vehicle=" + encodeURIComponent(vehicle) +
        "&driver=" + encodeURIComponent(driver) +
        "&capacity=" + encodeURIComponent(capacity);
    

    jsonp(url, function (res) {

       if (res.ok) {

    alert("Trip Created Successfully!");

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

            vehicle.innerHTML +=
                `<option value="${car.vehicle}" data-capacity="${car.capacity}">
                    ${car.vehicle}
                </option>`;

        });

    });

}
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
                <td>${trip.date}</td>
                <td>${trip.route}</td>
                <td>${trip.departure}</td>
                <td>${trip.vehicle}</td>
                <td>${trip.driver}</td>
                <td>${trip.capacity}</td>
                <td>${trip.booked}</td>
                <td>${trip.available}</td>
                <td>${trip.status}</td>
            </tr>`;
        });

    });

}
