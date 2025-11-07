import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AnimationEngine } from './AnimationEngine';
import { Easing } from './easing';
import type { Animation } from './types';

describe('AnimationEngine', () => {
  let engine: AnimationEngine;

  beforeEach(() => {
    engine = new AnimationEngine();
    vi.useFakeTimers();
  });

  afterEach(() => {
    engine.stop();
    vi.restoreAllMocks();
  });

  describe('start and stop', () => {
    it('should start the animation loop', () => {
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
      engine.start();
      expect(rafSpy).toHaveBeenCalled();
    });

    it('should stop the animation loop', () => {
      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
      engine.start();
      engine.stop();
      expect(cancelSpy).toHaveBeenCalled();
    });

    it('should not start if already running', () => {
      engine.start();
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
      engine.start();
      expect(rafSpy).not.toHaveBeenCalled();
    });

    it('should handle stop when not running', () => {
      expect(() => engine.stop()).not.toThrow();
    });

    it('should cancel animation frame on stop', () => {
      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
      engine.start();
      const initialCallCount = cancelSpy.mock.calls.length;
      engine.stop();
      expect(cancelSpy.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  describe('createTween', () => {
    it('should create a tween', () => {
      engine.createTween('test', 0, 0, 100, 100, 1000);
      expect(engine.isTweening('test')).toBe(true);
    });

    it('should call onUpdate during tween', () => {
      const onUpdate = vi.fn();
      engine.createTween('test', 0, 0, 100, 100, 1000, Easing.linear, onUpdate);

      engine.start();
      vi.advanceTimersByTime(500);

      expect(onUpdate).toHaveBeenCalled();
    });

    it('should call onComplete when tween finishes', () => {
      const onComplete = vi.fn();
      engine.createTween('test', 0, 0, 100, 100, 1000, Easing.linear, undefined, onComplete);

      engine.start();
      vi.advanceTimersByTime(1100);

      expect(onComplete).toHaveBeenCalled();
      expect(engine.isTweening('test')).toBe(false);
    });

    it('should interpolate correctly with linear easing', () => {
      const updates: Array<{x: number, y: number}> = [];
      const onUpdate = (x: number, y: number) => updates.push({x, y});

      engine.createTween('test', 0, 0, 100, 100, 1000, Easing.linear, onUpdate);

      engine.start();
      vi.advanceTimersByTime(500);

      const lastUpdate = updates[updates.length - 1];
      expect(lastUpdate.x).toBeCloseTo(50, 0);
      expect(lastUpdate.y).toBeCloseTo(50, 0);
    });

    it('should create tween with default easing', () => {
      engine.createTween('test', 0, 0, 100, 100, 1000);
      expect(engine.isTweening('test')).toBe(true);
    });

    it('should handle tween with zero duration', () => {
      const onComplete = vi.fn();
      engine.createTween('test', 0, 0, 100, 100, 0, Easing.linear, undefined, onComplete);
      engine.start();
      vi.advanceTimersByTime(16);
      expect(onComplete).toHaveBeenCalled();
    });

    it('should create multiple simultaneous tweens', () => {
      engine.createTween('tween1', 0, 0, 100, 100, 1000);
      engine.createTween('tween2', 50, 50, 150, 150, 1000);
      expect(engine.getTweenCount()).toBe(2);
    });

    it('should handle negative coordinates in tweens', () => {
      const updates: Array<{x: number, y: number}> = [];
      const onUpdate = (x: number, y: number) => updates.push({x, y});
      engine.createTween('test', -100, -100, 100, 100, 1000, Easing.linear, onUpdate);
      engine.start();
      vi.advanceTimersByTime(500);
      const lastUpdate = updates[updates.length - 1];
      expect(lastUpdate.x).toBeCloseTo(0, -1);
      expect(lastUpdate.y).toBeCloseTo(0, -1);
    });
  });

  describe('cancelTween', () => {
    it('should cancel an active tween', () => {
      engine.createTween('test', 0, 0, 100, 100, 1000);
      expect(engine.isTweening('test')).toBe(true);

      engine.cancelTween('test');
      expect(engine.isTweening('test')).toBe(false);
    });

    it('should not call callbacks after cancellation', () => {
      const onUpdate = vi.fn();
      const onComplete = vi.fn();
      engine.createTween('test', 0, 0, 100, 100, 1000, Easing.linear, onUpdate, onComplete);
      engine.start();
      vi.advanceTimersByTime(200);
      engine.cancelTween('test');
      const callCount = onUpdate.mock.calls.length;
      vi.advanceTimersByTime(1000);
      expect(onUpdate.mock.calls.length).toBe(callCount);
      expect(onComplete).not.toHaveBeenCalled();
    });

    it('should handle canceling non-existent tween', () => {
      expect(() => engine.cancelTween('nonexistent')).not.toThrow();
    });
  });

  describe('addAnimation', () => {
    it('should add an animation', () => {
      const animation: Animation = {
        id: 'walk',
        frames: [
          { spriteId: 'player-1', duration: 100, x: 0, y: 0 },
          { spriteId: 'player-2', duration: 100, x: 0, y: 0 },
        ],
        loop: true,
      };

      engine.addAnimation(animation);
      expect(engine.isPlaying('walk')).toBe(true);
    });

    it('should advance through frames', () => {
      const animation: Animation = {
        id: 'walk',
        frames: [
          { spriteId: 'player-1', duration: 100, x: 0, y: 0 },
          { spriteId: 'player-2', duration: 100, x: 0, y: 0 },
        ],
        loop: false,
      };

      engine.addAnimation(animation);
      engine.start();

      const frame1 = engine.getCurrentFrame('walk');
      expect(frame1?.spriteId).toBe('player-1');

      vi.advanceTimersByTime(150);

      const frame2 = engine.getCurrentFrame('walk');
      expect(frame2?.spriteId).toBe('player-2');
    });

    it('should loop animations when loop is true', () => {
      const animation: Animation = {
        id: 'idle',
        frames: [
          { spriteId: 'player-1', duration: 100, x: 0, y: 0 },
          { spriteId: 'player-2', duration: 100, x: 0, y: 0 },
        ],
        loop: true,
      };

      engine.addAnimation(animation);
      engine.start();

      vi.advanceTimersByTime(250);
      expect(engine.isPlaying('idle')).toBe(true);

      const frame = engine.getCurrentFrame('idle');
      expect(frame?.spriteId).toBe('player-1');
    });

    it('should call onComplete when non-looping animation finishes', () => {
      const onComplete = vi.fn();
      const animation: Animation = {
        id: 'exit',
        frames: [
          { spriteId: 'player-1', duration: 100, x: 0, y: 0 },
        ],
        loop: false,
        onComplete,
      };

      engine.addAnimation(animation);
      engine.start();

      vi.advanceTimersByTime(150);

      expect(onComplete).toHaveBeenCalled();
      expect(engine.isPlaying('exit')).toBe(false);
    });

    it('should handle single frame animation', () => {
      const animation: Animation = {
        id: 'static',
        frames: [
          { spriteId: 'player-1', duration: 100, x: 0, y: 0 },
        ],
        loop: false,
      };

      engine.addAnimation(animation);
      expect(engine.getCurrentFrame('static')?.spriteId).toBe('player-1');
    });

    it('should handle animation with varying frame durations', () => {
      const animation: Animation = {
        id: 'varied',
        frames: [
          { spriteId: 'frame-1', duration: 50, x: 0, y: 0 },
          { spriteId: 'frame-2', duration: 200, x: 0, y: 0 },
        ],
        loop: false,
      };

      engine.addAnimation(animation);
      engine.start();

      vi.advanceTimersByTime(70);
      expect(engine.getCurrentFrame('varied')?.spriteId).toBe('frame-2');
    });

    it('should create multiple simultaneous animations', () => {
      const anim1: Animation = {
        id: 'anim1',
        frames: [{ spriteId: 'test1', duration: 100, x: 0, y: 0 }],
        loop: true,
      };
      const anim2: Animation = {
        id: 'anim2',
        frames: [{ spriteId: 'test2', duration: 100, x: 0, y: 0 }],
        loop: true,
      };

      engine.addAnimation(anim1);
      engine.addAnimation(anim2);
      expect(engine.getAnimationCount()).toBe(2);
    });
  });

  describe('animation control', () => {
    it('should pause animation', () => {
      const animation: Animation = {
        id: 'test',
        frames: [
          { spriteId: 'player-1', duration: 100, x: 0, y: 0 },
        ],
        loop: true,
      };

      engine.addAnimation(animation);
      expect(engine.isPlaying('test')).toBe(true);

      engine.pauseAnimation('test');
      expect(engine.isPlaying('test')).toBe(false);
    });

    it('should resume animation', () => {
      const animation: Animation = {
        id: 'test',
        frames: [
          { spriteId: 'player-1', duration: 100, x: 0, y: 0 },
        ],
        loop: true,
      };

      engine.addAnimation(animation);
      engine.pauseAnimation('test');

      engine.resumeAnimation('test');
      expect(engine.isPlaying('test')).toBe(true);
    });

    it('should remove animation', () => {
      const animation: Animation = {
        id: 'test',
        frames: [
          { spriteId: 'player-1', duration: 100, x: 0, y: 0 },
        ],
        loop: true,
      };

      engine.addAnimation(animation);
      expect(engine.isPlaying('test')).toBe(true);

      engine.removeAnimation('test');
      expect(engine.isPlaying('test')).toBe(false);
      expect(engine.getCurrentFrame('test')).toBeNull();
    });

    it('should not update paused animation', () => {
      const animation: Animation = {
        id: 'test',
        frames: [
          { spriteId: 'frame-1', duration: 100, x: 0, y: 0 },
          { spriteId: 'frame-2', duration: 100, x: 0, y: 0 },
        ],
        loop: false,
      };

      engine.addAnimation(animation);
      engine.start();
      engine.pauseAnimation('test');

      vi.advanceTimersByTime(150);
      expect(engine.getCurrentFrame('test')?.spriteId).toBe('frame-1');
    });

    it('should handle pause on non-existent animation', () => {
      expect(() => engine.pauseAnimation('nonexistent')).not.toThrow();
    });

    it('should handle resume on non-existent animation', () => {
      expect(() => engine.resumeAnimation('nonexistent')).not.toThrow();
    });
  });

  describe('getCurrentFrame', () => {
    it('should return null for non-existent animation', () => {
      expect(engine.getCurrentFrame('nonexistent')).toBeNull();
    });

    it('should return correct frame', () => {
      const animation: Animation = {
        id: 'test',
        frames: [
          { spriteId: 'frame-1', duration: 100, x: 10, y: 20 },
        ],
        loop: false,
      };

      engine.addAnimation(animation);
      const frame = engine.getCurrentFrame('test');
      expect(frame).not.toBeNull();
      expect(frame?.spriteId).toBe('frame-1');
      expect(frame?.x).toBe(10);
      expect(frame?.y).toBe(20);
    });

    it('should handle optional frame properties', () => {
      const animation: Animation = {
        id: 'test',
        frames: [
          { spriteId: 'frame-1', duration: 100, x: 0, y: 0, scale: 2, opacity: 0.5, rotation: 45 },
        ],
        loop: false,
      };

      engine.addAnimation(animation);
      const frame = engine.getCurrentFrame('test');
      expect(frame?.scale).toBe(2);
      expect(frame?.opacity).toBe(0.5);
      expect(frame?.rotation).toBe(45);
    });
  });

  describe('clear', () => {
    it('should clear all animations and tweens', () => {
      engine.createTween('tween1', 0, 0, 100, 100, 1000);
      engine.addAnimation({
        id: 'anim1',
        frames: [{ spriteId: 'test', duration: 100, x: 0, y: 0 }],
        loop: true,
      });

      expect(engine.getTweenCount()).toBe(1);
      expect(engine.getAnimationCount()).toBe(1);

      engine.clear();

      expect(engine.getTweenCount()).toBe(0);
      expect(engine.getAnimationCount()).toBe(0);
    });

    it('should stop all callbacks after clear', () => {
      const onUpdate = vi.fn();
      engine.createTween('tween1', 0, 0, 100, 100, 1000, Easing.linear, onUpdate);
      engine.start();
      vi.advanceTimersByTime(100);
      engine.clear();
      const callCount = onUpdate.mock.calls.length;
      vi.advanceTimersByTime(1000);
      expect(onUpdate.mock.calls.length).toBe(callCount);
    });
  });

  describe('easing functions', () => {
    it('should apply different easing functions', () => {
      const linearUpdates: number[] = [];
      const easeInUpdates: number[] = [];

      engine.createTween('linear', 0, 0, 100, 0, 1000, Easing.linear, (x) => linearUpdates.push(x));
      engine.createTween('easeIn', 0, 0, 100, 0, 1000, Easing.easeInQuad, (x) => easeInUpdates.push(x));

      engine.start();
      vi.advanceTimersByTime(500);

      const lastLinear = linearUpdates[linearUpdates.length - 1];
      expect(lastLinear).toBeCloseTo(50, 0);

      const lastEaseIn = easeInUpdates[easeInUpdates.length - 1];
      expect(lastEaseIn).toBeLessThan(30);
    });

    it('should work with easeOutQuad', () => {
      const updates: number[] = [];
      engine.createTween('test', 0, 0, 100, 0, 1000, Easing.easeOutQuad, (x) => updates.push(x));
      engine.start();
      vi.advanceTimersByTime(500);
      const lastUpdate = updates[updates.length - 1];
      expect(lastUpdate).toBeGreaterThan(70);
    });

    it('should work with easeInOutQuad', () => {
      const updates: number[] = [];
      engine.createTween('test', 0, 0, 100, 0, 1000, Easing.easeInOutQuad, (x) => updates.push(x));
      engine.start();
      vi.advanceTimersByTime(500);
      const lastUpdate = updates[updates.length - 1];
      expect(lastUpdate).toBeCloseTo(50, -1);
    });

    it('should work with cubic easing functions', () => {
      engine.createTween('cubicIn', 0, 0, 100, 0, 1000, Easing.easeInCubic);
      engine.createTween('cubicOut', 0, 0, 100, 0, 1000, Easing.easeOutCubic);
      engine.createTween('cubicInOut', 0, 0, 100, 0, 1000, Easing.easeInOutCubic);
      expect(engine.getTweenCount()).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle animation with empty frames array', () => {
      const animation: Animation = {
        id: 'empty',
        frames: [],
        loop: false,
      };
      engine.addAnimation(animation);
      expect(engine.getCurrentFrame('empty')).toBeNull();
    });

    it('should handle very long duration tweens', () => {
      const onComplete = vi.fn();
      engine.createTween('long', 0, 0, 100, 100, 1000000, Easing.linear, undefined, onComplete);
      engine.start();
      vi.advanceTimersByTime(10000);
      expect(onComplete).not.toHaveBeenCalled();
      expect(engine.isTweening('long')).toBe(true);
    });

    it('should handle same start and end positions', () => {
      const updates: number[] = [];
      engine.createTween('static', 50, 50, 50, 50, 1000, Easing.linear, (x) => updates.push(x));
      engine.start();
      vi.advanceTimersByTime(500);
      const lastUpdate = updates[updates.length - 1];
      expect(lastUpdate).toBe(50);
    });

    it('should handle tween replacement with same id', () => {
      engine.createTween('test', 0, 0, 100, 100, 1000);
      engine.createTween('test', 0, 0, 200, 200, 1000);
      expect(engine.getTweenCount()).toBe(1);
    });

    it('should handle animation replacement with same id', () => {
      const anim1: Animation = {
        id: 'test',
        frames: [{ spriteId: 'frame1', duration: 100, x: 0, y: 0 }],
        loop: false,
      };
      const anim2: Animation = {
        id: 'test',
        frames: [{ spriteId: 'frame2', duration: 100, x: 0, y: 0 }],
        loop: false,
      };
      engine.addAnimation(anim1);
      engine.addAnimation(anim2);
      expect(engine.getAnimationCount()).toBe(1);
      expect(engine.getCurrentFrame('test')?.spriteId).toBe('frame2');
    });
  });

  describe('performance and memory', () => {
    it('should properly clean up completed tweens', () => {
      for (let i = 0; i < 10; i++) {
        engine.createTween(`tween${i}`, 0, 0, 100, 100, 100);
      }
      expect(engine.getTweenCount()).toBe(10);
      engine.start();
      vi.advanceTimersByTime(150);
      expect(engine.getTweenCount()).toBe(0);
    });

    it('should properly clean up completed animations', () => {
      for (let i = 0; i < 10; i++) {
        engine.addAnimation({
          id: `anim${i}`,
          frames: [{ spriteId: 'test', duration: 100, x: 0, y: 0 }],
          loop: false,
        });
      }
      expect(engine.getAnimationCount()).toBe(10);
      engine.start();
      vi.advanceTimersByTime(150);
      expect(engine.getAnimationCount()).toBe(0);
    });

    it('should handle many simultaneous tweens efficiently', () => {
      for (let i = 0; i < 100; i++) {
        engine.createTween(`tween${i}`, 0, 0, 100, 100, 1000);
      }
      expect(engine.getTweenCount()).toBe(100);
      expect(() => {
        engine.start();
        vi.advanceTimersByTime(16);
      }).not.toThrow();
    });
  });
});
