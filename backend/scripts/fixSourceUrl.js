/**
 * fixSourceUrl.js
 * One-time script to set sourceUrl, lastVerifiedAt, and status for "Illam Thedi Kalvi".
 * Run from backend folder: node scripts/fixSourceUrl.js
 */

require("dotenv").config();
const connectDB = require("../config/db");
const Scheme = require("../models/Scheme");

const run = async () => {
  try {
    await connectDB();

    const scheme = await Scheme.findOne({ name: "Illam Thedi Kalvi" });
    if (!scheme) {
      console.error("Scheme not found: Illam Thedi Kalvi");
      process.exit(1);
    }

    scheme.sourceUrl = "https://illamthedikalvi.tnschools.gov.in";
    scheme.lastVerifiedAt = new Date();
    scheme.status = "active";
    await scheme.save();

    console.log("sourceUrl fixed for Illam Thedi Kalvi");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

run();
