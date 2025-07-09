/**
 * キャンバス初期化モジュール
 * SPDX-License-Identifier: MIT
 */

export class CanvasInitializer {
  /**
   * キャンバスとコンテキストの初期化
   * @param {string} canvasId - キャンバス要素のID
   * @returns {Object} { canvas, ctx, success, error }
   */
  static initialize(canvasId = 'game-canvas') {
    const canvas = document.getElementById(canvasId);
    
    if (!canvas) {
      return {
        canvas: null,
        ctx: null,
        success: false,
        error: 'キャンバス要素が見つかりません'
      };
    }
    
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return {
        canvas,
        ctx: null,
        success: false,
        error: 'キャンバスコンテキストが取得できません'
      };
    }
    
    // 初期化成功時の描画
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.fillText('ゲーム初期化中...', 10, 50);
    
    return {
      canvas,
      ctx,
      success: true,
      error: null
    };
  }
  
  /**
   * エラー表示
   * @param {HTMLCanvasElement} canvas 
   * @param {string} errorMessage 
   */
  static displayError(canvas, errorMessage) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FF0000';
    ctx.font = '16px Arial';
    ctx.fillText('エラーが発生しました:', 10, 50);
    ctx.fillText(errorMessage, 10, 80);
  }
}