/**
 * 基底スクリーンクラス
 * SPDX-License-Identifier: MIT
 */

export class Screen {
  constructor(game) {
    this.game = game;
    this.canvas = game.canvas;
    this.ctx = game.ctx;
    this.elements = [];
    this.isActive = false;
  }
  
  /**
   * 画面に入る時の処理
   */
  async enter() {
    this.isActive = true;
    console.log(`${this.constructor.name} に入りました`);
  }
  
  /**
   * 画面から出る時の処理
   */
  exit() {
    this.isActive = false;
    this.removeAllElements();
    console.log(`${this.constructor.name} から退出しました`);
  }
  
  /**
   * 更新処理
   */
  update(_deltaTime) {
    // 基底クラスでは何もしない
  }
  
  /**
   * 描画処理
   */
  render(_ctx) {
    // 基底クラスでは何もしない
  }
  
  /**
   * 要素の追加
   */
  addElement(element) {
    this.elements.push(element);
    return element;
  }
  
  /**
   * 要素の削除
   */
  removeElement(element) {
    const index = this.elements.indexOf(element);
    if (index !== -1) {
      this.elements.splice(index, 1);
      if (element.remove) {
        element.remove();
      }
    }
  }
  
  /**
   * 全要素の削除
   */
  removeAllElements() {
    this.elements.forEach(element => {
      if (element.remove) {
        element.remove();
      }
    });
    this.elements = [];
  }
  
  /**
   * 要素をコンテナに追加
   */
  appendToContainer(element, containerId = 'game-container') {
    const container = document.getElementById(containerId);
    if (container) {
      container.appendChild(element);
    } else {
      document.body.appendChild(element);
    }
    this.addElement(element);
  }
  
  /**
   * 中央配置のスタイル取得
   */
  getCenteredStyle(additionalStyle = {}) {
    return {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      ...additionalStyle
    };
  }
  
  /**
   * 背景の描画
   */
  renderBackground(ctx, color = '#000000') {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  /**
   * テキストの描画
   */
  renderText(ctx, text, x, y, options = {}) {
    const {
      font = '16px Arial',
      color = '#ffffff',
      align = 'left',
      baseline = 'top'
    } = options;
    
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(text, x, y);
  }
  
  /**
   * 中央にテキストを描画
   */
  renderCenteredText(ctx, text, y, options = {}) {
    const x = this.canvas.width / 2;
    const centeredOptions = {
      align: 'center',
      ...options
    };
    this.renderText(ctx, text, x, y, centeredOptions);
  }
  
  /**
   * エラーハンドリング
   */
  handleError(error, context = '') {
    console.error(`${this.constructor.name} エラー${context ? ' (' + context + ')' : ''}:`, error);
    
    // デバッグ情報の更新
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) {
      debugInfo.textContent = `エラー: ${this.constructor.name} ${context} - ${error.message}`;
    }
  }
  
  /**
   * 画面遷移
   */
  switchToScreen(screenName) {
    if (this.game && this.game.switchScreen) {
      this.game.switchScreen(screenName);
    }
  }
  
  /**
   * 画面の初期化状態チェック
   */
  isInitialized() {
    return this.isActive && this.elements.length > 0;
  }
}