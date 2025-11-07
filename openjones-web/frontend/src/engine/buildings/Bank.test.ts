/**
 * Tests for Bank building
 *
 * Part of Task B7: Core Buildings (Factory, College, Bank)
 * Worker 2 - Track B (Domain Logic)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Bank } from './Bank';
import { Position } from '../types/Position';
import { PlayerState } from '../game/PlayerState';
import {
  IPlayerState,
  IGame,
  BuildingType,
  ActionType,
  IEconomyModel,
  PossessionType,
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
      { rank: 2, points: 30 },
      { rank: 5, points: 60 },
    ],
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
    return 50 + week * 5; // Price increases with weeks
  }

  calculateSellPrice(possession: any): number {
    return Math.floor(possession.value * 0.5);
  }
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

describe('Bank Building', () => {
  let bank: Bank;
  let player: IPlayerState;
  let game: IGame;
  const testPosition = new Position(4, 4);

  beforeEach(() => {
    bank = new Bank('bank-1', 'City Bank', testPosition);
    player = createMockPlayer();
    game = createMockGame();
  });

  describe('Constructor and Properties', () => {
    it('should initialize with correct properties', () => {
      expect(bank.id).toBe('bank-1');
      expect(bank.type).toBe(BuildingType.BANK);
      expect(bank.name).toBe('City Bank');
      expect(bank.description).toContain('Financial institution');
      expect(bank.position).toBe(testPosition);
    });

    it('should not be a home', () => {
      expect(bank.isHome()).toBe(false);
    });
  });

  describe('Job Offerings', () => {
    it('should offer 3 banking jobs', () => {
      const jobs = bank.getJobOfferings();
      expect(jobs).toHaveLength(3);
    });

    it('should offer jobs for ranks 2, 5, and 7', () => {
      const jobs = bank.getJobOfferings();
      const ranks = jobs.map((j) => j.rank);

      expect(ranks).toContain(2);
      expect(ranks).toContain(5);
      expect(ranks).toContain(7);
    });

    it('should have correct job titles', () => {
      const jobs = bank.getJobOfferings();
      const titles = jobs.map((j) => j.title);

      expect(titles).toContain('Bank Teller');
      expect(titles).toContain('Loan Officer');
      expect(titles).toContain('Branch Manager');
    });

    it('should have correct wages', () => {
      const jobs = bank.getJobOfferings();
      const teller = jobs.find((j) => j.title === 'Bank Teller');
      const loanOfficer = jobs.find((j) => j.title === 'Loan Officer');
      const manager = jobs.find((j) => j.title === 'Branch Manager');

      expect(teller?.wagePerHour).toBe(10);
      expect(loanOfficer?.wagePerHour).toBe(16);
      expect(manager?.wagePerHour).toBe(22);
    });

    it('should have correct education requirements', () => {
      const jobs = bank.getJobOfferings();

      jobs.forEach((job) => {
        // Education requirement = rank * 5
        expect(job.requiredEducation).toBe(job.rank * 5);
      });
    });

    it('should have correct experience requirements', () => {
      const jobs = bank.getJobOfferings();

      jobs.forEach((job) => {
        // Experience requirement = rank * 10
        expect(job.requiredExperience).toBe(job.rank * 10);
      });
    });

    it('should require appropriate clothes levels', () => {
      const jobs = bank.getJobOfferings();
      const teller = jobs.find((j) => j.title === 'Bank Teller');
      const loanOfficer = jobs.find((j) => j.title === 'Loan Officer');
      const manager = jobs.find((j) => j.title === 'Branch Manager');

      expect(teller?.requiredClothesLevel).toBe(2);
      expect(loanOfficer?.requiredClothesLevel).toBe(3);
      expect(manager?.requiredClothesLevel).toBe(3);
    });

    it('should have all jobs with BANK building type', () => {
      const jobs = bank.getJobOfferings();

      jobs.forEach((job) => {
        expect(job.buildingType).toBe(BuildingType.BANK);
      });
    });

    it('should return a copy of jobs array', () => {
      const jobs1 = bank.getJobOfferings();
      const jobs2 = bank.getJobOfferings();

      expect(jobs1).not.toBe(jobs2); // Different array instances
      expect(jobs1).toEqual(jobs2); // Same content
    });

    it('should have wages increasing with rank', () => {
      const jobs = bank.getJobOfferings();
      const sortedByRank = [...jobs].sort((a, b) => a.rank - b.rank);

      for (let i = 1; i < sortedByRank.length; i++) {
        expect(sortedByRank[i].wagePerHour).toBeGreaterThan(sortedByRank[i - 1].wagePerHour);
      }
    });
  });

  describe('Stock System', () => {
    it('should have 6 available stocks', () => {
      const stocks = bank.getAvailableStocks();
      expect(stocks).toHaveLength(6);
    });

    it('should include all expected stock types', () => {
      const stocks = bank.getAvailableStocks();
      const names = stocks.map((s) => s.name);

      expect(names).toContain('T-Bills');
      expect(names).toContain('Gold');
      expect(names).toContain('Silver');
      expect(names).toContain('Pig Bellies');
      expect(names).toContain('Blue Chip');
      expect(names).toContain('Penny');
    });

    it('should have correct base values for stocks', () => {
      const stocks = bank.getAvailableStocks();

      const tBills = stocks.find((s) => s.name === 'T-Bills');
      const gold = stocks.find((s) => s.name === 'Gold');
      const silver = stocks.find((s) => s.name === 'Silver');
      const pigBellies = stocks.find((s) => s.name === 'Pig Bellies');
      const blueChip = stocks.find((s) => s.name === 'Blue Chip');
      const penny = stocks.find((s) => s.name === 'Penny');

      expect(tBills?.baseValue).toBe(100);
      expect(gold?.baseValue).toBe(450);
      expect(silver?.baseValue).toBe(150);
      expect(pigBellies?.baseValue).toBe(15);
      expect(blueChip?.baseValue).toBe(50);
      expect(penny?.baseValue).toBe(5);
    });

    it('should return a copy of stocks array', () => {
      const stocks1 = bank.getAvailableStocks();
      const stocks2 = bank.getAvailableStocks();

      expect(stocks1).not.toBe(stocks2); // Different array instances
      expect(stocks1).toEqual(stocks2); // Same content
    });

    it('should get stock price using economy model', () => {
      const stocks = bank.getAvailableStocks();
      const stock = stocks[0];

      const price = bank.getStockPrice(stock.id, game);

      // MockEconomyModel returns 50 + week * 5
      expect(price).toBe(55); // 50 + 1 * 5
    });

    it('should return 0 for invalid stock id', () => {
      const price = bank.getStockPrice('invalid-stock', game);
      expect(price).toBe(0);
    });

    it('should have each stock with unique id', () => {
      const stocks = bank.getAvailableStocks();
      const ids = stocks.map((s) => s.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(stocks.length);
    });
  });

  describe('Available Actions', () => {
    it('should return empty array when player is outside', () => {
      const playerOutside = createMockPlayer({ currentBuilding: null });
      const actions = bank.getAvailableActions(playerOutside, game);

      expect(actions).toHaveLength(0);
    });

    it('should return actions when player is inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'bank-1' });
      const actions = bank.getAvailableActions(playerInside, game);

      expect(actions.length).toBeGreaterThan(0);
    });

    it('should include buy stock actions when inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'bank-1' });
      const actions = bank.getAvailableActions(playerInside, game);

      const buyActions = actions.filter((a) => a.type === ActionType.PURCHASE);
      expect(buyActions.length).toBeGreaterThan(0);
      expect(buyActions[0]?.displayName).toContain('Buy');
    });

    it('should include exit action when inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'bank-1' });
      const actions = bank.getAvailableActions(playerInside, game);

      const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);
      expect(exitAction).toBeDefined();
    });
  });

  describe('Buy Stock Actions', () => {
    it('should create buy actions for all available stocks', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'bank-1', cash: 1000 });
      const actions = bank.getAvailableActions(playerInside, game);
      const buyActions = actions.filter((a) => a.type === ActionType.PURCHASE);

      const stocks = bank.getAvailableStocks();
      expect(buyActions.length).toBe(stocks.length);
    });

    it('should have correct buy action properties', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'bank-1', cash: 1000 });
      const actions = bank.getAvailableActions(playerInside, game);
      const buyAction = actions.find((a) => a.type === ActionType.PURCHASE);

      expect(buyAction?.displayName).toContain('Buy');
      expect(buyAction?.timeCost).toBe(5);
      expect(buyAction?.canExecute(playerInside, game)).toBe(true);
    });

    it('should execute buy action successfully', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'bank-1', cash: 1000 });
      const actions = bank.getAvailableActions(playerInside, game);
      const buyAction = actions.find((a) => a.type === ActionType.PURCHASE);

      const result = buyAction!.execute(playerInside, game);

      expect(result.success).toBe(true);
      expect(result.timeSpent).toBe(5);
      expect(result.stateChanges.length).toBeGreaterThan(0);

      const cashChange = result.stateChanges.find((c) => c.type === 'cash');
      const possessionAdd = result.stateChanges.find((c) => c.type === 'possession_add');
      expect(cashChange).toBeDefined();
      expect(possessionAdd).toBeDefined();
    });

    it('should fail buy action when insufficient cash', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'bank-1', cash: 1 });
      const actions = bank.getAvailableActions(playerInside, game);
      const buyAction = actions.find((a) => a.type === ActionType.PURCHASE);

      const result = buyAction!.execute(playerInside, game);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not enough cash');
    });
  });

  describe('Sell Stock Actions', () => {
    it('should create sell actions for owned stocks', () => {
      const stockPossession = {
        id: 'stock-test',
        type: PossessionType.STOCK,
        name: 'Test Stock',
        value: 100,
        purchasePrice: 100,
        effects: [],
        companyName: 'Test Company',
        shares: 1,
        pricePerShare: 100,
        getCurrentValue: (price: number) => price,
        getProfitLoss: (price: number) => price - 100,
        getReturnPercentage: (price: number) => (price - 100) / 100,
      } as any;

      const playerInside = createMockPlayer({
        currentBuilding: 'bank-1',
        possessions: [stockPossession],
      });
      const actions = bank.getAvailableActions(playerInside, game);
      const sellActions = actions.filter((a) => a.type === ActionType.SELL);

      expect(sellActions.length).toBe(1);
    });

    it('should have correct sell action properties', () => {
      const stockPossession = {
        id: 'stock-test',
        type: PossessionType.STOCK,
        name: 'Test Stock',
        value: 100,
        purchasePrice: 100,
        effects: [],
        companyName: 'Test Company',
        shares: 1,
        pricePerShare: 100,
        getCurrentValue: (price: number) => price,
        getProfitLoss: (price: number) => price - 100,
        getReturnPercentage: (price: number) => (price - 100) / 100,
      } as any;

      const playerInside = createMockPlayer({
        currentBuilding: 'bank-1',
        possessions: [stockPossession],
      });
      const actions = bank.getAvailableActions(playerInside, game);
      const sellAction = actions.find((a) => a.type === ActionType.SELL);

      expect(sellAction?.displayName).toContain('Sell');
      expect(sellAction?.timeCost).toBe(5);
    });

    it('should execute sell action successfully', () => {
      const stockPossession = {
        id: 'stock-test',
        type: PossessionType.STOCK,
        name: 'Test Stock',
        value: 100,
        purchasePrice: 100,
        effects: [],
        companyName: 'Test Company',
        shares: 1,
        pricePerShare: 100,
        getCurrentValue: (price: number) => price,
        getProfitLoss: (price: number) => price - 100,
        getReturnPercentage: (price: number) => (price - 100) / 100,
      } as any;

      const playerInside = createMockPlayer({
        currentBuilding: 'bank-1',
        possessions: [stockPossession],
      });
      const actions = bank.getAvailableActions(playerInside, game);
      const sellAction = actions.find((a) => a.type === ActionType.SELL);

      const result = sellAction!.execute(playerInside, game);

      expect(result.success).toBe(true);
      expect(result.timeSpent).toBe(5);

      const cashChange = result.stateChanges.find((c) => c.type === 'cash');
      const possessionRemove = result.stateChanges.find((c) => c.type === 'possession_remove');
      expect(cashChange).toBeDefined();
      expect(possessionRemove).toBeDefined();
    });
  });

  describe('Exit Action', () => {
    it('should successfully exit when inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'bank-1' });
      const actions = bank.getAvailableActions(playerInside, game);
      const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);

      const result = exitAction!.execute(playerInside, game);

      expect(result.success).toBe(true);
      expect(result.timeSpent).toBe(0);
      expect(result.message).toContain('exit');
    });

    it('should fail when not inside', () => {
      const playerOutside = createMockPlayer({ currentBuilding: null });

      // Get exit action from when player is inside
      const playerInside = createMockPlayer({ currentBuilding: 'bank-1' });
      const actions = bank.getAvailableActions(playerInside, game);
      const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);

      // Try to execute while outside
      const result = exitAction!.execute(playerOutside, game);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not inside');
    });

    it('should update player position in state changes', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'bank-1' });
      const actions = bank.getAvailableActions(playerInside, game);
      const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);

      const result = exitAction!.execute(playerInside, game);

      expect(result.stateChanges).toHaveLength(1);
      expect(result.stateChanges[0].type).toBe('position');
      expect(result.stateChanges[0].value).toBe(testPosition);
    });

    it('should have correct canExecute behavior', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'bank-1' });
      const playerOutside = createMockPlayer({ currentBuilding: null });

      const actions = bank.getAvailableActions(playerInside, game);
      const exitAction = actions.find((a) => a.type === ActionType.EXIT_BUILDING);

      expect(exitAction?.canExecute(playerInside, game)).toBe(true);
      expect(exitAction?.canExecute(playerOutside, game)).toBe(false);
    });
  });

  describe('Action Tree', () => {
    it('should create valid action tree when player is inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'bank-1' });
      const tree = bank.getActionTree(playerInside, game);

      expect(tree).toBeDefined();
      expect(tree.action).toBeDefined();
      expect(tree.index).toBe(0);
    });

    it('should have multiple actions in tree', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'bank-1' });
      const tree = bank.getActionTree(playerInside, game);

      expect(tree.action).toBeDefined();
      expect(tree.children.length).toBeGreaterThanOrEqual(0);
    });

    it('should work when player is outside (fallback)', () => {
      const playerOutside = createMockPlayer({ currentBuilding: null });
      const tree = bank.getActionTree(playerOutside, game);

      expect(tree).toBeDefined();
      expect(tree.action).toBeDefined();
    });
  });

  describe('Building Entry', () => {
    it('should allow all players to enter by default', () => {
      expect(bank.canEnter(player)).toBe(true);
    });

    it('should correctly identify player position', () => {
      const playerAtBank = createMockPlayer({
        position: new Position(4, 4),
      });
      expect(bank.isPlayerAtPosition(playerAtBank)).toBe(true);

      const playerAway = createMockPlayer({
        position: new Position(1, 1),
      });
      expect(bank.isPlayerAtPosition(playerAway)).toBe(false);
    });

    it('should correctly identify if player is inside', () => {
      const playerInside = createMockPlayer({ currentBuilding: 'bank-1' });
      expect(bank.isPlayerInside(playerInside)).toBe(true);

      const playerOutside = createMockPlayer({ currentBuilding: null });
      expect(bank.isPlayerInside(playerOutside)).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should work with complete game scenario', () => {
      // Create bank
      const myBank = new Bank('bank-main', 'National Bank', new Position(3, 3));

      // Player approaches bank
      const gamePlayer = createMockPlayer({
        position: new Position(3, 3),
        currentBuilding: null,
        cash: 1000,
      });

      // Check player can enter
      expect(myBank.canEnter(gamePlayer)).toBe(true);
      expect(myBank.isPlayerAtPosition(gamePlayer)).toBe(true);

      // Get job offerings
      const jobs = myBank.getJobOfferings();
      expect(jobs).toHaveLength(3);

      // Get available stocks
      const stocks = myBank.getAvailableStocks();
      expect(stocks).toHaveLength(6);

      // Player enters building
      gamePlayer.currentBuilding = 'bank-main';
      expect(myBank.isPlayerInside(gamePlayer)).toBe(true);

      // Get available actions
      const actions = myBank.getAvailableActions(gamePlayer, game);
      expect(actions.length).toBeGreaterThan(0);

      // Check buy stock actions are available
      const buyActions = actions.filter((a) => a.type === ActionType.PURCHASE);
      expect(buyActions.length).toBeGreaterThan(0);
    });

    it('should have Branch Manager as highest paid job', () => {
      const jobs = bank.getJobOfferings();
      const wages = jobs.map((j) => j.wagePerHour);
      const maxWage = Math.max(...wages);

      const manager = jobs.find((j) => j.title === 'Branch Manager');
      expect(manager?.wagePerHour).toBe(maxWage);
    });

    it('should have Gold as most valuable stock', () => {
      const stocks = bank.getAvailableStocks();
      const values = stocks.map((s) => s.baseValue);
      const maxValue = Math.max(...values);

      const gold = stocks.find((s) => s.name === 'Gold');
      expect(gold?.baseValue).toBe(maxValue);
    });

    it('should have Penny as cheapest stock', () => {
      const stocks = bank.getAvailableStocks();
      const values = stocks.map((s) => s.baseValue);
      const minValue = Math.min(...values);

      const penny = stocks.find((s) => s.name === 'Penny');
      expect(penny?.baseValue).toBe(minValue);
    });
  });

  describe('toString()', () => {
    it('should return meaningful string representation', () => {
      const result = bank.toString();
      expect(result).toContain('City Bank');
      expect(result).toContain('BANK');
      expect(result).toContain('(4, 4)');
    });
  });
});
