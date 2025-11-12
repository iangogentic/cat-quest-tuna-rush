import Phaser from 'phaser';

/**
 * Dog Boss - Mini-boss with telegraphed charge attacks
 * Takes 3 hits to defeat, gets stunned after hitting walls
 */
export class DogBoss extends Phaser.Physics.Arcade.Sprite {
  private health: number = 3;
  private maxHealth: number = 3;
  private bossState: 'idle' | 'telegraph' | 'charging' | 'stunned' = 'idle';
  private stateTimer: number = 0;
  private playerRef: Phaser.Physics.Arcade.Sprite | null = null;

  // Attack parameters
  private telegraphDuration: number = 1000; // 1 second warning
  private chargeDuration: number = 2000; // 2 seconds of charging
  private chargeSpeed: number = 400;
  private stunnedDuration: number = 1500; // 1.5 seconds stunned
  private idleDuration: number = 1000; // 1 second between attacks

  // Visual feedback
  private warningGraphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '');

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics
    this.setupPhysics();

    // Create visual representation
    this.createSprite();

    // Create warning indicator
    this.warningGraphics = scene.add.graphics();

    // Start in idle state
    this.enterIdleState();
  }

  private setupPhysics(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Larger boss size
    body.setSize(48, 48);
    body.setOffset(0, 0);

    // Heavy and strong
    body.setMaxVelocity(this.chargeSpeed, 1000);
    body.setCollideWorldBounds(true);
    body.setBounce(0, 0);
    body.setMass(5);
  }

  private createSprite(): void {
    // Create an angry dog sprite (larger and more detailed)
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

    // Body (brown)
    graphics.fillStyle(0x8B4513, 1);
    graphics.fillEllipse(24, 28, 40, 32);

    // Head (brown)
    graphics.fillStyle(0xA0522D, 1);
    graphics.fillCircle(24, 18, 16);

    // Snout (lighter brown)
    graphics.fillStyle(0xD2691E, 1);
    graphics.fillEllipse(28, 22, 12, 10);

    // Ears (dark brown, pointed down)
    graphics.fillStyle(0x654321, 1);
    graphics.fillEllipse(14, 12, 8, 12);
    graphics.fillEllipse(34, 12, 8, 12);

    // Eyes (angry red)
    graphics.fillStyle(0xFF0000, 1);
    graphics.fillCircle(20, 16, 3);
    graphics.fillCircle(28, 16, 3);

    // Nose (black)
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(28, 22, 3);

    // Angry eyebrows
    graphics.lineStyle(2, 0x000000, 1);
    graphics.lineBetween(16, 14, 20, 16);
    graphics.lineBetween(28, 16, 32, 14);

    // Teeth (white, showing aggression)
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillTriangle(24, 26, 22, 28, 26, 28);
    graphics.fillTriangle(28, 26, 26, 28, 30, 28);

    // Legs (brown)
    graphics.fillStyle(0x8B4513, 1);
    graphics.fillRect(12, 38, 8, 10);
    graphics.fillRect(28, 38, 8, 10);

    // Collar with spikes (to show it's a boss)
    graphics.fillStyle(0x666666, 1);
    graphics.fillRect(16, 24, 16, 4);
    graphics.fillStyle(0xCCCCCC, 1);
    graphics.fillTriangle(20, 24, 18, 20, 22, 24);
    graphics.fillTriangle(28, 24, 26, 20, 30, 24);

    graphics.generateTexture('dog-boss', 48, 48);
    graphics.destroy();

    this.setTexture('dog-boss');
  }

  public setPlayerReference(player: Phaser.Physics.Arcade.Sprite): void {
    this.playerRef = player;
  }

  update(_time: number, delta: number): void {
    if (!this.body || !this.active || this.health <= 0) return;

    this.stateTimer += delta;

    switch (this.bossState) {
      case 'idle':
        this.updateIdleState();
        break;
      case 'telegraph':
        this.updateTelegraphState();
        break;
      case 'charging':
        this.updateChargingState();
        break;
      case 'stunned':
        this.updateStunnedState();
        break;
    }
  }

  private enterIdleState(): void {
    this.bossState = 'idle';
    this.stateTimer = 0;
    this.clearTint();

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
  }

  private updateIdleState(): void {
    if (this.stateTimer >= this.idleDuration) {
      this.enterTelegraphState();
    }
  }

  private enterTelegraphState(): void {
    this.bossState = 'telegraph';
    this.stateTimer = 0;

    // Flash red to indicate incoming attack
    this.setTint(0xFF0000);

    // Show warning indicator
    this.showWarning();
  }

  private updateTelegraphState(): void {
    // Flash effect
    const flashFrequency = 200;
    if (Math.floor(this.stateTimer / flashFrequency) % 2 === 0) {
      this.setTint(0xFF0000);
    } else {
      this.clearTint();
    }

    if (this.stateTimer >= this.telegraphDuration) {
      this.enterChargingState();
    }
  }

  private enterChargingState(): void {
    this.bossState = 'charging';
    this.stateTimer = 0;
    this.clearTint();
    this.hideWarning();

    if (!this.playerRef || !this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Calculate direction to player
    const dx = this.playerRef.x - this.x;
    const direction = dx > 0 ? 1 : -1;

    // Charge in that direction
    body.setVelocityX(this.chargeSpeed * direction);

    // Face the charge direction
    this.setFlipX(direction < 0);
  }

  private updateChargingState(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Check if hit a wall
    if (body.blocked.left || body.blocked.right) {
      this.enterStunnedState();
      return;
    }

    // Timeout to stunned state
    if (this.stateTimer >= this.chargeDuration) {
      this.enterStunnedState();
    }
  }

  private enterStunnedState(): void {
    this.bossState = 'stunned';
    this.stateTimer = 0;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);

    // Show dizzy effect
    this.setTint(0x888888);

    // Add stars/dizziness animation
    this.scene.tweens.add({
      targets: this,
      angle: { from: -10, to: 10 },
      duration: 200,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: Math.floor(this.stunnedDuration / 400),
    });
  }

  private updateStunnedState(): void {
    if (this.stateTimer >= this.stunnedDuration) {
      this.enterIdleState();
    }
  }

  private showWarning(): void {
    this.warningGraphics.clear();

    if (!this.playerRef) return;

    // Draw line from dog to player
    this.warningGraphics.lineStyle(3, 0xFF0000, 0.5);
    this.warningGraphics.lineBetween(this.x, this.y, this.playerRef.x, this.playerRef.y);

    // Draw exclamation mark above dog
    this.warningGraphics.fillStyle(0xFF0000, 1);
    this.warningGraphics.fillRect(this.x - 3, this.y - 60, 6, 15);
    this.warningGraphics.fillRect(this.x - 3, this.y - 40, 6, 6);
  }

  private hideWarning(): void {
    this.warningGraphics.clear();
  }

  /**
   * Damage the boss (only when stunned)
   * Returns true if damage was dealt
   */
  public takeDamage(): boolean {
    if (this.bossState !== 'stunned' || this.health <= 0) return false;

    this.health--;

    // Flash white to show damage
    this.setTint(0xFFFFFF);
    this.scene.time.delayedCall(100, () => {
      if (this.health > 0) {
        this.setTint(0x888888); // Back to stunned tint
      }
    });

    // Check if defeated
    if (this.health <= 0) {
      this.defeat();
      return true;
    }

    return true;
  }

  private defeat(): void {
    this.hideWarning();

    // Defeat animation
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      angle: 360,
      scaleX: 0,
      scaleY: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      },
    });
  }

  /**
   * Check if boss is vulnerable to stomp
   */
  public canBeStomped(): boolean {
    return this.bossState === 'stunned';
  }

  /**
   * Check if boss is hostile (can damage player)
   */
  public isHostile(): boolean {
    return this.bossState === 'charging';
  }

  /**
   * Get current health
   */
  public getHealth(): number {
    return this.health;
  }

  /**
   * Get max health
   */
  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public destroy(fromScene?: boolean): void {
    this.warningGraphics?.destroy();
    super.destroy(fromScene);
  }
}
