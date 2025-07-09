/**
 * 共通ボタンコンポーネント
 * SPDX-License-Identifier: MIT
 */

export class Button {
  /**
   * ボタンの作成
   * @param {Object} options - ボタンオプション
   * @param {string} options.text - ボタンテキスト
   * @param {string} options.id - ボタンID
   * @param {Function} options.onClick - クリックハンドラ
   * @param {Object} options.style - 追加スタイル
   */
  static create({ text, id, onClick, style = {} }) {
    const button = document.createElement('button');
    button.textContent = text;
    button.id = id;
    
    // 基本スタイルの適用
    Object.assign(button.style, this.getBaseStyle(), style);
    
    // クリックイベントの設定
    if (onClick) {
      button.addEventListener('click', onClick);
    }
    
    // ホバー効果の追加
    this.addHoverEffect(button);
    
    return button;
  }
  
  /**
   * 基本スタイルの取得
   */
  static getBaseStyle() {
    return {
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: 'bold',
      border: '2px solid #fff',
      borderRadius: '8px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'Arial, sans-serif',
      outline: 'none',
      userSelect: 'none'
    };
  }
  
  /**
   * ホバー効果の追加
   */
  static addHoverEffect(button) {
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = 'none';
    });
    
    button.addEventListener('mousedown', () => {
      button.style.transform = 'translateY(0)';
    });
    
    button.addEventListener('mouseup', () => {
      button.style.transform = 'translateY(-2px)';
    });
  }
  
  /**
   * プライマリボタンの作成
   */
  static createPrimary({ text, id, onClick, style = {} }) {
    const primaryStyle = {
      backgroundColor: 'rgba(0, 123, 255, 0.8)',
      borderColor: '#007bff',
      ...style
    };
    
    return this.create({ text, id, onClick, style: primaryStyle });
  }
  
  /**
   * セカンダリボタンの作成
   */
  static createSecondary({ text, id, onClick, style = {} }) {
    const secondaryStyle = {
      backgroundColor: 'rgba(108, 117, 125, 0.8)',
      borderColor: '#6c757d',
      ...style
    };
    
    return this.create({ text, id, onClick, style: secondaryStyle });
  }
  
  /**
   * 危険ボタンの作成
   */
  static createDanger({ text, id, onClick, style = {} }) {
    const dangerStyle = {
      backgroundColor: 'rgba(220, 53, 69, 0.8)',
      borderColor: '#dc3545',
      ...style
    };
    
    return this.create({ text, id, onClick, style: dangerStyle });
  }
  
  /**
   * 成功ボタンの作成
   */
  static createSuccess({ text, id, onClick, style = {} }) {
    const successStyle = {
      backgroundColor: 'rgba(40, 167, 69, 0.8)',
      borderColor: '#28a745',
      ...style
    };
    
    return this.create({ text, id, onClick, style: successStyle });
  }
  
  /**
   * 小さなボタンの作成
   */
  static createSmall({ text, id, onClick, style = {} }) {
    const smallStyle = {
      padding: '8px 16px',
      fontSize: '14px',
      ...style
    };
    
    return this.create({ text, id, onClick, style: smallStyle });
  }
  
  /**
   * 大きなボタンの作成
   */
  static createLarge({ text, id, onClick, style = {} }) {
    const largeStyle = {
      padding: '16px 32px',
      fontSize: '18px',
      ...style
    };
    
    return this.create({ text, id, onClick, style: largeStyle });
  }
}