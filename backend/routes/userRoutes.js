/**
 * userRoutes.js
 * Routes for user-related operations, such as applied schemes.
 */

const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { applyForScheme, getAppliedSchemes, getMyProfile, updateMyProfile } = require("../controllers/userController");

const router = express.Router();

// GET /api/users/me/profile
// Requires Authorization: Bearer <token>
router.get("/me/profile", requireAuth, getMyProfile);

// PUT /api/users/me/profile
// Requires Authorization: Bearer <token>
router.put("/me/profile", requireAuth, updateMyProfile);

// POST /api/users/apply/:schemeId
// Body: { "userId": "..." }
// Adds the scheme to the user's appliedSchemes list (if not already there)
router.post("/apply/:schemeId", applyForScheme);

// GET /api/users/:userId/applied
// Returns all schemes the user has applied for (populated with full scheme details)
router.get("/:userId/applied", getAppliedSchemes);

module.exports = router;

