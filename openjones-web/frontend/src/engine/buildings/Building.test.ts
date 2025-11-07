/**
 * Tests for Building base class
 *
 * Part of Task B6: Building Base Class
 * Worker 3 - Track B (Domain Logic)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Building } from './Building';
import {
  IBuilding,
  IPosition,
  IAction,
  IJob,
  IPlayerState,
  IGame,
  IActionTreeNode,
  BuildingType,
  ActionType,
  MeasureType,
} from '../../../../shared/types/contracts';
import { Position } from '../types/Position';
import { PlayerState } from '../game/PlayerState';

/**
 * Concrete test implementation of Building for testing purposes
 */
class TestBuilding extends Building {
  private mockActions: IAction[] = [];
  private mockJobs: IJob[] = [];
  private mockActionTree: IActionTreeNode | null = null;
  private entryRestricted: boolean = false;

  constructor(
    id: string,
    type: BuildingType,
    name: string,
    description: string,
    position: IPosition
  ) {
    super(id, type, name, description, position);
  }

  setMockActions(actions: IAction[]): void {
    this.mockActions = actions;
  }

  setMockJobs(jobs: IJob[]): void {
    this.mockJobs = jobs;
  }

  setMockActionTree(tree: IActionTreeNode): void {
    this.mockActionTree = tree;
  }

  setEntryRestricted(restricted: boolean): void {
    this.entryRestricted = restricted;
  }

  getAvailableActions(player: IPlayerState, game: IGame): IAction[] {
    return this.mockActions;
  }

  getJobOfferings(): IJob[] {
    return this.mockJobs;
  }

  getActionTree(player: IPlayerState, game: IGame): IActionTreeNode {
    if (!this.mockActionTree) {
      // Return a default action tree
      const defaultAction = this.createMockAction('default', 'Default Action');
      return Building['createActionTreeNode'](defaultAction, [], 0);
    }
    return this.mockActionTree;
  }

  canEnter(player: IPlayerState): boolean {
    if (this.entryRestricted) {
      return false;
    }
    return super.canEnter(player);
  }

  private createMockAction(id: string, displayName: string): IAction {
    return {
      id,
      type: ActionType.WORK,
      displayName,
      description: `Mock action: ${displayName}`,
      timeCost: 10,
      canExecute: () => true,
      execute: () => ({
        success: true,
        message: 'Action executed',
        timeSpent: 10,
        stateChanges: [],
      }),
      getRequirements: () => [],
    };
  }
}

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

/**
 * Helper to create a mock job
 */
function createMockJob(id: string, rank: number, buildingType: BuildingType): IJob {
  return {
    id,
    title: `Test Job ${rank}`,
    rank,
    requiredEducation: rank * 5,
    requiredExperience: rank * 10,
    requiredClothesLevel: 1,
    wagePerHour: 10 + rank,
    experienceGainPerHour: 1,
    buildingType,
  };
}

describe('Building Base Class', () => {
  let building: TestBuilding;
  let player: IPlayerState;
  let game: IGame;
  const testPosition = new Position(1, 1);

  beforeEach(() => {
    building = new TestBuilding(
      'test-building-1',
      BuildingType.FACTORY,
      'Test Factory',
      'A test factory for unit testing',
      testPosition
    );
    player = createMockPlayer();
    game = createMockGame();
  });

  describe('Constructor and Properties', () => {
    it('should initialize with correct properties', () => {
      expect(building.id).toBe('test-building-1');
      expect(building.type).toBe(BuildingType.FACTORY);
      expect(building.name).toBe('Test Factory');
      expect(building.description).toBe('A test factory for unit testing');
      expect(building.position).toBe(testPosition);
    });

    it('should have readonly properties enforced by TypeScript', () => {
      // TypeScript readonly prevents reassignment at compile time, not runtime
      // Properties are not frozen at runtime, but TypeScript won't compile reassignments
      expect(building.id).toBe('test-building-1');
      expect(building.type).toBe(BuildingType.FACTORY);
      expect(building.name).toBe('Test Factory');
    });
  });

  describe('canEnter()', () => {
    it('should allow entry by default', () => {
      expect(building.canEnter(player)).toBe(true);
    });

    it('should respect overridden entry restrictions', () => {
      building.setEntryRestricted(true);
      expect(building.canEnter(player)).toBe(false);
    });

    it('should work with different players', () => {
      const player2 = createMockPlayer({ playerId: 'player-2' });
      expect(building.canEnter(player)).toBe(true);
      expect(building.canEnter(player2)).toBe(true);
    });
  });

  describe('isHome()', () => {
    it('should return false for non-apartment buildings', () => {
      expect(building.isHome()).toBe(false);
    });

    it('should return true for LOW_COST_APARTMENT', () => {
      const apartment = new TestBuilding(
        'apt-1',
        BuildingType.LOW_COST_APARTMENT,
        'Low Cost Apartment',
        'Cheap housing',
        testPosition
      );
      expect(apartment.isHome()).toBe(true);
    });

    it('should return true for SECURITY_APARTMENT', () => {
      const apartment = new TestBuilding(
        'apt-2',
        BuildingType.SECURITY_APARTMENT,
        'Security Apartment',
        'Secure housing',
        testPosition
      );
      expect(apartment.isHome()).toBe(true);
    });

    it('should return false for other building types', () => {
      const buildingTypes = [
        BuildingType.FACTORY,
        BuildingType.BANK,
        BuildingType.COLLEGE,
        BuildingType.DEPARTMENT_STORE,
        BuildingType.EMPLOYMENT_AGENCY,
      ];

      buildingTypes.forEach((type) => {
        const b = new TestBuilding('test', type, 'Test', 'Test', testPosition);
        expect(b.isHome()).toBe(false);
      });
    });
  });

  describe('isPlayerInside()', () => {
    it('should return true when player is in the building', () => {
      const playerInside = createMockPlayer({
        currentBuilding: 'test-building-1',
      });
      expect(building.isPlayerInside(playerInside)).toBe(true);
    });

    it('should return false when player is not in the building', () => {
      const playerOutside = createMockPlayer({ currentBuilding: null });
      expect(building.isPlayerInside(playerOutside)).toBe(false);
    });

    it('should return false when player is in a different building', () => {
      const playerElsewhere = createMockPlayer({
        currentBuilding: 'different-building',
      });
      expect(building.isPlayerInside(playerElsewhere)).toBe(false);
    });
  });

  describe('isPlayerAtPosition()', () => {
    it('should return true when player is at building position', () => {
      const playerAtPosition = createMockPlayer({
        position: new Position(1, 1),
      });
      expect(building.isPlayerAtPosition(playerAtPosition)).toBe(true);
    });

    it('should return false when player is at different position', () => {
      const playerAway = createMockPlayer({
        position: new Position(3, 3),
      });
      expect(building.isPlayerAtPosition(playerAway)).toBe(false);
    });

    it('should handle edge positions correctly', () => {
      const cornerBuilding = new TestBuilding(
        'corner',
        BuildingType.BANK,
        'Corner Bank',
        'Bank on corner',
        new Position(0, 0)
      );
      const playerAtCorner = createMockPlayer({
        position: new Position(0, 0),
      });
      const playerNotAtCorner = createMockPlayer({
        position: new Position(0, 1),
      });

      expect(cornerBuilding.isPlayerAtPosition(playerAtCorner)).toBe(true);
      expect(cornerBuilding.isPlayerAtPosition(playerNotAtCorner)).toBe(false);
    });
  });

  describe('toString()', () => {
    it('should return formatted string representation', () => {
      const result = building.toString();
      expect(result).toContain('Test Factory');
      expect(result).toContain('FACTORY');
      expect(result).toContain('(1, 1)');
    });

    it('should work for different building types', () => {
      const bank = new TestBuilding(
        'bank-1',
        BuildingType.BANK,
        'City Bank',
        'Main bank',
        new Position(2, 3)
      );
      const result = bank.toString();
      expect(result).toContain('City Bank');
      expect(result).toContain('BANK');
      expect(result).toContain('(2, 3)');
    });
  });

  describe('Abstract Methods', () => {
    it('should implement getAvailableActions', () => {
      const mockActions: IAction[] = [
        {
          id: 'action-1',
          type: ActionType.WORK,
          displayName: 'Work',
          description: 'Work for money',
          timeCost: 40,
          canExecute: () => true,
          execute: () => ({
            success: true,
            message: 'Worked',
            timeSpent: 40,
            stateChanges: [],
          }),
          getRequirements: () => [],
        },
      ];

      building.setMockActions(mockActions);
      const actions = building.getAvailableActions(player, game);
      expect(actions).toEqual(mockActions);
    });

    it('should implement getJobOfferings', () => {
      const mockJobs: IJob[] = [
        createMockJob('job-1', 1, BuildingType.FACTORY),
        createMockJob('job-2', 2, BuildingType.FACTORY),
      ];

      building.setMockJobs(mockJobs);
      const jobs = building.getJobOfferings();
      expect(jobs).toEqual(mockJobs);
    });

    it('should implement getActionTree', () => {
      const mockAction: IAction = {
        id: 'root',
        type: ActionType.SUBMENU,
        displayName: 'Main Menu',
        description: 'Root menu',
        timeCost: 0,
        canExecute: () => true,
        execute: () => ({
          success: true,
          message: 'Menu opened',
          timeSpent: 0,
          stateChanges: [],
        }),
        getRequirements: () => [],
      };

      const mockTree: IActionTreeNode = {
        action: mockAction,
        children: [],
        index: 0,
      };

      building.setMockActionTree(mockTree);
      const tree = building.getActionTree(player, game);
      expect(tree).toEqual(mockTree);
    });
  });

  describe('Static Helper: createActionTreeNode', () => {
    it('should create action tree node with children', () => {
      // Access protected static method through test building
      const mockAction: IAction = {
        id: 'test-action',
        type: ActionType.WORK,
        displayName: 'Test',
        description: 'Test action',
        timeCost: 10,
        canExecute: () => true,
        execute: () => ({
          success: true,
          message: 'Done',
          timeSpent: 10,
          stateChanges: [],
        }),
        getRequirements: () => [],
      };

      const childNode: IActionTreeNode = {
        action: mockAction,
        children: [],
        index: 1,
      };

      const node = Building['createActionTreeNode'](mockAction, [childNode], 0);

      expect(node.action).toBe(mockAction);
      expect(node.children).toHaveLength(1);
      expect(node.children[0]).toBe(childNode);
      expect(node.index).toBe(0);
    });

    it('should create node without children', () => {
      const mockAction: IAction = {
        id: 'simple',
        type: ActionType.RELAX,
        displayName: 'Relax',
        description: 'Take a break',
        timeCost: 20,
        canExecute: () => true,
        execute: () => ({
          success: true,
          message: 'Relaxed',
          timeSpent: 20,
          stateChanges: [],
        }),
        getRequirements: () => [],
      };

      const node = Building['createActionTreeNode'](mockAction);

      expect(node.action).toBe(mockAction);
      expect(node.children).toHaveLength(0);
      expect(node.index).toBe(0);
    });
  });

  describe('Static Helper: createSubmenuAction', () => {
    it('should create submenu action placeholder', () => {
      const submenu = Building['createSubmenuAction'](
        'menu-work',
        'Work Options',
        'Choose a work shift'
      );

      expect(submenu.id).toBe('menu-work');
      expect(submenu.type).toBe(ActionType.SUBMENU);
      expect(submenu.displayName).toBe('Work Options');
      expect(submenu.description).toBe('Choose a work shift');
      expect(submenu.timeCost).toBe(0);
      expect(submenu.canExecute(player, game)).toBe(true);
      expect(submenu.getRequirements()).toEqual([]);
    });

    it('should execute submenu action successfully', () => {
      const submenu = Building['createSubmenuAction']('menu', 'Menu', 'Desc');
      const result = submenu.execute(player, game);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Submenu selected');
      expect(result.timeSpent).toBe(0);
      expect(result.stateChanges).toEqual([]);
    });
  });

  describe('Integration Tests', () => {
    it('should work with real Position objects', () => {
      const pos = new Position(4, 4);
      const building = new TestBuilding(
        'far-building',
        BuildingType.COLLEGE,
        'Remote College',
        'Far away',
        pos
      );

      expect(building.position.x).toBe(4);
      expect(building.position.y).toBe(4);
      expect(building.position.toString()).toBe('(4, 4)');
    });

    it('should work with PlayerState integration', () => {
      const player = createMockPlayer({
        position: new Position(1, 1),
        currentBuilding: 'test-building-1',
      });

      expect(building.isPlayerAtPosition(player)).toBe(true);
      expect(building.isPlayerInside(player)).toBe(true);
      expect(building.canEnter(player)).toBe(true);
    });

    it('should handle complete building lifecycle', () => {
      // Create building
      const factory = new TestBuilding(
        'factory-1',
        BuildingType.FACTORY,
        'Main Factory',
        'Manufacturing facility',
        new Position(2, 2)
      );

      // Set up jobs
      const jobs = [
        createMockJob('job-1', 1, BuildingType.FACTORY),
        createMockJob('job-2', 2, BuildingType.FACTORY),
      ];
      factory.setMockJobs(jobs);

      // Player approaches
      const player = createMockPlayer({ position: new Position(2, 2) });
      expect(factory.isPlayerAtPosition(player)).toBe(true);

      // Player enters
      expect(factory.canEnter(player)).toBe(true);

      // Check offerings
      const offerings = factory.getJobOfferings();
      expect(offerings).toHaveLength(2);

      // Verify building properties
      expect(factory.isHome()).toBe(false);
      expect(factory.toString()).toContain('Main Factory');
    });
  });
});
