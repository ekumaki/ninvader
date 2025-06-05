/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.0
 * SPDX-License-Identifier: MIT
 */

import { InputManager } from './managers/inputManager.js';
import { ScoreManager } from './managers/scoreManager.js';

export class Game {
  constructor(canvas, ctx, audioManager) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.audioManager = audioManager;
    this.inputManager = new InputManager();
    this.scoreManager = new ScoreManager();
    
    this.screens = {};
    this.currentScreen = null;
    
    this.lastTime = 0;
    this.accumulator = 0;
    this.timeStep = 1000 / 60; // 60 FPS
    
    this.isRunning = false;
    
    // モバイルコントロールの設定
    this.setupMobileControls();
  }
  
  // 画面の追加
  addScreen(name, screen) {
    this.screens[name] = screen;
  }
  
  // 画面の切り替え
  switchScreen(name) {
    if (this.screens[name]) {
      if (this.currentScreen) {
        this.currentScreen.exit();
      }
      this.currentScreen = this.screens[name];
      this.currentScreen.enter();
    }
  }
  
  // ゲームループの開始
  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      requestAnimationFrame(this.gameLoop.bind(this));
    }
  }
  
  // ゲームループの停止
  stop() {
    this.isRunning = false;
  }
  
  // ゲームループ
  gameLoop(currentTime) {
    if (!this.isRunning) return;
    
    // 経過時間の計算
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // 時間の蓄積
    this.accumulator += deltaTime;
    
    // 固定タイムステップの更新
    while (this.accumulator >= this.timeStep) {
      if (this.currentScreen) {
        this.currentScreen.update(this.timeStep / 1000); // 秒単位に変換
      }
      this.accumulator -= this.timeStep;
    }
    
    // 描画
    if (this.currentScreen) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.currentScreen.render(this.ctx);
    }
    
    // 次のフレームをリクエスト
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  // モバイルコントロールの設定
  setupMobileControls() {
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnShoot = document.getElementById('btn-shoot');
    
    // 左ボタン
    if (btnLeft) {
      btnLeft.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.inputManager.setKey('ArrowLeft', true);
      });
      
      btnLeft.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.inputManager.setKey('ArrowLeft', false);
      });
    }
    
    // 右ボタン
    if (btnRight) {
      btnRight.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.inputManager.setKey('ArrowRight', true);
      });
      
      btnRight.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.inputManager.setKey('ArrowRight', false);
      });
    }
    
    // 発射ボタン
    if (btnShoot) {
      btnShoot.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.inputManager.setKey(' ', true); // スペースキーと同じ扱い
      });
      
      btnShoot.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.inputManager.setKey(' ', false);
      });
    }
  }
}
