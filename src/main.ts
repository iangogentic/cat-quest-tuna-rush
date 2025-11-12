import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig';

// Hide loading screen once game is ready
window.addEventListener('load', () => {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
});

// Create and start the game
const game = new Phaser.Game(gameConfig);

// Expose game instance for debugging
(window as any).game = game;

// Handle window focus/blur for pause
window.addEventListener('blur', () => {
  game.sound.pauseAll();
});

window.addEventListener('focus', () => {
  game.sound.resumeAll();
});

export default game;
