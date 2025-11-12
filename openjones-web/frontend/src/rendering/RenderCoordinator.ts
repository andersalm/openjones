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

  // Building images from Java graphics
  private buildingImages: Map<string, HTMLImageElement> = new Map();
  private imagesLoaded: boolean = false;

  // Center tile images (test06-18 for the 3x3 center area)
  private centerTileImages: Map<string, HTMLImageElement> = new Map();
  private centerImagesLoaded: boolean = false;

  // Clock images for time display (TODO: render in UI layer)
  private clockImages: Map<string, HTMLImageElement> = new Map();

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

    // Load building images
    this.loadBuildingImages();

    // Load center tile images
    this.loadCenterTileImages();

    // Load clock images
    this.loadClockImages();
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
   * Load building images from Java graphics
   */
  private loadBuildingImages(): void {
    const imageMap: Record<string, string> = {
      'EMPLOYMENT_AGENCY': 'employment.png',
      'FACTORY': 'factory.png',
      'BANK': 'bank_bot.png',
      'COLLEGE': 'gt.png',
      'CLOTHES_STORE': 'zmart.png',
      'RESTAURANT': 'monolith.png',
      'RENT_AGENCY': 'rent.png',
      'LOW_COST_APARTMENT': 'lowcost.png',
      'SECURITY_APARTMENT': 'security.png',
    };

    let loadedCount = 0;
    const totalImages = Object.keys(imageMap).length;

    Object.entries(imageMap).forEach(([buildingType, filename]) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          this.imagesLoaded = true;
          console.log('All building images loaded successfully');
        }
      };
      img.onerror = () => {
        console.warn(`Failed to load image: ${filename}`);
        loadedCount++;
        if (loadedCount === totalImages) {
          this.imagesLoaded = true;
        }
      };
      img.src = `/buildings/${filename}`;
      this.buildingImages.set(buildingType, img);
    });
  }

  /**
   * Load center tile images (3x3 grid in the middle of the 5x5 board)
   */
  private loadCenterTileImages(): void {
    // Map coordinates to test image numbers
    // Row 1, Col 1-3: test06, test07, test08
    // Row 2, Col 1-3: test11, test12, test13
    // Row 3, Col 1-3: test16, test17, test18
    const centerTiles = [
      { row: 1, col: 1, img: 'test06.png' },
      { row: 1, col: 2, img: 'test07.png' },
      { row: 1, col: 3, img: 'test08.png' },
      { row: 2, col: 1, img: 'test11.png' },
      { row: 2, col: 2, img: 'test12.png' },
      { row: 2, col: 3, img: 'test13.png' },
      { row: 3, col: 1, img: 'test16.png' },
      { row: 3, col: 2, img: 'test17.png' },
      { row: 3, col: 3, img: 'test18.png' },
    ];

    let loadedCount = 0;
    const totalImages = centerTiles.length;

    centerTiles.forEach(({ row, col, img }) => {
      const image = new Image();
      image.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          this.centerImagesLoaded = true;
          console.log('All center tile images loaded successfully');
        }
      };
      image.onerror = () => {
        console.warn(`Failed to load center tile: ${img}`);
        loadedCount++;
        if (loadedCount === totalImages) {
          this.centerImagesLoaded = true;
        }
      };
      image.src = `/center/${img}`;
      this.centerTileImages.set(`${row},${col}`, image);
    });
  }

  /**
   * Load clock images for time display (for future use in UI layer)
   */
  private loadClockImages(): void {
    const clockFiles = ['clock_bot.png', 'clock_top3.png'];

    clockFiles.forEach((filename) => {
      const img = new Image();
      img.onload = () => {
        console.log(`Clock image loaded: ${filename}`);
      };
      img.onerror = () => {
        console.warn(`Failed to load clock image: ${filename}`);
      };
      img.src = `/center/${filename}`;
      const key = filename.includes('bot') ? 'bottom' : 'top';
      this.clockImages.set(key, img);
    });
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
   * Render map layer - Professional retro grid (5x5 like Java version)
   * Center 3x3 tiles use Java graphics, outer ring uses gradient
   */
  private renderMap(): void {
    const tileSize = 100;
    const cols = 5;
    const rows = 5;

    this.ctx.imageSmoothingEnabled = false;

    // Draw tiles
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const tx = x * tileSize;
        const ty = y * tileSize;

        // Check if this is a center tile (row 1-3, col 1-3)
        const isCenterTile = x >= 1 && x <= 3 && y >= 1 && y <= 3;

        if (isCenterTile && this.centerImagesLoaded) {
          // Draw center tile image
          const centerImg = this.centerTileImages.get(`${y},${x}`);
          if (centerImg && centerImg.complete) {
            this.ctx.drawImage(centerImg, tx, ty, tileSize, tileSize);
          } else {
            // Fallback to gradient if image not loaded
            this.drawGradientTile(tx, ty, tileSize);
          }
        } else {
          // Draw gradient tile for border
          this.drawGradientTile(tx, ty, tileSize);
        }
      }
    }

    // Draw grid lines
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 3;

    for (let x = 0; x <= cols; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * tileSize, 0);
      this.ctx.lineTo(x * tileSize, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= rows; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * tileSize);
      this.ctx.lineTo(this.canvas.width, y * tileSize);
      this.ctx.stroke();
    }
  }

  /**
   * Draw a gradient tile (for border tiles)
   */
  private drawGradientTile(x: number, y: number, size: number): void {
    // Subtle gradient on each tile
    const gradient = this.ctx.createLinearGradient(x, y, x + size, y + size);
    gradient.addColorStop(0, '#C4B8A0');
    gradient.addColorStop(1, '#A89878');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, size, size);

    // Add subtle inner shadow effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(x, y, size, 3);
    this.ctx.fillRect(x, y, 3, size);
  }

  /**
   * Render buildings layer with Java graphics
   */
  private renderBuildings(): void {
    const tileSize = 100;
    const buildings = this.game.map.getAllBuildings();

    if (buildings.length === 0) {
      console.warn('No buildings to render!');
    }

    const playerPositions = this.game.players.map(p => ({ x: p.state.position.x, y: p.state.position.y }));

    buildings.forEach((building) => {
      const pos = building.position;
      const x = pos.x * tileSize;
      const y = pos.y * tileSize;

      const isPlayerOnBuilding = playerPositions.some(p => p.x === pos.x && p.y === pos.y);

      const padding = 10;
      const bx = x + padding;
      const by = y + padding;
      const bw = tileSize - (padding * 2);
      const bh = tileSize - (padding * 2);

      this.ctx.save();

      // Disable image smoothing for crisp pixel art
      this.ctx.imageSmoothingEnabled = false;

      // Get building image
      const img = this.buildingImages.get(building.type);

      if (img && img.complete && this.imagesLoaded) {
        // Draw building image
        this.ctx.drawImage(img, bx, by, bw, bh);
      } else {
        // Fallback to colored rectangle if image not loaded
        const style = this.getBuildingStyle(building.type);
        const gradient = this.ctx.createLinearGradient(bx, by, bx, by + bh);
        gradient.addColorStop(0, style.colorTop);
        gradient.addColorStop(1, style.colorBottom);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(bx, by, bw, bh);
      }

      // Draw border with highlight if player is on it
      if (isPlayerOnBuilding) {
        this.ctx.strokeStyle = '#FFFF00';
        this.ctx.lineWidth = 6;
        this.ctx.strokeRect(bx, by, bw, bh);
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(bx + 3, by + 3, bw - 6, bh - 6);
      } else {
        // Outer dark border
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(bx, by, bw, bh);
      }

      // Draw building name label - larger and more visible
      const namePlateHeight = 24;
      const namePlateY = by + bh - namePlateHeight - 2;

      // Nameplate background - solid black for maximum readability
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      this.ctx.fillRect(bx, namePlateY, bw, namePlateHeight);

      // Nameplate border
      this.ctx.strokeStyle = isPlayerOnBuilding ? '#FFFF00' : '#FFFFFF';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(bx, namePlateY, bw, namePlateHeight);

      // Building name text - bright and clear
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 10px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      // Truncate long names
      let displayName = building.name;
      if (displayName.length > 13) {
        displayName = displayName.substring(0, 11) + '..';
      }

      this.ctx.fillText(displayName, x + tileSize / 2, namePlateY + namePlateHeight / 2);

      this.ctx.restore();
    });
  }

  /**
   * Get visual style for building type with gradients
   */
  private getBuildingStyle(type: string): { colorTop: string; colorBottom: string; accentColor: string } {
    const styles: Record<string, { colorTop: string; colorBottom: string; accentColor: string }> = {
      'EMPLOYMENT_AGENCY': {
        colorTop: '#5BA3E8',
        colorBottom: '#3A7BC8',
        accentColor: '#87CEEB',
      },
      'FACTORY': {
        colorTop: '#A0522D',
        colorBottom: '#6B3410',
        accentColor: '#CD853F',
      },
      'BANK': {
        colorTop: '#FFE44D',
        colorBottom: '#D4AF37',
        accentColor: '#FFD700',
      },
      'COLLEGE': {
        colorTop: '#B294E8',
        colorBottom: '#7B5DB8',
        accentColor: '#DDA0DD',
      },
      'CLOTHES_STORE': {
        colorTop: '#FF8ACC',
        colorBottom: '#E85AA0',
        accentColor: '#FFB6D9',
      },
      'RESTAURANT': {
        colorTop: '#FF7A5C',
        colorBottom: '#E8553A',
        accentColor: '#FFA07A',
      },
      'RENT_AGENCY': {
        colorTop: '#4AE864',
        colorBottom: '#2AAA3F',
        accentColor: '#90EE90',
      },
      'LOW_COST_APARTMENT': {
        colorTop: '#BEBEBE',
        colorBottom: '#888888',
        accentColor: '#D3D3D3',
      },
      'SECURITY_APARTMENT': {
        colorTop: '#8FA9B8',
        colorBottom: '#5E7A8A',
        accentColor: '#B0C4DE',
      },
    };
    return styles[type] || {
      colorTop: '#888888',
      colorBottom: '#555555',
      accentColor: '#AAAAAA',
    };
  }

  /**
   * Render players layer - Retro pixel sprites
   */
  private renderPlayers(): void {
    const tileSize = 100; // Match 5x5 grid

    this.game.players.forEach((player) => {
      const pos = player.state.position;

      this.ctx.save();
      this.ctx.imageSmoothingEnabled = false;

      // Calculate pixel-aligned position
      const centerX = Math.floor(pos.x * tileSize + tileSize / 2);
      const centerY = Math.floor(pos.y * tileSize + tileSize / 2);

      // Draw player as pixel-perfect square (retro sprite style)
      const spriteSize = 36; // Bigger sprite for 100px tiles
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
      this.ctx.lineWidth = 3;
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
