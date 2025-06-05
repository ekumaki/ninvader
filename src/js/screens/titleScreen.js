/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.0
 * SPDX-License-Identifier: MIT
 */

export class TitleScreen {
  constructor(game) {
    this.game = game;
    this.canvas = game.canvas;
    this.ctx = game.ctx;
    
    // タイトル画面のUI要素
    this.titleElement = null;
    this.menuContainer = null;
    this.startButton = null;
    this.instructionsButton = null;
    this.creditsButton = null;
    
    // スコア表示
    this.scoreDisplay = null;
  }
  
  // 画面に入る時の処理
  enter() {
    this.createTitleUI();
    this.createScoreDisplay();
  }
  
  // 画面から出る時の処理
  exit() {
    this.removeTitleUI();
    this.removeScoreDisplay();
  }
  
  // 更新処理
  update(deltaTime) {
    // タイトル画面では特に更新処理はない
  }
  
  // 描画処理
  render(ctx) {
    // 背景の描画
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 星空の描画
    this.drawStarfield(ctx);
  }
  
  // タイトル画面のUI作成
  createTitleUI() {
    // タイトル画面のコンテナ
    const titleScreen = document.createElement('div');
    titleScreen.className = 'title-screen';
    
    // ゲームタイトル
    const title = document.createElement('h1');
    title.className = 'game-title';
    title.textContent = 'CNP インベーダー';
    
    // メニューボタンのコンテナ
    const menuButtons = document.createElement('div');
    menuButtons.className = 'menu-buttons';
    
    // スタートボタン
    const startBtn = document.createElement('button');
    startBtn.className = 'menu-btn';
    startBtn.textContent = 'ゲーム開始';
    startBtn.addEventListener('click', () => {
      this.game.switchScreen('game');
    });
    
    // 操作説明ボタン
    const instructionsBtn = document.createElement('button');
    instructionsBtn.className = 'menu-btn';
    instructionsBtn.textContent = '操作説明';
    instructionsBtn.addEventListener('click', () => {
      this.game.switchScreen('instructions');
    });
    
    // クレジットボタン（任意）
    const creditsBtn = document.createElement('button');
    creditsBtn.className = 'menu-btn';
    creditsBtn.textContent = 'クレジット';
    creditsBtn.addEventListener('click', () => {
      alert('CNP インベーダー\nVersion 0.1.0\n© 2025 All Rights Reserved');
    });
    
    // 要素の追加
    menuButtons.appendChild(startBtn);
    menuButtons.appendChild(instructionsBtn);
    menuButtons.appendChild(creditsBtn);
    
    titleScreen.appendChild(title);
    titleScreen.appendChild(menuButtons);
    
    document.body.appendChild(titleScreen);
    
    // 参照を保存
    this.titleElement = titleScreen;
    this.menuContainer = menuButtons;
    this.startButton = startBtn;
    this.instructionsButton = instructionsBtn;
    this.creditsButton = creditsBtn;
  }
  
  // タイトル画面のUI削除
  removeTitleUI() {
    if (this.titleElement && this.titleElement.parentNode) {
      this.titleElement.parentNode.removeChild(this.titleElement);
    }
  }
  
  // スコア表示の作成
  createScoreDisplay() {
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'score-display';
    
    const highScore = this.game.scoreManager.getHighScore();
    scoreDisplay.innerHTML = `ハイスコア: ${highScore}`;
    
    document.body.appendChild(scoreDisplay);
    this.scoreDisplay = scoreDisplay;
  }
  
  // スコア表示の削除
  removeScoreDisplay() {
    if (this.scoreDisplay && this.scoreDisplay.parentNode) {
      this.scoreDisplay.parentNode.removeChild(this.scoreDisplay);
    }
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
}
