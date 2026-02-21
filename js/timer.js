// ===================== CONFIG =====================
const MODES = {
    work:  { label: 'FOCUS SESSION',  color: '#e05c5c', glow: 'rgba(224,92,92,0.25)',  tabLabel: 'POMO·FOCUS'  },
    short: { label: 'SHORT BREAK',    color: '#5ce0b8', glow: 'rgba(92,224,184,0.25)', tabLabel: 'POMO·REST'   },
    long:  { label: 'LONG BREAK',     color: '#5c9ee0', glow: 'rgba(92,158,224,0.25)', tabLabel: 'POMO·RECHARGE'}
};

let settings = { work: 25, short: 5, long: 15 };
let mode = 'work';
let totalSeconds = settings.work * 60;
let remaining = totalSeconds;
let running = false;
let interval = null;
let session = 1;
let completedWork = 0;
let soundEnabled = true;

const CIRCUMFERENCE = 2 * Math.PI * 148;
const ringProgress = document.getElementById('ring-progress');
ringProgress.style.strokeDasharray = CIRCUMFERENCE;

// ===================== CORE FUNCTIONS =====================
function setRing(ratio) {
    ringProgress.style.strokeDashoffset = CIRCUMFERENCE * (1 - ratio);
}

function fmt(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
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

function applyMode(m) {
    const cfg = MODES[m];
    document.documentElement.style.setProperty('--accent', cfg.color);
    document.documentElement.style.setProperty('--glow', cfg.glow);
    ringProgress.style.stroke = cfg.color;
    document.getElementById('timer-label').textContent = cfg.label;
    document.getElementById('logo-accent').textContent = '·' + cfg.tabLabel.split('·')[1];

    document.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('active', t.dataset.mode === m);
    });
}

function start() {
    running = true;
    document.getElementById('play-icon').style.display = 'none';
    document.getElementById('pause-icon').style.display = 'block';
    document.getElementById('ring-svg').classList.add('running');
    interval = setInterval(() => {
        remaining--;
        updateDisplay();
        if (remaining <= 0) {
            clearInterval(interval);
            running = false;
            onComplete();
        }
    }, 1000);
}

function pause() {
    running = false;
    clearInterval(interval);
    document.getElementById('play-icon').style.display = 'block';
    document.getElementById('pause-icon').style.display = 'none';
    document.getElementById('ring-svg').classList.remove('running');
}

function reset() {
    pause();
    remaining = totalSeconds;
    updateDisplay();
}

function onComplete(skipped = false) {
    pause();
    if (soundEnabled) playChime();

    if (mode === 'work') {
        completedWork = (completedWork + 1) % 5;
        session = session < 4 ? session + 1 : 1;
        const nextMode = (completedWork % 4 === 0 && completedWork > 0) ? 'long' : 'short';
        if (!skipped) showNotif('Focus session complete! 🎯');
        switchMode(nextMode);
    } else {
        if (!skipped) showNotif('Break over — back to focus! 💪');
        switchMode('work');
    }
}

function switchMode(m) {
    mode = m;
    totalSeconds = settings[m] * 60;
    remaining = totalSeconds;
    applyMode(m);
    updateDisplay();
}

// ===================== AUDIO API =====================
let audioCtx = null;
function getAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

function playChime() {
    const ctx = getAudio();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.18;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc.start(t); osc.stop(t + 0.65);
    });
}

function playClick() {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 800; osc.type = 'square';
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.start(t); osc.stop(t + 0.06);
}

// ===================== NOTIFICATIONS =====================
let notifTimer;
function showNotif(msg) {
    const n = document.getElementById('notif');
    n.textContent = msg;
    n.classList.add('show');
    clearTimeout(notifTimer);
    notifTimer = setTimeout(() => n.classList.remove('show'), 3000);
}

// ===================== BACKGROUND PARTICLES =====================
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [];

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.r = Math.random() * 1.5 + 0.3;
        this.vx = (Math.random() - 0.5) * 0.12;
        this.vy = (Math.random() - 0.5) * 0.12;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.twinkle = Math.random() * Math.PI * 2;
        this.twinkleSpeed = 0.01 + Math.random() * 0.02;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        this.twinkle += this.twinkleSpeed;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
        const alpha = this.opacity * (0.6 + 0.4 * Math.sin(this.twinkle));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,233,245,${alpha})`;
        ctx.fill();
    }
}

for (let i = 0; i < 160; i++) particles.push(new Particle());
function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(draw);
}
draw();

// ===================== LISTENERS =====================
document.getElementById('btn-play').addEventListener('click', () => { if (soundEnabled) playClick(); running ? pause() : start(); });
document.getElementById('btn-reset').addEventListener('click', () => { if (soundEnabled) playClick(); reset(); });
document.getElementById('btn-skip').addEventListener('click', () => { if (soundEnabled) playClick(); onComplete(true); });

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        if (tab.dataset.mode === mode) return;
        pause();
        switchMode(tab.dataset.mode);
    });
});

document.querySelectorAll('.sctrl').forEach(btn => {
    btn.addEventListener('click', () => {
        const s = btn.dataset.setting;
        const dir = parseInt(btn.dataset.dir);
        settings[s] = Math.min(60, Math.max(1, settings[s] + dir));
        document.getElementById(`sval-${s}`).textContent = settings[s];
        if (s === mode) { totalSeconds = settings[s] * 60; if (!running) { remaining = totalSeconds; updateDisplay(); } }
        if (soundEnabled) playClick();
    });
});

document.getElementById('sound-toggle').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    const el = document.getElementById('sound-toggle');
    el.textContent = soundEnabled ? '🔔' : '🔕';
    el.classList.toggle('active', soundEnabled);
});

// Init
applyMode('work');
updateDisplay();