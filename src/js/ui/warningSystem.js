/**
 * 警告システムモジュール
 * SPDX-License-Identifier: MIT
 */

export class WarningSystem {
  constructor() {
    this.warningElement = null;
    this.activeWarning = false;
  }
  
  /**
   * 警告メッセージの表示
   * @param {string} message - 表示メッセージ
   * @param {number} duration - 表示時間（ミリ秒）
   * @param {string} type - 警告タイプ（'error', 'warning', 'info'）
   */
  showWarning(message, duration = 3000, type = 'warning') {
    this.hideWarning();
    
    this.warningElement = document.createElement('div');
    this.warningElement.className = `warning-message warning-${type}`;
    this.warningElement.textContent = message;
    
    const styles = this.getWarningStyles(type);
    Object.assign(this.warningElement.style, styles);
    
    document.body.appendChild(this.warningElement);
    this.activeWarning = true;
    
    // 自動非表示
    setTimeout(() => {
      this.hideWarning();
    }, duration);
  }
  
  /**
   * ボス出現警告の表示
   * @param {string} bossName - ボス名
   */
  showBossWarning(bossName = 'ボス') {
    this.showWarning(`${bossName}が出現しました！`, 4000, 'boss');
  }
  
  /**
   * ゲームオーバー警告の表示
   */
  showGameOverWarning() {
    this.showWarning('ゲームオーバー', 2000, 'error');
  }
  
  /**
   * ゲームクリア警告の表示
   */
  showGameClearWarning() {
    this.showWarning('ゲームクリア！', 3000, 'success');
  }
  
  /**
   * 警告メッセージの非表示
   */
  hideWarning() {
    if (this.warningElement) {
      this.warningElement.remove();
      this.warningElement = null;
      this.activeWarning = false;
    }
  }
  
  /**
   * 警告タイプに応じたスタイルの取得
   * @param {string} type - 警告タイプ
   * @returns {Object} スタイルオブジェクト
   */
  getWarningStyles(type) {
    const baseStyle = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: '#ffffff',
      padding: '15px 30px',
      borderRadius: '8px',
      fontSize: '20px',
      fontWeight: 'bold',
      zIndex: '2000',
      textAlign: 'center',
      minWidth: '200px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
      animation: 'warningPulse 1s infinite'
    };
    
    const typeStyles = {
      warning: {
        backgroundColor: 'rgba(255, 165, 0, 0.9)',
        border: '2px solid #ff8c00'
      },
      error: {
        backgroundColor: 'rgba(255, 0, 0, 0.9)',
        border: '2px solid #dc143c'
      },
      success: {
        backgroundColor: 'rgba(0, 255, 0, 0.9)',
        border: '2px solid #32cd32',
        color: '#000000'
      },
      info: {
        backgroundColor: 'rgba(0, 123, 255, 0.9)',
        border: '2px solid #007bff'
      },
      boss: {
        backgroundColor: 'rgba(128, 0, 128, 0.9)',
        border: '2px solid #800080',
        fontSize: '24px',
        animation: 'bossWarning 2s infinite'
      }
    };
    
    return { ...baseStyle, ...typeStyles[type] };
  }
  
  /**
   * アクティブな警告があるかチェック
   * @returns {boolean} アクティブな警告の有無
   */
  hasActiveWarning() {
    return this.activeWarning;
  }
  
  /**
   * 警告システムの初期化（CSS アニメーション追加）
   */
  static initializeCSS() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes warningPulse {
        0% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.02); }
        100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
      }
      
      @keyframes bossWarning {
        0% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
        25% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
        50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
        75% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
        100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
      }
    `;
    document.head.appendChild(style);
  }
}

// CSS の初期化
if (typeof document !== 'undefined') {
  WarningSystem.initializeCSS();
}