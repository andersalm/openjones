/**
 * RenderCoordinator Tests
 *
 * Comprehensive test suite for the RenderCoordinator class
 * Tests integration between AnimationEngine, EffectsRenderer, and game state
 *
 * Part of Task I2: Render Pipeline Integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RenderCoordinator } from './RenderCoordinator';
import { Game } from '../engine/game/Game';
import { Position } from '../engine/types/Position';
import type { IGameConfig } from '@shared/types/contracts';

describe('RenderCoordinator', () => {
  let coordinator: RenderCoordinator;
  let canvas: HTMLCanvasElement;
  let game: Game;
  let rafSpy: any;
  let cancelRafSpy: any;

  beforeEach(() => {
    // Create canvas with mocked 2D context
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    // Mock 2D context
    const mockContext = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      closePath: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      globalAlpha: 1,
      font: '10px sans-serif',
      textAlign: 'left',
      textBaseline: 'alphabetic',
      shadowBlur: 0,
      shadowColor: '#000000',
    };

    vi.spyOn(canvas, 'getContext').mockReturnValue(mockContext as any);

    // Mock requestAnimationFrame and cancelAnimationFrame
    rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: any) => {
      setTimeout(() => cb(performance.now()), 16);
      return 1;
    });
    cancelRafSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    // Create game instance
    game = Game.create();

    // Initialize game with config
    const config: IGameConfig = {
      players: [
        { id: 'player1', name: 'Alice', color: '#FF0000', isAI: false },
        { id: 'player2', name: 'Bob', color: '#0000FF', isAI: false },
      ],
      startingCash: 1000,
      startingStats: {
        health: 100,
        happiness: 80,
        education: 50,
      },
      victoryConditions: {
        targetWealth: 10000,
        targetHealth: 100,
        targetHappiness: 100,
        targetCareer: 850,
        targetEducation: 100,
      },
    };
    game.initialize(config);

    // Create coordinator
    coordinator = new RenderCoordinator({ canvas, game });
  });

  afterEach(() => {
    if (coordinator) {
      coordinator.destroy();
    }
    rafSpy.mockRestore();
    cancelRafSpy.mockRestore();
  });

  // ============================================================================
  // Initialization Tests (8 tests)
  // ============================================================================

  describe('initialization', () => {
    it('should initialize with canvas and game', () => {
      expect(coordinator).toBeDefined();
      expect(coordinator.getCanvas()).toBe(canvas);
    });

    it('should throw error if canvas has no 2D context', () => {
      const badCanvas = {} as HTMLCanvasElement;
      badCanvas.getContext = () => null;

      expect(() => new RenderCoordinator({ canvas: badCanvas, game })).toThrow(
        'Failed to get 2D rendering context'
      );
    });

    it('should create AnimationEngine', () => {
      expect(coordinator.getAnimationEngine()).toBeDefined();
    });

    it('should create EffectsRenderer', () => {
      expect(coordinator.getEffectsRenderer()).toBeDefined();
    });

    it('should set up render layers', () => {
      const layers = coordinator.getLayers();
      expect(layers.size).toBe(6);
      expect(layers.has('background')).toBe(true);
      expect(layers.has('map')).toBe(true);
      expect(layers.has('buildings')).toBe(true);
      expect(layers.has('player')).toBe(true);
      expect(layers.has('effects')).toBe(true);
      expect(layers.has('ui')).toBe(true);
    });

    it('should initialize layers with correct z-index order', () => {
      const layers = Array.from(coordinator.getLayers().values());
      const zIndices = layers.map((l) => l.zIndex);
      const sortedZIndices = [...zIndices].sort((a, b) => a - b);
      expect(zIndices).toEqual(sortedZIndices);
    });

    it('should initialize with default pixel scale', () => {
      const stats = coordinator.getStats();
      expect(stats).toBeDefined();
    });

    it('should initialize with custom pixel scale', () => {
      const customCoordinator = new RenderCoordinator({ canvas, game, pixelScale: 4 });
      expect(customCoordinator).toBeDefined();
      customCoordinator.destroy();
    });
  });

  // ============================================================================
  // Render Loop Tests (8 tests)
  // ============================================================================

  describe('render loop', () => {
    it('should start rendering', () => {
      coordinator.start();
      expect(coordinator.isRendering()).toBe(true);
      expect(rafSpy).toHaveBeenCalled();
    });

    it('should not start if already running', () => {
      coordinator.start();
      const callCount = rafSpy.mock.calls.length;
      coordinator.start();
      // Should not call RAF again
      expect(rafSpy.mock.calls.length).toBe(callCount);
    });

    it('should stop rendering', () => {
      coordinator.start();
      coordinator.stop();
      expect(coordinator.isRendering()).toBe(false);
      expect(cancelRafSpy).toHaveBeenCalled();
    });

    it('should start AnimationEngine when starting', () => {
      const startSpy = vi.spyOn(coordinator.getAnimationEngine(), 'start');
      coordinator.start();
      expect(startSpy).toHaveBeenCalled();
    });

    it('should stop AnimationEngine when stopping', () => {
      coordinator.start();
      const stopSpy = vi.spyOn(coordinator.getAnimationEngine(), 'stop');
      coordinator.stop();
      expect(stopSpy).toHaveBeenCalled();
    });

    it('should update FPS counter during render loop', () => {
      vi.useFakeTimers();
      coordinator.start();

      // Wait for a frame
      vi.advanceTimersByTime(1000);

      const updatedStats = coordinator.getStats();
      expect(updatedStats.fps).toBeGreaterThanOrEqual(0);
      vi.useRealTimers();
    });

    it('should render all visible layers in order', () => {
      const ctx = canvas.getContext('2d')!;
      const clearRectSpy = vi.spyOn(ctx, 'clearRect');

      vi.useFakeTimers();
      coordinator.start();
      vi.advanceTimersByTime(16); // One frame

      expect(clearRectSpy).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('should not render if stopped', () => {
      coordinator.start();
      coordinator.stop();

      const ctx = canvas.getContext('2d')!;
      const clearRectSpy = vi.spyOn(ctx, 'clearRect');
      clearRectSpy.mockClear();

      vi.useFakeTimers();
      vi.advanceTimersByTime(100);

      // Should not have cleared (no render happened)
      expect(clearRectSpy).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  // ============================================================================
  // AnimationEngine Integration Tests (7 tests)
  // ============================================================================

  describe('animation integration', () => {
    it('should animate player movement', () => {
      const createTweenSpy = vi.spyOn(coordinator.getAnimationEngine(), 'createTween');

      coordinator.animatePlayerMovement(0, 0, 5, 5);

      expect(createTweenSpy).toHaveBeenCalledWith(
        'player-move',
        0,
        0,
        5,
        5,
        300,
        expect.any(Function),
        undefined,
        expect.any(Function)
      );
    });

    it('should animate player movement with player ID', () => {
      const createTweenSpy = vi.spyOn(coordinator.getAnimationEngine(), 'createTween');

      coordinator.animatePlayerMovement(0, 0, 5, 5, 'player1');

      expect(createTweenSpy).toHaveBeenCalledWith(
        'player-move-player1',
        0,
        0,
        5,
        5,
        300,
        expect.any(Function),
        undefined,
        expect.any(Function)
      );
    });

    it('should use easeInOutQuad easing for player movement', () => {
      const createTweenSpy = vi.spyOn(coordinator.getAnimationEngine(), 'createTween');

      coordinator.animatePlayerMovement(0, 0, 5, 5);

      const easingFunc = createTweenSpy.mock.calls[0]?.[6];
      expect(typeof easingFunc).toBe('function');
      // Test easing function behavior
      if (easingFunc) {
        expect(easingFunc(0)).toBe(0);
        expect(easingFunc(1)).toBe(1);
      }
    });

    it('should provide completion callback for movement animation', () => {
      const createTweenSpy = vi.spyOn(coordinator.getAnimationEngine(), 'createTween');

      coordinator.animatePlayerMovement(0, 0, 5, 5);

      const onComplete = createTweenSpy.mock.calls[0][8];
      expect(typeof onComplete).toBe('function');
    });

    it('should access AnimationEngine through getter', () => {
      const engine = coordinator.getAnimationEngine();
      expect(engine).toBeDefined();
      expect(typeof engine.start).toBe('function');
      expect(typeof engine.stop).toBe('function');
    });

    it('should clear animations on destroy', () => {
      const clearSpy = vi.spyOn(coordinator.getAnimationEngine(), 'clear');
      coordinator.destroy();
      expect(clearSpy).toHaveBeenCalled();
    });

    it('should handle multiple concurrent animations', () => {
      coordinator.animatePlayerMovement(0, 0, 1, 0, 'player1');
      coordinator.animatePlayerMovement(0, 0, 0, 1, 'player2');

      const tweenCount = coordinator.getAnimationEngine().getTweenCount();
      expect(tweenCount).toBe(2);
    });
  });

  // ============================================================================
  // EffectsRenderer Integration Tests (6 tests)
  // ============================================================================

  describe('effects integration', () => {
    it('should trigger sparkle effect', () => {
      const sparkleeSpy = vi.spyOn(coordinator.getEffectsRenderer(), 'createSparkleEffect');

      coordinator.showEffect('sparkle', 100, 100);

      expect(sparkleeSpy).toHaveBeenCalledWith(100, 100, undefined);
    });

    it('should trigger glow effect', () => {
      const glowSpy = vi.spyOn(coordinator.getEffectsRenderer(), 'createGlowEffect');

      coordinator.showEffect('glow', 100, 100, { color: '#FF0000' });

      expect(glowSpy).toHaveBeenCalledWith(100, 100, '#FF0000');
    });

    it('should trigger money effect', () => {
      const moneySpy = vi.spyOn(coordinator.getEffectsRenderer(), 'createMoneyEffect');

      coordinator.showEffect('money', 100, 100, { amount: 50, gained: true });

      expect(moneySpy).toHaveBeenCalledWith(100, 100, 50, true);
    });

    it('should highlight building', () => {
      const highlightSpy = vi.spyOn(coordinator.getEffectsRenderer(), 'highlightBuilding');

      coordinator.highlightBuilding(2, 3);

      expect(highlightSpy).toHaveBeenCalledWith(2, 3, { color: '#FFFF00' });
    });

    it('should remove building highlight', () => {
      const removeSpy = vi.spyOn(coordinator.getEffectsRenderer(), 'removeHighlight');

      coordinator.removeHighlight(2, 3);

      expect(removeSpy).toHaveBeenCalledWith(2, 3);
    });

    it('should clear all highlights', () => {
      const clearSpy = vi.spyOn(coordinator.getEffectsRenderer(), 'clearHighlights');

      coordinator.clearHighlights();

      expect(clearSpy).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // State Change Handling Tests (7 tests)
  // ============================================================================

  describe('state change handling', () => {
    it('should detect player movement', () => {
      const animateSpy = vi.spyOn(coordinator, 'animatePlayerMovement');

      // First update to set baseline
      coordinator.onGameStateChange(game);

      // Move player (position must be 0-4 range)
      const player = game.players[0];
      player.state.position = new Position(3, 3);

      // Trigger state change
      coordinator.onGameStateChange(game);

      expect(animateSpy).toHaveBeenCalled();
    });

    it('should trigger money effect on cash increase', () => {
      const moneySpy = vi.spyOn(coordinator.getEffectsRenderer(), 'createMoneyEffect');

      // Set baseline
      coordinator.onGameStateChange(game);

      // Increase cash
      game.players[0].state.cash += 100;

      // Trigger state change
      coordinator.onGameStateChange(game);

      expect(moneySpy).toHaveBeenCalled();
      const call = moneySpy.mock.calls[0];
      expect(call[2]).toBe(100); // amount
      expect(call[3]).toBe(true); // gained
    });

    it('should trigger money effect on cash decrease', () => {
      const moneySpy = vi.spyOn(coordinator.getEffectsRenderer(), 'createMoneyEffect');

      // Set baseline
      coordinator.onGameStateChange(game);

      // Decrease cash
      game.players[0].state.cash -= 50;

      // Trigger state change
      coordinator.onGameStateChange(game);

      expect(moneySpy).toHaveBeenCalled();
      const call = moneySpy.mock.calls[0];
      expect(call[2]).toBe(50); // amount
      expect(call[3]).toBe(false); // not gained
    });

    it('should trigger sparkle on health change', () => {
      const sparkleSpy = vi.spyOn(coordinator.getEffectsRenderer(), 'createSparkleEffect');

      // Set baseline
      coordinator.onGameStateChange(game);

      // Change health
      game.players[0].state.health += 10;

      // Trigger state change
      coordinator.onGameStateChange(game);

      expect(sparkleSpy).toHaveBeenCalled();
    });

    it('should trigger sparkle on happiness change', () => {
      const sparkleSpy = vi.spyOn(coordinator.getEffectsRenderer(), 'createSparkleEffect');

      // Set baseline
      coordinator.onGameStateChange(game);

      // Change happiness
      game.players[0].state.happiness += 5;

      // Trigger state change
      coordinator.onGameStateChange(game);

      expect(sparkleSpy).toHaveBeenCalled();
    });

    it('should handle multiple simultaneous changes', () => {
      const animateSpy = vi.spyOn(coordinator, 'animatePlayerMovement');
      const moneySpy = vi.spyOn(coordinator.getEffectsRenderer(), 'createMoneyEffect');

      // Set baseline
      coordinator.onGameStateChange(game);

      // Multiple changes
      game.players[0].state.position = new Position(3, 3);
      game.players[0].state.cash += 200;

      // Trigger state change
      coordinator.onGameStateChange(game);

      expect(animateSpy).toHaveBeenCalled();
      expect(moneySpy).toHaveBeenCalled();
    });

    it('should not trigger effects if no state changes', () => {
      const animateSpy = vi.spyOn(coordinator, 'animatePlayerMovement');
      const moneySpy = vi.spyOn(coordinator.getEffectsRenderer(), 'createMoneyEffect');

      // Set baseline
      coordinator.onGameStateChange(game);

      // No changes
      coordinator.onGameStateChange(game);

      expect(animateSpy).not.toHaveBeenCalled();
      expect(moneySpy).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Layer Management Tests (5 tests)
  // ============================================================================

  describe('layer management', () => {
    it('should get layer by name', () => {
      const layer = coordinator.getLayer('player');
      expect(layer).toBeDefined();
      expect(layer?.name).toBe('player');
      expect(layer?.zIndex).toBe(3);
    });

    it('should set layer visibility', () => {
      coordinator.setLayerVisible('player', false);
      const layer = coordinator.getLayer('player');
      expect(layer?.visible).toBe(false);
    });

    it('should hide layers when visibility is false', () => {
      coordinator.setLayerVisible('background', false);

      // Start rendering
      coordinator.start();

      // The background layer should not be rendered
      const layer = coordinator.getLayer('background');
      expect(layer?.visible).toBe(false);
    });

    it('should get all layers', () => {
      const layers = coordinator.getLayers();
      expect(layers.size).toBe(6);
    });

    it('should maintain layer order by z-index', () => {
      const layers = Array.from(coordinator.getLayers().values());
      for (let i = 0; i < layers.length - 1; i++) {
        expect(layers[i].zIndex).toBeLessThanOrEqual(layers[i + 1].zIndex);
      }
    });
  });

  // ============================================================================
  // Utility and Lifecycle Tests (4 tests)
  // ============================================================================

  describe('utility and lifecycle', () => {
    it('should resize canvas', () => {
      coordinator.resize(1024, 768);
      expect(canvas.width).toBe(1024);
      expect(canvas.height).toBe(768);
    });

    it('should toggle FPS display', () => {
      const toggleSpy = vi.spyOn(coordinator.getEffectsRenderer(), 'toggleFPS');

      coordinator.toggleFPS(true);

      expect(toggleSpy).toHaveBeenCalledWith(true);
    });

    it('should get render stats', () => {
      const stats = coordinator.getStats();

      expect(stats).toBeDefined();
      expect(typeof stats.fps).toBe('number');
      expect(typeof stats.frameCount).toBe('number');
      expect(typeof stats.renderTime).toBe('number');
    });

    it('should clean up on destroy', () => {
      coordinator.start();

      const engineClearSpy = vi.spyOn(coordinator.getAnimationEngine(), 'clear');
      const effectsClearSpy = vi.spyOn(coordinator.getEffectsRenderer(), 'clear');

      coordinator.destroy();

      expect(coordinator.isRendering()).toBe(false);
      expect(engineClearSpy).toHaveBeenCalled();
      expect(effectsClearSpy).toHaveBeenCalled();
    });
  });
});
