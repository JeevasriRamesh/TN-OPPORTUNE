/**
 * admin.js
 * Admin dashboard: fetches pending auto-fetched items and handles approve actions.
 */

const API_BASE = "http://localhost:3001/api/admin";

let adminItemsType = "scheme";

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) return;
    const data = await res.json();
    document.getElementById("statTotal").textContent = data.totalItems ?? "—";
    document.getElementById("statSchemes").textContent = data.totalSchemes ?? "—";
    document.getElementById("statJobs").textContent = data.totalJobs ?? "—";
    document.getElementById("statApproved").textContent = data.approvedCount ?? "—";
    document.getElementById("statPending").textContent = data.pendingCount ?? "—";
  } catch (err) {
    console.error("Failed to load stats:", err);
  }
}

function renderPending(items) {
  const list = document.getElementById("pendingList");
  const noPending = document.getElementById("noPending");

  list.innerHTML = "";

  if (!items || items.length === 0) {
    noPending.style.display = "block";
    return;
  }

  noPending.style.display = "none";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "pending-item";
    li.dataset.id = item._id;
    const sourceUrl = item.sourceUrl || item.link || "#";
    const typeLabel = (item.type || "scheme") === "job" ? "Job" : "Scheme";
    li.innerHTML = `
      <div class="pending-item-info">
        <div class="pending-item-name">${escapeHtml(item.name || "—")}</div>
        <div class="pending-item-type">Type: ${escapeHtml(typeLabel)}</div>
        <div class="pending-item-source">
          <a href="${escapeAttr(sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(sourceUrl)}</a>
        </div>
      </div>
      <button class="approve-btn" data-id="${escapeAttr(item._id)}">Approve</button>
    `;

    li.querySelector(".approve-btn").addEventListener("click", () => approveItem(item._id, li));
    list.appendChild(li);
  });
}

function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatDate(dateVal) {
  if (!dateVal) return "—";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatApprovedDate(dateVal) {
  return formatDate(dateVal);
}

function renderRecentlyApproved(items) {
  const list = document.getElementById("recentlyApprovedList");
  const noItems = document.getElementById("noRecentlyApproved");
  list.innerHTML = "";

  if (!items || items.length === 0) {
    noItems.style.display = "block";
    return;
  }
  noItems.style.display = "none";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "recently-approved-item";
    const typeLabel = (item.type || "scheme") === "job" ? "Job" : "Scheme";
    const dateStr = formatApprovedDate(item.approvedAt);
    li.innerHTML = `
      <div>
        <div class="item-name">${escapeHtml(item.name || "—")}</div>
        <div class="item-meta">${escapeHtml(typeLabel)} · Approved ${escapeHtml(dateStr)}</div>
      </div>
    `;
    list.appendChild(li);
  });
}

async function loadRecentlyApproved() {
  try {
    const res = await fetch(`${API_BASE}/recentlyApproved`);
    if (!res.ok) return;
    const data = await res.json();
    renderRecentlyApproved(data);
  } catch (err) {
    console.error("Failed to load recently approved:", err);
  }
}

function renderAdminTable(items) {
  const tbody = document.getElementById("adminTableBody");
  const noItems = document.getElementById("noTableItems");
  tbody.innerHTML = "";

  if (!items || items.length === 0) {
    noItems.style.display = "block";
    return;
  }
  noItems.style.display = "none";

  items.forEach((item) => {
    const tr = document.createElement("tr");
    const typeLabel = (item.type || "scheme") === "job" ? "Job" : "Scheme";
    const statusLabel = (item.status || "active") === "active" ? "Active" : "Expired";
    const verified = item.verified === true ? "Yes" : "No";
    const approved = item.verified === true || item.approvedAt ? "Yes" : "No";
    const lastVerified = formatDate(item.lastVerifiedAt);
    const isActive = (item.status || "active") === "active";

    tr.className = isActive ? "row-active" : "row-expired";
    tr.dataset.id = item._id;

    let actionsHtml = "";
    if (item.verified !== true) {
      actionsHtml += `<button class="btn-approve" data-id="${escapeAttr(item._id)}">Approve</button>`;
    }
    actionsHtml += `<button class="btn-edit">Edit</button>`;
    if (isActive) {
      actionsHtml += `<button class="btn-expire" data-id="${escapeAttr(item._id)}">Disable</button>`;
    }

    tr.innerHTML = `
      <td>${escapeHtml(item.name || "—")}</td>
      <td>${escapeHtml(typeLabel)}</td>
      <td>${escapeHtml(item.category || "—")}</td>
      <td>${escapeHtml(statusLabel)}</td>
      <td>${escapeHtml(verified)}</td>
      <td>${escapeHtml(approved)}</td>
      <td>${escapeHtml(lastVerified)}</td>
      <td class="actions-cell">${actionsHtml}</td>
    `;

    tr.querySelector(".btn-approve")?.addEventListener("click", () => approveItemFromTable(item._id, tr));
    tr.querySelector(".btn-expire")?.addEventListener("click", () => expireItem(item._id, tr));
    tr.querySelector(".btn-edit")?.addEventListener("click", () => { /* placeholder */ });

    tbody.appendChild(tr);
  });
}

async function loadAdminItems() {
  try {
    const res = await fetch(`${API_BASE}/items?type=${adminItemsType}`);
    if (!res.ok) throw new Error("Failed to fetch items");
    const data = await res.json();
    renderAdminTable(data);
  } catch (err) {
    console.error(err);
    document.getElementById("adminTableBody").innerHTML = "";
    document.getElementById("noTableItems").style.display = "block";
    document.getElementById("noTableItems").textContent = "Failed to load items. Is the backend running?";
  }
}

async function approveItemFromTable(id, rowEl) {
  const btn = rowEl.querySelector(".btn-approve");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Approving...";
  }
  try {
    const res = await fetch(`${API_BASE}/approve/${id}`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Approve failed");
    loadAdminItems();
    loadStats();
    loadPending();
    loadRecentlyApproved();
  } catch (err) {
    console.error(err);
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Approve";
      alert("Failed to approve: " + err.message);
    }
  }
}

async function expireItem(id, rowEl) {
  const btn = rowEl.querySelector(".btn-expire");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Expiring...";
  }
  try {
    const res = await fetch(`${API_BASE}/expire/${id}`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Expire failed");
    loadAdminItems();
    loadStats();
  } catch (err) {
    console.error(err);
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Disable";
      alert("Failed to expire: " + err.message);
    }
  }
}

function initAdminTabs() {
  const tabSchemes = document.getElementById("adminTabSchemes");
  const tabJobs = document.getElementById("adminTabJobs");
  tabSchemes?.addEventListener("click", () => {
    adminItemsType = "scheme";
    tabSchemes.classList.add("active");
    tabJobs.classList.remove("active");
    loadAdminItems();
  });
  tabJobs?.addEventListener("click", () => {
    adminItemsType = "job";
    tabJobs.classList.add("active");
    tabSchemes.classList.remove("active");
    loadAdminItems();
  });
}

async function loadPending() {
  try {
    const res = await fetch(`${API_BASE}/pending`);
    if (!res.ok) throw new Error("Failed to fetch pending");
    const data = await res.json();
    renderPending(data);
  } catch (err) {
    console.error(err);
    document.getElementById("pendingList").innerHTML =
      "<li class='no-pending'>Failed to load pending items. Is the backend running?</li>";
    document.getElementById("noPending").style.display = "none";
  }
}

async function approveItem(id, listEl) {
  const btn = listEl.querySelector(".approve-btn");
  btn.disabled = true;
  btn.textContent = "Approving...";

  try {
    const res = await fetch(`${API_BASE}/approve/${id}`, { method: "POST" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Approve failed");
    }

    listEl.remove();
    const remaining = document.querySelectorAll(".pending-item");
    if (remaining.length === 0) {
      document.getElementById("noPending").style.display = "block";
    }
    loadStats();
    loadRecentlyApproved();
  } catch (err) {
    console.error(err);
    btn.disabled = false;
    btn.textContent = "Approve";
    alert("Failed to approve: " + err.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  initAdminTabs();
  loadAdminItems();
  loadPending();
  loadRecentlyApproved();
});
