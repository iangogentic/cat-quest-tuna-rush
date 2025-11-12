import { GameSaveData, GameSettings, KeyBindings } from '../types';
import { SAVE_KEYS } from '../config/constants';

const defaultKeyBindings: KeyBindings = {
  left: 'A',
  right: 'D',
  jump: 'SPACE',
  dash: 'SHIFT',
  pause: 'ESC',
};

const defaultSettings: GameSettings = {
  musicVolume: 0.7,
  sfxVolume: 0.8,
  reducedMotion: false,
  keyBindings: defaultKeyBindings,
};

export class StorageManager {
  private static instance: StorageManager;

  private constructor() {}

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  /**
   * Get all save data
   */
  getSaveData(): GameSaveData {
    return {
      starsByLevel: this.getStars(),
      cosmeticsUnlocked: this.getCosmetics(),
      settings: this.getSettings(),
      bestTimes: this.getBestTimes(),
    };
  }

  /**
   * Get stars for all levels
   */
  getStars(): Record<string, number> {
    const data = localStorage.getItem(SAVE_KEYS.STARS);
    return data ? JSON.parse(data) : {};
  }

  /**
   * Save stars for a level
   */
  saveStars(levelKey: string, stars: number): void {
    const allStars = this.getStars();
    const currentStars = allStars[levelKey] || 0;

    // Only save if it's better than previous
    if (stars > currentStars) {
      allStars[levelKey] = stars;
      localStorage.setItem(SAVE_KEYS.STARS, JSON.stringify(allStars));
    }
  }

  /**
   * Get total stars earned
   */
  getTotalStars(): number {
    const stars = this.getStars();
    return Object.values(stars).reduce((sum, val) => sum + val, 0);
  }

  /**
   * Get unlocked cosmetics
   */
  getCosmetics(): string[] {
    const data = localStorage.getItem(SAVE_KEYS.COSMETICS);
    return data ? JSON.parse(data) : ['red-collar']; // Start with default cosmetic
  }

  /**
   * Unlock a cosmetic
   */
  unlockCosmetic(cosmeticId: string): void {
    const cosmetics = this.getCosmetics();
    if (!cosmetics.includes(cosmeticId)) {
      cosmetics.push(cosmeticId);
      localStorage.setItem(SAVE_KEYS.COSMETICS, JSON.stringify(cosmetics));
    }
  }

  /**
   * Get game settings
   */
  getSettings(): GameSettings {
    const data = localStorage.getItem(SAVE_KEYS.SETTINGS);
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  }

  /**
   * Save game settings
   */
  saveSettings(settings: Partial<GameSettings>): void {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SAVE_KEYS.SETTINGS, JSON.stringify(updated));
  }

  /**
   * Get best times for all levels
   */
  getBestTimes(): Record<string, number> {
    const data = localStorage.getItem(SAVE_KEYS.BEST_TIMES);
    return data ? JSON.parse(data) : {};
  }

  /**
   * Save best time for a level
   */
  saveBestTime(levelKey: string, time: number): void {
    const times = this.getBestTimes();
    const currentBest = times[levelKey];

    // Only save if it's faster than previous (or no previous time)
    if (!currentBest || time < currentBest) {
      times[levelKey] = time;
      localStorage.setItem(SAVE_KEYS.BEST_TIMES, JSON.stringify(times));
    }
  }

  /**
   * Clear all save data (for testing)
   */
  clearAll(): void {
    localStorage.removeItem(SAVE_KEYS.STARS);
    localStorage.removeItem(SAVE_KEYS.COSMETICS);
    localStorage.removeItem(SAVE_KEYS.SETTINGS);
    localStorage.removeItem(SAVE_KEYS.BEST_TIMES);
  }
}

export const storage = StorageManager.getInstance();
