/**
 * Tests for LowCostApartment building
 *
 * Part of Task B11: Housing Buildings Implementation
 * Worker 2 - Housing System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LowCostApartment } from './LowCostApartment';
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
    health: 70,
    happiness: 60,
    education: 50,
    career: 0,
    position: new Position(2, 2),
    currentBuilding: null,
    job: null,
    experience: [],
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

describe('LowCostApartment Building', () => {
  let apartment: LowCostApartment;
  let player: IPlayerState;
  let game: IGame;
  const testPosition = new Position(1, 2);

  beforeEach(() => {
    apartment = new LowCostApartment('low-cost-apt-1', 'Budget Apartment', testPosition);
    player = createMockPlayer();
    game = createMockGame();
  });

  describe('Constructor and Properties', () => {
    it('should initialize with correct properties', () => {
      expect(apartment.id).toBe('low-cost-apt-1');
      expect(apartment.type).toBe(BuildingType.LOW_COST_APARTMENT);
      expect(apartment.name).toBe('Budget Apartment');
      expect(apartment.description).toContain('Affordable apartment');
      expect(apartment.description).toContain('$305/week');
      expect(apartment.position).toBe(testPosition);
    });

    it('should be classified as a home', () => {
      expect(apartment.isHome()).toBe(true);
    });

    it('should have correct weekly rent', () => {
      expect(LowCostApartment.WEEKLY_RENT).toBe(305);
    });
  });

  describe('Job Offerings', () => {
    it('should have no job offerings', () => {
      const jobs = apartment.getJobOfferings();
      expect(jobs).toEqual([]);
    });
  });

  describe('Building Access', () => {
    it('should not allow entry if player does not rent here', () => {
      player = createMockPlayer({ rentedHome: null });
      expect(apartment.canEnter(player)).toBe(false);
    });

    it('should allow entry if player rents this specific apartment', () => {
      player = createMockPlayer({ rentedHome: 'low-cost-apt-1' });
      expect(apartment.canEnter(player)).toBe(true);
    });

    it('should allow entry if player rents any low-cost apartment', () => {
      player = createMockPlayer({ rentedHome: 'low-cost-apt-2' });
      expect(apartment.canEnter(player)).toBe(true);
    });

    it('should not allow entry if player rents a different type', () => {
      player = createMockPlayer({ rentedHome: 'security-apt-1' });
      expect(apartment.canEnter(player)).toBe(false);
    });
  });

  describe('Available Actions - Not Renter', () => {
    it('should return empty actions when player does not rent here', () => {
      player = createMockPlayer({
        currentBuilding: null,
        rentedHome: null,
      });
      const actions = apartment.getAvailableActions(player, game);
      expect(actions).toHaveLength(0);
    });

    it('should only offer exit if inside but not renter', () => {
      player = createMockPlayer({
        currentBuilding: 'low-cost-apt-1',
        rentedHome: null,
      });
      const actions = apartment.getAvailableActions(player, game);
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe(ActionType.EXIT_BUILDING);
    });
  });

  describe('Available Actions - Renter Inside', () => {
    beforeEach(() => {
      player = createMockPlayer({
        currentBuilding: 'low-cost-apt-1',
        rentedHome: 'low-cost-apt-1',
        health: 70,
        happiness: 60,
        cash: 1000,
      });
    });

    it('should offer relax, pay rent, and exit actions', () => {
      const actions = apartment.getAvailableActions(player, game);
      expect(actions.length).toBe(3);

      const actionTypes = actions.map(a => a.type);
      expect(actionTypes).toContain(ActionType.RELAX);
      expect(actionTypes).toContain(ActionType.PAY_RENT);
      expect(actionTypes).toContain(ActionType.EXIT_BUILDING);
    });
  });

  describe('Relax Action', () => {
    let relaxAction: any;

    beforeEach(() => {
      player = createMockPlayer({
        currentBuilding: 'low-cost-apt-1',
        rentedHome: 'low-cost-apt-1',
        health: 70,
        happiness: 60,
      });
      const actions = apartment.getAvailableActions(player, game);
      relaxAction = actions.find(a => a.type === ActionType.RELAX);
    });

    it('should exist for renters', () => {
      expect(relaxAction).toBeDefined();
      expect(relaxAction.displayName).toContain('Relax');
    });

    it('should have correct time cost', () => {
      expect(relaxAction.timeCost).toBe(30);
    });

    it('should be executable by renter', () => {
      expect(relaxAction.canExecute(player, game)).toBe(true);
    });

    it('should restore health and happiness with home bonus', () => {
      const result = relaxAction.execute(player, game);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Relaxed');
      expect(result.message).toContain('home bonus');
      expect(result.timeSpent).toBe(30);

      // Check state changes
      const healthChange = result.stateChanges.find((c: any) => c.measure === 'HEALTH');
      const happinessChange = result.stateChanges.find((c: any) => c.measure === 'HAPPINESS');

      expect(healthChange).toBeDefined();
      expect(happinessChange).toBeDefined();

      // Should restore 10 health (7 * 1.5 rounded) and 15 happiness (10 * 1.5)
      expect(healthChange.value).toBeGreaterThan(player.health);
      expect(happinessChange.value).toBeGreaterThan(player.happiness);
    });

    it('should not exceed maximum stats', () => {
      player = createMockPlayer({
        currentBuilding: 'low-cost-apt-1',
        rentedHome: 'low-cost-apt-1',
        health: 95,
        happiness: 95,
      });
      const actions = apartment.getAvailableActions(player, game);
      const action = actions.find(a => a.type === ActionType.RELAX);

      const result = action?.execute(player, game);

      const healthChange = result?.stateChanges.find((c: any) => c.measure === 'HEALTH');
      const happinessChange = result?.stateChanges.find((c: any) => c.measure === 'HAPPINESS');

      expect(healthChange?.value).toBeLessThanOrEqual(100);
      expect(happinessChange?.value).toBeLessThanOrEqual(100);
    });
  });

  describe('Pay Rent Action', () => {
    let payRentAction: any;

    beforeEach(() => {
      player = createMockPlayer({
        currentBuilding: 'low-cost-apt-1',
        rentedHome: 'low-cost-apt-1',
        cash: 1000,
        rentDebt: 0,
      });
      const actions = apartment.getAvailableActions(player, game);
      payRentAction = actions.find(a => a.type === ActionType.PAY_RENT);
    });

    it('should exist for renters', () => {
      expect(payRentAction).toBeDefined();
    });

    it('should be executable with enough cash', () => {
      expect(payRentAction.canExecute(player, game)).toBe(true);
    });

    it('should not be executable without enough cash', () => {
      player = createMockPlayer({
        currentBuilding: 'low-cost-apt-1',
        rentedHome: 'low-cost-apt-1',
        cash: 100,
      });
      const actions = apartment.getAvailableActions(player, game);
      const action = actions.find(a => a.type === ActionType.PAY_RENT);

      expect(action?.canExecute(player, game)).toBe(false);
    });

    it('should successfully pay weekly rent', () => {
      const result = payRentAction.execute(player, game);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Paid rent');
      expect(result.timeSpent).toBe(5);

      const cashChange = result.stateChanges.find((c: any) => c.type === 'cash');
      expect(cashChange).toBeDefined();
      expect(cashChange.value).toBe(1000 - LowCostApartment.WEEKLY_RENT);
    });

    it('should pay off debt if present', () => {
      player = createMockPlayer({
        currentBuilding: 'low-cost-apt-1',
        rentedHome: 'low-cost-apt-1',
        cash: 1000,
        rentDebt: 610,
      });
      const actions = apartment.getAvailableActions(player, game);
      const action = actions.find(a => a.type === ActionType.PAY_RENT);

      const result = action?.execute(player, game);

      expect(result?.success).toBe(true);

      const debtChange = result?.stateChanges.find((c: any) => c.type === 'rentDebt');
      expect(debtChange).toBeDefined();
      expect(debtChange.value).toBe(0);
    });
  });

  describe('Exit Action', () => {
    let exitAction: any;

    beforeEach(() => {
      player = createMockPlayer({
        currentBuilding: 'low-cost-apt-1',
        rentedHome: 'low-cost-apt-1',
      });
      const actions = apartment.getAvailableActions(player, game);
      exitAction = actions.find(a => a.type === ActionType.EXIT_BUILDING);
    });

    it('should exist when player is inside', () => {
      expect(exitAction).toBeDefined();
      expect(exitAction.displayName).toContain('Leave');
    });

    it('should allow exit when inside', () => {
      expect(exitAction.canExecute(player, game)).toBe(true);
    });

    it('should successfully exit apartment', () => {
      const result = exitAction.execute(player, game);

      expect(result.success).toBe(true);
      expect(result.message).toContain('leave');
      expect(result.timeSpent).toBe(0);

      const posChange = result.stateChanges.find((c: any) => c.type === 'position');
      expect(posChange).toBeDefined();
      expect(posChange.value).toBe(testPosition);
    });
  });

  describe('Action Tree', () => {
    it('should return valid action tree for renter', () => {
      player = createMockPlayer({
        currentBuilding: 'low-cost-apt-1',
        rentedHome: 'low-cost-apt-1',
      });
      const tree = apartment.getActionTree(player, game);

      expect(tree).toBeDefined();
      expect(tree.action).toBeDefined();
      expect(tree.children).toBeDefined();
    });

    it('should return exit-only tree for non-renter', () => {
      player = createMockPlayer({
        currentBuilding: 'low-cost-apt-1',
        rentedHome: null,
      });
      const tree = apartment.getActionTree(player, game);

      expect(tree).toBeDefined();
      expect(tree.action.type).toBe(ActionType.EXIT_BUILDING);
    });
  });
});
