import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig';

// Create and start the game
const game = new Phaser.Game(gameConfig);

// Hide loading screen once game is actually ready (when first scene starts)
game.events.once('ready', () => {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
});

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
