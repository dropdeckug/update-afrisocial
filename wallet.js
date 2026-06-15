// ══════════════════════════════════════════════
// AFRISOCIAL WALLET
// ══════════════════════════════════════════════

if (localStorage.getItem("afri_theme") === "dark") document.body.classList.add("dark");
const token = localStorage.getItem("token");
if (!token) window.location.href = "/login.html";

const baseUrl = "https://afrisocial-backend.onrender.com";

// ── Currency map by country code ──
const CURRENCY_MAP = {
  NG: { sym: "₦",   name: "Naira",          rate: 1.50  },
  KE: { sym: "KSh", name: "Kenyan Shilling", rate: 0.20  },
  GH: { sym: "GH₵", name: "Cedi",           rate: 0.012 },
  ZA: { sym: "R",   name: "Rand",           rate: 0.028 },
  US: { sym: "$",   name: "Dollar",         rate: 0.001 },
  GB: { sym: "£",   name: "Pound",          rate: 0.0008},
  ET: { sym: "Br",  name: "Birr",           rate: 0.055 },
  TZ: { sym: "TSh", name: "Shilling",       rate: 2.50  },
  UG: { sym: "USh", name: "Shilling",       rate: 3.80  },
  SN: { sym: "CFA", name: "Franc",          rate: 0.65  },
};

// ── Star packages (price = naira, shown as-is in UI) ──
const STAR_PACKAGES = [
  { stars: 10,  price: 150  },
  { stars: 20,  price: 300  },
  { stars: 50,  price: 650  },
  { stars: 100, price: 1200 },
  { stars: 200, price: 2000 },
  { stars: 500, price: 4800 },
];

// ── Gift catalogue (lowest → highest, bigger = small discount) ──
const GIFT_CATALOGUE = [
  { emoji: "❤️",  name: "Heart",      stars: 10  },
  { emoji: "🌹",  name: "Rose",       stars: 15  },
  { emoji: "🍎",  name: "Apple",      stars: 20  },
  { emoji: "🍇",  name: "Grapes",     stars: 25  },
  { emoji: "🌸",  name: "Blossom",    stars: 30  },
  { emoji: "🍓",  name: "Strawberry", stars: 40  },
  { emoji: "💐",  name: "Bouquet",    stars: 50  },
  { emoji: "🎂",  name: "Cake",       stars: 60  },
  { emoji: "🦋",  name: "Butterfly",  stars: 75  },
  { emoji: "💎",  name: "Diamond",    stars: 90,  discount: "5% off"  },
  { emoji: "👑",  name: "Crown",      stars: 120, discount: "5% off"  },
  { emoji: "🏆",  name: "Trophy",     stars: 150, discount: "8% off"  },
  { emoji: "🚀",  name: "Rocket",     stars: 200, discount: "8% off"  },
  { emoji: "🎸",  name: "Guitar",     stars: 250, discount: "10% off" },
  { emoji: "🌍",  name: "Globe",      stars: 300, discount: "10% off" },
  { emoji: "🏎️",  name: "Sports Car", stars: 500, discount: "12% off" },
  { emoji: "🚁",  name: "Helicopter", stars: 750, discount: "12% off" },
  { emoji: "🚢",  name: "Cruise",     stars: 1000, discount: "15% off"},
  { emoji: "🛸",  name: "UFO",        stars: 1500, discount: "15% off"},
  { emoji: "🏰",  name: "Castle",     stars: 2000, discount: "18% off"},
  { emoji: "🚗",  name: "Car",        stars: 3000, discount: "18% off"},
  { emoji: "✈️",  name: "Jet",        stars: 5000, discount: "20% off"},
];

// Tx icons
const TX_ICONS = {
  gift: "🎁", recharge: "⭐", withdraw: "🏦",
  promote: "📢", convert: "🔄", cashout: "💸", default: "💰",
};

// State
let walletData    = { availableBalance: 0, starBalance: 0, transactions: [] };
let userCountry   = "NG";
let currency      = CURRENCY_MAP["NG"];
let pendingAction = null;
let selectedPkg   = null;
let selectedGift  = null; // { emoji, name, stars }

// ══════════════════════════════════════════════
//  WALLET PIN SETUP (blocks page on first visit)
// ══════════════════════════════════════════════
function checkWalletPin() {
  if (walletData.hasPin !== true) {
    showCreatePinModal();
  }
}

function showCreatePinModal() {
  const overlay = document.getElementById("createPinModal");
  overlay.classList.remove("hidden");

  // Prevent closing by clicking backdrop
  overlay.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Init step 1
  initCreatePinStep1();
}

let createdPin = "";

function initCreatePinStep1() {
  const step1 = document.getElementById("pinStep1");
  const step2 = document.getElementById("pinStep2");
  step1.classList.remove("hidden");
  step2.classList.add("hidden");
  document.getElementById("pinMismatchMsg").classList.add("hidden");

  const boxes = document.querySelectorAll(".create-pin-box");
  boxes.forEach(b => b.value = "");
  setupPinBoxNavigation(boxes);
  setTimeout(() => boxes[0]?.focus(), 200);
}

function initCreatePinStep2() {
  const step1 = document.getElementById("pinStep1");
  const step2 = document.getElementById("pinStep2");
  step1.classList.add("hidden");
  step2.classList.remove("hidden");
  document.getElementById("pinMismatchMsg").classList.add("hidden");

  const boxes = document.querySelectorAll(".confirm-pin-box");
  boxes.forEach(b => b.value = "");
  setupPinBoxNavigation(boxes);
  setTimeout(() => boxes[0]?.focus(), 200);
}

document.getElementById("createPinContinueBtn").addEventListener("click", async () => {
  const step2Visible = !document.getElementById("pinStep2").classList.contains("hidden");

  if (!step2Visible) {
    // Step 1: read and store entered PIN
    const boxes = document.querySelectorAll(".create-pin-box");
    const pin = Array.from(boxes).map(b => b.value).join("");
    if (pin.length < 4) { showToast("Enter all 4 digits", true); return; }
    createdPin = pin;
    initCreatePinStep2();
  } else {
    // Step 2: confirm PIN
    const boxes = document.querySelectorAll(".confirm-pin-box");
    const confirmPin = Array.from(boxes).map(b => b.value).join("");
    if (confirmPin.length < 4) { showToast("Enter all 4 digits", true); return; }

    if (confirmPin !== createdPin) {
      document.getElementById("pinMismatchMsg").classList.remove("hidden");
      boxes.forEach(b => b.value = "");
      setTimeout(() => boxes[0]?.focus(), 100);
      return;
    }

  // PINs match — save and close
   try {
   const res = await fetch(
    `${baseUrl}/api/wallet/create-pin`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        pin: createdPin
      })
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message);
  }

  localStorage.setItem("walletPinSet", "true");

  walletData.hasPin = true;    

  document
    .getElementById("createPinModal")
    .classList.add("hidden");

  showToast("✅ Wallet PIN created successfully!");

  } catch (err) {

  showToast(
    err.message || "Failed to create PIN",
    true
    );

    }
  }
});

// ── Toast ──
function showToast(msg, isError = false) {
  const t = document.getElementById("walletToast");
  t.textContent = msg;
  t.style.background = isError ? "#EF4444" : "#111";
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

// ── Currency helpers ──
function getCurrencyFor(code) {
  return CURRENCY_MAP[code] || CURRENCY_MAP["NG"];
}

function formatMoney(amount, curr) {
  return `${curr.sym} ${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function nairaToLocal(naira, curr) {
  return naira * (curr.rate || 1);
}

// ── Set currency symbols across UI ──
function applyCurrency() {
  document.getElementById("currencySymbol").textContent    = currency.sym;
  document.getElementById("withdrawCurrLabel").textContent = currency.sym;
  document.getElementById("convertCurrLabel").textContent  = currency.sym;
  // Note: rate display removed from convert modal per spec
}

// ══════════════════════════════════════════════
//  FETCH WALLET DATA
// ══════════════════════════════════════════════
async function loadWallet() {
  try {
    const res = await fetch(`${baseUrl}/api/wallet`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();

    walletData.availableBalance = data.availableBalance || 0;
    walletData.starBalance      = data.starBalance      || 0;
    walletData.transactions     = data.transactions     || [];
    walletData.hasPin           = data.hasPin || false;

    userCountry = data.country || localStorage.getItem("userCountry") || "NG";
    currency    = getCurrencyFor(userCountry);

    applyCurrency();
    updateBalanceUI();
    renderTransactions();
    checkWalletPin();
  } catch (err) {
    console.error("Wallet load error:", err);
    userCountry = localStorage.getItem("userCountry") || "NG";
    currency    = getCurrencyFor(userCountry);
    applyCurrency();
    updateBalanceUI();
    renderTransactions();
  }
}

async function loadUserProfile() {
  try {
    const res  = await fetch(`${baseUrl}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const user = data.user || data;
    if (user.country) {
      userCountry = user.country.toUpperCase().slice(0, 2);
      currency    = getCurrencyFor(userCountry);
      localStorage.setItem("userCountry", userCountry);
      applyCurrency();
    }
  } catch {}
}

function updateBalanceUI() {
  document.getElementById("availableBalance").textContent =
    Number(walletData.availableBalance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById("starBalance").textContent =
    Number(walletData.starBalance).toLocaleString("en-US");

  document.getElementById("withdrawAvailBal").textContent =
  formatMoney(walletData.availableBalance, currency);

document.getElementById("convertAvailBal").textContent =
  formatMoney(walletData.availableBalance, currency);
  document.getElementById("giftStarBal").textContent =
    `⭐ ${walletData.starBalance}`;
}

// ══════════════════════════════════════════════
//  RENDER TRANSACTIONS
// ══════════════════════════════════════════════
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d   = new Date(dateStr);
  const now  = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return `Today • ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diff === 1) return `Yesterday • ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ` • ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function txRow(tx) {
  const isPos = tx.amount >= 0;
  const sign  = isPos ? "+" : "-";
  const cls   = isPos ? "positive" : "negative";
  const icon  = TX_ICONS[tx.type] || TX_ICONS.default;
  const unit  = tx.currency === "star" ? "⭐" : currency.sym;

  return `
    <div class="transaction-row">
      <div class="tx-avatar">
        ${tx.avatar ? `<img src="${tx.avatar}" alt="" />` : icon}
      </div>
      <div class="item-info">
        <p class="item-name">${tx.title || tx.type || "Transaction"}</p>
        <p class="item-meta">${formatDate(tx.createdAt || tx.date)}</p>
      </div>
      <div class="item-amount ${cls}">
        ${unit} ${sign}${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </div>
  `;
}

function renderTransactions() {
  const txs  = walletData.transactions;
  const mini = document.getElementById("miniList");
  const full = document.getElementById("fullList");

  if (!txs || !txs.length) {
    mini.innerHTML = `<div class="tx-empty">No transactions yet</div>`;
    full.innerHTML = `<div class="tx-empty" style="padding:40px 0;text-align:center;color:#9CA3AF;">No transactions yet</div>`;
    return;
  }

  mini.innerHTML = txs.slice(0, 3).map(txRow).join("");

  const groups = {};
  txs.forEach(tx => {
    const d    = new Date(tx.createdAt || tx.date);
    const now  = new Date();
    const diff = Math.floor((now - d) / 86400000);
    const label = diff === 0 ? "Today" : diff === 1 ? "Yesterday"
      : d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  });

  full.innerHTML = Object.entries(groups).map(([label, list]) => `
    <p class="date-label">${label}</p>
    <div class="transaction-list">${list.map(txRow).join("")}</div>
  `).join("");
}

// ══════════════════════════════════════════════
//  RECHARGE PACKAGES
// ══════════════════════════════════════════════
function buildRechargePackages() {
  const scroll = document.getElementById("rechargePackages");
  const grid   = document.getElementById("rechargeGrid");

  // Use naira price directly as displayed (no conversion confusion)
  const html = STAR_PACKAGES.map((pkg, i) => {
    return `
      <div class="recharge-pkg" data-index="${i}">
        <div class="pkg-stars">⭐ ${pkg.stars}</div>
        <div class="pkg-label">stars</div>
        <div class="pkg-price">₦${pkg.price.toLocaleString()}</div>
      </div>
    `;
  }).join("");

  scroll.innerHTML = html;
  grid.innerHTML   = html;

  [scroll, grid].forEach(container => {
    container.querySelectorAll(".recharge-pkg").forEach(el => {
      el.addEventListener("click", () => {
        container.querySelectorAll(".recharge-pkg").forEach(p => p.classList.remove("selected"));
        el.classList.add("selected");
        selectedPkg = STAR_PACKAGES[parseInt(el.dataset.index)];
      });
    });
  });
}

// ══════════════════════════════════════════════
//  GIFT PICKER MODAL
// ══════════════════════════════════════════════
function buildGiftPicker() {
  const grid = document.getElementById("giftPickerGrid");
  grid.innerHTML = GIFT_CATALOGUE.map((gift, i) => `
    <div class="gift-item" data-index="${i}">
      ${gift.discount ? `<span class="gift-discount">${gift.discount}</span>` : ""}
      <span class="gift-emoji">${gift.emoji}</span>
      <span class="gift-name">${gift.name}</span>
      <span class="gift-cost">⭐ ${gift.stars.toLocaleString()}</span>
    </div>
  `).join("");

  grid.querySelectorAll(".gift-item").forEach(el => {
    el.addEventListener("click", () => {
      grid.querySelectorAll(".gift-item").forEach(g => g.classList.remove("selected"));
      el.classList.add("selected");
      const gift = GIFT_CATALOGUE[parseInt(el.dataset.index)];
      selectedGift = gift;

      // Update trigger button label
      document.getElementById("giftSelectLabel").textContent =
        `${gift.emoji} ${gift.name} — ⭐ ${gift.stars.toLocaleString()}`;
      document.getElementById("giftSelectValue").value = gift.stars;

      // Close picker and go back to gift modal
      closeModal("giftPickerModal");
    });
  });
}

// ══════════════════════════════════════════════
//  PANEL (Transactions)
// ══════════════════════════════════════════════
document.getElementById("openPanelBtn").addEventListener("click", () => {
  document.getElementById("transactionsPanel").classList.add("active");
});

document.getElementById("closePanelBtn").addEventListener("click", () => {
  document.getElementById("transactionsPanel").classList.remove("active");
});

// ══════════════════════════════════════════════
//  MODAL OPEN / CLOSE
// ══════════════════════════════════════════════
function openModal(id)  { document.getElementById(id).classList.remove("hidden"); }
function closeModal(id) { document.getElementById(id).classList.add("hidden"); }

// Close on backdrop click (except create pin modal — no bypass)
document.querySelectorAll(".modal-overlay").forEach(overlay => {
  if (overlay.id === "createPinModal") return; // no bypass
  overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.classList.add("hidden");
  });
});

// Back buttons inside modals
document.querySelectorAll(".modal-back[data-close]").forEach(btn => {
  btn.addEventListener("click", () => closeModal(btn.dataset.close));
});

// ── Quick Action buttons ──
document.getElementById("giftOutBtn").addEventListener("click", () => openModal("giftModal"));
document.getElementById("rechargeBtn").addEventListener("click", () => openModal("rechargeModal"));
document.getElementById("withdrawBtn").addEventListener("click", () => {
  document.getElementById("withdrawCountry").value        = userCountry;
  document.getElementById("withdrawCurrLabel").textContent = currency.sym;
  document.getElementById("withdrawAvailBal").textContent =
    formatMoney(walletData.availableBalance, currency);
  openModal("withdrawModal");
});
document.getElementById("promoteBtn").addEventListener("click", () => {
  showToast("Promote feature coming soon!");
});
document.getElementById("convertBtn").addEventListener("click", () => {
  openModal("convertModal");
});
document.getElementById("seeMoreRecharge").addEventListener("click", () => {
  openModal("rechargeModal");
});

// ── Gift select trigger ──
document.getElementById("giftSelectTrigger").addEventListener("click", () => {
  openModal("giftPickerModal");
});

// ── Withdraw country change ──
document.getElementById("withdrawCountry").addEventListener("change", function () {
  const curr = getCurrencyFor(this.value);
  document.getElementById("withdrawCurrLabel").textContent = curr.sym;
  document.getElementById("withdrawAvailBal").textContent =
    formatMoney(walletData.availableBalance, curr);
});

// ── Convert preview (no rate shown, 5% deducted frontend) ──
document.getElementById("convertAmount").addEventListener("input", function () {
  const localAmount = parseFloat(this.value) || 0;
  // Apply 5% deduction first
  const afterFee    = localAmount * 0.95;
  const rate        = nairaToLocal(15, currency); // local currency per star
  const stars       = Math.floor(afterFee / rate);
  document.getElementById("convertPreview").textContent =
    `You will get ⭐ ${stars.toLocaleString()}`;
});

// ── Custom recharge preview ──
document.getElementById("customStars").addEventListener("input", function () {
  const stars     = parseInt(this.value) || 0;
  const nairaRate = 15; // ₦15 per star for custom
  document.getElementById("customCostDisplay").textContent =
    stars > 0 ? `Cost: ₦${(stars * nairaRate).toLocaleString()}` : "";
});

// ── Refresh ──
document.getElementById("refreshBtn").addEventListener("click", () => {
  showToast("Refreshing...");
  loadWallet();
});

// ══════════════════════════════════════════════
//  PIN MODAL (transaction confirm)
// ══════════════════════════════════════════════
function setupPinBoxNavigation(boxes) {
  boxes.forEach((box, i) => {
    // Remove old listeners by cloning
    const newBox = box.cloneNode(true);
    box.parentNode.replaceChild(newBox, box);
    boxes[i] = newBox;
  });
  boxes.forEach((box, i) => {
    box.addEventListener("input", () => {
      box.value = box.value.replace(/\D/g, "").slice(0, 1);
      if (box.value && i < boxes.length - 1) boxes[i + 1].focus();
    });
    box.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !box.value && i > 0) boxes[i - 1].focus();
    });
  });
  return boxes;
}

function openPinModal(label, onConfirm) {
  pendingAction = onConfirm;
  document.getElementById("pinLabel").textContent = label || "Enter your wallet PIN";
  const rawBoxes = Array.from(document.querySelectorAll("#pinModal .pin-box"));
  rawBoxes.forEach(b => b.value = "");
  setupPinBoxNavigation(rawBoxes);
  openModal("pinModal");
  setTimeout(() => rawBoxes[0]?.focus(), 200);
}

document.getElementById("confirmPinBtn").addEventListener("click", () => {
  const pin = Array.from(document.querySelectorAll("#pinModal .pin-box")).map(b => b.value).join("");
  if (pin.length < 4) { showToast("Enter 4-digit PIN", true); return; }
  closeModal("pinModal");
  if (typeof pendingAction === "function") pendingAction(pin);
});

document.getElementById("cancelPinBtn").addEventListener("click", () => {
  closeModal("pinModal");
  pendingAction = null;
});

// ══════════════════════════════════════════════
//  SEND GIFT
// ══════════════════════════════════════════════
document.getElementById("sendGiftBtn").addEventListener("click", () => {
  const recipient = document.getElementById("giftRecipient").value.trim();
  const giftStars = parseInt(document.getElementById("giftSelectValue").value) || 0;

  if (!recipient) { showToast("Enter recipient username or email", true); return; }
  if (!selectedGift || !giftStars) { showToast("Select a gift first", true); return; }
  if (giftStars > walletData.starBalance) { showToast("Insufficient star balance", true); return; }

  openPinModal(`Send ${selectedGift.emoji} ${selectedGift.name} to ${recipient}`, async (pin) => {
    try {
      const res = await fetch(`${baseUrl}/api/wallet/gift`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recipient, giftType: selectedGift.name, amount: giftStars, pin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      walletData.starBalance -= giftStars;
      walletData.transactions.unshift({
        title: `${selectedGift.emoji} Gift to ${recipient}`, type: "gift",
        amount: -giftStars, currency: "star",
        createdAt: new Date().toISOString()
      });
      updateBalanceUI(); renderTransactions();
      closeModal("giftModal");

      // Reset gift selection
      selectedGift = null;
      document.getElementById("giftSelectLabel").textContent = "🎁 Tap to choose a gift";
      document.getElementById("giftSelectValue").value = "";
      document.getElementById("giftRecipient").value = "";

      showToast("🎁 Gift sent successfully!");
    } catch (err) { showToast(err.message || "Failed to send gift", true); }
  });
});

// ══════════════════════════════════════════════
//  EMAIL OTP — SEND CODE
// ══════════════════════════════════════════════
document.getElementById("sendWithdrawCode").addEventListener("click", async () => {
  const email = document.getElementById("withdrawEmail").value.trim();

  if (!email) { showToast("Enter your email first", true); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("Enter a valid email address", true); return;
  }

  const btn = document.getElementById("sendWithdrawCode");
  btn.textContent = "Sending...";
  btn.disabled    = true;

  try {
    const res = await fetch(`${baseUrl}/api/wallet/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email })
    });

    if (!res.ok) throw new Error("Failed to send code");

    showToast("✅ Code sent to your email!");

    let secs = 60;
    const countdown = setInterval(() => {
      btn.textContent = `Resend (${secs}s)`;
      secs--;
      if (secs < 0) {
        clearInterval(countdown);
        btn.textContent = "Resend";
        btn.disabled    = false;
      }
    }, 1000);

  } catch {
    showToast("Failed to send code. Try again.", true);
    btn.textContent = "Send Code";
    btn.disabled    = false;
  }
});

// ══════════════════════════════════════════════
//  CONFIRM WITHDRAW
// ══════════════════════════════════════════════
document.getElementById("confirmWithdrawBtn").addEventListener("click", () => {
  const country       = document.getElementById("withdrawCountry").value;
  const amount        = parseFloat(document.getElementById("withdrawAmount").value) || 0;
  const bank          = document.getElementById("withdrawBank").value.trim();
  const accountNumber = document.getElementById("withdrawAccountNumber").value.trim();
  const email         = document.getElementById("withdrawEmail").value.trim();
  const code          = document.getElementById("withdrawCode").value.trim();
  const curr          = getCurrencyFor(country);

  if (!amount)        { showToast("Enter withdrawal amount", true);   return; }
  if (!bank)          { showToast("Enter your bank name", true);      return; }
  if (!accountNumber) { showToast("Enter your account number", true); return; }
  if (!email)         { showToast("Enter your email", true);          return; }
  if (!code)          { showToast("Enter the verification code", true); return; }

  if (accountNumber.length < 6) {
    showToast("Account number looks too short", true); return;
  }

  const localAvail = nairaToLocal(walletData.availableBalance, curr);
  if (amount > localAvail) {
    showToast("Amount exceeds your available balance", true); return;
  }

  openPinModal(`Withdraw ${formatMoney(amount, curr)} to ${bank}`, async (pin) => {
    try {
      const res = await fetch(`${baseUrl}/api/wallet/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ country, amount, bank, accountNumber, email, code, pin })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Withdrawal failed");

      const nairaEquiv = amount / (curr.rate || 1);
      walletData.availableBalance -= nairaEquiv;
      walletData.transactions.unshift({
        title: `Withdrawal to ${bank}`, type: "withdraw",
        amount: -amount, currency: "money",
        createdAt: new Date().toISOString()
      });

      updateBalanceUI(); renderTransactions();
      closeModal("withdrawModal");

      document.getElementById("withdrawAmount").value        = "";
      document.getElementById("withdrawBank").value          = "";
      document.getElementById("withdrawAccountNumber").value = "";
      document.getElementById("withdrawEmail").value         = "";
      document.getElementById("withdrawCode").value          = "";

      showToast("✅ Withdrawal submitted! Processing in 1–3 business days.");
    } catch (err) { showToast(err.message || "Withdrawal failed. Try again.", true); }
  });
});

// ══════════════════════════════════════════════
//  CONVERT AVAILABLE → STARS (5% fee, no rate display)
// ══════════════════════════════════════════════
document.getElementById("confirmConvertBtn").addEventListener("click", () => {
  const localAmount = parseFloat(document.getElementById("convertAmount").value) || 0;
  if (!localAmount) { showToast("Enter amount to convert", true); return; }

  const afterFee   = localAmount * 0.95; // deduct 5%
  const rate       = nairaToLocal(15, currency);
  const stars      = Math.floor(afterFee / rate);
  if (stars < 1)   { showToast("Amount too low to convert", true); return; }

  const nairaEquiv = localAmount / (currency.rate || 1);
  if (nairaEquiv > walletData.availableBalance) {
    showToast("Insufficient available balance", true); return;
  }

  openPinModal(`Convert ${formatMoney(localAmount, currency)} → ⭐ ${stars}`, async (pin) => {
    try {
      const res = await fetch(`${baseUrl}/api/wallet/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: localAmount, stars, currency: userCountry, pin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      walletData.availableBalance -= nairaEquiv;
      walletData.starBalance      += stars;
      walletData.transactions.unshift({
        title: `Converted to ⭐ ${stars} Stars`, type: "convert",
        amount: stars, currency: "star",
        createdAt: new Date().toISOString()
      });
      updateBalanceUI(); renderTransactions();
      closeModal("convertModal");
      document.getElementById("convertAmount").value = "";
      document.getElementById("convertPreview").textContent = "You will get ⭐ 0";
      showToast(`✅ Converted to ⭐ ${stars} stars!`);
    } catch (err) { showToast(err.message || "Conversion failed", true); }
  });
});

// ══════════════════════════════════════════════
//  RECHARGE
// ══════════════════════════════════════════════
document.getElementById("confirmRechargeBtn").addEventListener("click", () => {
  const customStars = parseInt(document.getElementById("customStars").value) || 0;
  const pkg = selectedPkg;

  if (!pkg && !customStars) {
    showToast("Select a package or enter star amount", true); return;
  }

  const stars      = pkg ? pkg.stars : customStars;
  // Use the exact naira price from STAR_PACKAGES for packages,
  // and ₦15/star for custom (consistent with what's displayed in UI)
  const nairaPrice = pkg ? pkg.price : customStars * 15;

  openPinModal(`Pay ₦${nairaPrice.toLocaleString()} for ⭐ ${stars}`, async (pin) => {
    try {
      const res = await fetch(`${baseUrl}/api/wallet/recharge/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stars, amount: nairaPrice, pin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Payment failed");

      closeModal("rechargeModal");
      window.location.href = data.link;
    } catch (err) { showToast(err.message || "Recharge failed", true); }
  });
});

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════
loadUserProfile().then(() => loadWallet());
buildRechargePackages();
buildGiftPicker();
