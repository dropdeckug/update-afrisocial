const token = localStorage.getItem("token");
if (!token) window.location.href = "/login.html";
if (localStorage.getItem("afri_theme") === "dark") document.body.classList.add("dark");
const baseUrl = "https://afrisocial-backend-dev-production.up.railway.app";
const currentUserId = localStorage.getItem("userId");
const notificationBox = document.getElementById("notificationBox");
const postModal = document.getElementById("postModal");
const closePostModal = document.getElementById("closePostModal");
const modalPostContainer = document.getElementById("modalPostContainer");
const modalCommentsContainer = document.getElementById("modalCommentsContainer");

//  Helpers 
function getFlagEmoji(countryCode) {
  if (!countryCode) return "";
  return countryCode
    .toUpperCase()
    .replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt()));
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return `${diff}s`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function getTypeIcon(type) {
  const map = {
    like:            { emoji: "",  cls: "like"    },
    star:            { emoji: "",  cls: "star"    },
    comment:         { emoji: "",  cls: "comment" },
    reply:           { emoji: "",  cls: "reply"   },
    follow:          { emoji: "",  cls: "follow"  },
    follow_back:     { emoji: "",  cls: "follow"  },
    poll:            { emoji: "",  cls: "poll"    },
    poll_vote:       { emoji: "",  cls: "poll"    },
    poll_react:      { emoji: "",  cls: "poll"    },
    poll_response:   { emoji: "",  cls: "poll"    },
    mention:         { emoji: "@",   cls: "mention" },
    mention_comment: { emoji: "@",   cls: "mention" },
  };
  return map[type] || { emoji: "", cls: "default" };
}

function getActionText(type) {
  const map = {
    like:            "liked your post",
    star:            "starred your post",
    comment:         "commented on your post",
    reply:           "replied to your comment",
    follow:          "started following you",
    follow_back:     "followed you back",
    poll:            "created a new battle poll",
    poll_vote:       "voted on your battle poll",
    poll_react:      "reacted to your battle poll",
    poll_response:   "responded to your battle poll",
    mention:         "mentioned you in a post",
    mention_comment: "mentioned you in a comment",
  };
  return map[type] || "sent you a notification";
}

//  Badge helpers 
const notificationBadgeEl = document.getElementById("notificationBadge");

function setNotificationCount(count) {
  if (!notificationBadgeEl) return;
  if (count > 0) {
    notificationBadgeEl.textContent = count > 99 ? "99+" : count;
    notificationBadgeEl.style.display = "inline-flex";
  } else {
    notificationBadgeEl.style.display = "none";
  }
}

async function loadNotificationBadge() {
  try {
    const res = await fetch(`${baseUrl}/api/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setNotificationCount(data.count);
  } catch (err) {
    console.error("Failed to load notification badge:", err);
  }
}
loadNotificationBadge();

//  Load & render notifications 
async function loadNotifications() {
  // Show skeletons while fetching
  notificationBox.innerHTML = `
    <div class="skeleton-item">
      <div class="sk-avatar"></div>
      <div class="sk-lines">
        <div class="sk-line w80"></div>
        <div class="sk-line w50"></div>
      </div>
    </div>
    <div class="skeleton-item">
      <div class="sk-avatar"></div>
      <div class="sk-lines">
        <div class="sk-line w60"></div>
        <div class="sk-line w40"></div>
      </div>
    </div>
    <div class="skeleton-item">
      <div class="sk-avatar"></div>
      <div class="sk-lines">
        <div class="sk-line w70"></div>
        <div class="sk-line w30"></div>
      </div>
    </div>
    <div class="skeleton-item">
      <div class="sk-avatar"></div>
      <div class="sk-lines">
        <div class="sk-line w80"></div>
        <div class="sk-line w50"></div>
      </div>
    </div>
    <div class="skeleton-item">
      <div class="sk-avatar"></div>
      <div class="sk-lines">
        <div class="sk-line w60"></div>
        <div class="sk-line w40"></div>
      </div>
    </div>
  `;

  try {
    const res = await fetch(`${baseUrl}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const notifications = await res.json();

    // Guard: if not an array or empty
    if (!Array.isArray(notifications) || notifications.length === 0) {
      notificationBox.innerHTML = `
        <div class="notif-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="1.5"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <strong>No notifications yet</strong>
          <span>When someone interacts with you, it'll show up here.</span>
        </div>`;
      return;
    }

    // Clear skeletons only when real data is confirmed
    notificationBox.innerHTML = "";

    notifications.forEach((n, index) => {
      const sender   = n.sender || {};
      const typeInfo = getTypeIcon(n.type);
      const action   = getActionText(n.type);

      const div = document.createElement("div");
      div.className = `notification-item ${n.isRead ? "read" : "unread"}`;
      div.style.animationDelay = `${index * 35}ms`;

      div.dataset.id        = n._id;
      div.dataset.type      = n.type;
      div.dataset.postId    = n.post?._id    || "";
      div.dataset.commentId = n.comment?._id || "";
      div.dataset.userId    = n.sender?._id  || "";
      div.dataset.pollId    = n.poll?._id    || "";

      let rightEl = "";
      if (n.type === "follow" || n.type === "follow_back") {
        rightEl = `<button class="notif-follow-btn" onclick="event.stopPropagation(); window.location.href='/profile.html?userId=${sender._id}'">View</button>`;
      } else if (n.post?.images?.[0]) {
        rightEl = `<img class="notif-thumb" src="${n.post.images[0]}" alt="post thumbnail">`;
      }

      const verifiedSVG = sender.isVerified
        ? `<svg class="verified-icon" viewBox="0 0 24 24">
             <circle cx="12" cy="12" r="10" fill="#0095f6"/>
             <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2.2" fill="none"
               stroke-linecap="round" stroke-linejoin="round"/>
           </svg>`
        : "";

      div.innerHTML = `
        <div class="notif-avatar-wrap">
          <img
            src="${sender.profilePicture || '/uploads/images/africa.png'}"
            alt="${sender.fullName || 'User'}"
            onerror="this.src='/uploads/images/africa.png'"
          >
          <span class="notif-type-icon ${typeInfo.cls}">${typeInfo.emoji}</span>
        </div>
        <div class="notification-text">
          <span class="notif-name">${sender.fullName || "Someone"}${verifiedSVG} ${getFlagEmoji(sender.country)}</span>
          <span class="notif-action"> ${action}</span>
          <small class="notif-time">${timeAgo(n.createdAt)}</small>
        </div>
        ${rightEl}
      `;

      notificationBox.appendChild(div);
    });

  } catch (err) {
    console.error("Failed to load notifications:", err);
    notificationBox.innerHTML = `
      <div class="notif-empty">
        <strong>Couldn't load notifications</strong>
        <span>${err.message || "Please try again."}</span>
      </div>`;
  }
}
loadNotifications();

//  Click handler 
notificationBox.addEventListener("click", async e => {
  const item = e.target.closest(".notification-item");
  if (!item) return;

  // Mark as read
  await fetch(`${baseUrl}/api/notifications/read/${item.dataset.id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });

  item.classList.remove("unread");
  item.classList.add("read");

  const { type, postId, commentId, userId } = item.dataset;

  if (type === "follow" || type === "follow_back") {
    window.location.href = `/profile.html?userId=${userId}`;
    return;
  }

  if (["poll", "poll_vote", "poll_react", "poll_response"].includes(type)) {
    window.location.href = `/feed.html?pollId=${item.dataset.pollId}`;
    return;
  }

  if (["comment", "reply", "like", "star", "mention", "mention_comment"].includes(type)) {
    openPostModal(postId, commentId, type);
  }
});

//  Post modal 
async function openPostModal(postId, commentId, type) {
  try {
    postModal.classList.remove("hidden");
    modalPostContainer.innerHTML = `
      <div class="skeleton-item" style="padding:14px 16px;">
        <div class="sk-avatar" style="width:36px;height:36px;"></div>
        <div class="sk-lines">
          <div class="sk-line w60"></div>
          <div class="sk-line w80"></div>
        </div>
      </div>`;
    modalCommentsContainer.innerHTML = "";

    const postRes = await fetch(`${baseUrl}/api/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!postRes.ok) throw new Error(`Post fetch failed: ${postRes.status}`);
    const post = await postRes.json();

    const imagesHTML = post.images?.length
      ? post.images.map(img => `<img src="${img}" alt="post image" style="width:100%;border-radius:8px;margin-top:8px;">`).join("")
      : "";

    const videoHTML = post.video
      ? `<video src="${post.video}" controls style="width:100%;border-radius:8px;max-height:360px;object-fit:cover;margin-top:8px;"></video>`
      : "";

    modalPostContainer.innerHTML = `
      <div class="modal-post">
        <h4>${post.user?.fullName || "User"}</h4>
        ${post.text ? `<p>${post.text}</p>` : ""}
        ${imagesHTML}
        ${videoHTML}
      </div>`;

    const commentRes = await fetch(`${baseUrl}/api/posts/${postId}/comments`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!commentRes.ok) throw new Error(`Comments fetch failed: ${commentRes.status}`);
    const comments = await commentRes.json();

    if (!Array.isArray(comments) || comments.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.style.cssText = "text-align:center;padding:20px;color:#737373;font-size:13px;";
      emptyDiv.textContent = "No comments yet.";
      modalCommentsContainer.appendChild(emptyDiv);
    } else {
      comments.forEach(comment => {
        const commentDiv = document.createElement("div");
        commentDiv.className = "modal-comment";
        commentDiv.dataset.commentId = comment._id;
        commentDiv.innerHTML = `
          <strong>${comment.user?.fullName || "User"}</strong>
          <p>${comment.text}</p>
        `;
        modalCommentsContainer.appendChild(commentDiv);

        comment.replies?.forEach(reply => {
          const replyDiv = document.createElement("div");
          replyDiv.className = "modal-reply";
          replyDiv.dataset.commentId = reply._id;
          replyDiv.innerHTML = `
            <strong>${reply.user?.fullName || "User"}</strong>
            <p>${reply.text}</p>
          `;
          modalCommentsContainer.appendChild(replyDiv);
        });
      });
    }

    // Scroll to & highlight target comment
    if (commentId) {
      setTimeout(() => {
        const target = modalCommentsContainer.querySelector(`[data-comment-id="${commentId}"]`);
        if (target) {
          target.classList.add("highlight-comment");
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    }

  } catch (err) {
    console.error("Error opening post modal:", err);
    modalPostContainer.innerHTML = `
      <div style="padding:20px;text-align:center;color:#737373;">
        Failed to load post. ${err.message || ""}
      </div>`;
  }
}

//  Modal close 
closePostModal.addEventListener("click", () => {
  postModal.classList.add("hidden");
  modalPostContainer.innerHTML = "";
  modalCommentsContainer.innerHTML = "";
});

postModal.addEventListener("click", e => {
  if (e.target === postModal) {
    postModal.classList.add("hidden");
    modalPostContainer.innerHTML = "";
    modalCommentsContainer.innerHTML = "";
  }
});

//  Unread message badge 
async function loadUnreadMessages() {
  try {
    const res = await fetch(`${baseUrl}/api/messages/unread-count`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const badge = document.getElementById("messageBadge");
    if (!badge) return;

    if (data.count > 0) {
      badge.textContent = data.count > 99 ? "99+" : data.count;
      badge.style.display = "inline-flex";
    } else {
      badge.style.display = "none";
    }
  } catch (err) {
    console.error("Failed to load message badge:", err);
  }
}

const messageIcon = document.getElementById("messageIcon");
if (messageIcon) {
  messageIcon.addEventListener("click", () => {
    const badge = document.getElementById("messageBadge");
    if (badge) badge.style.display = "none";
    window.location.href = "/message.html";
  });
}
loadUnreadMessages();

//  Notification bell (navbar) 
const notificationBtn = document.getElementById("notificationBtn");

if (notificationBtn) {
  notificationBtn.addEventListener("click", async () => {
    notificationBox.classList.toggle("show");
    if (notificationBox.classList.contains("show")) {
      await fetch(`${baseUrl}/api/notifications/mark-read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificationCount(0);
      loadNotifications();
    }
  });
}

//  Active nav 
const vybzeNav = document.querySelector(".vybze-nav");
if (vybzeNav) vybzeNav.classList.add("active");
