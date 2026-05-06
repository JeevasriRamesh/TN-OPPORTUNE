/**
 * auth.js
 * Frontend authentication helpers for login and registration.
 * Uses the existing backend API at POST /api/auth/login and /api/auth/register.
 */

const AUTH_API_BASE = "http://localhost:3001/api/auth";

// ===== Theme management (shared with dashboard) =====
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

// Initialise theme early on auth pages
initThemeToggle();

function saveAuth(token, user) {
  if (token) {
    localStorage.setItem("authToken", token);
  }
  if (user) {
    localStorage.setItem("authUser", JSON.stringify(user));
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const emailEl = document.getElementById("loginEmail");
  const passwordEl = document.getElementById("loginPassword");
  const email = emailEl?.value.trim();
  const password = passwordEl?.value;
  const roleInput = document.querySelector('input[name="role"]:checked');
  const role = roleInput ? roleInput.value : "user";

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  try {
    const res = await fetch(`${AUTH_API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    saveAuth(data.token, data.user);

    const normalisedEmail = String(email).toLowerCase().trim();
    const ADMIN_EMAILS = [
      "jeevasripr@gmail.com",
      "aneesanees1035@gmail.com",
    ];

    // Frontend redirect logic AFTER successful login response
    if (role === "admin") {
      if (!ADMIN_EMAILS.includes(normalisedEmail)) {
        alert("You are not authorized as admin.");
        return;
      }
      window.location.href = "/admin";
    } else {
      // Normal user -> main dashboard page (index.html)
      window.location.href = "index.html";
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Login failed. Please try again.");
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const emailEl = document.getElementById("registerEmail");
  const passwordEl = document.getElementById("registerPassword");
  const email = emailEl?.value.trim();
  const password = passwordEl?.value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  try {
    const res = await fetch(`${AUTH_API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    saveAuth(data.token, data.user);
    window.location.href = "index.html";
  } catch (err) {
    console.error("Register error:", err);
    alert("Registration failed. Please try again.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // If a valid auth token is already present, skip the login/register
  // screens and go straight to the dashboard.
  const existingToken = localStorage.getItem("authToken");
  if (existingToken) {
    window.location.href = "/dashboard";
    return;
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }
});

