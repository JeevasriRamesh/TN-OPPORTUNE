/**
 * expireSchemes.js
 * Manually-run maintenance script to mark schemes as "expired"
 * when their deadline has passed.
 *
 * Usage (from backend folder):
 *   node scripts/expireSchemes.js
 */

// Load environment variables such as MONGODB_URI
require("dotenv").config();

const connectDB = require("../config/db");
const Scheme = require("../models/Scheme");

/**
 * Tries to safely parse a deadline string into a Date object.
 * Returns a Date if parsing is successful, or null if invalid.
 */
function parseDeadline(deadline) {
  if (!deadline || typeof deadline !== "string") {
    return null;
  }

  // Ignore clearly non-date values like "As per notification", etc.
  // (For now we only attempt to parse strings that look like dates.)
  const trimmed = deadline.trim();

  // Basic heuristic: if it contains digits, attempt to parse.
  if (!/\d/.test(trimmed)) {
    return null;
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Core logic to find schemes whose deadlines have passed
 * and mark them as "expired".
 *
 * This function is exported so it can be reused by both:
 *  - the manual script runner (node scripts/expireSchemes.js)
 *  - the scheduled cron job
 *
 * NOTE: This function does NOT call process.exit(),
 * so it is safe to use inside a long-running server process.
 */
const expireSchemes = async () => {
  // Connect to MongoDB using the existing helper
  await connectDB();

  // Find all active schemes whose deadline is not "Ongoing"
  const activeSchemes = await Scheme.find({
    status: "active",
    deadline: { $ne: "Ongoing" },
  });

  console.log(`🔎 Checking ${activeSchemes.length} active schemes with non-"Ongoing" deadlines...`);

  const now = new Date();
  let expiredCount = 0;

  for (const scheme of activeSchemes) {
    const deadlineDate = parseDeadline(scheme.deadline);

    // If we cannot parse the deadline safely, skip this scheme
    if (!deadlineDate) {
      console.log(`⚠️  Skipping scheme "${scheme.name}" due to unparseable deadline: "${scheme.deadline}"`);
      continue;
    }

    // If the deadline has passed, mark scheme as expired
    if (now > deadlineDate) {
      scheme.status = "expired";
      scheme.lastVerifiedAt = now;
      await scheme.save();
      expiredCount += 1;
      console.log(`✅ Marked scheme as expired: "${scheme.name}" (deadline: ${scheme.deadline})`);
    }
  }

  console.log(`📊 Total schemes checked: ${activeSchemes.length}`);
  console.log(`📉 Schemes marked as expired: ${expiredCount}`);
  console.log("🏁 expireSchemes run completed.");
};

module.exports = {
  expireSchemes,
};

// If this file is executed directly via Node (CLI),
// run the expireSchemes task once and then exit with an appropriate code.
if (require.main === module) {
  expireSchemes()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error while expiring schemes:", error.message);
      process.exit(1);
    });
}

