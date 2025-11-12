// Physics constants
export const PHYSICS = {
  GRAVITY: 1600,
  JUMP_VELOCITY: -540,
  PLAYER_SPEED: 200,
  PLAYER_ACCELERATION: 800,
  PLAYER_DRAG: 1000,
  AIR_CONTROL: 0.5,
  DASH_SPEED: 400,
  DASH_DURATION: 200, // milliseconds
};

// Timing constants
export const TIMING = {
  COYOTE_TIME: 100, // milliseconds
  JUMP_BUFFER: 100, // milliseconds
  RESPAWN_DELAY: 500,
};

// Player constants
export const PLAYER = {
  WIDTH: 32,
  HEIGHT: 32,
  MAX_HEALTH: 1, // 1-hit KO
};

// Game mechanics
export const MECHANICS = {
  FISH_MAGNET_DURATION: 10000, // 10 seconds
  FISH_MAGNET_RADIUS: 150,
  CHECKPOINT_RADIUS: 50,
};

// Scoring
export const SCORING = {
  TUNA_VALUE: 10,
  TIME_BONUS_PER_SECOND: 5,
  NO_HIT_BONUS: 500,
  THREE_STAR_THRESHOLD: 90, // percentage
  TWO_STAR_THRESHOLD: 70,
  ONE_STAR_THRESHOLD: 50,
};

// Level data
export const LEVELS = [
  {
    key: 'level-1-1',
    name: 'Alley Basics',
    tunaCount: 30,
    parTime: 60,
    difficulty: 1,
  },
  {
    key: 'level-1-2',
    name: 'Rooftop Heights',
    tunaCount: 40,
    parTime: 75,
    difficulty: 2,
  },
  {
    key: 'level-1-3',
    name: 'Hazard Course',
    tunaCount: 50,
    parTime: 90,
    difficulty: 3,
  },
  {
    key: 'level-1-boss',
    name: "Fishmonger's Dog",
    tunaCount: 0,
    parTime: 120,
    difficulty: 4,
  },
];

// Asset keys
export const ASSETS = {
  SPRITES: {
    PLAYER: 'player',
    TUNA: 'tuna',
    PIGEON: 'pigeon',
    CRAB: 'crab',
    DOG: 'dog',
    CRATE: 'crate',
    SPIKE: 'spike',
    PLATFORM: 'platform',
  },
  AUDIO: {
    JUMP: 'sfx-jump',
    LAND: 'sfx-land',
    PICKUP: 'sfx-pickup',
    DASH: 'sfx-dash',
    HIT: 'sfx-hit',
    BARK: 'sfx-bark',
    MUSIC_TITLE: 'music-title',
    MUSIC_LEVEL: 'music-level',
    MUSIC_BOSS: 'music-boss',
  },
  TILESETS: {
    CITY: 'tileset-city',
  },
};

// Scene keys
export const SCENES = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  TITLE: 'TitleScene',
  LEVEL_SELECT: 'LevelSelectScene',
  GAME: 'GameScene',
  RESULTS: 'ResultsScene',
  OPTIONS: 'OptionsScene',
  SKINS: 'SkinsScene',
  CREDITS: 'CreditsScene',
};

// Save data keys
export const SAVE_KEYS = {
  STARS: 'catquest_stars',
  COSMETICS: 'catquest_cosmetics',
  SETTINGS: 'catquest_settings',
  BEST_TIMES: 'catquest_times',
};

// Cosmetics unlocks
export const COSMETICS = [
  { id: 'red-collar', name: 'Red Collar', starsRequired: 0 },
  { id: 'blue-hat', name: 'Blue Hat', starsRequired: 6 },
  { id: 'yellow-scarf', name: 'Yellow Scarf', starsRequired: 9 },
  { id: 'purple-cape', name: 'Purple Cape', starsRequired: 12 },
];
