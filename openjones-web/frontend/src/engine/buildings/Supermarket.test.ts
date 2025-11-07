/**
 * Tests for Supermarket building
 *
 * Part of Task B10: Shopping Buildings (Part 2)
 * Worker 4 - Shopping System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Supermarket } from './Supermarket';
import { Position } from '../types/Position';
import { PlayerState } from '../game/PlayerState';
import { EconomyModel } from '../economy/EconomyModel';
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
    economyModel: new EconomyModel(),
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

describe('Supermarket Building', () => {
  let supermarket: Supermarket;
  let player: IPlayerState;
  let game: IGame;
  const testPosition = new Position(6, 6);

  beforeEach(() => {
    supermarket = new Supermarket('supermarket-1', 'City Supermarket', testPosition);
    player = createMockPlayer();
    game = createMockGame();
  });

  describe('Constructor and Properties', () => {
    it('should initialize with correct properties', () => {
      expect(supermarket.id).toBe('supermarket-1');
      expect(supermarket.type).toBe(BuildingType.SUPERMARKET);
      expect(supermarket.name).toBe('City Supermarket');
      expect(supermarket.description).toContain('affordable');
      expect(supermarket.position).toBe(testPosition);
    });

    it('should initialize with supermarket building type', () => {
      expect(supermarket.type).toBe(BuildingType.SUPERMARKET);
    });

    it('should have correct position', () => {
      expect(supermarket.position.x).toBe(6);
      expect(supermarket.position.y).toBe(6);
    });

    it('should create unique IDs for different supermarkets', () => {
      const supermarket2 = new Supermarket('supermarket-2', 'Downtown Market', new Position(1, 1));
      expect(supermarket2.id).not.toBe(supermarket.id);
    });
  });

  describe('Job Offerings', () => {
    it('should return empty array for job offerings', () => {
      const jobs = supermarket.getJobOfferings();
      expect(jobs).toEqual([]);
      expect(jobs.length).toBe(0);
    });

    it('should consistently return empty jobs array', () => {
      expect(supermarket.getJobOfferings()).toEqual([]);
      expect(supermarket.getJobOfferings()).toEqual([]);
    });
  });

  describe('Available Actions', () => {
    it('should return empty actions when player is not inside', () => {
      const actions = supermarket.getAvailableActions(player, game);
      expect(actions).toEqual([]);
    });

    it('should return purchase actions when player is inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      const actions = supermarket.getAvailableActions(playerInside, game);

      const purchaseActions = actions.filter(a => a.type === ActionType.PURCHASE);
      expect(purchaseActions.length).toBeGreaterThan(0);
    });

    it('should include multiple grocery items', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      const actions = supermarket.getAvailableActions(playerInside, game);

      const purchaseActions = actions.filter(a => a.type === ActionType.PURCHASE);
      expect(purchaseActions.length).toBeGreaterThanOrEqual(6); // At least 6 items
    });

    it('should include exit action', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      const actions = supermarket.getAvailableActions(playerInside, game);

      const exitAction = actions.find(a => a.type === ActionType.EXIT_BUILDING);
      expect(exitAction).toBeDefined();
    });
  });

  describe('Budget Pricing', () => {
    it('should have affordable grocery items', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      const actions = supermarket.getAvailableActions(playerInside, game);

      const purchaseActions = actions.filter(a => a.type === ActionType.PURCHASE);
      const affordableItems = purchaseActions.filter(a => {
        const priceMatch = a.description.match(/\$(\d+)/);
        return priceMatch && parseInt(priceMatch[1]) <= 10;
      });

      expect(affordableItems.length).toBeGreaterThan(0);
    });

    it('should have Bread on shelves', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      const actions = supermarket.getAvailableActions(playerInside, game);

      const breadAction = actions.find(a => a.displayName.includes('Bread'));
      expect(breadAction).toBeDefined();
    });

    it('should have Milk on shelves', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      const actions = supermarket.getAvailableActions(playerInside, game);

      const milkAction = actions.find(a => a.displayName.includes('Milk'));
      expect(milkAction).toBeDefined();
    });

    it('should have Eggs on shelves', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      const actions = supermarket.getAvailableActions(playerInside, game);

      const eggsAction = actions.find(a => a.displayName.includes('Eggs'));
      expect(eggsAction).toBeDefined();
    });

    it('should have Chicken on shelves', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      const actions = supermarket.getAvailableActions(playerInside, game);

      const chickenAction = actions.find(a => a.displayName.includes('Chicken'));
      expect(chickenAction).toBeDefined();
    });

    it('should have Rice on shelves', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      const actions = supermarket.getAvailableActions(playerInside, game);

      const riceAction = actions.find(a => a.displayName.includes('Rice'));
      expect(riceAction).toBeDefined();
    });

    it('should have Vegetables on shelves', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      const actions = supermarket.getAvailableActions(playerInside, game);

      const vegAction = actions.find(a => a.displayName.includes('Vegetables'));
      expect(vegAction).toBeDefined();
    });
  });

  describe('Purchase Action Execution', () => {
    it('should successfully purchase grocery when player has enough cash', () => {
      const playerInside = createMockPlayer({
        currentBuilding: supermarket.id,
        cash: 100,
      });
      const actions = supermarket.getAvailableActions(playerInside, game);
      const purchaseAction = actions.find(a => a.type === ActionType.PURCHASE);

      const result = purchaseAction!.execute(playerInside, game);

      expect(result.success).toBe(true);
    });

    it('should fail to purchase when player has insufficient cash', () => {
      const playerInside = createMockPlayer({
        currentBuilding: supermarket.id,
        cash: 1, // Not enough for any item
      });
      const actions = supermarket.getAvailableActions(playerInside, game);
      const chickenAction = actions.find(a => a.displayName.includes('Chicken'));

      const result = chickenAction!.execute(playerInside, game);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not enough cash');
    });

    it('should deduct correct amount of cash', () => {
      const playerInside = createMockPlayer({
        currentBuilding: supermarket.id,
        cash: 100,
      });
      const actions = supermarket.getAvailableActions(playerInside, game);
      const breadAction = actions.find(a => a.displayName.includes('Bread'));

      const result = breadAction!.execute(playerInside, game);
      const cashChange = result.stateChanges.find(c => c.type === 'cash');

      expect(cashChange).toBeDefined();
      expect(cashChange!.value).toBe(97); // 100 - 3
    });

    it('should add grocery to inventory', () => {
      const playerInside = createMockPlayer({
        currentBuilding: supermarket.id,
        cash: 100,
      });
      const actions = supermarket.getAvailableActions(playerInside, game);
      const purchaseAction = actions.find(a => a.type === ActionType.PURCHASE);

      const result = purchaseAction!.execute(playerInside, game);
      const possessionChange = result.stateChanges.find(c => c.type === 'possession_add');

      expect(possessionChange).toBeDefined();
    });

    it('should have correct time cost', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      const actions = supermarket.getAvailableActions(playerInside, game);
      const purchaseAction = actions.find(a => a.type === ActionType.PURCHASE);

      expect(purchaseAction?.timeCost).toBe(5);
    });

  });

  describe('Pricing Comparison with Restaurant', () => {
    it('should have significantly lower prices than restaurant', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      const actions = supermarket.getAvailableActions(playerInside, game);

      const purchaseActions = actions.filter(a => a.type === ActionType.PURCHASE);
      const prices = purchaseActions.map(a => {
        const priceMatch = a.description.match(/\$(\d+)/);
        return priceMatch ? parseInt(priceMatch[1]) : 0;
      });

      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      expect(avgPrice).toBeLessThan(15); // Should be much cheaper than restaurant
    });

    it('should have faster shopping time than restaurant', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      const actions = supermarket.getAvailableActions(playerInside, game);
      const purchaseAction = actions.find(a => a.type === ActionType.PURCHASE);

      expect(purchaseAction?.timeCost).toBeLessThan(10); // Should be 5 vs restaurant's 10
    });
  });

  describe('Action Requirements', () => {
    it('should have cash requirement', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      const actions = supermarket.getAvailableActions(playerInside, game);
      const purchaseAction = actions.find(a => a.type === ActionType.PURCHASE);

      const requirements = purchaseAction!.getRequirements();
      const cashReq = requirements.find(r => r.type === 'cash');

      expect(cashReq).toBeDefined();
    });


    it('should allow purchase when player can afford', () => {
      const playerInside = createMockPlayer({
        currentBuilding: supermarket.id,
        cash: 100,
      });
      const actions = supermarket.getAvailableActions(playerInside, game);
      const breadAction = actions.find(a => a.displayName.includes('Bread'));

      expect(breadAction!.canExecute(playerInside, game)).toBe(true);
    });

    it('should not allow purchase when player cannot afford', () => {
      const playerInside = createMockPlayer({
        currentBuilding: supermarket.id,
        cash: 1,
      });
      const actions = supermarket.getAvailableActions(playerInside, game);
      const chickenAction = actions.find(a => a.displayName.includes('Chicken'));

      expect(chickenAction!.canExecute(playerInside, game)).toBe(false);
    });
  });

  describe('Action Tree', () => {
    it('should return valid action tree', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      const tree = supermarket.getActionTree(playerInside, game);

      expect(tree).toBeDefined();
      expect(tree.action).toBeDefined();
      expect(tree.children).toBeDefined();
    });

    it('should have buy groceries submenu in tree', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      const tree = supermarket.getActionTree(playerInside, game);

      expect(tree.action?.displayName).toContain('Groceries');
    });

    it('should include children for grocery items', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      const tree = supermarket.getActionTree(playerInside, game);

      expect(tree.children.length).toBeGreaterThan(0);
    });
  });

  describe('Exit Action', () => {
    it('should allow player to exit when inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      const actions = supermarket.getAvailableActions(playerInside, game);
      const exitAction = actions.find(a => a.type === ActionType.EXIT_BUILDING);

      expect(exitAction).toBeDefined();
      expect(exitAction!.canExecute(playerInside, game)).toBe(true);
    });

    it('should successfully exit the building', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      const actions = supermarket.getAvailableActions(playerInside, game);
      const exitAction = actions.find(a => a.type === ActionType.EXIT_BUILDING);

      const result = exitAction!.execute(playerInside, game);

      expect(result.success).toBe(true);
      expect(result.message).toContain('exit');
    });

    it('should have zero time cost for exit action', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      const actions = supermarket.getAvailableActions(playerInside, game);
      const exitAction = actions.find(a => a.type === ActionType.EXIT_BUILDING);

      expect(exitAction?.timeCost).toBe(0);
    });
  });

  describe('Building Helpers', () => {
    it('should correctly check if player is inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: supermarket.id });
      expect(supermarket.isPlayerInside(playerInside)).toBe(true);
    });

    it('should correctly check if player is not inside', () => {
      expect(supermarket.isPlayerInside(player)).toBe(false);
    });

    it('should not be a home building', () => {
      expect(supermarket.isHome()).toBe(false);
    });
  });
});
