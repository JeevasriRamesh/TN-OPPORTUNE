/**
 * User.js
 * Mongoose model for application users.
 * Stores login details, role, and applied schemes for each user.
 */

const mongoose = require("mongoose");

// Define the schema for a user
const userSchema = new mongoose.Schema(
  {
    // Unique username chosen by the user
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    // Email address for the user (can be used for login or contact)
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },

    // Hashed password for secure authentication (plain text should never be stored)
    password: {
      type: String,
      required: true,
    },

    // Role of the user: "user" for normal users, "admin" for administrators
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // List of schemes the user has applied for (references Scheme documents)
    appliedSchemes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Scheme",
      },
    ],

    // User profile details used for personalised eligibility matching
    profile: {
      age: { type: Number, default: null }, // numeric age (e.g., 20)
      gender: { type: String, trim: true, default: "" }, // male|female|other
      qualification: { type: String, trim: true, default: "" }, // sslc|hsc|ug|pg|...
      income: { type: String, trim: true, default: "" }, // low|middle|high
      community: { type: String, trim: true, default: "" }, // sc|st|bc|mbc|general
      category: { type: String, trim: true, default: "" }, // optional user category (if collected)
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Export the model so it can be used in other parts of the app
module.exports = mongoose.model("User", userSchema);

