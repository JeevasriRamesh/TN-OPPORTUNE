/**
 * adminRoutes.js
 * Admin endpoints for reviewing auto-fetched schemes and jobs.
 * No authentication yet – basic implementation.
 */

const express = require("express");
const Scheme = require("../models/Scheme");

const router = express.Router();

/**
 * GET /api/admin/stats
 * Returns summary statistics for the admin dashboard.
 */
router.get("/stats", async (req, res) => {
  try {
    const [totalItems, totalSchemes, totalJobs, approvedCount, pendingCount] =
      await Promise.all([
        Scheme.countDocuments(),
        Scheme.countDocuments({ type: "scheme" }),
        Scheme.countDocuments({ type: "job" }),
        Scheme.countDocuments({ verified: true }),
        Scheme.countDocuments({ autoFetched: true, verified: false }),
      ]);

    return res.json({
      totalItems,
      totalSchemes,
      totalJobs,
      approvedCount,
      pendingCount,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error.message);
    return res.status(500).json({ message: "Failed to fetch stats" });
  }
});

/**
 * GET /api/admin/items
 * Returns all schemes/jobs. Query: type=scheme|job|all (default: all).
 * Sorted by updatedAt desc.
 */
router.get("/items", async (req, res) => {
  try {
    const type = req.query.type || "all";
    const filter = type === "all" ? {} : { type };
    const items = await Scheme.find(filter)
      .sort({ updatedAt: -1 })
      .lean();
    return res.json(items);
  } catch (error) {
    console.error("Error fetching admin items:", error.message);
    return res.status(500).json({ message: "Failed to fetch items" });
  }
});

/**
 * POST /api/admin/expire/:id
 * Sets status=expired for the given scheme/job.
 */
router.post("/expire/:id", async (req, res) => {
  try {
    const doc = await Scheme.findByIdAndUpdate(
      req.params.id,
      { status: "expired" },
      { new: true }
    );
    if (!doc) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.json({ message: "Item expired successfully", id: doc._id });
  } catch (error) {
    console.error("Error expiring item:", error.message);
    return res.status(500).json({ message: "Failed to expire item" });
  }
});

/**
 * GET /api/admin/recentlyApproved
 * Returns items with approvedAt set, sorted by approvedAt desc (limit 20).
 */
router.get("/recentlyApproved", async (req, res) => {
  try {
    const items = await Scheme.find({ approvedAt: { $ne: null } })
      .sort({ approvedAt: -1 })
      .limit(20)
      .lean();
    return res.json(items);
  } catch (error) {
    console.error("Error fetching recently approved:", error.message);
    return res.status(500).json({ message: "Failed to fetch recently approved" });
  }
});

/**
 * GET /api/admin/pending
 * Returns all schemes/jobs where autoFetched=true and verified=false.
 */
router.get("/pending", async (req, res) => {
  try {
    const items = await Scheme.find({
      autoFetched: true,
      verified: false,
    });
    return res.json(items);
  } catch (error) {
    console.error("Error fetching pending items:", error.message);
    return res.status(500).json({ message: "Failed to fetch pending items" });
  }
});

/**
 * POST /api/admin/approve/:id
 * Sets verified=true, lastVerifiedAt, approvedAt, approvedBy for the given scheme/job.
 */
router.post("/approve/:id", async (req, res) => {
  try {
    const now = new Date();
    const doc = await Scheme.findByIdAndUpdate(
      req.params.id,
      {
        verified: true,
        lastVerifiedAt: now,
        approvedAt: now,
        approvedBy: "Admin",
      },
      { new: true }
    );
    if (!doc) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.json({ message: "Approved successfully", id: doc._id });
  } catch (error) {
    console.error("Error approving item:", error.message);
    return res.status(500).json({ message: "Failed to approve item" });
  }
});

module.exports = router;
