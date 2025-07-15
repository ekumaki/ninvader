/**
 * CNP インベーダー - 説明画面（リファクタリング版）
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

import { UIUtils } from '../utils/uiUtils.js';

export class InstructionsScreen {
  constructor(game) {
    this.game = game;
    this.canvas = game.canvas;
    this.ctx = game.ctx;
    
    // UI要素
    this.versionDisplay = null;
  }
  
  // 画面に入る時の処理
  enter() {
    console.log('説明画面に入りました');
    
    // キャンバスを非表示にしてHTML UIを表示
    if (this.canvas) {
      this.canvas.style.display = 'none';
    }
    
    // UI要素の作成
    this.createUI();
    
    const instructionsContainer = document.getElementById('instructions-container');
    if (instructionsContainer) {
      instructionsContainer.style.display = 'block';
    }
  }
  
  // 画面から出る時の処理
  exit() {
    console.log('説明画面から退出します');
    
    // UI要素の削除
    this.removeUI();
    
    const instructionsContainer = document.getElementById('instructions-container');
    if (instructionsContainer) {
      instructionsContainer.style.display = 'none';
    }
  }
  
  // UI要素の作成
  createUI() {
    // バージョン表示
    this.versionDisplay = UIUtils.createVersionDisplay();
    document.body.appendChild(this.versionDisplay);
    
    // タイトルに戻るボタンを追加
    this.createBackButton();
  }
  
  // タイトルに戻るボタンの作成
  createBackButton() {
    const backButton = document.createElement('button');
    backButton.textContent = 'タイトルにもどる';
    backButton.style.position = 'fixed';
    backButton.style.bottom = '50px';
    backButton.style.left = '50%';
    backButton.style.transform = 'translateX(-50%)';
    backButton.style.padding = '10px 20px';
    backButton.style.fontSize = '16px';
    backButton.style.backgroundColor = '#333';
    backButton.style.color = '#FFF';
    backButton.style.border = '1px solid #666';
    backButton.style.borderRadius = '5px';
    backButton.style.cursor = 'pointer';
    backButton.style.zIndex = '1000';
    
    // ホバー効果
    backButton.addEventListener('mouseenter', () => {
      backButton.style.backgroundColor = '#555';
    });
    backButton.addEventListener('mouseleave', () => {
      backButton.style.backgroundColor = '#333';
    });
    
    // クリックイベント
    backButton.addEventListener('click', () => {
      this.game.switchScreen('title');
    });
    
    document.body.appendChild(backButton);
    this.backButton = backButton;
  }
  
  // UI要素の削除
  removeUI() {
    UIUtils.removeElements(this.versionDisplay);
    this.versionDisplay = null;
  }
}
