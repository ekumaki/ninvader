/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.2
 * SPDX-License-Identifier: MIT
 */

import type { InputManager as IInputManager, InputState } from './types';

export class InputManager implements IInputManager {
  private keys: Record<string, boolean> = {};
  private previousKeys: Record<string, boolean> = {};
  private pressedTime: Record<string, number> = {};

  constructor() {
    console.log('InputManager: Initializing input manager');
    
    // キーボードイベントの設定（windowとdocument両方に設定）
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // デバッグ用: フォーカスイベント
    window.addEventListener('focus', () => {
      console.log('Window focused');
    });
    
    window.addEventListener('blur', () => {
      console.log('Window blurred');
    });
    
    // デバッグ用: 初期化完了の通知のみ
    setTimeout(() => {
      console.log('InputManager: Ready for input');
      console.log('Current keys state:', this.keys);
      console.log('Click anywhere and press keys to test');
    }, 1000);
  }

  // キーが押された時の処理
  private handleKeyDown = (event: KeyboardEvent): void => {
    console.log(`InputManager: Key down - "${event.key}" (code: ${event.code})`);
    this.keys[event.key] = true;
    
    // 初めて押された時に時間を記録
    if (!this.pressedTime[event.key]) {
      this.pressedTime[event.key] = performance.now();
    }
    
    // スペースキーの場合、ページスクロールを防止
    if (event.key === ' ') {
      event.preventDefault();
    }
  };

  // キーが離された時の処理
  private handleKeyUp = (event: KeyboardEvent): void => {
    console.log(`InputManager: Key up - "${event.key}"`);
    this.keys[event.key] = false;
    this.pressedTime[event.key] = 0;
  };

  // キーが押されているかチェック
  isKeyDown(key: string): boolean {
    return this.keys[key] === true;
  }

  // キーが今フレームで押されたかチェック
  isKeyPressed(key: string): boolean {
    const result = this.keys[key] === true && this.previousKeys[key] !== true;
    if (result) {
      console.log(`InputManager: isKeyPressed("${key}") = true`);
    }
    return result;
  }

  // キーが今フレームで離されたかチェック
  isKeyReleased(key: string): boolean {
    return this.keys[key] !== true && this.previousKeys[key] === true;
  }

  // キーが押されている時間を取得（ミリ秒）
  getKeyPressedTime(key: string): number {
    if (this.isKeyDown(key) && this.pressedTime[key]) {
      return performance.now() - this.pressedTime[key];
    }
    return 0;
  }

  // 外部からキーの状態を設定（モバイルコントロール用）
  setKey(key: string, isPressed: boolean): void {
    console.log(`InputManager: Manual setKey - "${key}" = ${isPressed}`);
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

  private updateCount = 0;

  // 毎フレーム呼び出す更新処理
  update(_deltaTime: number): void {
    // デバッグ: updateが呼ばれていることを確認
    this.updateCount++;
    if (this.updateCount % 120 === 0) { // 2秒に1回
      console.log('InputManager: update called, count:', this.updateCount);
      console.log('Current keys:', Object.keys(this.keys).filter(k => this.keys[k]));
      console.log('Previous keys:', Object.keys(this.previousKeys).filter(k => this.previousKeys[k]));
    }
    
    // 前フレームのキー状態を保存
    this.previousKeys = { ...this.keys };
  }

  // 現在の入力状態を取得
  getInputState(): InputState {
    return {
      keys: { ...this.keys }
    };
  }

  // クリーンアップ
  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}
