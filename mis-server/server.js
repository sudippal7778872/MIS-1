const env = require("dotenv");
const mongoose = require("mongoose");
const express = require("express");
const appError = require("./src/utils/appError");
const globalErrorHandler = require("./src/controller/error.controller");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const fileupload = require("express-fileupload");

env.config({ path: `${__dirname}/.env` });
const app = express();

// set Securing HTTP Header
app.use(helmet());

app.use(express.json());
const port = process.env.PORT || 7000;

// Rate Limit from same ip
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    " Too Many Request from this same IP. Please try again after 1 hour.",
});
app.use("/api", limiter);
app.use(cors());

// Data sanitization against NoSQL query injection.
app.use(mongoSanitize());

//Data sanitization against XSS attack
app.use(xss());

// environment polution
app.use(
  hpp({
    whitelist: ["duration"],
  })
);

app.get("/", (req, res) => {
  res.status(200).send("welcome to mis project");
});
app.use(fileupload());

//DB connection part

const Options = `*`;
app.options(Options, cors());

const defaultUrl = "/api/v1";

//import Router

// use Router

// now handle all other route for which does not exist
app.all("*", (req, res, next) => {
  //  after refactor
  next(new appError(`Can't able to find the ${req.originalUrl}`, 404));
});

// global error handeling
app.use(globalErrorHandler);

const server = app.listen(port, () => {
  console.log(`MIS project running on port ${port} `);
});

/*
how to globally handled all unhandled promise rejection. whenever this error is occure it
emit an event. we can easily use that event and handled that error. check below-
*/

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  //let close the server
  server.close(() => {
    process.exit(1);
  });
});

/*
uncaught error
*/
process.on("uncaughtException", (err) => {
  console.log("Uncaught exception- shutting Down");
  //let close the server
  server.close(() => {
    process.exit(1);
  });
});
// console.log(xyz) // here xyz is not define so uncaught error will occure
