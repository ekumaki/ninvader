/**
 * CNP インベーダー - UFOエンティティ（TypeScript版）
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

import { BaseEntity } from './BaseEntity';
import type { GameEngine } from '../core/GameEngine';

export class Ufo extends BaseEntity {
  private game: GameEngine;
  private speed: number;
  private direction: number; // 1: 右, -1: 左
  private points: number;
  
  // 画像
  private image: HTMLImageElement;

  constructor(game: GameEngine, x: number, y: number, direction: number = 1) {
    super(x, y, 60, 30); // UFOサイズ
    
    this.game = game;
    this.speed = 80; // UFOの移動速度
    this.direction = direction;
    this.points = 500; // UFO撃破時のポイント
    
    // 画像読み込み
    this.image = new Image();
    this.loadImage();
  }

  private loadImage(): void {
    this.image.onload = () => {
      // UFO image loaded
    };
    
    this.image.onerror = () => {
      console.error('UFO画像の読み込みに失敗しました');
    };
    
    this.image.src = './src/assets/img/enemy/ufo_bonus.png';
  }

  update(deltaTime: number): void {
    if (!this.isActive) return;

    // 横移動
    this.x += this.speed * this.direction * deltaTime;
    
    // 画面外に出たら無効化
    const canvas = this.game.getCanvas();
    if (this.direction > 0 && this.x > canvas.width + this.width) {
      this.isActive = false;
    } else if (this.direction < 0 && this.x < -this.width) {
      this.isActive = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;
    
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
        this.drawFallbackUfo(ctx);
      }
    } else {
      // フォールバック：楕円形描画
      this.drawFallbackUfo(ctx);
    }
  }

  private drawFallbackUfo(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    // UFOの本体（楕円）
    ctx.fillStyle = '#CCCCCC';
    ctx.beginPath();
    ctx.ellipse(
      this.x, 
      this.y, 
      this.width / 2, 
      this.height / 2, 
      0, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
    
    // UFOのドーム部分
    ctx.fillStyle = '#AAAAAA';
    ctx.beginPath();
    ctx.ellipse(
      this.x, 
      this.y - this.height / 4, 
      this.width / 3, 
      this.height / 3, 
      0, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
    
    // 光るライト
    const time = Date.now() * 0.005;
    const lightAlpha = Math.sin(time) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 255, 0, ${lightAlpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  // ダメージを受ける
  takeDamage(amount: number): boolean {
    this.isActive = false;
    return true; // UFOは一撃で撃破
  }

  // ゲッター
  getPoints(): number {
    return this.points;
  }
}