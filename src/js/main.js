/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.2
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
  try {
    console.log('DOMが読み込まれました - ゲーム初期化開始');
    
    // デバッグ情報表示用
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) debugInfo.textContent = 'ゲーム初期化中...';
    
    // キャンバスの設定
    const canvas = document.getElementById('game-canvas');
    console.log('キャンバス要素取得:', canvas);
    
    if (!canvas) {
      console.error('キャンバス要素が見つかりません');
      if (debugInfo) debugInfo.textContent = 'エラー: キャンバス要素が見つかりません';
      return;
    }
    
    const ctx = canvas.getContext('2d');
    console.log('キャンバスコンテキスト取得:', ctx);
    
    if (!ctx) {
      console.error('キャンバスコンテキストが取得できません');
      if (debugInfo) debugInfo.textContent = 'エラー: キャンバスコンテキストが取得できません';
      return;
    }
    
    // デバッグ用のテキスト描画
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.fillText('ゲーム初期化中...', 10, 50);
    
    if (debugInfo) debugInfo.textContent = 'オーディオマネージャー初期化中...';
    
    // オーディオマネージャーの初期化
    const audioManager = new AudioManager();
    console.log('オーディオマネージャー初期化完了');
    
    if (debugInfo) debugInfo.textContent = 'ゲームインスタンス作成中...';
    
    // ゲームインスタンスの作成
    const game = new Game(canvas, ctx, audioManager);
    console.log('ゲームインスタンス作成完了');
    
    if (debugInfo) debugInfo.textContent = '画面初期化中...';
    
    // 画面の初期化
    game.addScreen('title', new TitleScreen(game));
    game.addScreen('game', new GameScreen(game));
    game.addScreen('instructions', new InstructionsScreen(game));
    game.addScreen('gameOver', new GameOverScreen(game));
    console.log('画面初期化完了');
    
    // 既存のUIボタンとの連携
    const setupExistingUI = () => {
      // ゲームUI要素を非表示に
      const gameUI = document.getElementById('game-ui');
      if (gameUI) {
        // ゲームロジックが動作するように、既存のUIを非表示に
        gameUI.style.display = 'none';
      }
      
      // 既存のボタンとの連携
      const startBtn = document.getElementById('start-btn');
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          console.log('スタートボタンがクリックされました - ゲーム画面に切り替え');
          game.switchScreen('game');
        });
      }
      
      const instructionsBtn = document.getElementById('instructions-btn');
      if (instructionsBtn) {
        instructionsBtn.addEventListener('click', () => {
          console.log('操作説明ボタンがクリックされました - 説明画面に切り替え');
          game.switchScreen('instructions');
        });
      }
    };
    
    // 既存UIとの連携を設定
    setupExistingUI();
    
    if (debugInfo) debugInfo.textContent = 'タイトル画面に切り替え中...';
    
    // タイトル画面から開始
    console.log('タイトル画面に切り替えます');
    game.switchScreen('title');
    
    if (debugInfo) debugInfo.textContent = 'ゲームループ開始中...';
    
    // ゲームループの開始
    console.log('ゲームループを開始します');
    game.start();
    
    if (debugInfo) debugInfo.textContent = 'ゲーム初期化完了';
    console.log('ゲーム初期化完了');
    
  } catch (error) {
    console.error('ゲーム初期化エラー:', error);
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) debugInfo.textContent = `エラー: ${error.message}`;
    
    // エラー表示
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FF0000';
        ctx.font = '16px Arial';
        ctx.fillText('エラーが発生しました:', 10, 50);
        ctx.fillText(error.message, 10, 80);
      }
    }
  }
});
