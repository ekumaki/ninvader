import type { Scene } from '../core/types';

export abstract class BaseScene implements Scene {
  public isActive = false;

  abstract update(deltaTime: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;

  onEnter?(): void;
  onExit?(): void;
}