/**
 * Scheme.js
 * Mongoose model for a government scheme or job entry.
 * Defines the structure of scheme documents stored in MongoDB.
 */

const mongoose = require("mongoose");

// Define the schema for a scheme / job
const schemeSchema = new mongoose.Schema(
  {
    // Name of the scheme or job
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Type: "scheme" or "job" (for Schemes | Jobs tabs)
    type: {
      type: String,
      enum: ["scheme", "job"],
      default: "scheme",
    },

    // Category (e.g., Education, Jobs, Health, etc.)
    category: {
      type: String,
      required: true,
      trim: true,
    },

    // Target age group (e.g., student, adult, senior, all)
    age: {
      type: String,
      required: true,
      trim: true,
    },

    // Target gender (e.g., male, female, all)
    gender: {
      type: String,
      required: true,
      trim: true,
    },

    // Minimum or required qualification (e.g., sslc, hsc, ug, pg, all)
    qualification: {
      type: String,
      required: true,
      trim: true,
    },

    // Income category (e.g., low, middle, high, all)
    income: {
      type: String,
      required: true,
      trim: true,
    },

    // Community / caste category (e.g., sc, st, bc, mbc, general, all)
    community: {
      type: String,
      required: true,
      trim: true,
    },

    // Short description of the scheme or job
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Benefits provided by the scheme or job (text description)
    benefits: {
      type: String,
      required: false,
      trim: true,
    },

    // Application deadline or status (e.g., specific date, Ongoing)
    deadline: {
      type: String,
      required: true,
      trim: true,
    },

    // Official link to apply or view more details
    link: {
      type: String,
      required: true,
      trim: true,
    },

    // Source URL where this scheme was found (typically an official government page)
    // Helps with verifying and updating the scheme details later.
    sourceUrl: {
      type: String,
      trim: true,
    },

    // Current lifecycle status of the scheme:
    //  - "active": scheme is currently valid / accepting applications
    //  - "expired": scheme has ended or is no longer valid
    // Default is "active" to remain compatible with existing data.
    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },

    // Timestamp indicating when this scheme was last verified
    // against its official source (for future auto-update logic).
    lastVerifiedAt: {
      type: Date,
    },

    // True if this entry was auto-detected by the auto-fetcher (not manually added).
    autoFetched: {
      type: Boolean,
      default: false,
    },

    // True only after manual review; auto-fetched items start as false and stay hidden until verified.
    verified: {
      type: Boolean,
      default: false,
    },

    // Approval history
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: String,
      default: null,
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Export the model so it can be used in other parts of the app
module.exports = mongoose.model("Scheme", schemeSchema);

