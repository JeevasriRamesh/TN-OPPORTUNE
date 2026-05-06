/**
 * authMiddleware.js
 * JWT-based authentication & authorization middleware.
 *
 * - protect: verifies Bearer token, attaches user to req.user
 * - adminOnly: allows access only for users with role === "admin"
 *
 * NOTE: These middlewares are defined but NOT yet applied to existing routes,
 * so current APIs keep working until routes are explicitly protected.
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";

/**
 * Protect middleware
 * Requires an Authorization: Bearer <token> header.
 * If valid, attaches the user document (without password) to req.user.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user no longer exists" });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error("Auth protect error:", error.message);
    return res.status(401).json({ message: "Not authorized" });
  }
};

/**
 * adminOnly middleware
 * Requires protect to have run first (so req.user is set).
 * Allows access only for users with role === "admin".
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  return next();
};

module.exports = {
  protect,
  adminOnly,
};

