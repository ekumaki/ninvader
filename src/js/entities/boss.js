/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.0
 * SPDX-License-Identifier: MIT
 */

import { EnemyBullet } from './enemyBullet.js';

export class Boss {
  constructor(game, stage = 1) {
    this.game = game;
    this.stage = stage;
    this.x = game.canvas.width / 2;
    this.y = game.canvas.height * 0.2;
    this.width = 128;
    this.height = 128;
    this.speed = 50; // 基本速度
    this.direction = 1; // 1: 右, -1: 左
    this.health = 30; // HP
    this.maxHealth = 30;
    this.points = 1000; // 倒した時の得点
    this.isActive = true;
    
    // 攻撃パターン
    this.attackPatterns = [
      { name: 'single', cooldown: 1.5, timer: 0 },
      { name: 'spread', cooldown: 4, timer: 2 }
    ];
    
    // 画像の読み込み
    this.image = new Image();
    this.image.onload = () => {
      console.log('ボス画像の読み込みに成功しました');
    };
    this.image.onerror = () => {
      console.error('ボス画像の読み込みに失敗しました');
    };
    this.image.src = './src/assets/img/boss/boss_stage1.png';
    
    // 岩弾の画像
    this.rockBulletImage = new Image();
    this.rockBulletImage.onload = () => {
      console.log('ボス弾画像の読み込みに成功しました');
    };
    this.rockBulletImage.onerror = () => {
      console.error('ボス弾画像の読み込みに失敗しました');
    };
    this.rockBulletImage.src = './src/assets/img/bullet/enemy_rock.png';
    
    // アニメーション関連
    this.currentFrame = 0;
    this.totalFrames = 2;
    this.animationSpeed = 0.3; // アニメーション速度（秒）
    this.animationTimer = 0;
    
    // 登場演出用
    this.isEntering = true;
    this.entryY = -this.height;
    this.targetY = this.y;
    this.entrySpeed = 50;
  }
  
  // 更新処理
  update(deltaTime) {
    // 登場演出中
    if (this.isEntering) {
      this.y += this.entrySpeed * deltaTime;
      if (this.y >= this.targetY) {
        this.y = this.targetY;
        this.isEntering = false;
      }
      return;
    }
    
    // 移動
    this.x += this.direction * this.speed * deltaTime;
    
    // 画面端に到達したら方向転換
    if (
      (this.direction > 0 && this.x > this.game.canvas.width - this.width / 2) ||
      (this.direction < 0 && this.x < this.width / 2)
    ) {
      this.direction *= -1;
    }
    
    // 攻撃パターンの更新
    for (const pattern of this.attackPatterns) {
      pattern.timer += deltaTime;
      if (pattern.timer >= pattern.cooldown) {
        this.attack(pattern.name);
        pattern.timer = 0;
      }
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
    // ボスの描画
    ctx.drawImage(
      this.image,
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
    
    // HPバーの描画
    const barWidth = 100;
    const barHeight = 10;
    const barX = this.x - barWidth / 2;
    const barY = this.y - this.height / 2 - 20;
    
    // HPバー背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // HPバー
    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.2 ? '#ffff00' : '#ff0000';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
  }
  
  // 攻撃パターン
  attack(patternName) {
    const gameScreen = this.game.screens['game'];
    if (!gameScreen) return;
    
    switch (patternName) {
      case 'single':
        // 単発の岩弾
        this.shootRockBullet(this.x, this.y + this.height / 2);
        break;
        
      case 'spread':
        // 扇状に3発の岩弾
        this.shootRockBullet(this.x, this.y + this.height / 2, Math.PI / 2 - 0.3);
        this.shootRockBullet(this.x, this.y + this.height / 2, Math.PI / 2);
        this.shootRockBullet(this.x, this.y + this.height / 2, Math.PI / 2 + 0.3);
        break;
    }
  }
  
  // 岩弾の発射
  shootRockBullet(x, y, angle = Math.PI / 2) {
    // 弾の生成
    const bullet = new EnemyBullet(
      this.game,
      x,
      y,
      angle,
      150 // 速度
    );
    
    // 岩弾の特性
    bullet.width = 16;
    bullet.height = 16;
    bullet.color = null; // 色を使わない
    bullet.image = this.rockBulletImage; // 画像を使用
    
    // 現在のゲーム画面に弾を追加
    const gameScreen = this.game.screens['game'];
    if (gameScreen) {
      gameScreen.addEnemyBullet(bullet);
    }
  }
  
  // ダメージを受ける
  takeDamage(amount) {
    this.health -= amount;
    // ダメージエフェクト（点滅など）を追加できる
    if (this.game.audioManager) {
      this.game.audioManager.play('bossDamage');
    }
    if (this.health <= 0) {
      this.isActive = false;
      if (this.game.audioManager) {
        this.game.audioManager.play('bossDestroyed');
      }
      return true; // ボスが倒れた
    }
    return false;
  }
}
