import Phaser from 'phaser';

/**
 * Nine Lives Power-Up - Provides one-hit protection (shield)
 * Absorbs one damage before breaking
 */
export class NineLives extends Phaser.Physics.Arcade.Sprite {
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
    // Create a shield icon with cat symbol
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

    // Shield outline (golden)
    graphics.lineStyle(3, 0xFFD700, 1);
    graphics.fillStyle(0xFFAA00, 0.3);

    // Shield shape (classic medieval shield)
    graphics.beginPath();
    graphics.moveTo(16, 4);
    graphics.lineTo(26, 10);
    graphics.lineTo(26, 20);
    graphics.lineTo(16, 28);
    graphics.lineTo(6, 20);
    graphics.lineTo(6, 10);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    // Cat paw print in center (symbol of nine lives)
    graphics.fillStyle(0xFFD700, 1);
    // Main pad
    graphics.fillEllipse(16, 17, 6, 8);
    // Top toes
    graphics.fillCircle(13, 12, 2);
    graphics.fillCircle(16, 11, 2);
    graphics.fillCircle(19, 12, 2);

    // Number "9" on shield
    graphics.fillStyle(0xFFFFFF, 1);
    const textStyle = { fontSize: '10px', fontFamily: 'Arial', color: '#FFD700' };
    const text = this.scene.add.text(13, 20, '9', textStyle);
    text.setOrigin(0.5);

    graphics.generateTexture('nine-lives', 32, 32);
    graphics.destroy();
    text.destroy();

    this.setTexture('nine-lives');
  }

  private setupFloatingAnimation(): void {
    // Create a gentle floating animation
    this.scene.tweens.add({
      targets: this,
      y: this.y - 12,
      duration: 1200,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Add shimmer effect (rotating with slight angle oscillation)
    this.scene.tweens.add({
      targets: this,
      angle: { from: -10, to: 10 },
      duration: 2000,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Add pulsing glow effect
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.8, to: 1 },
      duration: 600,
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

    // Play collection animation with golden burst
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.8,
      scaleY: 1.8,
      alpha: 0,
      angle: 360,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      },
    });

    // Create sparkle particles
    const particles = this.scene.add.particles(this.x, this.y, 'nine-lives', {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      lifespan: 500,
      quantity: 10,
      tint: 0xFFD700,
    });

    this.scene.time.delayedCall(600, () => {
      particles.destroy();
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
