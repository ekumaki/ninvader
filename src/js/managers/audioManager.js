/**
 * CNP インベーダー - 和風インベーダーゲーム
 * Version: 0.1.0
 * SPDX-License-Identifier: MIT
 */

export class AudioManager {
  constructor() {
    this.sounds = {};
    this.audioContext = null;
    this.masterGain = null;
    this.isMuted = false;
    this.maxSimultaneousSounds = 8; // 同時再生可能な音の数
    this.playingSounds = [];
    
    this.initAudioContext();
    this.loadSounds();
  }
  
  // Web Audio APIの初期化
  initAudioContext() {
    try {
      // AudioContextの作成
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
      // マスターゲインの設定
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.7; // 全体音量の初期値
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
  
  // 効果音の読み込み
  async loadSounds() {
    const soundFiles = {
      shoot: '/src/assets/audio/sfx/shoot.mp3',
      explosion: '/src/assets/audio/sfx/explosion.mp3',
      specialCharge: '/src/assets/audio/sfx/special_charge.mp3',
      specialShoot: '/src/assets/audio/sfx/special_shoot.mp3'
    };
    
    for (const [name, path] of Object.entries(soundFiles)) {
      try {
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.sounds[name] = audioBuffer;
      } catch (e) {
        console.error(`効果音 ${name} の読み込みに失敗しました`, e);
      }
    }
  }
  
  // 効果音の再生
  play(soundName, volume = 1.0) {
    if (this.isMuted || !this.sounds[soundName] || !this.audioContext) return null;
    
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
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 0.7;
    }
    return this.isMuted;
  }
}
