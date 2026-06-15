// ══════════════════════════════════════════════
//  AFRISOCIAL — COMPLETE PROFILE (Google onboarding)
//  Posts to PUT /api/users/update-profile with bearer token
// ══════════════════════════════════════════════

const API_BASE = 'https://afrisocial-backend.onrender.com';

// Auth guard
const token = localStorage.getItem('token');
if (!token) {
  window.location.replace('/log-in.html');
}

// ── DOM refs
const globalError    = document.getElementById('globalError');
const dobWheels      = document.getElementById('dobWheels');
const countryInput   = document.getElementById('countryInput');
const countryToggle  = document.getElementById('countryToggle');
const countryList    = document.getElementById('countryList');
const bio            = document.getElementById('bio');
const bioCount       = document.getElementById('bioCount');
const completeBtn    = document.getElementById('completeBtn');
const completeText   = document.getElementById('completeText');
const completeSpinner= document.getElementById('completeSpinner');
const avatarPreview  = document.getElementById('avatarPreview');

// ── Try to render saved Google profile picture as avatar
try {
  const pic = localStorage.getItem('profilePicture');
  if (pic && pic !== '/uploads/images/africa.png') {
    avatarPreview.innerHTML =
      `<img src="${pic}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
  }
} catch {}

function showError(msg) {
  globalError.textContent = msg || '';
  globalError.classList.toggle('visible', !!msg);
  if (msg) globalError.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ══════════════════════════════════════════════
//  COUNTRY LIST — every country, flag emoji
// ══════════════════════════════════════════════
const COUNTRIES = [
  {code:'DZ',flag:'🇩🇿',name:'Algeria'},
  {code:'AO',flag:'🇦🇴',name:'Angola'},
  {code:'BJ',flag:'🇧🇯',name:'Benin'},
  {code:'BW',flag:'🇧🇼',name:'Botswana'},
  {code:'BF',flag:'🇧🇫',name:'Burkina Faso'},
  {code:'BI',flag:'🇧🇮',name:'Burundi'},
  {code:'CV',flag:'🇨🇻',name:'Cabo Verde'},
  {code:'CM',flag:'🇨🇲',name:'Cameroon'},
  {code:'CF',flag:'🇨🇫',name:'Central African Republic'},
  {code:'TD',flag:'🇹🇩',name:'Chad'},
  {code:'KM',flag:'🇰🇲',name:'Comoros'},
  {code:'CG',flag:'🇨🇬',name:'Congo (Republic)'},
  {code:'CD',flag:'🇨🇩',name:'Congo (DRC)'},
  {code:'CI',flag:'🇨🇮',name:"Côte d'Ivoire"},
  {code:'DJ',flag:'🇩🇯',name:'Djibouti'},
  {code:'EG',flag:'🇪🇬',name:'Egypt'},
  {code:'GQ',flag:'🇬🇶',name:'Equatorial Guinea'},
  {code:'ER',flag:'🇪🇷',name:'Eritrea'},
  {code:'SZ',flag:'🇸🇿',name:'Eswatini'},
  {code:'ET',flag:'🇪🇹',name:'Ethiopia'},
  {code:'GA',flag:'🇬🇦',name:'Gabon'},
  {code:'GM',flag:'🇬🇲',name:'Gambia'},
  {code:'GH',flag:'🇬🇭',name:'Ghana'},
  {code:'GN',flag:'🇬🇳',name:'Guinea'},
  {code:'GW',flag:'🇬🇼',name:'Guinea-Bissau'},
  {code:'KE',flag:'🇰🇪',name:'Kenya'},
  {code:'LS',flag:'🇱🇸',name:'Lesotho'},
  {code:'LR',flag:'🇱🇷',name:'Liberia'},
  {code:'LY',flag:'🇱🇾',name:'Libya'},
  {code:'MG',flag:'🇲🇬',name:'Madagascar'},
  {code:'MW',flag:'🇲🇼',name:'Malawi'},
  {code:'ML',flag:'🇲🇱',name:'Mali'},
  {code:'MR',flag:'🇲🇷',name:'Mauritania'},
  {code:'MU',flag:'🇲🇺',name:'Mauritius'},
  {code:'MA',flag:'🇲🇦',name:'Morocco'},
  {code:'MZ',flag:'🇲🇿',name:'Mozambique'},
  {code:'NA',flag:'🇳🇦',name:'Namibia'},
  {code:'NE',flag:'🇳🇪',name:'Niger'},
  {code:'NG',flag:'🇳🇬',name:'Nigeria'},
  {code:'RW',flag:'🇷🇼',name:'Rwanda'},
  {code:'ST',flag:'🇸🇹',name:'São Tomé and Príncipe'},
  {code:'SN',flag:'🇸🇳',name:'Senegal'},
  {code:'SC',flag:'🇸🇨',name:'Seychelles'},
  {code:'SL',flag:'🇸🇱',name:'Sierra Leone'},
  {code:'SO',flag:'🇸🇴',name:'Somalia'},
  {code:'ZA',flag:'🇿🇦',name:'South Africa'},
  {code:'SS',flag:'🇸🇸',name:'South Sudan'},
  {code:'SD',flag:'🇸🇩',name:'Sudan'},
  {code:'TZ',flag:'🇹🇿',name:'Tanzania'},
  {code:'TG',flag:'🇹🇬',name:'Togo'},
  {code:'TN',flag:'🇹🇳',name:'Tunisia'},
  {code:'UG',flag:'🇺🇬',name:'Uganda'},
  {code:'ZM',flag:'🇿🇲',name:'Zambia'},
  {code:'ZW',flag:'🇿🇼',name:'Zimbabwe'},
];

let selectedCountry = null;

function renderCountryList(filter) {
  const q = (filter || '').trim().toLowerCase();
  const items = q
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(q))
    : COUNTRIES;
  countryList.innerHTML = '';
  if (!items.length) {
    const li = document.createElement('li');
    li.className = 'cp-empty';
    li.textContent = 'No match';
    countryList.appendChild(li);
    return;
  }
  items.forEach(c => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.dataset.code = c.code;
    li.dataset.name = c.name;
    li.innerHTML = `<span class="flag">${c.flag}</span><span>${c.name}</span>`;
    li.addEventListener('click', () => pickCountry(c));
    countryList.appendChild(li);
  });
}

function pickCountry(c) {
  selectedCountry = c;
  countryInput.value = `${c.flag}  ${c.name}`;
  countryList.classList.remove('open');
  checkValid();
}

countryInput.addEventListener('focus', () => {
  renderCountryList(selectedCountry ? '' : countryInput.value);
  countryList.classList.add('open');
});
countryInput.addEventListener('input', () => {
  selectedCountry = null;
  renderCountryList(countryInput.value);
  countryList.classList.add('open');
  checkValid();
});
countryToggle.addEventListener('click', () => {
  if (countryList.classList.contains('open')) {
    countryList.classList.remove('open');
  } else {
    renderCountryList('');
    countryList.classList.add('open');
    countryInput.focus();
  }
});
document.addEventListener('click', e => {
  if (!e.target.closest('.cp-country')) countryList.classList.remove('open');
});

// ══════════════════════════════════════════════
//  WHEEL PICKERS (scroll-snap)
// ══════════════════════════════════════════════
const WHEEL_ITEM_H = 36;
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const wheelEls = {
  day:   dobWheels.querySelector('[data-wheel="day"]'),
  month: dobWheels.querySelector('[data-wheel="month"]'),
  year:  dobWheels.querySelector('[data-wheel="year"]'),
};

const wheelState = { day: 15, month: 6, year: new Date().getFullYear() - 20 };

function daysInMonth(month1, year) {
  return new Date(year, month1, 0).getDate();
}

function buildWheel(name, values, initial) {
  const el = wheelEls[name];
  el.innerHTML = '';
  // Spacer top — pushes first real item into the selection band
  const padTop = document.createElement('div');
  padTop.style.height = (el.clientHeight / 2 - WHEEL_ITEM_H / 2) + 'px';
  el.appendChild(padTop);

  values.forEach(v => {
    const div = document.createElement('div');
    div.className = 'cp-wheel-item';
    div.dataset.value = v.value;
    div.textContent = v.label;
    div.addEventListener('click', () => {
      scrollToValue(name, v.value);
    });
    el.appendChild(div);
  });

  const padBot = document.createElement('div');
  padBot.style.height = (el.clientHeight / 2 - WHEEL_ITEM_H / 2) + 'px';
  el.appendChild(padBot);

  scrollToValue(name, initial, false);
}

function scrollToValue(name, value, smooth = true) {
  const el = wheelEls[name];
  const target = el.querySelector(`.cp-wheel-item[data-value="${value}"]`);
  if (!target) return;
  const offset = target.offsetTop - (el.clientHeight / 2 - WHEEL_ITEM_H / 2);
  el.scrollTo({ top: offset, behavior: smooth ? 'smooth' : 'auto' });
  setTimeout(() => updateSelected(name), smooth ? 250 : 0);
}

function updateSelected(name) {
  const el = wheelEls[name];
  const items = el.querySelectorAll('.cp-wheel-item');
  const mid = el.scrollTop + el.clientHeight / 2;
  let best = null;
  let bestDist = Infinity;
  items.forEach(it => {
    const center = it.offsetTop + it.offsetHeight / 2;
    const d = Math.abs(center - mid);
    if (d < bestDist) { bestDist = d; best = it; }
  });
  if (!best) return;
  items.forEach(i => i.classList.remove('selected'));
  best.classList.add('selected');
  wheelState[name] = parseInt(best.dataset.value, 10);

  // Rebuild day wheel if month/year changed and current day exceeds new max
  if (name === 'month' || name === 'year') {
    const maxD = daysInMonth(wheelState.month, wheelState.year);
    if (wheelState.day > maxD) wheelState.day = maxD;
    rebuildDayWheel();
  }
  checkValid();
}

let scrollTimers = {};
function attachWheelScroll(name) {
  const el = wheelEls[name];
  el.addEventListener('scroll', () => {
    clearTimeout(scrollTimers[name]);
    scrollTimers[name] = setTimeout(() => {
      updateSelected(name);
      const it = el.querySelector('.cp-wheel-item.selected');
      if (it) {
        const offset = it.offsetTop - (el.clientHeight / 2 - WHEEL_ITEM_H / 2);
        if (Math.abs(el.scrollTop - offset) > 1) {
          el.scrollTo({ top: offset, behavior: 'smooth' });
        }
      }
    }, 90);
  });
}

function rebuildDayWheel() {
  const maxD = daysInMonth(wheelState.month, wheelState.year);
  const vals = [];
  for (let d = 1; d <= maxD; d++) vals.push({ value: d, label: String(d).padStart(2,'0') });
  // Preserve scroll position to current day
  const cur = wheelState.day;
  buildWheel('day', vals, cur);
}

function initWheels() {
  const maxYear = new Date().getFullYear() - 13;
  const minYear = new Date().getFullYear() - 100;
  const yearVals = [];
  for (let y = maxYear; y >= minYear; y--) yearVals.push({ value: y, label: String(y) });
  const monthVals = MONTHS.map((m,i) => ({ value: i+1, label: m }));
  const dayVals = [];
  for (let d = 1; d <= 31; d++) dayVals.push({ value: d, label: String(d).padStart(2,'0') });

  buildWheel('year',  yearVals,  wheelState.year);
  buildWheel('month', monthVals, wheelState.month);
  buildWheel('day',   dayVals,   wheelState.day);

  attachWheelScroll('day');
  attachWheelScroll('month');
  attachWheelScroll('year');
}

// Wait for layout
window.addEventListener('load', () => {
  initWheels();
  renderCountryList('');
});

// ══════════════════════════════════════════════
//  BIO + VALIDATION
// ══════════════════════════════════════════════
bio.addEventListener('input', () => {
  bioCount.textContent = bio.value.length;
});

function checkValid() {
  const ok = !!selectedCountry
    && wheelState.day >= 1
    && wheelState.month >= 1 && wheelState.month <= 12
    && wheelState.year >= 1900;
  completeBtn.disabled = !ok;
}

// ══════════════════════════════════════════════
//  SUBMIT
// ══════════════════════════════════════════════
completeBtn.addEventListener('click', async () => {
  if (completeBtn.disabled) return;
  if (!selectedCountry) {
    showError('Please pick your country.');
    return;
  }
  showError('');
  completeBtn.disabled = true;
  completeText.textContent = 'Saving…';
  completeSpinner.hidden = false;

  const dd = String(wheelState.day).padStart(2,'0');
  const mm = String(wheelState.month).padStart(2,'0');
  const yyyy = String(wheelState.year);
  const dob = `${yyyy}-${mm}-${dd}`;

  const form = new FormData();
  form.append('dob', dob);
  form.append("country", selectedCountry.code.toLowerCase());
  form.append('bio', (bio.value || '').trim());

  try {
    const res = await fetch(`${API_BASE}/api/users/update-profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showError(
        (data && data.message && data.message.length < 200)
          ? data.message
          : 'Failed to save. Please try again.'
      );
      completeBtn.disabled = false;
      completeText.textContent = 'Complete';
      completeSpinner.hidden = true;
      return;
    }
    // Done — onto interests / connect flow
    window.location.href = '/connect.html';
  } catch (err) {
    console.error(err);
    showError('Network error. Please check your connection.');
    completeBtn.disabled = false;
    completeText.textContent = 'Complete';
    completeSpinner.hidden = true;
  }
});
