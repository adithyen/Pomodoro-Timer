/* ============================================================
   GrindReceiptz — timer.js
   ============================================================ */

// ==================== PERSONALITY DATA ====================
const PERSONALITIES = {
  'asian-mom': {
    emoji: '👩‍👧',
    name:  'Strict Asian Mom',
    start: [
      "Timer running. No excuses.",
      "Your cousin already started 20 mins ago.",
      "No distractions. I'm timing you.",
      "Focus. Now. I am watching."
    ],
    mid: [
      "Still going? Good. Don't stop.",
      "No water break. Not yet.",
      "B+ is not acceptable. Neither is distraction.",
      "Stop looking at your phone.",
      "I didn't raise a quitter.",
      "You call this focus? I call this minimum.",
      "Work harder. Your future self is watching.",
      "Why are you slowing down? Speed up."
    ],
    breakStart: [
      "Fine. 5 minutes. Not 6.",
      "Rest. But think about what you did.",
      "Okay. Eat something. Fast."
    ],
    done: [
      "You finished? Good. Now do it again.",
      "结束了? Then prepare for next round.",
      "Okay. That was acceptable. Barely."
    ]
  },

  'chill-friend': {
    emoji: '😌',
    name:  'Chill Friend',
    start: [
      "hey… maybe focus a lil? no pressure tho.",
      "you got this bestie fr fr 💅",
      "vibes locked in. let's gooo.",
      "okay okay we're doing this. let's go."
    ],
    mid: [
      "omg you're still going?? queen behavior.",
      "lowkey proud of you ngl.",
      "slay. but like actually work tho.",
      "don't let me distract you… but also hi 👋",
      "you ate that. keep eating.",
      "bestie behavior activated rn.",
      "ok ok ok you're doing SO good.",
      "not me checking in on you mid-focus 😭"
    ],
    breakStart: [
      "okay take a breath bestie.",
      "snack break? hydrate queen.",
      "you literally deserve this break omg."
    ],
    done: [
      "PERIODT. you did THAT 💅",
      "ok but that was actually impressive ngl.",
      "we love a focused era bestie."
    ]
  },

  'corporate': {
    emoji: '📊',
    name:  'Corporate Manager',
    start: [
      "Your productivity KPI is declining. Synergy now.",
      "Let's align on deliverables. Timer initiated.",
      "Action item: Focus. Owner: You. Due: Now.",
      "Per my previous reminder: please focus."
    ],
    mid: [
      "Circling back to ask if you're focused.",
      "Per my last thought: keep working.",
      "This is a high-impact focus window. Leverage it.",
      "Don't make me schedule a check-in.",
      "I'm going to need you to move faster on this.",
      "Looping in your future self for accountability.",
      "Per our previous session: more output needed.",
      "Let's take this offline and focus harder."
    ],
    breakStart: [
      "Break approved. 5 mins. No more.",
      "Recharge. We have a 2pm crunch.",
      "Wellness break authorized. ROI pending."
    ],
    done: [
      "KPI achieved. Please forward this receipt to stakeholders.",
      "Deliverable complete. Update your Jira ticket.",
      "Good work. Now what's next on the roadmap?"
    ]
  },

  'philosopher': {
    emoji: '🌀',
    name:  'Existential Philosopher',
    start: [
      "Time is an illusion. But deadlines are not.",
      "You exist. Therefore you must focus.",
      "The void stares back. Focus harder.",
      "To act is to resist the absurd. Begin."
    ],
    mid: [
      "Every second is a tiny death. Make it count.",
      "Sisyphus would have finished by now.",
      "Is focus real? Doesn't matter. Do it anyway.",
      "The universe is 13.8B years old. You've worked 4 mins.",
      "Are you truly here? Be here.",
      "Schrodinger's productivity: complete and incomplete until observed.",
      "You are stardust attempting a task. Remarkable.",
      "Camus would not take a tab break. Neither should you."
    ],
    breakStart: [
      "Rest. Even Nietzsche rested.",
      "The mind needs silence to hear itself lie.",
      "Pause. Reflect. Panic quietly. Then return."
    ],
    done: [
      "You have completed the task. Nothing means anything. Great job.",
      "The task is done. The universe remains indifferent. Well done.",
      "Entropy was briefly defeated. Celebrate modestly."
    ]
  }
};

// ==================== ACCENT COLOR MAP ====================
const ACCENTS = {
  work:  { dark: '#e05c5c', light: '#c83c3c', darkGlow: 'rgba(224,92,92,0.25)',  lightGlow: 'rgba(200,60,60,0.18)'  },
  short: { dark: '#5ce0b8', light: '#1eb482', darkGlow: 'rgba(92,224,184,0.25)', lightGlow: 'rgba(30,180,130,0.18)' },
  long:  { dark: '#5c9ee0', light: '#3278d2', darkGlow: 'rgba(92,158,224,0.25)', lightGlow: 'rgba(50,120,210,0.18)' }
};

const MODE_LABELS = {
  work:  'FOCUS SESSION',
  short: 'SHORT BREAK',
  long:  'LONG BREAK'
};

// ==================== STATE ====================
let personality    = 'asian-mom';
let settings       = { work: 25, short: 5, long: 15 };
let timerMode      = 'work';
let totalSeconds   = settings.work * 60;
let remaining      = totalSeconds;
let running        = false;
let interval       = null;
let session        = 1;
let completedWork  = 0;
let soundEnabled   = true;
let isDark         = true;
let tickerInterval = null;
let notifInterval  = null;

// Session stats used for the receipt
const sessionStats = {
  focusSessions:      0,
  shortBreaks:        0,
  longBreaks:         0,
  skips:              0,
  totalFocusMinutes:  0,
  startTime:          null
};

// ==================== RING SETUP ====================
const CIRCUMFERENCE = 2 * Math.PI * 148;
const ringProgress  = document.getElementById('ring-progress');
ringProgress.style.strokeDasharray = CIRCUMFERENCE;

function setRing(ratio) {
  ringProgress.style.strokeDashoffset = CIRCUMFERENCE * (1 - ratio);
}

// ==================== DISPLAY ====================
function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function updateDisplay() {
  document.getElementById('timer-digits').textContent = fmt(remaining);
  setRing(remaining / totalSeconds);
  document.getElementById('timer-session').textContent = `SESSION ${session} OF 4`;
  updateSessionDots();
}

function updateSessionDots() {
  const dots = document.getElementById('session-dots');
  dots.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const d = document.createElement('div');
    d.className = 'sdot' + (i < completedWork ? ' filled' : '');
    dots.appendChild(d);
  }
}

// ==================== ACCENT / MODE COLORS ====================
function applyAccent(m) {
  const isLight = document.documentElement.classList.contains('light');
  const acc  = isLight ? ACCENTS[m].light    : ACCENTS[m].dark;
  const glow = isLight ? ACCENTS[m].lightGlow : ACCENTS[m].darkGlow;
  document.documentElement.style.setProperty('--accent', acc);
  document.documentElement.style.setProperty('--glow',   glow);
  ringProgress.style.stroke = acc;
  document.getElementById('timer-label').textContent = MODE_LABELS[m];
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.mode === m));
}

// ==================== PERSONALITY TICKER ====================
function startTicker() {
  stopTicker();
  const p    = PERSONALITIES[personality];
  const pool = [...p.start, ...p.mid];
  let idx    = Math.floor(Math.random() * pool.length);
  const el   = document.getElementById('personality-ticker');

  const show = () => {
    el.style.opacity = 0;
    setTimeout(() => {
      el.textContent  = pool[idx % pool.length];
      el.style.opacity = 0.75;
      idx++;
    }, 400);
  };
  show();
  tickerInterval = setInterval(show, 13000);
}

function stopTicker() {
  clearInterval(tickerInterval);
}

function setTickerMsg(msg) {
  stopTicker();
  const el = document.getElementById('personality-ticker');
  el.style.opacity = 0;
  setTimeout(() => {
    el.textContent  = msg;
    el.style.opacity = 0.75;
  }, 400);
}

// ==================== SILENT NOTIFICATIONS ====================
function startSilentNotifs() {
  clearInterval(notifInterval);
  const msgs = PERSONALITIES[personality].mid;
  let idx    = Math.floor(Math.random() * msgs.length);

  notifInterval = setInterval(() => {
    if (!running) return;
    showNotif(msgs[idx % msgs.length]);
    idx++;
  }, 90000);
}

function stopSilentNotifs() {
  clearInterval(notifInterval);
}

// ==================== BACKGROUND TAB INDICATOR ====================
// Uses the Page Visibility API to show the live countdown in the browser
// tab title and favicon badge whenever the user switches to another tab.
// Everything is restored the moment the user comes back.

const _originalTitle = document.title;

// Grab or create a <link rel="icon"> so we can swap the favicon
let _faviconEl = document.querySelector("link[rel~='icon']");
if (!_faviconEl) {
  _faviconEl = document.createElement('link');
  _faviconEl.rel = 'icon';
  document.head.appendChild(_faviconEl);
}
const _originalFavicon = _faviconEl.href;

// Badge fill colours — one per timer mode, matching the app's accent palette
const _BADGE_COLORS = {
  work:  '#e05c5c',
  short: '#5ce0b8',
  long:  '#5c9ee0'
};

/**
 * Renders a 32×32 circular favicon badge showing the minutes remaining.
 * @param {string} label - Text to display inside the badge (e.g. "23")
 * @param {string} color - CSS colour for the badge background
 */
function _setFaviconBadge(label, color) {
  const canvas = document.createElement('canvas');
  canvas.width  = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  // Filled circle
  ctx.beginPath();
  ctx.arc(16, 16, 16, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();

  // Minutes label
  ctx.fillStyle    = '#ffffff';
  ctx.font         = 'bold 13px Arial';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 16, 17);

  _faviconEl.href = canvas.toDataURL('image/png');
}

/** Restores the original page title and favicon. */
function _restoreTabIndicators() {
  document.title  = _originalTitle;
  _faviconEl.href = _originalFavicon;
}

/**
 * Called on every timer tick (and on pause/complete).
 * - Tab title: always shows the live countdown so the user can glance at
 *   the tab from any other tab without switching back.
 * - Favicon badge: only shown when the tab is hidden (avoids visual noise
 *   while the user is actively on the page).
 * - Both are restored when the timer stops or is paused.
 */
function updateBackgroundTabIndicator() {
  if (!running) {
    _restoreTabIndicators();
    return;
  }

  const timeStr = fmt(remaining);                      // "23:45"
  const label   = MODE_LABELS[timerMode];              // "FOCUS SESSION"
  const minutes = String(Math.floor(remaining / 60));  // "23"

  // Always update the tab title — visible from any tab in the browser
  document.title = `\u23F1 ${timeStr} \u2013 ${label}`;

  // Favicon badge only when the tab is in the background
  if (document.hidden) {
    _setFaviconBadge(minutes, _BADGE_COLORS[timerMode]);
  } else {
    _faviconEl.href = _originalFavicon; // restore favicon when tab is active
  }
}

// Instantly restore title + favicon when the user returns to the tab
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) _restoreTabIndicators();
});

// ==================== WEB NOTIFICATIONS ====================
// Requests permission once (on first user interaction) and fires an OS-level
// browser notification when a session ends — so the user is alerted even if
// GrindReceiptz is buried behind other windows or a full-screen app.

/**
 * Notification copy per mode and personality.
 * Mirrors the personality-driven tone of the rest of the app.
 */
const _NOTIF_MESSAGES = {
  work: {
    'asian-mom':    { title: '✦ Focus Session Done',   body: 'Good. Now take exactly 5 minutes. Not 6.' },
    'chill-friend': { title: '✦ Focus Session Done',   body: 'omg bestie you actually did it 💅 break time!' },
    'corporate':    { title: '✦ Focus Session Done',   body: 'Deliverable complete. Break authorized. ROI pending.' },
    'philosopher':  { title: '✦ Focus Session Done',   body: 'The void approves. Rest briefly before the next absurdity.' }
  },
  short: {
    'asian-mom':    { title: '⏱ Break Over',           body: 'Break is done. Back to work. Your cousin never stopped.' },
    'chill-friend': { title: '⏱ Break Over',           body: 'okayyyy back to it bestie, you got this 🫶' },
    'corporate':    { title: '⏱ Break Over',           body: 'Recharge complete. Synergy window reopened.' },
    'philosopher':  { title: '⏱ Break Over',           body: 'The pause has ended. Return to your Sisyphean task.' }
  },
  long: {
    'asian-mom':    { title: '⏱ Long Break Over',      body: 'Enough rest. Back to work. Now.' },
    'chill-friend': { title: '⏱ Long Break Over',      body: 'okay that was a vibe but focus era is back bestie 💪' },
    'corporate':    { title: '⏱ Long Break Over',      body: 'Extended recharge cycle complete. Align on next sprint.' },
    'philosopher':  { title: '⏱ Long Break Over',      body: 'You have rested. The universe waited. Now act.' }
  }
};

/**
 * Asks for notification permission on the first meaningful user interaction
 * (play button click). We defer until then because browsers block permission
 * prompts that aren't triggered by a user gesture.
 */
function requestNotifPermission() {
  if (!('Notification' in window)) return;           // browser doesn't support it
  if (Notification.permission === 'granted') return; // already have it
  if (Notification.permission === 'denied') return;  // user explicitly blocked it
  Notification.requestPermission();                  // ask once
}

/**
 * Fires an OS-level browser notification for the completed session.
 * Only sends if permission is granted — never forces or re-asks.
 * @param {string} mode - The timerMode that just finished ('work'|'short'|'long')
 */
function sendSessionNotification(mode) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const msg  = _NOTIF_MESSAGES[mode][personality];
  const notif = new Notification(msg.title, {
    body: msg.body,
    icon: _originalFavicon || undefined,  // use the site favicon as the notif icon
    tag:  'grindreceiptz-session'         // replaces any previous notif instead of stacking
  });

  // Auto-close after 8 s so it doesn't linger
  setTimeout(() => notif.close(), 8000);

  // Clicking the notification focuses the GrindReceiptz tab
  notif.addEventListener('click', () => {
    window.focus();
    notif.close();
  });
}

// ==================== TIMER CORE ====================
function start() {
  if (!sessionStats.startTime) sessionStats.startTime = new Date();
  running = true;
  document.getElementById('play-icon').style.display  = 'none';
  document.getElementById('pause-icon').style.display = 'block';
  startTicker();
  startSilentNotifs();

  requestNotifPermission(); // ask once on first play, requires user gesture

  interval = setInterval(() => {
    remaining--;
    updateDisplay();
    updateBackgroundTabIndicator(); // update tab title + favicon on every tick

    if (remaining === Math.floor(totalSeconds / 2) && timerMode === 'work') {
      const m = PERSONALITIES[personality].mid;
      showNotif(m[Math.floor(Math.random() * m.length)]);
    }
    if (remaining === 60 && timerMode === 'work') {
      showNotif('\u23F1 1 minute left...');
    }
    if (remaining <= 10 && remaining > 0 && soundEnabled) {
      playTick();
    }

    if (remaining <= 0) {
      clearInterval(interval);
      running = false;
      _restoreTabIndicators();        // restore tab title + favicon
      sendSessionNotification(timerMode); // OS-level browser notification
      onComplete();
    }
  }, 1000);
}

function pause() {
  running = false;
  clearInterval(interval);
  stopSilentNotifs();
  stopTicker();
  _restoreTabIndicators(); // restore when paused
  document.getElementById('play-icon').style.display  = 'block';
  document.getElementById('pause-icon').style.display = 'none';
  setTickerMsg('\u23F8 paused. still here tho.');
}

function reset() {
  pause();
  remaining = totalSeconds;
  updateDisplay();
  setRing(1);
}

function skip() {
  sessionStats.skips++;
  pause();
  onComplete(true);
}

function onComplete(skipped = false) {
  document.getElementById('play-icon').style.display  = 'block';
  document.getElementById('pause-icon').style.display = 'none';
  stopSilentNotifs();
  if (soundEnabled) playChime();

  if (timerMode === 'work') {
    sessionStats.focusSessions++;
    sessionStats.totalFocusMinutes += Math.round((totalSeconds - remaining) / 60);

    completedWork = (completedWork + 1) % 5;
    session       = session < 4 ? session + 1 : 1;

    const nextMode = (completedWork % 4 === 0 && completedWork > 0) ? 'long' : 'short';
    const donePool = PERSONALITIES[personality].done;
    if (!skipped) showNotif('\uD83C\uDF89 ' + donePool[Math.floor(Math.random() * donePool.length)]);

    if (sessionStats.focusSessions % 4 === 0) {
      setTimeout(showReceipt, 1200);
    }

    if (nextMode === 'short') sessionStats.shortBreaks++;
    else                      sessionStats.longBreaks++;

    switchTimerMode(nextMode);
  } else {
    const startPool = PERSONALITIES[personality].start;
    if (!skipped) showNotif(startPool[Math.floor(Math.random() * startPool.length)]);
    switchTimerMode('work');
  }
}

function switchTimerMode(m) {
  timerMode     = m;
  totalSeconds  = settings[m] * 60;
  remaining     = totalSeconds;
  applyAccent(m);
  updateDisplay();
}

// ==================== RECEIPT GENERATOR ====================
function showReceipt() {
  spawnConfetti();

  const now     = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('receipt-date').textContent = `${dateStr} \u00B7 ${timeStr}`;

  const p          = PERSONALITIES[personality];
  const mins       = sessionStats.totalFocusMinutes;
  const tabCount   = 3  + Math.floor(Math.random() * 22);
  const crises     = 1  + Math.floor(Math.random() * 4);
  const snacks     = 1  + Math.floor(Math.random() * 5);
  const distracted = 1  + Math.floor(Math.random() * 9);
  const regrets    = 1  + Math.floor(Math.random() * 3);

  const lines = [
    { n: 'Deep Focus Sessions',      v: `${sessionStats.focusSessions}x` },
    { n: 'Minutes Actually Worked',  v: `${mins} min`                    },
    { n: 'Tab Switching (est.)',      v: `${tabCount}x`                   },
    { n: 'Existential Crises',       v: `${crises}x`                     },
    { n: 'Phantom Snack Breaks',     v: `${snacks}x`                     },
    { n: 'Times Got Distracted',     v: `${distracted}x`                 },
    { n: 'Sessions Skipped',         v: `${sessionStats.skips}x`         },
    { n: 'Regrets (minor)',          v: `${regrets}x`                    },
    { n: 'Delusion: Productive',     v: '\u2713 YES'                     },
  ];

  const verdicts = {
    'asian-mom':    [
      "You did okay. Your cousin did better.",
      "B+ effort. A+ is expected next time.",
      "Good. Now clean your room too."
    ],
    'chill-friend': [
      "lowkey you actually did that bestie \uD83D\uDC85",
      "slay era confirmed. go hydrate now.",
      "ngl you kinda ate this one fr."
    ],
    'corporate':    [
      "Exceeds Minimum Expectations (barely).",
      "ROI: Positive. Recommend continued synergy.",
      "KPIs partially met. Schedule follow-up."
    ],
    'philosopher':  [
      "You have outrun entropy. Briefly.",
      "Sisyphus would be proud. Rock still there tho.",
      "Consciousness chose productivity. Remarkable."
    ]
  };

  const vPool   = verdicts[personality];
  const verdict = vPool[Math.floor(Math.random() * vPool.length)];

  const ratings = ['D', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+', 'S'];
  const rIdx    = Math.min(sessionStats.focusSessions - (sessionStats.skips > 2 ? 1 : 0), ratings.length - 1);
  const rating  = ratings[Math.max(0, rIdx)];

  const linesHTML = lines.map(l => `
    <div class="receipt-line">
      <span class="receipt-line-name">${l.n}</span>
      <span class="receipt-line-dots"></span>
      <span class="receipt-line-val">${l.v}</span>
    </div>`).join('');

  document.getElementById('receipt-body').innerHTML = `
    <div class="receipt-section-title">\u2014 TODAY'S PRODUCTIVITY RECEIPT \u2014</div>
    ${linesHTML}
    <hr class="receipt-divider">
    <div class="receipt-total-line"><span>TOTAL GRIND TIME</span><span>${mins} min</span></div>
    <div class="receipt-total-line"><span>OVERALL RATING</span><span>${rating}</span></div>
    <div class="receipt-verdict">
      "${verdict}"
      <div class="receipt-coach">\u2014 ${p.name}</div>
    </div>
  `;

  const bc = document.getElementById('receipt-barcode');
  bc.innerHTML = '';
  for (let i = 0; i < 44; i++) {
    const bar = document.createElement('span');
    bar.style.width   = (Math.random() > 0.55 ? 3 : 1) + 'px';
    bar.style.opacity = Math.random() * 0.4 + 0.6;
    bc.appendChild(bar);
  }

  document.getElementById('receipt-overlay').classList.add('open');
}

function spawnConfetti() {
  const colors = ['#e05c5c', '#5ce0b8', '#5c9ee0', '#f0c040', '#e05cb8', '#c0f040'];
  for (let i = 0; i < 70; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-bit';
      el.style.cssText = [
        `left:${Math.random() * 100}vw`,
        `top:-12px`,
        `width:${5 + Math.random() * 9}px`,
        `height:${5 + Math.random() * 9}px`,
        `background:${colors[Math.floor(Math.random() * colors.length)]}`,
        `transform:rotate(${Math.random() * 360}deg)`,
        `animation-duration:${1.5 + Math.random() * 2}s`,
        `animation-delay:${Math.random() * 0.4}s`
      ].join(';');
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3500);
    }, i * 18);
  }
}

// ==================== AUDIO ENGINE ====================
let audioCtx = null;

function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playChime() {
  try {
    const ctx = getAudio();
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type            = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.start(t);
      osc.stop(t + 0.65);
    });
  } catch (e) {}
}

function playClick() {
  try {
    const ctx  = getAudio();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type            = 'square';
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.start(t);
    osc.stop(t + 0.06);
  } catch (e) {}
}

function playTick() {
  try {
    const ctx  = getAudio();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1200;
    osc.type            = 'sine';
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.start(t);
    osc.stop(t + 0.09);
  } catch (e) {}
}

// ==================== NOTIFICATIONS ====================
let notifTimer;

function showNotif(msg) {
  const n = document.getElementById('notif');
  n.textContent = msg;
  n.classList.add('show');
  clearTimeout(notifTimer);
  notifTimer = setTimeout(() => n.classList.remove('show'), 4000);
}

// ==================== THEME ====================
function applyTheme(dark) {
  isDark = dark;
  document.documentElement.classList.toggle('light', !dark);
  document.getElementById('toggle-thumb').textContent = dark ? '\uD83C\uDF19' : '\u2600\uFE0F';
  applyAccent(timerMode);
  try { localStorage.setItem('gr-theme', dark ? 'dark' : 'light'); } catch (e) {}
}

// ==================== PERSONALITY ====================
function applyPersonality(id) {
  personality = id;
  try { localStorage.setItem('gr-personality', id); } catch (e) {}
  document.body.dataset.vibe = id;

  const p = PERSONALITIES[id];
  document.getElementById('pbadge-emoji').textContent = p.emoji;
  document.getElementById('pbadge-name').textContent  = p.name;
  document.querySelectorAll('.personality-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.personality === id);
  });
  if (running) startTicker();
  else         setTickerMsg(p.start[0]);
}

// ==================== PARTICLE BACKGROUND ====================
(function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x       = Math.random() * W;
      this.y       = Math.random() * H;
      this.r       = Math.random() * 1.5 + 0.3;
      this.vx      = (Math.random() - 0.5) * 0.12;
      this.vy      = (Math.random() - 0.5) * 0.12;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.twinkle = Math.random() * Math.PI * 2;
      this.tSpeed  = 0.01 + Math.random() * 0.02;
    }
    update() {
      this.x       += this.vx;
      this.y       += this.vy;
      this.twinkle += this.tSpeed;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      const alpha = this.opacity * (0.6 + 0.4 * Math.sin(this.twinkle));
      const light = document.documentElement.classList.contains('light');
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = light ? `rgba(60,55,80,${alpha})` : `rgba(232,233,245,${alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 160; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();

// ==================== EVENT LISTENERS ====================

document.querySelectorAll('.personality-card').forEach(card => {
  card.addEventListener('click', () => applyPersonality(card.dataset.personality));
});

document.getElementById('btn-start').addEventListener('click', () => {
  const ob = document.getElementById('onboarding');
  ob.style.opacity       = '0';
  ob.style.transform     = 'scale(0.95)';
  ob.style.pointerEvents = 'none';
  setTimeout(() => ob.style.display = 'none', 500);

  document.getElementById('app').classList.add('visible');
  setTickerMsg(PERSONALITIES[personality].start[0]);
});

document.getElementById('personality-badge').addEventListener('click', () => {
  pause();
  const ob = document.getElementById('onboarding');
  ob.style.display       = 'flex';
  ob.style.opacity       = '0';
  ob.style.transform     = 'scale(0.96)';
  ob.style.pointerEvents = 'all';
  setTimeout(() => {
    ob.style.opacity   = '1';
    ob.style.transform = 'scale(1)';
  }, 10);
  document.getElementById('app').classList.remove('visible');
});

document.getElementById('btn-play').addEventListener('click', () => {
  if (soundEnabled) playClick();
  running ? pause() : start();
});

document.getElementById('btn-reset').addEventListener('click', () => {
  if (soundEnabled) playClick();
  reset();
});

document.getElementById('btn-skip').addEventListener('click', () => {
  if (soundEnabled) playClick();
  skip();
});

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    if (tab.dataset.mode === timerMode) return;
    pause();
    switchTimerMode(tab.dataset.mode);
    showNotif(`Switched to ${tab.textContent}`);
  });
});

document.querySelectorAll('.sctrl').forEach(btn => {
  btn.addEventListener('click', () => {
    const s   = btn.dataset.setting;
    const dir = parseInt(btn.dataset.dir);
    const max = s === 'work' ? 60 : 30;
    settings[s] = Math.min(max, Math.max(1, settings[s] + dir));
    document.getElementById(`sval-${s}`).textContent = settings[s];
    if (s === timerMode) {
      totalSeconds = settings[s] * 60;
      if (!running) { remaining = totalSeconds; updateDisplay(); }
    }
    if (soundEnabled) playClick();
  });
});

document.getElementById('sound-toggle').addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  const el = document.getElementById('sound-toggle');
  el.textContent = soundEnabled ? '\uD83D\uDD14' : '\uD83D\uDD15';
  el.classList.toggle('active', soundEnabled);
});

document.getElementById('theme-toggle').addEventListener('click', () => {
  if (soundEnabled) playClick();
  applyTheme(!isDark);
  showNotif(isDark ? '\u2736 Dark mode' : '\u2600\uFE0F Light mode');
});

document.getElementById('receipt-close').addEventListener('click', () => {
  document.getElementById('receipt-overlay').classList.remove('open');
});

document.getElementById('btn-receipt').addEventListener('click', () => {
  if (soundEnabled) playClick();
  showReceipt();
});

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey) return;

  if (e.code === 'Space') {
    e.preventDefault();
    if (soundEnabled) playClick();
    running ? pause() : start();
  }
  if (e.code === 'KeyR') { e.preventDefault(); reset(); }
  if (e.code === 'KeyS') { e.preventDefault(); skip(); }
  if (e.code === 'KeyT') { e.preventDefault(); applyTheme(!isDark); }
  if (e.code === 'KeyP') { e.preventDefault(); showReceipt(); }
  if (e.code === 'Escape') {
    document.getElementById('receipt-overlay').classList.remove('open');
  }
});

// ==================== INIT ====================
try {
  const saved = localStorage.getItem('gr-theme');
  if (saved === 'light') applyTheme(false);
} catch (e) {}

try {
  const savedPersonality = localStorage.getItem('gr-personality');
  if (savedPersonality && PERSONALITIES[savedPersonality]) {
    personality = savedPersonality;
  }
} catch (e) {}

applyAccent('work');
applyPersonality(personality);
updateDisplay();
updateSessionDots();
