/* ============================================================
   post-composer.js — shared X-style "Post" composer.
   Injects the modal into any page that doesn't already have one,
   wires it to the shared sidebar Post button (xnPostBtn) and the
   `open-create-post` event, fetches the user avatar, and POSTs
   to /api/posts using the same FormData contract as feed.js.
   ============================================================ */
(function () {
  "use strict";

  // Skip if the host page already provides its own composer (e.g. feed.html)
  if (document.getElementById("postModal")) return;

  var BASE = (window.AFRI_API_BASE) || "https://afrisocial-backend.onrender.com";
  var token  = localStorage.getItem("token");
  var userId = localStorage.getItem("userId");
  var MAX_CHARS = 500;

  var MODAL_HTML = ''
    + '<div class="xp-overlay" id="postModalOverlay"></div>'
    + '<div class="xp-modal" id="postModal" role="dialog" aria-modal="true">'
    +   '<div class="xp-header">'
    +     '<button class="xp-close" id="cancelPost" aria-label="Close">'
    +       '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"/></svg>'
    +     '</button>'
    +     '<button class="xp-drafts" type="button">Drafts</button>'
    +   '</div>'
    +   '<div class="xp-body">'
    +     '<div class="xp-row">'
    +       '<img src="/uploads/images/africa.png" id="sheetAvatar" class="xp-avatar" alt="" />'
    +       '<div class="xp-row-main">'
    +         '<button class="xp-audience" type="button"><span>Everyone</span></button>'
    +         '<textarea id="postInput" class="xp-input" placeholder="What\'s happening?" maxlength="500" rows="4"></textarea>'
    +         '<div id="mediaPreview" class="media-preview-container"></div>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    +   '<div class="xp-footer">'
    +     '<div class="xp-tools">'
    +       '<input type="file" id="postMedia" accept="image/*" multiple hidden />'
    +       '<input type="file" id="postVideoMedia" accept="video/*" hidden />'
    +       '<button type="button" class="xp-tool-btn" id="mediaUploadBtn" aria-label="Add image">'
    +         '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.75 2H4.25C3.01 2 2 3.01 2 4.25v15.5C2 20.99 3.01 22 4.25 22h15.5c1.24 0 2.25-1.01 2.25-2.25V4.25C22 3.01 20.99 2 19.75 2zM4.25 3.5h15.5c.41 0 .75.34.75.75v9.91l-2.97-2.96c-.29-.3-.77-.3-1.06 0L10.94 17.7l-3.5-3.5c-.29-.29-.77-.29-1.06 0l-2.88 2.88V4.25c0-.41.34-.75.75-.75zm5 6.5C9.25 11.24 8.24 12.25 7 12.25S4.75 11.24 4.75 10 5.76 7.75 7 7.75 9.25 8.76 9.25 10z"/></svg>'
    +       '</button>'
    +       '<button type="button" class="xp-tool-btn" id="videoUploadBtn" aria-label="Add video">'
    +         '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M5.5 5h9c.83 0 1.5.67 1.5 1.5v2.34l4.22-2.43c.48-.28 1.07-.28 1.55 0 .48.28.78.79.78 1.34v8.5c0 .55-.3 1.06-.78 1.34a1.56 1.56 0 01-1.55 0L16 15.16V17.5c0 .83-.67 1.5-1.5 1.5h-9C4.67 19 4 18.33 4 17.5v-11C4 5.67 4.67 5 5.5 5z"/></svg>'
    +       '</button>'
    +     '</div>'
    +     '<div class="xp-submit-wrap">'
    +       '<span id="pcCounter" class="pc-counter" hidden>0</span>'
    +       '<button class="xp-post-btn" id="postBtn" disabled>'
    +         '<span id="postBtnText">Post</span>'
    +         '<span id="postSpinner" class="spinner" style="display:none;"></span>'
    +       '</button>'
    +     '</div>'
    +   '</div>'
    + '</div>';

  function mount() {
    var holder = document.createElement("div");
    holder.innerHTML = MODAL_HTML;
    while (holder.firstChild) document.body.appendChild(holder.firstChild);

    var overlay   = document.getElementById("postModalOverlay");
    var modal     = document.getElementById("postModal");
    var cancelBtn = document.getElementById("cancelPost");
    var input     = document.getElementById("postInput");
    var postBtn   = document.getElementById("postBtn");
    var postBtnText = document.getElementById("postBtnText");
    var spinner   = document.getElementById("postSpinner");
    var counter   = document.getElementById("pcCounter");
    var media     = document.getElementById("postMedia");
    var videoMedia= document.getElementById("postVideoMedia");
    var preview   = document.getElementById("mediaPreview");
    var avatarImg = document.getElementById("sheetAvatar");
    var mediaBtn  = document.getElementById("mediaUploadBtn");
    var videoBtn  = document.getElementById("videoUploadBtn");

    function open() {
      modal.classList.add("open");
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
      setTimeout(function () { input.focus(); }, 50);
    }
    function close() {
      modal.classList.remove("open");
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }

    cancelBtn.addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });

    function updateBtn() {
      var len = (input.value || "").length;
      var hasMedia = (media.files && media.files.length) || (videoMedia.files && videoMedia.files.length);
      postBtn.disabled = (len === 0 && !hasMedia) || len > MAX_CHARS;
      if (len === 0) { counter.hidden = true; }
      else { counter.hidden = false; counter.textContent = String(MAX_CHARS - len); counter.classList.toggle("danger", len > MAX_CHARS - 20); }
    }
    input.addEventListener("input", updateBtn);

    mediaBtn.addEventListener("click", function () { videoMedia.value = ""; media.click(); });
    videoBtn.addEventListener("click", function () { media.value = ""; videoMedia.click(); });

    function clearMedia() {
      preview.innerHTML = ""; media.value = ""; videoMedia.value = ""; updateBtn();
    }
    media.addEventListener("change", function () {
      var files = Array.from(this.files || []).filter(function (f) { return f.type.indexOf("image/") === 0; });
      if (!files.length) return;
      preview.innerHTML = "";
      var grid = document.createElement("div"); grid.className = "image-preview-grid";
      files.forEach(function (f) { var i = document.createElement("img"); i.src = URL.createObjectURL(f); grid.appendChild(i); });
      var rm = document.createElement("button"); rm.textContent = "Remove"; rm.className = "remove-media-btn"; rm.onclick = clearMedia;
      preview.appendChild(rm); preview.appendChild(grid);
      updateBtn();
    });
    videoMedia.addEventListener("change", function () {
      var f = this.files && this.files[0]; if (!f) return;
      preview.innerHTML = "";
      var v = document.createElement("video"); v.src = URL.createObjectURL(f); v.controls = true; v.className = "preview-video";
      var rm = document.createElement("button"); rm.textContent = "Remove"; rm.className = "remove-media-btn"; rm.onclick = clearMedia;
      preview.appendChild(rm); preview.appendChild(v);
      updateBtn();
    });

    // Fetch avatar
    if (userId && token) {
      fetch(BASE + "/api/users/" + userId, { headers: { Authorization: "Bearer " + token } })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          var u = d && (d.user || d);
          if (u && u.profilePicture) avatarImg.src = u.profilePicture;
        })
        .catch(function () {});
    }

    postBtn.addEventListener("click", async function () {
      var text = (input.value || "").trim();
      if (text.length > MAX_CHARS) return;
      var images = media.files && media.files.length ? Array.from(media.files) : [];
      var video  = videoMedia.files && videoMedia.files[0] ? videoMedia.files[0] : null;
      var files = video ? [video] : images;
      if (!text && !files.length) return;
      if (!token) { alert("Please log in to post."); window.location.href = "/log-in.html"; return; }

      postBtn.disabled = true; postBtnText.textContent = "Posting..."; spinner.style.display = "inline-block";
      var fd = new FormData(); fd.append("text", text);
      for (var i = 0; i < files.length; i++) fd.append("media", files[i]);
      try {
        var res = await fetch(BASE + "/api/posts", { method: "POST", headers: { Authorization: "Bearer " + token }, body: fd });
        if (!res.ok) throw new Error("Post failed (" + res.status + ")");
        var newPost = await res.json();
        input.value = ""; clearMedia(); close();
        window.location.href = "/post-success.html?postId=" + (newPost && newPost._id ? newPost._id : "");
      } catch (err) {
        console.error("Create post error:", err);
        alert("Could not post. Please try again.");
      } finally {
        postBtn.disabled = false; postBtnText.textContent = "Post"; spinner.style.display = "none";
      }
    });

    // Wiring
    window.addEventListener("open-create-post", function () {
      var btn = document.getElementById("xnPostBtn");
      if (btn) btn.dataset.handled = "1";
      open();
    });
    if (location.hash === "#new") { setTimeout(open, 100); history.replaceState(null, "", location.pathname); }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
