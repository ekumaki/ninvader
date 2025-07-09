/**
 * スコア表示コンポーネント
 * SPDX-License-Identifier: MIT
 */

export class ScoreDisplay {
  /**
   * スコア表示要素の作成
   * @param {Object} options - オプション
   * @param {string} options.type - 表示タイプ ('current', 'high', 'final')
   * @param {number} options.score - スコア値
   * @param {Object} options.style - 追加スタイル
   * @param {string} options.className - CSSクラス名
   */
  static create({ type = 'current', score = 0, style = {}, className = '' }) {
    const element = document.createElement('div');
    element.className = `score-display ${className}`.trim();
    
    const prefix = this.getPrefix(type);
    element.textContent = `${prefix}${score}`;
    
    const baseStyle = this.getBaseStyle(type);
    Object.assign(element.style, baseStyle, style);
    
    return element;
  }
  
  /**
   * 現在のスコア表示の作成
   */
  static createCurrent(score, style = {}) {
    return this.create({
      type: 'current',
      score,
      style: {
        position: 'absolute',
        top: 'calc(50% - 320px + 20px)',
        right: 'calc(50% - 180px + 20px)',
        ...style
      },
      className: 'current-score-display'
    });
  }
  
  /**
   * ハイスコア表示の作成
   */
  static createHigh(score, style = {}) {
    return this.create({
      type: 'high',
      score,
      style: {
        position: 'absolute',
        top: 'calc(50% - 320px + 20px)',
        left: 'calc(50% - 180px + 20px)',
        ...style
      },
      className: 'high-score-display'
    });
  }
  
  /**
   * 最終スコア表示の作成
   */
  static createFinal(score, style = {}) {
    return this.create({
      type: 'final',
      score,
      style: {
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center',
        ...style
      },
      className: 'final-score-display'
    });
  }
  
  /**
   * スコアのアニメーション表示
   */
  static createAnimated({ type = 'current', score = 0, duration = 1000, style = {} }) {
    const element = this.create({ type, score: 0, style });
    
    let startTime = null;
    const startScore = 0;
    const targetScore = score;
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentScore = Math.floor(startScore + (targetScore - startScore) * progress);
      const prefix = this.getPrefix(type);
      element.textContent = `${prefix}${currentScore}`;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
    return element;
  }
  
  /**
   * スコア値の更新
   */
  static updateScore(element, score) {
    if (!element) return;
    
    const currentText = element.textContent;
    const prefixMatch = currentText.match(/^[A-Z\s:]+/);
    const prefix = prefixMatch ? prefixMatch[0] : '';
    
    element.textContent = `${prefix}${score}`;
  }
  
  /**
   * スコアのフォーマット
   */
  static formatScore(score) {
    return score.toLocaleString();
  }
  
  /**
   * タイプに応じたプレフィックスの取得
   */
  static getPrefix(type) {
    const prefixes = {
      current: 'SCORE: ',
      high: 'HI SCORE: ',
      final: 'FINAL SCORE: '
    };
    return prefixes[type] || 'SCORE: ';
  }
  
  /**
   * 基本スタイルの取得
   */
  static getBaseStyle(type) {
    const baseStyle = {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      zIndex: '1000',
      userSelect: 'none'
    };
    
    const typeStyles = {
      current: {
        ...baseStyle
      },
      high: {
        ...baseStyle,
        color: '#ffd700' // ゴールド色
      },
      final: {
        ...baseStyle,
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#00ff00' // 緑色
      }
    };
    
    return typeStyles[type] || baseStyle;
  }
  
  /**
   * スコアの点滅効果
   */
  static addBlinkEffect(element, duration = 2000) {
    const originalColor = element.style.color;
    let isVisible = true;
    
    const blink = setInterval(() => {
      element.style.color = isVisible ? 'transparent' : originalColor;
      isVisible = !isVisible;
    }, 200);
    
    setTimeout(() => {
      clearInterval(blink);
      element.style.color = originalColor;
    }, duration);
  }
  
  /**
   * 新記録の効果
   */
  static addNewRecordEffect(element) {
    element.style.color = '#ff6b6b';
    element.style.textShadow = '0 0 10px #ff6b6b';
    element.style.animation = 'scoreGlow 1s ease-in-out infinite alternate';
    
    // CSS アニメーションの追加
    if (!document.querySelector('#score-glow-animation')) {
      const style = document.createElement('style');
      style.id = 'score-glow-animation';
      style.textContent = `
        @keyframes scoreGlow {
          from { text-shadow: 0 0 10px #ff6b6b; }
          to { text-shadow: 0 0 20px #ff6b6b, 0 0 30px #ff6b6b; }
        }
      `;
      document.head.appendChild(style);
    }
  }
}