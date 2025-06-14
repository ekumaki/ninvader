/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.0
 * SPDX-License-Identifier: MIT
 */

import { GameConfig } from '../config/gameConfig.js';

export class AudioManager {
  /**
   * @param {Object} options
   * @param {boolean} [options.enabled] - オーディオを有効にするかどうか。省略時は GameConfig を参照。
   */
  constructor(options = {}) {
    // 設定から有効フラグを取得（優先順位: オプション > GameConfig > デフォルト true）
    this.enabled =
      typeof options.enabled === 'boolean'
        ? options.enabled
        : (GameConfig?.AUDIO?.ENABLED ?? true);

    this.sounds = {};
    this.audioContext = null;
    this.masterGain = null;
    const savedMute = localStorage.getItem('CNP_AUDIO_MUTED');
    this.isMuted = savedMute !== null ? (savedMute === 'true') : true;
    this.maxSimultaneousSounds = 8; // 同時再生可能な音の数
    this.playingSounds = [];
    
    if (this.enabled) {
      // 有効な場合のみ初期化と読み込みを行う
      this.initAudioContext();
      this.loadSounds();
    } else {
      console.log('AudioManager: オーディオは無効化されています');
    }
  }
  
  // Web Audio APIの初期化
  initAudioContext() {
    try {
      // AudioContextの作成
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
      // マスターゲインの設定
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.5; // 全体音量の初期値（0.7→0.5に下げる）
      this.masterGain.connect(this.audioContext.destination);
      
      // ユーザーインタラクションでオーディオコンテキストを開始
      document.addEventListener('click', () => {
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
      }, { once: true });
    } catch (e) {
      console.error('Web Audio APIの初期化に失敗しました', e);
    }
  }
  
  // ---------------- 合成効果音ユーティリティ ----------------
  createBuffer(durationSec) {
    const rate = this.audioContext.sampleRate;
    return this.audioContext.createBuffer(1, rate * durationSec, rate);
  }

  synthShoot() {
    const buf = this.createBuffer(0.1);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = i % 20 < 10 ? 0.6 : -0.6;
    }
    return buf;
  }

  synthExplosion() {
    const buf = this.createBuffer(0.4);
    const data = buf.getChannelData(0);
    const len = data.length;
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    }
    return buf;
  }

  synthSpecialCharge() {
    const buf = this.createBuffer(0.8);
    const data = buf.getChannelData(0);
    const len = data.length;
    for (let i = 0; i < len; i++) {
      const t = i / this.audioContext.sampleRate;
      const f = 200 + 600 * t; // 200→800Hz
      data[i] = Math.sin(2 * Math.PI * f * t) * 0.4;
    }
    return buf;
  }

  synthSpecialShoot() {
    const buf = this.createBuffer(0.25);
    const data = buf.getChannelData(0);
    const len = data.length;
    for (let i = 0; i < len; i++) {
      const v = ((i % 25) / 25) - 0.5; // のこぎり波
      data[i] = v * Math.pow(1 - i / len, 1.5);
    }
    return buf;
  }
  
  // 効果音の読み込み
  async loadSounds() {
    const base = import.meta.url;
    const soundFiles = {
      shoot: new URL('../../assets/audio/sfx/shoot.mp3', base).href,
      explosion: new URL('../../assets/audio/sfx/explosion.mp3', base).href,
      specialCharge: new URL('../../assets/audio/sfx/special_charge.mp3', base).href,
      specialShoot: new URL('../../assets/audio/sfx/special_shoot.mp3', base).href,
      bossDamage: new URL('../../assets/audio/sfx/boss_damage.mp3', base).href,
      bossDestroyed: new URL('../../assets/audio/sfx/boss_destroyed.mp3', base).href,
      playerDestroyed: new URL('../../assets/audio/sfx/player_destroyed.mp3', base).href,
      bossAlert: new URL('../../assets/audio/sfx/boss_alert.mp3', base).href,
      gameClear: new URL('../../assets/audio/sfx/game_clear.mp3', base).href,
      gameOver: new URL('../../assets/audio/sfx/game_over.mp3', base).href,
      gameStart: new URL('../../assets/audio/sfx/game_start.mp3', base).href,
    };
    
    for (const [name, path] of Object.entries(soundFiles)) {
      try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.sounds[name] = audioBuffer;
      } catch (e) {
        console.warn(`効果音 ${name} の読み込みに失敗しました。合成音を使用します`, e);
        switch (name) {
          case 'shoot':
            this.sounds[name] = this.synthShoot();
            break;
          case 'explosion':
            this.sounds[name] = this.synthExplosion();
            break;
          case 'specialCharge':
            this.sounds[name] = this.synthSpecialCharge();
            break;
          case 'specialShoot':
            this.sounds[name] = this.synthSpecialShoot();
            break;
          // 追加効果音は合成音なし
          default:
            break;
        }
      }
    }
  }
  
  // 効果音の再生
  play(soundName, volume = 1.0) {
    // 音量を効果音ごとに調整
    if (typeof volume === 'undefined' || volume === null) {
      if (soundName === 'specialCharge') {
        volume = 0.5;
      } else if (soundName === 'gameClear' || soundName === 'gameOver' || soundName === 'bossAlert') {
        volume = 0.1;
      }
    }
    if (!this.enabled || this.isMuted || !this.sounds[soundName] || !this.audioContext) return null;
    
    // 同時再生数の制限
    if (this.playingSounds.length >= this.maxSimultaneousSounds) {
      // 最も古い音を停止
      const oldestSound = this.playingSounds.shift();
      if (oldestSound && oldestSound.gainNode) {
        oldestSound.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      }
    }
    
    try {
      // 音源の作成
      const source = this.audioContext.createBufferSource();
      source.buffer = this.sounds[soundName];
      
      // 個別の音量調整用のゲインノード
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = volume;
      
      // 接続
      source.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      // 再生
      source.start(0);
      
      // 再生中の音を記録
      const soundInfo = { source, gainNode, startTime: this.audioContext.currentTime };
      this.playingSounds.push(soundInfo);
      
      // 再生終了時の処理
      source.onended = () => {
        const index = this.playingSounds.indexOf(soundInfo);
        if (index !== -1) {
          this.playingSounds.splice(index, 1);
        }
      };
      
      // bossAlert音は再生中のsourceを記録
      if (soundName === 'bossAlert') {
        if (this.bossAlertSource) {
          try { this.bossAlertSource.stop(); } catch {}
        }
        this.bossAlertSource = source;
      }
      // specialCharge音も再生中のsourceを記録
      if (soundName === 'specialCharge') {
        if (this.specialChargeSource) {
          try { this.specialChargeSource.stop(); } catch {}
        }
        this.specialChargeSource = source;
      }
      
      return soundInfo;
    } catch (e) {
      console.error(`効果音 ${soundName} の再生に失敗しました`, e);
      return null;
    }
  }
  
  // 音量の設定
  setVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
  
  // ミュート切り替え
  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('CNP_AUDIO_MUTED', this.isMuted);
    if (this.masterGain && this.enabled) {
      this.masterGain.gain.value = this.isMuted ? 0 : 0.5;
    }
    return this.isMuted;
  }

  stop(soundName) {
    if (soundName === 'bossAlert' && this.bossAlertSource) {
      try { this.bossAlertSource.stop(); } catch {}
      this.bossAlertSource = null;
    }
    if (soundName === 'specialCharge' && this.specialChargeSource) {
      try { this.specialChargeSource.stop(); } catch {}
      this.specialChargeSource = null;
    }
  }
}
