import Phaser from 'phaser';

/**
 * Falling Crate - Hazard that falls when player gets near
 * Deals damage on contact and breaks when hitting ground
 */
export class FallingCrate extends Phaser.Physics.Arcade.Sprite {
  private isTriggered: boolean = false;
  private isFalling: boolean = false;
  private isBroken: boolean = false;
  private triggerDistance: number = 60; // Distance to trigger fall
  private shakeAmount: number = 0;
  private shakeTime: number = 0;
  private readonly SHAKE_DURATION: number = 300; // Shake before falling

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '');

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics
    this.setupPhysics();

    // Create visual representation
    this.createSprite();
  }

  private setupPhysics(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Set collision box
    body.setSize(32, 32);
    body.setOffset(0, 0);

    // Start as kinematic (not affected by gravity until triggered)
    body.setAllowGravity(false);
    body.setImmovable(true);
  }

  private createSprite(): void {
    // Create a wooden crate sprite
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

    // Crate body (brown wood)
    graphics.fillStyle(0x8B4513, 1);
    graphics.fillRect(0, 0, 32, 32);

    // Wood grain lines (darker brown)
    graphics.lineStyle(2, 0x654321, 1);
    graphics.lineBetween(8, 0, 8, 32);
    graphics.lineBetween(24, 0, 24, 32);
    graphics.lineBetween(0, 8, 32, 8);
    graphics.lineBetween(0, 24, 32, 24);

    // Crate bands (metal strips)
    graphics.fillStyle(0x333333, 1);
    graphics.fillRect(0, 14, 32, 4);
    graphics.fillRect(14, 0, 4, 32);

    // Corner reinforcements
    graphics.fillStyle(0x666666, 1);
    graphics.fillRect(0, 0, 6, 6);
    graphics.fillRect(26, 0, 6, 6);
    graphics.fillRect(0, 26, 6, 6);
    graphics.fillRect(26, 26, 6, 6);

    // Warning symbol (exclamation mark)
    graphics.fillStyle(0xFF0000, 1);
    graphics.fillRect(14, 10, 4, 10);
    graphics.fillRect(14, 22, 4, 4);

    graphics.generateTexture('crate', 32, 32);
    graphics.destroy();

    this.setTexture('crate');
  }

  public checkPlayerProximity(playerX: number, playerY: number): void {
    if (this.isTriggered || this.isBroken) return;

    // Check if player is near horizontally and below vertically
    const dx = Math.abs(playerX - this.x);
    const dy = playerY - this.y;

    if (dx < this.triggerDistance && dy > 0 && dy < 200) {
      this.trigger();
    }
  }

  private trigger(): void {
    if (this.isTriggered) return;

    this.isTriggered = true;
    this.shakeTime = this.scene.time.now;

    // Start shaking animation
    this.scene.time.delayedCall(this.SHAKE_DURATION, () => {
      this.startFalling();
    });
  }

  private startFalling(): void {
    if (this.isFalling || !this.body) return;

    this.isFalling = true;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Enable gravity
    body.setAllowGravity(true);
    body.setImmovable(false);

    // Give it initial downward velocity
    body.setVelocityY(100);
  }

  update(time: number, _delta: number): void {
    if (!this.body || !this.active || this.isBroken) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Shake before falling
    if (this.isTriggered && !this.isFalling) {
      const elapsed = time - this.shakeTime;
      if (elapsed < this.SHAKE_DURATION) {
        this.shakeAmount = Math.sin(time / 20) * 2;
        this.x += this.shakeAmount;
      }
    }

    // Check if hit the ground while falling
    if (this.isFalling && body.blocked.down) {
      this.breakCrate();
    }
  }

  private breakCrate(): void {
    if (this.isBroken) return;

    this.isBroken = true;

    // Create break particles
    this.createBreakEffect();

    // Destroy the crate
    this.scene.time.delayedCall(100, () => {
      this.destroy();
    });
  }

  private createBreakEffect(): void {
    // Create debris particles
    const debris = this.scene.add.particles(this.x, this.y, 'crate', {
      speed: { min: 50, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.3, end: 0 },
      lifespan: 500,
      quantity: 8,
      gravityY: 600,
    });

    // Destroy particles after animation
    this.scene.time.delayedCall(600, () => {
      debris.destroy();
    });
  }

  /**
   * Check if this hazard should hurt the player
   */
  public isHazardous(): boolean {
    return this.isFalling && !this.isBroken;
  }

  /**
   * Check if crate is broken
   */
  public isCrateBroken(): boolean {
    return this.isBroken;
  }
}
