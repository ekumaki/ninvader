/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.0
 * SPDX-License-Identifier: MIT
 */

export class Bullet {
  constructor(game, x, y, angle, speed) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.angle = angle; // ラジアン
    this.speed = speed;
    this.width = 12;
    this.height = 12;
    this.damage = 1;
    this.isPlayerBullet = true; // プレイヤーの弾かどうか
    this.isActive = true; // 弾が有効かどうか
    this.penetrating = false; // 貫通するかどうか
    
    // 画像の読み込み
    this.image = new Image();
    this.image.src = '/src/assets/img/bullet/shuriken_01.png';
    
    // 回転アニメーション用
    this.rotation = 0;
    this.rotationSpeed = 10; // 回転速度（ラジアン/秒）
  }
  
  // 更新処理
  update(deltaTime) {
    // 移動
    this.x += Math.cos(this.angle) * this.speed * deltaTime;
    this.y += Math.sin(this.angle) * this.speed * deltaTime;
    
    // 回転
    this.rotation += this.rotationSpeed * deltaTime;
    
    // 画面外に出たら無効化
    if (
      this.x < -this.width ||
      this.x > this.game.canvas.width + this.width ||
      this.y < -this.height ||
      this.y > this.game.canvas.height + this.height
    ) {
      this.isActive = false;
    }
  }
  
  // 描画処理
  render(ctx) {
    // 回転して描画
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.drawImage(
      this.image,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    ctx.restore();
  }
  
  // 衝突判定
  collidesWith(entity) {
    // 簡易的な円形の衝突判定
    const dx = this.x - entity.x;
    const dy = this.y - entity.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (this.width + entity.width) / 2;
    
    return distance < minDistance;
  }
}
