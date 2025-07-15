/**
 * CNP インベーダー - メインエントリーポイント（TypeScript版）
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

import { GameEngine } from './core/GameEngine';
import { InputManager } from './core/InputManager';
import { GameConfig } from './core/config';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';
import { OptionScene } from './scenes/OptionScene';
import { GameOverScene } from './scenes/GameOverScene';
import { GameClearScene } from './scenes/GameClearScene';

// アプリケーション初期化
class Application {
  private gameEngine: GameEngine;
  private inputManager: InputManager;
  
  constructor() {
    // Canvas要素の取得
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }
    
    // Canvas要素にフォーカスを設定
    canvas.focus();
    
    // Canvas要素のクリックでフォーカスを再設定
    canvas.addEventListener('click', () => {
      canvas.focus();
      console.log('Canvas focused by click');
    });
    
    // コアシステム初期化
    this.gameEngine = new GameEngine(canvas, GameConfig);
    this.inputManager = new InputManager();
    
    // シーンの登録
    this.registerScenes();
    
    // 初期シーンの設定
    this.gameEngine.switchToScene('title');
    
    console.log('Application initialized');
  }
  
  private registerScenes(): void {
    // ゲームシーン
    const gameScene = new GameScene(this.gameEngine, this.inputManager);
    this.gameEngine.addScene('game', gameScene);
    
    // オプションシーン
    const optionScene = new OptionScene(this.gameEngine, this.inputManager);
    this.gameEngine.addScene('option', optionScene);
    
    // タイトルシーン（GameSceneへの参照を渡す）
    const titleScene = new TitleScene(this.gameEngine, this.inputManager, gameScene);
    this.gameEngine.addScene('title', titleScene);
    
    // ゲームオーバーシーン
    const gameOverScene = new GameOverScene(this.gameEngine, this.inputManager);
    this.gameEngine.addScene('gameOver', gameOverScene);
    
    // ゲームクリアシーン
    const gameClearScene = new GameClearScene(this.gameEngine, this.inputManager);
    this.gameEngine.addScene('gameClear', gameClearScene);
  }
  
  start(): void {
    console.log('Starting CNP Invader v' + GameConfig.VERSION);
    this.gameEngine.start();
  }
  
  stop(): void {
    this.gameEngine.stop();
    this.inputManager.destroy();
  }
}

// DOM読み込み完了後にアプリケーション開始
document.addEventListener('DOMContentLoaded', () => {
  try {
    const app = new Application();
    app.start();
    
    // ページがアンロードされる際のクリーンアップ
    window.addEventListener('beforeunload', () => {
      app.stop();
    });
    
  } catch (error) {
    console.error('Failed to initialize application:', error);
    
    // エラー表示
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ff4444;
      color: white;
      padding: 20px;
      border-radius: 8px;
      font-family: monospace;
      z-index: 1000;
    `;
    errorDiv.textContent = `初期化エラー: ${error.message}`;
    document.body.appendChild(errorDiv);
  }
});

// モジュールのエクスポート（テスト用）
export { Application };