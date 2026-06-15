// ══════════════════════════════════════════════
//  DARK MODE
// ══════════════════════════════════════════════
if (localStorage.getItem("afri_theme") === "dark") document.body.classList.add("dark");


// ================== SETUP ==================
const baseUrl       = "https://afrisocial-backend.onrender.com";
const token         = localStorage.getItem("token");
const currentUserId = localStorage.getItem("userId");
const isLoggedIn    = !!token;
const viewedPosts = new Set();

const params = new URLSearchParams(window.location.search);
const postId = params.get("postId");

// ================== HELPERS ==================
function getFlagEmoji(code) {
  if (!code) return "";
  return code.toUpperCase()
    .replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt()));
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return `${diff}s`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}


function getMediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${baseUrl}${path}`;
}

function verifiedBadge() {
  return `<svg class="verified-icon" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#1DA1F2"/>
    <path d="M9 12l2 2 4-4" stroke="white"
      stroke-width="2" fill="none"/>
  </svg>`;
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}

// ================== BACK BUTTON ==================
navBack.onclick = () => {
  if (document.referrer) {
    window.history.back();
  } else {
    location.href = "feed.html"; // fallback
  }
};

// ================== SAVE REDIRECT FOR GUESTS ==================
function saveRedirect() {
  localStorage.setItem("redirectAfterAuth", window.location.href);
}

document.getElementById("guestSignup").addEventListener("click", e => {
  e.preventDefault();
  saveRedirect();
  window.location.href = "/signup.html";
});

document.getElementById("guestLogin").addEventListener("click", e => {
  e.preventDefault();
  saveRedirect();
  window.location.href = "/login.html";
});

document.getElementById("commentSignupLink")
  .addEventListener("click", e => {
    e.preventDefault();
    saveRedirect();
    window.location.href = "/signup.html";
  });

document.getElementById("commentLoginLink")
  .addEventListener("click", e => {
    e.preventDefault();
    saveRedirect();
    window.location.href = "/login.html";
  });

// ================== LOAD POST ==================
async function loadPost() {
  if (!postId) {
    showError();
    return;
  }

  try {
    const headers = isLoggedIn
      ? { Authorization: `Bearer ${token}` }
      : {};

    const res  = await fetch(
      `${baseUrl}/api/posts/${postId}`,
      { headers }
    );

    if (!res.ok) throw new Error("Post not found");

    const data = await res.json();
    const post = data.post || data;

    renderPost(post);

  } catch (err) {
    console.error("Load post error:", err);
    showError();
  }
}

// ================== RENDER POST ==================
function renderPost(post) {
  document.getElementById("vpLoader").style.display  = "none";
  document.getElementById("vpPost").style.display    = "block";
  document.getElementById("vpError").style.display   = "none";

  const user = post.user || {};
  document.title = `${user.fullName || "Afrisocial"} on Afrisocial`;

  const isLiked   = (post.likes || []).includes(currentUserId);
  const isStarred = (post.stars || []).includes(currentUserId);
  const location  = [user.city, user.country]
    .filter(Boolean).join(", ");
  const activeSponsored =
  post.isSponsored &&
  (
    !post.expiresAt ||
    new Date(post.expiresAt) > new Date()
  );

  let mediaHtml = "";
  if (post.images && post.images.length > 0) {
    mediaHtml += `
      <div class="image-slider-wrapper">
        <div class="image-slider">
          ${post.images.map(img =>
            `<img src="${getMediaUrl(img)}"
              class="post-media slide" />`
          ).join("")}
        </div>
      </div>`;
  }
  if (post.video) {
    mediaHtml += `
      <div class="video-wrapper">
        <video class="post-media video"
          src="${getMediaUrl(post.video)}"
          muted playsinline></video>
        <span class="play-btn"><div class="video-play-overlay">
        <svg
          width="42"
          height="42"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div></span>
        <button class="mute-btn">🔇</button>
      </div>`;
  }

  const guestClass = isLoggedIn ? "" : "guest-action";

  document.getElementById("postCard").innerHTML = `
    <div class="post-header">
      <a href="/profile.html?userId=${user._id}">
        <img src="${user.profilePicture ||
          '/uploads/images/africa.png'}" />
      </a>
      <div class="post-header-info">
        <a href="/profile.html?userId=${user._id}"
          style="text-decoration:none;color:inherit;">
          <strong>
            ${user.fullName || "Unknown"}
            ${user.isVerified ? verifiedBadge() : ""}
            ${getFlagEmoji(user.country)}
          </strong>
        </a>
        <span class="post-location">
        ${activeSponsored ? `
       <span class="header-sponsored-label">
         Sponsored
        </span>
        ` : ""}
          ${location
            ? `<svg width="11" height="11"
                viewBox="0 0 24 24" fill="none"
                stroke="#9CA3AF" stroke-width="2">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25
                  7 13 7 13s7-7.75 7-13
                  c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg> ${location}`
            : `<small style="color:#9CA3AF;">
                ${timeAgo(post.createdAt)} ago
              </small>`
          }
        </span>
      </div>
      <button class="post-three-dot">
        <svg width="20" height="20" viewBox="0 0 24 24"
          fill="#9CA3AF">
          <circle cx="12" cy="5" r="1.5"/>
          <circle cx="12" cy="12" r="1.5"/>
          <circle cx="12" cy="19" r="1.5"/>
        </svg>
      </button>
    </div>

    <p class="text-body">${renderPostText(post.text, post.mentions || [])}</p>

    ${mediaHtml ? `
  <div class="post-media-container">
    ${mediaHtml}
  </div>
` : ""}

${activeSponsored ? `
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
      <button class="action-btn love-btn ${guestClass}
        ${isLiked ? "liked" : ""}">
        <svg viewBox="0 0 24 24">
          <path d="M12 21s-7-4.35-9.5-8.5C.4 8.4 2.5 5 6
            5c2 0 3.4 1.1 4 2.1C10.6 6.1 12 5 14 5c3.5 0
            5.6 3.4 3.5 7.5C19 16.65 12 21 12 21z"/>
        </svg>
        <span class="count">${(post.likes || []).length}</span>
      </button>

      <button class="action-btn comment-btn ${guestClass}">
        <svg viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1
            2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="count">${post.commentCount || 0}</span>
      </button>

      <button class="action-btn share-btn">
        <svg viewBox="0 0 24 24">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>

      ${post.video
        ? `<span class="view-count">👁 ${post.views || 0}</span>`
        : ""}

      <button class="action-btn star-btn ${guestClass}
        ${isStarred ? "starred" : ""}">
        <svg viewBox="0 0 24 24">
          <path d="M12 2l3.1 6.3 7 1-5 4.9 1.2 7
            -6.3-3.4-6.3 3.4 1.2-7-5-4.9 7-1z"/>
        </svg>
      </button>

      ${isLoggedIn ? `
        <button class="action-btn report-post-btn"
          title="Report this post"
          data-report-id="${post._id}">
          <svg viewBox="0 0 24 24" width="18" height="18"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4
              1-5-2-8-2-4 1-4 1z"/>
            <line x1="4" y1="22" x2="4" y2="15"/>
          </svg>
        </button>
      ` : ""}
    </div>
  `;

  // ===============================
// TRACK SPONSORED IMPRESSION
// ===============================
if (activeSponsored) {

  const postCard = document.getElementById("postCard");

  const observer = new IntersectionObserver((entries) => {

    entries.forEach(async (entry) => {

      if (entry.isIntersecting) {

        try {

          await fetch(
            `${baseUrl}/api/posts/${post._id}/impression`,
            {
              method: "POST",
              headers: token
                ? { Authorization: `Bearer ${token}` }
                : {}
            }
          );

        } catch (err) {
          console.error("Impression tracking failed");
        }

        // count once only
        observer.unobserve(postCard);
      }

    });

  }, {
    threshold: 0.5
  });

  observer.observe(postCard);
}

  if (!isLoggedIn) {
    document.getElementById("guestBanner").style.display = "block";
  }

  initImageSliders();
  initVideoControls();
  bindPostActions(post);
}

// ===============================
// SPONSORED CTA CLICK
// ===============================
document.addEventListener("click", async (e) => {

  const btn = e.target.closest(".sponsored-cta-btn");

  if (!btn) return;

  const postId = btn.dataset.postId;
  const url = btn.dataset.url;

  try {

    // TRACK CLICK
    await fetch(
      `${baseUrl}/api/posts/${postId}/click`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

  } catch (err) {
    console.error("Click tracking failed");
  }

  // REDIRECT
  window.open(url, "_blank");
});

// ================== BIND POST ACTIONS ==================
function bindPostActions(post) {

  const card = document.getElementById("postCard");

  // ── Share ──
  card.querySelector(".share-btn")
    .addEventListener("click", async () => {
      const shareUrl =
        `${window.location.origin}/p/${post._id}`;
      const shareData = {
        title: "Check this out on Afrisocial",
        text:  post.text
          ? post.text.slice(0, 100)
          : "See this post on Afrisocial",
        url: shareUrl
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(shareUrl);
          showToast("Link copied to clipboard!");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          await navigator.clipboard.writeText(shareUrl)
            .catch(() => {});
          showToast("Link copied!");
        }
      }
    });

  // ── Guest intercept ──
  if (!isLoggedIn) {
    card.querySelectorAll(".guest-action").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        saveRedirect();
        showToast("Sign up or log in to interact 👇");
        document.getElementById("guestBanner")
          .scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });
    return;
  }

  // ── Like ──
  card.querySelector(".love-btn")
    .addEventListener("click", async function () {
      try {
        const res  = await fetch(
          `${baseUrl}/api/posts/${post._id}/like`,
          { method: "POST",
            headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        this.querySelector(".count").textContent =
          data.likes.length;
        this.classList.toggle("liked", data.liked);
        this.classList.add("pop");
        setTimeout(() => this.classList.remove("pop"), 300);
      } catch (err) { console.error(err); }
    });

  // ── Star ──
  card.querySelector(".star-btn")
    .addEventListener("click", async function () {
      try {
        const res  = await fetch(
          `${baseUrl}/api/posts/${post._id}/star`,
          { method: "POST",
            headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        this.classList.toggle("starred", data.starred);
        this.classList.add("pop");
        setTimeout(() => this.classList.remove("pop"), 300);
      } catch (err) { console.error(err); }
    });

  // ── Comment ──
  card.querySelector(".comment-btn")
    .addEventListener("click", () => {
      openCommentModal();
    });

  // ── Report ──
  const reportBtn = card.querySelector(".report-post-btn");
  if (reportBtn) {
    reportBtn.addEventListener("click", () => {
      showReportModal(post._id);
    });
  }
}

// ================== ERROR STATE ==================
function showError() {
  document.getElementById("vpLoader").style.display  = "none";
  document.getElementById("vpPost").style.display    = "none";
  document.getElementById("vpError").style.display   = "flex";
}

// ================== IMAGE SLIDER ==================
function initImageSliders() {
  document.querySelectorAll(".image-slider-wrapper").forEach(w => {
    if (w.dataset.init) return;
    w.dataset.init   = "1";
    const slider     = w.querySelector(".image-slider");
    const slides     = slider.querySelectorAll(".slide");
    let current      = 0;
    slides.forEach((s, i) =>
      s.style.display = i === 0 ? "block" : "none"
    );
    let counter = null;
    if (slides.length > 1) {
      counter             = document.createElement("div");
      counter.className   = "image-counter";
      counter.textContent = `1 / ${slides.length}`;
      w.appendChild(counter);
    }
    let startX = 0, endX = 0;
    w.addEventListener("touchstart",
      e => startX = e.touches[0].clientX);
    w.addEventListener("touchmove",
      e => endX = e.touches[0].clientX);
    w.addEventListener("touchend", () => {
      if (slides.length < 2) return;
      if (startX - endX > 50)  changeSlide(1);
      if (endX - startX > 50) changeSlide(-1);
    });
    slider.addEventListener("click", () => {
      if (slides.length > 1) changeSlide(1);
    });
    function changeSlide(dir) {
      slides[current].style.display = "none";
      current =
        (current + dir + slides.length) % slides.length;
      slides[current].style.display = "block";
      if (counter)
        counter.textContent =
          `${current + 1} / ${slides.length}`;
    }
  });
}

//============= video views tracking =================
async function sendPostView(postId) {

  try {

    const res = await fetch(
      `${baseUrl}/api/posts/${postId}/view`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    return data.views;

  } catch (err) {

    console.error("View tracking failed:", err);

    return null;

  }

}

// ================== VIDEO CONTROLS ==================
function initVideoControls() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {

  video.play().catch(() => {});

  if (
    isLoggedIn &&
    postId &&
    !viewedPosts.has(postId)
  ) {

    viewedPosts.add(postId);

    setTimeout(async () => {

      const views = await sendPostView(postId);

      if (views !== null) {

        const viewCount =
          document.querySelector(".view-count");

        if (viewCount) {
          viewCount.textContent = `👁 ${views}`;
        }

      }

    }, 2000);

  }

} else {

  video.pause();
  video.currentTime = 0;

}
    });
  }, { threshold: 0.25 });

  document.querySelectorAll(".video-wrapper").forEach(wrapper => {
    if (wrapper.dataset.init) return;
    wrapper.dataset.init = "1";
    const video   = wrapper.querySelector("video");
    const muteBtn = wrapper.querySelector(".mute-btn");
    video.removeAttribute("autoplay");
    video.muted = true;

    video.addEventListener("click", () => {
      video.paused ? video.play() : video.pause();
    });
    muteBtn.addEventListener("click", e => {
      e.stopPropagation();
      video.muted         = !video.muted;
      muteBtn.textContent = video.muted ? "🔇" : "🔊";
    });
    observer.observe(video);

    // ── GUEST VIDEO GATE — 5 second preview then block ──
    if (!isLoggedIn) {
      video.addEventListener("play", () => {
        if (wrapper.dataset.gated) return;
        wrapper.dataset.gated = "1";

        setTimeout(() => {
          video.pause();
          video.currentTime = 5;

          const overlay = document.createElement("div");
          overlay.style.cssText = `
            position:absolute;
            inset:0;
            background:rgba(0,0,0,0.6);
            backdrop-filter:blur(8px);
            -webkit-backdrop-filter:blur(8px);
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            gap:14px;
            z-index:10;
            border-radius:inherit;
          `;

          overlay.innerHTML = `
            <p style="
              color:white;
              font-size:16px;
              font-weight:600;
              text-align:center;
              padding:0 20px;
              margin:0;
            ">
              Sign up to keep watching 🎬
            </p>
            <a href="signup.html"
              onclick="localStorage.setItem('redirectAfterAuth',
                window.location.href)"
              style="
                background:#000A23;
                color:white;
                padding:12px 28px;
                border-radius:100px;
                font-size:15px;
                font-weight:600;
                text-decoration:none;
              ">
              Sign Up Free
            </a>
            <a href="login.html"
              onclick="localStorage.setItem('redirectAfterAuth',
                window.location.href)"
              style="
                background:white;
                color:#000A23;
                padding:12px 28px;
                border-radius:100px;
                font-size:15px;
                font-weight:600;
                text-decoration:none;
              ">
              Log In
            </a>
          `;

          wrapper.style.position = "relative";
          wrapper.appendChild(overlay);

        }, 5000);
      }, { once: false });
    }
  });
}

// ================== COMMENT MODAL ==================
const commentModal      = document.getElementById("commentModal");
const commentList       = document.getElementById("commentList");
const commentInput      = document.getElementById("commentInput");
const sendCommentBtn    = document.getElementById("sendCommentBtn");
const closeCommentModal = document.getElementById("closeCommentModal");
const commentInputRow   = document.getElementById("commentInputRow");
const commentGuestRow   = document.getElementById("commentGuestRow");

function openCommentModal() {
  commentModal.style.display = "flex";
  commentList.innerHTML      = "";

  if (isLoggedIn) {
    commentInputRow.style.display  = "flex";
    commentGuestRow.style.display  = "none";
  } else {
    commentInputRow.style.display  = "none";
    commentGuestRow.style.display  = "block";
  }

  loadComments();
}

closeCommentModal.onclick = () => {
  commentModal.style.display = "none";
};

function renderComment(comment) {
  const div      = document.createElement("div");
  div.className  = "comment";
  div.dataset.id = comment._id;
  div.innerHTML  = `
    <div class="comment-user">
      <a href="/profile.html?userId=${comment.user._id}">
        <img src="${comment.user.profilePicture ||
          '/uploads/images/africa.png'}" />
      </a>
      <strong>
        ${comment.user.fullName}
        ${comment.user.isVerified ? verifiedBadge() : ""}
      </strong>
    </div>
    <p class="comment-text">${renderPostText(comment.text, comment.mentions || [])}</p>
    <div class="comment-actions">
      <span class="comment-like
        ${isLoggedIn && comment.likes.includes(currentUserId)
          ? "liked" : ""}">
        ❤️
        <span class="like-count">${comment.likes.length}</span>
      </span>
      ${isLoggedIn
        ? `<span class="reply-btn">Reply</span>`
        : ""}
      <small>${timeAgo(comment.createdAt)} ago</small>
    </div>
    <div class="replies"></div>
  `;
  commentList.appendChild(div);
}

async function loadComments() {
  try {
    const headers = isLoggedIn
      ? { Authorization: `Bearer ${token}` }
      : {};
    const res      = await fetch(
      `${baseUrl}/api/comments/${postId}`,
      { headers }
    );
    const comments = await res.json();
    commentList.innerHTML = "";
    comments
      .filter(c => !c.parentComment)
      .forEach(c => renderComment(c));
    comments
      .filter(c => c.parentComment)
      .forEach(reply => {
        const parentEl = commentList.querySelector(
          `[data-id="${reply.parentComment}"]`
        );
        if (!parentEl) return;
        const rd      = document.createElement("div");
        rd.className  = "reply";
        rd.dataset.id = reply._id;
        rd.innerHTML  = `
          <div class="reply-user">
            <img src="${reply.user.profilePicture ||
              '/uploads/images/africa.png'}" />
            <strong>${reply.user.fullName}</strong>
          </div>
          <div class="reply-area">
            <p class="reply-text">
              ${renderPostText(reply.text, reply.mentions || [])}
            </p>
            <small>${timeAgo(reply.createdAt)} ago</small>
          </div>
        `;
        parentEl.querySelector(".replies").appendChild(rd);
      });
  } catch (err) { console.error("Load comments error:", err); }
}

// ================== SUBMIT COMMENT ==================
if (isLoggedIn) {
  sendCommentBtn.onclick = async () => {
    const text = commentInput.value.trim();
    if (!text) return;

    // ── MODERATION CHECK ──
    const modResult = scanContent(text);
    if (!modResult.clean) {
      if (modResult.severity === 'severe') {
        showModerationWarning(modResult.reasons);
        fetch(`${baseUrl}/api/moderation/flag`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            content:     text,
            contentType: 'comment',
            reasons:     modResult.reasons,
            severity:    modResult.severity,
            action:      'blocked_at_submission'
          })
        }).catch(() => {});
        return;
      }
      if (modResult.severity === 'mild') {
        fetch(`${baseUrl}/api/moderation/flag`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            content:     text,
            contentType: 'comment',
            reasons:     modResult.reasons,
            severity:    modResult.severity,
            action:      'flagged_for_review'
          })
        }).catch(() => {});
        showMildWarning();
      }
    }

    try {
      const res     = await fetch(
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
      const comment = await res.json();
      renderComment(comment);
      commentInput.value = "";
      const countEl = document.querySelector(
        ".comment-btn .count"
      );
      if (countEl) countEl.textContent =
        parseInt(countEl.textContent) + 1;
    } catch (err) { console.error(err); }
  };
}

// Comment interactions
document.addEventListener("click", async e => {
  if (!isLoggedIn) return;

  if (e.target.closest(".comment-like")) {
    const likeBtn   = e.target.closest(".comment-like");
    const commentEl = likeBtn.closest(".comment");
    try {
      const res  = await fetch(
        `${baseUrl}/api/comments/like/${commentEl.dataset.id}`,
        { method: "POST",
          headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      likeBtn.querySelector(".like-count").textContent =
        data.likes.length;
      likeBtn.classList.toggle("liked", data.liked);
    } catch (err) { console.error(err); }
  }

  if (e.target.closest(".reply-btn")) {
    const commentEl = e.target.closest(".comment");
    if (commentEl.querySelector(".reply-input")) return;
    const box     = document.createElement("div");
    box.className = "reply-input";
    box.innerHTML = `
      <input placeholder="Write a reply..." />
      <button class="send-reply">Reply</button>
    `;
    commentEl.appendChild(box);
  }

  if (e.target.classList.contains("send-reply")) {
    const replyBox  = e.target.closest(".reply-input");
    const text      = replyBox.querySelector("input").value.trim();
    if (!text) return;
    const commentEl = replyBox.closest(".comment");
    try {
      const res   = await fetch(
        `${baseUrl}/api/comments/reply/${commentEl.dataset.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ text })
        }
      );
      const reply    = await res.json();
      const rd       = document.createElement("div");
      rd.className   = "reply";
      rd.dataset.id  = reply._id;
      rd.innerHTML   = `
        <div class="reply-user">
          <img src="${reply.user.profilePicture ||
            '/uploads/images/africa.png'}" />
          <strong>${reply.user.fullName}</strong>
        </div>
        <p class="reply-text">${reply.text}</p>
      `;
      commentEl.querySelector(".replies").appendChild(rd);
      replyBox.remove();
    } catch (err) { console.error(err); }
  }
});

// ================== NOTIFICATION BADGE ==================
const notificationBtn   = document.getElementById("notificationBtn");
const notificationBadge = document.getElementById("notificationBadge");

if (isLoggedIn) {
  fetch(`${baseUrl}/api/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(r => r.json())
  .then(data => {
    if (data.count > 0) notificationBadge.classList.add("show");
  })
  .catch(() => {});
}

notificationBtn.addEventListener("click", () => {
  if (isLoggedIn) {
    window.location.href = "/notification.html";
  } else {
    saveRedirect();
    window.location.href = "/login.html";
  }
});

// ================== REDIRECT AFTER AUTH ==================
if (isLoggedIn) {
  const savedRedirect = localStorage.getItem("redirectAfterAuth");
  if (savedRedirect && savedRedirect.includes("view-post.html")) {
    localStorage.removeItem("redirectAfterAuth");
  }
}

// ================== INIT ==================
loadPost();


// ══════════════════════════════════════════════
//  CONTENT MODERATION
// ══════════════════════════════════════════════

const BAD_WORDS = new Set([
  'fuck','shit','bitch','asshole','bastard',
  'cunt','dick','pussy','cock','whore',
  'nigger','nigga','faggot','retard','slut',
  'kike','spic','chink','wetback','raghead',
  'mumu','oloshi','olosho','ashawo','werey',
  'ode','omoale','omo ale','ole',
]);

const MALICIOUS_PATTERNS = [
  /bit\.ly\/[a-zA-Z0-9]{6,}/i,
  /free.*money/i,
  /click.*here.*win/i,
  /you.*won.*prize/i,
  /verify.*account.*now/i,
  /double.*bitcoin/i,
  /free.*crypto/i,
  /invest.*guaranteed/i,
  /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i,
];

const SAFE_DOMAINS = new Set([
  'google.com','youtube.com','twitter.com','facebook.com',
  'instagram.com','whatsapp.com','wikipedia.org','github.com',
  'linkedin.com','afrisocial.com.ng'
]);

function scanContent(text) {
  if (!text || typeof text !== 'string') return { clean: true };

  const lower      = text.toLowerCase();
  const foundWords = [];
  const hateSlurs  = [
    'nigger','faggot','kike','spic','chink','wetback','raghead'
  ];

  BAD_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(lower)) foundWords.push(word);
  });

  const urls = text.match(/https?:\/\/[^\s]+/gi) || [];
  const flaggedLinks = [];
  urls.forEach(url => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      if (SAFE_DOMAINS.has(domain)) return;
      if (MALICIOUS_PATTERNS.some(p => p.test(url))) {
        flaggedLinks.push(url);
      }
    } catch { flaggedLinks.push(url); }
  });

  const spamPatterns = [
    /(.)\1{6,}/,
    /[A-Z]{10,}/,
    /(\b\w+\b)(\s+\1){3,}/i,
    /follow\s+me/i,
    /make\s+money\s+fast/i,
  ];
  const isSpam = spamPatterns.some(p => p.test(text));

  const reasons = [];
  let severity   = null;

  if (foundWords.length > 0) {
    const isHate = foundWords.some(w => hateSlurs.includes(w));
    reasons.push(isHate ? 'hate_speech' : 'profanity');
    severity = isHate ? 'severe' : 'mild';
  }
  if (flaggedLinks.length > 0) {
    reasons.push('malicious_link');
    severity = 'severe';
  }
  if (isSpam) {
    reasons.push('spam_pattern');
    if (!severity) severity = 'mild';
  }

  if (reasons.length === 0) return { clean: true };
  return { clean: false, severity, reasons };
}

function showModerationWarning(reasons) {
  const messages = {
    hate_speech:    'Your comment contains hate speech.',
    malicious_link: 'Your comment contains a suspicious link.',
    profanity:      'Your comment contains inappropriate language.',
    spam_pattern:   'Your comment looks like spam.',
  };
  const msg = reasons
    .map(r => messages[r] || 'Content policy violation.')
    .join(' ');
  const div = document.createElement('div');
  div.style.cssText = `
    position:fixed;top:20px;left:50%;transform:translateX(-50%);
    background:#FEF2F2;border:1.5px solid #FECACA;color:#B91C1C;
    padding:14px 24px;border-radius:12px;font-size:14px;
    font-weight:500;z-index:9999;max-width:90%;text-align:center;
  `;
  div.textContent = `⚠️ ${msg}`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 5000);
}

function showMildWarning() {
  const div = document.createElement('div');
  div.style.cssText = `
    position:fixed;top:20px;left:50%;transform:translateX(-50%);
    background:#FFFBEB;border:1.5px solid #FCD34D;color:#92400E;
    padding:14px 24px;border-radius:12px;font-size:14px;
    font-weight:500;z-index:9999;max-width:90%;text-align:center;
  `;
  div.textContent =
    '⚠️ Your comment has been flagged for review by our team.';
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

function showReportModal(postId) {
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
      Report Content
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
        await fetch(`${baseUrl}/api/moderation/report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            contentId:   postId,
            contentType: 'post',
            reason
          })
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


// ══════════════════════════════════════
//  HELPER FOR MENTION 
// ══════════════════════════════════════  
function renderPostText(text, mentions) {
  if (!text) return "";

  // Ensure escapeHTML is defined elsewhere in your code
  const safeText = typeof escapeHTML === "function" ? escapeHTML(text) : text;

  // Hashtags first - Using backticks for the return string
  let output = safeText.replace(/#(\w+)/g, (match, tag) => {
    return `<a href="/hashtag.html?tag=${tag}" class="hashtag-link">#${tag}</a>`;
  });

  // Build mention map
  const mentionMap = {};
  (mentions || []).forEach(m => {
    mentionMap[m.username.toLowerCase()] = m;
  });

  // Mentions second - Using backticks for the return string
  output = output.replace(/@([a-zA-Z0-9_.-]+)/g, (match, username) => {
    const user = mentionMap[username.toLowerCase()];
    if (!user) return match;

    return `<a href="/profile.html?userId=${user._id}" class="mention">${match}</a>`;
  });

  return output;
        }
