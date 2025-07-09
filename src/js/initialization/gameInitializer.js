/**
 * ゲーム初期化統合モジュール
 * SPDX-License-Identifier: MIT
 */

import { Game } from '../game.js';
import { AudioManager } from '../managers/audioManager.js';
import { GameConfig } from '../config/gameConfig.js';
import { CanvasInitializer } from './canvasInitializer.js';
import { ScreenInitializer } from './screenInitializer.js';
import { UIConnector } from './uiConnector.js';
import { DebugSetup } from './debugSetup.js';

export class GameInitializer {
  /**
   * ゲーム全体の初期化
   */
  static async initialize() {
    try {
      console.log('DOMが読み込まれました - ゲーム初期化開始');
      
      // デバッグ情報初期化
      DebugSetup.updateDebugInfo('ゲーム初期化中...');
      
      // キャンバス初期化
      const canvasResult = CanvasInitializer.initialize();
      if (!canvasResult.success) {
        throw new Error(canvasResult.error);
      }
      
      const { canvas, ctx } = canvasResult;
      
      // オーディオマネージャー初期化
      DebugSetup.updateDebugInfo('オーディオマネージャー初期化中...');
      const audioManager = new AudioManager({ enabled: GameConfig.AUDIO.ENABLED });
      console.log('オーディオマネージャー初期化完了');
      
      // ゲームインスタンス作成
      DebugSetup.updateDebugInfo('ゲームインスタンス作成中...');
      const game = new Game(canvas, ctx, audioManager);
      
      // グローバル変数設定
      window.gameInstance = game;
      window.game = game;
      console.log('ゲームインスタンス作成完了');
      
      // 画面初期化
      DebugSetup.updateDebugInfo('画面初期化中...');
      ScreenInitializer.initialize(game);
      console.log('画面初期化完了');
      
      // UI連携設定
      UIConnector.setupExistingUI(game, canvas);
      
      // デバッグ設定
      DebugSetup.setupKeyboardShortcuts();
      
      // タイトル画面から開始
      DebugSetup.updateDebugInfo('タイトル画面に切り替え中...');
      game.switchScreen('title');
      
      // ゲームループ開始
      DebugSetup.updateDebugInfo('ゲームループ開始中...');
      game.start();
      
      DebugSetup.updateDebugInfo('ゲーム初期化完了');
      console.log('ゲーム初期化完了');
      
    } catch (error) {
      console.error('ゲーム初期化エラー:', error);
      DebugSetup.updateDebugInfo(`エラー: ${error.message}`);
      
      // エラー表示
      const canvas = document.getElementById('game-canvas');
      if (canvas) {
        CanvasInitializer.displayError(canvas, error.message);
      }
      
      throw error;
    }
  }
}