/**
 * Unit tests for Education measure
 *
 * @author Worker 2
 * @date 2025-11-07
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Education } from './Education';
import { MeasureType, GAME_CONSTANTS } from '@shared/types/contracts';

describe('Education', () => {
  let education: Education;

  beforeEach(() => {
    education = new Education(40);
  });

  describe('constructor', () => {
    it('should initialize with 0 by default', () => {
      const e = new Education();
      expect(e.value).toBe(0);
    });

    it('should initialize with custom value', () => {
      expect(education.value).toBe(40);
    });

    it('should clamp to max education', () => {
      const e = new Education(150);
      expect(e.value).toBe(GAME_CONSTANTS.MAX_EDUCATION);
    });

    it('should have correct type', () => {
      expect(education.type).toBe(MeasureType.EDUCATION);
    });

    it('should have correct name', () => {
      expect(education.name).toBe('Education');
    });
  });

  describe('getStatus', () => {
    it('should return PhD Level for 90+', () => {
      education.value = 92;
      expect(education.getStatus()).toBe('PhD Level');
    });

    it('should return Masters Level for 75-89', () => {
      education.value = 80;
      expect(education.getStatus()).toBe('Masters Level');
    });

    it('should return Bachelors Level for 60-74', () => {
      education.value = 65;
      expect(education.getStatus()).toBe('Bachelors Level');
    });

    it('should return Some College for 40-59', () => {
      education.value = 50;
      expect(education.getStatus()).toBe('Some College');
    });

    it('should return High School for 20-39', () => {
      education.value = 30;
      expect(education.getStatus()).toBe('High School');
    });

    it('should return Basic for below 20', () => {
      education.value = 10;
      expect(education.getStatus()).toBe('Basic');
    });
  });

  describe('meetsRequirement', () => {
    it('should return true when education meets requirement', () => {
      education.value = 50;
      expect(education.meetsRequirement(50)).toBe(true);
      expect(education.meetsRequirement(40)).toBe(true);
    });

    it('should return false when education is below requirement', () => {
      education.value = 40;
      expect(education.meetsRequirement(50)).toBe(false);
    });
  });

  describe('getTier', () => {
    it('should return tier 5 for 80+', () => {
      education.value = 85;
      expect(education.getTier()).toBe(5);
    });

    it('should return tier 4 for 60-79', () => {
      education.value = 70;
      expect(education.getTier()).toBe(4);
    });

    it('should return tier 3 for 40-59', () => {
      education.value = 50;
      expect(education.getTier()).toBe(3);
    });

    it('should return tier 2 for 20-39', () => {
      education.value = 30;
      expect(education.getTier()).toBe(2);
    });

    it('should return tier 1 for below 20', () => {
      education.value = 10;
      expect(education.getTier()).toBe(1);
    });
  });

  describe('decay', () => {
    it('should not decay', () => {
      education.value = 50;
      const decay = education.applyDecay();
      expect(education.value).toBe(50);
      expect(decay).toBe(0);
    });
  });

  describe('clone', () => {
    it('should create independent copy', () => {
      const cloned = education.clone();
      expect(cloned.value).toBe(education.value);
      expect(cloned).toBeInstanceOf(Education);

      cloned.value = 60;
      expect(education.value).toBe(40);
      expect(cloned.value).toBe(60);
    });
  });

  describe('education operations', () => {
    it('should increase from studying', () => {
      education.value = 40;
      education.increase(15);
      expect(education.value).toBe(55);
    });

    it('should not exceed max', () => {
      education.value = 95;
      education.increase(20);
      expect(education.value).toBe(GAME_CONSTANTS.MAX_EDUCATION);
    });

    it('should not decrease below zero', () => {
      education.value = 5;
      education.decrease(10);
      expect(education.value).toBe(0);
    });

    it('should be a permanent investment (no decay)', () => {
      education.value = 50;
      for (let i = 0; i < 10; i++) {
        education.applyDecay();
      }
      expect(education.value).toBe(50);
    });
  });
});
