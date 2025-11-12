import Phaser from 'phaser';

/**
 * Spike Hazard - Static obstacle that damages player on touch
 * Cannot be destroyed, must be avoided
 */
export class Spike extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, width: number = 32) {
    super(scene, x, y, '');

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static body

    // Set up physics
    this.setupPhysics(width);

    // Create visual representation
    this.createSprite(width);
  }

  private setupPhysics(width: number): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.StaticBody;

    // Set collision box - slightly smaller than visual for forgiveness
    body.setSize(width, 16);
    body.setOffset(0, 0);
  }

  private createSprite(width: number): void {
    // Create spike strip texture
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

    // Base (dark gray platform)
    graphics.fillStyle(0x333333, 1);
    graphics.fillRect(0, 12, width, 4);

    // Individual spikes
    const spikeCount = Math.floor(width / 16);
    graphics.fillStyle(0x666666, 1);

    for (let i = 0; i < spikeCount; i++) {
      const spikeX = i * 16 + 8;
      // Draw triangle spike
      graphics.fillTriangle(
        spikeX - 6, 12,  // Bottom left
        spikeX, 0,       // Top point
        spikeX + 6, 12   // Bottom right
      );
    }

    // Add sharp highlights for danger indication
    graphics.lineStyle(2, 0xFF0000, 0.5);
    for (let i = 0; i < spikeCount; i++) {
      const spikeX = i * 16 + 8;
      graphics.lineBetween(spikeX - 4, 8, spikeX, 2);
      graphics.lineBetween(spikeX + 4, 8, spikeX, 2);
    }

    const textureName = `spike_${width}`;
    graphics.generateTexture(textureName, width, 16);
    graphics.destroy();

    this.setTexture(textureName);
  }

  /**
   * Check if this hazard should hurt the player
   */
  public isHazardous(): boolean {
    return true;
  }
}
