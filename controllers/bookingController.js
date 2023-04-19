const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/userModel');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Get Current Booked Tour
  const tour = await Tour.findById(req.params.tourId);
  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `https://${req.get('host')}/my-tours`,
    cancel_url: `https://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${
                tour.imageCover
              }`,
            ],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
  });
  // Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// Make new Booking for User via Stripe Session
const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.find({ email: session.customer_email })).id;
  const price = session.amount_total / 100;
  await Booking.create({ tour, user, price });
};

// Stripe Webhook - Checkout Session Completed fn
exports.webhookCheckout = (req, res, next) => {
  // 1. Get STRIPE SIGNATURE
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    // 2. CONSTRUCT EVENT
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SIGNATURE
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // 3. VERIFY EVENT
  if (event.type === 'checkout.session.completed') {
    // 4. CREATE BOOKING
    createBookingCheckout(event.data.object);

    res.status(200).json({ received: true });
  }
};

exports.getBooking = factory.getOne(Booking);

exports.getAllBookings = factory.getAll(Booking);

exports.createBooking = factory.createOne(Booking);

exports.updateBooking = factory.updateOne(Booking);

exports.deleteBooking = factory.deleteOne(Booking);
