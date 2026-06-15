// ══════════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════════

const API_BASE         = "https://afrisocial-backend.onrender.com";
// const GOOGLE_CLIENT_ID = "629115843529-kdbk20vvmt5c0i7fgaliatmkhsb9tasj.apps.googleusercontent.com";

// ══════════════════════════════════════════════
//  GET REFERRAL CODE 
// ══════════════════════════════════════════════
const params = new URLSearchParams(
    window.location.search
  );
const referralCode =
  params.get("ref");

// ══════════════════════════════════════════════
//  SECURITY: RATE LIMITER
// ══════════════════════════════════════════════

const RateLimiter = (() => {
  const attempts = {};
  return {
    check(key, maxAttempts = 5, windowMs = 60_000) {
      const now = Date.now();
      if (!attempts[key]) attempts[key] = [];
      attempts[key] = attempts[key].filter(t => now - t < windowMs);
      if (attempts[key].length >= maxAttempts) return false;
      attempts[key].push(now);
      return true;
    }
  };
})();

// ══════════════════════════════════════════════
//  SECURITY: INPUT SANITIZER
// ══════════════════════════════════════════════

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

function safeTrim(str) {
  return typeof str === 'string' ? str.trim() : '';
}

// ══════════════════════════════════════════════
//  SECURITY: STRONG PASSWORD — ALL 5 RULES MUST PASS
// ══════════════════════════════════════════════

const PASSWORD_RULES = {
  length:  { test: pw => pw.length >= 8,           id: 'req-length'  },
  upper:   { test: pw => /[A-Z]/.test(pw),         id: 'req-upper'   },
  lower:   { test: pw => /[a-z]/.test(pw),         id: 'req-lower'   },
  number:  { test: pw => /[0-9]/.test(pw),         id: 'req-number'  },
  special: { test: pw => /[^A-Za-z0-9]/.test(pw), id: 'req-special' },
};

function getPasswordScore(pw) {
  return Object.values(PASSWORD_RULES).filter(r => r.test(pw)).length;
}

function isStrongPassword(pw) {
  return getPasswordScore(pw) === 5;
}

function updatePasswordRequirements(pw) {
  Object.entries(PASSWORD_RULES).forEach(([, rule]) => {
    const el = document.getElementById(rule.id);
    if (!el) return;
    const passed = rule.test(pw);
    el.classList.toggle('req-pass', passed);
    el.classList.toggle('req-fail', !passed && pw.length > 0);
    el.textContent = (passed ? '✓ ' : '✗ ') + el.textContent.slice(2);
  });
}

function getStrengthInfo(score) {
  if (score <= 1) return { label: 'Very weak',  color: '#EF4444' };
  if (score === 2) return { label: 'Weak',       color: '#F97316' };
  if (score === 3) return { label: 'Fair',       color: '#EAB308' };
  if (score === 4) return { label: 'Almost',     color: '#84CC16' };
  return              { label: 'Strong ✓',    color: '#10B981' };
}

// ══════════════════════════════════════════════
//  TOKEN STORAGE — localStorage
// ══════════════════════════════════════════════

function storeToken(token) {
  try {
    localStorage.setItem('token', token);
  } catch {
    console.warn('Storage unavailable');
  }
}

// ══════════════════════════════════════════════
//  UTILITIES
// ══════════════════════════════════════════════

function setValid(input, errId) {
  input.classList.remove('invalid');
  input.classList.add('valid');
  const el = document.getElementById(errId);
  if (el) el.textContent = '';
}

function setInvalid(input, errId, msg) {
  input.classList.remove('valid');
  input.classList.add('invalid');
  const el = document.getElementById(errId);
  if (el) el.textContent = msg;
}

function clearState(input, errId) {
  input.classList.remove('valid', 'invalid');
  const el = document.getElementById(errId);
  if (el) el.textContent = '';
}

function isValidEmail(val) {
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(val.trim());
}

function isValidUsername(val) {
  return /^[a-zA-Z0-9_]{3,30}$/.test(val);
}

function enableBtn(btn)  { btn.disabled = false; btn.classList.remove('disabled'); }
function disableBtn(btn) { btn.disabled = true;  btn.classList.add('disabled'); }

function showError(msg) {
  const existing = document.getElementById('global-error');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.id = 'global-error';
  div.className = 'global-error-msg';
  div.setAttribute('role', 'alert');
  div.textContent = msg;
  document.querySelector('.container').prepend(div);
  setTimeout(() => div.remove(), 5000);
}

// ── Step transition ──
function goToStep(nextNum, direction = 'forward') {
  const current = document.querySelector('.step.active');
  const next    = document.getElementById('step' + nextNum);
  if (!current || !next || current === next) return;

  const exitClass  = direction === 'forward' ? 'exit-left'        : 'exit-right';
  const enterClass = direction === 'forward' ? 'enter-from-right' : 'enter-from-left';

  current.classList.remove('active');
  current.classList.add(exitClass);

  setTimeout(() => {
    current.classList.remove(exitClass);
    current.style.display = 'none';

    next.style.display = 'flex';
    next.classList.add(enterClass);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        next.classList.remove(enterClass);
        next.classList.add('active');
      });
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 480);
}


// ══════════════════════════════════════════════
//  STEP 1
// ══════════════════════════════════════════════

const fullname  = document.getElementById('fullname');
const username  = document.getElementById('username');
const email     = document.getElementById('email');
const password  = document.getElementById('password');
const nextBtn1  = document.getElementById('nextBtn1');

const strengthMeter = document.getElementById('strengthMeter');
const strengthLabel = document.getElementById('strengthLabel');
const bars = [
  document.getElementById('bar1'),
  document.getElementById('bar2'),
  document.getElementById('bar3'),
  document.getElementById('bar4'),
  document.getElementById('bar5'),
];

function validateFullname() {
  const val = safeTrim(fullname.value);
  if (!val) { setInvalid(fullname, 'err-fullname', 'Full name is required'); return false; }
  if (val.length < 2) { setInvalid(fullname, 'err-fullname', 'Enter your full name'); return false; }
  if (!/^[a-zA-Z\s'\-\.]{2,80}$/.test(val)) {
    setInvalid(fullname, 'err-fullname', 'Only letters, spaces, hyphens & apostrophes allowed');
    return false;
  }
  setValid(fullname, 'err-fullname');
  return true;
}

function validateUsername() {
  const val = safeTrim(username.value);
  if (!val) { setInvalid(username, 'err-username', 'Username is required'); return false; }
  if (!isValidUsername(val)) {
    setInvalid(username, 'err-username', 'Only letters, numbers & underscores (3–30 chars)');
    return false;
  }
  setValid(username, 'err-username');
  return true;
}

function validateEmail() {
  const val = safeTrim(email.value);
  if (!val) { setInvalid(email, 'err-email', 'Email is required'); return false; }
  if (!isValidEmail(val)) {
    setInvalid(email, 'err-email', 'Enter a valid email e.g. you@example.com');
    return false;
  }
  setValid(email, 'err-email');
  return true;
}

function validatePassword() {
  const val = password.value;
  if (!val) { setInvalid(password, 'err-password', 'Password is required'); return false; }
  if (!isStrongPassword(val)) {
    setInvalid(password, 'err-password', 'Password must meet all requirements below');
    return false;
  }
  setValid(password, 'err-password');
  return true;
}

function checkStep1() {
  const ok =
    safeTrim(fullname.value).length >= 2 &&
    /^[a-zA-Z\s'\-\.]{2,80}$/.test(safeTrim(fullname.value)) &&
    isValidUsername(safeTrim(username.value)) &&
    isValidEmail(safeTrim(email.value)) &&
    isStrongPassword(password.value);
  ok ? enableBtn(nextBtn1) : disableBtn(nextBtn1);
}

function updateMeter(pw) {
  if (!pw) {
    strengthMeter.classList.remove('visible');
    document.getElementById('pwRequirements').classList.remove('visible');
    return;
  }
  strengthMeter.classList.add('visible');
  document.getElementById('pwRequirements').classList.add('visible');
  const score = getPasswordScore(pw);
  const { label, color } = getStrengthInfo(score);
  bars.forEach((bar, i) => { bar.style.background = i < score ? color : '#E5E7EB'; });
  strengthLabel.textContent = label;
  strengthLabel.style.color = color;
  updatePasswordRequirements(pw);
}

fullname.addEventListener('input', () => {
  const v = safeTrim(fullname.value);
  if (v.length >= 2 && /^[a-zA-Z\s'\-\.]{2,80}$/.test(v)) setValid(fullname, 'err-fullname');
  else clearState(fullname, 'err-fullname');
  checkStep1();
});
fullname.addEventListener('blur', () => { validateFullname(); checkStep1(); });

username.addEventListener('input', () => {
  const v = safeTrim(username.value);
  if (isValidUsername(v)) setValid(username, 'err-username');
  else clearState(username, 'err-username');
  checkStep1();
});
username.addEventListener('blur', () => { validateUsername(); checkStep1(); });

email.addEventListener('input', () => {
  if (isValidEmail(safeTrim(email.value))) setValid(email, 'err-email');
  else clearState(email, 'err-email');
  checkStep1();
});
email.addEventListener('blur', () => { validateEmail(); checkStep1(); });

password.addEventListener('input', () => {
  updateMeter(password.value);
  if (password.value && isStrongPassword(password.value)) setValid(password, 'err-password');
  else if (password.value) clearState(password, 'err-password');
  checkStep1();
});
password.addEventListener('blur', () => { validatePassword(); checkStep1(); });

password.addEventListener('contextmenu', e => e.preventDefault());

// Password toggle
const togglePassword = document.getElementById('togglePassword');
const eyeIcon        = document.getElementById('eyeIcon');

const eyeHidden = `
  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
  <line x1="1" y1="1" x2="23" y2="23"/>
`;
const eyeVisible = `
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
  <circle cx="12" cy="12" r="3"/>
`;

togglePassword.addEventListener('click', () => {
  const hidden = password.type === 'password';
  password.type     = hidden ? 'text' : 'password';
  eyeIcon.innerHTML = hidden ? eyeVisible : eyeHidden;
});

nextBtn1.addEventListener('click', () => {
  const ok =
    validateFullname() &
    validateUsername() &
    validateEmail() &
    validatePassword();
  if (ok) goToStep(2, 'forward');
});


// ══════════════════════════════════════════════
//  GOOGLE OAUTH — TEMPORARILY DISABLED
// ══════════════════════════════════════════════

/*
window.handleGoogleCredential = async (response) => {
  if (!response || !response.credential) {
    showError('Google sign-in failed. Please try again.');
    return;
  }

  if (!RateLimiter.check('google-oauth', 5, 60_000)) {
    showError('Too many attempts. Please wait a moment.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({ credential: response.credential }),
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.message || 'Google sign-in failed');
      return;
    }

    if (data.token) storeToken(data.token);
    window.location.href = '/connect.html';

  } catch (err) {
    console.error('Google OAuth error:', err);
    showError('Something went wrong with Google sign-in');
  }
};

document.getElementById('googleBtn').addEventListener('click', () => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = new URLSearchParams({
    client_id:     GOOGLE_CLIENT_ID,
    redirect_uri:  window.location.origin + '/auth/google/callback',
    response_type: 'code',
    scope:         'openid email profile',
    prompt:        'select_account',
  });
  window.location.href = `${rootUrl}?${options.toString()}`;
});
*/


// ══════════════════════════════════════════════
//  STEP 2
// ══════════════════════════════════════════════

const dobDD    = document.getElementById('dob-dd');
const dobMM    = document.getElementById('dob-mm');
const dobYYYY  = document.getElementById('dob-yyyy');
const country  = document.getElementById('country');
const nextBtn2 = document.getElementById('nextBtn2');

function validateDobDD() {
  const val = parseInt(dobDD.value);
  if (!dobDD.value || isNaN(val) || val < 1 || val > 31) {
    setInvalid(dobDD, 'err-dob-dd', 'Invalid'); return false;
  }
  setValid(dobDD, 'err-dob-dd'); return true;
}

function validateDobMM() {
  const val = parseInt(dobMM.value);
  if (!dobMM.value || isNaN(val) || val < 1 || val > 12) {
    setInvalid(dobMM, 'err-dob-mm', 'Invalid'); return false;
  }
  setValid(dobMM, 'err-dob-mm'); return true;
}

function validateDobYYYY() {
  const val = parseInt(dobYYYY.value);
  const maxYear = new Date().getFullYear() - 13;
  if (!dobYYYY.value || isNaN(val) || val < 1900 || val > maxYear) {
    setInvalid(dobYYYY, 'err-dob-yyyy', `Max ${maxYear}`); return false;
  }
  setValid(dobYYYY, 'err-dob-yyyy'); return true;
}

function validateCountry() {
  const allowed = Array.from(country.options).map(o => o.value);
  if (!country.value || !allowed.includes(country.value)) {
    setInvalid(country, 'err-country', 'Please select a valid country');
    return false;
  }
  setValid(country, 'err-country'); return true;
}

function checkStep2() {
  const maxYear = new Date().getFullYear() - 13;
  const dd = parseInt(dobDD.value);
  const mm = parseInt(dobMM.value);
  const yy = parseInt(dobYYYY.value);
  const allowed = Array.from(country.options).map(o => o.value);
  const ok =
    !isNaN(dd) && dd >= 1 && dd <= 31 &&
    !isNaN(mm) && mm >= 1 && mm <= 12 &&
    !isNaN(yy) && yy >= 1900 && yy <= maxYear &&
    country.value !== '' && allowed.includes(country.value);
  ok ? enableBtn(nextBtn2) : disableBtn(nextBtn2);
}

dobDD.addEventListener('input', () => {
  dobDD.value = dobDD.value.replace(/\D/g, '');
  if (dobDD.value.length === 2) dobMM.focus();
  checkStep2();
});
dobMM.addEventListener('input', () => {
  dobMM.value = dobMM.value.replace(/\D/g, '');
  if (dobMM.value.length === 2) dobYYYY.focus();
  checkStep2();
});
dobYYYY.addEventListener('input', () => {
  dobYYYY.value = dobYYYY.value.replace(/\D/g, '');
  checkStep2();
});

dobDD.addEventListener('blur',   () => { validateDobDD();   checkStep2(); });
dobMM.addEventListener('blur',   () => { validateDobMM();   checkStep2(); });
dobYYYY.addEventListener('blur', () => { validateDobYYYY(); checkStep2(); });

country.addEventListener('change', () => { validateCountry(); checkStep2(); });

nextBtn2.addEventListener('click', () => {
  const ok =
    validateDobDD()   &
    validateDobMM()   &
    validateDobYYYY() &
    validateCountry();
  if (ok) goToStep(3, 'forward');
});

document.getElementById('backBtn2').addEventListener('click', () => goToStep(1, 'back'));
document.getElementById('backBtn3').addEventListener('click', () => goToStep(2, 'back'));


// ══════════════════════════════════════════════
//  AVATAR UPLOAD
// ══════════════════════════════════════════════

const avatarInput   = document.getElementById('avatarInput');
const avatarPreview = document.getElementById('avatarPreview');
const avatarEditBtn = document.getElementById('avatarEditBtn');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_AVATAR_SIZE_MB  = 5;

let avatarFile = null;

avatarEditBtn.addEventListener('click', () => avatarInput.click());

avatarInput.addEventListener('change', () => {
  const file = avatarInput.files[0];
  if (!file) return;

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    document.getElementById('err-avatar').textContent =
      'Only JPEG, PNG, WebP or GIF images allowed';
    avatarInput.value = '';
    return;
  }

  if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
    document.getElementById('err-avatar').textContent =
      `Image must be under ${MAX_AVATAR_SIZE_MB}MB`;
    avatarInput.value = '';
    return;
  }

  document.getElementById('err-avatar').textContent = '';
  avatarFile = file;

  const reader = new FileReader();
  reader.onload = e => {
    const img = document.createElement('img');
    img.src = e.target.result;
    img.alt = 'Avatar preview';
    avatarPreview.innerHTML = '';
    avatarPreview.appendChild(img);
  };
  reader.readAsDataURL(file);
});


// ══════════════════════════════════════════════
//  STEP 3 — INTERESTS
// ══════════════════════════════════════════════

const finishBtn        = document.getElementById('finishBtn');
const finishBtnText    = document.getElementById('finishBtnText');
const finishBtnSpinner = document.getElementById('finishBtnSpinner');
const selectedCountEl  = document.getElementById('selectedCount');
const pills            = document.querySelectorAll('.interest-pill');

const VALID_INTERESTS = new Set([
  'Business','Fashion','Sports','Cars','Tech',
  'Comedy','Music','Travel','Finance','Coding','Education'
]);

let selectedInterests = [];
let isSubmitting = false;

pills.forEach(pill => {
  pill.addEventListener('click', () => {
    const interest = pill.dataset.interest;
    if (!VALID_INTERESTS.has(interest)) return;

    if (pill.classList.contains('selected')) {
      pill.classList.remove('selected');
      selectedInterests = selectedInterests.filter(i => i !== interest);
    } else {
      if (selectedInterests.length >= 5) return;
      pill.classList.add('selected');
      selectedInterests.push(interest);
    }

    selectedCountEl.style.transform = 'scale(1.4)';
    setTimeout(() => { selectedCountEl.style.transform = 'scale(1)'; }, 200);
    selectedCountEl.textContent = selectedInterests.length;

    pills.forEach(p => {
      if (!p.classList.contains('selected')) {
        selectedInterests.length >= 5
          ? p.classList.add('disabled-pill')
          : p.classList.remove('disabled-pill');
      }
    });

    selectedInterests.length > 0 ? enableBtn(finishBtn) : disableBtn(finishBtn);
  });
});


// ══════════════════════════════════════════════
//  FINAL SUBMIT
// ══════════════════════════════════════════════

finishBtn.addEventListener('click', async () => {

  if (isSubmitting) return;

  if (!RateLimiter.check('signup-submit', 3, 60_000)) {
    showError('Too many attempts. Please wait a moment and try again.');
    return;
  }

  const step1Valid =
    validateFullname() &
    validateUsername() &
    validateEmail() &
    validatePassword();

  if (!step1Valid) {
    showError('Some required information is missing. Please go back and check.');
    return;
  }

  const cleanInterests = selectedInterests.filter(i => VALID_INTERESTS.has(i));
  if (cleanInterests.length === 0) {
    showError('Please select at least one interest.');
    return;
  }

  isSubmitting = true;
  disableBtn(finishBtn);
  finishBtnText.textContent = 'Creating account...';
  finishBtnSpinner.style.display = 'inline-block';

  try {
    const dob = `${dobYYYY.value.padStart(4,'0')}-${dobMM.value.padStart(2,'0')}-${dobDD.value.padStart(2,'0')}`;

    const formData = new FormData();
    formData.append('fullName',  sanitize(fullname.value.trim()));
    formData.append('username',  sanitize(username.value.trim()));
    formData.append('email',     email.value.trim().toLowerCase());
    formData.append('password',  password.value);
    formData.append('country',   sanitize(country.value.trim()));
    formData.append('dob',       dob);
    formData.append('bio',       sanitize(document.getElementById('bio').value));
    formData.append('interests', JSON.stringify(cleanInterests));
    formData.append("referralCode", referralCode || "");

    if (avatarFile) {
      formData.append('profilePicture', avatarFile);
    }

    const res = await fetch(`${API_BASE}/api/users/signup`, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: formData,
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      const safeMsg = data.message && data.message.length < 200
        ? data.message
        : 'Signup failed. Please try again.';
      showError(safeMsg);
      return;
    }

    if (data.token) storeToken(data.token);

    password.value = '';
    email.value    = '';

    window.location.href = '/connect.html';

  } catch (err) {
    console.error('Signup error:', err);
    showError('Something went wrong. Please check your connection and try again.');
  } finally {
    isSubmitting = false;
    enableBtn(finishBtn);
    finishBtnText.textContent = 'Finish';
    finishBtnSpinner.style.display = 'none';
  }
});


// ══════════════════════════════════════════════
//  GOOGLE SIGN-IN (signup page)
// ══════════════════════════════════════════════

const GOOGLE_CLIENT_ID = "629115843529-kdbk20vvmt5c0i7fgaliatmkhsb9tasj.apps.googleusercontent.com";

function isProfileComplete(user) {
  if (!user) return false;
  if (user.needsProfileCompletion === true) return false;
  const c = (user.country || '').toString().trim().toLowerCase();
  if (!c || c === 'not set') return false;
  return true;
}

function setGoogleLoading(isLoading) {
  const btn = document.getElementById('googleSignupBtn');
  if (!btn) return;
  btn.classList.toggle('is-loading', isLoading);
  btn.disabled = isLoading;
}

async function handleGoogleCredential(response) {
  if (!response || !response.credential) {
    setGoogleLoading(false);
    showError('Google sign-in failed. Please try again.');
    return;
  }
  if (!RateLimiter.check('google-oauth', 5, 60_000)) {
    setGoogleLoading(false);
    showError('Too many attempts. Please wait a moment.');
    return;
  }
  setGoogleLoading(true);
  try {
    const res = await fetch(`${API_BASE}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({ credential: response.credential }),
    });
    const data = await res.json();
    if (!res.ok) {
      setGoogleLoading(false);
      showError(data.message || 'Google sign-in failed');
      return;
    }
    if (data.token) storeToken(data.token);
    try {
      if (data.user) {
        localStorage.setItem('userId', data.user.id || data.user._id || '');
        localStorage.setItem('username', data.user.username || '');
        if (data.user.profilePicture) {
          localStorage.setItem('profilePicture', data.user.profilePicture);
        }
      }
    } catch {}
    // Keep spinner running during navigation
    window.location.href = isProfileComplete(data.user)
      ? '/feed.html'
      : '/complete-profile.html';
  } catch (err) {
    console.error('Google OAuth error:', err);
    setGoogleLoading(false);
    showError('Something went wrong with Google sign-in');
  }
}

function initGoogleSignup() {
  if (!window.google || !google.accounts || !google.accounts.id) {
    return setTimeout(initGoogleSignup, 300);
  }
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
    ux_mode: 'popup',
    auto_select: false,
  });
  const btn = document.getElementById('googleSignupBtn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setGoogleLoading(true);
      google.accounts.id.prompt((notification) => {
        const dismissed =
          (notification.isNotDisplayed && notification.isNotDisplayed()) ||
          (notification.isSkippedMoment && notification.isSkippedMoment()) ||
          (notification.isDismissedMoment && notification.isDismissedMoment());
        if (dismissed) {
          setGoogleLoading(false);
          google.accounts.id.renderButton(btn, {
            theme: 'outline', size: 'large', width: 320, text: 'signup_with',
          });
        }
      });
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGoogleSignup);
} else {
  initGoogleSignup();
}
