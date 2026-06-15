const baseUrl = "https://afrisocial-backend-dev-production.up.railway.app";

const Mentions = (() => {
  let activeInput = null;
  let dropdown = null;
  let debounceTimer = null;

  function getToken() {
    return window.token || localStorage.getItem("token");
  }

  // Attach to input
  function init(input) {
    if (!input) return;

    input.addEventListener("input", handleInput);
    input.addEventListener("keydown", handleKeyDown);

    input.addEventListener("focus", () => {
      activeInput = input;
    });
  }

  // Detect @ typing
  function handleInput(e) {
    try {
      activeInput = e.target;
      const value = e.target.value || "";

      const match = value.match(/@([a-zA-Z0-9_.-]{1,})$/);
      if (!match) {
        hideDropdown();
        return;
      }

      const query = match[1];

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchUsers(query);
      }, 250);

    } catch (err) {
      console.error("Mention input error:", err);
    }
  }

  // Fetch users
  async function fetchUsers(query) {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(
        `${baseUrl}/api/users/search?q=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) return;

      let data = { users: [] };

      try {
        data = await res.json();
      } catch {
        console.warn("Invalid JSON from mention API");
      }

      showDropdown(data.users || []);

    } catch (err) {
      console.error("Mention fetch error:", err);
    }
  }

  // Show dropdown
  function showDropdown(users) {
    try {
      hideDropdown();

      if (!activeInput) return;

      dropdown = document.createElement("div");
      dropdown.className = "mention-dropdown";

      if (!users.length) {
        dropdown.innerHTML =
          `<div class="mention-item empty">No users found</div>`;
      }

      users.forEach(user => {
        const item = document.createElement("div");
        item.className = "mention-item";

        item.innerHTML = `
          <img src="${user.profilePicture || '/uploads/images/africa.png'}" />
          <div>
            <strong>${user.fullName}</strong><br/>
            <small>@${user.username}</small>
          </div>
        `;

        item.addEventListener("click", () => {
          insertMention(user.username);
        });

        dropdown.appendChild(item);
      });

      document.body.appendChild(dropdown);

      if (!activeInput) return;

      const rect = activeInput.getBoundingClientRect();

      dropdown.style.position = "absolute";
      dropdown.style.left = rect.left + window.scrollX + "px";
      dropdown.style.top = rect.bottom + window.scrollY + "px";
      dropdown.style.zIndex = 999999;

    } catch (err) {
      console.error("Dropdown error:", err);
    }
  }

  // Insert mention
  function insertMention(username) {
    try {
      if (!activeInput) return;

      const value = activeInput.value || "";

      const newValue = value.replace(
        /@([a-zA-Z0-9_.-]*)$/,
        `@${username} `
      );

      activeInput.value = newValue;

      hideDropdown();
      activeInput.focus();

    } catch (err) {
      console.error("Insert error:", err);
    }
  }

  function hideDropdown() {
    if (dropdown) {
      dropdown.remove();
      dropdown = null;
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      hideDropdown();
    }
  }

  return { init };
})();

// ================= AUTO INIT =================
document.addEventListener("DOMContentLoaded", () => {
  try {
    const inputs = document.querySelectorAll(
      "textarea[data-mention], input[data-mention]"
    );

    inputs.forEach(input => Mentions.init(input));

  } catch (err) {
    console.error("Mention init failed:", err);
  }
});
