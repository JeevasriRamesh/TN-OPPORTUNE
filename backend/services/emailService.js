const nodemailer = require("nodemailer");

const PORTAL_URL = process.env.PORTAL_URL || "http://localhost:3000";
const EMAIL_FROM = process.env.EMAIL_FROM || "TN Opportune <no-reply@tn-opportune.local>";

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT);
}

function buildTransporter() {
  if (!hasSmtpConfig()) return null;

  const port = Number(process.env.SMTP_PORT);
  const secure =
    process.env.SMTP_SECURE === "true" ||
    (Number.isFinite(port) && port === 465);

  const authUser = process.env.SMTP_USER;
  const authPass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: authUser && authPass ? { user: authUser, pass: authPass } : undefined,
  });
}

const transporter = buildTransporter();

function buildEmailText({ userName, bodyLines }) {
  const name = userName || "User";
  const lines = [
    `Hello ${name},`,
    "",
    ...bodyLines,
    "",
    `Visit the portal:`,
    PORTAL_URL,
    "",
    "Thank you for using TN Opportune.",
  ];
  return lines.join("\n");
}

async function sendEmail(to, subject, text) {
  if (!to) return { skipped: true, reason: "Missing recipient" };
  if (!transporter) {
    console.warn(
      "[Email] SMTP not configured. Skipping email. Set SMTP_HOST/SMTP_PORT (+ SMTP_USER/SMTP_PASS)."
    );
    return { skipped: true, reason: "SMTP not configured" };
  }

  const info = await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    text,
  });

  return { skipped: false, messageId: info.messageId };
}

module.exports = {
  PORTAL_URL,
  buildEmailText,
  sendEmail,
};

