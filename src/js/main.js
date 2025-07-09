/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

import { GameInitializer } from './initialization/gameInitializer.js';

// ゲームの初期化
document.addEventListener('DOMContentLoaded', () => {
  GameInitializer.initialize();
});
