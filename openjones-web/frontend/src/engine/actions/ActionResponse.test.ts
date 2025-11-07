/**
 * Unit tests for ActionResponse
 *
 * @author Worker 1
 * @date 2025-11-07
 */

import { describe, it, expect } from 'vitest';
import { ActionResponse, StateChangeBuilder } from './ActionResponse';
import { MeasureType, PossessionType } from '@shared/types/contracts';
import { MockPosition, MockJob } from '@shared/mocks';

describe('ActionResponse', () => {
  describe('constructor', () => {
    it('should create a basic response', () => {
      const response = new ActionResponse(true, 'Success!', 10);
      expect(response.success).toBe(true);
      expect(response.message).toBe('Success!');
      expect(response.timeSpent).toBe(10);
      expect(response.stateChanges).toEqual([]);
      expect(response.nextActions).toBeUndefined();
    });

    it('should create a response with state changes', () => {
      const stateChanges = [
        { type: 'cash' as const, value: 1500, description: 'Earned money' },
      ];
      const response = new ActionResponse(true, 'Success!', 10, stateChanges);
      expect(response.stateChanges).toEqual(stateChanges);
    });

    it('should create a response with next actions', () => {
      const nextActions: any[] = [];
      const response = new ActionResponse(true, 'Success!', 10, [], nextActions);
      expect(response.nextActions).toEqual(nextActions);
    });
  });

  describe('success', () => {
    it('should create a successful response', () => {
      const response = ActionResponse.success('Completed', 20);
      expect(response.success).toBe(true);
      expect(response.message).toBe('Completed');
      expect(response.timeSpent).toBe(20);
      expect(response.stateChanges).toEqual([]);
    });

    it('should create a successful response with state changes', () => {
      const stateChanges = [
        { type: 'cash' as const, value: 2000, description: 'Bonus' },
      ];
      const response = ActionResponse.success('Completed', 20, stateChanges);
      expect(response.stateChanges).toEqual(stateChanges);
    });

    it('should create a successful response with next actions', () => {
      const nextActions: any[] = [];
      const response = ActionResponse.success('Completed', 20, [], nextActions);
      expect(response.nextActions).toEqual(nextActions);
    });
  });

  describe('failure', () => {
    it('should create a failed response', () => {
      const response = ActionResponse.failure('Cannot execute');
      expect(response.success).toBe(false);
      expect(response.message).toBe('Cannot execute');
      expect(response.timeSpent).toBe(0);
      expect(response.stateChanges).toEqual([]);
    });
  });

  describe('notEnoughCash', () => {
    it('should create a failure response for insufficient cash', () => {
      const response = ActionResponse.notEnoughCash(500, 200);
      expect(response.success).toBe(false);
      expect(response.message).toBe('Not enough cash. Required: $500, Current: $200');
      expect(response.timeSpent).toBe(0);
    });
  });

  describe('requirementNotMet', () => {
    it('should create a failure response for requirement not met', () => {
      const response = ActionResponse.requirementNotMet('Must have college degree');
      expect(response.success).toBe(false);
      expect(response.message).toBe('Requirement not met: Must have college degree');
      expect(response.timeSpent).toBe(0);
    });
  });

  describe('noJob', () => {
    it('should create a failure response for no job', () => {
      const response = ActionResponse.noJob();
      expect(response.success).toBe(false);
      expect(response.message).toBe('You need to have a job to perform this action');
      expect(response.timeSpent).toBe(0);
    });
  });

  describe('wrongLocation', () => {
    it('should create a failure response for wrong location', () => {
      const response = ActionResponse.wrongLocation('Factory');
      expect(response.success).toBe(false);
      expect(response.message).toBe('You must be at Factory to perform this action');
      expect(response.timeSpent).toBe(0);
    });
  });

  describe('notInBuilding', () => {
    it('should create a failure response for not being in building', () => {
      const response = ActionResponse.notInBuilding();
      expect(response.success).toBe(false);
      expect(response.message).toBe('You must be inside a building to perform this action');
      expect(response.timeSpent).toBe(0);
    });
  });

  describe('notOnStreet', () => {
    it('should create a failure response for not being on street', () => {
      const response = ActionResponse.notOnStreet();
      expect(response.success).toBe(false);
      expect(response.message).toBe('You must be outside (on the street) to perform this action');
      expect(response.timeSpent).toBe(0);
    });
  });
});

describe('StateChangeBuilder', () => {
  describe('cash', () => {
    it('should add a cash state change', () => {
      const changes = StateChangeBuilder.create()
        .cash(1500, 'Earned from work')
        .build();

      expect(changes).toEqual([
        {
          type: 'cash',
          value: 1500,
          description: 'Earned from work',
        },
      ]);
    });
  });

  describe('measure', () => {
    it('should add a measure state change', () => {
      const changes = StateChangeBuilder.create()
        .measure(MeasureType.HEALTH, 85, 'Lost health from work')
        .build();

      expect(changes).toEqual([
        {
          type: 'measure',
          measure: MeasureType.HEALTH,
          value: 85,
          description: 'Lost health from work',
        },
      ]);
    });

    it('should add multiple measure changes', () => {
      const changes = StateChangeBuilder.create()
        .measure(MeasureType.HEALTH, 90, 'Health decreased')
        .measure(MeasureType.HAPPINESS, 60, 'Happiness decreased')
        .build();

      expect(changes).toHaveLength(2);
      expect(changes[0].measure).toBe(MeasureType.HEALTH);
      expect(changes[1].measure).toBe(MeasureType.HAPPINESS);
    });
  });

  describe('addPossession', () => {
    it('should add a possession_add state change', () => {
      const possession = {
        id: 'food-1',
        type: PossessionType.FOOD,
        name: 'Burger',
        value: 10,
        purchasePrice: 15,
        effects: [],
      };

      const changes = StateChangeBuilder.create()
        .addPossession(possession, 'Purchased burger')
        .build();

      expect(changes).toEqual([
        {
          type: 'possession_add',
          value: possession,
          description: 'Purchased burger',
        },
      ]);
    });
  });

  describe('removePossession', () => {
    it('should add a possession_remove state change', () => {
      const possession = {
        id: 'food-1',
        type: PossessionType.FOOD,
        name: 'Burger',
        value: 10,
        purchasePrice: 15,
        effects: [],
      };

      const changes = StateChangeBuilder.create()
        .removePossession(possession, 'Consumed burger')
        .build();

      expect(changes).toEqual([
        {
          type: 'possession_remove',
          value: possession,
          description: 'Consumed burger',
        },
      ]);
    });
  });

  describe('job', () => {
    it('should add a job state change', () => {
      const job = MockJob.create();

      const changes = StateChangeBuilder.create()
        .job(job, 'Got hired at factory')
        .build();

      expect(changes).toEqual([
        {
          type: 'job',
          value: job,
          description: 'Got hired at factory',
        },
      ]);
    });

    it('should handle null job', () => {
      const changes = StateChangeBuilder.create()
        .job(null, 'Quit job')
        .build();

      expect(changes).toHaveLength(1);
      expect(changes[0].type).toBe('job');
      expect(changes[0].description).toBe('Quit job');
    });
  });

  describe('position', () => {
    it('should add a position state change', () => {
      const position = new MockPosition(2, 3);

      const changes = StateChangeBuilder.create()
        .position(position, 'Moved to new location')
        .build();

      expect(changes).toEqual([
        {
          type: 'position',
          value: position,
          description: 'Moved to new location',
        },
      ]);
    });
  });

  describe('chaining', () => {
    it('should allow chaining multiple state changes', () => {
      const job = MockJob.create();
      const position = new MockPosition(1, 1);

      const changes = StateChangeBuilder.create()
        .cash(1000, 'Starting cash')
        .measure(MeasureType.HEALTH, 100, 'Full health')
        .measure(MeasureType.HAPPINESS, 80, 'Happy')
        .job(job, 'Started job')
        .position(position, 'At factory')
        .build();

      expect(changes).toHaveLength(5);
      expect(changes[0].type).toBe('cash');
      expect(changes[1].type).toBe('measure');
      expect(changes[2].type).toBe('measure');
      expect(changes[3].type).toBe('job');
      expect(changes[4].type).toBe('position');
    });
  });

  describe('create', () => {
    it('should create a new builder instance', () => {
      const builder = StateChangeBuilder.create();
      expect(builder).toBeInstanceOf(StateChangeBuilder);
    });

    it('should create independent builder instances', () => {
      const builder1 = StateChangeBuilder.create().cash(100, 'Test 1');
      const builder2 = StateChangeBuilder.create().cash(200, 'Test 2');

      const changes1 = builder1.build();
      const changes2 = builder2.build();

      expect(changes1).toHaveLength(1);
      expect(changes2).toHaveLength(1);
      expect(changes1[0].value).toBe(100);
      expect(changes2[0].value).toBe(200);
    });
  });
});
