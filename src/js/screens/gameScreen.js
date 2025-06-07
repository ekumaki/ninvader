/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.5
 * SPDX-License-Identifier: MIT
 */

import { Player } from '../entities/player.js';
import { Enemy } from '../entities/enemy.js';
import { UFO } from '../entities/ufo.js';
import { Boss } from '../entities/boss.js';

export class GameScreen {
  constructor(game) {
    this.game = game;
    this.canvas = game.canvas;
    this.ctx = game.ctx;
    
    // ゲーム要素
    this.player = null;
    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.ufo = null;
    this.boss = null;
    
    // ゲーム状態
    this.gameTime = 0; // ゲーム経過時間（秒）
    this.bossSpawnTime = 180; // ボス出現時間（秒）
    this.enemyRows = 5; // 敵の行数
    this.enemyCols = 8; // 敵の列数
    this.enemySpacing = 60; // 敵の間隔
    this.enemySpeed = 50; // 敵の基本速度
    this.enemySpeedIncrease = 5; // 敵が減るごとの速度増加
    this.enemyDropDistance = 20; // 敵が下に降りる距離
    this.enemyDirection = 1; // 敵の移動方向 (1: 右, -1: 左)
    
    // スコア表示
    this.scoreDisplay = null;
    
    // UIコントロール
    this.chargeBar = null;
  }
  
  // 画面に入る時の処理
  async enter() {
    try {
      console.log('ゲーム画面にenterしました');
      
      // デバッグ情報更新
      const debugInfo = document.getElementById('debug-info');
      if (debugInfo) debugInfo.textContent = 'ゲーム画面初期化中...';
      
      // ゲーム状態を初期化
      this.gameOver = false;
      this.collisionEnabled = false; // 初期化中は衝突判定を無効化
      
      // 既存のHTML UIを非表示にする
      const existingUI = document.getElementById('game-ui');
      if (existingUI) {
        console.log('既存のHTML UIを非表示にします');
        existingUI.style.display = 'none';
      } else {
        console.log('既存UIが見つかりません');
      }
      
      // キャンバスを表示
      if (this.canvas) {
        console.log('キャンバスを表示します');
        this.canvas.style.display = 'block';
      }
      
      // ゲームの初期化
      console.log('ゲーム初期化を開始します');
      this.initializeGame();
      
      // プレイヤーが正しく生成されたか確認
      if (!this.player) {
        console.error('プレイヤーが正しく生成されていません');
        // 再度プレイヤーを生成
        const Player = (await import('../entities/player.js')).Player;
        this.player = new Player(
          this.game,
          this.canvas.width / 2,
          this.canvas.height - 100
        );
        console.log('プレイヤーを再生成しました:', this.player);
      }
      
      // チャージバーとスコア表示を作成
      this.createChargeBar();
      this.createScoreDisplay();
      
      // デバッグ情報更新
      if (debugInfo) debugInfo.textContent = 'ゲーム画面表示中';
      
      // 少し遅延させてから衝突判定を有効化
      setTimeout(() => {
        this.collisionEnabled = true;
        console.log('衝突判定を有効化しました');
      }, 1000);
      
      console.log('ゲーム画面の初期化が完了しました');
    } catch (error) {
      console.error('ゲーム画面の初期化エラー:', error);
      
      // デバッグ情報更新
      const debugInfo = document.getElementById('debug-info');
      if (debugInfo) debugInfo.textContent = `エラー: ゲーム画面初期化失敗 - ${error.message}`;
      this.ctx.fillText('初期化エラーが発生しました:', 10, 50);
      this.ctx.fillText(error.message, 10, 80);
    }
  }
  
  // 画面から出る時の処理
  exit() {
    console.log('ゲーム画面からexitします');
    
    try {
      // デバッグ情報更新
      const debugInfo = document.getElementById('debug-info');
      if (debugInfo) debugInfo.textContent = 'ゲーム画面終了中...';
      
      this.removeScoreDisplay();
      this.removeChargeBar();
      
      // デバッグ情報更新
      if (debugInfo) debugInfo.textContent = 'ゲーム画面終了';
      
      console.log('ゲーム画面からの退出が完了しました');
    } catch (error) {
      console.error('ゲーム画面の終了エラー:', error);
      
      // デバッグ情報更新
      const debugInfo = document.getElementById('debug-info');
      if (debugInfo) debugInfo.textContent = `エラー: ゲーム画面終了失敗 - ${error.message}`;
    }
  }
  
  // ゲームの初期化
  initializeGame() {
    console.log('ゲーム初期化開始');
    
    try {
      // プレイヤーの作成
      this.player = new Player(
        this.game,
        this.canvas.width / 2,
        this.canvas.height - 100
      );
      console.log('プレイヤー作成成功:', this.player);
      
      // プレイヤー画像の読み込み確認
      if (this.player.image) {
        this.player.image.onload = () => {
          console.log('プレイヤー画像読み込み完了');
        };
        
        this.player.image.onerror = (error) => {
          console.error('プレイヤー画像読み込みエラー:', error);
        };
      }
      
      // 敵の配置
      this.createEnemies();
      console.log('敵作成成功:', this.enemies.length);
      
      // 各種配列の初期化
      this.playerBullets = [];
      this.enemyBullets = [];
      this.ufo = null;
      this.boss = null;
      
      // ゲーム状態のリセット
      this.gameTime = 0;
      this.gameOver = false;
      this.enemyRespawnScheduled = false; // 敵の再生成フラグを初期化
      this.collisionEnabled = false; // 初期状態では衝突判定を無効化
      
      // 数秒後に衝突判定を有効化
      setTimeout(() => {
        this.collisionEnabled = true;
        console.log('衝突判定が有効になりました');
      }, 3000); // 3秒後に有効化
      
      this.game.scoreManager.resetScore();
      
      console.log('ゲーム初期化完了');
    } catch (error) {
      console.error('ゲーム初期化エラー:', error);
    }
  }
  
  // 敵の配置
  createEnemies() {
    this.enemies = [];
    
    // 画面端から十分に離して敵を配置する
    const marginX = 80; // 画面端からの余白
    const usableWidth = this.canvas.width - marginX * 2;
    const enemySpacing = usableWidth / (this.enemyCols - 1);
    const startX = marginX;
    const startY = 30; // 初期位置をさらに上方に調整
    
    // 敵の行間の距離を調整
    const rowSpacing = 40; // 行間の距離を小さくする
    
    for (let row = 0; row < this.enemyRows; row++) {
      for (let col = 0; col < this.enemyCols; col++) {
        const x = startX + col * enemySpacing;
        const y = startY + row * rowSpacing; // 調整した行間距離を使用
        
        // 敵クラスのデフォルト設定を尊重する
        const enemy = new Enemy(this.game, x, y);
        
        // 行によって敵の特性を変える（オプション）
        if (row === 0) {
          enemy.points = 150; // 最前列は高得点
        }
        
        // ゲーム画面の幅を敵クラスに渡す
        enemy.canvasWidth = this.canvas.width;
        
        this.enemies.push(enemy);
      }
    }
    
    // 初期配置のデバッグ情報
    console.log('敵の初期配置完了 - 最上部の敵のY座標:', startY);
    console.log('敵の初期配置完了 - 最下部の敵のY座標:', startY + (this.enemyRows - 1) * rowSpacing);
  }
  
  // 更新処理
  update(deltaTime) {
    // ゲームオーバーなら何もしない
    if (this.gameOver) return;
    
    // ゲーム時間の更新
    this.gameTime += deltaTime;
    
    // デバッグ情報を追加 - 5秒ごとに詳細情報を出力
    if (Math.floor(this.gameTime) % 5 === 0 && 
        Math.floor(this.gameTime) !== Math.floor(this.gameTime - deltaTime)) {
      console.log('\n=== 詳細デバッグ情報 ===');
      console.log('ゲーム時間:', Math.floor(this.gameTime), '秒');
      console.log('敵の数:', this.enemies.length);
      
      // 敵の位置情報を詳細に出力
      if (this.enemies.length > 0) {
        // 敵をY座標でソート
        const sortedEnemies = [...this.enemies].sort((a, b) => b.y - a.y);
        // 最下部の敵の位置を出力
        const lowestEnemy = sortedEnemies[0];
        console.log('最下部の敵の位置:');
        console.log(`Y座標=${lowestEnemy.y}, 上端=${lowestEnemy.y - lowestEnemy.height/2}, 下端=${lowestEnemy.y + lowestEnemy.height/2}`);
      }
      
      // プレイヤーの位置情報
      if (this.player) {
        console.log('プレイヤー位置情報:');
        console.log(`Y座標=${this.player.y}, 上端=${this.player.y - this.player.height/2}, 下端=${this.player.y + this.player.height/2}`);
      }
      
      console.log('画面サイズ:', this.canvas.width, 'x', this.canvas.height);
      console.log('ゲームオーバーしきい値:', this.canvas.height * 0.9);
      console.log('=== デバッグ情報終了 ===\n');
    }
    
    // プレイヤーの更新
    if (this.player && this.player.isActive) {
      this.player.update(deltaTime);
    }
    
    // 敵の更新
    this.updateEnemies(deltaTime);
    
    // UFOの更新
    this.updateUFO(deltaTime);
    
    // ボスの更新
    this.updateBoss(deltaTime);
    
    // プレイヤーの弾の更新
    this.updatePlayerBullets(deltaTime);
    
    // 敵の弾の更新
    this.updateEnemyBullets(deltaTime);
    
    // 衝突判定
    this.checkCollisions();
    
    // ゲーム状態の確認
    this.checkGameState();
    
    // スコア表示の更新
    this.updateScoreDisplay();
    
    // チャージバーの更新
    this.updateChargeBar();
  }
  
  // 敵の更新
  updateEnemies(deltaTime) {
    if (this.boss) return; // ボス出現中は敵の更新をスキップ
    if (this.enemies.length === 0) return;
    
    // 編隊移動の管理
    if (!this.formationDirection) this.formationDirection = 1; // 1: 右, -1: 左
    if (!this.formationMoveTimer) this.formationMoveTimer = 0;
    if (!this.formationMoveInterval) this.formationMoveInterval = 0.5; // 0.5秒ごとに移動
    if (!this.formationSpeed) this.formationSpeed = 30; // 1回の移動距離
    
    // 敵の数に応じて移動速度を調整（少なくなるほど速く）
    const speedMultiplier = Math.max(0.3, 1 - (this.enemies.length / 50)); // 最低30%まで
    const currentMoveInterval = this.formationMoveInterval * speedMultiplier;
    
    this.formationMoveTimer += deltaTime;
    
    // 編隊移動のタイミング
    if (this.formationMoveTimer >= currentMoveInterval) {
      this.formationMoveTimer = 0;
      
      // 画面端チェック用の最端の敵を見つける
      let leftmostX = this.enemies[0].x;
      let rightmostX = this.enemies[0].x;
      
      for (const enemy of this.enemies) {
        leftmostX = Math.min(leftmostX, enemy.x);
        rightmostX = Math.max(rightmostX, enemy.x);
      }
      
      // 画面端判定
      const edgeMargin = 30;
      const shouldChangeDirection = 
        (this.formationDirection === 1 && rightmostX >= this.canvas.width - edgeMargin) ||
        (this.formationDirection === -1 && leftmostX <= edgeMargin);
      
      if (shouldChangeDirection) {
        // 方向転換と下降
        this.formationDirection *= -1;
        
        // 全ての敵を下降
        for (const enemy of this.enemies) {
          enemy.y += 20; // 下降距離
        }
      } else {
        // 横移動
        for (const enemy of this.enemies) {
          enemy.x += this.formationDirection * this.formationSpeed;
        }
      }
    }
    
    // 個別の敵の更新（移動以外）
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      // 発射クールダウンの更新
      if (!enemy.canShoot) {
        enemy.shootTimer += deltaTime;
        if (enemy.shootTimer >= enemy.shootCooldown) {
          enemy.canShoot = true;
          enemy.shootTimer = 0;
        }
      }
      
      // アニメーション更新
      enemy.animationTimer += deltaTime;
      if (enemy.animationTimer >= enemy.animationSpeed) {
        enemy.currentFrame = (enemy.currentFrame + 1) % enemy.totalFrames;
        enemy.animationTimer = 0;
      }
    }
    
    // 無効になった敵を削除
    this.enemies = this.enemies.filter(enemy => enemy.isActive);
  }
  
  // UFOの更新
  updateUFO(deltaTime) {
    // 既存のUFOの更新
    if (this.ufo) {
      this.ufo.update(deltaTime);
      
      // 無効になったUFOを削除
      if (!this.ufo.isActive) {
        this.ufo = null;
      }
    }
    
    // 新しいUFOの生成チェック
    if (!this.ufo && !this.boss) {
      const newUFO = UFO.checkSpawn(this.game, deltaTime, this.ufo);
      if (newUFO) {
        this.ufo = newUFO;
      }
    }
  }
  
  // ボスの更新
  updateBoss(deltaTime) {
    // ボスの出現条件チェック - 時間経過のみに変更
    if (!this.boss && this.gameTime >= this.bossSpawnTime) {
      console.log('ボスが出現しました - 時間経過による出現');
      this.boss = new Boss(this.game);
    }
    
    // ボスの更新
    if (this.boss) {
      this.boss.update(deltaTime);
      
      // ボスが倒されたらステージクリア
      if (!this.boss.isActive) {
        console.log('ボスを倒しました - ステージクリア');
        // ボスをnullに設定するだけで、ゲームオーバーにはしない
        this.boss = null;
        
        // 敵を再配置して次の段階へ
        this.createEnemies();
        
        // スコア加算
        this.game.scoreManager.addScore(300); // ボス撃破:300点
        this.updateScoreDisplay();
      }
    }
  }
  
  // プレイヤーの弾の更新
  updatePlayerBullets(deltaTime) {
    for (let i = 0; i < this.playerBullets.length; i++) {
      this.playerBullets[i].update(deltaTime);
    }
    
    // 無効になった弾を削除
    this.playerBullets = this.playerBullets.filter(bullet => bullet.isActive);
  }
  
  // 敵の弾の更新
  updateEnemyBullets(deltaTime) {
    for (let i = 0; i < this.enemyBullets.length; i++) {
      this.enemyBullets[i].update(deltaTime);
    }
    
    // 無効になった弾を削除
    this.enemyBullets = this.enemyBullets.filter(bullet => bullet.isActive);
  }
  
  // 衝突判定
  checkCollisions() {
    // デバッグ情報を追加
    console.log('衝突判定実行中 - 敵数:', this.enemies.length, 'プレイヤー弾数:', this.playerBullets.length);
    
    // プレイヤーの弾と敵の衝突判定
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const bullet = this.playerBullets[i];
      
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        
        if (this.checkEntityCollision(bullet, enemy)) {
          // 敵にダメージ
          enemy.takeDamage(1);
          
          // 弾を削除
          this.playerBullets.splice(i, 1);
          
          // 敵が倒れた場合
          if (!enemy.isActive) {
            // スコア加算
            this.game.scoreManager.addScore(10); // 敵撃破:10点
            this.updateScoreDisplay();
            
            // 敵を配列から削除
            this.enemies.splice(j, 1);
            
            // 爆発音の再生
            this.game.audioManager.play('explosion', 0.3);
          }
          
          break;
        }
      }
      
      // UFOとの衝突判定
      if (this.ufo && this.checkEntityCollision(bullet, this.ufo)) {
        // UFOにダメージ
        this.ufo.takeDamage(1);
        
        // 弾を削除
        this.playerBullets.splice(i, 1);
        
        // UFOが倒れた場合
        if (!this.ufo.isActive) {
          // スコア加算
          this.game.scoreManager.addScore(100); // UFO撃破:100点
          this.updateScoreDisplay();
          
          // UFOをnullに設定
          this.ufo = null;
          
          // 爆発音の再生
          this.game.audioManager.play('explosion', 0.4);
        }
      }
      
      // ボスとの衝突判定
      if (this.boss && this.checkEntityCollision(bullet, this.boss)) {
        // ボスにダメージ
        this.boss.takeDamage(1);
        
        // 弾を削除
        this.playerBullets.splice(i, 1);
        
        // ボスが倒れた場合
        if (!this.boss.isActive) {
          // スコア加算
          this.game.scoreManager.addScore(300); // ボス撃破:300点
          this.updateScoreDisplay();
          
          // ボスをnullに設定
          this.boss = null;
          
          // 爆発音の再生
          this.game.audioManager.play('explosion', 0.5);
        }
      }
    }
    
    // 敵の弾とプレイヤーの衝突判定
    // 一時的に無効化してデバッグ
    /*
    if (this.player) {
      for (const bullet of this.enemyBullets) {
        if (this.checkEntityCollision(bullet, this.player)) {
          // プレイヤーがダメージを受ける
          console.log('敵の弾がプレイヤーに当たりました');
          this.handleGameOver();
          bullet.isActive = false;
        }
      }
    }
    */
      
    // 敵とプレイヤーの衝突判定
    if (this.player && this.collisionEnabled) { // 衝突判定が有効な場合のみ実行
      // 定期的に敵の位置をログ出力
      if (Math.floor(this.gameTime) % 5 === 0 && Math.floor(this.gameTime) > 0) {
        // 最も下にいる敵を特定
        if (this.enemies.length > 0) {
          const lowestEnemy = this.enemies.reduce((lowest, enemy) => 
            enemy.y > lowest.y ? enemy : lowest, this.enemies[0]);
          console.log('最下部の敵の位置 - Y座標:', lowestEnemy.y, '画面高さ:', this.canvas.height);
          console.log('プレイヤーの位置 - Y座標:', this.player.y, 'プレイヤーの高さ:', this.player.height);
        }
      }
      
      for (const enemy of this.enemies) {
        // 敵が画面下端まで降りてきた場合
        // プレイヤーより大幅に下に到達した場合にゲームオーバーとする
        
        // プレイヤーの底辺の位置を正確に計算
        const playerBottomPosition = this.player.y + this.player.height / 2;
        
        // 敵が画面下端に到達した場合にのみゲームオーバーとする
        // プレイヤーの位置に関係なく、画面高さの90%を超えた場合にゲームオーバー
        const gameOverThreshold = this.canvas.height * 0.9; // 画面高さの90%をしきい値とする
        
        // 敵の下端がゲームオーバーのしきい値を超えた場合
        const enemyBottomPosition = enemy.y + enemy.height / 2;
        
        if (enemyBottomPosition > gameOverThreshold) {
          console.log('敵が画面下端に到達しました');
          console.log('敵のY座標:', enemy.y, '敵の下端位置:', enemyBottomPosition);
          console.log('ゲームオーバーしきい値:', gameOverThreshold, '(画面高さの90%)');
          console.log('画面高さ:', this.canvas.height);
          this.handleGameOver();
          return; // 衝突判定を終了
        }
        
        // プレイヤーと敵の直接衝突
        // 衝突判定をより厳密にするための調整係数
        const collisionAdjustment = 0.8; // 80%のサイズで衝突判定
        const playerWidth = this.player.width * collisionAdjustment;
        const playerHeight = this.player.height * collisionAdjustment;
        const enemyWidth = enemy.width * collisionAdjustment;
        const enemyHeight = enemy.height * collisionAdjustment;
        
        // 調整されたサイズで衝突判定
        const collision = (
          this.player.x - playerWidth / 2 < enemy.x + enemyWidth / 2 &&
          this.player.x + playerWidth / 2 > enemy.x - enemyWidth / 2 &&
          this.player.y - playerHeight / 2 < enemy.y + enemyHeight / 2 &&
          this.player.y + playerHeight / 2 > enemy.y - enemyHeight / 2
        );
        
        if (collision) {
          console.log('プレイヤーと敵が衝突しました');
          console.log('プレイヤー位置:', this.player.x, this.player.y);
          console.log('敵位置:', enemy.x, enemy.y);
          this.handleGameOver();
          return; // 衝突判定を終了
        }
      }
    }
  }
  
  // エンティティ同士の衝突判定
  checkEntityCollision(entity1, entity2) {
    // 矩形の衝突判定
    return (
      entity1.x - entity1.width / 2 < entity2.x + entity2.width / 2 &&
      entity1.x + entity1.width / 2 > entity2.x - entity2.width / 2 &&
      entity1.y - entity1.height / 2 < entity2.y + entity2.height / 2 &&
      entity1.y + entity1.height / 2 > entity2.y - entity2.height / 2
    );
  }
  
  // ゲーム状態の確認
  checkGameState() {
    // デバッグ情報を追加
    if (Math.floor(this.gameTime) % 5 === 0 && Math.floor(this.gameTime) > 0) {
      // 5秒おきにログを出力してログ量を減らす
      console.log('ゲーム状態確認中 - 敵数:', this.enemies.length);
      console.log('ゲーム時間:', Math.floor(this.gameTime), '秒');
      
      // 敵の位置をログ出力
      if (this.enemies.length > 0) {
        const lowestEnemy = this.enemies.reduce((lowest, enemy) => 
          enemy.y > lowest.y ? enemy : lowest, this.enemies[0]);
        console.log('最も下にいる敵の位置:', lowestEnemy.y, '画面高さ:', this.canvas.height);
      }
    }
    
    // 敵が全滅した場合は次の敵を生成
    if (this.enemies.length === 0 && !this.boss && !this.enemyRespawnScheduled) {
      console.log('敵を全滅させました！次の敵を生成します');
      
      // 再生成フラグを立てて重複生成を防止
      this.enemyRespawnScheduled = true;
      
      // 敵を再配置
      setTimeout(() => {
        this.createEnemies();
        
        // ステージクリアボーナス
        this.game.scoreManager.addScore(100); // ステージボーナス:100点
        this.updateScoreDisplay();
        
        // 再生成フラグをリセット
        this.enemyRespawnScheduled = false;
      }, 1500); // 1.5秒後に敵を生成
    }
  }
  
  // ゲームオーバー処理
  handleGameOver() {
    // ゲーム開始直後のゲームオーバーをスキップ
    if (this.gameTime < 2) {
      console.log('ゲーム開始直後のゲームオーバーをスキップしました');
      return;
    }
    
    // 既にゲームオーバーなら何もしない
    if (this.gameOver) return;
    
    // 詳細なデバッグ情報を追加
    console.log('ゲームオーバーが発生しました');
    console.log('ゲーム時間:', this.gameTime);
    console.log('敵の数:', this.enemies.length);
    
    // 敵の位置情報を詳細に出力
    if (this.enemies.length > 0) {
      // 敵をY座標でソート
      const sortedEnemies = [...this.enemies].sort((a, b) => b.y - a.y);
      // 上から5体の敵の位置を出力
      console.log('最下部の敵の位置情報:');
      for (let i = 0; i < Math.min(5, sortedEnemies.length); i++) {
        const enemy = sortedEnemies[i];
        console.log(`敵 ${i+1}: Y座標=${enemy.y}, 上端=${enemy.y - enemy.height/2}, 下端=${enemy.y + enemy.height/2}`);
      }
    }
    
    // プレイヤーの位置情報
    if (this.player) {
      console.log('プレイヤー位置情報:');
      console.log(`X座標=${this.player.x}, Y座標=${this.player.y}`);
      console.log(`幅=${this.player.width}, 高さ=${this.player.height}`);
      console.log(`上端=${this.player.y - this.player.height/2}, 下端=${this.player.y + this.player.height/2}`);
    }
    
    // 画面サイズ情報
    console.log('画面サイズ情報:');
    console.log(`幅=${this.canvas.width}, 高さ=${this.canvas.height}`);
    
    // スタックトレース
    console.log('スタックトレース:', new Error());
    
    // ゲームオーバーフラグを立てる
    this.gameOver = true;
    
    // プレイヤーを非アクティブに
    if (this.player) {
      this.player.isActive = false;
    }
    
    // ゲームオーバー画面に切り替え
    setTimeout(() => {
      this.game.switchScreen('gameOver');
    }, 1000);
  }
  
  // 描画処理
  render(ctx) {
    try {
      // 背景の描画
      this.drawBackground(ctx);
      
      // プレイヤーの描画
      if (this.player) {
        this.player.render(ctx);
      }
      
      // 敵の描画
      for (const enemy of this.enemies) {
        enemy.render(ctx);
      }
      
      // UFOの描画
      if (this.ufo) {
        this.ufo.render(ctx);
      }
      
      // ボスの描画
      if (this.boss) {
        this.boss.render(ctx);
      }
      
      // プレイヤーの弾の描画
      for (const bullet of this.playerBullets) {
        bullet.render(ctx);
      }
      
      // 敵の弾の描画
      for (const bullet of this.enemyBullets) {
        bullet.render(ctx);
      }
      
      // デバッグ情報の描画
      this.renderDebugInfo(ctx);
      
    } catch (error) {
      console.error('ゲーム画面の描画エラー:', error);
      
      // エラー表示
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = '#FF0000';
      ctx.font = '16px Arial';
      ctx.fillText('描画エラーが発生しました:', 10, 50);
      ctx.fillText(error.message, 10, 80);
      
      // デバッグ情報更新
      const debugInfo = document.getElementById('debug-info');
      if (debugInfo) debugInfo.textContent = `エラー: ゲーム描画失敗 - ${error.message}`;
    }
  }
  
  // デバッグ情報の描画
  renderDebugInfo(ctx) {
    // ゲーム状態のデバッグ情報
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px Arial';
    
    // 敵の数と弾の数を表示
    ctx.fillText(`敵: ${this.enemies.length}`, 10, 20);
    ctx.fillText(`弾: ${this.playerBullets.length}`, 10, 40);
    ctx.fillText(`敵弾: ${this.enemyBullets.length}`, 10, 60);
    
    // ゲーム時間
    const minutes = Math.floor(this.gameTime / 60);
    const seconds = Math.floor(this.gameTime % 60);
    ctx.fillText(`時間: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`, 10, 80);
    
    // プレイヤー情報
    if (this.player) {
      ctx.fillText(`プレイヤー位置: X=${Math.round(this.player.x)}, Y=${Math.round(this.player.y)}`, 10, 100);
      ctx.fillText(`チャージ: ${Math.round(this.player.chargeTime / this.player.requiredChargeTime * 100)}%`, 10, 120);
      ctx.fillText(`発射可能: ${this.player.canShoot ? '可' : '不可'}`, 10, 140);
    }
    
    // スコア情報
    const score = this.game.scoreManager.getScore();
    const highScore = this.game.scoreManager.getHighScore();
    ctx.fillText(`スコア: ${score}`, 10, 160);
    ctx.fillText(`ハイスコア: ${highScore}`, 10, 180);
    
    // ゲーム状態
    ctx.fillText(`ゲームオーバー: ${this.gameOver ? 'はい' : 'いいえ'}`, 10, 200);
    
    // デバッグ情報更新
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) {
      const fps = Math.round(1 / (this.game.deltaTime || 0.016));
      debugInfo.textContent = `ゲーム画面実行中 - FPS: ${fps} - 敵: ${this.enemies.length} - スコア: ${score}`;
    }
  }
  
  // 背景の描画
  drawBackground(ctx) {
    // 真っ黒な背景
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // 星空の描画は削除
  }
  
  // 星空の描画関数は削除しました
  
  // プレイヤーの弾を追加
  addBullet(bullet) {
    this.playerBullets.push(bullet);
  }
  
  // 敵の弾を追加
  addEnemyBullet(bullet) {
    this.enemyBullets.push(bullet);
  }
  
  // スコア表示の作成
  createScoreDisplay() {
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'score-display';
    
    const score = this.game.scoreManager.getScore();
    const highScore = this.game.scoreManager.getHighScore();
    
    scoreDisplay.innerHTML = `スコア: ${score}<br>ハイスコア: ${highScore}`;
    scoreDisplay.style.position = 'absolute';
    scoreDisplay.style.top = '10px';
    scoreDisplay.style.left = '10px';
    scoreDisplay.style.color = 'white';
    scoreDisplay.style.fontSize = '14px';
    scoreDisplay.style.zIndex = '1000';
    scoreDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    scoreDisplay.style.padding = '5px 10px';
    scoreDisplay.style.borderRadius = '3px';
    
    document.body.appendChild(scoreDisplay);
    this.scoreDisplay = scoreDisplay;
    
    // バージョン表示も作成
    const versionDisplay = document.createElement('div');
    versionDisplay.className = 'game-version-display';
    versionDisplay.textContent = 'v0.1.4';
    versionDisplay.style.position = 'absolute';
    versionDisplay.style.top = '10px';
    versionDisplay.style.right = '10px';
    versionDisplay.style.color = '#888';
    versionDisplay.style.fontSize = '12px';
    versionDisplay.style.zIndex = '1000';
    versionDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    versionDisplay.style.padding = '3px 8px';
    versionDisplay.style.borderRadius = '3px';
    
    document.body.appendChild(versionDisplay);
    this.versionDisplay = versionDisplay;
  }
  
  // スコア表示の更新
  updateScoreDisplay() {
    if (this.scoreDisplay) {
      const score = this.game.scoreManager.getScore();
      const highScore = this.game.scoreManager.getHighScore();
      
      this.scoreDisplay.innerHTML = `ハイスコア: ${highScore}<br>スコア: ${score}`;
    }
  }
  
  // スコア表示の削除
  removeScoreDisplay() {
    if (this.scoreDisplay && this.scoreDisplay.parentNode) {
      this.scoreDisplay.parentNode.removeChild(this.scoreDisplay);
    }
    if (this.versionDisplay && this.versionDisplay.parentNode) {
      this.versionDisplay.parentNode.removeChild(this.versionDisplay);
    }
  }
  
  // チャージバーの作成
  createChargeBar() {
    const chargeBarContainer = document.createElement('div');
    chargeBarContainer.className = 'special-charge';
    
    const chargeBar = document.createElement('div');
    chargeBar.className = 'charge-bar';
    
    chargeBarContainer.appendChild(chargeBar);
    document.body.appendChild(chargeBarContainer);
    
    this.chargeBar = {
      container: chargeBarContainer,
      bar: chargeBar
    };
  }
  
  // チャージバーの更新
  updateChargeBar() {
    if (this.chargeBar && this.player) {
      if (this.player.isCharging) {
        this.chargeBar.container.style.display = 'block';
        const chargePercent = Math.min(this.player.chargeTime / this.player.requiredChargeTime, 1) * 100;
        this.chargeBar.bar.style.width = `${chargePercent}%`;
        
        if (this.player.specialReady) {
          this.chargeBar.bar.style.backgroundColor = '#ffcc00';
        } else {
          this.chargeBar.bar.style.backgroundColor = '#ffffff';
        }
      } else {
        this.chargeBar.container.style.display = 'none';
      }
    }
  }
  
  // チャージバーの削除
  removeChargeBar() {
    if (this.chargeBar && this.chargeBar.container.parentNode) {
      this.chargeBar.container.parentNode.removeChild(this.chargeBar.container);
    }
  }
}
