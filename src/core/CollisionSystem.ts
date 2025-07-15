import type { Collidable } from './types';

export class CollisionSystem {
  /**
   * Check if two collidable objects are colliding using AABB (Axis-Aligned Bounding Box)
   */
  static isColliding(a: Collidable, b: Collidable): boolean {
    if (!a.isActive || !b.isActive) return false;

    // Use getBounds() for center-based coordinate entities
    const aBounds = 'getBounds' in a ? (a as any).getBounds() : {
      left: a.x,
      right: a.x + a.width,
      top: a.y,
      bottom: a.y + a.height
    };
    
    const bBounds = 'getBounds' in b ? (b as any).getBounds() : {
      left: b.x,
      right: b.x + b.width,
      top: b.y,
      bottom: b.y + b.height
    };

    return (
      aBounds.left < bBounds.right &&
      aBounds.right > bBounds.left &&
      aBounds.top < bBounds.bottom &&
      aBounds.bottom > bBounds.top
    );
  }

  /**
   * Check collision with adjustment factor for more forgiving gameplay
   */
  static isCollidingWithFactor(a: Collidable, b: Collidable, factor = 0.8): boolean {
    if (!a.isActive || !b.isActive) return false;

    // Use getBounds() for center-based coordinate entities
    const aBounds = 'getBounds' in a ? (a as any).getBounds() : {
      left: a.x,
      right: a.x + a.width,
      top: a.y,
      bottom: a.y + a.height
    };
    
    const bBounds = 'getBounds' in b ? (b as any).getBounds() : {
      left: b.x,
      right: b.x + b.width,
      top: b.y,
      bottom: b.y + b.height
    };

    // Apply factor to reduce collision box size
    const aWidth = (aBounds.right - aBounds.left) * factor;
    const aHeight = (aBounds.bottom - aBounds.top) * factor;
    const bWidth = (bBounds.right - bBounds.left) * factor;
    const bHeight = (bBounds.bottom - bBounds.top) * factor;
    
    const aCenterX = (aBounds.left + aBounds.right) / 2;
    const aCenterY = (aBounds.top + aBounds.bottom) / 2;
    const bCenterX = (bBounds.left + bBounds.right) / 2;
    const bCenterY = (bBounds.top + bBounds.bottom) / 2;
    
    const aLeft = aCenterX - aWidth / 2;
    const aRight = aCenterX + aWidth / 2;
    const aTop = aCenterY - aHeight / 2;
    const aBottom = aCenterY + aHeight / 2;
    
    const bLeft = bCenterX - bWidth / 2;
    const bRight = bCenterX + bWidth / 2;
    const bTop = bCenterY - bHeight / 2;
    const bBottom = bCenterY + bHeight / 2;

    return (
      aLeft < bRight &&
      aRight > bLeft &&
      aTop < bBottom &&
      aBottom > bTop
    );
  }

  /**
   * Get the distance between two objects' centers
   */
  static getDistance(a: Collidable, b: Collidable): number {
    // Use getBounds() for center-based coordinate entities
    const aBounds = 'getBounds' in a ? (a as any).getBounds() : {
      left: a.x,
      right: a.x + a.width,
      top: a.y,
      bottom: a.y + a.height
    };
    
    const bBounds = 'getBounds' in b ? (b as any).getBounds() : {
      left: b.x,
      right: b.x + b.width,
      top: b.y,
      bottom: b.y + b.height
    };

    const centerAX = (aBounds.left + aBounds.right) / 2;
    const centerAY = (aBounds.top + aBounds.bottom) / 2;
    const centerBX = (bBounds.left + bBounds.right) / 2;
    const centerBY = (bBounds.top + bBounds.bottom) / 2;

    const dx = centerAX - centerBX;
    const dy = centerAY - centerBY;

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Check if point is inside a collidable object
   */
  static isPointInside(point: { x: number; y: number }, obj: Collidable): boolean {
    if (!obj.isActive) return false;

    // Use getBounds() for center-based coordinate entities
    const bounds = 'getBounds' in obj ? (obj as any).getBounds() : {
      left: obj.x,
      right: obj.x + obj.width,
      top: obj.y,
      bottom: obj.y + obj.height
    };

    return (
      point.x >= bounds.left &&
      point.x <= bounds.right &&
      point.y >= bounds.top &&
      point.y <= bounds.bottom
    );
  }

  /**
   * Check collision between multiple arrays of collidables
   */
  static checkCollisions<T extends Collidable, U extends Collidable>(
    arrayA: T[],
    arrayB: U[],
    onCollision: (a: T, b: U) => void,
    useFactor = true,
    factor = 0.8
  ): void {
    for (const a of arrayA) {
      if (!a.isActive) continue;

      for (const b of arrayB) {
        if (!b.isActive) continue;

        const isColliding = useFactor
          ? this.isCollidingWithFactor(a, b, factor)
          : this.isColliding(a, b);

        if (isColliding) {
          onCollision(a, b);
        }
      }
    }
  }
}