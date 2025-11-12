import Phaser from 'phaser';
import { PHYSICS, TIMING, PLAYER } from '../config/constants';

/**
 * Player - The cat protagonist with precise platformer controls
 * Includes coyote time, jump buffering, variable jump height, and dash ability
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  // Movement state
  private keys!: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    jump: Phaser.Input.Keyboard.Key;
    dash: Phaser.Input.Keyboard.Key;
    altLeft: Phaser.Input.Keyboard.Key;
    altRight: Phaser.Input.Keyboard.Key;
  };

  // Coyote time - allows jumping shortly after leaving platform
  private lastGroundTime: number = 0;
  private coyoteTimeWindow: number = TIMING.COYOTE_TIME;

  // Jump buffering - remembers jump input before landing
  private jumpBufferTime: number = 0;
  private jumpBufferWindow: number = TIMING.JUMP_BUFFER;

  // Dash state
  private dashAvailable: boolean = true;
  private isDashing: boolean = false;
  private dashTime: number = 0;

  // Respawn point
  private spawnX: number = 0;
  private spawnY: number = 0;

  // Health
  private isInvulnerable: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '');

    this.spawnX = x;
    this.spawnY = y;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics body
    this.setupPhysics();

    // Create visual representation (placeholder)
    this.createSprite();

    // Set up input
    this.setupInput();
  }

  private setupPhysics(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Set collision box
    body.setSize(PLAYER.WIDTH, PLAYER.HEIGHT);
    body.setOffset(0, 0);

    // Physics properties
    body.setMaxVelocity(PHYSICS.PLAYER_SPEED, 1000);
    body.setDrag(PHYSICS.PLAYER_DRAG, 0);
    body.setCollideWorldBounds(true);
  }

  private createSprite(): void {
    // Create a simple colored rectangle as placeholder for the cat sprite
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0xFF6B00, 1); // Orange cat
    graphics.fillRect(0, 0, PLAYER.WIDTH, PLAYER.HEIGHT);

    // Add cat features
    graphics.fillStyle(0x000000, 1);
    // Eyes
    graphics.fillCircle(10, 10, 3);
    graphics.fillCircle(22, 10, 3);
    // Ears
    graphics.fillTriangle(5, 0, 10, 0, 7, -8);
    graphics.fillTriangle(22, 0, 27, 0, 24, -8);

    graphics.generateTexture('player-sprite', PLAYER.WIDTH, PLAYER.HEIGHT);
    graphics.destroy();

    this.setTexture('player-sprite');
  }

  private setupInput(): void {
    const keyboard = this.scene.input.keyboard;
    if (!keyboard) return;

    this.keys = {
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      jump: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      dash: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      altLeft: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      altRight: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    };
  }

  update(time: number, _delta: number): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Update timers
    this.updateTimers(time);

    // Handle dash
    if (this.isDashing) {
      this.updateDash(time);
      return; // Don't process other movement while dashing
    }

    // Horizontal movement
    this.handleHorizontalMovement(body);

    // Jumping
    this.handleJump(body, time);

    // Dash input
    this.handleDashInput(time);

    // Check if on ground (update coyote time)
    if (body.blocked.down || body.touching.down) {
      this.lastGroundTime = time;
      this.dashAvailable = true; // Refresh dash when landing
    }

    // Check for death (falling off world)
    if (this.y > this.scene.cameras.main.height + 100) {
      this.die();
    }
  }

  private updateTimers(time: number): void {
    // Jump buffer timer countdown
    if (this.jumpBufferTime > 0 && time - this.jumpBufferTime > this.jumpBufferWindow) {
      this.jumpBufferTime = 0;
    }
  }

  private handleHorizontalMovement(body: Phaser.Physics.Arcade.Body): void {
    const isOnGround = body.blocked.down || body.touching.down;
    const leftPressed = this.keys.left.isDown || this.keys.altLeft.isDown;
    const rightPressed = this.keys.right.isDown || this.keys.altRight.isDown;

    let acceleration = PHYSICS.PLAYER_ACCELERATION;

    // Reduce air control
    if (!isOnGround) {
      acceleration *= PHYSICS.AIR_CONTROL;
    }

    if (leftPressed) {
      body.setAccelerationX(-acceleration);
      this.setFlipX(true);
    } else if (rightPressed) {
      body.setAccelerationX(acceleration);
      this.setFlipX(false);
    } else {
      body.setAccelerationX(0);
    }
  }

  private handleJump(body: Phaser.Physics.Arcade.Body, time: number): void {
    const isOnGround = body.blocked.down || body.touching.down;
    const canCoyoteJump = time - this.lastGroundTime < this.coyoteTimeWindow;

    // Check if jump button was just pressed
    if (Phaser.Input.Keyboard.JustDown(this.keys.jump)) {
      this.jumpBufferTime = time;
    }

    // Can jump if: on ground, within coyote time, or jump is buffered
    const shouldJump = (isOnGround || canCoyoteJump) &&
                       (this.jumpBufferTime > 0 && time - this.jumpBufferTime < this.jumpBufferWindow);

    if (shouldJump) {
      body.setVelocityY(PHYSICS.JUMP_VELOCITY);
      this.jumpBufferTime = 0; // Consume the buffered jump
      this.lastGroundTime = 0; // Prevent coyote time after jump
    }

    // Variable jump height - release jump early for short hop
    if (!this.keys.jump.isDown && body.velocity.y < 0) {
      body.setVelocityY(body.velocity.y * 0.5);
    }
  }

  private handleDashInput(time: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys.dash) && this.dashAvailable) {
      this.startDash(time);
    }
  }

  private startDash(time: number): void {
    if (!this.body) return;

    this.isDashing = true;
    this.dashTime = time;
    this.dashAvailable = false;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Dash in the direction player is facing
    const dashDirection = this.flipX ? -1 : 1;
    body.setVelocityX(PHYSICS.DASH_SPEED * dashDirection);
    body.setVelocityY(0);

    // Visual effect (tint player during dash)
    this.setTint(0x00FFFF);
  }

  private updateDash(time: number): void {
    if (time - this.dashTime > PHYSICS.DASH_DURATION) {
      this.endDash();
    }
  }

  private endDash(): void {
    this.isDashing = false;
    this.clearTint();
  }

  public takeDamage(): void {
    if (this.isInvulnerable) return;

    this.die();
  }

  private die(): void {
    // Call the scene's death handler
    const scene = this.scene as any;
    if (scene.playerDied) {
      scene.playerDied();
    }
  }

  public respawn(): void {
    // Reset position
    this.setPosition(this.spawnX, this.spawnY);

    // Reset velocity
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
    }

    // Reset state
    this.dashAvailable = true;
    this.isDashing = false;
    this.jumpBufferTime = 0;

    // Brief invulnerability
    this.isInvulnerable = true;
    this.setAlpha(0.5);

    this.scene.time.delayedCall(TIMING.RESPAWN_DELAY, () => {
      this.isInvulnerable = false;
      this.setAlpha(1);
    });
  }

  public setCheckpoint(x: number, y: number): void {
    this.spawnX = x;
    this.spawnY = y;
  }
}
