//entry point
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cluster = require("cluster");
const os = require("os");
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

const app = require("./app");
const port = process.env.PORT || 3000;

/*
    |----------------------------------------------------------|
    | Added Multi-Threading feature to the existing application|
    |----------------------------------------------------------|
*/
if (cluster.isMaster) {
  let numCPUs = os.cpus().length;
  //   console.log(`Num of CPUS : ${numCPUs}`);

  for (let i = 0; i < numCPUs; i++) cluster.fork();
  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `Worker ${worker.process.pid} died.\nForking another worker in place of it.`
    );

    cluster.fork();
  });
} else {
  /*
  |--------------------------------------------------------|
  |  We pass the useNewUrlParser: true                     |
  |  useCreateIndex: true                                  |
  |  useFindAndModify: true                                |
  |  useUnifiedTopology: true, etc                         |
  |  to mongoose.connect() to avoid the DeprecationWarning.|
  |--------------------------------------------------------|
*/
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
  /*
    |-------------------------------------------------------------------------|
    |Listen for requests on port number indicated by env variable PORT or 3000|
    |-------------------------------------------------------------------------|
    
*/
  const server = app.listen(port, () => {
    console.log(`App running on port ${port}`);
  });
}

/*
  |---------------------------------------------------------------------------------------|
  |   The 'unhandledRejection' event is useful for detecting and keeping track of promises|
  |   that were rejected whose rejections have not yet been handled.                      |
  |---------------------------------------------------------------------------------------|
*/
process.on("unhandledRejection", err => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

/*  
    |----------------------------------------------------------------------|
    |   SIGTERM is a signal that is sent to request the process terminates |
    |   that were rejected whose rejections have not yet been handled.     |  
    |   In other words, it is used for graceful shutdown of server.        |
    |----------------------------------------------------------------------|
*/
process.on("SIGTERM", () => {
  // SIGTERM - signal fired when Heroku dynos restart
  console.log("SIGTERM RECEIVED! Shutting Down gracefully!");
  server.close(() => {
    console.log("Process Terminated");
  });
});
