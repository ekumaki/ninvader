/**
 * CNP インベーダー - 弾エンティティ（TypeScript版）
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

import { BaseEntity } from './BaseEntity';
import type { GameEngine } from '../core/GameEngine';
import type { Collidable } from '../core/types';
import type { Player } from './Player';

export class Bullet extends BaseEntity {
  private game: GameEngine;
  private player: Player | null = null; // プレイヤーインスタンス（追尾用）
  private angle: number;
  private speed: number;
  private damage: number;
  private isPlayerBullet: boolean;
  private penetrating: boolean;
  private isEnemyLaser: boolean = false; // ザコ敵のレーザー弾かどうか
  
  // 特殊効果
  private sparkleEffect: boolean = false; // キラキラ演出
  private sinWaveMovement: boolean = false; // 波打ち軌道
  private waveAmplitude: number = 0; // 波の振幅
  private waveFrequency: number = 0; // 波の周波数
  private initialX: number = 0; // 初期X座標（波打ち用）
  private travelDistance: number = 0; // 移動距離（波打ち用）
  private multiHit: boolean = false; // 複数の敵に当たる
  private explosive: boolean = false; // 爆発弾
  private explosionRadius: number = 0; // 爆発範囲
  
  // 追尾機能
  private homing: boolean = false; // 追尾機能有効/無効
  private homingStrength: number = 0.2; // 追尾強度（0.0-1.0）- 0.1から0.2に変更
  private homingMaxTurnRate: number = Math.PI * 3; // 最大旋回速度（ラジアン/秒）- より機敏に
  private homingStartTime: number = 0; // 追尾開始時刻
  private homingDuration: number = 2.0; // 追尾持続時間（秒）
  private homingDecayStart: number = 1.0; // 追尾減衰開始時間（秒）
  
  // 重複ヒット防止用
  private hitEntities: Set<any> = new Set();
  
  // アニメーション
  private rotation = 0;
  private rotationSpeed = 10; // ラジアン/秒
  
  // 画像
  private image: HTMLImageElement;

  constructor(
    game: GameEngine,
    x: number,
    y: number,
    angle: number,
    speed: number,
    isPlayerBullet = true,
    imagePath = './src/assets/img/bullet/shuriken_01.png'
  ) {
    super(x, y, 12, 12);
    
    this.game = game;
    this.angle = angle;
    this.speed = speed;
    this.damage = 1;
    this.isPlayerBullet = isPlayerBullet;
    this.penetrating = false;
    this.initialX = x;
    
    // 画像読み込み
    this.image = new Image();
    this.loadImage(imagePath);
  }

  private loadImage(imagePath: string): void {
    this.image.onload = () => {
      // Bullet image loaded
    };
    
    this.image.onerror = () => {
      console.error('弾画像の読み込みに失敗しました:', imagePath);
    };
    
    this.image.src = imagePath;
  }

  update(deltaTime: number): void {
    if (!this.isActive) return;
    
    // 追尾機能の処理
    if (this.homing && !this.isPlayerBullet) {
      const currentTime = performance.now() / 1000;
      const elapsedTime = currentTime - this.homingStartTime;
      
      // 追尾持続時間を超えたら追尾停止
      if (elapsedTime > this.homingDuration) {
        this.homing = false;
      } else if (this.player) {
        // 画面の高さを取得
        const canvas = this.game.getCanvas();
        const screenHeight = canvas.height;
        
        // 画面下部（下から30%）では追尾を大幅に弱める
        const lowerScreenThreshold = screenHeight * 0.7;
        let positionMultiplier = 1.0;
        if (this.y > lowerScreenThreshold) {
          const distanceFromThreshold = this.y - lowerScreenThreshold;
          const maxDistance = screenHeight * 0.3;
          positionMultiplier = Math.max(0.1, 1.0 - (distanceFromThreshold / maxDistance) * 0.9);
        }
        
        // 時間経過による減衰
        let timeMultiplier = 1.0;
        if (elapsedTime > this.homingDecayStart) {
          const decayProgress = (elapsedTime - this.homingDecayStart) / (this.homingDuration - this.homingDecayStart);
          timeMultiplier = Math.max(0.1, 1.0 - decayProgress * 0.8);
        }
        
        // 実際の追尾強度を計算
        const effectiveStrength = this.homingStrength * positionMultiplier * timeMultiplier;
        
        // プレイヤーの中心座標を取得
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        
        // 弾の中心座標
        const bulletCenterX = this.x + this.width / 2;
        const bulletCenterY = this.y + this.height / 2;
        
        // プレイヤーへの角度を計算
        const targetAngle = Math.atan2(playerCenterY - bulletCenterY, playerCenterX - bulletCenterX);
        
        // 角度の差を計算
        let angleDiff = targetAngle - this.angle;
        
        // 角度を-π～πの範囲に正規化
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // 最大旋回速度を適用
        const maxTurn = this.homingMaxTurnRate * deltaTime;
        if (Math.abs(angleDiff) > maxTurn) {
          angleDiff = angleDiff > 0 ? maxTurn : -maxTurn;
        }
        
        // 追尾強度を適用して角度を調整
        const oldAngle = this.angle;
        this.angle += angleDiff * effectiveStrength;
        
        // デバッグログ（最初の数フレームのみ）
        if (Math.random() < 0.01) { // 1%の確率でログ出力
          console.log(`追尾弾: 時間=${elapsedTime.toFixed(1)}s, 位置=${this.y.toFixed(0)}, 強度=${effectiveStrength.toFixed(2)} (基本=${this.homingStrength}, 位置係数=${positionMultiplier.toFixed(2)}, 時間係数=${timeMultiplier.toFixed(2)})`);
        }
      } else {
        // プレイヤーが設定されていない場合のデバッグログ
        if (Math.random() < 0.01) {
          console.log('追尾弾: プレイヤーインスタンスが設定されていません');
        }
      }
    }
    
    // 移動
    if (this.sinWaveMovement) {
      // 波打ち軌道
      this.travelDistance += this.speed * deltaTime;
      this.y += Math.sin(this.angle) * this.speed * deltaTime; // Y方向は通常通り
      this.x = this.initialX + Math.sin(this.travelDistance * this.waveFrequency) * this.waveAmplitude;
    } else {
      // 通常の直進
      this.x += Math.cos(this.angle) * this.speed * deltaTime;
      this.y += Math.sin(this.angle) * this.speed * deltaTime;
    }
    
    // 回転（ザコ敵のレーザー弾は回転しない）
    if (!this.isEnemyLaser) {
      this.rotation += this.rotationSpeed * deltaTime;
    }
    
    // 画面外に出たら無効化
    const canvas = this.game.getCanvas();
    if (
      this.x < -this.width ||
      this.x > canvas.width + this.width ||
      this.y < -this.height ||
      this.y > canvas.height + this.height
    ) {
      this.isActive = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;
    
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    if (this.image.complete) {
      // キラキラ演出
      if (this.sparkleEffect) {
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
        
        // 星のパーティクル
        for (let i = 0; i < 6; i++) {
          const angle = (Date.now() * 0.01 + i * Math.PI / 3) % (Math.PI * 2);
          const distance = 15 + Math.sin(Date.now() * 0.005 + i) * 5;
          const sparkleX = Math.cos(angle) * distance;
          const sparkleY = Math.sin(angle) * distance;
          
          ctx.fillStyle = `rgba(255, 215, 0, ${0.7 + Math.sin(Date.now() * 0.01 + i) * 0.3})`;
          ctx.fillRect(sparkleX - 1, sparkleY - 1, 2, 2);
        }
      }
      
      ctx.drawImage(
        this.image,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
      
      if (this.sparkleEffect) {
        ctx.shadowBlur = 0;
      }
    } else {
      // フォールバック描画
      if (this.isPlayerBullet) {
        // プレイヤー弾：シンプルな円形
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.isEnemyLaser) {
        // ザコ敵弾：赤いレーザー（長方形、回転なし）
        ctx.fillStyle = '#FF0000'; // より鮮やかな赤
        ctx.fillRect(
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
        
        // レーザーのグロー効果
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#FF3333'; // より明るい赤のハイライト
        ctx.fillRect(
          -this.width / 2 + 1,
          -this.height / 2 + 1,
          this.width - 2,
          this.height - 2
        );
        ctx.shadowBlur = 0;
      } else {
        // ボス弾：通常の円形
        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.restore();
  }

  // 衝突判定
  collidesWith(entity: Collidable): boolean {
    // 簡易的な円形の衝突判定
    const dx = this.x - entity.x;
    const dy = this.y - entity.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (this.width + entity.width) / 2;
    
    return distance < minDistance;
  }

  // ゲッター
  getDamage(): number {
    return this.damage;
  }

  getIsPlayerBullet(): boolean {
    return this.isPlayerBullet;
  }

  getPenetrating(): boolean {
    return this.penetrating;
  }

  // セッター
  setPenetrating(penetrating: boolean): void {
    this.penetrating = penetrating;
  }

  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  setDamage(damage: number): void {
    this.damage = damage;
  }
  
  setEnemyLaser(isLaser: boolean): void {
    this.isEnemyLaser = isLaser;
  }
  
  setSparkleEffect(enabled: boolean): void {
    this.sparkleEffect = enabled;
  }
  
  setSinWaveMovement(enabled: boolean, amplitude: number = 60, frequency: number = 0.05): void {
    this.sinWaveMovement = enabled;
    this.waveAmplitude = amplitude;
    this.waveFrequency = frequency;
  }

  setMultiHit(enabled: boolean): void {
    this.multiHit = enabled;
  }

  getMultiHit(): boolean {
    return this.multiHit;
  }

  setExplosive(enabled: boolean, radius: number = 50): void {
    this.explosive = enabled;
    this.explosionRadius = radius;
  }

  getExplosive(): boolean {
    return this.explosive;
  }

  getExplosionRadius(): number {
    return this.explosionRadius;
  }
  
  getHitEntities(): Set<any> {
    return this.hitEntities;
  }
  
  setHoming(enabled: boolean, player: Player | null = null, strength: number = 0.2, maxTurnRate: number = Math.PI * 2): void {
    this.homing = enabled;
    this.player = player;
    this.homingStrength = strength;
    this.homingMaxTurnRate = maxTurnRate;
    if (enabled) {
      this.homingStartTime = performance.now() / 1000; // 現在時刻を秒で記録
    }
  }
  
  getHoming(): boolean {
    return this.homing;
  }
}