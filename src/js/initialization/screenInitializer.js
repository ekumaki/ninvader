/**
 * スクリーン初期化モジュール
 * SPDX-License-Identifier: MIT
 */

import { TitleScreen } from '../screens/titleScreen.js';
import { GameScreen } from '../screens/gameScreen.js';
import { InstructionsScreen } from '../screens/instructionsScreen.js';
import { GameOverScreen } from '../screens/gameOverScreen.js';
import { GameClearScreen } from '../screens/gameClearScreen.js';

export class ScreenInitializer {
  /**
   * 全画面の初期化
   * @param {Game} game - ゲームインスタンス
   */
  static initialize(game) {
    game.addScreen('title', new TitleScreen(game));
    game.addScreen('game', new GameScreen(game));
    game.addScreen('instructions', new InstructionsScreen(game));
    game.addScreen('gameOver', new GameOverScreen(game));
    game.addScreen('gameClear', new GameClearScreen(game));
  }
}