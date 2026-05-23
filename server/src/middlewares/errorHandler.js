// middlewares/errorHandler.js — Global error handling middleware
// Same pattern as DevTinder's bottom-of-app.js error handlers

// 404 - Route not found handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: "Route not found",
    error: `Cannot ${req.method} ${req.originalUrl}`,
  });
};

// 500 - Global error handler
const globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong on the server",
    error: err.message,
  });
};

module.exports = { notFoundHandler, globalErrorHandler };
