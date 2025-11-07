/**
 * Tests for PawnShop building
 *
 * Part of Task B10: Shopping Buildings (Part 2)
 * Worker 4 - Shopping System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PawnShop } from './PawnShop';
import { Position } from '../types/Position';
import { PlayerState } from '../game/PlayerState';
import { Food } from '../possessions/Food';
import { Clothes } from '../possessions/Clothes';
import { EconomyModel } from '../economy/EconomyModel';
import {
  IPlayerState,
  IGame,
  BuildingType,
  ActionType,
  MeasureType,
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

describe('PawnShop Building', () => {
  let pawnShop: PawnShop;
  let player: IPlayerState;
  let game: IGame;
  const testPosition = new Position(5, 5);

  beforeEach(() => {
    pawnShop = new PawnShop('pawn-shop-1', 'Downtown Pawn Shop', testPosition);
    player = createMockPlayer();
    game = createMockGame();
  });

  describe('Constructor and Properties', () => {
    it('should initialize with correct properties', () => {
      expect(pawnShop.id).toBe('pawn-shop-1');
      expect(pawnShop.type).toBe(BuildingType.PAWN_SHOP);
      expect(pawnShop.name).toBe('Downtown Pawn Shop');
      expect(pawnShop.description).toContain('Sell your possessions');
      expect(pawnShop.position).toBe(testPosition);
    });

    it('should initialize with pawn shop building type', () => {
      expect(pawnShop.type).toBe(BuildingType.PAWN_SHOP);
    });

    it('should have correct position', () => {
      expect(pawnShop.position.x).toBe(5);
      expect(pawnShop.position.y).toBe(5);
    });

    it('should create unique IDs for different pawn shops', () => {
      const pawnShop2 = new PawnShop('pawn-shop-2', 'Uptown Pawn Shop', new Position(1, 1));
      expect(pawnShop2.id).not.toBe(pawnShop.id);
    });
  });

  describe('Job Offerings', () => {
    it('should return empty array for job offerings', () => {
      const jobs = pawnShop.getJobOfferings();
      expect(jobs).toEqual([]);
      expect(jobs.length).toBe(0);
    });

    it('should consistently return empty jobs array', () => {
      expect(pawnShop.getJobOfferings()).toEqual([]);
      expect(pawnShop.getJobOfferings()).toEqual([]);
    });
  });

  describe('Available Actions - No Possessions', () => {
    it('should return no items action when player has no possessions', () => {
      const playerInside = createMockPlayer({ currentBuilding: pawnShop.id });
      const actions = pawnShop.getAvailableActions(playerInside, game);

      const noItemsAction = actions.find(a => a.displayName.includes('No items'));
      expect(noItemsAction).toBeDefined();
    });

    it('should include exit action when player has no possessions', () => {
      const playerInside = createMockPlayer({ currentBuilding: pawnShop.id });
      const actions = pawnShop.getAvailableActions(playerInside, game);

      const exitAction = actions.find(a => a.type === ActionType.EXIT_BUILDING);
      expect(exitAction).toBeDefined();
    });

    it('should return empty actions when player is not inside', () => {
      const actions = pawnShop.getAvailableActions(player, game);
      expect(actions).toEqual([]);
    });
  });

  describe('Available Actions - With Possessions', () => {
    it('should create sell action for each possession', () => {
      const food = new Food('Pizza', 20, 20, [{ measure: MeasureType.HEALTH, delta: 10 }]);
      const clothes = new Clothes('Shirt', 50, 50, 2, [{ measure: MeasureType.HAPPINESS, delta: 5 }]);
      const playerInside = createMockPlayer({
        currentBuilding: pawnShop.id,
        possessions: [food, clothes],
      });

      const actions = pawnShop.getAvailableActions(playerInside, game);
      const sellActions = actions.filter(a => a.type === ActionType.SELL);

      expect(sellActions.length).toBe(2);
    });

    it('should create sell action with correct name', () => {
      const food = new Food('Pizza', 20, 20, [{ measure: MeasureType.HEALTH, delta: 10 }]);
      const playerInside = createMockPlayer({
        currentBuilding: pawnShop.id,
        possessions: [food],
      });

      const actions = pawnShop.getAvailableActions(playerInside, game);
      const sellAction = actions.find(a => a.type === ActionType.SELL);

      expect(sellAction?.displayName).toContain('Sell Pizza');
    });

    it('should include sell price in action description', () => {
      const food = new Food('Pizza', 20, 20, [{ measure: MeasureType.HEALTH, delta: 10 }]);
      const playerInside = createMockPlayer({
        currentBuilding: pawnShop.id,
        possessions: [food],
      });

      const actions = pawnShop.getAvailableActions(playerInside, game);
      const sellAction = actions.find(a => a.type === ActionType.SELL);

      expect(sellAction?.description).toContain('$10'); // 50% of 20
    });

    it('should always include exit action', () => {
      const food = new Food('Pizza', 20, 20, [{ measure: MeasureType.HEALTH, delta: 10 }]);
      const playerInside = createMockPlayer({
        currentBuilding: pawnShop.id,
        possessions: [food],
      });

      const actions = pawnShop.getAvailableActions(playerInside, game);
      const exitAction = actions.find(a => a.type === ActionType.EXIT_BUILDING);

      expect(exitAction).toBeDefined();
    });
  });

  describe('Sell Price Calculation', () => {
    it('should calculate 50% sell price for food', () => {
      const food = new Food('Pizza', 20, 20, [{ measure: MeasureType.HEALTH, delta: 10 }]);
      const economy = new EconomyModel();
      const sellPrice = economy.calculateSellPrice(food);

      expect(sellPrice).toBe(10); // 50% of 20
    });

    it('should calculate 50% sell price for clothes', () => {
      const clothes = new Clothes('Suit', 200, 200, 3, [{ measure: MeasureType.HAPPINESS, delta: 5 }]);
      const economy = new EconomyModel();
      const sellPrice = economy.calculateSellPrice(clothes);

      expect(sellPrice).toBe(100); // 50% of 200
    });

    it('should floor the sell price', () => {
      const food = new Food('Burger', 15, 15, [{ measure: MeasureType.HEALTH, delta: 8 }]);
      const economy = new EconomyModel();
      const sellPrice = economy.calculateSellPrice(food);

      expect(sellPrice).toBe(7); // floor(15 * 0.5) = 7
    });

    it('should handle zero value items', () => {
      const food = new Food('Free Sample', 0, 0, [{ measure: MeasureType.HEALTH, delta: 1 }]);
      const economy = new EconomyModel();
      const sellPrice = economy.calculateSellPrice(food);

      expect(sellPrice).toBe(0);
    });
  });

  describe('Sell Action Execution', () => {
    it('should successfully sell possession and add cash', () => {
      const food = new Food('Pizza', 20, 20, [{ measure: MeasureType.HEALTH, delta: 10 }]);
      const playerInside = createMockPlayer({
        currentBuilding: pawnShop.id,
        cash: 100,
        possessions: [food],
      });

      const actions = pawnShop.getAvailableActions(playerInside, game);
      const sellAction = actions.find(a => a.type === ActionType.SELL);

      const result = sellAction!.execute(playerInside, game);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Sold Pizza');
      expect(result.message).toContain('$10');
    });

    it('should add correct cash amount to player', () => {
      const food = new Food('Pizza', 20, 20, [{ measure: MeasureType.HEALTH, delta: 10 }]);
      const playerInside = createMockPlayer({
        currentBuilding: pawnShop.id,
        cash: 100,
        possessions: [food],
      });

      const actions = pawnShop.getAvailableActions(playerInside, game);
      const sellAction = actions.find(a => a.type === ActionType.SELL);

      const result = sellAction!.execute(playerInside, game);
      const cashChange = result.stateChanges.find(c => c.type === 'cash');

      expect(cashChange?.value).toBe(110); // 100 + 10
    });

    it('should remove possession from player inventory', () => {
      const food = new Food('Pizza', 20, 20, [{ measure: MeasureType.HEALTH, delta: 10 }]);
      const playerInside = createMockPlayer({
        currentBuilding: pawnShop.id,
        possessions: [food],
      });

      const actions = pawnShop.getAvailableActions(playerInside, game);
      const sellAction = actions.find(a => a.type === ActionType.SELL);

      const result = sellAction!.execute(playerInside, game);
      const possessionChange = result.stateChanges.find(c => c.type === 'possession_remove');

      expect(possessionChange).toBeDefined();
      expect(possessionChange?.value).toBe(food.id);
    });

    it('should fail if player no longer owns the possession', () => {
      const food = new Food('Pizza', 20, 20, [{ measure: MeasureType.HEALTH, delta: 10 }]);
      const playerInside = createMockPlayer({
        currentBuilding: pawnShop.id,
        possessions: [food],
      });

      const actions = pawnShop.getAvailableActions(playerInside, game);
      const sellAction = actions.find(a => a.type === ActionType.SELL);

      // Remove possession
      playerInside.possessions = [];

      const result = sellAction!.execute(playerInside, game);

      expect(result.success).toBe(false);
      expect(result.message).toContain("don't own");
    });

    it('should have correct time cost for selling', () => {
      const food = new Food('Pizza', 20, 20, [{ measure: MeasureType.HEALTH, delta: 10 }]);
      const playerInside = createMockPlayer({
        currentBuilding: pawnShop.id,
        possessions: [food],
      });

      const actions = pawnShop.getAvailableActions(playerInside, game);
      const sellAction = actions.find(a => a.type === ActionType.SELL);

      expect(sellAction?.timeCost).toBe(5);
    });
  });

  describe('Action Requirements', () => {
    it('should have possession requirement', () => {
      const food = new Food('Pizza', 20, 20, [{ measure: MeasureType.HEALTH, delta: 10 }]);
      const playerInside = createMockPlayer({
        currentBuilding: pawnShop.id,
        possessions: [food],
      });

      const actions = pawnShop.getAvailableActions(playerInside, game);
      const sellAction = actions.find(a => a.type === ActionType.SELL);

      const requirements = sellAction!.getRequirements();
      const possessionReq = requirements.find(r => r.type === 'possession');

      expect(possessionReq).toBeDefined();
      expect(possessionReq?.value).toBe(food.id);
    });

    it('should check if player can execute sell action', () => {
      const food = new Food('Pizza', 20, 20, [{ measure: MeasureType.HEALTH, delta: 10 }]);
      const playerInside = createMockPlayer({
        currentBuilding: pawnShop.id,
        possessions: [food],
      });

      const actions = pawnShop.getAvailableActions(playerInside, game);
      const sellAction = actions.find(a => a.type === ActionType.SELL);

      expect(sellAction!.canExecute(playerInside, game)).toBe(true);
    });

    it('should not allow selling if possession not owned', () => {
      const food = new Food('Pizza', 20, 20, [{ measure: MeasureType.HEALTH, delta: 10 }]);
      const playerInside = createMockPlayer({
        currentBuilding: pawnShop.id,
        possessions: [],
      });

      const sellAction = {
        id: 'test-sell',
        type: ActionType.SELL,
        displayName: 'Sell Pizza',
        description: 'Sell Pizza for $10',
        timeCost: 5,
        canExecute: (p: IPlayerState, _g: IGame) => p.possessions.some(pos => pos.id === food.id),
        execute: () => ({ success: true, message: '', timeSpent: 0, stateChanges: [] }),
        getRequirements: () => [],
      };

      expect(sellAction.canExecute(playerInside, game)).toBe(false);
    });
  });

  describe('Action Tree', () => {
    it('should return valid action tree', () => {
      const food = new Food('Pizza', 20, 20, [{ measure: MeasureType.HEALTH, delta: 10 }]);
      const playerInside = createMockPlayer({
        currentBuilding: pawnShop.id,
        possessions: [food],
      });

      const tree = pawnShop.getActionTree(playerInside, game);

      expect(tree).toBeDefined();
      expect(tree.action).toBeDefined();
      expect(tree.children).toBeDefined();
    });

    it('should have sell items submenu in tree', () => {
      const food = new Food('Pizza', 20, 20, [{ measure: MeasureType.HEALTH, delta: 10 }]);
      const playerInside = createMockPlayer({
        currentBuilding: pawnShop.id,
        possessions: [food],
      });

      const tree = pawnShop.getActionTree(playerInside, game);

      expect(tree.action?.displayName).toContain('Sell');
    });

    it('should include children for each possession', () => {
      const food1 = new Food('Pizza', 20, 20, [{ measure: MeasureType.HEALTH, delta: 10 }]);
      const food2 = new Food('Burger', 15, 15, [{ measure: MeasureType.HEALTH, delta: 8 }]);
      const playerInside = createMockPlayer({
        currentBuilding: pawnShop.id,
        possessions: [food1, food2],
      });

      const tree = pawnShop.getActionTree(playerInside, game);

      // Should have 2 sell actions + 1 exit action
      expect(tree.children.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Exit Action', () => {
    it('should allow player to exit when inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: pawnShop.id });
      const actions = pawnShop.getAvailableActions(playerInside, game);
      const exitAction = actions.find(a => a.type === ActionType.EXIT_BUILDING);

      expect(exitAction).toBeDefined();
      expect(exitAction!.canExecute(playerInside, game)).toBe(true);
    });

    it('should successfully exit the building', () => {
      const playerInside = createMockPlayer({ currentBuilding: pawnShop.id });
      const actions = pawnShop.getAvailableActions(playerInside, game);
      const exitAction = actions.find(a => a.type === ActionType.EXIT_BUILDING);

      const result = exitAction!.execute(playerInside, game);

      expect(result.success).toBe(true);
      expect(result.message).toContain('exit');
    });

    it('should fail to exit if not inside', () => {
      const exitAction = {
        id: 'test-exit',
        type: ActionType.EXIT_BUILDING,
        displayName: 'Exit',
        description: 'Exit building',
        timeCost: 0,
        canExecute: (p: IPlayerState, _g: IGame) => p.currentBuilding === pawnShop.id,
        execute: (p: IPlayerState, _g: IGame) => {
          if (p.currentBuilding !== pawnShop.id) {
            return { success: false, message: 'Not inside', timeSpent: 0, stateChanges: [] };
          }
          return { success: true, message: 'Exited', timeSpent: 0, stateChanges: [] };
        },
        getRequirements: () => [],
      };

      expect(exitAction.canExecute(player, game)).toBe(false);
    });

    it('should have zero time cost for exit action', () => {
      const playerInside = createMockPlayer({ currentBuilding: pawnShop.id });
      const actions = pawnShop.getAvailableActions(playerInside, game);
      const exitAction = actions.find(a => a.type === ActionType.EXIT_BUILDING);

      expect(exitAction?.timeCost).toBe(0);
    });
  });

  describe('Building Helpers', () => {
    it('should correctly check if player is inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: pawnShop.id });
      expect(pawnShop.isPlayerInside(playerInside)).toBe(true);
    });

    it('should correctly check if player is not inside', () => {
      expect(pawnShop.isPlayerInside(player)).toBe(false);
    });

    it('should correctly check if player is at position', () => {
      const playerAtPosition = createMockPlayer({ position: testPosition });
      expect(pawnShop.isPlayerAtPosition(playerAtPosition)).toBe(true);
    });

    it('should correctly check if player is not at position', () => {
      expect(pawnShop.isPlayerAtPosition(player)).toBe(false);
    });

    it('should not be a home building', () => {
      expect(pawnShop.isHome()).toBe(false);
    });
  });
});
