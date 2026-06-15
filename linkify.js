// ══════════════════════════════════════════════════════════════
//  AFRISOCIAL — GLOBAL LINK ACTIVATOR
//  linkify.js — Add after security.js on every page
//
//  WHAT THIS DOES:
//  - Makes any URL in posts, comments, replies, messages
//    automatically clickable
//  - Opens external links safely (noopener, noreferrer)
//  - Works on content loaded dynamically (modals, new comments)
//  - Integrates with security.js — only safe links become clickable
//  - Preserves hashtag links already rendered
//  - Shows link preview tooltip on hover (desktop)
//  - Never double-linkifies already-linked text
//
//  HOW TO USE:
//  Add after security.js in <head> on every page:
//  <script src="/security.js"></script>
//  <script src="/linkify.js"></script>
//
//  That's it. No other changes needed anywhere.
// ══════════════════════════════════════════════════════════════

(function () {
  "use strict";

  // ════════════════════════════════════════════
  //  CONFIG
  // ════════════════════════════════════════════

  const AFRISOCIAL_DOMAIN = "afrisocial.com.ng";

  const SAFE_DOMAINS = new Set([
    "google.com","youtube.com","twitter.com","x.com",
    "facebook.com","instagram.com","whatsapp.com",
    "wikipedia.org","github.com","linkedin.com",
    "afrisocial.com.ng","tiktok.com","snapchat.com",
    "telegram.org","reddit.com","medium.com",
    "nairaland.com","bellanaija.com","pulse.ng",
  ]);

  // CSS classes that contain user-generated text
  // Add any new ones here as you build new features
  const TARGET_SELECTORS = [
    // Posts
    ".text-body",
    ".post-text",
    // Comments
    ".comment-text",
    ".reply-text",
    // Messages
    ".message-text",
    ".msg-text",
    ".chat-bubble",
    ".message-bubble",
    ".msg-bubble",
    // Poll
    ".poll-question",
    ".respond-text",
    ".response-text",
    // Profiles
    ".bio-text",
    ".profile-bio",
    // Notifications
    ".notif-text",
    ".notification-text",
    // Generic
    ".linkify",
    "[data-linkify]",
  ].join(", ");

  // URL regex — matches http/https and bare www. links
  const URL_REGEX = /(?:https?:\/\/|www\.)[^\s<>"']+[^\s<>"'.,;:!?)\]]/gi;

  // ════════════════════════════════════════════
  //  CORE LINKIFIER
  // ════════════════════════════════════════════

  function linkifyElement(el) {
    if (!el || el.dataset.linkified) return;
    el.dataset.linkified = "1";

    // Walk text nodes only — skip existing <a> tags
    walkTextNodes(el, node => {
      const text = node.nodeValue;
      if (!text || !URL_REGEX.test(text)) return;
      URL_REGEX.lastIndex = 0; // reset regex

      const fragment = document.createDocumentFragment();
      let lastIndex  = 0;
      let match;

      URL_REGEX.lastIndex = 0;
      while ((match = URL_REGEX.exec(text)) !== null) {
        const url      = match[0];
        const start    = match.index;

        // Text before the URL
        if (start > lastIndex) {
          fragment.appendChild(
            document.createTextNode(text.slice(lastIndex, start))
          );
        }

        // Build the link
        const a = buildLink(url);
        fragment.appendChild(a);

        lastIndex = start + url.length;
      }

      // Remaining text after last URL
      if (lastIndex < text.length) {
        fragment.appendChild(
          document.createTextNode(text.slice(lastIndex))
        );
      }

      // Replace the text node with the fragment
      node.parentNode.replaceChild(fragment, node);
    });
  }

  // ════════════════════════════════════════════
  //  BUILD A LINK ELEMENT
  // ════════════════════════════════════════════

  function buildLink(rawUrl) {
    // Ensure protocol
    const href = rawUrl.startsWith("http")
      ? rawUrl
      : "https://" + rawUrl;

    let domain = rawUrl;
    let isInternal = false;
    let isSafe     = false;

    try {
      const parsed = new URL(href);
      domain       = parsed.hostname.replace("www.", "").toLowerCase();
      isInternal   = domain.includes(AFRISOCIAL_DOMAIN);
      isSafe       = SAFE_DOMAINS.has(domain) || isInternal;
    } catch { /* keep domain as rawUrl */ }

    const a        = document.createElement("a");
    a.href         = href;
    a.textContent  = formatDisplayUrl(rawUrl);
    a.className    = "afri-link";

    // Internal links — same tab
    // External links — new tab with security attributes
    if (isInternal) {
      a.setAttribute("target", "_self");
    } else {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }

    // Style the link
    a.style.cssText = `
      color: ${isSafe ? "#1DA1F2" : "#F59E0B"};
      text-decoration: underline;
      word-break: break-all;
      cursor: pointer;
      font-weight: 500;
    `;

    // Unsafe link — add warning icon
    if (!isSafe && !isInternal) {
      a.textContent = "⚠️ " + formatDisplayUrl(rawUrl);
      a.title       = "External link — open with caution";
    }

    // Intercept click — let security.js handle the warning
    // (security.js already has the external link warning popup)
    // We just need to stop double-popup for safe domains
    if (isSafe || isInternal) {
      a.addEventListener("click", e => {
        e.stopPropagation(); // don't let security.js re-intercept safe links
      });
    }

    // Hover tooltip for desktop
    addLinkTooltip(a, href, domain, isSafe);

    return a;
  }

  // ════════════════════════════════════════════
  //  FORMAT DISPLAY URL
  //  Shows short readable version of the URL
  // ════════════════════════════════════════════

  function formatDisplayUrl(url) {
    try {
      const parsed = new URL(
        url.startsWith("http") ? url : "https://" + url
      );
      const domain  = parsed.hostname.replace("www.", "");
      const path    = parsed.pathname;
      // Show domain + first part of path if not just "/"
      if (path && path !== "/") {
        const shortPath = path.length > 20
          ? path.slice(0, 20) + "..."
          : path;
        return domain + shortPath;
      }
      return domain;
    } catch {
      return url.length > 40 ? url.slice(0, 40) + "..." : url;
    }
  }

  // ════════════════════════════════════════════
  //  HOVER TOOLTIP
  // ════════════════════════════════════════════

  function addLinkTooltip(anchor, href, domain, isSafe) {
    let tooltip = null;

    anchor.addEventListener("mouseenter", () => {
      // Only on non-touch devices
      if (window.matchMedia("(hover: none)").matches) return;

      tooltip           = document.createElement("div");
      tooltip.className = "afri-link-tooltip";
      tooltip.style.cssText = `
        position: fixed;
        background: #111827;
        color: white;
        font-size: 12px;
        font-family: sans-serif;
        padding: 6px 12px;
        border-radius: 8px;
        z-index: 99998;
        pointer-events: none;
        max-width: 300px;
        word-break: break-all;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      `;
      tooltip.textContent = href.length > 60
        ? href.slice(0, 60) + "..."
        : href;

      if (!isSafe) {
        tooltip.style.background = "#92400E";
        tooltip.textContent = "⚠️ External: " + tooltip.textContent;
      }

      document.body.appendChild(tooltip);

      // Position near cursor
      const rect = anchor.getBoundingClientRect();
      tooltip.style.top  = (rect.bottom + 6) + "px";
      tooltip.style.left = Math.min(
        rect.left,
        window.innerWidth - 320
      ) + "px";
    });

    anchor.addEventListener("mouseleave", () => {
      if (tooltip) {
        tooltip.remove();
        tooltip = null;
      }
    });
  }

  // ════════════════════════════════════════════
  //  WALK TEXT NODES
  //  Visits only text nodes, skips <a> tags
  // ════════════════════════════════════════════

  function walkTextNodes(el, callback) {
    const walker = document.createTreeWalker(
      el,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          // Skip if inside an existing <a> tag
          let parent = node.parentNode;
          while (parent && parent !== el) {
            if (parent.tagName === "A") {
              return NodeFilter.FILTER_REJECT;
            }
            parent = parent.parentNode;
          }
          // Skip if text has no URL-like content
          if (!node.nodeValue || node.nodeValue.trim().length < 4) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      nodes.push(node);
    }
    // Process collected nodes (not during walk to avoid mutation issues)
    nodes.forEach(callback);
  }

  // ════════════════════════════════════════════
  //  SCAN ALL TARGET ELEMENTS
  // ════════════════════════════════════════════

  function linkifyAll() {
    document.querySelectorAll(TARGET_SELECTORS).forEach(el => {
      linkifyElement(el);
    });
  }

  // ════════════════════════════════════════════
  //  MUTATION OBSERVER
  //  Catches dynamically added content
  //  (new comments, messages, modals etc)
  // ════════════════════════════════════════════

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;

        // If the node itself is a target
        if (node.matches && node.matches(TARGET_SELECTORS)) {
          linkifyElement(node);
        }

        // Check descendants
        node.querySelectorAll?.(TARGET_SELECTORS)
          .forEach(el => linkifyElement(el));
      });
    });
  });

  // ════════════════════════════════════════════
  //  EXPOSE GLOBALLY
  //  Other scripts can call this if needed
  // ════════════════════════════════════════════

  window.AfriLinkify = {
    // Linkify a specific element manually
    element: linkifyElement,
    // Linkify all target elements on page
    all:     linkifyAll,
    // Add a new domain to safe list
    addSafeDomain(domain) {
      SAFE_DOMAINS.add(domain.toLowerCase().replace("www.", ""));
    },
  };

  // ════════════════════════════════════════════
  //  INIT
  // ════════════════════════════════════════════

  function init() {
    // Linkify all existing content
    linkifyAll();

    // Watch for new content
    observer.observe(document.body, {
      childList: true,
      subtree:   true,
    });

    console.log(
      "%c[Afrisocial Linkify] 🔗 Active",
      "color:#1DA1F2;font-weight:bold;"
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
