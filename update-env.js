const fs = require("fs");
const path = require("path");

// Read the current .env file
const envPath = path.join(__dirname, ".env");
const envContent = fs.readFileSync(envPath, "utf8");

// Update the environment variables
const updatedContent = envContent
  .replace("MONGO_URI=", "MONGODB_URI=")
  .replace("CLOUD_NAME=", "CLOUDINARY_CLOUD_NAME=")
  .replace("CLOUD_KEY=", "CLOUDINARY_API_KEY=")
  .replace("CLOUD_KEY_SECRET=", "CLOUDINARY_API_SECRET=");

// Add new variables if they don't exist
const newVars = `
NODE_ENV=development
LOG_LEVEL=info
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
`;

// Write the updated content
fs.writeFileSync(envPath, updatedContent + newVars);

console.log("✅ .env file updated successfully!");
console.log("Updated variables:");
console.log("- MONGO_URI → MONGODB_URI");
console.log("- CLOUD_NAME → CLOUDINARY_CLOUD_NAME");
console.log("- CLOUD_KEY → CLOUDINARY_API_KEY");
console.log("- CLOUD_KEY_SECRET → CLOUDINARY_API_SECRET");
console.log("- Added NODE_ENV, LOG_LEVEL, and ALLOWED_ORIGINS");
