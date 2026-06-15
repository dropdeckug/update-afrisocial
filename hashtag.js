// ══════════════════════════════════════════════════════════════
// HASHTAG SEARCH & FEED
// ══════════════════════════════════════════════════════════════

const API_BASE = "https://afrisocial-backend.onrender.com";
const token = localStorage.getItem("token");

// DOM Elements
const hashtagSearch = document.getElementById("hashtagSearch");
const hashtagSuggestions = document.getElementById("hashtagSuggestions");
const feed = document.getElementById("feed");
const feedLoader = document.getElementById("feedLoader");
const hashtagChips = document.querySelectorAll(".hashtag-chip");

// Modal Elements
const commentModal = document.getElementById("commentModal");
const commentModalOverlay = document.getElementById("commentModalOverlay");
const giftModal = document.getElementById("giftModal");
const giftModalOverlay = document.getElementById("giftModalOverlay");
const shareModal = document.getElementById("shareModal");
const shareModalOverlay = document.getElementById("shareModalOverlay");
const closeCommentModal = document.getElementById("closeCommentModal");
const closeGiftModal = document.getElementById("closeGiftModal");
const closeShareModal = document.getElementById("closeShareModal");

// Current state
let currentHashtag = null;
let currentPostId = null;
let currentPage = 1;
let isLoading = false;

// ══════════════════════════════════════════════════════════════
// SEARCH HASHTAG
// ══════════════════════════════════════════════════════════════

hashtagSearch.addEventListener("input", async (e) => {
  const query = e.target.value.trim().toLowerCase();

  if (query.length === 0) {
    hashtagSuggestions.innerHTML = "";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/posts/search-hashtags?q=${query}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    
    renderHashtagSuggestions(data.hashtags || []);
  } catch (err) {
    console.error("Failed to search hashtags:", err);
  }
});

function renderHashtagSuggestions(hashtags) {
  if (hashtags.length === 0) {
    hashtagSuggestions.innerHTML = "";
    return;
  }

  hashtagSuggestions.innerHTML = hashtags.map(tag => `
    <div class="suggestion-item" data-tag="${tag}">#${tag}</div>
  `).join("");

  document.querySelectorAll(".suggestion-item").forEach(item => {
    item.addEventListener("click", () => {
      const tag = item.dataset.tag;
      hashtagSearch.value = "#" + tag;
      hashtagSuggestions.innerHTML = "";
      loadHashtagPosts(tag);
    });
  });
}

// ══════════════════════════════════════════════════════════════
// LOAD POSTS BY HASHTAG
// ══════════════════════════════════════════════════════════════

async function loadHashtagPosts(hashtag) {
  currentHashtag = hashtag;
  currentPage = 1;
  feed.innerHTML = "";
  feedLoader.classList.add("active");

  try {
    const res = await fetch(
      `${API_BASE}/api/posts/hashtag/${hashtag}?page=${currentPage}&limit=10`,
      { headers: { "Authorization": `Bearer ${token}` } }
    );
    const data = await res.json();
    
    feedLoader.classList.remove("active");
    renderPosts(data.posts || []);
  } catch (err) {
    console.error("Failed to load hashtag posts:", err);
    feedLoader.classList.remove("active");
    feed.innerHTML = `<div style="padding: 20px; text-align: center; color: #EF4444;">Error loading posts</div>`;
  }
}

// ══════════════════════════════════════════════════════════════
// RENDER POSTS
// ══════════════════════════════════════════════════════════════

function renderPosts(posts) {
  if (posts.length === 0) {
    feed.innerHTML = `<div style="padding: 20px; text-align: center; color: #9CA3AF;">No posts found for #${currentHashtag}</div>`;
    return;
  }

  const postsHTML = posts.map(post => `
    <div class="post" data-post-id="${post._id}">
      <!-- Post Header -->
      <div class="post-header">
        <img src="${post.author.profilePicture || '/uploads/images/default-avatar.png'}" 
             alt="${post.author.fullName}" class="post-avatar">
        <div class="post-header-info">
          <strong>${post.author.fullName}</strong>
          <div class="post-location">
            ${post.author.country ? `${getCountryEmoji(post.author.country)}` : ""} 
            ${post.location || ""}
          </div>
        </div>
        <button class="post-three-dot">⋮</button>
      </div>

      <!-- Caption -->
      ${post.caption ? `<div class="text-body">${post.caption}</div>` : ""}

      <!-- Media (Image/Video) -->
      ${post.media && post.media.length > 0 ? renderMediaContent(post.media) : ""}

      <!-- Post Actions -->
      <div class="post-actions">
        <button class="action-btn like-btn" data-post-id="${post._id}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span class="count">${post.likeCount || 0}</span>
        </button>

        <button class="action-btn comment-btn" data-post-id="${post._id}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span class="count">${post.commentCount || 0}</span>
        </button>

        <button class="action-btn gift-btn" data-post-id="${post._id}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 12 20 22 4 22 4 12"></polyline>
            <rect x="2" y="7" width="20" height="5"></rect>
            <path d="M12 9V7c0-1.1.9-2 2-2 2 0 2 2 2 2s0-1 .5-2.5C16.5 3 15 0 12 0s-4.5 3-4.5 3.5c.5 1.5.5 2.5.5 2.5 0 0 0-2 2-2 1.1 0 2 .9 2 2v2"/>
          </svg>
          <span class="count">${post.giftCount || 0}</span>
        </button>

        <button class="action-btn share-btn" data-post-id="${post._id}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </button>
      </div>
    </div>
  `).join("");

  feed.innerHTML += postsHTML;
  attachPostEventListeners();
}

// ══════════════════════════════════════════════════════════════
// RENDER MEDIA CONTENT
// ══════════════════════════════════════════════════════════════

function renderMediaContent(media) {
  if (media.length === 0) return "";

  if (media.length === 1) {
    const item = media[0];
    if (item.type === "image") {
      return `<div class="post-media-container"><img src="${item.url}" alt="post" class="post-media" /></div>`;
    } else if (item.type === "video") {
      return `
        <div class="video-wrapper">
          <video controls class="post-media">
            <source src="${item.url}" type="video/mp4">
          </video>
        </div>`;
    }
  } else {
    // Multiple images - create slider
    return `
      <div class="image-slider-wrapper">
        <div class="image-slider">
          ${media.map((item, idx) => 
            item.type === "image" ? `<img src="${item.url}" class="slide" />` : ""
          ).join("")}
        </div>
        <div class="image-counter"><span id="current-slide">1</span>/${media.filter(m => m.type === "image").length}</div>
      </div>
    `;
  }
}

// ══════════════════════════════════════════════════════════════
// ATTACH EVENT LISTENERS TO POSTS
// ══════════════════════════════════════════════════════════════

function attachPostEventListeners() {
  // Like buttons
  document.querySelectorAll(".like-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const postId = btn.dataset.postId;
      await likePost(postId, btn);
    });
  });

  // Comment buttons
  document.querySelectorAll(".comment-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentPostId = btn.dataset.postId;
      openCommentModal();
    });
  });

  // Gift buttons
  document.querySelectorAll(".gift-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentPostId = btn.dataset.postId;
      openGiftModal();
    });
  });

  // Share buttons
  document.querySelectorAll(".share-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentPostId = btn.dataset.postId;
      openShareModal();
    });
  });
}

// ══════════════════════════════════════════════════════════════
// LIKE POST
// ══════════════════════════════════════════════════════════════

async function likePost(postId, btn) {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();

    if (res.ok) {
      const countEl = btn.querySelector(".count");
      const isLiked = data.isLiked;
      
      if (isLiked) {
        btn.classList.add("liked");
        countEl.textContent = parseInt(countEl.textContent) + 1;
      } else {
        btn.classList.remove("liked");
        countEl.textContent = Math.max(0, parseInt(countEl.textContent) - 1);
      }
    }
  } catch (err) {
    console.error("Failed to like post:", err);
  }
}

// ══════════════════════════════════════════════════════════════
// COMMENT MODAL
// ══════════════════════════════════════════════════════════════

function openCommentModal() {
  commentModalOverlay.classList.add("active");
  commentModal.classList.add("open");
  loadComments();
}

async function loadComments() {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${currentPostId}/comments`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    renderComments(data.comments || []);
  } catch (err) {
    console.error("Failed to load comments:", err);
  }
}

function renderComments(comments) {
  const commentsList = document.getElementById("commentsList");
  
  if (comments.length === 0) {
    commentsList.innerHTML = `<div style="padding: 20px; text-align: center; color: #9CA3AF;">No comments yet</div>`;
    return;
  }

  commentsList.innerHTML = comments.map(comment => `
    <div class="comment-item">
      <img src="${comment.author.profilePicture || '/uploads/images/default-avatar.png'}" 
           alt="${comment.author.fullName}" class="comment-avatar">
      <div class="comment-content">
        <strong>${comment.author.fullName}</strong>
        <p>${comment.text}</p>
        <small>${new Date(comment.createdAt).toLocaleDateString()}</small>
      </div>
    </div>
  `).join("");
}

document.getElementById("submitComment").addEventListener("click", async () => {
  const commentInput = document.getElementById("commentInput");
  const text = commentInput.value.trim();

  if (!text) return;

  try {
    await fetch(`${API_BASE}/api/posts/${currentPostId}/comments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    commentInput.value = "";
    loadComments();
  } catch (err) {
    console.error("Failed to post comment:", err);
  }
});

// ══════════════════════════════════════════════════════════════
// GIFT MODAL
// ══════════════════════════════════════════════════════════════

let selectedGift = null;

function openGiftModal() {
  giftModalOverlay.classList.add("active");
  giftModal.classList.add("open");
}

document.querySelectorAll(".gift-item").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".gift-item").forEach(i => i.classList.remove("selected"));
    item.classList.add("selected");
    selectedGift = { type: item.dataset.type, cost: parseInt(item.dataset.cost) };
  });
});

document.getElementById("sendGiftBtn").addEventListener("click", async () => {
  if (!selectedGift) {
    alert("Please select a gift");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/posts/${currentPostId}/gift`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ giftType: selectedGift.type })
    });

    if (res.ok) {
      alert(`✨ Gift sent!`);
      closeGiftModal.click();
    }
  } catch (err) {
    console.error("Failed to send gift:", err);
  }
});

// ══════════════════════════════════════════════════════════════
// SHARE MODAL
// ══════════════════════════════════════════════════════════════

function openShareModal() {
  shareModalOverlay.classList.add("active");
  shareModal.classList.add("open");
}

document.getElementById("shareWhatsapp").addEventListener("click", () => {
  const url = `${window.location.origin}/post/${currentPostId}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(url)}`);
});

document.getElementById("shareFacebook").addEventListener("click", () => {
  const url = `${window.location.origin}/post/${currentPostId}`;
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
});

document.getElementById("shareTwitter").addEventListener("click", () => {
  const url = `${window.location.origin}/post/${currentPostId}`;
  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${currentHashtag}`);
});

document.getElementById("copyLink").addEventListener("click", () => {
  const url = `${window.location.origin}/post/${currentPostId}`;
  navigator.clipboard.writeText(url).then(() => {
    document.getElementById("copyFeedback").classList.remove("hidden");
    setTimeout(() => {
      document.getElementById("copyFeedback").classList.add("hidden");
    }, 2000);
  });
});

// ══════════════════════════════════════════════════════════════
// MODAL CLOSE HANDLERS
// ══════════════════════════════════════════════════════════════

closeCommentModal.addEventListener("click", () => {
  commentModalOverlay.classList.remove("active");
  commentModal.classList.remove("open");
});

closeGiftModal.addEventListener("click", () => {
  giftModalOverlay.classList.remove("active");
  giftModal.classList.remove("open");
});

closeShareModal.addEventListener("click", () => {
  shareModalOverlay.classList.remove("active");
  shareModal.classList.remove("open");
});

// Close modals on overlay click
[commentModalOverlay, giftModalOverlay, shareModalOverlay].forEach(overlay => {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("active");
      overlay.querySelector(".comment-modal, .gift-modal, .share-modal")?.classList.remove("open");
    }
  });
});

// ══════════════════════════════════════════════════════════════
// HASHTAG CHIPS
// ══════════════════════════════════════════════════════════════

hashtagChips.forEach(chip => {
  chip.addEventListener("click", () => {
    const tag = chip.dataset.tag;
    hashtagSearch.value = "#" + tag;
    loadHashtagPosts(tag);
  });
});

// ══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ══════════════════════════════════════════════════════════════

function getCountryEmoji(countryCode) {
  if (!countryCode) return "";
  return countryCode
    .toUpperCase()
    .replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt()));
}

// Infinite scroll
window.addEventListener("scroll", () => {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
    if (!isLoading && currentHashtag) {
      isLoading = true;
      currentPage++;
      loadMorePosts();
    }
  }
});

async function loadMorePosts() {
  try {
    const res = await fetch(
      `${API_BASE}/api/posts/hashtag/${currentHashtag}?page=${currentPage}&limit=10`,
      { headers: { "Authorization": `Bearer ${token}` } }
    );
    const data = await res.json();
    renderPosts(data.posts || []);
    isLoading = false;
  } catch (err) {
    console.error("Failed to load more posts:", err);
    isLoading = false;
  }
}
