const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "Your booking was successful. Please check your email for a confirmation. If your booking doesn't show up in your list, pleae come back later!";

  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  //  1. Get tour data from collection
  const tours = await Tour.find();
  // 2. Build template
  // 3. Render the template using tour data
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getLogin = catchAsync(async (req, res, next) => {
  // 3. Render the template
  res.status(200).render('login', {
    title: 'User Account Login',
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1. Get the data for requested tour including review and guides
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }
  // 2. Build template

  // 3. Render the template using tour data
  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1. Find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  // 2. Find tours with returned IDs
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  if (tours.length === 0)
    return next(
      new AppError('No tours booked yet. Kindly book tours first.', 400)
    );

  res.status(200).render('overview', {
    title: 'My tours',
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidtors: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser,
  });
});
