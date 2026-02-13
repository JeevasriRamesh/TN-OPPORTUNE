/**
 * server.js
 * Entry point for the TN OPPORTUNE backend.
 * Starts a minimal Express HTTP server and responds to confirm it is running.
 * Connects to MongoDB database on startup.
 * Registers read-only scheme routes under /api/schemes.
 */

// Load environment variables from .env file (if present)
require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");
const schemeRoutes = require("./routes/schemeRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { startExpireSchemesCron } = require("./cron/expireSchemesCron");
const { startFetchSchemesCron } = require("./cron/fetchSchemesCron");
const { startAutoFetchCron } = require("./cron/autoFetchCron");

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS so the frontend (running on a different origin) can call this API
app.use(cors());

// Parse incoming JSON request bodies for APIs like auth and others
app.use(express.json());

// Connect to MongoDB database
connectDB();

// Serve static frontend files (HTML, CSS, JS) from project root
app.use(express.static(path.join(__dirname, "..")));

// Start the daily cron job that automatically expires schemes
// based on their deadline. This can be disabled or adjusted
// later by changing the cron configuration in cron/expireSchemesCron.js.
startExpireSchemesCron();

// Start the daily cron job that fetches and verifies schemes from official gov URLs.
startFetchSchemesCron();

// Start the daily cron job that auto-detects new schemes/jobs (inserted as unverified).
startAutoFetchCron();

// Explicit frontend page routes
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "login.html"));
});

// Main portal alias: /dashboard should load the same main portal as index.html
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// Admin dashboard page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "admin.html"));
});

// Root route: redirect to /login
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Scheme APIs (read-only)
app.use("/api/schemes", schemeRoutes);

// Authentication APIs (register & login)
app.use("/api/auth", authRoutes);

// User-related APIs (e.g., applied schemes)
app.use("/api/users", userRoutes);

// Admin APIs (pending verification, approve)
app.use("/api/admin", adminRoutes);

// Start listening for requests
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
