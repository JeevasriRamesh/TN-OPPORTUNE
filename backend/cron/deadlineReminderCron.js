const cron = require("node-cron");
const Scheme = require("../models/Scheme");
const User = require("../models/User");
const ReminderLog = require("../models/ReminderLog");
const { buildEmailText, sendEmail } = require("../services/emailService");

function parseDeadlineToDate(deadlineStr) {
  if (!deadlineStr) return null;
  const raw = String(deadlineStr).trim();
  if (!raw) return null;
  if (/ongoing/i.test(raw)) return null;

  // Try native parse first (ISO, RFC, etc.)
  const d1 = new Date(raw);
  if (!isNaN(d1.getTime())) return d1;

  // Try dd-mm-yyyy or dd/mm/yyyy
  const m = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);
    const d2 = new Date(Date.UTC(yyyy, mm - 1, dd, 0, 0, 0));
    if (!isNaN(d2.getTime())) return d2;
  }

  return null;
}

function daysUntil(date) {
  const now = new Date();
  const ms = date.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

async function sendDeadlineReminders() {
  const schemes = await Scheme.find({ status: "active" }).lean();
  const upcoming = schemes
    .map((s) => ({ scheme: s, deadlineDate: parseDeadlineToDate(s.deadline) }))
    .filter((x) => x.deadlineDate)
    .map((x) => ({ ...x, daysRemaining: daysUntil(x.deadlineDate) }))
    // 3–5 days window as requested
    .filter((x) => x.daysRemaining >= 3 && x.daysRemaining <= 5);

  if (upcoming.length === 0) return;

  const users = await User.find({ role: "user" }).select("email username").lean();
  if (!users || users.length === 0) return;

  for (const item of upcoming) {
    const schemeId = String(item.scheme._id);
    const schemeName = item.scheme.name;
    const deadlineText = item.scheme.deadline;

    // Find existing logs for this scheme to avoid duplicates
    const existing = await ReminderLog.find({ schemeId: item.scheme._id })
      .select("userId")
      .lean();
    const already = new Set((existing || []).map((x) => String(x.userId)));

    const toSend = users.filter((u) => u.email && !already.has(String(u._id)));
    if (toSend.length === 0) continue;

    // Send emails sequentially to keep things simple/stable
    for (const u of toSend) {
      try {
        await sendEmail(
          u.email,
          "Reminder – Scheme Deadline Approaching",
          buildEmailText({
            userName: u.username,
            bodyLines: [
              "The following scheme deadline is approaching soon:",
              "",
              `Scheme: ${schemeName}`,
              `Deadline: ${deadlineText}`,
              "",
              "Apply before the deadline.",
            ],
          })
        );

        await ReminderLog.create({
          userId: u._id,
          schemeId: item.scheme._id,
          sentAt: new Date(),
        });
      } catch (err) {
        // If duplicate key occurs due to race, ignore; otherwise log.
        if (err && err.code === 11000) continue;
        console.warn("[Email] Deadline reminder failed:", err.message);
      }
    }
  }
}

function startDeadlineReminderCron() {
  console.log("[Cron] Initializing deadline reminder job (runs at 09:00 every day)...");

  const job = cron.schedule(
    "0 9 * * *",
    async () => {
      console.log("[Cron] deadline reminder job started");
      try {
        await sendDeadlineReminders();
        console.log("[Cron] deadline reminder job finished successfully");
      } catch (error) {
        console.error("[Cron] deadline reminder job failed:", error.message);
      }
    },
    { scheduled: true }
  );

  return job;
}

module.exports = {
  startDeadlineReminderCron,
  sendDeadlineReminders,
};

