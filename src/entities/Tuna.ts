import Phaser from 'phaser';

/**
 * Tuna - Collectible item
 */
export class Tuna extends Phaser.Physics.Arcade.Sprite {
  private collected: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '');

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Create visual representation
    this.createSprite();

    // Set up physics
    this.setupPhysics();

    // Add floating animation
    this.addFloatingAnimation();
  }

  private setupPhysics(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Tuna is a trigger, not solid
    body.setSize(24, 24);
    body.setAllowGravity(false);
  }

  private createSprite(): void {
    // Create a simple fish shape as placeholder
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

    // Fish body (tuna)
    graphics.fillStyle(0xFF69B4, 1); // Pink/salmon color
    graphics.fillEllipse(12, 12, 24, 12);

    // Tail
    graphics.fillTriangle(0, 8, 0, 16, -8, 12);

    // Eye
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(18, 10, 2);

    graphics.generateTexture('tuna-sprite', 32, 24);
    graphics.destroy();

    this.setTexture('tuna-sprite');
  }

  private addFloatingAnimation(): void {
    // Make the tuna bob up and down
    this.scene.tweens.add({
      targets: this,
      y: this.y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Add rotation for extra visual interest
    this.scene.tweens.add({
      targets: this,
      angle: { from: -5, to: 5 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public collect(): void {
    if (this.collected) return;

    this.collected = true;

    // Play collect animation
    this.scene.tweens.add({
      targets: this,
      y: this.y - 50,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      },
    });

    // TODO: Play collect sound effect
  }

  public isCollected(): boolean {
    return this.collected;
  }
}
