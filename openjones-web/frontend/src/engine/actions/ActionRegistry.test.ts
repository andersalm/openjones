/**
 * Unit tests for ActionRegistry
 *
 * @author Worker 1
 * @date 2025-11-07
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  ActionRegistry,
  getActionRegistry,
  registerAction,
  createAction,
} from './ActionRegistry';
import { ActionType, type IAction } from '@shared/types/contracts';
import { MockAction } from '@shared/mocks';

describe('ActionRegistry', () => {
  let registry: ActionRegistry;

  beforeEach(() => {
    registry = ActionRegistry.getInstance();
    registry.clear();
  });

  afterEach(() => {
    registry.clear();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = ActionRegistry.getInstance();
      const instance2 = ActionRegistry.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('register', () => {
    it('should register an action type', () => {
      const factory = () => MockAction.create({ id: 'test' });
      registry.register('test-action', ActionType.WORK, factory, 'Test action');

      expect(registry.has('test-action')).toBe(true);
    });

    it('should store correct metadata', () => {
      const factory = () => MockAction.create({ id: 'test' });
      registry.register(
        'test-action',
        ActionType.WORK,
        factory,
        'Test action',
        'test-category'
      );

      const metadata = registry.getMetadata('test-action');
      expect(metadata).toBeDefined();
      expect(metadata?.type).toBe(ActionType.WORK);
      expect(metadata?.description).toBe('Test action');
      expect(metadata?.category).toBe('test-category');
      expect(metadata?.factory).toBe(factory);
    });

    it('should throw error when registering duplicate id', () => {
      const factory = () => MockAction.create();
      registry.register('duplicate', ActionType.WORK, factory, 'First');

      expect(() => {
        registry.register('duplicate', ActionType.WORK, factory, 'Second');
      }).toThrow("Action with id 'duplicate' is already registered");
    });
  });

  describe('registerClass', () => {
    class TestAction extends MockAction {
      constructor(public customProp: string) {
        super();
      }
    }

    it('should register an action class constructor', () => {
      registry.registerClass('test-class', ActionType.WORK, TestAction, 'Test class');

      expect(registry.has('test-class')).toBe(true);
    });

    it('should create instances from registered class', () => {
      registry.registerClass('test-class', ActionType.WORK, TestAction, 'Test class');

      const instance = registry.create('test-class', 'custom-value') as TestAction;
      expect(instance).toBeInstanceOf(TestAction);
      expect(instance.customProp).toBe('custom-value');
    });
  });

  describe('create', () => {
    it('should create action instance from factory', () => {
      const factory = (id: string) => MockAction.create({ id });
      registry.register('create-test', ActionType.WORK, factory, 'Test');

      const action = registry.create('create-test', 'my-action');
      expect(action.id).toBe('my-action');
    });

    it('should pass multiple arguments to factory', () => {
      const factory = (a: number, b: number) =>
        MockAction.create({ id: `sum-${a + b}` });
      registry.register('multi-arg', ActionType.WORK, factory, 'Test');

      const action = registry.create('multi-arg', 5, 10);
      expect(action.id).toBe('sum-15');
    });

    it('should throw error for unregistered action', () => {
      expect(() => {
        registry.create('not-registered');
      }).toThrow("Action with id 'not-registered' is not registered");
    });
  });

  describe('has', () => {
    it('should return true for registered action', () => {
      registry.register('exists', ActionType.WORK, () => MockAction.create(), 'Test');
      expect(registry.has('exists')).toBe(true);
    });

    it('should return false for unregistered action', () => {
      expect(registry.has('not-exists')).toBe(false);
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for registered action', () => {
      const factory = () => MockAction.create();
      registry.register('meta-test', ActionType.STUDY, factory, 'Meta test', 'category-1');

      const metadata = registry.getMetadata('meta-test');
      expect(metadata).toBeDefined();
      expect(metadata?.type).toBe(ActionType.STUDY);
      expect(metadata?.description).toBe('Meta test');
      expect(metadata?.category).toBe('category-1');
    });

    it('should return undefined for unregistered action', () => {
      const metadata = registry.getMetadata('not-exists');
      expect(metadata).toBeUndefined();
    });
  });

  describe('getAllIds', () => {
    it('should return all registered action IDs', () => {
      registry.register('action-1', ActionType.WORK, () => MockAction.create(), 'A1');
      registry.register('action-2', ActionType.STUDY, () => MockAction.create(), 'A2');
      registry.register('action-3', ActionType.RELAX, () => MockAction.create(), 'A3');

      const ids = registry.getAllIds();
      expect(ids).toContain('action-1');
      expect(ids).toContain('action-2');
      expect(ids).toContain('action-3');
      expect(ids).toHaveLength(3);
    });

    it('should return empty array when no actions registered', () => {
      const ids = registry.getAllIds();
      expect(ids).toEqual([]);
    });
  });

  describe('getByType', () => {
    beforeEach(() => {
      registry.register('work-1', ActionType.WORK, () => MockAction.create(), 'W1');
      registry.register('work-2', ActionType.WORK, () => MockAction.create(), 'W2');
      registry.register('study-1', ActionType.STUDY, () => MockAction.create(), 'S1');
      registry.register('relax-1', ActionType.RELAX, () => MockAction.create(), 'R1');
    });

    it('should return actions of specific type', () => {
      const workActions = registry.getByType(ActionType.WORK);
      expect(workActions).toContain('work-1');
      expect(workActions).toContain('work-2');
      expect(workActions).toHaveLength(2);
    });

    it('should return empty array for type with no actions', () => {
      const moveActions = registry.getByType(ActionType.MOVE);
      expect(moveActions).toEqual([]);
    });
  });

  describe('getByCategory', () => {
    beforeEach(() => {
      registry.register('a1', ActionType.WORK, () => MockAction.create(), 'A1', 'cat-a');
      registry.register('a2', ActionType.STUDY, () => MockAction.create(), 'A2', 'cat-a');
      registry.register('b1', ActionType.RELAX, () => MockAction.create(), 'B1', 'cat-b');
      registry.register('no-cat', ActionType.WORK, () => MockAction.create(), 'NC');
    });

    it('should return actions of specific category', () => {
      const catA = registry.getByCategory('cat-a');
      expect(catA).toContain('a1');
      expect(catA).toContain('a2');
      expect(catA).toHaveLength(2);
    });

    it('should return empty array for category with no actions', () => {
      const catC = registry.getByCategory('cat-c');
      expect(catC).toEqual([]);
    });
  });

  describe('unregister', () => {
    it('should remove registered action', () => {
      registry.register('to-remove', ActionType.WORK, () => MockAction.create(), 'Test');
      expect(registry.has('to-remove')).toBe(true);

      const removed = registry.unregister('to-remove');
      expect(removed).toBe(true);
      expect(registry.has('to-remove')).toBe(false);
    });

    it('should return false when removing non-existent action', () => {
      const removed = registry.unregister('not-exists');
      expect(removed).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all registered actions', () => {
      registry.register('action-1', ActionType.WORK, () => MockAction.create(), 'A1');
      registry.register('action-2', ActionType.STUDY, () => MockAction.create(), 'A2');
      expect(registry.size).toBe(2);

      registry.clear();
      expect(registry.size).toBe(0);
      expect(registry.has('action-1')).toBe(false);
      expect(registry.has('action-2')).toBe(false);
    });
  });

  describe('size', () => {
    it('should return number of registered actions', () => {
      expect(registry.size).toBe(0);

      registry.register('action-1', ActionType.WORK, () => MockAction.create(), 'A1');
      expect(registry.size).toBe(1);

      registry.register('action-2', ActionType.STUDY, () => MockAction.create(), 'A2');
      expect(registry.size).toBe(2);

      registry.unregister('action-1');
      expect(registry.size).toBe(1);
    });
  });

  describe('validate', () => {
    it('should validate a valid action', () => {
      const action = MockAction.create();
      expect(ActionRegistry.validate(action)).toBe(true);
    });

    it('should reject action without id', () => {
      const action = MockAction.create();
      (action as any).id = undefined;
      expect(ActionRegistry.validate(action)).toBe(false);
    });

    it('should reject action with non-string id', () => {
      const action = MockAction.create();
      (action as any).id = 123;
      expect(ActionRegistry.validate(action)).toBe(false);
    });

    it('should reject action without type', () => {
      const action = MockAction.create();
      (action as any).type = undefined;
      expect(ActionRegistry.validate(action)).toBe(false);
    });

    it('should reject action without displayName', () => {
      const action = MockAction.create();
      (action as any).displayName = '';
      expect(ActionRegistry.validate(action)).toBe(false);
    });

    it('should reject action with negative timeCost', () => {
      const action = MockAction.create();
      (action as any).timeCost = -5;
      expect(ActionRegistry.validate(action)).toBe(false);
    });

    it('should reject action without canExecute method', () => {
      const action = MockAction.create();
      (action as any).canExecute = undefined;
      expect(ActionRegistry.validate(action)).toBe(false);
    });

    it('should reject action without execute method', () => {
      const action = MockAction.create();
      (action as any).execute = undefined;
      expect(ActionRegistry.validate(action)).toBe(false);
    });

    it('should reject action without getRequirements method', () => {
      const action = MockAction.create();
      (action as any).getRequirements = undefined;
      expect(ActionRegistry.validate(action)).toBe(false);
    });
  });
});

describe('Helper functions', () => {
  let registry: ActionRegistry;

  beforeEach(() => {
    registry = ActionRegistry.getInstance();
    registry.clear();
  });

  afterEach(() => {
    registry.clear();
  });

  describe('getActionRegistry', () => {
    it('should return the singleton registry instance', () => {
      const instance = getActionRegistry();
      expect(instance).toBe(ActionRegistry.getInstance());
    });
  });

  describe('registerAction', () => {
    it('should register action using helper function', () => {
      const factory = () => MockAction.create({ id: 'test' });
      registerAction('helper-test', ActionType.WORK, factory, 'Helper test');

      expect(registry.has('helper-test')).toBe(true);
    });
  });

  describe('createAction', () => {
    it('should create action using helper function', () => {
      const factory = (id: string) => MockAction.create({ id });
      registerAction('create-helper', ActionType.WORK, factory, 'Create helper');

      const action = createAction('create-helper', 'my-id');
      expect(action.id).toBe('my-id');
    });
  });
});
