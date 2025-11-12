import Phaser from 'phaser';
import { SCENES, SCORING } from '../config/constants';
import { storage } from '../utils/storage';
import { LevelResult } from '../types';

/**
 * ResultsScene - Shows level completion results and star rating
 */
export class ResultsScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.RESULTS });
  }

  shutdown(): void {
    // Clean up keyboard listeners when scene stops
    this.input.keyboard?.removeAllListeners();
  }

  create(data: LevelResult & { levelKey: string }): void {
    const { width, height } = this.cameras.main;

    // Calculate stars
    const collectionPercent = (data.tunaCollected / data.totalTuna) * 100;
    const noHit = data.deaths === 0;

    let stars = 0;
    if (collectionPercent >= SCORING.THREE_STAR_THRESHOLD && noHit) {
      stars = 3;
    } else if (collectionPercent >= SCORING.TWO_STAR_THRESHOLD) {
      stars = 2;
    } else if (collectionPercent >= SCORING.ONE_STAR_THRESHOLD) {
      stars = 1;
    }

    // Save results
    storage.saveStars(data.levelKey, stars);
    storage.saveBestTime(data.levelKey, data.time);

    // Title
    this.add.text(width / 2, 80, 'LEVEL COMPLETE!', {
      fontFamily: 'Arial',
      fontSize: '56px',
      color: '#00FF00',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Stars display
    const starsText = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    this.add.text(width / 2, 180, starsText, {
      fontFamily: 'Arial',
      fontSize: '72px',
      color: '#FFD700',
    }).setOrigin(0.5);

    // Stats
    const statsY = 300;
    const spacing = 50;

    this.add.text(width / 2, statsY, `Tuna Collected: ${data.tunaCollected}/${data.totalTuna}`, {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    this.add.text(width / 2, statsY + spacing, `Time: ${this.formatTime(data.time)}`, {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    this.add.text(width / 2, statsY + spacing * 2, `Deaths: ${data.deaths}`, {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    this.add.text(width / 2, statsY + spacing * 3, `Score: ${data.score}`, {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#FFD700',
    }).setOrigin(0.5);

    // Buttons
    const btnY = height - 120;

    const retryBtn = this.add.text(width / 2 - 150, btnY, 'Retry', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#FFFFFF',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 },
    });
    retryBtn.setOrigin(0.5);
    retryBtn.setInteractive({ useHandCursor: true });
    retryBtn.on('pointerdown', () => this.scene.start(SCENES.GAME, { levelKey: data.levelKey }));
    retryBtn.on('pointerover', () => retryBtn.setColor('#FFD700'));
    retryBtn.on('pointerout', () => retryBtn.setColor('#FFFFFF'));

    const menuBtn = this.add.text(width / 2 + 150, btnY, 'Level Select', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#FFFFFF',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 },
    });
    menuBtn.setOrigin(0.5);
    menuBtn.setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => this.scene.start(SCENES.LEVEL_SELECT));
    menuBtn.on('pointerover', () => menuBtn.setColor('#FFD700'));
    menuBtn.on('pointerout', () => menuBtn.setColor('#FFFFFF'));
  }

  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
