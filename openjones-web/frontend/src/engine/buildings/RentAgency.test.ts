/**
 * Tests for RentAgency building
 *
 * Part of Task B11: Housing Buildings Implementation
 * Worker 2 - Housing System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RentAgency } from './RentAgency';
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

describe('RentAgency Building', () => {
  let rentAgency: RentAgency;
  let player: IPlayerState;
  let game: IGame;
  const testPosition = new Position(3, 3);

  beforeEach(() => {
    rentAgency = new RentAgency('rent-agency-1', 'City Rent Agency', testPosition);
    player = createMockPlayer();
    game = createMockGame();
  });

  describe('Constructor and Properties', () => {
    it('should initialize with correct properties', () => {
      expect(rentAgency.id).toBe('rent-agency-1');
      expect(rentAgency.type).toBe(BuildingType.RENT_AGENCY);
      expect(rentAgency.name).toBe('City Rent Agency');
      expect(rentAgency.description).toContain('Rent an apartment');
      expect(rentAgency.position).toBe(testPosition);
    });

    it('should not be a home', () => {
      expect(rentAgency.isHome()).toBe(false);
    });

    it('should have correct rent prices', () => {
      expect(RentAgency.LOW_COST_RENT).toBe(305);
      expect(RentAgency.SECURITY_RENT).toBe(445);
    });
  });

  describe('Job Offerings', () => {
    it('should have no job offerings', () => {
      const jobs = rentAgency.getJobOfferings();
      expect(jobs).toEqual([]);
    });
  });

  describe('Building Access', () => {
    it('should allow anyone to enter', () => {
      expect(rentAgency.canEnter(player)).toBe(true);
    });

    it('should allow any player to enter', () => {
      const poorPlayer = createMockPlayer({ cash: 0 });
      expect(rentAgency.canEnter(poorPlayer)).toBe(true);
    });
  });

  describe('Available Actions - Not Inside', () => {
    it('should return empty actions when player is not inside', () => {
      player = createMockPlayer({ currentBuilding: null });
      const actions = rentAgency.getAvailableActions(player, game);
      expect(actions).toHaveLength(0);
    });
  });

  describe('Available Actions - Inside', () => {
    beforeEach(() => {
      player = createMockPlayer({ currentBuilding: 'rent-agency-1' });
    });

    it('should offer rent submenu and exit actions when inside', () => {
      const actions = rentAgency.getAvailableActions(player, game);
      expect(actions.length).toBeGreaterThanOrEqual(2);

      const actionTypes = actions.map(a => a.type);
      expect(actionTypes).toContain(ActionType.SUBMENU);
      expect(actionTypes).toContain(ActionType.EXIT_BUILDING);
    });

    it('should offer pay rent action if player has rented home', () => {
      player = createMockPlayer({
        currentBuilding: 'rent-agency-1',
        rentedHome: 'low-cost-apt-1',
      });

      const actions = rentAgency.getAvailableActions(player, game);
      const payRentAction = actions.find(a => a.type === ActionType.PAY_RENT);

      expect(payRentAction).toBeDefined();
      expect(payRentAction?.displayName).toContain('Pay Rent');
    });

    it('should not offer pay rent action if player has no rented home', () => {
      const actions = rentAgency.getAvailableActions(player, game);
      const payRentAction = actions.find(a => a.type === ActionType.PAY_RENT);

      expect(payRentAction).toBeUndefined();
    });
  });

  describe('Rent Low Cost Apartment Action', () => {
    let rentAction: any;

    beforeEach(() => {
      player = createMockPlayer({
        currentBuilding: 'rent-agency-1',
        cash: 1000,
      });
      const tree = rentAgency.getActionTree(player, game);
      rentAction = tree.children[0].action; // First child is rent low cost
    });

    it('should be able to rent with enough cash', () => {
      expect(rentAction.canExecute(player, game)).toBe(true);
    });

    it('should not be able to rent without enough cash', () => {
      player = createMockPlayer({
        currentBuilding: 'rent-agency-1',
        cash: 200,
      });
      expect(rentAction.canExecute(player, game)).toBe(false);
    });

    it('should successfully rent apartment', () => {
      const result = rentAction.execute(player, game);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully rented');
      expect(result.message).toContain('low-cost-apt-1');
      expect(result.timeSpent).toBe(10);
      expect(result.stateChanges).toHaveLength(1);

      // Check cash change
      const cashChange = result.stateChanges.find((c: any) => c.type === 'cash');
      expect(cashChange).toBeDefined();
      expect(cashChange.value).toBe(1000 - RentAgency.LOW_COST_RENT);
    });

    it('should fail to rent without enough cash', () => {
      player = createMockPlayer({
        currentBuilding: 'rent-agency-1',
        cash: 200,
      });

      const result = rentAction.execute(player, game);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not enough cash');
    });
  });

  describe('Rent Security Apartment Action', () => {
    let rentAction: any;

    beforeEach(() => {
      player = createMockPlayer({
        currentBuilding: 'rent-agency-1',
        cash: 1000,
      });
      const tree = rentAgency.getActionTree(player, game);
      rentAction = tree.children[1].action; // Second child is rent security
    });

    it('should be able to rent with enough cash', () => {
      expect(rentAction.canExecute(player, game)).toBe(true);
    });

    it('should not be able to rent without enough cash', () => {
      player = createMockPlayer({
        currentBuilding: 'rent-agency-1',
        cash: 300,
      });
      expect(rentAction.canExecute(player, game)).toBe(false);
    });

    it('should successfully rent apartment', () => {
      const result = rentAction.execute(player, game);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully rented');
      expect(result.message).toContain('security-apt-1');
      expect(result.timeSpent).toBe(10);

      // Check cash change
      const cashChange = result.stateChanges.find((c: any) => c.type === 'cash');
      expect(cashChange.value).toBe(1000 - RentAgency.SECURITY_RENT);
    });
  });

  describe('Pay Rent Action', () => {
    let payRentAction: any;

    beforeEach(() => {
      player = createMockPlayer({
        currentBuilding: 'rent-agency-1',
        rentedHome: 'low-cost-apt-1',
        cash: 1000,
        rentDebt: 0,
      });
      const actions = rentAgency.getAvailableActions(player, game);
      payRentAction = actions.find(a => a.type === ActionType.PAY_RENT);
    });

    it('should exist when player has rented home', () => {
      expect(payRentAction).toBeDefined();
    });

    it('should be able to pay rent with enough cash', () => {
      expect(payRentAction.canExecute(player, game)).toBe(true);
    });

    it('should not be able to pay rent without enough cash', () => {
      player = createMockPlayer({
        currentBuilding: 'rent-agency-1',
        rentedHome: 'low-cost-apt-1',
        cash: 100,
      });
      const actions = rentAgency.getAvailableActions(player, game);
      const action = actions.find(a => a.type === ActionType.PAY_RENT);

      expect(action?.canExecute(player, game)).toBe(false);
    });

    it('should successfully pay rent', () => {
      const result = payRentAction.execute(player, game);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Paid rent');
      expect(result.timeSpent).toBe(5);

      const cashChange = result.stateChanges.find((c: any) => c.type === 'cash');
      expect(cashChange).toBeDefined();
    });

    it('should pay off debt if present', () => {
      player = createMockPlayer({
        currentBuilding: 'rent-agency-1',
        rentedHome: 'low-cost-apt-1',
        cash: 1000,
        rentDebt: 610, // Two weeks
      });
      const actions = rentAgency.getAvailableActions(player, game);
      const action = actions.find(a => a.type === ActionType.PAY_RENT);

      const result = action?.execute(player, game);

      expect(result?.success).toBe(true);
      const debtChange = result?.stateChanges.find((c: any) => c.type === 'rentDebt');
      expect(debtChange).toBeDefined();
      expect(debtChange.value).toBe(0);
    });
  });

  describe('Action Tree', () => {
    it('should return valid action tree when inside', () => {
      player = createMockPlayer({ currentBuilding: 'rent-agency-1' });
      const tree = rentAgency.getActionTree(player, game);

      expect(tree).toBeDefined();
      expect(tree.action).toBeDefined();
      expect(tree.children).toBeDefined();
      expect(tree.children.length).toBeGreaterThan(0);
    });

    it('should include rent options in tree', () => {
      player = createMockPlayer({ currentBuilding: 'rent-agency-1' });
      const tree = rentAgency.getActionTree(player, game);

      // Tree should have rent submenu with children
      expect(tree.children.length).toBeGreaterThanOrEqual(2);
    });

    it('should return exit action tree when not inside', () => {
      player = createMockPlayer({ currentBuilding: null });
      const tree = rentAgency.getActionTree(player, game);

      expect(tree).toBeDefined();
      expect(tree.action).toBeDefined();
    });
  });

  describe('Exit Action', () => {
    let exitAction: any;

    beforeEach(() => {
      player = createMockPlayer({ currentBuilding: 'rent-agency-1' });
      const actions = rentAgency.getAvailableActions(player, game);
      exitAction = actions.find(a => a.type === ActionType.EXIT_BUILDING);
    });

    it('should exist when player is inside', () => {
      expect(exitAction).toBeDefined();
      expect(exitAction.displayName).toContain('Exit');
    });

    it('should allow exit when inside', () => {
      expect(exitAction.canExecute(player, game)).toBe(true);
    });

    it('should successfully exit building', () => {
      const result = exitAction.execute(player, game);

      expect(result.success).toBe(true);
      expect(result.message).toContain('exit');
      expect(result.timeSpent).toBe(0);

      const posChange = result.stateChanges.find((c: any) => c.type === 'position');
      expect(posChange).toBeDefined();
    });
  });
});
