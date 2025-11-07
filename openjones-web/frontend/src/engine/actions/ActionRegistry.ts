/**
 * ActionRegistry - Factory and registry for game actions
 *
 * This class manages the registration and creation of action instances.
 * It provides:
 * - Action registration by type
 * - Action factory methods
 * - Action validation
 * - Action lookup and discovery
 *
 * Part of Task A4: Base Action Classes
 * Worker 1 - Track A (Core Engine)
 */

import { IAction, ActionType } from '@shared/types/contracts';

/**
 * Type for action factory functions
 */
export type ActionFactory = (...args: any[]) => IAction;

/**
 * Type for action constructor
 */
export interface ActionConstructor {
  new (...args: any[]): IAction;
}

/**
 * Action metadata for registration
 */
export interface ActionMetadata {
  type: ActionType;
  factory: ActionFactory;
  description: string;
  category?: string;
}

/**
 * ActionRegistry - Singleton registry for managing action types
 *
 * Usage:
 * ```
 * // Register an action type
 * ActionRegistry.getInstance().register(
 *   'move-to-position',
 *   ActionType.MOVE,
 *   (from, to) => new MovementAction(from, to),
 *   'Move from one position to another'
 * );
 *
 * // Create an action
 * const action = ActionRegistry.getInstance().create('move-to-position', startPos, endPos);
 * ```
 */
export class ActionRegistry {
  private static instance: ActionRegistry;
  private registry: Map<string, ActionMetadata> = new Map();

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): ActionRegistry {
    if (!ActionRegistry.instance) {
      ActionRegistry.instance = new ActionRegistry();
    }
    return ActionRegistry.instance;
  }

  /**
   * Register an action type
   *
   * @param id Unique identifier for this action type
   * @param type The ActionType enum value
   * @param factory Factory function to create instances
   * @param description Human-readable description
   * @param category Optional category for grouping
   */
  register(
    id: string,
    type: ActionType,
    factory: ActionFactory,
    description: string,
    category?: string
  ): void {
    if (this.registry.has(id)) {
      throw new Error(`Action with id '${id}' is already registered`);
    }

    this.registry.set(id, {
      type,
      factory,
      description,
      category,
    });
  }

  /**
   * Register an action class constructor
   *
   * @param id Unique identifier for this action type
   * @param type The ActionType enum value
   * @param constructor Action class constructor
   * @param description Human-readable description
   * @param category Optional category for grouping
   */
  registerClass(
    id: string,
    type: ActionType,
    constructor: ActionConstructor,
    description: string,
    category?: string
  ): void {
    this.register(
      id,
      type,
      (...args) => new constructor(...args),
      description,
      category
    );
  }

  /**
   * Create an action instance
   *
   * @param id The action type id
   * @param args Arguments to pass to the factory
   * @returns The created action instance
   */
  create(id: string, ...args: any[]): IAction {
    const metadata = this.registry.get(id);
    if (!metadata) {
      throw new Error(`Action with id '${id}' is not registered`);
    }

    return metadata.factory(...args);
  }

  /**
   * Check if an action type is registered
   */
  has(id: string): boolean {
    return this.registry.has(id);
  }

  /**
   * Get metadata for a registered action
   */
  getMetadata(id: string): ActionMetadata | undefined {
    return this.registry.get(id);
  }

  /**
   * Get all registered action IDs
   */
  getAllIds(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Get all actions by type
   */
  getByType(type: ActionType): string[] {
    return Array.from(this.registry.entries())
      .filter(([_, metadata]) => metadata.type === type)
      .map(([id, _]) => id);
  }

  /**
   * Get all actions by category
   */
  getByCategory(category: string): string[] {
    return Array.from(this.registry.entries())
      .filter(([_, metadata]) => metadata.category === category)
      .map(([id, _]) => id);
  }

  /**
   * Unregister an action type (useful for testing)
   */
  unregister(id: string): boolean {
    return this.registry.delete(id);
  }

  /**
   * Clear all registered actions (useful for testing)
   */
  clear(): void {
    this.registry.clear();
  }

  /**
   * Get the number of registered actions
   */
  get size(): number {
    return this.registry.size;
  }

  /**
   * Validate an action instance
   */
  static validate(action: IAction): boolean {
    if (!action.id || typeof action.id !== 'string') {
      return false;
    }
    if (!action.type || typeof action.type !== 'string') {
      return false;
    }
    if (!action.displayName || typeof action.displayName !== 'string') {
      return false;
    }
    if (typeof action.timeCost !== 'number' || action.timeCost < 0) {
      return false;
    }
    if (typeof action.canExecute !== 'function') {
      return false;
    }
    if (typeof action.execute !== 'function') {
      return false;
    }
    if (typeof action.getRequirements !== 'function') {
      return false;
    }
    return true;
  }
}

/**
 * Helper function to get the global action registry
 */
export function getActionRegistry(): ActionRegistry {
  return ActionRegistry.getInstance();
}

/**
 * Helper function to register an action
 */
export function registerAction(
  id: string,
  type: ActionType,
  factory: ActionFactory,
  description: string,
  category?: string
): void {
  ActionRegistry.getInstance().register(id, type, factory, description, category);
}

/**
 * Helper function to create an action
 */
export function createAction(id: string, ...args: any[]): IAction {
  return ActionRegistry.getInstance().create(id, ...args);
}

export default ActionRegistry;
