// ══════════════════════════════════════════════
//  AUTH CHECK
// ══════════════════════════════════════════════
const token = localStorage.getItem("token");
if (!token) {
  window.location.replace("/login.html");
}

const baseUrl = "https://afrisocial-backend-dev-production.up.railway.app";
const currentUserId = localStorage.getItem("userId");

// ══════════════════════════════════════════════
//  DARK MODE — works across ALL pages via localStorage
// ══════════════════════════════════════════════
const themeToggle = document.getElementById("themeToggle");

// Read saved preference on load
const savedTheme = localStorage.getItem("afri_theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  document.documentElement.classList.add("dark");
  themeToggle.checked = true;
} else {
  document.body.classList.remove("dark");
  document.documentElement.classList.remove("dark");
  themeToggle.checked = false;
}

// On toggle — save and broadcast to all tabs
themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) {
    document.body.classList.add("dark");
    document.documentElement.classList.add("dark");
    localStorage.setItem("afri_theme", "dark");
    showToast("Dark mode on 🌙");
  } else {
    document.body.classList.remove("dark");
    document.documentElement.classList.remove("dark");
    localStorage.setItem("afri_theme", "light");
    showToast("Light mode on ☀️");
  }
});

// Sync across browser tabs instantly
window.addEventListener("storage", (e) => {
  if (e.key !== "afri_theme") return;
  if (e.newValue === "dark") {
    document.body.classList.add("dark");
    document.documentElement.classList.add("dark");
    themeToggle.checked = true;
  } else {
    document.body.classList.remove("dark");
    document.documentElement.classList.remove("dark");
    themeToggle.checked = false;
  }
});

// ══════════════════════════════════════════════
//  LOAD USER INFO
// ══════════════════════════════════════════════
async function loadUserInfo() {
  try {
    const res  = await fetch(`${baseUrl}/api/users/${currentUserId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const u    = data.user || data;

    document.getElementById("fullNameInput").value  = u.fullName  || "";
    document.getElementById("emailInput").value     = u.email     || "";
    document.getElementById("usernameInput").value  = u.username  ? `@${u.username}` : "";
    document.getElementById("phoneInput").value     = u.phone     || u.phoneNumber || "";
    if (u.dateOfBirth || u.dob) {
      const raw = u.dateOfBirth || u.dob;
      document.getElementById("dobInput").value =
        raw.substring(0, 10);
    }
  } catch (err) {
    console.error("Failed to load user info:", err);
  }
}

loadUserInfo();

// ══════════════════════════════════════════════
//  EDIT FIELD BUTTONS
// ══════════════════════════════════════════════
const fieldMap = {
  fullName: { inputId: "fullNameInput", apiKey: "fullName" },
  email:    { inputId: "emailInput",    apiKey: "email"    },
  username: { inputId: "usernameInput", apiKey: "username" },
  phone:    { inputId: "phoneInput",    apiKey: "phone"    },
  dob:      { inputId: "dobInput",      apiKey: "dateOfBirth" }
};

document.querySelectorAll(".edit-field-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const field   = btn.dataset.field;
    const mapping = fieldMap[field];
    if (!mapping) return;

    const input = document.getElementById(mapping.inputId);

    if (input.disabled) {
      // Enable editing
      input.disabled = false;
      input.focus();
      // Remove @ prefix for username editing
      if (field === "username" && input.value.startsWith("@")) {
        input.value = input.value.slice(1);
      }
      btn.textContent = "Save";
      btn.classList.add("saving");
    } else {
      // Save
      btn.textContent = "Saving...";
      btn.disabled    = true;

      let value = input.value.trim();
      if (!value) {
        showToast("Field cannot be empty");
        btn.textContent = "Save";
        btn.disabled    = false;
        return;
      }

      try {
        const body = { [mapping.apiKey]: value };
        const res  = await fetch(
          `${baseUrl}/api/users/${currentUserId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
          }
        );

        if (!res.ok) throw new Error();

        // Re-add @ for username display
        if (field === "username") input.value = `@${value}`;

        input.disabled      = true;
        btn.textContent     = "Edit";
        btn.classList.remove("saving");
        btn.disabled        = false;
        showToast(`${field === "fullName" ? "Name" : field.charAt(0).toUpperCase() + field.slice(1)} updated ✓`);
      } catch {
        showToast("Failed to save. Try again.");
        btn.textContent = "Save";
        btn.disabled    = false;
      }
    }
  });
});

// ══════════════════════════════════════════════
//  CHANGE PASSWORD
// ══════════════════════════════════════════════
document.getElementById("changePasswordBtn")
  .addEventListener("click", async () => {
    const current = document.getElementById("currentPassword").value;
    const next    = document.getElementById("newPassword").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (!current || !next || !confirm) {
      showToast("Please fill all fields"); return;
    }
    if (next !== confirm) {
      showToast("New passwords do not match"); return;
    }
    if (next.length < 6) {
      showToast("Password must be at least 6 characters"); return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword: current, newPassword: next })
      });

      if (!res.ok) throw new Error();
      showToast("Password updated ✓");
      document.getElementById("currentPassword").value = "";
      document.getElementById("newPassword").value     = "";
      document.getElementById("confirmPassword").value = "";
      closeModal("passwordModal");
    } catch {
      showToast("Failed to change password. Check current password.");
    }
  });

// ══════════════════════════════════════════════
//  LANGUAGE — Google Translate across all pages
// ══════════════════════════════════════════════
const AFRICAN_LANGUAGES = [
  { name: "English",    code: "en" },
  { name: "Yoruba",     code: "yo" },
  { name: "Hausa",      code: "ha" },
  { name: "Igbo",       code: "ig" },
  { name: "Amharic",    code: "am" },
  { name: "Swahili",    code: "sw" },
  { name: "Zulu",       code: "zu" },
  { name: "Xhosa",      code: "xh" },
  { name: "Afrikaans",  code: "af" },
  { name: "Shona",      code: "sn" },
  { name: "Somali",     code: "so" },
  { name: "Malagasy",   code: "mg" },
  { name: "Sesotho",    code: "st" },
  { name: "Nyanja",     code: "ny" },
  { name: "Kinyarwanda",code: "rw" },
  { name: "Tigrinya",   code: "ti" },
  { name: "Twi (Akan)", code: "ak" },
  { name: "Lingala",    code: "ln" },
  { name: "Luganda",    code: "lg" },
  { name: "Wolof",      code: "wo" },
  { name: "Bambara",    code: "bm" },
  { name: "Fula",       code: "ff" },
  { name: "Oromo",      code: "om" },
  { name: "Dinka",      code: "din" },
  { name: "Ewe",        code: "ee" },
  { name: "Tswana",     code: "tn" },
  { name: "Ndebele",    code: "nr" },
  { name: "Venda",      code: "ve" },
  { name: "Arabic",     code: "ar" },
  { name: "French",     code: "fr" },
  { name: "Portuguese", code: "pt" },
];

// Build language list in modal
const langList = document.querySelector(".language-list");
if (langList) {
  langList.innerHTML = "";
  const saved = localStorage.getItem("afri_lang") || "English";
  AFRICAN_LANGUAGES.forEach(lang => {
    const div = document.createElement("div");
    div.className = "language-option" + (lang.name === saved ? " selected" : "");
    div.textContent = lang.name;
    div.dataset.lang = lang.name;
    div.dataset.code = lang.code;
    langList.appendChild(div);
  });
}

// Language selection — uses Google Translate cookie method
// works across ALL pages automatically
document.querySelector(".language-list")?.addEventListener("click", e => {
  const opt = e.target.closest(".language-option");
  if (!opt) return;

  const lang = opt.dataset.lang;
  const code = opt.dataset.code;

  // Deselect all, select this one
  document.querySelectorAll(".language-option")
    .forEach(o => o.classList.remove("selected"));
  opt.classList.add("selected");

  // Save preference
  localStorage.setItem("afri_lang", lang);
  localStorage.setItem("afri_lang_code", code);

  // Update display
  document.getElementById("selectedLanguage").textContent = lang;

  // Apply via Google Translate element
  if (code === "en") {
    // Reset to English — clear the cookie
    document.cookie =
      "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" +
      location.hostname;
    showToast(`Language set to English`);
    setTimeout(() => location.reload(), 800);
  } else {
    // Set Google Translate cookie — persists across all pages
    const val = `/en/${code}`;
    document.cookie = `googtrans=${val}; path=/`;
    document.cookie = `googtrans=${val}; path=/; domain=${location.hostname}`;
    showToast(`Language set to ${lang}`);
    setTimeout(() => location.reload(), 800);
  }

  closeModal("languageModal");
});

// ══════════════════════════════════════════════
//  MODALS
// ══════════════════════════════════════════════
function openModal(id) {
  document.getElementById(id).classList.add("active");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("active");
}

// Open triggers
document.getElementById("accountInfoItem")
  ?.addEventListener("click", () => openModal("accountInfoModal"));
document.getElementById("passwordItem")
  ?.addEventListener("click", () => openModal("passwordModal"));
document.getElementById("languageItem")
  ?.addEventListener("click", () => openModal("languageModal"));

// Close buttons
document.querySelectorAll(".close-modal").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.closest(".modal").classList.remove("active");
  });
});

// Click backdrop to close
document.querySelectorAll(".modal").forEach(modal => {
  modal.addEventListener("click", e => {
    if (e.target === modal) modal.classList.remove("active");
  });
});

// ══════════════════════════════════════════════
//  NAVIGATION ITEMS
// ══════════════════════════════════════════════

// About Us
document.querySelectorAll(".item").forEach(item => {
  const text = item.querySelector(".item-left span")?.textContent?.trim();

  if (text === "About Afrisocial") {
    item.addEventListener("click", () => {
      window.location.href = "/about.html";
    });
  }

  if (text === "Privacy Policy") {
    item.addEventListener("click", () => {
      window.location.href = "/privacy.html";
    });
  }

  if (text === "Feedback") {
    item.addEventListener("click", () => {
      window.location.href = "/feedback.html";
    });
  }

  if (text === "Help Center") {
    item.addEventListener("click", () => {
      window.location.href = "/help.html";
    });
  }

  if (text === "Contact Support") {
    item.addEventListener("click", () => {
      window.location.href = "mailto:support@afrisocial.com";
    });
  }
});

// ══════════════════════════════════════════════
//  LOGOUT
// ══════════════════════════════════════════════
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  // Confirm first
  const confirmed = window.confirm("Are you sure you want to log out?");
  if (!confirmed) return;

  // Clear all auth data
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  localStorage.removeItem("profilePicture");
  sessionStorage.clear();

  showToast("Logged out. See you soon! 👋");
  setTimeout(() => {
    window.location.replace("/login.html");
  }, 800);
});

// ══════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════
function showToast(msg, duration = 2500) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), duration);
}

// ══════════════════════════════════════════════
//  INIT — Apply saved language label
// ══════════════════════════════════════════════
const savedLang = localStorage.getItem("afri_lang");
if (savedLang)
  document.getElementById("selectedLanguage").textContent = savedLang;
