/**
 * schemeController.js
 * Controller functions for read-only scheme APIs.
 */

const Scheme = require("../models/Scheme");
const User = require("../models/User");
const { calculateMatchScore } = require("../utils/matchScore");

/**
 * Build a MongoDB filter object based on query parameters.
 * Skips filters that are empty or equal to "all".
 * Always include only "active" schemes so expired ones are hidden from users.
 */
const buildFilters = (query) => {
  const { type, category, age, gender, qualification, income, community, search } = query;
  const filters = {
    // Only return schemes that are currently active
    status: "active",
    // Hide auto-fetched items until verified (show verified OR non-auto-fetched)
    $and: [
      {
        $or: [
          { verified: true },
          { autoFetched: { $ne: true } },
          { autoFetched: { $exists: false } },
        ],
      },
    ],
  };

  if (type && type !== "all") filters.type = type;
  if (category && category !== "all") filters.category = category;
  if (age && age !== "all") filters.age = age;
  if (gender && gender !== "all") filters.gender = gender;
  if (qualification && qualification !== "all") filters.qualification = qualification;
  if (income && income !== "all") filters.income = income;
  if (community && community !== "all") filters.community = community;

  // For text search: match name or description (case-insensitive)
  if (search) {
    const regex = new RegExp(search, "i");
    filters.$and.push({ $or: [{ name: regex }, { description: regex }] });
  }

  return filters;
};

/**
 * GET /api/schemes
 * Returns all schemes, optionally filtered via query parameters.
 * Adds a computed "isOfficial" flag for data authenticity based on sourceUrl.
 */
const getSchemes = async (req, res) => {
  try {
    const filters = buildFilters(req.query);
    const schemes = await Scheme.find(filters);

    // Add computed isOfficial (not stored in MongoDB): use sourceUrl or link for .gov.in check
    const withOfficialFlag = schemes.map((scheme) => {
      const obj = scheme.toObject();
      const url = obj.sourceUrl || obj.link;
      obj.isOfficial = Boolean(
        url && url.toLowerCase().endsWith(".gov.in")
      );
      obj.lastVerifiedAt = obj.lastVerifiedAt || null;
      return obj;
    });

    return res.json(withOfficialFlag);
  } catch (error) {
    console.error("Error fetching schemes:", error.message);
    return res.status(500).json({ message: "Failed to fetch schemes" });
  }
};

module.exports = {
  getSchemes,
  /**
   * POST /api/schemes/match-scores
   * Body: { schemeIds: ["..."] }
   * Requires Authorization: Bearer <token>
   * Returns: { scores: { [schemeId]: { matchScore, matchLevel } }, profileComplete: boolean }
   */
  getMatchScores: async (req, res) => {
    try {
      const userId = req.user && req.user.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { schemeIds } = req.body || {};
      if (!Array.isArray(schemeIds) || schemeIds.length === 0) {
        return res.status(400).json({ message: "schemeIds array is required" });
      }

      const user = await User.findById(userId).select("profile");
      if (!user) return res.status(404).json({ message: "User not found" });

      const profile = user.profile || {};
      const profileComplete = Boolean(
        profile &&
          Number.isFinite(Number(profile.age)) &&
          String(profile.gender || "").trim() &&
          String(profile.qualification || "").trim() &&
          String(profile.income || "").trim() &&
          String(profile.community || "").trim()
      );

      const schemes = await Scheme.find({ _id: { $in: schemeIds } }).lean();
      const scores = {};
      schemes.forEach((scheme) => {
        scores[String(scheme._id)] = calculateMatchScore(user, scheme);
      });

      return res.json({ scores, profileComplete });
    } catch (error) {
      console.error("Error calculating match scores:", error.message);
      return res.status(500).json({ message: "Failed to calculate match scores" });
    }
  },
};

