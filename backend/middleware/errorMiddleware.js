const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack
  
    res.status(500).json({
      message: 'Something went wrong!',
      error: err.message,
    });
  };
  
  module.exports = errorMiddleware;
  