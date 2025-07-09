/**
 * UI連携モジュール
 * SPDX-License-Identifier: MIT
 */

export class UIConnector {
  /**
   * 既存のUIボタンとの連携設定
   * @param {Game} game - ゲームインスタンス
   * @param {HTMLCanvasElement} canvas - キャンバス要素
   */
  static setupExistingUI(game, canvas) {
    // ゲームUI要素を非表示に
    const gameUI = document.getElementById('game-ui');
    if (gameUI) {
      gameUI.style.display = 'none';
    }
    
    // スタートボタンの設定
    this.setupStartButton(game, canvas);
    
    // 操作説明ボタンの設定
    this.setupInstructionsButton(game);
  }
  
  /**
   * スタートボタンの設定
   * @param {Game} game - ゲームインスタンス
   * @param {HTMLCanvasElement} canvas - キャンバス要素
   */
  static setupStartButton(game, canvas) {
    const startBtn = document.getElementById('start-btn');
    
    if (!startBtn) {
      console.error('スタートボタンが見つかりません');
      return;
    }
    
    startBtn.onclick = function(event) {
      event.preventDefault();
      
      try {
        // デバッグ情報更新
        const debugInfo = document.getElementById('debug-info');
        if (debugInfo) debugInfo.textContent = 'ゲーム画面に切り替え中...';
        
        // 既存のUIを非表示に
        const gameUI = document.getElementById('game-ui');
        if (gameUI) {
          gameUI.style.display = 'none';
        }
        
        // キャンバスを表示
        if (canvas) {
          canvas.style.display = 'block';
        }
        
        // ゲーム画面に切り替え
        game.switchScreen('game');
      } catch (error) {
        console.error('ゲーム画面切り替えエラー:', error);
        alert('エラーが発生しました: ' + error.message);
      }
      
      return false;
    };
  }
  
  /**
   * 操作説明ボタンの設定
   * @param {Game} game - ゲームインスタンス
   */
  static setupInstructionsButton(game) {
    const instructionsBtn = document.getElementById('instructions-btn');
    
    if (instructionsBtn) {
      instructionsBtn.addEventListener('click', () => {
        game.switchScreen('instructions');
      });
    }
  }
}