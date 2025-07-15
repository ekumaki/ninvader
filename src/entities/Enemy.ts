/**
 * CNP インベーダー - 敵エンティティ（TypeScript版）
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

import { BaseEntity } from './BaseEntity';
import { Bullet } from './Bullet';
import type { GameEngine } from '../core/GameEngine';
import type { EnemyConfig } from '../core/config';

export class Enemy extends BaseEntity {
  private game: GameEngine;
  private config: EnemyConfig;
  private type: 'A' | 'B' | 'C';
  
  // コールバック
  private onBulletFired?: (bullet: any) => void;
  
  // 敵状態
  private health: number;
  private points: number;
  private stage: number; // ステージ番号（色変更用）
  
  // 移動パターン
  private speed: number;
  private direction = 1; // 1: 右, -1: 左
  private dropDistance: number;
  private moveDelay = 0; // 移動遅延（ランダム化用）
  private edgeMargin: number;
  
  // 攻撃パターン
  private canShoot = true;
  private shootProbability: number;
  private shootCooldown: number;
  private shootTimer = 0;
  
  // 敵の総数による強化状態
  private enemyCountBoost = false;
  
  // アニメーション
  private currentFrame = 0;
  private totalFrames = 2;
  private animationSpeed = 0.5; // 秒
  private animationTimer = 0;
  
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
    const enemyConfig = gameConfig.ENEMY[type];
    
    super(x, y, enemyConfig.SIZE.WIDTH, enemyConfig.SIZE.HEIGHT);
    
    this.game = game;
    this.type = type;
    this.config = enemyConfig;
    this.stage = stage;
    
    // 敵状態初期化
    this.health = this.getStageAdjustedHealth();
    this.points = this.config.POINTS;
    
    // 移動パターン初期化
    this.speed = this.config.SPEED;
    this.dropDistance = this.config.DROP_DISTANCE;
    this.edgeMargin = this.config.EDGE_MARGIN;
    
    // 攻撃パターン初期化
    this.shootProbability = this.getStageAdjustedShootProbability();
    this.shootCooldown = this.getStageAdjustedShootCooldown();
    
    // 画像読み込み
    this.image = new Image();
    this.loadImage();
  }

  private getStageAdjustedHealth(): number {
    // ステージに応じてHP調整
    switch (this.stage) {
      case 1: return this.config.HEALTH;
      case 2: return this.config.HEALTH + 1;
      case 3: return this.config.HEALTH + 2;
      default: return this.config.HEALTH;
    }
  }

  private getStageAdjustedShootProbability(): number {
    // ステージに応じて射撃確率調整
    const stageMultiplier = 1 + (this.stage - 1) * 0.5; // ステージ2で1.5倍、ステージ3で2倍
    return this.config.SHOOT_PROBABILITY * stageMultiplier;
  }

  private getStageAdjustedShootCooldown(): number {
    // ステージに応じて射撃間隔調整
    const stageReduction = (this.stage - 1) * 0.3; // ステージごとに0.3秒短縮
    return Math.max(0.5, this.config.SHOOT_COOLDOWN - stageReduction);
  }
  
  // 敵の総数を更新して強化状態を設定
  updateEnemyCount(totalEnemies: number): void {
    const wasBoostActive = this.enemyCountBoost;
    this.enemyCountBoost = totalEnemies <= 20;
    
    // 強化状態が変わった場合はログ出力
    if (wasBoostActive !== this.enemyCountBoost) {
      console.log(`Enemy boost ${this.enemyCountBoost ? 'activated' : 'deactivated'} (enemies: ${totalEnemies})`);
    }
  }
  
  // 強化状態を考慮した発射確率を取得
  private getEffectiveShootProbability(): number {
    const baseProb = this.getStageAdjustedShootProbability();
    return this.enemyCountBoost ? baseProb * 2 : baseProb;
  }
  


  private loadImage(): void {
    this.image.onload = () => {
      // Enemy image loaded
    };
    
    this.image.onerror = () => {
      console.error(`敵${this.type}画像の読み込みに失敗しました:`, this.config.IMAGE);
    };
    
    this.image.src = `./src/assets/img/enemy/${this.config.IMAGE}`;
  }

  update(deltaTime: number): void {
    if (!this.isActive) return;

    // 敵のY座標が異常に大きい場合は修正
    if (this.y > 1000) {
      this.y = 100;
      return;
    }
    
    // 移動遅延がある場合は減少
    if (this.moveDelay > 0) {
      this.moveDelay -= deltaTime;
      return;
    }
    
    // 移動制御はFormationSystemに一元化されているため、個別の移動処理は無効化
    
    // 発射クールダウンの更新
    this.updateShooting(deltaTime);
    
    // アニメーション更新
    this.updateAnimation(deltaTime);
  }

  private updateShooting(deltaTime: number): void {
    if (!this.canShoot) {
      this.shootTimer += deltaTime;
      if (this.shootTimer >= this.shootCooldown) {
        this.canShoot = true;
        this.shootTimer = 0;
      }
    }
    
    // ランダムに弾を発射
    if (this.canShoot && Math.random() < this.getEffectiveShootProbability()) {
      this.shoot();
    }
  }

  private updateAnimation(deltaTime: number): void {
    this.animationTimer += deltaTime;
    if (this.animationTimer >= this.animationSpeed) {
      this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
      this.animationTimer = 0;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;
    
    ctx.save();
    
    // ステージに応じた色調整
    this.applyStageColorFilter(ctx);
    
    if (this.image.complete && this.image.naturalWidth > 0) {
      // 画像が正常に読み込まれている場合
      try {
        ctx.drawImage(
          this.image,
          this.x - this.width / 2,
          this.y - this.height / 2,
          this.width,
          this.height
        );
      } catch (error) {
        // 描画エラーの場合はフォールバック
        this.drawFallbackEnemy(ctx);
      }
    } else {
      // フォールバック：矩形描画
      this.drawFallbackEnemy(ctx);
    }
    
    ctx.restore();
  }

  private applyStageColorFilter(ctx: CanvasRenderingContext2D): void {
    // ステージに応じた色フィルター
    switch (this.stage) {
      case 1:
        // 緑 - フィルターなし
        break;
      case 2:
        // 紫
        ctx.filter = 'hue-rotate(120deg) saturate(1.2)';
        break;
      case 3:
        // オレンジ
        ctx.filter = 'hue-rotate(30deg) saturate(1.5) brightness(1.1)';
        break;
    }
  }

  private getStageColor(): string {
    // フォールバック用の色
    switch (this.stage) {
      case 1: return '#00FF00'; // 緑
      case 2: return '#8000FF'; // 紫
      case 3: return '#FF8000'; // オレンジ
      default: return '#00FF00';
    }
  }

  private drawFallbackEnemy(ctx: CanvasRenderingContext2D): void {
    // 矩形の敵を描画
    ctx.fillStyle = this.getStageColor();
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
    
    // タイプを文字で表示
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      this.type,
      this.x,
      this.y + 4
    );
  }

  // 方向転換と下降
  changeDirectionAndDrop(): void {
    this.direction *= -1;
    
    // 方向転換時に確率的に下降するように調整
    if (Math.random() < 0.7) { // 70%の確率で下降
      const actualDropDistance = this.dropDistance * 0.7;
      this.y += actualDropDistance;
    }
    
    // 移動遅延を少し長くして方向転換の頻度を減らす
    this.moveDelay = 0.1 + Math.random() * 0.2; // 0.1秒から0.3秒の遅延
  }

  private shoot(): void {
    if (!this.canShoot) return;
    
    // 敵の弾を生成（レーザー型）
    const bullet = new Bullet(
      this.game,
      this.x,
      this.y + this.height / 2,
      Math.PI / 2, // 下方向
      150, // 敵弾の速度
      false, // プレイヤーの弾ではない
      './src/assets/img/bullet/enemy_rock.png'
    );
    
    // レーザーサイズに設定（縦長）
    bullet.setSize(6, 20);
    bullet.setEnemyLaser(true);
    
    // GameSceneに弾を追加（コールバック経由）
    if (this.onBulletFired) {
      this.onBulletFired(bullet);
    }
    
    // クールダウン設定
    this.canShoot = false;
    this.shootTimer = 0;
  }

  // ダメージを受ける
  takeDamage(amount: number): boolean {
    this.health -= amount;
    
    if (this.health <= 0) {
      this.isActive = false;
      return true; // 敵が倒れた
    }
    
    return false;
  }

  // ゲッター
  getHealth(): number {
    return this.health;
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

  getDirection(): number {
    return this.direction;
  }

  setDirection(direction: number): void {
    this.direction = direction;
  }

  // コールバック設定
  setBulletFiredCallback(callback: (bullet: any) => void): void {
    this.onBulletFired = callback;
  }
}