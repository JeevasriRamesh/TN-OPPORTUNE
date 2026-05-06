/**
 * server.js
 * Entry point for TN OPPORTUNE backend
 */

require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");

// DB
const connectDB = require("./config/db");

// Routes
const schemeRoutes = require("./routes/schemeRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Cron jobs
const { startExpireSchemesCron } = require("./cron/expireSchemesCron");
const { startFetchSchemesCron } = require("./cron/fetchSchemesCron");
const { startAutoFetchCron } = require("./cron/autoFetchCron");
const { startDeadlineReminderCron } = require("./cron/deadlineReminderCron");

const app = express();

// ✅ IMPORTANT: Render uses dynamic PORT
const PORT = process.env.PORT || 3001;

// ---------------- MIDDLEWARE ----------------
app.use(cors());
app.use(express.json());

// ---------------- DATABASE ----------------
connectDB();

// ---------------- STATIC FRONTEND ----------------
// (serves your HTML/CSS/JS)
app.use(express.static(path.join(__dirname, "..")));

// ---------------- CRON JOBS ----------------
// ⚠️ In production these will run continuously on Render server
startExpireSchemesCron();
startFetchSchemesCron();
startAutoFetchCron();
startDeadlineReminderCron();

// ---------------- FRONTEND ROUTES ----------------
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "login.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "admin.html"));
});

// ---------------- API ROUTES ----------------
app.use("/api/schemes", schemeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", applicationRoutes);
app.use("/api/admin", adminRoutes);

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});