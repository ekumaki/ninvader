/**
 * CNP インベーダー - 衝突判定システム
 * Version: 0.1.5
 * SPDX-License-Identifier: MIT
 */

import { GameConfig } from '../config/gameConfig.js';

export class CollisionSystem {
  constructor(game) {
    this.game = game;
  }

  // エンティティ同士の基本衝突判定
  checkEntityCollision(entity1, entity2) {
    return (
      entity1.x - entity1.width / 2 < entity2.x + entity2.width / 2 &&
      entity1.x + entity1.width / 2 > entity2.x - entity2.width / 2 &&
      entity1.y - entity1.height / 2 < entity2.y + entity2.height / 2 &&
      entity1.y + entity1.height / 2 > entity2.y - entity2.height / 2
    );
  }

  // プレイヤーの弾と敵の衝突判定
  checkPlayerBulletCollisions(playerBullets, enemies, ufo, boss, gameScreen) {
    for (let i = playerBullets.length - 1; i >= 0; i--) {
      const bullet = playerBullets[i];
      
      // 敵との衝突
      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        
        if (this.checkEntityCollision(bullet, enemy)) {
          enemy.takeDamage(1);
          playerBullets.splice(i, 1);
          
          if (!enemy.isActive) {
            this.game.scoreManager.addScore(GameConfig.SCORE.ENEMY_KILL);
            gameScreen.updateScoreDisplay();
            enemies.splice(j, 1);
            this.game.audioManager.play('explosion', 0.3);
          }
          break;
        }
      }
      
      // UFOとの衝突
      if (ufo && this.checkEntityCollision(bullet, ufo)) {
        ufo.takeDamage(1);
        playerBullets.splice(i, 1);
        
        if (!ufo.isActive) {
          this.game.scoreManager.addScore(GameConfig.SCORE.UFO_KILL);
          gameScreen.updateScoreDisplay();
          gameScreen.ufo = null;
          this.game.audioManager.play('explosion', 0.4);
        }
      }
      
      // ボスとの衝突
      if (boss && this.checkEntityCollision(bullet, boss)) {
        boss.takeDamage(1);
        playerBullets.splice(i, 1);
        
        if (!boss.isActive) {
          this.game.scoreManager.addScore(GameConfig.SCORE.BOSS_KILL);
          gameScreen.updateScoreDisplay();
          gameScreen.boss = null;
          this.game.audioManager.play('explosion', 0.5);
        }
      }
    }
  }

  // 敵の弾とプレイヤーの衝突判定
  checkEnemyBulletCollisions(enemyBullets, player, gameScreen) {
    if (!player) return;
    
    for (const bullet of enemyBullets) {
      if (this.checkEntityCollision(bullet, player)) {
        console.log('敵の弾がプレイヤーに当たりました');
        gameScreen.handleGameOver();
        bullet.isActive = false;
      }
    }
  }

  // プレイヤーと敵の直接衝突判定
  checkPlayerEnemyCollisions(player, enemies, gameScreen) {
    if (!player || !gameScreen.collisionEnabled) return;
    
    const adjustment = GameConfig.COLLISION.ADJUSTMENT_FACTOR;
    
    for (const enemy of enemies) {
      // 敵の画面下端到達チェック
      const gameOverThreshold = this.game.canvas.height * GameConfig.COLLISION.GAME_OVER_THRESHOLD;
      const enemyBottomPosition = enemy.y + enemy.height / 2;
      
      if (enemyBottomPosition > gameOverThreshold) {
        console.log('敵が画面下端に到達しました');
        gameScreen.handleGameOver();
        return;
      }
      
      // プレイヤーとの直接衝突
      const collision = (
        player.x - (player.width * adjustment) / 2 < enemy.x + (enemy.width * adjustment) / 2 &&
        player.x + (player.width * adjustment) / 2 > enemy.x - (enemy.width * adjustment) / 2 &&
        player.y - (player.height * adjustment) / 2 < enemy.y + (enemy.height * adjustment) / 2 &&
        player.y + (player.height * adjustment) / 2 > enemy.y - (enemy.height * adjustment) / 2
      );
      
      if (collision) {
        console.log('プレイヤーと敵が衝突しました');
        gameScreen.handleGameOver();
        return;
      }
    }
  }

  // 全体の衝突判定実行
  checkAllCollisions(gameScreen) {
    const { playerBullets, enemyBullets, enemies, ufo, boss, player } = gameScreen;
    
    // プレイヤーの弾と敵の衝突
    this.checkPlayerBulletCollisions(playerBullets, enemies, ufo, boss, gameScreen);
    
    // 敵の弾とプレイヤーの衝突（現在無効化中）
    // this.checkEnemyBulletCollisions(enemyBullets, player, gameScreen);
    
    // プレイヤーと敵の直接衝突
    this.checkPlayerEnemyCollisions(player, enemies, gameScreen);
  }
} 