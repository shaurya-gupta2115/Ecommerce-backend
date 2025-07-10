const mongoose = require("mongoose");
require("dotenv").config();

// DataBase connection with MangoDB

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((error) => {
    console.log("Error: " + error);
  });
