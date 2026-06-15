// ══════════════════════════════════════════════
//  DARK MODE
// ══════════════════════════════════════════════
if (localStorage.getItem("afri_theme") === "dark") document.body.classList.add("dark");

// ══════════════════════════════════════════════
//  AUTH CHECK
// ══════════════════════════════════════════════
const token = localStorage.getItem("token");
if (!token) window.location.href = "/login.html";

const API_BASE = "https://afrisocial-backend.onrender.com";
const grid = document.getElementById("vybzeGrid");

// ══════════════════════════════════════════════
//  SANITIZER
// ══════════════════════════════════════════════
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// Open search
document.getElementById("openSearch").onclick = () => {
  location.href = "search.html";
};

// ══════════════════════════════════════════════
//  SKELETON LOADER
// ══════════════════════════════════════════════
function showSkeletons(count = 6) {
  grid.innerHTML = "";
  for (let i = 0; i < count; i++) {
    grid.innerHTML += `
      <div class="skeleton-card">
        <div class="skeleton-caption">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-name"></div>
        </div>
      </div>
    `;
  }
}

// ══════════════════════════════════════════════
//  LOAD VYBZE FEED
// ══════════════════════════════════════════════
async function loadVybze() {
  showSkeletons(6);

  try {
    const res  = await fetch(`${API_BASE}/api/vybze/feed`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const videos = data.videos || [];

    grid.innerHTML = "";

    if (videos.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;
          padding:48px 16px;color:#9CA3AF;font-size:14px;">
          No vybze yet. Check back later!
        </div>
      `;
      return;
    }

    videos.forEach(video => {
      const card = document.createElement("div");
      card.className = "vybze-card";
      card.style.position = "relative";

      card.innerHTML = `
        <video
          class="vybze-video"
          src="${video.video}"
          muted
          playsinline
          loop
          preload="metadata"
        ></video>
        <div class="vybze-caption">
          <img src="${video.user.profilePicture || '/uploads/images/africa.png'}" />
          <span>${sanitize(video.user.username)}</span>
        </div>
        <button class="vybze-report-btn"
          title="Report this video"
          data-video-id="${video._id}"
          style="
            position:absolute;top:10px;right:10px;
            background:rgba(0,0,0,0.5);
            border:none;border-radius:8px;
            padding:6px 8px;cursor:pointer;
            display:flex;align-items:center;
            justify-content:center;z-index:10;
          ">
          <svg viewBox="0 0 24 24" width="16" height="16"
            fill="none" stroke="white" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4
              1-5-2-8-2-4 1-4 1z"/>
            <line x1="4" y1="22" x2="4" y2="15"/>
          </svg>
        </button>
      `;

      card.addEventListener("click", (e) => {
        if (e.target.closest(".vybze-report-btn")) return;
        window.location.href = `vybze-player.html?videoId=${video._id}`;
      });

      card.querySelector(".vybze-report-btn")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          showReportModal(video._id, 'video');
        });

      grid.appendChild(card);
    });

    // Auto play on scroll
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const vid = entry.target;
          if (entry.isIntersecting) {
            vid.play().catch(() => {});
          } else {
            vid.pause();
          }
        });
      },
      { threshold: 0.7 }
    );

    document.querySelectorAll(".vybze-video").forEach(vid => observer.observe(vid));

  } catch (err) {
    console.error("Failed to load vybze:", err);
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;
        padding:48px 16px;color:#9CA3AF;font-size:14px;">
        Couldn't load vybze. Try again later.
      </div>
    `;
  }
}

loadVybze();

// ══════════════════════════════════════════════
//  NOTIFICATION BADGE
// ══════════════════════════════════════════════
const notificationBtn   = document.getElementById("notificationBtn");
const notificationBadge = document.getElementById("notificationBadge");

async function loadNotificationBadge() {
  if (!token) return;
  try {
    const res  = await fetch(
      `${API_BASE}/api/notifications/unread-count`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (data.count > 0) {
      notificationBadge.classList.add("show");
    } else {
      notificationBadge.classList.remove("show");
    }
  } catch (err) { console.error(err); }
}

notificationBtn.addEventListener("click", () => {
  window.location.href = "/notification.html";
});

loadNotificationBadge();

// ══════════════════════════════════════════════
//  MESSAGE BADGE — dynamic, never stagnant
// ══════════════════════════════════════════════
const messageBadge = document.getElementById("messageBadge");

async function loadUnreadMessages() {
  if (!token) return;
  try {
    const res  = await fetch(
      `${API_BASE}/api/messages/unread-count`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
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
    // Hide on error — never show stale data
    messageBadge.classList.remove("visible");
    console.error(err);
  }
}

document.getElementById("chatNavItem")
  .addEventListener("click", e => {
    e.preventDefault();
    window.location.href = "/message.html";
  });

loadUnreadMessages();

// Refresh every 30 seconds while page is open
setInterval(loadUnreadMessages, 30_000);

// ══════════════════════════════════════════════
//  REPORT MODAL
// ══════════════════════════════════════════════
function showReportModal(contentId, contentType) {
  const reasons = [
    { value: 'spam',           label: '🚫 Spam' },
    { value: 'hate_speech',    label: '😡 Hate Speech' },
    { value: 'explicit',       label: '🔞 Explicit Content' },
    { value: 'malicious_link', label: '🔗 Malicious Link' },
    { value: 'other',          label: '⚠️ Other' },
  ];

  const modal = document.createElement('div');
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.5);
    display:flex;align-items:flex-end;justify-content:center;
    z-index:9999;padding:20px;
  `;

  const sheet = document.createElement('div');
  sheet.style.cssText = `
    background:white;border-radius:20px;padding:24px;
    width:100%;max-width:500px;
  `;

  sheet.innerHTML = `
    <h3 style="font-size:18px;font-weight:700;
      margin-bottom:16px;color:#111827;">
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
        font-weight:500;color:#111827;margin-bottom:8px;
        cursor:pointer;">
        ${r.label}
      </button>
    `).join('')}
    <button id="cancelReportBtn"
      style="display:block;width:100%;padding:14px;border:none;
      background:#F3F4F6;border-radius:12px;font-size:15px;
      font-weight:600;color:#6B7280;margin-top:4px;cursor:pointer;">
      Cancel
    </button>
  `;

  modal.appendChild(sheet);
  document.body.appendChild(modal);

  sheet.querySelectorAll('[data-reason]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const reason = btn.dataset.reason;
      try {
        await fetch(`${API_BASE}/api/moderation/report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ contentId, contentType, reason })
        });
      } catch (err) { console.error('Report error:', err); }

      document.body.removeChild(modal);

      const toast = document.createElement('div');
      toast.style.cssText = `
        position:fixed;bottom:80px;left:50%;
        transform:translateX(-50%);background:#000A23;
        color:white;padding:12px 24px;border-radius:100px;
        font-size:14px;font-weight:500;z-index:9999;
      `;
      toast.textContent = '✅ Reported. Thank you!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    });
  });

  sheet.querySelector('#cancelReportBtn')
    .addEventListener('click', () => {
      document.body.removeChild(modal);
    });
}
