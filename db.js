const mongoose = require("mongoose");
const logger = require("./utils/logger");
require("dotenv").config();

// Database connection with MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    console.log("Database Connected");
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    console.log("Error: " + error);
    process.exit(1);
  }
};

connectDB();
