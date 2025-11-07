/**
 * Unit tests for Career measure
 *
 * @author Worker 2
 * @date 2025-11-07
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Career } from './Career';
import { MeasureType } from '@shared/types/contracts';

describe('Career', () => {
  let career: Career;

  beforeEach(() => {
    career = new Career(100);
  });

  describe('constructor', () => {
    it('should initialize with 0 by default', () => {
      const c = new Career();
      expect(c.value).toBe(0);
    });

    it('should initialize with custom value', () => {
      expect(career.value).toBe(100);
    });

    it('should have no upper limit', () => {
      const c = new Career(10000);
      expect(c.value).toBe(10000);
    });

    it('should have correct type', () => {
      expect(career.type).toBe(MeasureType.CAREER);
    });

    it('should have correct name', () => {
      expect(career.name).toBe('Career');
    });
  });

  describe('getStatus', () => {
    it('should return Industry Expert for 1000+', () => {
      career.value = 1200;
      expect(career.getStatus()).toBe('Industry Expert');
    });

    it('should return Senior Professional for 500-999', () => {
      career.value = 750;
      expect(career.getStatus()).toBe('Senior Professional');
    });

    it('should return Experienced for 250-499', () => {
      career.value = 350;
      expect(career.getStatus()).toBe('Experienced');
    });

    it('should return Intermediate for 100-249', () => {
      career.value = 150;
      expect(career.getStatus()).toBe('Intermediate');
    });

    it('should return Junior for 25-99', () => {
      career.value = 50;
      expect(career.getStatus()).toBe('Junior');
    });

    it('should return Entry Level for below 25', () => {
      career.value = 10;
      expect(career.getStatus()).toBe('Entry Level');
    });
  });

  describe('getLevel', () => {
    it('should calculate level based on experience', () => {
      career.value = 0;
      expect(career.getLevel()).toBe(1);

      career.value = 50;
      expect(career.getLevel()).toBe(1);

      career.value = 100;
      expect(career.getLevel()).toBe(2);

      career.value = 250;
      expect(career.getLevel()).toBe(3);

      career.value = 500;
      expect(career.getLevel()).toBe(6);
    });
  });

  describe('meetsThreshold', () => {
    it('should return true when career meets threshold', () => {
      career.value = 150;
      expect(career.meetsThreshold(150)).toBe(true);
      expect(career.meetsThreshold(100)).toBe(true);
    });

    it('should return false when career is below threshold', () => {
      career.value = 100;
      expect(career.meetsThreshold(150)).toBe(false);
    });
  });

  describe('getPercentage', () => {
    it('should return 0 for unbounded measure', () => {
      expect(career.getPercentage()).toBe(0);
    });
  });

  describe('decay', () => {
    it('should not decay', () => {
      career.value = 250;
      const decay = career.applyDecay();
      expect(career.value).toBe(250);
      expect(decay).toBe(0);
    });
  });

  describe('clone', () => {
    it('should create independent copy', () => {
      const cloned = career.clone();
      expect(cloned.value).toBe(career.value);
      expect(cloned).toBeInstanceOf(Career);

      cloned.value = 200;
      expect(career.value).toBe(100);
      expect(cloned.value).toBe(200);
    });
  });

  describe('career operations', () => {
    it('should increase from work experience', () => {
      career.value = 100;
      career.increase(50);
      expect(career.value).toBe(150);
    });

    it('should grow without limit', () => {
      career.value = 5000;
      career.increase(1000);
      expect(career.value).toBe(6000);
    });

    it('should not go below zero', () => {
      career.value = 50;
      career.decrease(100);
      expect(career.value).toBe(0);
    });

    it('should accumulate over time', () => {
      const c = new Career(0);
      for (let i = 0; i < 20; i++) {
        c.increase(10);
      }
      expect(c.value).toBe(200);
    });
  });
});
