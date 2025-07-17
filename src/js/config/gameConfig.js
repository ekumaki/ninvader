/**
 * CNP インベーダー - ゲーム設定
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

export const GameConfig = {
  // ゲームバージョン
  VERSION: '0.2.13',
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
  
  // プレイヤー設定（3体対応）
  PLAYER: {
    A: {
      HEALTH: 1,
      SPEED: 200,
      SHOOT_COOLDOWN: 0.3,
      CHARGE_TIME: 1.0,
      JUMP_DURATION: 0.5,
      JUMP_HEIGHT: 30,
      MAX_SPECIAL_USES: 9,
      SPECIAL_BULLET_SPEED: 600,
      SIZE: { WIDTH: 48, HEIGHT: 72 },
      IMAGE: 'player_A_back.png'
    },
    B: {
      HEALTH: 1,
      SPEED: 180,
      SHOOT_COOLDOWN: 0.25,
      CHARGE_TIME: 1.2,
      JUMP_DURATION: 0.4,
      JUMP_HEIGHT: 25,
      MAX_SPECIAL_USES: 9,
      SPECIAL_BULLET_SPEED: 500,
      SIZE: { WIDTH: 48, HEIGHT: 72 },
      IMAGE: 'player_B_back.png'
    },
    C: {
      HEALTH: 1,
      SPEED: 220,
      SHOOT_COOLDOWN: 0.35,
      CHARGE_TIME: 0.8,
      JUMP_DURATION: 0.6,
      JUMP_HEIGHT: 35,
      MAX_SPECIAL_USES: 9,
      SPECIAL_BULLET_SPEED: 700,
      SIZE: { WIDTH: 48, HEIGHT: 72 },
      IMAGE: 'player_C_back.png'
    }
  },
  
  // 敵設定（3体対応）
  ENEMY: {
    A: {
      HEALTH: 1,
      SPEED: 0.05,
      DROP_DISTANCE: 2,
      EDGE_MARGIN: 30,
      SHOOT_PROBABILITY: 0.0005,
      SHOOT_COOLDOWN: 2,
      BULLET_SPEED: 150,
      POINTS: 100,
      SIZE: { WIDTH: 48, HEIGHT: 48 },
      IMAGE: 'enemy_01.png'
    },
    B: {
      HEALTH: 1,
      SPEED: 0.07,
      DROP_DISTANCE: 3,
      EDGE_MARGIN: 25,
      SHOOT_PROBABILITY: 0.0007,
      SHOOT_COOLDOWN: 1.8,
      BULLET_SPEED: 180,
      POINTS: 150,
      SIZE: { WIDTH: 48, HEIGHT: 48 },
      IMAGE: 'enemy_02.png'
    },
    C: {
      HEALTH: 2,
      SPEED: 0.03,
      DROP_DISTANCE: 4,
      EDGE_MARGIN: 35,
      SHOOT_PROBABILITY: 0.0003,
      SHOOT_COOLDOWN: 2.5,
      BULLET_SPEED: 120,
      POINTS: 200,
      SIZE: { WIDTH: 48, HEIGHT: 48 },
      IMAGE: 'enemy_03.png'
    },
    // 編隊設定（共通）
    FORMATION: {
      SPEED: 15.0,
      INTERVAL: 1.0
    }
  },
  
  // UFO設定
  UFO: {
    SPAWN_INTERVAL: 10,
    SPEED: 100
  },
  
  // ボス設定（3体対応）
  BOSS: {
    A: {
      HEALTH: 30,
      MAX_HEALTH: 30,
      SPEED: 50,
      SPAWN_TIME: 180,
      POINTS: 1000,
      SIZE: { WIDTH: 48, HEIGHT: 72 },
      IMAGE: 'boss_stage1.png',
      BULLET_IMAGE: 'enemy_rock.png',
      ATTACKS: {
        SINGLE: {
          COOLDOWN: 1.5,
          BULLET_SPEED: 150
        },
        SPREAD: {
          COOLDOWN: 4,
          BULLET_SPEED: 150,
          ANGLE_SPREAD: 0.3
        }
      }
    },
    B: {
      HEALTH: 45,
      MAX_HEALTH: 45,
      SPEED: 60,
      SPAWN_TIME: 150,
      POINTS: 1500,
      SIZE: { WIDTH: 48, HEIGHT: 72 },
      IMAGE: 'boss_stage2.png',
      BULLET_IMAGE: 'enemy_fire.png',
      ATTACKS: {
        SINGLE: {
          COOLDOWN: 1.2,
          BULLET_SPEED: 180
        },
        SPREAD: {
          COOLDOWN: 3.5,
          BULLET_SPEED: 180,
          ANGLE_SPREAD: 0.4
        },
        HOMING: {
          COOLDOWN: 6,
          BULLET_SPEED: 100
        }
      }
    },
    C: {
      HEALTH: 60,
      MAX_HEALTH: 60,
      SPEED: 40,
      SPAWN_TIME: 120,
      POINTS: 2000,
      SIZE: { WIDTH: 128, HEIGHT: 128 },
      IMAGE: 'boss_stage3.png',
      BULLET_IMAGE: 'enemy_thunder.png',
      ATTACKS: {
        SINGLE: {
          COOLDOWN: 1.0,
          BULLET_SPEED: 200
        },
        SPREAD: {
          COOLDOWN: 3,
          BULLET_SPEED: 200,
          ANGLE_SPREAD: 0.5
        },
        HOMING: {
          COOLDOWN: 5,
          BULLET_SPEED: 120
        },
        EXPLOSIVE: {
          COOLDOWN: 8,
          BULLET_SPEED: 80
        }
      }
    }
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
    GOD_MODE: true, // trueでプレイヤー無敵
    SHOW_INFO: false // trueでデバッグ情報表示
  }
}; 