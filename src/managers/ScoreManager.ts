/**
 * CNP インベーダー - スコア管理クラス
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

export class ScoreManager {
  private currentScore: number = 0;
  private scoreUpdateCallbacks: ((score: number) => void)[] = [];
  private lastSpecialRecoveryScore: number = 0; // 最後に必殺技回復したスコア
  private specialRecoveryCallbacks: (() => void)[] = []; // 必殺技回復時のコールバック

  /**
   * スコアを加算する
   * @param points 加算するポイント
   */
  addScore(points: number): void {
    console.log(`addScore called with points: ${points}`);
    if (points <= 0) {
      console.log('Points <= 0, returning');
      return;
    }
    
    const oldScore = this.currentScore;
    this.currentScore += points;
    console.log(`Score updated: ${oldScore} -> ${this.currentScore}`);
    
    // 1000点ごとに必殺技回復をチェック
    this.checkSpecialRecovery(oldScore, this.currentScore);
    
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
    console.log(`notifyScoreUpdate called, callbacks: ${this.scoreUpdateCallbacks.length}`);
    this.scoreUpdateCallbacks.forEach((callback, index) => {
      try {
        console.log(`Calling callback ${index} with score: ${this.currentScore}`);
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

  /**
   * 1000点ごとに必殺技回復をチェックする
   * @param oldScore 前のスコア
   * @param newScore 新しいスコア
   */
  private checkSpecialRecovery(oldScore: number, newScore: number): void {
    const RECOVERY_INTERVAL = 1000; // 1000点ごとに回復
    
    const oldThreshold = Math.floor(oldScore / RECOVERY_INTERVAL);
    const newThreshold = Math.floor(newScore / RECOVERY_INTERVAL);
    
    if (newThreshold > oldThreshold) {
      const recoveryCount = newThreshold - oldThreshold;
      console.log(`Special recovery triggered! Score: ${newScore}, Recovery count: ${recoveryCount}`);
      
      for (let i = 0; i < recoveryCount; i++) {
        this.notifySpecialRecovery();
      }
    }
  }

  /**
   * 必殺技回復時のコールバックを登録する
   * @param callback 必殺技回復時に呼び出される関数
   */
  onSpecialRecovery(callback: () => void): void {
    this.specialRecoveryCallbacks.push(callback);
  }

  /**
   * 必殺技回復時のコールバックを削除する
   * @param callback 削除するコールバック関数
   */
  removeSpecialRecoveryCallback(callback: () => void): void {
    const index = this.specialRecoveryCallbacks.indexOf(callback);
    if (index > -1) {
      this.specialRecoveryCallbacks.splice(index, 1);
    }
  }

  /**
   * 必殺技回復のコールバックを実行する
   */
  private notifySpecialRecovery(): void {
    this.specialRecoveryCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in special recovery callback:', error);
      }
    });
  }
} 