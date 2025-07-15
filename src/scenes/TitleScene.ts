/**
 * CNP インベーダー - タイトル画面（TypeScript版）
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

import { BaseScene } from './BaseScene';
import type { GameEngine } from '../core/GameEngine';
import type { InputManager } from '../core/InputManager';
import type { GameConfigType } from '../core/config';
import type { GameScene } from './GameScene';

export class TitleScene extends BaseScene {
  private game: GameEngine;
  private inputManager: InputManager;
  private config: GameConfigType;
  private gameScene: GameScene;
  
  // 機体選択
  private selectedShip = 0; // 0: 咲夜, 1: ネム, 2: シャオラン
  private shipNames = ['咲夜', 'ネム', 'シャオラン'];
  private shipKeys = ['A', 'B', 'C'] as const;
  
  // UI状態
  private fadeAlpha = 0;
  private fadeDirection = 1;
  private titleImage: HTMLImageElement | null = null;
  
  // プレイヤー画像のキャッシュ
  private playerImages: { [key: string]: HTMLImageElement } = {};
  
  // キー押下状態の追跡（フレームレート問題対策）
  private lastPressedKeys: Set<string> = new Set();
  
  // ボタンUI
  private buttons = {
    start: { x: 180, y: 400, width: 120, height: 40, text: 'ゲーム開始' },
    option: { x: 180, y: 450, width: 120, height: 40, text: 'オプション' }
  };
  private hoveredButton: string | null = null;

  // イベントリスナーの参照を保持
  private mouseMoveHandler: (event: MouseEvent) => void;
  private clickHandler: (event: MouseEvent) => void;

  constructor(game: GameEngine, inputManager: InputManager, gameScene: GameScene) {
    super();
    this.game = game;
    this.inputManager = inputManager;
    this.config = game.getConfig();
    this.gameScene = gameScene;
    
    // イベントハンドラーをバインド
    this.mouseMoveHandler = this.handleMouseMove.bind(this);
    this.clickHandler = this.handleClick.bind(this);
    
    this.loadAssets();
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isActive) return;
    
    const canvas = this.game.getCanvas();
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    this.hoveredButton = null;
    for (const [buttonName, button] of Object.entries(this.buttons)) {
      if (mouseX >= button.x - button.width/2 && 
          mouseX <= button.x + button.width/2 &&
          mouseY >= button.y - button.height/2 && 
          mouseY <= button.y + button.height/2) {
        this.hoveredButton = buttonName;
        break;
      }
    }
  }

  private handleClick(event: MouseEvent): void {
    if (!this.isActive) return;
    
    // イベントの伝播を防ぐ
    event.stopPropagation();
    event.preventDefault();
    
    const canvas = this.game.getCanvas();
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    for (const [buttonName, button] of Object.entries(this.buttons)) {
      if (mouseX >= button.x - button.width/2 && 
          mouseX <= button.x + button.width/2 &&
          mouseY >= button.y - button.height/2 && 
          mouseY <= button.y + button.height/2) {
        this.handleButtonClick(buttonName);
        return; // クリックを処理したら終了
      }
    }
  }

  private setupMouseEvents(): void {
    const canvas = this.game.getCanvas();
    
    // イベントリスナーを追加
    canvas.addEventListener('mousemove', this.mouseMoveHandler);
    canvas.addEventListener('click', this.clickHandler);
  }

  private removeMouseEvents(): void {
    const canvas = this.game.getCanvas();
    
    // イベントリスナーを削除
    canvas.removeEventListener('mousemove', this.mouseMoveHandler);
    canvas.removeEventListener('click', this.clickHandler);
  }
  
  private handleButtonClick(buttonName: string): void {
    switch (buttonName) {
      case 'start':
        console.log('Start button clicked');
        this.startGame();
        break;
      case 'option':
        console.log('Option button clicked');
        this.game.switchToScene('option');
        break;
    }
  }

  private loadAssets(): void {
    // タイトルロゴの読み込み
    this.titleImage = new Image();
    this.titleImage.onload = () => {
      // Title logo loaded
    };
    this.titleImage.onerror = () => {
      console.error('Failed to load title logo');
    };
    this.titleImage.src = './src/assets/img/ui/title_logo.png';
    
    // プレイヤー画像の事前読み込み
    this.loadPlayerImages();
  }
  
  private loadPlayerImages(): void {
    // 正面向きの画像ファイル名を定義
    const frontImages = {
      'A': 'player_A_front.png',
      'B': 'player_B_front.png',
      'C': 'player_C_front.png'
    };
    
    for (const shipKey of this.shipKeys) {
      const img = new Image();
      img.onload = () => {
        // Player front image loaded
      };
      img.onerror = () => {
        console.error(`Failed to load player ${shipKey} front image:`, frontImages[shipKey]);
      };
      img.src = `./src/assets/img/player/${frontImages[shipKey]}`;
      this.playerImages[shipKey] = img;
    }
  }

  onEnter(): void {
    this.fadeAlpha = 0;
    this.fadeDirection = 1;
    
    // イベントリスナーを設定
    this.setupMouseEvents();
  }

  onExit(): void {
    // イベントリスナーを削除
    this.removeMouseEvents();
  }

  private frameCount = 0;
  
  update(deltaTime: number): void {
    if (!this.isActive) {
      return;
    }

    this.frameCount++;

    // 入力更新
    this.inputManager.update(deltaTime);
    
    // フェードエフェクト更新
    this.updateFadeEffect(deltaTime);
    
    // 入力処理
    this.handleInput();
  }

  private updateFadeEffect(deltaTime: number): void {
    // タイトル文字の点滅エフェクト
    this.fadeAlpha += this.fadeDirection * deltaTime * 2;
    
    if (this.fadeAlpha >= 1) {
      this.fadeAlpha = 1;
      this.fadeDirection = -1;
    } else if (this.fadeAlpha <= 0.3) {
      this.fadeAlpha = 0.3;
      this.fadeDirection = 1;
    }
  }

  private inputCheckCount = 0;
  
  private handleInput(): void {
    this.inputCheckCount++;
    
    // デバッグ: 全てのキー状態を確認 + フレームレート問題対策
    const allKeys = ['ArrowLeft', 'ArrowRight', ' ', 'Enter', 'a', 'A', 'd', 'D', '1', '2', '3', '4', '5', '6', 'b', 'B', 'c', 'C', 'g', 'G'];
    const currentPressedKeys = new Set<string>();
    
    for (const key of allKeys) {
      if (this.inputManager.isKeyDown(key)) {
        currentPressedKeys.add(key);
      }
    }
    
    // 新しく押されたキーを検出（フレームレート問題対策）
    const newlyPressed = new Set<string>();
    for (const key of currentPressedKeys) {
      if (!this.lastPressedKeys.has(key)) {
        newlyPressed.add(key);
      }
    }
    this.lastPressedKeys = currentPressedKeys;
    
    // デバッグ: 新しく押されたキーを表示
    if (newlyPressed.size > 0) {
      console.log('Newly pressed keys:', Array.from(newlyPressed));
    }
    
    // 機体選択（新しく押されたキーで判定）
    if (newlyPressed.has('ArrowLeft') || newlyPressed.has('a') || newlyPressed.has('A')) {
      this.selectedShip = (this.selectedShip - 1 + this.shipNames.length) % this.shipNames.length;
    }
    
    if (newlyPressed.has('ArrowRight') || newlyPressed.has('d') || newlyPressed.has('D')) {
      this.selectedShip = (this.selectedShip + 1) % this.shipNames.length;
    }
    
    // ゲーム開始（1キーのみ、スペースキーとエンターキーは無効）
    if (newlyPressed.has('1')) {
      this.startGame();
    }
    
    // デバッグ: ステージセレクト機能
    if (this.config.DEBUG.ENABLED && this.config.DEBUG.STAGE_SELECT) {
      // デバッグ情報の表示
      if (this.frameCount % 60 === 0) {
        console.log('Debug mode enabled, stage select enabled, newly pressed:', Array.from(newlyPressed));
      }
      // 数字キーでステージ直接選択
      if (newlyPressed.has('2')) {
        this.startGameWithStage(2);
      }
      
      if (newlyPressed.has('3')) {
        this.startGameWithStage(3);
      }
      
      // ボス戦直接開始
      if (newlyPressed.has('b') || newlyPressed.has('B')) {
        this.startBossBattle(); // デフォルトのボス戦（ステージ1のボス）
      }
      
      // 各ボス戦に直接移行
      if (newlyPressed.has('4')) {
        this.startSpecificBossBattle('A'); // 弁天
      }
      
      if (newlyPressed.has('5')) {
        this.startSpecificBossBattle('B'); // 孤白
      }
      
      if (newlyPressed.has('6')) {
        this.startSpecificBossBattle('C'); // 鬼
      }
      
      // Gキーでゲームオーバー画面
      if (newlyPressed.has('g') || newlyPressed.has('G')) {
        console.log('G key pressed - showing game over screen');
        this.showGameOverScreen();
      }
      
      // Cキーでゲームクリア画面
      if (newlyPressed.has('c') || newlyPressed.has('C')) {
        console.log('C key pressed - showing game clear screen');
        this.showGameClearScreen();
      }
    }
  }

  private startGame(): void {
    const selectedShipKey = this.shipKeys[this.selectedShip];
    
    // 選択した機体をGameSceneに設定
    this.gameScene.setSelectedShip(selectedShipKey);
    
    // GameSceneに遷移
    this.game.switchToScene('game');
  }

  private startGameWithStage(stage: number): void {
    const selectedShipKey = this.shipKeys[this.selectedShip];
    
    // 選択した機体をGameSceneに設定
    this.gameScene.setSelectedShip(selectedShipKey);
    
    // デバッグ用ステージ設定
    this.gameScene.setDebugStage(stage);
    
    // GameSceneに遷移
    this.game.switchToScene('game');
  }

  private startBossBattle(): void {
    const selectedShipKey = this.shipKeys[this.selectedShip];
    
    // 選択した機体をGameSceneに設定
    this.gameScene.setSelectedShip(selectedShipKey);
    
    // デバッグ用ボス戦設定
    this.gameScene.setDebugBossMode(true);
    
    // GameSceneに遷移
    this.game.switchToScene('game');
  }
  
  private startSpecificBossBattle(bossType: 'A' | 'B' | 'C'): void {
    const selectedShipKey = this.shipKeys[this.selectedShip];
    
    // 選択した機体をGameSceneに設定
    this.gameScene.setSelectedShip(selectedShipKey);
    
    // 特定のボス戦用設定
    this.gameScene.setDebugSpecificBossMode(true, bossType);
    
    // GameSceneに遷移
    this.game.switchToScene('game');
  }
  
  private showGameOverScreen(): void {
    console.log('showGameOverScreen called');
    const selectedShipKey = this.shipKeys[this.selectedShip];
    
    // 選択した機体をGameSceneに設定
    this.gameScene.setSelectedShip(selectedShipKey);
    console.log('Selected ship set to:', selectedShipKey);
    
    // デバッグ用ゲームオーバー設定
    this.gameScene.setDebugGameOverMode(true);
    console.log('Debug game over mode set to true');
    
    // GameSceneに遷移
    this.game.switchToScene('game');
    console.log('Switched to game scene');
  }
  
  private showGameClearScreen(): void {
    console.log('showGameClearScreen called');
    const selectedShipKey = this.shipKeys[this.selectedShip];
    
    // 選択した機体をGameSceneに設定
    this.gameScene.setSelectedShip(selectedShipKey);
    console.log('Selected ship set to:', selectedShipKey);
    
    // デバッグ用ゲームクリア設定
    this.gameScene.setDebugGameClearMode(true);
    console.log('Debug game clear mode set to true');
    
    // GameSceneに遷移
    this.game.switchToScene('game');
    console.log('Switched to game scene');
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;

    const canvas = this.game.getCanvas();
    
    // 背景描画
    this.renderBackground(ctx, canvas);
    
    // タイトルロゴ描画
    this.renderTitleLogo(ctx, canvas);
    
    // 機体選択UI描画
    this.renderShipSelection(ctx, canvas);
    
    // ボタン描画
    this.renderButtons(ctx, canvas);
    
    // 操作説明描画
    this.renderInstructions(ctx, canvas);
    
    // バージョン情報描画
    this.renderVersionInfo(ctx, canvas);
    
    // 無敵モード表示
    this.renderGodModeStatus(ctx, canvas);
  }

  private renderBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // グラデーション背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000022');
    gradient.addColorStop(0.5, '#000044');
    gradient.addColorStop(1, '#000011');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 星のエフェクト（簡易版）
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 50; i++) {
      const x = (i * 7) % canvas.width;
      const y = (i * 11) % canvas.height;
      const alpha = Math.sin(Date.now() * 0.001 + i) * 0.5 + 0.5;
      ctx.globalAlpha = alpha * 0.7;
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;
  }

  private renderTitleLogo(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const centerX = canvas.width / 2;
    const logoY = 80;

    if (this.titleImage && this.titleImage.complete) {
      // タイトル画像が読み込まれている場合
      const logoWidth = 200;
      const logoHeight = 60;
      ctx.drawImage(
        this.titleImage,
        centerX - logoWidth / 2,
        logoY,
        logoWidth,
        logoHeight
      );
    } else {
      // フォールバック：テキストでタイトル表示
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 32px serif';
      ctx.textAlign = 'center';
      ctx.fillText('CNP インベーダー', centerX, logoY + 40);
    }
  }

  private renderShipSelection(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const centerX = canvas.width / 2;
    const selectionY = canvas.height - 120; // 最下部に移動
    
    // 機体リスト（セクションタイトルを削除）
    const shipY = selectionY + 20;
    const shipSpacing = 80; // 間隔を広げて画像表示スペースを確保
    
    for (let i = 0; i < this.shipNames.length; i++) {
      const x = centerX + (i - 1) * shipSpacing;
      const isSelected = i === this.selectedShip;
      
      // 選択中の機体をハイライト
      if (isSelected) {
        ctx.fillStyle = '#FFD700';
        ctx.globalAlpha = this.fadeAlpha;
        ctx.fillRect(x - 30, shipY - 50, 60, 80);
        ctx.globalAlpha = 1;
      }
      
      // プレイヤー画像の描画（正面向き）
      this.renderPlayerImage(ctx, x, shipY - 20, this.shipKeys[i] as 'A' | 'B' | 'C', isSelected);
      
      // 機体名
      ctx.fillStyle = isSelected ? '#000000' : '#FFFFFF';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.shipNames[i], x, shipY + 20);
    }
    
    // 選択説明
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('← → で選択', centerX, shipY + 40);
  }
  
  private renderPlayerImage(ctx: CanvasRenderingContext2D, x: number, y: number, shipType: 'A' | 'B' | 'C', isSelected: boolean): void {
    const img = this.playerImages[shipType];
    
    ctx.save();
    
    if (img && img.complete && img.naturalWidth > 0) {
      // プレイヤー画像が読み込まれている場合
      if (isSelected) {
        // 選択中は光らせる
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 15;
      }
      ctx.drawImage(img, x - 24, y - 36, 48, 72); // ゲーム画面と同じサイズ
    } else {
      // フォールバック：画像が読み込まれていない場合
      if (isSelected) {
        ctx.fillStyle = '#FFD700';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 10;
      } else {
        ctx.fillStyle = '#666666';
      }
      ctx.fillRect(x - 24, y - 36, 48, 72); // ゲーム画面と同じサイズ
      
      // 機体名を表示（フォールバック時）
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(shipType, x, y + 4);
    }
    
    ctx.restore();
  }

  private renderButtons(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    for (const [buttonName, button] of Object.entries(this.buttons)) {
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

  private renderInstructions(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const centerX = canvas.width / 2;
    const instructionY = 520;
    
    ctx.save();
    
    // キーボード操作説明
    ctx.fillStyle = '#AAAAAA';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('A/D または ←→: 機体選択', centerX, instructionY);
    ctx.fillText('1: ゲーム開始', centerX, instructionY + 15);
    
    // デバッグ情報表示（キャンバス内の右上）
    if (this.config.DEBUG.ENABLED) {
      ctx.fillStyle = '#FFFF00';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      const debugX = canvas.width - 180; // キャンバス内の右上
      ctx.fillText('=== DEBUG MODE ===', debugX, 30);
      ctx.fillText('2: Stage 2 直接開始', debugX, 50);
      ctx.fillText('3: Stage 3 直接開始', debugX, 70);
      ctx.fillText('B: Boss戦 直接開始', debugX, 90);
      ctx.fillText('4: 弁天ボス戦', debugX, 110);
      ctx.fillText('5: 孤白ボス戦', debugX, 130);
      ctx.fillText('6: 鬼ボス戦', debugX, 150);
      ctx.fillText('G: ゲームオーバー画面', debugX, 170);
      ctx.fillText('C: ゲームクリア画面', debugX, 190);
    }
    
    ctx.restore();
  }

  private renderVersionInfo(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    ctx.fillStyle = this.config.UI.VERSION_COLOR;
    ctx.font = this.config.UI.VERSION_FONT_SIZE + ' monospace';
    ctx.textAlign = 'right';
    ctx.fillText(
      `v${this.config.VERSION}`,
      canvas.width - 10,
      canvas.height - 10
    );
  }

  private renderGodModeStatus(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // 無敵モード表示
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '16px Arial';
    ctx.fillStyle = this.config.DEBUG.GOD_MODE ? '#88ff88' : '#ffaa88';
    ctx.fillText(
      `無敵モード: ${this.config.DEBUG.GOD_MODE ? 'ON' : 'OFF'}`,
      canvas.width / 2,
      200
    );
    ctx.restore();
  }

  // 外部から機体選択を取得
  getSelectedShip(): string {
    return this.shipKeys[this.selectedShip];
  }
}