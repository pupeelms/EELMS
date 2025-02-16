/**
 * The errorMiddleware function logs the error stack and sends a JSON response with a generic error
 * message and the specific error message.
 */
const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack
  
    res.status(500).json({
      message: 'Something went wrong!',
      error: err.message,
    });
  };
  
  module.exports = errorMiddleware;
  