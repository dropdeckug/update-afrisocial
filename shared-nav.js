/* ============================================================
   shared-nav.js — injects X-style sidebar + right rail.
   Usage in any page:
     <link rel="stylesheet" href="shared-nav.css">
     <div class="x-layout">
       <div data-shared-nav></div>
       <main class="feed-main">...page content...</main>
       <div data-shared-rightrail></div>      <!-- optional -->
     </div>
     <script src="shared-nav.js"></script>
   ============================================================ */
(function () {
  "use strict";

  const ICONS = {
    home:    '<svg viewBox="0 0 24 24"><path d="M12 1.696L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM12 16.5c-1.933 0-3.5-1.567-3.5-3.5s1.567-3.5 3.5-3.5 3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5z"/></svg>',
    explore: '<svg viewBox="0 0 24 24"><path d="M10.25 3.75a6.5 6.5 0 104.087 11.55l4.706 4.707 1.414-1.414-4.707-4.706A6.5 6.5 0 0010.25 3.75zm-4.5 6.5a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z"/></svg>',
    vybze:   '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    notif:   '<svg viewBox="0 0 24 24"><path d="M19.993 9.042C19.62 5.589 16.612 3 13.12 3h-2.24C7.385 3 4.378 5.589 4.007 9.042L3.598 12.85a8.34 8.34 0 01-1.4 3.715 1.687 1.687 0 001.21 2.642l3.469.434c.155 1.875 1.717 3.359 3.623 3.359h3a3.635 3.635 0 003.623-3.359l3.469-.434a1.687 1.687 0 001.21-2.642 8.34 8.34 0 01-1.4-3.715l-.409-3.808zM13.5 20h-3c-.79 0-1.469-.51-1.715-1.215l5.93-.741c-.246.705-.925 1.215-1.715 1.956z"/></svg>',
    chat:    '<svg viewBox="0 0 24 24"><path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5a.5.5 0 00-.5.5v2.764l8 3.638 8-3.636V5.5a.5.5 0 00-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5a.5.5 0 00.5.5h15a.5.5 0 00.5-.5v-8.037z"/></svg>',
    wallet:  '<svg viewBox="0 0 24 24"><path d="M3 6a3 3 0 013-3h12a3 3 0 013 3v1h-1a4 4 0 100 8h1v1a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm17 3v6h-3a3 3 0 110-6h3zm-3 2a1 1 0 100 2 1 1 0 000-2z"/></svg>',
    search:  '<svg viewBox="0 0 24 24"><path d="M10.25 3.75a6.5 6.5 0 104.087 11.55l4.706 4.707 1.414-1.414-4.707-4.706A6.5 6.5 0 0010.25 3.75zm-4.5 6.5a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z"/></svg>',
    profile: '<svg viewBox="0 0 24 24"><path d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zM12 4a4 4 0 100 8 4 4 0 000-8zM6 8a6 6 0 1112 0A6 6 0 016 8z"/></svg>',
    settings:'<svg viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.03-.66-.07-.98l2.11-1.65a.49.49 0 00.12-.61l-2-3.46a.5.5 0 00-.61-.22l-2.49 1a7.03 7.03 0 00-1.69-.98l-.38-2.65A.5.5 0 0014 2h-4a.5.5 0 00-.49.42l-.38 2.65c-.61.25-1.17.58-1.69.98l-2.49-1a.5.5 0 00-.61.22l-2 3.46a.5.5 0 00.12.61l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65a.49.49 0 00-.12.61l2 3.46c.14.24.43.34.7.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.04.24.25.42.49.42h4c.24 0 .45-.18.49-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1c.27.12.56.02.7-.22l2-3.46a.49.49 0 00-.12-.61l-2.11-1.65zM12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z"/></svg>',
    logo:    '<svg viewBox="0 0 24 24" fill="#0f1419"><circle cx="12" cy="12" r="11"/></svg>'
  };

  const ITEMS = [
    { key: "home",    href: "/feed.html",    label: "Home",         icon: ICONS.home,    match: ["/feed.html", "/"] },
    { key: "explore", href: "/explore.html", label: "Explore",      icon: ICONS.explore, match: ["/explore.html"] },
    { key: "vybze",   href: "/vybze.html",   label: "Vybze",        icon: ICONS.vybze,   match: ["/vybze.html", "/vybze-player.html"] },
    { key: "notif",   href: "/notification.html", label: "Notifications", icon: ICONS.notif, match: ["/notification.html"], badge: "notificationBadge" },
    { key: "chat",    href: "/message.html", label: "Messages",     icon: ICONS.chat,    match: ["/message.html"], badge: "messageBadge" },
    { key: "wallet",  href: "/wallet.html",  label: "Wallet",       icon: ICONS.wallet,  match: ["/wallet.html"] },
    { key: "profile", href: "/profile.html", label: "Profile",      icon: ICONS.profile, match: ["/profile.html"] },
    { key: "settings",href: "/settings.html",label: "Settings",     icon: ICONS.settings,match: ["/settings.html"] }
  ];

  // Mobile bottom-nav shows a curated subset.
  const MOBILE_KEYS = ["home", "explore", "vybze", "chat", "profile"];

  function currentPath() {
    let p = location.pathname || "/";
    if (p.endsWith("/")) p = p + "index.html";
    return p.toLowerCase();
  }

  function isActive(item, path) {
    return item.match.some(m => path === m.toLowerCase());
  }

  function logoHTML() {
    return (
      '<a href="/feed.html" class="xn-logo" aria-label="Afrisocial">' +
        '<img src="/image/afrisocial-logo.png" alt="Afrisocial" onerror="this.src=\'/Afrisocial.jpg\'" />' +
      '</a>'
    );
  }

  function itemHTML(item, active) {
    return (
      '<a href="' + item.href + '" class="xn-item' + (active ? ' active' : '') + '" data-key="' + item.key + '" aria-label="' + item.label + '">' +
        item.icon +
        '<span>' + item.label + '</span>' +
        (item.badge ? '<span id="' + item.badge + '" class="xn-badge" style="display:none;">0</span>' : '') +
      '</a>'
    );
  }

  function buildSidebarHTML() {
    const path = currentPath();
    const isMobile = window.matchMedia('(max-width: 1024px)').matches;
    const list = isMobile
      ? ITEMS.filter(i => MOBILE_KEYS.includes(i.key))
      : ITEMS;
    let html = logoHTML();
    list.forEach(i => { html += itemHTML(i, isActive(i, path)); });
    html += '<button class="xn-post-btn" type="button" id="xnPostBtn">Post</button>';
    return html;
  }

  function buildRightRailHTML() {
    return (
      '<section class="xn-card">' +
        '<h3>Trending in Africa</h3>' +
        '<div class="xn-trend"><span class="xn-trend-meta">Trending</span><strong>#Afrobeats</strong><span class="xn-trend-meta">128K posts</span></div>' +
        '<div class="xn-trend"><span class="xn-trend-meta">Sports · Trending</span><strong>#AFCON</strong><span class="xn-trend-meta">94.3K posts</span></div>' +
        '<div class="xn-trend"><span class="xn-trend-meta">Trending</span><strong>#Naija</strong><span class="xn-trend-meta">52.1K posts</span></div>' +
        '<div class="xn-trend"><span class="xn-trend-meta">Music · Trending</span><strong>#Amapiano</strong><span class="xn-trend-meta">41.8K posts</span></div>' +
        '<div class="xn-trend"><span class="xn-trend-meta">Trending</span><strong>#Lagos</strong><span class="xn-trend-meta">29K posts</span></div>' +
      '</section>' +
      '<section class="xn-card">' +
        '<h3>Who to follow</h3>' +
        '<div class="xn-follow">' +
          '<img src="/uploads/images/africa.png" alt="" onerror="this.src=\'/Afrisocial.jpg\'">' +
          '<div class="xn-follow-info"><strong>Afrisocial</strong><span>@afrisocial</span></div>' +
          '<button class="xn-follow-btn" type="button">Follow</button>' +
        '</div>' +
      '</section>' +
      '<p class="xn-legal">' +
        '<a href="/terms.html">Terms</a> · <a href="/privacy.html">Privacy</a> · <a href="/about.html">About</a><br>© 2026 Afrisocial' +
      '</p>'
    );
  }

  function mount() {
    // Mark body so shared-nav.css can suppress the global padding-left
    // (otherwise the .x-layout grid is pushed off-screen on desktop).
    if (document.querySelector('.x-layout')) {
      document.body.classList.add('xn-has-layout');
    }
    document.querySelectorAll('[data-shared-nav]').forEach(el => {
      el.outerHTML = '<nav class="xn-sidebar" data-xn-mounted>' + buildSidebarHTML() + '</nav>';
    });
    document.querySelectorAll('[data-shared-rightrail]').forEach(el => {
      el.outerHTML = '<aside class="xn-rightrail" data-xn-mounted>' + buildRightRailHTML() + '</aside>';
    });

    // Post button: dispatch event that pages can listen to, or fallback to /feed.html
    const postBtn = document.getElementById('xnPostBtn');
    if (postBtn) {
      postBtn.addEventListener('click', () => {
        const evt = new CustomEvent('open-create-post');
        window.dispatchEvent(evt);
        // Fallback if no handler exists on this page: jump to feed and open the modal there.
        setTimeout(() => {
          if (!postBtn.dataset.handled) {
            location.href = '/feed.html#new';
          }
        }, 50);
      });
    }
  }

  // Pages with their own create-post modal should mark the event as handled.
  window.addEventListener('open-create-post', () => {
    const btn = document.getElementById('xnPostBtn');
    if (btn) btn.dataset.handled = '1';
  }, true);

  // Re-render on resize across the desktop/mobile breakpoint.
  let wasDesktop = window.matchMedia('(min-width: 1025px)').matches;
  window.addEventListener('resize', () => {
    const isDesktop = window.matchMedia('(min-width: 1025px)').matches;
    if (isDesktop !== wasDesktop) {
      wasDesktop = isDesktop;
      const sidebar = document.querySelector('.xn-sidebar[data-xn-mounted]');
      if (sidebar) sidebar.innerHTML = buildSidebarHTML();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
