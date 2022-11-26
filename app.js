const express = require("express");
const helmet = require("helmet");
const path = require("path");
const morgan = require("morgan");
const AppError = require("./utils/appErrors");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const bodyParser = require("body-parser");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");

const userRouter = require("./routes/userRoutes");
const artRouter = require("./routes/artRoutes");
const viewRouter = require("./routes/viewRoutes");

const globalErrorHandler = require("./controllers/errorController");
const app = express();
app.enable("trust proxy");
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(cors());
app.options("*", cors());
//Serving static files
app.use(express.static(`${__dirname}/public`));

//Set security HTTP headers

/*---------------------------------------------------------------------------------------------------------------|
 |  Helmet is a JS module that helps in securing HTTP headers                                                    |  
 |  Helmet sets the the Cross-Origin-Embedder-Policy HTTP response header to 'require-corp'                      |
 |  <img src="https://example.com/image.png"> ====> won't work, until example.com explicitly allows it           |
 |                                                                                                               |
 |  crossOriginResourcePolicy:true ======> To allow other websites, and apps to request service from our server  |
 |                                                                                                               |
 |  contentSecurityPolicy is the name of a HTTP response header that modern browsers use to enhance              |
 |  the security of the document (or web page). The Content-Security-Policy header allows you to restrict        |
 |  how resources such as JavaScript, CSS, or pretty much anything that the browser loads.                       |
 |                                                                                                               |
-|----- ---------------------------------------------------------------------------------------------------------|
*/
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: {
      allowOrigins: ["*"],
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["*"], // default policy for fetching resources such as JavaScript, Images, CSS, Fonts etc
        "img-src": ["* data: 'unsafe-eval' 'unsafe-inline' blob:"], //defines valid source of images
        scriptSrc: ["* data: 'unsafe-eval' 'unsafe-inline' blob:"], // defines valid source of scripts
      },
    },
  })
);

//Development Logging - logs the requests made to the server
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

/*|-------------------------------------------------------------------------|
  |                 Rate Limiting for individual IPs                        |
  |-------------------------------------------------------------------------|
*/
const limiter = rateLimit({
  max: 100, // Maximum 100 requests per Hour
  windowMS: 60 * 60 * 1000, // 1 Hour
  message: "Too many requests from this IP, please try again in an hour",
});

app.use("/api", limiter); // all the routes that starts with  /api will have the rate limiting.

/*|--------------------------------------------------------------------------------|
  |             Body Parser, reads data from body into req.body                    |
  |  The “extended” syntax allows for rich objects and arrays to be encoded        |
  |  into the URL-encoded format, allowing for a JSON-like experience              |
  |  urlencoded is used to parse headers where content-type                        |
  |  is set to 'application/x-www-form-urlencoded'                                 |
  |--------------------------------------------------------------------------------|
*/
app.use(
  express.json({
    limit: "10kb", //req.body can contain only
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

/*|-------------------------------------------------------------------------------------|
  |   Cookie-parser middleware will parse the Cookie header on the request and expose   | 
  |   the cookie data as the property req.cookies and, if a secret was provided,        |
  |   as the property req.signedCookies. These properties are name value pairs of the   |
  |   cookie name to cookie value.                                                      |
  |-------------------------------------------------------------------------------------|
*/
app.use(cookieParser());

// Data Sanitization against NoSQL query injection

/*|--------------------------------------------------------------------------------------------------------|
  |  Object keys starting with a $ or containing a . are reserved for use by MongoDB as operators.         |
  |  Without this sanitization, malicious users could send an object containing a $ operator,              |
  |  or including a ., which could change the context of a database operation                              |
  |                                                                                                        |
  |  This middleware sanitizes the received data, and remove any offending keys, or replace the characters |
  |  with a 'safe' one.                                                                                    |
  |--------------------------------------------------------------------------------------------------------|
*/
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);
app.use(compression());

//All the routes above can be bind into one using express.Router() middleware
// ------------Multiple Routers
app.use("/", viewRouter);
app.use("/api/v1/arts", artRouter);
app.use("/api/v1/users", userRouter);

// Handling the unhandled routes
app.all("*", (req, res, next) => {
  next(
    new AppError(`URL ${req.originalUrl} does not exist on this server !!!`)
  );
});
//------------------------------------

//Global Error Handling Middleware
app.use(globalErrorHandler);
module.exports = app;
