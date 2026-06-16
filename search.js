// ══════════════════════════════════════════════
//  DARK MODE
// ══════════════════════════════════════════════
if (localStorage.getItem("afri_theme") === "dark") document.body.classList.add("dark");

const token =  localStorage.getItem("token");

const baseUrl = "https://afrisocial-backend.onrender.com"; // set your API base URL

const openBtn = document.getElementById("openSearch");
const overlay = document.getElementById("searchOverlay");
const closeBtn = document.getElementById("closeSearch");
const input = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

const recentSection = document.getElementById("recentSection");
const resultsSection = document.getElementById("resultsSection");
const emptySection = document.getElementById("emptySection");
const recentList = document.getElementById("recentList");
const clearRecentBtn = document.getElementById("clearRecent");
const resultsMeta = document.getElementById("resultsMeta");

let activeTab = "all";
let timeout;
let lastResults = [];

loadRecent();
// Close overlay
closeBtn.onclick = () => {
  if (document.referrer) {
    window.history.back();
  } else {
    location.href = "feed.html"; // fallback
  }
};

// Tab switching
tabs.forEach(tab => {
  tab.onclick = () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    panels.forEach(p => p.classList.remove("active"));
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add("active");
    activeTab = tab.dataset.tab;

    if (lastResults.length) render(lastResults);
  };
});

// Search input
input.oninput = () => {
  clearBtn.hidden = !input.value;
  clearTimeout(timeout);
  const q = input.value.trim();
  if (!q) return showRecent();
  timeout = setTimeout(() => search(q), 400);
};

clearBtn.onclick = () => {
  input.value = "";
  clearBtn.hidden = true;
  showRecent();
};

// Recent searches
function getRecent() { return JSON.parse(localStorage.getItem("recent") || "[]"); }
function saveRecent(q) {
  let r = getRecent().filter(x => x !== q);
  r.unshift(q);
  localStorage.setItem("recent", JSON.stringify(r.slice(0, 10)));
}
function loadRecent() {
  const r = getRecent();
  recentList.innerHTML = "";
  if (!r.length) {
    recentList.innerHTML = `<li style="color:#9ca3af;padding:20px 0;text-align:center">No recent searches</li>`;
    return;
  }
  r.forEach(q => {
    const li = document.createElement("li");
    li.className = "recent-item";
    li.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-icon lucide-search"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg> ${q}`;
    li.onclick = () => { input.value = q; search(q); };
    recentList.appendChild(li);
  });
}
clearRecentBtn.onclick = () => {
  localStorage.removeItem("recent");
  loadRecent();
};

// Search API
function renderSkeletons() {
  panels.forEach(p => p.classList.remove("active"));
  document.getElementById(`panel-${activeTab}`).classList.add("active");
  const target = document.getElementById(`panel-${activeTab}`);
  target.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    target.insertAdjacentHTML("beforeend",
      `<div class="sk-card">
         <span class="sk-avatar"></span>
         <div class="sk-lines">
           <span class="sk-line sk-line-lg" style="width:${50 + (i%3)*10}%"></span>
           <span class="sk-line sk-line-sm" style="width:${30 + (i%4)*8}%"></span>
           <span class="sk-line" style="width:${80 - (i%3)*10}%"></span>
         </div>
       </div>`);
  }
}

async function search(query) {
  saveRecent(query);
  showResults();
  resultsMeta.textContent = "Searching…";
  renderSkeletons();

  try {
  const res = await fetch(
  `${baseUrl}/api/search?q=${encodeURIComponent(query)}&type=${activeTab}`,
  {
    headers: token
      ? {
          Authorization: `Bearer ${token}`
        }
      : {}
  }
);
    const data = await res.json();
    lastResults = data.results || [];
    render(lastResults);
  } catch (err) {
    console.error(err);
    resultsMeta.textContent = "Error loading results";
  }
}

function getFlagEmoji(countryCode) {
  if (!countryCode) return "";
  return countryCode
    .toUpperCase()
    .replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt()));
}

function showRecent() {
  recentSection.hidden = false;
  resultsSection.hidden = true;
  emptySection.hidden = true;
}
function showResults() {
  recentSection.hidden = true;
  resultsSection.hidden = false;
  emptySection.hidden = true;
}
function showEmpty() {
  recentSection.hidden = true;
  resultsSection.hidden = false;
  emptySection.hidden = false;
}

function highlight(text) {
  if (!text || !input.value) return text;
  const q = input.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(q, "gi"), m => `<mark>${m}</mark>`);
}

function renderPostText(text, mentions) {
  if (!text) return "";
  const safeText = typeof escapeHTML === "function" ? escapeHTML(text) : text;
  let output = safeText.replace(/#(\w+)/g, (match, tag) =>
    `<a href="/hashtag.html?tag=${tag}" class="hashtag-link">#${tag}</a>`);
  const mentionMap = {};
  (mentions || []).forEach(m => { mentionMap[m.username.toLowerCase()] = m; });
  output = output.replace(/@([a-zA-Z0-9_.-]+)/g, (match, username) => {
    const user = mentionMap[username.toLowerCase()];
    if (!user) return match;
    return `<a href="/profile.html?userId=${user._id}" class="mention">${match}</a>`;
  });
  return output;
}

// Render results
function render(results) {
  panels.forEach(p => p.innerHTML = "");

  const filtered = activeTab === "all" ? results : results.filter(r => r.type === activeTab);
  resultsMeta.textContent = `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`;

  if (!filtered.length) return showEmpty();

  filtered.forEach(item => {
    let html = "";

    // People
    if (item.type === "people" || item.type === "user") {
      html = `<div class="card" onclick="location.href='/profile.html?userId=${item._id}'">
        <img src="${item.profilePicture || '/uploads/images/africa.png'}" onerror="this.src='/uploads/images/africa.png'">
        <div class="card-content">
          <strong>${highlight(item.fullName)} <span>${item.isVerified ? '<svg class="verified-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1DA1F2"/><path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/></svg><span>' : ''} <div class="user-country">${getFlagEmoji(item.country)}</div> </strong>
          <span>@${item.username}</span>
        </div>
      </div>`;
    }

    // Posts - with image support
 if (item.type === "post") {
  const postImg =
  item.images?.[0] ||
  item.image ||
  item.thumbnail;

const postVid = item.video;

    const isVideo = !!postVid;
    const hasMedia = !!(postImg || postVid);
      if (hasMedia) {
        html = `<div class="post-card-img" onclick="location.href='/view-post.html?postId=${item._id}'">
          <div class="post-head">
            <img src="${item.author?.profilePicture || '/uploads/images/africa.png'}" onerror="this.src='/uploads/images/africa.png'">
            <strong>${item.author?.fullName || item.author?.username} <span>${item.author?.isVerified ? '<svg class="verified-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1DA1F2"/><path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/></svg><span>' : ''}</strong>
          </div>
          <div class="post-caption">
  ${
    item.text
      ? renderPostText(
          highlight(
            item.text.length > 100
              ? item.text.slice(0, 100) + "..."
              : item.text
          ),
          item.mentions || []
        )
      : ""
  }
</div>

             <div class="post-media-wrapper">

  ${
    isVideo
      ? `
      <video
        class="post-img"
        src="${postVid}"
        muted
        loop
        playsinline
        preload="metadata"
      ></video>

      <div class="video-play-overlay">
        <svg
          width="42"
          height="42"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
      `
      : `
      <img
        class="post-img"
        src="${postImg}"
        alt="post"
      >
      `
  }

</div>
             
                        <div class="post-actions">
          <button class="action-btn love-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span class="count">${(item.likes || []).length}</span>
          </button>
          
          <button class="action-btn comment-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span class="count">${item.commentCount || 0}</span>
          </button>
          
          <button class="action-btn star-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span class="count">${(item.stars || []).length}</span>
          </button>
              </div>
        </div>`;
      } else {
        html = `<div class="card post-card" onclick="location.href='/view-post.html?postId=${item._id}'">
        <div class="card-case">
        <img src="${item.author?.profilePicture || '/uploads/images/africa.png'}" onerror="this.src='/uploads/images/africa.png'">
        <div class="card-content">
        <strong>${item.author?.fullName}  <span>${item.author?.isVerified ? '<svg class="verified-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1DA1F2"/><path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/></svg><span>' : ''} </strong>
        <p>${item.author?.username}</p>
        </div>
        </div>
        <div style="margin-top:8px;">
        <p class="post-text">
  ${
    item.text
      ? renderPostText(
          highlight(
            item.text.length > 100
              ? item.text.slice(0, 100) + "..."
              : item.text
          ),
          item.mentions || []
        )
      : ""
  }
  </p>
</div>
                      <div class="post-actions">
          <button class="action-btn love-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span class="count">${(item.likes || []).length}</span>
          </button>
          
          <button class="action-btn comment-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span class="count">${item.commentCount || 0}</span>
          </button>
          
          <button class="action-btn star-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span class="count">${(item.stars || []).length}</span>
          </button>
              </div>
        </div>`;
      }
    }

    // Videos - grid layout like screenshot
    if (item.type === "videos") {  
   html = `<div class="video-card" onclick="window.location.href='/vybze-player.html?videoId=${item._id}'" data-video="${item.video}>  
    <video
  class="thumb-video"
  src="${item.video}"
  muted
  loop
  playsinline
  preload="metadata"
></video>
    <div class="video-info">  
      <img src="${item.author?.profilePicture || '/uploads/images/africa.png'}" onerror="this.src='/uploads/images/africa.png'">  
      <span>${item.author?.username || 'user'}</span>  
      <span class="duration-badge"></span>
    </div>  
  </div>`;  
}

    // Hashtags
    if (item.type === "hashtags") {
      html = `<div class="card" onclick="location.href='/hashtag.html?tag=${item.tag}'">
        <div class="hashtag-icon">#</div>
        <div class="card-content">
          <strong>#${highlight(item.tag)}</strong>
          <span>${item.postCount} posts</span>
        </div>
      </div>`;
    }

    // Add to panels
    if (activeTab === "all") {
      panels[0].insertAdjacentHTML("beforeend", html);
    } else {
      const targetPanel = document.getElementById(`panel-${item.type}`);
      if (targetPanel) targetPanel.insertAdjacentHTML("beforeend", html);
    }
    filtered.forEach(item => {
  if (item.type === "post" && item._id) {
    fetch(`${baseUrl}/api/posts/${item._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      .then(res => res.json())
      .then(post => {
        const card = document.querySelector(`[onclick*="id=${item._id}"]`);
        if (!card) return;
        
        const loveBtn = card.querySelector(".love-btn .count");
        const starBtn = card.querySelector(".star-btn .count");
        const commentBtn = card.querySelector(".comment-btn .count");
        
        if (loveBtn) loveBtn.textContent = (post.likes || []).length;
        if (starBtn) starBtn.textContent = (post.stars || []).length;
        if (commentBtn) commentBtn.textContent = (post.comments || []).length;
      });
  }
});
  });
  // Observe videos after render
document
  .querySelectorAll(".thumb-video")
  .forEach(video => {
    observer.observe(video);
  });
     }

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      const video = entry.target;

      if (entry.isIntersecting) {
  video.play().catch(() => {});
} else {
  video.pause();
}
    });
  },
  {
    threshold: 0.6
  }
);
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function loadVideoDurations() {
  document.querySelectorAll('.video-card').forEach(card => {
    const videoUrl = card.dataset.video; // make sure your card has data-video="url.mp4"
    if (!videoUrl) return;
    
    const video = document.createElement('video');
    video.src = videoUrl;
    video.preload = 'metadata'; // only load duration, not full video
    
    video.addEventListener('loadedmetadata', () => {
      const duration = formatDuration(video.duration);
      
      // Add duration badge to card
      let badge = card.querySelector('.duration-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'duration-badge';
        card.appendChild(badge);
      }
      badge.textContent = duration;
      
      video.remove(); // cleanup
    });
    
    video.addEventListener('error', () => video.remove());
  });
}

// Call this after you append videos to #panel-videos
loadVideoDurations();