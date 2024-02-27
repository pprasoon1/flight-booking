var express = require('express');
var router = express.Router();
const userModel = require('./users');
const passport = require('passport');
const localStrategy = require('passport-local');
const { getFlights } = require('./flightservice');
const Flight = require('./flights'); // Import the Flight model
const Booking = require('./booking'); // Import the Booking model

passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/register', function(req, res, next) {
  res.render('register');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/booking', async function(req, res, next) {
  try {
    // Call the getFlights function to retrieve flights from AviationStack
   // const flights = await getFlights();

    // Render the 'booking' view with the retrieved flights
    res.render('booking'/*,{ flights: flights }*/);
  } catch (error) {
    next(error);
  }
});

router.post('/book', async (req, res) => {
  try {
    const { flight, seatsBooked, origin, destination, departureDate } = req.body;

    // Check if the selected flight is available
    const selectedFlight = await Flight.findById(flight);

    if (!selectedFlight) {
      return res.status(400).send('Selected flight not found');
    }

    // Check if there are enough available seats
    if (seatsBooked > selectedFlight.availableSeats) {
      return res.status(400).send('Not enough available seats');
    }

    // Calculate total price (you might have your own pricing logic)
    const totalPrice = seatsBooked * selectedFlight.price;

    // Create a new booking
    const newBooking = new Booking({
      user: req.user._id, // Assuming you have a user in the session
      flight: selectedFlight._id,
      seatsBooked: seatsBooked,
      totalPrice: totalPrice,
      bookingDate: new Date(),
      origin: origin,
      destination: destination,
      departureDate: departureDate,
    });

    // Save the booking to the database
    await newBooking.save();

    // Update the available seats in the Flight model
    selectedFlight.availableSeats -= seatsBooked;
    await selectedFlight.save();

    // Redirect or render a success page
    res.redirect('/booking');
  } catch (error) {
    // Handle errors
    console.error('Booking error:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/register', function(req, res, next) {
  const data = new userModel({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    contact: req.body.contact,
    name: req.body.fullname,
  });
  userModel
    .register(data, req.body.password)
    .then(function() {
      passport.authenticate('local')(req, res, function() {
        res.redirect('/profile');
      });
    })
    .catch(function(err) {
      console.error('Registration error:', err);
      res.redirect('/register'); // Redirect to the registration page on error
    });
});

router.get('/profile', isLoggedIn, async function(req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user }).exec();
    res.render('profile', { user: user });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/',
    successRedirect: '/profile',
  }),
  function(req, res, next) {
    // Authentication successful
  }
);

router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/profile');
}

module.exports = router;
