// ══════════════════════════════════════════════
//  DARK MODE
// ══════════════════════════════════════════════
if (localStorage.getItem("afri_theme") === "dark") document.body.classList.add("dark");

// ══════════════════════════════════════
//  SETUP
// ══════════════════════════════════════
const API_BASE      = "https://afrisocial-backend.onrender.com";
const token         = localStorage.getItem("token");
const currentUserId = localStorage.getItem("userId");
const isLoggedIn    = !!token;

const container       = document.getElementById("vybzePlayer");
const params          = new URLSearchParams(window.location.search);
const selectedVideoId = params.get("videoId");

// ══════════════════════════════════════
//  TOP BAR BUTTONS
// ══════════════════════════════════════
document.getElementById("vybzeBackBtn").addEventListener("click", () => {
  if (history.length > 1) history.back();
  else window.location.href = "vybze.html";
});

document.getElementById("vybzeSearchBtn").addEventListener("click", () => {
  window.location.href = "search.html";
});

// Three-dots → report current visible video
document.getElementById("vybzeMoreBtn").addEventListener("click", () => {
  const visibleSlide = getVisibleSlide();
  if (visibleSlide) showReportModal(visibleSlide.dataset.id, "video");
});

function getVisibleSlide() {
  const slides = document.querySelectorAll(".video-slide");
  for (const slide of slides) {
    const rect = slide.getBoundingClientRect();
    if (rect.top >= -rect.height / 2 && rect.top <= rect.height / 2) return slide;
  }
  return slides[0] || null;
}

// ══════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════
function getFlagEmoji(code) {
  if (!code) return "";
  return code.toUpperCase()
    .replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt()));
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function verifiedBadge() {
  return `<svg width="14" height="14" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#1DA1F2"/>
    <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/>
  </svg>`;
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}

function saveRedirect() {
  localStorage.setItem("redirectAfterAuth", window.location.href);
}

function renderPostText(text, mentions) {
  if (!text) return "";
  const safeText = typeof escapeHTML === "function" ? escapeHTML(text) : text;
  let output = safeText.replace(/#(\w+)/g, (match, tag) => {
    return `<a href="/hashtag.html?tag=${tag}" class="hashtag-link">#${tag}</a>`;
  });
  const mentionMap = {};
  (mentions || []).forEach(m => { mentionMap[m.username.toLowerCase()] = m; });
  output = output.replace(/@([a-zA-Z0-9_.-]+)/g, (match, username) => {
    const user = mentionMap[username.toLowerCase()];
    if (!user) return match;
    return `<a href="/profile.html?userId=${user._id}" class="mention">${match}</a>`;
  });
  return output;
}

// ══════════════════════════════════════
//  GUEST TIMER
// ══════════════════════════════════════
const GUEST_WATCH_SECONDS = 30;
let guestTimer  = null;
let guestShown  = false;

function startGuestTimer() {
  if (isLoggedIn || guestShown) return;
  clearTimeout(guestTimer);
  guestTimer = setTimeout(() => showGuestModal(), GUEST_WATCH_SECONDS * 1000);
}

function stopGuestTimer() { clearTimeout(guestTimer); }

function showGuestModal() {
  if (guestShown) return;
  guestShown = true;
  document.querySelectorAll(".video-slide video").forEach(v => v.pause());
  document.getElementById("loginPromptModal").style.display = "flex";
}

document.getElementById("guestSignupBtn").addEventListener("click", e => {
  e.preventDefault(); saveRedirect(); window.location.href = "/signup.html";
});
document.getElementById("guestLoginBtn").addEventListener("click", e => {
  e.preventDefault(); saveRedirect(); window.location.href = "/login.html";
});

// ══════════════════════════════════════
//  GIFT CATALOGUE
// ══════════════════════════════════════
const VYBZE_GIFT_CATALOGUE = [
  { emoji: "❤️",  name: "Heart",      stars: 10   },
  { emoji: "🌹",  name: "Rose",       stars: 15   },
  { emoji: "🍎",  name: "Apple",      stars: 20   },
  { emoji: "🍇",  name: "Grapes",     stars: 25   },
  { emoji: "🌸",  name: "Blossom",    stars: 30   },
  { emoji: "🍓",  name: "Strawberry", stars: 40   },
  { emoji: "💐",  name: "Bouquet",    stars: 50   },
  { emoji: "🎂",  name: "Cake",       stars: 60   },
  { emoji: "🦋",  name: "Butterfly",  stars: 75   },
  { emoji: "💎",  name: "Diamond",    stars: 90   },
  { emoji: "👑",  name: "Crown",      stars: 120  },
  { emoji: "🏆",  name: "Trophy",     stars: 150  },
  { emoji: "🚀",  name: "Rocket",     stars: 200  },
  { emoji: "🎸",  name: "Guitar",     stars: 250  },
  { emoji: "🌍",  name: "Globe",      stars: 300  },
  { emoji: "🏎️",  name: "Sports Car", stars: 500  },
  { emoji: "🚁",  name: "Helicopter", stars: 750  },
  { emoji: "🚢",  name: "Cruise",     stars: 1000 },
  { emoji: "🛸",  name: "UFO",        stars: 1500 },
  { emoji: "🏰",  name: "Castle",     stars: 2000 },
  { emoji: "🚗",  name: "Car",        stars: 3000 },
  { emoji: "✈️",  name: "Jet",        stars: 5000 },
];

let vybzeGiftStarBalance   = 0;
let vybzeGiftSelected      = null;
let vybzeGiftRecipientId   = null;
let vybzeGiftRecipientName = null;

function buildVybzeGiftGrid() {
  const grid = document.getElementById("vybzeGiftGrid");
  if (!grid) return;
  grid.innerHTML = VYBZE_GIFT_CATALOGUE.map((g, i) => `
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
      vybzeGiftSelected = VYBZE_GIFT_CATALOGUE[parseInt(el.dataset.index)];
      updateVybzeGiftSendState();
    });
  });
}

function updateVybzeGiftSendState() {
  const sendBtn     = document.getElementById("vybzeGiftSendBtn");
  const rechargeBtn = document.getElementById("vybzeGiftRechargeBtn");
  if (!vybzeGiftSelected) { sendBtn.textContent = "Send Gift"; return; }
  const cost = vybzeGiftSelected.stars;
  if (vybzeGiftStarBalance === 0 || cost > vybzeGiftStarBalance) {
    sendBtn.style.display     = "none";
    rechargeBtn.style.display = "inline-flex";
    rechargeBtn.textContent   = vybzeGiftStarBalance === 0
      ? "Recharge Stars"
      : "Insufficient Balance — Recharge";
  } else {
    sendBtn.style.display     = "";
    rechargeBtn.style.display = "none";
    sendBtn.disabled          = false;
    sendBtn.textContent       = `Send ${vybzeGiftSelected.emoji} Gift`;
  }
}

async function fetchVybzeStarBalance() {
  try {
    const res  = await fetch(`${API_BASE}/api/wallet`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    vybzeGiftStarBalance = data.starBalance || 0;
  } catch { vybzeGiftStarBalance = 0; }
  document.getElementById("vybzeGiftStarBal").textContent = vybzeGiftStarBalance.toLocaleString();
  updateVybzeGiftSendState();
}

function openVybzeGiftModal(recipientId, recipientName) {
  vybzeGiftRecipientId   = recipientId;
  vybzeGiftRecipientName = recipientName;
  vybzeGiftSelected      = null;
  document.querySelectorAll("#vybzeGiftGrid .feed-gift-item").forEach(x => x.classList.remove("selected"));
  document.getElementById("vybzeGiftSendBtn").style.display     = "";
  document.getElementById("vybzeGiftRechargeBtn").style.display = "none";
  document.getElementById("vybzeGiftSendBtn").textContent       = "Send Gift";
  document.getElementById("vybzeGiftStarBal").textContent       = "...";
  document.getElementById("vybzeGiftModal").style.display       = "flex";
  fetchVybzeStarBalance();
}

document.getElementById("vybzeGiftClose").addEventListener("click", () => {
  document.getElementById("vybzeGiftModal").style.display = "none";
});

document.getElementById("vybzeGiftRechargeBtn").addEventListener("click", () => {
  window.location.href = "/wallet.html";
});

document.getElementById("vybzeGiftSendBtn").addEventListener("click", async () => {
  if (!vybzeGiftSelected) { showToast("Pick a gift first!"); return; }
  if (vybzeGiftSelected.stars > vybzeGiftStarBalance) { showToast("Not enough stars. Recharge first."); return; }
  const sendBtn = document.getElementById("vybzeGiftSendBtn");
  sendBtn.disabled = true; sendBtn.textContent = "Sending...";
  try {
    const res = await fetch(`${API_BASE}/api/wallet/gift/vybze`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        recipientId: vybzeGiftRecipientId,
        giftType: vybzeGiftSelected.name,
        amount: vybzeGiftSelected.stars,
        postId: activePostId
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
    document.getElementById("vybzeGiftModal").style.display = "none";
    showToast(`🎁 ${vybzeGiftSelected.emoji} Gift sent to ${vybzeGiftRecipientName}!`);
    if (data.comment) {
      renderComment(data.comment);
      const activeSlide = document.querySelector(`.video-slide[data-id="${activePostId}"]`);
      if (activeSlide) {
        const countEl = activeSlide.querySelector(".comment-btn .count");
        if (countEl) countEl.textContent = parseInt(countEl.textContent || 0) + 1;
      }
    }
  } catch (err) {
    showToast(err.message || "Failed to send gift.");
    sendBtn.disabled = false;
    sendBtn.textContent = `Send ${vybzeGiftSelected.emoji} Gift`;
  }
});

// ══════════════════════════════════════
//  REPORT MODAL
// ══════════════════════════════════════
function showReportModal(contentId, contentType) {
  const reasons = [
    { value: "spam",           label: "🚫 Spam" },
    { value: "hate_speech",    label: "😡 Hate Speech" },
    { value: "explicit",       label: "🔞 Explicit Content" },
    { value: "malicious_link", label: "🔗 Malicious Link" },
    { value: "other",          label: "⚠️ Other" },
  ];

  const modal = document.createElement("div");
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.6);
    display:flex;align-items:flex-end;justify-content:center;
    z-index:9999;padding:20px;
  `;

  const sheet = document.createElement("div");
  sheet.style.cssText = `
    background:#fff;border-radius:20px;padding:24px;
    width:100%;max-width:500px;
  `;

  sheet.innerHTML = `
    <h3 style="font-size:18px;font-weight:700;margin-bottom:16px;color:#111827;">
      Report Video
    </h3>
    <p style="font-size:14px;color:#6B7280;margin-bottom:20px;">
      Why are you reporting this?
    </p>
    ${reasons.map(r => `
      <button data-reason="${r.value}"
        style="display:block;width:100%;text-align:left;
        padding:14px 16px;border:1.5px solid #E5E7EB;
        border-radius:12px;background:white;font-size:15px;
        font-weight:500;color:#111827;margin-bottom:8px;cursor:pointer;">
        ${r.label}
      </button>
    `).join("")}
    <button id="cancelReportBtn"
      style="display:block;width:100%;padding:14px;border:none;
      background:#F3F4F6;border-radius:12px;font-size:15px;
      font-weight:600;color:#6B7280;margin-top:4px;cursor:pointer;">
      Cancel
    </button>
  `;

  modal.appendChild(sheet);
  document.body.appendChild(modal);

  sheet.querySelectorAll("[data-reason]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const reason = btn.dataset.reason;
      try {
        await fetch(`${API_BASE}/api/moderation/report`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ contentId, contentType, reason })
        });
      } catch (err) { console.error("Report error:", err); }
      document.body.removeChild(modal);
      showToast("✅ Reported. Thank you!");
    });
  });

  sheet.querySelector("#cancelReportBtn").addEventListener("click", () => {
    document.body.removeChild(modal);
  });
}

// ══════════════════════════════════════
//  LOAD VIDEOS
// ══════════════════════════════════════
async function loadVideos() {
  try {
    const headers = isLoggedIn ? { Authorization: `Bearer ${token}` } : {};
    const res     = await fetch(`${API_BASE}/api/vybze/feed`, { headers });
    const data    = await res.json();
    const videos  = data.videos || [];

    videos.forEach(video => {
      const slide     = document.createElement("div");
      slide.className = "video-slide";
      slide.dataset.id = video._id;

      const isLiked   = (video.likes || []).includes(currentUserId);
      const isStarred = (video.stars || []).includes(currentUserId);

      const activeSponsored =
        video.isSponsored &&
        (!video.expiresAt || new Date(video.expiresAt) > new Date());

      slide.innerHTML = `
        <video src="${video.video}" loop playsinline muted></video>

        ${activeSponsored ? `
          <div class="vybze-sponsored-top">
            <span class="vybze-sponsored-tag">${video.sponsoredLabel || "SPONSORED"}</span>
            ${video.sponsorName ? `<span class="vybze-sponsored-by">Sponsored by ${video.sponsorName}</span>` : ""}
          </div>
        ` : ""}

        <div class="mute-indicator" id="mute-${video._id}">🔇</div>

        <div class="video-info">
          <a class="video-info-user" href="/profile.html?userId=${video.user._id}">
            <img src="${video.user.profilePicture || '/uploads/images/africa.png'}" />
          </a>
          <h4>${video.user.username} ${video.user.isVerified ? verifiedBadge() : ""} ${getFlagEmoji(video.user.country)}</h4>
          <p>${renderPostText(video.text, video.mentions || [])}</p>
        </div>

        ${activeSponsored && video.redirectUrl ? `
          <div class="vybze-cta-wrap">
            <button class="vybze-cta-btn" data-post-id="${video._id}" data-url="${video.redirectUrl}">
              ${video.ctaText || "Learn More"}
            </button>
          </div>
        ` : ""}

        <div class="video-actions">
          <button class="action-btn love-btn ${isLiked ? "liked" : ""}">
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                stroke="white" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"
                fill="${isLiked ? "#ff2d55" : "none"}"
                style="stroke:${isLiked ? "#ff2d55" : "white"}"/>
            </svg>
            <span class="count">${(video.likes || []).length}</span>
          </button>

          <button class="action-btn comment-btn">
            <svg viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span class="count">${video.commentCount || 0}</span>
          </button>

          <button class="action-btn star-btn ${isStarred ? "starred" : ""}">
            <svg viewBox="0 0 24 24">
              <path d="M12 2l3.1 6.3 7 1-5 4.9 1.2 7-6.3-3.4-6.3 3.4 1.2-7-5-4.9 7-1z"/>
            </svg>
            <span class="count">${(video.stars || []).length}</span>
          </button>

          <button class="action-btn vybze-gift-btn"
            data-video-user-id="${video.user._id}"
            data-video-user-name="${video.user.username}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 12 20 22 4 22 4 12"/>
              <rect x="2" y="7" width="20" height="5"/>
              <path d="M12 22V7"/>
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
            </svg>
            <span class="count">Gift</span>
          </button>

          <button class="action-btn share-btn">
            <svg viewBox="0 0 24 24">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            <span class="count">Share</span>
          </button>

          <div class="view-count">👁 ${video.views || 0}</div>
        </div>
      `;

      // Hide top bar for sponsored posts
      if (activeSponsored) {
        slide.addEventListener("scroll", () => {}, { passive: true });
      }

      container.appendChild(slide);

      // Track sponsored impression
      if (activeSponsored) {
        const impObserver = new IntersectionObserver((entries) => {
          entries.forEach(async (entry) => {
            if (entry.isIntersecting) {
              try {
                await fetch(`${API_BASE}/api/posts/${video._id}/impression`, {
                  method: "POST", headers: { Authorization: `Bearer ${token}` }
                });
              } catch (err) { console.error("Impression tracking failed"); }
              impObserver.unobserve(slide);
            }
          });
        }, { threshold: 0.7 });
        impObserver.observe(slide);
      }
    });

    // Hide/show top bar based on whether current slide is sponsored
    const topBarObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const slide = entry.target;
          const isSponsored = !!slide.querySelector(".vybze-sponsored-top");
          const topBar = document.getElementById("vybzeTopBar");
          if (isSponsored) {
            topBar.classList.add("hidden");
          } else {
            topBar.classList.remove("hidden");
          }
        }
      });
    }, { threshold: 0.7 });

    document.querySelectorAll(".video-slide").forEach(s => topBarObserver.observe(s));

    initVideoAutoplay();
    initVideoViews();
    bindActions();

    // Double tap to like
    document.querySelectorAll(".video-slide video").forEach(videoEl => {
      videoEl.addEventListener("dblclick", async () => {
        if (!isLoggedIn) { saveRedirect(); showToast("Sign up to like videos 👇"); showGuestModal(); return; }
        const slide   = videoEl.closest(".video-slide");
        const vId     = slide.dataset.id;
        const btn     = slide.querySelector(".love-btn");
        try {
          const res  = await fetch(`${API_BASE}/api/posts/${vId}/like`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          btn.querySelector(".count").textContent = data.likes.length;
          btn.classList.toggle("liked", data.liked);
          // update inline SVG fill
          const path = btn.querySelector("svg path");
          if (path) {
            path.setAttribute("fill", data.liked ? "#ff2d55" : "none");
            path.style.stroke = data.liked ? "#ff2d55" : "white";
          }
          btn.classList.add("pop");
          setTimeout(() => btn.classList.remove("pop"), 300);
          for (let i = 0; i < 3; i++) {
            const heart = document.createElement("div");
            heart.className = "heart-center"; heart.textContent = "❤️";
            const offset = (Math.random() * 80) - 40;
            heart.style.left = `calc(50% + ${offset}px)`;
            heart.style.animationDelay = `${i * 0.2}s`;
            slide.appendChild(heart);
            setTimeout(() => heart.remove(), 1000);
          }
        } catch (err) { console.error(err); }
      });
    });

    // Scroll to shared video if videoId in URL
    if (selectedVideoId) {
      setTimeout(() => {
        const target = document.querySelector(`[data-id="${selectedVideoId}"]`);
        if (target) target.scrollIntoView({ behavior: "auto", block: "start" });
      }, 200);
    }

    if (!isLoggedIn) startGuestTimer();

  } catch (err) { console.error("Load videos error:", err); }
}

loadVideos();
buildVybzeGiftGrid();

// ══════════════════════════════════════
//  SPONSORED CTA CLICK
// ══════════════════════════════════════
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".vybze-cta-btn");
  if (!btn) return;
  const postId = btn.dataset.postId;
  const url    = btn.dataset.url;
  try {
    await fetch(`${API_BASE}/api/posts/${postId}/click`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  } catch (err) { console.error("Click tracking failed"); }
  window.open(url, "_blank");
});

// ══════════════════════════════════════
//  VIDEO AUTOPLAY
// ══════════════════════════════════════
function initVideoAutoplay() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) { video.play().catch(() => {}); if (!isLoggedIn) startGuestTimer(); }
      else { video.pause(); if (!isLoggedIn) stopGuestTimer(); }
    });
  }, { threshold: 0.7 });
  document.querySelectorAll(".video-slide video").forEach(v => observer.observe(v));
}

// ══════════════════════════════════════
//  VIDEO VIEWS
// ══════════════════════════════════════
const viewedVideos = new Set();

function initVideoViews() {
  if (!isLoggedIn) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(async entry => {
      const video   = entry.target;
      const slide   = video.closest(".video-slide");
      const vId     = slide.dataset.id;
      const viewEl  = slide.querySelector(".view-count");
      if (entry.isIntersecting) {
        if (!viewedVideos.has(vId)) {
          video._viewTimer = setTimeout(async () => {
            viewedVideos.add(vId);
            const views = await sendVideoView(vId);
            if (viewEl && views != null) viewEl.textContent = `👁 ${views}`;
          }, 2000);
        }
      } else { clearTimeout(video._viewTimer); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll(".video-slide video").forEach(v => observer.observe(v));
}

async function sendVideoView(vId) {
  try {
    const res  = await fetch(`${API_BASE}/api/posts/${vId}/view`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    return data.views;
  } catch { return null; }
}

// ══════════════════════════════════════
//  SOUND ON TAP
// ══════════════════════════════════════
document.addEventListener("click", () => {
  document.querySelectorAll(".video-slide video").forEach(v => { v.muted = false; v.volume = 1; });
}, { once: true });

// ══════════════════════════════════════
//  BIND ACTIONS
// ══════════════════════════════════════
let activeShareVideoId = null;

function bindActions() {
  document.addEventListener("click", async e => {
    const slide = e.target.closest(".video-slide");
    if (!slide) return;
    const vId = slide.dataset.id;

    // ── Like ──
    if (e.target.closest(".love-btn")) {
      if (!isLoggedIn) { saveRedirect(); showToast("Sign up to like videos 👇"); showGuestModal(); return; }
      const btn = e.target.closest(".love-btn");
      try {
        const res  = await fetch(`${API_BASE}/api/posts/${vId}/like`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        btn.querySelector(".count").textContent = data.likes.length;
        btn.classList.toggle("liked", data.liked);
        const path = btn.querySelector("svg path");
        if (path) {
          path.setAttribute("fill", data.liked ? "#ff2d55" : "none");
          path.style.stroke = data.liked ? "#ff2d55" : "white";
        }
        btn.classList.add("pop"); setTimeout(() => btn.classList.remove("pop"), 300);
      } catch (err) { console.error(err); }
    }

    // ── Star ──
    if (e.target.closest(".star-btn")) {
      if (!isLoggedIn) { saveRedirect(); showToast("Sign up to star videos 👇"); showGuestModal(); return; }
      const btn = e.target.closest(".star-btn");
      try {
        const res  = await fetch(`${API_BASE}/api/posts/${vId}/star`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        btn.querySelector(".count").textContent = data.stars.length;
        btn.classList.toggle("starred", data.starred);
        btn.classList.add("pop"); setTimeout(() => btn.classList.remove("pop"), 300);
      } catch (err) { console.error(err); }
    }

    // ── Comment ──
    if (e.target.closest(".comment-btn")) openCommentModal(vId, slide);

    // ── Gift ──
    if (e.target.closest(".vybze-gift-btn")) {
      if (!isLoggedIn) { saveRedirect(); showToast("Sign up to send gifts 👇"); showGuestModal(); return; }
      const btn           = e.target.closest(".vybze-gift-btn");
      const recipientId   = btn.dataset.videoUserId;
      const recipientName = btn.dataset.videoUserName;
      if (recipientId === currentUserId) { showToast("You can't gift yourself!"); return; }
      openVybzeGiftModal(recipientId, recipientName);
    }

    // ── Share ──
    if (e.target.closest(".share-btn")) {
      const shareUrl = `${window.location.origin}/v/${vId}`;
      try {
        if (navigator.share) { await navigator.share({ title: "Watch this on Afrisocial Vybze", text: "Check out this video on Afrisocial", url: shareUrl }); }
        else { activeShareVideoId = vId; document.getElementById("shareModal").style.display = "flex"; }
      } catch (err) {
        if (err.name !== "AbortError") { activeShareVideoId = vId; document.getElementById("shareModal").style.display = "flex"; }
      }
    }
  });
}

// ══════════════════════════════════════
//  SHARE MODAL OPTIONS
// ══════════════════════════════════════
document.getElementById("closeShareModal").onclick = () => { document.getElementById("shareModal").style.display = "none"; };

document.getElementById("shareWhatsapp").onclick = () => {
  const url = `${window.location.origin}/v/${activeShareVideoId}`;
  window.open(`https://wa.me/?text=${encodeURIComponent("Watch this on Afrisocial: " + url)}`, "_blank");
  document.getElementById("shareModal").style.display = "none";
};

document.getElementById("shareFacebook").onclick = () => {
  const url = `${window.location.origin}/v/${activeShareVideoId}`;
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
  document.getElementById("shareModal").style.display = "none";
};

document.getElementById("shareCopy").onclick = async () => {
  const url = `${window.location.origin}/v/${activeShareVideoId}`;
  await navigator.clipboard.writeText(url);
  showToast("Link copied!");
  document.getElementById("shareModal").style.display = "none";
};

document.getElementById("shareNative").onclick = async () => {
  const url = `${window.location.origin}/v/${activeShareVideoId}`;
  try {
    if (navigator.share) { await navigator.share({ title: "Watch this on Afrisocial Vybze", url }); }
    else { await navigator.clipboard.writeText(url); showToast("Link copied!"); }
  } catch (err) {
    if (err.name !== "AbortError") { await navigator.clipboard.writeText(url).catch(() => {}); showToast("Link copied!"); }
  }
  document.getElementById("shareModal").style.display = "none";
};

// ══════════════════════════════════════
//  COMMENT MODAL
// ══════════════════════════════════════
const commentModal      = document.getElementById("commentModal");
const commentList       = document.getElementById("commentList");
const commentInput      = document.getElementById("commentInput");
const sendCommentBtn    = document.getElementById("sendCommentBtn");
const closeCommentModal = document.getElementById("closeCommentModal");
const commentInputRow   = document.getElementById("commentInputRow");
const commentGuestRow   = document.getElementById("commentGuestRow");

let activePostId     = null;
let activeCommentBtn = null;

function openCommentModal(postId, slideEl = null) {
  activePostId     = postId;
  activeCommentBtn = slideEl ? slideEl.querySelector(".comment-btn") : null;
  commentModal.style.display = "flex";
  commentList.innerHTML      = "";
  if (isLoggedIn) { commentInputRow.style.display = "flex"; commentGuestRow.style.display = "none"; }
  else { commentInputRow.style.display = "none"; commentGuestRow.style.display = "block"; }
  loadComments(postId);
}

closeCommentModal.onclick = () => { commentModal.style.display = "none"; };

document.getElementById("commentSignupLink").addEventListener("click", e => { e.preventDefault(); saveRedirect(); window.location.href = "/signup.html"; });
document.getElementById("commentLoginLink").addEventListener("click", e => { e.preventDefault(); saveRedirect(); window.location.href = "/login.html"; });

function renderComment(comment) {
  const div     = document.createElement("div");
  div.className = comment.isGift ? "comment gift-comment" : "comment";
  div.dataset.id = comment._id;
  div.innerHTML = `
    <div class="comment-user">
      <a href="/profile.html?userId=${comment.user._id}">
        <img src="${comment.user.profilePicture || '/uploads/images/africa.png'}" />
      </a>
      <div class="comment-user-meta">
        <strong>${comment.user.fullName} ${comment.user.isVerified ? verifiedBadge() : ""}</strong>
        ${comment.isGift ? `
          <div class="gift-support-badge">
            🎁 ${comment.giftType || "Gift"} Supporter
            <span>⭐ ${Number(comment.giftStars || 0).toLocaleString()}</span>
          </div>
        ` : ""}
      </div>
    </div>
    <p class="comment-text">${renderPostText(comment.text, comment.mentions || [])}</p>
    <div class="comment-actions">
      <span class="comment-like ${isLoggedIn && comment.likes.includes(currentUserId) ? "liked" : ""}">
        ❤️ <span class="like-count">${comment.likes.length}</span>
      </span>
      ${isLoggedIn ? `<span class="reply-btn">Reply</span>` : ""}
      <small>${timeAgo(comment.createdAt)}</small>
    </div>
    <div class="replies"></div>
  `;
  commentList.appendChild(div);
}

async function loadComments(postId) {
  try {
    const headers  = isLoggedIn ? { Authorization: `Bearer ${token}` } : {};
    const res      = await fetch(`${API_BASE}/api/comments/${postId}`, { headers });
    const comments = await res.json();
    commentList.innerHTML = "";
    comments.filter(c => !c.parentComment).forEach(c => renderComment(c));
    comments.filter(c => c.parentComment).forEach(reply => {
      const parentEl = commentList.querySelector(`[data-id="${reply.parentComment}"]`);
      if (!parentEl) return;
      const rd     = document.createElement("div");
      rd.className = "reply"; rd.dataset.id = reply._id;
      rd.innerHTML = `
        <div class="reply-user">
          <img src="${reply.user.profilePicture || '/uploads/images/africa.png'}" />
          <strong>${reply.user.fullName}</strong>
        </div>
        <div class="reply-area">
          <p class="reply-text">${renderPostText(reply.text, reply.mentions || [])}</p>
          <small>${timeAgo(reply.createdAt)}</small>
        </div>
      `;
      parentEl.querySelector(".replies").appendChild(rd);
    });
  } catch (err) { console.error("Load comments error:", err); }
}

if (isLoggedIn) {
  sendCommentBtn.onclick = async () => {
    const text = commentInput.value.trim(); if (!text) return;
    try {
      const res     = await fetch(`${API_BASE}/api/comments/${activePostId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text })
      });
      const comment = await res.json();
      renderComment(comment); commentInput.value = "";
      if (activeCommentBtn) { const c = activeCommentBtn.querySelector(".count"); if (c) c.textContent = parseInt(c.textContent) + 1; }
    } catch (err) { console.error(err); }
  };
}

document.addEventListener("click", async e => {
  if (!isLoggedIn) return;
  if (e.target.closest(".comment-like")) {
    const likeBtn   = e.target.closest(".comment-like");
    const commentEl = likeBtn.closest(".comment");
    try {
      const res  = await fetch(`${API_BASE}/api/comments/like/${commentEl.dataset.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      likeBtn.querySelector(".like-count").textContent = data.likes.length;
      likeBtn.classList.toggle("liked", data.liked);
    } catch (err) { console.error(err); }
  }
  if (e.target.closest(".reply-btn")) {
    const commentEl = e.target.closest(".comment");
    if (commentEl.querySelector(".reply-input")) return;
    const box = document.createElement("div"); box.className = "reply-input";
    box.innerHTML = `<input placeholder="Write a reply..." /><button class="send-reply">Reply</button>`;
    commentEl.appendChild(box);
  }
  if (e.target.classList.contains("send-reply")) {
    const replyBox  = e.target.closest(".reply-input");
    const text      = replyBox.querySelector("input").value.trim(); if (!text) return;
    const commentEl = replyBox.closest(".comment");
    try {
      const res   = await fetch(`${API_BASE}/api/comments/reply/${commentEl.dataset.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text })
      });
      const reply = await res.json();
      const rd    = document.createElement("div"); rd.className = "reply"; rd.dataset.id = reply._id;
      rd.innerHTML = `
        <div class="reply-user">
          <img src="${reply.user.profilePicture || '/uploads/images/africa.png'}" />
          <strong>${reply.user.fullName}</strong>
        </div>
        <p class="reply-text">${reply.text}</p>
      `;
      commentEl.querySelector(".replies").appendChild(rd); replyBox.remove();
    } catch (err) { console.error(err); }
  }
});

// ══════════════════════════════════════
//  MESSAGE BADGE — dynamic, never stagnant
// ══════════════════════════════════════
const messageBadge = document.getElementById("messageBadge");

async function loadUnreadMessages() {
  if (!isLoggedIn) return;
  try {
    const res  = await fetch(`${API_BASE}/api/messages/unread-count`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    const count = data.count || 0;
    if (count > 0) {
      messageBadge.textContent = count > 99 ? "99+" : count;
      messageBadge.classList.add("visible");
    } else {
      messageBadge.textContent = "";
      messageBadge.classList.remove("visible");
    }
  } catch (err) {
    messageBadge.classList.remove("visible");
    console.error(err);
  }
}

document.getElementById("chatNavItem").addEventListener("click", e => {
  e.preventDefault(); window.location.href = "/message.html";
});

loadUnreadMessages();
setInterval(loadUnreadMessages, 30_000);

// ══════════════════════════════════════
//  REDIRECT AFTER AUTH
// ══════════════════════════════════════
if (isLoggedIn) {
  const saved = localStorage.getItem("redirectAfterAuth");
  if (saved && saved.includes("vybze-player")) localStorage.removeItem("redirectAfterAuth");
}
