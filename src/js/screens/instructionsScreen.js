/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.0
 * SPDX-License-Identifier: MIT
 */

export class InstructionsScreen {
  constructor(game) {
    this.game = game;
    this.canvas = game.canvas;
    this.ctx = game.ctx;
    
    // 説明画面のUI要素
    this.instructionsElement = null;
    this.backButton = null;
  }
  
  // 画面に入る時の処理
  enter() {
    this.createInstructionsUI();
  }
  
  // 画面から出る時の処理
  exit() {
    this.removeInstructionsUI();
  }
  
  // 更新処理
  update(deltaTime) {
    // 説明画面では特に更新処理はない
  }
  
  // 描画処理
  render(ctx) {
    // 背景の描画
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  // 説明画面のUI作成
  createInstructionsUI() {
    // 説明画面のコンテナ
    const instructionsScreen = document.createElement('div');
    instructionsScreen.className = 'instructions';
    
    // 説明内容のコンテナ
    const content = document.createElement('div');
    content.className = 'instructions-content';
    
    // タイトル
    const title = document.createElement('h2');
    title.textContent = '操作説明';
    
    // 説明テキスト
    const pcControls = document.createElement('p');
    pcControls.innerHTML = '<strong>PC操作:</strong><br>← → キー: 左右移動<br>スペースキー: 発射';
    
    const mobileControls = document.createElement('p');
    mobileControls.innerHTML = '<strong>スマホ操作:</strong><br>画面左下: 左右移動ボタン<br>画面右下: 発射ボタン';
    
    const specialAttack = document.createElement('p');
    specialAttack.innerHTML = '<strong>必殺技:</strong><br>発射ボタン長押し3秒でチャージ<br>放つと速度2倍・威力3倍・敵貫通の大手裏剣';
    
    const gameRules = document.createElement('p');
    gameRules.innerHTML = '<strong>ゲームルール:</strong><br>敵: 100点<br>UFO: 500点<br>ボス: 1,000点<br><br>ボス出現条件: 開始180秒経過 または 敵全滅';
    
    // 戻るボタン
    const backBtn = document.createElement('button');
    backBtn.className = 'back-btn';
    backBtn.textContent = 'タイトルに戻る';
    backBtn.addEventListener('click', () => {
      this.game.switchScreen('title');
    });
    
    // 要素の追加
    content.appendChild(title);
    content.appendChild(pcControls);
    content.appendChild(mobileControls);
    content.appendChild(specialAttack);
    content.appendChild(gameRules);
    content.appendChild(backBtn);
    
    instructionsScreen.appendChild(content);
    document.body.appendChild(instructionsScreen);
    
    // 参照を保存
    this.instructionsElement = instructionsScreen;
    this.backButton = backBtn;
  }
  
  // 説明画面のUI削除
  removeInstructionsUI() {
    if (this.instructionsElement && this.instructionsElement.parentNode) {
      this.instructionsElement.parentNode.removeChild(this.instructionsElement);
    }
  }
}
