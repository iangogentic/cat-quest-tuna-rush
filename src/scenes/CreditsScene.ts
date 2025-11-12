import Phaser from 'phaser';
import { SCENES } from '../config/constants';

/**
 * CreditsScene - Game credits
 */
export class CreditsScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.CREDITS });
  }

  shutdown(): void {
    // CreditsScene doesn't add keyboard listeners, so nothing to clean up
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Title
    this.add.text(width / 2, 80, 'CREDITS', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Credits text
    const credits = [
      '',
      'CAT QUEST: TUNA RUSH',
      '',
      'A Phaser 3 Platformer',
      '',
      'Built with:',
      'Phaser 3 • TypeScript • Vite',
      '',
      'Game Design Inspiration:',
      'Classic Mario Platformers',
      '',
      'Special Thanks:',
      'All the cats who love tuna',
      '',
      '© 2024',
    ];

    let y = 180;
    credits.forEach((line) => {
      this.add.text(width / 2, y, line, {
        fontFamily: 'Arial',
        fontSize: line.includes('CAT QUEST') ? '32px' : '24px',
        color: line.includes('CAT QUEST') ? '#FFD700' : '#FFFFFF',
      }).setOrigin(0.5);
      y += 35;
    });

    // Back button
    const backBtn = this.add.text(width / 2, height - 80, '← Back', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#FFFFFF',
    });
    backBtn.setOrigin(0.5);
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.scene.start(SCENES.TITLE));
    backBtn.on('pointerover', () => backBtn.setColor('#FFD700'));
    backBtn.on('pointerout', () => backBtn.setColor('#FFFFFF'));
  }
}
