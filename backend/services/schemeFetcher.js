/**
 * schemeFetcher.js
 * Service to fetch and verify scheme data from official government URLs.
 * Supports JSON and HTML responses; upserts into Scheme collection by name.
 */

const cheerio = require("cheerio");
const Scheme = require("../models/Scheme");

/** Default values for required Scheme fields when creating from fetched HTML/JSON */
const DEFAULTS = {
  category: "Welfare",
  age: "all",
  gender: "all",
  qualification: "all",
  income: "all",
  community: "all",
  benefits: "",
};

/**
 * Ensures the URL is an official government source (.gov.in).
 * @throws Error if URL does not end with .gov.in
 */
function assertOfficialUrl(sourceUrl) {
  if (!sourceUrl || typeof sourceUrl !== "string") {
    throw new Error("sourceUrl is required");
  }
  const trimmed = sourceUrl.trim();
  if (!trimmed.toLowerCase().endsWith(".gov.in")) {
    throw new Error("Only official government URLs (.gov.in) are allowed");
  }
  return trimmed;
}

/**
 * Fetches the given URL and returns response text and content type.
 */
async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "TN-Opportune-SchemeFetcher/1.0" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  const text = await res.text();
  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  return { text, contentType };
}

/**
 * Tries to parse response as JSON. Returns array of scheme-like objects or null.
 */
function parseAsJson(text) {
  try {
    const data = JSON.parse(text);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.schemes)) return data.schemes;
    if (data && typeof data === "object") return [data];
    return null;
  } catch {
    return null;
  }
}

/**
 * Parses HTML with cheerio and extracts scheme-like fields.
 * Returns an array of one or more scheme objects (one per page or per repeated block).
 */
function parseAsHtml(text, sourceUrl) {
  const $ = cheerio.load(text);
  const schemes = [];

  // Try to get a single scheme from page-level elements
  const name =
    $("h1").first().text().trim() ||
    $("h2").first().text().trim() ||
    $("title").text().trim() ||
    "";
  const description =
    $('meta[name="description"]').attr("content")?.trim() ||
    $("p").first().text().trim() ||
    "";
  let deadline = "Ongoing";
  $("p, li, td").each((_, el) => {
    const t = $(el).text();
    if (/deadline|last date|closing/i.test(t) && /\d/.test(t)) {
      deadline = t.trim().slice(0, 100);
      return false; // break
    }
  });

  if (name) {
    schemes.push({
      name,
      description: description || "No description available.",
      deadline,
      link: sourceUrl,
    });
  }

  return schemes;
}

/**
 * Normalizes a raw scheme object (from JSON or HTML) to have required fields.
 */
function normalizeScheme(raw, sourceUrl) {
  const name = (raw.name || raw.title || "").toString().trim();
  if (!name) return null;

  return {
    name,
    category: raw.category || DEFAULTS.category,
    age: raw.age || DEFAULTS.age,
    gender: raw.gender || DEFAULTS.gender,
    qualification: raw.qualification || DEFAULTS.qualification,
    income: raw.income || DEFAULTS.income,
    community: raw.community || DEFAULTS.community,
    description: (raw.description || raw.desc || DEFAULTS.benefits).toString().trim() || "No description available.",
    benefits: raw.benefits != null ? String(raw.benefits).trim() : DEFAULTS.benefits,
    deadline: (raw.deadline || raw.lastDate || "Ongoing").toString().trim(),
    link: (raw.link || raw.url || sourceUrl).toString().trim(),
    sourceUrl,
  };
}

/**
 * Fetches content from sourceUrl, parses as JSON or HTML, then creates or updates
 * Scheme documents by name. Only .gov.in URLs are accepted.
 *
 * @param {string} sourceUrl - Official government page URL (must end with .gov.in)
 * @returns {Promise<{ created: number, updated: number }>}
 */
async function fetchAndVerifySchemes(sourceUrl) {
  const url = assertOfficialUrl(sourceUrl);

  console.log("Fetching schemes from:", url);

  const { text, contentType } = await fetchPage(url);

  let rawList = null;
  if (contentType.includes("application/json")) {
    rawList = parseAsJson(text);
  }
  if (!rawList || rawList.length === 0) {
    rawList = parseAsHtml(text, url);
  }

  if (!rawList || rawList.length === 0) {
    console.log("No scheme-like data found at URL");
    return { created: 0, updated: 0 };
  }

  let created = 0;
  let updated = 0;
  const now = new Date();

  for (const raw of rawList) {
    const schemeData = normalizeScheme(raw, url);
    if (!schemeData) continue;

    const existing = await Scheme.findOne({ name: schemeData.name });

    if (existing) {
      existing.description = schemeData.description;
      existing.deadline = schemeData.deadline;
      existing.link = schemeData.link;
      existing.lastVerifiedAt = now;
      existing.status = "active";
      if (schemeData.sourceUrl) existing.sourceUrl = schemeData.sourceUrl;
      await existing.save();
      updated += 1;
    } else {
      await Scheme.create({
        ...schemeData,
        status: "active",
        lastVerifiedAt: now,
      });
      created += 1;
    }
  }

  console.log("Schemes created:", created);
  console.log("Schemes updated:", updated);

  return { created, updated };
}

module.exports = {
  fetchAndVerifySchemes,
};
