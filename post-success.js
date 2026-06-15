const baseUrl = "https://afrisocial-backend-dev-production.up.railway.app";
const token = localStorage.getItem("token");

const params = new URLSearchParams(window.location.search);
const postId = params.get("postId");

const feedBox = document.getElementById("feed");

// ===== HELPER =====
function getMediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${baseUrl}${path}`;
}

function getFlagEmoji(countryCode) {
  if (!countryCode) return "";
  return countryCode
    .toUpperCase()
    .replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt()));
}


function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ===== LOAD SINGLE POST =====
async function loadSinglePost() {
  try {
    const res = await fetch(`${baseUrl}/api/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Failed");

    const post = await res.json();

    // clear container
    feedBox.innerHTML = "";

    renderPosts([post]);

  } catch (err) {
    console.error(err);
    feedBox.innerHTML = "<p>Failed to load post</p>";
  }
}

// ===== REUSE YOUR FEED UI =====
function renderPosts(posts) {

  posts.forEach(post => {

    const user = post.user || {};
    const div = document.createElement("div");
    div.className = "post";
    div.dataset.postId = post._id;

    let mediaHtml = "";

    // IMAGES
    if (post.images && post.images.length > 0) {
      mediaHtml += `<div class="image-slider-wrapper"><div class="image-slider">`;
      post.images.forEach(img => {
        mediaHtml += `<img src="${getMediaUrl(img)}" class="post-media slide">`;
      });
      mediaHtml += `</div></div>`;
    }

    // VIDEO
    if (post.video) {
      mediaHtml += `
        <div class="video-wrapper">
          <video class="post-media video"
            src="${getMediaUrl(post.video)}"
            muted autoplay loop playsinline>
          </video>
          <button class="mute-btn">🔇</button>
        </div>`;
    }

    div.innerHTML = `
      <div class="post-header">
        <img class="profile-pic"
          src="${user.profilePicture || '/uploads/images/africa.png'}">

        <div>
          <strong class="full-name">
            ${user.fullName || "Unknown"}
            ${user.isVerified ? `
              <svg class="verified-icon" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#1DA1F2"/>
                <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/>
              </svg>
            ` : ""}
            ${getFlagEmoji(user.country)}
          </strong>
          <br>
          <span>@${user.username || ""}</span>
          <small>${timeAgo(post.createdAt)}</small>
        </div>
      </div>

      <p class="text-body">${renderPostText(post.text, post.mentions || [])}</p>

      <div class="post-media-container">${mediaHtml}</div>

      <div class="post-actions">
        ❤️ ${(post.likes || []).length}
        ⭐ ${(post.stars || []).length}
        💬 ${post.commentCount || 0}
      </div>
    `;

    feedBox.appendChild(div);
  });

  initImageSliders();
  initVideoControls();
}

// ======= IMAGE SLIDER =======
function initImageSliders() {
  document.querySelectorAll(".image-slider-wrapper").forEach(wrapper => {
    const slider = wrapper.querySelector(".image-slider");
    const slides = slider.querySelectorAll(".slide");
    let current = 0;

    // Show first slide
    slides.forEach((s, i) => s.style.display = i === 0 ? "block" : "none");

    // Create counter if more than 1 image
    let counter = null;
    if (slides.length > 1) {
      counter = document.createElement("div");
      counter.className = "image-counter";
      counter.textContent = `${current + 1} / ${slides.length}`;
      wrapper.appendChild(counter);
    }

    // Swipe / click functionality
    let startX = 0;
    let endX = 0;

    wrapper.addEventListener("touchstart", e => startX = e.touches[0].clientX);
    wrapper.addEventListener("touchmove", e => endX = e.touches[0].clientX);
    wrapper.addEventListener("touchend", () => {
      if (slides.length < 2) return;
      if (startX - endX > 50) changeSlide(1);    // swipe left → next
      else if (endX - startX > 50) changeSlide(-1); // swipe right → prev
    });

    // Click to next slide (desktop fallback)
    slider.addEventListener("click", () => {
      if (slides.length > 1) changeSlide(1);
    });

    function changeSlide(dir) {
      slides[current].style.display = "none";
      current = (current + dir + slides.length) % slides.length;
      slides[current].style.display = "block";
      if (counter) counter.textContent = `${current + 1} / ${slides.length}`;
    }
  });
}

// ======= VIDEO CONTROLS + VIEWS =======
function initVideoControls() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target;
      const postId = video.closest(".post").dataset.postId;
      const viewCountEl = video.closest(".post").querySelector(".view-count");

      if (entry.isIntersecting) {
        video.play().catch(() => {});
        if (!viewedVideos.has(postId)) {
          video._viewTimer = setTimeout(async () => {
            viewedVideos.add(postId);
            const newViews = await sendVideoView(postId);
            if (viewCountEl) viewCountEl.textContent = `Views ${newViews}`;
          }, 2000); // 2s minimum watch
        }
      } else {
        video.pause();
        clearTimeout(video._viewTimer);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll(".video-wrapper").forEach(wrapper => {
    const video = wrapper.querySelector("video");
    const muteBtn = wrapper.querySelector(".mute-btn");
    video.addEventListener("click", () => {
      video.paused ? video.play() : video.pause();
    });
    muteBtn.addEventListener("click", () => {
      video.muted = !video.muted;
      muteBtn.textContent = video.muted ? "🔇" : "🔊";
    });
    observer.observe(video);
  });
}

// ======= SEND VIEW =======
async function sendVideoView(postId) {
  try {
    const res = await fetch(`${baseUrl}/api/posts/${postId}/view`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to send view");
    const data = await res.json();
    return data.views;
  } catch {
    return null;
  }
}

// ===== BACK BUTTON =====
function goBack() {
  window.location.href = "/feed.html";
}

// ===== START =====
loadSinglePost();


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
