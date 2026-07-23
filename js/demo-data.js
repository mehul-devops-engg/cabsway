/* ===================================================================
   CabsWay V2 — Demo fallback (used only until CW_CONFIG.API_URL is set)
   Mirrors the columns of the real Google Sheet tabs (see backend/Code.gs)
   so swapping the fallback for the live API requires no other changes.
   =================================================================== */

var CW_DEMO_SEED = {
  vehicles: [
    { carId: 'CW-101', model: 'Swift Dzire', type: 'Sedan', capacity: 4, status: 'Available', img: 'images/vehicles/sedan.svg', features: ['AC', 'Music System', '2 Bags'] },
    { carId: 'CW-102', model: 'Ertiga', type: 'SUV', capacity: 6, status: 'Available', img: 'images/vehicles/suv.svg', features: ['AC', '3rd Row', '4 Bags'] },
    { carId: 'CW-103', model: 'WagonR', type: 'Hatchback', capacity: 4, status: 'Available', img: 'images/vehicles/hatchback.svg', features: ['AC', 'Budget Friendly'] },
    { carId: 'CW-104', model: 'Tempo Traveller', type: 'Tempo Traveller', capacity: 12, status: 'Maintenance', img: 'images/vehicles/tempo.svg', features: ['AC', 'Pushback Seats', 'Group Travel'] },
    { carId: 'CW-105', model: 'Innova Crysta', type: 'SUV', capacity: 7, status: 'Available', img: 'images/vehicles/suv.svg', features: ['AC', 'Premium', 'Captain Seats'] }
  ],
  routes: [
    { from: 'Nashik', to: 'Pune', distanceKm: 210 },
    { from: 'Nashik', to: 'Mumbai', distanceKm: 170 },
    { from: 'Nashik', to: 'Chhatrapati Sambhaji Nagar', distanceKm: 235 },
    { from: 'Mumbai', to: 'Pune', distanceKm: 150 }
  ],
  reviews: [
    { name: 'Ashish Patil', route: 'Mumbai → Shirdi', rating: 5, text: 'Clean car, on-time pickup, driver called 20 minutes before arriving. Smooth darshan trip for the family.' },
    { name: 'Sneha Kulkarni', route: 'Pune → Nashik', rating: 5, text: 'Booked same-day for a wedding, got a confirmation on WhatsApp within minutes. Fare matched exactly what was quoted.' },
    { name: 'Rohit Deshmukh', route: 'Mumbai Airport Transfer', rating: 4, text: 'Reliable airport pickup at 4 AM. Only feedback is the car could have been a newer model, otherwise great.' },
    { name: 'Meera Joshi', route: 'Nashik → Trimbakeshwar', rating: 5, text: 'Driver knew the temple timings and traffic patterns well, saved us a lot of waiting time.' }
  ],
  settings: {
    businessName: 'CabsWay',
    phone: '+91 12345 67890',
    email: 'hello@cabsway.in',
    address: 'Shop 4, Highway Complex, Nashik, Maharashtra 422001',
    gst: '',
    defaultFare: 250,
    logo: '../images/logo.svg',
    adminPassword: 'cabsway123'
  },
  trips: [
    { tripId: 'TR-501', date: todayISO(), time: '06:00', pickup: 'Mumbai', drop: 'Nashik', vehicleType: 'Sedan', carId: 'CW-101', driverName: 'Ramesh Yadav', totalSeats: 4, bookedSeats: 2, status: 'Open' },
    { tripId: 'TR-502', date: todayISO(), time: '09:30', pickup: 'Pune', drop: 'Shirdi', vehicleType: 'SUV', carId: 'CW-105', driverName: 'Suresh More', totalSeats: 7, bookedSeats: 7, status: 'Full' },
    { tripId: 'TR-503', date: todayISO(), time: '14:00', pickup: 'Nashik', drop: 'Trimbakeshwar', vehicleType: 'Hatchback', carId: 'CW-103', driverName: 'Vikas Pawar', totalSeats: 4, bookedSeats: 4, status: 'Completed' }
  ],
  bookings: [
    { bookingId: 'BK-1001', tripId: 'TR-501', customerName: 'Aarti Shah', customerPhone: '9876500001', pickup: 'Mumbai', drop: 'Nashik', date: todayISO(), time: '06:00', passengers: '2', vehicleType: 'Sedan', tripType: 'One Way', fare: 3400, amountPaid: 3400, status: 'Booked', createdAt: new Date().toISOString() },
    { bookingId: 'BK-1002', tripId: 'TR-502', customerName: 'Nikhil Rane', customerPhone: '9876500002', pickup: 'Pune', drop: 'Shirdi', date: todayISO(), time: '09:30', passengers: '7', vehicleType: 'SUV', tripType: 'One Way', fare: 5300, amountPaid: 2000, status: 'Booked', createdAt: new Date().toISOString() },
    { bookingId: 'BK-1003', tripId: 'TR-503', customerName: 'Prachi Kale', customerPhone: '9876500003', pickup: 'Nashik', drop: 'Trimbakeshwar', date: todayISO(), time: '14:00', passengers: '4', vehicleType: 'Hatchback', tripType: 'Round Trip', fare: 1600, amountPaid: 0, status: 'Completed', createdAt: new Date().toISOString() }
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
      var tripId = 'TR-' + db.nextTripId++;
      var trip = Object.assign({ tripId: tripId, bookedSeats: 0, status: 'Open' }, payload);
      db.trips.push(trip);
      cwSaveDb(db);
      return trip;
    }
    case 'updateTrip': {
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
