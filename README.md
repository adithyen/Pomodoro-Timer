# Pomodoro-Timer

# ✦ GrindReceiptz
> **"We print what you actually did."**

An immersive, personality-driven Pomodoro timer that tracks your "grind" and generates a vintage-style digital receipt of your productivity (or lack thereof). Built with a focus on high-end UI/UX, glassmorphism, and a touch of sass.

![Project Status](https://img.shields.io/badge/Status-Complete-success?style=flat-square)
![Vibe](https://img.shields.io/badge/Vibe-Minimalist--Cyber-blueviolet?style=flat-square)

---

## ✨ Features

* **🎭 Coach Personalities:** Choose your "vibe coach" to keep you focused.
    * **Strict Asian Mom:** Zero tolerance for distractions. Your cousin is already ahead of you.
    * **Chill Friend:** Supportive, low-pressure, "bestie" energy.
    * **Corporate Manager:** KPI-driven synergy. Circle back to your focus.
    * **Existential Philosopher:** Time is an illusion, but your deadline is real.
* **🧾 Productivity Receipts:** Complete a cycle to generate a detailed, thermal-print style receipt summarizing your session stats, including "Existential Crises" and "Phantom Snack Breaks."
* **🌓 Adaptive Themes:** Seamlessly switch between **Obsidian Dark** and **Paper Light** modes.
* **🎧 Immersive UX:** Haptic-style audio ticks, glassmorphic UI elements, and a dynamic particle background that reacts to your theme.
* **⌨️ Power User Shortcuts:**
    * `Space` - Play/Pause
    * `R` - Reset Timer
    * `S` - Skip Session
    * `T` - Toggle Theme

---

## 🛠️ Tech Stack

* **HTML5:** Semantic structure and SVG-based timer rings.
* **CSS3:** Custom properties (CSS variables), Glassmorphism, and keyframe animations.
* **JavaScript (Vanilla):** Custom state management, Web Audio API for synthesis, and Canvas API for the particle system.

---

## 📂 Project Structure

```text
GrindReceiptz/
├── index.html          # Core layout and onboarding
├── css/
│   └── style.css       # Glassmorphism, receipt styling & theme logic
├── js/
│   └── timer.js        # Personality data, Audio/Particle engines & state
└── assets/             # (Optional) Logos or icons