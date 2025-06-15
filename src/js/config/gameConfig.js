/**
 * CNP インベーダー - ゲーム設定
 * Version: 1.0.0
 * SPDX-License-Identifier: MIT
 */

export const GameConfig = {
  // ゲームバージョン
  VERSION: '1.0.0',
  CANVAS_WIDTH: 360,
  CANVAS_HEIGHT: 640,
  TARGET_FPS: 60,
  
  // スコア設定
  SCORE: {
    ENEMY_KILL: 10,
    UFO_KILL: 100,
    BOSS_KILL: 300,
    STAGE_CLEAR: 100
  },
  
  // プレイヤー設定
  PLAYER: {
    SPEED: 200,
    SHOOT_COOLDOWN: 0.3,
    CHARGE_TIME: 3000,
    JUMP_DURATION: 0.5,
    JUMP_HEIGHT: 30,
    MAX_SPECIAL_USES: 5 // 必殺技の最大使用回数
  },
  
  // 敵設定 - ゲームバランス調整済み
  ENEMY: {
    HEALTH: 1,
    FORMATION_SPEED: 15.0,   // 適度な移動速度
    FORMATION_INTERVAL: 1.0, // 固定の移動間隔（1.0秒）
    DROP_DISTANCE: 20,
    EDGE_MARGIN: 30
  },
  
  // UFO設定
  UFO: {
    SPAWN_INTERVAL: 10,
    SPEED: 100
  },
  
  // ボス設定
  BOSS: {
    SPAWN_TIME: 180,
    HEALTH: 30
  },
  
  // 弾設定
  BULLET: {
    PLAYER_SPEED: 400,
    ENEMY_SPEED: 200,
    SPECIAL_SPEED: 800
  },
  
  // UI設定
  UI: {
    VERSION_FONT_SIZE: '12px',
    VERSION_COLOR: '#888',
    SCORE_FONT_SIZE: '14px',
    HIGHSCORE_COLOR: '#FFD700',
    SHOW_HIGH_SCORE: false // ハイスコア表示の制御フラグ（将来の実装用）
  },
  
  // オーディオ設定
  AUDIO: {
    ENABLED: true,
    MASTER_VOLUME: 0.5,
    SFX_VOLUME: 0.5,
    MUSIC_VOLUME: 0.3
  },
  
  // 衝突判定設定
  COLLISION: {
    GAME_OVER_THRESHOLD: 0.9, // 画面高さの90%
    ADJUSTMENT_FACTOR: 0.8 // 衝突判定サイズ調整
  },
  
  // デバッグ設定
  DEBUG: {
    GOD_MODE: false, // trueでプレイヤー無敵
    SHOW_INFO: false // trueでデバッグ情報表示
  }
}; 