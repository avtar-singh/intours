const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};

const handleDuplicateNameDB = (err) => {
  const message = `Duplicate name: ${err.keyValue.name}. Please use another name.`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = () => {
  const message = 'Invalid token. Please log in again.';
  return new AppError(message, 401);
};

const handleJWTExpiredError = () => {
  const message = 'Token expired. Please log in again.';
  return new AppError(message, 401);
};

const sendErrorDev = (err, req, res) => {
  // 1. API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // 2. Frontend
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // 1. API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational - trusted errors - send to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.cloneMessage,
      });
    }
    // B) Programming or other unknown errors: don't leak error details
    // 1. Log Error
    console.log(`ERROR ${err}`);
    // 2. Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
  // 2. Frontend
  // A) Operational - trusted errors - send to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
  // B) Programming or other unknown errors: don't leak error details
  // 1. Log Error
  console.error(`ERROR ${err}`);
  // 2. Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.message = err.message || 'WHAT THE FUCK!';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    console.log(err);
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateNameDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
