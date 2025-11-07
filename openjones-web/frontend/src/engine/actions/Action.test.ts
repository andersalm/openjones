/**
 * Unit tests for Action abstract base class
 *
 * @author Worker 1
 * @date 2025-11-07
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Action } from './Action';
import { ActionResponse } from './ActionResponse';
import {
  ActionType,
  MeasureType,
  type IPlayerState,
  type IGame,
  type IActionResponse,
} from '@shared/types/contracts';
import { MockPlayerState, MockGame, MockJob } from '@shared/mocks';

/**
 * Test implementation of Action for testing purposes
 */
class TestAction extends Action {
  private _canExecute: boolean = true;
  private _executeResult: IActionResponse;

  constructor(
    id: string = 'test-action',
    type: ActionType = ActionType.WORK,
    displayName: string = 'Test Action',
    description: string = 'A test action',
    timeCost: number = 10
  ) {
    super(id, type, displayName, description, timeCost);
    this._executeResult = ActionResponse.success('Action executed', timeCost);
  }

  setCanExecute(value: boolean): void {
    this._canExecute = value;
  }

  setExecuteResult(result: IActionResponse): void {
    this._executeResult = result;
  }

  canExecute(_player: IPlayerState, _game: IGame): boolean {
    return this._canExecute;
  }

  execute(_player: IPlayerState, _game: IGame): IActionResponse {
    return this._executeResult;
  }
}

describe('Action', () => {
  let action: TestAction;
  let player: IPlayerState;
  let game: IGame;

  beforeEach(() => {
    action = new TestAction();
    player = MockPlayerState.create();
    game = MockGame.create();
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(action.id).toBe('test-action');
      expect(action.type).toBe(ActionType.WORK);
      expect(action.displayName).toBe('Test Action');
      expect(action.description).toBe('A test action');
      expect(action.timeCost).toBe(10);
    });

    it('should create action with custom values', () => {
      const customAction = new TestAction(
        'custom-id',
        ActionType.STUDY,
        'Custom Action',
        'Custom description',
        20
      );
      expect(customAction.id).toBe('custom-id');
      expect(customAction.type).toBe(ActionType.STUDY);
      expect(customAction.displayName).toBe('Custom Action');
      expect(customAction.description).toBe('Custom description');
      expect(customAction.timeCost).toBe(20);
    });
  });

  describe('getRequirements', () => {
    it('should return empty array by default', () => {
      const requirements = action.getRequirements();
      expect(requirements).toEqual([]);
    });
  });

  describe('requiresCash', () => {
    it('should return true when player has enough cash', () => {
      player.cash = 1000;
      expect(action['requiresCash'](player, 500)).toBe(true);
    });

    it('should return true when player has exact amount', () => {
      player.cash = 500;
      expect(action['requiresCash'](player, 500)).toBe(true);
    });

    it('should return false when player does not have enough cash', () => {
      player.cash = 100;
      expect(action['requiresCash'](player, 500)).toBe(false);
    });
  });

  describe('requiresMeasure', () => {
    it('should validate health >= requirement', () => {
      player.health = 80;
      expect(action['requiresMeasure'](player, MeasureType.HEALTH, 70, 'gte')).toBe(true);
      expect(action['requiresMeasure'](player, MeasureType.HEALTH, 80, 'gte')).toBe(true);
      expect(action['requiresMeasure'](player, MeasureType.HEALTH, 90, 'gte')).toBe(false);
    });

    it('should validate happiness <= requirement', () => {
      player.happiness = 60;
      expect(action['requiresMeasure'](player, MeasureType.HAPPINESS, 70, 'lte')).toBe(true);
      expect(action['requiresMeasure'](player, MeasureType.HAPPINESS, 60, 'lte')).toBe(true);
      expect(action['requiresMeasure'](player, MeasureType.HAPPINESS, 50, 'lte')).toBe(false);
    });

    it('should validate education == requirement', () => {
      player.education = 50;
      expect(action['requiresMeasure'](player, MeasureType.EDUCATION, 50, 'eq')).toBe(true);
      expect(action['requiresMeasure'](player, MeasureType.EDUCATION, 40, 'eq')).toBe(false);
      expect(action['requiresMeasure'](player, MeasureType.EDUCATION, 60, 'eq')).toBe(false);
    });

    it('should validate career measure', () => {
      player.career = 100;
      expect(action['requiresMeasure'](player, MeasureType.CAREER, 50, 'gte')).toBe(true);
    });

    it('should validate wealth measure (uses cash)', () => {
      player.cash = 5000;
      expect(action['requiresMeasure'](player, MeasureType.WEALTH, 3000, 'gte')).toBe(true);
    });

    it('should default to gte comparison', () => {
      player.health = 80;
      expect(action['requiresMeasure'](player, MeasureType.HEALTH, 70)).toBe(true);
    });
  });

  describe('requiresJob', () => {
    it('should return true when player has a job', () => {
      player.job = MockJob.create();
      expect(action['requiresJob'](player)).toBe(true);
    });

    it('should return false when player has no job', () => {
      player.job = null;
      expect(action['requiresJob'](player)).toBe(false);
    });
  });

  describe('requiresBuilding', () => {
    it('should return true when player is in any building', () => {
      player.currentBuilding = 'building-factory';
      expect(action['requiresBuilding'](player)).toBe(true);
    });

    it('should return false when player is not in a building', () => {
      player.currentBuilding = null;
      expect(action['requiresBuilding'](player)).toBe(false);
    });

    it('should return true when player is in specific building', () => {
      player.currentBuilding = 'building-factory';
      expect(action['requiresBuilding'](player, 'building-factory')).toBe(true);
    });

    it('should return false when player is in different building', () => {
      player.currentBuilding = 'building-bank';
      expect(action['requiresBuilding'](player, 'building-factory')).toBe(false);
    });
  });

  describe('requiresStreet', () => {
    it('should return true when player is on the street', () => {
      player.currentBuilding = null;
      expect(action['requiresStreet'](player)).toBe(true);
    });

    it('should return false when player is in a building', () => {
      player.currentBuilding = 'building-factory';
      expect(action['requiresStreet'](player)).toBe(false);
    });
  });

  describe('requiresPossession', () => {
    it('should return true when player has the possession', () => {
      player.possessions = [
        { id: 'possession-1', type: 'FOOD', name: 'Burger', value: 10, purchasePrice: 15, effects: [] },
      ];
      expect(action['requiresPossession'](player, 'possession-1')).toBe(true);
    });

    it('should return false when player does not have the possession', () => {
      player.possessions = [];
      expect(action['requiresPossession'](player, 'possession-1')).toBe(false);
    });
  });

  describe('hasPossessionType', () => {
    it('should return true when player has possession of type', () => {
      player.possessions = [
        { id: 'possession-1', type: 'FOOD', name: 'Burger', value: 10, purchasePrice: 15, effects: [] },
      ];
      expect(action['hasPossessionType'](player, 'FOOD')).toBe(true);
    });

    it('should return false when player does not have possession of type', () => {
      player.possessions = [
        { id: 'possession-1', type: 'FOOD', name: 'Burger', value: 10, purchasePrice: 15, effects: [] },
      ];
      expect(action['hasPossessionType'](player, 'CLOTHES')).toBe(false);
    });
  });

  describe('getTimeInHours', () => {
    it('should convert time units to hours', () => {
      const action1 = new TestAction('a', ActionType.WORK, 'A', 'A', 5);
      expect(action1.getTimeInHours()).toBe(1);

      const action2 = new TestAction('b', ActionType.WORK, 'B', 'B', 10);
      expect(action2.getTimeInHours()).toBe(2);

      const action3 = new TestAction('c', ActionType.WORK, 'C', 'C', 40);
      expect(action3.getTimeInHours()).toBe(8);
    });
  });

  describe('getTimeDescription', () => {
    it('should return singular hour description', () => {
      const action1 = new TestAction('a', ActionType.WORK, 'A', 'A', 5);
      expect(action1.getTimeDescription()).toBe('1 hour');
    });

    it('should return plural hours description', () => {
      const action2 = new TestAction('b', ActionType.WORK, 'B', 'B', 10);
      expect(action2.getTimeDescription()).toBe('2 hours');

      const action3 = new TestAction('c', ActionType.WORK, 'C', 'C', 40);
      expect(action3.getTimeDescription()).toBe('8 hours');
    });
  });

  describe('canExecute and execute', () => {
    it('should allow subclass to control canExecute', () => {
      action.setCanExecute(true);
      expect(action.canExecute(player, game)).toBe(true);

      action.setCanExecute(false);
      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should allow subclass to control execute result', () => {
      const customResult = ActionResponse.failure('Custom failure');
      action.setExecuteResult(customResult);

      const result = action.execute(player, game);
      expect(result).toBe(customResult);
    });
  });
});
