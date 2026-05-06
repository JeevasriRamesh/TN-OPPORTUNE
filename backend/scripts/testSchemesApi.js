/**
 * testSchemesApi.js
 * Fetches GET /api/schemes and checks that isOfficial is returned correctly.
 * Run with backend server already running: node scripts/testSchemesApi.js
 */

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

const ILLAM_NAME = "Illam Thedi Kalvi";
const ILLAM_SOURCE_URL = "https://illamthedikalvi.tnschools.gov.in";

async function run() {
  try {
    const res = await fetch(`${BASE_URL}/api/schemes`);
    if (!res.ok) {
      console.error("❌ API returned", res.status, res.statusText);
      process.exit(1);
    }

    const schemes = await res.json();
    if (!Array.isArray(schemes)) {
      console.error("❌ Expected array of schemes");
      process.exit(1);
    }

    let passed = true;

    for (const s of schemes) {
      if (typeof s.isOfficial !== "boolean") {
        console.error("❌ Scheme missing or invalid isOfficial:", s.name);
        passed = false;
      }
    }

    const illam = schemes.find((s) => s.name === ILLAM_NAME);
    if (!illam) {
      console.warn("⚠️ Scheme not in response:", ILLAM_NAME, "(skipping Illam checks)");
    } else {
      if (illam.sourceUrl !== ILLAM_SOURCE_URL) {
        console.error("❌ Illam Thedi Kalvi sourceUrl mismatch:", illam.sourceUrl);
        passed = false;
      }
      if (illam.isOfficial !== true) {
        console.error("❌ Illam Thedi Kalvi expected isOfficial: true, got:", illam.isOfficial);
        passed = false;
      }
    }

    if (passed) {
      console.log("✅ testSchemesApi passed: isOfficial present, Illam Thedi Kalvi isOfficial: true");
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Request failed:", err.message);
    process.exit(1);
  }
}

run();
