/**
 * Actions Module - Public API
 *
 * This module exports all action-related classes and utilities.
 *
 * Part of Task A4: Base Action Classes
 * Worker 1 - Track A (Core Engine)
 */

export { Action } from './Action';
export { ActionResponse, StateChangeBuilder } from './ActionResponse';
export {
  ActionRegistry,
  getActionRegistry,
  registerAction,
  createAction,
  type ActionFactory,
  type ActionConstructor,
  type ActionMetadata,
} from './ActionRegistry';

// Re-export relevant types from contracts for convenience
export type {
  IAction,
  IActionResponse,
  IActionRequirement,
  IStateChange,
} from '@shared/types/contracts';

export { ActionType, MeasureType } from '@shared/types/contracts';
