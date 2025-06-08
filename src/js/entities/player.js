/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.2
 * SPDX-License-Identifier: MIT
 */

import { Bullet } from './bullet.js';
import { SpecialBullet } from './specialBullet.js';

export class Player {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = 64;
    this.height = 96;
    this.speed = 200; // 1秒あたりの移動ピクセル数
    this.isActive = true; // プレイヤーがアクティブかどうか
    
    // 弾の発射関連
    this.canShoot = true;
    this.shootCooldown = 0.3; // 発射クールダウン（秒）
    this.shootTimer = 0;
    
    // 必殺技関連
    this.isCharging = false;
    this.chargeTime = 0;
    this.requiredChargeTime = 3000; // 必要なチャージ時間（ミリ秒）
    this.specialReady = false;
    
    // 画像の読み込み
    this.image = new Image();
    
    // 画像読み込みエラーのデバッグ
    this.image.onerror = () => {
      console.error('プレイヤー画像の読み込みに失敗しました:', '/src/assets/img/player/player_A.png');
    };
    
    this.image.onload = () => {
      console.log('プレイヤー画像の読み込みに成功しました');
    };
    
    // Vite開発サーバーでは相対パスを使用
    this.image.src = './src/assets/img/player/player_A.png';
    
    // スプライトシートの設定
    this.frameWidth = 256; // スプライトシートの1フレームの幅
    this.frameHeight = 384; // スプライトシートの1フレームの高さ
    this.currentFrame = 0; // 現在のフレーム
    this.direction = 1; // 0: 前向き, 1: 後ろ向き（背面・通常時）, 2: 左向き, 3: 右向き
    
    // アニメーション関連
    this.animationSpeed = 0.1; // アニメーション速度（秒）
    this.animationTimer = 0;
    this.totalFrames = 4; // 各方向のフレーム数
    
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
    
    // 常に背面を維持（移動中も）
    this.direction = 1; // 背面（常時）
    
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
    
    // 必殺技のチャージ処理
    if (inputManager.isKeyDown(' ')) {
      const pressedTime = inputManager.getKeyPressedTime(' ');
      
      if (pressedTime > 0) {
        if (!this.isCharging) {
          this.isCharging = true;
          this.chargeTime = 0;
          // チャージ開始音
          this.game.audioManager.play('specialCharge', 0.5);
        }
        
        this.chargeTime = pressedTime;
        
        // チャージ完了判定
        if (this.chargeTime >= this.requiredChargeTime && !this.specialReady) {
          this.specialReady = true;
          // チャージ完了音
          this.game.audioManager.play('specialCharge', 1.0);
        }
      }
    } else {
      // ボタンを離した時の処理
      if (this.isCharging) {
        this.isCharging = false;
        
        if (this.specialReady) {
          // 必殺技の発射
          this.shootSpecial();
          this.specialReady = false;
        } else if (this.canShoot) {
          // 通常弾の発射
          this.shoot();
        }
        
        this.chargeTime = 0;
      } else if (inputManager.isKeyDown(' ') && this.canShoot) {
        // 通常の発射
        this.shoot();
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
      
      // ジャンプ中も背面を維持
      this.direction = 1; // 背面（常時）
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
    // プレイヤーが非アクティブなら描画しない
    if (!this.isActive) return;
    
    // スプライトシートから適切なフレームを描画
    const sx = this.currentFrame * this.frameWidth;
    const sy = this.direction * this.frameHeight;
    
    // 描画（中心を基準に）
    ctx.drawImage(
      this.image,
      sx, sy, this.frameWidth, this.frameHeight,
      this.x - this.width / 2, this.y - this.height / 2, this.width, this.height
    );
    
    // チャージバーの表示（チャージ中のみ）
    if (this.isCharging) {
      const chargePercent = Math.min(this.chargeTime / this.requiredChargeTime, 1);
      const barWidth = 50;
      const barHeight = 5;
      
      // 背景
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(this.x - barWidth / 2, this.y + this.height / 2 + 10, barWidth, barHeight);
      
      // チャージ量
      ctx.fillStyle = this.specialReady ? '#ffcc00' : '#ffffff';
      ctx.fillRect(this.x - barWidth / 2, this.y + this.height / 2 + 10, barWidth * chargePercent, barHeight);
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
    // 特殊弾の生成
    const specialBullet = new SpecialBullet(
      this.game,
      this.x,
      this.y - this.height / 2,
      -Math.PI/2, // 上方向をラジアンで指定 (-90度 = -π/2)
      800 // 速度（通常の2倍、正の値）
    );
    
    // 現在のゲーム画面に特殊弾を追加
    const gameScreen = this.game.screens['game'];
    if (gameScreen) {
      gameScreen.addBullet(specialBullet);
    }
    
    // 必殺技発射音の再生
    this.game.audioManager.play('specialShoot', 0.8);
    
    // クールダウン設定
    this.canShoot = false;
    this.shootTimer = 0;
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
    this.direction = 1; // 背面を維持
  }
}
