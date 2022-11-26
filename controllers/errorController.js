const AppError = require("../utils/appErrors");

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate Field Value : ${value}, Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join(" ")}`;
  return new AppError(message, 400);
};

const sendDevError = (err, req, res) => {
  // Errors generated within Api
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //Rendered Website
  res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    statusCode: err.statusCode,
    msg: err.message,
  });
};

// ------API ERROR HANDLER
const sendProductionError = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // Programming or other unknown error: don't leak error details
    console.error("ERROR 💥", err);

    // 1) Send generic message - don't leak error data to user
    return res.status(500).json({
      // Programming or other unknown error: don't leak error details
      status: "error",
      message: "Something went very wrong!",
    });
  }
  //------RENDERED WEBSITE ERROR HANDLE AND RENDER
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong",
      statusCode: err.statusCode,
      msg: err.message,
    });

    // Programming or other unknown error: don't leak error details
  }

  // 2) Send generic message : rendering error.pug
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    statusCode: err.statusCode,
    msg: "Please try again later",
  });
};

const handleJWTError = () =>
  new AppError("Invalid token, please login again", 401);

const handleJWTExpired = () =>
  new AppError("Your token has expired! Please log in again", 401);

module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendDevError(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    /* 1) Create deep copy of error object */
    let error = Object.assign(err);

    if (error.name === "CastError") error = handleCastErrorDB(error); // MongoDB Error generated while type casting
    if (error.code === 11000) error = handleDuplicateFieldsDB(error); // Error Code 11000, indicates a duplicate value
    if (error.name === "ValidationError")
      // Data received is not of the desired type / invalid data is passed
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError(); // This error occurs when invalid JWT token is received with the headers
    if (error.name === "TokenExpiredError") error = handleJWTExpired(); // This error occurs when duration of token has expired
    sendProductionError(error, req, res);
  }
};
