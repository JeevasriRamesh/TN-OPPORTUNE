/**
 * seedJobs.js
 * Seeds MongoDB with official Tamil Nadu government job entries.
 * Run manually with: node scripts/seedJobs.js
 * (from backend directory)
 */

require("dotenv").config();
const connectDB = require("../config/db");
const Scheme = require("../models/Scheme");

const JOBS = [
  {
    name: "TNPSC Group Examinations",
    type: "job",
    category: "Jobs",
    age: "adult",
    gender: "all",
    qualification: "ug",
    income: "all",
    community: "all",
    description:
      "Tamil Nadu Public Service Commission recruitment for Group I, II, IV and VAO posts.",
    benefits: "Permanent Tamil Nadu government jobs.",
    deadline: "As per notification",
    link: "https://www.tnpsc.gov.in",
    sourceUrl: "https://www.tnpsc.gov.in",
    status: "active",
    lastVerifiedAt: new Date(),
  },
  {
    name: "TRB Teacher Recruitment",
    type: "job",
    category: "Jobs",
    age: "adult",
    gender: "all",
    qualification: "ug",
    income: "all",
    community: "all",
    description:
      "Teacher recruitment conducted by Teachers Recruitment Board, Tamil Nadu.",
    benefits: "Government teaching jobs in Tamil Nadu.",
    deadline: "As per notification",
    link: "https://www.trb.tn.gov.in",
    sourceUrl: "https://www.trb.tn.gov.in",
    status: "active",
    lastVerifiedAt: new Date(),
  },
];

const seed = async () => {
  try {
    await connectDB();

    for (const job of JOBS) {
      const existing = await Scheme.findOne({
        name: job.name,
        type: "job",
      });

      const shortName = job.name.startsWith("TNPSC") ? "TNPSC" : "TRB";
      if (existing) {
        console.log(`${shortName} job already exists`);
      } else {
        await Scheme.create(job);
        console.log(`${shortName} job inserted`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seed();
