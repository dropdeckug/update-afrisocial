// ══════════════════════════════════════════════
//  DARK MODE
// ══════════════════════════════════════════════
if (localStorage.getItem("afri_theme") === "dark") document.body.classList.add("dark");

// ================== AUTH CHECK ==================
const token = localStorage.getItem("token");
if (!token) window.location.href = "/login.html";

const baseUrl       = "https://afrisocial-backend.onrender.com";
const currentUserId = localStorage.getItem("userId");
const OPTION_LABELS = ["A","B","C","D"];

// ── Gift Catalogue ──
const FEED_GIFT_CATALOGUE = [
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
  { emoji: "🚢",  name: "Cruise",     stars: 1000 },
  { emoji: "🛸",  name: "UFO",        stars: 1500 },
  { emoji: "🏰",  name: "Castle",     stars: 2000 },
  { emoji: "🚗",  name: "Car",        stars: 3000 },
  { emoji: "✈️",  name: "Jet",        stars: 5000 },
];

// ================== HELPERS ==================
function getFlagEmoji(code) {
  if (!code) return "";
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt()));
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return `${diff}s`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
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

function getMediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${baseUrl}${path}`;
}

function verifiedBadge() {
  return `<svg class="verified-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1DA1F2"/><path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/></svg>`;
}

function showToast(msg) {
  let toast = document.getElementById("feedToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "feedToast";
    toast.className = "feed-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}

function isSponsoredActive(item) {
  return item.isSponsored && (!item.expiresAt || new Date(item.expiresAt) > new Date());
}

function getBarClass(pct, maxPct) {
  if (pct === 0) return "low";
  return pct >= maxPct ? "high" : "low";
}

function launchGiftBurst(postElement, emoji) {
const burst =
document.createElement("div");
burst.className = "gift-burst";
burst.textContent = emoji;
postElement.appendChild(burst);
setTimeout(() => {
burst.remove();
}, 2200);
}

// ================== PLUS DROPDOWN ==================
const plusBtn      = document.getElementById("plusBtn");
const plusDropdown = document.getElementById("plusDropdown");
plusBtn.addEventListener("click", e => { e.stopPropagation(); plusDropdown.classList.toggle("open"); });
document.addEventListener("click", () => plusDropdown.classList.remove("open"));
plusDropdown.addEventListener("click", e => e.stopPropagation());

// ================== SEARCH ==================
const openSearch      = document.getElementById("openSearch");
const searchContainer = document.getElementById("searchContainer");
const closeSearch     = document.getElementById("closeSearch");
const searchInput     = document.getElementById("searchInput");
const resultsBox      = document.getElementById("searchResults");
let searchTimeout;

openSearch.addEventListener("click", () => {
  location.href="search.html";
});
closeSearch.addEventListener("click", () => {
  searchContainer.style.display = "none";
  searchInput.value = "";
  resultsBox.innerHTML = "";
});
searchInput.addEventListener("keyup", () => {
  clearTimeout(searchTimeout);
  const query = searchInput.value.trim();
  if (!query) { resultsBox.innerHTML = ""; return; }
  searchTimeout = setTimeout(() => searchUsers(query), 400);
});

async function searchUsers(query) {
  try {
    const res  = await fetch(`${baseUrl}/api/users/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    resultsBox.innerHTML = "";
    if (!data.users || !data.users.length) {
      resultsBox.innerHTML = `<p style="padding:14px;color:#9CA3AF;font-size:14px;">No users found</p>`;
      return;
    }
    data.users.forEach(user => {
      const div = document.createElement("div");
      div.className = "search-user";
      div.innerHTML = `
        <img class="search-avatar" src="${user.profilePicture || '/uploads/images/africa.png'}" onerror="this.src='/uploads/images/africa.png'" />
        <div><strong>${user.fullName} ${user.isVerified ? verifiedBadge() : ""} ${getFlagEmoji(user.country)}</strong><span>@${user.username}</span></div>
      `;
      div.addEventListener("click", () => { window.location.href = `/profile.html?userId=${user._id}`; });
      resultsBox.appendChild(div);
    });
  } catch (err) { console.error("Search error:", err); }
}

// ================== CREATE POST MODAL ==================
const postModal        = document.getElementById("postModal");
const postModalOverlay = document.getElementById("postModalOverlay");
const cancelPost       = document.getElementById("cancelPost");
const openPostBtn      = document.getElementById("openPost");

function openCreatePost()  { plusDropdown.classList.remove("open"); postModal.classList.add("open"); postModalOverlay.classList.add("active"); document.body.style.overflow = "hidden"; }
function closeCreatePost() { postModal.classList.remove("open"); postModalOverlay.classList.remove("active"); document.body.style.overflow = ""; }

openPostBtn.addEventListener("click", openCreatePost);
cancelPost.addEventListener("click", closeCreatePost);
postModalOverlay.addEventListener("click", e => { if (e.target === postModalOverlay) closeCreatePost(); });

async function loadSheetAvatar() {
  const userId = localStorage.getItem("userId"); if (!userId) return;
  try {
    const res  = await fetch(`${baseUrl}/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    const avatar = document.getElementById("sheetAvatar");
    if (avatar && data.user?.profilePicture) avatar.src = data.user.profilePicture;
  } catch {}
}
loadSheetAvatar();

const mediaUploadBtn = document.getElementById("mediaUploadBtn");
const postMedia      = document.getElementById("postMedia");
const mediaPreview   = document.getElementById("mediaPreview");

mediaUploadBtn.addEventListener("click", () => postMedia.click());
postMedia.addEventListener("change", function () {
  const files = Array.from(this.files); if (!files.length) return;
  mediaPreview.innerHTML = "";
  const images = files.filter(f => f.type.startsWith("image/"));
  const videos = files.filter(f => f.type.startsWith("video/"));
  if (videos.length > 1) { alert("One video per post only."); postMedia.value = ""; return; }
  if (images.length && videos.length) { alert("Cannot mix images and video."); postMedia.value = ""; return; }
  if (videos.length === 1) {
    const v = document.createElement("video"); v.src = URL.createObjectURL(videos[0]); v.controls = true; v.className = "preview-video";
    mediaPreview.appendChild(v);
  }
  if (images.length) {
    const grid = document.createElement("div"); grid.className = "image-preview-grid";
    images.forEach(img => { const el = document.createElement("img"); el.src = URL.createObjectURL(img); grid.appendChild(el); });
    mediaPreview.appendChild(grid);
  }
  const removeBtn = document.createElement("button"); removeBtn.textContent = "Remove Media"; removeBtn.className = "remove-media-btn";
  removeBtn.onclick = () => { mediaPreview.innerHTML = ""; postMedia.value = ""; };
  mediaPreview.prepend(removeBtn);
});

const postBtn     = document.getElementById("postBtn");
const postInput   = document.getElementById("postInput");
const postBtnText = document.getElementById("postBtnText");
const postSpinner = document.getElementById("postSpinner");

postBtn.onclick = async () => {
  const text  = postInput.value.trim();
  const files = postMedia.files;
  if (!text && files.length === 0) return;
  if (text) {
    const modResult = scanContent(text);
    if (!modResult.clean) {
      if (modResult.severity === "severe") { showModerationWarning(modResult.reasons); fetch(`${baseUrl}/api/moderation/flag`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({content:text,contentType:"post",reasons:modResult.reasons,severity:modResult.severity,action:"blocked_at_submission"})}).catch(()=>{}); return; }
      if (modResult.severity === "mild")   { fetch(`${baseUrl}/api/moderation/flag`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({content:text,contentType:"post",reasons:modResult.reasons,severity:modResult.severity,action:"flagged_for_review"})}).catch(()=>{}); showMildWarning(); }
    }
  }
  postBtn.disabled = true; postBtnText.textContent = "Posting..."; postSpinner.style.display = "inline-block";
  const formData = new FormData(); formData.append("text", text);
  for (let i = 0; i < files.length; i++) formData.append("media", files[i]);
  try {
    const res = await fetch(`${baseUrl}/api/posts`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
    if (!res.ok) throw new Error("Post failed");
    postInput.value = ""; postMedia.value = ""; mediaPreview.innerHTML = ""; closeCreatePost();
    page = 1; loadedPosts.clear(); hasMore = true; suggestedInjected = false; feedBox.innerHTML = "";
    const newPost = await res.json();
    window.location.href = `/post-success.html?postId=${newPost._id}`;
    feedMain.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) { console.error("Create post error:", err); }
  postBtn.disabled = false; postBtnText.textContent = "Post"; postSpinner.style.display = "none";
};

// ══════════════════════════════════════════════
//  BATTLE POLL MODAL
// ══════════════════════════════════════════════
const pollModal        = document.getElementById("pollModal");
const pollModalOverlay = document.getElementById("pollModalOverlay");
const cancelPoll       = document.getElementById("cancelPoll");
const openBattlePoll   = document.getElementById("openBattlePoll");
const pollSubmitBtn    = document.getElementById("pollSubmitBtn");
const pollBtnText      = document.getElementById("pollBtnText");
const pollSpinner      = document.getElementById("pollSpinner");
const pollAddOption    = document.getElementById("pollAddOption");
const pollOptionsEl    = document.getElementById("pollOptions");
const pollTitle        = document.getElementById("pollTitle");

function openPollModal()  { plusDropdown.classList.remove("open"); pollModal.classList.add("open"); pollModalOverlay.classList.add("active"); document.body.style.overflow = "hidden"; }
function closePollModal() { pollModal.classList.remove("open"); pollModalOverlay.classList.remove("active"); document.body.style.overflow = ""; pollTitle.value = ""; pollOptionsEl.innerHTML = ""; addPollOptionRow(0); addPollOptionRow(1); }

openBattlePoll.addEventListener("click", openPollModal);
cancelPoll.addEventListener("click", closePollModal);
pollModalOverlay.addEventListener("click", e => { if (e.target === pollModalOverlay) closePollModal(); });

function addPollOptionRow(index) {
  const label = OPTION_LABELS[index] || String(index + 1);
  const row   = document.createElement("div"); row.className = "poll-option-row"; row.dataset.index = index;
  row.innerHTML = `
    <div class="poll-option-label">${label}</div>
    <input type="text" class="poll-option-input" placeholder="Option ${label}" maxlength="100" />
    <label class="poll-img-btn" title="Add image (optional)">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
      <input type="file" class="poll-option-img" accept="image/*" hidden />
    </label>
    <div class="poll-option-preview"></div>
  `;
  const imgInput   = row.querySelector(".poll-option-img");
  const previewDiv = row.querySelector(".poll-option-preview");
  imgInput.addEventListener("change", function () {
    if (!this.files[0]) return;
    if (!this.files[0].type.startsWith("image/")) { showToast("Only images allowed"); this.value = ""; return; }
    const img = document.createElement("img"); img.src = URL.createObjectURL(this.files[0]);
    previewDiv.innerHTML = ""; previewDiv.appendChild(img); previewDiv.classList.add("has-img");
  });
  pollOptionsEl.appendChild(row);
}
addPollOptionRow(0); addPollOptionRow(1);

pollAddOption.addEventListener("click", () => {
  const count = pollOptionsEl.querySelectorAll(".poll-option-row").length;
  if (count >= 4) { showToast("Maximum 4 options allowed"); return; }
  addPollOptionRow(count);
});

pollSubmitBtn.onclick = async () => {
  const title = pollTitle.value.trim(); if (!title) { showToast("Please add a question"); return; }
  const modResult = scanContent(title);
  if (!modResult.clean) { if (modResult.severity === "severe") { showModerationWarning(modResult.reasons); return; } if (modResult.severity === "mild") showMildWarning(); }
  const rows = pollOptionsEl.querySelectorAll(".poll-option-row");
  const options = []; let violation = false;
  rows.forEach(row => {
    const text = row.querySelector(".poll-option-input").value.trim();
    const file = row.querySelector(".poll-option-img").files[0];
    if (file && !file.type.startsWith("image/")) { showToast("Only images allowed for poll options"); violation = true; return; }
    if (text) { const m = scanContent(text); if (!m.clean && m.severity === "severe") { showModerationWarning(m.reasons); violation = true; return; } }
    if (text) options.push({ text, file });
  });
  if (violation) return;
  if (options.length < 2) { showToast("Add at least 2 options with text"); return; }
  pollSubmitBtn.disabled = true; pollBtnText.textContent = "Posting..."; pollSpinner.style.display = "inline-block";
  try {
    const formData = new FormData(); formData.append("question", title);
    options.forEach((opt, i) => { formData.append(`options[${i}][text]`, opt.text); if (opt.file) formData.append(`options[${i}][image]`, opt.file); });
    const res = await fetch(`${baseUrl}/api/polls`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
    if (!res.ok) throw new Error("Poll failed");
    closePollModal(); page = 1; loadedPosts.clear(); hasMore = true; suggestedInjected = false; feedBox.innerHTML = "";
    await loadFeed(); feedMain.scrollTo({ top: 0, behavior: "smooth" }); showToast("⚔️ Battle Poll posted!");
  } catch (err) { console.error("Poll error:", err); showToast("Failed to post. Try again."); }
  pollSubmitBtn.disabled = false; pollBtnText.textContent = "Post"; pollSpinner.style.display = "none";
};

// ══════════════════════════════════════════════
//  VOTE MODAL
// ══════════════════════════════════════════════
const voteModal        = document.getElementById("voteModal");
const voteModalOverlay = document.getElementById("voteModalOverlay");
const cancelVote       = document.getElementById("cancelVote");
const voteQuestion     = document.getElementById("voteQuestion");
const voteOptionsEl    = document.getElementById("voteOptions");
const voteThanks       = document.getElementById("voteThanks");
const voteTotalCount   = document.getElementById("voteTotalCount");
let activePollId = null; let activePollEl = null; let selectedOptId = null;

function openVoteModal(poll, pollEl) {
  activePollId = poll._id; activePollEl = pollEl; selectedOptId = null;
  voteQuestion.textContent = poll.question;
  voteThanks.style.display = "none"; voteOptionsEl.style.display = "flex"; voteOptionsEl.innerHTML = "";
  (poll.options || []).forEach((opt, i) => {
    const label = OPTION_LABELS[i] || String(i + 1);
    const optText = (opt.text || "Option " + label).trim();
    const hasImg  = opt.image && opt.image.trim() !== "";
    const btn = document.createElement("button"); btn.className = "vote-option-btn"; btn.dataset.optId = opt._id || i;
    btn.innerHTML = `${hasImg ? `<img src="${getMediaUrl(opt.image)}" alt="${optText}" />` : `<div class="vote-option-label-badge">${label}</div>`}<span>${optText}</span>`;
    btn.addEventListener("click", () => {
      voteOptionsEl.querySelectorAll(".vote-option-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected"); selectedOptId = opt._id || i;
    });
    voteOptionsEl.appendChild(btn);
  });
  const submitBtn = document.createElement("button"); submitBtn.className = "vote-submit-btn"; submitBtn.textContent = "Submit Vote"; submitBtn.onclick = submitVote;
  voteOptionsEl.appendChild(submitBtn);
  voteModal.classList.add("open"); voteModalOverlay.classList.add("active"); document.body.style.overflow = "hidden";
}

function closeVoteModal() { voteModal.classList.remove("open"); voteModalOverlay.classList.remove("active"); document.body.style.overflow = ""; }
cancelVote.addEventListener("click", closeVoteModal);
voteModalOverlay.addEventListener("click", e => { if (e.target === voteModalOverlay) closeVoteModal(); });

async function submitVote() {
  if (!selectedOptId) { showToast("Pick an option first!"); return; }
  try {
    const res  = await fetch(`${baseUrl}/api/polls/${activePollId}/vote`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ optionId: selectedOptId }) });
    const data = await res.json();
    voteOptionsEl.style.display = "none"; voteThanks.style.display = "block";
    const total = (data.poll?.options || []).reduce((s, o) => s + (o.votes || 0), 0);
    voteTotalCount.textContent = `Total votes: ${total}`;
    if (activePollEl && data.poll) updatePollCardBars(activePollEl, data.poll);
    setTimeout(closeVoteModal, 2200);
  } catch { showToast("Failed to vote. Try again."); }
}

function updatePollCardBars(pollEl, updatedPoll) {
  const options    = updatedPoll.options || [];
  const totalVotes = options.reduce((s, o) => s + (o.votes || 0), 0);
  const maxPct     = totalVotes > 0 ? Math.round((Math.max(...options.map(o => o.votes || 0)) / totalVotes) * 100) : 0;
  pollEl.querySelectorAll(".poll-option-card").forEach((card, i) => {
    const opt = options[i]; if (!opt) return;
    const votes = opt.votes || 0; const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
    const bar = card.querySelector(".poll-vote-bar"); const vEl = card.querySelector(".poll-option-votes");
    if (bar) { bar.style.width = pct + "%"; bar.className = `poll-vote-bar ${getBarClass(pct, maxPct)}`; }
    if (vEl) vEl.textContent = `${votes} votes · ${pct}%`;
  });
  const totalEl = pollEl.querySelector(".poll-votes-total"); if (totalEl) totalEl.textContent = `⚡ ${totalVotes} votes`;
}

// ══════════════════════════════════════════════
//  RESPOND MODAL
// ══════════════════════════════════════════════
const respondModal        = document.getElementById("respondModal");
const respondModalOverlay = document.getElementById("respondModalOverlay");
const cancelRespond       = document.getElementById("cancelRespond");
const submitRespond       = document.getElementById("submitRespond");
const respondInput        = document.getElementById("respondInput");
const respondPollTitle    = document.getElementById("respondPollTitle");
const respondMediaBtn     = document.getElementById("respondMediaBtn");
const respondMedia        = document.getElementById("respondMedia");
let activeRespondPollId = null;

function openRespondModal(poll) {
  activeRespondPollId = poll._id; respondPollTitle.textContent = poll.question; respondInput.value = "";
  respondModal.classList.add("open"); respondModalOverlay.classList.add("active"); document.body.style.overflow = "hidden";
}
function closeRespondModal() { respondModal.classList.remove("open"); respondModalOverlay.classList.remove("active"); document.body.style.overflow = ""; }

cancelRespond.addEventListener("click", closeRespondModal);
respondModalOverlay.addEventListener("click", e => { if (e.target === respondModalOverlay) closeRespondModal(); });
respondMediaBtn.addEventListener("click", () => respondMedia.click());

submitRespond.onclick = async () => {
  const text = respondInput.value.trim(); if (!text) { showToast("Write a response first"); return; }
  const modResult = scanContent(text);
  if (!modResult.clean) {
    if (modResult.severity === "severe") { showModerationWarning(modResult.reasons); return; }
    if (modResult.severity === "mild") showMildWarning();
  }
  try {
    const formData = new FormData(); formData.append("text", text);
    const file = respondMedia.files[0]; if (file) formData.append("media", file);
    await fetch(`${baseUrl}/api/polls/${activeRespondPollId}/respond`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
    closeRespondModal(); showToast("Response posted!");
  } catch (err) { console.error("Respond error:", err); showToast("Failed to respond. Try again."); }
};

// ══════════════════════════════════════════════
//  POLL CARD RENDER
// ══════════════════════════════════════════════
const pollDataStore = {};

function renderPollCard(item) {
  pollDataStore[item._id] = item;
  const user       = item.user || {};
  const options    = item.options || [];
  const totalVotes = options.reduce((s, o) => s + (o.votes || 0), 0);
  const maxVotes   = Math.max(...options.map(o => o.votes || 0), 0);
  const maxPct     = totalVotes > 0 ? Math.round((maxVotes / totalVotes) * 100) : 0;

  const optionsGrid = options.map((opt, i) => {
    const votes    = opt.votes || 0;
    const pct      = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
    const label    = OPTION_LABELS[i] || String(i + 1);
    const optText  = (opt.text || "Option " + label).trim();
    const hasImage = opt.image && opt.image.trim() !== "";
    const topSection = hasImage
      ? `<div class="poll-option-img-wrap"><img src="${getMediaUrl(opt.image)}" alt="${optText}" /></div>`
      : `<div class="poll-option-no-img"><span class="poll-option-emoji">${["🎵","🎤","🎶","🎸"][i] || "⚡"}</span></div>`;
    return `
      <div class="poll-option-card" data-opt-id="${opt._id || i}">
        ${topSection}
        <div class="poll-option-info">
          <div class="poll-option-name"><span class="poll-option-badge">${label}</span>${optText}</div>
          <div class="poll-option-votes" data-poll-id="${item._id}" data-opt-id="${opt._id || i}" data-opt-text="${optText}">${votes} votes · ${pct}%</div>
          <div class="poll-vote-bar-wrap"><div class="poll-vote-bar ${getBarClass(pct, maxPct)}" style="width:${pct}%"></div></div>
        </div>
      </div>`;
  }).join("");

  const div = document.createElement("div");
  div.className = "poll-card"; div.dataset.pollId = item._id;
  div.innerHTML = `
    <div class="poll-card-header">
      <a href="/profile.html?userId=${user._id}">
        <img src="${user.profilePicture || '/uploads/images/africa.png'}" onerror="this.src='/uploads/images/africa.png'" />
      </a>
      <div class="poll-card-header-info">
        <strong>${user.fullName || "Unknown"} ${user.isVerified ? verifiedBadge() : ""} ${getFlagEmoji(user.country)}</strong>
        <span>created a battle poll · ${timeAgo(item.createdAt)} ago</span>
      </div>
      <button class="post-three-dot poll-dot-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
          <circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/>
        </svg>
      </button>
    </div>
    <p class="poll-question">${item.question}</p>
    <div class="poll-options-grid">${optionsGrid}</div>
    <div class="poll-totals">
      <span class="poll-votes-total">⚡ ${totalVotes} votes</span>
      <span class="poll-responds-count" data-poll-id="${item._id}">💬 ${item.respondCount || 0} responds</span>
    </div>
    <div class="poll-actions">
      <button class="poll-action-btn poll-react-btn" data-poll-id="${item._id}">❤️ React</button>
      <button class="poll-action-btn vote-btn poll-vote-btn">⚔️ Cast your Vote</button>
      <button class="poll-action-btn poll-respond-btn">💬 Respond</button>
    </div>
  `;

  // Three dot
  div.querySelector(".poll-dot-btn").addEventListener("click", e => {
    e.stopPropagation();
    document.querySelectorAll(".feed-tdm").forEach(m => m.remove());
    const menu = document.createElement("div"); menu.className = "feed-tdm";
    menu.innerHTML = `<button class="feed-tdi danger">⚠️ Report Poll</button>`;
    const rect = e.currentTarget.getBoundingClientRect();
    menu.style.top  = (rect.bottom + window.scrollY + 6) + "px";
    menu.style.left = Math.min(rect.left, window.innerWidth - 210) + "px";
    document.body.appendChild(menu);
    menu.querySelector(".danger").addEventListener("click", () => { menu.remove(); showReportModal(item._id, "poll"); });
    setTimeout(() => { document.addEventListener("click", () => menu.remove(), { once: true }); }, 0);
  });

  // Voters click
  div.querySelectorAll(".poll-option-votes").forEach(el => {
    el.addEventListener("click", e => { e.stopPropagation(); showVotersModal(el.dataset.pollId, el.dataset.optId, el.dataset.optText); });
  });

  // Responds click
  div.querySelector(".poll-responds-count").addEventListener("click", e => { e.stopPropagation(); showResponsesModal(item._id); });

  // React
  div.querySelector(".poll-react-btn").addEventListener("click", e => {
    e.stopPropagation();
    document.querySelectorAll(".react-popup,.react-overlay").forEach(m => m.remove());
    const overlay = document.createElement("div"); overlay.className = "react-overlay";
    const popup   = document.createElement("div"); popup.className = "react-popup";
    popup.innerHTML = `<div class="emoji-grid">${["😂","😍","😡","😭","👍","👎","🤏","👏","🫶","❤️","🩵","💜","🤔","😥","🤝","🔥","☠️","🤡","😹"].map(em => `<button class="emoji-btn" data-emoji="${em}" data-poll="${item._id}">${em}</button>`).join("")}</div>`;
    const rect = e.currentTarget.getBoundingClientRect();
    popup.style.bottom = (window.innerHeight - rect.top + 8) + "px";
    popup.style.left   = Math.max(8, Math.min(rect.left, window.innerWidth - 290)) + "px";
    document.body.appendChild(overlay); document.body.appendChild(popup);
    overlay.addEventListener("click", () => { overlay.remove(); popup.remove(); });
    popup.querySelectorAll(".emoji-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const emoji = btn.dataset.emoji; const pollId = btn.dataset.poll;
        overlay.remove(); popup.remove();
        burstAndSplitEmoji(emoji, pollId); playEmojiSound(emoji);
        const key = `reaction_${pollId}`; const counts = JSON.parse(localStorage.getItem(key) || "{}");
        counts[emoji] = (counts[emoji] || 0) + 1; localStorage.setItem(key, JSON.stringify(counts));
        fetch(`${baseUrl}/api/polls/${pollId}/react`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ emoji }) }).catch(() => {});
      });
    });
  });

  div.querySelector(".poll-vote-btn").addEventListener("click", () => openVoteModal(item, div));
  div.querySelector(".poll-respond-btn").addEventListener("click", () => openRespondModal(item));

  feedBox.appendChild(div);
}

// Voters modal
async function showVotersModal(pollId, optId, optText) {
  const modal = document.createElement("div"); modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:flex-end;justify-content:center;z-index:9999;`;
  const sheet = document.createElement("div"); sheet.style.cssText = `background:white;border-radius:20px;padding:24px;width:100%;max-width:500px;max-height:70vh;display:flex;flex-direction:column;animation:slideUp 0.35s ease;overflow-y:auto;`;
  sheet.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><h3 style="font-size:17px;font-weight:700;color:#111827;margin:0;">Voted for: ${optText}</h3><button id="cVM" style="background:none;border:none;font-size:22px;cursor:pointer;color:#6B7280;">&times;</button></div><div id="votersList"><p style="color:#9CA3AF;font-size:14px;">Loading...</p></div>`;
  modal.appendChild(sheet); document.body.appendChild(modal);
  sheet.querySelector("#cVM").addEventListener("click", () => document.body.removeChild(modal));
  modal.addEventListener("click", e => { if (e.target === modal) document.body.removeChild(modal); });
  try {
    const res  = await fetch(`${baseUrl}/api/polls/${pollId}/voters/${optId}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json(); const list = sheet.querySelector("#votersList"); list.innerHTML = "";
    if (!data.voters?.length) { list.innerHTML = `<p style="color:#9CA3AF;font-size:14px;">No votes yet</p>`; return; }
    data.voters.forEach(user => {
      const d = document.createElement("div"); d.style.cssText = `display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #F3F4F6;cursor:pointer;`;
      d.innerHTML = `<img src="${user.profilePicture || '/uploads/images/africa.png'}" onerror="this.src='/uploads/images/africa.png'" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" /><div><strong style="font-size:14px;color:#111827;">${user.fullName || user.username} ${user.isVerified ? verifiedBadge() : ""}</strong><div style="font-size:12px;color:#9CA3AF;">@${user.username}</div></div>`;
      d.addEventListener("click", () => { window.location.href = `/profile.html?userId=${user._id}`; });
      list.appendChild(d);
    });
  } catch { sheet.querySelector("#votersList").innerHTML = `<p style="color:#EF4444;font-size:14px;">Failed to load voters</p>`; }
}

// Responses modal
async function showResponsesModal(pollId) {
  const poll  = pollDataStore[pollId];
  const modal = document.createElement("div"); modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:flex-end;justify-content:center;z-index:9999;`;
  const sheet = document.createElement("div"); sheet.style.cssText = `background:white;border-radius:20px;padding:24px;width:100%;max-height:75vh;display:flex;flex-direction:column;animation:slideUp 0.35s ease;overflow-y:auto;`;
  sheet.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><h3 style="font-size:17px;font-weight:700;color:#111827;margin:0;">Responses</h3><button id="cRM" style="background:none;border:none;font-size:22px;cursor:pointer;color:#6B7280;">&times;</button></div>${poll ? `<p style="font-size:13px;color:#6B7280;margin-bottom:16px;">${poll.question}</p>` : ""}<div id="responsesList"><p style="color:#9CA3AF;font-size:14px;">Loading...</p></div>`;
  modal.appendChild(sheet); document.body.appendChild(modal);
  sheet.querySelector("#cRM").addEventListener("click", () => document.body.removeChild(modal));
  modal.addEventListener("click", e => { if (e.target === modal) document.body.removeChild(modal); });
  try {
    const res  = await fetch(`${baseUrl}/api/polls/${pollId}/responses`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json(); const list = sheet.querySelector("#responsesList"); list.innerHTML = "";
    const responses = data.responses || data;
    if (!responses?.length) { list.innerHTML = `<p style="color:#9CA3AF;font-size:14px;">No responses yet</p>`; return; }
    responses.forEach(resp => {
      const user = resp.user || {}; const d = document.createElement("div"); d.style.cssText = `padding:14px 0;border-bottom:1px solid #F3F4F6;`;
      d.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><img src="${user.profilePicture || '/uploads/images/africa.png'}" onerror="this.src='/uploads/images/africa.png'" style="width:36px;height:36px;border-radius:50%;object-fit:cover;cursor:pointer;" onclick="window.location.href='/profile.html?userId=${user._id}'" /><div><strong style="font-size:13px;color:#111827;">${user.fullName || user.username} ${user.isVerified ? verifiedBadge() : ""}</strong><div style="font-size:11px;color:#9CA3AF;">@${user.username} · ${timeAgo(resp.createdAt)} ago</div></div></div><p style="font-size:14px;color:#374151;margin:0 0 0 46px;">${resp.text || ""}</p>${resp.media ? `<img src="${getMediaUrl(resp.media)}" style="width:65%;border-radius:10px;margin-top:8px;max-height:200px;object-fit:cover;" />` : ""}`;
      list.appendChild(d);
    });
  } catch { sheet.querySelector("#responsesList").innerHTML = `<p style="color:#EF4444;font-size:14px;">Failed to load responses</p>`; }
}

function burstAndSplitEmoji(emoji, pollId) {
  const poll = document.querySelector(`.poll-card[data-poll-id="${pollId}"]`); if (!poll) return;
  const rect = poll.getBoundingClientRect();
  const burst = document.createElement("span"); burst.textContent = emoji;
  burst.style.cssText = `position:fixed;left:${rect.left + rect.width / 2}px;top:${rect.top + rect.height / 2}px;font-size:48px;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);animation:dtHeartPop 0.7s ease forwards;`;
  document.body.appendChild(burst); setTimeout(() => burst.remove(), 800);
}

let audioCtx;
function playEmojiSound(type) {
  try {
    if (!audioCtx || audioCtx.state === "closed") audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    gain.gain.value = 0.2; osc.type = "triangle";
    osc.frequency.setValueAtTime(type === "❤️" ? 500 : type === "🔥" ? 80 : 400, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.start(); osc.stop(audioCtx.currentTime + 0.3);
  } catch {}
}

// ================== FEED STATE ==================
const feedBox    = document.getElementById("feed");
const feedLoader = document.getElementById("feedLoader");
const feedMain   = document.querySelector(".feed-main");

let page = 1; let loading = false; let hasMore = true; let suggestedInjected = false;
const loadedPosts = new Set(); const viewedVideos = new Set();

// ================== SUGGESTED ACCOUNTS ==================
async function buildSuggestedSection() {
  const section = document.createElement("div"); section.className = "suggested-section";
  section.innerHTML = `<div class="suggested-section-header"><h3>Suggested Accounts</h3><a href="/connect.html">See all</a></div><div class="suggested-scroll" id="suggestedScroll">${[1,2,3].map(() => `<div class="suggested-card"><div class="suggested-card-bg"><img src="/uploads/images/africa.png" /></div><div class="suggested-card-info"><strong>Loading...</strong><span>Suggested</span><div class="suggested-card-btns"><button class="btn-follow-card">Follow</button><button class="btn-ignore-card">Ignore</button></div></div></div>`).join("")}</div>`;
  feedBox.appendChild(section);
  try {
    const res  = await fetch(`${baseUrl}/api/users/suggested`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json(); const scroll = document.getElementById("suggestedScroll"); if (!scroll) return; scroll.innerHTML = "";
    data.users.slice(0, 15).forEach(user => {
      const card = document.createElement("div"); card.className = "suggested-card";
      card.innerHTML = `<div class="suggested-card-bg"><a href="/profile.html?userId=${user._id}"><img src="${user.profilePicture || '/uploads/images/africa.png'}" onerror="this.src='/uploads/images/africa.png'" /></a></div><div class="suggested-card-info"><strong>${user.fullName} ${user.isVerified ? verifiedBadge() : ""}</strong><span>@${user.username} ${getFlagEmoji(user.country)}</span><div class="suggested-card-btns"><button class="btn-follow-card" data-userid="${user._id}">Follow</button><button class="btn-ignore-card">Ignore</button></div></div>`;
      card.querySelector(".btn-follow-card").addEventListener("click", async function () {
        const uid = this.dataset.userid; const action = this.textContent.trim() === "Follow" ? "follow" : "unfollow";
        await fetch(`${baseUrl}/api/users/${action}/${uid}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        this.textContent = action === "follow" ? "Following" : "Follow"; if (action === "follow") card.remove();
      });
      card.querySelector(".btn-ignore-card").addEventListener("click", () => card.remove());
      scroll.appendChild(card);
    });
  } catch (err) { console.error("Suggested error:", err); }
}

// ================== LOAD FEED ==================
async function loadFeed() {
  if (!hasMore) return;
  feedLoader.classList.add("active"); loading = true;
  try {
    const res  = await fetch(`${baseUrl}/api/posts/feed?page=${page}&limit=10`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Failed to fetch feed");
    const data = await res.json(); hasMore = data.hasMore;

    (data.posts || []).filter(p => !loadedPosts.has(p._id)).forEach(item => {
      loadedPosts.add(item._id);
      if (loadedPosts.size % 8 === 0) buildVybzeSection();
      if (!suggestedInjected && loadedPosts.size === 5) { suggestedInjected = true; buildSuggestedSection(); }
      if (item.type === "poll" || item.question) { renderPollCard(item); return; }

      const user            = item.user || {};
      const hasText         = !!(item.text && item.text.trim() !== "");
      const hasMedia        = (item.images?.length > 0) || !!item.video;
      const isTextOnly      = hasText && !hasMedia;
      const wordCount       = hasText ? item.text.trim().split(/\s+/).length : 0;
      const sponsoredActive = isSponsoredActive(item);
      const isLiked         = (item.likes  || []).includes(currentUserId);
      const isStarred       = (item.stars  || []).includes(currentUserId);
      const location        = [user.city, user.country].filter(Boolean).join(", ");
      const isOwn           = user._id === currentUserId;

      let textClass = "text-body";
      if (isTextOnly) { textClass = wordCount <= 25 ? "text-body text-only-bold" : "text-body text-only-long"; }

      let mediaHtml = "";
      if (item.images?.length > 0) {
        mediaHtml += `<div class="image-slider-wrapper"><div class="image-slider">${item.images.map(img => `<img src="${getMediaUrl(img)}" class="post-media slide" onerror="this.src='/uploads/images/africa.png'" />`).join("")}</div></div>`;
      }
      if (item.video) {
        mediaHtml += `<div class="video-wrapper"><video class="post-media video" src="${getMediaUrl(item.video)}" muted playsinline></video><span class="play-btn"><div class="video-play-overlay">
      <svg
        width="42"
        height="42"
        viewBox="0 0 24 24"
        fill="white"
      >
        <path d="M8 5v14l11-7z"/>
      </svg>
    </div></span><button class="mute-btn">🔇</button></div>`;
      }

      const div = document.createElement("div"); 
      div.className =
       item.isBirthdayPost
        ? "post birthday-post"
       : "post"; 
      div.dataset.postId = item._id;
       div.innerHTML = `
       
        ${item.isBirthdayPost ? `
        <div class="birthday-confetti"></div>
         ` : ""}

        <div class="post-header">
          <a href="/profile.html?userId=${user._id}">
            <img src="${user.profilePicture || '/uploads/images/africa.png'}" onerror="this.src='/uploads/images/africa.png'" />
          </a>
          <div class="post-header-info">
            <a href="/profile.html?userId=${user._id}" style="text-decoration:none;color:inherit;">
              <strong>${user.fullName || "Unknown"} ${user.isVerified ? verifiedBadge() : ""} ${getFlagEmoji(user.country)}</strong>
            </a>
            <span class="post-location">
            ${sponsoredActive ? `
            <span class="header-sponsored-label">
            Sponsored
            </span>
             ` : ""}
              ${location
                ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg> ${location}`
                : `<small style="color:#9CA3AF;">Posted ${timeAgo(item.createdAt)} ago</small>`}
            </span>
          </div>
          <button class="post-three-dot">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#9CA3AF">
              <circle cx="12" cy="5" r="1.8"/>
              <circle cx="12" cy="12" r="1.8"/>
              <circle cx="12" cy="19" r="1.8"/>
            </svg>
          </button>
        </div>

        ${item.isBirthdayPost ? `
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

        ${hasText ? `<p class="${textClass}">${renderPostText(item.text, item.mentions || [])}</p>` : ""}
        
        ${item.isBirthdayPost ? `
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

        ${sponsoredActive ? `
  <div class="feed-sponsored-bar">

    <div class="feed-sponsored-left">

      <span class="feed-sponsored-tag">
        ${item.sponsoredLabel || "Sponsored"}
      </span>

      ${item.sponsorName ? `
        <span class="feed-sponsored-name">
          ${item.sponsorName}
        </span>
      ` : ""}

    </div>

    ${
      item.redirectUrl
      ? `
        <button
          class="feed-sponsored-cta sponsored-cta-btn"
          data-post-id="${item._id}"
          data-url="${item.redirectUrl}"
        >
          ${item.ctaText || "Learn More"}
        </button>
      `
      : ""
    }

  </div>
` : ""}

        <div class="post-actions">
          <button class="action-btn love-btn ${isLiked ? "liked" : ""}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span class="count">${(item.likes || []).length}</span>
          </button>

          <button class="action-btn comment-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span class="count">${item.commentCount || 0}</span>
          </button>

          <button class="action-btn star-btn ${isStarred ? "starred" : ""}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span class="count">${(item.stars || []).length}</span>
          </button>

          <button class="action-btn share-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>

          ${item.video ? `<span class="view-count">👁 ${item.views || 0}</span>` : ""}

          ${!isOwn ? `
         <button 
        class="action-btn gift-btn" 
        data-post-user-id="${user._id}" 
        data-post-user-name="${user.fullName || user.username}"
        data-post-id="${item._id}"
        >
       <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"/>
      <rect x="2" y="7" width="20" height="5"/>
      <path d="M12 22V7"/>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
      </svg>

     <span class="action-label">Gift</span>
     </button>
     ` : ""}
        </div>
      `;

      feedBox.appendChild(div);

      // Three dot
      div.querySelector(".post-three-dot").addEventListener("click", e => {
        e.stopPropagation();
        document.querySelectorAll(".feed-tdm").forEach(m => m.remove());
        const menu = document.createElement("div"); menu.className = "feed-tdm";
        menu.innerHTML = `
          ${!isOwn ? `<button class="feed-tdi danger report-btn">⚠️ Report Post</button>` : ""}
          <button class="feed-tdi share-btn-menu">🔗 Share Post</button>
          ${isOwn ? `<button class="feed-tdi danger delete-btn">🗑️ Delete Post</button>` : ""}
        `;
        const rect = e.currentTarget.getBoundingClientRect();
        menu.style.top  = (rect.bottom + window.scrollY + 6) + "px";
        menu.style.left = Math.min(rect.left, window.innerWidth - 210) + "px";
        document.body.appendChild(menu);

        menu.querySelector(".report-btn")?.addEventListener("click", () => {
          menu.remove(); showReportModal(item._id, "post");
        });
        menu.querySelector(".share-btn-menu")?.addEventListener("click", async () => {
          menu.remove();
          const url = `${window.location.origin}/p/${item._id}`;
          try { if (navigator.share) await navigator.share({ title: "Afrisocial", url }); else { await navigator.clipboard.writeText(url); showToast("🔗 Link copied!"); } } catch {}
        });
        menu.querySelector(".delete-btn")?.addEventListener("click", async () => {
          menu.remove();
          if (!confirm("Delete this post?")) return;
          try { await fetch(`${baseUrl}/api/posts/${item._id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); div.remove(); showToast("Post deleted."); } catch { showToast("Failed to delete."); }
        });
        setTimeout(() => { document.addEventListener("click", () => menu.remove(), { once: true }); }, 0);
      });

      // Sponsored impression
      if (sponsoredActive) {
        const obs = new IntersectionObserver(entries => {
          entries.forEach(async entry => {
            if (entry.isIntersecting) {
              try { await fetch(`${baseUrl}/api/posts/${item._id}/impression`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }); } catch {}
              obs.unobserve(div);
            }
          });
        }, { threshold: 0.5 });
        obs.observe(div);
      }
    });

    initImageSliders(); initVideoControls();
  } catch (err) { console.error("Load feed error:", err); }
  feedLoader.classList.remove("active"); loading = false;
}

loadFeed();

// ================== SPONSORED CTA ==================
document.addEventListener("click", async e => {
  const btn = e.target.closest(".sponsored-cta-btn"); if (!btn) return;
  try { await fetch(`${baseUrl}/api/posts/${btn.dataset.postId}/click`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }); } catch {}
  window.open(btn.dataset.url, "_blank");
});

// ================== POST INTERACTIONS ==================
let activeSharePost = null;
const shareModal      = document.getElementById("shareModal");
const closeShareModal = document.getElementById("closeShareModal");
closeShareModal.onclick = () => { shareModal.style.display = "none"; };

document.addEventListener("click", async e => {
  const post = e.target.closest(".post"); if (!post) return;
  const postId = post.dataset.postId;

  if (e.target.closest(".love-btn")) {
    const btn = e.target.closest(".love-btn");
    try {
      const res  = await fetch(`${baseUrl}/api/posts/${postId}/like`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      btn.querySelector(".count").textContent = data.likes.length;
      btn.classList.toggle("liked", data.liked); btn.classList.add("pop"); setTimeout(() => btn.classList.remove("pop"), 300);
    } catch {}
  }

  if (e.target.closest(".star-btn")) {
    const btn = e.target.closest(".star-btn");
    try {
      const res  = await fetch(`${baseUrl}/api/posts/${postId}/star`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      btn.querySelector(".count").textContent = (data.stars || []).length;
      btn.classList.toggle("starred", data.starred); btn.classList.add("pop"); setTimeout(() => btn.classList.remove("pop"), 300);
    } catch {}
  }

  if (e.target.closest(".comment-btn")) openCommentModal(postId, post);

  if (e.target.closest(".share-btn") && !e.target.closest(".feed-tdm")) {
    const url = `${window.location.origin}/p/${postId}`;
    try {
      if (navigator.share) await navigator.share({ title: "Check this out on Afrisocial", url });
      else { activeSharePost = postId; shareModal.style.display = "flex"; }
    } catch (err) { if (err.name !== "AbortError") { activeSharePost = postId; shareModal.style.display = "flex"; } }
  }

  if (e.target.closest(".gift-btn")) {
    const btn = e.target.closest(".gift-btn");
    openFeedGiftModal(btn.dataset.postUserId, btn.dataset.postUserName, btn.dataset.postId);
  }
});

document.getElementById("shareWhatsapp").onclick = () => { const url = `${window.location.origin}/view-post.html?postId=${activeSharePost}`; window.open(`https://wa.me/?text=${encodeURIComponent("See post on Afrisocial: " + url)}`, "_blank"); shareModal.style.display = "none"; };
document.getElementById("shareFacebook").onclick = () => { const url = `${window.location.origin}/view-post.html?postId=${activeSharePost}`; window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank"); shareModal.style.display = "none"; };
document.getElementById("shareCopy").onclick    = async () => { const url = `${window.location.origin}/view-post.html?postId=${activeSharePost}`; await navigator.clipboard.writeText(url); shareModal.style.display = "none"; showToast("Link copied!"); };
document.getElementById("shareMessage").onclick = () => { shareModal.style.display = "none"; };

// ================== IMAGE SLIDER ==================
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

// ================== VIDEO CONTROLS ==================
function initVideoControls() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target; const postEl = video.closest(".post"); if (!postEl) return;
      const postId = postEl.dataset.postId; const vcEl = postEl.querySelector(".view-count");
      if (entry.isIntersecting) {
        video.play().catch(() => {});
        if (!viewedVideos.has(postId)) {
          video._viewTimer = setTimeout(async () => { viewedVideos.add(postId); const v = await sendVideoView(postId); if (vcEl && v) vcEl.textContent = `👁 ${v}`; }, 2000);
        }
      } else { video.pause(); video.currentTime = 0; clearTimeout(video._viewTimer); }
    });
  }, { threshold: 0.25 });

  document.querySelectorAll(".video-wrapper").forEach(wrapper => {
    if (wrapper.dataset.init) return; wrapper.dataset.init = "1";
    const video = wrapper.querySelector("video"); const muteBtn = wrapper.querySelector(".mute-btn");
    video.removeAttribute("autoplay"); video.muted = true;
    video.addEventListener("click", () => { video.paused ? video.play() : video.pause(); });
    muteBtn.addEventListener("click", e => { e.stopPropagation(); video.muted = !video.muted; muteBtn.textContent = video.muted ? "🔇" : "🔊"; });
    observer.observe(video);
  });
}

async function sendVideoView(postId) {
  try { const res = await fetch(`${baseUrl}/api/posts/${postId}/view`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }); const data = await res.json(); return data.views; } catch { return null; }
}

// ================== COMMENT MODAL ==================
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
    <img
      src="${comment.user.profilePicture || '/uploads/images/africa.png'}"
      onerror="this.src='/uploads/images/africa.png'"
    />
  </a>

  <div class="comment-user-meta">

    <strong>
      ${comment.user.fullName}
      ${comment.user.isVerified ? verifiedBadge() : ""}
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
    ${timeAgo(comment.createdAt)} ago
  </small>

</div>

<div class="replies"></div>

`;

commentList.appendChild(div);
}

async function loadComments(postId) {
  try {
    const res      = await fetch(`${baseUrl}/api/comments/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
    const comments = await res.json();
    commentList.innerHTML = "";
    comments.filter(c => !c.parentComment).forEach(c => renderComment(c));
    comments.filter(c =>  c.parentComment).forEach(reply => {
      const parentEl = commentList.querySelector(`[data-id="${reply.parentComment}"]`); if (!parentEl) return;
      const rd = document.createElement("div"); rd.className = "reply"; rd.dataset.id = reply._id;
      rd.innerHTML = `<div class="reply-user"><img src="${reply.user.profilePicture || '/uploads/images/africa.png'}" onerror="this.src='/uploads/images/africa.png'" /><strong>${reply.user.fullName}</strong></div><div class="reply-area"><p class="reply-text">${renderPostText(reply.text, reply.mentions || [])}</p><small>${timeAgo(reply.createdAt)} ago</small></div>`;
      parentEl.querySelector(".replies").appendChild(rd);
    });
  } catch (err) { console.error("Load comments error:", err); }
}

sendCommentBtn.onclick = async () => {
  const text = commentInput.value.trim(); if (!text) return;
  const modResult = scanContent(text);
  if (!modResult.clean) {
    if (modResult.severity === "severe") { showModerationWarning(modResult.reasons); fetch(`${baseUrl}/api/moderation/flag`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({content:text,contentType:"comment",reasons:modResult.reasons,severity:modResult.severity,action:"blocked_at_submission"})}).catch(()=>{}); return; }
    if (modResult.severity === "mild")   { fetch(`${baseUrl}/api/moderation/flag`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({content:text,contentType:"comment",reasons:modResult.reasons,severity:modResult.severity,action:"flagged_for_review"})}).catch(()=>{}); showMildWarning(); }
  }
  try {
    const res     = await fetch(`${baseUrl}/api/comments/${activePostId}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ text }) });
    const comment = await res.json(); renderComment(comment); commentInput.value = "";
    if (activeCommentBtn) { const c = activeCommentBtn.querySelector(".count"); if (c) c.textContent = parseInt(c.textContent) + 1; }
  } catch (err) { console.error(err); }
};

document.addEventListener("click", async e => {
  if (e.target.closest(".comment-like")) {
    const likeBtn = e.target.closest(".comment-like"); const commentEl = likeBtn.closest(".comment");
    try { const res = await fetch(`${baseUrl}/api/comments/like/${commentEl.dataset.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }); const data = await res.json(); likeBtn.querySelector(".like-count").textContent = data.likes.length; likeBtn.classList.toggle("liked", data.liked); } catch {}
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
    try {
      const res   = await fetch(`${baseUrl}/api/comments/reply/${commentEl.dataset.id}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ text }) });
      const reply = await res.json();
      const rd = document.createElement("div"); rd.className = "reply";
      rd.innerHTML = `<div class="reply-user"><img src="${reply.user.profilePicture || '/uploads/images/africa.png'}" onerror="this.src='/uploads/images/africa.png'" /><strong>${reply.user.fullName}</strong></div><p class="reply-text">${reply.text}</p>`;
      commentEl.querySelector(".replies").appendChild(rd); replyBox.remove();
    } catch {}
  }
});

// ================== BIRTHDAY QUICK GIFTS ==================

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

// ================== BIRTHDAY REAL GIFT ==================

document.addEventListener("click", e => {

  const btn = e.target.closest(".birthday-real-gift-btn");

  if (!btn) return;

  const postEl = btn.closest(".post");

  const postId = postEl.dataset.postId;

  const recipientId = btn.dataset.birthdayUser;

  const recipientName = btn.dataset.birthdayName;

  openFeedGiftModal(
    recipientId,
    recipientName,
    postId
  );

});

// ================== NOTIFICATION BADGE ==================
const notificationBtn   = document.getElementById("notificationBtn");
const notificationBadge = document.getElementById("notificationBadge");
async function loadNotificationBadge() {
  try { const res = await fetch(`${baseUrl}/api/notifications/unread-count`, { headers: { Authorization: `Bearer ${token}` } }); const data = await res.json(); if (data.count > 0) notificationBadge.classList.add("show"); else notificationBadge.classList.remove("show"); } catch {}
}
notificationBtn.addEventListener("click", () => { window.location.href = "/notification.html"; });
loadNotificationBadge();

// ================== MESSAGE BADGE ==================
async function loadUnreadMessages() {
  try { const res = await fetch(`${baseUrl}/api/messages/unread-count`, { headers: { Authorization: `Bearer ${token}` } }); const data = await res.json(); const badge = document.getElementById("messageBadge"); if (data.count > 0) { badge.textContent = data.count; badge.style.display = "flex"; } else badge.style.display = "none"; } catch {}
}
document.getElementById("chatNavItem").addEventListener("click", e => { e.preventDefault(); window.location.href = "/message.html"; });
loadUnreadMessages();

// ================== INSTALL PROMPT ==================
let deferredPrompt;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredPrompt = e; document.getElementById("installPopup").style.display = "block"; });
async function installApp() { if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; document.getElementById("installPopup").style.display = "none"; }
function closeInstallPopup() { document.getElementById("installPopup").style.display = "none"; }
window.addEventListener("appinstalled", async () => { try { await fetch(`${baseUrl}/api/analytics/install`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }); } catch {} });

// ================== INFINITE SCROLL ==================
// Use IntersectionObserver on a sentinel so it works whether the page
// scrolls via window (desktop 3-col layout) or via .feed-main (mobile).
(function setupInfiniteScroll() {
  const sentinel = document.createElement("div");
  sentinel.id = "feedSentinel";
  sentinel.style.cssText = "height:1px;width:100%;";
  // Append after #feed so it sits before the loader DOM but at end of content.
  feedBox.parentNode.insertBefore(sentinel, feedLoader);

  const trigger = () => {
    if (loading || !hasMore) return;
    loading = true; page++;
    loadFeed().finally(() => { loading = false; });
  };

  const io = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) trigger();
  }, { rootMargin: "800px 0px", threshold: 0 });
  io.observe(sentinel);

  // Belt-and-suspenders: also listen on window + feedMain scroll for any
  // edge cases where IntersectionObserver misfires (e.g. very tall viewport).
  const scrollCheck = () => {
    if (loading || !hasMore) return;
    const r = sentinel.getBoundingClientRect();
    if (r.top - window.innerHeight < 800) trigger();
  };
  window.addEventListener("scroll", scrollCheck, { passive: true });
  feedMain.addEventListener("scroll", scrollCheck, { passive: true });
})();

// ══════════════════════════════════════════════
//  VYBZE SECTION
// ══════════════════════════════════════════════
async function buildVybzeSection() {
  const section = document.createElement("div"); section.className = "vybze-section";
  section.innerHTML = `<div class="vybze-header"><h3>🔥 Vybze</h3><a href="/vybze.html">Watch more</a></div><div class="vybze-scroll" id="vybzeScroll">${[1,2,3].map(() => `<div class="vybze-card loading"></div>`).join("")}</div>`;
  feedBox.appendChild(section);
  try {
    const res  = await fetch(`${baseUrl}/api/vybze/feed`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json(); const scroll = section.querySelector("#vybzeScroll"); scroll.innerHTML = "";
    data.videos.slice(0, 6).forEach(vid => {
      const d = document.createElement("div"); d.className = "vybze-card";
      d.innerHTML = `<video class="feed-vybze-video" src="${getMediaUrl(vid.video)}" muted playsinline loop preload="metadata"></video><div class="vybze-info"><strong>${vid.user.username}</strong></div>`;
      d.addEventListener("click", () => { window.location.href = `vybze-player.html?videoId=${vid._id}`; });
      scroll.appendChild(d);
    });
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { const v = entry.target; if (entry.isIntersecting) { v.play().catch(() => {}); } else { v.pause(); } }); }, { threshold: 0.6 });
    scroll.querySelectorAll(".feed-vybze-video").forEach(v => observer.observe(v));
  } catch (err) { console.error("Vybze section error:", err); }
}

// ══════════════════════════════════════════════
//  STORY CREATOR
// ══════════════════════════════════════════════
const storyInput       = document.getElementById("storyInput");
const addStoryBtn      = document.getElementById("addStoryBtn");
const storiesRow       = document.getElementById("storiesRow");
const storyCreator     = document.getElementById("storyCreator");
const scClose          = document.getElementById("scClose");
const scViewport       = document.getElementById("scViewport");
const scMediaWrap      = document.getElementById("scMediaWrap");
const scPreviewImg     = document.getElementById("scPreviewImg");
const scPreviewVid     = document.getElementById("scPreviewVid");
const scZoom           = document.getElementById("scZoom");
const scNextBtn        = document.getElementById("scNextBtn");
const scBack           = document.getElementById("scBack");
const scThumbImg       = document.getElementById("scThumbImg");
const scThumbVid       = document.getElementById("scThumbVid");
const scCaption        = document.getElementById("scCaption");
const scCharCount      = document.getElementById("scCharCount");
const scCaptionOverlay = document.getElementById("scCaptionOverlay");
const scPostBtn        = document.getElementById("scPostBtn");
const scPostBtnText    = document.getElementById("scPostBtnText");
const scPostSpinner    = document.getElementById("scPostSpinner");
const step1            = document.getElementById("storyCreatorStep1");
const step2            = document.getElementById("storyCreatorStep2");

let scFile = null; let scIsVideo = false; let scScale = 1; let scOffsetX = 0; let scOffsetY = 0;
let scNatW = 0; let scNatH = 0; let scViewW = 0; let scViewH = 0;

addStoryBtn.onclick = () => storyInput.click();
storyInput.addEventListener("change", function () {
  const file = this.files[0]; if (!file) return;
  scFile = file; scIsVideo = file.type.startsWith("video/"); openStoryCreator(file); this.value = "";
});

function openStoryCreator(file) {
  scScale = 1; scOffsetX = 0; scOffsetY = 0; scZoom.value = 1; scCaption.value = ""; scCharCount.textContent = "0/200"; scCaptionOverlay.textContent = "";
  step1.classList.remove("hidden"); step2.classList.add("hidden"); storyCreator.classList.add("active"); document.body.style.overflow = "hidden";
  const objectUrl = URL.createObjectURL(file);
  if (scIsVideo) { scPreviewImg.style.display = "none"; scPreviewVid.style.display = "block"; scPreviewVid.src = objectUrl; scPreviewVid.play().catch(() => {}); scPreviewVid.onloadedmetadata = () => { scNatW = scPreviewVid.videoWidth; scNatH = scPreviewVid.videoHeight; sizeMediaToViewport(); }; }
  else { scPreviewVid.style.display = "none"; scPreviewImg.style.display = "block"; scPreviewImg.src = objectUrl; scPreviewImg.onload = () => { scNatW = scPreviewImg.naturalWidth; scNatH = scPreviewImg.naturalHeight; sizeMediaToViewport(); }; }
}

function sizeMediaToViewport() {
  scViewW = scViewport.offsetWidth; scViewH = scViewport.offsetHeight;
  const baseScale = Math.max(scViewW / scNatW, scViewH / scNatH);
  scMediaWrap._baseScale = baseScale;
  const w = scNatW * baseScale; const h = scNatH * baseScale;
  const el = scIsVideo ? scPreviewVid : scPreviewImg; el.style.width = w + "px"; el.style.height = h + "px";
  scOffsetX = (scViewW - w) / 2; scOffsetY = (scViewH - h) / 2; scScale = 1; scZoom.value = 1; applyTransform();
}

function applyTransform() { scMediaWrap.style.transform = `translate(${scOffsetX}px,${scOffsetY}px) scale(${scScale})`; scMediaWrap.style.transformOrigin = "0 0"; }

scZoom.addEventListener("input", () => {
  const newScale = parseFloat(scZoom.value); const prevW = scNatW * (scMediaWrap._baseScale || 1) * scScale; const prevH = scNatH * (scMediaWrap._baseScale || 1) * scScale;
  scScale = newScale; const newW = scNatW * (scMediaWrap._baseScale || 1) * newScale; const newH = scNatH * (scMediaWrap._baseScale || 1) * newScale;
  scOffsetX += (prevW - newW) / 2; scOffsetY += (prevH - newH) / 2; clampOffset(); applyTransform();
});

function clampOffset() {
  const baseScale = scMediaWrap._baseScale || 1; const w = scNatW * baseScale * scScale; const h = scNatH * baseScale * scScale;
  scOffsetX = Math.min(0, Math.max(scViewW - w, scOffsetX)); scOffsetY = Math.min(0, Math.max(scViewH - h, scOffsetY));
}

let dragStart = null;
scViewport.addEventListener("pointerdown", e => { dragStart = { x: e.clientX, y: e.clientY, ox: scOffsetX, oy: scOffsetY }; scViewport.setPointerCapture(e.pointerId); });
scViewport.addEventListener("pointermove", e => { if (!dragStart) return; scOffsetX = dragStart.ox + (e.clientX - dragStart.x); scOffsetY = dragStart.oy + (e.clientY - dragStart.y); clampOffset(); applyTransform(); });
scViewport.addEventListener("pointerup",     () => { dragStart = null; });
scViewport.addEventListener("pointercancel", () => { dragStart = null; });

let lastPinchDist = null;
scViewport.addEventListener("touchstart", e => { if (e.touches.length === 2) lastPinchDist = getPinchDist(e.touches); }, { passive: true });
scViewport.addEventListener("touchmove",  e => {
  if (e.touches.length === 2 && lastPinchDist) {
    const dist = getPinchDist(e.touches); const delta = dist / lastPinchDist; const newScale = Math.min(3, Math.max(1, scScale * delta));
    const prevW = scNatW * (scMediaWrap._baseScale || 1) * scScale; const prevH = scNatH * (scMediaWrap._baseScale || 1) * scScale;
    scScale = newScale; const newW = scNatW * (scMediaWrap._baseScale || 1) * newScale; const newH = scNatH * (scMediaWrap._baseScale || 1) * newScale;
    scOffsetX += (prevW - newW) / 2; scOffsetY += (prevH - newH) / 2; clampOffset(); applyTransform(); scZoom.value = newScale; lastPinchDist = dist;
  }
}, { passive: true });
scViewport.addEventListener("touchend", e => { if (e.touches.length < 2) lastPinchDist = null; }, { passive: true });
function getPinchDist(touches) { const dx = touches[0].clientX - touches[1].clientX; const dy = touches[0].clientY - touches[1].clientY; return Math.sqrt(dx * dx + dy * dy); }

scClose.addEventListener("click", closeStoryCreator);
function closeStoryCreator() {
  storyCreator.classList.remove("active"); document.body.style.overflow = "";
  scPreviewVid.pause(); scPreviewVid.src = ""; scPreviewImg.src = ""; scThumbVid.src = ""; scThumbImg.src = ""; scFile = null;
}

scNextBtn.addEventListener("click", () => {
  step1.classList.add("hidden"); step2.classList.remove("hidden");
  const objectUrl = URL.createObjectURL(scFile);
  if (scIsVideo) { scThumbImg.style.display = "none"; scThumbVid.style.display = "block"; scThumbVid.src = objectUrl; scThumbVid.play().catch(() => {}); }
  else { scThumbVid.style.display = "none"; scThumbImg.style.display = "block"; scThumbImg.src = objectUrl; }
  setTimeout(() => scCaption.focus(), 300);
});

scBack.addEventListener("click", () => { step2.classList.add("hidden"); step1.classList.remove("hidden"); });
scCaption.addEventListener("input", () => { const len = scCaption.value.length; scCharCount.textContent = `${len}/200`; scCaptionOverlay.textContent = scCaption.value; });

scPostBtn.addEventListener("click", async () => {
  if (!scFile) return;
  scPostBtn.disabled = true; scPostBtnText.textContent = ""; scPostSpinner.classList.remove("hidden");
  try {
    const formData = new FormData(); formData.append("media", scFile);
    const caption = scCaption.value.trim(); if (caption) formData.append("caption", caption);
    const res = await fetch(`${baseUrl}/api/stories`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
    if (res.ok) { closeStoryCreator(); showToast("Story posted! 🎉"); await loadStories(); }
    else showToast("Failed to post story. Try again.");
  } catch { showToast("Failed to post story. Try again."); }
  scPostBtn.disabled = false; scPostBtnText.textContent = "Post Story"; scPostSpinner.classList.add("hidden");
});

// ══════════════════════════════════════════════
//  STORY LOADER
// ══════════════════════════════════════════════
async function loadStories() {
  try {
    const res  = await fetch(`${baseUrl}/api/stories`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    storiesRow.querySelectorAll(".story-card:not(#addStoryBtn)").forEach(el => el.remove());
    data.stories.forEach(group => {
      const user = group.user; const hasUnseen = (group.stories || []).some(s => s && s.isSeen === false);
      const div  = document.createElement("div"); div.className = `story-card ${hasUnseen ? "unseen" : "seen"}`;
      const pic  = (user.profilePicture && user.profilePicture.trim()) ? user.profilePicture : "/uploads/images/africa.png";
      div.innerHTML = `<img src="${pic}" onerror="this.src='/uploads/images/africa.png'" /><span>${user.username || user.fullName || "User"}</span>`;
      div.onclick = () => openStoryViewer(group.stories, group.user);
      storiesRow.appendChild(div);
    });
  } catch (err) { console.error("Load stories error:", err); }
}
loadStories();

// ══════════════════════════════════════════════
//  STORY VIEWER
// ══════════════════════════════════════════════
const viewer      = document.getElementById("storyViewer");
const progress    = document.getElementById("storyProgress");
const captionView = document.getElementById("storyCaption");
const storyImg    = document.getElementById("storyImage");
const storyVid    = document.getElementById("storyVideo");
const storyNameEl = document.getElementById("storyUsername");
const viewersBtn  = document.getElementById("viewersBtn");

let currentStories = []; let currentIndex = 0; let currentUser = null; let storyTimer; let isPaused = false;

function pauseStory()  { isPaused = true; clearInterval(storyTimer); if (!storyVid.paused) storyVid.pause(); }
function resumeStory() {
  if (!isPaused) return; isPaused = false;
  const s = currentStories[currentIndex];
  if (s && s.media.match(/\.(mp4|webm|ogg)$/i)) storyVid.play().catch(() => {});
  startProgress();
}

function openStoryViewer(stories, user) { currentStories = stories; currentIndex = 0; currentUser = user; viewer.style.display = "flex"; showStory(); }

function showStory() {
  const story = currentStories[currentIndex]; if (!story || !story.media) return;
  const url     = getMediaUrl(story.media);
  storyVid.pause(); storyVid.currentTime = 0; storyVid.removeAttribute("src"); storyVid.load(); storyVid.onloadedmetadata = null;
  const isVideo = story.media.match(/\.(mp4|webm|ogg)$/i);
  if (isVideo) { storyImg.style.display = "none"; storyVid.style.display = "block"; storyVid.src = url; storyVid.play().catch(() => {}); }
  else { storyVid.style.display = "none"; storyImg.style.display = "block"; storyImg.src = url; }
  if (storyNameEl) {
    const pic  = (currentUser.profilePicture && currentUser.profilePicture.trim()) ? currentUser.profilePicture : "/uploads/images/africa.png";
    const time = story.createdAt ? timeAgo(story.createdAt) + " ago" : "";
    storyNameEl.innerHTML = `<img src="${pic}" onerror="this.src='/uploads/images/africa.png'" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid #fff;flex-shrink:0;" /><div style="display:flex;flex-direction:column;gap:1px;"><span style="font-size:14px;font-weight:700;color:#fff;">${currentUser.username || currentUser.fullName || "User"} ${currentUser.isVerified ? verifiedBadge() : ""}</span><span style="font-size:11px;color:rgba(255,255,255,0.72);">${time}</span></div>`;
    storyNameEl.style.cssText = "display:flex;align-items:center;gap:10px;flex:1;";
  }
  if (captionView) captionView.textContent = story.caption || "";
  if (viewersBtn)  viewersBtn.style.display = story.isOwner ? "flex" : "none";
  startProgress(); markStorySeen(story._id);
}

function startProgress() {
  progress.style.width = "0%"; clearInterval(storyTimer);
  const story = currentStories[currentIndex]; if (!story) return;
  if (story.media.match(/\.(mp4|webm|ogg)$/i)) {
    const up = () => { if (!storyVid.duration) return; const pct = (storyVid.currentTime / storyVid.duration) * 100; progress.style.width = pct + "%"; if (pct >= 100) { storyVid.removeEventListener("timeupdate", up); nextStory(); } };
    storyVid.onloadedmetadata = () => { storyVid.addEventListener("timeupdate", up); };
  } else {
    let w = 0; storyTimer = setInterval(() => { w += 2; progress.style.width = w + "%"; if (w >= 100) { clearInterval(storyTimer); nextStory(); } }, 100);
  }
}

function nextStory() { currentIndex++; if (currentIndex >= currentStories.length) { closeViewer(); return; } showStory(); }

viewer.addEventListener("click", e => {
  if (isPaused) return;
  if (e.target.closest(".story-reactions button")) return;
  if (e.target.closest(".viewers-btn")) return;
  if (e.target.closest("#closeStory")) return;
  if (e.target.closest(".story-top")) return;
  if (e.clientX < window.innerWidth / 2) { currentIndex = Math.max(0, currentIndex - 1); } else { currentIndex++; }
  if (currentIndex >= currentStories.length) { closeViewer(); return; }
  showStory();
});

function closeViewer() { viewer.style.display = "none"; clearInterval(storyTimer); storyVid.pause(); storyVid.currentTime = 0; if (captionView) captionView.textContent = ""; }

viewer.addEventListener("touchstart", pauseStory);
viewer.addEventListener("touchend",   resumeStory);
viewer.addEventListener("mousedown",  pauseStory);
viewer.addEventListener("mouseup",    resumeStory);
viewer.addEventListener("mouseleave", resumeStory);
document.getElementById("closeStory").onclick = closeViewer;

async function markStorySeen(storyId) {
  try { await fetch(`${baseUrl}/api/stories/${storyId}/view`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }); const s = currentStories.find(s => s._id === storyId); if (s) s.isSeen = true; } catch {}
}

document.addEventListener("click", async e => {
  if (e.target.closest(".story-reactions button")) {
    const btn = e.target.closest("button");
    await fetch(`${baseUrl}/api/stories/react/${currentStories[currentIndex]._id}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ type: btn.textContent }) });
  }
});

async function loadStoryViewers(storyId) {
  try {
    const res  = await fetch(`${baseUrl}/api/stories/${storyId}/viewers`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json(); const container = document.getElementById("storyViewersList"); container.innerHTML = "";
    data.viewers.forEach(user => {
      const div = document.createElement("div"); div.className = "viewer-item";
      div.innerHTML = `<div class="viewer-left"><a href="/profile.html?userId=${user._id}"><img src="${user.profilePicture || '/uploads/images/africa.png'}" onerror="this.src='/uploads/images/africa.png'" /></a><span class="viewer-name">${user.username}</span>${user.isVerified ? verifiedBadge() : ""}</div><span class="viewer-reaction">${user.reaction || ""}</span>`;
      container.appendChild(div);
    });
  } catch {}
}

const viewersModal = document.getElementById("storyViewersModal");
viewersBtn.onclick = e => { e.stopPropagation(); loadStoryViewers(currentStories[currentIndex]._id); viewersModal.classList.add("active"); };
document.getElementById("closeViewers").onclick = () => { viewersModal.classList.remove("active"); };

// ══════════════════════════════════════════════
//  CONTENT MODERATION
// ══════════════════════════════════════════════
const BAD_WORDS = new Set(["fuck","shit","bitch","asshole","bastard","cunt","dick","pussy","cock","whore","nigger","nigga","faggot","retard","slut","kike","spic","chink","wetback","raghead","mumu","oloshi","olosho","ashawo","werey","ode","omoale","omo ale","ole"]);
const MALICIOUS_PATTERNS = [/bit\.ly\/[a-zA-Z0-9]{6,}/i,/free.*money/i,/click.*here.*win/i,/you.*won.*prize/i,/verify.*account.*now/i,/double.*bitcoin/i,/free.*crypto/i,/invest.*guaranteed/i,/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i];
const SAFE_DOMAINS = new Set(["google.com","youtube.com","twitter.com","facebook.com","instagram.com","whatsapp.com","wikipedia.org","github.com","linkedin.com","afrisocial.com.ng"]);

function scanContent(text) {
  if (!text || typeof text !== "string") return { clean: true };
  const lower = text.toLowerCase(); const foundWords = []; const hateSlurs = ["nigger","faggot","kike","spic","chink","wetback","raghead"];
  BAD_WORDS.forEach(word => { const regex = new RegExp(`\\b${word}\\b`, "gi"); if (regex.test(lower)) foundWords.push(word); });
  const urls = text.match(/https?:\/\/[^\s]+/gi) || []; const flaggedLinks = [];
  urls.forEach(url => { try { const domain = new URL(url).hostname.replace("www.", ""); if (SAFE_DOMAINS.has(domain)) return; if (MALICIOUS_PATTERNS.some(p => p.test(url))) flaggedLinks.push(url); } catch { flaggedLinks.push(url); } });
  const spamPatterns = [/(.)\1{6,}/,/[A-Z]{10,}/,/(\b\w+\b)(\s+\1){3,}/i,/follow\s+me/i,/make\s+money\s+fast/i];
  const isSpam = spamPatterns.some(p => p.test(text));
  const reasons = []; let severity = null;
  if (foundWords.length > 0) { const isHate = foundWords.some(w => hateSlurs.includes(w)); reasons.push(isHate ? "hate_speech" : "profanity"); severity = isHate ? "severe" : "mild"; }
  if (flaggedLinks.length > 0) { reasons.push("malicious_link"); severity = "severe"; }
  if (isSpam) { reasons.push("spam_pattern"); if (!severity) severity = "mild"; }
  if (reasons.length === 0) return { clean: true };
  return { clean: false, severity, reasons };
}

function showModerationWarning(reasons) {
  const messages = { hate_speech: "Your post contains hate speech and cannot be posted.", malicious_link: "Your post contains a suspicious link.", profanity: "Your post contains inappropriate language.", spam_pattern: "Your post looks like spam." };
  const msg = reasons.map(r => messages[r] || "Content policy violation.").join(" ");
  const div = document.createElement("div"); div.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#FEF2F2;border:1.5px solid #FECACA;color:#B91C1C;padding:14px 24px;border-radius:12px;font-size:14px;font-weight:500;z-index:9999;max-width:90%;text-align:center;`;
  div.textContent = `⚠️ ${msg}`; document.body.appendChild(div); setTimeout(() => div.remove(), 5000);
}

function showMildWarning() {
  const div = document.createElement("div"); div.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#FFFBEB;border:1.5px solid #FCD34D;color:#92400E;padding:14px 24px;border-radius:12px;font-size:14px;font-weight:500;z-index:9999;max-width:90%;text-align:center;`;
  div.textContent = "⚠️ Your post has been flagged for review."; document.body.appendChild(div); setTimeout(() => div.remove(), 4000);
}

function showReportModal(contentId, contentType = "post") {
  const reasons = [{value:"spam",label:"🚫 Spam"},{value:"hate_speech",label:"😡 Hate Speech"},{value:"explicit",label:"🔞 Explicit Content"},{value:"malicious_link",label:"🔗 Malicious Link"},{value:"other",label:"⚠️ Other"}];
  const modal = document.createElement("div"); modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:flex-end;justify-content:center;z-index:9999;padding:20px;`;
  const sheet = document.createElement("div"); sheet.style.cssText = `background:white;border-radius:20px;padding:24px;width:100%;max-width:500px;`;
  sheet.innerHTML = `<h3 style="font-size:18px;font-weight:700;margin-bottom:16px;color:#111827;">Report</h3><p style="font-size:14px;color:#6B7280;margin-bottom:20px;">Why are you reporting this?</p>${reasons.map(r => `<button data-reason="${r.value}" style="display:block;width:100%;text-align:left;padding:14px 16px;border:1.5px solid #E5E7EB;border-radius:12px;background:white;font-size:15px;font-weight:500;color:#111827;margin-bottom:8px;cursor:pointer;">${r.label}</button>`).join("")}<button id="cRB" style="display:block;width:100%;padding:14px;border:none;background:#F3F4F6;border-radius:12px;font-size:15px;font-weight:600;color:#6B7280;margin-top:4px;cursor:pointer;">Cancel</button>`;
  modal.appendChild(sheet); document.body.appendChild(modal);
  sheet.querySelectorAll("[data-reason]").forEach(btn => {
    btn.addEventListener("click", async () => {
      try { await fetch(`${baseUrl}/api/moderation/report`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ contentId, contentType, reason: btn.dataset.reason }) }); } catch {}
      document.body.removeChild(modal); showToast("✅ Reported. Thank you!");
    });
  });
  sheet.querySelector("#cRB").addEventListener("click", () => document.body.removeChild(modal));
}

// ================== STORY REACTION SOUNDS ==================
document.querySelectorAll(".story-reactions button").forEach(button => {
  button.addEventListener("click", () => {
    for (let i = 0; i < 20; i++) {
      const bubble = document.createElement("span"); bubble.className = "bubble"; bubble.textContent = button.dataset.emoji;
      const xOffset = (Math.random() * 300 - 100) + "%"; const yOffset = (Math.random() * 200 - 100) + "%";
      bubble.style.setProperty("--x", xOffset); bubble.style.setProperty("--y", yOffset);
      button.appendChild(bubble); bubble.offsetWidth;
      bubble.addEventListener("animationend", () => bubble.remove());
    }
  });
});

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
    if (now - last < 350) { lastTap[postId] = 0; fireHeart(post); await doLike(postId, post); } else { lastTap[postId] = now; }
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
      const res  = await fetch(`${baseUrl}/api/posts/${postId}/like`, { method: "POST", headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      if (loveBtn) { const c = loveBtn.querySelector(".count"); if (c) c.textContent = data.likes.length; loveBtn.classList.add("liked", "pop"); setTimeout(() => loveBtn.classList.remove("pop"), 300); }
    } catch {}
  }
})();

// ══════════════════════════════════════════════
//  FEED GIFT MODAL
// ══════════════════════════════════════════════
let feedGiftStarBalance = 0;
let feedGiftSelected    = null;
let feedGiftRecipientId = null;
let feedGiftRecipientName = null;
let currentFeedGiftPostId = null;

function buildFeedGiftGrid() {
  const grid = document.getElementById("feedGiftGrid"); if (!grid) return;
  grid.innerHTML = FEED_GIFT_CATALOGUE.map((g, i) => `
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
      feedGiftSelected = FEED_GIFT_CATALOGUE[parseInt(el.dataset.index)];
      updateFeedGiftSendState();
    });
  });
}

function updateFeedGiftSendState() {
  const sendBtn     = document.getElementById("feedGiftSendBtn");
  const rechargeBtn = document.getElementById("feedGiftRechargeBtn");
  if (!feedGiftSelected) { sendBtn.textContent = "Send Gift"; return; }
  const cost = feedGiftSelected.stars;
  if (feedGiftStarBalance === 0) {
    sendBtn.style.display = "none"; rechargeBtn.style.display = "inline-flex"; rechargeBtn.textContent = "Recharge Stars";
  } else if (cost > feedGiftStarBalance) {
    sendBtn.style.display = "none"; rechargeBtn.style.display = "inline-flex"; rechargeBtn.textContent = "Insufficient Balance — Recharge";
  } else {
    sendBtn.style.display = ""; rechargeBtn.style.display = "none";
    sendBtn.disabled = false; sendBtn.textContent = `Send ${feedGiftSelected.emoji} Gift`;
  }
}

async function fetchFeedStarBalance() {
  try {
    const res  = await fetch(`${baseUrl}/api/wallet`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json(); feedGiftStarBalance = data.starBalance || 0;
  } catch { feedGiftStarBalance = 0; }
  document.getElementById("feedGiftStarBal").textContent = feedGiftStarBalance.toLocaleString();
  updateFeedGiftSendState();
}

function openFeedGiftModal(recipientId, recipientName, postId) {
  currentFeedGiftPostId = postId;
  feedGiftRecipientId   = recipientId;
  feedGiftRecipientName = recipientName;
  feedGiftSelected      = null;
  document.querySelectorAll("#feedGiftGrid .feed-gift-item").forEach(x => x.classList.remove("selected"));
  document.getElementById("feedGiftSendBtn").style.display     = "";
  document.getElementById("feedGiftRechargeBtn").style.display = "none";
  document.getElementById("feedGiftSendBtn").textContent       = "Send Gift";
  document.getElementById("feedGiftStarBal").textContent       = "...";
  document.getElementById("feedGiftModal").style.display       = "flex";
  fetchFeedStarBalance();
}

document.getElementById("feedGiftClose").addEventListener("click", () => { document.getElementById("feedGiftModal").style.display = "none"; });
document.getElementById("feedGiftRechargeBtn").addEventListener("click", () => { window.location.href = "/wallet.html"; });
document.getElementById("feedGiftSendBtn").addEventListener("click", async () => {
  if (!feedGiftSelected) { showToast("Pick a gift first!"); return; }
  if (feedGiftSelected.stars > feedGiftStarBalance) { showToast("Insufficient stars. Recharge first."); return; }
  const sendBtn = document.getElementById("feedGiftSendBtn");
  sendBtn.disabled = true; sendBtn.textContent = "Sending...";
  try {
    const res  = await fetch(`${baseUrl}/api/wallet/feed-gift`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ recipient: feedGiftRecipientId, giftType: feedGiftSelected.name, amount: feedGiftSelected.stars, postId: currentFeedGiftPostId }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
   // GIFT BURST ANIMATION
   const postEl = document.querySelector(
  `[data-post-id="${currentFeedGiftPostId}"]`
   );
  if (postEl) {
  launchGiftBurst(
    postEl,
    feedGiftSelected.emoji
  );
  }
  document.getElementById("feedGiftModal").style.display = "none";
   showToast(
  `🎁 ${feedGiftSelected.emoji} Gift sent to ${feedGiftRecipientName}!`
    );
  } catch (err) {
    showToast(err.message || "Failed to send gift.");
    sendBtn.disabled = false; sendBtn.textContent = `Send ${feedGiftSelected.emoji} Gift`;
  }
});

buildFeedGiftGrid();