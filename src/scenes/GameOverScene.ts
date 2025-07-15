/**
 * CNP インベーダー - ゲームオーバー画面（TypeScript版）
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

import { BaseScene } from './BaseScene';
import type { GameEngine } from '../core/GameEngine';
import type { InputManager } from '../core/InputManager';
import type { GameConfigType } from '../core/config';

export class GameOverScene extends BaseScene {
  private game: GameEngine;
  private inputManager: InputManager;
  private config: GameConfigType;
  
  // 演出用アニメーション
  private animTimer = 0;
  
  // ボタン
  private buttons = {
    retry: { x: 180, y: 380, width: 150, height: 40, text: 'リトライ' },
    title: { x: 180, y: 430, width: 200, height: 40, text: 'タイトルにもどる' }
  };
  private hoveredButton: string | null = null;
  
  // ゲーム情報
  private selectedShipType: 'A' | 'B' | 'C' = 'A';
  private isInBossBattle = false;
  
  // 敵画像
  private enemyImage: HTMLImageElement | null = null;

  constructor(game: GameEngine, inputManager: InputManager) {
    super();
    this.game = game;
    this.inputManager = inputManager;
    this.config = game.getConfig();
    
    this.setupMouseEvents();
    this.loadEnemyImage();
  }
  
  private loadEnemyImage(): void {
    this.enemyImage = new Image();
    this.enemyImage.onload = () => {
      console.log('Enemy image loaded for game over');
    };
    this.enemyImage.onerror = () => {
      console.error('Failed to load enemy image: enemy_01.png');
    };
    this.enemyImage.src = './src/assets/img/enemy/enemy_01.png';
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
    } else if (buttonName === 'retry') {
      // GameSceneに遷移してリトライ
      this.game.switchToScene('game');
      // TODO: ゲームシーンにリトライ情報を渡す
    }
  }
  
  setGameInfo(selectedShipType: 'A' | 'B' | 'C', isInBossBattle: boolean): void {
    this.selectedShipType = selectedShipType;
    this.isInBossBattle = isInBossBattle;
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
    
    // ゲームオーバーテキスト
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
    
    // 敵のジャンプ演出
    this.renderGameOverEnemy(ctx, canvas);
    
    // ボタン描画
    this.renderButtons(ctx);
  }
  
  private renderGameOverEnemy(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // ジャンプアニメーション計算
    const jumpProgress = (this.animTimer * 1.5) % (Math.PI * 2);
    const jumpHeight = Math.sin(jumpProgress) * 25;
    
    const enemyX = canvas.width / 2;
    const baseY = canvas.height - 80;
    const enemyY = baseY - Math.abs(jumpHeight);
    
    ctx.save();
    
    if (this.enemyImage && this.enemyImage.complete && this.enemyImage.naturalWidth > 0) {
      // 敵画像を描画
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 10;
      ctx.drawImage(this.enemyImage, enemyX - 15, enemyY - 15, 30, 30);
    } else {
      // フォールバック描画
      ctx.fillStyle = '#FF4444';
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 10;
      ctx.fillRect(enemyX - 15, enemyY - 15, 30, 30);
      
      // 敵タイプを表示（フォールバック時）
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ENEMY', enemyX, enemyY + 4);
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