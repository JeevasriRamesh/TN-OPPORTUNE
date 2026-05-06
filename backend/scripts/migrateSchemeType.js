/**
 * migrateSchemeType.js
 * One-time migration: set type = "scheme" for all documents that do not have type.
 * Run from backend folder: node scripts/migrateSchemeType.js
 */

require("dotenv").config();
const connectDB = require("../config/db");
const Scheme = require("../models/Scheme");

const run = async () => {
  try {
    await connectDB();

    const result = await Scheme.updateMany(
      { type: { $exists: false } },
      { $set: { type: "scheme" } }
    );

    console.log("Migration complete: updated", result.modifiedCount, "documents with type = 'scheme'");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

run();
