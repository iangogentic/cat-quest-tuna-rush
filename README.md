# Cat Quest: Tuna Rush 🐱🐟

A charming 2D side-scrolling platformer built with Phaser 3 and TypeScript. Play as a nimble cat collecting tuna while navigating whimsical city rooftops and alleys!

## 🎮 Play Now

**Live Demo:** https://cat-quest-tuna-rush-3vdeuissp-ians-projects-d5107473.vercel.app

## ✨ Features

### ✅ Implemented
- **Precise Player Controls**
  - WASD/Arrow key movement
  - Space to jump (hold for higher jumps)
  - Shift to dash (refreshes on landing)
  - 100ms coyote time for forgiving jumps
  - 100ms jump buffering for responsive inputs
  - Variable jump height based on button hold duration

- **Complete Menu System**
  - Title screen with menu navigation
  - Level select with star ratings and best times
  - Options menu (volume sliders, reduced motion toggle)
  - Cosmetics/skins unlock system
  - Credits screen

- **Save System**
  - LocalStorage-based progression
  - Saves stars earned per level
  - Tracks best completion times
  - Unlockable cosmetics based on star count
  - Persistent game settings

- **Collectibles**
  - Animated tuna pickups with floating effect
  - Real-time tuna counter in gameplay
  - Collection tracking for star ratings

- **Results & Progression**
  - Post-level results screen
  - 1-3 star rating system
  - Score calculation (tuna + time bonus + no-hit bonus)
  - Cosmetics unlock at star thresholds

### 🚧 Planned Features (Not Yet Implemented)
- Multiple enemy types (Pigeon, Crab, Dog boss)
- Hazards (spikes, pits, falling crates, fans)
- Power-ups (Fish Magnet, Nine Lives shield)
- 4 complete levels (L1-1, L1-2, L1-3, L1-Boss)
- Audio system (music and sound effects)
- Full accessibility features

## 🛠 Tech Stack

- **Framework:** Phaser 3.90.0 (HTML5 game framework)
- **Language:** TypeScript (strict mode)
- **Build Tool:** Vite 7.2.2
- **Deployment:** Vercel
- **Version Control:** Git + GitHub

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/iangogentic/cat-quest-tuna-rush.git
   cd cat-quest-tuna-rush
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

   The game will open at http://localhost:3000

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 🎮 Controls

| Action | Keys |
|--------|------|
| Move Left | A or ← |
| Move Right | D or → |
| Jump | Space |
| Dash | Shift |
| Pause | Esc |
| Menu Navigation | Arrow Keys + Space/Enter |

## 📁 Project Structure

```
cat-quest-tuna-rush/
├── src/
│   ├── config/           # Game configuration & constants
│   │   ├── gameConfig.ts    # Phaser game setup
│   │   └── constants.ts     # Game constants (physics, levels, etc.)
│   ├── entities/         # Game objects
│   │   ├── Player.ts        # Player controller with physics
│   │   └── Tuna.ts          # Collectible tuna items
│   ├── scenes/           # Phaser scenes
│   │   ├── BootScene.ts
│   │   ├── PreloadScene.ts
│   │   ├── TitleScene.ts
│   │   ├── LevelSelectScene.ts
│   │   ├── GameScene.ts     # Main gameplay scene
│   │   ├── ResultsScene.ts
│   │   ├── OptionsScene.ts
│   │   ├── SkinsScene.ts
│   │   └── CreditsScene.ts
│   ├── systems/          # Game systems (planned)
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utilities
│   │   └── storage.ts       # LocalStorage manager
│   └── main.ts           # Entry point
├── public/               # Static assets
│   └── assets/           # Game assets (sprites, audio, etc.)
├── dist/                 # Production build (generated)
└── docs/                 # Documentation & PRD
```

## 🎯 Game Design

### Physics
- Gravity: 1600 px/s²
- Jump Velocity: -540 px/s
- Player Speed: 200 px/s
- Dash Speed: 400 px/s
- Air Control: 50% of ground control

### Star Rating System
- ⭐ (1 Star): 50%+ tuna collected
- ⭐⭐ (2 Stars): 70%+ tuna collected
- ⭐⭐⭐ (3 Stars): 90%+ tuna collected + no deaths

### Cosmetics Unlocks
- Red Collar: Unlocked from start
- Blue Hat: 6 stars total
- Yellow Scarf: 9 stars total
- Purple Cape: 12 stars total

## 🐛 Known Issues

- Enemies not yet implemented
- Hazards not yet implemented
- Only basic level layout (platforms)
- No audio/sound effects
- Limited level content

## 🔮 Roadmap

1. **Phase 1: Core Gameplay** ✅ (Current)
   - Player controller with physics
   - Collectible system
   - Basic level structure
   - Menu system
   - Save/load functionality

2. **Phase 2: Content** (Next)
   - 3 enemy types with AI
   - Multiple hazard types
   - 4 complete level designs
   - Power-up implementation

3. **Phase 3: Polish**
   - Audio system (music + SFX)
   - Particle effects
   - Screen shake and juice
   - Better pixel art assets

4. **Phase 4: Advanced Features**
   - Additional worlds
   - Speedrun timer
   - Ghost replay system
   - Level editor (stretch goal)

## 📝 License

MIT License - feel free to fork and modify!

## 🙏 Credits

- Built with [Phaser 3](https://phaser.io/)
- Inspired by classic Mario platformers
- Created with Claude Code

## 📧 Contact

- GitHub: [iangogentic](https://github.com/iangogentic)
- Repository: [cat-quest-tuna-rush](https://github.com/iangogentic/cat-quest-tuna-rush)

---

**Note:** This is an early alpha version showcasing the core platforming mechanics and menu system. More content and features coming soon!
