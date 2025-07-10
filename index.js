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

const port = parseInt(process.env.PORT) || 8000;

const server = app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on Port " + port);
  } else {
    console.log("Error :" + error);
  }
});

// Handle EADDRINUSE error
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(
      `Port ${port} is already in use. Please kill the process using this port and try again.`
    );
    console.log(`You can kill it using: kill -9 $(lsof -ti:${port})`);
    process.exit(1);
  } else {
    console.log("Error :" + err);
  }
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nReceived SIGINT. Gracefully shutting down server...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\nReceived SIGTERM. Gracefully shutting down server...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nReceived SIGINT. Gracefully shutting down server...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\nReceived SIGTERM. Gracefully shutting down server...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});
