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
// app.use(helmet());
// app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: {
      allowOrigins: ["*"],
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["*"],
        "img-src": ["'self'", "s3.amazonaws.com", "res.cloudinary.com"],
        scriptSrc: ["* data: 'unsafe-eval' 'unsafe-inline' blob:"],
      },
    },
  })
);

//Development Logging
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Rate Limiting for an IP
const limiter = rateLimit({
  max: 100,
  windowMS: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
});
app.use("/api", limiter); // all the routes that starts with  /api will have the rate limiting.

//Body Parser, reads data from body into req.body
app.use(
  express.json({
    limit: "10kb",
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
// Data Sanitization against NoSQL query injection
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
