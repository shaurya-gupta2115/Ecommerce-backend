const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { AppError } = require("./errorHandler");
const logger = require("../utils/logger");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new AppError("Only image files are allowed!", 400), false);
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Single file upload
const uploadSingle = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).single("image");

// Multiple files upload
const uploadMultiple = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5, // Maximum 5 files
  },
}).array("images", 5);

// Product gallery upload
const uploadGallery = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10, // Maximum 10 files for gallery
  },
}).array("gallery", 10);

// Profile picture upload
const uploadProfile = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for profile pictures
  },
}).single("profile");

// Middleware wrapper for single file upload
const handleSingleUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new AppError("File too large. Maximum size is 5MB.", 400));
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return next(new AppError("Unexpected file field.", 400));
      }
      return next(new AppError(err.message, 400));
    } else if (err) {
      return next(err);
    }

    // Log successful upload
    if (req.file) {
      logger.info(
        `File uploaded: ${req.file.filename} by user: ${
          req.user?.id || "anonymous"
        }`
      );
    }

    next();
  });
};

// Middleware wrapper for multiple files upload
const handleMultipleUpload = (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          new AppError(
            "One or more files too large. Maximum size is 5MB per file.",
            400
          )
        );
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return next(
          new AppError("Too many files. Maximum 5 files allowed.", 400)
        );
      }
      return next(new AppError(err.message, 400));
    } else if (err) {
      return next(err);
    }

    // Log successful upload
    if (req.files && req.files.length > 0) {
      logger.info(
        `${req.files.length} files uploaded by user: ${
          req.user?.id || "anonymous"
        }`
      );
    }

    next();
  });
};

// Middleware wrapper for gallery upload
const handleGalleryUpload = (req, res, next) => {
  uploadGallery(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          new AppError(
            "One or more files too large. Maximum size is 10MB per file.",
            400
          )
        );
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return next(
          new AppError(
            "Too many files. Maximum 10 files allowed for gallery.",
            400
          )
        );
      }
      return next(new AppError(err.message, 400));
    } else if (err) {
      return next(err);
    }

    // Log successful upload
    if (req.files && req.files.length > 0) {
      logger.info(
        `Gallery upload: ${req.files.length} files by user: ${
          req.user?.id || "anonymous"
        }`
      );
    }

    next();
  });
};

// Middleware wrapper for profile upload
const handleProfileUpload = (req, res, next) => {
  uploadProfile(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          new AppError(
            "File too large. Maximum size is 2MB for profile pictures.",
            400
          )
        );
      }
      return next(new AppError(err.message, 400));
    } else if (err) {
      return next(err);
    }

    // Log successful upload
    if (req.file) {
      logger.info(
        `Profile picture uploaded: ${req.file.filename} by user: ${
          req.user?.id || "anonymous"
        }`
      );
    }

    next();
  });
};

// Clean up uploaded files on error
const cleanupFiles = (files) => {
  if (!files) return;

  const fileArray = Array.isArray(files) ? files : [files];

  fileArray.forEach((file) => {
    if (file && file.path) {
      fs.unlink(file.path, (err) => {
        if (err) {
          logger.error(`Error deleting file ${file.path}: ${err.message}`);
        } else {
          logger.info(`File deleted: ${file.path}`);
        }
      });
    }
  });
};

module.exports = {
  handleSingleUpload,
  handleMultipleUpload,
  handleGalleryUpload,
  handleProfileUpload,
  cleanupFiles,
  uploadsDir,
};
