import Phaser from 'phaser';

/**
 * Pigeon Enemy - Slow hopping patrol enemy that can be stomped
 * Patrols back and forth on platforms
 */
export class Pigeon extends Phaser.Physics.Arcade.Sprite {
  private patrolSpeed: number = 50; // Slow movement
  private patrolDirection: number = 1; // 1 = right, -1 = left
  private hopTimer: number = 0;
  private hopInterval: number = 1000; // Hop every 1 second
  private isStomped: boolean = false;
  private stompedTime: number = 0;
  private readonly STOMP_DURATION: number = 500; // How long stomped state lasts

  // Patrol boundaries
  private patrolMinX: number = 0;
  private patrolMaxX: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, patrolRange: number = 150) {
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

    // Set collision box (smaller than player)
    body.setSize(24, 24);
    body.setOffset(0, 0);

    // Physics properties
    body.setMaxVelocity(this.patrolSpeed, 500);
    body.setCollideWorldBounds(true);
    body.setBounce(0, 0);
  }

  private createSprite(): void {
    // Create a simple pigeon sprite (gray bird)
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

    // Body (gray oval)
    graphics.fillStyle(0x808080, 1);
    graphics.fillEllipse(12, 16, 20, 16);

    // Head (smaller gray circle)
    graphics.fillStyle(0x606060, 1);
    graphics.fillCircle(12, 8, 6);

    // Beak (orange triangle)
    graphics.fillStyle(0xFF8800, 1);
    graphics.fillTriangle(12, 8, 16, 10, 12, 12);

    // Eye (white dot)
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillCircle(14, 7, 2);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(14, 7, 1);

    graphics.generateTexture('pigeon', 24, 24);
    graphics.destroy();

    this.setTexture('pigeon');
  }

  update(time: number, delta: number): void {
    if (!this.body || !this.active) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // If stomped, stay still
    if (this.isStomped) {
      body.setVelocityX(0);
      this.setTint(0x666666); // Darker tint when stomped

      // Check if stomp duration is over
      if (time - this.stompedTime > this.STOMP_DURATION) {
        // Destroy the enemy after being stomped
        this.destroy();
      }
      return;
    }

    // Patrol behavior - hop occasionally
    this.hopTimer += delta;

    if (this.hopTimer >= this.hopInterval && body.blocked.down) {
      // Perform a small hop
      body.setVelocityY(-200);
      this.hopTimer = 0;
    }

    // Horizontal movement
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
  }

  /**
   * Called when player stomps on this enemy
   * Returns true if stomp was successful
   */
  public stomp(): boolean {
    if (this.isStomped) return false;

    this.isStomped = true;
    this.stompedTime = this.scene.time.now;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);

    // Play a squash animation
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.5,
      scaleX: 1.2,
      duration: 200,
      ease: 'Power2',
    });

    return true;
  }

  /**
   * Check if this enemy can be stomped
   */
  public canBeStomped(): boolean {
    return !this.isStomped;
  }

  /**
   * Check if this enemy should hurt the player
   */
  public isHostile(): boolean {
    return !this.isStomped;
  }
}
