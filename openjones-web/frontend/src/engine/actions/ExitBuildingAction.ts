import { IPlayerState, IGame } from '@shared/types/contracts';
import { Action } from './Action';
import { ActionResponse, StateChangeBuilder } from './ActionResponse';
import { ActionType, IActionResponse, IActionRequirement as ActionRequirement } from '@shared/types/contracts';

export class ExitBuildingAction extends Action {
  private static readonly TIME_COST = 5;

  constructor() {
    super(
      'exit-building',
      ActionType.EXIT_BUILDING,
      'Exit Building',
      'Exit the current building to the street',
      ExitBuildingAction.TIME_COST
    );
  }

  canExecute(player: IPlayerState, _game: IGame): boolean {
    // Must be inside a building
    if (!this.requiresBuilding(player)) {
      return false;
    }

    // Must have enough time
    if (!this.hasEnoughTime(player)) {
      return false;
    }

    return true;
  }

  execute(player: IPlayerState, game: IGame): IActionResponse {
    if (!this.canExecute(player, game)) {
      const errors: string[] = [];

      if (!this.requiresBuilding(player)) {
        errors.push('Not inside a building');
      }

      if (!this.hasEnoughTime(player)) {
        errors.push(`Not enough time (need ${this.timeCost}, have ${game.timeUnitsRemaining})`);
      }

      return ActionResponse.failure(errors.join('; '));
    }

    // Get the building name for the message
    let buildingName = 'building';
    if (player.currentBuilding) {
      const building = game.map.getBuildingById(player.currentBuilding);
      if (building) {
        buildingName = building.name;
      }
    }

    const changes = StateChangeBuilder.create()
      .currentBuilding(null, `Exited ${buildingName}`)
      .build();

    return ActionResponse.success(
      `Exited ${buildingName}`,
      this.timeCost,
      changes
    );
  }

  getRequirements(): ActionRequirement[] {
    return [
      {
        type: 'location',
        value: 'building',
        description: 'Must be inside a building',
      },
      {
        type: 'time',
        value: this.timeCost,
        description: `Requires ${this.timeCost} time units`,
      },
    ];
  }
}
