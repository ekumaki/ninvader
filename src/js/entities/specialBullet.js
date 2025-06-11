/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.2.6
 * SPDX-License-Identifier: MIT
 */

import { Bullet } from './bullet.js';

export class SpecialBullet extends Bullet {
  constructor(game, x, y, angle, speed) {
    super(game, x, y, angle, speed);
    
    // 特殊弾の設定（通常弾の4倍サイズ）
    this.width = 32;  // サイズを32pxに変更
    this.height = 32; // サイズを32pxに変更
    this.damage = 3; // ダメージ量3
    this.penetrating = true; // 無限貫通
    this.penetratingCount = Infinity; // 無限貫通回数
    
    // 画像の読み込み（通常弾を拡大して使用）
    this.image = new Image();
    this.image.onload = () => {
      console.log('特殊弾画像の読み込みに成功しました');
    };
    this.image.onerror = () => {
      console.error('特殊弾画像の読み込みに失敗しました');
    };
    this.image.src = './src/assets/img/bullet/shuriken_01.png'; // 既存の手裏剣画像を使用
    
    // キラキラエフェクト用
    this.glowIntensity = 1.0;
    this.glowDirection = 0.03;
    this.rotationSpeed = 20; // 高速回転
    this.sparkles = []; // 軌跡用のパーティクル
    this.sparkleTimer = 0;
    this.sparkleInterval = 0.05; // パーティクル生成間隔
    
    // カラーエフェクト
    this.colorPhase = 0;
    this.colorSpeed = 5;
  }
  
  // 更新処理（オーバーライド）
  update(deltaTime) {
    super.update(deltaTime);
    
    // 発光エフェクトの更新
    this.glowIntensity += this.glowDirection;
    if (this.glowIntensity > 1.5) {
      this.glowDirection = -0.03;
    } else if (this.glowIntensity < 0.7) {
      this.glowDirection = 0.03;
    }
    
    // カラーフェーズ更新
    this.colorPhase += this.colorSpeed * deltaTime;
    
    // 軌跡パーティクル生成
    this.sparkleTimer += deltaTime;
    if (this.sparkleTimer >= this.sparkleInterval) {
      this.sparkles.push({
        x: this.x + (Math.random() - 0.5) * 20,
        y: this.y + (Math.random() - 0.5) * 20,
        size: Math.random() * 4 + 2,
        life: 1.0,
        decay: 2.0
      });
      this.sparkleTimer = 0;
    }
    
    // パーティクル更新
    this.sparkles = this.sparkles.filter(sparkle => {
      sparkle.life -= sparkle.decay * deltaTime;
      return sparkle.life > 0;
    });
  }
  
  // 描画処理（オーバーライド）
  render(ctx) {
    // 軌跡パーティクル描画
    this.sparkles.forEach(sparkle => {
      ctx.save();
      ctx.globalAlpha = sparkle.life * 0.8;
      ctx.fillStyle = `hsl(${(this.colorPhase + sparkle.x) % 360}, 80%, 70%)`;
      ctx.beginPath();
      ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    
    // メイン特殊弾描画
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    // 外側の発光エフェクト（キラキラ感）
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.globalAlpha = 0.3 * this.glowIntensity / (i + 1);
      const glowSize = this.width * (1.8 + i * 0.3) * this.glowIntensity;
      const hue = (this.colorPhase + i * 60) % 360;
      
      // カラフルな発光
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
      ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
      ctx.shadowBlur = 20;
      
      ctx.drawImage(
        this.image,
        -glowSize / 2,
        -glowSize / 2,
        glowSize,
        glowSize
      );
      ctx.restore();
    }
    
    // メイン画像
    ctx.globalAlpha = 1.0;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 10;
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
