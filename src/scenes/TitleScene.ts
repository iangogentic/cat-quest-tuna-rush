import Phaser from 'phaser';
import { SCENES } from '../config/constants';

/**
 * TitleScene - Main menu
 */
export class TitleScene extends Phaser.Scene {
  private menuItems: Phaser.GameObjects.Text[] = [];
  private selectedIndex: number = 0;

  constructor() {
    super({ key: SCENES.TITLE });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Title
    const title = this.add.text(width / 2, height * 0.25, 'CAT QUEST', {
      fontFamily: 'Arial',
      fontSize: '72px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 6,
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, height * 0.35, 'TUNA RUSH', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#FFA500',
      stroke: '#000000',
      strokeThickness: 4,
    });
    subtitle.setOrigin(0.5);

    // Menu options
    const menuY = height * 0.55;
    const spacing = 60;

    this.createMenuItem('Play', menuY, () => this.scene.start(SCENES.LEVEL_SELECT));
    this.createMenuItem('Options', menuY + spacing, () => this.scene.start(SCENES.OPTIONS));
    this.createMenuItem('Skins', menuY + spacing * 2, () => this.scene.start(SCENES.SKINS));
    this.createMenuItem('Credits', menuY + spacing * 3, () => this.scene.start(SCENES.CREDITS));

    // Instructions
    this.add.text(width / 2, height - 40, 'Press SPACE or Click to select', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#CCCCCC',
    }).setOrigin(0.5);

    // Set up input
    this.setupInput();

    // Initial selection
    this.updateMenuSelection();
  }

  private createMenuItem(text: string, y: number, callback: () => void): void {
    const { width } = this.cameras.main;
    const menuItem = this.add.text(width / 2, y, text, {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#FFFFFF',
    });
    menuItem.setOrigin(0.5);
    menuItem.setInteractive({ useHandCursor: true });
    menuItem.on('pointerdown', callback);
    menuItem.on('pointerover', () => {
      this.selectedIndex = this.menuItems.indexOf(menuItem);
      this.updateMenuSelection();
    });

    this.menuItems.push(menuItem);
  }

  private setupInput(): void {
    // Keyboard navigation
    this.input.keyboard?.on('keydown-UP', () => {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      this.updateMenuSelection();
    });

    this.input.keyboard?.on('keydown-DOWN', () => {
      this.selectedIndex = Math.min(this.menuItems.length - 1, this.selectedIndex + 1);
      this.updateMenuSelection();
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.selectCurrentItem();
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      this.selectCurrentItem();
    });
  }

  private updateMenuSelection(): void {
    this.menuItems.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.setColor('#FFD700');
        item.setScale(1.2);
      } else {
        item.setColor('#FFFFFF');
        item.setScale(1.0);
      }
    });
  }

  private selectCurrentItem(): void {
    const selectedItem = this.menuItems[this.selectedIndex];
    selectedItem.emit('pointerdown');
  }
}
