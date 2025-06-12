/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

import { Game } from './game.js';
import { TitleScreen } from './screens/titleScreen.js';
import { GameScreen } from './screens/gameScreen.js';
import { InstructionsScreen } from './screens/instructionsScreen.js';
import { GameOverScreen } from './screens/gameOverScreen.js';
import { GameClearScreen } from './screens/gameClearScreen.js';
import { AudioManager } from './managers/audioManager.js';
import { GameConfig } from './config/gameConfig.js';

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
    
    // オーディオマネージャーの初期化（設定で無効化可能）
    const audioManager = new AudioManager({ enabled: GameConfig.AUDIO.ENABLED });
    console.log('オーディオマネージャー初期化完了');
    
    if (debugInfo) debugInfo.textContent = 'ゲームインスタンス作成中...';
    
    // ゲームインスタンスの作成
    const game = new Game(canvas, ctx, audioManager);
    
    // グローバルに公開して他のスクリプトからアクセス可能にする
    window.gameInstance = game;
    window.game = game; // 別名でも公開しておく
    
    // グローバル変数が正しく設定されたか確認
    console.log('グローバル変数を設定しました:', window.gameInstance ? '成功' : '失敗');
    console.log('ゲームインスタンス作成完了');
    
    if (debugInfo) debugInfo.textContent = '画面初期化中...';
    
    // 画面の初期化
    game.addScreen('title', new TitleScreen(game));
    game.addScreen('game', new GameScreen(game));
    game.addScreen('instructions', new InstructionsScreen(game));
    game.addScreen('gameOver', new GameOverScreen(game));
    game.addScreen('gameClear', new GameClearScreen(game));
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
      // スタートボタンの取得と確認
      console.log('スタートボタンを探しています...');
      const startBtn = document.getElementById('start-btn');
      console.log('スタートボタンの取得結果:', startBtn ? '成功' : '失敗');
      
      if (startBtn) {
        console.log('スタートボタンにイベントリスナーを設定します');
        
        // 直接クリックイベントを設定
        startBtn.onclick = function(event) {
          event.preventDefault();
          console.log('スタートボタンがクリックされました - onclickイベント');
          
          // デバッグ情報更新
          const debugInfo = document.getElementById('debug-info');
          if (debugInfo) debugInfo.textContent = 'ゲーム画面に切り替え中...';
          
          try {
            // 既存のUIを非表示に
            const gameUI = document.getElementById('game-ui');
            if (gameUI) {
              console.log('UIを非表示にします');
              gameUI.style.display = 'none';
            }
            
            // キャンバスを表示
            if (canvas) {
              console.log('キャンバスを表示します');
              canvas.style.display = 'block';
            }
            
            // ゲーム画面に切り替え
            console.log('ゲーム画面に切り替えます');
            console.log('gameオブジェクト:', game);
            console.log('game.screens:', game.screens);
            console.log('game.screens["game"]:', game.screens['game']);
            
            // 当面は直接呼び出し
            game.switchScreen('game');
            console.log('ゲーム画面への切り替えが完了しました');
          } catch (error) {
            console.error('ゲーム画面切り替えエラー:', error);
            alert('エラーが発生しました: ' + error.message);
          }
          
          return false; // イベントの伝播を停止
        };
        
        console.log('スタートボタンにonclickイベントを設定しました');
      } else {
        console.error('スタートボタンが見つかりません');
        alert('スタートボタンが見つかりません');
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
    
    // ===========================================
    // 🛠️ デバッグ用キーボードショートカット
    // ===========================================
    // 開発モードでのみ有効（本番では完全に無効化）
    if (import.meta.env.DEV) {
      console.log('🛠️ デバッグモード: キーボードショートカットを有効化');
      console.log('  F1: ゲームクリア画面');
      console.log('  F2: ゲームオーバー画面');
      console.log('  F3: ゲーム画面');
      console.log('  F4: タイトル画面');
      
      document.addEventListener('keydown', (event) => {
        // ゲームインスタンスが存在することを確認
        if (!window.gameInstance) {
          console.warn('🛠️ デバッグ: ゲームインスタンスが見つかりません');
          return;
        }
        
        switch(event.key) {
          case 'F1':
            event.preventDefault();
            console.log('🛠️ デバッグ: F1 - ゲームクリア画面に遷移');
            window.gameInstance.switchScreen('gameClear');
            break;
            
          case 'F2':
            event.preventDefault();
            console.log('🛠️ デバッグ: F2 - ゲームオーバー画面に遷移');
            window.gameInstance.switchScreen('gameOver');
            break;
            
          case 'F3':
            event.preventDefault();
            console.log('🛠️ デバッグ: F3 - ゲーム画面に遷移');
            window.gameInstance.switchScreen('game');
            break;
            
          case 'F4':
            event.preventDefault();
            console.log('🛠️ デバッグ: F4 - タイトル画面に遷移');
            window.gameInstance.switchScreen('title');
            break;
        }
      });
    } else {
      console.log('📦 本番モード: デバッグ機能は無効化されています');
    }
    // ===========================================
    
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
