/**
 * デバッグ設定モジュール
 * SPDX-License-Identifier: MIT
 */

export class DebugSetup {
  /**
   * デバッグ用キーボードショートカットの設定
   */
  static setupKeyboardShortcuts() {
    // 開発モードでのみ有効
    if (!import.meta.env.DEV) {
      console.log('📦 本番モード: デバッグ機能は無効化されています');
      return;
    }
    
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
  }
  
  /**
   * デバッグ情報の更新
   * @param {string} message - 表示メッセージ
   */
  static updateDebugInfo(message) {
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) {
      debugInfo.textContent = message;
    }
  }
}