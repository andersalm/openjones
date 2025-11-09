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

    // Initialize rendering systems
    this.animationEngine = new AnimationEngine();
    this.effectsRenderer = new EffectsRenderer(this.canvas);

    // Set up render layers
    this.initializeLayers();
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

    // Clear canvas
    this.clear();

    // Render all layers in order
    this.renderAllLayers();

    // Update FPS counter
    this.updateFPS();

    // Update frame counter
    this.frameCount++;

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame((ts) => this.renderLoop(ts));
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
  private renderAllLayers(): void {
    // Sort layers by zIndex
    const sortedLayers = Array.from(this.layers.values())
      .filter((layer) => layer.visible)
      .sort((a, b) => a.zIndex - b.zIndex);

    // Render each layer
    for (const layer of sortedLayers) {
      this.renderLayer(layer.name);
    }
  }

  /**
   * Render a specific layer
   */
  private renderLayer(layerName: string): void {
    switch (layerName) {
      case 'background':
        this.renderBackground();
        break;
      case 'map':
        this.renderMap();
        break;
      case 'buildings':
        this.renderBuildings();
        break;
      case 'player':
        this.renderPlayers();
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
   * Render background layer - Retro DOS/Windows 95 style
   */
  private renderBackground(): void {
    // Fill with solid retro tan/beige background
    this.ctx.fillStyle = '#D4C4A8';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Render map layer - Retro pixel-perfect grid
   */
  private renderMap(): void {
    const tileSize = 64; // Fixed tile size, no scaling
    const cols = Math.ceil(this.canvas.width / tileSize);
    const rows = Math.ceil(this.canvas.height / tileSize);

    // Disable anti-aliasing for crisp pixel edges
    this.ctx.imageSmoothingEnabled = false;

    // Draw alternating checkerboard pattern for depth
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Checkerboard pattern
        const isLight = (x + y) % 2 === 0;
        this.ctx.fillStyle = isLight ? '#D4C4A8' : '#C8BCA0';
        this.ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }

    // Draw grid lines on top for clarity
    this.ctx.strokeStyle = '#8B7355'; // Darker brown for better visibility
    this.ctx.lineWidth = 1;

    // Draw vertical grid lines
    for (let x = 0; x <= cols; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * tileSize, 0);
      this.ctx.lineTo(x * tileSize, this.canvas.height);
      this.ctx.stroke();
    }

    // Draw horizontal grid lines
    for (let y = 0; y <= rows; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * tileSize);
      this.ctx.lineTo(this.canvas.width, y * tileSize);
      this.ctx.stroke();
    }
  }

  /**
   * Render buildings layer
   */
  private renderBuildings(): void {
    const tileSize = 64 * this.pixelScale;
    const buildings = this.game.map.getAllBuildings();

    if (buildings.length === 0) {
      console.warn('No buildings to render!');
    }

    // Get player positions for highlighting
    const playerPositions = this.game.players.map(p => ({ x: p.state.position.x, y: p.state.position.y }));

    buildings.forEach((building) => {
      const pos = building.position;
      const x = pos.x * tileSize;
      const y = pos.y * tileSize;

      // Check if any player is on this building
      const isPlayerOnBuilding = playerPositions.some(p => p.x === pos.x && p.y === pos.y);

      // Draw building background
      this.ctx.fillStyle = this.getBuildingColor(building.type);
      this.ctx.fillRect(x, y, tileSize, tileSize);

      // Draw building border - thicker and yellow if player is on it
      if (isPlayerOnBuilding) {
        // Yellow highlight border
        this.ctx.strokeStyle = '#FFFF00';
        this.ctx.lineWidth = 6;
        this.ctx.strokeRect(x, y, tileSize, tileSize);

        // Add pulsing effect with double border
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(x + 3, y + 3, tileSize - 6, tileSize - 6);
      } else {
        // Normal black border
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, tileSize, tileSize);
      }

      // Draw building name with better contrast
      this.ctx.save();

      // Background for text
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(x + 4, y + tileSize - 20, tileSize - 8, 16);

      // Building name in white
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 8px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      // Truncate long names
      let displayName = building.name;
      if (displayName.length > 12) {
        displayName = displayName.substring(0, 10) + '...';
      }

      this.ctx.fillText(displayName, x + tileSize / 2, y + tileSize - 12);

      this.ctx.restore();
    });
  }

  /**
   * Get color for building type
   */
  private getBuildingColor(type: string): string {
    const colors: Record<string, string> = {
      'EMPLOYMENT_AGENCY': '#4A90E2',
      'FACTORY': '#8B4513',
      'BANK': '#FFD700',
      'COLLEGE': '#9370DB',
      'CLOTHES_STORE': '#FF69B4',
      'RESTAURANT': '#FF6347',
      'RENT_AGENCY': '#32CD32',
      'LOW_COST_APARTMENT': '#A9A9A9',
      'SECURITY_APARTMENT': '#708090',
    };
    return colors[type] || '#666666';
  }

  /**
   * Render players layer - Retro pixel sprites
   */
  private renderPlayers(): void {
    const tileSize = 64; // Fixed tile size

    this.game.players.forEach((player) => {
      const pos = player.state.position;

      this.ctx.save();
      this.ctx.imageSmoothingEnabled = false;

      // Calculate pixel-aligned position
      const centerX = Math.floor(pos.x * tileSize + tileSize / 2);
      const centerY = Math.floor(pos.y * tileSize + tileSize / 2);

      // Draw player as pixel-perfect square (retro sprite style)
      const spriteSize = 24;
      const halfSize = Math.floor(spriteSize / 2);

      // Player body (solid square)
      this.ctx.fillStyle = player.color;
      this.ctx.fillRect(
        centerX - halfSize,
        centerY - halfSize,
        spriteSize,
        spriteSize
      );

      // Black pixel border for definition
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        centerX - halfSize,
        centerY - halfSize,
        spriteSize,
        spriteSize
      );

      // Player name (pixel font)
      this.ctx.fillStyle = '#000000';
      this.ctx.font = '8px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';

      // Background for name (for readability)
      const nameWidth = this.ctx.measureText(player.name).width;
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.fillRect(
        centerX - nameWidth / 2 - 2,
        centerY + halfSize + 4,
        nameWidth + 4,
        10
      );

      // Name text
      this.ctx.fillStyle = '#000000';
      this.ctx.fillText(player.name, centerX, centerY + halfSize + 6);

      this.ctx.restore();
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
