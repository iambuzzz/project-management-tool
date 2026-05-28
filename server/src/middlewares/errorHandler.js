const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: "Route not found",
    error: `Cannot ${req.method} ${req.originalUrl}`,
  });
};

const globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong on the server",
    error: err.message,
  });
};

module.exports = { notFoundHandler, globalErrorHandler };
