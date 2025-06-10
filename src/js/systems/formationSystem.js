/**
 * CNP インベーダー - 編隊移動システム
 * Version: 0.1.5
 * SPDX-License-Identifier: MIT
 */

import { GameConfig } from '../config/gameConfig.js';

export class FormationSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.direction = 1; // 1: 右, -1: 左
    this.moveTimer = 0;
  }

  // 編隊移動の更新
  update(deltaTime, enemies) {
    console.log('FormationSystem.update called', 'deltaTime:', deltaTime, 'enemies:', enemies.length, 'moveTimer:', this.moveTimer);
    
    if (enemies.length === 0) return;

    // 固定の移動間隔を使用
    const currentMoveInterval = GameConfig.ENEMY.FORMATION_INTERVAL;

    console.log('FormationSystem: currentMoveInterval:', currentMoveInterval, 'FORMATION_INTERVAL:', GameConfig.ENEMY.FORMATION_INTERVAL);

    this.moveTimer += deltaTime;

    // 編隊移動のタイミング
    if (this.moveTimer >= currentMoveInterval) {
      console.log('FormationSystem: 移動タイミング到達', 'moveTimer:', this.moveTimer, 'currentMoveInterval:', currentMoveInterval);
      this.moveTimer = 0;
      this.executeFormationMove(enemies);
    }

    // 個別の敵の更新（移動以外）
    this.updateIndividualEnemies(deltaTime, enemies);
  }

  // 編隊移動の実行
  executeFormationMove(enemies) {
    console.log('FormationSystem: 移動実行中', 'FORMATION_SPEED:', GameConfig.ENEMY.FORMATION_SPEED, 'FORMATION_INTERVAL:', GameConfig.ENEMY.FORMATION_INTERVAL);
    
    // 画面端チェック用の最端の敵を見つける
    let leftmostX = enemies[0].x;
    let rightmostX = enemies[0].x;

    for (const enemy of enemies) {
      leftmostX = Math.min(leftmostX, enemy.x);
      rightmostX = Math.max(rightmostX, enemy.x);
    }

    // 画面端判定
    const shouldChangeDirection = 
      (this.direction === 1 && rightmostX >= this.canvas.width - GameConfig.ENEMY.EDGE_MARGIN) ||
      (this.direction === -1 && leftmostX <= GameConfig.ENEMY.EDGE_MARGIN);

    if (shouldChangeDirection) {
      // 方向転換と下降
      this.direction *= -1;
      console.log('FormationSystem: 方向転換と下降');
      
      // 全ての敵を下降
      for (const enemy of enemies) {
        enemy.y += GameConfig.ENEMY.DROP_DISTANCE;
      }
    } else {
      // 横移動 - GameConfigから直接読み込むように修正
      const moveAmount = this.direction * GameConfig.ENEMY.FORMATION_SPEED;
      console.log('FormationSystem: 横移動', 'moveAmount:', moveAmount);
      
      for (const enemy of enemies) {
        enemy.x += moveAmount;
      }
    }
  }

  // 個別の敵の更新（移動以外）
  updateIndividualEnemies(deltaTime, enemies) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      
      // 発射クールダウンの更新
      if (!enemy.canShoot && enemy.shootTimer !== undefined) {
        enemy.shootTimer += deltaTime;
        if (enemy.shootTimer >= enemy.shootCooldown) {
          enemy.canShoot = true;
          enemy.shootTimer = 0;
        }
      }
      
      // アニメーション更新
      if (enemy.animationTimer !== undefined) {
        enemy.animationTimer += deltaTime;
        if (enemy.animationTimer >= enemy.animationSpeed) {
          enemy.currentFrame = (enemy.currentFrame + 1) % enemy.totalFrames;
          enemy.animationTimer = 0;
        }
      }
    }
  }

  // 編隊状態のリセット
  reset() {
    this.direction = 1;
    this.moveTimer = 0;
  }
} 