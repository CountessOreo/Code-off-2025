# Code‑off‑2025

Two deliberately mischievous front‑end challenges. Both are pure HTML/CSS/JS (no build step), keyboard‑friendly, and designed to sharpen UX instincts by *doing the wrong thing… on purpose.*

> **Challenges**
> ***Challenge 1 (Week 1- Worst UX/UI Design)***
> 1) **Volume Slider** — _Lizard Maze: The Most Annoyingly Delightful Volume Slider_  
> 2) **404 Page Challenge** — _“Explore the Chaos”_

> ***Challenge 2 (Week 2 - Arcade Game Recreation)***
> 1) **Pong** — _Recreation of the classic game Pong_  
> 2) **Asteroid** — _“Explore the Chaos”_

---

## Table of Contents

- [About](#about)
- [Challenge 1 — Volume Slider](#challenge-1--worst-uxui-design)
  - [What’s in this repo](#whats-in-this-repo)
  - [How it works](#how-it-works)
  - [Feature list](#feature-list)
  - [Controls](#controls)
  - [Run locally](#run-locally)
- [Challenge 1 — 404 Page Challenge](#challenge-2--404-page-challenge)
  - [Highlights](#highlights)
  - [Assistance](#assistance)
  - [Demo & Structure](#demo--structure)
  - [Quick Start](#quick-start)
  - [Keyboard Shortcuts](#keyboard-shortcuts)
  - [Things to Try](#things-to-try-challenge-checklist)
---

## About

This repository contains the Code-Off-2025 challenges. They have helped me practice:
- defensive design, progressive disclosure, and stateful UI flows;
- accessibility under motion/chaos;
- micro‑interactions, audio feedback, and persistent state;
- playful front‑end architectures with no bundler or framework required.

---

## Challenge 1 — Volume Slider

### **Lizard Maze — The Most Annoyingly Delightful Volume Slider**

Turn the humble volume control into a mini‑game: steer a googly‑eyed gecko through a procedurally generated maze, suffer gentle sass, pass a lizard‑math quiz, survive a runaway confirm button, and then—*maybe*—lock your volume.

#### What’s in this repo

```text
.
├─ index.html        # Markup, audio element, panels, modal shell
├─ script.js         # Maze gen + game loop + audio + quiz + lock flow
├─ styles.css        # Theme, panels, slider visuals, modal, animations
├─ Lizard DJ.mp3     # Background loop (replace with your own)
├─ laugh.mp3 ...     # Meme SFX pool: bruh, nana, hehe, r2, hello, sus, thud
└─ README.md         # You are here
```

#### How it works

1. Move the lizard with **WASD** or **Arrow keys** on the left panel’s maze.  
2. Your **horizontal progress** continuously adjusts the volume of the song.  
3. Reach the shiny **fly** on the right edge to start the **lock flow**:
   - Pick a number (0–100). The slider “nudges” you off pretty round numbers (**hold `Shift` to disable the nudge**).
   - Confirm you’re lizard‑adjacent ✅.
   - Answer **5 lizard‑math questions** (integer answers only). Expect sass for near misses.
   - Type the exact phrase **`I love lizards`**.
   - Press & hold a button for **3s** (*release early → reset*).
   - Survive a final dialog where the **Yes/No** buttons swap (once) and a **runaway** confirm runs away the first couple times.
4. If you clear the gauntlet, the volume is **🔒 locked** to your chosen percentage.

Meanwhile:
- Every ~16s a playful **⚡ ZAP** can teleport your gecko to a random cell (unless volume is locked).
- Wall bumps play a soft **thud** with cooldown so it’s cute, not chaotic.
- Background music **fades** to match your chosen volume curve.

#### Feature list

- Procedural maze (**DFS backtracker**) sized by `COLS × ROWS`.
- Canvas rendering with tiny **gecko** + **shiny fly**.
- Live volume binding: `volume = player.c / (COLS - 1)` then **eased** to the BGM.
- Audio pipeline with **autoplay priming** and a pool of lightweight **SFX**.
- **Sassy UX**: wrong‑answer popups, shake effects, runaway button, swap‑positions trick.
- Modal flow with **HTML injection** and a **press‑and‑hold** progression gate.
- **Read‑only** slider that reflects the current volume but **can’t be dragged** directly.
- Responsive panels with a pleasant **neon‑jungle** theme.

#### Controls

- **Move**: WASD or Arrow keys  
- **New Maze**: “New Maze” button (left panel)  
- **Audio Priming**: Any click/keydown/touch (browser autoplay policy requires a gesture)  
- **Shift (during lock selection)**: disables the slider’s cheeky “nudge” off pretty numbers

#### Run locally

Open directly or serve via a simple static server:

```bash
# Option 1: open the file directly
# macOS
open index.html

# Windows
start index.html

# Linux (xdg)
xdg-open index.html
```

```bash
# Option 2: serve locally (choose one)
python3 -m http.server 8080
# or
npx serve . -p 8080
```

Then visit: <http://localhost:8080>

---

## Challenge 1 — 404 Page Challenge

### **“Explore the Chaos”**

A deliberately unhelpful, neon‑soaked 404 page that turns “Page not found” into a game of petty UX pranks: faux captchas, a five‑step “Are you sure?” gauntlet, a fake BSOD, a mouse‑trap cursor, and a guided tour that dares you to find all the “features.”  
**Accessible, keyboard‑friendly, and gloriously annoying.**

#### Highlights

- **Interactive error carousel** — Error code changes with each “Details/Home/Back” attempt.
- **Guarded actions** — Every main action is protected by a **5‑step “Are you sure?”** loop.
- **Fake captcha** — Emoji grid with progress meter, attempts counter, and escalating excuses.
- **BSOD sequence** — Fail enough and you’ll be “restarted.”
- **Mouse‑trap cursor** — Hidden cursor replaced with a snapping trap + popup “SNAP!” bubble.

#### Assistance

- **Coach‑mark tour** — On‑page onboarding with ring highlight and progress checklist.
- **Guide panel** — Checklist + hints, **mute** & **reduce‑motion** toggles, and progress reset.
- **A11y first** — Skip link, live regions, focus trapping, ARIA roles/labels, and keyboard map.
- **State persistence** — Progress badges saved in `localStorage`.

#### Demo & Structure

This challenge is pure front‑end (no build step):

```text
.
├─ index.html     # Markup (404 card, modals, tour, guide, sr region)
├─ style.css      # All styling (neon chaos + motion/calm modes + a11y helpers)
└─ script.js      # Behavior: state, audio beeps, modals, captcha, BSOD, tour, badges
```

#### Quick Start

Open directly or serve locally:

```bash
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

```bash
# Or use a local server (recommended)
python3 -m http.server 8080
# or
npx serve . -p 8080
```

Then visit: <http://localhost:8080>

#### Keyboard Shortcuts

| Key | Action                 |
|:---:|------------------------|
| `D` | “See details”          |
| `H` | “Home” (not really)    |
| `B` | “Back” (but forward)   |
| `?` | Start the tour         |
| `M` | Toggle mute            |
| `R` | Hard reset (state + badges) |
| `Esc` | Error buzz + close tour if open |

#### Things to Try (Challenge Checklist)

- Flip error states by mashing **D**.  
- Trigger captcha (appears **every third** “Details” click).  
- Survive **“Are you sure?”** (five confirmations).  
- Set off the **fake cursor trap**.  
- Reach the **BSOD** by failing the captcha repeatedly.  

---

