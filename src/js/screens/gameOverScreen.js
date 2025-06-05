/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.0
 * SPDX-License-Identifier: MIT
 */

export class GameOverScreen {
  constructor(game) {
    this.game = game;
    this.canvas = game.canvas;
    this.ctx = game.ctx;
    
    // ゲームオーバー画面のUI要素
    this.gameOverElement = null;
    this.finalScoreElement = null;
    this.retryButton = null;
    this.titleButton = null;
  }
  
  // 画面に入る時の処理
  enter() {
    this.createGameOverUI();
  }
  
  // 画面から出る時の処理
  exit() {
    this.removeGameOverUI();
  }
  
  // 更新処理
  update(deltaTime) {
    // ゲームオーバー画面では特に更新処理はない
  }
  
  // 描画処理
  render(ctx) {
    // 背景の描画
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  // ゲームオーバー画面のUI作成
  createGameOverUI() {
    // ゲームオーバー画面のコンテナ
    const gameOverScreen = document.createElement('div');
    gameOverScreen.className = 'game-over';
    
    // タイトル
    const title = document.createElement('h2');
    title.textContent = 'ゲームオーバー';
    
    // 最終スコア
    const finalScore = document.createElement('div');
    finalScore.className = 'final-score';
    const score = this.game.scoreManager.getScore();
    finalScore.textContent = `最終スコア: ${score}`;
    
    // メニューボタンのコンテナ
    const menuButtons = document.createElement('div');
    menuButtons.className = 'menu-buttons';
    
    // リトライボタン
    const retryBtn = document.createElement('button');
    retryBtn.className = 'menu-btn';
    retryBtn.textContent = 'もう一度プレイ';
    retryBtn.addEventListener('click', () => {
      this.game.switchScreen('game');
    });
    
    // タイトルに戻るボタン
    const titleBtn = document.createElement('button');
    titleBtn.className = 'menu-btn';
    titleBtn.textContent = 'タイトルに戻る';
    titleBtn.addEventListener('click', () => {
      this.game.switchScreen('title');
    });
    
    // 要素の追加
    menuButtons.appendChild(retryBtn);
    menuButtons.appendChild(titleBtn);
    
    gameOverScreen.appendChild(title);
    gameOverScreen.appendChild(finalScore);
    gameOverScreen.appendChild(menuButtons);
    
    document.body.appendChild(gameOverScreen);
    
    // 参照を保存
    this.gameOverElement = gameOverScreen;
    this.finalScoreElement = finalScore;
    this.retryButton = retryBtn;
    this.titleButton = titleBtn;
  }
  
  // ゲームオーバー画面のUI削除
  removeGameOverUI() {
    if (this.gameOverElement && this.gameOverElement.parentNode) {
      this.gameOverElement.parentNode.removeChild(this.gameOverElement);
    }
  }
}
