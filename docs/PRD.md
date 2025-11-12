# Cat Quest: Tuna Rush — PRD (Web-Only)

## 1) Overview
- **Concept:** 2D side-scrolling platformer inspired by classic Mario. You play as a nimble cat collecting tuna while navigating whimsical city rooftops and alleys.
- **Platform:** Web-only (HTML5/Canvas). No native exports in MVP.
- **Audience:** Casual players 7+, fans of cute platformers.
- **Design Pillars:** Snappy feel • Clean readability • Short, replayable stages.

## 2) Goals & Success (MVP)
- **Goal:** Ship a polished 10–15 minute web demo that feels great.
- **Success Metrics:** Avg session ≥ 6 min; L1 completion ≥ 60%; soft-launch D7 ≥ 10% (if analytics enabled).

## 3) Core Loop
Run → jump → avoid hazards → collect tuna → reach goal → earn stars → unlock cosmetics → replay for better score/time.

## 4) Controls (Web)
- **Move:** A/D or ←/→
- **Jump:** Space (hold for higher jump) — includes 100 ms coyote time + 100 ms jump buffer
- **Dash (power-up):** Shift
- **Pause:** Esc
- **Touch (optional pass):** Left/Right on-screen buttons + Jump + Dash

## 5) Mechanics
- **Movement:** Ground accel/decel tuned for responsiveness; adjustable air control. Target “tight” rather than floaty.
- **Health:** 1-hit KO (MVP) with fast respawn at last checkpoint/flag.
- **Scoring:** Tuna collected + time bonus + no-hit bonus → 1–3 stars per level.
- **Lives:** Infinite (teach mastery, not punishment).
- **Physics:** Tile/grid collisions; moving platforms; springs/bouncers; breakable crates.

## 6) Level Design (World 1 — MVP)
- **Theme:** Alley & Rooftops
- **Structure:** 3 short stages + 1 mini-boss (each 60–90 sec; 30–50 tuna; 2–3 secrets).
  - **L1-1:** Basics + tuna trails; zero-pit intro.
  - **L1-2:** Vertical sections, moving platforms, first enemies.
  - **L1-3:** Hazards (spikes, falling crates), tighter timing.
  - **L1-Boss:** Fishmonger’s Dog — telegraphed charges; 3 hits.
- **Difficulty Curve:** Gentle ramp; boss is pattern-learning, not DPS race.

## 7) Enemies & Hazards
- **Pigeon:** Slow hop patrol; stompable.
- **Crab:** Armored; not stompable; avoid or dash past.
- **Dog (Mini-boss):** Telegraphs charge; stunned after wall bonk.
- **Hazards:** Spikes, pits, falling crates, weak platforms, fans (wind gust).

## 8) Power-Ups (MVP)
- **Catnip Dash:** Short burst; one midair use; refresh on ground touch.
- **Fish Magnet:** 10 sec pickup radius.
- **Nine Lives:** One-hit shield (prototype only; optional).

## 9) Progression & Rewards
- **Stars:** 1–3 per level (collection %, time, no-hit).
- **Cosmetics:** Hats/collars/skins unlocked at star thresholds (e.g., 6/9/12 stars). Non-monetized in MVP.
- **Speedrun:** Timer unlocks after first clear; ghost (post-MVP).

## 10) Art Direction
- **Style:** Cozy pixel art; readable silhouettes; low-noise tiles.
- **Cat Sprite:** 32×32 base; run/jump/fall/land/dash animations.
- **Environment:** Parallax rooftops, laundry lines, chimneys, sunset sky.
- **UI:** Minimal fish counter; big clear fonts; star results screen.

## 11) Audio
- **Music:** Upbeat chiptune; per-stage variation.
- **SFX:** Meow (jump), purr (pickup), bark telegraph (boss), soft land thud.
- **Mix:** Limit peak loudness; master volume slider.

## 12) Technology (Web-Only)
- **Engine/Framework:** Phaser 3 (Canvas/WebGL auto) **or** PixiJS + custom platformer logic (choose one; default to Phaser 3 for speed).
- **Resolution:** 1280×720 logical, scale to fit (letterbox on ultra-wide).
- **Asset Pipeline:** Texture atlases (spritesheets), OGG/MP3 audio, bitmap fonts or web fonts.
- **Build:** Vite + TypeScript; tree-shake; code-split per scene.
- **Deploy:** Static site to Vercel/Netlify/GitHub Pages (no server needed).
- **Save:** LocalStorage for stars/cosmetics/settings. (Future: IndexedDB if needed.)
- **Analytics (optional):** Lightweight pings (page load, level start/finish, deaths, tuna collected).

## 13) Accessibility & QoL
- Remappable keys.
- Reduced motion toggle (limit screen shake/parallax).
- Color-safe palettes; avoid red/green reliance for tuna vs. hazards.
- Generous coyote time/jump buffer; input buffering on spawn.
- Toggle checkpoints on/off (off by default for MVP).

## 14) Monetization (Post-MVP Only)
- Free web demo. Future: cosmetic DLC or season pass on web; respect COPPA/GDPR. No ads in MVP.

## 15) MVP Scope (Backlog)
- Player controller (run/jump/coyote/buffer/dash)
- Tuna system (pickup, UI counter, score calc)
- 4 levels (3 + mini-boss) with tilemaps
- 3 enemies + 3 hazards
- 3 power-ups
- Menus: Title, Level Select, Options, Skins, Credits
- Star rating/result screen
- Local save system
- Basic audio set
- Deploy pipeline

## 16) Risks & Mitigations
- **Floaty feel:** Iterate accel/jump curves; add jump cut (short-hop) and early fall gravity.
- **Difficulty spikes:** Playtest heatmaps; tune enemy/hazard density.
- **Perf on low-end devices:** Sprite batching; atlas packing; cap particles; limit overdraw; prefer integer scaling.

## 17) Milestones (4–5 Weeks)
- **W1:** Core controller + collisions; tuna pickup; placeholder tiles/art.
- **W2:** Enemies/hazards; L1–L2 blockouts; UI counters.
- **W3:** Power-ups; L3 + boss; stars/scoring; menus.
- **W4:** Art/audio polish; cosmetics; perf pass; deploy.
- **W5 (buffer):** QA, accessibility, tuning, analytics toggle.

## 18) Team & Tools
- **Roles:** 1 dev, 1 pixel artist, 1 audio (or stock), 1 producer/designer (part-time).
- **Primary Tools:** Phaser 3, Vite, TypeScript, Tiled (tilemaps), Aseprite (art), Audacity/Bfxr (SFX), GitHub, Vercel.

---

### Implementation Notes (Phaser 3)
- Use Arcade Physics; fixed time step; gravity ~ 1600; jump velocity ~ -540 (tune).
- Coyote/jump buffer via timers and last-on-ground timestamps.
- Scene breakdown: Boot → Preload → Title → LevelSelect → Level(N) → Results → Skins.
- Tile layers: ground (collidable), hazards (sensor), deco (non-collide), moving platforms (kinematic groups).
- Data model: `save.json` in LocalStorage: `{ starsByLevel, cosmeticsUnlocked, settings }`.

### Out of Scope (MVP)
- Multiplayer, level editor, ads, cloud saves, mobile-native wrappers, monetization flows.
