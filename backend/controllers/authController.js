/**
 * authController.js
 * Secure authentication controller (register & login) using bcryptjs and JWT.
 *
 * NOTE:
 * - Passwords are always stored as bcrypt hashes (never plain-text).
 * - JWT contains only userId and role; no sensitive data is embedded.
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { buildEmailText, sendEmail } = require("../services/emailService");

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Hard-coded list of admin emails for role validation (backend always re-checks)
const ADMIN_EMAILS = [
  "jeevasripr@gmail.com",
  "aneesanees1035@gmail.com",
];

/**
 * Helper: generate a signed JWT token for a user.
 */
function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * POST /api/auth/register
 * Registers a new user.
 * - Inputs: email, password
 * - Validates input
 * - Ensures email is unique
 * - Hashes password with bcryptjs before saving
 * - Auto-generates a username (from email) to satisfy existing User model
 */
const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Basic sanity checks
    const normalisedEmail = String(email).toLowerCase().trim();
    if (!normalisedEmail.includes("@")) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: normalisedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Generate a simple username from email (keeps existing schema compatible)
    const baseUsername = normalisedEmail.split("@")[0] || "user";
    let username = baseUsername;
    let suffix = 1;
    // Ensure username uniqueness if needed
    // (loop is bounded in practice; collisions are unlikely)
    // eslint-disable-next-line no-constant-condition
    while (await User.findOne({ username })) {
      username = `${baseUsername}${suffix}`;
      suffix += 1;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email: normalisedEmail,
      password: hashedPassword,
    });

    const token = generateToken(user);

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Error during registration:", error.message);
    return res.status(500).json({ message: "Registration failed" });
  }
};

/**
 * POST /api/auth/login
 * Logs in an existing user.
 * - Inputs: email, password
 * - Validates input
 * - Compares password using bcryptjs
 * - Returns JWT token + basic user info (no password)
 */
const loginUser = async (req, res) => {
  try {
    const { email, password, role: requestedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalisedEmail = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: normalisedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Determine effective role requested by the client (default: "user")
    const role = (requestedRole || "user").toLowerCase();

    // If client is trying to log in as admin, validate against allowed admin emails
    if (role === "admin") {
      if (!ADMIN_EMAILS.includes(normalisedEmail)) {
        return res.status(403).json({ message: "Not authorized as admin" });
      }
    }

    const token = generateToken(user);

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    // Fire-and-forget login success email (do not block login)
    sendEmail(
      user.email,
      "Login Successful – TN Opportune",
      buildEmailText({
        userName: user.username,
        bodyLines: [
          "You have successfully logged into your TN Opportune account.",
          "",
          "If this was not you, please secure your account immediately.",
        ],
      })
    ).catch((err) => {
      console.warn("[Email] Login email failed:", err.message);
    });

    return res.json({
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    return res.status(500).json({ message: "Login failed" });
  }
};

module.exports = {
  // New names matching spec
  registerUser,
  loginUser,
  // Backwards-compatible exports for existing route imports
  register: registerUser,
  login: loginUser,
};


