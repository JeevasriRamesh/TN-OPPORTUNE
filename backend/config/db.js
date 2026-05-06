/**
 * db.js
 * MongoDB database connection module.
 * Uses Mongoose to connect to MongoDB using the connection string from environment variables.
 */

const mongoose = require("mongoose");

/**
 * Connects to MongoDB database.
 * Reads the connection string from MONGODB_URI environment variable.
 * Logs success or error messages based on connection result.
 */
const connectDB = async () => {
  try {
    // Get MongoDB connection string from environment variable
    // Default to local MongoDB if not provided (for development)
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/tn-opportune";

    // Connect to MongoDB using Mongoose
    await mongoose.connect(mongoURI);

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    // Log error if connection fails
    console.error("❌ MongoDB connection error:", error.message);
    // Exit process if database connection fails
    process.exit(1);
  }
};

module.exports = connectDB;
