/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.0
 * SPDX-License-Identifier: MIT
 */

import { EnemyBullet } from './enemyBullet.js';
import { GameConfig } from '../config/gameConfig.js';

export class Enemy {
  constructor(game, x, y, type = 'A') {
    this.game = game;
    this.x = x;
    this.y = y;
    this.type = type;
    this.config = GameConfig.ENEMY[type];
    
    this.width = this.config.SIZE.WIDTH;
    this.height = this.config.SIZE.HEIGHT;
    this.health = this.config.HEALTH;
    this.points = this.config.POINTS;
    this.isActive = true;
    
    // 移動パターン
    this.speed = this.config.SPEED;
    this.direction = 1; // 1: 右, -1: 左
    this.dropDistance = this.config.DROP_DISTANCE;
    this.moveDelay = 0; // 移動遅延（ランダム化用）
    this.edgeMargin = this.config.EDGE_MARGIN;
    
    // 攻撃パターン
    this.canShoot = true;
    this.shootProbability = this.config.SHOOT_PROBABILITY;
    this.shootCooldown = this.config.SHOOT_COOLDOWN;
    this.shootTimer = 0;
    
    // 画像の読み込み
    this.image = new Image();
    this.image.onload = () => {
      console.log('敵画像の読み込みに成功しました');
    };
    this.image.onerror = () => {
      console.error('敵画像の読み込みに失敗しました');
    };
    this.image.src = `./src/assets/img/enemy/${this.config.IMAGE}`;
    
    // アニメーション関連
    this.currentFrame = 0;
    this.totalFrames = 2;
    this.animationSpeed = 0.5; // アニメーション速度（秒）
    this.animationTimer = 0;
  }
  
  // 更新処理
  update(deltaTime) {
    // 敵のY座標が異常に大きい場合は警告を出す
    if (this.y > 1000) {
      console.error('警告: 敵のY座標が異常に大きい値です:', this.y);
      // 安全な値にリセット
      this.y = 100;
      return;
    }
    
    // 移動遅延がある場合は減少
    if (this.moveDelay > 0) {
      this.moveDelay -= deltaTime;
      return;
    }
    
    // 前の位置を保存（FormationSystemで使用される可能性のため保持）
    const _prevX = this.x;
    const _prevY = this.y;
    
    // 移動制御はFormationSystemに一元化されているため、個別の移動処理は無効化
    
    // 発射クールダウンの更新
    if (!this.canShoot) {
      this.shootTimer += deltaTime;
      if (this.shootTimer >= this.shootCooldown) {
        this.canShoot = true;
        this.shootTimer = 0;
      }
    }
    
    // ランダムに弾を発射
    if (this.canShoot && Math.random() < this.shootProbability) {
      this.shoot();
    }
    
    // アニメーション更新
    this.animationTimer += deltaTime;
    if (this.animationTimer >= this.animationSpeed) {
      this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
      this.animationTimer = 0;
    }
  }
  
  // 描画処理
  render(ctx) {
    // 敵の描画
    ctx.drawImage(
      this.image,
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
  }
  
  // 方向転換と下降
  changeDirectionAndDrop() {
    this.direction *= -1;
    
    // 方向転換時に確率的に下降するように調整
    if (Math.random() < 0.7) { // 70%の確率で下降
      // 下降距離を少し減らす
      const actualDropDistance = this.dropDistance * 0.7;
      this.y += actualDropDistance;
    } else {
    }
    
    // 移動遅延を少し長くして方向転換の頻度を減らす
    this.moveDelay = 0.1 + Math.random() * 0.2; // 0.1秒から0.3秒の遅延
  }
  
  // 弾の発射
  shoot() {
    if (!this.canShoot) return;
    
    // 弾の生成
    const bullet = new EnemyBullet(
      this.game,
      this.x,
      this.y + this.height / 2,
      Math.PI / 2, // 下方向
      this.config.BULLET_SPEED
    );
    
    // 現在のゲーム画面に弾を追加
    const gameScreen = this.game.screens['game'];
    if (gameScreen) {
      gameScreen.addEnemyBullet(bullet);
    }
    
    // クールダウン設定
    this.canShoot = false;
    this.shootTimer = 0;
  }
  
  // ダメージを受ける
  takeDamage(amount) {
    this.health -= amount;
    
    if (this.health <= 0) {
      this.isActive = false;
      return true; // 敵が倒れた
    }
    
    return false;
  }
}
