// ══════════════════════════════════════════════
//  DARKMODE
// ══════════════════════════════════════════════
if (localStorage.getItem("afri_theme") === "dark") document.body.classList.add("dark");

const userList = document.getElementById("userList");
const searchInput = document.getElementById("searchUser");

const API_BASE = "https://afrisocial-backend.onrender.com";
const token = localStorage.getItem("token");
const nextBtn = document.getElementById("nextBtn");
const followProgress = document.getElementById("followProgress");

if (!token) window.location.href = "/log-in.html";

// Track follow count — Next btn disabled until 5 follows
let followCount = 0;
let cachedUsers = [];
nextBtn.disabled = true;

nextBtn.addEventListener("click", () => {
  if (nextBtn.disabled) return;
  window.location.href = "feed.html";
});

// Helpers
function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "";
  return countryCode
    .toUpperCase()
    .replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt()));
}

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function updateProgress() {
  const remaining = Math.max(5 - followCount, 0);
  followProgress.textContent = remaining === 0
    ? "You're ready to continue"
    : `Follow ${remaining} more ${remaining === 1 ? "person" : "people"} to continue`;
  nextBtn.disabled = followCount < 5;
}

function renderSkeletons(count = 8) {
  userList.innerHTML = Array.from({ length: count }, () => `
    <li class="user-skeleton">
      <div class="user-info">
        <div class="sk-avatar sk-shimmer"></div>
        <div class="sk-stack">
          <div class="sk-line sk-name sk-shimmer"></div>
          <div class="sk-line sk-handle sk-shimmer"></div>
          <div class="sk-line sk-meta sk-shimmer"></div>
        </div>
      </div>
      <div class="sk-button sk-shimmer"></div>
    </li>
  `).join("");
}

// Fetch suggested users
async function fetchSuggestedUsers() {
  try {
    const res = await fetch(`${API_BASE}/api/users/suggested`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error(`Suggestions failed: ${res.status}`);
    const data = await res.json();
    return data.users || [];
  } catch (err) {
    console.error("Failed to fetch suggested users:", err);
    return [];
  }
}

// Render users list
function renderUsers(users) {
  userList.innerHTML = "";

  if (users.length === 0) {
    userList.innerHTML = "<li class='empty-state'>No accounts found</li>";
    return;
  }

  users.forEach(user => {
    const li = document.createElement("li");
    li.classList.add("user-item");

    const displayCountry = user.country && user.country !== "Not set"
      ? escapeHTML(user.country)
      : "Africa";

    li.innerHTML = `
      <div class="user-info">
        <img src="${user.profilePicture ||
          '/uploads/images/africa.png'}" alt="${escapeHTML(user.fullName)}" onerror="this.src='/uploads/images/africa.png'">
        <div class="user-copy">
          <div class="user-name">
            ${escapeHTML(user.fullName)}
            ${user.isVerified ? `
            <svg class="verified-icon" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#1DA1F2"/>
              <path d="M9 12l2 2 4-4" stroke="white"
                stroke-width="2" fill="none"/>
            </svg>` : ""}
          </div>
          <div class="user-country">@${escapeHTML(user.username)} · ${getFlagEmoji(user.country)} ${displayCountry}</div>
          <div class="user-activity">🔥 ${Number(user.activityScore || 0)} recent actions</div>
        </div>
      </div>
      <button class="follow-btn" data-id="${user._id}">Follow</button>
    `;

    userList.appendChild(li);

    const followBtn = li.querySelector(".follow-btn");
    followBtn.addEventListener("click", async () => {
      followBtn.disabled = true;
      followBtn.textContent = "Following";

      const success = await followUser(user._id);

      if (success) {
        followCount++;

        if (followCount >= 5) {
          updateProgress();
        }
        updateProgress();

        // Remove user from list after short delay
        setTimeout(() => li.remove(), 500);
      } else {
        // Revert if failed
        followBtn.disabled = false;
        followBtn.textContent = "Follow";
      }
    });
  });
}

// Follow user
async function followUser(userId) {
  try {
    const res = await fetch(`${API_BASE}/api/users/follow/${userId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();

    if (res.ok && data.isFollowing) {
      console.log(data.message);
      return true;
    } else {
      console.warn("Follow failed:", data.message);
      return false;
    }
  } catch (err) {
    console.error("Failed to follow user:", err);
    return false;
  }
}

// Filter users as you type
searchInput.addEventListener("input", async (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = cachedUsers.filter(u =>
    (u.fullName || "").toLowerCase().includes(query) ||
    (u.username || "").toLowerCase().includes(query)
  );
  renderUsers(filtered);
});

// Initial fetch
updateProgress();
renderSkeletons();
fetchSuggestedUsers().then(users => {
  cachedUsers = users;
  renderUsers(cachedUsers);
});
