// ══════════════════════════════════════════════
//  DARK MODE
// ══════════════════════════════════════════════
if (localStorage.getItem("afri_theme") === "dark") document.body.classList.add("dark");


// ══════════════════════════════════════════════
//  CONSTANTS
// ══════════════════════════════════════════════
const baseUrl       = "https://afrisocial-backend-dev-production.up.railway.app";
const token         = localStorage.getItem("token");
const currentUserId = localStorage.getItem("userId");
const isGuest       = !token;

const feedLoaded = { ask: false, post: false };

let activeTab  = "ask";
let searchMode = "askme";
let searchTimer;

const CATEGORY_LABELS = {
  culture:"Culture", politics:"Politics",
  technology:"Technology", history:"History",
  business:"Business", entertainment:"Entertainment",
  education:"Education", sports:"Sports",
  religion:"Religion", news:"News",
  agriculture:"Agriculture"
};

// ══════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════
function getFlagEmoji(code) {
  if (!code) return "";
  return code.toUpperCase()
    .replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt()));
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

function getMediaUrl(p) {
  if (!p) return "";
  return p.startsWith("http") ? p : `${baseUrl}${p}`;
}

function linkify(text) {
  if (!text) return "";
  return text.replace(/#(\w+)/g,
    (_, t) => `<a href="/hashtag.html?tag=${t}" class="hashtag-link">#${t}</a>`);
}

function verifiedSvg() {
  return `<svg class="verified-icon" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#1DA1F2"/>
    <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/>
  </svg>`;
}

function showToast(msg, color = "#111") {
  let t = document.getElementById("exploreToast");
  if (!t) {
    t = document.createElement("div");
    t.id = "exploreToast";
    document.body.appendChild(t);
  }
  t.textContent = msg; t.style.background = color;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

function requireLogin() {
  if (isGuest) {
    document.getElementById("guestModal").classList.remove("hidden");
    return false;
  }
  return true;
}

// ══════════════════════════════════════════════
//  GUEST MODAL
// ══════════════════════════════════════════════
document.getElementById("closeGuestModal").onclick = () =>
  document.getElementById("guestModal").classList.add("hidden");

// ══════════════════════════════════════════════
//  TAB SWITCHING
// ══════════════════════════════════════════════
function showFeedWrap(tab) {
  ["ask","post","community"].forEach(t => {
    const wrapId = t === "community" ? "communityWrap" : `${t}FeedWrap`;
    const el = document.getElementById(wrapId);
    if (!el) return;
    el.classList.toggle("active", t === tab);
    el.classList.toggle("hidden", t !== tab);
  });
}

document.querySelectorAll(".inner-nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    setTab(tab);
    showFeedWrap(tab);
    if (tab === "ask"  && !feedLoaded.ask)  loadFeed("ask");
    if (tab === "post" && !feedLoaded.post) loadFeed("post");
  });
});

function setTab(tab) {
  activeTab = tab;
  document.querySelectorAll(".inner-nav-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === tab);
  });
}

// ══════════════════════════════════════════════
//  FAB
// ══════════════════════════════════════════════
const fab         = document.getElementById("exploreFab");
const fabDropdown = document.getElementById("fabDropdown");
const fabBackdrop = document.getElementById("fabBackdrop");
let fabOpen = false;

fab.addEventListener("click", () => {
  fabOpen = !fabOpen;
  fab.classList.toggle("open", fabOpen);
  fabDropdown.classList.toggle("hidden", !fabOpen);
  fabBackdrop.classList.toggle("hidden", !fabOpen);
});

fabBackdrop.addEventListener("click", () => {
  fabOpen = false;
  fab.classList.remove("open");
  fabDropdown.classList.add("hidden");
  fabBackdrop.classList.add("hidden");
});

document.getElementById("fabAskBtn").addEventListener("click", () => {
  fabOpen = false;
  fab.classList.remove("open");
  fabDropdown.classList.add("hidden");
  fabBackdrop.classList.add("hidden");
  openAskSheet();
});

document.getElementById("fabPostBtn").addEventListener("click", () => {
  fabOpen = false;
  fab.classList.remove("open");
  fabDropdown.classList.add("hidden");
  fabBackdrop.classList.add("hidden");
  openPostModal();
});

// ══════════════════════════════════════════════
//  AFRISEARCH MODAL
// ══════════════════════════════════════════════
document.getElementById("openAfriSearch").addEventListener("click", openAfriSearch);
document.getElementById("closeAfriSearch").addEventListener("click", closeAfriSearch);
document.getElementById("afrisearchOverlay").addEventListener("click", closeAfriSearch);

function openAfriSearch() {
  document.getElementById("afrisearchModal").classList.remove("hidden");
  document.getElementById("afrisearchOverlay").classList.remove("hidden");
  showSearchHome();
  setTimeout(() => document.getElementById("afrisearchInput").focus(), 150);
}

function closeAfriSearch() {
  document.getElementById("afrisearchModal").classList.add("hidden");
  document.getElementById("afrisearchOverlay").classList.add("hidden");
  document.getElementById("afrisearchInput").value = "";
  document.getElementById("clearAfriSearch").classList.add("hidden");
  showSearchHome();
}

function showSearchHome() {
  document.getElementById("afrisearchLive").classList.add("hidden");
  if (searchMode === "askme") {
    document.getElementById("askMeHome").classList.remove("hidden");
    document.getElementById("afrisearchHome").classList.add("hidden");
  } else {
    document.getElementById("afrisearchHome").classList.remove("hidden");
    document.getElementById("askMeHome").classList.add("hidden");
  }
}

document.querySelectorAll(".as-pill").forEach(pill => {
  pill.addEventListener("click", () => {
    document.querySelectorAll(".as-pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    searchMode = pill.dataset.mode;
    document.getElementById("afrisearchInput").placeholder =
      searchMode === "askme"
        ? "Ask the community anything..."
        : "Search African history, culture, traditions...";
    const val = document.getElementById("afrisearchInput").value.trim();
    if (val) handleSearch(val); else showSearchHome();
  });
});

document.querySelectorAll(".askme-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    const val = chip.textContent;
    document.getElementById("afrisearchInput").value = val;
    document.getElementById("clearAfriSearch").classList.remove("hidden");
    handleSearch(val);
  });
});

document.querySelectorAll(".as-popular-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const query = btn.textContent.replace(/^\S+\s/, "").trim();
    document.getElementById("afrisearchInput").value = query;
    document.getElementById("clearAfriSearch").classList.remove("hidden");
    doKnowledgeSearch(query);
  });
});

document.getElementById("afrisearchInput").addEventListener("input", function () {
  const val = this.value.trim();
  document.getElementById("clearAfriSearch").classList.toggle("hidden", !val);
  clearTimeout(searchTimer);
  if (!val) { showSearchHome(); return; }
  searchTimer = setTimeout(() => handleSearch(val), 350);
});

document.getElementById("clearAfriSearch").addEventListener("click", () => {
  document.getElementById("afrisearchInput").value = "";
  document.getElementById("clearAfriSearch").classList.add("hidden");
  showSearchHome();
  document.getElementById("afrisearchInput").focus();
});

document.getElementById("afrisearchInput").addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  const val = document.getElementById("afrisearchInput").value.trim();
  if (!val) return;
  if (searchMode === "askme") { closeAfriSearch(); prefillAsk(val); }
  else doKnowledgeSearch(val);
});

function handleSearch(query) {
  if (searchMode === "askme") showAskMeLive(query);
  else doKnowledgeSearch(query);
}

function showAskMeLive(query) {
  document.getElementById("askMeHome").classList.add("hidden");
  document.getElementById("afrisearchHome").classList.add("hidden");
  document.getElementById("afrisearchLive").classList.remove("hidden");
  document.getElementById("knowledgeResult").classList.add("hidden");
  document.getElementById("userResults").classList.add("hidden");
  document.getElementById("noResult").classList.add("hidden");

  const askRow = document.getElementById("askSuggestRow");
  document.getElementById("askSuggestText").textContent = query;
  askRow.classList.remove("hidden");
  askRow.onclick = () => { closeAfriSearch(); prefillAsk(query); };
  searchUsersLive(query);
}

async function doKnowledgeSearch(query) {
  document.getElementById("askMeHome").classList.add("hidden");
  document.getElementById("afrisearchHome").classList.add("hidden");
  document.getElementById("afrisearchLive").classList.remove("hidden");
  document.getElementById("askSuggestRow").classList.add("hidden");
  document.getElementById("noResult").classList.add("hidden");
  document.getElementById("userResults").classList.add("hidden");

  const krDiv = document.getElementById("knowledgeResult");
  krDiv.classList.remove("hidden");
  krDiv.innerHTML = `
    <div class="kr-loading">
      <div class="kr-loading-spinner"></div>
      Searching African knowledge...
    </div>`;

  try {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search` +
      `&srsearch=${encodeURIComponent(query + " Africa")}` +
      `&srlimit=1&format=json&origin=*`
    );
    const searchData = await searchRes.json();
    const results    = searchData.query?.search || [];

    if (!results.length) {
      krDiv.classList.add("hidden");
      document.getElementById("noResult").classList.remove("hidden");
      searchUsersLive(query); return;
    }

    const pageTitle  = results[0].title;
    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`
    );
    const summary = await summaryRes.json();
    const extract = summary.extract
      ? summary.extract.slice(0, 350) + "..."
      : results[0].snippet.replace(/<[^>]*>/g, "") + "...";

    krDiv.innerHTML = `
      <div class="kr-header">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="#FFA310">
          <path d="M12 2l3.1 6.3 6.9.9-5 4.9 1.2 6.9L12 17.7l-6.2 3.3 1.2-6.9L2 9.2l6.9-.9z"/>
        </svg>
        AfriSearch Result
      </div>
      <h3 class="kr-title">${summary.title || pageTitle}</h3>
      <p class="kr-body">${extract}</p>
      <div class="kr-related" id="krRelatedTags"></div>
      <a class="kr-readmore"
        href="https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}"
        target="_blank" rel="noopener">
        Read full article on Wikipedia →
      </a>`;

    const tags    = getRelatedTerms(query);
    const tagsDiv = document.getElementById("krRelatedTags");
    tags.forEach(term => {
      const btn     = document.createElement("button");
      btn.className = "kr-related-tag"; btn.textContent = term;
      btn.onclick   = () => {
        document.getElementById("afrisearchInput").value = term;
        doKnowledgeSearch(term);
      };
      tagsDiv.appendChild(btn);
    });
  } catch {
    krDiv.innerHTML = `
      <p class="kr-body" style="padding:14px;">
        Could not load results. Check your connection.
      </p>`;
  }
  searchUsersLive(query);
}

function getRelatedTerms(query) {
  const q = query.toLowerCase();
  if (q.includes("music") || q.includes("beat"))
    return ["Fela Kuti","Highlife music","Jùjú music","Afro-fusion"];
  if (q.includes("king") || q.includes("empire"))
    return ["Mali Empire","Songhai","Zulu Kingdom","Oyo Empire"];
  if (q.includes("food") || q.includes("cuisine"))
    return ["Jollof rice","Injera","Egusi soup","Fufu"];
  if (q.includes("culture") || q.includes("tradition"))
    return ["Yoruba culture","Maasai","Ubuntu","African festivals"];
  if (q.includes("history") || q.includes("ancient"))
    return ["Ancient Egypt","Great Zimbabwe","Carthage","Nubia"];
  return ["African culture","Pan-Africanism","Ubuntu philosophy","African history"];
}

async function searchUsersLive(query) {
  const userDiv  = document.getElementById("userResults");
  const userList = document.getElementById("userResultsList");
  try {
    const res  = await fetch(`${baseUrl}/api/users/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!data.users?.length) { userDiv.classList.add("hidden"); return; }
    userDiv.classList.remove("hidden");
    userList.innerHTML = "";
    data.users.slice(0,4).forEach(user => {
      const div     = document.createElement("div");
      div.className = "search-result-item";
      div.innerHTML = `
        <img src="${user.profilePicture || '/uploads/images/africa.png'}" />
        <div class="sri-info">
          <strong>
            ${user.fullName}
            ${user.isVerified ? verifiedSvg() : ""}
            ${getFlagEmoji(user.country)}
          </strong>
          <span>@${user.username}</span>
        </div>`;
      div.onclick = () => { window.location.href = `/profile.html?userId=${user._id}`; };
      userList.appendChild(div);
    });
  } catch { userDiv.classList.add("hidden"); }
}

function prefillAsk(text) {
  document.getElementById("questionInput").value = text;
  openAskSheet();
}

// ══════════════════════════════════════════════
//  ASK SHEET
// ══════════════════════════════════════════════
const askSheet   = document.getElementById("askSheet");
const askOverlay = document.getElementById("askOverlay");

function openAskSheet() {
  if (!requireLogin()) return;
  askSheet.classList.remove("hidden");
  askOverlay.classList.remove("hidden");
  setTimeout(() => {
    askSheet.classList.add("open");
    document.getElementById("questionInput").focus();
  }, 10);
}

function closeAskSheet() {
  askSheet.classList.remove("open");
  setTimeout(() => {
    askSheet.classList.add("hidden");
    askOverlay.classList.add("hidden");
  }, 380);
  document.getElementById("questionInput").value = "";
  document.getElementById("askError").textContent = "";
}

document.getElementById("closeAskSheet").addEventListener("click", closeAskSheet);
askOverlay.addEventListener("click", closeAskSheet);

document.getElementById("submitQuestion").addEventListener("click", async () => {
  const text = document.getElementById("questionInput").value.trim();
  if (!text) {
    document.getElementById("askError").textContent = "Please write your question first.";
    return;
  }

  const btn     = document.getElementById("submitQuestion");
  const btnText = document.getElementById("askBtnText");
  const spinner = document.getElementById("askSpinner");
  btn.disabled = true;
  btnText.textContent = "Posting...";
  spinner.classList.remove("hidden");

  try {
    const fd = new FormData();
    fd.append("text", text);
    fd.append("isQuestion", "true");

    const res     = await fetch(`${baseUrl}/api/explore`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    });
    if (!res.ok) throw new Error();
    const newPost = await res.json();

    closeAskSheet();
    showToast("✅ Question posted!", "#22C55E");

    setTab("ask");
    showFeedWrap("ask");

    const askFeed = document.getElementById("askFeed");
    const post    = newPost.post || newPost;
    const loaderEl = document.getElementById("askFeedLoader");
    if (loaderEl) loaderEl.style.display = "none";

    if (post && post._id) {
      post.user = post.user || {
        _id: currentUserId,
        fullName: "You",
        profilePicture: "",
        isVerified: false
      };
      const card  = renderCard(post, true);
      const first = askFeed.querySelector(".explore-card");
      if (first) askFeed.insertBefore(card, first);
      else       askFeed.appendChild(card);
      initSlidersIn(card);
      initVideosIn(card);
      initViewsIn(card);
      askFeed.querySelector(".feed-empty")?.remove();
      feedLoaded.ask = true;
    } else {
      feedLoaded.ask = false;
      loadFeed("ask");
    }
  } catch {
    document.getElementById("askError").textContent = "Failed to post. Try again.";
  } finally {
    btn.disabled = false;
    btnText.textContent = "Post Question";
    spinner.classList.add("hidden");
  }
});

// ══════════════════════════════════════════════
//  POST MODAL
// ══════════════════════════════════════════════
const postModal        = document.getElementById("postModal");
const postModalOverlay = document.getElementById("postModalOverlay");

function openPostModal() {
  if (!requireLogin()) return;
  loadPostModalAvatar();
  postModal.classList.remove("hidden");
  postModalOverlay.classList.remove("hidden");
  document.getElementById("postTitle").value            = "";
  document.getElementById("postBody").value             = "";
  document.getElementById("postCategory").value         = "";
  document.getElementById("postRegion").value           = "";
  document.getElementById("postModalPreview").innerHTML = "";
  document.getElementById("postModalMedia").value       = "";
  document.getElementById("postModalError").textContent = "";
  document.getElementById("postModalRegionPreview").textContent = "";
}

function closePostModal() {
  postModal.classList.add("hidden");
  postModalOverlay.classList.add("hidden");
}

document.getElementById("closePostModal").addEventListener("click", closePostModal);
postModalOverlay.addEventListener("click", closePostModal);

async function loadPostModalAvatar() {
  if (!currentUserId) return;
  try {
    const res = await fetch(`${baseUrl}/api/users/${currentUserId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const raw = await res.json();
    const u   = raw.user || raw;
    if (u.profilePicture)
      document.getElementById("postModalAvatar").src = u.profilePicture;
    if (u.fullName)
      document.getElementById("postModalName").textContent = u.fullName;
  } catch {}
}

document.getElementById("postRegion").addEventListener("change", function () {
  document.getElementById("postModalRegionPreview").textContent =
    this.value ? `· ${this.value}` : "";
});

document.getElementById("postModalMediaBtn").addEventListener("click",
  () => document.getElementById("postModalMedia").click()
);

document.getElementById("postModalMedia").addEventListener("change", function () {
  const files   = Array.from(this.files);
  const preview = document.getElementById("postModalPreview");
  preview.innerHTML = "";
  if (!files.length) return;

  const imgs = files.filter(f => f.type.startsWith("image/"));
  const vids = files.filter(f => f.type.startsWith("video/"));

  if (vids.length > 1) { showToast("One video per post only."); this.value = ""; return; }
  if (imgs.length && vids.length) { showToast("Cannot mix images and video."); this.value = ""; return; }

  if (vids.length) {
    const v = document.createElement("video");
    v.src = URL.createObjectURL(vids[0]); v.controls = true;
    preview.appendChild(v);
  } else {
    imgs.forEach(img => {
      const el = document.createElement("img");
      el.src   = URL.createObjectURL(img);
      preview.appendChild(el);
    });
  }

  const rm       = document.createElement("button");
  rm.textContent = "✕ Remove Media"; rm.className = "remove-media-btn";
  rm.onclick     = () => { preview.innerHTML = ""; document.getElementById("postModalMedia").value = ""; };
  preview.prepend(rm);
});

document.getElementById("submitExplorePost").addEventListener("click", async () => {
  const title    = document.getElementById("postTitle").value.trim();
  const body     = document.getElementById("postBody").value.trim();
  const category = document.getElementById("postCategory").value;
  const region   = document.getElementById("postRegion").value;
  const files    = document.getElementById("postModalMedia").files;

  if (!body && !files.length) {
    document.getElementById("postModalError").textContent = "Write something or add media."; return;
  }
  if (!category) {
    document.getElementById("postModalError").textContent = "Please select a category."; return;
  }
  if (!region) {
    document.getElementById("postModalError").textContent = "Please select a region."; return;
  }

  const btn     = document.getElementById("submitExplorePost");
  const btnText = document.getElementById("postModalBtnText");
  const spinner = document.getElementById("postModalSpinner");
  btn.disabled = true;
  btnText.textContent = "Posting...";
  spinner.classList.remove("hidden");

  try {
    const fd = new FormData();
    if (title) fd.append("title", title);
    if (body)  fd.append("text",  body);
    fd.append("category", category);
    fd.append("region",   region);
    for (let i = 0; i < files.length; i++) fd.append("media", files[i]);

    const res     = await fetch(`${baseUrl}/api/explore`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    });
    if (!res.ok) throw new Error();
    const newPost = await res.json();

    closePostModal();
    showToast("✅ Post published!", "#22C55E");

    setTab("post");
    showFeedWrap("post");

    const postFeed = document.getElementById("postFeed");
    const post     = newPost.post || newPost;
    const loaderEl = document.getElementById("postFeedLoader");
    if (loaderEl) loaderEl.style.display = "none";

    if (post && post._id) {
      post.user = post.user || {
        _id: currentUserId,
        fullName: document.getElementById("postModalName")?.textContent || "You",
        profilePicture: document.getElementById("postModalAvatar")?.src || "",
        isVerified: false
      };
      const card  = renderCard(post, false);
      const first = postFeed.querySelector(".explore-card");
      if (first) postFeed.insertBefore(card, first);
      else       postFeed.appendChild(card);
      initSlidersIn(card);
      initVideosIn(card);
      initViewsIn(card);
      postFeed.querySelector(".feed-empty")?.remove();
      feedLoaded.post = true;
    } else {
      feedLoaded.post = false;
      loadFeed("post");
    }
  } catch {
    document.getElementById("postModalError").textContent = "Failed to post. Try again.";
  } finally {
    btn.disabled = false;
    btnText.textContent = "Post";
    spinner.classList.add("hidden");
  }
});

// ══════════════════════════════════════════════
//  RENDER CARD
// ══════════════════════════════════════════════
function renderCard(post, isQuestion) {
  const user      = post.user || {};
  const hasText   = !!(post.text && post.text.trim());
  const hasTitle  = !!(post.title && post.title.trim());
  const hasImages = Array.isArray(post.images) && post.images.length > 0;
  const hasVideo  = typeof post.video === "string" && post.video.trim() !== "";

  const likeCount = post.likeCount || 0;
  const starCount = post.starCount || 0;
  const cmtCount   = post.commentCount || 0;
  const views      = post.viewCount || 0;
  const upvotes    = post.upvoteCount || 0;
  const downvotes  = post.downvoteCount || 0;
  const totalVotes = upvotes + downvotes;

  const isLiked     = (post.likedBy     || []).includes(currentUserId);
  const isStarred   = (post.starredBy   || []).includes(currentUserId);
  const isUpvoted   = (post.upvotedBy   || []).includes(currentUserId);
  const isDownvoted = (post.downvotedBy || []).includes(currentUserId);

  let mediaHtml = "";
  if (hasImages) {
    mediaHtml = `
      <div class="ec-media">
        <div class="image-slider-wrapper">
          <div class="image-slider">
            ${post.images.map((img, i) =>
              `<img src="${getMediaUrl(img)}" class="slide"
                style="display:${i === 0 ? "block" : "none"};" />`
            ).join("")}
          </div>
          ${post.images.length > 1
            ? `<div class="image-counter">1 / ${post.images.length}</div>`
            : ""}
        </div>
      </div>`;
  } else if (hasVideo) {
    mediaHtml = `
      <div class="ec-media">
        <div class="ec-media-video-wrap">
          <video src="${getMediaUrl(post.video)}" muted playsinline></video>
          <button class="mute-btn">🔇</button>
        </div>
      </div>`;
  }

  const card = document.createElement("div");
  card.className      = "explore-card";
  card.dataset.postId = post._id;

  card.innerHTML = `
    ${isQuestion ? `
      <div class="ec-question-badge">
        <svg viewBox="0 0 24 24" width="11" height="11"
          fill="none" stroke="#000A23" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9 9a3 3 0 0 1 6 0c0 2-3 3-3 5"/>
          <circle cx="12" cy="17" r="1" fill="#000A23"/>
        </svg>
        Question
      </div>` : ""}

    <div class="ec-header">
      <a href="/profile.html?userId=${user._id || ""}">
        <img class="ec-avatar"
          src="${user.profilePicture || '/uploads/images/africa.png'}" />
      </a>
      <div class="ec-header-info">
        <div class="ec-name">
          <a href="/profile.html?userId=${user._id || ""}">
            ${user.fullName || "AfriExplorer"}
          </a>
          ${user.isVerified ? verifiedSvg() : ""}
          ${getFlagEmoji(user.country)}
          ${user.username
            ? `<span style="color:#9CA3AF;font-weight:400;font-size:13px;">@${user.username}</span>`
            : ""}
        </div>
        <div class="ec-username-time">
          <span>${timeAgo(post.createdAt || new Date())}</span>
        </div>
      </div>
      <button class="ec-share-btn" title="Share">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
          stroke="#374151" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </button>
    </div>

    ${hasTitle ? `<p class="ec-title">${post.title}</p>` : ""}
    ${hasText  ? `<p class="ec-body">${linkify(post.text)}</p>` : ""}
    ${mediaHtml}

    ${(post.category || post.region) ? `
      <div class="ec-meta-row">
        ${post.category
          ? `<span class="ec-category">${CATEGORY_LABELS[post.category] || post.category}</span>`
          : ""}
        ${post.category && post.region ? `<span class="ec-meta-dot">•</span>` : ""}
        ${post.region ? `<span class="ec-region">${post.region}</span>` : ""}
      </div>` : ""}

    <div class="ec-stats">
      <span class="ec-stat-pill">views ${views}</span>
      <span class="ec-stat-pill">comments ${cmtCount}</span>
      <span class="ec-stat-pill">total votes ${totalVotes}</span>
    </div>

    <div class="ec-vote-row">
      <button class="ec-vote-btn upvote-btn ${isUpvoted ? "upvoted" : ""}">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
        </svg>
        Upvote
      </button>
      <button class="ec-vote-btn downvote-btn ${isDownvoted ? "downvoted" : ""}">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
        </svg>
        Downvote
      </button>

      <button class="ec-comment-btn">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
          stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="cmt-count">${cmtCount}</span>
      </button>

      ${isQuestion
        ? `<button class="ec-answer-btn">Answer</button>`
        : `<button class="ec-like-btn ${isLiked ? "liked" : ""}">
             <svg viewBox="0 0 24 24">
               <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
             </svg>
             <span class="like-count">${likeCount}</span>
           </button>
           <button class="ec-star-btn ${isStarred ? "starred" : ""}">
             <svg viewBox="0 0 24 24">
               <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
             </svg>
             <span class="star-count">${starCount}</span>
           </button>`}
    </div>
  `;

  return card;
}

// ══════════════════════════════════════════════
//  LOAD FEED
// ══════════════════════════════════════════════
async function loadFeed(tab) {
  if (tab === "community") return;

  const feedEl   = document.getElementById(`${tab}Feed`);
  const loaderEl = document.getElementById(`${tab}FeedLoader`);

  feedEl.innerHTML = "";
  loaderEl.style.display = "flex";

  try {
    const res = await fetch(
      `${baseUrl}/api/explore/feed?page=1&limit=20`,
      { headers: { Authorization: token ? `Bearer ${token}` : "" } }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    let posts  = data.posts || data || [];
    if (!Array.isArray(posts)) posts = [];

    if (tab === "ask") {
      posts = posts.filter(p => p.isQuestion === true);
    } else {
      posts = posts.filter(p => !p.isQuestion);
    }

    loaderEl.style.display = "none";
    feedEl.innerHTML = "";

    if (!posts.length) {
      feedEl.innerHTML = `
        <div class="feed-empty">
          ${tab === "ask"
            ? `No questions yet.<br>Tap <b>+</b> to ask the first! ❓`
            : `No posts yet.<br>Tap <b>+</b> to share! 🌍`}
        </div>`;
      feedLoaded[tab] = true;
      return;
    }

    posts.forEach(post => {
      const card = renderCard(post, post.isQuestion === true);
      feedEl.appendChild(card);
    });

    initSlidersIn(feedEl);
    initVideosIn(feedEl);
    initViewsIn(feedEl);
    feedLoaded[tab] = true;

  } catch (err) {
    console.error(`loadFeed(${tab}) error:`, err);
    loaderEl.style.display = "none";
    feedEl.innerHTML = `
      <div class="feed-empty">
        Could not load. Check your connection and try again.
        <br><br>
        <button onclick="loadFeed('${tab}')"
          style="background:#000A23;color:#fff;border:none;
          border-radius:20px;padding:10px 20px;font-size:14px;
          cursor:pointer;font-family:inherit;">
          Retry
        </button>
      </div>`;
  }
}

// ══════════════════════════════════════════════
//  INTERACTIONS
// ══════════════════════════════════════════════
document.addEventListener("click", async e => {
  const card = e.target.closest(".explore-card");
  if (!card) return;
  const postId = card.dataset.postId;

  // Upvote
  if (e.target.closest(".upvote-btn")) {
    if (!requireLogin()) return;
    const btn = e.target.closest(".upvote-btn");
    try {
      const res  = await fetch(
        `${baseUrl}/api/explore/${postId}/upvote`,
        { method:"POST", headers:{ Authorization:`Bearer ${token}` } }
      );
      const data = await res.json();
      btn.classList.toggle("upvoted", !!data.upvoted);
      card.querySelector(".downvote-btn")?.classList.remove("downvoted");
      updateVotePills(card, data);
    } catch { btn.classList.toggle("upvoted"); }
  }

  // Downvote
  if (e.target.closest(".downvote-btn")) {
    if (!requireLogin()) return;
    const btn = e.target.closest(".downvote-btn");
    try {
      const res  = await fetch(
        `${baseUrl}/api/explore/${postId}/downvote`,
        { method:"POST", headers:{ Authorization:`Bearer ${token}` } }
      );
      const data = await res.json();
      btn.classList.toggle("downvoted", !!data.downvoted);
      card.querySelector(".upvote-btn")?.classList.remove("upvoted");
      updateVotePills(card, data);
    } catch { btn.classList.toggle("downvoted"); }
  }

  // Like
  if (e.target.closest(".ec-like-btn")) {
    if (!requireLogin()) return;
    const btn = e.target.closest(".ec-like-btn");
    try {
      const res  = await fetch(
        `${baseUrl}/api/explore/${postId}/like`,
        { method:"POST", headers:{ Authorization:`Bearer ${token}` } }
      );
      const data = await res.json();
      btn.querySelector(".like-count").textContent = data.likeCount;
      btn.classList.toggle("liked", data.liked);
    } catch {}
  }

  // Star
  if (e.target.closest(".ec-star-btn")) {
    if (!requireLogin()) return;
    const btn = e.target.closest(".ec-star-btn");
    try {
      const res  = await fetch(
        `${baseUrl}/api/explore/${postId}/star`,
        { method:"POST", headers:{ Authorization:`Bearer ${token}` } }
      );
      const data = await res.json();
      btn.querySelector(".star-count").textContent = data.starCount;
      btn.classList.toggle("starred", data.starred);
    } catch {}
  }

  // Comment or Answer
  if (e.target.closest(".ec-comment-btn") || e.target.closest(".ec-answer-btn")) {
    if (!requireLogin()) return;
    openCommentModal(postId, card);
  }

  // Share
  if (e.target.closest(".ec-share-btn")) {
    const url = `${location.origin}/view-post.html?postId=${postId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "AfriExplore post", url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast("Link copied!");
      }
    } catch {}
  }
});

function updateVotePills(card, data) {
  const up   = data.upvotes   || 0;
  const down = data.downvotes || 0;
  card.querySelectorAll(".ec-stat-pill").forEach(pill => {
    if (pill.textContent.startsWith("total votes"))
      pill.textContent = `total votes ${up + down}`;
  });
}

// ══════════════════════════════════════════════
//  COMMENT MODAL
// ══════════════════════════════════════════════
const commentModal   = document.getElementById("commentModal");
const commentList    = document.getElementById("commentList");
const commentInput   = document.getElementById("commentInput");
const sendCommentBtn = document.getElementById("sendCommentBtn");
let activePostId, activeCommentBtn;

document.getElementById("closeCommentModal").onclick = () => {
  commentModal.style.display = "none";
};

function openCommentModal(postId, cardEl) {
  activePostId     = postId;
  activeCommentBtn = cardEl?.querySelector(".ec-comment-btn");
  commentModal.style.display = "flex";
  commentList.innerHTML      = "";
  loadComments(postId);
}

function renderCommentItem(c) {
  const div     = document.createElement("div");
  div.className = "comment-item";
  div.innerHTML = `
    <img src="${c.user?.profilePicture || '/uploads/images/africa.png'}" />
    <div class="comment-bubble">
      <strong>${c.user?.fullName || "User"}</strong>
      <p>${linkify(c.text)}</p>
      <small>${timeAgo(c.createdAt)}</small>
    </div>`;
  commentList.appendChild(div);
}

async function loadComments(postId) {
  try {
    const res  = await fetch(
      `${baseUrl}/api/explore/comments/${postId}`,
      { headers: { Authorization: token ? `Bearer ${token}` : "" } }
    );
    const data = await res.json();
    commentList.innerHTML = "";
    if (!data.length) {
      commentList.innerHTML =
        `<p style="text-align:center;color:#9CA3AF;padding:24px;font-size:14px;">No comments yet 💬</p>`;
      return;
    }
    data.filter(c => !c.parentComment).forEach(renderCommentItem);
  } catch {}
}

sendCommentBtn.onclick = async () => {
  const text = commentInput.value.trim();
  if (!text || !requireLogin()) return;
  try {
    const res = await fetch(
      `${baseUrl}/api/explore/comments/${activePostId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      }
    );
    const c     = await res.json();
    const empty = commentList.querySelector("p");
    if (empty) empty.remove();
    renderCommentItem(c);
    commentInput.value = "";

    if (activeCommentBtn) {
      const cnt = activeCommentBtn.querySelector(".cmt-count");
      if (cnt) cnt.textContent = parseInt(cnt.textContent || "0") + 1;
    }

    const card = document.querySelector(`.explore-card[data-post-id="${activePostId}"]`);
    if (card) {
      card.querySelectorAll(".ec-stat-pill").forEach(pill => {
        if (pill.textContent.startsWith("comments")) {
          const n = parseInt(pill.textContent.replace("comments ", "")) + 1;
          pill.textContent = `comments ${n}`;
        }
      });
    }
  } catch {}
};

// ══════════════════════════════════════════════
//  IMAGE SLIDER
// ══════════════════════════════════════════════
function initSlidersIn(container) {
  container.querySelectorAll(".image-slider-wrapper").forEach(w => {
    if (w.dataset.init) return;
    w.dataset.init = "1";
    const slides = w.querySelectorAll(".slide");
    let cur      = 0;
    slides.forEach((s, i) => s.style.display = i === 0 ? "block" : "none");
    const counter = w.querySelector(".image-counter");

    function go(d) {
      slides[cur].style.display = "none";
      cur = (cur + d + slides.length) % slides.length;
      slides[cur].style.display = "block";
      if (counter) counter.textContent = `${cur+1} / ${slides.length}`;
    }

    w.querySelector(".image-slider")?.addEventListener("click", () => {
      if (slides.length > 1) go(1);
    });

    let sx = 0;
    w.addEventListener("touchstart", e => sx = e.touches[0].clientX);
    w.addEventListener("touchend", e => {
      const dx = e.changedTouches[0].clientX - sx;
      if (slides.length < 2) return;
      if (dx < -50) go(1); if (dx > 50) go(-1);
    });
  });
}

// ══════════════════════════════════════════════
//  VIEWS TRACKING
//  Fires POST /api/explore/:id/view when a card
//  is ≥50% visible for ≥1.5s. Each post is only
//  counted once per page-load (viewedPosts Set).
// ══════════════════════════════════════════════
const viewedPosts = new Set();

async function sendView(postId, card) {
  if (viewedPosts.has(postId)) return;
  viewedPosts.add(postId);

  try {
    const res = await fetch(
      `${baseUrl}/api/explore/${postId}/view`,
      {
        method:  "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      }
    );
    if (!res.ok) return;
    const data = await res.json();

    const viewCount = typeof data.views === "number"
      ? data.views
      : (Array.isArray(data.views) ? data.views.length : null);

    if (viewCount !== null) {
      card.querySelectorAll(".ec-stat-pill").forEach(pill => {
        if (/^views\s/.test(pill.textContent)) {
          pill.textContent = `views ${viewCount}`;
          pill.classList.add("views-updated");
          setTimeout(() => pill.classList.remove("views-updated"), 700);
        }
      });
    }
  } catch {
    // silently ignore — view tracking should never break UX
  }
}

const viewTimers = new WeakMap();

const viewObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const card   = entry.target;
    const postId = card.dataset.postId;
    if (!postId) return;

    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
      if (!viewTimers.has(card)) {
        const tid = setTimeout(() => {
          sendView(postId, card);
          viewTimers.delete(card);
        }, 1500);
        viewTimers.set(card, tid);
      }
    } else {
      const tid = viewTimers.get(card);
      if (tid) {
        clearTimeout(tid);
        viewTimers.delete(card);
      }
    }
  });
}, { threshold: 0.5 });

function initViewsIn(container) {
  container.querySelectorAll(".explore-card[data-post-id]").forEach(card => {
    if (card.dataset.viewInit) return;
    card.dataset.viewInit = "1";
    viewObserver.observe(card);
  });
}

// ══════════════════════════════════════════════
//  VIDEO
// ══════════════════════════════════════════════
const videoObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.play().catch(()=>{});
    else { e.target.pause(); e.target.currentTime = 0; }
  });
}, { threshold: 0.3 });

function initVideosIn(container) {
  container.querySelectorAll(".ec-media-video-wrap").forEach(w => {
    if (w.dataset.init) return;
    w.dataset.init = "1";
    const video   = w.querySelector("video");
    const muteBtn = w.querySelector(".mute-btn");
    if (!video) return;
    video.muted = true;
    video.addEventListener("click", () =>
      video.paused ? video.play() : video.pause()
    );
    muteBtn?.addEventListener("click", e => {
      e.stopPropagation();
      video.muted = !video.muted;
      muteBtn.textContent = video.muted ? "🔇" : "🔊";
    });
    videoObserver.observe(video);
  });
}

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════
showSearchHome();
loadFeed("ask");
loadFeed("post");