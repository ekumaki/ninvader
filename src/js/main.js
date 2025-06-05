/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.0
 * SPDX-License-Identifier: MIT
 */

import { Game } from './game.js';
import { TitleScreen } from './screens/titleScreen.js';
import { GameScreen } from './screens/gameScreen.js';
import { InstructionsScreen } from './screens/instructionsScreen.js';
import { GameOverScreen } from './screens/gameOverScreen.js';
import { AudioManager } from './managers/audioManager.js';

// ゲームの初期化
document.addEventListener('DOMContentLoaded', () => {
  // ゲームキャンバスの設定
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  
  // キャンバスサイズの設定（レスポンシブ対応）
  const resizeCanvas = () => {
    // 基本サイズ
    const baseWidth = 360;
    const baseHeight = 640;
    
    // 画面サイズに合わせてスケーリング
    const windowRatio = window.innerWidth / window.innerHeight;
    const gameRatio = baseWidth / baseHeight;
    
    let width, height;
    
    if (windowRatio < gameRatio) {
      width = window.innerWidth;
      height = width / gameRatio;
    } else {
      height = window.innerHeight;
      width = height * gameRatio;
    }
    
    // キャンバスサイズ設定
    canvas.width = baseWidth;
    canvas.height = baseHeight;
    
    // CSSでスケーリング
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  };
  
  // 初期リサイズとリサイズイベント設定
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // オーディオマネージャーの初期化
  const audioManager = new AudioManager();
  
  // ゲームインスタンスの作成
  const game = new Game(canvas, ctx, audioManager);
  
  // 画面の初期化
  game.addScreen('title', new TitleScreen(game));
  game.addScreen('game', new GameScreen(game));
  game.addScreen('instructions', new InstructionsScreen(game));
  game.addScreen('gameOver', new GameOverScreen(game));
  
  // タイトル画面から開始
  game.switchScreen('title');
  
  // ゲームループの開始
  game.start();
});
