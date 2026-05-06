/**
 * seedSchemes.js
 * Seeds MongoDB with sample Tamil Nadu schemes/jobs data.
 * Run manually with: `node scripts/seedSchemes.js`
 */

require("dotenv").config();
const connectDB = require("../config/db");
const Scheme = require("../models/Scheme");

// Sample schemes/jobs (5–8 items) similar to Phase 1 data
const sampleSchemes = [
  {
    name: "Pudhumai Penn Scheme",
    category: "Education",
    age: "student",
    gender: "female",
    qualification: "hsc",
    income: "low",
    community: "all",
    description: "₹1,000 monthly scholarship for girl students pursuing higher education.",
    benefits: "Financial support till UG completion.",
    deadline: "Ongoing",
    link: "https://www.tn.gov.in/",
  },
  {
    name: "Kalaignar Magalir Urimai Thogai",
    category: "Women",
    age: "adult",
    gender: "female",
    qualification: "all",
    income: "low",
    community: "all",
    description: "₹1,000 monthly aid to eligible women heads of families.",
    benefits: "Direct monthly transfer.",
    deadline: "Ongoing",
    link: "https://kmut.tn.gov.in",
  },
  {
    name: "Chief Minister Health Insurance Scheme",
    category: "Health",
    age: "all",
    gender: "all",
    qualification: "all",
    income: "all",
    community: "all",
    description: "Free health insurance for poor families.",
    benefits: "Cashless hospital treatment in empanelled hospitals.",
    deadline: "Ongoing",
    link: "https://www.cmchistn.com/",
  },
  {
    name: "TNPSC Recruitment Portal",
    category: "Jobs",
    age: "adult",
    gender: "all",
    qualification: "ug",
    income: "all",
    community: "all",
    description: "Apply for Group I, II, IV, VAO, etc.",
    benefits: "Permanent state govt jobs.",
    deadline: "As per notification",
    link: "https://apply.tnpscexams.in",
  },
  {
    name: "Illam Thedi Kalvi",
    category: "Education",
    age: "all",
    gender: "all",
    qualification: "all",
    income: "all",
    community: "all",
    description: "Doorstep education by volunteers to bridge learning gaps.",
    benefits: "Improved learning outcomes.",
    deadline: "Ongoing",
    link: "https://illamthedikalvi.tnschools.gov.in",
  },
  {
    name: "Micro Irrigation Subsidy",
    category: "Agriculture",
    age: "adult",
    gender: "all",
    qualification: "all",
    income: "all",
    community: "all",
    description: "Subsidy for drip/sprinkler irrigation for small farmers.",
    benefits: "Efficient irrigation methods.",
    deadline: "Ongoing",
    link: "https://www.tn.gov.in/",
  },
  {
    name: "Pongal Gift Scheme",
    category: "Welfare",
    age: "all",
    gender: "all",
    qualification: "all",
    income: "all",
    community: "all",
    description: "Seasonal welfare assistance during Pongal festival.",
    benefits: "Gift items/financial aid.",
    deadline: "Annual before Pongal",
    link: "https://www.tn.gov.in/",
  },
];

/**
 * Connects to MongoDB, clears existing schemes (to avoid duplicates),
 * inserts sample schemes, then exits.
 */
const seed = async () => {
  try {
    await connectDB();

    // Optional: clear existing data to keep seed consistent
    await Scheme.deleteMany({});

    await Scheme.insertMany(sampleSchemes);
    console.log(`✅ Seeded ${sampleSchemes.length} schemes/jobs`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seed();

