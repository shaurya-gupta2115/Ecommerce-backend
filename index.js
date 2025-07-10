require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
const router = require("./routes/route");

// Database Connection

require("./db");

// Middlewares

app.use(express.json());
app.use(cors());

// Routes

app.use("/", router);

// express server running

const port = process.env.PORT;

app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on Port " + port);
  } else {
    console.log("Error :" + error);
  }
});