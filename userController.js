/**
 * userController.js
 * Controller functions related to user-specific operations.
 * Here we handle storing and fetching applied schemes for a user.
 */

const User = require("../models/User");
const Scheme = require("../models/Scheme");
const { buildEmailText, sendEmail } = require("../services/emailService");

function pickProfilePayload(body = {}) {
  const profile = body.profile && typeof body.profile === "object" ? body.profile : body;
  const out = {};

  if (profile.age !== undefined) {
    const n = Number(profile.age);
    out.age = Number.isFinite(n) ? n : null;
  }
  if (profile.gender !== undefined) out.gender = String(profile.gender || "").toLowerCase().trim();
  if (profile.qualification !== undefined) out.qualification = String(profile.qualification || "").toLowerCase().trim();
  if (profile.income !== undefined) out.income = String(profile.income || "").toLowerCase().trim();
  if (profile.community !== undefined) out.community = String(profile.community || "").toLowerCase().trim();
  if (profile.category !== undefined) out.category = String(profile.category || "").trim();

  return out;
}

/**
 * POST /api/users/apply/:schemeId
 * Adds a scheme to the user's appliedSchemes list.
 * - Expects userId in the request body
 * - Expects schemeId as a URL parameter
 * - Checks that both user and scheme exist
 * - Prevents duplicate entries
 */
const applyForScheme = async (req, res) => {
  try {
    const { userId } = req.body;
    const { schemeId } = req.params;

    // Basic validation: both IDs must be present
    if (!userId || !schemeId) {
      return res.status(400).json({ message: "userId in body and schemeId in URL are required" });
    }

    // Make sure the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Make sure the scheme exists
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found" });
    }

    // Check if this scheme is already in the user's appliedSchemes array
    const alreadyApplied = user.appliedSchemes.some(
      (id) => id.toString() === schemeId
    );

    if (alreadyApplied) {
      return res.status(200).json({
        message: "Scheme already marked as applied for this user",
        userId: user._id,
        schemeId,
      });
    }

    // Add scheme to appliedSchemes and save
    user.appliedSchemes.push(schemeId);
    await user.save();

    // Fire-and-forget application confirmation email (do not block apply)
    sendEmail(
      user.email,
      "Application Submitted Successfully",
      buildEmailText({
        userName: user.username,
        bodyLines: [
          "You have successfully applied for:",
          "",
          `${scheme.name}`,
          "",
          "Our team will review your application.",
          "You can check your applications here:",
        ],
      })
    ).catch((err) => {
      console.warn("[Email] Application email failed:", err.message);
    });

    return res.status(200).json({
      message: "Scheme marked as applied for user",
      userId: user._id,
      schemeId,
    });
  } catch (error) {
    console.error("Error marking scheme as applied:", error.message);
    return res.status(500).json({ message: "Failed to mark scheme as applied" });
  }
};

/**
 * GET /api/users/:userId/applied
 * Returns all schemes that the user has applied for.
 * - Validates that the user exists
 * - Populates the appliedSchemes field with full scheme documents
 */
const getAppliedSchemes = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate that a userId was provided
    if (!userId) {
      return res.status(400).json({ message: "userId is required in the URL" });
    }

    // Find the user and populate appliedSchemes with full Scheme details
    const user = await User.findById(userId).populate("appliedSchemes");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return just the array of populated schemes
    return res.json(user.appliedSchemes || []);
  } catch (error) {
    console.error("Error fetching applied schemes:", error.message);
    return res.status(500).json({ message: "Failed to fetch applied schemes" });
  }
};

/**
 * POST /api/apply-scheme
 * Body: { schemeId: "..." }
 * Requires Authorization: Bearer <token>
 *
 * Stores schemeId inside User.appliedSchemes (ObjectId refs), prevents duplicates,
 * and sends a confirmation email after successful apply.
 */
const applySchemeV2 = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const schemeId = req.body && req.body.schemeId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!schemeId) return res.status(400).json({ message: "schemeId is required" });

    const [user, scheme] = await Promise.all([
      User.findById(userId).select("username email appliedSchemes"),
      Scheme.findById(schemeId).select("name"),
    ]);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });

    const alreadyApplied = Array.isArray(user.appliedSchemes)
      ? user.appliedSchemes.some((id) => String(id) === String(schemeId))
      : false;

    if (!alreadyApplied) {
      await User.updateOne(
        { _id: userId },
        { $addToSet: { appliedSchemes: schemeId } }
      );
    }

    // Fire-and-forget application confirmation email (do not block apply)
    sendEmail(
      user.email,
      "Application Submitted Successfully",
      buildEmailText({
        userName: user.username,
        bodyLines: [
          "You have successfully applied for the following scheme:",
          "",
          scheme.name,
          "",
          "You can track your applications by logging into TN Opportune.",
        ],
      })
    ).catch((err) => {
      console.warn("[Email] Application email failed:", err.message);
    });

    return res.status(200).json({
      message: alreadyApplied ? "Already applied" : "Applied successfully",
      schemeId,
      schemeName: scheme.name,
      alreadyApplied,
    });
  } catch (error) {
    console.error("Error applying scheme:", error.message);
    return res.status(500).json({ message: "Failed to apply scheme" });
  }
};

/**
 * GET /api/user-profile
 * Requires Authorization: Bearer <token>
 *
 * Returns: basic user info + appliedSchemes populated (for profile modal display).
 */
const getUserProfileV2 = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId)
      .select("username email role profile appliedSchemes")
      .populate("appliedSchemes", "name type");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile || {},
      appliedSchemes: (user.appliedSchemes || []).map((s) => ({
        schemeId: s && s._id ? String(s._id) : "",
        schemeName: s && s.name ? s.name : "",
        type: s && s.type ? s.type : "scheme",
      })),
    });
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    return res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

module.exports = {
  applyForScheme,
  getAppliedSchemes,
  applySchemeV2,
  getUserProfileV2,
  /**
   * GET /api/users/me/profile
   * Requires Authorization Bearer token. Returns the current user's profile.
   */
  getMyProfile: async (req, res) => {
    try {
      const userId = req.user && req.user.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const user = await User.findById(userId).select("username email role profile");
      if (!user) return res.status(404).json({ message: "User not found" });

      return res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile || {},
      });
    } catch (error) {
      console.error("Error fetching profile:", error.message);
      return res.status(500).json({ message: "Failed to fetch profile" });
    }
  },

  /**
   * PUT /api/users/me/profile
   * Requires Authorization Bearer token. Updates the current user's profile.
   */
  updateMyProfile: async (req, res) => {
    try {
      const userId = req.user && req.user.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const patch = pickProfilePayload(req.body);
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.profile = {
        ...(user.profile || {}),
        ...patch,
      };
      await user.save();

      return res.json({
        message: "Profile updated",
        profile: user.profile || {},
      });
    } catch (error) {
      console.error("Error updating profile:", error.message);
      return res.status(500).json({ message: "Failed to update profile" });
    }
  },
};

