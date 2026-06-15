const API_URL = "https://afrisocial-backend-dev-production.up.railway.app";

// ══════════════════════════════════════
//  SPLASH SCREEN
// ══════════════════════════════════════
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  const site   = document.getElementById("site");

  // Wait for loading bar to finish then fade out
  setTimeout(() => {
    splash.classList.add("hide");
    site.classList.add("show");

    // Remove from DOM after transition
    setTimeout(() => {
      splash.style.display = "none";
    }, 700);
  }, 2400);
});

// ══════════════════════════════════════
//  NAV HAMBURGER
// ══════════════════════════════════════
const navHamburger = document.getElementById("navHamburger");
const mobileMenu   = document.getElementById("mobileMenu");

navHamburger.addEventListener("click", e => {
  e.stopPropagation();
  mobileMenu.classList.toggle("open");
});

document.addEventListener("click", e => {
  if (!mobileMenu.contains(e.target) &&
      !navHamburger.contains(e.target)) {
    mobileMenu.classList.remove("open");
  }
});

// Close mobile menu on link click
document.querySelectorAll(".mobile-link").forEach(link => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
  });
});

// ══════════════════════════════════════
//  SMOOTH SCROLL FOR ANCHOR LINKS
// ══════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", e => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// ══════════════════════════════════════
//  SCROLL REVEAL ANIMATIONS
// ══════════════════════════════════════
function initReveal() {
  const elements = document.querySelectorAll(
    ".feature-card, .step, .flag-item, .community-list li, " +
    ".section-title, .section-sub, .section-label"
  );

  elements.forEach(el => el.classList.add("reveal"));

  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("visible");
        }, i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
}

// Run reveal after splash
setTimeout(initReveal, 2500);

// ══════════════════════════════════════
//  NAV SCROLL SHADOW
// ══════════════════════════════════════
const nav = document.querySelector(".nav");

window.addEventListener("scroll", () => {
  if (window.scrollY > 20) {
    nav.style.boxShadow = "0 4px 24px rgba(0,10,35,0.08)";
  } else {
    nav.style.boxShadow = "none";
  }
});

// ══════════════════════════════════════
//  INSTALL POPUP
// ══════════════════════════════════════
let deferredPrompt;

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById("installPopup").style.display = "block";
});

async function installApp() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const result = await deferredPrompt.userChoice;
  deferredPrompt = null;
  document.getElementById("installPopup").style.display = "none";
}

function closeInstallPopup() {
  document.getElementById("installPopup").style.display = "none";
}

window.addEventListener("appinstalled", () => {
  console.log("Afrisocial installed");
  document.getElementById("installPopup").style.display = "none";
});
