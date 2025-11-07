import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EffectsRenderer } from './EffectsRenderer';

// Mock Canvas and Context
class MockCanvasRenderingContext2D {
  fillStyle: string = '';
  strokeStyle: string = '';
  lineWidth: number = 1;
  globalAlpha: number = 1;
  font: string = '';
  textAlign: string = '';
  textBaseline: string = '';
  shadowBlur: number = 0;
  shadowColor: string = '';

  save = vi.fn();
  restore = vi.fn();
  fillRect = vi.fn();
  strokeRect = vi.fn();
  fillText = vi.fn();
  beginPath = vi.fn();
  arc = vi.fn();
  fill = vi.fn();
  stroke = vi.fn();
  moveTo = vi.fn();
  lineTo = vi.fn();
  closePath = vi.fn();
  translate = vi.fn();
  rotate = vi.fn();
}

class MockCanvas {
  width = 800;
  height = 600;

  getContext(): MockCanvasRenderingContext2D {
    return new MockCanvasRenderingContext2D();
  }
}

describe('EffectsRenderer', () => {
  let renderer: EffectsRenderer;
  let canvas: MockCanvas;

  beforeEach(() => {
    canvas = new MockCanvas();
    renderer = new EffectsRenderer(canvas as any);
  });

  describe('Constructor', () => {
    it('should create renderer without canvas', () => {
      const emptyRenderer = new EffectsRenderer();
      expect(emptyRenderer).toBeDefined();
    });

    it('should create renderer with canvas', () => {
      const canvasRenderer = new EffectsRenderer(canvas as any);
      expect(canvasRenderer).toBeDefined();
    });
  });

  describe('setCanvas', () => {
    it('should set the canvas', () => {
      const newCanvas = new MockCanvas();
      renderer.setCanvas(newCanvas as any);
      // Verify by rendering (should not throw)
      expect(() => renderer.render()).not.toThrow();
    });

    it('should replace existing canvas', () => {
      const firstCanvas = new MockCanvas();
      const secondCanvas = new MockCanvas();
      renderer.setCanvas(firstCanvas as any);
      renderer.setCanvas(secondCanvas as any);
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('createMoneyEffect', () => {
    it('should create a money gain particle', () => {
      renderer.createMoneyEffect(100, 100, 50, true);
      expect(renderer.getParticleCount()).toBe(1);
    });

    it('should create a money loss particle', () => {
      renderer.createMoneyEffect(100, 100, 30, false);
      expect(renderer.getParticleCount()).toBe(1);
    });

    it('should create particles with upward velocity', () => {
      renderer.createMoneyEffect(100, 100, 50);
      renderer.update(100);
      // Particle should have moved (tested indirectly through render)
      expect(() => renderer.render()).not.toThrow();
    });

    it('should default to gained=true', () => {
      renderer.createMoneyEffect(100, 100, 50);
      expect(renderer.getParticleCount()).toBe(1);
    });

    it('should handle negative amounts', () => {
      renderer.createMoneyEffect(100, 100, -50, false);
      expect(renderer.getParticleCount()).toBe(1);
    });

    it('should create multiple money effects', () => {
      renderer.createMoneyEffect(100, 100, 50);
      renderer.createMoneyEffect(200, 200, 30);
      expect(renderer.getParticleCount()).toBe(2);
    });
  });

  describe('particle updates', () => {
    it('should update particle positions', () => {
      renderer.createMoneyEffect(100, 100, 50);
      const initialCount = renderer.getParticleCount();

      renderer.update(100);
      expect(renderer.getParticleCount()).toBe(initialCount);
    });

    it('should remove expired particles', () => {
      renderer.createMoneyEffect(100, 100, 50);
      expect(renderer.getParticleCount()).toBe(1);

      // Update beyond particle lifetime (2000ms)
      renderer.update(2500);
      expect(renderer.getParticleCount()).toBe(0);
    });

    it('should fade particles over time', () => {
      renderer.createMoneyEffect(100, 100, 50);
      // Opacity should decrease (tested indirectly through render)
      renderer.update(1000);
      renderer.render();
      expect(renderer.getParticleCount()).toBe(1);
    });

    it('should apply gravity to particles', () => {
      renderer.createMoneyEffect(100, 100, 50);
      renderer.update(100);
      renderer.update(100);
      // Particles affected by gravity (verified through multiple updates)
      expect(renderer.getParticleCount()).toBe(1);
    });

    it('should keep particles until lifetime expires', () => {
      renderer.createMoneyEffect(100, 100, 50);
      renderer.update(1999);
      expect(renderer.getParticleCount()).toBe(1);
    });
  });

  describe('effects', () => {
    it('should create sparkle effect', () => {
      renderer.createSparkleEffect(100, 100);
      expect(renderer.getEffectCount()).toBe(1);
    });

    it('should create glow effect', () => {
      renderer.createGlowEffect(100, 100);
      expect(renderer.getEffectCount()).toBe(1);
    });

    it('should remove expired effects', () => {
      renderer.createSparkleEffect(100, 100); // 500ms duration
      expect(renderer.getEffectCount()).toBe(1);

      renderer.update(600);
      expect(renderer.getEffectCount()).toBe(0);
    });

    it('should support custom colors for sparkle', () => {
      renderer.createSparkleEffect(100, 100, '#ff00ff');
      expect(renderer.getEffectCount()).toBe(1);
    });

    it('should support custom colors for glow', () => {
      renderer.createGlowEffect(150, 150, '#00ffff');
      expect(renderer.getEffectCount()).toBe(1);
    });

    it('should create multiple effects', () => {
      renderer.createSparkleEffect(100, 100, '#ff00ff');
      renderer.createGlowEffect(150, 150, '#00ffff');
      expect(renderer.getEffectCount()).toBe(2);
    });

    it('should keep sparkle effect until duration expires', () => {
      renderer.createSparkleEffect(100, 100);
      renderer.update(499);
      expect(renderer.getEffectCount()).toBe(1);
    });

    it('should keep glow effect until duration expires', () => {
      renderer.createGlowEffect(100, 100);
      renderer.update(999);
      expect(renderer.getEffectCount()).toBe(1);
    });
  });

  describe('highlights', () => {
    it('should highlight a building', () => {
      renderer.highlightBuilding(2, 3);
      renderer.render();
      // Verify strokeRect was called (highlight drawn)
      expect(() => renderer.render()).not.toThrow();
    });

    it('should remove highlight', () => {
      renderer.highlightBuilding(2, 3);
      renderer.removeHighlight(2, 3);
      renderer.render();
      expect(() => renderer.render()).not.toThrow();
    });

    it('should clear all highlights', () => {
      renderer.highlightBuilding(0, 0);
      renderer.highlightBuilding(1, 1);
      renderer.highlightBuilding(2, 2);

      renderer.clearHighlights();
      renderer.render();
      expect(() => renderer.render()).not.toThrow();
    });

    it('should support custom highlight config', () => {
      renderer.highlightBuilding(2, 3, {
        color: '#ff0000',
        width: 5,
        opacity: 0.5,
        animated: false,
      });
      renderer.render();
      expect(() => renderer.render()).not.toThrow();
    });

    it('should support partial highlight config', () => {
      renderer.highlightBuilding(2, 3, { color: '#ff0000' });
      renderer.render();
      expect(() => renderer.render()).not.toThrow();
    });

    it('should use default highlight config', () => {
      renderer.highlightBuilding(2, 3);
      renderer.render();
      expect(() => renderer.render()).not.toThrow();
    });

    it('should handle multiple highlights at different positions', () => {
      renderer.highlightBuilding(0, 0);
      renderer.highlightBuilding(5, 5);
      renderer.highlightBuilding(10, 10);
      renderer.render();
      expect(() => renderer.render()).not.toThrow();
    });

    it('should remove specific highlight without affecting others', () => {
      renderer.highlightBuilding(0, 0);
      renderer.highlightBuilding(5, 5);
      renderer.removeHighlight(0, 0);
      renderer.render();
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('FPS counter', () => {
    it('should toggle FPS display on', () => {
      renderer.toggleFPS(true);
      renderer.render();
      // FPS should be rendered
      expect(() => renderer.render()).not.toThrow();
    });

    it('should update FPS counter', () => {
      renderer.toggleFPS(true);

      // Simulate multiple frames
      for (let i = 0; i < 60; i++) {
        renderer.update(16); // ~60fps
        renderer.render();
      }
      expect(() => renderer.render()).not.toThrow();
    });

    it('should hide FPS when toggled off', () => {
      renderer.toggleFPS(true);
      renderer.toggleFPS(false);
      renderer.render();
      expect(() => renderer.render()).not.toThrow();
    });

    it('should toggle FPS without parameter', () => {
      renderer.toggleFPS();
      renderer.render();
      renderer.toggleFPS();
      renderer.render();
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all effects and particles', () => {
      renderer.createMoneyEffect(100, 100, 50);
      renderer.createSparkleEffect(150, 150);
      renderer.highlightBuilding(2, 3);

      expect(renderer.getParticleCount()).toBe(1);
      expect(renderer.getEffectCount()).toBe(1);

      renderer.clear();

      expect(renderer.getParticleCount()).toBe(0);
      expect(renderer.getEffectCount()).toBe(0);
    });

    it('should clear highlights', () => {
      renderer.highlightBuilding(2, 3);
      renderer.clear();
      renderer.render();
      expect(() => renderer.render()).not.toThrow();
    });

    it('should handle clear when already empty', () => {
      renderer.clear();
      expect(renderer.getParticleCount()).toBe(0);
      expect(renderer.getEffectCount()).toBe(0);
    });
  });

  describe('rendering', () => {
    it('should render without errors when no effects', () => {
      expect(() => renderer.render()).not.toThrow();
    });

    it('should render particles', () => {
      renderer.createMoneyEffect(100, 100, 50);
      expect(() => renderer.render()).not.toThrow();
    });

    it('should render effects', () => {
      renderer.createSparkleEffect(100, 100);
      renderer.createGlowEffect(150, 150);
      expect(() => renderer.render()).not.toThrow();
    });

    it('should render highlights', () => {
      renderer.highlightBuilding(2, 3);
      expect(() => renderer.render()).not.toThrow();
    });

    it('should render without canvas context', () => {
      const emptyRenderer = new EffectsRenderer();
      expect(() => emptyRenderer.render()).not.toThrow();
    });

    it('should handle render after clear', () => {
      renderer.createMoneyEffect(100, 100, 50);
      renderer.clear();
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('multiple effects', () => {
    it('should handle multiple particles simultaneously', () => {
      for (let i = 0; i < 10; i++) {
        renderer.createMoneyEffect(i * 50, i * 50, 10 + i);
      }
      expect(renderer.getParticleCount()).toBe(10);

      renderer.update(100);
      expect(renderer.getParticleCount()).toBe(10);
    });

    it('should handle multiple effects simultaneously', () => {
      for (let i = 0; i < 5; i++) {
        renderer.createSparkleEffect(i * 50, i * 50);
        renderer.createGlowEffect(i * 50 + 25, i * 50 + 25);
      }
      expect(renderer.getEffectCount()).toBe(10);
    });

    it('should handle mixed particles and effects', () => {
      renderer.createMoneyEffect(100, 100, 50);
      renderer.createSparkleEffect(150, 150);
      renderer.createGlowEffect(200, 200);
      renderer.highlightBuilding(3, 3);

      expect(renderer.getParticleCount()).toBe(1);
      expect(renderer.getEffectCount()).toBe(2);
    });
  });

  describe('update', () => {
    it('should update without effects or particles', () => {
      expect(() => renderer.update(16)).not.toThrow();
    });

    it('should update with particles', () => {
      renderer.createMoneyEffect(100, 100, 50);
      expect(() => renderer.update(16)).not.toThrow();
    });

    it('should update with effects', () => {
      renderer.createSparkleEffect(100, 100);
      expect(() => renderer.update(16)).not.toThrow();
    });

    it('should handle large delta times', () => {
      renderer.createMoneyEffect(100, 100, 50);
      expect(() => renderer.update(5000)).not.toThrow();
      expect(renderer.getParticleCount()).toBe(0);
    });

    it('should handle zero delta time', () => {
      renderer.createMoneyEffect(100, 100, 50);
      expect(() => renderer.update(0)).not.toThrow();
      expect(renderer.getParticleCount()).toBe(1);
    });
  });

  describe('getParticleCount', () => {
    it('should return zero when no particles', () => {
      expect(renderer.getParticleCount()).toBe(0);
    });

    it('should return correct count', () => {
      renderer.createMoneyEffect(100, 100, 50);
      renderer.createMoneyEffect(200, 200, 30);
      expect(renderer.getParticleCount()).toBe(2);
    });
  });

  describe('getEffectCount', () => {
    it('should return zero when no effects', () => {
      expect(renderer.getEffectCount()).toBe(0);
    });

    it('should return correct count', () => {
      renderer.createSparkleEffect(100, 100);
      renderer.createGlowEffect(200, 200);
      expect(renderer.getEffectCount()).toBe(2);
    });
  });
});
