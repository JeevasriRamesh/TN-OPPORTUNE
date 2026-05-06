/**
 * schemeRoutes.js
 * Defines read-only routes for schemes.
 */

const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getSchemes, getMatchScores } = require("../controllers/schemeController");

const router = express.Router();

// GET /api/schemes - returns all schemes, with optional filters via query params
router.get("/", getSchemes);

// POST /api/schemes/match-scores - batch match scores for logged-in user
router.post("/match-scores", requireAuth, getMatchScores);

module.exports = router;

