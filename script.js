// ===== Simple auth guard for dashboard =====
// If there is no authToken at all, force navigation to login.html.
// This ensures index.html (dashboard) never loads for unauthenticated users.
if (!localStorage.getItem("authToken")) {
  window.location.href = "login.html";
}

// ===== Theme management (light / dark with Emerald + Slate) =====
function getPreferredTheme() {
  const stored = localStorage.getItem("tn_theme");
  if (stored === "light" || stored === "dark") return stored;
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  localStorage.setItem("tn_theme", theme);
  const iconEl = document.getElementById("themeToggleIcon");
  if (iconEl) {
    iconEl.textContent = theme === "dark" ? "☀️" : "🌙";
  }
}

function initThemeToggle() {
  const current = getPreferredTheme();
  applyTheme(current);
  const toggleBtn = document.getElementById("themeToggle");
  if (!toggleBtn) return;
  toggleBtn.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
  });
}

// Initialise theme as early as possible
initThemeToggle();

// ===== Render Cards =====
/** Format lastVerifiedAt for display: "7 Feb 2026" or "Not yet verified". */
function formatLastVerified(dateVal) {
  if (!dateVal) return "Not yet verified";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "Not yet verified";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function renderCards(data) {
  const results = document.getElementById("results");
  results.innerHTML = "";

  if (data.length === 0) {
    // Clear, user-friendly empty state when no active schemes are available
    results.innerHTML = "<p class='no-results'>No active schemes available at the moment.</p>";
    return;
  }

  data.forEach(s => {
    // Apply / Details: open sourceUrl if present, else link (backend-provided)
    const url = s.sourceUrl || s.link;
    const validLink = (url && typeof url === "string" && url.startsWith("http")) ? url : "https://www.tn.gov.in/";
    // Badge uses backend isOfficial (true when sourceUrl ends with .gov.in)
    const isOfficial = s.isOfficial === true;
    const jobBadge = s.type === "job" ? '<span class="badge-job">Government Job</span>' : '';
    const officialBadge = isOfficial
      ? '<span class="badge-official">Official Govt Scheme</span>'
      : '<span class="badge-info-only">Info Only</span>';
    const badgeHtml = '<div class="card-badge-wrap">' + jobBadge + officialBadge + '</div>';
    const lastVerifiedText = formatLastVerified(s.lastVerifiedAt);
    const linkText = s.type === "job" ? "View Job Notification" : "Apply / Details";

    const card = document.createElement("div");
    card.className = "card";
    if (s && s._id) {
      card.dataset.schemeId = String(s._id);
    }
    card.innerHTML = `
      ${badgeHtml}
      <div class="badge-ai-match" data-ai-match="pending" style="display:none;">
        <span>AI Match</span>
        <span class="ai-pill">--%</span>
      </div>
      <h3>${s.name}</h3>
      <p><strong>Description:</strong> ${s.description}</p>
      <p><strong>Category:</strong> ${s.category}</p>
      <p><strong>Eligibility:</strong> Age: ${s.age}, Gender: ${s.gender}, Qualification: ${s.qualification}, Income: ${s.income}, Community: ${s.community}</p>
      <p><strong>Benefits:</strong> ${s.benefits || '—'}</p>
      <p><strong>Deadline:</strong> ${s.deadline}</p>
      <p class="card-last-verified">🕒 Last verified: ${lastVerifiedText}</p>
      <a href="${validLink}" target="_blank">${linkText}</a>
      <button class="applyBtn">Mark as Applied</button>
    `;
    results.appendChild(card);

    const applyBtn = card.querySelector(".applyBtn");
    applyBtn.addEventListener("click", () => {
      const schemeId = card.dataset.schemeId;
      if (!schemeId) {
        alert("Unable to apply: missing scheme id for this scheme.");
        return;
      }
      saveApplied(s.name, schemeId, applyBtn);
    });
  });

  // After rendering, fetch and paint AI match badges (if logged in)
  paintAIMatchBadges();
}

// ===== Backend API helpers =====
// Active tab: "scheme" or "job" (drives type filter for GET /api/schemes)
let activeTab = "scheme";
// Cached job data for client-side filtering (jobQualification, jobDepartment)
let lastFetchedJobData = [];

// Base URL for the backend schemes API
// (Previously data came from schemes.js; now it is loaded from the server)
const API_BASE_URL = "http://localhost:3001/api/schemes";
// Base URL for user-related APIs (e.g., applied schemes for a user)
const USER_API_BASE_URL = "http://localhost:3001/api/users";
// Spec-driven endpoints for apply + profile
const APPLY_SCHEME_API_URL = "http://localhost:3001/api/apply-scheme";
const USER_PROFILE_API_URL = "http://localhost:3001/api/user-profile";
const MATCH_API_URL = "http://localhost:3001/api/schemes/match-scores";

let lastMatchScores = {};

function getAuthToken() {
  return localStorage.getItem("authToken") || "";
}

function getMatchBadgeClass(score) {
  if (score >= 85) return "match-high";
  if (score >= 70) return "match-mid";
  return "match-low";
}

function applyRecommendedFilterToRenderedCards() {
  const onlyRecommended = Boolean(document.getElementById("recommendedOnly")?.checked);
  const cards = Array.from(document.querySelectorAll(".card"));
  cards.forEach((card) => {
    const s = Number(card.dataset.matchScore || "");
    if (!onlyRecommended) {
      card.style.display = "";
      return;
    }
    if (Number.isFinite(s) && s >= 70) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });
}

async function paintAIMatchBadges() {
  const token = getAuthToken();
  if (!token) return;

  const cards = Array.from(document.querySelectorAll(".card"));
  const schemeIds = cards.map((c) => c.dataset.schemeId).filter(Boolean);
  if (schemeIds.length === 0) return;

  try {
    const res = await fetch(MATCH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ schemeIds }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return;

    lastMatchScores = data.scores || {};

    cards.forEach((card) => {
      const id = card.dataset.schemeId;
      const info = id ? lastMatchScores[id] : null;
      const badge = card.querySelector(".badge-ai-match");
      if (!badge) return;

      if (!info || typeof info.matchScore !== "number") {
        badge.style.display = "none";
        return;
      }

      const score = info.matchScore;
      const level = info.matchLevel || "Match";
      card.dataset.matchScore = String(score);

      badge.classList.remove("match-high", "match-mid", "match-low");
      badge.classList.add(getMatchBadgeClass(score));
      badge.style.display = "inline-flex";
      badge.title = `${level} (${score}%)`;
      const pill = badge.querySelector(".ai-pill");
      if (pill) pill.textContent = `${score}%`;
    });

    applyRecommendedFilterToRenderedCards();
  } catch (e) {
    // silent fail - do not break existing UI
    console.warn("AI match badge failed:", e);
  }
}

/**
 * Apply job-specific filters (qualification, department) to job data.
 * Used only when activeTab === "job". Filters client-side.
 */
function applyJobFilters(jobs) {
  const jobQual = (document.getElementById("jobQualification") || {}).value || "";
  const jobDept = (document.getElementById("jobDepartment") || {}).value || "";
  if (!Array.isArray(jobs)) return [];
  return jobs.filter((item) => {
    if (jobQual && item.qualification !== jobQual) return false;
    if (jobDept && !(item.name && item.name.toUpperCase().includes(jobDept))) return false;
    return true;
  });
}

/**
 * Fetch schemes from the backend API with optional filters
 * and render them using the existing renderCards() function.
 */
async function fetchSchemes(filters = {}) {
  // Build query string from non-empty filters
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "") {
      params.append(key, value);
    }
  });

  const url = params.toString()
    ? `${API_BASE_URL}?${params.toString()}`
    : API_BASE_URL;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch schemes from server");
    }

    const data = await response.json();
    // Log how many schemes were received from the backend before rendering
    console.log("Fetched schemes count:", Array.isArray(data) ? data.length : "not an array");

    if (filters.type === "job") {
      lastFetchedJobData = Array.isArray(data) ? data : [];
      const filtered = applyJobFilters(lastFetchedJobData);
      renderCards(filtered);
    } else {
      renderCards(data);
    }
  } catch (error) {
    console.error("Error fetching schemes:", error);
    // Show no-results message if the request fails
    renderCards([]);
  }
}

// ===== Filter Results =====
// Mapping objects: convert UI dropdown values into backend-compatible values
const ageMap = {
  "Below 25": "student",
  "25–60": "adult",
  "Above 60": "senior",
  "All": "all",
  "": ""
};

const qualificationMap = {
  "SSLC": "sslc",
  "HSC": "hsc",
  "UG": "ug",
  "PG": "pg",
  "All": "all",
  "": ""
};

const genderMap = {
  "Male": "male",
  "Female": "female",
  "All": "all",
  "": ""
};

const incomeMap = {
  "Below ₹2.5 L": "low",
  "₹2.5–5 L": "middle",
  "Above ₹5 L": "high",
  "All": "all",
  "": ""
};

const communityMap = {
  "SC": "sc",
  "ST": "st",
  "BC": "bc",
  "MBC": "mbc",
  "General": "general",
  "All": "all",
  "": ""
};

// Instead of filtering in the browser using schemes.js,
// send the current (mapped) filter values as query parameters to the backend API.
async function filterResults() {
  // Read raw UI values from dropdowns
  const search = document.getElementById("searchBox").value.trim();
  let category = document.getElementById("categoryFilter").value;
  let ageUI = document.getElementById("ageFilter").value;
  let genderUI = document.getElementById("genderFilter").value;
  let qualificationUI = document.getElementById("qualificationFilter").value;
  let incomeUI = document.getElementById("incomeFilter").value;
  let communityUI = document.getElementById("communityFilter").value;

  // Convert default placeholder labels to empty strings so they are not sent
  if (category === "Category") category = "";
  if (ageUI === "Age") ageUI = "";
  if (genderUI === "Gender") genderUI = "";
  if (qualificationUI === "Qualification") qualificationUI = "";
  if (incomeUI === "Income") incomeUI = "";
  if (communityUI === "Community") communityUI = "";

  // Map UI values to backend-compatible values (only if not empty)
  let ageMapped = ageUI ? (ageMap[ageUI] || ageUI) : "";
  let genderMapped = genderUI ? (genderMap[genderUI] || genderUI) : "";
  let qualificationMapped = qualificationUI ? (qualificationMap[qualificationUI] || qualificationUI) : "";
  let incomeMapped = incomeUI ? (incomeMap[incomeUI] || incomeUI) : "";
  let communityMapped = communityUI ? (communityMap[communityUI] || communityUI) : "";

  // Treat \"all\" selections as no filter (empty string)
  if (ageMapped === "all") ageMapped = "";
  if (genderMapped === "all") genderMapped = "";
  if (qualificationMapped === "all") qualificationMapped = "";
  if (incomeMapped === "all") incomeMapped = "";
  if (communityMapped === "all") communityMapped = "";

  // Build filters object only with non-empty, mapped values (include type from active tab)
  const filters = {};
  filters.type = activeTab;
  if (search) filters.search = search;
  if (category) filters.category = category;
  if (ageMapped) filters.age = ageMapped;
  if (genderMapped) filters.gender = genderMapped;
  if (qualificationMapped) filters.qualification = qualificationMapped;
  if (incomeMapped) filters.income = incomeMapped;
  if (communityMapped) filters.community = communityMapped;

  // Log the final filters being sent to the API for debugging
  console.log("Final filters sent:", filters);

  await fetchSchemes(filters);
}

// Attach events (exclude job filters - they use onJobFilterChange)
document.querySelectorAll("#searchBox, #categoryFilter, #ageFilter, #genderFilter, #qualificationFilter, #incomeFilter, #communityFilter")
  .forEach(el => el.addEventListener("input", filterResults));
document.querySelectorAll("select:not(#jobQualification):not(#jobDepartment)").forEach(el => el.addEventListener("change", filterResults));
document.getElementById("recommendedOnly")?.addEventListener("change", () => {
  applyRecommendedFilterToRenderedCards();
});

// Job filter change: re-filter cached job data and re-render (no re-fetch)
function onJobFilterChange() {
  if (activeTab !== "job") return;
  const filtered = applyJobFilters(lastFetchedJobData);
  renderCards(filtered);
}
document.getElementById("jobQualification")?.addEventListener("change", onJobFilterChange);
document.getElementById("jobDepartment")?.addEventListener("change", onJobFilterChange);

// ===== Tabs: Schemes | Jobs =====
const tabSchemes = document.getElementById("tabSchemes");
const tabJobs = document.getElementById("tabJobs");

const jobFiltersEl = document.getElementById("jobFilters");

tabSchemes.addEventListener("click", () => {
  activeTab = "scheme";
  tabSchemes.classList.add("active");
  tabSchemes.setAttribute("aria-selected", "true");
  tabJobs.classList.remove("active");
  tabJobs.setAttribute("aria-selected", "false");
  jobFiltersEl.style.display = "none";
  filterResults();
});

tabJobs.addEventListener("click", () => {
  activeTab = "job";
  tabJobs.classList.add("active");
  tabJobs.setAttribute("aria-selected", "true");
  tabSchemes.classList.remove("active");
  tabSchemes.setAttribute("aria-selected", "false");
  jobFiltersEl.style.display = "flex";
  filterResults();
});

// ===== Route Guard: Require Login for Main Portal =====
// If there is no authToken in localStorage, redirect to login.html.
// This protects direct access to index.html (and /dashboard which serves index.html).
window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  // Once authenticated, proceed with normal portal initialization.
  loadProfileFromBackendIfAvailable().finally(() => {
    loadProfile();
  });
  initAuthHeader();
  initUserDropdown();
  // Initial fetch: schemes tab active by default
  fetchSchemes({ type: "scheme" });
});

// ===== Profile Handling =====
const profileLogo = document.getElementById("profileLogo");
const profileModal = document.getElementById("profileModal");
const closeModal = document.getElementById("closeModal");

// Auth header: toggle Login/Register vs avatar + dropdown based on stored JWT token
function initAuthHeader() {
  const token = localStorage.getItem("authToken");
  const authButtons = document.getElementById("authButtons");
  const userMenu = document.getElementById("userMenu");

  if (!authButtons || !userMenu) return;

  if (token) {
    authButtons.style.display = "none";
    userMenu.style.display = "flex";
  } else {
    authButtons.style.display = "flex";
    userMenu.style.display = "none";
  }
}

// User dropdown: toggle on avatar click, close on outside click; Profile opens modal, Logout clears session
function initUserDropdown() {
  const avatarBtn = document.getElementById("avatarBtn");
  const userDropdown = document.getElementById("userDropdown");
  const profileMenuItem = document.getElementById("profileMenuItem");
  const logoutBtn = document.getElementById("logoutBtn");

  function openModal() {
    loadProfile();
    loadAppliedSchemesFromBackend();
    profileModal.style.display = "block";
  }

  function toggleDropdown(e) {
    e.stopPropagation();
    const open = userDropdown.classList.toggle("open");
    avatarBtn.setAttribute("aria-expanded", open);
  }

  function closeDropdown() {
    userDropdown.classList.remove("open");
    avatarBtn.setAttribute("aria-expanded", "false");
  }

  avatarBtn?.addEventListener("click", toggleDropdown);
  profileMenuItem?.addEventListener("click", (e) => {
    e.preventDefault();
    closeDropdown();
    openModal();
  });
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    window.location.href = "login.html";
  });
  document.addEventListener("click", closeDropdown);
}

// Open modal (used by Profile menu item; profileLogo is inside avatar btn)

// Close modal
closeModal.addEventListener("click", () => {
  profileModal.style.display = "none";
});

// Save profile
document.getElementById("saveProfile").addEventListener("click", () => {
  const username = document.getElementById("username").value;
  const logo = document.getElementById("profileLogo").src;
  const age = document.getElementById("profileAge")?.value;
  const gender = document.getElementById("profileGender")?.value;
  const qualification = document.getElementById("profileQualification")?.value;
  const income = document.getElementById("profileIncome")?.value;
  const community = document.getElementById("profileCommunity")?.value;

  const profile = { username, logo, applied: getAppliedList(), profile: { age, gender, qualification, income, community } };
  localStorage.setItem("userProfile", JSON.stringify(profile));

  // Also save eligibility profile into MongoDB for AI matching (non-blocking)
  saveProfileToBackend({ age, gender, qualification, income, community })
    .then(() => {
      alert("✅ Profile saved!");
      profileModal.style.display = "none";
      // Repaint badges since profile changed
      paintAIMatchBadges();
    })
    .catch(() => {
      alert("✅ Profile saved locally. (Backend profile save failed)");
      profileModal.style.display = "none";
      paintAIMatchBadges();
    });
});

// Upload logo
document.getElementById("uploadLogo").addEventListener("change", function() {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      profileLogo.src = e.target.result;
      saveProfileLogo(e.target.result);
    };
    reader.readAsDataURL(file);
  }
});

async function saveApplied(name, schemeId, buttonEl) {
  const token = getAuthToken();
  if (!token) {
    alert("Please log in again to apply for this scheme.");
    return;
  }

  try {
    const res = await fetch(APPLY_SCHEME_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ schemeId }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.message || "Failed to apply for this scheme. Please try again.");
      return;
    }

    // Mirror applied state into localStorage profile for offline display
    const profile = JSON.parse(localStorage.getItem("userProfile")) || { applied: [] };
    if (!Array.isArray(profile.applied)) profile.applied = [];
    if (!profile.applied.includes(name)) {
      profile.applied.push(name);
      localStorage.setItem("userProfile", JSON.stringify(profile));
    }

    if (buttonEl) {
      buttonEl.disabled = true;
      buttonEl.textContent = "✔ Applied";
    }

    alert("You have successfully applied for this scheme");
  } catch (e) {
    console.error("Error applying for scheme:", e);
    alert("Failed to apply for this scheme. Please try again.");
  }
}

function loadProfile() {
  const saved = JSON.parse(localStorage.getItem("userProfile"));
  const appliedList = document.getElementById("appliedList");
  appliedList.innerHTML = "";

  if (saved) {
    document.getElementById("username").value = saved.username || "";
    if (saved.logo) profileLogo.src = saved.logo;
    const p = saved.profile || {};
    if (document.getElementById("profileAge")) document.getElementById("profileAge").value = p.age || "";
    if (document.getElementById("profileGender")) document.getElementById("profileGender").value = p.gender || "";
    if (document.getElementById("profileQualification")) document.getElementById("profileQualification").value = p.qualification || "";
    if (document.getElementById("profileIncome")) document.getElementById("profileIncome").value = p.income || "";
    if (document.getElementById("profileCommunity")) document.getElementById("profileCommunity").value = p.community || "";
    (saved.applied || []).forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      appliedList.appendChild(li);
    });
  }
}

async function saveProfileToBackend(profile) {
  const token = getAuthToken();
  if (!token) return;
  const res = await fetch(`${USER_API_BASE_URL}/me/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ profile }),
  });
  if (!res.ok) throw new Error("Failed to save profile");
  return res.json().catch(() => ({}));
}

async function loadProfileFromBackendIfAvailable() {
  const token = getAuthToken();
  if (!token) return;
  try {
    const res = await fetch(USER_PROFILE_API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return;

    const saved = JSON.parse(localStorage.getItem("userProfile")) || {};
    saved.username = data.username || saved.username || "";
    saved.profile = {
      ...(saved.profile || {}),
      ...((data.profile || {})),
    };
    // Also mirror appliedSchemes names for local display
    if (Array.isArray(data.appliedSchemes)) {
      saved.applied = data.appliedSchemes
        .map((item) => item && item.schemeName)
        .filter(Boolean);
    }
    localStorage.setItem("userProfile", JSON.stringify(saved));
  } catch (e) {
    // ignore
  }
}

function getAppliedList() {
  const saved = JSON.parse(localStorage.getItem("userProfile"));
  return saved ? saved.applied || [] : [];
}

function saveProfileLogo(logo) {
  const saved = JSON.parse(localStorage.getItem("userProfile")) || {};
  saved.logo = logo;
  localStorage.setItem("userProfile", JSON.stringify(saved));
}

/**
 * Load applied schemes for the current user from the backend
 * and display them in the profile modal.
 * Uses GET /api/user-profile (JWT).
 */
async function loadAppliedSchemesFromBackend() {
  const token = getAuthToken();
  if (!token) return;

  try {
    const res = await fetch(USER_PROFILE_API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Failed to fetch user profile for applied schemes");
      return;
    }

    const appliedList = document.getElementById("appliedList");
    appliedList.innerHTML = "";

    const applied = Array.isArray(data.appliedSchemes) ? data.appliedSchemes : [];
    applied.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item.schemeName || "";
      appliedList.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading applied schemes from backend:", error);
  }
}
