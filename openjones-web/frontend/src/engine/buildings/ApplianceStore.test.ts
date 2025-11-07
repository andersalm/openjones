/**
 * Tests for ApplianceStore building
 *
 * Part of Task B9: Shopping Buildings (Part 1)
 * Worker 3 - Track B (Domain Logic)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ApplianceStore } from './ApplianceStore';
import { Position } from '../types/Position';
import { PlayerState } from '../game/PlayerState';
import {
  IPlayerState,
  IGame,
  BuildingType,
  ActionType,
  IEconomyModel,
} from '../../../../shared/types/contracts';

/**
 * Helper to create a mock player state for testing
 */
function createMockPlayer(overrides: Partial<IPlayerState> = {}): IPlayerState {
  return new PlayerState({
    playerId: 'test-player',
    cash: 1500,
    health: 100,
    happiness: 80,
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
 * Mock economy model for testing
 */
class MockEconomyModel implements IEconomyModel {
  getPrice(_itemId: string, _buildingType: BuildingType): number {
    return 100;
  }

  getWage(_job: any, hoursWorked: number): number {
    return 10 * hoursWorked;
  }

  getRent(homeType: BuildingType): number {
    return homeType === BuildingType.LOW_COST_APARTMENT ? 305 : 445;
  }

  getStockPrice(week: number): number {
    return 50 + week * 5;
  }

  calculateSellPrice(possession: any): number {
    return Math.floor(possession.value * 0.5);
  }
}

/**
 * Helper to create a mock game instance
 */
function createMockGame(): IGame {
  const mockMap = {
    width: 5,
    height: 5,
    getBuilding: () => null,
    getAllBuildings: () => [],
    getBuildingById: (id: string) => {
      if (id === 'appliance-1') {
        return {
          id: 'appliance-1',
          type: BuildingType.APPLIANCE_STORE,
          name: 'Appliance Store',
        } as any;
      }
      return null;
    },
    isValidPosition: () => true,
    getRoute: () => ({ start: null, end: null, positions: [], distance: 0 } as any),
    getAdjacentPositions: () => [],
  };

  return {
    id: 'test-game',
    currentWeek: 1,
    timeUnitsRemaining: 600,
    currentPlayerIndex: 0,
    players: [],
    map: mockMap as any,
    economyModel: new MockEconomyModel(),
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

describe('ApplianceStore Building', () => {
  let store: ApplianceStore;
  let player: IPlayerState;
  let game: IGame;
  const testPosition = new Position(4, 1);

  beforeEach(() => {
    store = new ApplianceStore('appliance-1', 'Home Appliances Plus', testPosition);
    player = createMockPlayer();
    game = createMockGame();
  });

  describe('Constructor and Properties', () => {
    it('should initialize with correct properties', () => {
      expect(store.id).toBe('appliance-1');
      expect(store.type).toBe(BuildingType.APPLIANCE_STORE);
      expect(store.name).toBe('Home Appliances Plus');
      expect(store.description).toContain('appliance');
      expect(store.position).toBe(testPosition);
    });

    it('should not be a home', () => {
      expect(store.isHome()).toBe(false);
    });

    it('should have correct building type', () => {
      expect(store.type).toBe(BuildingType.APPLIANCE_STORE);
    });

    it('should have a valid position', () => {
      expect(store.position.x).toBe(4);
      expect(store.position.y).toBe(1);
    });

    it('should have a description mentioning happiness', () => {
      expect(store.description.toLowerCase()).toContain('happiness');
    });
  });

  describe('Job Offerings', () => {
    it('should not offer any jobs', () => {
      const jobs = store.getJobOfferings();
      expect(jobs).toHaveLength(0);
    });

    it('should return an array for job offerings', () => {
      const jobs = store.getJobOfferings();
      expect(Array.isArray(jobs)).toBe(true);
    });
  });

  describe('Available Actions - Outside Store', () => {
    it('should return empty array when player is outside', () => {
      const playerOutside = createMockPlayer({ currentBuilding: null });
      const actions = store.getAvailableActions(playerOutside, game);
      expect(actions).toHaveLength(0);
    });

    it('should not show purchase actions when outside', () => {
      const playerOutside = createMockPlayer({ currentBuilding: null });
      const actions = store.getAvailableActions(playerOutside, game);
      const purchaseActions = actions.filter((a) => a.type === ActionType.PURCHASE);
      expect(purchaseActions).toHaveLength(0);
    });

    it('should not show exit action when outside', () => {
      const playerOutside = createMockPlayer({ currentBuilding: null });
      const actions = store.getAvailableActions(playerOutside, game);
      const exitActions = actions.filter((a) => a.type === ActionType.EXIT_BUILDING);
      expect(exitActions).toHaveLength(0);
    });
  });

  describe('Available Actions - Inside Store', () => {
    it('should return actions when player is inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'appliance-1' });
      const actions = store.getAvailableActions(playerInside, game);
      expect(actions.length).toBeGreaterThan(0);
    });

    it('should include purchase actions for appliances', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'appliance-1' });
      const actions = store.getAvailableActions(playerInside, game);
      const purchaseActions = actions.filter((a) => a.type === ActionType.PURCHASE);
      expect(purchaseActions.length).toBeGreaterThan(0);
    });

    it('should include exit action when inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'appliance-1' });
      const actions = store.getAvailableActions(playerInside, game);
      const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);
      expect(exitAction).toBeDefined();
    });

    it('should offer multiple appliances', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'appliance-1' });
      const actions = store.getAvailableActions(playerInside, game);
      const purchaseActions = actions.filter((a) => a.type === ActionType.PURCHASE);
      expect(purchaseActions.length).toBeGreaterThanOrEqual(4);
    });

    it('should have appliance purchase actions with "Buy" in the name', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'appliance-1' });
      const actions = store.getAvailableActions(playerInside, game);
      const purchaseActions = actions.filter((a) => a.type === ActionType.PURCHASE);
      purchaseActions.forEach((action) => {
        expect(action.displayName).toContain('Buy');
      });
    });

    it('should show all appliances regardless of player cash', () => {
      const richPlayer = createMockPlayer({ currentBuilding: 'appliance-1', cash: 10000 });
      const poorPlayer = createMockPlayer({ currentBuilding: 'appliance-1', cash: 100 });

      const richActions = store.getAvailableActions(richPlayer, game);
      const poorActions = store.getAvailableActions(poorPlayer, game);

      const richPurchases = richActions.filter((a) => a.type === ActionType.PURCHASE);
      const poorPurchases = poorActions.filter((a) => a.type === ActionType.PURCHASE);

      expect(richPurchases.length).toBe(poorPurchases.length);
    });
  });

  describe('Exit Action', () => {
    it('should successfully exit when inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'appliance-1' });
      const actions = store.getAvailableActions(playerInside, game);
      const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);

      expect(exitAction).toBeDefined();
      const result = exitAction!.execute(playerInside, game);

      expect(result.success).toBe(true);
      expect(result.timeSpent).toBe(0);
      expect(result.message).toContain('exit');
    });

    it('should fail when not inside', () => {
      const playerOutside = createMockPlayer({ currentBuilding: null });
      const playerInside = createMockPlayer({ currentBuilding: 'appliance-1' });

      const actions = store.getAvailableActions(playerInside, game);
      const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);

      const result = exitAction!.execute(playerOutside, game);
      expect(result.success).toBe(false);
      expect(result.message).toContain('not inside');
    });

    it('should update player position in state changes', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'appliance-1' });
      const actions = store.getAvailableActions(playerInside, game);
      const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);

      const result = exitAction!.execute(playerInside, game);
      expect(result.stateChanges).toHaveLength(1);
      expect(result.stateChanges[0].type).toBe('position');
      expect(result.stateChanges[0].value).toBe(testPosition);
    });

    it('should have correct canExecute behavior', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'appliance-1' });
      const playerOutside = createMockPlayer({ currentBuilding: null });

      const actions = store.getAvailableActions(playerInside, game);
      const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);

      expect(exitAction?.canExecute(playerInside, game)).toBe(true);
      expect(exitAction?.canExecute(playerOutside, game)).toBe(false);
    });

    it('should have zero time cost', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'appliance-1' });
      const actions = store.getAvailableActions(playerInside, game);
      const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);

      expect(exitAction?.timeCost).toBe(0);
    });
  });

  describe('Action Tree', () => {
    it('should create valid action tree when player is inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'appliance-1' });
      const tree = store.getActionTree(playerInside, game);

      expect(tree).toBeDefined();
      expect(tree.action).toBeDefined();
      expect(tree.index).toBe(0);
    });

    it('should have children in action tree', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'appliance-1' });
      const tree = store.getActionTree(playerInside, game);

      expect(tree.children).toBeDefined();
      expect(tree.children.length).toBeGreaterThan(0);
    });

    it('should work when player is outside (fallback)', () => {
      const playerOutside = createMockPlayer({ currentBuilding: null });
      const tree = store.getActionTree(playerOutside, game);

      expect(tree).toBeDefined();
      expect(tree.action).toBeDefined();
    });

    it('should have proper tree structure with price categories', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'appliance-1' });
      const tree = store.getActionTree(playerInside, game);

      expect(tree.action).toBeDefined();
      expect(Array.isArray(tree.children)).toBe(true);
      // Should have budget, mid-range, premium categories + exit
      expect(tree.children.length).toBeGreaterThanOrEqual(3);
    });

    it('should organize appliances by price range', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'appliance-1' });
      const tree = store.getActionTree(playerInside, game);

      // Should have multiple categories
      expect(tree.children.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Building Entry', () => {
    it('should allow all players to enter by default', () => {
      expect(store.canEnter(player)).toBe(true);
    });

    it('should correctly identify player position', () => {
      const playerAtStore = createMockPlayer({
        position: new Position(4, 1),
      });
      expect(store.isPlayerAtPosition(playerAtStore)).toBe(true);

      const playerAway = createMockPlayer({
        position: new Position(0, 0),
      });
      expect(store.isPlayerAtPosition(playerAway)).toBe(false);
    });

    it('should correctly identify if player is inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'appliance-1' });
      expect(store.isPlayerInside(playerInside)).toBe(true);

      const playerOutside = createMockPlayer({ currentBuilding: null });
      expect(store.isPlayerInside(playerOutside)).toBe(false);
    });

    it('should allow entry regardless of cash', () => {
      const poorPlayer = createMockPlayer({ cash: 0 });
      expect(store.canEnter(poorPlayer)).toBe(true);
    });

    it('should allow entry regardless of home ownership', () => {
      const homeless = createMockPlayer({ rentedHome: null });
      expect(store.canEnter(homeless)).toBe(true);
    });
  });

  describe('Appliance Variety', () => {
    it('should offer different types of appliances', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'appliance-1' });
      const actions = store.getAvailableActions(playerInside, game);
      const purchaseActions = actions.filter((a) => a.type === ActionType.PURCHASE);

      // Check that we have multiple unique appliances
      const names = purchaseActions.map((a) => a.displayName);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBeGreaterThanOrEqual(4);
    });

    it('should have appliances at different price points', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'appliance-1' });
      const actions = store.getAvailableActions(playerInside, game);
      const purchaseActions = actions.filter((a) => a.type === ActionType.PURCHASE);

      expect(purchaseActions.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Integration Tests', () => {
    it('should work with complete game scenario', () => {
      const myStore = new ApplianceStore('appliance-main', 'SuperTech Appliances', new Position(2, 3));

      const gamePlayer = createMockPlayer({
        position: new Position(2, 3),
        currentBuilding: null,
        cash: 2000,
      });

      expect(myStore.canEnter(gamePlayer)).toBe(true);
      expect(myStore.isPlayerAtPosition(gamePlayer)).toBe(true);

      gamePlayer.currentBuilding = 'appliance-main';
      expect(myStore.isPlayerInside(gamePlayer)).toBe(true);

      const actions = myStore.getAvailableActions(gamePlayer, game);
      expect(actions.length).toBeGreaterThan(0);

      const purchaseActions = actions.filter((a) => a.type === ActionType.PURCHASE);
      expect(purchaseActions.length).toBeGreaterThanOrEqual(4);
    });

    it('should have exit action available when inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'appliance-1' });
      const actions = store.getAvailableActions(playerInside, game);

      const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);
      expect(exitAction).toBeDefined();
    });
  });

  describe('toString()', () => {
    it('should return meaningful string representation', () => {
      const result = store.toString();
      expect(result).toContain('Home Appliances Plus');
      expect(result).toContain('APPLIANCE_STORE');
      expect(result).toContain('(4, 1)');
    });
  });

  describe('Edge Cases', () => {
    it('should handle player in different building', () => {
      const playerInOtherBuilding = createMockPlayer({ currentBuilding: 'other-building' });
      const actions = store.getAvailableActions(playerInOtherBuilding, game);
      expect(actions).toHaveLength(0);
    });

    it('should handle undefined current building', () => {
      const playerWithUndefined = createMockPlayer({ currentBuilding: undefined as any });
      const actions = store.getAvailableActions(playerWithUndefined, game);
      expect(actions).toHaveLength(0);
    });

    it('should have unique action IDs', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'appliance-1' });
      const actions = store.getAvailableActions(playerInside, game);
      const ids = actions.map((a) => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
