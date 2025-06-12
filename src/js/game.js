/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 1.0.0
 * SPDX-License-Identifier: MIT
 */

import { InputManager } from './managers/inputManager.js';
import { ScoreManager } from './managers/scoreManager.js';

export class Game {
  constructor(canvas, ctx, audioManager) {
    console.log('Gameクラスのコンストラクタ開始');
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
    this.frameCount = 0;
    
    this.isRunning = false;
    
    // デバッグ用の初期描画
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('Gameクラス初期化完了', 10, 100);
    
    // モバイルコントロールの設定
    this.setupMobileControls();
    console.log('Gameクラスのコンストラクタ完了');
  }
  
  // 画面の追加
  addScreen(name, screen) {
    this.screens[name] = screen;
  }
  
  // 画面の切り替え
  async switchScreen(name) {
    console.log(`画面切り替え開始: ${name}`);
    console.log('利用可能な画面:', Object.keys(this.screens));
    
    try {
      if (!this.screens[name]) {
        console.error(`画面 "${name}" が見つかりません`);
        alert(`エラー: 画面 "${name}" が見つかりません`);
        return;
      }
      
      // 現在の画面から退出
      if (this.currentScreen) {
        console.log('現在の画面から退出:', this.currentScreen);
        try {
          await this.currentScreen.exit();
        } catch (error) {
          console.error('画面退出エラー:', error);
        }
      }
      
      // 新しい画面に切り替え
      this.currentScreen = this.screens[name];
      console.log(`新しい画面に入る: ${name}`, this.currentScreen);
      
      try {
        // 画面に入る処理を実行
        await this.currentScreen.enter();
        console.log(`画面 ${name} に正常に入りました`);
      } catch (error) {
        console.error(`画面 ${name} の初期化エラー:`, error);
        alert(`画面切り替えエラー: ${error.message}`);
      }
      
      // デバッグ情報更新
      const debugInfo = document.getElementById('debug-info');
      if (debugInfo) debugInfo.textContent = `画面切り替え完了: ${name}`;
    } catch (error) {
      console.error('画面切り替え中の予期せぬエラー:', error);
      alert(`画面切り替えエラー: ${error.message}`);
    }
  }
  
  // ゲームループの開始
  start() {
    console.log('ゲームループ開始');
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      requestAnimationFrame(this.gameLoop.bind(this));
      console.log('ゲームループ開始成功');
    }
  }
  
  // ゲームループの停止
  stop() {
    this.isRunning = false;
  }
  
  // ゲームループ
  gameLoop(currentTime) {
    try {
      if (!this.isRunning) return;
      
      // デバッグ情報更新
      const debugInfo = document.getElementById('debug-info');
      if (debugInfo && this.frameCount % 60 === 0) { // 1秒に1回更新
        debugInfo.textContent = `ゲーム実行中 - FPS: ${Math.round(1000 / (currentTime - this.lastTime))}`;
      }
      
      // 経過時間の計算
      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;
      
      // 時間の蔵積
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
      
      // フレームカウント更新
      this.frameCount++;
      
      // 次のフレームをリクエスト
      requestAnimationFrame(this.gameLoop.bind(this));
    } catch (error) {
      console.error('ゲームループエラー:', error);
      const debugInfo = document.getElementById('debug-info');
      if (debugInfo) debugInfo.textContent = `エラー: ${error.message}`;
      
      // エラー表示
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#FF0000';
      this.ctx.font = '16px Arial';
      this.ctx.fillText('ゲームループエラー:', 10, 50);
      this.ctx.fillText(error.message, 10, 80);
      
      // エラー後も続行する
      this.isRunning = true;
      requestAnimationFrame(this.gameLoop.bind(this));
    }
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
