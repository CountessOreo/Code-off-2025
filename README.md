# Code-off-2025

Four deliberately mischievous front-end challenges. All are pure HTML/CSS/JS (no build step), keyboard-friendly, and designed to sharpen both UX instincts and arcade nostalgia.

> **Challenges**
>
> **Challenge 1 (Week 1 — Worst UX/UI Design)**  
> • **Volume Slider** — _Lizard Maze: The Most Annoyingly Delightful Volume Slider_  
> • **404 Page** — _“Explore the Chaos”_
>
> **Challenge 2 (Week 2 — Arcade Game Recreation)**  
> • **Pong** — _Classic Pong in under 150 lines_  
> • **Asteroids** — _Retro Asteroids in under 150 lines_

---

## Table of Contents

- [About](#about)

- [Challenge 1 — Worst UX/UI Design](#challenge-1--worst-uxui-design)
  - [Volume Slider](#volume-slider)
    - [What’s in this repo](#whats-in-this-repo)
    - [How it works](#how-it-works)
    - [Feature list](#feature-list)
    - [Controls](#controls)
    - [Run locally](#run-locally)
  - [404 Page](#404-page-challenge)
    - [Highlights](#highlights)
    - [Assistance](#assistance)
    - [Demo & Structure](#demo--structure)
    - [Quick Start](#quick-start)
    - [Keyboard Shortcuts](#keyboard-shortcuts)
    - [Things to Try](#things-to-try-checklist)

- [Challenge 2 — Arcade Game Recreation](#challenge-2--arcade-game-recreation)
  - [Pong](#pong)
    - [Highlights](#highlights-1)
    - [Controls](#controls-1)
    - [Demo & Structure](#demo--structure-1)
    - [Quick Start](#quick-start-1)
    - [Gameplay Loop](#gameplay-loop)
  - [Asteroids](#asteroids)
    - [Highlights](#highlights-2)
    - [Controls](#controls-2)
    - [Demo & Structure](#demo--structure-2)
    - [Quick Start](#quick-start-2)
    - [Gameplay Loop](#gameplay-loop-1)

---

## About

This repository contains the **Code-Off-2025** challenges.  
They helped me practice:

- defensive design, progressive disclosure, and stateful UI flows;  
- accessibility under motion/chaos;  
- micro-interactions, audio feedback, and persistent state;  
- playful front-end architectures with no bundler or framework required;  
- compact arcade mechanics, canvas rendering, and procedural logic.

---

## Challenge 1 — Worst UX/UI Design

### Volume Slider

#### **Lizard Maze — The Most Annoyingly Delightful Volume Slider**

Turn the humble volume control into a mini-game: steer a googly-eyed gecko through a procedurally generated maze, suffer gentle sass, pass a lizard-math quiz, survive a runaway confirm button, and then—*maybe*—lock your volume.

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
   - Confirm you’re lizard-adjacent ✅.
   - Answer **5 lizard-math questions** (integer answers only). Expect sass for near misses.
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
- **Sassy UX**: wrong-answer popups, shake effects, runaway button, swap-positions trick.  
- Modal flow with **HTML injection** and a **press-and-hold** progression gate.  
- **Read-only** slider that reflects the current volume but **can’t be dragged** directly.  
- Responsive panels with a pleasant **neon-jungle** theme.  

#### Controls

- **Move**: WASD or Arrow keys  
- **New Maze**: “New Maze” button (left panel)  
- **Audio Priming**: Any click/keydown/touch (browser autoplay policy requires a gesture)  
- **Shift (during lock selection)**: disables the slider’s cheeky “nudge”  

#### Run locally

```bash
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

Or serve:

```bash
python3 -m http.server 8080
# or
npx serve . -p 8080
```

Then visit: <http://localhost:8080>

---

### 404 Page Challenge

#### **“Explore the Chaos”**

A deliberately unhelpful, neon-soaked 404 page that turns “Page not found” into a game of petty UX pranks: faux captchas, a five-step “Are you sure?” gauntlet, a fake BSOD, a mouse-trap cursor, and a guided tour that dares you to find all the “features.”  
**Accessible, keyboard-friendly, and gloriously annoying.**

#### Highlights

- **Interactive error carousel** — Error code changes with each “Details/Home/Back” attempt.  
- **Guarded actions** — Every main action is protected by a **5-step “Are you sure?”** loop.  
- **Fake captcha** — Emoji grid with progress meter, attempts counter, and escalating excuses.  
- **BSOD sequence** — Fail enough and you’ll be “restarted.”  
- **Mouse-trap cursor** — Hidden cursor replaced with a snapping trap + popup “SNAP!” bubble.  

#### Assistance

- **Coach-mark tour** — On-page onboarding with ring highlight and progress checklist.  
- **Guide panel** — Checklist + hints, **mute** & **reduce-motion** toggles, and progress reset.  
- **A11y first** — Skip link, live regions, focus trapping, ARIA roles/labels, and keyboard map.  
- **State persistence** — Progress badges saved in `localStorage`.  

#### Demo & Structure

```text
.
├─ index.html     # Markup (404 card, modals, tour, guide, sr region)
├─ style.css      # All styling (neon chaos + motion/calm modes + a11y helpers)
└─ script.js      # Behavior: state, audio beeps, modals, captcha, BSOD, tour, badges
```

#### Quick Start

```bash
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

Or serve:

```bash
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
| `R` | Hard reset             |
| `Esc` | Error buzz / close tour |

#### Things to Try

- Flip error states by mashing **D**.  
- Trigger captcha (appears **every third** “Details” click).  
- Survive **“Are you sure?”** (five confirmations).  
- Set off the **fake cursor trap**.  
- Reach the **BSOD** by failing captcha repeatedly.  

---

## Challenge 2 — Arcade Game Recreation

### Pong

#### **Classic Pong in Under 150 Lines**

A minimalist take on Pong: under 150 lines of vanilla JavaScript. Includes a start menu, audio feedback, pause/restart, AI opponent, and a polished retro feel.

#### Highlights

- **Compact build** in `<150` lines.  
- **Audio effects** via procedural beeps.  
- **Game states**: menu, play, pause, game over.  
- **AI opponent**: error-prone but competitive.  
- **Scoring**: first to 7 wins.  
- **Responsive**: auto-resizes canvas.  

#### Controls

- **↑ / ↓** or **W / S** → Move paddle  
- **Enter / Space** → Start game  
- **P** → Pause/unpause  
- **R** → Restart  

#### Demo & Structure

```text
.
├─ index.html
└─ README.md
```

#### Quick Start

```bash
open index.html   # macOS
start index.html  # Windows
xdg-open index.html # Linux
```

Or serve:

```bash
python3 -m http.server 8080
# or
npx serve . -p 8080
```

Then visit: <http://localhost:8080>

#### Gameplay Loop

1. **Menu** → Start game.  
2. **Play** → Rally until one player reaches 7 points.  
3. **Pause** → Toggle with P.  
4. **Game Over** → Winner announced; press R to restart.  

---

### Asteroids

#### **Retro Asteroids in Under 150 Lines**

A fully playable clone of the arcade classic, packed into `<150` lines of JS. Includes destructible asteroids, inertia physics, wrap-around space, particle explosions, scoring, lives, and persistent hi-scores.

#### Highlights

- **Compact build** in `<150` lines.  
- **Player ship**: rotate, thrust, inertia.  
- **Asteroids**: split into smaller rocks when hit.  
- **Explosions**: particle effects.  
- **Lives system**: 3 ships + respawn shield.  
- **Scores + hi-score** persisted in `localStorage`.  
- **Dynamic waves**: harder as score rises.  

#### Controls

- **← / →** → Rotate  
- **↑** → Thrust  
- **Space** → Fire (max 4 bullets)  
- **Enter / Space** → Start game  
- **P** → Pause/unpause  
- **R** → Restart  

#### Demo & Structure

```text
.
├─ index.html
└─ README.md
```

#### Quick Start

```bash
open index.html   # macOS
start index.html  # Windows
xdg-open index.html # Linux
```

Or serve:

```bash
python3 -m http.server 8080
# or
npx serve . -p 8080
```

Then visit: <http://localhost:8080>

#### Gameplay Loop

1. **Menu** → Start game.  
2. **Play** → Destroy asteroids, avoid collisions.  
3. **Lives** → Lose ship on collision; respawn with shield.  
4. **Game Over** → Score shown, hi-score saved. Press R to restart.  

---
