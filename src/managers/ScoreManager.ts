/**
 * CNP インベーダー - スコア管理クラス
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

export class ScoreManager {
  private currentScore: number = 0;
  private scoreUpdateCallbacks: ((score: number) => void)[] = [];

  /**
   * スコアを加算する
   * @param points 加算するポイント
   */
  addScore(points: number): void {
    if (points <= 0) return;
    
    this.currentScore += points;
    this.notifyScoreUpdate();
    
    console.log(`Score added: +${points}, Total: ${this.currentScore}`);
  }

  /**
   * 現在のスコアを取得する
   * @returns 現在のスコア
   */
  getCurrentScore(): number {
    return this.currentScore;
  }

  /**
   * スコアをリセットする
   */
  resetScore(): void {
    this.currentScore = 0;
    this.notifyScoreUpdate();
    console.log('Score reset to 0');
  }

  /**
   * スコア更新時のコールバックを登録する
   * @param callback スコア更新時に呼び出される関数
   */
  onScoreUpdate(callback: (score: number) => void): void {
    this.scoreUpdateCallbacks.push(callback);
  }

  /**
   * スコア更新時のコールバックを削除する
   * @param callback 削除するコールバック関数
   */
  removeScoreUpdateCallback(callback: (score: number) => void): void {
    const index = this.scoreUpdateCallbacks.indexOf(callback);
    if (index > -1) {
      this.scoreUpdateCallbacks.splice(index, 1);
    }
  }

  /**
   * スコア更新を通知する
   */
  private notifyScoreUpdate(): void {
    this.scoreUpdateCallbacks.forEach(callback => {
      try {
        callback(this.currentScore);
      } catch (error) {
        console.error('Error in score update callback:', error);
      }
    });
  }

  /**
   * 敵撃破時のスコア加算
   */
  addEnemyKillScore(): void {
    this.addScore(10);
  }

  /**
   * ボス撃破時のスコア加算
   * @param bossType ボスの種類（'A': 弁天, 'B': 孤白, 'C': 鬼）
   */
  addBossKillScore(bossType: 'A' | 'B' | 'C'): void {
    const bossPoints = {
      'A': 500,  // 弁天
      'B': 800,  // 孤白
      'C': 1000  // 鬼
    };
    
    this.addScore(bossPoints[bossType]);
  }

  /**
   * UFO撃破時のスコア加算
   * @param isRare レアUFOかどうか
   */
  addUfoKillScore(isRare: boolean): void {
    try {
      const points = isRare ? 1000 : 200;
      console.log(`UFO score added: ${points} points (rare: ${isRare})`);
      this.addScore(points);
    } catch (error) {
      console.error('Error in addUfoKillScore:', error);
      // フォールバック: 通常UFOとして扱う
      this.addScore(200);
    }
  }
} 