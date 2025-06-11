/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.2.6
 * SPDX-License-Identifier: MIT
 */

import { Bullet } from './bullet.js';
import { SpecialBullet } from './specialBullet.js';

export class Player {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = 48;
    this.height = 72;
    this.speed = 200; // 1秒あたりの移動ピクセル数
    this.isActive = true; // プレイヤーがアクティブかどうか
    this.health = 1; // プレイヤーのHP（一撃死仕様）
    
    // 弾の発射関連
    this.canShoot = true;
    this.shootCooldown = 0.3; // 発射クールダウン（秒）
    this.shootTimer = 0;
    
    // 必殺技発射システム
    this.isCharging = false;
    this.chargeTime = 0;
    this.specialChargeTime = 1.0; // 必殺技に必要なチャージ時間（秒）
    this.specialReady = false;
    
    // 画像の読み込み（背面向き専用画像）
    this.image = new Image();
    
    // 画像読み込みエラーのデバッグ
    this.image.onerror = () => {
      console.error('プレイヤー画像の読み込みに失敗しました:', 'player_A_back.png');
    };
    
    this.image.onload = () => {
      console.log('プレイヤー背面向き画像の読み込みに成功しました');
    };
    
    // 背面向き画像を読み込み
    this.image.src = './src/assets/img/player/player_A_back.png';
    
    // ゲームクリア時のジャンプアニメーション
    this.isJumping = false;
    this.jumpTimer = 0;
    this.jumpDuration = 0.5; // ジャンプの継続時間（秒）
    this.jumpHeight = 30; // ジャンプの高さ（ピクセル）
    this.originalY = y; // 元のY座標
  }
  
  // 更新処理
  update(deltaTime) {
    const inputManager = this.game.inputManager;
    
    // 移動処理
    let dx = 0;
    
    if (inputManager.isKeyDown('ArrowLeft')) {
      dx -= this.speed * deltaTime;
    }
    
    if (inputManager.isKeyDown('ArrowRight')) {
      dx += this.speed * deltaTime;
    }
    
    // 位置の更新（画面外に出ないように制限）
    this.x = Math.max(this.width / 2, Math.min(this.game.canvas.width - this.width / 2, this.x + dx));
    
    // 発射クールダウンの更新
    if (!this.canShoot) {
      this.shootTimer += deltaTime;
      if (this.shootTimer >= this.shootCooldown) {
        this.canShoot = true;
        this.shootTimer = 0;
      }
    }
    
    // 必殺技チャージシステム
    if (inputManager.isKeyDown(' ')) {
      if (!this.isCharging) {
        this.isCharging = true;
        this.chargeTime = 0;
      }
      
      this.chargeTime += deltaTime;
      
      // 必殺技チャージ完了判定
      if (this.chargeTime >= this.specialChargeTime && !this.specialReady) {
        this.specialReady = true;
        // チャージ完了音（あれば）
        // this.game.audioManager.play('specialCharge', 1.0);
      }
    } else {
      // スペースキーを離した時の処理
      if (this.isCharging) {
        this.isCharging = false;
        
        if (this.specialReady && this.canShoot) {
          // 必殺技発射
          this.shootSpecial();
          this.specialReady = false;
        } else if (this.canShoot) {
          // 通常弾発射
          this.shoot();
        }
        
        this.chargeTime = 0;
      }
    }
    
    // ジャンプアニメーション更新
    if (this.isJumping) {
      this.jumpTimer += deltaTime;
      
      if (this.jumpTimer >= this.jumpDuration) {
        // ジャンプ終了
        this.jumpTimer = 0;
      }
      
      // ジャンプの高さ計算（サイン波を使って滑らかに）
      const jumpProgress = (this.jumpTimer / this.jumpDuration) * Math.PI;
      this.y = this.originalY - Math.sin(jumpProgress) * this.jumpHeight;
    }
  }
  
  // 描画処理
  render(ctx) {
    // プレイヤーが非アクティブなら描画しない
    if (!this.isActive) return;
    
    // 背面向き画像をシンプルに描画
    ctx.drawImage(
      this.image,
      this.x - this.width / 2, 
      this.y - this.height / 2, 
      this.width, 
      this.height
    );
    
    // チャージバーの表示
    if (this.isCharging) {
      const chargePercent = Math.min(this.chargeTime / this.specialChargeTime, 1);
      const barWidth = 60;
      const barHeight = 6;
      const barX = this.x - barWidth / 2;
      const barY = this.y + this.height / 2 + 15;
      
      // 背景
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // チャージ量
      if (this.specialReady) {
        // 必殺技準備完了時はキラキラエフェクト
        ctx.fillStyle = '#ffcc00';
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 10;
      } else {
        // チャージ中は青色
        ctx.fillStyle = '#4fc3f7';
      }
      
      ctx.fillRect(barX, barY, barWidth * chargePercent, barHeight);
      
      // 影をリセット
      ctx.shadowBlur = 0;
      
      // 必殺技準備完了時のテキスト表示
      if (this.specialReady) {
        ctx.save();
        ctx.fillStyle = '#ffcc00';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('必殺技準備完了!', this.x, barY - 5);
        ctx.restore();
      }
    }
  }
  
  // 通常弾の発射
  shoot() {
    if (!this.canShoot) return;
    
    // 弾の生成
    const bullet = new Bullet(
      this.game,
      this.x,
      this.y - this.height / 2,
      -Math.PI/2, // 上方向をラジアンで指定 (-90度 = -π/2)
      400 // 速度（正の値）
    );
    
    // 現在のゲーム画面に弾を追加
    const gameScreen = this.game.screens['game'];
    if (gameScreen) {
      gameScreen.addBullet(bullet);
    }
    
    // 発射音の再生
    this.game.audioManager.play('shoot', 0.5);
    
    // クールダウン設定
    this.canShoot = false;
    this.shootTimer = 0;
  }
  
  // 必殺技の発射
  shootSpecial() {
    if (!this.canShoot) return;
    
    // 必殺技弾の生成
    const specialBullet = new SpecialBullet(
      this.game,
      this.x,
      this.y - this.height / 2,
      -Math.PI/2, // 上方向をラジアンで指定 (-90度 = -π/2)
      600 // 速度（通常より速い）
    );
    
    // 現在のゲーム画面に必殺技弾を追加
    const gameScreen = this.game.screens['game'];
    if (gameScreen) {
      gameScreen.addBullet(specialBullet);
    }
    
    // 必殺技発射音の再生
    this.game.audioManager.play('shoot', 0.8); // 一時的に通常音を使用
    
    // クールダウン設定（必殺技は少し長め）
    this.canShoot = false;
    this.shootTimer = 0;
    this.shootCooldown = 0.5; // 通常より長いクールダウン
    
    // 次回は通常のクールダウンに戻す
    setTimeout(() => {
      if (this.canShoot) {
        this.shootCooldown = 0.3;
      }
    }, 500);
  }
  
  // ゲームクリア時のジャンプ開始
  startJump() {
    this.isJumping = true;
    this.jumpTimer = 0;
    this.originalY = this.y;
  }
  
  // ジャンプ停止
  stopJump() {
    this.isJumping = false;
    this.y = this.originalY;
  }
  
  // ダメージを受ける
  takeDamage(amount) {
    this.health -= amount;
    
    if (this.health <= 0) {
      this.isActive = false;
      return true; // プレイヤーが死亡した
    }
    
    return false;
  }
} 