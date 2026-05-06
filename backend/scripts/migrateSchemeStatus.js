/**
 * migrateSchemeStatus.js
 * One-time migration: set status = "active" on all Scheme documents
 * that do not have a status field (legacy data before status was added).
 *
 * Run manually from backend folder: node scripts/migrateSchemeStatus.js
 * Safe and idempotent: only updates documents where status is missing.
 */

require("dotenv").config();
const connectDB = require("../config/db");
const Scheme = require("../models/Scheme");

const run = async () => {
  try {
    await connectDB();

    // Update only documents where status does NOT exist
    const result = await Scheme.updateMany(
      { status: { $exists: false } },
      { $set: { status: "active" } }
    );

    const updated = result.modifiedCount;
    console.log(`Migration complete: ${updated} schemes marked as active`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
};

run();
