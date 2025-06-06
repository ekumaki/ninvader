/**
 * CNP インベーダー - 画面遷移修正スクリプト
 * Version: 0.1.2
 * SPDX-License-Identifier: MIT
 */

// 画面遷移を直接修正するスクリプト

console.log('画面遷移修正スクリプトが読み込まれました');

// ゲームインスタンスが利用可能になるまで定期的にチェック
function setupGameNavigation() {
  // スタートボタンを取得
  const startBtn = document.getElementById('start-btn');
  if (!startBtn) {
    console.error('スタートボタンが見つかりません');
    return;
  }
  
  console.log('スタートボタンが見つかりました - イベント設定');
  
  // 既存のイベントをクリア
  const newStartBtn = startBtn.cloneNode(true);
  startBtn.parentNode.replaceChild(newStartBtn, startBtn);
  
  // 新しいイベントを設定
  newStartBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('スタートボタンがクリックされました - 直接ゲーム画面に遷移します');
    
    try {
      // グローバルスコープの全てのゲーム関連インスタンスをチェック
      let gameInstance = window.gameInstance;
      
      // コンソールにグローバル変数を出力して確認
      console.log('グローバル変数:', Object.keys(window).filter(key => key.includes('game')));
      
      // 全てのグローバル変数をチェックしてゲームインスタンスを探す
      for (const key in window) {
        if (window[key] && typeof window[key] === 'object' && window[key].screens && window[key].switchScreen) {
          console.log('ゲームインスタンスを発見しました:', key);
          gameInstance = window[key];
          break;
        }
      }
      
      if (!gameInstance) {
        console.error('ゲームインスタンスが見つかりません');
        alert('ゲームインスタンスが見つかりません');
        return;
      }
      
      // UIを非表示
      const gameUI = document.getElementById('game-ui');
      if (gameUI) {
        gameUI.style.display = 'none';
      }
      
      // キャンバスを表示
      const canvas = document.getElementById('game-canvas');
      if (canvas) {
        canvas.style.display = 'block';
      }
      
      // 直接ゲーム画面に遷移
      console.log('ゲーム画面に遷移します', gameInstance);
      gameInstance.switchScreen('game');
      
      console.log('ゲーム画面への遷移が完了しました');
    } catch (error) {
      console.error('ゲーム画面遷移エラー:', error);
      alert('エラーが発生しました: ' + error.message);
    }
    
    return false;
  });
  
  console.log('スタートボタンのイベント設定が完了しました');
}

// ページ読み込み完了時に実行
document.addEventListener('DOMContentLoaded', () => {
  // 少し遅延させて他のスクリプトが読み込まれた後に実行
  setTimeout(() => {
    console.log('スタートボタンのイベントを設定します');
    setupGameNavigation();
  }, 1000); // 1秒遅延
});
