class AppError extends Error {
  constructor(message, statusCode) {
    // Call 'ERROR CLASS' message
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.cloneMessage = message;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
