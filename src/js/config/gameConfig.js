/**
 * CNP インベーダー - ゲーム設定 UPDATED
 * Version: 0.1.5
 * SPDX-License-Identifier: MIT
 */

export const GameConfig = {
  // ゲーム基本設定
  VERSION: '0.1.5',
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
    JUMP_HEIGHT: 30
  },
  
  // 敵設定 - ゲームバランス調整済み
  ENEMY: {
    HEALTH: 1,
    FORMATION_SPEED: 15.0,   // 適度な移動速度
    FORMATION_INTERVAL: 4.0, // 非常にゆっくりとした移動間隔（4.0秒）
    DROP_DISTANCE: 20,
    EDGE_MARGIN: 30,
    MIN_SPEED_MULTIPLIER: 0.3
  },
  
  // UFO設定
  UFO: {
    SPAWN_INTERVAL: 20,
    SPEED: 100
  },
  
  // ボス設定
  BOSS: {
    SPAWN_TIME: 180,
    HEALTH: 10
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
    HIGHSCORE_COLOR: '#FFD700'
  },
  
  // オーディオ設定
  AUDIO: {
    MASTER_VOLUME: 0.5,
    SFX_VOLUME: 0.5,
    MUSIC_VOLUME: 0.3
  },
  
  // 衝突判定設定
  COLLISION: {
    GAME_OVER_THRESHOLD: 0.9, // 画面高さの90%
    ADJUSTMENT_FACTOR: 0.8 // 衝突判定サイズ調整
  }
}; 