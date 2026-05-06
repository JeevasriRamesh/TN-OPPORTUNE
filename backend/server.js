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

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// DB CONNECT
connectDB();

// Static frontend
app.use(express.static(path.join(__dirname, "..")));

// CRON JOBS
startExpireSchemesCron();
startFetchSchemesCron();
startAutoFetchCron();
startDeadlineReminderCron();

// Pages
app.get("/", (req, res) => res.redirect("/login"));

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "login.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "admin.html"));
});

// APIs
app.use("/api/schemes", schemeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", applicationRoutes);
app.use("/api/admin", adminRoutes);

// START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});