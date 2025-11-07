/**
 * Tests for Restaurant building
 *
 * Part of Task B10: Shopping Buildings (Part 2)
 * Worker 4 - Shopping System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Restaurant } from './Restaurant';
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

describe('Restaurant Building', () => {
  let restaurant: Restaurant;
  let player: IPlayerState;
  let game: IGame;
  const testPosition = new Position(4, 4);

  beforeEach(() => {
    restaurant = new Restaurant('restaurant-1', 'Fine Dining Restaurant', testPosition);
    player = createMockPlayer();
    game = createMockGame();
  });

  describe('Constructor and Properties', () => {
    it('should initialize with correct properties', () => {
      expect(restaurant.id).toBe('restaurant-1');
      expect(restaurant.type).toBe(BuildingType.RESTAURANT);
      expect(restaurant.name).toBe('Fine Dining Restaurant');
      expect(restaurant.description).toContain('Fine dining');
      expect(restaurant.position).toBe(testPosition);
    });

    it('should initialize with restaurant building type', () => {
      expect(restaurant.type).toBe(BuildingType.RESTAURANT);
    });

    it('should have correct position', () => {
      expect(restaurant.position.x).toBe(4);
      expect(restaurant.position.y).toBe(4);
    });

    it('should create unique IDs for different restaurants', () => {
      const restaurant2 = new Restaurant('restaurant-2', 'Bistro', new Position(1, 1));
      expect(restaurant2.id).not.toBe(restaurant.id);
    });
  });

  describe('Job Offerings', () => {
    it('should return empty array for job offerings', () => {
      const jobs = restaurant.getJobOfferings();
      expect(jobs).toEqual([]);
      expect(jobs.length).toBe(0);
    });

    it('should consistently return empty jobs array', () => {
      expect(restaurant.getJobOfferings()).toEqual([]);
      expect(restaurant.getJobOfferings()).toEqual([]);
    });
  });

  describe('Available Actions', () => {
    it('should return empty actions when player is not inside', () => {
      const actions = restaurant.getAvailableActions(player, game);
      expect(actions).toEqual([]);
    });

    it('should return purchase actions when player is inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: restaurant.id });
      const actions = restaurant.getAvailableActions(playerInside, game);

      const purchaseActions = actions.filter(a => a.type === ActionType.PURCHASE);
      expect(purchaseActions.length).toBeGreaterThan(0);
    });

    it('should include multiple menu items', () => {
      const playerInside = createMockPlayer({ currentBuilding: restaurant.id });
      const actions = restaurant.getAvailableActions(playerInside, game);

      const purchaseActions = actions.filter(a => a.type === ActionType.PURCHASE);
      expect(purchaseActions.length).toBeGreaterThanOrEqual(4); // At least 4 menu items
    });

    it('should include exit action', () => {
      const playerInside = createMockPlayer({ currentBuilding: restaurant.id });
      const actions = restaurant.getAvailableActions(playerInside, game);

      const exitAction = actions.find(a => a.type === ActionType.EXIT_BUILDING);
      expect(exitAction).toBeDefined();
    });
  });

  describe('Premium Pricing', () => {
    it('should have expensive menu items', () => {
      const playerInside = createMockPlayer({ currentBuilding: restaurant.id });
      const actions = restaurant.getAvailableActions(playerInside, game);

      const purchaseActions = actions.filter(a => a.type === ActionType.PURCHASE);
      const expensiveItems = purchaseActions.filter(a => {
        const priceMatch = a.description.match(/\$(\d+)/);
        return priceMatch && parseInt(priceMatch[1]) >= 30;
      });

      expect(expensiveItems.length).toBeGreaterThan(0);
    });

    it('should have Gourmet Burger on menu', () => {
      const playerInside = createMockPlayer({ currentBuilding: restaurant.id });
      const actions = restaurant.getAvailableActions(playerInside, game);

      const burgerAction = actions.find(a => a.displayName.includes('Gourmet Burger'));
      expect(burgerAction).toBeDefined();
    });

    it('should have Lobster Dinner on menu', () => {
      const playerInside = createMockPlayer({ currentBuilding: restaurant.id });
      const actions = restaurant.getAvailableActions(playerInside, game);

      const lobsterAction = actions.find(a => a.displayName.includes('Lobster'));
      expect(lobsterAction).toBeDefined();
    });

    it('should have Filet Mignon on menu', () => {
      const playerInside = createMockPlayer({ currentBuilding: restaurant.id });
      const actions = restaurant.getAvailableActions(playerInside, game);

      const steakAction = actions.find(a => a.displayName.includes('Filet Mignon'));
      expect(steakAction).toBeDefined();
    });

    it('should have Chef Special on menu', () => {
      const playerInside = createMockPlayer({ currentBuilding: restaurant.id });
      const actions = restaurant.getAvailableActions(playerInside, game);

      const specialAction = actions.find(a => a.displayName.includes('Chef Special'));
      expect(specialAction).toBeDefined();
    });
  });

  describe('Purchase Action Execution', () => {
    it('should successfully purchase food when player has enough cash', () => {
      const playerInside = createMockPlayer({
        currentBuilding: restaurant.id,
        cash: 500,
      });
      const actions = restaurant.getAvailableActions(playerInside, game);
      const purchaseAction = actions.find(a => a.type === ActionType.PURCHASE);

      const result = purchaseAction!.execute(playerInside, game);

      expect(result.success).toBe(true);
    });

    it('should fail to purchase when player has insufficient cash', () => {
      const playerInside = createMockPlayer({
        currentBuilding: restaurant.id,
        cash: 10, // Not enough for any restaurant item
      });
      const actions = restaurant.getAvailableActions(playerInside, game);
      const expensiveAction = actions.find(a => a.displayName.includes('Lobster'));

      const result = expensiveAction!.execute(playerInside, game);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not enough cash');
    });

    it('should deduct correct amount of cash', () => {
      const playerInside = createMockPlayer({
        currentBuilding: restaurant.id,
        cash: 500,
      });
      const actions = restaurant.getAvailableActions(playerInside, game);
      const burgerAction = actions.find(a => a.displayName.includes('Gourmet Burger'));

      const result = burgerAction!.execute(playerInside, game);
      const cashChange = result.stateChanges.find(c => c.type === 'cash');

      expect(cashChange).toBeDefined();
      expect(cashChange!.value).toBe(465); // 500 - 35
    });

    it('should add food to inventory', () => {
      const playerInside = createMockPlayer({
        currentBuilding: restaurant.id,
        cash: 500,
      });
      const actions = restaurant.getAvailableActions(playerInside, game);
      const purchaseAction = actions.find(a => a.type === ActionType.PURCHASE);

      const result = purchaseAction!.execute(playerInside, game);
      const possessionChange = result.stateChanges.find(c => c.type === 'possession_add');

      expect(possessionChange).toBeDefined();
    });

    it('should have correct time cost', () => {
      const playerInside = createMockPlayer({ currentBuilding: restaurant.id });
      const actions = restaurant.getAvailableActions(playerInside, game);
      const purchaseAction = actions.find(a => a.type === ActionType.PURCHASE);

      expect(purchaseAction?.timeCost).toBe(10);
    });

  });

  describe('Action Requirements', () => {
    it('should have cash requirement', () => {
      const playerInside = createMockPlayer({ currentBuilding: restaurant.id });
      const actions = restaurant.getAvailableActions(playerInside, game);
      const purchaseAction = actions.find(a => a.type === ActionType.PURCHASE);

      const requirements = purchaseAction!.getRequirements();
      const cashReq = requirements.find(r => r.type === 'cash');

      expect(cashReq).toBeDefined();
    });


    it('should allow purchase when player can afford', () => {
      const playerInside = createMockPlayer({
        currentBuilding: restaurant.id,
        cash: 500,
      });
      const actions = restaurant.getAvailableActions(playerInside, game);
      const burgerAction = actions.find(a => a.displayName.includes('Gourmet Burger'));

      expect(burgerAction!.canExecute(playerInside, game)).toBe(true);
    });

    it('should not allow purchase when player cannot afford', () => {
      const playerInside = createMockPlayer({
        currentBuilding: restaurant.id,
        cash: 10,
      });
      const actions = restaurant.getAvailableActions(playerInside, game);
      const lobsterAction = actions.find(a => a.displayName.includes('Lobster'));

      expect(lobsterAction!.canExecute(playerInside, game)).toBe(false);
    });
  });

  describe('Action Tree', () => {
    it('should return valid action tree', () => {
      const playerInside = createMockPlayer({ currentBuilding: restaurant.id });
      const tree = restaurant.getActionTree(playerInside, game);

      expect(tree).toBeDefined();
      expect(tree.action).toBeDefined();
      expect(tree.children).toBeDefined();
    });

    it('should have order food submenu in tree', () => {
      const playerInside = createMockPlayer({ currentBuilding: restaurant.id });
      const tree = restaurant.getActionTree(playerInside, game);

      expect(tree.action?.displayName).toContain('Order');
    });

    it('should include children for menu items', () => {
      const playerInside = createMockPlayer({ currentBuilding: restaurant.id });
      const tree = restaurant.getActionTree(playerInside, game);

      expect(tree.children.length).toBeGreaterThan(0);
    });
  });

  describe('Exit Action', () => {
    it('should allow player to exit when inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: restaurant.id });
      const actions = restaurant.getAvailableActions(playerInside, game);
      const exitAction = actions.find(a => a.type === ActionType.EXIT_BUILDING);

      expect(exitAction).toBeDefined();
      expect(exitAction!.canExecute(playerInside, game)).toBe(true);
    });

    it('should successfully exit the building', () => {
      const playerInside = createMockPlayer({ currentBuilding: restaurant.id });
      const actions = restaurant.getAvailableActions(playerInside, game);
      const exitAction = actions.find(a => a.type === ActionType.EXIT_BUILDING);

      const result = exitAction!.execute(playerInside, game);

      expect(result.success).toBe(true);
      expect(result.message).toContain('exit');
    });

    it('should have zero time cost for exit action', () => {
      const playerInside = createMockPlayer({ currentBuilding: restaurant.id });
      const actions = restaurant.getAvailableActions(playerInside, game);
      const exitAction = actions.find(a => a.type === ActionType.EXIT_BUILDING);

      expect(exitAction?.timeCost).toBe(0);
    });
  });

  describe('Building Helpers', () => {
    it('should correctly check if player is inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: restaurant.id });
      expect(restaurant.isPlayerInside(playerInside)).toBe(true);
    });

    it('should correctly check if player is not inside', () => {
      expect(restaurant.isPlayerInside(player)).toBe(false);
    });

    it('should not be a home building', () => {
      expect(restaurant.isHome()).toBe(false);
    });
  });
});
