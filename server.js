//entry point
const mongoose = require("mongoose");
const dotenv = require("dotenv");
process.on("uncaughtException", err => {
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({
  path: "./config.env",
});
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(con => {
    console.log("Database Connected!!");
  });

const app = require("./app");
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on("unhandledRejection", err => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  // SIGTERM - signal fired when Heroku dynos restart
  console.log("SIGTERM RECEIVED! Shutting Down gracefully!");
  server.close(() => {
    console.log("Process Terminated");
  });
});

// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const port = process.env.port || 3000;
// const app = require("./app");

// process.on("uncaughtException", err => {
//   console.log(err.name, err.message);
//   process.exit(1);
// });
// dotenv.config({
//   path: "./config.env",
// });

// const DB = process.env.DATABASE.replace(
//   "<PASSWORD>",
//   process.env.DATABASE_PASSWORD
// );
// mongoose
//   .connect(DB, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//     useUnifiedTopology: true,
//   })
//   .then(con => {
//     console.log("Database Connected!!");
//   });
// const server = app.listen(port, () => {
//   console.log(`App started at port ${port}`);
// });
