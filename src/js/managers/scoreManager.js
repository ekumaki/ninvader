/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.0
 * SPDX-License-Identifier: MIT
 */

export class ScoreManager {
  constructor() {
    this.currentScore = 0;
    this.highScore = this.loadHighScore();
  }
  
  // 現在のスコアを取得
  getScore() {
    return this.currentScore;
  }
  
  // ハイスコアを取得
  getHighScore() {
    return this.highScore;
  }
  
  // スコアを加算
  addScore(points) {
    this.currentScore += points;
    
    // ハイスコア更新チェック
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      this.saveHighScore();
    }
    
    return this.currentScore;
  }
  
  // スコアをリセット
  resetScore() {
    this.currentScore = 0;
  }
  
  // ハイスコアをlocalStorageから読み込み
  loadHighScore() {
    const savedData = localStorage.getItem('cnp_invader_highscore');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        return data.score || 0;
      } catch (e) {
        console.error('ハイスコアの読み込みに失敗しました', e);
        return 0;
      }
    }
    return 0;
  }
  
  // ハイスコアをlocalStorageに保存
  saveHighScore() {
    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD形式
      
      const data = {
        score: this.highScore,
        date: dateStr
      };
      
      localStorage.setItem('cnp_invader_highscore', JSON.stringify(data));
    } catch (e) {
      console.error('ハイスコアの保存に失敗しました', e);
    }
  }
}
