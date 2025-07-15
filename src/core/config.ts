/**
 * CNP インベーダー - ゲーム設定
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

export interface PlayerConfig {
  HEALTH: number;
  SPEED: number;
  SHOOT_COOLDOWN: number;
  CHARGE_TIME: number;
  JUMP_DURATION: number;
  JUMP_HEIGHT: number;
  MAX_SPECIAL_USES: number;
  SPECIAL_BULLET_SPEED: number;
  SIZE: { WIDTH: number; HEIGHT: number };
  IMAGE: string;
}

export interface EnemyConfig {
  HEALTH: number;
  SPEED: number;
  DROP_DISTANCE: number;
  EDGE_MARGIN: number;
  SHOOT_PROBABILITY: number;
  SHOOT_COOLDOWN: number;
  BULLET_SPEED: number;
  POINTS: number;
  SIZE: { WIDTH: number; HEIGHT: number };
  IMAGE: string;
}

export interface BossAttackConfig {
  COOLDOWN: number;
  COOLDOWN_RANDOM?: number; // ランダム間隔の幅
  BULLET_SPEED: number;
  ANGLE_SPREAD?: number;
  HOMING_STRENGTH?: number; // 追尾強度（0-1）
}

export interface BossConfig {
  HEALTH: number;
  MAX_HEALTH: number;
  SPEED: number;
  SPAWN_TIME: number;
  POINTS: number;
  SIZE: { WIDTH: number; HEIGHT: number };
  IMAGE: string;
  BULLET_IMAGE: string;
  ATTACKS: {
    SINGLE: BossAttackConfig;
    SPREAD: BossAttackConfig;
    HOMING?: BossAttackConfig;
    EXPLOSIVE?: BossAttackConfig;
  };
}

export interface GameConfigType {
  VERSION: string;
  CANVAS_WIDTH: number;
  CANVAS_HEIGHT: number;
  TARGET_FPS: number;
  
  SCORE: {
    ENEMY_KILL: number;
    UFO_KILL: number;
    BOSS_KILL: number;
    STAGE_CLEAR: number;
  };
  
  PLAYER: {
    A: PlayerConfig;
    B: PlayerConfig;
    C: PlayerConfig;
  };
  
  ENEMY: {
    A: EnemyConfig;
    B: EnemyConfig;
    C: EnemyConfig;
    FORMATION: {
      SPEED: number;
      INTERVAL: number;
    };
  };
  
  UFO: {
    SPAWN_INTERVAL: number;
    SPEED: number;
  };
  
  BOSS: {
    A: BossConfig;
    B: BossConfig;
    C: BossConfig;
  };
  
  BULLET: {
    PLAYER_SPEED: number;
    ENEMY_SPEED: number;
    SPECIAL_SPEED: number;
  };
  
  UI: {
    VERSION_FONT_SIZE: string;
    VERSION_COLOR: string;
    SCORE_FONT_SIZE: string;
    HIGHSCORE_COLOR: string;
    SHOW_HIGH_SCORE: boolean;
  };
  
  AUDIO: {
    ENABLED: boolean;
    MASTER_VOLUME: number;
    SFX_VOLUME: number;
    MUSIC_VOLUME: number;
  };
  
  COLLISION: {
    GAME_OVER_THRESHOLD: number;
    ADJUSTMENT_FACTOR: number;
  };
  
  DEBUG: {
    GOD_MODE: boolean;
    SHOW_INFO: boolean;
    ENABLED: boolean;
    STAGE_SELECT: boolean;
    BOSS_SELECT: boolean;
    SKIP_TITLE: boolean;
  };
}

export const GameConfig: GameConfigType = {
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
      IMAGE: 'player_A_back.png' // 暫定的にプレイヤーAの画像を使用
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
      IMAGE: 'player_A_back.png' // 暫定的にプレイヤーAの画像を使用
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
      IMAGE: 'enemy_01.png' // 暫定的にenemy_01.pngを使用
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
      IMAGE: 'enemy_01.png' // 暫定的にenemy_01.pngを使用
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
      BULLET_IMAGE: 'boss_A_bullet.png',
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
      BULLET_IMAGE: 'boss_B_bullet.png',
      ATTACKS: {
        SINGLE: {
          COOLDOWN: 1.875,
          COOLDOWN_RANDOM: 0.25, // 1.75-2.0秒の範囲
          BULLET_SPEED: 180,
          HOMING_STRENGTH: 0.3 // 弱めの追尾
        },
        SPREAD: {
          COOLDOWN: 1.625,
          COOLDOWN_RANDOM: 0.25, // 1.5-1.75秒の範囲
          BULLET_SPEED: 180,
          ANGLE_SPREAD: 0.5, // 50度相当
          HOMING_STRENGTH: 0.2 // 適度な追尾（0.1から0.2に変更）
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
      BULLET_IMAGE: 'boss_C_bullet.png',
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
    SHOW_INFO: true, // trueでデバッグ情報表示
    ENABLED: true, // デバッグモード全体の有効/無効
    STAGE_SELECT: true, // ステージセレクト機能
    BOSS_SELECT: true, // ボスセレクト機能
    SKIP_TITLE: false // タイトル画面をスキップしてゲーム開始
  }
};