## Code-off-2025

## Challenge 1 - 

2. 404 Page Challenge — “Explore the Chaos”

A deliberately unhelpful, neon-soaked 404 page that turns “Page not found” into a game of petty UX pranks: faux captchas, a five-step “Are you sure?” gauntlet, a fake BSOD, a mouse-trap cursor, and a guided tour that dares you to find all the “features.” 
Accessible, keyboard-friendly, and gloriously annoying.

---
✨ Highlights
- Interactive error carousel — Error code changes with each “Details/Home/Back” attempt.
- Guarded actions — Every main action is protected by a 5-step “Are you sure?” loop.
- Fake captcha — Emoji grid with progress meter, attempts counter, and escalating excuses.
- BSOD sequence — Fail enough and you’ll be “restarted.”
- Mouse-trap cursor — Hidden cursor replaced with a snapping trap + popup “SNAP!” bubble.

---
🛠️ Assistance
- Coach-mark tour — On-page onboarding with ring highlight and progress checklist.
- Guide panel — Checklist + hints, mute & reduce-motion toggles, and progress reset.
- A11y first — Skip link, live regions, focus trapping, ARIA roles/labels, and keyboard map.
- State persistence — Progress badges saved in localStorage.

---
🧩 Demo & Structure
This challenge is pure front-end (no build step):
.
├─ index.html     # Markup (404 card, modals, tour, guide, sr region)
├─ style.css      # All styling (neon chaos + motion/calm modes + a11y helpers)
└─ script.js      # Behavior: state, audio beeps, modals, captcha, BSOD, tour, badges

---
▶️ Quick Start

Open directly or serve locally:
- open index.html  # (macOS)
- start index.html # (Windows)

Then visit http://localhost:8080.

---
🎮 How to Play
- Press D or click See details to rotate through errors (sometimes summons the captcha).
- Try Home (H) and Back (B)… they don’t do what you think.
- Move and click — the fake cursor trap will snap at you.
- Keep failing the captcha until you trigger the BSOD.
- Track progress in the Guide (bottom-right).
- Hit Reset to do it again.

---
⌨️ Keyboard Shortcuts
Key	Action
D	 - “See details”
H	 - “Home” (not really)
B	- “Back” (but forward)
?	- Start the tour
M	- Toggle mute
R	- Hard reset (state + badges)
Esc	- Error buzz + close tour if open

---
🧪 Things to Try (Challenge Checklist)
- Flip error states by mashing D.
- Trigger captcha (appears every third “Details” click).
- Survive “Are you sure?” (five confirmations).
- Set off the fake cursor trap.
- Reach the BSOD by failing the captcha repeatedly.
