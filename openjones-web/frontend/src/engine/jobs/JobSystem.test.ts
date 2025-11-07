/**
 * JobSystem Tests
 *
 * Part of Task B3: Job System
 * Worker 3 - Track B (Domain Logic)
 *
 * Comprehensive tests for the job system including:
 * - Job definitions
 * - Job application logic
 * - Requirement validation
 * - Wage calculations
 * - Experience calculations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JobSystem, JOB_DEFINITIONS } from './JobSystem';
import { PlayerState } from '../game/PlayerState';
import { BuildingType, PossessionType } from '../../../../shared/types/contracts';
import { Position } from '../types/Position';

describe('JobSystem', () => {
  let jobSystem: JobSystem;
  let player: PlayerState;

  beforeEach(() => {
    jobSystem = new JobSystem();
    player = new PlayerState({
      playerId: 'test-player',
      cash: 1000,
      health: 100,
      happiness: 100,
      education: 50,
      position: new Position(0, 0),
    });
  });

  describe('Job Definitions', () => {
    it('should have all job definitions loaded', () => {
      const jobs = jobSystem.getAvailableJobs();
      expect(jobs.length).toBeGreaterThan(0);
      expect(jobs.length).toBe(JOB_DEFINITIONS.length);
    });

    it('should include unemployed job', () => {
      const unemployed = jobSystem.getUnemployedJob();
      expect(unemployed).toBeDefined();
      expect(unemployed.id).toBe('unemployed');
      expect(unemployed.rank).toBe(0);
      expect(unemployed.wagePerHour).toBe(0);
    });

    it('should have factory jobs for all ranks 1-8', () => {
      const factoryJobs = jobSystem.getAvailableJobs(BuildingType.FACTORY);
      expect(factoryJobs.length).toBe(9); // 9 factory jobs

      // Check some specific jobs
      const janitor = factoryJobs.find((j) => j.id === 'factory-janitor');
      expect(janitor).toBeDefined();
      expect(janitor?.rank).toBe(1);
      expect(janitor?.wagePerHour).toBe(6);

      const generalManager = factoryJobs.find((j) => j.id === 'factory-general-manager');
      expect(generalManager).toBeDefined();
      expect(generalManager?.rank).toBe(8);
      expect(generalManager?.wagePerHour).toBe(25);
    });

    it('should have restaurant jobs for ranks 1-4', () => {
      const restaurantJobs = jobSystem.getAvailableJobs(BuildingType.RESTAURANT);
      expect(restaurantJobs.length).toBe(4);

      const cook = restaurantJobs.find((j) => j.id === 'restaurant-cook');
      expect(cook).toBeDefined();
      expect(cook?.rank).toBe(1);
      expect(cook?.requiredExperience).toBe(0); // Special case: cook needs 0 experience
    });

    it('should have college jobs for ranks 1, 4, 9', () => {
      const collegeJobs = jobSystem.getAvailableJobs(BuildingType.COLLEGE);
      expect(collegeJobs.length).toBe(3);

      const ranks = collegeJobs.map((j) => j.rank);
      expect(ranks).toContain(1);
      expect(ranks).toContain(4);
      expect(ranks).toContain(9);

      const professor = collegeJobs.find((j) => j.id === 'college-professor');
      expect(professor?.wagePerHour).toBe(27);
    });

    it('should have clothes store jobs for ranks 2-4', () => {
      const clothesJobs = jobSystem.getAvailableJobs(BuildingType.CLOTHES_STORE);
      expect(clothesJobs.length).toBe(3);

      const ranks = clothesJobs.map((j) => j.rank);
      expect(ranks).toContain(2);
      expect(ranks).toContain(3);
      expect(ranks).toContain(4);
    });

    it('should have proper education requirements (5 * rank)', () => {
      const factorySecretary = jobSystem.getJobById('factory-secretary');
      expect(factorySecretary?.rank).toBe(2);
      expect(factorySecretary?.requiredEducation).toBe(10); // 5 * 2

      const generalManager = jobSystem.getJobById('factory-general-manager');
      expect(generalManager?.rank).toBe(8);
      expect(generalManager?.requiredEducation).toBe(40); // 5 * 8
    });

    it('should have proper experience requirements (10 * rank)', () => {
      const janitor = jobSystem.getJobById('factory-janitor');
      expect(janitor?.rank).toBe(1);
      expect(janitor?.requiredExperience).toBe(10); // 10 * 1

      const engineer = jobSystem.getJobById('factory-engineer');
      expect(engineer?.rank).toBe(7);
      expect(engineer?.requiredExperience).toBe(70); // 10 * 7
    });
  });

  describe('getAvailableJobs', () => {
    it('should return all jobs when no filter provided', () => {
      const jobs = jobSystem.getAvailableJobs();
      expect(jobs.length).toBe(JOB_DEFINITIONS.length);
    });

    it('should filter jobs by building type', () => {
      const factoryJobs = jobSystem.getAvailableJobs(BuildingType.FACTORY);
      expect(factoryJobs.every((j) => j.buildingType === BuildingType.FACTORY)).toBe(true);

      const restaurantJobs = jobSystem.getAvailableJobs(BuildingType.RESTAURANT);
      expect(restaurantJobs.every((j) => j.buildingType === BuildingType.RESTAURANT)).toBe(true);
    });

    it('should return empty array for building type with no jobs', () => {
      const bankJobs = jobSystem.getAvailableJobs(BuildingType.BANK);
      expect(bankJobs.length).toBe(0);
    });
  });

  describe('getJobById', () => {
    it('should return job when found', () => {
      const job = jobSystem.getJobById('factory-janitor');
      expect(job).toBeDefined();
      expect(job?.title).toBe('Janitor');
    });

    it('should return null when job not found', () => {
      const job = jobSystem.getJobById('nonexistent-job');
      expect(job).toBeNull();
    });
  });

  describe('getJobsByRank', () => {
    it('should return all jobs for a specific rank', () => {
      const rank1Jobs = jobSystem.getJobsByRank(1);
      expect(rank1Jobs.length).toBeGreaterThan(0);
      expect(rank1Jobs.every((j) => j.rank === 1)).toBe(true);
    });

    it('should return empty array for rank with no jobs', () => {
      const rank0Jobs = jobSystem.getJobsByRank(0);
      expect(rank0Jobs.length).toBe(1); // Only unemployed
      expect(rank0Jobs[0].id).toBe('unemployed');
    });
  });

  describe('applyForJob - Success Cases', () => {
    it('should allow applying for a job when all requirements are met', () => {
      // Set up player with requirements for factory janitor
      player.education = 5;
      player.addExperience(1, 10);
      player.addPossession({
        id: 'casual-clothes',
        type: PossessionType.CLOTHES,
        name: 'Casual Clothes',
        value: 50,
        purchasePrice: 50,
        clothesLevel: 1,
        effects: [],
      });

      const result = jobSystem.applyForJob(player, 'factory-janitor');

      expect(result.success).toBe(true);
      expect(result.job).toBeDefined();
      expect(result.job?.id).toBe('factory-janitor');
      expect(result.message).toContain('Congratulations');
    });

    it('should allow applying for cook with 0 experience (special case)', () => {
      player.education = 5;
      player.addPossession({
        id: 'casual-clothes',
        type: PossessionType.CLOTHES,
        name: 'Casual Clothes',
        value: 50,
        purchasePrice: 50,
        clothesLevel: 1,
        effects: [],
      });

      const result = jobSystem.applyForJob(player, 'restaurant-cook');

      expect(result.success).toBe(true);
      expect(result.job?.id).toBe('restaurant-cook');
    });

    it('should accept experience from one rank below (LOWER_EXPERIENCE_RANKS_ACCEPTABLE)', () => {
      // Apply for rank 2 job with experience at rank 1
      player.education = 10;
      player.addExperience(1, 20); // Enough experience at rank 1
      player.addPossession({
        id: 'casual-clothes',
        type: PossessionType.CLOTHES,
        name: 'Casual Clothes',
        value: 50,
        purchasePrice: 50,
        clothesLevel: 1,
        effects: [],
      });

      const result = jobSystem.applyForJob(player, 'restaurant-clerk');

      expect(result.success).toBe(true);
      expect(result.job?.rank).toBe(2);
    });

    it('should allow applying for higher rank job with exact rank experience', () => {
      player.education = 40;
      player.addExperience(8, 80);
      player.addPossession({
        id: 'business-suit',
        type: PossessionType.CLOTHES,
        name: 'Business Suit',
        value: 200,
        purchasePrice: 200,
        clothesLevel: 3,
        effects: [],
      });

      const result = jobSystem.applyForJob(player, 'factory-general-manager');

      expect(result.success).toBe(true);
      expect(result.job?.rank).toBe(8);
    });
  });

  describe('applyForJob - Failure Cases', () => {
    it('should fail when job does not exist', () => {
      const result = jobSystem.applyForJob(player, 'nonexistent-job');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should fail when player already has the job', () => {
      const job = jobSystem.getJobById('factory-janitor');
      player.job = job;

      const result = jobSystem.applyForJob(player, 'factory-janitor');

      expect(result.success).toBe(false);
      expect(result.message).toContain('already have');
    });

    it('should fail when education requirement not met', () => {
      player.education = 3; // Need 5
      player.addExperience(1, 10);
      player.addPossession({
        id: 'casual-clothes',
        type: PossessionType.CLOTHES,
        name: 'Casual Clothes',
        value: 50,
        purchasePrice: 50,
        clothesLevel: 1,
        effects: [],
      });

      const result = jobSystem.applyForJob(player, 'factory-janitor');

      expect(result.success).toBe(false);
      expect(result.failedRequirements).toBeDefined();
      expect(result.failedRequirements?.some((r) => r.includes('Education'))).toBe(true);
    });

    it('should fail when experience requirement not met', () => {
      player.education = 10;
      player.addExperience(2, 5); // Need 20
      player.addPossession({
        id: 'casual-clothes',
        type: PossessionType.CLOTHES,
        name: 'Casual Clothes',
        value: 50,
        purchasePrice: 50,
        clothesLevel: 1,
        effects: [],
      });

      const result = jobSystem.applyForJob(player, 'restaurant-clerk');

      expect(result.success).toBe(false);
      expect(result.failedRequirements?.some((r) => r.includes('Experience'))).toBe(true);
    });

    it('should fail when clothes level requirement not met', () => {
      player.education = 20;
      player.addExperience(4, 40);
      player.addPossession({
        id: 'casual-clothes',
        type: PossessionType.CLOTHES,
        name: 'Casual Clothes',
        value: 50,
        purchasePrice: 50,
        clothesLevel: 1, // Need level 3
        effects: [],
      });

      const result = jobSystem.applyForJob(player, 'factory-executive-secretary');

      expect(result.success).toBe(false);
      expect(result.failedRequirements?.some((r) => r.includes('Clothes'))).toBe(true);
    });

    it('should fail when no clothes at all', () => {
      player.education = 5;
      player.addExperience(1, 10);
      // No clothes

      const result = jobSystem.applyForJob(player, 'factory-janitor');

      expect(result.success).toBe(false);
      expect(result.failedRequirements?.some((r) => r.includes('Clothes'))).toBe(true);
    });

    it('should fail when multiple requirements not met', () => {
      player.education = 0;
      player.experience = [];
      // No clothes

      const result = jobSystem.applyForJob(player, 'factory-general-manager');

      expect(result.success).toBe(false);
      expect(result.failedRequirements?.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('quitJob', () => {
    it('should allow quitting a job', () => {
      const job = jobSystem.getJobById('factory-janitor');
      player.job = job;

      const result = jobSystem.quitJob(player);

      expect(result.success).toBe(true);
      expect(result.message).toContain('quit');
      expect(result.job?.id).toBe('unemployed');
    });

    it('should fail when already unemployed', () => {
      player.job = null;

      const result = jobSystem.quitJob(player);

      expect(result.success).toBe(false);
      expect(result.message).toContain('already unemployed');
    });

    it('should fail when job is unemployed', () => {
      player.job = jobSystem.getUnemployedJob();

      const result = jobSystem.quitJob(player);

      expect(result.success).toBe(false);
      expect(result.message).toContain('already unemployed');
    });
  });

  describe('validateJobRequirements', () => {
    it('should validate all requirements correctly', () => {
      player.education = 10;
      player.addExperience(2, 20);
      player.addPossession({
        id: 'casual-clothes',
        type: PossessionType.CLOTHES,
        name: 'Casual Clothes',
        value: 50,
        purchasePrice: 50,
        clothesLevel: 1,
        effects: [],
      });

      const job = jobSystem.getJobById('restaurant-clerk');
      const validation = jobSystem.validateJobRequirements(player, job!);

      expect(validation.success).toBe(true);
      expect(validation.failedRequirements.length).toBe(0);
    });

    it('should report all failed requirements', () => {
      player.education = 0;
      player.experience = [];
      // No clothes

      const job = jobSystem.getJobById('factory-janitor');
      const validation = jobSystem.validateJobRequirements(player, job!);

      expect(validation.success).toBe(false);
      expect(validation.failedRequirements.length).toBe(3);
    });
  });

  describe('calculateWage', () => {
    it('should calculate wage correctly for 8 hours', () => {
      const job = jobSystem.getJobById('factory-janitor');
      const wage = jobSystem.calculateWage(job!, 8);

      expect(wage).toBe(48); // 6 * 8
    });

    it('should calculate wage for different job ranks', () => {
      const generalManager = jobSystem.getJobById('factory-general-manager');
      const wage = jobSystem.calculateWage(generalManager!, 10);

      expect(wage).toBe(250); // 25 * 10
    });

    it('should calculate wage for professor', () => {
      const professor = jobSystem.getJobById('college-professor');
      const wage = jobSystem.calculateWage(professor!, 5);

      expect(wage).toBe(135); // 27 * 5
    });

    it('should return 0 for unemployed', () => {
      const unemployed = jobSystem.getUnemployedJob();
      const wage = jobSystem.calculateWage(unemployed, 8);

      expect(wage).toBe(0);
    });
  });

  describe('calculateExperienceGain', () => {
    it('should calculate experience gain correctly', () => {
      const job = jobSystem.getJobById('factory-janitor');
      const exp = jobSystem.calculateExperienceGain(job!, 8);

      expect(exp).toBe(8); // 1 * 8
    });

    it('should calculate experience for different hours', () => {
      const job = jobSystem.getJobById('restaurant-cook');
      const exp = jobSystem.calculateExperienceGain(job!, 40);

      expect(exp).toBe(40); // 1 * 40
    });

    it('should return 0 for unemployed', () => {
      const unemployed = jobSystem.getUnemployedJob();
      const exp = jobSystem.calculateExperienceGain(unemployed, 8);

      expect(exp).toBe(0);
    });
  });

  describe('getQualifiedJobs', () => {
    it('should return all jobs player qualifies for', () => {
      player.education = 20;
      player.addExperience(1, 50);
      player.addPossession({
        id: 'business-suit',
        type: PossessionType.CLOTHES,
        name: 'Business Suit',
        value: 200,
        purchasePrice: 200,
        clothesLevel: 3,
        effects: [],
      });

      const qualifiedJobs = jobSystem.getQualifiedJobs(player);

      expect(qualifiedJobs.length).toBeGreaterThan(0);
      expect(qualifiedJobs.every((job) => {
        const validation = jobSystem.validateJobRequirements(player, job);
        return validation.success;
      })).toBe(true);
    });

    it('should return empty array when no qualifications', () => {
      player.education = 0;
      player.experience = [];
      // No clothes

      const qualifiedJobs = jobSystem.getQualifiedJobs(player);

      expect(qualifiedJobs.length).toBe(0);
    });
  });

  describe('getBestQualifiedJob', () => {
    it('should return highest paying job player qualifies for', () => {
      player.education = 50;
      player.addExperience(1, 100);
      player.addExperience(2, 100);
      player.addExperience(3, 100);
      player.addPossession({
        id: 'business-suit',
        type: PossessionType.CLOTHES,
        name: 'Business Suit',
        value: 200,
        purchasePrice: 200,
        clothesLevel: 3,
        effects: [],
      });

      const bestJob = jobSystem.getBestQualifiedJob(player);

      expect(bestJob).toBeDefined();

      // Should be one of the higher paying jobs the player qualifies for
      const qualifiedJobs = jobSystem.getQualifiedJobs(player);
      const highestWage = Math.max(...qualifiedJobs.map((j) => j.wagePerHour));
      expect(bestJob?.wagePerHour).toBe(highestWage);
    });

    it('should return null when player qualifies for no jobs', () => {
      player.education = 0;
      player.experience = [];

      const bestJob = jobSystem.getBestQualifiedJob(player);

      expect(bestJob).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle player with experience at multiple ranks', () => {
      player.education = 20;
      player.addExperience(1, 30);
      player.addExperience(2, 40);
      player.addExperience(3, 50);
      player.addPossession({
        id: 'dress-clothes',
        type: PossessionType.CLOTHES,
        name: 'Dress Clothes',
        value: 100,
        purchasePrice: 100,
        clothesLevel: 2,
        effects: [],
      });

      const result = jobSystem.applyForJob(player, 'factory-machinist-helper');

      expect(result.success).toBe(true);
    });

    it('should use best clothes level when player has multiple clothes', () => {
      player.education = 20;
      player.addExperience(4, 40);
      player.addPossession({
        id: 'casual-clothes',
        type: PossessionType.CLOTHES,
        name: 'Casual Clothes',
        value: 50,
        purchasePrice: 50,
        clothesLevel: 1,
        effects: [],
      });
      player.addPossession({
        id: 'business-suit',
        type: PossessionType.CLOTHES,
        name: 'Business Suit',
        value: 200,
        purchasePrice: 200,
        clothesLevel: 3,
        effects: [],
      });

      const result = jobSystem.applyForJob(player, 'factory-executive-secretary');

      expect(result.success).toBe(true);
    });

    it('should handle jobs with same rank in different buildings', () => {
      const rank1Jobs = jobSystem.getJobsByRank(1);
      expect(rank1Jobs.length).toBeGreaterThan(1);

      const buildingTypes = new Set(rank1Jobs.map((j) => j.buildingType));
      expect(buildingTypes.size).toBeGreaterThan(1);
    });
  });
});
