// ══════════════════════════════════════════════
//  AFRISOCIAL — LOGIN PAGE JAVASCRIPT
//  Security, validation, auth, UI helpers
// ══════════════════════════════════════════════

// ══════════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════════

const API_BASE = "https://afrisocial-backend.onrender.com";
// const GOOGLE_CLIENT_ID = "629115843529-kdbk20vvmt5c0i7fgaliatmkhsb9tasj.apps.googleusercontent.com";

// ══════════════════════════════════════════════
//  SECURITY: RATE LIMITER
//  Blocks brute-force login attempts
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
    },
    waitTime(key, windowMs = 60_000) {
      const now = Date.now();
      if (!attempts[key] || !attempts[key].length) return 0;
      return Math.ceil((windowMs - (now - attempts[key][0])) / 1000);
    }
  };
})();

// ══════════════════════════════════════════════
//  SECURITY: INPUT SANITIZER
// ══════════════════════════════════════════════

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// ══════════════════════════════════════════════
//  SECURITY: EMAIL VALIDATOR
// ══════════════════════════════════════════════

function isValidEmail(val) {
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(val.trim());
}

// ══════════════════════════════════════════════
//  TOKEN STORAGE — localStorage
// ══════════════════════════════════════════════

function storeSession(token, userId, username) {
  try {
    localStorage.setItem('token',    token);
    localStorage.setItem('userId',   userId);
    localStorage.setItem('username', username);
  } catch {
    console.warn('Storage unavailable');
  }
}

// ══════════════════════════════════════════════
//  UI HELPERS
// ══════════════════════════════════════════════

const errorWrap = document.getElementById('errorWrap');
const errorText = document.getElementById('errorText');
const loginBtn  = document.getElementById('loginBtn');

function showError(msg) {
  errorText.textContent = msg;
  errorWrap.classList.add('visible');
}

function clearError() {
  errorText.textContent = '';
  errorWrap.classList.remove('visible');
}

function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  loginBtn.classList.toggle('loading', isLoading);
}

// ══════════════════════════════════════════════
//  PASSWORD TOGGLE
// ══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('.input-c');

  containers.forEach(container => {
    const input = container.querySelector('.password');
    const eye   = container.querySelector('.eye');
    if (!input || !eye) return;

    eye.addEventListener('click', () => {
      if (input.type === 'password') {
        input.type = 'text';
        eye.querySelector('.eye-closed').style.display = 'none';
        eye.querySelector('.eye-open').style.display   = 'block';
      } else {
        input.type = 'password';
        eye.querySelector('.eye-closed').style.display = 'block';
        eye.querySelector('.eye-open').style.display   = 'none';
      }
    });

    eye.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        eye.click();
      }
    });
  });
});

// ══════════════════════════════════════════════
//  LOGIN FORM SUBMIT
// ══════════════════════════════════════════════

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  clearError();

  const emailVal    = document.getElementById('email').value.trim();
  const passwordVal = document.getElementById('password').value;

  // Client-side validation
  if (!emailVal || !passwordVal) {
    showError('Please fill in all fields.');
    return;
  }

  if (!isValidEmail(emailVal)) {
    showError('Please enter a valid email address.');
    return;
  }

  // Rate limit check
  if (!RateLimiter.check('login', 5, 60_000)) {
    const wait = RateLimiter.waitTime('login', 60_000);
    showError(`Too many attempts. Please wait ${wait} seconds.`);
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(`${API_BASE}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type':     'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({
        email:    sanitize(emailVal),
        password: passwordVal,
      }),
      credentials: 'include',
    });

    const data = await response.json();

    if (response.ok) {
      storeSession(
        data.token,
        data.user._id,
        data.user.username
      );

      // Clear password from memory before redirect
      document.getElementById('password').value = '';
      window.location.href = '/feed.html';

    } else {
      const safeMsg = data.message && data.message.length < 200
        ? data.message
        : 'Login failed. Please try again.';
      showError(safeMsg);
    }

  } catch (err) {
    console.error('Login error:', err);
    showError('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
});

// ══════════════════════════════════════════════
//  GOOGLE OAUTH — TEMPORARILY DISABLED
//  Uncomment and wire up when ready to activate
// ══════════════════════════════════════════════

/*
window.handleGoogleCredential = async (response) => {
  if (!response || !response.credential) {
    showError('Google sign-in failed. Please try again.');
    return;
  }

  if (!RateLimiter.check('google-login', 5, 60_000)) {
    showError('Too many attempts. Please wait a moment.');
    return;
  }

  clearError();

  const googleBtn       = document.getElementById('googleBtn');
  googleBtn.disabled    = true;
  googleBtn.textContent = 'Signing in...';

  try {
    const res = await fetch(`${API_BASE}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type':     'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({ credential: response.credential }),
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.message || 'Google sign-in failed.');
      return;
    }

    storeSession(data.token, data.user._id, data.user.username);
    window.location.href = '/feed.html';

  } catch (err) {
    console.error('Google login error:', err);
    showError('Something went wrong with Google sign-in.');
  } finally {
    googleBtn.disabled    = false;
    googleBtn.textContent = 'Continue with Google';
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
//  GOOGLE SIGN-IN
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
  const btn = document.getElementById('googleBtn');
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
  if (!RateLimiter.check('google-login', 5, 60_000)) {
    setGoogleLoading(false);
    showError('Too many attempts. Please wait a moment.');
    return;
  }
  clearError();
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
      showError(data.message || 'Google sign-in failed.');
      return;
    }
    storeSession(
      data.token,
      data.user.id || data.user._id,
      data.user.username
    );
    try {
      if (data.user && data.user.profilePicture) {
        localStorage.setItem('profilePicture', data.user.profilePicture);
      }
    } catch {}
    // Keep spinner running during navigation
    window.location.href = isProfileComplete(data.user)
      ? '/feed.html'
      : '/complete-profile.html';
  } catch (err) {
    console.error('Google login error:', err);
    setGoogleLoading(false);
    showError('Something went wrong with Google sign-in.');
  }
}

function initGoogleLogin() {
  if (!window.google || !google.accounts || !google.accounts.id) {
    return setTimeout(initGoogleLogin, 300);
  }
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
    ux_mode: 'popup',
    auto_select: false,
  });
  const btn = document.getElementById('googleBtn');
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
            theme: 'outline', size: 'large', width: 320, text: 'signin_with',
          });
        }
      });
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGoogleLogin);
} else {
  initGoogleLogin();
}
