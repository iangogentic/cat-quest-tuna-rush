import Phaser from 'phaser';
import { SCENES, LEVELS } from '../config/constants';
import { storage } from '../utils/storage';

/**
 * LevelSelectScene - Choose which level to play
 */
export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.LEVEL_SELECT });
  }

  create(): void {
    const { width } = this.cameras.main;

    // Title
    this.add.text(width / 2, 80, 'SELECT LEVEL', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Get save data
    const stars = storage.getStars();
    const bestTimes = storage.getBestTimes();

    // Create level buttons
    const startY = 200;
    const spacing = 100;

    LEVELS.forEach((level, index) => {
      const y = startY + index * spacing;
      this.createLevelButton(level, y, stars[level.key] || 0, bestTimes[level.key]);
    });

    // Back button
    this.createBackButton();
  }

  private createLevelButton(
    level: any,
    y: number,
    stars: number,
    bestTime?: number
  ): void {
    const { width } = this.cameras.main;

    // Level container
    const container = this.add.container(width / 2, y);

    // Background
    const bg = this.add.rectangle(0, 0, 800, 80, 0x333333, 0.8);
    bg.setInteractive({ useHandCursor: true });
    container.add(bg);

    // Level name
    const nameText = this.add.text(-350, 0, level.name, {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#FFFFFF',
    });
    nameText.setOrigin(0, 0.5);
    container.add(nameText);

    // Stars display
    const starsText = this.add.text(200, 0, '★'.repeat(stars) + '☆'.repeat(3 - stars), {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#FFD700',
    });
    starsText.setOrigin(0, 0.5);
    container.add(starsText);

    // Best time (if exists)
    if (bestTime) {
      const timeText = this.add.text(350, 0, this.formatTime(bestTime), {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#00FF00',
      });
      timeText.setOrigin(1, 0.5);
      container.add(timeText);
    }

    // Hover effect
    bg.on('pointerover', () => bg.setFillStyle(0x555555, 0.9));
    bg.on('pointerout', () => bg.setFillStyle(0x333333, 0.8));

    // Click handler
    bg.on('pointerdown', () => {
      this.registry.set('currentLevel', level.key);
      this.scene.start(SCENES.GAME, { levelKey: level.key });
    });
  }

  private createBackButton(): void {
    const { width, height } = this.cameras.main;

    const backBtn = this.add.text(width / 2, height - 60, '← Back', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#FFFFFF',
    });
    backBtn.setOrigin(0.5);
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.scene.start(SCENES.TITLE));
    backBtn.on('pointerover', () => backBtn.setColor('#FFD700'));
    backBtn.on('pointerout', () => backBtn.setColor('#FFFFFF'));
  }

  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
