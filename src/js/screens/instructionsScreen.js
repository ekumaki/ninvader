/**
 * CNP インベーダー - 説明画面（リファクタリング版）
 * Version: 0.2.0
 * SPDX-License-Identifier: MIT
 */

import { GameConfig } from '../config/gameConfig.js';
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
  }
  
  // UI要素の削除
  removeUI() {
    UIUtils.removeElements(this.versionDisplay);
    this.versionDisplay = null;
  }
}
