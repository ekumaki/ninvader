/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.0
 * SPDX-License-Identifier: MIT
 */

import { EnemyBullet } from './enemyBullet.js';

export class Enemy {
  constructor(game, x, y, type = 'normal') {
    this.game = game;
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 48;
    this.height = 48;
    this.health = 1;
    this.points = 100; // 倒した時の得点
    this.isActive = true;
    
    // 移動パターン
    this.speed = 50; // 基本速度
    this.direction = 1; // 1: 右, -1: 左
    this.dropDistance = 20; // 下に降りる距離
    this.moveDelay = 0; // 移動遅延（ランダム化用）
    
    // 攻撃パターン
    this.canShoot = true;
    this.shootProbability = 0.001; // 1フレームあたりの発射確率
    this.shootCooldown = 2; // 発射クールダウン（秒）
    this.shootTimer = 0;
    
    // 画像の読み込み
    this.image = new Image();
    this.image.src = '/src/assets/img/enemy/enemy_01.png';
    
    // アニメーション関連
    this.currentFrame = 0;
    this.totalFrames = 2;
    this.animationSpeed = 0.5; // アニメーション速度（秒）
    this.animationTimer = 0;
  }
  
  // 更新処理
  update(deltaTime) {
    // 移動遅延がある場合は減少
    if (this.moveDelay > 0) {
      this.moveDelay -= deltaTime;
      return;
    }
    
    // 移動
    this.x += this.direction * this.speed * deltaTime;
    
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
    this.y += this.dropDistance;
    
    // 移動遅延をランダムに設定（隊列の動きをずらす）
    this.moveDelay = Math.random() * 0.2;
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
      200 // 速度
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
