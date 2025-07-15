// Core game types and interfaces

export interface Vector2D {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface GameEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  isActive: boolean;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

export interface Collidable {
  x: number;
  y: number;
  width: number;
  height: number;
  isActive: boolean;
}

export interface Scene {
  isActive: boolean;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  onEnter?(): void;
  onExit?(): void;
}

export interface InputState {
  keys: Record<string, boolean>;
  mouse?: {
    x: number;
    y: number;
    buttons: boolean[];
  };
  touch?: {
    x: number;
    y: number;
    isPressed: boolean;
  };
}

export interface GameConfig {
  VERSION: string;
  CANVAS_WIDTH: number;
  CANVAS_HEIGHT: number;
  TARGET_FPS: number;
  PLAYER: any;
  ENEMY: any;
  BOSS: any;
  BULLET: any;
  UI: any;
  AUDIO: any;
  COLLISION: any;
  DEBUG: any;
  SCORE: any;
  UFO: any;
}

export interface AudioManager {
  play(soundName: string, volume?: number): void;
  stop(soundName: string): void;
  setMasterVolume(volume: number): void;
  setEnabled(enabled: boolean): void;
}

export interface InputManager {
  isKeyDown(key: string): boolean;
  isKeyPressed(key: string): boolean;
  isKeyReleased(key: string): boolean;
  update(deltaTime: number): void;
}