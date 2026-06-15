// ══════════════════════════════════════════════
//  DARK MODE
// ══════════════════════════════════════════════
if (localStorage.getItem("afri_theme") === "dark") document.body.classList.add("dark");

// ══════════════════════════════════════════════
//  CONSTANTS
// ══════════════════════════════════════════════
const token         = localStorage.getItem("token");
const currentUserId = localStorage.getItem("userId");
const baseUrl       = "https://afrisocial-backend.onrender.com";
const isGuest       = !token;

const params        = new URLSearchParams(window.location.search);
const profileUserId = params.get("userId");
const isOwnProfile  = !profileUserId || profileUserId === currentUserId;

const OPTION_LABELS = ["A","B","C","D"];
const pollDataStore = {};

// ── Gift Catalogue ──
const PROFILE_GIFT_CATALOGUE = [
  { emoji: "❤️",  name: "Heart",      stars: 10  },
  { emoji: "🌹",  name: "Rose",       stars: 15  },
  { emoji: "🍎",  name: "Apple",      stars: 20  },
  { emoji: "🍇",  name: "Grapes",     stars: 25  },
  { emoji: "🌸",  name: "Blossom",    stars: 30  },
  { emoji: "🍓",  name: "Strawberry", stars: 40  },
  { emoji: "💐",  name: "Bouquet",    stars: 50  },
  { emoji: "🎂",  name: "Cake",       stars: 60  },
  { emoji: "🦋",  name: "Butterfly",  stars: 75  },
  { emoji: "💎",  name: "Diamond",    stars: 90  },
  { emoji: "👑",  name: "Crown",      stars: 120 },
  { emoji: "🏆",  name: "Trophy",     stars: 150 },
  { emoji: "🚀",  name: "Rocket",     stars: 200 },
  { emoji: "🎸",  name: "Guitar",     stars: 250 },
  { emoji: "🌍",  name: "Globe",      stars: 300 },
  { emoji: "🏎️",  name: "Sports Car", stars: 500 },
  { emoji: "🚁",  name: "Helicopter", stars: 750 },
  { emoji: "🚢",  name: "Cruise",     stars: 1000},
  { emoji: "🛸",  name: "UFO",        stars: 1500},
  { emoji: "🏰",  name: "Castle",     stars: 2000},
  { emoji: "🚗",  name: "Car",        stars: 3000},
  { emoji: "✈️",  name: "Jet",        stars: 5000},
];

// ══════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════
function getFlagEmoji(code) {
  if (!code) return "";
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt()));
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getMediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${baseUrl}${path}`;
}

function verifiedSvg() {
  return `<svg class="verified-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1DA1F2"/><path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/></svg>`;
}

function showToast(msg, color = "#111") {
  let t = document.getElementById("profileToast");
  if (!t) {
    t = document.createElement("div"); t.id = "profileToast";
    t.style.cssText = `position:fixed;bottom:90px;left:50%;transform:translateX(-50%) translateY(20px);font-size:14px;font-weight:500;padding:12px 22px;border-radius:22px;z-index:99999;opacity:0;pointer-events:none;white-space:nowrap;font-family:inherit;color:#fff;transition:opacity 0.25s,transform 0.25s;`;
    document.body.appendChild(t);
  }
  t.textContent = msg; t.style.background = color;
  t.style.opacity = "1"; t.style.transform = "translateX(-50%) translateY(0)";
  setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateX(-50%) translateY(20px)"; }, 2800);
}

function getBarClass(pct, maxPct) {
  if (pct === 0) return "low";
  return pct >= maxPct ? "high" : "low";
}

function openSideMenu() {
  document.getElementById("mySideMenu").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}

function closeSideMenu() {
  document.getElementById("mySideMenu").style.display = "none";
  document.getElementById("overlay").style.display = "none";
}

function showComingSoon() {
  document.getElementById("comingSoonModal").style.display = "flex";
  document.getElementById("mySideMenu").style.display = "none";
  document.getElementById("overlay").style.display = "none";
}

function closeComingSoon() {
  document.getElementById("comingSoonModal").style.display = "none";
}

// ══════════════════════════════════════════════
//  SOCIAL ICONS
// ══════════════════════════════════════════════
const SOCIAL_ICONS = {
  instagram: `<svg viewBox="0 0 24 24" width="20" height="20"><defs><radialGradient id="iga" cx="30%" cy="107%" r="150%"><stop offset="0%" stop-color="#fdf497"/><stop offset="45%" stop-color="#fd5949"/><stop offset="60%" stop-color="#d6249f"/><stop offset="90%" stop-color="#285AEB"/></radialGradient></defs><rect x="2" y="2" width="20" height="20" rx="5" fill="url(#iga)"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="white" stroke-width="1.8"/><circle cx="17.5" cy="6.5" r="1.2" fill="white"/></svg>`,
  facebook:  `<svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>`,
  x:         `<svg viewBox="0 0 24 24" width="20" height="20" fill="#000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  tiktok:    `<svg viewBox="0 0 24 24" width="20" height="20" fill="#000"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>`,
  youtube:   `<svg viewBox="0 0 24 24" width="20" height="20" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12 9.545 15.568z"/></svg>`,
  linkedin:  `<svg viewBox="0 0 24 24" width="20" height="20" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  snapchat:  `<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="12" fill="#FFFC00"/><path fill="#000" d="M12 4.2c-2.2 0-4 1.8-4 4v.9c0 .2 0 .3-.1.5l-.3 1.1c-.1.35-.45.6-.8.55l-.18-.03c-.09-.02-.18.03-.2.12v.01c0 .09.04.17.12.21.32.18.8.38 1.44.54.08.02.15.08.17.17l.06.32c.05.25.29.42.54.36l.02-.01c.23-.05.47-.08.71-.08.31 0 .63.04.96.14.6.18 1.15.58 1.66 1.2.12.14.23.29.33.43.05.07.13.1.22.1h.01c.09-.01.16-.07.18-.16.05-.14.19-.85.96-1.58.51-.47 1.06-.65 1.66-.65.24 0 .48.03.71.08l.02.01c.25.06.49-.11.54-.36l.06-.32c.02-.09.09-.15.17-.17.64-.16 1.12-.36 1.44-.54.08-.04.12-.12.12-.21v-.01c-.02-.09-.11-.14-.2-.12l-.18.03c-.35.05-.69-.2-.8-.55l-.3-1.1c-.06-.18-.09-.34-.09-.5v-.9c0-2.2-1.8-4-4-4z"/></svg>`,
  threads:   `<svg viewBox="0 0 24 24" width="20" height="20" fill="#000"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.473 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.61 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.292 1.148-.067 2.187.053 3.105.358-.126-.585-.375-1.05-.74-1.388-.516-.47-1.277-.707-2.264-.707h-.065c-.788.006-2.047.212-2.647 1.33l-1.733-.98c.545-1.021 1.478-2.237 4.126-2.25h.077c1.567 0 2.99.473 3.963 1.369 1.062.977 1.61 2.396 1.61 4.22 0 .293-.013.596-.039.898.768.537 1.36 1.2 1.733 1.97.836 1.818.867 4.502-1.47 6.783C17.394 23.19 15.276 24 12.186 24z"/></svg>`
};

const SOCIAL_NAMES = {
  instagram:"Instagram", facebook:"Facebook", x:"X / Twitter",
  tiktok:"TikTok", youtube:"YouTube", linkedin:"LinkedIn",
  snapchat:"Snapchat", threads:"Threads"
};

// ══════════════════════════════════════════════
//  TOP BAR
// ══════════════════════════════════════════════
const hamburgerWrap   = document.getElementById("hamburgerWrap");
const reportBlockWrap = document.getElementById("reportBlockWrap");

if (isOwnProfile) {
  hamburgerWrap.style.display   = "flex";
  reportBlockWrap.style.display = "none";
} else {
  hamburgerWrap.style.display   = "none";
  reportBlockWrap.style.display = "flex";
}

// ══════════════════════════════════════════════
//  OVERLAY + SHEETS
// ══════════════════════════════════════════════
const overlay = document.getElementById("overlay");
function showOverlay() { overlay.classList.remove("hidden"); }
function hideOverlay()  { overlay.classList.add("hidden"); }
function openSheet(id)  { document.getElementById(id).style.display = "block"; showOverlay(); }
function closeAllSheets() {
  document.querySelectorAll(".sheet-modal").forEach(m => { m.style.display = "none"; });
  hideOverlay();
}
overlay.addEventListener("click", closeAllSheets);

// ══════════════════════════════════════════════
//  GUEST MODAL
// ══════════════════════════════════════════════
const guestModal = document.getElementById("guestModal");
function showGuestModal() { guestModal.style.display = "flex"; }
document.getElementById("closeGuestModal").onclick = () => { guestModal.style.display = "none"; };
guestModal.addEventListener("click", e => { if (e.target === guestModal) guestModal.style.display = "none"; });

// ══════════════════════════════════════════════
//  OWNER vs PUBLIC ACTIONS
// ══════════════════════════════════════════════
function setupOwnerUI() {
  document.getElementById("ownerActions").style.display = "block";
  document.getElementById("publicActions").style.display = "none";
  document.querySelectorAll(".owner-only").forEach(el => { el.style.display = "inline-flex"; });
}

function setupPublicUI(userId, isFollowing) {
  document.getElementById("ownerActions").style.display = "none";
  document.getElementById("publicActions").style.display = "flex";
  document.querySelectorAll(".owner-only").forEach(el => { el.style.display = "none"; });
  setupFollowButton(userId, isFollowing);

  const giftBtn = document.getElementById("profileGiftBtn");
  if (giftBtn) {
    giftBtn.onclick = () => {
      if (isGuest) { showGuestModal(); return; }
      openProfileGiftModal(userId, document.getElementById("fullName").textContent.trim());
    };
  }
}

// ══════════════════════════════════════════════
//  LOAD PROFILE
// ══════════════════════════════════════════════
if (isOwnProfile && !isGuest) { loadMyProfile(); }
else if (profileUserId) { loadPublicProfile(profileUserId); }
else if (isGuest) { showGuestModal(); }

async function loadMyProfile() {
  try {
    const res  = await fetch(`${baseUrl}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } });
    const raw  = await res.json();
    if (!res.ok) throw new Error(raw.message);
    const data = raw.user || raw;
    fillProfileUI(data); setupOwnerUI();
    loadProfileLikesStars(data._id); loadProfilePosts(data._id);
    loadProfilePolls(data._id); loadFollowers(data._id);
    loadFollowing(data._id); loadAboutData(data);
  } catch (err) { console.error("loadMyProfile:", err); }
}

async function loadPublicProfile(userId) {
  try {
    const res  = await fetch(`${baseUrl}/api/users/${userId}`, { headers: { Authorization: token ? `Bearer ${token}` : "" } });
    const raw  = await res.json();
    if (!res.ok) throw new Error(raw.message);
    const data = raw.user || raw;
    fillProfileUI(data);
    setupPublicUI(userId, data.isFollowing ?? raw.isFollowing);
    initReportBlockBtn();
    loadProfileLikesStars(data._id); loadProfilePosts(data._id);
    loadProfilePolls(data._id); loadFollowers(data._id);
    loadFollowing(data._id); loadAboutData(data);

    const msgBtn = document.getElementById("messageBtn");
    if (msgBtn) {
      msgBtn.onclick = async () => {
        if (isGuest) { showGuestModal(); return; }
        try {
          const r    = await fetch(`${baseUrl}/api/messages/createConversation`, { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}, body:JSON.stringify({receiverId:userId}) });
          const conv = await r.json();
          window.location.href = `/message.html?conversationId=${conv._id}`;
        } catch (e) { console.error(e); }
      };
    }
  } catch (err) { console.error("loadPublicProfile:", err); }
}

// ══════════════════════════════════════════════
//  FILL UI
// ══════════════════════════════════════════════
function fillProfileUI(data) {
  if (!data) return;
  document.getElementById("fullName").textContent    = data.fullName || data.name || "Unknown";
  document.getElementById("username").textContent    = "@" + (data.username || "");
  document.getElementById("profilePic").src          = data.profilePicture || "/uploads/images/africa.png";
  document.getElementById("country").textContent     = getFlagEmoji(data.country || "");
  document.getElementById("joined").textContent      = data.createdAt ? "Joined " + new Date(data.createdAt).toDateString() : "";
  document.getElementById("followersCount").textContent = data.followersCount ?? (data.followers?.length ?? 0);
  document.getElementById("followingCount").textContent = data.followingCount ?? (data.following?.length ?? 0);
  const badge = document.getElementById("verifiedBadge");
  if (badge) badge.style.display = data.isVerified ? "inline-block" : "none";
  const fn = document.getElementById("editFullName");
  const un = document.getElementById("editUsername");
  const co = document.getElementById("editCountry");
  if (fn) fn.value = data.fullName || "";
  if (un) un.value = data.username || "";
  if (co) co.value = data.country  || "";
  const prev = document.getElementById("profilePreview");
  if (prev) prev.src = data.profilePicture || "/uploads/images/africa.png";
}

// ══════════════════════════════════════════════
//  ABOUT DATA
// ══════════════════════════════════════════════
function loadAboutData(data) {
  if (!data) return;
  document.getElementById("bioDisplay").textContent        = data.bio        || "—";
  document.getElementById("contactDisplay").textContent    = data.contact    || "—";
  document.getElementById("professionDisplay").textContent = data.profession || "—";
  document.getElementById("africaInDisplay").textContent   = data.africaIn   || "—";
  const webEl = document.getElementById("websiteDisplay");
  if (data.website) { webEl.innerHTML = `<a href="${data.website}" target="_blank">${data.website}</a>`; }
  else { webEl.textContent = "—"; }
  renderSocials(data.socials || {});
}

function renderSocials(socials) {
  const list = document.getElementById("socialsList"); list.innerHTML = "";
  const entries = Object.entries(socials).filter(([, v]) => v && v.trim() !== "");
  if (!entries.length) { list.innerHTML = `<p style="color:#9CA3AF;font-size:13px;">No socials added yet</p>`; return; }
  entries.forEach(([platform, handle]) => {
    const div = document.createElement("div"); div.className = "social-item";
    div.innerHTML = `
      <div class="social-item-icon">${SOCIAL_ICONS[platform] || `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#374151" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`}</div>
      <span class="social-item-name">${SOCIAL_NAMES[platform] || platform}</span>
      <span class="social-item-handle">${handle}</span>
      ${isOwnProfile ? `<button class="social-item-edit" data-platform="${platform}">Edit</button>` : ""}
    `;
    if (isOwnProfile) { div.querySelector(".social-item-edit").addEventListener("click", () => openEditSocial(platform, handle)); }
    list.appendChild(div);
  });
}

// ══════════════════════════════════════════════
//  LIKES & STARS
// ══════════════════════════════════════════════
async function loadProfileLikesStars(userId) {
  if (!userId) return;
  try {
    const res  = await fetch(`${baseUrl}/api/users/${userId}/likes-stars`, { headers: { Authorization: token ? `Bearer ${token}` : "" } });
    const data = await res.json();
    const lEl  = document.getElementById("likesCount");
    const sEl  = document.getElementById("starsCount");
    if (lEl) lEl.textContent = data.likes ?? 0;
    if (sEl) sEl.textContent = data.stars ?? 0;
  } catch (err) { console.error(err); }
}

// ══════════════════════════════════════════════
//  TABS
// ══════════════════════════════════════════════
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab + "Tab").classList.add("active");
  });
});

// ══════════════════════════════════════════════
//  FOLLOWERS / FOLLOWING
// ══════════════════════════════════════════════
document.getElementById("openFollowersTab").addEventListener("click", () => openSheet("followersTab"));
document.getElementById("openFollowingTab").addEventListener("click", () => openSheet("followingTab"));
document.getElementById("closeFollowersTab").addEventListener("click", closeAllSheets);
document.getElementById("closeFollowingTab").addEventListener("click", closeAllSheets);

async function loadFollowers(userId) {
  if (!userId) return;
  try {
    const res  = await fetch(`${baseUrl}/api/users/${userId}/followers`, { headers: { Authorization: token ? `Bearer ${token}` : "" } });
    const data = await res.json();
    renderUserList(data.followers || data.user?.followers || data, document.getElementById("followersList"));
  } catch (err) { console.error(err); }
}

async function loadFollowing(userId) {
  if (!userId) return;
  try {
    const res  = await fetch(`${baseUrl}/api/users/${userId}/following`, { headers: { Authorization: token ? `Bearer ${token}` : "" } });
    const data = await res.json();
    renderUserList(data.following || data.user?.following || data, document.getElementById("followingList"));
  } catch (err) { console.error(err); }
}

function renderUserList(users, container) {
  container.innerHTML = "";
  if (!Array.isArray(users) || !users.length) {
    container.innerHTML = `<p style="text-align:center;color:#9CA3AF;padding:20px;font-size:14px;">Nothing here yet</p>`; return;
  }
  users.forEach(user => {
    const div = document.createElement("div"); div.className = "user-row";
    div.innerHTML = `
      <img src="${user.profilePicture || '/uploads/images/africa.png'}" class="user-avatar" />
      <div class="user-info">
        <strong>${user.fullName || ""} ${user.isVerified ? verifiedSvg() : ""}</strong>
        <span>@${user.username || ""} ${getFlagEmoji(user.country)}</span>
      </div>
      ${user._id !== currentUserId ? `<button class="follow-btn ${user.isFollowing ? "following" : ""}" data-user-id="${user._id}">${user.isFollowing ? "Following" : "Follow"}</button>` : ""}
    `;
    div.querySelector(".user-info").onclick = () => { window.location.href = `/profile.html?userId=${user._id}`; };
    container.appendChild(div);
  });
}

document.addEventListener("click", async e => {
  const btn = e.target.closest(".follow-btn");
  if (!btn || btn.id === "followBtn") return;
  e.stopPropagation();
  if (isGuest) { showGuestModal(); return; }
  const uid = btn.dataset.userId;
  try {
    const res  = await fetch(`${baseUrl}/api/users/follow/${uid}`, { method:"POST", headers:{Authorization:`Bearer ${token}`} });
    const data = await res.json();
    btn.textContent = data.following ? "Following" : "Follow";
    btn.classList.toggle("following", data.following);
  } catch (err) { console.error(err); }
});

// ══════════════════════════════════════════════
//  FOLLOW BUTTON
// ══════════════════════════════════════════════
function setupFollowButton(userId, isFollowing) {
  const btn = document.getElementById("followBtn"); if (!btn) return;
  let following = !!isFollowing; renderBtn();
  btn.onclick = async () => {
    if (isGuest) { showGuestModal(); return; }
    try {
      const res  = await fetch(`${baseUrl}/api/users/follow/${userId}`, { method:"POST", headers:{Authorization:`Bearer ${token}`} });
      const data = await res.json(); following = data.following; renderBtn();
    } catch (err) { console.error(err); }
  };
  function renderBtn() { btn.textContent = following ? "Following" : "Follow"; btn.classList.toggle("following", following); }
}

// ══════════════════════════════════════════════
//  EDIT PROFILE
// ══════════════════════════════════════════════
const editContainer = document.getElementById("editContainer");
document.getElementById("openEditContainer").addEventListener("click", () => { editContainer.style.display = "block"; editContainer.scrollTop = 0; });
document.getElementById("closeEditContainer").addEventListener("click", () => { editContainer.style.display = "none"; });

document.getElementById("profileImage").addEventListener("change", function () {
  const file = this.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => { document.getElementById("profilePreview").src = e.target.result; };
  reader.readAsDataURL(file);
});

document.getElementById("saveProfileBtn").addEventListener("click", async () => {
  const fullName = document.getElementById("editFullName").value.trim();
  const username = document.getElementById("editUsername").value.trim();
  const country  = document.getElementById("editCountry").value;
  const file     = document.getElementById("profileImage").files[0];
  if (!fullName) { showToast("Full name is required", "#EF4444"); return; }
  if (!username) { showToast("Username is required", "#EF4444"); return; }
  if (username.length < 3) { showToast("Username must be at least 3 characters", "#EF4444"); return; }
  if (/\s/.test(username)) { showToast("Username cannot have spaces", "#EF4444"); return; }
  const saveBtn    = document.getElementById("saveProfileBtn");
  const btnText    = document.getElementById("saveBtnText");
  const btnSpinner = document.getElementById("saveBtnSpinner");
  saveBtn.disabled = true; btnText.textContent = "Saving..."; btnSpinner.style.display = "inline-block";
  try {
    const formData = new FormData();
    formData.append("fullName", fullName); formData.append("username", username); formData.append("country", country);
    if (file) formData.append("profilePicture", file);
    const res  = await fetch(`${baseUrl}/api/users/update-profile`, { method:"PUT", headers:{Authorization:`Bearer ${token}`}, body:formData });
    const raw  = await res.json();
    if (!res.ok) { showToast(raw.message || "Update failed", "#EF4444"); return; }
    const u = raw.user || raw;
    document.getElementById("fullName").textContent  = u.fullName || fullName;
    document.getElementById("username").textContent  = "@" + (u.username || username);
    document.getElementById("country").textContent   = getFlagEmoji(u.country || country);
    if (u.profilePicture) {
      document.getElementById("profilePic").src     = u.profilePicture;
      document.getElementById("profilePreview").src = u.profilePicture;
    } else if (file) {
      document.getElementById("profilePic").src = URL.createObjectURL(file);
    }
    editContainer.style.display = "none"; showToast("✅ Profile updated!", "#22C55E");
  } catch (err) { console.error(err); showToast("Something went wrong. Try again.", "#EF4444"); }
  finally { saveBtn.disabled = false; btnText.textContent = "Save Changes"; btnSpinner.style.display = "none"; document.getElementById("profileImage").value = ""; }
});

// ══════════════════════════════════════════════
//  SHARE PROFILE
// ══════════════════════════════════════════════

document
.getElementById("shareProfileBtn")
.addEventListener("click", async () => {

  try {

    // Get username directly from UI
    const username = document
      .getElementById("username")
      .textContent
      .replace("@", "")
      .trim();

    if (!username) {
      showToast("Unable to share profile");
      return;
    }

    // SEO profile URL
    const url = `https://afrisocial.com.ng/u/${username}`;

    // Native share
    if (navigator.share) {

      await navigator.share({
        title: "Afrisocial Profile",
        text: `Check out @${username} on Afrisocial`,
        url
      });

    } else {

      // Fallback copy
      await navigator.clipboard.writeText(url);

      showToast("Profile link copied!");

    }

  } catch (err) {

    console.error("PROFILE SHARE ERROR:", err);

  }

});

// ══════════════════════════════════════════════
//  ABOUT — SOCIALS
// ══════════════════════════════════════════════
let selectedPlatform = null;

document.getElementById("addSocialBtn").addEventListener("click", () => {
  selectedPlatform = null;
  document.getElementById("socialHandleInput").style.display = "none";
  document.querySelectorAll(".platform-btn").forEach(b => b.classList.remove("selected"));
  openSheet("addSocialModal");
});
document.getElementById("closeAddSocial").addEventListener("click", closeAllSheets);

document.querySelectorAll(".platform-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".platform-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected"); selectedPlatform = btn.dataset.platform;
    document.getElementById("socialHandleLabel").textContent = (SOCIAL_NAMES[selectedPlatform] || selectedPlatform) + " handle";
    document.getElementById("socialHandleValue").value = "";
    document.getElementById("socialHandleInput").style.display = "block";
  });
});

document.getElementById("saveSocialBtn").addEventListener("click", async () => {
  const handle = document.getElementById("socialHandleValue").value.trim();
  if (!handle || !selectedPlatform) { showToast("Enter a handle", "#EF4444"); return; }
  await saveAboutField("socials." + selectedPlatform, handle);
  showToast("✅ Social saved!"); closeAllSheets();
  try {
    const res  = await fetch(`${baseUrl}/api/users/me`, { headers:{Authorization:`Bearer ${token}`} });
    const raw  = await res.json(); const data = raw.user || raw; renderSocials(data.socials || {});
  } catch (e) { console.error(e); }
});

function openEditSocial(platform, currentHandle) {
  selectedPlatform = platform;
  document.querySelectorAll(".platform-btn").forEach(b => { b.classList.toggle("selected", b.dataset.platform === platform); });
  document.getElementById("socialHandleLabel").textContent = (SOCIAL_NAMES[platform] || platform) + " handle";
  document.getElementById("socialHandleValue").value = currentHandle || "";
  document.getElementById("socialHandleInput").style.display = "block";
  openSheet("addSocialModal");
}

// ══════════════════════════════════════════════
//  ABOUT — PROFESSION
// ══════════════════════════════════════════════
document.getElementById("addProfessionBtn").addEventListener("click", () => openSheet("professionModal"));
document.getElementById("closeProfessionModal").addEventListener("click", closeAllSheets);
document.querySelectorAll(".profession-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const val = btn.dataset.val;
    await saveAboutField("profession", val);
    document.getElementById("professionDisplay").textContent = val;
    closeAllSheets(); showToast("✅ Profession updated!");
  });
});

// ══════════════════════════════════════════════
//  ABOUT — BIO
// ══════════════════════════════════════════════
document.getElementById("editBioBtn").addEventListener("click", () => {
  document.getElementById("bioInput").value = document.getElementById("bioDisplay").textContent.replace("—","").trim();
  openSheet("bioModal");
});
document.getElementById("closeBioModal").addEventListener("click", closeAllSheets);
document.getElementById("saveBioBtn").addEventListener("click", async () => {
  const val = document.getElementById("bioInput").value.trim();
  await saveAboutField("bio", val); document.getElementById("bioDisplay").textContent = val || "—";
  closeAllSheets(); showToast("✅ Bio updated!");
});

// ══════════════════════════════════════════════
//  ABOUT — CONTACT
// ══════════════════════════════════════════════
document.getElementById("editContactBtn").addEventListener("click", () => {
  document.getElementById("contactInput").value = document.getElementById("contactDisplay").textContent.replace("—","").trim();
  openSheet("contactModal");
});
document.getElementById("closeContactModal").addEventListener("click", closeAllSheets);
document.getElementById("saveContactBtn").addEventListener("click", async () => {
  const val = document.getElementById("contactInput").value.trim();
  await saveAboutField("contact", val); document.getElementById("contactDisplay").textContent = val || "—";
  closeAllSheets(); showToast("✅ Contact updated!");
});

// ══════════════════════════════════════════════
//  ABOUT — WEBSITE
// ══════════════════════════════════════════════
document.getElementById("editWebsiteBtn").addEventListener("click", () => {
  document.getElementById("websiteInput").value = document.getElementById("websiteDisplay").textContent.replace("—","").trim();
  openSheet("websiteModal");
});
document.getElementById("closeWebsiteModal").addEventListener("click", closeAllSheets);
document.getElementById("saveWebsiteBtn").addEventListener("click", async () => {
  const val = document.getElementById("websiteInput").value.trim();
  await saveAboutField("website", val);
  const webEl = document.getElementById("websiteDisplay");
  if (val) { webEl.innerHTML = `<a href="${val}" target="_blank">${val}</a>`; } else { webEl.textContent = "—"; }
  closeAllSheets(); showToast("✅ Website updated!");
});

// ══════════════════════════════════════════════
//  ABOUT — AFRICA IN
// ══════════════════════════════════════════════
document.getElementById("editAfricaInBtn").addEventListener("click", () => {
  document.getElementById("africaInInput").value = document.getElementById("africaInDisplay").textContent.replace("—","").trim();
  openSheet("africaInModal");
});
document.getElementById("closeAfricaInModal").addEventListener("click", closeAllSheets);
document.getElementById("saveAfricaInBtn").addEventListener("click", async () => {
  const val = document.getElementById("africaInInput").value.trim();
  await saveAboutField("africaIn", val); document.getElementById("africaInDisplay").textContent = val || "—";
  closeAllSheets(); showToast("✅ Africa In updated!");
});

// ══════════════════════════════════════════════
//  SAVE ABOUT FIELD
// ══════════════════════════════════════════════
async function saveAboutField(field, value) {
  try {
    await fetch(`${baseUrl}/api/users/update-profile`, { method:"PUT", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}, body:JSON.stringify({[field]:value}) });
  } catch (err) { console.error("Save field error:", err); }
}

// ══════════════════════════════════════════════
//  RENDER POST TEXT
// ══════════════════════════════════════════════
function renderPostText(text, mentions) {
  if (!text) return "";
  const safeText = typeof escapeHTML === "function" ? escapeHTML(text) : text;
  let output = safeText.replace(/#(\w+)/g, (match, tag) => `<a href="/hashtag.html?tag=${tag}" class="hashtag-link">#${tag}</a>`);
  const mentionMap = {};
  (mentions || []).forEach(m => { mentionMap[m.username.toLowerCase()] = m; });
  output = output.replace(/@([a-zA-Z0-9_.-]+)/g, (match, username) => {
    const user = mentionMap[username.toLowerCase()]; if (!user) return match;
    return `<a href="/profile.html?userId=${user._id}" class="mention">${match}</a>`;
  });
  return output;
}

// ══════════════════════════════════════════════
//  POSTS TAB
// ══════════════════════════════════════════════
const postsTab     = document.getElementById("postsTab");
const viewedVideos = new Set();

function renderPost(post, container) {
  const user       = post.user || {};
  const hasText    = !!(post.text && post.text.trim() !== "");
  const hasMedia   = (post.images?.length > 0) || !!post.video;
  const isTextOnly = hasText && !hasMedia;
  const wordCount  = hasText ? post.text.trim().split(/\s+/).length : 0;

  let textClass = "text-body";
  if (isTextOnly) { textClass = wordCount <= 25 ? "text-body text-only-bold" : "text-body text-only-long"; }

  let mediaHtml = "";
  if (post.images?.length) {
    mediaHtml += `<div class="image-slider-wrapper"><div class="image-slider">${post.images.map(img => `<img src="${getMediaUrl(img)}" class="post-media slide" />`).join("")}</div></div>`;
  }
  if (post.video) {
    mediaHtml += `<div class="video-wrapper"><video class="post-media video" src="${getMediaUrl(post.video)}" muted playsinline></video><button class="mute-btn">🔇</button></div>`;
  }

  const isLiked   = (post.likes  || []).includes(currentUserId);
  const isStarred = (post.stars  || []).includes(currentUserId);
  const isSponsoredActive = post.isSponsored && (!post.expiresAt || new Date(post.expiresAt) > new Date());

  const div = document.createElement("div");
  div.className =
  post.isBirthdayPost
    ? "post birthday-post"
    : "post";
   div.dataset.postId = post._id;

  // Gift button only on other people's profiles
  const giftBtnHtml = !isOwnProfile ? `
    <button class="action-btn gift-btn" data-post-user-id="${user._id}" data-post-user-name="${user.fullName || user.username}">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 12 20 22 4 22 4 12"/>
        <rect x="2" y="7" width="20" height="5"/>
        <path d="M12 22V7"/>
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
      </svg>
      <span class="action-label">Gift</span>
    </button>` : "";

  div.innerHTML = `
    <div class="post-header">
      <img src="${user.profilePicture || '/uploads/images/africa.png'}" onerror="this.src='/uploads/images/africa.png'" />
      <div class="post-header-info">
        <strong>${user.fullName || ""} ${user.isVerified ? verifiedSvg() : ""} ${getFlagEmoji(user.country)}</strong>
        <small> ${isSponsoredActive ? `
        <span class="header-sponsored-label">
         Sponsored
       </span>
        ` : ""}${timeAgo(post.createdAt)}</small>
      </div>
      <button class="post-three-dot" data-post-id="${post._id}">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="#9CA3AF">
          <circle cx="12" cy="5" r="1.8"/>
          <circle cx="12" cy="12" r="1.8"/>
          <circle cx="12" cy="19" r="1.8"/>
        </svg>
      </button>
    </div>

    ${post.isBirthdayPost ? `
<div class="birthday-confetti"></div>
` : ""}

${post.isBirthdayPost ? `
<div class="birthday-banner">

  <div class="birthday-banner-left">

    <span class="birthday-emoji">
      🎂
    </span>

    <div class="birthday-banner-text">

      <strong>
        Today is ${user.fullName}'s Birthday
      </strong>

      <small>
        Celebrate and send wishes ❤️
      </small>

    </div>

  </div>

</div>
` : ""}

    ${hasText ? `<p class="${textClass}">${renderPostText(post.text, post.mentions || [])}</p>` : ""}
  
    ${post.isBirthdayPost ? `
<div class="birthday-quick-actions">

  <button
    class="birthday-gift-btn"
    data-message="🎉 Happy Birthday!"
  >
    🎉 Wish
  </button>

  <button
    class="birthday-gift-btn"
    data-message="🌹 Sending you roses!"
  >
    🌹 Rose
  </button>

  <button
    class="birthday-gift-btn"
    data-message="🎂 Cake for you!"
  >
    🎂 Cake
  </button>

  <button
    class="birthday-gift-btn"
    data-message="🎈 Balloons for your day!"
  >
    🎈 Balloon
  </button>

  <button
    class="birthday-gift-btn"
    data-message="❤️ Much love!"
  >
    ❤️ Love
  </button>

  <button
    class="birthday-real-gift-btn"
    data-birthday-user="${user._id}"
    data-birthday-name="${user.fullName}"
  >
    🎁 Send Gift
  </button>

</div>
` : ""}

   ${mediaHtml ? `
  <div class="post-media-container">
    ${mediaHtml}
  </div>
` : ""}
${isSponsoredActive ? `
  <div class="feed-sponsored-bar">

    <div class="feed-sponsored-left">

      <span class="feed-sponsored-tag">
        ${post.sponsoredLabel || "Sponsored"}
      </span>

      ${post.sponsorName ? `
        <span class="feed-sponsored-name">
          ${post.sponsorName}
        </span>
      ` : ""}

    </div>

    ${
      post.redirectUrl
      ? `
        <button
          class="feed-sponsored-cta sponsored-cta-btn"
          data-post-id="${post._id}"
          data-url="${post.redirectUrl}"
        >
          ${post.ctaText || "Learn More"}
        </button>
      `
      : ""
    }

  </div>
` : ""}
    

    <div class="post-actions">
      <button class="action-btn love-btn ${isLiked ? "liked" : ""}">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <span class="count">${(post.likes||[]).length}</span>
      </button>

      <button class="action-btn comment-btn">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span class="count">${post.commentCount || 0}</span>
      </button>

      <button class="action-btn star-btn ${isStarred ? "starred" : ""}">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <span class="count">${(post.stars||[]).length}</span>
      </button>

      <button class="action-btn share-btn" data-post-id="${post._id}" data-post-text="${(post.text || '').slice(0,100)}">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>

      ${post.video ? `<span class="view-count">👁 ${post.views || 0}</span>` : ""}

      ${giftBtnHtml}
    </div>
  `;

  container.appendChild(div);

  // ── Three dot menu ──
  div.querySelector(".post-three-dot").addEventListener("click", e => {
    e.stopPropagation();
    document.querySelectorAll(".post-three-dot-menu").forEach(m => m.remove());
    const menu = document.createElement("div");
    menu.className = "post-three-dot-menu";
    menu.innerHTML = `
      ${!isOwnProfile ? `<button class="three-dot-item report-item" data-id="${post._id}">⚠️ Report Post</button>` : ""}
      <button class="three-dot-item share-item" data-post-id="${post._id}" data-post-text="${(post.text || '').slice(0,100)}">🔗 Share Post</button>
      ${isOwnProfile ? `<button class="three-dot-item delete-item" style="color:#EF4444;" data-post-id="${post._id}">🗑️ Delete Post</button>` : ""}
    `;
    const rect = e.currentTarget.getBoundingClientRect();
    menu.style.top  = (rect.bottom + window.scrollY + 4) + "px";
    menu.style.left = Math.min(rect.left, window.innerWidth - 200) + "px";
    document.body.appendChild(menu);

    menu.querySelector(".report-item")?.addEventListener("click", () => { menu.remove(); showProfileReportContentModal(post._id, "post"); });
    menu.querySelector(".share-item")?.addEventListener("click", async () => {
      menu.remove();
      const shareUrl = `${window.location.origin}/p/${post._id}`;
      try {
        if (navigator.share) { await navigator.share({ title:"Afrisocial", url:shareUrl }); }
        else { await navigator.clipboard.writeText(shareUrl); showToast("🔗 Link copied!"); }
      } catch {}
    });
    menu.querySelector(".delete-item")?.addEventListener("click", async () => {
      menu.remove();
      if (!confirm("Delete this post?")) return;
      try {
        await fetch(`${baseUrl}/api/posts/${post._id}`, { method:"DELETE", headers:{Authorization:`Bearer ${token}`} });
        div.remove(); showToast("Post deleted.");
      } catch { showToast("Failed to delete.", "#EF4444"); }
    });
    setTimeout(() => { document.addEventListener("click", () => menu.remove(), { once:true }); }, 0);
  });

  if (isSponsoredActive) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          try { await fetch(`${baseUrl}/api/posts/${post._id}/impression`, { method:"POST", headers:{Authorization:`Bearer ${token}`} }); } catch {}
          observer.unobserve(div);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(div);
  }
}

async function loadProfilePosts(userId) {
  if (!userId) return;
  try {
    const res  = await fetch(`${baseUrl}/api/posts/user/${userId}`, { headers: { Authorization: token ? `Bearer ${token}` : "" } });
    const data = await res.json();
    postsTab.innerHTML = "";
    const posts = data.posts || data;
    if (!Array.isArray(posts) || !posts.length) {
      postsTab.innerHTML = `<p style="text-align:center;color:#9CA3AF;padding:30px;font-size:14px;">No posts yet</p>`; return;
    }
    posts.forEach(post => renderPost(post, postsTab));
    initImageSliders(); initVideoControls();
  } catch (err) { console.error("loadProfilePosts:", err); }
}

// ══════════════════════════════════════════════
//  SPONSORED CTA
// ══════════════════════════════════════════════
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".sponsored-cta-btn"); if (!btn) return;
  const postId = btn.dataset.postId; const url = btn.dataset.url;
  try { await fetch(`${baseUrl}/api/posts/${postId}/click`, { method:"POST", headers:{Authorization:`Bearer ${token}`} }); } catch {}
  window.open(url, "_blank");
});

// ══════════════════════════════════════════════
//  BATTLE POLLS TAB
// ══════════════════════════════════════════════
function renderPollCard(poll, container) {
  pollDataStore[poll._id] = poll;
  const user       = poll.user || {};
  const options    = poll.options || [];
  const totalVotes = options.reduce((s, o) => s + (o.votes || 0), 0);
  const maxVotes   = Math.max(...options.map(o => o.votes || 0), 0);
  const maxPct     = totalVotes > 0 ? Math.round((maxVotes / totalVotes) * 100) : 0;

  const optionsGrid = options.map((opt, i) => {
    const votes   = opt.votes || 0;
    const pct     = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
    const label   = OPTION_LABELS[i] || String(i + 1);
    const optText = (opt.text || "Option " + label).trim();
    const hasImg  = opt.image && opt.image.trim() !== "";
    const topSection = hasImg
      ? `<div class="poll-option-img-wrap"><img src="${getMediaUrl(opt.image)}" alt="${optText}" /></div>`
      : `<div class="poll-option-no-img"><span class="poll-option-emoji">${["🎵","🎤","🎶","🎸"][i] || "⚡"}</span></div>`;
    return `
      <div class="poll-option-card" data-option-id="${opt._id || i}">
        ${topSection}
        <div class="poll-option-info">
          <div class="poll-option-name"><span class="poll-option-badge">${label}</span>${optText}</div>
          <div class="poll-option-votes">${votes} votes · ${pct}%</div>
          <div class="poll-vote-bar-wrap"><div class="poll-vote-bar ${getBarClass(pct, maxPct)}" style="width:${pct}%"></div></div>
        </div>
      </div>`;
  }).join("");

  const div = document.createElement("div"); div.className = "poll-card"; div.dataset.pollId = poll._id;
  div.innerHTML = `
    <div class="poll-card-header">
      <img src="${user.profilePicture || '/uploads/images/africa.png'}" />
      <div class="poll-card-header-info">
        <strong>${user.fullName || "Unknown"} ${user.isVerified ? verifiedSvg() : ""} ${getFlagEmoji(user.country)}</strong>
        <span>created a poll · ${timeAgo(poll.createdAt)}</span>
      </div>
    </div>
    <p class="poll-question">${poll.question}</p>
    <div class="poll-options-grid">${optionsGrid}</div>
    <div class="poll-totals"><span>⚡ ${totalVotes} votes</span><span>💬 ${poll.respondCount || 0} responds</span></div>
    <div class="poll-actions">
      <button class="poll-action-btn poll-react-btn">❤️ React</button>
      <button class="poll-action-btn vote-btn poll-vote-btn">⚔️ Cast your Vote</button>
      <button class="poll-action-btn poll-respond-btn">💬 Respond</button>
      ${!isOwnProfile ? `<button class="poll-action-btn report-poll-btn" data-report-id="${poll._id}" style="flex:0 0 auto;padding:0 10px;">🚩</button>` : ""}
    </div>
  `;
  container.appendChild(div);
}

async function loadProfilePolls(userId) {
  if (!userId) return;
  const container = document.getElementById("pollsList");
  try {
    const res  = await fetch(`${baseUrl}/api/polls/user/${userId}`, { headers: { Authorization: token ? `Bearer ${token}` : "" } });
    const data = await res.json(); container.innerHTML = "";
    const polls = data.polls || data;
    if (!Array.isArray(polls) || !polls.length) { container.innerHTML = `<p style="text-align:center;color:#9CA3AF;padding:30px;font-size:14px;">No polls yet</p>`; return; }
    polls.forEach(poll => renderPollCard(poll, container));
  } catch (err) { container.innerHTML = `<p style="text-align:center;color:#9CA3AF;padding:30px;">Could not load polls</p>`; }
}

// ══════════════════════════════════════════════
//  VOTE MODAL
// ══════════════════════════════════════════════
let activePollId  = null; let activePollEl = null; let selectedOptId = null;
const voteModal      = document.getElementById("voteModal");
const voteQuestion   = document.getElementById("voteQuestion");
const voteOptionsEl  = document.getElementById("voteOptions");
const voteThanks     = document.getElementById("voteThanks");
const voteTotalCount = document.getElementById("voteTotalCount");

document.getElementById("cancelVote").addEventListener("click", closeAllSheets);

function openVoteModal(poll, pollEl) {
  if (isGuest) { showGuestModal(); return; }
  activePollId = poll._id; activePollEl = pollEl; selectedOptId = null;
  voteQuestion.textContent = poll.question; voteThanks.style.display = "none";
  voteOptionsEl.style.display = "flex"; voteOptionsEl.innerHTML = "";
  (poll.options || []).forEach((opt, i) => {
    const label = OPTION_LABELS[i] || String(i + 1); const optText = (opt.text || "Option " + label).trim();
    const hasImg = opt.image && opt.image.trim() !== "";
    const btn = document.createElement("button"); btn.className = "vote-option-btn"; btn.dataset.optId = opt._id || i;
    btn.innerHTML = `${hasImg ? `<img src="${getMediaUrl(opt.image)}" alt="${optText}" />` : `<div class="vote-option-label-badge">${label}</div>`}<span>${optText}</span>`;
    btn.addEventListener("click", () => { voteOptionsEl.querySelectorAll(".vote-option-btn").forEach(b => b.classList.remove("selected")); btn.classList.add("selected"); selectedOptId = opt._id || i; });
    voteOptionsEl.appendChild(btn);
  });
  const submitBtn = document.createElement("button"); submitBtn.className = "vote-submit-btn"; submitBtn.textContent = "Submit Vote"; submitBtn.onclick = submitVote;
  voteOptionsEl.appendChild(submitBtn); openSheet("voteModal");
}

async function submitVote() {
  if (!selectedOptId) { showToast("Pick an option first!"); return; }
  try {
    const res  = await fetch(`${baseUrl}/api/polls/${activePollId}/vote`, { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}, body:JSON.stringify({optionId:selectedOptId}) });
    const data = await res.json();
    voteOptionsEl.style.display = "none"; voteThanks.style.display = "block";
    const total = (data.poll?.options || []).reduce((s, o) => s + (o.votes || 0), 0);
    voteTotalCount.textContent = `Total votes: ${total}`;
    if (activePollEl && data.poll) updatePollCardBars(activePollEl, data.poll);
    setTimeout(closeAllSheets, 2200);
  } catch (err) { console.error(err); showToast("Failed to vote. Try again.", "#EF4444"); }
}

function updatePollCardBars(pollEl, updatedPoll) {
  const options = updatedPoll.options || [];
  const totalVotes = options.reduce((s, o) => s + (o.votes || 0), 0);
  const maxVotes = Math.max(...options.map(o => o.votes || 0), 0);
  const maxPct = totalVotes > 0 ? Math.round((maxVotes / totalVotes) * 100) : 0;
  pollEl.querySelectorAll(".poll-option-card").forEach((card, i) => {
    const opt = options[i]; if (!opt) return;
    const votes = opt.votes || 0; const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
    const bar = card.querySelector(".poll-vote-bar"); const vEl = card.querySelector(".poll-option-votes");
    if (bar) { bar.style.width = pct + "%"; bar.className = `poll-vote-bar ${getBarClass(pct, maxPct)}`; }
    if (vEl) vEl.textContent = `${votes} votes · ${pct}%`;
  });
  const totalEl = pollEl.querySelector(".poll-totals span"); if (totalEl) totalEl.textContent = `⚡ ${totalVotes} votes`;
}

// ══════════════════════════════════════════════
//  RESPOND MODAL
// ══════════════════════════════════════════════
let activeRespondPollId = null;
const respondModal     = document.getElementById("respondModal");
const respondPollTitle = document.getElementById("respondPollTitle");
const respondInput     = document.getElementById("respondInput");
const respondMedia     = document.getElementById("respondMedia");

document.getElementById("cancelRespond").addEventListener("click", closeAllSheets);
document.getElementById("respondMediaBtn").addEventListener("click", () => respondMedia.click());

function openRespondModal(poll) {
  if (isGuest) { showGuestModal(); return; }
  activeRespondPollId = poll._id; respondPollTitle.textContent = poll.question; respondInput.value = "";
  openSheet("respondModal");
}

document.getElementById("submitRespond").onclick = async () => {
  const text = respondInput.value.trim(); if (!text) { showToast("Write a response first"); return; }
  try {
    const formData = new FormData(); formData.append("text", text);
    const file = respondMedia.files[0]; if (file) formData.append("media", file);
    await fetch(`${baseUrl}/api/polls/${activeRespondPollId}/respond`, { method:"POST", headers:{Authorization:`Bearer ${token}`}, body:formData });
    closeAllSheets(); showToast("✅ Response posted!");
  } catch (err) { console.error(err); showToast("Failed to respond. Try again.", "#EF4444"); }
};

document.addEventListener("click", e => {
  const pollCard = e.target.closest(".poll-card"); if (!pollCard) return;
  const pollId = pollCard.dataset.pollId; const poll = pollDataStore[pollId]; if (!poll) return;
  if (e.target.closest(".poll-vote-btn"))    openVoteModal(poll, pollCard);
  if (e.target.closest(".poll-respond-btn")) openRespondModal(poll);
  if (e.target.closest(".poll-react-btn"))   showToast("❤️ Reaction noted!");
  if (e.target.closest(".report-poll-btn"))  showProfileReportContentModal(poll._id, "poll");
});

document.addEventListener("click", e => {
  if (e.target.closest(".report-post-btn")) {
    const btn = e.target.closest(".report-post-btn");
    showProfileReportContentModal(btn.dataset.reportId, "post");
  }
});

// ══════════════════════════════════════════════
//  IMAGE SLIDER
// ══════════════════════════════════════════════
function initImageSliders() {
  document.querySelectorAll(".image-slider-wrapper").forEach(w => {
    if (w.dataset.init) return; w.dataset.init = "1";
    const slider = w.querySelector(".image-slider"); const slides = slider.querySelectorAll(".slide"); let current = 0;
    slides.forEach((s, i) => s.style.display = i === 0 ? "block" : "none");
    let counter = null;
    if (slides.length > 1) { counter = document.createElement("div"); counter.className = "image-counter"; counter.textContent = `1 / ${slides.length}`; w.appendChild(counter); }
    let startX = 0, endX = 0;
    w.addEventListener("touchstart", e => startX = e.touches[0].clientX);
    w.addEventListener("touchmove",  e => endX   = e.touches[0].clientX);
    w.addEventListener("touchend", () => { if (slides.length < 2) return; if (startX - endX > 50) changeSlide(1); if (endX - startX > 50) changeSlide(-1); });
    slider.addEventListener("click", () => { if (slides.length > 1) changeSlide(1); });
    function changeSlide(dir) { slides[current].style.display = "none"; current = (current + dir + slides.length) % slides.length; slides[current].style.display = "block"; if (counter) counter.textContent = `${current + 1} / ${slides.length}`; }
  });
}

// ══════════════════════════════════════════════
//  VIDEO CONTROLS
// ══════════════════════════════════════════════
function initVideoControls() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target; const postEl = video.closest(".post"); if (!postEl) return;
      const postId = postEl.dataset.postId; const vEl = postEl.querySelector(".view-count");
      if (entry.isIntersecting) {
        video.play().catch(() => {});
        if (!viewedVideos.has(postId)) { video._viewTimer = setTimeout(async () => { viewedVideos.add(postId); const views = await sendVideoView(postId); if (vEl && views) vEl.textContent = `👁 ${views}`; }, 2000); }
      } else { video.pause(); video.currentTime = 0; clearTimeout(video._viewTimer); }
    });
  }, { threshold: 0.25 });

  document.querySelectorAll(".video-wrapper").forEach(wrapper => {
    if (wrapper.dataset.init) return; wrapper.dataset.init = "1";
    const video = wrapper.querySelector("video"); const muteBtn = wrapper.querySelector(".mute-btn");
    video.muted = true;
    video.addEventListener("click", () => { video.paused ? video.play() : video.pause(); });
    muteBtn.addEventListener("click", e => { e.stopPropagation(); video.muted = !video.muted; muteBtn.textContent = video.muted ? "🔇" : "🔊"; });
    observer.observe(video);
  });
}

async function sendVideoView(postId) {
  try { const res = await fetch(`${baseUrl}/api/posts/${postId}/view`, { method:"POST", headers:{Authorization:`Bearer ${token}`} }); const data = await res.json(); return data.views; } catch { return null; }
}

// ══════════════════════════════════════════════
//  LIKE, STAR, COMMENT, GIFT — POST INTERACTIONS
// ══════════════════════════════════════════════
document.addEventListener("click", async e => {
  const post = e.target.closest(".post"); if (!post) return;
  const postId = post.dataset.postId;

  if (e.target.closest(".love-btn")) {
    if (isGuest) { showGuestModal(); return; }
    const btn  = e.target.closest(".love-btn");
    const res  = await fetch(`${baseUrl}/api/posts/${postId}/like`, { method:"POST", headers:{Authorization:`Bearer ${token}`} });
    const data = await res.json();
    btn.querySelector(".count").textContent = data.likes.length;
    btn.classList.toggle("liked", data.liked);
  }

  if (e.target.closest(".star-btn")) {
    if (isGuest) { showGuestModal(); return; }
    const btn  = e.target.closest(".star-btn");
    const res  = await fetch(`${baseUrl}/api/posts/${postId}/star`, { method:"POST", headers:{Authorization:`Bearer ${token}`} });
    const data = await res.json();
    btn.querySelector(".count").textContent = data.stars.length;
    btn.classList.toggle("starred", data.starred);
  }

  if (e.target.closest(".comment-btn")) {
    if (isGuest) { showGuestModal(); return; }
    openCommentModal(postId, post);
  }

  if (e.target.closest(".gift-btn")) {
    if (isGuest) { showGuestModal(); return; }
    const btn = e.target.closest(".gift-btn");
    openProfileGiftModal(btn.dataset.postUserId, btn.dataset.postUserName);
  }
});

// ═══════════════════════════════
// BIRTHDAY QUICK GIFTS
// ═══════════════════════════════

document.addEventListener("click", async e => {

  const btn = e.target.closest(".birthday-gift-btn");

  if (!btn) return;

  const postEl = btn.closest(".post");

  const postId = postEl.dataset.postId;

  const text = btn.dataset.message;

  try {

    await fetch(
      `${baseUrl}/api/comments/${postId}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({ text })
      }
    );

    showToast("🎉 Birthday wish sent!");

  } catch (err) {

    console.error(err);

    showToast("Failed to send wish");

  }

});

// ═══════════════════════════════
// BIRTHDAY REAL GIFT
// ═══════════════════════════════

document.addEventListener("click", e => {

  const btn = e.target.closest(".birthday-real-gift-btn");

  if (!btn) return;

  const postEl = btn.closest(".post");

  const postId = postEl.dataset.postId;

  const recipientId = btn.dataset.birthdayUser;

  const recipientName = btn.dataset.birthdayName;

  activePostId = postId;

  openProfileGiftModal(
    recipientId,
    recipientName
  );

});

// ══════════════════════════════════════════════
//  COMMENT MODAL
// ══════════════════════════════════════════════
const commentModal      = document.getElementById("commentModal");
const commentList       = document.getElementById("commentList");
const commentInput      = document.getElementById("commentInput");
const sendCommentBtn    = document.getElementById("sendCommentBtn");
const closeCommentModal = document.getElementById("closeCommentModal");
let activePostId = null; let activeCommentBtn = null;

function openCommentModal(postId, postEl = null) {
  activePostId = postId; activeCommentBtn = postEl ? postEl.querySelector(".comment-btn") : null;
  commentModal.style.display = "flex"; commentList.innerHTML = ""; loadComments(postId);
}

closeCommentModal.onclick = () => { commentModal.style.display = "none"; };

function renderComment(comment) {

  const div = document.createElement("div");

  div.className =
    comment.isGift
      ? "comment gift-comment"
      : "comment";

  div.dataset.id = comment._id;

  div.innerHTML = `

    <div class="comment-user">

      <a href="/profile.html?userId=${comment.user._id}">
        <img src="${comment.user.profilePicture || '/uploads/images/africa.png'}" />
      </a>

      <div class="comment-user-meta">

        <strong>
          ${comment.user.fullName}
          ${comment.user.isVerified ? verifiedSvg() : ""}
        </strong>

        ${
          comment.isGift
          ? `
            <div class="gift-support-badge">

              🎁 ${comment.giftType || "Gift"} Supporter

              <span>
                ⭐ ${Number(comment.giftStars || 0).toLocaleString()}
              </span>

            </div>
          `
          : ""
        }

      </div>

    </div>

    <p class="comment-text">
      ${renderPostText(comment.text, comment.mentions || [])}
    </p>

    <div class="comment-actions">

      <span class="comment-like ${
        comment.likes.includes(currentUserId)
          ? "liked"
          : ""
      }">

        ❤️
        <span class="like-count">
          ${comment.likes.length}
        </span>

      </span>

      <span class="reply-btn">
        Reply
      </span>

      <small>
        ${timeAgo(comment.createdAt)}
      </small>

    </div>

    <div class="replies"></div>

  `;

  commentList.appendChild(div);
}


async function loadComments(postId) {
  try {
    const res      = await fetch(`${baseUrl}/api/comments/${postId}`, { headers:{Authorization:`Bearer ${token}`} });
    const comments = await res.json();
    commentList.innerHTML = "";
    comments.filter(c => !c.parentComment).forEach(renderComment);
    comments.filter(c =>  c.parentComment).forEach(reply => {
      const parentEl = commentList.querySelector(`[data-id="${reply.parentComment}"]`); if (!parentEl) return;
      const rd = document.createElement("div"); rd.className = "reply"; rd.dataset.id = reply._id;
      rd.innerHTML = `<div class="reply-user"><img src="${reply.user.profilePicture || '/uploads/images/africa.png'}" /><strong>${reply.user.fullName}</strong></div><div class="reply-area"><p class="reply-text">${renderPostText(reply.text, reply.mentions || [])}</p><small>${timeAgo(reply.createdAt)}</small></div>`;
      parentEl.querySelector(".replies").appendChild(rd);
    });
  } catch (err) { console.error(err); }
}

sendCommentBtn.onclick = async () => {
  const text = commentInput.value.trim(); if (!text) return;
  try {
    const res     = await fetch(`${baseUrl}/api/comments/${activePostId}`, { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}, body:JSON.stringify({text}) });
    const comment = await res.json(); renderComment(comment); commentInput.value = "";
    if (activeCommentBtn) { const c = activeCommentBtn.querySelector(".count"); if (c) c.textContent = parseInt(c.textContent) + 1; }
  } catch (err) { console.error(err); }
};

document.addEventListener("click", async e => {
  if (e.target.closest(".comment-like")) {
    const likeBtn = e.target.closest(".comment-like"); const commentEl = likeBtn.closest(".comment");
    const res = await fetch(`${baseUrl}/api/comments/like/${commentEl.dataset.id}`, { method:"POST", headers:{Authorization:`Bearer ${token}`} });
    const data = await res.json(); likeBtn.querySelector(".like-count").textContent = data.likes.length; likeBtn.classList.toggle("liked", data.liked);
  }
  if (e.target.closest(".reply-btn")) {
    const commentEl = e.target.closest(".comment"); if (commentEl.querySelector(".reply-input")) return;
    const box = document.createElement("div"); box.className = "reply-input";
    box.innerHTML = `<input placeholder="Write a reply..." /><button class="send-reply">Reply</button>`;
    commentEl.appendChild(box);
  }
  if (e.target.classList.contains("send-reply")) {
    const replyBox = e.target.closest(".reply-input"); const text = replyBox.querySelector("input").value.trim(); if (!text) return;
    const commentEl = replyBox.closest(".comment");
    const res = await fetch(`${baseUrl}/api/comments/reply/${commentEl.dataset.id}`, { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}, body:JSON.stringify({text}) });
    const reply = await res.json();
    const rd = document.createElement("div"); rd.className = "reply";
    rd.innerHTML = `<div class="reply-user"><img src="${reply.user.profilePicture || '/uploads/images/africa.png'}" /><strong>${reply.user.fullName}</strong></div><p class="reply-text">${reply.text}</p>`;
    commentEl.querySelector(".replies").appendChild(rd); replyBox.remove();
  }
});

// ══════════════════════════════════════════════
//  SHARE POST
// ══════════════════════════════════════════════
document.addEventListener("click", async e => {
  const shareBtn = e.target.closest(".share-btn"); if (!shareBtn) return;
  const postId   = shareBtn.dataset.postId; const postText = shareBtn.dataset.postText || "See this post on Afrisocial";
  const shareUrl = `${window.location.origin}/p/${postId}`;
  try {
    if (navigator.share) { await navigator.share({ title:"Afrisocial", text:postText, url:shareUrl }); }
    else { await navigator.clipboard.writeText(shareUrl); showToast("🔗 Link copied!", "#111827"); }
  } catch (err) { if (err.name !== "AbortError") { await navigator.clipboard.writeText(shareUrl).catch(()=>{}); showToast("🔗 Link copied!", "#111827"); } }
});

// ══════════════════════════════════════════════
//  MESSAGE BADGE
// ══════════════════════════════════════════════
async function loadUnreadMessages() {
  try {
    const res  = await fetch(`${baseUrl}/api/messages/unread-count`, { headers:{Authorization:`Bearer ${token}`} });
    const data = await res.json();
    const badge = document.getElementById("messageBadge");
    if (badge) { badge.textContent = data.count; badge.style.display = data.count > 0 ? "flex" : "none"; }
  } catch (err) { console.error(err); }
}
document.getElementById("messageIcon")?.addEventListener("click", () => { window.location.href = "/message.html"; });
if (!isGuest) loadUnreadMessages();

// ══════════════════════════════════════════════
//  REPORT / BLOCK
// ══════════════════════════════════════════════
function initReportBlockBtn() {
  if (isOwnProfile) return;
  const btn = document.getElementById("reportBlockBtn"); const menu = document.getElementById("reportBlockMenu");
  if (!btn || !menu) return;
  btn.addEventListener("click", e => { e.stopPropagation(); menu.style.display = menu.style.display === "block" ? "none" : "block"; });
  document.addEventListener("click", e => { if (!document.getElementById("reportBlockWrap")?.contains(e.target)) menu.style.display = "none"; });
  document.getElementById("menuReportBtn")?.addEventListener("click", () => { menu.style.display = "none"; showProfileReportModal(); });
  document.getElementById("menuBlockBtn")?.addEventListener("click", () => { menu.style.display = "none"; showBlockModal(); });
  checkBlockStatus();
}

async function checkBlockStatus() {
  if (!profileUserId || !token) return;
  try {
    const res = await fetch(`${baseUrl}/api/users/block-status/${profileUserId}`, { headers:{Authorization:`Bearer ${token}`} });
    if (!res.ok) return;
    const data = await res.json();
    const blockBtn = document.getElementById("menuBlockBtn");
    if (blockBtn && data.isBlocked) blockBtn.textContent = "🔓 Unblock";
  } catch (err) { console.error("checkBlockStatus:", err); }
}

function showReasonModal(title, subtitle, reasons, onSelect) {
  const modal = document.createElement("div");
  modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:flex-end;justify-content:center;z-index:9999;padding:20px;`;
  const sheet = document.createElement("div");
  sheet.style.cssText = `background:white;border-radius:20px;padding:24px;width:100%;max-width:500px;`;
  sheet.innerHTML = `
    <h3 style="font-size:18px;font-weight:700;margin-bottom:8px;color:#111827;">${title}</h3>
    <p style="font-size:14px;color:#6B7280;margin-bottom:20px;">${subtitle}</p>
    ${reasons.map(r => `<button data-reason="${r.value}" style="display:block;width:100%;text-align:left;padding:14px 16px;border:1.5px solid #E5E7EB;border-radius:12px;background:white;font-size:15px;font-weight:500;color:#111827;margin-bottom:8px;cursor:pointer;font-family:inherit;">${r.label}</button>`).join("")}
    <button id="cancelReason" style="display:block;width:100%;padding:14px;border:none;background:#F3F4F6;border-radius:12px;font-size:15px;font-weight:600;color:#6B7280;margin-top:4px;cursor:pointer;font-family:inherit;">Cancel</button>
  `;
  modal.appendChild(sheet); document.body.appendChild(modal);
  sheet.querySelectorAll("[data-reason]").forEach(btn => { btn.addEventListener("click", () => { document.body.removeChild(modal); onSelect(btn.dataset.reason); }); });
  sheet.querySelector("#cancelReason").addEventListener("click", () => document.body.removeChild(modal));
  modal.addEventListener("click", e => { if (e.target === modal) document.body.removeChild(modal); });
}

function showProfileReportModal() {
  showReasonModal("Report User","Why are you reporting this account?",[{value:"spam",label:"🚫 Spam"},{value:"hate_speech",label:"😡 Hate Speech"},{value:"explicit",label:"🔞 Explicit Content"},{value:"impersonation",label:"🎭 Impersonation"},{value:"other",label:"⚠️ Other"}],
    async reason => { try { await fetch(`${baseUrl}/api/moderation/report`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({contentId:profileUserId,contentType:"user",reason})}); } catch(err){console.error(err);} showToast("✅ Reported. Thank you!","#10B981"); });
}

function showProfileReportContentModal(contentId, contentType) {
  showReasonModal(`Report ${contentType==="poll"?"Poll":"Post"}`,"Why are you reporting this?",[{value:"spam",label:"🚫 Spam"},{value:"hate_speech",label:"😡 Hate Speech"},{value:"explicit",label:"🔞 Explicit Content"},{value:"malicious_link",label:"🔗 Malicious Link"},{value:"other",label:"⚠️ Other"}],
    async reason => { try { await fetch(`${baseUrl}/api/moderation/report`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({contentId,contentType,reason})}); } catch(err){console.error(err);} showToast("✅ Reported. Thank you!","#10B981"); });
}

function showBlockModal() {
  const isBlocked = document.getElementById("menuBlockBtn")?.textContent.includes("Unblock");
  if (isBlocked) { showUnblockConfirm(); return; }
  showReasonModal("Block User","Why do you want to block this person?",[{value:"harassment",label:"😤 They harass me"},{value:"spam",label:"🚫 Spam or fake account"},{value:"hate",label:"😡 Hate speech"},{value:"dont_like",label:"👎 I just don't like them"},{value:"other",label:"⚠️ Other reason"}], reason => showBlockConfirm(reason));
}

function showBlockConfirm(reason) {
  const modal = document.createElement("div"); modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;`;
  const sheet = document.createElement("div"); sheet.style.cssText = `background:white;border-radius:20px;padding:28px 24px;width:100%;max-width:400px;text-align:center;`;
  sheet.innerHTML = `<div style="font-size:40px;margin-bottom:12px;">🚫</div><h3 style="font-size:18px;font-weight:700;margin-bottom:8px;color:#111827;">Block this person?</h3><p style="font-size:14px;color:#6B7280;margin-bottom:24px;line-height:1.5;">They won't be able to see your posts, find you in search, or interact with you.</p><div style="display:flex;gap:10px;"><button id="cancelBlockConfirm" style="flex:1;padding:13px;border:1.5px solid #E5E7EB;border-radius:12px;background:white;font-size:15px;font-weight:600;color:#6B7280;cursor:pointer;font-family:inherit;">Cancel</button><button id="confirmBlockBtn" style="flex:1;padding:13px;border:none;border-radius:12px;background:#EF4444;font-size:15px;font-weight:600;color:white;cursor:pointer;font-family:inherit;">Block</button></div>`;
  modal.appendChild(sheet); document.body.appendChild(modal);
  sheet.querySelector("#cancelBlockConfirm").addEventListener("click", () => document.body.removeChild(modal));
  sheet.querySelector("#confirmBlockBtn").addEventListener("click", async () => { document.body.removeChild(modal); await executeBlock(reason); });
}

async function executeBlock(reason) {
  try {
    await fetch(`${baseUrl}/api/users/block/${profileUserId}`, { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}, body:JSON.stringify({reason}) });
    const blockBtn = document.getElementById("menuBlockBtn"); if (blockBtn) blockBtn.textContent = "🔓 Unblock";
    showToast("🚫 User blocked", "#EF4444");
  } catch (err) { console.error(err); showToast("Failed to block. Try again.", "#EF4444"); }
}

function showUnblockConfirm() {
  const modal = document.createElement("div"); modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;`;
  const sheet = document.createElement("div"); sheet.style.cssText = `background:white;border-radius:20px;padding:28px 24px;width:100%;max-width:400px;text-align:center;`;
  sheet.innerHTML = `<div style="font-size:40px;margin-bottom:12px;">🔓</div><h3 style="font-size:18px;font-weight:700;margin-bottom:8px;color:#111827;">Unblock this person?</h3><p style="font-size:14px;color:#6B7280;margin-bottom:24px;line-height:1.5;">They will be able to see your profile and posts again.</p><div style="display:flex;gap:10px;"><button id="cancelUnblock" style="flex:1;padding:13px;border:1.5px solid #E5E7EB;border-radius:12px;background:white;font-size:15px;font-weight:600;color:#6B7280;cursor:pointer;font-family:inherit;">Cancel</button><button id="confirmUnblock" style="flex:1;padding:13px;border:none;border-radius:12px;background:#10B981;font-size:15px;font-weight:600;color:white;cursor:pointer;font-family:inherit;">Unblock</button></div>`;
  modal.appendChild(sheet); document.body.appendChild(modal);
  sheet.querySelector("#cancelUnblock").addEventListener("click", () => document.body.removeChild(modal));
  sheet.querySelector("#confirmUnblock").addEventListener("click", async () => {
    document.body.removeChild(modal);
    try { await fetch(`${baseUrl}/api/users/unblock/${profileUserId}`, {method:"POST",headers:{Authorization:`Bearer ${token}`}}); const blockBtn = document.getElementById("menuBlockBtn"); if (blockBtn) blockBtn.textContent = "🚫 Block"; showToast("✅ User unblocked","#10B981"); } catch(err){console.error(err);}
  });
}

// ══════════════════════════════════════════════
//  DOUBLE TAP TO LIKE
// ══════════════════════════════════════════════
(function initDoubleTap() {
  const lastTap = {};
  document.addEventListener("touchend", async e => {
    const post = e.target.closest(".post"); if (!post) return;
    if (e.target.closest("button") || e.target.closest("a") || e.target.closest("video")) return;
    const postId = post.dataset.postId; if (!postId) return;
    const now = Date.now(); const last = lastTap[postId] || 0;
    if (now - last < 350) { lastTap[postId] = 0; fireHeart(post); await doLike(postId, post); }
    else { lastTap[postId] = now; }
  });
  document.addEventListener("dblclick", async e => {
    const post = e.target.closest(".post"); if (!post) return;
    if (e.target.closest("button") || e.target.closest("a") || e.target.closest("video")) return;
    const postId = post.dataset.postId; if (!postId) return;
    fireHeart(post); await doLike(postId, post);
  });
  function fireHeart(post) {
    if (!post.style.position || post.style.position === "static") post.style.position = "relative";
    post.style.overflow = "hidden";
    const heart = document.createElement("span"); heart.className = "dt-heart"; heart.textContent = "❤️";
    post.appendChild(heart); setTimeout(() => { if (heart.parentNode) heart.remove(); }, 850);
  }
  async function doLike(postId, post) {
    const t = localStorage.getItem("token"); if (!t) return;
    const loveBtn = post.querySelector(".love-btn"); if (loveBtn && loveBtn.classList.contains("liked")) return;
    try {
      const res  = await fetch(`${baseUrl}/api/posts/${postId}/like`, { method:"POST", headers:{Authorization:`Bearer ${t}`} });
      const data = await res.json();
      if (loveBtn) { const countEl = loveBtn.querySelector(".count"); if (countEl) countEl.textContent = data.likes.length; loveBtn.classList.add("liked"); loveBtn.classList.add("pop"); setTimeout(() => loveBtn.classList.remove("pop"), 300); }
    } catch (err) { console.error("Double tap like error:", err); }
  }
})();

// ══════════════════════════════════════════════
//  PROFILE GIFT MODAL
// ══════════════════════════════════════════════
let profileGiftStarBalance   = 0;
let profileGiftSelected      = null;
let profileGiftRecipientId   = null;
let profileGiftRecipientName = null;

function buildProfileGiftGrid() {
  const grid = document.getElementById("profileGiftGrid"); if (!grid) return;
  grid.innerHTML = PROFILE_GIFT_CATALOGUE.map((g, i) => `
    <div class="feed-gift-item" data-index="${i}">
      <span class="feed-gift-emoji">${g.emoji}</span>
      <span class="feed-gift-name">${g.name}</span>
      <span class="feed-gift-cost">⭐ ${g.stars.toLocaleString()}</span>
    </div>
  `).join("");
  grid.querySelectorAll(".feed-gift-item").forEach(el => {
    el.addEventListener("click", () => {
      grid.querySelectorAll(".feed-gift-item").forEach(x => x.classList.remove("selected"));
      el.classList.add("selected");
      profileGiftSelected = PROFILE_GIFT_CATALOGUE[parseInt(el.dataset.index)];
      updateProfileGiftSendState();
    });
  });
}

function updateProfileGiftSendState() {
  const sendBtn     = document.getElementById("profileGiftSendBtn");
  const rechargeBtn = document.getElementById("profileGiftRechargeBtn");
  if (!profileGiftSelected) { sendBtn.textContent = "Send Gift"; return; }
  const cost = profileGiftSelected.stars;
  if (profileGiftStarBalance === 0) {
    sendBtn.style.display = "none"; rechargeBtn.style.display = "inline-flex"; rechargeBtn.textContent = "Recharge Stars";
  } else if (cost > profileGiftStarBalance) {
    sendBtn.style.display = "none"; rechargeBtn.style.display = "inline-flex"; rechargeBtn.textContent = "Insufficient Balance — Recharge";
  } else {
    sendBtn.style.display = ""; rechargeBtn.style.display = "none"; sendBtn.disabled = false;
    sendBtn.textContent = `Send ${profileGiftSelected.emoji} Gift`;
  }
}

async function fetchProfileStarBalance() {
  try {
    const res  = await fetch(`${baseUrl}/api/wallet`, { headers:{Authorization:`Bearer ${token}`} });
    const data = await res.json(); profileGiftStarBalance = data.starBalance || 0;
  } catch { profileGiftStarBalance = 0; }
  document.getElementById("profileGiftStarBal").textContent = profileGiftStarBalance.toLocaleString();
  updateProfileGiftSendState();
}

function openProfileGiftModal(recipientId, recipientName) {
  if (isGuest) { showGuestModal(); return; }
  profileGiftRecipientId   = recipientId;
  profileGiftRecipientName = recipientName;
  profileGiftSelected      = null;
  document.querySelectorAll("#profileGiftGrid .feed-gift-item").forEach(x => x.classList.remove("selected"));
  document.getElementById("profileGiftSendBtn").style.display     = "";
  document.getElementById("profileGiftRechargeBtn").style.display = "none";
  document.getElementById("profileGiftSendBtn").textContent       = "Send Gift";
  document.getElementById("profileGiftStarBal").textContent       = "...";
  document.getElementById("profileGiftModal").style.display       = "flex";
  fetchProfileStarBalance();
}

document.getElementById("profileGiftClose").addEventListener("click", () => {
  document.getElementById("profileGiftModal").style.display = "none";
});

document.getElementById("profileGiftRechargeBtn").addEventListener("click", () => {
  window.location.href = "/wallet.html";
});

document.getElementById("profileGiftSendBtn").addEventListener("click", async () => {
  if (!profileGiftSelected) { showToast("Pick a gift first!"); return; }
  if (profileGiftSelected.stars > profileGiftStarBalance) { showToast("Not enough stars. Recharge first."); return; }
  const sendBtn = document.getElementById("profileGiftSendBtn");
  sendBtn.disabled = true; sendBtn.textContent = "Sending...";
  try {
    const res = await fetch(`${baseUrl}/api/wallet/profile-gift`, {
      method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
      body:JSON.stringify({ recipient:profileGiftRecipientId, giftType:profileGiftSelected.name, amount:profileGiftSelected.stars, postId: activePostId})
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
    document.getElementById("profileGiftModal").style.display = "none";
    showToast(`🎁 ${profileGiftSelected.emoji} Gift sent to ${profileGiftRecipientName}!`, "#22C55E");
  } catch (err) {
    showToast(err.message || "Failed to send gift.", "#EF4444");
    sendBtn.disabled = false; sendBtn.textContent = `Send ${profileGiftSelected.emoji} Gift`;
  }
});

// ══════════════════════════════════════════════
//  THREE DOT MENU STYLES (injected)
// ══════════════════════════════════════════════
const _style = document.createElement("style");
_style.textContent = `
  .post-three-dot { background:none;border:none;cursor:pointer;padding:6px;margin-left:auto;display:flex;align-items:center;border-radius:50%;transition:background 0.15s;flex-shrink:0; }
  .post-three-dot:hover { background:#F3F4F6; }
  .post-three-dot-menu { position:absolute;background:#fff;border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,0.16);z-index:9999;min-width:180px;overflow:hidden;border:1px solid #F3F4F6;animation:popUp 0.18s ease; }
  .three-dot-item { display:flex;align-items:center;gap:10px;width:100%;padding:13px 16px;border:none;background:#fff;font-size:14px;font-weight:600;color:#374151;cursor:pointer;text-align:left;font-family:inherit;transition:background 0.15s;border-bottom:1px solid #F9FAFB; }
  .three-dot-item:last-child { border-bottom:none; }
  .three-dot-item:hover { background:#F9FAFB; }
  .post-actions { display:flex;align-items:center;padding:10px 14px 14px;gap:16px;flex-wrap:nowrap;overflow-x:auto; }
  .action-btn { flex-direction:row !important;align-items:center;gap:5px;flex-shrink:0; }
  .action-btn svg { width:22px;height:22px;flex-shrink:0; }
  .action-btn .count { font-size:13px;font-weight:600;color:#374151; }
  .action-btn.gift-btn svg { stroke:#f4b400;fill:none; }
  .action-label { font-size:13px;font-weight:700;color:#f4b400; }
`;
document.head.appendChild(_style);

buildProfileGiftGrid();
