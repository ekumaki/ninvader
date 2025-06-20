/**
 * CNP インベーダー - 衝突判定システム
 * Version: 0.2.6
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
      let bulletHitTarget = false;
      
      // 弾のダメージとペネトレーション設定
      const bulletDamage = bullet.damage || 1;
      const bulletPenetrating = bullet.penetrating || false;
      
      // 敵との衝突
      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        
        if (this.checkEntityCollision(bullet, enemy)) {
          // 特殊弾の重複ヒット防止チェック
          if (bullet.hitEntities && bullet.hitEntities.has(enemy)) {
            // 既にこの敵にヒット済みなら、ダメージを与えずに貫通継続
            continue;
          }
          
          enemy.takeDamage(bulletDamage);
          bulletHitTarget = true;
          
          // 特殊弾の場合、ヒット済み敵リストに追加
          if (bullet.hitEntities) {
            bullet.hitEntities.add(enemy);
          }
          
          if (!enemy.isActive) {
            this.game.scoreManager.addScore(GameConfig.SCORE.ENEMY_KILL);
            gameScreen.updateScoreDisplay();
            enemies.splice(j, 1);
            this.game.audioManager.play('explosion', 0.3);
          }
          
          // 貫通しない弾は最初のヒットで終了
          if (!bulletPenetrating) {
            break;
          }
        }
      }
      
      // UFOとの衝突
      if (ufo && this.checkEntityCollision(bullet, ufo)) {
        // 特殊弾の重複ヒット防止チェック
        if (bullet.hitEntities && bullet.hitEntities.has(ufo)) {
          // 既にUFOにヒット済みなら、ダメージを与えずに貫通継続
        } else {
          ufo.takeDamage(bulletDamage);
          bulletHitTarget = true;
          
          // 特殊弾の場合、ヒット済み敵リストに追加
          if (bullet.hitEntities) {
            bullet.hitEntities.add(ufo);
          }
          
          if (!ufo.isActive) {
            this.game.scoreManager.addScore(GameConfig.SCORE.UFO_KILL);
            gameScreen.updateScoreDisplay();
            gameScreen.ufo = null;
            this.game.audioManager.play('explosion', 0.4);
          }
        }
        
        // 貫通しない弾の場合はここで削除
        if (!bulletPenetrating) {
          playerBullets.splice(i, 1);
          continue;
        }
      }
      
      // ボスとの衝突
      if (boss && this.checkEntityCollision(bullet, boss)) {
        // 特殊弾の重複ヒット防止チェック
        if (bullet.hitEntities && bullet.hitEntities.has(boss)) {
          // 既にボスにヒット済みなら、ダメージを与えずに貫通継続
        } else {
          boss.takeDamage(bulletDamage);
          bulletHitTarget = true;
          
          // 特殊弾の場合、ヒット済み敵リストに追加
          if (bullet.hitEntities) {
            bullet.hitEntities.add(boss);
          }
          
          if (!boss.isActive) {
            // 撃破時は追加で大きめの爆発音を再生
            this.game.scoreManager.addScore(GameConfig.SCORE.BOSS_KILL);
            gameScreen.updateScoreDisplay();
            this.game.audioManager.play('explosion', 0.5);
          }
          
          // 被弾時に爆発音（撃破前）
          if (boss.isActive) {
            this.game.audioManager.play('explosion', 0.3);
          }
        }
        
        // 貫通しない弾の場合はここで削除
        if (!bulletPenetrating) {
          playerBullets.splice(i, 1);
          continue;
        }
      }
      
      // 貫通しない弾で何かに当たった場合は削除
      if (bulletHitTarget && !bulletPenetrating) {
        playerBullets.splice(i, 1);
      }
    }
  }

  // 敵の弾とプレイヤーの衝突判定
  checkEnemyBulletCollisions(enemyBullets, player, gameScreen) {
    if (!player || !player.isActive) return;
    
    for (const bullet of enemyBullets) {
      if (this.checkEntityCollision(bullet, player)) {
        console.log('敵の弾がプレイヤーに当たりました');
        
        // プレイヤーにダメージを与える
        const isDead = player.takeDamage(1);
        bullet.isActive = false;
        
        // プレイヤーが死亡した場合はゲームオーバー
        if (isDead) {
          gameScreen.handleGameOver();
        }
        
        // 被弾音を再生
        this.game.audioManager.play('explosion', 0.3);
        break;
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
        
        // プレイヤーにダメージを与える
        const isDead = player.takeDamage(1);
        
        // プレイヤーが死亡した場合はゲームオーバー
        if (isDead) {
          gameScreen.handleGameOver();
        }
        
        // 被弾音を再生
        this.game.audioManager.play('explosion', 0.3);
        return;
      }
    }
  }

  // 全体の衝突判定実行
  checkAllCollisions(gameScreen) {
    const { playerBullets, enemyBullets, enemies, ufo, boss, player } = gameScreen;
    
    // プレイヤーの弾と敵の衝突
    this.checkPlayerBulletCollisions(playerBullets, enemies, ufo, boss, gameScreen);
    
    // 敵の弾とプレイヤーの衝突
    this.checkEnemyBulletCollisions(enemyBullets, player, gameScreen);
    
    // プレイヤーと敵の直接衝突
    this.checkPlayerEnemyCollisions(player, enemies, gameScreen);
  }
} 