/**
 * authRoutes.js
 * Routes for basic user authentication (register & login).
 */

const express = require("express");
const { register, login } = require("../controllers/authController");

const router = express.Router();

// POST /api/auth/register - create a new user account
router.post("/register", register);

// POST /api/auth/login - log in an existing user
router.post("/login", login);

module.exports = router;

