/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.3
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
    console.log('タイトル画面にenterしました');
    
    // 既存のHTML UIを表示する
    const existingUI = document.getElementById('game-ui');
    if (existingUI) {
      console.log('既存のHTML UIを表示します');
      existingUI.style.display = 'flex';
    } else {
      // 既存UIがない場合は独自のUIを作成
      console.log('既存UIが見つからないため、独自のUIを作成します');
      this.createTitleUI();
    }
    
    this.createScoreDisplay();
    console.log('タイトル画面のUIを作成しました');
    
    // デバッグ情報更新
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) debugInfo.textContent = 'タイトル画面表示中';
  }
  
  // 画面から出る時の処理
  async exit() {
    console.log('タイトル画面からexitします');
    
    // 既存のHTML UIを非表示にする
    const existingUI = document.getElementById('game-ui');
    if (existingUI) {
      console.log('既存のHTML UIを非表示にします');
      existingUI.style.display = 'none';
    } else {
      // 独自のUIを削除
      this.removeTitleUI();
    }
    
    this.removeScoreDisplay();
    
    // デバッグ情報更新
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) debugInfo.textContent = 'タイトル画面から移動中';
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
    
    // バージョン情報の描画
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    
    // package.jsonから取得したバージョンを表示
    const version = '0.1.3'; // 現在のバージョン
    ctx.fillText(`CNPインベーダー v${version}`, 10, 30);
    
    console.log('タイトル画面を描画しました');
  }
  
  // タイトル画面のUI作成
  createTitleUI() {
    console.log('タイトル画面のUI作成開始');
    try {
      // 既存のタイトル画面があれば削除
      const existingTitleScreen = document.querySelector('.title-screen');
      if (existingTitleScreen) {
        existingTitleScreen.remove();
      }
      
      // タイトル画面のコンテナ
      const titleScreen = document.createElement('div');
      titleScreen.className = 'title-screen';
      titleScreen.style.position = 'absolute';
      titleScreen.style.top = '0';
      titleScreen.style.left = '0';
      titleScreen.style.width = '100%';
      titleScreen.style.height = '100%';
      titleScreen.style.display = 'flex';
      titleScreen.style.flexDirection = 'column';
      titleScreen.style.justifyContent = 'center';
      titleScreen.style.alignItems = 'center';
      titleScreen.style.color = '#FFFFFF';
      titleScreen.style.zIndex = '10';
      
      // ゲームタイトル
      const title = document.createElement('h1');
      title.className = 'game-title';
      title.textContent = 'CNP インベーダー';
      title.style.fontSize = '32px';
      title.style.margin = '0 0 5px 0';
      title.style.textAlign = 'center';
      
      // バージョン表示
      const version = document.createElement('div');
      version.className = 'game-version';
      version.textContent = 'v0.1.3';
      version.style.fontSize = '16px';
      version.style.margin = '0 0 20px 0';
      version.style.textAlign = 'center';
      version.style.color = '#AAA';
      
      // メニューボタンのコンテナ
      const menuButtons = document.createElement('div');
      menuButtons.className = 'menu-buttons';
      menuButtons.style.display = 'flex';
      menuButtons.style.flexDirection = 'column';
      menuButtons.style.gap = '10px';
      
      // ボタンの共通スタイル関数
      const styleButton = (btn) => {
        btn.style.padding = '10px 20px';
        btn.style.fontSize = '18px';
        btn.style.backgroundColor = '#333';
        btn.style.color = '#FFF';
        btn.style.border = '1px solid #666';
        btn.style.borderRadius = '5px';
        btn.style.cursor = 'pointer';
        btn.style.width = '200px';
        btn.style.textAlign = 'center';
      };
      
      // スタートボタン
      const startBtn = document.createElement('button');
      startBtn.className = 'menu-btn';
      startBtn.textContent = 'ゲーム開始';
      styleButton(startBtn);
      startBtn.addEventListener('click', () => {
        console.log('ゲーム開始ボタンがクリックされました');
        this.game.switchScreen('game');
      });
      
      // 操作説明ボタン
      const instructionsBtn = document.createElement('button');
      instructionsBtn.className = 'menu-btn';
      instructionsBtn.textContent = '操作説明';
      styleButton(instructionsBtn);
      instructionsBtn.addEventListener('click', () => {
        console.log('操作説明ボタンがクリックされました');
        this.game.switchScreen('instructions');
      });
      
      // クレジットボタン
      const creditsBtn = document.createElement('button');
      creditsBtn.className = 'menu-btn';
      creditsBtn.textContent = 'クレジット';
      styleButton(creditsBtn);
      creditsBtn.addEventListener('click', () => {
        console.log('クレジットボタンがクリックされました');
        alert('CNP インベーダー\nVersion 0.1.3\n 2025 All Rights Reserved');
      });
      
      // 要素の追加
      menuButtons.appendChild(startBtn);
      menuButtons.appendChild(instructionsBtn);
      menuButtons.appendChild(creditsBtn);
      
      titleScreen.appendChild(title);
      titleScreen.appendChild(version);
      titleScreen.appendChild(menuButtons);
      
      // ゲームコンテナに追加
      const gameContainer = document.getElementById('game-container');
      if (gameContainer) {
        gameContainer.appendChild(titleScreen);
        console.log('タイトル画面をゲームコンテナに追加しました');
      } else {
        console.error('ゲームコンテナが見つかりません');
        // 代替としてbodyに追加
        document.body.appendChild(titleScreen);
        console.log('タイトル画面をbodyに追加しました');
      }
      
      // メンバ変数に保存
      this.titleElement = titleScreen;
      this.menuContainer = menuButtons;
      this.startButton = startBtn;
      this.instructionsButton = instructionsBtn;
      this.creditsButton = creditsBtn;
      
      // デバッグ情報更新
      const debugInfo = document.getElementById('debug-info');
      if (debugInfo) debugInfo.textContent = 'タイトル画面UI作成完了';
      
      console.log('タイトル画面のUI作成完了');
    } catch (error) {
      console.error('タイトル画面のUI作成エラー:', error);
      
      // デバッグ情報更新
      const debugInfo = document.getElementById('debug-info');
      if (debugInfo) debugInfo.textContent = `エラー: タイトル画面UI作成失敗 - ${error.message}`;
    }
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
  
  // 星空の描画関数は削除しました
}
