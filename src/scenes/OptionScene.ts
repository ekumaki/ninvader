/**
 * CNP インベーダー - オプション画面（TypeScript版）
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

import { BaseScene } from './BaseScene';
import type { GameEngine } from '../core/GameEngine';
import type { InputManager } from '../core/InputManager';
import type { GameConfigType } from '../core/config';

export class OptionScene extends BaseScene {
  private game: GameEngine;
  private inputManager: InputManager;
  private config: GameConfigType;
  
  // オプション設定
  private sfxVolume = 0.5;
  private musicVolume = 0.3;
  private autoMode = false;
  private selectedOption = 0; // 0: Music Volume, 1: SFX Volume, 2: Auto Mode
  private selectedButton = false; // ボタンが選択されているか
  
  // UI設定
  private options = [
    { name: 'BGM音量', key: 'musicVolume' },
    { name: 'SE音量', key: 'sfxVolume' },
    { name: 'AUTOモード', key: 'autoMode' }
  ];
  
  // マウス用ボタン
  private buttons = {
    back: { x: 0, y: 400, width: 200, height: 40, text: 'タイトルにもどる' } // xは後で中央に設定
  };
  private hoveredButton: string | null = null;
  
  // キー押下状態の追跡
  private lastPressedKeys: Set<string> = new Set();

  // イベントリスナーの参照を保持
  private mouseMoveHandler: (event: MouseEvent) => void;
  private clickHandler: (event: MouseEvent) => void;

  constructor(game: GameEngine, inputManager: InputManager) {
    super();
    this.game = game;
    this.inputManager = inputManager;
    this.config = game.getConfig();
    
    // 現在の設定値を読み込み
    this.loadCurrentSettings();
    
    // イベントハンドラーをバインド
    this.mouseMoveHandler = this.handleMouseMove.bind(this);
    this.clickHandler = this.handleClick.bind(this);
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isActive) return;
    
    const canvas = this.game.getCanvas();
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    this.hoveredButton = null;
    for (const [buttonName, button] of Object.entries(this.buttons)) {
      const centerX = this.game.getCanvas().width / 2;
      if (mouseX >= centerX - button.width/2 && 
          mouseX <= centerX + button.width/2 &&
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
    
    // ボタンクリック判定（中央配置を考慮）
    for (const [buttonName, button] of Object.entries(this.buttons)) {
      const centerX = this.game.getCanvas().width / 2;
      if (mouseX >= centerX - button.width/2 && 
          mouseX <= centerX + button.width/2 &&
          mouseY >= button.y - button.height/2 && 
          mouseY <= button.y + button.height/2) {
        if (buttonName === 'back') {
          console.log('Back button clicked, calling goBack()');
          this.goBack();
        }
        return; // クリックを処理したら終了
      }
    }
    
    // オプション項目のクリック判定
    this.handleOptionClick(mouseX, mouseY);
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
  
  private loadCurrentSettings(): void {
    this.sfxVolume = this.config.AUDIO.SFX_VOLUME;
    this.musicVolume = this.config.AUDIO.MUSIC_VOLUME;
    
    // AUTOモードの設定を読み込み（localStorageから）
    const savedAutoMode = localStorage.getItem('ninvader_auto_mode');
    this.autoMode = savedAutoMode === 'true';
    console.log('OptionScene loadCurrentSettings: autoMode loaded as', this.autoMode, 'from localStorage:', savedAutoMode);
  }

  onEnter(): void {
    console.log('OptionScene: Entering option scene');
    
    // イベントリスナーを設定
    this.setupMouseEvents();
  }

  onExit(): void {
    console.log('OptionScene: Exiting option scene');
    
    // 設定を保存
    this.saveSettings();
    
    // イベントリスナーを削除
    this.removeMouseEvents();
  }
  
  private saveSettings(): void {
    // 設定をconfigに反映
    (this.config.AUDIO as any).SFX_VOLUME = this.sfxVolume;
    (this.config.AUDIO as any).MUSIC_VOLUME = this.musicVolume;
    
    // AUTOモードの設定を保存
    localStorage.setItem('ninvader_auto_mode', this.autoMode.toString());
    console.log('OptionScene saveSettings: autoMode saved as', this.autoMode.toString());
    
    // 音量設定をlocalStorageに保存
    localStorage.setItem('ninvader_audio_settings', JSON.stringify({
      sfxVolume: this.sfxVolume,
      musicVolume: this.musicVolume
    }));
  }

  update(deltaTime: number): void {
    if (!this.isActive) return;

    // 入力更新
    this.inputManager.update(deltaTime);
    
    // 入力処理
    this.handleInput();
  }

  private handleInput(): void {
    // キー状態取得
    const allKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', ' '];
    const currentPressedKeys = new Set<string>();
    
    for (const key of allKeys) {
      if (this.inputManager.isKeyDown(key)) {
        currentPressedKeys.add(key);
      }
    }
    
    // 新しく押されたキーを検出
    const newlyPressed = new Set<string>();
    for (const key of currentPressedKeys) {
      if (!this.lastPressedKeys.has(key)) {
        newlyPressed.add(key);
      }
    }
    this.lastPressedKeys = currentPressedKeys;
    
    // オプション選択
    if (newlyPressed.has('ArrowUp')) {
      if (this.selectedButton) {
        // ボタンからオプションの最後に移動
        this.selectedButton = false;
        this.selectedOption = this.options.length - 1;
      } else {
        this.selectedOption = (this.selectedOption - 1 + this.options.length) % this.options.length;
      }
    }
    
    if (newlyPressed.has('ArrowDown')) {
      if (this.selectedOption === this.options.length - 1 && !this.selectedButton) {
        // オプション最後からボタンに移動
        this.selectedButton = true;
      } else if (!this.selectedButton) {
        this.selectedOption = (this.selectedOption + 1) % this.options.length;
      }
    }
    
    // 値調整（ボタン選択時は無効）
    if (!this.selectedButton) {
      if (newlyPressed.has('ArrowLeft')) {
        this.adjustValue(-1);
      }
      
      if (newlyPressed.has('ArrowRight')) {
        this.adjustValue(1);
      }
    }
    
    // 決定・戻る
    if (newlyPressed.has('Enter') || newlyPressed.has(' ')) {
      if (this.selectedButton) {
        this.goBack();
      } else {
        this.selectOption();
      }
    }
    
    if (newlyPressed.has('Escape')) {
      this.goBack();
    }
  }
  
  private adjustValue(delta: number): void {
    const option = this.options[this.selectedOption];
    
    switch (option.key) {
      case 'sfxVolume':
        const currentSfxLevel = Math.round(this.sfxVolume * 4);
        const newSfxLevel = Math.max(0, Math.min(4, currentSfxLevel + delta));
        this.sfxVolume = newSfxLevel * 0.25;
        break;
      case 'musicVolume':
        const currentMusicLevel = Math.round(this.musicVolume * 4);
        const newMusicLevel = Math.max(0, Math.min(4, currentMusicLevel + delta));
        this.musicVolume = newMusicLevel * 0.25;
        break;
      case 'autoMode':
        // AUTOモードのオン/オフ切り替え
        this.autoMode = !this.autoMode;
        console.log('OptionScene adjustOption: autoMode changed to', this.autoMode);
        // 即座に保存
        localStorage.setItem('ninvader_auto_mode', this.autoMode.toString());
        break;
    }
  }
  
  private selectOption(): void {
    const option = this.options[this.selectedOption];
    if (option.key === 'autoMode') {
      this.autoMode = !this.autoMode;
      console.log('OptionScene selectOption: autoMode changed to', this.autoMode);
      // 即座に保存
      localStorage.setItem('ninvader_auto_mode', this.autoMode.toString());
    }
  }
  
  private goBack(): void {
    console.log('OptionScene: goBack() called, switching to title scene');
    this.game.switchToScene('title');
  }
  
  private handleOptionClick(mouseX: number, mouseY: number): void {
    const startY = 150;
    const lineHeight = 60;
    
    for (let i = 0; i < this.options.length; i++) {
      const option = this.options[i];
      const y = startY + i * lineHeight;
      
      // オプション項目の範囲内かチェック
      if (mouseY >= y - 25 && mouseY <= y + 25) {
        if (option.key === 'autoMode') {
          // AUTOモードのスイッチクリック
          const switchX = this.game.getCanvas().width - 150;
          const switchWidth = 40;
          if (mouseX >= switchX && mouseX <= switchX + switchWidth) {
            this.autoMode = !this.autoMode;
            console.log('OptionScene handleOptionClick: autoMode changed to', this.autoMode);
            // 即座に保存
            localStorage.setItem('ninvader_auto_mode', this.autoMode.toString());
          }
        } else {
          // 音量調節の四角形クリック
          const squareSize = 16;
          const squareSpacing = 4;
          const totalWidth = 5 * squareSize + 4 * squareSpacing;
          const startX = this.game.getCanvas().width - 80 - totalWidth;
          
          for (let j = 0; j < 5; j++) {
            const squareX = startX + j * (squareSize + squareSpacing);
            if (mouseX >= squareX && mouseX <= squareX + squareSize) {
              const newValue = j * 0.25; // 0, 0.25, 0.5, 0.75, 1.0
              if (option.key === 'sfxVolume') {
                this.sfxVolume = newValue;
              } else if (option.key === 'musicVolume') {
                this.musicVolume = newValue;
              }
              break;
            }
          }
        }
        break;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;

    const canvas = this.game.getCanvas();
    
    // 背景描画
    this.renderBackground(ctx, canvas);
    
    // タイトル描画
    this.renderTitle(ctx, canvas);
    
    // オプション項目描画
    this.renderOptions(ctx, canvas);
    
    // ボタン描画
    this.renderButtons(ctx, canvas);
    
    // 操作説明描画
    this.renderInstructions(ctx, canvas);
    
    // バージョン情報描画
    this.renderVersionInfo(ctx, canvas);
  }

  private renderBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // グラデーション背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000022');
    gradient.addColorStop(0.5, '#000044');
    gradient.addColorStop(1, '#000011');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  private renderTitle(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const centerX = canvas.width / 2;
    
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('オプション', centerX, 80);
  }

  private renderOptions(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const centerX = canvas.width / 2;
    const startY = 150;
    const lineHeight = 60;
    
    for (let i = 0; i < this.options.length; i++) {
      const option = this.options[i];
      const y = startY + i * lineHeight;
      const isSelected = i === this.selectedOption;
      
      // 選択中の項目をハイライト
      if (isSelected) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.fillRect(50, y - 25, canvas.width - 100, 50);
      }
      
      // オプション名
      ctx.fillStyle = isSelected ? '#FFD700' : '#FFFFFF';
      ctx.font = '18px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(option.name, 80, y);
      
      // 値表示
      if (option.key === 'autoMode') {
        // AUTOモードのオン/オフ表示
        ctx.fillStyle = isSelected ? '#FFFFFF' : '#CCCCCC';
        ctx.textAlign = 'right';
        ctx.fillText(this.autoMode ? 'ON' : 'OFF', canvas.width - 80, y);
        
        // スイッチ表示
        const switchX = canvas.width - 150;
        const switchY = y - 10;
        const switchWidth = 40;
        const switchHeight = 20;
        
        // スイッチ背景
        ctx.fillStyle = this.autoMode ? '#4CAF50' : '#666666';
        ctx.fillRect(switchX, switchY, switchWidth, switchHeight);
        
        // スイッチノブ
        const knobX = this.autoMode ? switchX + switchWidth - 18 : switchX + 2;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(knobX, switchY + 2, 16, switchHeight - 4);
        
      } else {
        // 音量系の表示
        const value = this.getOptionValue(option.key);
        
        // 5段階の四角形メモリ
        const squareSize = 16;
        const squareSpacing = 4;
        const totalWidth = 5 * squareSize + 4 * squareSpacing;
        const startX = canvas.width - 80 - totalWidth;
        const squareY = y - squareSize / 2;
        
        const level = Math.round(value * 4); // 0-4の5段階
        
        for (let i = 0; i < 5; i++) {
          const squareX = startX + i * (squareSize + squareSpacing);
          
          // 四角形（角丸）
          ctx.beginPath();
          ctx.roundRect(squareX, squareY, squareSize, squareSize, 3);
          
          if (i <= level) {
            // アクティブ
            ctx.fillStyle = isSelected ? '#FFD700' : '#666666';
          } else {
            // 非アクティブ
            ctx.fillStyle = '#333333';
          }
          ctx.fill();
          
          // 枠線
          ctx.strokeStyle = '#555555';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }
  
  private getOptionValue(key: string): number {
    switch (key) {
      case 'sfxVolume': return this.sfxVolume;
      case 'musicVolume': return this.musicVolume;
      default: return 0;
    }
  }

  private renderButtons(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    for (const [buttonName, button] of Object.entries(this.buttons)) {
      const isHovered = this.hoveredButton === buttonName;
      const isKeyboardSelected = this.selectedButton;
      
      // ボタンを中央に配置
      const centerX = canvas.width / 2;
      button.x = centerX;
      
      // ボタン背景（キーボード選択時もハイライト）
      ctx.fillStyle = (isHovered || isKeyboardSelected) ? '#555555' : '#333333';
      ctx.fillRect(
        button.x - button.width/2,
        button.y - button.height/2,
        button.width,
        button.height
      );
      
      // ボタン枠線（キーボード選択時もハイライト）
      ctx.strokeStyle = (isHovered || isKeyboardSelected) ? '#FFFFFF' : '#666666';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        button.x - button.width/2,
        button.y - button.height/2,
        button.width,
        button.height
      );
      
      // ボタンテキスト（キーボード選択時もハイライト）
      ctx.fillStyle = (isHovered || isKeyboardSelected) ? '#FFFFFF' : '#CCCCCC';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(button.text, button.x, button.y + 5);
    }
  }

  private renderInstructions(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const centerX = canvas.width / 2;
    const instructionY = canvas.height - 120;
    
    ctx.fillStyle = '#AAAAAA';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('↑↓: 項目選択', centerX, instructionY);
    ctx.fillText('←→: 値調整', centerX, instructionY + 15);
    ctx.fillText('ENTER/SPACE: 決定', centerX, instructionY + 30);
    ctx.fillText('ESC: 戻る', centerX, instructionY + 45);
  }

  private renderVersionInfo(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const centerX = canvas.width / 2;
    const versionY = canvas.height - 60;
    
    ctx.fillStyle = '#888888';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`CNP インベーダー v${this.getVersion()}`, centerX, versionY);
  }

  private getVersion(): string {
    // package.jsonのバージョン情報を取得
    // 実際の実装では動的に取得するが、ここでは設定値から取得
    try {
      // 実際のプロジェクトでは、ビルド時にバージョン情報を埋め込む
      // ここでは現在のバージョンを直接記述
      return '0.2.13';
    } catch (error) {
      console.warn('バージョン情報の取得に失敗しました:', error);
      return '0.2.x';
    }
  }
}