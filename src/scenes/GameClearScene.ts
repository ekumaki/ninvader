/**
 * CNP インベーダー - ゲームクリア画面（TypeScript版）
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

import { BaseScene } from './BaseScene';
import type { GameEngine } from '../core/GameEngine';
import type { InputManager } from '../core/InputManager';
import type { GameConfigType } from '../core/config';

export class GameClearScene extends BaseScene {
  private game: GameEngine;
  private inputManager: InputManager;
  private config: GameConfigType;
  
  // 演出用アニメーション
  private animTimer = 0;
  
  // ボタン
  private buttons = {
    title: { x: 180, y: 400, width: 200, height: 40, text: 'タイトルにもどる' }
  };
  private hoveredButton: string | null = null;
  
  // ゲーム情報
  private selectedShipType: 'A' | 'B' | 'C' = 'A';
  
  // プレイヤー画像
  private playerImage: HTMLImageElement | null = null;

  constructor(game: GameEngine, inputManager: InputManager) {
    super();
    this.game = game;
    this.inputManager = inputManager;
    this.config = game.getConfig();
    
    this.setupMouseEvents();
  }
  
  private setupMouseEvents(): void {
    const canvas = this.game.getCanvas();
    
    // マウス移動
    canvas.addEventListener('mousemove', (event) => {
      if (!this.isActive) return;
      
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
    });
    
    // マウスクリック
    canvas.addEventListener('click', (event) => {
      if (!this.isActive) return;
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      for (const [buttonName, button] of Object.entries(this.buttons)) {
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
      // GameSceneのステージをリセット
      const gameScene = this.game.getScene('game') as any;
      if (gameScene && gameScene.resetToStageOne) {
        gameScene.resetToStageOne();
      }
      this.game.switchToScene('title');
    }
  }
  
  setGameInfo(selectedShipType: 'A' | 'B' | 'C'): void {
    this.selectedShipType = selectedShipType;
    this.loadPlayerImage();
  }
  
  private loadPlayerImage(): void {
    // 正面向きの画像ファイル名を定義
    const frontImages = {
      'A': 'player_A_front.png',
      'B': 'player_B_front.png',
      'C': 'player_C_front.png'
    };
    
    this.playerImage = new Image();
    this.playerImage.onload = () => {
      console.log(`Player ${this.selectedShipType} front image loaded for game clear`);
    };
    this.playerImage.onerror = () => {
      console.error(`Failed to load player ${this.selectedShipType} front image:`, frontImages[this.selectedShipType]);
    };
    this.playerImage.src = `./src/assets/img/player/${frontImages[this.selectedShipType]}`;
  }

  onEnter(): void {
    this.animTimer = 0;
  }

  onExit(): void {
    // シーンクリーンアップ
  }

  update(deltaTime: number): void {
    if (!this.isActive) return;

    // 入力更新
    this.inputManager.update(deltaTime);
    
    // アニメーションタイマー更新
    this.animTimer += deltaTime;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;

    const canvas = this.game.getCanvas();
    
    // 完全に黒い背景
    ctx.fillStyle = '#000000';
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
    this.renderButtons(ctx);
  }
  
  private renderCelebrationPlayer(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // ジャンプアニメーション計算
    const jumpProgress = (this.animTimer * 2) % (Math.PI * 2);
    const jumpHeight = Math.sin(jumpProgress) * 30;
    
    const playerX = canvas.width / 2;
    const baseY = canvas.height - 60; // ゲーム画面と同じ位置
    const playerY = baseY - Math.abs(jumpHeight);
    
    ctx.save();
    
    if (this.playerImage && this.playerImage.complete && this.playerImage.naturalWidth > 0) {
      // プレイヤー正面画像を描画
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 15;
      ctx.drawImage(this.playerImage, playerX - 24, playerY - 36, 48, 72); // ゲーム画面と同じサイズ
    } else {
      // フォールバック描画
      ctx.fillStyle = '#00FF00';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 15;
      ctx.fillRect(playerX - 24, playerY - 36, 48, 72); // ゲーム画面と同じサイズ
      
      // 機体名を表示（フォールバック時）
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.selectedShipType, playerX, playerY + 4);
    }
    
    ctx.restore();
  }
  
  private renderButtons(ctx: CanvasRenderingContext2D): void {
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
}