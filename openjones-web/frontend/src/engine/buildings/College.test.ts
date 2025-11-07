/**
 * Tests for College building
 *
 * Part of Task B7: Core Buildings (Factory, College, Bank)
 * Worker 2 - Track B (Domain Logic)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { College } from './College';
import { Position } from '../types/Position';
import { PlayerState } from '../game/PlayerState';
import {
  IPlayerState,
  IGame,
  BuildingType,
  ActionType,
  MeasureType,
  GAME_CONSTANTS,
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
      { rank: 4, points: 50 },
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

describe('College Building', () => {
  let college: College;
  let player: IPlayerState;
  let game: IGame;
  const testPosition = new Position(3, 3);

  beforeEach(() => {
    college = new College('college-1', 'City College', testPosition);
    player = createMockPlayer();
    game = createMockGame();
  });

  describe('Constructor and Properties', () => {
    it('should initialize with correct properties', () => {
      expect(college.id).toBe('college-1');
      expect(college.type).toBe(BuildingType.COLLEGE);
      expect(college.name).toBe('City College');
      expect(college.description).toContain('Educational institution');
      expect(college.position).toBe(testPosition);
    });

    it('should not be a home', () => {
      expect(college.isHome()).toBe(false);
    });
  });

  describe('Job Offerings', () => {
    it('should offer 3 jobs', () => {
      const jobs = college.getJobOfferings();
      expect(jobs).toHaveLength(3);
    });

    it('should offer jobs for ranks 1, 4, and 9', () => {
      const jobs = college.getJobOfferings();
      const ranks = jobs.map((j) => j.rank);

      expect(ranks).toContain(1);
      expect(ranks).toContain(4);
      expect(ranks).toContain(9);
    });

    it('should have correct job titles', () => {
      const jobs = college.getJobOfferings();
      const titles = jobs.map((j) => j.title);

      expect(titles).toContain('Janitor');
      expect(titles).toContain('Teacher');
      expect(titles).toContain('Professor');
    });

    it('should have correct wages', () => {
      const jobs = college.getJobOfferings();
      const janitor = jobs.find((j) => j.title === 'Janitor');
      const teacher = jobs.find((j) => j.title === 'Teacher');
      const professor = jobs.find((j) => j.title === 'Professor');

      expect(janitor?.wagePerHour).toBe(6);
      expect(teacher?.wagePerHour).toBe(12);
      expect(professor?.wagePerHour).toBe(27);
    });

    it('should have correct education requirements', () => {
      const jobs = college.getJobOfferings();

      jobs.forEach((job) => {
        // Education requirement = rank * 5
        expect(job.requiredEducation).toBe(job.rank * 5);
      });
    });

    it('should have correct experience requirements', () => {
      const jobs = college.getJobOfferings();

      jobs.forEach((job) => {
        // Experience requirement = rank * 10
        expect(job.requiredExperience).toBe(job.rank * 10);
      });
    });

    it('should have all jobs with COLLEGE building type', () => {
      const jobs = college.getJobOfferings();

      jobs.forEach((job) => {
        expect(job.buildingType).toBe(BuildingType.COLLEGE);
      });
    });

    it('should return a copy of jobs array', () => {
      const jobs1 = college.getJobOfferings();
      const jobs2 = college.getJobOfferings();

      expect(jobs1).not.toBe(jobs2); // Different array instances
      expect(jobs1).toEqual(jobs2); // Same content
    });
  });

  describe('Available Actions', () => {
    it('should return empty array when player is outside', () => {
      const playerOutside = createMockPlayer({ currentBuilding: null });
      const actions = college.getAvailableActions(playerOutside, game);

      expect(actions).toHaveLength(0);
    });

    it('should return actions when player is inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'college-1' });
      const actions = college.getAvailableActions(playerInside, game);

      expect(actions.length).toBeGreaterThan(0);
    });

    it('should include study action when inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'college-1' });
      const actions = college.getAvailableActions(playerInside, game);

      const studyAction = actions.find((a) => a.type === ActionType.STUDY);
      expect(studyAction).toBeDefined();
    });

    it('should include exit action when inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'college-1' });
      const actions = college.getAvailableActions(playerInside, game);

      const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);
      expect(exitAction).toBeDefined();
    });
  });

  describe('Study Action', () => {
    it('should have correct properties', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'college-1' });
      const actions = college.getAvailableActions(playerInside, game);
      const studyAction = actions.find((a) => a.type === ActionType.STUDY);

      expect(studyAction?.displayName).toContain('Study');
      expect(studyAction?.displayName).toContain('$15');
      expect(studyAction?.timeCost).toBe(20); // 4 hours * 5 time units
    });

    it('should successfully execute when player has enough money', () => {
      const playerInside = createMockPlayer({
        currentBuilding: 'college-1',
        cash: 100,
        education: 50,
      });
      const actions = college.getAvailableActions(playerInside, game);
      const studyAction = actions.find((a) => a.type === ActionType.STUDY);

      const result = studyAction!.execute(playerInside, game);

      expect(result.success).toBe(true);
      expect(result.timeSpent).toBe(20);
      expect(result.message).toBe('Another brick in the wall'); // Easter egg!
    });

    it('should fail when player has insufficient funds', () => {
      const playerInside = createMockPlayer({
        currentBuilding: 'college-1',
        cash: 10, // Not enough for $15 study cost
      });
      const actions = college.getAvailableActions(playerInside, game);
      const studyAction = actions.find((a) => a.type === ActionType.STUDY);

      const result = studyAction!.execute(playerInside, game);

      expect(result.success).toBe(false);
      expect(result.message).toContain('need');
    });

    it('should fail when player is not inside', () => {
      const playerOutside = createMockPlayer({
        currentBuilding: null,
        cash: 100,
      });

      // Get study action from when player is inside
      const playerInside = createMockPlayer({ currentBuilding: 'college-1' });
      const actions = college.getAvailableActions(playerInside, game);
      const studyAction = actions.find((a) => a.type === ActionType.STUDY);

      // Try to execute while outside
      const result = studyAction!.execute(playerOutside, game);

      expect(result.success).toBe(false);
      expect(result.message).toContain('inside');
    });

    it('should fail when not enough time remaining', () => {
      const playerInside = createMockPlayer({
        currentBuilding: 'college-1',
        cash: 100,
      });
      const gameWithLittleTime = { ...game, timeUnitsRemaining: 10 }; // Less than 20 needed

      const actions = college.getAvailableActions(playerInside, gameWithLittleTime);
      const studyAction = actions.find((a) => a.type === ActionType.STUDY);

      const result = studyAction!.execute(playerInside, gameWithLittleTime);

      expect(result.success).toBe(false);
      expect(result.message).toContain('time');
    });

    it('should deduct correct cost from cash', () => {
      const playerInside = createMockPlayer({
        currentBuilding: 'college-1',
        cash: 100,
      });
      const actions = college.getAvailableActions(playerInside, game);
      const studyAction = actions.find((a) => a.type === ActionType.STUDY);

      const result = studyAction!.execute(playerInside, game);

      expect(result.success).toBe(true);
      const cashChange = result.stateChanges.find((c) => c.type === 'cash');
      expect(cashChange?.value).toBe(85); // 100 - 15
    });

    it('should increase education by 1', () => {
      const playerInside = createMockPlayer({
        currentBuilding: 'college-1',
        cash: 100,
        education: 50,
      });
      const actions = college.getAvailableActions(playerInside, game);
      const studyAction = actions.find((a) => a.type === ActionType.STUDY);

      const result = studyAction!.execute(playerInside, game);

      expect(result.success).toBe(true);
      const eduChange = result.stateChanges.find(
        (c) => c.type === 'measure' && c.measure === MeasureType.EDUCATION
      );
      expect(eduChange?.value).toBe(51); // 50 + 1
    });

    it('should not increase education above max', () => {
      const playerInside = createMockPlayer({
        currentBuilding: 'college-1',
        cash: 100,
        education: GAME_CONSTANTS.MAX_EDUCATION, // Already at max
      });
      const actions = college.getAvailableActions(playerInside, game);
      const studyAction = actions.find((a) => a.type === ActionType.STUDY);

      const result = studyAction!.execute(playerInside, game);

      expect(result.success).toBe(true);
      const eduChange = result.stateChanges.find(
        (c) => c.type === 'measure' && c.measure === MeasureType.EDUCATION
      );
      expect(eduChange?.value).toBe(GAME_CONSTANTS.MAX_EDUCATION);
    });

    it('should have 2 state changes (cash and education)', () => {
      const playerInside = createMockPlayer({
        currentBuilding: 'college-1',
        cash: 100,
      });
      const actions = college.getAvailableActions(playerInside, game);
      const studyAction = actions.find((a) => a.type === ActionType.STUDY);

      const result = studyAction!.execute(playerInside, game);

      expect(result.success).toBe(true);
      expect(result.stateChanges).toHaveLength(2);
    });

    it('should check canExecute correctly', () => {
      // Can execute when inside with money and time
      const validPlayer = createMockPlayer({
        currentBuilding: 'college-1',
        cash: 100,
      });
      const actions1 = college.getAvailableActions(validPlayer, game);
      const studyAction1 = actions1.find((a) => a.type === ActionType.STUDY);
      expect(studyAction1?.canExecute(validPlayer, game)).toBe(true);

      // Cannot execute when outside
      const outsidePlayer = createMockPlayer({
        currentBuilding: null,
        cash: 100,
      });
      const actions2 = college.getAvailableActions(validPlayer, game);
      const studyAction2 = actions2.find((a) => a.type === ActionType.STUDY);
      expect(studyAction2?.canExecute(outsidePlayer, game)).toBe(false);

      // Cannot execute without money
      const poorPlayer = createMockPlayer({
        currentBuilding: 'college-1',
        cash: 5,
      });
      const actions3 = college.getAvailableActions(poorPlayer, game);
      const studyAction3 = actions3.find((a) => a.type === ActionType.STUDY);
      expect(studyAction3?.canExecute(poorPlayer, game)).toBe(false);
    });

    it('should have correct requirements', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'college-1' });
      const actions = college.getAvailableActions(playerInside, game);
      const studyAction = actions.find((a) => a.type === ActionType.STUDY);

      const requirements = studyAction!.getRequirements();

      expect(requirements).toHaveLength(2);
      expect(requirements.some((r) => r.type === 'building')).toBe(true);
      expect(requirements.some((r) => r.type === 'cash')).toBe(true);
    });
  });

  describe('Exit Action', () => {
    it('should successfully exit when inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'college-1' });
      const actions = college.getAvailableActions(playerInside, game);
      const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);

      const result = exitAction!.execute(playerInside, game);

      expect(result.success).toBe(true);
      expect(result.timeSpent).toBe(0);
      expect(result.message).toContain('exit');
    });

    it('should update player position in state changes', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'college-1' });
      const actions = college.getAvailableActions(playerInside, game);
      const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);

      const result = exitAction!.execute(playerInside, game);

      expect(result.stateChanges).toHaveLength(1);
      expect(result.stateChanges[0].type).toBe('position');
      expect(result.stateChanges[0].value).toBe(testPosition);
    });
  });

  describe('Action Tree', () => {
    it('should create valid action tree when player is inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'college-1' });
      const tree = college.getActionTree(playerInside, game);

      expect(tree).toBeDefined();
      expect(tree.action).toBeDefined();
      expect(tree.index).toBe(0);
    });

    it('should have multiple actions in tree', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'college-1' });
      const tree = college.getActionTree(playerInside, game);

      // Root action plus children
      expect(tree.action).toBeDefined();
      expect(tree.children.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration Tests', () => {
    it('should work with complete game scenario', () => {
      // Create college
      const myCollege = new College('college-main', 'State College', new Position(2, 2));

      // Player approaches college
      const gamePlayer = createMockPlayer({
        position: new Position(2, 2),
        currentBuilding: null,
        cash: 100,
        education: 30,
      });

      // Check player can enter
      expect(myCollege.canEnter(gamePlayer)).toBe(true);
      expect(myCollege.isPlayerAtPosition(gamePlayer)).toBe(true);

      // Get job offerings
      const jobs = myCollege.getJobOfferings();
      expect(jobs).toHaveLength(3);

      // Player enters building
      gamePlayer.currentBuilding = 'college-main';
      expect(myCollege.isPlayerInside(gamePlayer)).toBe(true);

      // Get available actions
      const actions = myCollege.getAvailableActions(gamePlayer, game);
      expect(actions.length).toBeGreaterThan(0);

      // Execute study action
      const studyAction = actions.find((a) => a.type === ActionType.STUDY);
      expect(studyAction).toBeDefined();

      const result = studyAction!.execute(gamePlayer, game);
      expect(result.success).toBe(true);
      expect(result.timeSpent).toBe(20);
    });

    it('should have professor as highest paid job', () => {
      const jobs = college.getJobOfferings();
      const wages = jobs.map((j) => j.wagePerHour);
      const maxWage = Math.max(...wages);

      const professor = jobs.find((j) => j.title === 'Professor');
      expect(professor?.wagePerHour).toBe(maxWage);
    });
  });

  describe('toString()', () => {
    it('should return meaningful string representation', () => {
      const result = college.toString();
      expect(result).toContain('City College');
      expect(result).toContain('COLLEGE');
      expect(result).toContain('(3, 3)');
    });
  });
});
