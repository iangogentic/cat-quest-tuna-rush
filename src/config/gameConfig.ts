import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { TitleScene } from '../scenes/TitleScene';
import { LevelSelectScene } from '../scenes/LevelSelectScene';
import { GameScene } from '../scenes/GameScene';
import { ResultsScene } from '../scenes/ResultsScene';
import { OptionsScene } from '../scenes/OptionsScene';
import { SkinsScene } from '../scenes/SkinsScene';
import { CreditsScene } from '../scenes/CreditsScene';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1600 },
      debug: false,
      fixedStep: true,
      fps: 60,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    LevelSelectScene,
    GameScene,
    ResultsScene,
    OptionsScene,
    SkinsScene,
    CreditsScene,
  ],
  backgroundColor: '#87CEEB',
  render: {
    antialiasGL: false,
    pixelArt: true,
  },
};
