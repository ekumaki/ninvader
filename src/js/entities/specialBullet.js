/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.0
 * SPDX-License-Identifier: MIT
 */

import { Bullet } from './bullet.js';

export class SpecialBullet extends Bullet {
  constructor(game, x, y, angle, speed) {
    super(game, x, y, angle, speed);
    
    // 特殊弾の設定
    this.width = 48;
    this.height = 48;
    this.damage = 3; // 通常の3倍のダメージ
    this.penetrating = true; // 敵を貫通する
    
    // 画像の読み込み
    this.image = new Image();
    this.image.onload = () => {
      console.log('特殊弾画像の読み込みに成功しました');
    };
    this.image.onerror = () => {
      console.error('特殊弾画像の読み込みに失敗しました');
    };
    this.image.src = './src/assets/img/bullet/shuriken_special_01.png';
    
    // エフェクト用
    this.glowIntensity = 1.0;
    this.glowDirection = 0.02;
    this.rotationSpeed = 15; // 通常より速い回転
  }
  
  // 更新処理（オーバーライド）
  update(deltaTime) {
    super.update(deltaTime);
    
    // 発光エフェクトの更新
    this.glowIntensity += this.glowDirection;
    if (this.glowIntensity > 1.2) {
      this.glowDirection = -0.02;
    } else if (this.glowIntensity < 0.8) {
      this.glowDirection = 0.02;
    }
  }
  
  // 描画処理（オーバーライド）
  render(ctx) {
    // 発光エフェクト
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    // 発光サイズは通常より大きく
    const glowSize = this.width * 1.5 * this.glowIntensity;
    ctx.drawImage(
      this.image,
      -glowSize / 2,
      -glowSize / 2,
      glowSize,
      glowSize
    );
    
    // 通常の描画
    ctx.globalAlpha = 1.0;
    ctx.drawImage(
      this.image,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    
    ctx.restore();
  }
}
