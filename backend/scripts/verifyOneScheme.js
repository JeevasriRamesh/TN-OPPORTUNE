/**
 * verifyOneScheme.js
 * One-time script to mark a single scheme as an official verified government scheme.
 * Sets sourceUrl (.gov.in), lastVerifiedAt, and status so the frontend shows the green badge.
 *
 * Run manually from backend folder: node scripts/verifyOneScheme.js
 */

require("dotenv").config();
const connectDB = require("../config/db");
const Scheme = require("../models/Scheme");

const SCHEME_NAME = "Illam Thedi Kalvi";
const SOURCE_URL = "https://illamthedikalvi.tnschools.gov.in";

const run = async () => {
  try {
    await connectDB();

    const scheme = await Scheme.findOne({ name: SCHEME_NAME });
    if (!scheme) {
      console.error("❌ Scheme not found:", SCHEME_NAME);
      process.exit(1);
    }

    scheme.sourceUrl = SOURCE_URL;
    scheme.lastVerifiedAt = new Date();
    scheme.status = "active";
    await scheme.save();

    console.log("Scheme verified as official:", scheme.name);
    process.exit(0);
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  }
};

run();
