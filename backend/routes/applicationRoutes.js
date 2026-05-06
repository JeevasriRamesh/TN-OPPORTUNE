const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { applySchemeV2, getUserProfileV2 } = require("../controllers/userController");

const router = express.Router();

/**
 * POST /api/apply-scheme
 * Body: { schemeId: "..." }
 * Requires Authorization: Bearer <token>
 */
router.post("/apply-scheme", requireAuth, applySchemeV2);

/**
 * GET /api/user-profile
 * Requires Authorization: Bearer <token>
 */
router.get("/user-profile", requireAuth, getUserProfileV2);

module.exports = router;

