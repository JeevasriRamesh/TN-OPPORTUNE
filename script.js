// ===== Render Cards =====
function renderCards(data) {
  const results = document.getElementById("results");
  results.innerHTML = "";

  if (data.length === 0) {
    results.innerHTML = "<p class='no-results'>❌ No jobs or schemes available for your search.</p>";
    return;
  }

  data.forEach(s => {
    const validLink = (s.link && s.link.startsWith("http")) ? s.link : "https://www.tn.gov.in/";
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${s.name}</h3>
      <p><strong>Description:</strong> ${s.description}</p>
      <p><strong>Category:</strong> ${s.category}</p>
      <p><strong>Eligibility:</strong> Age: ${s.age}, Gender: ${s.gender}, Qualification: ${s.qualification}, Income: ${s.income}, Community: ${s.community}</p>
      <p><strong>Benefits:</strong> ${s.benefits || '—'}</p>
      <p><strong>Deadline:</strong> ${s.deadline}</p>
      <a href="${validLink}" target="_blank">Apply / Details</a>
      <button class="applyBtn">Mark as Applied</button>
    `;
    results.appendChild(card);

    card.querySelector(".applyBtn").addEventListener("click", () => {
      saveApplied(s.name);
    });
  });
}

// ===== Filter Results =====
function filterResults() {
  const searchVal = document.getElementById("searchBox").value.toLowerCase();
  const categoryVal = document.getElementById("categoryFilter").value;
  const ageVal = document.getElementById("ageFilter").value;
  const genderVal = document.getElementById("genderFilter").value;
  const qualVal = document.getElementById("qualificationFilter").value;
  const incomeVal = document.getElementById("incomeFilter").value;
  const communityVal = document.getElementById("communityFilter").value;

  const filtered = schemes.filter(s =>
    (s.name.toLowerCase().includes(searchVal)) &&
    (categoryVal === "" || s.category === categoryVal) &&
    (ageVal === "" || s.age === ageVal || s.age === "all") &&
    (genderVal === "" || s.gender === genderVal || s.gender === "all") &&
    (qualVal === "" || s.qualification === qualVal || qualVal === "all") &&
    (incomeVal === "" || s.income === incomeVal || incomeVal === "all") &&
    (communityVal === "" || s.community === communityVal || communityVal === "all")
  );

  renderCards(filtered);
}

// Attach events
document.querySelectorAll("#searchBox, #categoryFilter, #ageFilter, #genderFilter, #qualificationFilter, #incomeFilter, #communityFilter")
  .forEach(el => el.addEventListener("input", filterResults));
document.querySelectorAll("select").forEach(el => el.addEventListener("change", filterResults));

// Initial render
renderCards(schemes);

// ===== Profile Handling =====
const profileLogo = document.getElementById("profileLogo");
const profileModal = document.getElementById("profileModal");
const closeModal = document.getElementById("closeModal");

// Load saved profile on startup
window.addEventListener("DOMContentLoaded", () => {
  loadProfile();
});

// Open modal
profileLogo.addEventListener("click", () => {
  loadProfile();
  profileModal.style.display = "block";
});

// Close modal
closeModal.addEventListener("click", () => {
  profileModal.style.display = "none";
});

// Save profile
document.getElementById("saveProfile").addEventListener("click", () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const logo = document.getElementById("profileLogo").src;

  const profile = { username, password, logo, applied: getAppliedList() };
  localStorage.setItem("userProfile", JSON.stringify(profile));
  alert("✅ Profile saved!");
  profileModal.style.display = "none";
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

function saveApplied(name) {
  const profile = JSON.parse(localStorage.getItem("userProfile")) || { applied: [] };
  if (!profile.applied.includes(name)) {
    profile.applied.push(name);
    localStorage.setItem("userProfile", JSON.stringify(profile));
    alert(`✅ ${name} marked as applied!`);
  }
}

function loadProfile() {
  const saved = JSON.parse(localStorage.getItem("userProfile"));
  const appliedList = document.getElementById("appliedList");
  appliedList.innerHTML = "";

  if (saved) {
    document.getElementById("username").value = saved.username || "";
    document.getElementById("password").value = saved.password || "";
    if (saved.logo) profileLogo.src = saved.logo;
    (saved.applied || []).forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      appliedList.appendChild(li);
    });
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
