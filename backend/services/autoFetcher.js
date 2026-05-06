/**
 * autoFetcher.js
 * Lightweight auto-detection of schemes/jobs from official .gov.in pages.
 * Extracts titles and links only; inserts new items with autoFetched=true, verified=false.
 * Does NOT overwrite or delete existing data.
 */

const cheerio = require("cheerio");
const Scheme = require("../models/Scheme");

/** Required field defaults for auto-fetched inserts (minimal scraping) */
const DEFAULTS = {
  category: "Welfare",
  age: "all",
  gender: "all",
  qualification: "all",
  income: "all",
  community: "all",
  description: "Auto-detected from official source. Pending verification.",
  benefits: "",
  deadline: "As per notification",
};

/**
 * Ensures the URL is an official government source (.gov.in).
 */
function assertOfficialUrl(url) {
  if (!url || typeof url !== "string") {
    throw new Error("sourceUrl is required");
  }
  const trimmed = url.trim();
  if (!trimmed.toLowerCase().endsWith(".gov.in")) {
    throw new Error("Only official government URLs (.gov.in) are allowed");
  }
  return trimmed;
}

/**
 * Fetches the given URL and returns HTML text.
 */
async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "TN-Opportune-AutoFetcher/1.0" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.text();
}

/**
 * Extracts page title or h1, and anchor links containing .gov.in.
 * Returns array of { name, link } objects.
 */
function extractTitlesAndLinks(html, sourceUrl) {
  const $ = cheerio.load(html);
  const items = [];

  // Page title or h1 as primary item
  const pageTitle =
    $("h1").first().text().trim() ||
    $("title").text().trim() ||
    "";
  if (pageTitle) {
    items.push({ name: pageTitle, link: sourceUrl });
  }

  // First few anchor links that contain .gov.in
  const seen = new Set();
  let count = 0;
  const maxLinks = 10;

  $("a[href]").each((_, el) => {
    if (count >= maxLinks) return false;
    const href = $(el).attr("href") || "";
    if (!href.toLowerCase().includes(".gov.in")) return;
    const absolute =
      href.startsWith("http") ? href : new URL(href, sourceUrl).toString();
    if (!absolute.toLowerCase().includes(".gov.in")) return;
    if (seen.has(absolute)) return;
    seen.add(absolute);
    const text = $(el).text().trim() || absolute;
    if (!text || text.length < 2) return;
    items.push({ name: text, link: absolute });
    count += 1;
  });

  return items;
}

/**
 * Fetches HTML from sourceUrl, extracts titles and .gov.in links,
 * and inserts new items only (no overwrite, no delete).
 *
 * @param {string} sourceUrl - Official .gov.in page URL
 * @param {string} type - "scheme" or "job"
 * @returns {Promise<{ detected: number, inserted: number }>}
 */
async function autoFetch(sourceUrl, type) {
  const url = assertOfficialUrl(sourceUrl);
  if (type !== "scheme" && type !== "job") {
    throw new Error('type must be "scheme" or "job"');
  }

  const html = await fetchHtml(url);
  const items = extractTitlesAndLinks(html, url);

  let detected = items.length;
  let inserted = 0;

  for (const item of items) {
    const name = (item.name || "").toString().trim();
    const link = (item.link || url).toString().trim();
    if (!name || !link) continue;

    const existing = await Scheme.findOne({ name });
    if (existing) continue;

    await Scheme.create({
      name,
      link,
      sourceUrl: url,
      type,
      category: DEFAULTS.category,
      age: DEFAULTS.age,
      gender: DEFAULTS.gender,
      qualification: DEFAULTS.qualification,
      income: DEFAULTS.income,
      community: DEFAULTS.community,
      description: DEFAULTS.description,
      benefits: DEFAULTS.benefits,
      deadline: DEFAULTS.deadline,
      status: "active",
      autoFetched: true,
      verified: false,
      lastVerifiedAt: null,
    });
    inserted += 1;
  }

  return { detected, inserted };
}

module.exports = {
  autoFetch,
};
