/**
 * CNP インベーダー - 編隊システム（TypeScript版）
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

import type { Enemy } from '../entities/Enemy';

export class FormationSystem {
  private enemies: Enemy[] = [];
  private direction = 1; // 1: 右, -1: 左
  private speed = 15; // ピクセル/秒
  private dropDistance = 20;
  private edgeMargin = 30;
  private moveTimer = 0;
  private moveInterval = 1.0; // 1秒ごとに移動

  constructor(enemies: Enemy[]) {
    this.enemies = enemies;
  }

  update(deltaTime: number, canvasWidth: number): void {
    if (this.enemies.length === 0) return;

    this.moveTimer += deltaTime;
    
    // 移動間隔に達したら編隊移動
    if (this.moveTimer >= this.getEffectiveMoveInterval()) {
      this.moveTimer = 0;
      this.moveFormation(canvasWidth);
    }
  }

  private moveFormation(canvasWidth: number): void {
    // 編隊の端を検出
    let leftmostX = Number.MAX_VALUE;
    let rightmostX = Number.MIN_VALUE;

    for (const enemy of this.enemies) {
      if (enemy.isActive) {
        leftmostX = Math.min(leftmostX, enemy.x);
        rightmostX = Math.max(rightmostX, enemy.x);
      }
    }

    // 画面端に到達したかチェック
    const reachedEdge = 
      (this.direction > 0 && rightmostX >= canvasWidth - this.edgeMargin) ||
      (this.direction < 0 && leftmostX <= this.edgeMargin);

    if (reachedEdge) {
      // 方向転換と下降
      this.direction *= -1;
      this.dropFormation();
    } else {
      // 横移動
      this.moveHorizontal();
    }
  }

  private moveHorizontal(): void {
    // 基本移動スピードを使用（距離は変更しない）
    for (const enemy of this.enemies) {
      if (enemy.isActive) {
        enemy.x += this.direction * this.speed;
      }
    }
  }
  
  // 敵の強化状態を考慮した移動間隔を取得
  private getEffectiveMoveInterval(): number {
    const activeEnemies = this.enemies.filter(enemy => enemy.isActive);
    const enemyCountBoost = activeEnemies.length <= 20;
    return enemyCountBoost ? this.moveInterval * 0.5 : this.moveInterval;
  }

  private dropFormation(): void {
    for (const enemy of this.enemies) {
      if (enemy.isActive) {
        enemy.y += this.dropDistance;
      }
    }
  }

  // 敵の配列を更新
  setEnemies(enemies: Enemy[]): void {
    this.enemies = enemies;
  }

  // 移動速度を設定
  setSpeed(speed: number): void {
    this.speed = speed;
  }

  // 移動間隔を設定
  setMoveInterval(interval: number): void {
    this.moveInterval = interval;
  }
}