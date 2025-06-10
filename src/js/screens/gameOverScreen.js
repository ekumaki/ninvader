/**
 * CNP インベーダー - ゲームオーバー画面
 * Version: 0.2.2
 * SPDX-License-Identifier: MIT
 */

import { GameConfig } from '../config/gameConfig.js';

export class GameOverScreen {
  constructor(game) {
    this.game = game;
    this.canvas = game.canvas;
    this.ctx = game.ctx;
    
    // UI要素
    this.gameOverUI = null;
  }
  
  // 画面に入る時の処理
  enter() {
    console.log('ゲームオーバー画面にenterしました');
    this.createGameOverUI();
  }
  
  // 画面から出る時の処理
  async exit() {
    console.log('ゲームオーバー画面からexitします');
    this.removeGameOverUI();
  }
  
  // 更新処理（アニメーションなし）
  update(deltaTime) {
    // ゲームオーバー画面では特にアニメーションは不要
  }
  
  // 描画処理
  render(ctx) {
    // 背景の描画
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // タイトル表示（ゲームクリア画面と同じ位置 y=100）
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💀 GAME OVER 💀', this.canvas.width / 2, 100);
    
    // スコア表示（ゲームクリア画面と同じ位置 y=160）
    const score = this.game.scoreManager.getScore();
    const highScore = this.game.scoreManager.getHighScore();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.fillText(`スコア: ${score}`, this.canvas.width / 2, 160);
    
    // ハイスコア更新チェック（ゲームクリア画面と同じ位置 y=190）
    if (score >= highScore) {
      ctx.fillStyle = '#FFD700';
      ctx.font = '18px Arial';
      ctx.fillText('🏆 NEW HIGH SCORE! 🏆', this.canvas.width / 2, 190);
    }
    
    console.log('ゲームオーバー画面を描画しました');
  }
  
  // ゲームオーバー画面UI作成
  createGameOverUI() {
    // 既存のゲームオーバー画面があれば削除
    const existingGameOverScreen = document.querySelector('.game-over-screen');
    if (existingGameOverScreen) {
      existingGameOverScreen.remove();
    }
    
    // ゲームオーバー画面のコンテナ
    const gameOverScreen = document.createElement('div');
    gameOverScreen.className = 'game-over-screen';
    gameOverScreen.style.position = 'absolute';
    gameOverScreen.style.top = '50%';
    gameOverScreen.style.left = '50%';
    gameOverScreen.style.transform = 'translate(-50%, -50%)';
    gameOverScreen.style.width = '360px';
    gameOverScreen.style.height = '640px';
    gameOverScreen.style.display = 'flex';
    gameOverScreen.style.flexDirection = 'column';
    gameOverScreen.style.justifyContent = 'center';
    gameOverScreen.style.alignItems = 'center';
    gameOverScreen.style.color = '#FFFFFF';
    gameOverScreen.style.zIndex = '10';
    
    // ボタンコンテナ（縦並び、ゲームクリア画面と同じ位置）
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexDirection = 'column';
    buttonContainer.style.gap = '15px';
    buttonContainer.style.marginTop = '250px';
    
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
      btn.style.transition = 'background-color 0.3s';
      
      // ホバー効果
      btn.addEventListener('mouseenter', () => {
        btn.style.backgroundColor = '#555';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.backgroundColor = '#333';
      });
    };
    
    // リトライボタン
    const retryBtn = document.createElement('button');
    retryBtn.textContent = 'リトライ';
    styleButton(retryBtn);
    retryBtn.addEventListener('click', () => {
      console.log('リトライボタンがクリックされました');
      this.game.switchScreen('game');
    });
    
    // タイトルへ戻るボタン
    const titleBtn = document.createElement('button');
    titleBtn.textContent = 'タイトルへもどる';
    styleButton(titleBtn);
    titleBtn.addEventListener('click', () => {
      console.log('タイトルへ戻るボタンがクリックされました');
      this.game.switchScreen('title');
    });
    
    // 要素の追加
    buttonContainer.appendChild(retryBtn);
    buttonContainer.appendChild(titleBtn);
    gameOverScreen.appendChild(buttonContainer);
    
    // ゲームコンテナに追加
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.appendChild(gameOverScreen);
    } else {
      document.body.appendChild(gameOverScreen);
    }
    
    this.gameOverUI = gameOverScreen;
  }
  
  // ゲームオーバー画面UI削除
  removeGameOverUI() {
    if (this.gameOverUI && this.gameOverUI.parentNode) {
      this.gameOverUI.parentNode.removeChild(this.gameOverUI);
    }
  }
}
