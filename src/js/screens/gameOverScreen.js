/**
 * CNP インベーダー - ゲームオーバー画面（リファクタリング版）
 * Version: 0.1.5
 * SPDX-License-Identifier: MIT
 */

import { GameConfig } from '../config/gameConfig.js';
import { UIUtils } from '../utils/uiUtils.js';

export class GameOverScreen {
  constructor(game) {
    this.game = game;
    this.canvas = game.canvas;
    this.ctx = game.ctx;
    
    // UI要素
    this.versionDisplay = null;
    this.scoreDisplay = null;
  }
  
  // 画面に入る時の処理
  enter() {
    console.log('ゲームオーバー画面に入りました');
    
    // キャンバスを非表示にしてHTML UIを表示
    if (this.canvas) {
      this.canvas.style.display = 'none';
    }
    
    // UI要素の作成
    this.createUI();
    
    const gameOverContainer = document.getElementById('game-over-container');
    if (gameOverContainer) {
      gameOverContainer.style.display = 'block';
    }
    
    // スコア情報を更新
    this.updateScoreInfo();
  }
  
  // 画面から出る時の処理
  exit() {
    console.log('ゲームオーバー画面から退出します');
    
    // UI要素の削除
    this.removeUI();
    
    const gameOverContainer = document.getElementById('game-over-container');
    if (gameOverContainer) {
      gameOverContainer.style.display = 'none';
    }
  }
  
  // UI要素の作成
  createUI() {
    // バージョン表示
    this.versionDisplay = UIUtils.createVersionDisplay();
    document.body.appendChild(this.versionDisplay);
    
    // スコア表示
    this.scoreDisplay = UIUtils.createScoreDisplay(this.game.scoreManager);
    this.scoreDisplay.style.top = '80px';
    this.scoreDisplay.style.left = '50%';
    this.scoreDisplay.style.transform = 'translateX(-50%)';
    this.scoreDisplay.style.textAlign = 'center';
    document.body.appendChild(this.scoreDisplay);
  }
  
  // UI要素の削除
  removeUI() {
    UIUtils.removeElements(this.versionDisplay, this.scoreDisplay);
    this.versionDisplay = null;
    this.scoreDisplay = null;
  }
  
  // スコア情報の更新
  updateScoreInfo() {
    const finalScore = this.game.scoreManager.getScore();
    const highScore = this.game.scoreManager.getHighScore();
    
    // HTMLの要素を更新
    const finalScoreEl = document.getElementById('final-score');
    const highScoreEl = document.getElementById('high-score');
    const newHighScoreEl = document.getElementById('new-high-score');
    
    if (finalScoreEl) {
      finalScoreEl.textContent = finalScore;
    }
    
    if (highScoreEl) {
      highScoreEl.textContent = highScore;
    }
    
    // 最高スコア更新時の表示
    if (finalScore === highScore && finalScore > 0 && newHighScoreEl) {
      newHighScoreEl.style.display = 'block';
    }
  }
}
