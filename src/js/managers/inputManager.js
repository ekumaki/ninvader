/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.2
 * SPDX-License-Identifier: MIT
 */

export class InputManager {
  constructor() {
    this.keys = {};
    this.pressedTime = {};
    
    // キーボードイベントの設定
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }
  
  // キーが押された時の処理
  handleKeyDown(event) {
    this.keys[event.key] = true;
    
    // 初めて押された時に時間を記録
    if (!this.pressedTime[event.key]) {
      this.pressedTime[event.key] = performance.now();
    }
    
    // スペースキーの場合、ページスクロールを防止
    if (event.key === ' ') {
      event.preventDefault();
    }
  }
  
  // キーが離された時の処理
  handleKeyUp(event) {
    this.keys[event.key] = false;
    this.pressedTime[event.key] = 0;
  }
  
  // キーが押されているかチェック
  isKeyDown(key) {
    return this.keys[key] === true;
  }
  
  // キーが押されている時間を取得（ミリ秒）
  getKeyPressedTime(key) {
    if (this.isKeyDown(key) && this.pressedTime[key]) {
      return performance.now() - this.pressedTime[key];
    }
    return 0;
  }
  
  // 外部からキーの状態を設定（モバイルコントロール用）
  setKey(key, isPressed) {
    if (isPressed) {
      if (!this.keys[key]) {
        this.keys[key] = true;
        this.pressedTime[key] = performance.now();
      }
    } else {
      this.keys[key] = false;
      this.pressedTime[key] = 0;
    }
  }
}
