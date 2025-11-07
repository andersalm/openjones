import { IPlayerState, IGame, IPosition } from '@shared/types/contracts';
import { Action } from './Action';
import { ActionResponse, StateChangeBuilder } from './ActionResponse';
import { ActionType, IActionResponse, IActionRequirement as ActionRequirement } from '@shared/types/contracts';

export class EnterBuildingAction extends Action {
  private static readonly TIME_COST = 5;

  constructor(private position: IPosition) {
    super(
      `enter-building-${position.x},${position.y}`,
      ActionType.ENTER_BUILDING,
      'Enter Building',
      'Enter the building at current position',
      EnterBuildingAction.TIME_COST
    );
  }

  canExecute(player: IPlayerState, game: IGame): boolean {
    // Must be on street (not already in a building)
    if (!this.requiresStreet(player)) {
      return false;
    }

    // Must have enough time
    if (!this.hasEnoughTime(player)) {
      return false;
    }

    // Must be a building at the position
    const building = game.map.getBuilding(this.position);
    if (!building) {
      return false;
    }

    // Player must be at the building's position
    if (player.position.x !== this.position.x || player.position.y !== this.position.y) {
      return false;
    }

    return true;
  }

  execute(player: IPlayerState, game: IGame): IActionResponse {
    if (!this.canExecute(player, game)) {
      const errors: string[] = [];

      if (!this.requiresStreet(player)) {
        errors.push('Already inside a building');
      }

      if (!this.hasEnoughTime(player)) {
        errors.push(`Not enough time (need ${this.timeCost}, have ${game.timeUnitsRemaining})`);
      }

      const building = game.map.getBuilding(this.position);
      if (!building) {
        errors.push('No building at this position');
      }

      if (player.position.x !== this.position.x || player.position.y !== this.position.y) {
        errors.push('Must be at the building location to enter');
      }

      return ActionResponse.failure(errors.join('; '));
    }

    const building = game.map.getBuilding(this.position);
    if (!building) {
      // This should not happen due to canExecute check, but handle it defensively
      return ActionResponse.failure('No building at this position');
    }

    const changes = StateChangeBuilder.create()
      .currentBuilding(building.id, `Entered ${building.name}`)
      .build();

    return ActionResponse.success(
      `Entered ${building.name}`,
      this.timeCost,
      changes
    );
  }

  getRequirements(): ActionRequirement[] {
    return [
      {
        type: 'location',
        value: 'street',
        description: 'Must be on the street (not in a building)',
      },
      {
        type: 'location',
        value: 'building',
        description: 'Must be at a building location',
      },
      {
        type: 'time',
        value: this.timeCost,
        description: `Requires ${this.timeCost} time units`,
      },
    ];
  }

  getPosition(): IPosition {
    return this.position;
  }
}
