const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  seatsBooked: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now },
  origin: { type: String, required: true }, // Add origin field
  destination: { type: String, required: true }, // Add destination field
  departureDate: { type: Date, required: true }, // Add departure date field
  // Add any other fields you want to include in the booking
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
