/* ===================================================================
   CabsWay V2 — Demo fallback (used only until CW_CONFIG.API_URL is set)
   Mirrors the columns AND validation rules of the real Google Sheet
   backend (see backend/Code.js) so swapping the fallback for the live
   API requires no other changes.
   =================================================================== */

/** 8 models × 4 units each = 32 vehicles, no Tempo Traveller. */
function cwBuildDemoVehicles() {
  var models = [
    ['Swift', 'Hatchback', 4, 'images/vehicles/hatchback.svg', ['AC', 'Music System', 'Budget Friendly'], 'SWI'],
    ['Aura', 'Sedan', 4, 'images/vehicles/sedan.svg', ['AC', 'Music System', '2 Bags'], 'AUR'],
    ['Ciaz', 'Sedan', 4, 'images/vehicles/sedan.svg', ['AC', 'Premium Interior', '2 Bags'], 'CIA'],
    ['Ertiga', 'MUV', 6, 'images/vehicles/suv.svg', ['AC', '3rd Row', '4 Bags'], 'ERT'],
    ['XL6', 'MUV', 6, 'images/vehicles/suv.svg', ['AC', 'Captain Seats', '4 Bags'], 'XL6'],
    ['Innova', 'SUV', 7, 'images/vehicles/suv.svg', ['AC', 'Spacious', '5 Bags'], 'INV'],
    ['Innova Crysta', 'SUV', 7, 'images/vehicles/suv.svg', ['AC', 'Premium', 'Captain Seats'], 'ICR'],
    ['Kia Carens', 'MUV', 6, 'images/vehicles/suv.svg', ['AC', 'Modern Interior', '4 Bags'], 'KIA']
  ];
  var vehicles = [];
  models.forEach(function (m) {
    for (var i = 1; i <= 4; i++) {
      vehicles.push({
        carId: 'CW-' + m[5] + '-0' + i,
        model: m[0], type: m[1], capacity: m[2],
        status: 'Available', img: m[3], features: m[4]
      });
    }
  });
  return vehicles;
}

var CW_DEMO_SEED = {
  vehicles: cwBuildDemoVehicles(),
  routes: [
    { from: 'Nashik', to: 'Pune', distanceKm: 210 },
    { from: 'Nashik', to: 'Mumbai', distanceKm: 170 },
    { from: 'Nashik', to: 'Chhatrapati Sambhaji Nagar', distanceKm: 235 },
    { from: 'Mumbai', to: 'Pune', distanceKm: 150 }
  ],
  reviews: [
    { name: 'Ashish Patil', route: 'Nashik ⇄ Mumbai', rating: 5, text: 'Clean car, on-time pickup, driver called 20 minutes before arriving.' },
    { name: 'Sneha Kulkarni', route: 'Nashik ⇄ Pune', rating: 5, text: 'Booked same-day, got a confirmation on WhatsApp within minutes.' },
    { name: 'Rohit Deshmukh', route: 'Custom trip from Nashik', rating: 4, text: 'Reliable pickup at 4 AM, smooth trip and comfortable car.' },
    { name: 'Meera Joshi', route: 'Nashik ⇄ Chhatrapati Sambhaji Nagar', rating: 5, text: 'Driver knew the route well, saved us a lot of time.' }
  ],
  settings: {
    businessName: 'CabsWay',
    phone: '+91 91588 18546',
    email: 'rushikeshahire125@gmail.com',
    address: 'Nashik, Maharashtra',
    gst: '',
    defaultFare: 250,
    logo: '../images/logo.svg',
    adminPassword: 'cabsway123'
  },
  trips: [
    { tripId: 'TR-501', date: todayISO(), time: '06:00', pickup: 'Nashik', drop: 'Mumbai', vehicleType: 'Sedan', carId: 'CW-AUR-01', driverName: 'Ramesh Yadav', totalSeats: 4, bookedSeats: 2, status: 'Open' },
    { tripId: 'TR-502', date: todayISO(), time: '09:30', pickup: 'Nashik', drop: 'Pune', vehicleType: 'SUV', carId: 'CW-INV-01', driverName: 'Suresh More', totalSeats: 7, bookedSeats: 7, status: 'Full' },
    { tripId: 'TR-503', date: todayISO(), time: '14:00', pickup: 'Mumbai', drop: 'Pune', vehicleType: 'Hatchback', carId: 'CW-SWI-01', driverName: 'Vikas Pawar', totalSeats: 4, bookedSeats: 4, status: 'Completed' }
  ],
  bookings: [
    { bookingId: 'BK-1001', tripId: 'TR-501', customerName: 'Aarti Shah', customerPhone: '9876500001', pickup: 'Nashik', drop: 'Mumbai', date: todayISO(), time: '06:00', passengers: '2', vehicleType: 'Sedan', tripType: 'One Way', fare: 3400, amountPaid: 3400, status: 'Booked', createdAt: new Date().toISOString() },
    { bookingId: 'BK-1002', tripId: 'TR-502', customerName: 'Nikhil Rane', customerPhone: '9876500002', pickup: 'Nashik', drop: 'Pune', date: todayISO(), time: '09:30', passengers: '7', vehicleType: 'SUV', tripType: 'One Way', fare: 5300, amountPaid: 2000, status: 'Booked', createdAt: new Date().toISOString() },
    { bookingId: 'BK-1003', tripId: 'TR-503', customerName: 'Prachi Kale', customerPhone: '9876500003', pickup: 'Mumbai', drop: 'Pune', date: todayISO(), time: '14:00', passengers: '4', vehicleType: 'Hatchback', tripType: 'Round Trip', fare: 1600, amountPaid: 0, status: 'Completed', createdAt: new Date().toISOString() }
  ]
};

function todayISO() { return new Date().toISOString().split('T')[0]; }

/** Derives Pending / Partial / Paid from fare vs amountPaid. */
function cwPaymentStatus(fare, paid) {
  fare = Number(fare) || 0; paid = Number(paid) || 0;
  if (paid <= 0) return 'Pending';
  if (paid >= fare) return 'Paid';
  return 'Partial';
}

function cwLoadDb() {
  var db = JSON.parse(localStorage.getItem('cw_demo_db') || 'null');
  if (!db) {
    db = {
      vehicles: JSON.parse(JSON.stringify(CW_DEMO_SEED.vehicles)),
      trips: JSON.parse(JSON.stringify(CW_DEMO_SEED.trips)),
      bookings: JSON.parse(JSON.stringify(CW_DEMO_SEED.bookings)),
      settings: JSON.parse(JSON.stringify(CW_DEMO_SEED.settings)),
      nextBookingId: 1004,
      nextTripId: 504
    };
    localStorage.setItem('cw_demo_db', JSON.stringify(db));
  }
  return db;
}
function cwSaveDb(db) { localStorage.setItem('cw_demo_db', JSON.stringify(db)); }

/** Recomputes an Open/Full/Completed trip's booked-seat count from its bookings. */
function cwRecalcTrip(db, tripId) {
  var trip = db.trips.find(function (t) { return t.tripId === tripId; });
  if (!trip || trip.status === 'Completed') return;
  var booked = db.bookings
    .filter(function (b) { return b.tripId === tripId && b.status !== 'Cancelled'; })
    .reduce(function (sum, b) { return sum + (Number(b.passengers) || 0); }, 0);
  trip.bookedSeats = booked;
  trip.status = booked >= trip.totalSeats ? 'Full' : 'Open';
}

/** Throws a friendly error if a trip can't currently take `extraPassengers` more people. */
function cwAssertTripHasRoom(db, tripId, extraPassengers, excludeBookingId) {
  if (!tripId) return;
  var trip = db.trips.find(function (t) { return t.tripId === tripId; });
  if (!trip) throw new Error('That trip no longer exists — please pick another.');
  if (trip.status === 'Completed') throw new Error('That trip is already completed and can\'t take new bookings.');
  var alreadyBooked = db.bookings
    .filter(function (b) { return b.tripId === tripId && b.status !== 'Cancelled' && b.bookingId !== excludeBookingId; })
    .reduce(function (sum, b) { return sum + (Number(b.passengers) || 0); }, 0);
  if (alreadyBooked + Number(extraPassengers || 0) > Number(trip.totalSeats)) {
    throw new Error('This trip only has ' + Math.max(0, trip.totalSeats - alreadyBooked) + ' seat(s) left — reduce passengers or pick another trip.');
  }
}

function cwAssertVehicleAvailableAndFits(db, carId, totalSeats) {
  var vehicle = db.vehicles.find(function (v) { return v.carId === carId; });
  if (!vehicle) throw new Error('Selected vehicle was not found.');
  if (vehicle.status !== 'Available') throw new Error('That vehicle is under maintenance and can\'t be assigned to a trip.');
  if (Number(totalSeats) > Number(vehicle.capacity)) {
    throw new Error('This vehicle only has ' + vehicle.capacity + ' seats — total seats can\'t be higher than the vehicle\'s capacity.');
  }
}

function cwIsDuplicateTrip(db, payload, excludeTripId) {
  var norm = function (s) { return String(s || '').trim().toLowerCase(); };
  return db.trips.some(function (t) {
    if (excludeTripId && t.tripId === excludeTripId) return false;
    return norm(t.pickup) === norm(payload.pickup) &&
      norm(t.drop) === norm(payload.drop) &&
      norm(t.date) === norm(payload.date) &&
      norm(t.time) === norm(payload.time) &&
      norm(t.carId) === norm(payload.carId) &&
      norm(t.driverName) === norm(payload.driverName);
  });
}

/** In-browser stand-in for the Google Apps Script backend, backed by localStorage. */
function cwDemoFallback(action, payload) {
  var db = cwLoadDb();
  payload = payload || {};

  switch (action) {
    /* ---------- Public site ---------- */
    case 'getVehicles': return db.vehicles;
    case 'getRoutes': return CW_DEMO_SEED.routes;
    case 'getReviews': return CW_DEMO_SEED.reviews;
    case 'createBooking': {
      if (payload.tripId) cwAssertTripHasRoom(db, payload.tripId, payload.passengers, null);
      var id = 'BK-' + db.nextBookingId++;
      var booking = Object.assign({
        bookingId: id, tripId: payload.tripId || '', amountPaid: 0,
        status: 'Booked', createdAt: new Date().toISOString()
      }, payload);
      booking.fare = payload.fare || 0; // fare is confirmed by the team on WhatsApp, not shown on the site
      db.bookings.push(booking);
      if (booking.tripId) cwRecalcTrip(db, booking.tripId);
      cwSaveDb(db);
      return booking;
    }

    /* ---------- Admin auth ---------- */
    case 'login':
      return { ok: payload.password === db.settings.adminPassword };

    /* ---------- Admin: Trips ---------- */
    case 'getTrips': return db.trips;
    case 'createTrip': {
      cwAssertVehicleAvailableAndFits(db, payload.carId, payload.totalSeats);
      if (cwIsDuplicateTrip(db, payload, null)) {
        throw new Error('An identical trip already exists (same pickup, drop, date, time, vehicle and driver).');
      }
      var tripId = 'TR-' + db.nextTripId++;
      var trip = Object.assign({ tripId: tripId, bookedSeats: 0, status: 'Open' }, payload);
      db.trips.push(trip);
      cwSaveDb(db);
      return trip;
    }
    case 'updateTrip': {
      if (payload.carId && payload.totalSeats) cwAssertVehicleAvailableAndFits(db, payload.carId, payload.totalSeats);
      if (cwIsDuplicateTrip(db, payload, payload.tripId)) {
        throw new Error('Another trip already has the same pickup, drop, date, time, vehicle and driver.');
      }
      var t = db.trips.find(function (x) { return x.tripId === payload.tripId; });
      if (t) Object.assign(t, payload);
      cwSaveDb(db);
      return t;
    }
    case 'deleteTrip': {
      db.trips = db.trips.filter(function (x) { return x.tripId !== payload.tripId; });
      cwSaveDb(db);
      return { deleted: true };
    }
    case 'completeTrip': {
      var tc = db.trips.find(function (x) { return x.tripId === payload.tripId; });
      if (tc) tc.status = 'Completed';
      db.bookings.forEach(function (b) { if (b.tripId === payload.tripId && b.status === 'Booked') b.status = 'Completed'; });
      cwSaveDb(db);
      return tc;
    }

    /* ---------- Admin: Bookings ---------- */
    case 'getBookings': return db.bookings;
    case 'updateBooking': {
      if (payload.tripId && payload.passengers) cwAssertTripHasRoom(db, payload.tripId, payload.passengers, payload.bookingId);
      var b2 = db.bookings.find(function (x) { return x.bookingId === payload.bookingId; });
      if (b2) { Object.assign(b2, payload); if (b2.tripId) cwRecalcTrip(db, b2.tripId); }
      cwSaveDb(db);
      return b2;
    }
    case 'cancelBooking': {
      var b3 = db.bookings.find(function (x) { return x.bookingId === payload.bookingId; });
      if (b3) { b3.status = 'Cancelled'; if (b3.tripId) cwRecalcTrip(db, b3.tripId); }
      cwSaveDb(db);
      return b3;
    }
    case 'completeBooking': {
      var b4 = db.bookings.find(function (x) { return x.bookingId === payload.bookingId; });
      if (b4) b4.status = 'Completed';
      cwSaveDb(db);
      return b4;
    }

    /* ---------- Admin: Fleet ---------- */
    case 'updateVehicleStatus': {
      var v = db.vehicles.find(function (x) { return x.carId === payload.carId; });
      if (v) v.status = payload.status;
      cwSaveDb(db);
      return v;
    }
    case 'createVehicle': {
      var newV = Object.assign({ img: 'images/vehicles/sedan.svg', features: [] }, payload);
      db.vehicles.push(newV);
      cwSaveDb(db);
      return newV;
    }
    case 'updateVehicle': {
      var ev = db.vehicles.find(function (x) { return x.carId === payload.originalCarId; });
      if (ev) Object.assign(ev, payload);
      cwSaveDb(db);
      return ev;
    }
    case 'deleteVehicle': {
      db.vehicles = db.vehicles.filter(function (x) { return x.carId !== payload.carId; });
      cwSaveDb(db);
      return { deleted: true };
    }

    /* ---------- Admin: Settings ---------- */
    case 'getSettings': return db.settings;
    case 'updateSettings': {
      Object.assign(db.settings, payload);
      cwSaveDb(db);
      return db.settings;
    }

    /* ---------- Admin: Reports ---------- */
    case 'getReports': {
      var bookings = db.bookings;
      var totalRevenue = bookings.reduce(function (s, b) { return s + (Number(b.amountPaid) || 0); }, 0);
      var completed = bookings.filter(function (b) { return b.status === 'Completed'; }).length;
      var cancelled = bookings.filter(function (b) { return b.status === 'Cancelled'; }).length;
      return {
        totalRevenue: totalRevenue,
        totalTrips: db.trips.length,
        totalBookings: bookings.length,
        completed: completed,
        cancelled: cancelled,
        bookings: bookings,
        trips: db.trips
      };
    }

    default:
      return null;
  }
}
