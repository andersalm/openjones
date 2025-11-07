/**
 * Unit tests for Health measure
 *
 * @author Worker 2
 * @date 2025-11-07
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Health } from './Health';
import { MeasureType, GAME_CONSTANTS } from '@shared/types/contracts';

describe('Health', () => {
  let health: Health;

  beforeEach(() => {
    health = new Health(75);
  });

  describe('constructor', () => {
    it('should initialize with default max health', () => {
      const h = new Health();
      expect(h.value).toBe(GAME_CONSTANTS.MAX_HEALTH);
    });

    it('should initialize with custom value', () => {
      expect(health.value).toBe(75);
    });

    it('should clamp to max health', () => {
      const h = new Health(150);
      expect(h.value).toBe(GAME_CONSTANTS.MAX_HEALTH);
    });

    it('should have correct type', () => {
      expect(health.type).toBe(MeasureType.HEALTH);
    });

    it('should have correct name', () => {
      expect(health.name).toBe('Health');
    });
  });

  describe('getStatus', () => {
    it('should return Excellent for 80+', () => {
      health.value = 85;
      expect(health.getStatus()).toBe('Excellent');
    });

    it('should return Good for 60-79', () => {
      health.value = 70;
      expect(health.getStatus()).toBe('Good');
    });

    it('should return Fair for 40-59', () => {
      health.value = 50;
      expect(health.getStatus()).toBe('Fair');
    });

    it('should return Poor for 20-39', () => {
      health.value = 30;
      expect(health.getStatus()).toBe('Poor');
    });

    it('should return Critical for below 20', () => {
      health.value = 15;
      expect(health.getStatus()).toBe('Critical');
    });
  });

  describe('isCritical', () => {
    it('should return true when health is 20 or below', () => {
      health.value = 20;
      expect(health.isCritical()).toBe(true);

      health.value = 15;
      expect(health.isCritical()).toBe(true);
    });

    it('should return false when health is above 20', () => {
      health.value = 21;
      expect(health.isCritical()).toBe(false);

      health.value = 75;
      expect(health.isCritical()).toBe(false);
    });
  });

  describe('canWorkHard', () => {
    it('should return true when health is 40 or above', () => {
      health.value = 40;
      expect(health.canWorkHard()).toBe(true);

      health.value = 75;
      expect(health.canWorkHard()).toBe(true);
    });

    it('should return false when health is below 40', () => {
      health.value = 39;
      expect(health.canWorkHard()).toBe(false);

      health.value = 20;
      expect(health.canWorkHard()).toBe(false);
    });
  });

  describe('decay', () => {
    it('should apply decay if specified', () => {
      const h = new Health(100, 5);
      h.applyDecay();
      expect(h.value).toBe(95);
    });

    it('should not decay by default', () => {
      const h = new Health(100);
      h.applyDecay();
      expect(h.value).toBe(100);
    });
  });

  describe('clone', () => {
    it('should create independent copy', () => {
      const cloned = health.clone();
      expect(cloned.value).toBe(health.value);
      expect(cloned).toBeInstanceOf(Health);

      cloned.value = 50;
      expect(health.value).toBe(75);
      expect(cloned.value).toBe(50);
    });

    it('should preserve decay rate', () => {
      const h = new Health(100, 5);
      const cloned = h.clone();
      cloned.applyDecay();
      expect(cloned.value).toBe(95);
    });
  });

  describe('health operations', () => {
    it('should increase from rest', () => {
      health.value = 50;
      health.increase(20);
      expect(health.value).toBe(70);
    });

    it('should decrease from work', () => {
      health.value = 75;
      health.decrease(15);
      expect(health.value).toBe(60);
    });

    it('should not exceed max', () => {
      health.value = 95;
      health.increase(20);
      expect(health.value).toBe(GAME_CONSTANTS.MAX_HEALTH);
    });

    it('should not go below zero', () => {
      health.value = 10;
      health.decrease(20);
      expect(health.value).toBe(0);
    });
  });
});
