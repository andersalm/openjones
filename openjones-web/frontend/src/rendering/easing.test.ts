import { describe, it, expect } from 'vitest';
import { Easing } from './easing';

describe('Easing', () => {
  describe('linear', () => {
    it('should return input value', () => {
      expect(Easing.linear(0)).toBe(0);
      expect(Easing.linear(0.5)).toBe(0.5);
      expect(Easing.linear(1)).toBe(1);
    });

    it('should handle all values between 0 and 1', () => {
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        expect(Easing.linear(t)).toBe(t);
      }
    });
  });

  describe('easeInQuad', () => {
    it('should start slow and accelerate', () => {
      expect(Easing.easeInQuad(0)).toBe(0);
      expect(Easing.easeInQuad(0.5)).toBe(0.25);
      expect(Easing.easeInQuad(1)).toBe(1);
    });

    it('should be slower than linear at start', () => {
      expect(Easing.easeInQuad(0.25)).toBeLessThan(0.25);
      expect(Easing.easeInQuad(0.5)).toBeLessThan(0.5);
    });

    it('should be faster than linear at end', () => {
      expect(Easing.easeInQuad(0.75)).toBeGreaterThan(0.5);
    });
  });

  describe('easeOutQuad', () => {
    it('should start fast and decelerate', () => {
      expect(Easing.easeOutQuad(0)).toBe(0);
      expect(Easing.easeOutQuad(0.5)).toBe(0.75);
      expect(Easing.easeOutQuad(1)).toBe(1);
    });

    it('should be faster than linear at start', () => {
      expect(Easing.easeOutQuad(0.25)).toBeGreaterThan(0.25);
      expect(Easing.easeOutQuad(0.5)).toBeGreaterThan(0.5);
    });

    it('should be slower than linear at end', () => {
      expect(Easing.easeOutQuad(0.75)).toBeLessThan(1);
    });
  });

  describe('easeInOutQuad', () => {
    it('should have correct boundary values', () => {
      expect(Easing.easeInOutQuad(0)).toBe(0);
      expect(Easing.easeInOutQuad(1)).toBe(1);
    });

    it('should be slower than linear at start and end', () => {
      expect(Easing.easeInOutQuad(0.25)).toBeLessThan(0.25);
      expect(Easing.easeInOutQuad(0.75)).toBeGreaterThan(0.75);
    });

    it('should be symmetric around midpoint', () => {
      const at25 = Easing.easeInOutQuad(0.25);
      const at75 = Easing.easeInOutQuad(0.75);
      expect(at25).toBeCloseTo(1 - at75, 5);
    });
  });

  describe('easeInCubic', () => {
    it('should have correct boundary values', () => {
      expect(Easing.easeInCubic(0)).toBe(0);
      expect(Easing.easeInCubic(1)).toBe(1);
    });

    it('should start slower than quadratic', () => {
      expect(Easing.easeInCubic(0.5)).toBe(0.125);
      expect(Easing.easeInCubic(0.5)).toBeLessThan(Easing.easeInQuad(0.5));
    });

    it('should accelerate smoothly', () => {
      const values = [0, 0.25, 0.5, 0.75, 1].map(t => Easing.easeInCubic(t));
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });
  });

  describe('easeOutCubic', () => {
    it('should have correct boundary values', () => {
      expect(Easing.easeOutCubic(0)).toBe(0);
      expect(Easing.easeOutCubic(1)).toBe(1);
    });

    it('should start faster than quadratic', () => {
      expect(Easing.easeOutCubic(0.5)).toBe(0.875);
      expect(Easing.easeOutCubic(0.5)).toBeGreaterThan(Easing.easeOutQuad(0.5));
    });

    it('should decelerate smoothly', () => {
      const deltas = [];
      const values = [0, 0.25, 0.5, 0.75, 1].map(t => Easing.easeOutCubic(t));
      for (let i = 1; i < values.length; i++) {
        deltas.push(values[i] - values[i - 1]);
      }
      // Each delta should be smaller than the previous (deceleration)
      for (let i = 1; i < deltas.length; i++) {
        expect(deltas[i]).toBeLessThan(deltas[i - 1]);
      }
    });
  });

  describe('easeInOutCubic', () => {
    it('should have correct boundary values', () => {
      expect(Easing.easeInOutCubic(0)).toBe(0);
      expect(Easing.easeInOutCubic(1)).toBe(1);
    });

    it('should be slower than cubic at start', () => {
      expect(Easing.easeInOutCubic(0.25)).toBeLessThan(0.25);
    });

    it('should be faster at middle', () => {
      expect(Easing.easeInOutCubic(0.5)).toBeCloseTo(0.5, 5);
    });

    it('should be slower than linear at end', () => {
      expect(Easing.easeInOutCubic(0.75)).toBeGreaterThan(0.75);
    });

    it('should be symmetric around midpoint', () => {
      const at25 = Easing.easeInOutCubic(0.25);
      const at75 = Easing.easeInOutCubic(0.75);
      expect(at25).toBeCloseTo(1 - at75, 5);
    });
  });

  describe('easing function comparison', () => {
    it('should have all functions return 0 at t=0', () => {
      expect(Easing.linear(0)).toBe(0);
      expect(Easing.easeInQuad(0)).toBe(0);
      expect(Easing.easeOutQuad(0)).toBe(0);
      expect(Easing.easeInOutQuad(0)).toBe(0);
      expect(Easing.easeInCubic(0)).toBe(0);
      expect(Easing.easeOutCubic(0)).toBe(0);
      expect(Easing.easeInOutCubic(0)).toBe(0);
    });

    it('should have all functions return 1 at t=1', () => {
      expect(Easing.linear(1)).toBe(1);
      expect(Easing.easeInQuad(1)).toBe(1);
      expect(Easing.easeOutQuad(1)).toBe(1);
      expect(Easing.easeInOutQuad(1)).toBe(1);
      expect(Easing.easeInCubic(1)).toBe(1);
      expect(Easing.easeOutCubic(1)).toBe(1);
      expect(Easing.easeInOutCubic(1)).toBe(1);
    });

    it('should have all functions be monotonically increasing', () => {
      const functions = [
        Easing.linear,
        Easing.easeInQuad,
        Easing.easeOutQuad,
        Easing.easeInOutQuad,
        Easing.easeInCubic,
        Easing.easeOutCubic,
        Easing.easeInOutCubic,
      ];

      functions.forEach(fn => {
        const values = [0, 0.25, 0.5, 0.75, 1].map(t => fn(t));
        for (let i = 1; i < values.length; i++) {
          expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
        }
      });
    });
  });
});
