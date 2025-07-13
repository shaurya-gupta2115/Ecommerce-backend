const { body, validationResult } = require("express-validator");
const { AppError } = require("./errorHandler");

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return next(new AppError(errorMessages.join(", "), 400));
  }
  next();
};

// Product validation rules
const validateProduct = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters"),
  body("category")
    .trim()
    .isIn(["men", "women", "kids", "accessories"])
    .withMessage("Category must be one of: men, women, kids, accessories"),
  body("new_price")
    .isFloat({ min: 0 })
    .withMessage("New price must be a positive number"),
  body("old_price")
    .isFloat({ min: 0 })
    .withMessage("Old price must be a positive number"),
  handleValidationErrors,
];

// User registration validation
const validateSignup = [
  body("username")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Username must be between 2 and 50 characters")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("Username can only contain letters, numbers, and spaces"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  handleValidationErrors,
];

// User login validation
const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// Search validation
const validateSearch = [
  body("query")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search query must be between 1 and 100 characters"),
  body("category")
    .optional()
    .isIn(["men", "women", "kids", "accessories", ""])
    .withMessage("Invalid category"),
  body("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be a positive number"),
  body("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be a positive number"),
  handleValidationErrors,
];

// Payment validation
const validatePayment = [
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be a positive number"),
  body("currency")
    .optional()
    .isIn(["usd", "eur", "gbp"])
    .withMessage("Currency must be one of: usd, eur, gbp"),
  handleValidationErrors,
];

module.exports = {
  validateProduct,
  validateSignup,
  validateLogin,
  validateSearch,
  validatePayment,
  handleValidationErrors,
};
