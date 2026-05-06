function norm(val) {
  if (val === null || val === undefined) return "";
  return String(val).toLowerCase().trim();
}

function isAll(val) {
  const v = norm(val);
  return v === "" || v === "all" || v === "any";
}

function splitMulti(val) {
  const v = norm(val);
  if (!v) return [];
  return v
    .split(/[,/]| or | and /g)
    .map((x) => x.trim())
    .filter(Boolean);
}

function ageToGroup(ageNum) {
  const age = Number(ageNum);
  if (!Number.isFinite(age)) return "";
  if (age < 25) return "student";
  if (age <= 40) return "adult";
  return "senior";
}

function valueMatches(userVal, schemeVal) {
  if (isAll(schemeVal)) return true;
  const u = norm(userVal);
  if (!u) return false;

  const s = norm(schemeVal);
  if (!s) return false;

  if (u === s) return true;

  const schemeOptions = splitMulti(s);
  if (schemeOptions.length > 0 && schemeOptions.includes(u)) return true;

  // Soft match for cases like "student" vs "hsc" (common in messy data):
  // allow substring match in either direction.
  if (u.includes(s) || s.includes(u)) return true;

  return false;
}

function getMatchLevel(score) {
  if (score >= 85) return "High Match";
  if (score >= 70) return "Good Match";
  if (score >= 50) return "Medium Match";
  return "Low Match";
}

/**
 * calculateMatchScore(user, scheme)
 * Scoring (max 100):
 * - gender: +20
 * - age (numeric user age vs scheme age-group): +20
 * - qualification: +20
 * - income: +20
 * - community/category: +20 (community preferred; falls back to category if scheme has none)
 */
function calculateMatchScore(user, scheme) {
  const weights = {
    gender: 20,
    age: 20,
    qualification: 20,
    income: 20,
    community: 20,
  };

  const profile = (user && user.profile) || {};
  const schemeObj = scheme || {};

  let score = 0;
  let possible = 0;

  // Gender
  possible += weights.gender;
  if (valueMatches(profile.gender, schemeObj.gender)) score += weights.gender;

  // Age-group (scheme stores age group string)
  possible += weights.age;
  const userAgeGroup = ageToGroup(profile.age);
  if (valueMatches(userAgeGroup, schemeObj.age)) score += weights.age;

  // Qualification
  possible += weights.qualification;
  if (valueMatches(profile.qualification, schemeObj.qualification)) score += weights.qualification;

  // Income
  possible += weights.income;
  if (valueMatches(profile.income, schemeObj.income)) score += weights.income;

  // Community/category match
  possible += weights.community;
  const schemeCommunity = schemeObj.community;
  if (schemeCommunity !== undefined && schemeCommunity !== null && norm(schemeCommunity) !== "") {
    if (valueMatches(profile.community, schemeCommunity)) score += weights.community;
  } else {
    if (valueMatches(profile.category, schemeObj.category)) score += weights.community;
  }

  const matchScore = possible > 0 ? Math.round((score / possible) * 100) : 0;
  return {
    matchScore,
    matchLevel: getMatchLevel(matchScore),
  };
}

module.exports = {
  calculateMatchScore,
  getMatchLevel,
};

