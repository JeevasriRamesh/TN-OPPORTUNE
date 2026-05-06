/**
 * bulkVerifySchemes.js
 * One-time script: mark active schemes as official when link contains .gov.in.
 * Sets sourceUrl = link, lastVerifiedAt = now, status = "active" for those schemes only.
 * Run from backend folder: node scripts/bulkVerifySchemes.js
 */

require("dotenv").config();
const connectDB = require("../config/db");
const Scheme = require("../models/Scheme");

const run = async () => {
  try {
    await connectDB();

    const schemes = await Scheme.find({ status: "active" });
    let verified = 0;

    for (const scheme of schemes) {
      const link = scheme.link;
      if (
        link != null &&
        typeof link === "string" &&
        link.includes(".gov.in")
      ) {
        scheme.sourceUrl = scheme.link;
        scheme.lastVerifiedAt = new Date();
        scheme.status = "active";
        await scheme.save();
        verified += 1;
      }
    }

    console.log(`Verified ${verified} official government schemes`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

run();
