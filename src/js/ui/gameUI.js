/**
 * ゲームUI管理モジュール
 * SPDX-License-Identifier: MIT
 */

import { GameConfig } from '../config/gameConfig.js';
import { UIUtils } from '../utils/uiUtils.js';

export class GameUI {
  constructor(game, canvas) {
    this.game = game;
    this.canvas = canvas;
    
    // UI要素
    this.highScoreDisplay = null;
    this.currentScoreDisplay = null;
    this.versionDisplay = null;
    this.specialUsesContainer = null;
    this.specialIcons = [];
    this.warningMessage = null;
  }
  
  /**
   * UI要素の作成
   */
  createUI() {
    const gameContainer = document.getElementById('game-container');
    
    // ハイスコア表示
    if (GameConfig.UI.SHOW_HIGH_SCORE) {
      this.highScoreDisplay = this.createHighScoreDisplay();
      this.appendToContainer(this.highScoreDisplay, gameContainer);
    }
    
    // 現在のスコア表示
    this.currentScoreDisplay = this.createCurrentScoreDisplay();
    this.appendToContainer(this.currentScoreDisplay, gameContainer);
    
    // バージョン表示
    this.versionDisplay = UIUtils.createVersionDisplay();
    document.body.appendChild(this.versionDisplay);
    
    // 必殺技残弾アイコン表示
    this.createSpecialUsesDisplay();
    this.appendToContainer(this.specialUsesContainer, gameContainer);
  }
  
  /**
   * ハイスコア表示の作成
   */
  createHighScoreDisplay() {
    const display = document.createElement('div');
    display.className = 'high-score-display';
    
    const highScore = this.game.scoreManager.getHighScore();
    display.textContent = `HI SCORE: ${highScore}`;
    
    Object.assign(display.style, {
      fontSize: '14px',
      position: 'absolute',
      top: 'calc(50% - 320px + 20px)',
      left: 'calc(50% - 180px + 20px)',
      color: '#ffffff',
      zIndex: '1000'
    });
    
    return display;
  }
  
  /**
   * 現在のスコア表示の作成
   */
  createCurrentScoreDisplay() {
    const display = document.createElement('div');
    display.className = 'current-score-display';
    
    const currentScore = this.game.scoreManager.getScore();
    display.textContent = `SCORE: ${currentScore}`;
    
    Object.assign(display.style, {
      fontSize: '14px',
      position: 'absolute',
      top: 'calc(50% - 320px + 20px)',
      right: 'calc(50% - 180px + 20px)',
      color: '#ffffff',
      zIndex: '1000'
    });
    
    return display;
  }
  
  /**
   * 必殺技残弾表示の作成
   */
  createSpecialUsesDisplay() {
    this.specialUsesContainer = document.createElement('div');
    this.specialUsesContainer.className = 'special-uses-container';
    
    Object.assign(this.specialUsesContainer.style, {
      position: 'absolute',
      top: 'calc(50% - 320px + 15px)',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '2px',
      zIndex: '1000'
    });
    
    this.specialIcons = [];
    for (let i = 0; i < GameConfig.PLAYER.MAX_SPECIAL_USES; i++) {
      const img = document.createElement('img');
      img.src = './src/assets/img/bullet/player_A_special_01.png';
      Object.assign(img.style, {
        width: '24px',
        height: '24px'
      });
      
      this.specialUsesContainer.appendChild(img);
      this.specialIcons.push(img);
    }
    
    this.updateSpecialUsesIcons();
  }
  
  /**
   * 必殺技残弾アイコンの更新
   */
  updateSpecialUsesIcons() {
    // GameScreenから直接プレイヤー情報を取得するように修正
    const gameScreen = this.game.screens['game'];
    if (!gameScreen || !gameScreen.player) return;
    
    const remainingUses = gameScreen.player.specialUses;
    
    this.specialIcons.forEach((icon, index) => {
      icon.style.opacity = index < remainingUses ? '1.0' : '0.3';
    });
  }
  
  /**
   * 警告メッセージの表示
   */
  showWarning(message, duration = 3000) {
    this.hideWarning();
    
    this.warningMessage = document.createElement('div');
    this.warningMessage.className = 'warning-message';
    this.warningMessage.textContent = message;
    
    Object.assign(this.warningMessage.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(255, 0, 0, 0.8)',
      color: '#ffffff',
      padding: '10px 20px',
      borderRadius: '5px',
      fontSize: '18px',
      fontWeight: 'bold',
      zIndex: '2000',
      animation: 'pulse 1s infinite'
    });
    
    document.body.appendChild(this.warningMessage);
    
    setTimeout(() => {
      this.hideWarning();
    }, duration);
  }
  
  /**
   * 警告メッセージの非表示
   */
  hideWarning() {
    if (this.warningMessage) {
      this.warningMessage.remove();
      this.warningMessage = null;
    }
  }
  
  /**
   * UIの更新
   */
  updateUI() {
    // スコア表示の更新
    if (this.currentScoreDisplay) {
      const currentScore = this.game.scoreManager.getScore();
      this.currentScoreDisplay.textContent = `SCORE: ${currentScore}`;
    }
    
    if (this.highScoreDisplay) {
      const highScore = this.game.scoreManager.getHighScore();
      this.highScoreDisplay.textContent = `HI SCORE: ${highScore}`;
    }
    
    // 必殺技残弾アイコンの更新
    this.updateSpecialUsesIcons();
  }
  
  /**
   * 既存UIの非表示
   */
  hideExistingUI() {
    const existingUI = document.getElementById('game-ui');
    if (existingUI) {
      existingUI.style.display = 'none';
    }
    
    if (this.canvas) {
      this.canvas.style.display = 'block';
    }
  }
  
  /**
   * UI要素の削除
   */
  removeUI() {
    const elementsToRemove = [
      this.currentScoreDisplay,
      this.versionDisplay,
      this.specialUsesContainer,
      this.warningMessage
    ];
    
    if (GameConfig.UI.SHOW_HIGH_SCORE && this.highScoreDisplay) {
      elementsToRemove.push(this.highScoreDisplay);
    }
    
    UIUtils.removeElements(...elementsToRemove.filter(el => el));
    
    // 参照をクリア
    this.highScoreDisplay = null;
    this.currentScoreDisplay = null;
    this.versionDisplay = null;
    this.warningMessage = null;
    this.specialUsesContainer = null;
    this.specialIcons = [];
  }
  
  /**
   * コンテナへの要素追加
   */
  appendToContainer(element, container) {
    if (container) {
      container.appendChild(element);
    } else {
      document.body.appendChild(element);
    }
  }
}