import type { Scene, GameConfig } from './types';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private scenes: Map<string, Scene> = new Map();
  private currentScene: Scene | null = null;
  private sceneStack: Scene[] = [];
  private lastTime = 0;
  private isRunning = false;
  private gameConfig: GameConfig;

  constructor(canvas: HTMLCanvasElement, gameConfig: GameConfig) {
    this.canvas = canvas;
    this.gameConfig = gameConfig;
    
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D rendering context');
    }
    this.ctx = context;
    
    // Set canvas size
    this.canvas.width = gameConfig.CANVAS_WIDTH;
    this.canvas.height = gameConfig.CANVAS_HEIGHT;
  }

  addScene(name: string, scene: Scene): void {
    this.scenes.set(name, scene);
  }

  switchToScene(name: string): void {
    console.log(`Switching to scene: ${name}`);
    const scene = this.scenes.get(name);
    if (!scene) {
      console.error(`Scene '${name}' not found`);
      console.log('Available scenes:', Array.from(this.scenes.keys()));
      return;
    }

    if (this.currentScene) {
      console.log(`Exiting current scene`);
      this.currentScene.onExit?.();
      this.currentScene.isActive = false;
    }

    this.currentScene = scene;
    this.currentScene.isActive = true;
    console.log(`Entering scene: ${name}`);
    this.currentScene.onEnter?.();
  }

  pushScene(name: string): void {
    const scene = this.scenes.get(name);
    if (!scene) {
      console.error(`Scene '${name}' not found`);
      return;
    }

    if (this.currentScene) {
      this.sceneStack.push(this.currentScene);
      this.currentScene.isActive = false;
    }

    this.currentScene = scene;
    this.currentScene.isActive = true;
    this.currentScene.onEnter?.();
  }

  popScene(): void {
    if (this.sceneStack.length === 0) {
      console.warn('Cannot pop scene: stack is empty');
      return;
    }

    if (this.currentScene) {
      this.currentScene.onExit?.();
      this.currentScene.isActive = false;
    }

    this.currentScene = this.sceneStack.pop()!;
    this.currentScene.isActive = true;
  }

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  stop(): void {
    this.isRunning = false;
  }

  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Cap delta time to prevent large jumps
    const clampedDeltaTime = Math.min(deltaTime, 1 / 30); // Max 30 FPS minimum

    this.update(clampedDeltaTime);
    this.render();

    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    if (this.currentScene && this.currentScene.isActive) {
      this.currentScene.update(deltaTime);
    }
  }

  private render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Set background
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render current scene
    if (this.currentScene && this.currentScene.isActive) {
      this.currentScene.render(this.ctx);
    }
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  getConfig(): GameConfig {
    return this.gameConfig;
  }

  getScene(name: string): Scene | undefined {
    return this.scenes.get(name);
  }
}