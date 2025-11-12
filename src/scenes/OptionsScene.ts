import Phaser from 'phaser';
import { SCENES } from '../config/constants';
import { storage } from '../utils/storage';

/**
 * OptionsScene - Game settings
 */
export class OptionsScene extends Phaser.Scene {
  private reducedMotionCheckbox!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENES.OPTIONS });
  }

  shutdown(): void {
    // Clean up keyboard listeners when scene stops
    this.input.keyboard?.removeAllListeners();
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const settings = storage.getSettings();

    // Title
    this.add.text(width / 2, 80, 'OPTIONS', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Music Volume
    this.add.text(width / 2 - 300, 200, 'Music Volume:', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#FFFFFF',
    });
    this.createVolumeSlider(width / 2 + 50, 200, settings.musicVolume, (val) => {
      storage.saveSettings({ musicVolume: val });
    });

    // SFX Volume
    this.add.text(width / 2 - 300, 280, 'SFX Volume:', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#FFFFFF',
    });
    this.createVolumeSlider(width / 2 + 50, 280, settings.sfxVolume, (val) => {
      storage.saveSettings({ sfxVolume: val });
    });

    // Reduced Motion
    this.add.text(width / 2 - 300, 360, 'Reduced Motion:', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#FFFFFF',
    });

    this.reducedMotionCheckbox = this.add.text(width / 2 + 100, 360, settings.reducedMotion ? '☑' : '☐', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#FFFFFF',
    });
    this.reducedMotionCheckbox.setInteractive({ useHandCursor: true });
    this.reducedMotionCheckbox.on('pointerdown', () => {
      const current = storage.getSettings().reducedMotion;
      const newValue = !current;
      storage.saveSettings({ reducedMotion: newValue });
      this.reducedMotionCheckbox.setText(newValue ? '☑' : '☐');
    });

    // Key bindings info
    this.add.text(width / 2, 460, 'Controls: Arrow Keys / WASD to move, SPACE to jump, SHIFT to dash', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#CCCCCC',
    }).setOrigin(0.5);

    // Back button
    const backBtn = this.add.text(width / 2, height - 80, '← Back', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#FFFFFF',
    });
    backBtn.setOrigin(0.5);
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => {
      // Check if GameScene is paused (launched from pause menu)
      const gameScene = this.scene.get(SCENES.GAME);
      if (gameScene && this.scene.isPaused(SCENES.GAME)) {
        // Resume game and close options
        this.scene.stop();
        this.scene.resume(SCENES.GAME);
      } else {
        // Go back to title menu
        this.scene.start(SCENES.TITLE);
      }
    });
    backBtn.on('pointerover', () => backBtn.setColor('#FFD700'));
    backBtn.on('pointerout', () => backBtn.setColor('#FFFFFF'));
  }

  private createVolumeSlider(x: number, y: number, initialValue: number, onChange: (value: number) => void): void {
    const sliderWidth = 300;
    const sliderHeight = 20;

    // Background
    const bg = this.add.rectangle(x, y, sliderWidth, sliderHeight, 0x444444);

    // Fill
    const fill = this.add.rectangle(x - sliderWidth / 2, y, sliderWidth * initialValue, sliderHeight, 0x00FF00);
    fill.setOrigin(0, 0.5);

    // Make interactive
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const localX = pointer.x - (x - sliderWidth / 2);
      const value = Phaser.Math.Clamp(localX / sliderWidth, 0, 1);
      fill.width = sliderWidth * value;
      onChange(value);
    });
  }
}
