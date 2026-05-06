/**
 * seedUser.js
 * Development helper script to insert a single demo user into MongoDB.
 * Run manually from the backend folder with:
 *   node scripts/seedUser.js
 */

// Load environment variables (e.g., MONGODB_URI)
require("dotenv").config();

const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

// Demo user details
const DEMO_USERNAME = "demoUser";
const DEMO_EMAIL = "demo@gmail.com";
const DEMO_PASSWORD_PLAIN = "123456";

const seedDemoUser = async () => {
  try {
    // Connect to MongoDB using the existing connection helper
    await connectDB();

    // Check if the demo user already exists (by email)
    const existing = await User.findOne({ email: DEMO_EMAIL });
    if (existing) {
      console.log("ℹ️ Demo user already exists:", {
        id: existing._id.toString(),
        username: existing.username,
        email: existing.email,
      });
      process.exit(0);
    }

    // Hash the plain-text password using bcryptjs
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD_PLAIN, 10);

    // Create the new demo user document
    const user = await User.create({
      username: DEMO_USERNAME,
      email: DEMO_EMAIL,
      password: hashedPassword,
      role: "user", // explicitly set role to "user"
    });

    console.log("✅ Demo user created successfully:", {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed demo user:", error.message);
    process.exit(1);
  }
};

seedDemoUser();

