const AppError = require('./AppError');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production mode
    if (err instanceof AppError) {
      // Operational, trusted error: send message to client
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        errorCode: err.errorCode
      });
    } else {
      // Programming or other unknown error: don't leak error details
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
      });
    }
  }
};

module.exports = errorHandler; 