import Phaser from 'phaser';
import { SCENES } from '../config/constants';

/**
 * PreloadScene - Loads all game assets
 * This scene shows a loading bar while assets are loaded
 */
export class PreloadScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private progressBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: SCENES.PRELOAD });
  }

  preload(): void {
    // Create loading UI
    this.createLoadingUI();

    // Set up loading events
    this.load.on('progress', this.onProgress, this);
    this.load.on('complete', this.onComplete, this);

    // Load placeholder assets
    this.loadPlaceholderAssets();
  }

  create(): void {
    // Small delay to ensure smooth transition
    this.time.delayedCall(500, () => {
      this.scene.start(SCENES.TITLE);
    });
  }

  private createLoadingUI(): void {
    const { width, height } = this.cameras.main;

    // Title
    this.add.text(width / 2, height / 2 - 100, 'Cat Quest: Tuna Rush', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Loading text
    this.add.text(width / 2, height / 2 - 20, 'Loading...', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Progress bar background
    this.loadingBar = this.add.graphics();
    this.loadingBar.fillStyle(0x222222, 0.8);
    this.loadingBar.fillRect(width / 2 - 200, height / 2 + 20, 400, 30);

    // Progress bar
    this.progressBar = this.add.graphics();
  }

  private onProgress(value: number): void {
    const { width, height } = this.cameras.main;

    this.progressBar.clear();
    this.progressBar.fillStyle(0x00ff00, 1);
    this.progressBar.fillRect(width / 2 - 195, height / 2 + 25, 390 * value, 20);
  }

  private onComplete(): void {
    this.progressBar.destroy();
    this.loadingBar.destroy();
  }

  private loadPlaceholderAssets(): void {
    // For now, we'll create placeholder graphics in code
    // In a real game, these would load actual sprite sheets and audio files

    // Create placeholder sprites
    this.createPlaceholderSprites();

    // Note: Audio files would be loaded here in production
    // this.load.audio(ASSETS.AUDIO.JUMP, 'assets/audio/jump.ogg');
    // etc.
  }

  private createPlaceholderSprites(): void {
    // We'll create these dynamically in the registry for now
    // This allows the game to run without actual asset files

    // Player sprite will be created in the Player class
    // Tuna sprite will be created in the Tuna class
    // etc.
  }
}
