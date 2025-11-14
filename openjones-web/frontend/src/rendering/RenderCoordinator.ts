/**
 * RenderCoordinator - Orchestrates all rendering systems for OpenJones browser port
 *
 * This class coordinates:
 * - AnimationEngine for smooth transitions
 * - EffectsRenderer for visual effects
 * - Canvas rendering for game state visualization
 * - Layer management for proper draw order
 *
 * Part of Task I2: Render Pipeline Integration
 * Worker 2 - Session 5
 */

import { AnimationEngine } from './AnimationEngine';
import { EffectsRenderer } from './EffectsRenderer';
import { Easing } from './easing';
import type { IGame } from '@shared/types/contracts';
import {
  renderGrassTile,
  renderModernBuilding,
  renderModernPlayer,
} from './ModernPixelRenderer';

export interface RenderCoordinatorConfig {
  canvas: HTMLCanvasElement;
  game: IGame;
  pixelScale?: number; // Scale for retro pixel art (default: 2)
  showFPS?: boolean;
}

export interface RenderLayer {
  name: string;
  zIndex: number;
  visible: boolean;
}

export interface RenderStats {
  fps: number;
  frameCount: number;
  renderTime: number;
}

/**
 * Main coordinator class that manages all rendering systems
 */
export class RenderCoordinator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private game: IGame;
  private pixelScale: number;

  private animationEngine: AnimationEngine;
  private effectsRenderer: EffectsRenderer;

  private isRunning: boolean = false;
  private lastRenderTime: number = 0;
  private frameCount: number = 0;
  private lastFPSUpdate: number = 0;
  private currentFPS: number = 0;
  private showFPS: boolean = false;

  // Render layers for proper draw order
  private layers: Map<string, RenderLayer> = new Map();

  // Previous game state for detecting changes
  private previousGameState: string | null = null;

  // Animation frame ID for cleanup
  private animationFrameId: number | null = null;

  // Old building images system - no longer needed with modern pixel art
  // private buildingImages: Map<string, HTMLImageElement> = new Map();
  // private imagesLoaded: boolean = false;

  // Map grid dimensions (5x5 grid of tiles)
  private readonly MAP_COLS = 5;
  private readonly MAP_ROWS = 5;

  // Old image loading system - no longer used with modern pixel art
  // private mapBackgroundImage: HTMLImageElement | null = null;
  // private mapBackgroundLoaded: boolean = false;
  // private centerTileImages: Map<string, HTMLImageElement> = new Map();
  // private centerImagesLoaded: boolean = false;
  // private grassTileImage: HTMLImageElement | null = null;
  // private grassImageLoaded: boolean = false;
  // private clockImages: Map<string, HTMLImageElement> = new Map();

  // Player animation state
  private playerAnimations: Map<string, {
    startPos: { x: number; y: number };
    endPos: { x: number; y: number };
    startTime: number;
    duration: number; // milliseconds
  }> = new Map();

  private readonly MOVE_ANIMATION_DURATION = 500; // 500ms per move

  constructor(config: RenderCoordinatorConfig) {
    this.canvas = config.canvas;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context');
    }
    this.ctx = ctx;
    this.game = config.game;
    this.pixelScale = config.pixelScale ?? 2;
    this.showFPS = config.showFPS ?? false;

    // GLOBAL FIX: Enforce pixel-perfect rendering (no anti-aliasing)
    // This ensures all sprites render sharp without blur
    this.ctx.imageSmoothingEnabled = false;
    (this.ctx as any).mozImageSmoothingEnabled = false;
    (this.ctx as any).webkitImageSmoothingEnabled = false;
    (this.ctx as any).msImageSmoothingEnabled = false;

    // Initialize rendering systems
    this.animationEngine = new AnimationEngine();
    this.effectsRenderer = new EffectsRenderer(this.canvas);

    // Set up render layers
    this.initializeLayers();

    // Modern pixel art rendering - no image loading needed!
    // All graphics are procedurally generated
    console.log('✨ Modern pixel art renderer initialized - all graphics procedural');

    // Old image loading - no longer needed
    // this.loadBuildingImages();
    // this.loadMapBackground();
    // this.loadCenterTileImages();
    // this.loadGrassTileImage();
    // this.loadClockImages();
  }

  /**
   * Initialize render layers (draw order from back to front)
   */
  private initializeLayers(): void {
    this.layers.set('background', { name: 'background', zIndex: 0, visible: true });
    this.layers.set('map', { name: 'map', zIndex: 1, visible: true });
    this.layers.set('buildings', { name: 'buildings', zIndex: 2, visible: true });
    this.layers.set('player', { name: 'player', zIndex: 3, visible: true });
    this.layers.set('effects', { name: 'effects', zIndex: 4, visible: true });
    this.layers.set('ui', { name: 'ui', zIndex: 5, visible: true });
  }

  // Old image loading methods - commented out, no longer needed
  // private loadBuildingImages(): void { ... }

  // Old image loading methods - no longer needed with modern pixel art
  // Commented out to avoid unused code warnings
  /*
  private loadMapBackground(): void { ... }
  private loadCenterTileImages(): void { ... }
  private loadGrassTileImage(): void { ... }
  private loadClockImages(): void { ... }
  */

  /**
   * Start the rendering loop
   */
  start(): void {
    if (this.isRunning) return;

    console.log('RenderCoordinator starting...', {
      canvasSize: `${this.canvas.width}x${this.canvas.height}`,
      buildingCount: this.game.map.getAllBuildings().length,
      playerCount: this.game.players.length,
    });

    this.isRunning = true;
    this.lastRenderTime = performance.now();
    this.lastFPSUpdate = performance.now();
    this.animationEngine.start();
    this.renderLoop(performance.now());
  }

  /**
   * Stop the rendering loop
   */
  stop(): void {
    this.isRunning = false;
    this.animationEngine.stop();
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Check if the render loop is running
   */
  isRendering(): boolean {
    return this.isRunning;
  }

  /**
   * Main render loop
   */
  private renderLoop(timestamp: number): void {
    if (!this.isRunning) return;

    const deltaTime = timestamp - this.lastRenderTime;
    this.lastRenderTime = timestamp;

    // Update effects renderer
    this.effectsRenderer.update(deltaTime);

    // Update player animations
    this.updatePlayerAnimations(timestamp);

    // Clear canvas
    this.clear();

    // DEBUG: Log rendering state every 60 frames (once per second at 60fps)
    if (this.frameCount % 60 === 0) {
      console.log('🎨 Render State (Modern Pixel Art):', {
        buildingCount: this.game.map.getAllBuildings().length,
        playerCount: this.game.players.length,
        frameCount: this.frameCount,
      });
    }

    // Render all layers in order with timestamp for animations
    this.renderAllLayers(timestamp);

    // Update FPS counter
    this.updateFPS();

    // Update frame counter
    this.frameCount++;

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame((ts) => this.renderLoop(ts));
  }

  /**
   * Update player movement animations
   */
  private updatePlayerAnimations(timestamp: number): void {
    // Detect and start new animations for position changes
    for (const player of this.game.players) {
      const currentAnim = this.playerAnimations.get(player.id);
      const playerPos = player.state.position;

      // If no animation or animation finished, check for position change
      if (!currentAnim || timestamp >= currentAnim.startTime + currentAnim.duration) {
        const lastPos = currentAnim ? currentAnim.endPos : playerPos;

        // Position changed - start new animation
        if (playerPos.x !== lastPos.x || playerPos.y !== lastPos.y) {
          this.playerAnimations.set(player.id, {
            startPos: { x: lastPos.x, y: lastPos.y },
            endPos: { x: playerPos.x, y: playerPos.y },
            startTime: timestamp,
            duration: this.MOVE_ANIMATION_DURATION,
          });
        }
      }
    }
  }

  /**
   * Get interpolated player position for animation
   */
  private getAnimatedPlayerPosition(playerId: string, currentPos: { x: number; y: number }, timestamp: number): { x: number; y: number } {
    const anim = this.playerAnimations.get(playerId);

    if (!anim) {
      return currentPos;
    }

    const elapsed = timestamp - anim.startTime;
    const progress = Math.min(elapsed / anim.duration, 1.0);

    // Ease out cubic for smooth deceleration
    const eased = 1 - Math.pow(1 - progress, 3);

    return {
      x: anim.startPos.x + (anim.endPos.x - anim.startPos.x) * eased,
      y: anim.startPos.y + (anim.endPos.y - anim.startPos.y) * eased,
    };
  }

  /**
   * Clear the canvas
   */
  private clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Render all layers in z-index order
   */
  private renderAllLayers(timestamp: number): void {
    // Sort layers by zIndex
    const sortedLayers = Array.from(this.layers.values())
      .filter((layer) => layer.visible)
      .sort((a, b) => a.zIndex - b.zIndex);

    // Render each layer
    for (const layer of sortedLayers) {
      this.renderLayer(layer.name, timestamp);
    }
  }

  /**
   * Render a specific layer
   */
  private renderLayer(layerName: string, timestamp: number): void {
    switch (layerName) {
      case 'background':
        this.renderBackground();
        break;
      case 'map':
        this.renderMap();
        this.renderClock(); // Render clock (smart rendering based on map loaded state)
        break;
      case 'buildings':
        this.renderBuildings();
        break;
      case 'player':
        this.renderPlayers(timestamp);
        break;
      case 'effects':
        this.renderEffects();
        break;
      case 'ui':
        this.renderUI();
        break;
    }
  }

  /**
   * Render background layer - Modern pixel art base
   * Solid color base for procedural grass tiles
   */
  private renderBackground(): void {
    // Simple solid background - grass tiles render on top
    this.ctx.fillStyle = '#5EAA5E'; // Green base matching grass palette
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Render map layer - Modern procedural pixel art
   * Beautiful grass tiles with cohesive aesthetic
   */
  private renderMap(): void {
    this.ctx.imageSmoothingEnabled = false;

    if (this.frameCount === 1) {
      console.log('🎨 Using MODERN PIXEL ART rendering');
    }

    const tileWidth = this.canvas.width / this.MAP_COLS;
    const tileHeight = this.canvas.height / this.MAP_ROWS;

    // Render beautiful procedural grass tiles
    for (let y = 0; y < this.MAP_ROWS; y++) {
      for (let x = 0; x < this.MAP_COLS; x++) {
        const tx = x * tileWidth;
        const ty = y * tileHeight;

        // Use position-based seed for consistent but varied tiles
        const seed = x * 1000 + y;
        renderGrassTile(this.ctx, tx, ty, tileWidth, tileHeight, seed);
      }
    }
  }

  // Old grass tile method - replaced by procedural rendering
  // private drawGrassTile(x: number, y: number, width: number, height: number): void { ... }

  /**
   * Render modern pixel-art clock
   * Time is now shown in UI, no need for map-based clock
   */
  private renderClock(): void {
    // Clock display moved to UI - cleaner separation
    // Time/week info is in PlayerStatsHUD
    return;
  }

  /**
   * Render buildings layer with modern pixel art
   * Beautiful isometric buildings with cohesive aesthetic
   */
  private renderBuildings(): void {
    if (this.frameCount === 1) {
      console.log('🏢 Rendering modern isometric buildings');
    }

    const tileWidth = this.canvas.width / this.MAP_COLS;
    const tileHeight = this.canvas.height / this.MAP_ROWS;
    const buildings = this.game.map.getAllBuildings();

    if (buildings.length === 0) {
      console.warn('No buildings to render!');
      return;
    }

    const playerPositions = this.game.players.map(p => ({ x: p.state.position.x, y: p.state.position.y }));

    buildings.forEach((building) => {
      const pos = building.position;
      const x = pos.x * tileWidth;
      const y = pos.y * tileHeight;

      const isPlayerOnBuilding = playerPositions.some(p => p.x === pos.x && p.y === pos.y);

      // Render modern building with procedural graphics
      renderModernBuilding(
        this.ctx,
        building,
        x,
        y,
        tileWidth,
        tileHeight,
        isPlayerOnBuilding
      );
    });
  }

  // Old building style method - colors now in ModernPixelRenderer
  // private getBuildingStyle(type: string): { colorTop: string; colorBottom: string; accentColor: string } { ... }

  /**
   * Render players layer - Modern pixel art sprites with smooth animation
   */
  private renderPlayers(timestamp: number): void {
    const tileWidth = this.canvas.width / this.MAP_COLS;
    const tileHeight = this.canvas.height / this.MAP_ROWS;

    this.game.players.forEach((player) => {
      const pos = player.state.position;

      // Get animated position for smooth movement
      const animPos = this.getAnimatedPlayerPosition(
        player.id,
        pos,
        timestamp
      );

      // Calculate pixel-aligned position (center of tile) using animated position
      const centerX = Math.floor(animPos.x * tileWidth + tileWidth / 2);
      const centerY = Math.floor(animPos.y * tileHeight + tileHeight / 2);

      // Scale sprite based on smaller dimension to fit in tile
      const minTileDim = Math.min(tileWidth, tileHeight);
      const spriteSize = Math.floor(minTileDim * 0.6);

      // Render modern pixel art player
      renderModernPlayer(this.ctx, player, centerX, centerY, spriteSize);
    });
  }

  /**
   * Render effects layer
   */
  private renderEffects(): void {
    // EffectsRenderer handles its own rendering
    this.effectsRenderer.render();
  }

  /**
   * Render UI layer
   */
  private renderUI(): void {
    if (this.showFPS) {
      this.renderFPSCounter();
    }
  }

  /**
   * Render FPS counter
   */
  private renderFPSCounter(): void {
    this.ctx.save();

    // Draw background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 10, 80, 30);

    // Draw FPS text
    this.ctx.fillStyle = '#00FF00';
    this.ctx.font = 'bold 16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(`FPS: ${this.currentFPS}`, 15, 15);

    this.ctx.restore();
  }

  /**
   * Update FPS counter
   */
  private updateFPS(): void {
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastFPSUpdate;

    if (elapsed >= 1000) {
      this.currentFPS = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastFPSUpdate = now;
    }
  }

  /**
   * Handle game state change - analyzes changes and triggers appropriate renders
   */
  onGameStateChange(game: IGame): void {
    this.game = game;

    // Serialize current state for comparison
    const currentState = this.serializeGameState(game);

    if (this.previousGameState) {
      // Detect changes and trigger effects
      this.detectAndAnimateChanges(this.previousGameState, currentState);
    }

    this.previousGameState = currentState;
  }

  /**
   * Serialize game state for change detection
   */
  private serializeGameState(game: IGame): string {
    return JSON.stringify({
      week: game.currentWeek,
      timeUnitsRemaining: game.timeUnitsRemaining,
      players: game.players.map((p) => ({
        id: p.id,
        cash: p.state.cash,
        health: p.state.health,
        happiness: p.state.happiness,
        education: p.state.education,
        career: p.state.career,
        position: { x: p.state.position.x, y: p.state.position.y },
      })),
    });
  }

  /**
   * Detect changes and trigger animations
   */
  private detectAndAnimateChanges(prevState: string, currentState: string): void {
    try {
      const prev = JSON.parse(prevState);
      const current = JSON.parse(currentState);

      // Check each player for changes
      current.players.forEach((currentPlayer: any, index: number) => {
        const prevPlayer = prev.players[index];
        if (!prevPlayer) return;

        // Position changed?
        if (
          prevPlayer.position.x !== currentPlayer.position.x ||
          prevPlayer.position.y !== currentPlayer.position.y
        ) {
          this.animatePlayerMovement(
            prevPlayer.position.x,
            prevPlayer.position.y,
            currentPlayer.position.x,
            currentPlayer.position.y,
            currentPlayer.id
          );
        }

        // Cash changed?
        if (prevPlayer.cash !== currentPlayer.cash) {
          const diff = currentPlayer.cash - prevPlayer.cash;
          const tileSize = 64 * this.pixelScale;
          const x = currentPlayer.position.x * tileSize + tileSize / 2;
          const y = currentPlayer.position.y * tileSize + tileSize / 2;
          this.effectsRenderer.createMoneyEffect(x, y, Math.abs(diff), diff > 0);
        }

        // Health/Happiness/Education changed - show sparkle effect
        if (
          prevPlayer.health !== currentPlayer.health ||
          prevPlayer.happiness !== currentPlayer.happiness ||
          prevPlayer.education !== currentPlayer.education
        ) {
          const tileSize = 64 * this.pixelScale;
          const x = currentPlayer.position.x * tileSize + tileSize / 2;
          const y = currentPlayer.position.y * tileSize + tileSize / 2;
          this.effectsRenderer.createSparkleEffect(x, y);
        }
      });
    } catch (error) {
      console.error('Error detecting state changes:', error);
    }
  }

  /**
   * Animate player movement from one position to another
   */
  animatePlayerMovement(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    playerId?: string
  ): void {
    const duration = 300; // ms
    const tweenId = playerId ? `player-move-${playerId}` : 'player-move';

    this.animationEngine.createTween(
      tweenId,
      fromX,
      fromY,
      toX,
      toY,
      duration,
      Easing.easeInOutQuad,
      undefined, // onUpdate not needed for now
      () => {
        // Movement complete
      }
    );
  }

  /**
   * Show a visual effect at a specific position
   */
  showEffect(effectType: 'sparkle' | 'glow' | 'money', x: number, y: number, data?: any): void {
    switch (effectType) {
      case 'sparkle':
        this.effectsRenderer.createSparkleEffect(x, y, data?.color);
        break;
      case 'glow':
        this.effectsRenderer.createGlowEffect(x, y, data?.color);
        break;
      case 'money':
        this.effectsRenderer.createMoneyEffect(x, y, data?.amount || 0, data?.gained ?? true);
        break;
    }
  }

  /**
   * Highlight a building at a specific position
   */
  highlightBuilding(x: number, y: number, color?: string): void {
    this.effectsRenderer.highlightBuilding(x, y, { color: color || '#FFFF00' });
  }

  /**
   * Remove highlight from a building
   */
  removeHighlight(x: number, y: number): void {
    this.effectsRenderer.removeHighlight(x, y);
  }

  /**
   * Clear all highlights
   */
  clearHighlights(): void {
    this.effectsRenderer.clearHighlights();
  }

  /**
   * Toggle FPS display
   */
  toggleFPS(show?: boolean): void {
    this.showFPS = show ?? !this.showFPS;
    this.effectsRenderer.toggleFPS(show);
  }

  /**
   * Handle canvas resize
   */
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  /**
   * Set layer visibility
   */
  setLayerVisible(layerName: string, visible: boolean): void {
    const layer = this.layers.get(layerName);
    if (layer) {
      layer.visible = visible;
    }
  }

  /**
   * Get layer configuration
   */
  getLayer(layerName: string): RenderLayer | undefined {
    return this.layers.get(layerName);
  }

  /**
   * Get all layers
   */
  getLayers(): Map<string, RenderLayer> {
    return new Map(this.layers);
  }

  /**
   * Get animation engine (for testing/debugging)
   */
  getAnimationEngine(): AnimationEngine {
    return this.animationEngine;
  }

  /**
   * Get effects renderer (for testing/debugging)
   */
  getEffectsRenderer(): EffectsRenderer {
    return this.effectsRenderer;
  }

  /**
   * Get canvas (for testing)
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get render stats
   */
  getStats(): RenderStats {
    return {
      fps: this.currentFPS,
      frameCount: this.frameCount,
      renderTime: this.lastRenderTime,
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    this.animationEngine.clear();
    this.effectsRenderer.clear();
    this.layers.clear();
    this.previousGameState = null;
  }
}
