/**
 * expireSchemesCron.js
 * Schedules a daily job to mark expired schemes using node-cron.
 *
 * This module wires the existing expireSchemes() logic (from scripts/expireSchemes.js)
 * into a cron job that runs once per day.
 */

const cron = require("node-cron");
const { expireSchemes } = require("../scripts/expireSchemes");

/**
 * Starts the cron job that checks and expires schemes every day at midnight
 * server time (00:00).
 *
 * The schedule string "0 0 * * *" follows standard cron syntax:
 *   minute hour day-of-month month day-of-week
 */
function startExpireSchemesCron() {
  console.log("[Cron] Initializing expireSchemes daily job (runs at 00:00 every day)...");

  const job = cron.schedule(
    "0 0 * * *",
    async () => {
      console.log("[Cron] expireSchemes job started");
      try {
        await expireSchemes();
        console.log("[Cron] expireSchemes job finished successfully");
      } catch (error) {
        console.error("[Cron] expireSchemes job failed:", error.message);
      }
    },
    {
      scheduled: true, // start immediately
    }
  );

  return job;
}

module.exports = {
  startExpireSchemesCron,
};

