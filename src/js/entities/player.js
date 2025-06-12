/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.2.6
 * SPDX-License-Identifier: MIT
 */

import { Bullet } from './bullet.js';
import { SpecialBullet } from './specialBullet.js';
import { GameConfig } from '../config/gameConfig.js';

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
    
    // 必殺技残弾数
    this.specialUses = GameConfig.PLAYER.MAX_SPECIAL_USES;
    
    // スペースキー押下状態の前フレーム記憶
    this.spacePrevDown = false;
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
    const spaceDown = inputManager.isKeyDown(' ');
    
    if (spaceDown) {
      if (this.specialUses > 0) {
        // ---- チャージ処理 ----
        if (!this.isCharging) {
          this.isCharging = true;
          this.chargeTime = 0;
        }
        this.chargeTime += deltaTime;
        if (this.chargeTime >= this.specialChargeTime && !this.specialReady) {
          this.specialReady = true;
        }
      } else {
        // 残弾0: すぐ通常弾発射（押し続けても1回だけ）
        if (!this.spacePrevDown && this.canShoot) {
          this.shoot();
        }
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
    
    // スペースキー状態を保存
    this.spacePrevDown = spaceDown;
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
    
    // 必殺技チャージゲージを常時表示
    this.renderSpecialGauge(ctx);
  }
  
  // 必殺技チャージゲージの描画
  renderSpecialGauge(ctx) {
    const chargePercent = (this.specialUses > 0 && this.isCharging) ? Math.min(this.chargeTime / this.specialChargeTime, 1) : 0;
    const gaugeWidth = 50;
    const gaugeHeight = 5;
    const gaugeX = this.x - gaugeWidth / 2;
    const gaugeY = this.y + this.height / 2 + 6;
    
    ctx.save();
    
    // ゲージ外枠（残弾0の場合は破線）
    ctx.strokeStyle = this.specialUses === 0 ? '#ff4444' : 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;
    if (this.specialUses === 0) {
      ctx.setLineDash([4, 2]);
    }
    ctx.strokeRect(gaugeX - 1, gaugeY - 1, gaugeWidth + 2, gaugeHeight + 2);
    ctx.setLineDash([]);
    
    // ゲージ背景
    ctx.fillStyle = this.specialUses === 0 ? 'rgba(50,50,50,0.6)' : 'rgba(0,0,0,0.6)';
    ctx.fillRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight);
    
    // チャージ量表示
    if (chargePercent > 0 && this.specialUses > 0) {
      if (this.specialReady) {
        // 必殺技準備完了時のエフェクト
        const pulseIntensity = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        
        // 発光エフェクト
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 15 * pulseIntensity;
        
        // グラデーション作成
        const gradient = ctx.createLinearGradient(gaugeX, gaugeY, gaugeX, gaugeY + gaugeHeight);
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(0.5, '#ffcc00');
        gradient.addColorStop(1, '#ff9900');
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = pulseIntensity;
        ctx.fillRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight);
        
        // 内側の白いハイライト
        ctx.globalAlpha = 0.8 * pulseIntensity;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(gaugeX + 1, gaugeY + 1, gaugeWidth - 2, 1);
        
      } else {
        // チャージ中のエフェクト
        const fillWidth = gaugeWidth * chargePercent;
        
        // グラデーション作成
        const gradient = ctx.createLinearGradient(gaugeX, gaugeY, gaugeX, gaugeY + gaugeHeight);
        gradient.addColorStop(0, '#4fc3f7');
        gradient.addColorStop(0.5, '#29b6f6');
        gradient.addColorStop(1, '#0288d1');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(gaugeX, gaugeY, fillWidth, gaugeHeight);
        
        // チャージ進行の光るエフェクト
        if (chargePercent > 0.1) {
          ctx.shadowColor = '#4fc3f7';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#87ceeb';
          ctx.fillRect(gaugeX + fillWidth - 3, gaugeY, 3, gaugeHeight);
        }
      }
    }
    
    ctx.restore();
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
    if (!this.canShoot || this.specialUses <= 0) return;
    
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
    
    // 残弾を減らす
    this.specialUses--;
    
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