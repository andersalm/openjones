/**
 * Tests for Factory building
 *
 * Part of Task B7: Core Buildings (Factory, College, Bank)
 * Worker 2 - Track B (Domain Logic)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Factory } from './Factory';
import { Position } from '../types/Position';
import { PlayerState } from '../game/PlayerState';
import {
  IPlayerState,
  IGame,
  BuildingType,
  ActionType,
} from '../../../../shared/types/contracts';

/**
 * Helper to create a mock player state for testing
 */
function createMockPlayer(overrides: Partial<IPlayerState> = {}): IPlayerState {
  return new PlayerState({
    playerId: 'test-player',
    cash: 1000,
    health: 100,
    happiness: 80,
    education: 50,
    career: 0,
    position: new Position(2, 2),
    currentBuilding: null,
    job: null,
    experience: [
      { rank: 1, points: 20 },
      { rank: 2, points: 30 },
    ],
    possessions: [],
    rentedHome: null,
    rentDebt: 0,
    ...overrides,
  });
}

/**
 * Helper to create a mock game instance
 */
function createMockGame(): IGame {
  return {
    id: 'test-game',
    currentWeek: 1,
    timeUnitsRemaining: 600,
    currentPlayerIndex: 0,
    players: [],
    map: null as any,
    economyModel: null as any,
    victoryConditions: {
      targetWealth: 10000,
      targetHealth: 80,
      targetHappiness: 80,
      targetCareer: 100,
      targetEducation: 80,
    },
    isGameOver: false,
    initialize: () => {},
    processTurn: () => ({
      success: true,
      message: 'Turn processed',
      timeSpent: 0,
      stateChanges: [],
    }),
    advanceTime: () => {},
    nextPlayer: () => {},
    getCurrentPlayer: () => null as any,
    checkVictory: () => [],
    serialize: () => '',
    deserialize: () => {},
    getPlayerById: () => null,
    applyStateChanges: () => {},
  };
}

describe('Factory Building', () => {
  let factory: Factory;
  let player: IPlayerState;
  let game: IGame;
  const testPosition = new Position(1, 1);

  beforeEach(() => {
    factory = new Factory('factory-1', 'Main Factory', testPosition);
    player = createMockPlayer();
    game = createMockGame();
  });

  describe('Constructor and Properties', () => {
    it('should initialize with correct properties', () => {
      expect(factory.id).toBe('factory-1');
      expect(factory.type).toBe(BuildingType.FACTORY);
      expect(factory.name).toBe('Main Factory');
      expect(factory.description).toContain('Industrial factory');
      expect(factory.position).toBe(testPosition);
    });

    it('should not be a home', () => {
      expect(factory.isHome()).toBe(false);
    });
  });

  describe('Job Offerings', () => {
    it('should offer 9 different jobs', () => {
      const jobs = factory.getJobOfferings();
      expect(jobs).toHaveLength(9);
    });

    it('should offer jobs for ranks 1-8', () => {
      const jobs = factory.getJobOfferings();
      const ranks = jobs.map((j) => j.rank);

      expect(ranks).toContain(1);
      expect(ranks).toContain(2);
      expect(ranks).toContain(3);
      expect(ranks).toContain(4);
      expect(ranks).toContain(5);
      expect(ranks).toContain(6);
      expect(ranks).toContain(7);
      expect(ranks).toContain(8);
    });

    it('should have correct job titles for rank 1', () => {
      const jobs = factory.getJobOfferings();
      const rank1Jobs = jobs.filter((j) => j.rank === 1);

      expect(rank1Jobs).toHaveLength(2);
      const titles = rank1Jobs.map((j) => j.title);
      expect(titles).toContain('Janitor');
      expect(titles).toContain('Assembly Worker');
    });

    it('should have correct wages for entry-level jobs', () => {
      const jobs = factory.getJobOfferings();
      const janitor = jobs.find((j) => j.title === 'Janitor');
      const assemblyWorker = jobs.find((j) => j.title === 'Assembly Worker');

      expect(janitor?.wagePerHour).toBe(6);
      expect(assemblyWorker?.wagePerHour).toBe(7);
    });

    it('should have correct wages for management jobs', () => {
      const jobs = factory.getJobOfferings();
      const departmentManager = jobs.find((j) => j.title === 'Department Manager');
      const generalManager = jobs.find((j) => j.title === 'General Manager');

      expect(departmentManager?.wagePerHour).toBe(21);
      expect(generalManager?.wagePerHour).toBe(25);
    });

    it('should have correct education requirements based on rank', () => {
      const jobs = factory.getJobOfferings();

      jobs.forEach((job) => {
        // Education requirement = rank * 5
        expect(job.requiredEducation).toBe(job.rank * 5);
      });
    });

    it('should have correct experience requirements based on rank', () => {
      const jobs = factory.getJobOfferings();

      jobs.forEach((job) => {
        // Experience requirement = rank * 10
        expect(job.requiredExperience).toBe(job.rank * 10);
      });
    });

    it('should have appropriate clothes level requirements', () => {
      const jobs = factory.getJobOfferings();

      jobs.forEach((job) => {
        expect(job.requiredClothesLevel).toBeGreaterThanOrEqual(1);
        expect(job.requiredClothesLevel).toBeLessThanOrEqual(3);
      });
    });

    it('should have all jobs with FACTORY building type', () => {
      const jobs = factory.getJobOfferings();

      jobs.forEach((job) => {
        expect(job.buildingType).toBe(BuildingType.FACTORY);
      });
    });

    it('should include all expected job titles', () => {
      const jobs = factory.getJobOfferings();
      const titles = jobs.map((j) => j.title);

      expect(titles).toContain('Janitor');
      expect(titles).toContain('Assembly Worker');
      expect(titles).toContain('Secretary');
      expect(titles).toContain('Machinist Helper');
      expect(titles).toContain('Executive Secretary');
      expect(titles).toContain('Machinist');
      expect(titles).toContain('Department Manager');
      expect(titles).toContain('Engineer');
      expect(titles).toContain('General Manager');
    });

    it('should return a copy of jobs array', () => {
      const jobs1 = factory.getJobOfferings();
      const jobs2 = factory.getJobOfferings();

      expect(jobs1).not.toBe(jobs2); // Different array instances
      expect(jobs1).toEqual(jobs2); // Same content
    });
  });

  describe('Available Actions', () => {
    it('should return empty array when player is outside', () => {
      const playerOutside = createMockPlayer({ currentBuilding: null });
      const actions = factory.getAvailableActions(playerOutside, game);

      expect(actions).toHaveLength(0);
    });

    it('should return exit action when player is inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'factory-1' });
      const actions = factory.getAvailableActions(playerInside, game);

      expect(actions.length).toBeGreaterThan(0);
      const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);
      expect(exitAction).toBeDefined();
    });

    it('should have exit action with correct properties', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'factory-1' });
      const actions = factory.getAvailableActions(playerInside, game);
      const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);

      expect(exitAction?.displayName).toContain('Exit');
      expect(exitAction?.timeCost).toBe(0);
      expect(exitAction?.canExecute(playerInside, game)).toBe(true);
    });
  });

  describe('Exit Action', () => {
    it('should successfully exit when inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'factory-1' });
      const actions = factory.getAvailableActions(playerInside, game);
      const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);

      const result = exitAction!.execute(playerInside, game);

      expect(result.success).toBe(true);
      expect(result.timeSpent).toBe(0);
      expect(result.message).toContain('exit');
    });

    it('should fail to exit when not inside', () => {
      const playerOutside = createMockPlayer({ currentBuilding: null });
      const actions = factory.getAvailableActions(playerOutside, game);

      // Create exit action manually to test failure case
      if (actions.length === 0) {
        const playerInside = createMockPlayer({ currentBuilding: 'factory-1' });
        const actionsInside = factory.getAvailableActions(playerInside, game);
        const exitAction = actionsInside.find((a) => a.type === ActionType.EXIT_BUILDING);

        const result = exitAction!.execute(playerOutside, game);
        expect(result.success).toBe(false);
      }
    });

    it('should update player position in state changes', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'factory-1' });
      const actions = factory.getAvailableActions(playerInside, game);
      const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);

      const result = exitAction!.execute(playerInside, game);

      expect(result.stateChanges).toHaveLength(1);
      expect(result.stateChanges[0].type).toBe('position');
      expect(result.stateChanges[0].value).toBe(testPosition);
    });
  });

  describe('Action Tree', () => {
    it('should create valid action tree when player is inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'factory-1' });
      const tree = factory.getActionTree(playerInside, game);

      expect(tree).toBeDefined();
      expect(tree.action).toBeDefined();
      expect(tree.index).toBe(0);
    });

    it('should have action tree with exit action', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'factory-1' });
      const tree = factory.getActionTree(playerInside, game);

      expect(tree.action.type).toBe(ActionType.EXIT_BUILDING);
    });

    it('should work when player is outside (fallback)', () => {
      const playerOutside = createMockPlayer({ currentBuilding: null });
      const tree = factory.getActionTree(playerOutside, game);

      expect(tree).toBeDefined();
      expect(tree.action).toBeDefined();
    });
  });

  describe('Building Entry', () => {
    it('should allow all players to enter by default', () => {
      expect(factory.canEnter(player)).toBe(true);
    });

    it('should correctly identify player position', () => {
      const playerAtFactory = createMockPlayer({
        position: new Position(1, 1),
      });
      expect(factory.isPlayerAtPosition(playerAtFactory)).toBe(true);

      const playerAway = createMockPlayer({
        position: new Position(3, 3),
      });
      expect(factory.isPlayerAtPosition(playerAway)).toBe(false);
    });

    it('should correctly identify if player is inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'factory-1' });
      expect(factory.isPlayerInside(playerInside)).toBe(true);

      const playerOutside = createMockPlayer({ currentBuilding: null });
      expect(factory.isPlayerInside(playerOutside)).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should work with complete game scenario', () => {
      // Create factory
      const myFactory = new Factory('factory-main', 'City Factory', new Position(2, 2));

      // Player approaches factory
      const gamePlayer = createMockPlayer({
        position: new Position(2, 2),
        currentBuilding: null,
      });

      // Check player can enter
      expect(myFactory.canEnter(gamePlayer)).toBe(true);
      expect(myFactory.isPlayerAtPosition(gamePlayer)).toBe(true);

      // Get job offerings
      const jobs = myFactory.getJobOfferings();
      expect(jobs.length).toBeGreaterThan(0);

      // Player enters building
      gamePlayer.currentBuilding = 'factory-main';
      expect(myFactory.isPlayerInside(gamePlayer)).toBe(true);

      // Get available actions
      const actions = myFactory.getAvailableActions(gamePlayer, game);
      expect(actions.length).toBeGreaterThan(0);

      // Execute exit action
      const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);
      expect(exitAction).toBeDefined();

      const result = exitAction!.execute(gamePlayer, game);
      expect(result.success).toBe(true);
    });

    it('should have jobs with increasing wages by rank', () => {
      const jobs = factory.getJobOfferings();

      // Group jobs by rank and check wage progression
      const jobsByRank = jobs.reduce((acc, job) => {
        if (!acc[job.rank]) acc[job.rank] = [];
        acc[job.rank].push(job);
        return acc;
      }, {} as Record<number, typeof jobs>);

      // Check that higher ranks generally have higher wages
      const rank1MaxWage = Math.max(...jobsByRank[1].map((j) => j.wagePerHour));
      const rank8MinWage = Math.min(...jobsByRank[8].map((j) => j.wagePerHour));

      expect(rank8MinWage).toBeGreaterThan(rank1MaxWage);
    });
  });

  describe('toString()', () => {
    it('should return meaningful string representation', () => {
      const result = factory.toString();
      expect(result).toContain('Main Factory');
      expect(result).toContain('FACTORY');
      expect(result).toContain('(1, 1)');
    });
  });
});
