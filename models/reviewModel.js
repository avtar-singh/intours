const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review cannot be empty.'],
      minlength: [5, 'A review must be at least 5 characters.'],
    },
    rating: {
      type: Number,
      default: 1,
      min: [1, 'Rating must be least 1'],
      max: [5, 'Rating must not be more than 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { viruals: true },
  }
);

// Disallow duplicate reviews from same user on unique tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
// If compound doesn't work, add single index then compound
// then add property and clean from DB
// reviewSchema.index({ tour: 1 });

// Middleware - Query
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

reviewSchema.statics.calculateAvgRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  // Update Calculated Rating for the Tour
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // this points to current review
  // this.constructor points to model
  this.constructor.calculateAvgRating(this.tour);
});

// Avg Rating - On Update and Delete Fn
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.virtualReview = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.virtualReview.constructor.calculateAvgRating(
    this.virtualReview.tour
  );
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
