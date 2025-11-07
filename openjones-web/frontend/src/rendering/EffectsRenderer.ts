import type { Particle, Effect, HighlightConfig } from './types';
import { EffectType } from './types';

export class EffectsRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Map<string, Particle> = new Map();
  private effects: Map<string, Effect> = new Map();
  private highlightedPositions: Map<string, HighlightConfig> = new Map();
  private showFPS: boolean = false;
  private frameCount: number = 0;
  private lastFPSUpdate: number = 0;
  private currentFPS: number = 0;

  constructor(canvas?: HTMLCanvasElement) {
    if (canvas) {
      this.setCanvas(canvas);
    }
  }

  /**
   * Set the canvas to render effects on
   */
  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  /**
   * Update effects and particles (called each frame)
   */
  update(deltaTime: number): void {
    this.updateParticles(deltaTime);
    this.updateEffects(deltaTime);
    this.updateFPS();
  }

  /**
   * Render all effects (called each frame)
   */
  render(): void {
    if (!this.ctx || !this.canvas) return;

    this.renderHighlights();
    this.renderEffects();
    this.renderParticles();

    if (this.showFPS) {
      this.renderFPS();
    }
  }

  /**
   * Update all particles
   */
  private updateParticles(deltaTime: number): void {
    const expiredParticles: string[] = [];

    this.particles.forEach((particle, id) => {
      particle.elapsed += deltaTime;

      // Update position
      particle.x += particle.velocityX * (deltaTime / 1000);
      particle.y += particle.velocityY * (deltaTime / 1000);

      // Apply gravity to Y velocity
      particle.velocityY += 98 * (deltaTime / 1000); // ~9.8 m/s^2 * 10

      // Fade out based on lifetime
      const lifeProgress = particle.elapsed / particle.lifetime;
      particle.opacity = Math.max(0, 1 - lifeProgress);

      if (particle.elapsed >= particle.lifetime) {
        expiredParticles.push(id);
      }
    });

    expiredParticles.forEach(id => this.particles.delete(id));
  }

  /**
   * Update all effects
   */
  private updateEffects(deltaTime: number): void {
    const expiredEffects: string[] = [];

    this.effects.forEach((effect, id) => {
      effect.elapsed += deltaTime;

      if (effect.elapsed >= effect.duration) {
        expiredEffects.push(id);
      }
    });

    expiredEffects.forEach(id => this.effects.delete(id));
  }

  /**
   * Render all particles
   */
  private renderParticles(): void {
    if (!this.ctx) return;

    this.particles.forEach(particle => {
      this.ctx!.save();
      this.ctx!.globalAlpha = particle.opacity;

      if (particle.text) {
        // Render text particle
        this.ctx!.fillStyle = particle.color;
        this.ctx!.font = `bold ${particle.size}px sans-serif`;
        this.ctx!.textAlign = 'center';
        this.ctx!.textBaseline = 'middle';
        this.ctx!.fillText(particle.text, particle.x, particle.y);
      } else {
        // Render circular particle
        this.ctx!.fillStyle = particle.color;
        this.ctx!.beginPath();
        this.ctx!.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx!.fill();
      }

      this.ctx!.restore();
    });
  }

  /**
   * Render all effects
   */
  private renderEffects(): void {
    if (!this.ctx) return;

    this.effects.forEach(effect => {
      const progress = effect.elapsed / effect.duration;

      switch (effect.type) {
        case EffectType.GLOW:
          this.renderGlowEffect(effect, progress);
          break;
        case EffectType.PULSE:
          this.renderPulseEffect(effect, progress);
          break;
        case EffectType.SPARKLE:
          this.renderSparkleEffect(effect, progress);
          break;
      }
    });
  }

  /**
   * Render glow effect
   */
  private renderGlowEffect(effect: Effect, progress: number): void {
    if (!this.ctx) return;

    const opacity = 1 - progress;
    const radius = 20 + progress * 30;

    this.ctx.save();
    this.ctx.globalAlpha = opacity * 0.5;
    this.ctx.fillStyle = effect.data?.color || '#ffff00';
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = effect.data?.color || '#ffff00';
    this.ctx.beginPath();
    this.ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  /**
   * Render pulse effect
   */
  private renderPulseEffect(effect: Effect, progress: number): void {
    if (!this.ctx) return;

    const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.2;
    const opacity = 1 - progress;

    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.strokeStyle = effect.data?.color || '#00ff00';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(effect.x, effect.y, 30 * scale, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * Render sparkle effect
   */
  private renderSparkleEffect(effect: Effect, progress: number): void {
    if (!this.ctx) return;

    const opacity = 1 - progress;
    const rotation = progress * Math.PI * 2;

    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.translate(effect.x, effect.y);
    this.ctx.rotate(rotation);
    this.ctx.fillStyle = effect.data?.color || '#ffffff';

    // Draw star shape
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const x = Math.cos(angle) * 10;
      const y = Math.sin(angle) * 10;
      if (i === 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * Render building highlights
   */
  private renderHighlights(): void {
    if (!this.ctx) return;

    this.highlightedPositions.forEach((config, posKey) => {
      const [x, y] = posKey.split(',').map(Number);

      this.ctx!.save();
      this.ctx!.globalAlpha = config.opacity;
      this.ctx!.strokeStyle = config.color;
      this.ctx!.lineWidth = config.width;

      // Assume each tile is 100x100 (adjust based on actual tile size)
      const tileSize = 100;
      this.ctx!.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);

      if (config.animated) {
        // Add animated glow
        this.ctx!.shadowBlur = 15;
        this.ctx!.shadowColor = config.color;
        this.ctx!.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }

      this.ctx!.restore();
    });
  }

  /**
   * Render FPS counter
   */
  private renderFPS(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(this.canvas.width - 100, 10, 90, 40);

    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = 'bold 16px monospace';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`FPS: ${this.currentFPS}`, this.canvas.width - 15, 35);
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
   * Create a money particle effect
   */
  createMoneyEffect(x: number, y: number, amount: number, gained: boolean = true): void {
    const color = gained ? '#00ff00' : '#ff0000';
    const sign = gained ? '+' : '-';
    const text = `${sign}$${Math.abs(amount)}`;

    const particleId = `money-${Date.now()}-${Math.random()}`;
    this.particles.set(particleId, {
      id: particleId,
      x,
      y,
      velocityX: (Math.random() - 0.5) * 30,
      velocityY: -50 - Math.random() * 30,
      lifetime: 2000,
      elapsed: 0,
      color,
      size: 16,
      opacity: 1,
      text,
    });
  }

  /**
   * Create a sparkle effect
   */
  createSparkleEffect(x: number, y: number, color: string = '#ffffff'): void {
    const effectId = `sparkle-${Date.now()}-${Math.random()}`;
    this.effects.set(effectId, {
      id: effectId,
      type: EffectType.SPARKLE,
      x,
      y,
      duration: 500,
      elapsed: 0,
      data: { color },
    });
  }

  /**
   * Create a glow effect
   */
  createGlowEffect(x: number, y: number, color: string = '#ffff00'): void {
    const effectId = `glow-${Date.now()}-${Math.random()}`;
    this.effects.set(effectId, {
      id: effectId,
      type: EffectType.GLOW,
      x,
      y,
      duration: 1000,
      elapsed: 0,
      data: { color },
    });
  }

  /**
   * Highlight a building at position
   */
  highlightBuilding(x: number, y: number, config?: Partial<HighlightConfig>): void {
    const key = `${x},${y}`;
    this.highlightedPositions.set(key, {
      color: config?.color || '#ffff00',
      width: config?.width || 3,
      opacity: config?.opacity || 0.8,
      animated: config?.animated ?? true,
    });
  }

  /**
   * Remove highlight from a position
   */
  removeHighlight(x: number, y: number): void {
    const key = `${x},${y}`;
    this.highlightedPositions.delete(key);
  }

  /**
   * Clear all highlights
   */
  clearHighlights(): void {
    this.highlightedPositions.clear();
  }

  /**
   * Toggle FPS display
   */
  toggleFPS(show?: boolean): void {
    this.showFPS = show ?? !this.showFPS;
  }

  /**
   * Clear all effects
   */
  clear(): void {
    this.particles.clear();
    this.effects.clear();
    this.highlightedPositions.clear();
  }

  /**
   * Get particle count (for debugging)
   */
  getParticleCount(): number {
    return this.particles.size;
  }

  /**
   * Get effect count (for debugging)
   */
  getEffectCount(): number {
    return this.effects.size;
  }
}
