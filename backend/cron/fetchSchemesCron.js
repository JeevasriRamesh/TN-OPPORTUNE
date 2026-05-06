/**
 * fetchSchemesCron.js
 * Schedules a daily job to fetch and verify schemes from official government URLs.
 * Uses the schemeFetcher service; runs at the same time as the expiry cron.
 */

const cron = require("node-cron");
const { fetchAndVerifySchemes } = require("../services/schemeFetcher");

/**
 * Official government scheme source URLs (.gov.in only).
 * Add or remove URLs here to control which pages are scraped daily.
 */
const SCHEME_SOURCE_URLS = [
  "https://www.tn.gov.in/schemes",
  "https://www.tn.gov.in/welfare",
];

/**
 * Runs the fetch-and-verify logic for all configured source URLs.
 * Errors per URL are caught and logged; one failure does not stop the rest.
 */
async function runFetchAndVerify() {
  console.log("[Cron] fetchSchemes job started");

  for (const sourceUrl of SCHEME_SOURCE_URLS) {
    try {
      console.log("[Cron] Fetching URL:", sourceUrl);
      const { created, updated } = await fetchAndVerifySchemes(sourceUrl);
      console.log("[Cron] Schemes created:", created, "updated:", updated, "for", sourceUrl);
    } catch (error) {
      console.error("[Cron] Error fetching", sourceUrl, ":", error.message);
      // Continue with next URL; do not crash the cron
    }
  }

  console.log("[Cron] fetchSchemes job completed");
}

/**
 * Starts the cron job that fetches schemes from official URLs every day at midnight
 * (same schedule as expireSchemes: "0 0 * * *").
 */
function startFetchSchemesCron() {
  console.log("[Cron] Initializing fetchSchemes daily job (runs at 00:00 every day)...");

  const job = cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        await runFetchAndVerify();
      } catch (error) {
        console.error("[Cron] fetchSchemes job failed:", error.message);
      }
    },
    { scheduled: true }
  );

  return job;
}

module.exports = {
  startFetchSchemesCron,
};
