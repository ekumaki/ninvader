/**
 * CNP インベーダー - プレイヤーエンティティ（TypeScript版）
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

import { BaseEntity } from './BaseEntity';
import { Bullet } from './Bullet';
import type { GameEngine } from '../core/GameEngine';
import type { InputManager } from '../core/InputManager';
import type { PlayerConfig } from '../core/config';

export class Player extends BaseEntity {
  private game: GameEngine;
  private inputManager: InputManager;
  private config: PlayerConfig;
  private type: 'A' | 'B' | 'C';
  
  // コールバック
  private onBulletFired?: (bullet: Bullet) => void;
  
  // プレイヤー状態
  private health: number;
  private speed: number;
  
  // 射撃システム
  private canShoot = true;
  private shootCooldown: number;
  private shootTimer = 0;
  
  // 必殺技システム
  private isCharging = false;
  private chargeTime = 0;
  private specialChargeTime: number;
  private specialReady = false;
  private specialUses: number;
  
  // アニメーション
  private isJumping = false;
  private jumpTimer = 0;
  private jumpDuration: number;
  private jumpHeight: number;
  private originalY: number;
  
  // 画像
  private image: HTMLImageElement;
  
  // キー状態管理
  private spacePrevDown = false;
  private chargeSoundPlayed = false;
  
  // AUTOモード
  private autoMode = false;
  private autoShootTimer = 0;
  private autoShootInterval = 0.75; // 0.75秒間隔で自動射撃

  constructor(
    game: GameEngine, 
    inputManager: InputManager,
    x: number, 
    y: number, 
    type: 'A' | 'B' | 'C' = 'A'
  ) {
    // 設定を取得してサイズを決定
    const gameConfig = game.getConfig();
    const playerConfig = gameConfig.PLAYER[type];
    
    super(x, y, playerConfig.SIZE.WIDTH, playerConfig.SIZE.HEIGHT);
    
    this.game = game;
    this.inputManager = inputManager;
    this.type = type;
    this.config = playerConfig;
    
    // プレイヤー状態初期化
    this.health = this.config.HEALTH;
    this.speed = this.config.SPEED;
    
    // 射撃システム初期化
    this.shootCooldown = this.config.SHOOT_COOLDOWN;
    
    // 必殺技システム初期化
    this.specialChargeTime = this.config.CHARGE_TIME;
    this.specialUses = this.config.MAX_SPECIAL_USES;
    
    // アニメーション初期化
    this.jumpDuration = this.config.JUMP_DURATION;
    this.jumpHeight = this.config.JUMP_HEIGHT;
    this.originalY = y;
    
    // 画像読み込み
    this.image = new Image();
    this.loadImage();
    
    // AUTOモードの設定を読み込み
    this.loadAutoMode();
  }

  private loadImage(): void {
    this.image.onload = () => {
      // Player image loaded
    };
    
    this.image.onerror = () => {
      console.error(`プレイヤー${this.type}画像の読み込みに失敗しました:`, this.config.IMAGE);
    };
    
    this.image.src = `./src/assets/img/player/${this.config.IMAGE}`;
  }
  
  private loadAutoMode(): void {
    const savedAutoMode = localStorage.getItem('ninvader_auto_mode');
    this.autoMode = savedAutoMode === 'true';
    console.log('Player loadAutoMode:', {
      savedAutoMode,
      autoMode: this.autoMode,
      localStorageValue: localStorage.getItem('ninvader_auto_mode')
    });
  }
  
  // オートモード設定を更新（外部から呼び出し用）
  updateAutoMode(): void {
    this.loadAutoMode();
    console.log('Player updateAutoMode called, autoMode:', this.autoMode);
  }
  
  // オートモード状態を取得
  getAutoMode(): boolean {
    return this.autoMode;
  }

  update(deltaTime: number): void {
    if (!this.isActive) return;

    // 移動処理
    this.updateMovement(deltaTime);
    
    // 射撃処理
    this.updateShooting(deltaTime);
    
    // AUTOモード射撃処理
    this.updateAutoShooting(deltaTime);
    
    // 必殺技処理
    this.updateSpecialAttack(deltaTime);
    
    // ジャンプアニメーション更新
    this.updateJumpAnimation(deltaTime);
  }

  private updateMovement(deltaTime: number): void {
    let dx = 0;
    
    if (this.inputManager.isKeyDown('ArrowLeft')) {
      dx -= this.speed * deltaTime;
    }
    
    if (this.inputManager.isKeyDown('ArrowRight')) {
      dx += this.speed * deltaTime;
    }
    
    // 位置の更新（画面外に出ないように制限）
    const canvas = this.game.getCanvas();
    this.x = Math.max(
      this.width / 2, 
      Math.min(canvas.width - this.width / 2, this.x + dx)
    );
  }

  private updateShooting(deltaTime: number): void {
    // 発射クールダウンの更新
    if (!this.canShoot) {
      this.shootTimer += deltaTime;
      if (this.shootTimer >= this.shootCooldown) {
        this.canShoot = true;
        this.shootTimer = 0;
      }
    }
  }
  
  private updateAutoShooting(deltaTime: number): void {
    if (!this.autoMode) return;
    
    // 必殺技チャージ中はAUTO射撃を停止
    if (this.isCharging) return;
    
    // AUTO射撃タイマー更新
    this.autoShootTimer += deltaTime;
    
    // 一定間隔で自動射撃
    if (this.autoShootTimer >= this.autoShootInterval && this.canShoot) {
      console.log('Player: AUTO shooting triggered');
      this.shoot();
      this.autoShootTimer = 0;
    }
  }

  private updateSpecialAttack(deltaTime: number): void {
    const spaceDown = this.inputManager.isKeyDown(' ');
    
    if (spaceDown) {
      if (this.specialUses > 0) {
        // チャージ処理
        if (!this.isCharging) {
          this.isCharging = true;
          this.chargeTime = 0;
          this.chargeSoundPlayed = false;
        }
        this.chargeTime += deltaTime;
        
        // チャージ音再生
        if (!this.chargeSoundPlayed && this.chargeTime > 0.1) {
          // TODO: AudioManager実装後に追加
          this.chargeSoundPlayed = true;
        }
        
        if (this.chargeTime >= this.specialChargeTime && !this.specialReady) {
          this.specialReady = true;
          // TODO: チャージ完了音
        }
      } else {
        // 残弾0: AUTOモードでない場合のみ通常弾発射
        if (!this.autoMode && !this.spacePrevDown && this.canShoot) {
          this.shoot();
        }
      }
    } else {
      // スペースキーを離した時の処理
      if (this.isCharging) {
        this.isCharging = false;
        this.chargeSoundPlayed = false;
        
        if (this.specialReady && this.canShoot) {
          // 必殺技発射
          this.shootSpecial();
          this.specialReady = false;
        } else if (!this.autoMode && this.canShoot) {
          // AUTOモードでない場合のみ通常弾発射
          this.shoot();
        }
        
        this.chargeTime = 0;
      }
    }
    
    // スペースキー状態を保存
    this.spacePrevDown = spaceDown;
  }

  private updateJumpAnimation(deltaTime: number): void {
    if (this.isJumping) {
      this.jumpTimer += deltaTime;
      
      if (this.jumpTimer >= this.jumpDuration) {
        this.jumpTimer = 0;
      }
      
      // ジャンプの高さ計算（サイン波を使って滑らかに）
      const jumpProgress = (this.jumpTimer / this.jumpDuration) * Math.PI;
      this.y = this.originalY - Math.sin(jumpProgress) * this.jumpHeight;
    }
  }

  private shoot(): void {
    if (!this.canShoot) return;
    
    // 弾の生成
    const bullet = new Bullet(
      this.game,
      this.x,
      this.y - this.height / 2,
      -Math.PI / 2, // 上方向
      this.game.getConfig().BULLET.PLAYER_SPEED,
      true, // プレイヤーの弾
      './src/assets/img/bullet/shuriken_01.png'
    );
    
    // GameSceneに弾を追加
    if (this.onBulletFired) {
      this.onBulletFired(bullet);
    }
    // Player shot fired
    
    // 発射音の再生
    // TODO: AudioManager実装後に追加
    
    // クールダウン設定
    this.canShoot = false;
    this.shootTimer = 0;
  }

  private shootSpecial(): void {
    if (!this.canShoot || this.specialUses <= 0) return;
    
    // 機体タイプに応じた必殺技
    if (this.type === 'A') {
      this.shootSakuyaSpecial(); // 咲夜：光る手裏剣
    } else if (this.type === 'B') {
      this.shootNemuSpecial(); // ネム：赤い竜（波打ち）
    } else if (this.type === 'C') {
      this.shootXiaolanSpecial(); // シャオラン：パンダ（貫通なし、高威力）
    }
    
    // 共通処理
    this.canShoot = false;
    this.shootTimer = 0;
    const specialCooldown = this.config.SHOOT_COOLDOWN * 1.5;
    this.shootCooldown = specialCooldown;
    this.specialUses--;
    
    // 次回は通常のクールダウンに戻す
    setTimeout(() => {
      if (this.canShoot) {
        this.shootCooldown = this.config.SHOOT_COOLDOWN;
      }
    }, specialCooldown * 1000);
  }
  
  private shootSakuyaSpecial(): void {
    // 咲夜：光る手裏剣（直進、貫通あり、中威力、キラキラ演出）
    const specialBullet = new Bullet(
      this.game,
      this.x,
      this.y - this.height / 2,
      -Math.PI / 2,
      this.config.SPECIAL_BULLET_SPEED,
      true,
      './src/assets/img/bullet/player_A_special_01.png'
    );
    
    specialBullet.setSize(32, 32); // より大きく
    specialBullet.setPenetrating(true);
    specialBullet.setDamage(3);
    specialBullet.setSparkleEffect(true); // キラキラ演出
    
    if (this.onBulletFired) {
      this.onBulletFired(specialBullet);
    }
  }
  
  private shootNemuSpecial(): void {
    // ネム：赤い竜（サイン波軌道、貫通あり、低威力）
    const specialBullet = new Bullet(
      this.game,
      this.x,
      this.y - this.height / 2,
      -Math.PI / 2,
      this.config.SPECIAL_BULLET_SPEED * 0.8, // 少し遅く
      true,
      './src/assets/img/bullet/player_A_special_01.png' // 咲夜の画像を使用
    );
    
    specialBullet.setSize(28, 28);
    specialBullet.setPenetrating(true);
    specialBullet.setDamage(2); // 低威力
    specialBullet.setSinWaveMovement(true, 30, 0.05); // 波打ち軌道（振幅をさらに抑制）
    
    if (this.onBulletFired) {
      this.onBulletFired(specialBullet);
    }
  }
  
  private shootXiaolanSpecial(): void {
    // シャオラン：パンダ（直進、貫通なし、高威力）
    const specialBullet = new Bullet(
      this.game,
      this.x,
      this.y - this.height / 2,
      -Math.PI / 2,
      this.config.SPECIAL_BULLET_SPEED,
      true,
      './src/assets/img/bullet/player_A_special_01.png' // 咲夜の画像を使用
    );
    
    specialBullet.setSize(64, 64); // 大きく
    specialBullet.setPenetrating(false); // 貫通なし
    specialBullet.setDamage(5); // 高威力
    specialBullet.setExplosive(true, 72); // 爆発弾、爆発範囲72px
    
    if (this.onBulletFired) {
      this.onBulletFired(specialBullet);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;
    
    // プレイヤー画像描画
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
      ctx.fillStyle = '#00FF00';
      ctx.fillRect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
      );
    }
    
    // 必殺技チャージゲージ描画
    this.renderSpecialGauge(ctx);
  }

  private renderSpecialGauge(ctx: CanvasRenderingContext2D): void {
    const chargePercent = (this.specialUses > 0 && this.isCharging) 
      ? Math.min(this.chargeTime / this.specialChargeTime, 1) 
      : 0;
    const gaugeWidth = 50;
    const gaugeHeight = 5;
    const gaugeX = this.x - gaugeWidth / 2;
    const gaugeY = this.y + this.height / 2 + 6;
    
    ctx.save();
    
    // ゲージ外枠
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
        
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 15 * pulseIntensity;
        
        const gradient = ctx.createLinearGradient(gaugeX, gaugeY, gaugeX, gaugeY + gaugeHeight);
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(0.5, '#ffcc00');
        gradient.addColorStop(1, '#ff9900');
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = pulseIntensity;
        ctx.fillRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight);
        
        ctx.globalAlpha = 0.8 * pulseIntensity;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(gaugeX + 1, gaugeY + 1, gaugeWidth - 2, 1);
      } else {
        // チャージ中のエフェクト
        const fillWidth = gaugeWidth * chargePercent;
        
        const gradient = ctx.createLinearGradient(gaugeX, gaugeY, gaugeX, gaugeY + gaugeHeight);
        gradient.addColorStop(0, '#4fc3f7');
        gradient.addColorStop(0.5, '#29b6f6');
        gradient.addColorStop(1, '#0288d1');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(gaugeX, gaugeY, fillWidth, gaugeHeight);
        
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

  // ゲームクリア時のジャンプ開始
  startJump(): void {
    this.isJumping = true;
    this.jumpTimer = 0;
    this.originalY = this.y;
  }

  // ジャンプ停止
  stopJump(): void {
    this.isJumping = false;
    this.y = this.originalY;
  }

  // ダメージを受ける
  takeDamage(amount: number): boolean {
    const gameConfig = this.game.getConfig();
    if (gameConfig.DEBUG && gameConfig.DEBUG.GOD_MODE) {
      return false;
    }
    
    this.health -= amount;
    if (this.health <= 0) {
      this.isActive = false;
      return true; // プレイヤーが死亡した
    }
    return false;
  }

  // ゲッター
  getHealth(): number {
    return this.health;
  }

  getSpecialUses(): number {
    return this.specialUses;
  }

  getType(): string {
    return this.type;
  }
  
  // ダメージを受ける
  takeDamage(amount: number): boolean {
    const gameConfig = this.game.getConfig();
    console.log('takeDamage called, GOD_MODE:', gameConfig.DEBUG?.GOD_MODE);
    
    if (gameConfig.DEBUG && gameConfig.DEBUG.GOD_MODE) {
      // 無敵モード中はダメージを受けない
      console.log('無敵モード: ダメージを無効化');
      return false;
    }
    
    console.log('ダメージを受けました:', amount);
    this.health -= amount;
    if (this.health <= 0) {
      this.isActive = false;
      return true; // プレイヤーが死亡した
    }
    return false;
  }
  
  // コールバック設定
  setBulletFiredCallback(callback: (bullet: Bullet) => void): void {
    this.onBulletFired = callback;
  }
}