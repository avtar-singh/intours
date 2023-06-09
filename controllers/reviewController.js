const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

// Fn: Set Tour ID and User ID
exports.setTourAndUserIds = (req, res, next) => {
  // Allow Nested route
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);

exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
