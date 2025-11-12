import Phaser from 'phaser';
import { SCENES, LEVELS } from '../config/constants';
import { Player } from '../entities/Player';
import { Tuna } from '../entities/Tuna';
import { Pigeon } from '../entities/Pigeon';
import { Crab } from '../entities/Crab';
import { DogBoss } from '../entities/DogBoss';
import { Spike } from '../entities/Spike';
import { FallingCrate } from '../entities/FallingCrate';
import { FishMagnet } from '../entities/FishMagnet';
import { NineLives } from '../entities/NineLives';
import { LevelResult } from '../types';

/**
 * GameScene - Main gameplay scene with enemies, hazards, and power-ups
 */
export class GameScene extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.GameObjects.GameObject[];
  private tunaGroup!: Phaser.GameObjects.Group;
  private enemyGroup!: Phaser.GameObjects.Group;
  private hazardGroup!: Phaser.GameObjects.Group;
  private powerUpGroup!: Phaser.GameObjects.Group;
  private fallingCrates: FallingCrate[] = [];
  private dogBoss: DogBoss | null = null;

  private tunaCollected: number = 0;
  private totalTuna: number = 0;
  private levelStartTime: number = 0;
  private deaths: number = 0;
  private currentLevelKey: string = '';

  // Power-up states
  private fishMagnetActive: boolean = false;
  private fishMagnetEndTime: number = 0;
  private fishMagnetRadius: number = 150;
  private nineLivesActive: boolean = false;

  // UI Elements
  private tunaCounterText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private powerUpText!: Phaser.GameObjects.Text;
  private bossHealthBar: Phaser.GameObjects.Graphics | null = null;

  constructor() {
    super({ key: SCENES.GAME });
  }

  init(data: { levelKey: string }): void {
    this.currentLevelKey = data.levelKey || 'level-1-1';
    this.tunaCollected = 0;
    this.deaths = 0;
    this.fishMagnetActive = false;
    this.nineLivesActive = false;
    this.dogBoss = null;
    this.fallingCrates = [];
  }

  shutdown(): void {
    // Only remove the ESC key listener, not all listeners (Player needs its keys)
    this.input.keyboard?.off('keydown-ESC');
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Create level
    this.createLevel();

    // Create player
    this.player = new Player(this, 100, height - 200);

    // Create UI
    this.createUI();

    // Set up camera
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Start timer
    this.levelStartTime = this.time.now;

    // Set up pause key
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch(SCENES.OPTIONS); // Show options as pause menu
    });
  }

  update(time: number, delta: number): void {
    if (this.player) {
      this.player.update(time, delta);
    }

    // Update enemies
    if (this.enemyGroup) {
      this.enemyGroup.getChildren().forEach((enemy: any) => {
        if (enemy.update) {
          enemy.update(time, delta);
        }
      });
    }

    // Update falling crates (check player proximity)
    this.fallingCrates.forEach((crate) => {
      if (crate.active) {
        crate.checkPlayerProximity(this.player.x, this.player.y);
        crate.update(time, delta);
      }
    });

    // Update dog boss
    if (this.dogBoss && this.dogBoss.active) {
      this.dogBoss.update(time, delta);
      this.updateBossHealthBar();
    }

    // Update Fish Magnet power-up
    if (this.fishMagnetActive) {
      this.updateFishMagnet(time);
    }

    // Update timer
    this.updateTimer();
  }

  private createLevel(): void {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0);

    // Initialize platforms array
    this.platforms = [];

    // Ground
    const ground = this.add.rectangle(0, height - 50, width, 100, 0x228B22).setOrigin(0);
    this.physics.add.existing(ground, true);
    this.platforms.push(ground);

    // Initialize groups
    this.enemyGroup = this.add.group();
    this.hazardGroup = this.add.group();
    this.powerUpGroup = this.add.group();

    // Create level-specific content based on currentLevelKey
    switch (this.currentLevelKey) {
      case 'level-1-1':
        this.createLevel1_1();
        break;
      case 'level-1-2':
        this.createLevel1_2();
        break;
      case 'level-1-3':
        this.createLevel1_3();
        break;
      case 'level-1-boss':
        this.createLevel1Boss();
        break;
      default:
        // Fallback to basic level
        this.createPlatforms();
        this.createTuna();
        break;
    }

    // Create goal (all levels have a goal)
    this.createGoal();

    // Set up collisions
    this.setupCollisions();
  }

  private createPlatforms(): void {
    const { height } = this.cameras.main;

    // Create some platforms
    const platformData = [
      { x: 200, y: height - 200, width: 200, height: 20 },
      { x: 500, y: height - 300, width: 200, height: 20 },
      { x: 800, y: height - 250, width: 200, height: 20 },
      { x: 1000, y: height - 400, width: 150, height: 20 },
    ];

    platformData.forEach((data) => {
      const platform = this.add.rectangle(data.x, data.y, data.width, data.height, 0x8B4513);
      this.physics.add.existing(platform, true);
      this.platforms.push(platform);
    });
  }

  private createTuna(): void {
    this.tunaGroup = this.add.group();

    // Get level data
    const levelData = LEVELS.find((l) => l.key === this.currentLevelKey);
    const tunaCount = levelData?.tunaCount || 10;
    this.totalTuna = tunaCount;

    // Spawn tuna in various locations
    const { width, height } = this.cameras.main;

    for (let i = 0; i < tunaCount; i++) {
      const x = 150 + (i * width) / tunaCount;
      const y = height - 150 - Math.random() * 200;
      const tuna = new Tuna(this, x, y);
      this.tunaGroup.add(tuna);
    }

    // Set up collision with player
    this.physics.add.overlap(this.player, this.tunaGroup, this.collectTuna as any, undefined, this);
  }

  private collectTuna(_player: any, tuna: any): void {
    tuna.collect();
    this.tunaCollected++;
    this.updateTunaCounter();
  }

  private createGoal(): void {
    const { width, height } = this.cameras.main;

    const goal = this.add.rectangle(width - 100, height - 150, 50, 100, 0xFFD700);
    this.physics.add.existing(goal, true);

    const goalText = this.add.text(width - 100, height - 200, 'GOAL', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#000000',
    });
    goalText.setOrigin(0.5);

    // Collision with goal
    this.physics.add.overlap(this.player, goal, this.reachGoal as any, undefined, this);
  }

  private reachGoal(): void {
    const elapsedTime = this.time.now - this.levelStartTime;
    const score = this.calculateScore(elapsedTime);

    const result: LevelResult & { levelKey: string } = {
      levelKey: this.currentLevelKey,
      tunaCollected: this.tunaCollected,
      totalTuna: this.totalTuna,
      time: elapsedTime,
      deaths: this.deaths,
      stars: 0, // Will be calculated in ResultsScene
      score,
    };

    this.scene.start(SCENES.RESULTS, result);
  }

  private calculateScore(time: number): number {
    const tunaScore = this.tunaCollected * 10;
    const timeBonus = Math.max(0, 1000 - Math.floor(time / 100));
    const noHitBonus = this.deaths === 0 ? 500 : 0;
    return tunaScore + timeBonus + noHitBonus;
  }

  private createUI(): void {
    // Tuna counter
    this.tunaCounterText = this.add.text(20, 20, `Tuna: 0/${this.totalTuna}`, {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4,
    });
    this.tunaCounterText.setScrollFactor(0);

    // Timer
    this.timerText = this.add.text(this.cameras.main.width - 20, 20, 'Time: 0:00', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4,
    });
    this.timerText.setOrigin(1, 0);
    this.timerText.setScrollFactor(0);
  }

  private updateTunaCounter(): void {
    this.tunaCounterText.setText(`Tuna: ${this.tunaCollected}/${this.totalTuna}`);
  }

  private updateTimer(): void {
    const elapsed = this.time.now - this.levelStartTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    this.timerText.setText(`Time: ${minutes}:${remainingSeconds.toString().padStart(2, '0')}`);
  }

  public playerDied(): void {
    this.deaths++;

    // Lose Nine Lives power-up if active
    if (this.nineLivesActive) {
      this.nineLivesActive = false;
      this.updatePowerUpText();
      // Don't actually die, shield absorbed the hit
      this.player.respawn();
      return;
    }

    // Respawn player
    this.player.respawn();
  }

  // ==================== LEVEL CREATION METHODS ====================

  private createLevel1_1(): void {
    // L1-1: Basics + tuna trails (easy introduction)
    const { height } = this.cameras.main;

    // Simple platforms introducing basic jumping
    const platforms = [
      { x: 200, y: height - 150, width: 200, height: 20 },
      { x: 450, y: height - 200, width: 150, height: 20 },
      { x: 700, y: height - 250, width: 180, height: 20 },
      { x: 950, y: height - 200, width: 160, height: 20 },
    ];

    platforms.forEach((data) => {
      const platform = this.add.rectangle(data.x, data.y, data.width, data.height, 0x8B4513);
      this.physics.add.existing(platform, true);
      this.platforms.push(platform);
    });

    // Create tuna trail (teaches collection)
    this.createTunaTrail([
      { x: 150, y: height - 100 },
      { x: 200, y: height - 180 },
      { x: 250, y: height - 180 },
      { x: 450, y: height - 230 },
      { x: 500, y: height - 230 },
      { x: 700, y: height - 280 },
      { x: 750, y: height - 280 },
      { x: 800, y: height - 280 },
      { x: 950, y: height - 230 },
      { x: 1000, y: height - 230 },
    ]);

    // Single pigeon enemy (introduction)
    const pigeon = new Pigeon(this, 450, height - 240, 100);
    this.enemyGroup.add(pigeon);

    // Fish Magnet power-up (introduce power-up concept)
    const fishMagnet = new FishMagnet(this, 700, height - 300);
    this.powerUpGroup.add(fishMagnet);
  }

  private createLevel1_2(): void {
    // L1-2: Vertical sections and moving platforms
    const { height } = this.cameras.main;

    // More vertical platforming
    const platforms = [
      { x: 150, y: height - 120, width: 120, height: 20 },
      { x: 300, y: height - 200, width: 100, height: 20 },
      { x: 450, y: height - 280, width: 120, height: 20 },
      { x: 600, y: height - 360, width: 100, height: 20 },
      { x: 750, y: height - 280, width: 120, height: 20 },
      { x: 900, y: height - 200, width: 100, height: 20 },
      { x: 1050, y: height - 150, width: 150, height: 20 },
    ];

    platforms.forEach((data) => {
      const platform = this.add.rectangle(data.x, data.y, data.width, data.height, 0x8B4513);
      this.physics.add.existing(platform, true);
      this.platforms.push(platform);
    });

    // Scattered tuna (vertical collection)
    this.createTunaTrail([
      { x: 150, y: height - 150 },
      { x: 200, y: height - 180 },
      { x: 300, y: height - 230 },
      { x: 450, y: height - 310 },
      { x: 500, y: height - 330 },
      { x: 600, y: height - 390 },
      { x: 750, y: height - 310 },
      { x: 900, y: height - 230 },
      { x: 1000, y: height - 180 },
      { x: 1100, y: height - 180 },
    ]);

    // Multiple enemies
    const pigeon1 = new Pigeon(this, 300, height - 240, 80);
    const pigeon2 = new Pigeon(this, 750, height - 320, 100);
    const crab = new Crab(this, 900, height - 240, 80);
    this.enemyGroup.add(pigeon1);
    this.enemyGroup.add(pigeon2);
    this.enemyGroup.add(crab);

    // Falling crates hazard (introduction)
    const crate1 = new FallingCrate(this, 450, height - 400);
    const crate2 = new FallingCrate(this, 750, height - 380);
    this.fallingCrates.push(crate1, crate2);
    this.hazardGroup.add(crate1);
    this.hazardGroup.add(crate2);

    // Nine Lives power-up
    const nineLives = new NineLives(this, 600, height - 430);
    this.powerUpGroup.add(nineLives);
  }

  private createLevel1_3(): void {
    // L1-3: Hazards and tight timing
    const { height } = this.cameras.main;

    // Tighter platforming
    const platforms = [
      { x: 150, y: height - 150, width: 100, height: 20 },
      { x: 300, y: height - 200, width: 80, height: 20 },
      { x: 450, y: height - 250, width: 100, height: 20 },
      { x: 620, y: height - 300, width: 80, height: 20 },
      { x: 780, y: height - 250, width: 100, height: 20 },
      { x: 950, y: height - 200, width: 120, height: 20 },
    ];

    platforms.forEach((data) => {
      const platform = this.add.rectangle(data.x, data.y, data.width, data.height, 0x8B4513);
      this.physics.add.existing(platform, true);
      this.platforms.push(platform);
    });

    // Tuna with hazards nearby (risk/reward)
    this.createTunaTrail([
      { x: 150, y: height - 180 },
      { x: 220, y: height - 150 },
      { x: 300, y: height - 230 },
      { x: 380, y: height - 200 },
      { x: 450, y: height - 280 },
      { x: 540, y: height - 260 },
      { x: 620, y: height - 330 },
      { x: 700, y: height - 280 },
      { x: 780, y: height - 280 },
      { x: 950, y: height - 230 },
    ]);

    // Many hazards
    const spike1 = new Spike(this, 220, height - 50, 64);
    const spike2 = new Spike(this, 380, height - 50, 64);
    const spike3 = new Spike(this, 700, height - 50, 96);
    this.hazardGroup.add(spike1);
    this.hazardGroup.add(spike2);
    this.hazardGroup.add(spike3);

    // Falling crates
    const crate1 = new FallingCrate(this, 300, height - 320);
    const crate2 = new FallingCrate(this, 620, height - 400);
    const crate3 = new FallingCrate(this, 780, height - 350);
    this.fallingCrates.push(crate1, crate2, crate3);
    this.hazardGroup.add(crate1);
    this.hazardGroup.add(crate2);
    this.hazardGroup.add(crate3);

    // Multiple enemies
    const pigeon = new Pigeon(this, 450, height - 290, 80);
    const crab1 = new Crab(this, 300, height - 240, 60);
    const crab2 = new Crab(this, 950, height - 240, 100);
    this.enemyGroup.add(pigeon);
    this.enemyGroup.add(crab1);
    this.enemyGroup.add(crab2);

    // Both power-ups (player choice)
    const fishMagnet = new FishMagnet(this, 450, height - 310);
    const nineLives = new NineLives(this, 950, height - 260);
    this.powerUpGroup.add(fishMagnet);
    this.powerUpGroup.add(nineLives);
  }

  private createLevel1Boss(): void {
    // L1-Boss: Dog boss fight arena
    const { width, height } = this.cameras.main;

    // Large arena floor
    const arenaWidth = 800;
    const arenaFloor = this.add.rectangle(width / 2, height - 100, arenaWidth, 20, 0x8B4513);
    this.physics.add.existing(arenaFloor, true);
    this.platforms.push(arenaFloor);

    // Side walls (for dog to bonk into)
    const leftWall = this.add.rectangle(width / 2 - arenaWidth / 2 - 20, height - 200, 40, 200, 0x666666);
    const rightWall = this.add.rectangle(width / 2 + arenaWidth / 2 + 20, height - 200, 40, 200, 0x666666);
    this.physics.add.existing(leftWall, true);
    this.physics.add.existing(rightWall, true);
    this.platforms.push(leftWall);
    this.platforms.push(rightWall);

    // Some platforms for dodging
    const platform1 = this.add.rectangle(width / 2 - 200, height - 200, 100, 20, 0x8B4513);
    const platform2 = this.add.rectangle(width / 2 + 200, height - 200, 100, 20, 0x8B4513);
    this.physics.add.existing(platform1, true);
    this.physics.add.existing(platform2, true);
    this.platforms.push(platform1);
    this.platforms.push(platform2);

    // Tuna for healing/scoring (scattered around arena)
    this.createTunaTrail([
      { x: width / 2 - 300, y: height - 140 },
      { x: width / 2 - 200, y: height - 230 },
      { x: width / 2, y: height - 140 },
      { x: width / 2 + 200, y: height - 230 },
      { x: width / 2 + 300, y: height - 140 },
    ]);

    // Boss enemy
    this.dogBoss = new DogBoss(this, width / 2, height - 160);
    this.dogBoss.setPlayerReference(this.player);
    this.enemyGroup.add(this.dogBoss);

    // Power-ups on platforms (strategic placement)
    const nineLives = new NineLives(this, width / 2 - 200, height - 250);
    this.powerUpGroup.add(nineLives);

    // Create boss health bar
    this.createBossHealthBar();
  }

  private createTunaTrail(positions: { x: number; y: number }[]): void {
    this.tunaGroup = this.tunaGroup || this.add.group();

    positions.forEach((pos) => {
      const tuna = new Tuna(this, pos.x, pos.y);
      this.tunaGroup.add(tuna);
    });

    this.totalTuna = this.tunaGroup.getLength();
  }

  // ==================== COLLISION SETUP ====================

  private setupCollisions(): void {
    // Player vs Platforms (CRITICAL - allows player to stand on platforms)
    this.platforms.forEach((platform) => {
      this.physics.add.collider(this.player, platform);
    });

    // Player vs Tuna
    this.physics.add.overlap(this.player, this.tunaGroup, this.collectTuna as any, undefined, this);

    // Player vs Enemies (side collision = damage)
    this.physics.add.overlap(this.player, this.enemyGroup, this.playerHitEnemy as any, undefined, this);

    // Player vs Hazards
    this.physics.add.overlap(this.player, this.hazardGroup, this.playerHitHazard as any, undefined, this);

    // Player vs Power-ups
    this.physics.add.overlap(this.player, this.powerUpGroup, this.collectPowerUp as any, undefined, this);
  }

  private playerHitEnemy(_player: any, enemy: any): void {
    if (!enemy.isHostile || !enemy.isHostile()) {
      return; // Enemy is not currently hostile
    }

    // Check if player is stomping (above enemy and falling)
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;

    if (playerBody.velocity.y > 0 && playerBody.bottom < enemyBody.center.y) {
      // Stomp attempt
      if (enemy.canBeStomped && enemy.canBeStomped()) {
        enemy.stomp();
        // Bounce player up
        playerBody.setVelocityY(-300);
      } else {
        // Stomp failed (e.g., armored enemy like crab)
        this.player.takeDamage();
      }
    } else {
      // Side collision = damage
      this.player.takeDamage();
    }
  }

  private playerHitHazard(_player: any, hazard: any): void {
    if (hazard.isHazardous && hazard.isHazardous()) {
      this.player.takeDamage();
    }
  }

  private collectPowerUp(_player: any, powerUp: any): void {
    if (powerUp.collect && powerUp.collect()) {
      // Determine power-up type
      if (powerUp instanceof FishMagnet) {
        this.activateFishMagnet();
      } else if (powerUp instanceof NineLives) {
        this.activateNineLives();
      }
    }
  }

  // ==================== POWER-UP METHODS ====================

  private activateFishMagnet(): void {
    this.fishMagnetActive = true;
    this.fishMagnetEndTime = this.time.now + 10000; // 10 seconds
    this.updatePowerUpText();
  }

  private updateFishMagnet(time: number): void {
    if (time >= this.fishMagnetEndTime) {
      this.fishMagnetActive = false;
      this.updatePowerUpText();
      return;
    }

    // Attract nearby tuna
    this.tunaGroup.getChildren().forEach((tuna: any) => {
      if (!tuna.active) return;

      const dx = this.player.x - tuna.x;
      const dy = this.player.y - tuna.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.fishMagnetRadius) {
        // Move tuna towards player
        tuna.x += (dx / distance) * 5;
        tuna.y += (dy / distance) * 5;
      }
    });
  }

  private activateNineLives(): void {
    this.nineLivesActive = true;
    this.updatePowerUpText();
  }

  private updatePowerUpText(): void {
    if (!this.powerUpText) {
      this.powerUpText = this.add.text(this.cameras.main.width / 2, 20, '', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 3,
      });
      this.powerUpText.setOrigin(0.5, 0);
      this.powerUpText.setScrollFactor(0);
    }

    const powerUps: string[] = [];
    if (this.fishMagnetActive) {
      const remaining = Math.ceil((this.fishMagnetEndTime - this.time.now) / 1000);
      powerUps.push(`Magnet: ${remaining}s`);
    }
    if (this.nineLivesActive) {
      powerUps.push('Shield Active');
    }

    this.powerUpText.setText(powerUps.join(' | '));
  }

  // ==================== BOSS METHODS ====================

  private createBossHealthBar(): void {
    this.bossHealthBar = this.add.graphics();
    this.bossHealthBar.setScrollFactor(0);
  }

  private updateBossHealthBar(): void {
    if (!this.bossHealthBar || !this.dogBoss) return;

    this.bossHealthBar.clear();

    const health = this.dogBoss.getHealth();
    const maxHealth = this.dogBoss.getMaxHealth();

    if (health <= 0) return;

    // Draw health bar
    const barWidth = 300;
    const barHeight = 20;
    const x = this.cameras.main.width / 2 - barWidth / 2;
    const y = 60;

    // Background (red)
    this.bossHealthBar.fillStyle(0xFF0000, 1);
    this.bossHealthBar.fillRect(x, y, barWidth, barHeight);

    // Health (green)
    const healthWidth = (health / maxHealth) * barWidth;
    this.bossHealthBar.fillStyle(0x00FF00, 1);
    this.bossHealthBar.fillRect(x, y, healthWidth, barHeight);

    // Border
    this.bossHealthBar.lineStyle(3, 0x000000, 1);
    this.bossHealthBar.strokeRect(x, y, barWidth, barHeight);

    // Boss name
    if (!this.bossHealthBar.getData('nameText')) {
      const nameText = this.add.text(this.cameras.main.width / 2, y - 10, 'Fishmonger\'s Dog', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4,
      });
      nameText.setOrigin(0.5, 1);
      nameText.setScrollFactor(0);
      this.bossHealthBar.setData('nameText', nameText);
    }
  }
}
