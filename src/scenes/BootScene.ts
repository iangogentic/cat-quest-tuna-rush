import Phaser from 'phaser';
import { SCENES } from '../config/constants';

/**
 * BootScene - Handles initial game setup
 * This scene runs first and sets up basic game configuration
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload(): void {
    // Set up any global configurations here
    this.cameras.main.setBackgroundColor('#000000');

    // Create a simple loading text
    const { width, height } = this.cameras.main;
    const loadingText = this.add.text(width / 2, height / 2, 'Booting...', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5);
  }

  create(): void {
    // Initialize game systems
    this.initializeInput();
    this.initializeAudio();

    // Move to preload scene
    this.scene.start(SCENES.PRELOAD);
  }

  private initializeInput(): void {
    // Set up input handling
    if (this.input.keyboard) {
      // Disable default browser shortcuts that might interfere
      this.input.keyboard.disableGlobalCapture();
    }
  }

  private initializeAudio(): void {
    // Set up audio system
    this.sound.pauseOnBlur = true;
  }
}
