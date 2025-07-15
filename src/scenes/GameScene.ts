/**
 * CNP インベーダー - ゲーム画面（TypeScript版）
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

import { BaseScene } from './BaseScene';
import type { GameEngine } from '../core/GameEngine';
import type { InputManager } from '../core/InputManager';
import type { GameConfigType } from '../core/config';
import { CollisionSystem } from '../core/CollisionSystem';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { Boss } from '../entities/Boss';
import { Ufo } from '../entities/Ufo';
import { FormationSystem } from '../systems/FormationSystem';

export class GameScene extends BaseScene {
  private game: GameEngine;
  private inputManager: InputManager;
  private config: GameConfigType;
  
  // ゲームエンティティ
  private player: Player | null = null;
  private enemies: Enemy[] = [];
  private playerBullets: Bullet[] = [];
  private enemyBullets: Bullet[] = [];
  private ufo: Ufo | null = null;
  private boss: Boss | null = null;
  
  // ゲーム状態
  private currentStage = 1;
  private selectedShipType: 'A' | 'B' | 'C' = 'A';
  
  // ゲーム状態
  private gameTime = 0;
  private gameOver = false;
  private gameCleared = false;
  private collisionEnabled = false;
  private enemyRespawnScheduled = false;
  private showStageClear = false;
  private stageClearTimer = 0;
  private showStageStart = false;
  private stageStartTimer = 0;
  
  // デバッグ用状態
  private debugStage = 0; // 0は通常モード
  private debugBossMode = false;
  private debugGameOverMode = false;
  private debugGameClearMode = false;
  private debugSpecificBossType: 'A' | 'B' | 'C' | null = null;
  
  // ボス戦状態
  private isInBossBattle = false;
  
  // ボス出現タイマー
  private bossSpawnTimer = 0;
  private bossSpawnScheduled = false;
  
  // ボス出現エフェクト
  private bossWarningTimer = 0;
  private showBossWarning = false;
  
  // UFO出現制御
  private ufoSpawnTimer = 0;
  private ufoSpawnInterval = 10; // 10秒間隔でUFO出現チャンス（頻度を倍増）
  
  // 演出用アニメーション
  private celebrationTimer = 0;
  private gameOverAnimTimer = 0;
  
  // 編隊システム
  private formationSystem: FormationSystem | null = null;
  
  // UI ボタン
  private clearButtons = {
    title: { x: 180, y: 400, width: 200, height: 40, text: 'タイトルにもどる' }
  };
  private gameOverButtons = {
    retry: { x: 180, y: 380, width: 150, height: 40, text: 'リトライ' },
    title: { x: 180, y: 430, width: 200, height: 40, text: 'タイトルにもどる' }
  };
  private hoveredButton: string | null = null;

  constructor(game: GameEngine, inputManager: InputManager) {
    super();
    this.game = game;
    this.inputManager = inputManager;
    this.config = game.getConfig();
    
    // マウスイベント設定
    this.setupMouseEvents();
  }
  
  private setupMouseEvents(): void {
    const canvas = this.game.getCanvas();
    
    // マウス移動
    canvas.addEventListener('mousemove', (event) => {
      if (!this.isActive || (!this.gameCleared && !this.gameOver)) return;
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      this.hoveredButton = null;
      
      // 状態に応じたボタンをチェック
      const buttons = this.gameCleared ? this.clearButtons : this.gameOverButtons;
      for (const [buttonName, button] of Object.entries(buttons)) {
        if (mouseX >= button.x - button.width/2 && 
            mouseX <= button.x + button.width/2 &&
            mouseY >= button.y - button.height/2 && 
            mouseY <= button.y + button.height/2) {
          this.hoveredButton = buttonName;
          break;
        }
      }
    });
    
    // マウスクリック
    canvas.addEventListener('click', (event) => {
      if (!this.isActive || (!this.gameCleared && !this.gameOver)) return;
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      const buttons = this.gameCleared ? this.clearButtons : this.gameOverButtons;
      for (const [buttonName, button] of Object.entries(buttons)) {
        if (mouseX >= button.x - button.width/2 && 
            mouseX <= button.x + button.width/2 &&
            mouseY >= button.y - button.height/2 && 
            mouseY <= button.y + button.height/2) {
          this.handleButtonClick(buttonName);
          break;
        }
      }
    });
  }
  
  private handleButtonClick(buttonName: string): void {
    if (buttonName === 'title') {
      // ゲーム状態をリセットしてタイトルに戻る
      this.resetToTitle();
      this.game.switchToScene('title');
    } else if (buttonName === 'retry') {
      // ボス戦中だった場合はボス戦から再開
      if (this.isInBossBattle) {
        this.retryBossBattle();
      } else {
        // 通常はステージの最初から
        this.initializeGame();
      }
    }
  }
  
  private resetToTitle(): void {
    // 全ての状態をリセット
    this.gameOver = false;
    this.gameCleared = false;
    this.isInBossBattle = false;
    this.showStageClear = false;
    this.showStageStart = false;
    this.currentStage = 1;
    this.cleanup();
  }
  
  // ステージを1にリセット（外部から呼び出し用）
  resetToStageOne(): void {
    this.currentStage = 1;
    this.gameOver = false;
    this.gameCleared = false;
    this.isInBossBattle = false;
    this.showStageClear = false;
    this.showStageStart = false;
    this.cleanup();
  }
  
  // 選択した機体を設定
  setSelectedShip(shipType: 'A' | 'B' | 'C'): void {
    this.selectedShipType = shipType;
  }

  // デバッグ用ステージ設定
  setDebugStage(stage: number): void {
    this.debugStage = stage;
  }

  // デバッグ用ボス戦モード設定
  setDebugBossMode(enabled: boolean): void {
    this.debugBossMode = enabled;
  }
  
  // デバッグ用ゲームオーバーモード設定
  setDebugGameOverMode(enabled: boolean): void {
    if (enabled) {
      this.gameOver = true;
      this.gameCleared = false;
    }
  }
  
  // デバッグ用ゲームクリアモード設定
  setDebugGameClearMode(enabled: boolean): void {
    if (enabled) {
      this.gameCleared = true;
      this.gameOver = false;
    }
  }

  onEnter(): void {
    this.initializeGame();
  }

  onExit(): void {
    this.cleanup();
  }

  private initializeGame(): void {
    // デバッグモードの処理
    if (this.debugStage > 0) {
      this.currentStage = this.debugStage;
      this.debugStage = 0; // リセット
    }
    
    // プレイヤーの初期化
    this.initPlayer();
    
    // デバッグ用ゲームオーバーモードの処理
    if (this.debugGameOverMode) {
      this.debugGameOverMode = false; // リセット
      // ゲームオーバー画面に直接遷移
      setTimeout(() => {
        const gameOverScene = this.game.getScene('gameOver');
        if (gameOverScene && 'setGameInfo' in gameOverScene) {
          (gameOverScene as any).setGameInfo(this.selectedShipType, false);
        }
        this.game.switchToScene('gameOver');
      }, 100);
      return;
    }
    
    // デバッグ用ゲームクリアモードの処理
    if (this.debugGameClearMode) {
      this.debugGameClearMode = false; // リセット
      // ゲームクリア画面に直接遷移
      setTimeout(() => {
        const gameClearScene = this.game.getScene('gameClear');
        if (gameClearScene && 'setGameInfo' in gameClearScene) {
          (gameClearScene as any).setGameInfo(this.selectedShipType);
        }
        this.game.switchToScene('gameClear');
      }, 100);
      return;
    }
    
    // デバッグ用ボス戦モードの処理
    if (this.debugBossMode) {
      this.enemies = []; // 敵を全て削除
      this.debugBossMode = false; // リセット
      
      // 少し遅らせてボスを出現させる
      setTimeout(() => {
        this.spawnBoss();
        this.bossSpawnScheduled = true;
      }, 1000);
    } else {
      // 通常の敵の初期化
      this.initEnemies();
    }
    
    // ゲーム状態リセット
    this.gameTime = 0;
    this.gameOver = false;
    this.gameCleared = false;
    this.collisionEnabled = false;
    this.enemyRespawnScheduled = false;
    this.bossSpawnTimer = 0;
    this.bossSpawnScheduled = false;
    this.showStageClear = false;
    this.stageClearTimer = 0;
    this.showStageStart = true;
    this.stageStartTimer = 0;
    this.isInBossBattle = false;
    
    // 配列クリア
    this.playerBullets = [];
    this.enemyBullets = [];
    
    // ボス状態リセット
    this.boss = null;
    
    // UFO状態リセット
    this.ufo = null;
    this.ufoSpawnTimer = 0;
  }
  
  // ゲーム完全リセット（タイトルから開始時）
  private resetGame(): void {
    this.currentStage = 1;
    this.initializeGame();
  }

  private initPlayer(): void {
    const canvas = this.game.getCanvas();
    const centerX = canvas.width / 2;
    const bottomY = canvas.height - 60; // 100から60に変更してプレイヤーを下げる
    
    this.player = new Player(this.game, this.inputManager, centerX, bottomY, this.selectedShipType);
    
    // 弾発射コールバック設定
    this.player.setBulletFiredCallback((bullet: Bullet) => {
      this.addBullet(bullet);
    });
    
    // オートモード設定を更新
    console.log('GameScene initPlayer: about to call updateAutoMode');
    this.player.updateAutoMode();
    console.log('GameScene initPlayer: player autoMode is now', this.player.getAutoMode());
    
    // Player initialized
  }

  private initEnemies(): void {
    this.enemies = [];
    
    // 敵の配置（8x5の編隊）
    const rows = 5;
    const cols = 8;
    const enemySpacingX = 35; // 40から35に縮小
    const enemySpacingY = 40;
    const startY = 80;
    
    // 中央揃えの計算
    const canvas = this.game.getCanvas();
    const totalWidth = (cols - 1) * enemySpacingX;
    const startX = (canvas.width - totalWidth) / 2;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * enemySpacingX;
        const y = startY + row * enemySpacingY;
        
        // ステージに応じた敵タイプを決定
        const enemyType = this.getEnemyTypeForStage(this.currentStage);
        
        const enemy = new Enemy(this.game, x, y, enemyType, this.currentStage);
        
        // 敵の弾発射コールバック設定
        enemy.setBulletFiredCallback((bullet: any) => {
          this.addEnemyBullet(bullet);
        });
        
        this.enemies.push(enemy);
      }
    }
    
    // 編隊システムの初期化
    this.formationSystem = new FormationSystem(this.enemies);
    
    // Enemies initialized
  }

  private getEnemyTypeForStage(stage: number): 'A' | 'B' | 'C' {
    // 各ステージで敵タイプのバリエーションを作る
    switch (stage) {
      case 1:
        return 'A'; // 緑の敵（基本タイプ）
      case 2:
        return Math.random() < 0.7 ? 'A' : 'B'; // 紫：70% A、30% B
      case 3:
        return Math.random() < 0.5 ? 'B' : 'C'; // オレンジ：50% B、50% C
      default:
        return 'A';
    }
  }

  private getStageColorName(): string {
    switch (this.currentStage) {
      case 1: return '緑';
      case 2: return '紫'; 
      case 3: return 'オレンジ';
      default: return '緑';
    }
  }

  update(deltaTime: number): void {
    if (!this.isActive) return;

    // 入力更新
    this.inputManager.update(deltaTime);
    
    // ゲームオーバー時は演出アニメーションのみ更新
    if (this.gameOver) {
      this.gameOverAnimTimer += deltaTime;
      return; // ゲームオーバー時は演出以外の処理を停止
    }
    
    // ゲーム完全クリア時は演出アニメーションのみ更新
    if (this.gameCleared) {
      this.celebrationTimer += deltaTime;
      return; // ゲーム完全クリア時は演出以外の処理を停止
    }
    
    // ゲーム時間更新
    this.gameTime += deltaTime;
    
    // ステージ開始演出の更新
    if (this.showStageStart) {
      this.stageStartTimer += deltaTime;
      if (this.stageStartTimer >= 2.0) {
        this.showStageStart = false;
      }
      return; // 演出中は他の処理を停止
    }
    
    // ステージクリア演出の更新
    if (this.showStageClear) {
      this.stageClearTimer += deltaTime;
      if (this.stageClearTimer >= 2.0) {
        this.showStageClear = false;
        this.nextStage();
      }
      return; // 演出中は他の処理を停止
    }
    
    // 衝突判定を遅れて有効化（開始直後の混乱を避ける）
    if (this.gameTime > 2.0 && !this.collisionEnabled) {
      this.collisionEnabled = true;
    }
    
    // プレイヤー更新
    if (this.player && this.player.isActive) {
      this.player.update(deltaTime);
    }
    
    // 敵更新
    this.updateEnemies(deltaTime);
    
    // 編隊システム更新
    if (this.formationSystem) {
      this.formationSystem.update(deltaTime, this.game.getCanvas().width);
    }
    
    // 弾更新
    this.updateBullets(deltaTime);
    
    // UFO更新
    if (this.ufo && this.ufo.isActive) {
      this.ufo.update(deltaTime);
    } else if (this.ufo && !this.ufo.isActive) {
      this.ufo = null; // 非アクティブなUFOを削除
    }
    
    // UFO出現チェック
    this.checkUfoSpawn(deltaTime);
    
    // ボス更新
    if (this.boss && this.boss.isActive) {
      this.boss.update(deltaTime);
    }
    
    // 衝突判定
    if (this.collisionEnabled) {
      this.checkCollisions();
    }
    
    // ゲーム状態チェック
    this.checkGameState();
    
    // ボス出現チェック
    this.checkBossSpawn(deltaTime);
  }

  private updateEnemies(deltaTime: number): void {
    // アクティブな敵の数を計算
    const activeEnemies = this.enemies.filter(enemy => enemy.isActive);
    const totalEnemies = activeEnemies.length;
    
    // 各敵に総数を通知
    for (const enemy of activeEnemies) {
      enemy.updateEnemyCount(totalEnemies);
    }
    
    // 敵の更新と削除
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.isActive) {
        enemy.update(deltaTime);
      } else {
        this.enemies.splice(i, 1);
      }
    }
  }

  private updateBullets(deltaTime: number): void {
    // プレイヤー弾更新
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const bullet = this.playerBullets[i];
      bullet.update(deltaTime);
      
      if (!bullet.isActive || bullet.y < 0) {
        this.playerBullets.splice(i, 1);
      }
    }
    
    // 敵弾更新
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = this.enemyBullets[i];
      bullet.update(deltaTime);
      
      if (!bullet.isActive || bullet.y > this.game.getCanvas().height) {
        this.enemyBullets.splice(i, 1);
      }
    }
  }

  private checkCollisions(): void {
    // プレイヤー弾 vs 敵
    CollisionSystem.checkCollisions(
      this.playerBullets,
      this.enemies,
      (bullet, enemy) => {
        const damage = bullet.getDamage ? bullet.getDamage() : 1;
        const isPenetrating = bullet.getPenetrating ? bullet.getPenetrating() : false;
        const isMultiHit = bullet.getMultiHit ? bullet.getMultiHit() : false;
        const isExplosive = bullet.getExplosive ? bullet.getExplosive() : false;
        
        if (isExplosive) {
          // 爆発弾の処理
          this.handleExplosiveBullet(bullet, enemy);
          bullet.isActive = false;
        } else {
          // 通常弾の処理
          // 貫通弾でない場合、またはマルチヒット弾でない場合は弾を無効化
          if (!isPenetrating && !isMultiHit) {
            bullet.isActive = false;
          }
          
          if (enemy.takeDamage(damage)) {
            // 敵が倒された
            this.onEnemyDestroyed(enemy);
          }
        }
      }
    );
    
    // 敵弾 vs プレイヤー
    if (this.player && this.player.isActive) {
      CollisionSystem.checkCollisions(
        this.enemyBullets,
        [this.player],
        (bullet, player) => {
          bullet.isActive = false;
          if (player.takeDamage(1)) {
            // プレイヤーが倒された
            this.onPlayerDestroyed();
          }
        }
      );
    }
    
    // プレイヤー弾 vs ボス
    if (this.boss && this.boss.isActive && this.player && this.player.isActive) {
      CollisionSystem.checkCollisions(
        this.playerBullets,
        [this.boss],
        (bullet, boss) => {
          const damage = bullet.getDamage ? bullet.getDamage() : 1;
          const isPenetrating = bullet.getPenetrating ? bullet.getPenetrating() : false;
          
          // 必殺技弾の重複ヒット防止
          if (bullet.getHitEntities && bullet.getHitEntities().has(boss)) {
            return; // 既にヒット済みなのでダメージを与えない
          }
          
          // 貫通弾でない場合は弾を無効化
          if (!isPenetrating) {
            bullet.isActive = false;
          }
          
          // 必殺技弾のヒット済みリストに追加
          if (bullet.getHitEntities) {
            bullet.getHitEntities().add(boss);
          }
          
          if (boss.takeDamage(damage)) {
            // ボスが倒された
            this.onBossDestroyed(boss);
          }
        }
      );
    }
    
    // プレイヤー弾 vs UFO
    if (this.ufo && this.ufo.isActive && this.player && this.player.isActive) {
      CollisionSystem.checkCollisions(
        this.playerBullets,
        [this.ufo],
        (bullet, ufo) => {
          bullet.isActive = false;
          if (ufo.takeDamage(1)) {
            // UFOが倒された
            this.onUfoDestroyed(ufo);
          }
        }
      );
    }
  }

  private handleExplosiveBullet(bullet: any, hitEnemy: Enemy): void {
    const explosionRadius = bullet.getExplosionRadius();
    const damage = bullet.getDamage();
    const explosionX = bullet.x;
    const explosionY = bullet.y;
    
    // 爆発範囲内の全ての敵にダメージを与える
    for (const enemy of this.enemies) {
      if (!enemy.isActive) continue;
      
      const dx = enemy.x - explosionX;
      const dy = enemy.y - explosionY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= explosionRadius) {
        if (enemy.takeDamage(damage)) {
          // 敵が倒された
          this.onEnemyDestroyed(enemy);
        }
      }
    }
    
    console.log(`Explosive bullet detonated at (${explosionX}, ${explosionY}) with radius ${explosionRadius}`);
  }

  private onEnemyDestroyed(enemy: Enemy): void {
    // スコア加算
    // TODO: ScoreManager実装後に追加
    
    // エフェクト再生
    // TODO: AudioManager実装後に追加
  }

  private onBossDestroyed(boss: Boss): void {
    // スコア加算
    // TODO: ScoreManager実装後に追加
    
    // エフェクト再生
    // TODO: AudioManager実装後に追加
  }

  private onUfoDestroyed(ufo: Ufo): void {
    // スコア加算
    // TODO: ScoreManager実装後に追加
    console.log('UFO destroyed, points:', ufo.getPoints());
    
    // エフェクト再生
    // TODO: AudioManager実装後に追加
  }

  private onPlayerDestroyed(): void {
    // GameOverSceneに遷移
    this.game.switchToScene('gameOver');
  }
  
  private retryBossBattle(): void {
    // プレイヤーの初期化
    this.initPlayer();
    
    // ボス戦状態の初期化
    this.gameTime = 0;
    this.gameOver = false;
    this.gameCleared = false;
    this.collisionEnabled = false;
    this.bossSpawnTimer = 0;
    this.bossSpawnScheduled = false;
    this.showStageClear = false;
    this.stageClearTimer = 0;
    this.showStageStart = false;
    this.stageStartTimer = 0;
    this.isInBossBattle = true;
    
    // 弾をクリア
    this.playerBullets = [];
    this.enemyBullets = [];
    
    // 敵をクリア（ボス戦なので）
    this.enemies = [];
    
    // UFOをクリア
    this.ufo = null;
    this.ufoSpawnTimer = 0;
    
    // ボスを即座に出現させる
    setTimeout(() => {
      this.spawnBoss();
      this.bossSpawnScheduled = true;
    }, 500);
  }

  private checkGameState(): void {
    // 敵がプレイヤーの上端まで到達したかチェック
    if (this.player && this.player.isActive) {
      const playerTopY = this.player.y - this.player.height / 2;
      
      for (const enemy of this.enemies) {
        if (enemy.isActive && enemy.y >= playerTopY) {
          console.log('Enemy reached player level, game over!');
          this.onPlayerDestroyed();
          return;
        }
      }
    }
    
    // ボスが倒されたかチェック
    if (this.boss && !this.boss.isActive) {
      this.boss = null;
      if (!this.enemyRespawnScheduled) {
        this.onStageCleared();
      }
    }
    
    // 敵が全滅した場合はボス出現待ち（ステージクリアではない）
    const activeEnemies = this.enemies.filter(enemy => enemy.isActive);
    if (activeEnemies.length === 0 && !this.boss && !this.bossSpawnScheduled) {
      // ボス出現まで待機（onStageCleared は呼ばない）
      // デバッグログでボス出現待ちを確認
      if (this.bossSpawnTimer === 0) {
        console.log('All enemies defeated, waiting for boss spawn...');
      }
    }
    
    // ゲームオーバー処理は onPlayerDestroyed で実行済み
    
    // ゲームクリア処理
    if (this.gameCleared) {
      this.onGameCleared();
    }
  }

  private onStageCleared(): void {
    // スコア加算
    // TODO: ScoreManager実装後に追加
    
    // 次のステージへ
    if (this.currentStage < 3) {
      this.showStageClear = true;
      this.stageClearTimer = 0;
    } else {
      // 全ステージクリア - GameClearSceneに遷移
      // GameClearSceneにプレイヤー情報を渡す
      const gameClearScene = this.game.getScene('gameClear');
      if (gameClearScene && 'setGameInfo' in gameClearScene) {
        (gameClearScene as any).setGameInfo(this.selectedShipType);
      }
      this.game.switchToScene('gameClear');
    }
  }
  
  private nextStage(): void {
    this.currentStage++;
    this.initializeGame();
  }

  private onGameCleared(): void {
    
    // プレイヤーをジャンプさせる
    if (this.player) {
      this.player.startJump();
    }
    
    // 自動遷移は削除、ボタンで操作
  }

  private checkBossSpawn(deltaTime: number): void {
    // 敵が全滅した時にボス出現
    const activeEnemies = this.enemies.filter(enemy => enemy.isActive);
    
    if (activeEnemies.length === 0 && !this.boss && !this.bossSpawnScheduled) {
      this.bossSpawnTimer += deltaTime;
      
      // 0.5秒後に警告表示開始（より早く）
      if (this.bossSpawnTimer >= 0.5 && !this.showBossWarning) {
        this.showBossWarning = true;
        this.bossWarningTimer = 0;
        console.log('All enemies defeated! Boss incoming...');
      }
      
      // 警告エフェクト更新
      if (this.showBossWarning) {
        this.bossWarningTimer += deltaTime;
      }
      
      // 2秒後にボス出現（短縮）
      if (this.bossSpawnTimer >= 2.0) {
        this.spawnBoss();
        this.bossSpawnScheduled = true;
        this.showBossWarning = false;
        console.log(`Boss spawned for stage ${this.currentStage}!`);
      }
    }
  }

  private checkUfoSpawn(deltaTime: number): void {
    // UFOが既に存在するか、ボス戦中は出現させない
    if (this.ufo || this.boss) return;
    
    this.ufoSpawnTimer += deltaTime;
    
    // 一定間隔でUFO出現チャンス
    if (this.ufoSpawnTimer >= this.ufoSpawnInterval) {
      // 50%の確率でUFO出現（確率を上昇）
      if (Math.random() < 0.5) {
        this.spawnUfo();
      }
      this.ufoSpawnTimer = 0;
    }
  }
  
  private spawnUfo(): void {
    const canvas = this.game.getCanvas();
    const direction = Math.random() < 0.5 ? 1 : -1; // ランダムな方向
    const x = direction > 0 ? -30 : canvas.width + 30; // 画面外からスタート
    const y = 50; // 画面上部
    
    this.ufo = new Ufo(this.game, x, y, direction);
    console.log('UFO spawned!');
  }

  private spawnBoss(): void {
    const canvas = this.game.getCanvas();
    const bossX = canvas.width / 2;
    const bossY = 80;
    
    // デバッグ用特定ボスタイプがある場合はそれを使用、なければステージに応じたボスタイプを決定
    const bossType = this.debugSpecificBossType || this.getBossTypeForStage(this.currentStage);
    
    this.boss = new Boss(this.game, bossX, bossY, bossType, this.currentStage);
    
    // 弾発射コールバック設定
    this.boss.setBulletFiredCallback((bullet: Bullet) => {
      this.addEnemyBullet(bullet);
    });
    
    // ボス戦状態に設定
    this.isInBossBattle = true;
    
    // デバッグ用特定ボスタイプをリセット
    this.debugSpecificBossType = null;
    
    console.log(`Boss ${bossType} spawned!`);
  }
  
  private getBossTypeForStage(stage: number): 'A' | 'B' | 'C' {
    switch (stage) {
      case 1: return 'A'; // 弁天
      case 2: return 'B'; // コハク
      case 3: return 'C'; // 鬼
      default: return 'A';
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;

    // 背景描画
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, this.game.getCanvas().width, this.game.getCanvas().height);
    
    // ゲームオーバーまたはゲームクリア時は背景を黒で塗りつぶして他の要素を非表示
    if (this.gameOver || this.gameCleared) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, this.game.getCanvas().width, this.game.getCanvas().height);
    } else {
      // 通常のゲーム要素の描画
      // プレイヤー描画
      if (this.player && this.player.isActive) {
        this.player.render(ctx);
      }
      
      // 敵描画
      for (const enemy of this.enemies) {
        if (enemy.isActive) {
          enemy.render(ctx);
        }
      }
      
      // 弾描画
      for (const bullet of this.playerBullets) {
        bullet.render(ctx);
      }
      
      for (const bullet of this.enemyBullets) {
        bullet.render(ctx);
      }
      
      // UFO描画
      if (this.ufo && this.ufo.isActive) {
        this.ufo.render(ctx);
      }
      
      // ボス描画
      if (this.boss && this.boss.isActive) {
        this.boss.render(ctx);
      }
    }
    
    // UI描画（常に表示）
    this.renderUI(ctx);
  }

  private renderUI(ctx: CanvasRenderingContext2D): void {
    const canvas = this.game.getCanvas();
    
    // スコア表示
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px monospace';
    ctx.fillText('SCORE: 0', 10, 30);
    
    // ステージ表示
    ctx.fillStyle = '#FFD700';
    ctx.font = '18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`STAGE ${this.currentStage}`, canvas.width / 2, 30);
    
    // ステージカラー表示
    ctx.fillStyle = this.getStageDisplayColor();
    ctx.font = '14px monospace';
    ctx.fillText(`(${this.getStageColorName()})`, canvas.width / 2, 50);
    
    // プレイヤー情報表示
    if (this.player) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${this.player.getType()}: ${this.getShipName()}`, 10, canvas.height - 40);
      ctx.fillText(`♥ ${this.player.getHealth()}`, 10, canvas.height - 25);
      ctx.fillText(`★ ${this.player.getSpecialUses()}`, 10, canvas.height - 10);
    }
    
    // ボス情報表示
    if (this.boss && this.boss.isActive) {
      ctx.fillStyle = '#FF4444';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`BOSS: ${this.getBossName()}`, canvas.width / 2, 70);
    }
    
    // 時間表示（デバッグ用）- ゲーム画面外（右側）に表示
    if (this.config.DEBUG.SHOW_INFO) {
      ctx.fillStyle = '#888888';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      const debugX = canvas.width + 10; // ゲーム画面の右側
      ctx.fillText(`TIME: ${this.gameTime.toFixed(1)}s`, debugX, 30);
      ctx.fillText(`ENEMIES: ${this.enemies.length}`, debugX, 50);
      ctx.fillText(`COLLISION: ${this.collisionEnabled ? 'ON' : 'OFF'}`, debugX, 70);
      ctx.fillText(`STAGE: ${this.currentStage}`, debugX, 90);
      ctx.fillText(`BOSS: ${this.boss ? 'ACTIVE' : 'NONE'}`, debugX, 110);
      ctx.fillText(`UFO: ${this.ufo ? 'ACTIVE' : 'NONE'}`, debugX, 130);
      
      // 敵の強化状態を表示
      const activeEnemies = this.enemies.filter(enemy => enemy.isActive);
      const enemyBoost = activeEnemies.length <= 20;
      ctx.fillStyle = enemyBoost ? '#ff6666' : '#888888';
      ctx.fillText(`ENEMY BOOST: ${enemyBoost ? 'ON' : 'OFF'} (${activeEnemies.length}/20)`, debugX, 150);
      ctx.fillStyle = '#888888'; // 色をリセット
    }
    
    // ボス警告表示
    if (this.showBossWarning) {
      this.renderBossWarning(ctx, canvas);
    }
    
    // ステージ開始・ステージクリア・ゲームオーバー表示
    if (this.showStageStart) {
      this.renderStageStart(ctx, canvas);
    } else if (this.showStageClear) {
      this.renderStageClear(ctx, canvas);
    } else if (this.gameCleared) {
      this.renderGameComplete(ctx, canvas);
    } else if (this.gameOver) {
      this.renderGameOver(ctx, canvas);
    }
    
    // テキスト設定をリセット
    ctx.textAlign = 'left';
  }

  private getStageDisplayColor(): string {
    switch (this.currentStage) {
      case 1: return '#00FF00'; // 緑
      case 2: return '#8000FF'; // 紫
      case 3: return '#FF8000'; // オレンジ
      default: return '#FFFFFF';
    }
  }

  private getShipName(): string {
    switch (this.selectedShipType) {
      case 'A': return '咲夜';
      case 'B': return 'ネム';
      case 'C': return 'シャオラン';
      default: return '咲夜';
    }
  }

  private getBossName(): string {
    if (!this.boss) return '';
    
    switch (this.boss.getType()) {
      case 'A': return '弁天';
      case 'B': return 'コハク';
      case 'C': return '鬼';
      default: return '';
    }
  }

  private renderGameComplete(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // ゲームクリアテキスト
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME COMPLETE!', canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px monospace';
    ctx.fillText('All 3 stages cleared!', canvas.width / 2, canvas.height / 2);
    
    // プレイヤーのジャンプ演出
    this.renderCelebrationPlayer(ctx, canvas);
    
    // ボタン描画
    this.renderButtons(ctx, this.clearButtons);
  }

  private renderGameOver(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // ゲームオーバーテキスト
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
    
    // 敵のジャンプ演出
    this.renderGameOverEnemy(ctx, canvas);
    
    // ボタン描画
    this.renderButtons(ctx, this.gameOverButtons);
  }

  private renderBossWarning(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // 点滅エフェクト（文字のみ）
    const flashIntensity = Math.sin(this.bossWarningTimer * 15) * 0.5 + 0.5;
    
    // 警告テキスト（点滅）
    ctx.fillStyle = `rgba(255, 255, 0, ${flashIntensity})`;
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚠ BOSS WARNING ⚠', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity})`;
    ctx.font = '16px monospace';
    ctx.fillText('強敵接近中...', canvas.width / 2, canvas.height / 2 + 20);
  }
  
  private renderCelebrationPlayer(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // ジャンプアニメーション計算
    const jumpProgress = (this.celebrationTimer * 2) % (Math.PI * 2); // 2秒周期
    const jumpHeight = Math.sin(jumpProgress) * 30; // 30ピクセルのジャンプ
    
    const playerX = canvas.width / 2;
    const baseY = canvas.height - 80;
    const playerY = baseY - Math.abs(jumpHeight);
    
    // プレイヤー画像を描画
    const gameConfig = this.game.getConfig();
    const playerConfig = gameConfig.PLAYER[this.selectedShipType];
    
    // フォールバック描画
    ctx.save();
    ctx.fillStyle = '#00FF00';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 15;
    ctx.fillRect(playerX - 20, playerY - 20, 40, 40);
    ctx.restore();
    
    // 画像描画（非同期だが試行）
    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 15;
      ctx.drawImage(img, playerX - 20, playerY - 20, 40, 40);
      ctx.restore();
    };
    img.src = `./src/assets/img/player/${playerConfig.IMAGE}`;
  }
  
  private renderGameOverEnemy(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // ジャンプアニメーション計算
    const jumpProgress = (this.gameOverAnimTimer * 1.5) % (Math.PI * 2); // 少し遅いジャンプ
    const jumpHeight = Math.sin(jumpProgress) * 25; // 25ピクセルのジャンプ
    
    const enemyX = canvas.width / 2;
    const baseY = canvas.height - 80;
    const enemyY = baseY - Math.abs(jumpHeight);
    
    // 敵画像を描画
    const gameConfig = this.game.getConfig();
    const enemyConfig = gameConfig.ENEMY.A; // ザコ敵タイプA
    
    // フォールバック描画
    ctx.save();
    ctx.fillStyle = '#FF4444';
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 10;
    ctx.fillRect(enemyX - 15, enemyY - 15, 30, 30);
    ctx.restore();
    
    // 画像描画（非同期だが試行）
    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 10;
      ctx.drawImage(img, enemyX - 15, enemyY - 15, 30, 30);
      ctx.restore();
    };
    img.src = `./src/assets/img/enemy/${enemyConfig.IMAGE}`;
  }
  
  private renderStageStart(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // ステージ開始テキスト
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`STAGE ${this.currentStage}`, canvas.width / 2, canvas.height / 2);
    
    // ステージカラー表示
    ctx.fillStyle = this.getStageDisplayColor();
    ctx.font = '24px monospace';
    ctx.fillText(`(${this.getStageColorName()})`, canvas.width / 2, canvas.height / 2 + 40);
  }
  
  private renderStageClear(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // ステージクリアテキスト
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('STAGE CLEAR', canvas.width / 2, canvas.height / 2);
  }
  
  private renderButtons(ctx: CanvasRenderingContext2D, buttons: any): void {
    for (const [buttonName, button] of Object.entries(buttons)) {
      const isHovered = this.hoveredButton === buttonName;
      
      // ボタン背景
      ctx.fillStyle = isHovered ? '#555555' : '#333333';
      ctx.fillRect(
        button.x - button.width/2,
        button.y - button.height/2,
        button.width,
        button.height
      );
      
      // ボタン枠線
      ctx.strokeStyle = isHovered ? '#FFFFFF' : '#666666';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        button.x - button.width/2,
        button.y - button.height/2,
        button.width,
        button.height
      );
      
      // ボタンテキスト
      ctx.fillStyle = isHovered ? '#FFFFFF' : '#CCCCCC';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(button.text, button.x, button.y + 5);
    }
  }

  private cleanup(): void {
    // エンティティクリーンアップ
    this.player = null;
    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.ufo = null;
    this.boss = null;
  }

  // 弾追加メソッド
  addBullet(bullet: Bullet): void {
    this.playerBullets.push(bullet);
  }

  addEnemyBullet(bullet: Bullet): void {
    // 追尾弾の場合、プレイヤーインスタンスを設定
    if (bullet.getHoming() && this.player) {
      bullet.setHoming(true, this.player);
      console.log('追尾弾にプレイヤーインスタンスを設定しました');
    } else if (bullet.getHoming() && !this.player) {
      console.log('警告: 追尾弾ですがプレイヤーインスタンスがありません');
    }
    this.enemyBullets.push(bullet);
  }

  // デバッグ用設定メソッド
  setDebugGameOverMode(enabled: boolean): void {
    this.debugGameOverMode = enabled;
  }

  setDebugGameClearMode(enabled: boolean): void {
    this.debugGameClearMode = enabled;
  }

  setDebugSpecificBossMode(enabled: boolean, bossType?: 'A' | 'B' | 'C'): void {
    this.debugBossMode = enabled;
    this.debugSpecificBossType = bossType || null;
  }
}