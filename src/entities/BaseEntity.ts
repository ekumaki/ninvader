/**
 * CNP インベーダー - エンティティ基底クラス
 * Version: 0.2.13
 * SPDX-License-Identifier: MIT
 */

import type { GameEntity } from '../core/types';

export abstract class BaseEntity implements GameEntity {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public isActive: boolean = true;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  abstract update(deltaTime: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;

  // 衝突判定用のバウンディングボックス取得
  getBounds() {
    return {
      left: this.x - this.width / 2,
      right: this.x + this.width / 2,
      top: this.y - this.height / 2,
      bottom: this.y + this.height / 2,
    };
  }

  // 画面内かどうかのチェック
  isInBounds(canvasWidth: number, canvasHeight: number): boolean {
    const bounds = this.getBounds();
    return (
      bounds.right >= 0 &&
      bounds.left <= canvasWidth &&
      bounds.bottom >= 0 &&
      bounds.top <= canvasHeight
    );
  }
}