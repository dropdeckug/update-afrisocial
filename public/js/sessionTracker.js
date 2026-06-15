const baseUrl = "https://afrisocial-backend-dev-production.up.railway.app";
const token = localStorage.getItem("token");

let sessionId = localStorage.getItem("sessionId");
let isActive = true;

// Detect activity
["click","mousemove","scroll","keydown","touchstart"].forEach(e => {
  window.addEventListener(e, () => {
    isActive = true;
  });
});

// Start session
async function startSession() {
  if (!token) return;

  try {
    const res = await fetch(`${baseUrl}/api/session/start`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    sessionId = data.sessionId;
    localStorage.setItem("sessionId", sessionId);
  } catch {}
}

// Heartbeat
setInterval(async () => {
  if (!token || !sessionId || !isActive) return;

  isActive = false;

  try {
    await fetch(`${baseUrl}/api/session/heartbeat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ sessionId })
    });
  } catch {}
}, 15000); // every 15 seconds

// End session
window.addEventListener("beforeunload", async () => {
  if (!sessionId) return;

  navigator.sendBeacon(
    `${baseUrl}/api/session/end`,
    JSON.stringify({ sessionId })
  );

  localStorage.removeItem("sessionId");
});

// Init
if (!sessionId) {
  startSession();
}
