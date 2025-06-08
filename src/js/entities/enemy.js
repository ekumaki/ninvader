/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.0
 * SPDX-License-Identifier: MIT
 */

import { EnemyBullet } from './enemyBullet.js';

export class Enemy {
  constructor(game, x, y, type = 'normal') {
    this.game = game;
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 48;
    this.height = 48;
    this.health = 1;
    this.points = 100; // 倒した時の得点
    this.isActive = true;
    
    // 移動パターン
    this.speed = 0.05; // 移動速度を大幅に下げる（0.2→0.05）
    this.direction = 1; // 1: 右, -1: 左
    this.dropDistance = 2; // 下降距離を元に戻す
    this.moveDelay = 0; // 移動遅延（ランダム化用）
    this.edgeMargin = 30; // 画面端からの余白を元に戻す
    
    // 攻撃パターン
    this.canShoot = true;
    this.shootProbability = 0.001; // 1フレームあたりの発射確率
    this.shootCooldown = 2; // 発射クールダウン（秒）
    this.shootTimer = 0;
    
    // 画像の読み込み
    this.image = new Image();
    this.image.onload = () => {
      console.log('敵画像の読み込みに成功しました');
    };
    this.image.onerror = () => {
      console.error('敵画像の読み込みに失敗しました');
    };
    this.image.src = './src/assets/img/enemy/enemy_01.png';
    
    // アニメーション関連
    this.currentFrame = 0;
    this.totalFrames = 2;
    this.animationSpeed = 0.5; // アニメーション速度（秒）
    this.animationTimer = 0;
  }
  
  // 更新処理
  update(deltaTime) {
    // 敵のY座標が異常に大きい場合は警告を出す
    if (this.y > 1000) {
      console.error('警告: 敵のY座標が異常に大きい値です:', this.y);
      // 安全な値にリセット
      this.y = 100;
      return;
    }
    
    // 移動遅延がある場合は減少
    if (this.moveDelay > 0) {
      this.moveDelay -= deltaTime;
      return;
    }
    
    // 前の位置を保存
    const prevX = this.x;
    const prevY = this.y;
    
    // 移動制御をFormationSystemに一元化するため、個別の移動処理をコメントアウト
    // const movement = this.direction * this.speed * deltaTime;
    // this.x += movement;
    
    // 移動量が異常に大きい場合は警告を出す（移動処理無効化のためコメントアウト）
    // if (Math.abs(movement) > 20) {
    //   console.error('警告: 敵の移動量が異常に大きいです:', movement, 'deltaTime:', deltaTime);
    //   // 安全な値にリセット
    //   this.x = prevX;
    //   return;
    // }
    
    // 画面端判定と方向転換もFormationSystemで行うためコメントアウト
    // 画面端に到達したら方向転換と下降
    // canvasWidthプロパティが存在すればそちらを使用、なければgame.canvas.widthを使用
    // const screenWidth = this.canvasWidth || this.game.canvas.width;
    
    // 画面端判定の詳細情報
    // if (Math.random() < 0.01) { // 1%の確率でログ出力してログ量を減らす
    //   console.log('敵位置確認 - X:', this.x, 'Y:', this.y, '画面幅:', screenWidth, '余白:', this.edgeMargin);
    // }
    
    // if (this.x <= this.edgeMargin || this.x >= screenWidth - this.edgeMargin) {
    //   console.log('敵が画面端に到達 - X:', this.x, 'Y:', this.y);
    //   this.changeDirectionAndDrop();
    //   console.log('敵が方向転換しました: 方向=' + this.direction);
    // }
    
    // 発射クールダウンの更新
    if (!this.canShoot) {
      this.shootTimer += deltaTime;
      if (this.shootTimer >= this.shootCooldown) {
        this.canShoot = true;
        this.shootTimer = 0;
      }
    }
    
    // ランダムに弾を発射
    // 一時的に敵の弾の発射を停止
    // if (this.canShoot && Math.random() < this.shootProbability) {
    //   this.shoot();
    // }
    
    // アニメーション更新
    this.animationTimer += deltaTime;
    if (this.animationTimer >= this.animationSpeed) {
      this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
      this.animationTimer = 0;
    }
  }
  
  // 描画処理
  render(ctx) {
    // 敵の描画
    ctx.drawImage(
      this.image,
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
  }
  
  // 方向転換と下降
  changeDirectionAndDrop() {
    this.direction *= -1;
    
    // 方向転換時に確率的に下降するように調整
    if (Math.random() < 0.7) { // 70%の確率で下降
      // 下降距離を少し減らす
      const actualDropDistance = this.dropDistance * 0.7;
      this.y += actualDropDistance;
      console.log('敵が下降しました - Y座標:', this.y, '下降距離:', actualDropDistance);
    } else {
      console.log('敵の下降をスキップしました - Y座標:', this.y);
    }
    
    // 移動遅延を少し長くして方向転換の頻度を減らす
    this.moveDelay = 0.1 + Math.random() * 0.2; // 0.1秒から0.3秒の遅延
  }
  
  // 弾の発射
  shoot() {
    if (!this.canShoot) return;
    
    // 弾の生成
    const bullet = new EnemyBullet(
      this.game,
      this.x,
      this.y + this.height / 2,
      Math.PI / 2, // 下方向
      200 // 速度
    );
    
    // 現在のゲーム画面に弾を追加
    const gameScreen = this.game.screens['game'];
    if (gameScreen) {
      gameScreen.addEnemyBullet(bullet);
    }
    
    // クールダウン設定
    this.canShoot = false;
    this.shootTimer = 0;
  }
  
  // ダメージを受ける
  takeDamage(amount) {
    this.health -= amount;
    
    if (this.health <= 0) {
      this.isActive = false;
      return true; // 敵が倒れた
    }
    
    return false;
  }
}
