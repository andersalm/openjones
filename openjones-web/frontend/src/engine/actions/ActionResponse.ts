/**
 * ActionResponse - Result of executing an action
 *
 * This class represents the outcome of an action execution, including:
 * - Success/failure status
 * - Descriptive message
 * - Time spent
 * - State changes to apply
 * - Optional follow-up actions (for sub-menus)
 *
 * Part of Task A4: Base Action Classes
 * Worker 1 - Track A (Core Engine)
 */

import {
  IActionResponse,
  IStateChange,
  IAction,
  MeasureType,
  IPossession,
  IJob,
  IPosition,
} from '@shared/types/contracts';

/**
 * Concrete implementation of IActionResponse
 *
 * Provides static factory methods for common response patterns:
 * - success(): Create a successful response
 * - failure(): Create a failed response
 * - notEnoughCash(): Specific failure for insufficient funds
 * - requirementNotMet(): Generic requirement failure
 */
export class ActionResponse implements IActionResponse {
  readonly success: boolean;
  readonly message: string;
  readonly timeSpent: number;
  readonly stateChanges: IStateChange[];
  readonly nextActions?: IAction[];

  constructor(
    success: boolean,
    message: string,
    timeSpent: number,
    stateChanges: IStateChange[] = [],
    nextActions?: IAction[]
  ) {
    this.success = success;
    this.message = message;
    this.timeSpent = timeSpent;
    this.stateChanges = stateChanges;
    this.nextActions = nextActions;
  }

  /**
   * Create a successful action response
   */
  static success(
    message: string,
    timeSpent: number,
    stateChanges: IStateChange[] = [],
    nextActions?: IAction[]
  ): ActionResponse {
    return new ActionResponse(true, message, timeSpent, stateChanges, nextActions);
  }

  /**
   * Create a failed action response
   */
  static failure(message: string): ActionResponse {
    return new ActionResponse(false, message, 0, []);
  }

  /**
   * Create a failure response for insufficient cash
   */
  static notEnoughCash(required: number, current: number): ActionResponse {
    return ActionResponse.failure(
      `Not enough cash. Required: $${required}, Current: $${current}`
    );
  }

  /**
   * Create a failure response for a generic requirement not being met
   */
  static requirementNotMet(requirement: string): ActionResponse {
    return ActionResponse.failure(`Requirement not met: ${requirement}`);
  }

  /**
   * Create a failure response for not having a job
   */
  static noJob(): ActionResponse {
    return ActionResponse.failure('You need to have a job to perform this action');
  }

  /**
   * Create a failure response for wrong location
   */
  static wrongLocation(expectedLocation: string): ActionResponse {
    return ActionResponse.failure(`You must be at ${expectedLocation} to perform this action`);
  }

  /**
   * Create a failure response for not being in a building
   */
  static notInBuilding(): ActionResponse {
    return ActionResponse.failure('You must be inside a building to perform this action');
  }

  /**
   * Create a failure response for not being on the street
   */
  static notOnStreet(): ActionResponse {
    return ActionResponse.failure('You must be outside (on the street) to perform this action');
  }
}

/**
 * Helper class for building state changes
 */
export class StateChangeBuilder {
  private changes: IStateChange[] = [];

  /**
   * Add a cash change
   */
  cash(newAmount: number, description: string): StateChangeBuilder {
    this.changes.push({
      type: 'cash',
      value: newAmount,
      description,
    });
    return this;
  }

  /**
   * Add a measure change
   */
  measure(
    measure: MeasureType,
    newValue: number,
    description: string
  ): StateChangeBuilder {
    this.changes.push({
      type: 'measure',
      measure,
      value: newValue,
      description,
    });
    return this;
  }

  /**
   * Add a possession
   */
  addPossession(possession: IPossession, description: string): StateChangeBuilder {
    this.changes.push({
      type: 'possession_add',
      value: possession,
      description,
    });
    return this;
  }

  /**
   * Remove a possession
   */
  removePossession(possession: IPossession, description: string): StateChangeBuilder {
    this.changes.push({
      type: 'possession_remove',
      value: possession,
      description,
    });
    return this;
  }

  /**
   * Change job
   */
  job(job: IJob | null, description: string): StateChangeBuilder {
    this.changes.push({
      type: 'job',
      value: job!,
      description,
    });
    return this;
  }

  /**
   * Change position
   */
  position(position: IPosition, description: string): StateChangeBuilder {
    this.changes.push({
      type: 'position',
      value: position,
      description,
    });
    return this;
  }

  /**
   * Build and return the state changes array
   */
  build(): IStateChange[] {
    return this.changes;
  }

  /**
   * Create a new builder instance
   */
  static create(): StateChangeBuilder {
    return new StateChangeBuilder();
  }
}

export default ActionResponse;
