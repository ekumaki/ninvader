/**
 * CNP インベーダー - UIユーティリティ
 * Version: 0.1.5
 * SPDX-License-Identifier: MIT
 */

import { GameConfig } from '../config/gameConfig.js';

export class UIUtils {
  // 共通ボタンスタイルの適用
  static styleButton(button, options = {}) {
    const defaults = {
      padding: '10px 20px',
      fontSize: '18px',
      backgroundColor: '#333',
      color: '#FFF',
      border: '1px solid #666',
      borderRadius: '5px',
      cursor: 'pointer',
      width: '200px',
      textAlign: 'center'
    };
    
    const styles = { ...defaults, ...options };
    
    Object.assign(button.style, styles);
    
    // ホバー効果
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#555';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = styles.backgroundColor;
    });
  }

  // スコア表示の作成
  static createScoreDisplay(scoreManager, options = {}) {
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'score-display';
    
    const score = scoreManager.getScore();
    const highScore = scoreManager.getHighScore();
    
    scoreDisplay.innerHTML = options.format === 'title' 
      ? `ハイスコア: ${highScore}`
      : `スコア: ${score}<br>ハイスコア: ${highScore}`;
    
    // スタイル適用
    const defaultStyle = {
      position: 'absolute',
      top: '10px',
      left: '10px',
      color: 'white',
      fontSize: GameConfig.UI.SCORE_FONT_SIZE,
      zIndex: '1000',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: '5px 10px',
      borderRadius: '3px'
    };
    
    const styles = { ...defaultStyle, ...options.style };
    Object.assign(scoreDisplay.style, styles);
    
    return scoreDisplay;
  }

  // バージョン表示の作成
  static createVersionDisplay(options = {}) {
    const versionDisplay = document.createElement('div');
    versionDisplay.className = 'version-display';
    versionDisplay.textContent = `v${GameConfig.VERSION}`;
    
    // スタイル適用
    const defaultStyle = {
      position: 'absolute',
      top: '10px',
      right: '10px',
      color: GameConfig.UI.VERSION_COLOR,
      fontSize: GameConfig.UI.VERSION_FONT_SIZE,
      zIndex: '1000',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: '3px 8px',
      borderRadius: '3px'
    };
    
    const styles = { ...defaultStyle, ...options.style };
    Object.assign(versionDisplay.style, styles);
    
    return versionDisplay;
  }

  // ハイスコア表示の作成（タイトル画面用）
  static createHighScoreDisplay(scoreManager, options = {}) {
    const highScoreDisplay = document.createElement('div');
    highScoreDisplay.className = 'high-score-display';
    
    const highScore = scoreManager.getHighScore();
    highScoreDisplay.textContent = `ハイスコア: ${highScore}`;
    
    // スタイル適用
    const defaultStyle = {
      fontSize: '18px',
      margin: '10px 0',
      textAlign: 'center',
      color: GameConfig.UI.HIGHSCORE_COLOR
    };
    
    const styles = { ...defaultStyle, ...options.style };
    Object.assign(highScoreDisplay.style, styles);
    
    return highScoreDisplay;
  }

  // 要素の安全な削除
  static removeElement(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }

  // 複数要素の安全な削除
  static removeElements(...elements) {
    elements.forEach(element => this.removeElement(element));
  }

  // コンテナの作成
  static createContainer(className, styles = {}) {
    const container = document.createElement('div');
    container.className = className;
    
    Object.assign(container.style, styles);
    
    return container;
  }

  // メニューボタンコンテナの作成
  static createMenuButtonContainer() {
    return this.createContainer('menu-buttons', {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    });
  }
} 