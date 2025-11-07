# Actions System

This module provides the foundation for all player actions in the OpenJones game.

## Overview

The Actions system consists of three main components:

1. **Action** - Abstract base class for all actions
2. **ActionResponse** - Result object from executing actions
3. **ActionRegistry** - Factory/registry for managing action types

## Usage

### Creating a New Action

To create a new action, extend the `Action` abstract class:

```typescript
import { Action, ActionResponse, StateChangeBuilder } from '@engine/actions';
import { ActionType, IPlayerState, IGame } from '@shared/types/contracts';

export class WorkAction extends Action {
  constructor(hours: number) {
    super(
      `work-${hours}h`,
      ActionType.WORK,
      `Work ${hours} hours`,
      `Work at your job for ${hours} hours`,
      hours * 5 // 5 time units per hour
    );
  }

  canExecute(player: IPlayerState, game: IGame): boolean {
    // Check if player has a job
    if (!this.requiresJob(player)) {
      return false;
    }
    // Check if player is in a building
    return this.requiresBuilding(player);
  }

  execute(player: IPlayerState, game: IGame): IActionResponse {
    if (!player.job) {
      return ActionResponse.noJob();
    }

    const hours = this.getTimeInHours();
    const earnings = player.job.wagePerHour * hours;
    const healthLoss = hours * 2;

    const changes = StateChangeBuilder.create()
      .cash(player.cash + earnings, `Earned $${earnings}`)
      .measure(MeasureType.HEALTH, player.health - healthLoss, `Lost ${healthLoss} health`)
      .build();

    return ActionResponse.success(
      `You worked ${hours} hours and earned $${earnings}`,
      this.timeCost,
      changes
    );
  }

  getRequirements() {
    return [
      {
        type: 'job' as const,
        value: 'any',
        description: 'Must have a job',
      },
      {
        type: 'building' as const,
        value: 'any',
        description: 'Must be in a building',
      },
    ];
  }
}
```

### Registering Actions

Use the ActionRegistry to register your action types:

```typescript
import { ActionRegistry } from '@engine/actions';
import { WorkAction } from './WorkAction';

// Register the action factory
ActionRegistry.getInstance().register(
  'work-8h',
  ActionType.WORK,
  () => new WorkAction(8),
  'Work 8 hours at your job',
  'employment'
);

// Or register a class directly
ActionRegistry.getInstance().registerClass(
  'work',
  ActionType.WORK,
  WorkAction,
  'Work action',
  'employment'
);
```

### Creating Action Instances

```typescript
import { createAction } from '@engine/actions';

// Create an action from the registry
const workAction = createAction('work-8h');

// Or create with arguments
const customWorkAction = createAction('work', 4); // Work 4 hours
```

## Helper Methods

The `Action` base class provides several helper methods for validating requirements:

### Cash Validation
```typescript
this.requiresCash(player, 100); // Player has at least $100
```

### Measure Validation
```typescript
this.requiresMeasure(player, MeasureType.HEALTH, 50, 'gte'); // Health >= 50
this.requiresMeasure(player, MeasureType.EDUCATION, 80, 'lte'); // Education <= 80
this.requiresMeasure(player, MeasureType.CAREER, 100, 'eq'); // Career == 100
```

### Job Validation
```typescript
this.requiresJob(player); // Player has any job
```

### Location Validation
```typescript
this.requiresBuilding(player); // Player is in any building
this.requiresBuilding(player, 'building-factory'); // Player is in specific building
this.requiresStreet(player); // Player is on the street (not in a building)
```

### Possession Validation
```typescript
this.requiresPossession(player, 'possession-id'); // Player has specific possession
this.hasPossessionType(player, 'FOOD'); // Player has any food item
```

## State Changes

Use the `StateChangeBuilder` to create state changes:

```typescript
import { StateChangeBuilder } from '@engine/actions';

const changes = StateChangeBuilder.create()
  .cash(1500, 'Earned from work')
  .measure(MeasureType.HEALTH, 85, 'Lost health from work')
  .addPossession(burger, 'Purchased burger')
  .job(newJob, 'Got hired')
  .position(newPosition, 'Moved to new location')
  .build();
```

## Action Responses

Use static factory methods for common responses:

```typescript
// Success
ActionResponse.success('Action completed!', 10, stateChanges);

// Generic failure
ActionResponse.failure('Cannot perform action');

// Specific failures
ActionResponse.notEnoughCash(500, 200); // Required, current
ActionResponse.noJob();
ActionResponse.wrongLocation('Factory');
ActionResponse.notInBuilding();
ActionResponse.notOnStreet();
ActionResponse.requirementNotMet('Must have college degree');
```

## Testing

Each action should have comprehensive tests covering:

1. Valid execution scenarios
2. Invalid execution scenarios (requirements not met)
3. State changes applied correctly
4. Edge cases (e.g., zero cash, max health)

Example:
```typescript
describe('WorkAction', () => {
  it('should work successfully when player has job', () => {
    const player = MockPlayerState.create({ job: MockJob.create() });
    const game = MockGame.create();
    const action = new WorkAction(8);

    const response = action.execute(player, game);

    expect(response.success).toBe(true);
    expect(response.stateChanges).toHaveLength(2); // Cash + health
  });

  it('should fail when player has no job', () => {
    const player = MockPlayerState.create({ job: null });
    const game = MockGame.create();
    const action = new WorkAction(8);

    expect(action.canExecute(player, game)).toBe(false);
  });
});
```

## Architecture

```
Action (abstract)
├── canExecute() - Check if action can be performed
├── execute() - Perform the action
├── getRequirements() - List requirements
└── Helper methods (requiresCash, requiresJob, etc.)

ActionResponse
├── success() - Create successful response
├── failure() - Create failed response
└── Static factory methods for common failures

ActionRegistry (singleton)
├── register() - Register action factory
├── create() - Create action instance
├── getByType() - Get actions by type
└── validate() - Validate action instance

StateChangeBuilder
├── cash() - Change cash
├── measure() - Change measure
├── addPossession() - Add possession
├── removePossession() - Remove possession
├── job() - Change job
└── position() - Change position
```

## Next Steps

Specific action implementations:
- **Task A5**: Movement actions (MovementAction, EnterBuildingAction, ExitBuildingAction)
- **Task A6**: Work & Study actions (WorkAction, StudyAction, RelaxAction)
- **Task A7**: Purchase & Economic actions (PurchaseAction, ApplyForJobAction, etc.)

---

**Part of Task A4: Base Action Classes**
**Worker 1 - Track A (Core Engine)**
**Date**: 2025-11-07
