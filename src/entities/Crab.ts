import Phaser from 'phaser';

/**
 * Crab Enemy - Armored enemy that cannot be stomped
 * Must be avoided or dashed past
 */
export class Crab extends Phaser.Physics.Arcade.Sprite {
  private patrolSpeed: number = 40; // Slower than pigeon
  private patrolDirection: number = 1; // 1 = right, -1 = left

  // Patrol boundaries
  private patrolMinX: number = 0;
  private patrolMaxX: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, patrolRange: number = 120) {
    super(scene, x, y, '');

    this.patrolMinX = x - patrolRange / 2;
    this.patrolMaxX = x + patrolRange / 2;

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

    // Set collision box (wider and shorter than pigeon)
    body.setSize(28, 20);
    body.setOffset(0, 0);

    // Physics properties - heavier than pigeon
    body.setMaxVelocity(this.patrolSpeed, 500);
    body.setCollideWorldBounds(true);
    body.setBounce(0, 0);
    body.setMass(2); // Heavier
  }

  private createSprite(): void {
    // Create a simple crab sprite (red armored enemy)
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

    // Shell (red oval - armored look)
    graphics.fillStyle(0xCC0000, 1);
    graphics.fillEllipse(14, 10, 24, 16);

    // Shell highlight (lighter red for 3D effect)
    graphics.fillStyle(0xFF3333, 1);
    graphics.fillEllipse(14, 8, 18, 10);

    // Claws (dark red)
    graphics.fillStyle(0x880000, 1);
    // Left claw
    graphics.fillRect(2, 12, 8, 4);
    graphics.fillRect(0, 10, 4, 4);
    // Right claw
    graphics.fillRect(18, 12, 8, 4);
    graphics.fillRect(24, 10, 4, 4);

    // Eyes (white with black pupils)
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillCircle(10, 8, 3);
    graphics.fillCircle(18, 8, 3);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(10, 8, 1);
    graphics.fillCircle(18, 8, 1);

    // Armor spikes (to indicate it's dangerous to stomp)
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillTriangle(14, 4, 12, 8, 16, 8);

    graphics.generateTexture('crab', 28, 20);
    graphics.destroy();

    this.setTexture('crab');
  }

  update(time: number, delta: number): void {
    if (!this.body || !this.active) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Horizontal movement (continuous, no hopping)
    const onGround = body.blocked.down || body.touching.down;
    if (onGround) {
      body.setVelocityX(this.patrolSpeed * this.patrolDirection);
    }

    // Check patrol boundaries and reverse direction if needed
    if (this.x <= this.patrolMinX) {
      this.patrolDirection = 1;
      this.setFlipX(false);
    } else if (this.x >= this.patrolMaxX) {
      this.patrolDirection = -1;
      this.setFlipX(true);
    }

    // Also reverse direction if hitting a wall
    if (body.blocked.left && this.patrolDirection === -1) {
      this.patrolDirection = 1;
      this.setFlipX(false);
    } else if (body.blocked.right && this.patrolDirection === 1) {
      this.patrolDirection = -1;
      this.setFlipX(true);
    }

    // Add a slight bobbing animation
    const bobAmount = Math.sin(time / 200) * 2;
    this.y += bobAmount * (delta / 16);
  }

  /**
   * Crabs cannot be stomped - they have armor
   * Returns false to indicate stomp failed
   */
  public stomp(): boolean {
    // Show feedback that stomp doesn't work
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.9,
      scaleX: 1.1,
      duration: 100,
      yoyo: true,
      ease: 'Power2',
    });

    // Flash red to show armor
    this.setTint(0xFF0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });

    return false; // Stomp failed
  }

  /**
   * Crabs cannot be stomped
   */
  public canBeStomped(): boolean {
    return false;
  }

  /**
   * Crabs are always hostile
   */
  public isHostile(): boolean {
    return true;
  }
}
