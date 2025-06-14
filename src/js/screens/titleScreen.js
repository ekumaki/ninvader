/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

import { GameConfig } from '../config/gameConfig.js';
import { UIUtils } from '../utils/uiUtils.js';
import { Player } from '../entities/player.js';

export class TitleScreen {
  constructor(game) {
    this.game = game;
    this.canvas = game.canvas;
    this.ctx = game.ctx;
    
    // タイトル画面のUI要素
    this.titleElement = null;
    this.menuContainer = null;
    this.startButton = null;
    this.instructionsButton = null;
    this.creditsButton = null;
    
    // スコア表示
    this.scoreDisplay = null;

    // プレビュー用プレイヤー
    this.previewPlayer = null;

    this.audioToggleBtn = null;
  }
  
  // 画面に入る時の処理
  enter() {
    console.log('タイトル画面にenterしました');
    
    // 既存のHTML UIを表示する
    const existingUI = document.getElementById('game-ui');
    if (existingUI) {
      console.log('既存のHTML UIを表示します');
      existingUI.style.display = 'flex';
    
      // メニューボタン位置を他画面と合わせる
      const menuButtons = existingUI.querySelector('.menu-buttons');
      if (menuButtons) {
        menuButtons.style.marginTop = '49px';
      }

      // バージョン表示を動的に更新
      this.updateVersionDisplay();
    } else {
      // 既存UIがない場合は独自のUIを作成
      console.log('既存UIが見つからないため、独自のUIを作成します');
      this.createTitleUI();
    }
    
    // プレビュー用プレイヤー生成
    this.createPreviewPlayer();
    console.log('タイトル画面のUIを作成しました');
    
    // デバッグ情報更新
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) debugInfo.textContent = 'タイトル画面表示中';

    this.createAudioToggleButton();
  }
  
  // 画面から出る時の処理
  async exit() {
    console.log('タイトル画面からexitします');
    
    // 既存のHTML UIを非表示にする
    const existingUI = document.getElementById('game-ui');
    if (existingUI) {
      console.log('既存のHTML UIを非表示にします');
      existingUI.style.display = 'none';
    } else {
      // 独自のUIを削除
      this.removeTitleUI();
    }
    
    // プレビュー用プレイヤー削除
    this.previewPlayer = null;
    
    // デバッグ情報更新
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) debugInfo.textContent = 'タイトル画面から移動中';

    this.removeAudioToggleButton();
  }
  
  // 更新処理
  update(deltaTime) {
    // タイトル画面では特に更新処理はない
  }
  
  // 描画処理
  render(ctx) {
    // 背景の描画
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // プレビュー用プレイヤー描画
    if (this.previewPlayer) {
      this.previewPlayer.render(ctx);
    }
    
    console.log('タイトル画面を描画しました');
  }
  
  // タイトル画面のUI作成
  createTitleUI() {
    console.log('タイトル画面のUI作成開始');
    try {
      // 既存のタイトル画面があれば削除
      const existingTitleScreen = document.querySelector('.title-screen');
      if (existingTitleScreen) {
        existingTitleScreen.remove();
      }
      
      // タイトル画面のコンテナ
      const titleScreen = document.createElement('div');
      titleScreen.className = 'title-screen';
      titleScreen.style.position = 'absolute';
      titleScreen.style.top = '0';
      titleScreen.style.left = '0';
      titleScreen.style.width = '100%';
      titleScreen.style.height = '100%';
      titleScreen.style.display = 'flex';
      titleScreen.style.flexDirection = 'column';
      titleScreen.style.justifyContent = 'center';
      titleScreen.style.alignItems = 'center';
      titleScreen.style.color = '#FFFFFF';
      titleScreen.style.zIndex = '10';
      
      // ゲームタイトル
      const title = document.createElement('h1');
      title.className = 'game-title';
      title.textContent = 'CNP インベーダー';
      title.style.fontSize = '32px';
      title.style.margin = '0 0 5px 0';
      title.style.textAlign = 'center';
      
      // バージョン・デバッグ表示
      let version = null;
      let debugMode = null;
      if (GameConfig.DEBUG && GameConfig.DEBUG.SHOW_INFO) {
        version = document.createElement('div');
        version.className = 'game-version';
        version.textContent = `v${GameConfig.VERSION}`;
        version.style.fontSize = '16px';
        version.style.margin = '0 0 8px 0';
        version.style.textAlign = 'center';
        version.style.color = '#AAA';

        debugMode = document.createElement('div');
        debugMode.className = 'debug-mode';
        debugMode.textContent = `デバッグモード: ${GameConfig.DEBUG.GOD_MODE ? 'ON' : 'OFF'}`;
        debugMode.style.fontSize = '14px';
        debugMode.style.margin = '0 0 12px 0';
        debugMode.style.textAlign = 'center';
        debugMode.style.color = '#ff8888';
      }
      
      // メニューボタンのコンテナ
      const menuButtons = document.createElement('div');
      menuButtons.className = 'menu-buttons';
      menuButtons.style.display = 'flex';
      menuButtons.style.flexDirection = 'column';
      menuButtons.style.gap = '15px';
      menuButtons.style.marginTop = '250px'; // ゲームクリア・ゲームオーバー画面と同じ位置
      
      // ボタンの共通スタイル関数
      const styleButton = (btn) => {
        btn.style.padding = '10px 20px';
        btn.style.fontSize = '18px';
        btn.style.backgroundColor = '#333';
        btn.style.color = '#FFF';
        btn.style.border = '1px solid #666';
        btn.style.borderRadius = '5px';
        btn.style.cursor = 'pointer';
        btn.style.width = '200px';
        btn.style.textAlign = 'center';
        btn.style.transition = 'background-color 0.3s';
        
        // ホバー効果
        btn.addEventListener('mouseenter', () => {
          btn.style.backgroundColor = '#555';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.backgroundColor = '#333';
        });
      };
      
      // スタートボタン
      const startBtn = document.createElement('button');
      startBtn.className = 'menu-btn';
      startBtn.textContent = 'ゲーム開始';
      styleButton(startBtn);
      startBtn.addEventListener('click', () => {
        if (this.game.audioManager) {
          this.game.audioManager.play('gameStart');
        }
        this.game.switchScreen('game');
      });
      
      // 操作説明ボタン
      const instructionsBtn = document.createElement('button');
      instructionsBtn.className = 'menu-btn';
      instructionsBtn.textContent = '操作説明';
      styleButton(instructionsBtn);
      instructionsBtn.addEventListener('click', () => {
        console.log('操作説明ボタンがクリックされました');
        this.game.switchScreen('instructions');
      });
      
      // クレジットボタン
      const creditsBtn = document.createElement('button');
      creditsBtn.className = 'menu-btn';
      creditsBtn.textContent = 'クレジット';
      styleButton(creditsBtn);
      creditsBtn.addEventListener('click', () => {
        console.log('クレジットボタンがクリックされました');
        alert(`CNP インベーダー\nVersion ${GameConfig.VERSION}\n© 2025 All Rights Reserved`);
      });
      
      // 要素の追加
      menuButtons.appendChild(startBtn);
      menuButtons.appendChild(instructionsBtn);
      // クレジットボタンは非表示にするが機能は保持
      creditsBtn.style.display = 'none';
      menuButtons.appendChild(creditsBtn);
      
      // ハイスコア表示（左上に配置）- 将来の実装用に保持
      if (GameConfig.UI.SHOW_HIGH_SCORE) {
        const highScoreDisplay = document.createElement('div');
        highScoreDisplay.className = 'high-score-display';
        const highScore = this.game.scoreManager.getHighScore();
        highScoreDisplay.textContent = `HI SCORE: ${highScore}`;
        highScoreDisplay.style.fontSize = '18px';
        highScoreDisplay.style.position = 'absolute';
        highScoreDisplay.style.top = '20px';
        highScoreDisplay.style.left = '20px';
        highScoreDisplay.style.color = '#FFD700';
        titleScreen.appendChild(highScoreDisplay);
      }
      
      titleScreen.appendChild(title);
      if (debugMode) titleScreen.appendChild(debugMode);
      if (version) titleScreen.appendChild(version);
      titleScreen.appendChild(menuButtons);
      
      // ゲームコンテナに追加
      const gameContainer = document.getElementById('game-container');
      if (gameContainer) {
        gameContainer.appendChild(titleScreen);
        console.log('タイトル画面をゲームコンテナに追加しました');
      } else {
        console.error('ゲームコンテナが見つかりません');
        // 代替としてbodyに追加
        document.body.appendChild(titleScreen);
        console.log('タイトル画面をbodyに追加しました');
      }
      
      // メンバ変数に保存
      this.titleElement = titleScreen;
      this.menuContainer = menuButtons;
      this.startButton = startBtn;
      this.instructionsButton = instructionsBtn;
      this.creditsButton = creditsBtn;
      
      // デバッグ情報更新
      const debugInfo = document.getElementById('debug-info');
      if (debugInfo) debugInfo.textContent = 'タイトル画面UI作成完了';
      
      console.log('タイトル画面のUI作成完了');
    } catch (error) {
      console.error('タイトル画面のUI作成エラー:', error);
      
      // デバッグ情報更新
      const debugInfo = document.getElementById('debug-info');
      if (debugInfo) debugInfo.textContent = `エラー: タイトル画面UI作成失敗 - ${error.message}`;
    }
  }
  
  // タイトル画面のUI削除
  removeTitleUI() {
    if (this.titleElement && this.titleElement.parentNode) {
      this.titleElement.parentNode.removeChild(this.titleElement);
    }
  }
  
  // バージョン表示を更新
  updateVersionDisplay() {
    const versionElement = document.getElementById('version-display');
    if (versionElement) {
      versionElement.textContent = `v${GameConfig.VERSION}`;
      console.log(`バージョン表示を更新: v${GameConfig.VERSION}`);
    }
  }
  
  // プレビュー用プレイヤー生成
  createPreviewPlayer() {
    const x = this.canvas.width / 2;
    const y = this.canvas.height - 50; // ゲーム他画面と同じ位置
    this.previewPlayer = new Player(this.game, x, y);
    // 正面向き画像に差し替え
    this.previewPlayer.image.src = './src/assets/img/player/player_A_front.png';
    // 必殺技ゲージを非表示にするため、描画関数を空に
    this.previewPlayer.renderSpecialGauge = () => {};
  }

  createAudioToggleButton() {
    // すでに存在していれば何もしない
    if (this.audioToggleBtn) return;
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    // ラッパーdivを探すか作成
    let wrapper = canvas.parentNode;
    if (!wrapper.classList.contains('canvas-wrapper')) {
      // まだラッパーでなければ作成
      wrapper = document.createElement('div');
      wrapper.className = 'canvas-wrapper';
      wrapper.style.position = 'relative';
      wrapper.style.width = canvas.width + 'px';
      wrapper.style.height = canvas.height + 'px';
      // canvasをラッパーに移動
      canvas.parentNode.insertBefore(wrapper, canvas);
      wrapper.appendChild(canvas);
    }
    // ボタン生成
    const btn = document.createElement('button');
    btn.className = 'audio-toggle-btn';
    btn.title = '音楽・効果音のオン/オフ';
    btn.style.display = 'flex';
    // SVGアイコン（初期状態はON）
    btn.innerHTML = this.getSpeakerSVG(this.game.audioManager.isMuted);
    // 状態同期
    const updateIcon = () => {
      const isMuted = this.game.audioManager.isMuted;
      btn.innerHTML = this.getSpeakerSVG(isMuted);
    };
    // クリックでミュート切り替え
    btn.addEventListener('click', () => {
      this.game.audioManager.toggleMute();
      updateIcon();
    });
    // 初期アイコン
    updateIcon();
    // 配置（canvasラッパーの右上）
    wrapper.appendChild(btn);
    this.audioToggleBtn = btn;
  }

  removeAudioToggleButton() {
    if (this.audioToggleBtn && this.audioToggleBtn.parentNode) {
      this.audioToggleBtn.parentNode.removeChild(this.audioToggleBtn);
      this.audioToggleBtn = null;
    }
  }

  getSpeakerSVG(isMuted) {
    if (!isMuted) {
      // スピーカーON
      return `<svg viewBox="0 0 32 32"><g class='icon-speaker'><polygon points='7,12 15,12 21,7 21,25 15,20 7,20'/><path d='M24 12 Q27 16 24 20'/></g></svg>`;
    } else {
      // スピーカーOFF（ミュート: 赤い斜線）
      return `<svg viewBox="0 0 32 32"><g class='icon-mute'><polygon points='7,12 15,12 21,7 21,25 15,20 7,20'/><line x1='25' y1='11' x2='29' y2='21'/><line x1='29' y1='11' x2='25' y2='21'/></g><line class='icon-mute-line' x1='6' y1='6' x2='26' y2='26'/></svg>`;
    }
  }
}
