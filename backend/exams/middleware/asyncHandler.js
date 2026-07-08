const asyncHandler = (handler) => (req, res, next) => {
  console.log('[AsyncHandler] Executing handler for route:', req.path, 'Method:', req.method);
  Promise.resolve(handler(req, res, next)).catch((error) => {
    console.error('[AsyncHandler] Error in handler:', error);
    next(error);
  });
};

module.exports = asyncHandler;
