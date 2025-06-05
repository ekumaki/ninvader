/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.0
 * SPDX-License-Identifier: MIT
 */

import { Player } from '../entities/player.js';
import { Enemy } from '../entities/enemy.js';
import { UFO } from '../entities/ufo.js';
import { Boss } from '../entities/boss.js';

export class GameScreen {
  constructor(game) {
    this.game = game;
    this.canvas = game.canvas;
    this.ctx = game.ctx;
    
    // ゲーム要素
    this.player = null;
    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.ufo = null;
    this.boss = null;
    
    // ゲーム状態
    this.gameTime = 0; // ゲーム経過時間（秒）
    this.bossSpawnTime = 180; // ボス出現時間（秒）
    this.enemyRows = 5; // 敵の行数
    this.enemyCols = 8; // 敵の列数
    this.enemySpacing = 60; // 敵の間隔
    this.enemySpeed = 50; // 敵の基本速度
    this.enemySpeedIncrease = 5; // 敵が減るごとの速度増加
    this.enemyDropDistance = 20; // 敵が下に降りる距離
    this.enemyDirection = 1; // 敵の移動方向 (1: 右, -1: 左)
    
    // スコア表示
    this.scoreDisplay = null;
    
    // UIコントロール
    this.chargeBar = null;
  }
  
  // 画面に入る時の処理
  enter() {
    // ゲーム要素の初期化
    this.initializeGame();
    this.createScoreDisplay();
    this.createChargeBar();
  }
  
  // 画面から出る時の処理
  exit() {
    this.removeScoreDisplay();
    this.removeChargeBar();
  }
  
  // ゲームの初期化
  initializeGame() {
    // プレイヤーの作成
    this.player = new Player(
      this.game,
      this.canvas.width / 2,
      this.canvas.height - 100
    );
    
    // 敵の配置
    this.createEnemies();
    
    // 各種配列の初期化
    this.playerBullets = [];
    this.enemyBullets = [];
    this.ufo = null;
    this.boss = null;
    
    // ゲーム状態のリセット
    this.gameTime = 0;
    this.game.scoreManager.resetScore();
  }
  
  // 敵の配置
  createEnemies() {
    this.enemies = [];
    
    const startX = (this.canvas.width - (this.enemyCols - 1) * this.enemySpacing) / 2;
    const startY = 100;
    
    for (let row = 0; row < this.enemyRows; row++) {
      for (let col = 0; col < this.enemyCols; col++) {
        const x = startX + col * this.enemySpacing;
        const y = startY + row * this.enemySpacing;
        
        const enemy = new Enemy(this.game, x, y);
        
        // 行によって敵の特性を変える（オプション）
        if (row === 0) {
          enemy.points = 150; // 最前列は高得点
        }
        
        this.enemies.push(enemy);
      }
    }
  }
  
  // 更新処理
  update(deltaTime) {
    // ゲームオーバーなら更新しない
    if (this.gameOver) return;
    
    // ゲーム時間の更新
    this.gameTime += deltaTime;
    
    // プレイヤーの更新
    if (this.player && this.player.isActive) {
      this.player.update(deltaTime);
    }
    
    // 敵の更新
    this.updateEnemies(deltaTime);
    
    // UFOの更新
    this.updateUFO(deltaTime);
    
    // ボスの更新
    this.updateBoss(deltaTime);
    
    // プレイヤーの弾の更新
    this.updatePlayerBullets(deltaTime);
    
    // 敵の弾の更新
    this.updateEnemyBullets(deltaTime);
    
    // 衝突判定
    this.checkCollisions();
    
    // ゲーム状態の確認
    this.checkGameState();
    
    // スコア表示の更新
    this.updateScoreDisplay();
    
    // チャージバーの更新
    this.updateChargeBar();
  }
  
  // 敵の更新
  updateEnemies(deltaTime) {
    if (this.boss) return; // ボス出現中は敵の更新をスキップ
    
    let needsDirectionChange = false;
    
    // 敵の移動速度調整（敵が少ないほど速くなる）
    const speedMultiplier = 1 + (1 - this.enemies.length / (this.enemyRows * this.enemyCols)) * 2;
    
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      
      // 速度の調整
      enemy.speed = this.enemySpeed * speedMultiplier;
      
      // 敵の更新
      enemy.update(deltaTime);
      
      // 画面端に到達したかチェック
      if (
        (this.enemyDirection > 0 && enemy.x > this.canvas.width - enemy.width / 2) ||
        (this.enemyDirection < 0 && enemy.x < enemy.width / 2)
      ) {
        needsDirectionChange = true;
      }
    }
    
    // 方向転換と下降
    if (needsDirectionChange) {
      this.enemyDirection *= -1;
      for (const enemy of this.enemies) {
        enemy.changeDirectionAndDrop();
      }
    }
    
    // 無効になった敵を削除
    this.enemies = this.enemies.filter(enemy => enemy.isActive);
  }
  
  // UFOの更新
  updateUFO(deltaTime) {
    // 既存のUFOの更新
    if (this.ufo) {
      this.ufo.update(deltaTime);
      
      // 無効になったUFOを削除
      if (!this.ufo.isActive) {
        this.ufo = null;
      }
    }
    
    // 新しいUFOの生成チェック
    if (!this.ufo && !this.boss) {
      const newUFO = UFO.checkSpawn(this.game, deltaTime, this.ufo);
      if (newUFO) {
        this.ufo = newUFO;
      }
    }
  }
  
  // ボスの更新
  updateBoss(deltaTime) {
    // ボスの出現条件チェック
    if (!this.boss && (this.gameTime >= this.bossSpawnTime || this.enemies.length === 0)) {
      this.boss = new Boss(this.game);
    }
    
    // ボスの更新
    if (this.boss) {
      this.boss.update(deltaTime);
      
      // ボスが倒されたらゲームクリア
      if (!this.boss.isActive) {
        // ゲームクリア処理
        setTimeout(() => {
          this.game.switchScreen('gameOver');
        }, 1000);
      }
    }
  }
  
  // プレイヤーの弾の更新
  updatePlayerBullets(deltaTime) {
    for (let i = 0; i < this.playerBullets.length; i++) {
      this.playerBullets[i].update(deltaTime);
    }
    
    // 無効になった弾を削除
    this.playerBullets = this.playerBullets.filter(bullet => bullet.isActive);
  }
  
  // 敵の弾の更新
  updateEnemyBullets(deltaTime) {
    for (let i = 0; i < this.enemyBullets.length; i++) {
      this.enemyBullets[i].update(deltaTime);
    }
    
    // 無効になった弾を削除
    this.enemyBullets = this.enemyBullets.filter(bullet => bullet.isActive);
  }
  
  // 衝突判定
  checkCollisions() {
    // プレイヤーの弾と敵の衝突
    for (const bullet of this.playerBullets) {
      // 敵との衝突
      for (const enemy of this.enemies) {
        if (bullet.collidesWith(enemy)) {
          if (enemy.takeDamage(bullet.damage)) {
            // 敵を倒した
            this.game.scoreManager.addScore(enemy.points);
            this.game.audioManager.play('explosion', 0.5);
          }
          
          // 貫通弾でなければ弾を無効化
          if (!bullet.penetrating) {
            bullet.isActive = false;
            break; // この弾は処理終了
          }
        }
      }
      
      // 弾が無効になっていたら次の弾へ
      if (!bullet.isActive) continue;
      
      // UFOとの衝突
      if (this.ufo && bullet.collidesWith(this.ufo)) {
        if (this.ufo.takeDamage(bullet.damage)) {
          // UFOを倒した
          this.game.scoreManager.addScore(this.ufo.points);
          this.game.audioManager.play('explosion', 0.7);
        }
        
        // 貫通弾でなければ弾を無効化
        if (!bullet.penetrating) {
          bullet.isActive = false;
        }
      }
      
      // 弾が無効になっていたら次の弾へ
      if (!bullet.isActive) continue;
      
      // ボスとの衝突
      if (this.boss && bullet.collidesWith(this.boss)) {
        if (this.boss.takeDamage(bullet.damage)) {
          // ボスを倒した
          this.game.scoreManager.addScore(this.boss.points);
          this.game.audioManager.play('explosion', 1.0);
        }
        
        // 貫通弾でなければ弾を無効化
        if (!bullet.penetrating) {
          bullet.isActive = false;
        }
      }
    }
    
    // 敵の弾とプレイヤーの衝突
    if (this.player) {
      for (const bullet of this.enemyBullets) {
        if (bullet.collidesWith(this.player)) {
          // プレイヤーがダメージを受ける
          this.handleGameOver();
          bullet.isActive = false;
        }
      }
      
      // 敵とプレイヤーの衝突
      for (const enemy of this.enemies) {
        // 敵が下まで降りてきた場合
        if (enemy.y + enemy.height / 2 > this.player.y - this.player.height / 2) {
          this.handleGameOver();
          break;
        }
        
        // プレイヤーと敵の直接衝突
        if (this.checkEntityCollision(this.player, enemy)) {
          this.handleGameOver();
          break;
        }
      }
    }
  }
  
  // エンティティ同士の衝突判定
  checkEntityCollision(entity1, entity2) {
    // 矩形の衝突判定
    return (
      entity1.x - entity1.width / 2 < entity2.x + entity2.width / 2 &&
      entity1.x + entity1.width / 2 > entity2.x - entity2.width / 2 &&
      entity1.y - entity1.height / 2 < entity2.y + entity2.height / 2 &&
      entity1.y + entity1.height / 2 > entity2.y - entity2.height / 2
    );
  }
  
  // ゲーム状態の確認
  checkGameState() {
    // ゲームクリア条件（すべての敵を倒し、ボスも倒した）
    if (this.enemies.length === 0 && this.boss === null) {
      // ボスがまだ出現していない場合は待機
      if (this.gameTime < this.bossSpawnTime) {
        return;
      }
    }
  }
  
  // ゲームオーバー処理
  handleGameOver() {
    if (this.gameOver) return; // 既にゲームオーバー状態なら何もしない
    
    this.gameOver = true;
    this.game.audioManager.play('explosion', 1.0);
    
    // プレイヤーを非表示にする
    if (this.player) {
      this.player.isActive = false;
    }
    
    // 少し待ってからゲームオーバー画面へ
    setTimeout(() => {
      this.game.switchScreen('gameOver');
    }, 1500);
  }
  
  // 描画処理
  render(ctx) {
    // 背景の描画
    this.drawBackground(ctx);
    
    // プレイヤーの描画
    if (this.player) {
      this.player.render(ctx);
    }
    
    // 敵の描画
    for (const enemy of this.enemies) {
      enemy.render(ctx);
    }
    
    // UFOの描画
    if (this.ufo) {
      this.ufo.render(ctx);
    }
    
    // ボスの描画
    if (this.boss) {
      this.boss.render(ctx);
    }
    
    // プレイヤーの弾の描画
    for (const bullet of this.playerBullets) {
      bullet.render(ctx);
    }
    
    // 敵の弾の描画
    for (const bullet of this.enemyBullets) {
      bullet.render(ctx);
    }
  }
  
  // 背景の描画
  drawBackground(ctx) {
    // 黒い背景
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 星空の描画
    this.drawStarfield(ctx);
  }
  
  // 星空の描画
  drawStarfield(ctx) {
    // 星の数
    const starCount = 100;
    
    // 星の描画
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const size = Math.random() * 2 + 1;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // プレイヤーの弾を追加
  addBullet(bullet) {
    this.playerBullets.push(bullet);
  }
  
  // 敵の弾を追加
  addEnemyBullet(bullet) {
    this.enemyBullets.push(bullet);
  }
  
  // スコア表示の作成
  createScoreDisplay() {
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'score-display';
    
    const score = this.game.scoreManager.getScore();
    const highScore = this.game.scoreManager.getHighScore();
    
    scoreDisplay.innerHTML = `ハイスコア: ${highScore}<br>スコア: ${score}`;
    
    document.body.appendChild(scoreDisplay);
    this.scoreDisplay = scoreDisplay;
  }
  
  // スコア表示の更新
  updateScoreDisplay() {
    if (this.scoreDisplay) {
      const score = this.game.scoreManager.getScore();
      const highScore = this.game.scoreManager.getHighScore();
      
      this.scoreDisplay.innerHTML = `ハイスコア: ${highScore}<br>スコア: ${score}`;
    }
  }
  
  // スコア表示の削除
  removeScoreDisplay() {
    if (this.scoreDisplay && this.scoreDisplay.parentNode) {
      this.scoreDisplay.parentNode.removeChild(this.scoreDisplay);
    }
  }
  
  // チャージバーの作成
  createChargeBar() {
    const chargeBarContainer = document.createElement('div');
    chargeBarContainer.className = 'special-charge';
    
    const chargeBar = document.createElement('div');
    chargeBar.className = 'charge-bar';
    
    chargeBarContainer.appendChild(chargeBar);
    document.body.appendChild(chargeBarContainer);
    
    this.chargeBar = {
      container: chargeBarContainer,
      bar: chargeBar
    };
  }
  
  // チャージバーの更新
  updateChargeBar() {
    if (this.chargeBar && this.player) {
      if (this.player.isCharging) {
        this.chargeBar.container.style.display = 'block';
        const chargePercent = Math.min(this.player.chargeTime / this.player.requiredChargeTime, 1) * 100;
        this.chargeBar.bar.style.width = `${chargePercent}%`;
        
        if (this.player.specialReady) {
          this.chargeBar.bar.style.backgroundColor = '#ffcc00';
        } else {
          this.chargeBar.bar.style.backgroundColor = '#ffffff';
        }
      } else {
        this.chargeBar.container.style.display = 'none';
      }
    }
  }
  
  // チャージバーの削除
  removeChargeBar() {
    if (this.chargeBar && this.chargeBar.container.parentNode) {
      this.chargeBar.container.parentNode.removeChild(this.chargeBar.container);
    }
  }
}
