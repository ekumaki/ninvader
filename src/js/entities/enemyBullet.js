/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.0
 * SPDX-License-Identifier: MIT
 */

export class EnemyBullet {
  constructor(game, x, y, angle, speed) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.angle = angle; // ラジアン
    this.speed = speed;
    this.width = 4;
    this.height = 8;
    this.isPlayerBullet = false; // プレイヤーの弾ではない
    this.isActive = true; // 弾が有効かどうか
    
    // 画像の読み込み（敵の弾は単純な形状）
    this.color = '#ff3333'; // 赤色
    this.image = null; // 当たり判定用画像を使用する場合に設定
  }
  
  // 更新処理
  update(deltaTime) {
    // 移動
    this.x += Math.cos(this.angle) * this.speed * deltaTime;
    this.y += Math.sin(this.angle) * this.speed * deltaTime;
    
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
    if (this.image) {
      // 画像が設定されていれば画像を描画
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.drawImage(
        this.image,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
      ctx.restore();
    } else {
      // 画像がなければ単純な四角を描画
      ctx.fillStyle = this.color;
      ctx.fillRect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
      );
    }
  }
  
  // 衝突判定
  collidesWith(entity) {
    // 簡易的な円形の衝突判定
    const dx = this.x - entity.x;
    const dy = this.y - entity.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (this.width + entity.width) / 3; // 少し小さめの判定
    
    return distance < minDistance;
  }
}
