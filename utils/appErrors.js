class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Operational, trusted error: send message to client (ex: Duplicate value in MongoDB)
    /*
  |-------------------------------------------------------------------------|
  |  When calling Error.captureStackTrace(obj[, fun]) a formatted call stack| 
  |  is attached to obj including the line/frame where                      |
  |  captureStackTrace was called.                                          |
  |  When specifying fun all frames above and including fun are removed.    |
  |-------------------------------------------------------------------------|     
*/
    Error.captureStackTrace(this, this.constructor);
    //this.constructor (appError won't be displayed as one of the source in the error stack)
  }
}

module.exports = AppError;
