/**
 * CNP インベーダー - ボスエンティティ（TypeScript版）
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

import { BaseEntity } from './BaseEntity';
import { Bullet } from './Bullet';
import type { GameEngine } from '../core/GameEngine';
import type { BossConfig } from '../core/config';

export class Boss extends BaseEntity {
  private game: GameEngine;
  private config: BossConfig;
  private type: 'A' | 'B' | 'C';
  private stage: number;
  
  // コールバック
  private onBulletFired?: (bullet: Bullet) => void;
  
  // ボス状態
  private health: number;
  private maxHealth: number;
  private points: number;
  
  // 移動パターン
  private speed: number;
  private direction = 1; // 1: 右, -1: 左
  private edgeMargin = 5;
  
  // 攻撃パターン
  private attackTimer = 0;
  private currentAttackPhase = 0;
  private attackCooldowns: { [key: string]: number } = {};
  
  // アニメーション
  private damageFlashTimer = 0;
  private damageFlashDuration = 0.2;
  
  // 画像
  private image: HTMLImageElement;

  constructor(
    game: GameEngine,
    x: number,
    y: number,
    type: 'A' | 'B' | 'C' = 'A',
    stage = 1
  ) {
    // 設定を取得してサイズを決定
    const gameConfig = game.getConfig();
    const bossConfig = gameConfig.BOSS[type];
    
    super(x, y, bossConfig.SIZE.WIDTH, bossConfig.SIZE.HEIGHT);
    
    this.game = game;
    this.type = type;
    this.config = bossConfig;
    this.stage = stage;
    
    // ボス状態初期化
    this.health = this.config.HEALTH;
    this.maxHealth = this.config.MAX_HEALTH;
    this.points = this.config.POINTS;
    
    // 移動パターン初期化
    this.speed = this.config.SPEED;
    
    // 攻撃クールダウン初期化
    this.initializeAttackCooldowns();
    
    // 画像読み込み
    this.image = new Image();
    this.loadImage();
    
    console.log(`Boss ${this.type} (Stage ${this.stage}) spawned with ${this.health} HP`);
  }

  private initializeAttackCooldowns(): void {
    this.attackCooldowns = {
      single: 0,
      spread: 0,
      homing: 0,
      special: 0
    };
  }

  private loadImage(): void {
    this.image.onload = () => {
      console.log(`ボス${this.type}(ステージ${this.stage})画像の読み込みに成功しました`);
    };
    
    this.image.onerror = () => {
      console.error(`ボス${this.type}画像の読み込みに失敗しました:`, this.config.IMAGE);
    };
    
    this.image.src = `./src/assets/img/boss/${this.config.IMAGE}`;
  }

  update(deltaTime: number): void {
    if (!this.isActive) return;

    // 移動処理
    this.updateMovement(deltaTime);
    
    // 攻撃処理
    this.updateAttacks(deltaTime);
    
    // ダメージフラッシュ更新
    this.updateDamageFlash(deltaTime);
  }

  private updateMovement(deltaTime: number): void {
    const canvas = this.game.getCanvas();
    
    // 左右移動
    this.x += this.direction * this.speed * deltaTime;
    
    // ボスの幅を考慮した画面端判定
    const leftBound = this.width / 2 + this.edgeMargin;
    const rightBound = canvas.width - this.width / 2 - this.edgeMargin;
    
    // 画面端で方向転換
    if (this.x <= leftBound) {
      this.x = leftBound;
      this.direction = 1;
    } else if (this.x >= rightBound) {
      this.x = rightBound;
      this.direction = -1;
    }
  }

  private updateAttacks(deltaTime: number): void {
    this.attackTimer += deltaTime;
    
    // 攻撃クールダウン更新
    for (const attackType in this.attackCooldowns) {
      if (this.attackCooldowns[attackType] > 0) {
        this.attackCooldowns[attackType] -= deltaTime;
      }
    }
    
    // 攻撃パターン実行
    this.executeAttackPattern();
  }

  private executeAttackPattern(): void {
    // HPに応じて攻撃パターンを変更（2段階）
    const healthRatio = this.health / this.maxHealth;
    
    if (healthRatio > 0.5) {
      // HP50%以上：基本攻撃
      this.tryBasicAttacks();
    } else {
      // HP50%以下：中級攻撃
      this.tryIntermediateAttacks();
    }
  }

  private tryBasicAttacks(): void {
    if (this.type === 'A') {
      // 弁天：クナイ5-way攻撃
      if (this.attackCooldowns.single <= 0) {
        this.shootBentenKunai();
        this.attackCooldowns.single = 1.5; // 1.5秒間隔（頻度を上昇）
      }
    } else if (this.type === 'B') {
      // 孤白：波弾（下方向）攻撃（ランダム間隔）
      if (this.attackCooldowns.single <= 0) {
        this.shootKohakuWave();
        this.attackCooldowns.single = 1.75 + Math.random() * 0.5; // 1.75-2.25秒のランダム間隔
      }
    } else {
      // 鬼（従来のボスA）：単発弾攻撃
      if (this.attackCooldowns.single <= 0) {
        this.shootSingle();
        this.attackCooldowns.single = this.config.ATTACKS.SINGLE.COOLDOWN;
      }
      
      // 拡散弾攻撃（確率的）
      if (this.attackCooldowns.spread <= 0 && Math.random() < 0.3) {
        this.shootSpread();
        this.attackCooldowns.spread = this.config.ATTACKS.SPREAD.COOLDOWN;
      }
    }
  }

  private tryIntermediateAttacks(): void {
    if (this.type === 'A') {
      // 弁天：クナイ5-way攻撃（頻度上昇）
      if (this.attackCooldowns.single <= 0) {
        this.shootBentenKunai();
        this.attackCooldowns.single = 1.0; // 1.0秒間隔（頻度上昇）
      }
    } else if (this.type === 'B') {
      // 孤白：波弾攻撃（ランダム頻度上昇）
      if (this.attackCooldowns.single <= 0) {
        this.shootKohakuWave();
        this.attackCooldowns.single = 1.25 + Math.random() * 0.5; // 1.25-1.75秒のランダム間隔
      }
      
      // 孤白：追尾弾攻撃を追加
      if (this.attackCooldowns.homing <= 0) {
        this.shootHoming();
        this.attackCooldowns.homing = 2.0; // 2秒間隔で追尾弾（3秒から短縮）
      }
    } else {
      // 鬼（従来のボスC）：単発弾攻撃（頻度上昇）
      if (this.attackCooldowns.single <= 0) {
        this.shootSingle();
        this.attackCooldowns.single = this.config.ATTACKS.SINGLE.COOLDOWN * 0.7;
      }
      
      // 拡散弾攻撃（頻度上昇）
      if (this.attackCooldowns.spread <= 0) {
        this.shootSpread();
        this.attackCooldowns.spread = this.config.ATTACKS.SPREAD.COOLDOWN * 0.8;
      }
      
      // ホーミング弾攻撃（削除）
      // if (this.config.ATTACKS.HOMING && this.attackCooldowns.homing <= 0 && Math.random() < 0.4) {
      //   this.shootHoming();
      //   this.attackCooldowns.homing = this.config.ATTACKS.HOMING.COOLDOWN;
      // }
    }
  }


  private shootSingle(): void {
    const bullet = new Bullet(
      this.game,
      this.x,
      this.y + this.height / 2,
      Math.PI / 2, // 下方向
      this.config.ATTACKS.SINGLE.BULLET_SPEED,
      false, // 敵の弾
      `./src/assets/img/bullet/${this.config.BULLET_IMAGE}`
    );
    
    // 鬼（ボスC）の弾を大きくする
    if (this.type === 'C') {
      bullet.setSize(18, 18); // 12pxから18pxに変更
    }
    
    if (this.onBulletFired) {
      this.onBulletFired(bullet);
    }
    console.log(`Boss ${this.type} single shot fired`);
  }

  private shootSpread(): void {
    const spreadAngle = this.config.ATTACKS.SPREAD.ANGLE_SPREAD;
    const bulletCount = 3;
    
    for (let i = 0; i < bulletCount; i++) {
      const angle = Math.PI / 2 + (i - 1) * spreadAngle;
      
      const bullet = new Bullet(
        this.game,
        this.x,
        this.y + this.height / 2,
        angle,
        this.config.ATTACKS.SPREAD.BULLET_SPEED,
        false, // 敵の弾
        `./src/assets/img/bullet/${this.config.BULLET_IMAGE}`
      );
      
      // 鬼（ボスC）の弾を大きくする
      if (this.type === 'C') {
        bullet.setSize(18, 18); // 12pxから18pxに変更
      }
      
      if (this.onBulletFired) {
        this.onBulletFired(bullet);
      }
    }
    console.log(`Boss ${this.type} spread shot fired`);
  }
  
  private shootBentenKunai(): void {
    // 弁天：クナイ5-way攻撃 / 120px/秒
    const bulletCount = 5;
    const spreadAngle = Math.PI * 72 / 180; // 72度の範囲に5発
    
    for (let i = 0; i < bulletCount; i++) {
      const angle = Math.PI / 2 + (i - 2) * (spreadAngle / (bulletCount - 1));
      
      const bullet = new Bullet(
        this.game,
        this.x,
        this.y + this.height / 2,
        angle,
        120, // 120px/秒
        false,
        './src/assets/img/bullet/boss_A_bullet.png'
      );
      
      if (this.onBulletFired) {
        this.onBulletFired(bullet);
      }
    }
    console.log('Boss 弁天 kunai 5-way shot fired');
  }
  
  private shootKohakuWave(): void {
    // 孤白：波弾（下方向）/ 120px/秒
    const bullet = new Bullet(
      this.game,
      this.x,
      this.y + this.height / 2,
      Math.PI / 2, // 下方向
      120, // 120px/秒（さらにスピード低下）
      false,
      './src/assets/img/bullet/boss_B_bullet_01.png' // 波弾専用画像
    );
    
    // 波弾の特殊設定（サイン波軌道）
    bullet.setSinWaveMovement(true, 50, 0.03); // 振幅50（ふり幅をさらに広く）、周波数0.03
    
    if (this.onBulletFired) {
      this.onBulletFired(bullet);
    }
    console.log('Boss 孤白 wave shot fired');
  }

  private shootHoming(): void {
    if (!this.config.ATTACKS.HOMING) return;
    
    console.log('ボスB: 追尾弾を発射します');
    
    const bullet = new Bullet(
      this.game,
      this.x,
      this.y + this.height / 2,
      Math.PI / 2, // 初期は下方向
      this.config.ATTACKS.HOMING.BULLET_SPEED,
      false, // 敵の弾
      './src/assets/img/bullet/boss_B_bullet_02.png' // 追尾弾専用画像
    );
    
    // 鬼（ボスC）の弾を大きくする
    if (this.type === 'C') {
      bullet.setSize(18, 18); // 12pxから18pxに変更
    }
    
    // 追尾機能を有効化（プレイヤーインスタンスは弾発射時にGameSceneから設定される）
    // 追尾強度はSPREAD攻撃設定から取得（ボスBの場合）
    const homingStrength = this.config.ATTACKS.SPREAD.HOMING_STRENGTH || 0.2;
    const maxTurnRate = Math.PI * 3; // 1秒で540度回転可能（より機敏に）
    
    // プレイヤーインスタンスはGameSceneのaddEnemyBulletメソッドで設定される想定
    bullet.setHoming(true, null, homingStrength, maxTurnRate);
    
    console.log(`追尾弾設定: 強度=${homingStrength}, 最大旋回=${maxTurnRate}`);
    
    if (this.onBulletFired) {
      this.onBulletFired(bullet);
    }
    console.log(`Boss ${this.type} homing shot fired`);
  }

  private shootSpecial(): void {
    if (!this.config.ATTACKS.EXPLOSIVE) return;
    
    // Cタイプの特殊攻撃：円形弾幕
    const bulletCount = 8;
    const angleStep = (Math.PI * 2) / bulletCount;
    
    for (let i = 0; i < bulletCount; i++) {
      const angle = i * angleStep;
      
      const bullet = new Bullet(
        this.game,
        this.x,
        this.y,
        angle,
        this.config.ATTACKS.EXPLOSIVE.BULLET_SPEED,
        false, // 敵の弾
        `./src/assets/img/bullet/${this.config.BULLET_IMAGE}`
      );
      
      // 鬼（ボスC）の弾を大きくする
      if (this.type === 'C') {
        bullet.setSize(18, 18); // 12pxから18pxに変更
      }
      
      if (this.onBulletFired) {
        this.onBulletFired(bullet);
      }
    }
    
    console.log(`Boss ${this.type} special attack fired`);
  }

  private updateDamageFlash(deltaTime: number): void {
    if (this.damageFlashTimer > 0) {
      this.damageFlashTimer -= deltaTime;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;
    
    ctx.save();
    
    // ダメージフラッシュ
    if (this.damageFlashTimer > 0) {
      ctx.filter = 'brightness(2) saturate(2)';
    }
    
    if (this.image.complete) {
      ctx.drawImage(
        this.image,
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
      );
    } else {
      // フォールバック：矩形描画
      ctx.fillStyle = this.getBossColor();
      ctx.fillRect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
      );
    }
    
    // HPバー描画
    this.renderHealthBar(ctx);
    
    ctx.restore();
  }

  private getBossColor(): string {
    switch (this.type) {
      case 'A': return '#FF0000'; // 赤
      case 'B': return '#FF8000'; // オレンジ
      case 'C': return '#800080'; // 紫
      default: return '#FF0000';
    }
  }

  private renderHealthBar(ctx: CanvasRenderingContext2D): void {
    const barWidth = 100;
    const barHeight = 8;
    const barX = this.x - barWidth / 2;
    const barY = this.y - this.height / 2 - 15;
    
    // HPバー背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
    
    // HPバー
    const healthRatio = this.health / this.maxHealth;
    const healthColor = healthRatio > 0.5 ? '#00FF00' : healthRatio > 0.25 ? '#FFFF00' : '#FF0000';
    
    ctx.fillStyle = healthColor;
    ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);
    
    // HPバー枠
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }

  // ダメージを受ける
  takeDamage(amount: number): boolean {
    this.health -= amount;
    this.damageFlashTimer = this.damageFlashDuration;
    
    console.log(`Boss ${this.type} took ${amount} damage, HP: ${this.health}/${this.maxHealth}`);
    
    if (this.health <= 0) {
      this.isActive = false;
      console.log(`Boss ${this.type} defeated!`);
      return true; // ボスが倒れた
    }
    
    return false;
  }

  // ゲッター
  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getPoints(): number {
    return this.points;
  }

  getType(): string {
    return this.type;
  }

  getStage(): number {
    return this.stage;
  }

  // コールバック設定
  setBulletFiredCallback(callback: (bullet: Bullet) => void): void {
    this.onBulletFired = callback;
  }
}