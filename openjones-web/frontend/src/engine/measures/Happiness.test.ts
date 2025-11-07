/**
 * Unit tests for Happiness measure
 *
 * @author Worker 2
 * @date 2025-11-07
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Happiness } from './Happiness';
import { MeasureType, GAME_CONSTANTS } from '@shared/types/contracts';

describe('Happiness', () => {
  let happiness: Happiness;

  beforeEach(() => {
    happiness = new Happiness(60);
  });

  describe('constructor', () => {
    it('should initialize with default max happiness', () => {
      const h = new Happiness();
      expect(h.value).toBe(GAME_CONSTANTS.MAX_HAPPINESS);
    });

    it('should initialize with custom value', () => {
      expect(happiness.value).toBe(60);
    });

    it('should clamp to max happiness', () => {
      const h = new Happiness(150);
      expect(h.value).toBe(GAME_CONSTANTS.MAX_HAPPINESS);
    });

    it('should have correct type', () => {
      expect(happiness.type).toBe(MeasureType.HAPPINESS);
    });

    it('should have correct name', () => {
      expect(happiness.name).toBe('Happiness');
    });
  });

  describe('getStatus', () => {
    it('should return Ecstatic for 80+', () => {
      happiness.value = 85;
      expect(happiness.getStatus()).toBe('Ecstatic');
    });

    it('should return Happy for 60-79', () => {
      happiness.value = 70;
      expect(happiness.getStatus()).toBe('Happy');
    });

    it('should return Content for 40-59', () => {
      happiness.value = 50;
      expect(happiness.getStatus()).toBe('Content');
    });

    it('should return Unhappy for 20-39', () => {
      happiness.value = 30;
      expect(happiness.getStatus()).toBe('Unhappy');
    });

    it('should return Miserable for below 20', () => {
      happiness.value = 15;
      expect(happiness.getStatus()).toBe('Miserable');
    });
  });

  describe('isMiserable', () => {
    it('should return true when happiness is 20 or below', () => {
      happiness.value = 20;
      expect(happiness.isMiserable()).toBe(true);

      happiness.value = 10;
      expect(happiness.isMiserable()).toBe(true);
    });

    it('should return false when happiness is above 20', () => {
      happiness.value = 21;
      expect(happiness.isMiserable()).toBe(false);

      happiness.value = 60;
      expect(happiness.isMiserable()).toBe(false);
    });
  });

  describe('isHappy', () => {
    it('should return true when happiness is 60 or above', () => {
      happiness.value = 60;
      expect(happiness.isHappy()).toBe(true);

      happiness.value = 85;
      expect(happiness.isHappy()).toBe(true);
    });

    it('should return false when happiness is below 60', () => {
      happiness.value = 59;
      expect(happiness.isHappy()).toBe(false);

      happiness.value = 30;
      expect(happiness.isHappy()).toBe(false);
    });
  });

  describe('decay', () => {
    it('should apply decay if specified', () => {
      const h = new Happiness(100, 3);
      h.applyDecay();
      expect(h.value).toBe(97);
    });

    it('should not decay by default', () => {
      const h = new Happiness(100);
      h.applyDecay();
      expect(h.value).toBe(100);
    });
  });

  describe('clone', () => {
    it('should create independent copy', () => {
      const cloned = happiness.clone();
      expect(cloned.value).toBe(happiness.value);
      expect(cloned).toBeInstanceOf(Happiness);

      cloned.value = 40;
      expect(happiness.value).toBe(60);
      expect(cloned.value).toBe(40);
    });

    it('should preserve decay rate', () => {
      const h = new Happiness(100, 3);
      const cloned = h.clone();
      cloned.applyDecay();
      expect(cloned.value).toBe(97);
    });
  });

  describe('happiness operations', () => {
    it('should increase from relaxation', () => {
      happiness.value = 50;
      happiness.increase(20);
      expect(happiness.value).toBe(70);
    });

    it('should decrease from stress', () => {
      happiness.value = 75;
      happiness.decrease(25);
      expect(happiness.value).toBe(50);
    });

    it('should not exceed max', () => {
      happiness.value = 95;
      happiness.increase(20);
      expect(happiness.value).toBe(GAME_CONSTANTS.MAX_HAPPINESS);
    });

    it('should not go below zero', () => {
      happiness.value = 10;
      happiness.decrease(20);
      expect(happiness.value).toBe(0);
    });
  });
});
