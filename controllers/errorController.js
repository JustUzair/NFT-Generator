const AppError = require("../utils/appErrors");
/*
  |-------------------------------------------------------------------------|
  |                     Handle Type Casting Errors                          |
  |    for ex: we have a route => GET /art/:artID                           |
  |    we call it like => GET /art/www                                      |
  |    www is not a valid ObjectID in mongoDB hence throws validation error | 
  |-------------------------------------------------------------------------|
*/
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
/*
  |-------------------------------------------------------------------------|
  |                     Handle Duplicate Fields Errors                      |
  |   Error Structure:                                                      |
  |      {                                                                  |
  |          "code": 11000,                                                 |
  |          "index": 0,                                                    |
  |          "errmsg": "E11000 duplicate key error collection...",          |
  |              "op": {                                                    |
  |                  "name": "Tuesday",                                     |
  |                  "_id": "57fd89638039872dccb2230b",                     |
  |                  "createdAt": "2016-10-12T00:52:51.702Z",               |
  |                  "__v": 0                                               |
  |              }                                                          |
  |      }                                                                  |  
  |-------------------------------------------------------------------------|
*/
const handleDuplicateFieldsDB = err => {
  // Regex to Get text between quotes =>   /(["'])(\\?.)*?\1/
  // Above regex returns array, where first element is the name of the duplicate field
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate Field Value : ${value}, Please use another value.`;
  return new AppError(message, 400);
};
/*
  |-------------------------------------------------------------------------|
  |                     Handle Mongoose Validation Error                    |
  |    for ex: in our case password must contain both upper and lowe case   |
  |    letters, thus when we try to add anything that doesn't match required|
  |    format, this type of error is thrown                                 |
  |-------------------------------------------------------------------------|
*/
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join(" ")}`;
  return new AppError(message, 400);
};
/*
  |-------------------------------------------------------------------------|
  |                     Handle Errors in Development mode                   |
  |                 Show maximum possible details to the dev                |
  |-------------------------------------------------------------------------|
*/
const sendDevError = (err, req, res) => {
  /*
  |-------------------------------------------------------------------------|
  |                          API ERROR HANDLER                              |
  |-------------------------------------------------------------------------|
*/
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  /*
  |-------------------------------------------------------------------------|
  |        RENDERED WEBSITE ERROR HANDLE AND RENDER Development Mode        |
  |-------------------------------------------------------------------------|
*/
  res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    statusCode: err.statusCode,
    msg: err.message,
  });
};

/*
  |-------------------------------------------------------------------------|
  |                     Handle Errors in Production mode                    |
  |                 Show minimum possible details to the user               |
  |-------------------------------------------------------------------------|
*/
const sendProductionError = (err, req, res) => {
  /*
  |-------------------------------------------------------------------------|
  |                          API ERROR HANDLER                              |
  |-------------------------------------------------------------------------|
*/
  if (req.originalUrl.startsWith("/api")) {
    //1) Operational, trusted error: send message to client (ex : duplicate values in MongoDB)
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

  /*
  |-------------------------------------------------------------------------|
  |                  RENDERED WEBSITE ERROR HANDLE AND RENDER               |
  |-------------------------------------------------------------------------|
*/
  if (err.isOperational) {
    //Operational Error, in rendered page
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong",
      statusCode: err.statusCode,
      msg: err.message,
    });
  }
  // Programming or other unknown error: don't leak error details

  // Send generic message : rendering error.pug
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

/*
  |-------------------------------------------------------------------------|
  |                  GlOBAL ERROR HANDLING MIDDLEWARE                       |
  |-------------------------------------------------------------------------|
*/
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
