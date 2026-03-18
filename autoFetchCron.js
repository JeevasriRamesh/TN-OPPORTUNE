/**
 * autoFetchCron.js
 * Runs daily to auto-detect new schemes and jobs from official .gov.in pages.
 * Inserts new items with autoFetched=true, verified=false (hidden until manually verified).
 * Does NOT delete or overwrite existing data.
 */

const cron = require("node-cron");
const { autoFetch } = require("../services/autoFetcher");

/**
 * Official sources: URL and type (scheme | job).
 * Job auto-fetch disabled until official sources are finalized
 */
const SOURCES = [
  { url: "https://www.tn.gov.in/schemes", type: "scheme" },
  // { url: "https://www.tnpsc.gov.in", type: "job" },
  // { url: "https://www.trb.tn.gov.in", type: "job" },
];

async function runAutoFetch() {
  console.log("[Cron] autoFetch job started");

  let totalDetected = 0;
  let totalInserted = 0;

  for (const { url, type } of SOURCES) {
    try {
      const { detected, inserted } = await autoFetch(url, type);
      totalDetected += detected;
      totalInserted += inserted;
      console.log(
        `[Cron] ${url} (${type}): detected=${detected}, inserted=${inserted}`
      );
    } catch (error) {
      console.error(`[Cron] Error auto-fetching ${url}:`, error.message);
    }
  }

  console.log(
    `[Cron] autoFetch completed: ${totalDetected} new items detected, ${totalInserted} inserted`
  );
}

function startAutoFetchCron() {
  console.log(
    "[Cron] Initializing autoFetch daily job (runs at 01:00 every day)..."
  );

  const job = cron.schedule(
    "0 1 * * *",
    async () => {
      try {
        await runAutoFetch();
      } catch (error) {
        console.error("[Cron] autoFetch job failed:", error.message);
      }
    },
    { scheduled: true }
  );

  return job;
}

module.exports = {
  startAutoFetchCron,
  runAutoFetch,
};
