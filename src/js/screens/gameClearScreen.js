/**
 * CNP インベーダー - ゲームクリア画面
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

import { GameConfig } from '../config/gameConfig.js';

export class GameClearScreen {
  constructor(game) {
    this.game = game;
    this.canvas = game.canvas;
    this.ctx = game.ctx;
    
    // プレイヤーアニメーション用
    this.playerX = this.canvas.width / 2;
    this.playerY = this.canvas.height - 50; // 下部配置
    this.playerWidth = 48;
    this.playerHeight = 72;
    this.jumpOffset = 0;
    this.jumpDirection = 1;
    this.jumpSpeed = 1.5;
    this.maxJumpHeight = 25;
    
    // UI要素
    this.clearUI = null;
    
    // プレイヤー画像（正面向き）
    this.playerImage = new Image();
    this.playerImage.src = './src/assets/img/player/player_A_front.png';
  }
  
  // 画面に入る時の処理
  enter() {
    console.log('ゲームクリア画面にenterしました');
    this.createClearUI();
  }
  
  // 画面から出る時の処理  
  async exit() {
    console.log('ゲームクリア画面からexitします');
    this.removeClearUI();
  }
  
  // 更新処理
  update(_deltaTime) {
    // プレイヤージャンプアニメーション
    this.jumpOffset += this.jumpDirection * this.jumpSpeed;
    
    if (this.jumpOffset >= this.maxJumpHeight || this.jumpOffset <= 0) {
      this.jumpDirection *= -1;
    }
    
    this.jumpOffset = Math.max(0, Math.min(this.maxJumpHeight, this.jumpOffset));
  }
  
  // 描画処理
  render(ctx) {
    // 背景の描画
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // タイトル表示
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 GAME CLEAR! 🎉', this.canvas.width / 2, 100);
    
    // スコア表示
    const score = this.game.scoreManager.getScore();
    const highScore = this.game.scoreManager.getHighScore();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.fillText(`SCORE: ${score}`, this.canvas.width / 2, 160);
    
    // ハイスコア更新チェック
    if (score >= highScore) {
      ctx.fillStyle = '#FFD700';
      ctx.font = '18px Arial';
      ctx.fillText('🏆 NEW HIGH SCORE! 🏆', this.canvas.width / 2, 190);
    }
    
    // 喜ぶプレイヤーの描画
    if (this.playerImage.complete) {
      ctx.drawImage(
        this.playerImage,
        this.playerX - this.playerWidth / 2,
        this.playerY - this.playerHeight / 2 - this.jumpOffset,
        this.playerWidth,
        this.playerHeight
      );
    }
    
    console.log('ゲームクリア画面を描画しました');
  }
  
  // クリア画面UI作成
  createClearUI() {
    // 既存のクリア画面があれば削除
    const existingClearScreen = document.querySelector('.game-clear-screen');
    if (existingClearScreen) {
      existingClearScreen.remove();
    }
    
    // クリア画面のコンテナ
    const clearScreen = document.createElement('div');
    clearScreen.className = 'game-clear-screen';
    clearScreen.style.position = 'absolute';
    clearScreen.style.top = '50%';
    clearScreen.style.left = '50%';
    clearScreen.style.transform = 'translate(-50%, -50%)';
    clearScreen.style.width = '360px';
    clearScreen.style.height = '640px';
    clearScreen.style.display = 'flex';
    clearScreen.style.flexDirection = 'column';
    clearScreen.style.justifyContent = 'center';
    clearScreen.style.alignItems = 'center';
    clearScreen.style.color = '#FFFFFF';
    clearScreen.style.zIndex = '10';
    
    // ボタンコンテナ（縦並び）
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
    clearScreen.appendChild(buttonContainer);
    
    // ゲームコンテナに追加
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.appendChild(clearScreen);
    } else {
      document.body.appendChild(clearScreen);
    }
    
    this.clearUI = clearScreen;
  }
  
  // クリア画面UI削除
  removeClearUI() {
    if (this.clearUI && this.clearUI.parentNode) {
      this.clearUI.parentNode.removeChild(this.clearUI);
    }
  }
} 