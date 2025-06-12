/**
 * CNP インベーダー - ゲーム画面（リファクタリング版）
 * Version: 0.2.6
 * SPDX-License-Identifier: MIT
 */

import { Player } from '../entities/player.js';
import { Enemy } from '../entities/enemy.js';
import { UFO } from '../entities/ufo.js';
import { Boss } from '../entities/boss.js';
import { GameConfig } from '../config/gameConfig.js';
import { CollisionSystem } from '../systems/collisionSystem.js';
import { FormationSystem } from '../systems/formationSystem.js';
import { UIUtils } from '../utils/uiUtils.js';

export class GameScreen {
  constructor(game) {
    this.game = game;
    this.canvas = game.canvas;
    this.ctx = game.ctx;
    
    // システムの初期化
    this.collisionSystem = new CollisionSystem(game);
    this.formationSystem = new FormationSystem(this.canvas);
    
    // ゲーム要素
    this.player = null;
    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.ufo = null;
    this.boss = null;
    
    // ゲーム状態
    this.gameTime = 0;
    this.gameOver = false;
    this.gameCleared = false;
    this.collisionEnabled = false;
    this.enemyRespawnScheduled = false;
    
    // ボス出現タイマー
    this.bossSpawnTimer = 0;
    this.bossSpawnScheduled = false;
    
    // UI要素
    this.scoreDisplay = null;
    this.versionDisplay = null;
    this.chargeBar = null;
    this.warningMessage = null;
  }
  
  // 画面に入る時の処理
  async enter() {
    try {
      console.log('ゲーム画面に入りました');
      
      // 既存UIの非表示
      this.hideExistingUI();
      
      // ゲームの初期化
      this.initializeGame();
      
      // UI要素の作成
      this.createUI();
      
      // 衝突判定の遅延有効化
      setTimeout(() => {
        this.collisionEnabled = true;
        console.log('衝突判定を有効化しました');
      }, 1000);
      
      console.log('ゲーム画面の初期化が完了しました');
    } catch (error) {
      console.error('ゲーム画面の初期化エラー:', error);
      this.handleInitializationError(error);
    }
  }
  
  // 画面から出る時の処理
  exit() {
    console.log('ゲーム画面から退出します');
    
    try {
      this.removeUI();
      console.log('ゲーム画面からの退出が完了しました');
    } catch (error) {
      console.error('ゲーム画面の終了エラー:', error);
    }
  }
  
  // 既存UIの非表示
  hideExistingUI() {
    const existingUI = document.getElementById('game-ui');
    if (existingUI) {
      existingUI.style.display = 'none';
    }
    
    if (this.canvas) {
      this.canvas.style.display = 'block';
    }
  }
  
  // ゲーム初期化
  initializeGame() {
    // プレイヤーの作成（画面下端から50px上に配置）
    this.player = new Player(
      this.game,
      this.canvas.width / 2,
      this.canvas.height - 50
    );
    
    // 敵の配置
    this.createEnemies();
    
    // 配列の初期化
    this.playerBullets = [];
    this.enemyBullets = [];
    this.ufo = null;
    this.boss = null;
    
    // ゲーム状態のリセット
    this.gameTime = 0;
    this.gameOver = false;
    this.gameCleared = false;
    this.enemyRespawnScheduled = false;
    this.collisionEnabled = false;
    
    // ボス出現タイマーのリセット
    this.bossSpawnTimer = 0;
    this.bossSpawnScheduled = false;
    
    // 編隊システムのリセット
    this.formationSystem.reset();
    
    // スコアのリセット
    this.game.scoreManager.resetScore();
    
    console.log('ゲーム初期化完了');
  }
  
  // 敵の配置
  createEnemies() {
    this.enemies = [];
    
    const marginX = 70;
    const usableWidth = this.canvas.width - marginX * 2;
    const enemySpacing = usableWidth / (GameConfig.ENEMY.COLS - 1 || 7);
    
    for (let row = 0; row < (GameConfig.ENEMY.ROWS || 5); row++) {
      for (let col = 0; col < (GameConfig.ENEMY.COLS || 8); col++) {
        const x = marginX + col * enemySpacing;
        const y = 120 + row * 50; // UFO（64px）と重ならないよう120pxから開始
        
        const enemy = new Enemy(this.game, x, y);
        this.enemies.push(enemy);
      }
    }
    
    console.log(`敵を配置しました: ${this.enemies.length}体`);
  }
  
  // UI要素の作成
  createUI() {
    const gameContainer = document.getElementById('game-container');
    
    // ハイスコア表示（ゲームキャンバス内の左上）- 将来の実装用に保持
    if (GameConfig.UI.SHOW_HIGH_SCORE) {
      this.highScoreDisplay = document.createElement('div');
      this.highScoreDisplay.className = 'high-score-display';
      const highScore = this.game.scoreManager.getHighScore();
      this.highScoreDisplay.textContent = `HI SCORE: ${highScore}`;
      this.highScoreDisplay.style.fontSize = '14px';
      this.highScoreDisplay.style.position = 'absolute';
      this.highScoreDisplay.style.top = 'calc(50% - 320px + 20px)';
      this.highScoreDisplay.style.left = 'calc(50% - 180px + 20px)';
      this.highScoreDisplay.style.color = '#ffffff';
      this.highScoreDisplay.style.zIndex = '1000';
      if (gameContainer) {
        gameContainer.appendChild(this.highScoreDisplay);
      } else {
        document.body.appendChild(this.highScoreDisplay);
      }
    }

    // 現在のスコア表示（ゲームキャンバス内の右上）
    this.currentScoreDisplay = document.createElement('div');
    this.currentScoreDisplay.className = 'current-score-display';
    const currentScore = this.game.scoreManager.getScore();
    this.currentScoreDisplay.textContent = `SCORE: ${currentScore}`;
    this.currentScoreDisplay.style.fontSize = '14px';
    this.currentScoreDisplay.style.position = 'absolute';
    this.currentScoreDisplay.style.top = 'calc(50% - 320px + 20px)';
    this.currentScoreDisplay.style.right = 'calc(50% - 180px + 20px)';
    this.currentScoreDisplay.style.color = '#ffffff';
    this.currentScoreDisplay.style.zIndex = '1000';
    if (gameContainer) {
      gameContainer.appendChild(this.currentScoreDisplay);
    } else {
      document.body.appendChild(this.currentScoreDisplay);
    }
    
    // バージョン表示
    this.versionDisplay = UIUtils.createVersionDisplay();
    document.body.appendChild(this.versionDisplay);
    
    // チャージバー
    this.createChargeBar();
  }
  
  // UI要素の削除
  removeUI() {
    const elementsToRemove = [this.currentScoreDisplay, this.versionDisplay, this.chargeBar];
    if (GameConfig.UI.SHOW_HIGH_SCORE && this.highScoreDisplay) {
      elementsToRemove.push(this.highScoreDisplay);
    }
    if (this.warningMessage) {
      elementsToRemove.push(this.warningMessage);
    }
    UIUtils.removeElements(...elementsToRemove);
    this.highScoreDisplay = null;
    this.currentScoreDisplay = null;
    this.versionDisplay = null;
    this.chargeBar = null;
    this.warningMessage = null;
  }
  
  // 更新処理
  update(deltaTime) {
    if (this.gameOver || this.gameCleared) return;
    
    this.gameTime += deltaTime;
    
    // プレイヤーの更新
    if (this.player) {
      this.player.update(deltaTime);
    }
    
    // 敵の更新（編隊移動システム使用）
    if (!this.boss) {
      this.formationSystem.update(deltaTime, this.enemies);
    }
    
    // その他の更新
    this.updateUFO(deltaTime);
    this.updateBoss(deltaTime);
    this.updateBullets(deltaTime);
    
    // 衝突判定
    if (this.collisionEnabled) {
      this.collisionSystem.checkAllCollisions(this);
    }
    
    // ボス出現タイマーの更新
    this.updateBossSpawnTimer(deltaTime);
    
    // ゲーム状態の確認
    this.checkGameState();
    
    // UI更新
    this.updateUI();
  }
  
  // UFOの更新
  updateUFO(deltaTime) {
    if (this.ufo) {
      this.ufo.update(deltaTime);
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
    // ボスの更新
    if (this.boss) {
      this.boss.update(deltaTime);
      
      if (!this.boss.isActive) {
        console.log('ボスを倒しました！ゲームクリア！');
        this.gameCleared = true; // ゲームクリアフラグを設定
        this.boss = null;
        // スコア追加は衝突判定で既に行われているため削除
        // this.game.scoreManager.addScore(GameConfig.SCORE.BOSS_KILL);
        // this.updateScoreDisplay();
        
        // ゲームクリア画面へ遷移
        setTimeout(() => {
          this.game.switchScreen('gameClear');
        }, 1000);
      }
    }
  }
  
  // 弾の更新
  updateBullets(deltaTime) {
    // プレイヤーの弾
    for (let i = 0; i < this.playerBullets.length; i++) {
      this.playerBullets[i].update(deltaTime);
    }
    this.playerBullets = this.playerBullets.filter(bullet => bullet.isActive);
    
    // 敵の弾
    for (let i = 0; i < this.enemyBullets.length; i++) {
      this.enemyBullets[i].update(deltaTime);
    }
    this.enemyBullets = this.enemyBullets.filter(bullet => bullet.isActive);
  }
  
  // ボス出現タイマーの更新
  updateBossSpawnTimer(deltaTime) {
    if (this.bossSpawnScheduled) {
      this.bossSpawnTimer += deltaTime;
      
      // 3.5秒経過したらボスを出現させる
      if (this.bossSpawnTimer >= 3.5) {
        console.log('ボスが出現します！');
        this.boss = new Boss(this.game);
        this.bossSpawnScheduled = false;
        this.bossSpawnTimer = 0;
        // 警告メッセージを削除
        this.removeWarningMessage();
      }
    }
  }
  
  // ゲーム状態の確認
  checkGameState() {
    // ゲームクリア済みの場合は何もしない
    if (this.gameCleared) return;
    
    // 敵が全滅した場合 → ボス出現タイマー開始
    if (this.enemies.length === 0 && !this.boss && !this.enemyRespawnScheduled && !this.bossSpawnScheduled) {
      console.log('敵を全滅させました！3.5秒後にボスが出現します');
      this.bossSpawnScheduled = true;
      this.bossSpawnTimer = 0;
      // 警告メッセージを表示
      this.createWarningMessage();
    }
  }
  
  // ゲームオーバー処理
  handleGameOver() {
    if (this.gameTime < 2 || this.gameOver) return;
    
    console.log('ゲームオーバーが発生しました');
    this.gameOver = true;
    
    if (this.player) {
      this.player.isActive = false;
    }
    
    setTimeout(() => {
      this.game.switchScreen('gameOver');
    }, 1000);
  }
  
  // 初期化エラー処理
  handleInitializationError(error) {
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) {
      debugInfo.textContent = `エラー: ゲーム画面初期化失敗 - ${error.message}`;
    }
    
    this.ctx.fillStyle = '#FF0000';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('初期化エラーが発生しました:', 10, 50);
    this.ctx.fillText(error.message, 10, 80);
  }
  
  // 描画処理
  render(ctx) {
    try {
      // 背景の描画
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // エンティティの描画
      this.renderEntities(ctx);
      
      // デバッグ情報の描画
      if (this.gameTime > 0) {
        this.renderDebugInfo(ctx);
      }
      
    } catch (error) {
      console.error('ゲーム画面の描画エラー:', error);
      this.renderError(ctx, error);
    }
  }
  
  // エンティティの描画
  renderEntities(ctx) {
    // プレイヤー
    if (this.player) {
      this.player.render(ctx);
    }
    
    // 敵
    for (const enemy of this.enemies) {
      enemy.render(ctx);
    }
    
    // UFO
    if (this.ufo) {
      this.ufo.render(ctx);
    }
    
    // ボス
    if (this.boss) {
      this.boss.render(ctx);
    }
    
    // 弾
    for (const bullet of this.playerBullets) {
      bullet.render(ctx);
    }
    
    for (const bullet of this.enemyBullets) {
      bullet.render(ctx);
    }
  }
  
  // デバッグ情報の描画
  renderDebugInfo(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px Arial';
    
    ctx.fillText(`敵: ${this.enemies.length}`, 10, 20);
    ctx.fillText(`弾: ${this.playerBullets.length}`, 10, 40);
    ctx.fillText(`敵弾: ${this.enemyBullets.length}`, 10, 60);
    
    const minutes = Math.floor(this.gameTime / 60);
    const seconds = Math.floor(this.gameTime % 60);
    ctx.fillText(`時間: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`, 10, 80);
    
    if (this.player) {
      ctx.fillText(`プレイヤー: X=${Math.round(this.player.x)}, Y=${Math.round(this.player.y)}`, 10, 100);
    }
    
    const score = this.game.scoreManager.getScore();
    const highScore = this.game.scoreManager.getHighScore();
    ctx.fillText(`スコア: ${score}`, 10, 120);
    ctx.fillText(`ハイスコア: ${highScore}`, 10, 140);
  }
  
  // エラー描画
  renderError(ctx, error) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#FF0000';
    ctx.font = '16px Arial';
    ctx.fillText('描画エラーが発生しました:', 10, 50);
    ctx.fillText(error.message, 10, 80);
  }
  
  // 弾の追加
  addBullet(bullet) {
    this.playerBullets.push(bullet);
  }
  
  addEnemyBullet(bullet) {
    this.enemyBullets.push(bullet);
  }
  
  // UI更新
  updateUI() {
    this.updateChargeBar();
    this.updateScoreDisplay();
  }
  
  // チャージバーの作成
  createChargeBar() {
    this.chargeBar = document.createElement('div');
    this.chargeBar.className = 'charge-bar';
    this.chargeBar.style.position = 'absolute';
    this.chargeBar.style.bottom = '20px';
    this.chargeBar.style.left = '10px';
    this.chargeBar.style.width = '200px';
    this.chargeBar.style.height = '10px';
    this.chargeBar.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    this.chargeBar.style.border = '1px solid #fff';
    this.chargeBar.style.display = 'none';
    this.chargeBar.style.zIndex = '1000';
    
    document.body.appendChild(this.chargeBar);
  }
  
  // チャージバーの更新
  updateChargeBar() {
    if (!this.chargeBar || !this.player) return;
    
    if (this.player.isCharging) {
      this.chargeBar.style.display = 'block';
      const chargePercent = Math.min(this.player.chargeTime / this.player.requiredChargeTime, 1);
      this.chargeBar.style.background = `linear-gradient(to right, ${
        this.player.specialReady ? '#ffcc00' : '#ffffff'
      } ${chargePercent * 100}%, rgba(255, 255, 255, 0.3) ${chargePercent * 100}%)`;
    } else {
      this.chargeBar.style.display = 'none';
    }
  }

  // 警告メッセージの作成
  createWarningMessage() {
    // 既存の警告メッセージがあれば削除
    if (this.warningMessage) {
      this.removeWarningMessage();
    }

    // 警告メッセージコンテナ
    this.warningMessage = document.createElement('div');
    this.warningMessage.className = 'boss-warning-message';
    this.warningMessage.style.cssText = `
      position: absolute;
      top: calc(50% - 100px);
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100px;
      z-index: 2000;
      font-family: 'Arial Black', Arial, sans-serif;
      font-weight: bold;
      user-select: none;
      pointer-events: none;
      overflow: hidden;
      animation: blink 0.4s ease-in-out infinite alternate;
    `;

    // 幅をゲームキャンバスに合わせて調整
    const margin = 20;
    if (this.canvas) {
      const msgWidth = this.canvas.width - margin * 2;
      if (msgWidth > 0) {
        this.warningMessage.style.width = `${msgWidth}px`;
      }
    }

    // 上のストライプ帯
    const topStripe = document.createElement('div');
    topStripe.className = 'warning-stripe-top';
    topStripe.style.cssText = `
      position: absolute;
      top: 0;
      left: -100%;
      width: 300%;
      height: 20px;
      background: repeating-linear-gradient(
        45deg,
        #ff0000 0px,
        #ff0000 15px,
        transparent 15px,
        transparent 30px
      );
      animation: scrollRight 2s linear infinite;
    `;

    // 下のストライプ帯
    const bottomStripe = document.createElement('div');
    bottomStripe.className = 'warning-stripe-bottom';
    bottomStripe.style.cssText = `
      position: absolute;
      bottom: 0;
      right: -100%;
      width: 300%;
      height: 20px;
      background: repeating-linear-gradient(
        45deg,
        #ff0000 0px,
        #ff0000 15px,
        transparent 15px,
        transparent 30px
      );
      animation: scrollLeft 2s linear infinite;
    `;

    // 警告テキスト
    const warningText = document.createElement('div');
    warningText.className = 'warning-text';
    warningText.textContent = 'WARNING';
    warningText.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 32px;
      color: #ff0000;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      animation: blink 0.4s ease-in-out infinite alternate;
      letter-spacing: 4px;
    `;

    // CSS アニメーションを追加
    if (!document.querySelector('#warning-animations')) {
      const style = document.createElement('style');
      style.id = 'warning-animations';
      style.textContent = `
        @keyframes scrollRight {
          0% { transform: translateX(0); }
          100% { transform: translateX(50px); }
        }
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50px); }
        }
        @keyframes blink {
          0% { opacity: 0.8; }
          100% { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    // 要素を組み立て
    this.warningMessage.appendChild(topStripe);
    this.warningMessage.appendChild(warningText);
    this.warningMessage.appendChild(bottomStripe);

    // ゲームコンテナに追加
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.appendChild(this.warningMessage);
    } else {
      document.body.appendChild(this.warningMessage);
    }

    console.log('警告メッセージを表示しました');
  }

  // 警告メッセージの削除
  removeWarningMessage() {
    if (this.warningMessage && this.warningMessage.parentNode) {
      this.warningMessage.parentNode.removeChild(this.warningMessage);
      this.warningMessage = null;
      console.log('警告メッセージを削除しました');
    }
  }
  
  // スコア表示の更新
  updateScoreDisplay() {
    if (GameConfig.UI.SHOW_HIGH_SCORE && this.highScoreDisplay) {
      const highScore = this.game.scoreManager.getHighScore();
      this.highScoreDisplay.textContent = `HI SCORE: ${highScore}`;
    }
    
    if (this.currentScoreDisplay) {
      const currentScore = this.game.scoreManager.getScore();
      this.currentScoreDisplay.textContent = `SCORE: ${currentScore}`;
    }
  }
}
