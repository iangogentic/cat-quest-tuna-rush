import Phaser from 'phaser';
import { SCENES, LEVELS } from '../config/constants';
import { Player } from '../entities/Player';
import { Tuna } from '../entities/Tuna';
import { LevelResult } from '../types';

/**
 * GameScene - Main gameplay scene
 */
export class GameScene extends Phaser.Scene {
  private player!: Player;
  private tunaGroup!: Phaser.GameObjects.Group;
  private tunaCollected: number = 0;
  private totalTuna: number = 0;
  private levelStartTime: number = 0;
  private deaths: number = 0;
  private currentLevelKey: string = '';

  // UI Elements
  private tunaCounterText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENES.GAME });
  }

  init(data: { levelKey: string }): void {
    this.currentLevelKey = data.levelKey || 'level-1-1';
    this.tunaCollected = 0;
    this.deaths = 0;
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

    // Update timer
    this.updateTimer();
  }

  private createLevel(): void {
    const { width, height } = this.cameras.main;

    // For now, create a simple platform-based level
    // In a full implementation, this would load tilemaps

    // Background
    this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0);

    // Ground
    const ground = this.add.rectangle(0, height - 50, width, 100, 0x228B22).setOrigin(0);
    this.physics.add.existing(ground, true);

    // Platforms
    this.createPlatforms();

    // Spawn tuna collectibles
    this.createTuna();

    // Create goal
    this.createGoal();
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
    // Respawn player
    this.player.respawn();
  }
}
