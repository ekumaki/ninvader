/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.0
 * SPDX-License-Identifier: MIT
 */

export class UFO {
  constructor(game, y) {
    this.game = game;
    this.x = -32; // 画面外から登場
    this.y = y;
    this.width = 64;
    this.height = 32;
    this.speed = 100; // 移動速度
    this.points = 500; // 倒した時の得点
    this.health = 1;
    this.isActive = true;
    this.direction = 1; // 1: 右, -1: 左
    
    // 出現タイミング
    this.appearanceInterval = 10; // 出現間隔（秒）
    this.appearanceTimer = Math.random() * 5 + 5; // 初回出現時間
    
    // 画像の読み込み
    this.image = new Image();
    this.image.onload = () => {
      console.log('UFO画像の読み込みに成功しました');
    };
    this.image.onerror = () => {
      console.error('UFO画像の読み込みに失敗しました');
    };
    this.image.src = './src/assets/img/enemy/ufo_bonus.png';
    
    // アニメーション関連
    this.currentFrame = 0;
    this.totalFrames = 2;
    this.animationSpeed = 0.2; // アニメーション速度（秒）
    this.animationTimer = 0;
  }
  
  // 更新処理
  update(deltaTime) {
    // 移動
    this.x += this.direction * this.speed * deltaTime;
    
    // 画面外に出たら無効化
    if (
      (this.direction > 0 && this.x > this.game.canvas.width + this.width) ||
      (this.direction < 0 && this.x < -this.width)
    ) {
      this.isActive = false;
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
    // UFOの描画
    ctx.drawImage(
      this.image,
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
  }
  
  // ダメージを受ける
  takeDamage(amount) {
    this.health -= amount;
    
    if (this.health <= 0) {
      this.isActive = false;
      return true; // UFOが倒れた
    }
    
    return false;
  }
  
  // 新しいUFOを生成するかどうかのチェック
  static checkSpawn(game, deltaTime, currentUFO) {
    if (currentUFO && currentUFO.isActive) {
      return null; // すでにUFOがアクティブ
    }
    
    // タイマーの更新
    if (!UFO.spawnTimer) {
      UFO.spawnTimer = 0;
    }
    
    UFO.spawnTimer += deltaTime;
    
    // 出現間隔を超えたら新しいUFOを生成
    if (UFO.spawnTimer >= 10) { // 10秒ごとに出現
      UFO.spawnTimer = 0;
      
      // 出現位置（上部10%の高さ）
      const y = game.canvas.height * 0.1;
      
      // ランダムに左右どちらかから登場
      const direction = Math.random() > 0.5 ? 1 : -1;
      const ufo = new UFO(game, y);
      
      if (direction < 0) {
        ufo.x = game.canvas.width + ufo.width / 2;
        ufo.direction = -1;
      }
      
      return ufo;
    }
    
    return null;
  }
}
