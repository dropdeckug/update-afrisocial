// ══════════════════════════════════════════════════════════════
//  AFRISOCIAL — GLOBAL SECURITY LAYER
//  security.js — Link this file on EVERY page BEFORE other scripts
//
//  WHAT THIS DOES:
//  - Validates every input/textarea on every page automatically
//  - Blocks XSS / code injection attempts
//  - Detects and blocks malicious links
//  - Detects hate speech and bad language (with tolerance)
//  - Intercepts every fetch() call and sanitizes outgoing data
//  - Shows user-friendly warnings without breaking anything
//  - Logs violations silently to backend
//
//  HOW TO USE:
//  Add this ONE line inside <head> on every HTML page:
//  <script src="/security.js"></script>
//
//  That's it. No other changes needed on any page.
// ══════════════════════════════════════════════════════════════

(function () {
  "use strict";

  const API_BASE = "https://afrisocial-backend-dev-production.up.railway.app";

  // ════════════════════════════════════════════
  //  SECTION 1 — BAD WORD LIST
  //  Not too strict — only clear violations
  // ════════════════════════════════════════════

  const BAD_WORDS = new Set([
    // English profanity
    "fuck","shit","bitch","asshole","bastard",
    "cunt","dick","pussy","cock","whore","slut",
    // Hate slurs — always severe
    "nigger","nigga","faggot","retard",
    "kike","spic","chink","wetback","raghead",
    // Pidgin English
    "mumu","oloshi","olosho","ashawo","werey",
    "omoale","omo ale","ole",
  ]);

  const HATE_SLURS = new Set([
    "nigger","faggot","kike","spic",
    "chink","wetback","raghead",
  ]);

  // ════════════════════════════════════════════
  //  SECTION 2 — MALICIOUS LINK PATTERNS
  //  Thorough — blocks known attack patterns
  // ════════════════════════════════════════════

  const MALICIOUS_URL_PATTERNS = [
    // IP address links — always suspicious
    /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i,
    // Scam patterns
    /free\s+money\s+(now|today|fast)/i,
    /click\s+here\s+to\s+win/i,
    /you\s+have\s+won\s+a?\s+prize/i,
    /claim\s+your\s+(free\s+)?reward\s+now/i,
    /verify\s+your\s+account\s+now\s+or/i,
    /double\s+your\s+bitcoin/i,
    /free\s+crypto\s+(now|today|airdrop)/i,
    /guaranteed\s+(profit|return|income|investment)/i,
    /get\s+rich\s+fast\s+(now|today|online)/i,
    // Redirect attacks
    /go\.php\?/i,
    /redirect.*url/i,
    /url.*redirect/i,
    // Suspicious short URLs
    /bit\.ly\/[a-zA-Z0-9]{4,}/i,
    /tinyurl\.com/i,
    /t\.co\/[a-zA-Z0-9]{6,}/i,
    // Suspicious TLDs often used in phishing
    /\.xyz\/[a-zA-Z0-9]{1,8}$/i,
    /\.tk\//i,
    /\.ml\//i,
    /\.ga\//i,
    /\.cf\//i,
  ];

  // Known safe domains — never flagged
  const SAFE_DOMAINS = new Set([
    "google.com","youtube.com","twitter.com","x.com",
    "facebook.com","instagram.com","whatsapp.com",
    "wikipedia.org","github.com","linkedin.com",
    "afrisocial.com.ng","afrisocial-backend.onrender.com",
    "afrisocial-test.netlify.app","netlify.app",
    "tiktok.com","snapchat.com","telegram.org",
  ]);

  // ════════════════════════════════════════════
  //  SECTION 3 — CODE INJECTION PATTERNS
  //  Thorough — blocks all common injection attacks
  // ════════════════════════════════════════════

  const INJECTION_PATTERNS = [
    // XSS — script tags
    /<\s*script[\s\S]*?>/gi,
    /<\s*\/\s*script\s*>/gi,
    // XSS — event handlers
    /on\s*(click|load|error|mouseover|submit|focus|blur|change|input|keyup|keydown|mouseenter|mouseleave|touchstart|touchend)\s*=/gi,
    // XSS — javascript: protocol
    /javascript\s*:/gi,
    // XSS — data: URIs
    /data\s*:\s*text\s*\/\s*html/gi,
    /data\s*:\s*image\/svg/gi,
    // XSS — vbscript
    /vbscript\s*:/gi,
    // HTML injection
    /<\s*(iframe|object|embed|form|input|button|img|svg|link|meta|base)\s/gi,
    // SQL injection patterns
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|HAVING|GROUP BY)\b)/gi,
    /('|")\s*(OR|AND)\s*('|"|\d)/gi,
    /--\s*$/gm,
    /;\s*(DROP|DELETE|INSERT|UPDATE)/gi,
    // NoSQL injection
    /\$\s*(where|gt|lt|ne|in|nin|regex|exists|type|mod|all|size|elemMatch)/gi,
    // Template injection
    /\{\{[\s\S]*?\}\}/g,
    /\{%[\s\S]*?%\}/g,
    // Path traversal
    /\.\.\//g,
    /\.\.\\/g,
    // Null bytes
    /\x00/g,
    // CRLF injection
    /(%0d%0a|%0a%0d|\r\n|\n\r)/gi,
  ];

  // ════════════════════════════════════════════
  //  SECTION 4 — SPAM PATTERNS
  // ════════════════════════════════════════════

  const SPAM_PATTERNS = [
    /(.)\1{8,}/,           // same char repeated 9+ times
    /[A-Z]{12,}/,          // all caps 12+ chars
    /(\b\w+\b)(\s+\1){4,}/i, // same word repeated 5+ times
    /follow\s+me\s+for\s+(free|money|cash)/i,
    /make\s+money\s+fast\s+now/i,
    /work\s+from\s+home\s+earn\s+\$/i,
    /dm\s+me\s+for\s+(promo|money|cash)/i,
    /subscribe\s+to\s+my\s+channel/i,
  ];

  // ════════════════════════════════════════════
  //  SECTION 5 — CORE SCANNER
  // ════════════════════════════════════════════

  function scanText(text) {
    if (!text || typeof text !== "string") return { clean: true };
    if (text.trim().length === 0) return { clean: true };

    const result = {
      clean:    true,
      severity: null,
      reasons:  [],
      details:  [],
    };

    // ── 1. Code injection check — always severe ──
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(text)) {
        result.clean    = false;
        result.severity = "severe";
        result.reasons.push("code_injection");
        result.details.push("Potentially malicious code detected");
        return result; // stop immediately
      }
    }

    // ── 2. Malicious URL check — severe ──
    const urls = text.match(/https?:\/\/[^\s]+/gi) || [];
    for (const url of urls) {
      try {
        const domain = new URL(url).hostname
          .replace("www.", "").toLowerCase();
        if (!SAFE_DOMAINS.has(domain)) {
          if (MALICIOUS_URL_PATTERNS.some(p => p.test(url))) {
            result.clean    = false;
            result.severity = "severe";
            result.reasons.push("malicious_link");
            result.details.push(`Suspicious link detected: ${domain}`);
          }
        }
      } catch {
        // Malformed URL — flag it
        result.clean    = false;
        result.severity = "severe";
        result.reasons.push("malicious_link");
        result.details.push("Malformed link detected");
      }
    }

    // ── 3. Bad word check — severity depends on word ──
    const lower = text.toLowerCase();
    const foundWords = [];
    BAD_WORDS.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      if (regex.test(lower)) foundWords.push(word);
    });

    if (foundWords.length > 0) {
      const hasHate = foundWords.some(w => HATE_SLURS.has(w));
      result.clean = false;
      result.reasons.push(hasHate ? "hate_speech" : "profanity");
      result.details.push(
        hasHate
          ? "Content contains hate speech"
          : "Content contains inappropriate language"
      );
      if (!result.severity) {
        result.severity = hasHate ? "severe" : "mild";
      }
    }

    // ── 4. Spam check — mild ──
    if (SPAM_PATTERNS.some(p => p.test(text))) {
      result.clean = false;
      result.reasons.push("spam");
      result.details.push("Content looks like spam");
      if (!result.severity) result.severity = "mild";
    }

    return result;
  }

  // ════════════════════════════════════════════
  //  SECTION 6 — SANITIZER
  //  Strips dangerous characters from output
  // ════════════════════════════════════════════

  function sanitize(str) {
    if (typeof str !== "string") return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
      .replace(/\x00/g, "") // null bytes
      .trim();
  }

  // ════════════════════════════════════════════
  //  SECTION 7 — UI WARNING SYSTEM
  // ════════════════════════════════════════════

  function showSecurityWarning(message, severity = "severe") {
    // Remove any existing warning
    const existing = document.getElementById("afri-security-warning");
    if (existing) existing.remove();

    const div = document.createElement("div");
    div.id    = "afri-security-warning";

    const isSevere = severity === "severe";
    div.style.cssText = `
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: ${isSevere ? "#FEF2F2" : "#FFFBEB"};
      border: 1.5px solid ${isSevere ? "#FECACA" : "#FCD34D"};
      color: ${isSevere ? "#B91C1C" : "#92400E"};
      padding: 14px 20px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      font-family: sans-serif;
      z-index: 99999;
      max-width: 92%;
      text-align: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      animation: afriSecurityFadeIn 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    div.innerHTML = `
      <span>${isSevere ? "🚫" : "⚠️"}</span>
      <span>${message}</span>
    `;

    // Add animation
    if (!document.getElementById("afri-security-style")) {
      const style       = document.createElement("style");
      style.id          = "afri-security-style";
      style.textContent = `
        @keyframes afriSecurityFadeIn {
          from { opacity:0; transform:translateX(-50%) translateY(-8px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(div);
    setTimeout(() => {
      if (div.parentNode) div.remove();
    }, isSevere ? 6000 : 4000);
  }

  // ════════════════════════════════════════════
  //  SECTION 8 — USER-FRIENDLY MESSAGES
  // ════════════════════════════════════════════

  const WARNING_MESSAGES = {
    code_injection:
      "Code or scripts are not allowed in messages.",
    malicious_link:
      "That link looks suspicious and cannot be posted.",
    hate_speech:
      "Hate speech is not allowed on Afrisocial.",
    profanity:
      "Please keep your language respectful.",
    spam:
      "Your message looks like spam. Please rephrase.",
    default:
      "This content cannot be posted. Please review it.",
  };

  function getWarningMessage(reasons) {
    if (!reasons || !reasons.length) return WARNING_MESSAGES.default;
    return WARNING_MESSAGES[reasons[0]] || WARNING_MESSAGES.default;
  }

  // ════════════════════════════════════════════
  //  SECTION 9 — SILENT VIOLATION LOGGER
  //  Reports to backend without alerting user
  // ════════════════════════════════════════════

  function logViolation(text, scanResult, fieldName) {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Fire and forget — don't await
    fetch(`${API_BASE}/api/moderation/flag`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({
        content:     text.slice(0, 500), // cap at 500 chars
        contentType: `input_field:${fieldName || "unknown"}`,
        reasons:     scanResult.reasons,
        severity:    scanResult.severity,
        action:      "blocked_at_input",
        page:        window.location.pathname,
      }),
      credentials: "include",
    }).catch(() => {}); // silent fail
  }

  // ════════════════════════════════════════════
  //  SECTION 10 — INPUT FIELD WATCHER
  //  Attaches to every input and textarea
  //  automatically — works on all pages
  // ════════════════════════════════════════════

  // Fields excluded from scanning (passwords, search, OTP etc)
  const EXCLUDED_TYPES = new Set([
    "password", "file", "checkbox", "radio",
    "submit", "button", "reset", "hidden",
    "range", "color", "date", "time",
    "datetime-local", "month", "week", "number",
  ]);

  const EXCLUDED_NAMES = new Set([
    "password", "confirm_password", "otp",
    "token", "csrf", "captcha",
  ]);

  // Track which fields have been flagged to avoid spam
  const flaggedFields = new WeakSet();

  function shouldScanField(field) {
    if (!field) return false;
    if (EXCLUDED_TYPES.has(field.type)) return false;
    if (EXCLUDED_NAMES.has(field.name?.toLowerCase())) return false;
    if (field.dataset.noScan !== undefined) return false;
    if (field.type === "search") return false; // search boxes are lenient
    return true;
  }

  function attachFieldWatcher(field) {
    if (field.dataset.afriSecured) return; // already attached
    field.dataset.afriSecured = "1";

    // Validate on blur (when user leaves field)
    field.addEventListener("blur", () => {
      const text = field.value;
      if (!text || text.trim().length < 3) return;
      if (!shouldScanField(field)) return;

      const result = scanText(text);
      if (!result.clean && result.severity === "severe") {
        field.style.borderColor = "#EF4444";
        field.style.boxShadow   = "0 0 0 3px rgba(239,68,68,0.12)";
        showSecurityWarning(
          getWarningMessage(result.reasons), "severe"
        );
        logViolation(text, result, field.name || field.id || field.placeholder);
      } else if (!result.clean && result.severity === "mild") {
        field.style.borderColor = "#F59E0B";
        field.style.boxShadow   = "0 0 0 3px rgba(245,158,11,0.12)";
        showSecurityWarning(
          getWarningMessage(result.reasons), "mild"
        );
      } else {
        // Clean — reset border
        field.style.borderColor = "";
        field.style.boxShadow   = "";
      }
    });

    // Real-time injection detection on input
    // (only for code injection — not words, to avoid annoyance)
    field.addEventListener("input", () => {
      const text = field.value;
      if (!text || text.trim().length < 5) return;
      if (!shouldScanField(field)) return;

      // Only check injection patterns in real time
      for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(text)) {
          field.style.borderColor = "#EF4444";
          field.style.boxShadow   = "0 0 0 3px rgba(239,68,68,0.12)";
          showSecurityWarning(
            "Malicious code detected and blocked.", "severe"
          );
          // Strip the offending content
          field.value = field.value
            .replace(/<[^>]*>/g, "")
            .replace(/javascript:/gi, "")
            .replace(/on\w+\s*=/gi, "");
          logViolation(text, { reasons: ["code_injection"], severity: "severe" },
            field.name || field.id);
          break;
        }
      }
    });

    // Block paste of malicious content
    field.addEventListener("paste", e => {
      if (!shouldScanField(field)) return;
      const pasted = e.clipboardData?.getData("text") || "";
      if (!pasted) return;

      const result = scanText(pasted);
      if (!result.clean && result.severity === "severe") {
        e.preventDefault();
        showSecurityWarning(
          "Pasted content was blocked — it contains something unsafe.",
          "severe"
        );
        logViolation(pasted, result, field.name || field.id);
      }
    });
  }

  // ════════════════════════════════════════════
  //  SECTION 11 — AUTO-ATTACH TO ALL INPUTS
  //  Watches for dynamically added inputs too
  // ════════════════════════════════════════════

  function attachToAllCurrentFields() {
    document.querySelectorAll("input, textarea").forEach(field => {
      attachFieldWatcher(field);
    });
  }

  // MutationObserver — catches inputs added dynamically
  // (e.g. modals, comment boxes that appear after page load)
  const fieldObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return; // not an element
        // Check if the node itself is an input
        if (node.tagName === "INPUT" || node.tagName === "TEXTAREA") {
          attachFieldWatcher(node);
        }
        // Check children
        node.querySelectorAll?.("input, textarea").forEach(field => {
          attachFieldWatcher(field);
        });
      });
    });
  });

  // ════════════════════════════════════════════
  //  SECTION 12 — FORM SUBMIT INTERCEPTOR
  //  Blocks form submission if severe content found
  // ════════════════════════════════════════════

  document.addEventListener("submit", e => {
    const form = e.target;
    if (!form || form.dataset.noScan !== undefined) return;

    const fields = form.querySelectorAll("input, textarea");
    let blocked  = false;

    fields.forEach(field => {
      if (!shouldScanField(field)) return;
      if (!field.value.trim()) return;

      const result = scanText(field.value);
      if (!result.clean && result.severity === "severe") {
        blocked = true;
        field.style.borderColor = "#EF4444";
        field.style.boxShadow   = "0 0 0 3px rgba(239,68,68,0.12)";
        showSecurityWarning(
          getWarningMessage(result.reasons), "severe"
        );
        logViolation(field.value, result, field.name || field.id);
      }
    });

    if (blocked) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true); // capture phase — runs before other handlers

  // ════════════════════════════════════════════
  //  SECTION 13 — FETCH INTERCEPTOR
  //  Scans all outgoing API data automatically
  // ════════════════════════════════════════════

  const originalFetch = window.fetch;

  window.fetch = async function (url, options = {}) {
    // Only scan POST/PUT/PATCH requests with body
    if (
      options.body &&
      typeof options.body === "string" &&
      ["POST","PUT","PATCH"].includes((options.method || "GET").toUpperCase())
    ) {
      try {
        const body = JSON.parse(options.body);

        // Scan all string values in the body
        let blocked = false;

        function scanObject(obj, path = "") {
          if (!obj || typeof obj !== "object") return;
          Object.entries(obj).forEach(([key, value]) => {
            const fieldPath = path ? `${path}.${key}` : key;
            // Skip sensitive fields
            if (["password","token","credential","code"].includes(key)) return;
            if (typeof value === "string" && value.trim().length > 2) {
              const result = scanText(value);
              if (!result.clean && result.severity === "severe") {
                blocked = true;
                showSecurityWarning(
                  getWarningMessage(result.reasons), "severe"
                );
                logViolation(value, result, fieldPath);
              }
            } else if (typeof value === "object") {
              scanObject(value, fieldPath);
            }
          });
        }

        scanObject(body);

        if (blocked) {
          // Return a fake failed response — don't send to server
          return new Response(
            JSON.stringify({ message: "Request blocked by security layer" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

      } catch {
        // Body is not JSON (e.g. FormData) — skip JSON scanning
        // FormData is handled by the field-level watchers above
      }
    }

    // All clear — proceed with original fetch
    return originalFetch.apply(this, arguments);
  };

  // ════════════════════════════════════════════
  //  SECTION 14 — URL PARAMETER PROTECTION
  //  Blocks malicious content in URL params
  // ════════════════════════════════════════════

  function scanUrlParams() {
    const params = new URLSearchParams(window.location.search);
    params.forEach((value, key) => {
      if (!value || value.trim().length < 3) return;
      const result = scanText(value);
      if (!result.clean && result.severity === "severe") {
        console.warn(
          `[Afrisocial Security] Suspicious URL parameter: ${key}`
        );
        // Don't alert user — just log it
        logViolation(value, result, `url_param:${key}`);
      }
    });
  }

  // ════════════════════════════════════════════
  //  SECTION 15 — LINK CLICK INTERCEPTOR
  //  Warns before navigating to external links
  // ════════════════════════════════════════════

  document.addEventListener("click", e => {
    const link = e.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("/") || href.startsWith("#")) return;
    if (href.startsWith("javascript:")) {
      e.preventDefault();
      showSecurityWarning("This link is not allowed.", "severe");
      return;
    }

    try {
      const url    = new URL(href);
      const domain = url.hostname.replace("www.", "").toLowerCase();

      if (!SAFE_DOMAINS.has(domain)) {
        // Check if it's malicious
        if (MALICIOUS_URL_PATTERNS.some(p => p.test(href))) {
          e.preventDefault();
          showSecurityWarning(
            "This link has been blocked — it looks unsafe.",
            "severe"
          );
          logViolation(href,
            { reasons: ["malicious_link"], severity: "severe" },
            "link_click"
          );
          return;
        }

        // External link — warn the user
        if (url.protocol === "https:" || url.protocol === "http:") {
          e.preventDefault();
          showExternalLinkWarning(href);
        }
      }
    } catch { /* not a valid URL */ }
  });

  function showExternalLinkWarning(href) {
    const existing = document.getElementById("afri-link-warning");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id    = "afri-link-warning";
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      padding: 20px;
    `;

    const sheet = document.createElement("div");
    sheet.style.cssText = `
      background: white;
      border-radius: 20px;
      padding: 28px 24px;
      max-width: 360px;
      width: 100%;
      text-align: center;
      font-family: sans-serif;
    `;

    let domain = href;
    try { domain = new URL(href).hostname; } catch {}

    sheet.innerHTML = `
      <div style="font-size:36px;margin-bottom:12px;">🔗</div>
      <h3 style="font-size:17px;font-weight:700;
        color:#111827;margin:0 0 8px;">
        Leaving Afrisocial
      </h3>
      <p style="font-size:13px;color:#6B7280;margin:0 0 20px;
        line-height:1.5;">
        You are about to visit an external site:<br/>
        <strong style="color:#374151;">${domain}</strong><br/><br/>
        Afrisocial cannot verify the safety of external links.
        Proceed with caution.
      </p>
      <div style="display:flex;gap:10px;">
        <button id="afriLinkCancel"
          style="flex:1;padding:12px;border:1.5px solid #E5E7EB;
          border-radius:10px;background:white;font-size:14px;
          font-weight:600;color:#6B7280;cursor:pointer;">
          Cancel
        </button>
        <button id="afriLinkContinue"
          style="flex:1;padding:12px;border:none;
          border-radius:10px;background:#000A23;font-size:14px;
          font-weight:600;color:white;cursor:pointer;">
          Continue
        </button>
      </div>
    `;

    modal.appendChild(sheet);
    document.body.appendChild(modal);

    document.getElementById("afriLinkCancel").onclick = () =>
      modal.remove();
    document.getElementById("afriLinkContinue").onclick = () => {
      modal.remove();
      window.open(href, "_blank", "noopener,noreferrer");
    };
    modal.addEventListener("click", e => {
      if (e.target === modal) modal.remove();
    });
  }

  // ════════════════════════════════════════════
  //  SECTION 16 — EXPOSE HELPERS GLOBALLY
  //  Other scripts can use these functions
  // ════════════════════════════════════════════

  window.AfriSecurity = {
    scan:     scanText,
    sanitize: sanitize,
    warn:     showSecurityWarning,
  };

  // ════════════════════════════════════════════
  //  SECTION 17 — INITIALISE
  // ════════════════════════════════════════════

  function init() {
    // Attach to all existing fields
    attachToAllCurrentFields();

    // Watch for new fields added dynamically
    fieldObserver.observe(document.body, {
      childList: true,
      subtree:   true,
    });

    // Scan URL params
    scanUrlParams();

    console.log(
      "%c[Afrisocial Security] 🔒 Active",
      "color:#10B981;font-weight:bold;"
    );
  }

  // Run after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
