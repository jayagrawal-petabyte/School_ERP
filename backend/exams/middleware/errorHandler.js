const errorHandler = (err, req, res, next) => {
  console.error('[ErrorHandler] Error caught:', {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    details: err.details,
  });
  console.error('[ErrorHandler] Stack trace:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const details = err.details || {};

  const response = {
    success: false,
    message,
    details,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
