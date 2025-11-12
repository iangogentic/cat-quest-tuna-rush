export interface GameSaveData {
  starsByLevel: Record<string, number>;
  cosmeticsUnlocked: string[];
  settings: GameSettings;
  bestTimes: Record<string, number>;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  reducedMotion: boolean;
  keyBindings: KeyBindings;
}

export interface KeyBindings {
  left: string;
  right: string;
  jump: string;
  dash: string;
  pause: string;
}

export interface LevelData {
  key: string;
  name: string;
  tunaCount: number;
  parTime: number;
  difficulty: number;
}

export interface LevelResult {
  tunaCollected: number;
  totalTuna: number;
  time: number;
  deaths: number;
  stars: number;
  score: number;
}

export interface PowerUp {
  type: 'dash' | 'magnet' | 'shield';
  duration?: number;
  active: boolean;
}

export interface Enemy {
  type: 'pigeon' | 'crab' | 'dog';
  health: number;
  x: number;
  y: number;
}

export interface Cosmetic {
  id: string;
  name: string;
  starsRequired: number;
  unlocked?: boolean;
}
