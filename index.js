require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./utils/swagger");
const logger = require("./utils/logger");

// Import middleware
const { errorHandler, notFound } = require("./middleware/errorHandler");
const {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  speedLimiter,
} = require("./middleware/rateLimiter");

// Import routes
const router = require("./routes/route");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Database Connection
require("./db");

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Compression middleware
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Rate limiting
app.use(generalLimiter);
app.use(speedLimiter);

// Static files
app.use("/uploads", express.static("uploads"));

// API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "E-Commerce API Documentation",
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes with rate limiting
app.use("/", router);

// Order routes with specific rate limiting
app.use("/orders", authLimiter, orderRoutes);

// Payment routes with specific rate limiting
app.use("/payments", authLimiter, paymentRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Express server running
const port = parseInt(process.env.PORT) || 8000;

const server = app.listen(port, (error) => {
  if (!error) {
    logger.info(`Server Running on Port ${port}`);
    logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    logger.info(`API Documentation: http://localhost:${port}/api-docs`);
  } else {
    logger.error(`Server startup error: ${error}`);
  }
});

// Handle EADDRINUSE error
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    logger.error(
      `Port ${port} is already in use. Please kill the process using this port and try again.`
    );
    logger.error(`You can kill it using: kill -9 $(lsof -ti:${port})`);
    process.exit(1);
  } else {
    logger.error(`Server error: ${err}`);
  }
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`\nReceived ${signal}. Gracefully shutting down server...`);
  server.close(() => {
    logger.info("Server closed.");
    mongoose.connection.close(false, () => {
      logger.info("MongoDB connection closed.");
      process.exit(0);
    });
  });
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${err}`);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err}`);
  server.close(() => {
    process.exit(1);
  });
});
