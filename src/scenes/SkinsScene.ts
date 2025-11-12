import Phaser from 'phaser';
import { SCENES, COSMETICS } from '../config/constants';
import { storage } from '../utils/storage';

/**
 * SkinsScene - Cosmetics customization
 */
export class SkinsScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.SKINS });
  }

  shutdown(): void {
    // SkinsScene doesn't add keyboard listeners, so nothing to clean up
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Title
    this.add.text(width / 2, 80, 'COSMETICS', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Get player progress
    const totalStars = storage.getTotalStars();
    const unlockedCosmetics = storage.getCosmetics();

    // Stars display
    this.add.text(width / 2, 150, `Total Stars: ${totalStars} ★`, {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#FFD700',
    }).setOrigin(0.5);

    // Cosmetics grid
    const startY = 220;
    const spacing = 80;

    COSMETICS.forEach((cosmetic, index) => {
      const y = startY + index * spacing;
      const isUnlocked = unlockedCosmetics.includes(cosmetic.id) || totalStars >= cosmetic.starsRequired;

      // Auto-unlock if player has enough stars
      if (totalStars >= cosmetic.starsRequired && !unlockedCosmetics.includes(cosmetic.id)) {
        storage.unlockCosmetic(cosmetic.id);
      }

      this.createCosmeticItem(cosmetic, y, isUnlocked);
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

  private createCosmeticItem(cosmetic: any, y: number, isUnlocked: boolean): void {
    const { width } = this.cameras.main;

    // Container
    const container = this.add.container(width / 2, y);

    // Background
    const bg = this.add.rectangle(0, 0, 600, 60, isUnlocked ? 0x00AA00 : 0x666666, 0.5);
    container.add(bg);

    // Name
    const nameText = this.add.text(-250, 0, cosmetic.name, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: isUnlocked ? '#FFFFFF' : '#999999',
    });
    nameText.setOrigin(0, 0.5);
    container.add(nameText);

    // Status
    const statusText = this.add.text(250, 0, isUnlocked ? '✓ UNLOCKED' : `${cosmetic.starsRequired} ★ Required`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: isUnlocked ? '#00FF00' : '#FFAA00',
    });
    statusText.setOrigin(1, 0.5);
    container.add(statusText);
  }
}
