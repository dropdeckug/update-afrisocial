const BASE_URL = "https://afrisocial-backend.onrender.com";
const TOKEN = localStorage.getItem("token"); 
if (!TOKEN) window.location.href = "/login.html";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${TOKEN}`
};

// ELEMENTS 
const codeEl = document.querySelector(".code");

const statValues = document.querySelectorAll(".stat-value");
const earningValues = document.querySelectorAll(".earning-value");

const referralTableBodies = document.querySelectorAll(".referral-table tbody");

//FETCH REFERRAL DASHBOARD

async function loadReferralDashboard() {
  try {
    const response = await fetch(`${BASE_URL}/api/referral/dashboard`, {
      method: "GET",
      headers
    });
    
    const data = await response.json();
    
    console.log(data);
    
    if (!data.success) return;
    
    codeEl.textContent = data.referral_code;
    
    earningValues[0].textContent =
      "₦" + Number(data.pending_earnings).toLocaleString();
    
    earningValues[1].textContent =
      "₦" + Number(data.total_earned).toLocaleString();
    
    statValues[0].textContent = data.total_referrals;
    statValues[1].textContent = data.active_referrals;
    statValues[2].textContent = "#" + data.rank;
    
    renderReferrals(data.referrals);
    
  } catch (error) {
    console.log("Dashboard Error:", error);
  }
}
function renderReferrals(referrals) {
  
  referralTableBodies.forEach(body => {
    body.innerHTML = "";
  });
  
  if (!referrals || referrals.length === 0) {
    
    referralTableBodies.forEach(body => {
      body.innerHTML = `
        <tr>
          <td colspan="3" style="text-align:center;">
            No referrals yet
          </td>
        </tr>
      `;
    });
    
    return;
  }
  
  referrals.forEach(referral => {
    
    const row = `
      <tr>
        <td>${referral.username}</td>
        <td>${formatDate(referral.join_date)}</td>
        <td>₦${Number(referral.earnings).toLocaleString()}</td>
      </tr>
    `;
    
    referralTableBodies.forEach(body => {
      body.innerHTML += row;
    });
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  
  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

document.querySelector(".ambassador").onclick = () => {
  document.querySelector(".level-modal").style.display="block";
}
document.querySelector(".level-modal-close").onclick = () => {
  document.querySelector(".level-modal").style.display="none";
}
document.querySelector(".copy-btn").addEventListener("click", () => {
  const code = codeEl.textContent;
  navigator.clipboard.writeText(code).then(() => {
    document.querySelector(".copy-btn").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>`;
    
    setTimeout(() => {
      document.querySelector(".copy-btn").innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" />
      <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>`; 
    }, 2000);
  });
});

const shareBtn = document.querySelector(".share-btn");
const overlay = document.querySelector(".share-modal");
const modal = document.querySelector(".share-modal-c");

let shareText = ""; // make it accessible to all functions

shareBtn.addEventListener("click", () => {
  const username = document.querySelector(".code").textContent.trim();
  
  shareText = `Join me on Afrisocial.
  
Africa’s fast-growing social platform for creators, students, businesses and communities.

Sign up with my link: https://afrisocial.com.ng/signup.html?ref=${username}

Create content, connect, explore African conversations and earn rewards`;
  
  // Show modal
  overlay.style.display = "block";
  modal.style.display = "block";
});

function shareToWhatsapp() {
  const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  window.open(url, "_blank");
}

function shareToFacebook() {
  const url = "https://afrisocial.com.ng";
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`;
  window.open(fbUrl, "_blank");
}

function shareToTwitter() {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  window.open(twitterUrl, "_blank");
}
function copyLink() {
  navigator.clipboard.writeText(shareText).then(() => {
    setTimeout(() => {
      overlay.style.display = "none";
      modal.style.display = "none";
  }, 500);
  });
}

// Close modal when clicking overlay
overlay.addEventListener("click", () => {
  overlay.style.display = "none";
  modal.style.display = "none";
  document.querySelector(".referral-modal").style.display ="none";
});

// Prevent closing when clicking inside modal content
modal.addEventListener("click", (e) => {
  e.stopPropagation();
});
document.querySelector(".view-all").onclick = () => {
  const referralModal = document.querySelector(".referral-modal");
  referralModal.style.display ="block";
  overlay.style.display = "block";
}
function closeReferralModal() {
  document.querySelector(".referral-modal").style.display = "none";
  overlay.style.display = "none";
}

//Ambassador levels
const LEVELS = [
  { name: "Bronze Ambassador", req: 5 },
  { name: "Silver Ambassador", req: 25 },
  { name: "Gold Ambassador", req: 100 },
  { name: "Platinum Ambassador", req: 500 },
];
// Fetch and update
async function loadLevels() {
  const res = await fetch(`${BASE_URL}/api/referral/dashboard`, { method: "GET", headers });
  const data = await res.json();
  if (!data.success) return;
  
  const active = Number(data.active_referrals);
  document.querySelector(".active-count").textContent = active;
  updateLevelUI(active);
}

function updateLevelUI(active) {
  // Find current and next level
  let current = "No Level";
  let nextReq = LEVELS[0].req;
  
  for (let i = 0; i < LEVELS.length; i++) {
    if (active >= LEVELS[i].req) current = LEVELS[i].name;
    if (active < LEVELS[i].req) {
      nextReq = LEVELS[i].req;
      break;
    }
  }
  
  // Update top section
  document.querySelector(".current-level").textContent = current;
  document.querySelector(".progress-text").textContent = `${active}/${nextReq}`;
  
  // Update progress bar
  const pct = Math.min((active / nextReq) * 100, 100);
  document.querySelector(".progress-bar div").style.width = pct + "%";
  
  // Update checkmarks
  document.querySelectorAll(".level-item").forEach((el, i) => {
    el.querySelector(".check")?.remove();
    if (active >= LEVELS[i].req) {
      el.insertAdjacentHTML("beforeend", '<div class="check">✓</div>');
    }
  });
}


loadReferralDashboard();
loadLevels();
