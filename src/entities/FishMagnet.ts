import Phaser from 'phaser';

/**
 * Fish Magnet Power-Up - Attracts tuna within a radius for 10 seconds
 * Shows visual indicator of magnetic field
 */
export class FishMagnet extends Phaser.Physics.Arcade.Sprite {
  private isCollected: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '');

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics
    this.setupPhysics();

    // Create visual representation
    this.createSprite();

    // Add floating animation
    this.setupFloatingAnimation();
  }

  private setupPhysics(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Set collision box
    body.setSize(28, 28);
    body.setOffset(2, 2);

    // No gravity for power-up
    body.setAllowGravity(false);
  }

  private createSprite(): void {
    // Create a magnet icon with fish symbol
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

    // Magnet shape (U-shape)
    graphics.lineStyle(4, 0xFF0000, 1);
    graphics.beginPath();
    graphics.moveTo(8, 8);
    graphics.lineTo(8, 20);
    graphics.arc(16, 20, 8, Math.PI, 0, false);
    graphics.lineTo(24, 8);
    graphics.strokePath();

    // North/South poles
    graphics.fillStyle(0xFF0000, 1);
    graphics.fillRect(6, 6, 4, 4);
    graphics.fillStyle(0x0000FF, 1);
    graphics.fillRect(22, 6, 4, 4);

    // Fish symbol in center (small fish icon)
    graphics.fillStyle(0xFFAA00, 1);
    graphics.fillEllipse(16, 16, 10, 6);
    graphics.fillTriangle(20, 16, 26, 13, 26, 19);

    // Sparkle effect (white dots)
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillCircle(10, 10, 2);
    graphics.fillCircle(22, 10, 2);
    graphics.fillCircle(16, 24, 2);

    graphics.generateTexture('fish-magnet', 32, 32);
    graphics.destroy();

    this.setTexture('fish-magnet');
  }

  private setupFloatingAnimation(): void {
    // Create a gentle floating animation
    this.scene.tweens.add({
      targets: this,
      y: this.y - 10,
      duration: 1500,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Add rotation animation
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 4000,
      ease: 'Linear',
      repeat: -1,
    });

    // Add pulsing scale animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 800,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Collect this power-up
   * Returns true if successfully collected
   */
  public collect(): boolean {
    if (this.isCollected) return false;

    this.isCollected = true;

    // Play collection animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      },
    });

    return true;
  }

  /**
   * Check if this power-up has been collected
   */
  public isActive(): boolean {
    return !this.isCollected;
  }
}
