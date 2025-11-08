import { Action } from './Action';
import { ActionResponse, StateChangeBuilder } from './ActionResponse';
import {
  IPlayerState,
  IGame,
  IActionResponse,
  IActionRequirement,
  ActionType,
  BuildingType,
} from '@shared/types/contracts';

export class RelaxAction extends Action {
  // Java: REST_DURATION = 24 time units
  private static readonly REST_DURATION = 24;

  constructor() {
    super(
      'relax',
      ActionType.RELAX,
      'Relax',
      'Rest and restore health/happiness',
      RelaxAction.REST_DURATION
    );
  }

  canExecute(player: IPlayerState, _game: IGame): boolean {
    // Must have enough time
    if (!this.hasEnoughTime(player)) {
      return false;
    }

    // Must be at rented home to relax (Java checks in House.getAvailableActions)
    if (!player.rentedHome || player.currentBuilding !== player.rentedHome) {
      return false;
    }

    return true;
  }

  execute(player: IPlayerState, game: IGame): IActionResponse {
    if (!this.canExecute(player, game)) {
      return ActionResponse.failure('You must be at your rented home to relax');
    }

    // Get the house bonuses based on apartment type
    // Java: healthEffect = (house.getRelaxHealthEffect() + possessions.sumRestHealthEffectsPerTimeUnit()) * timeEffect
    const building = game.map.getBuildingById(player.rentedHome!);
    let healthPerTimeUnit = 0;
    let happinessPerTimeUnit = 0;

    if (building?.type === BuildingType.LOW_COST_APARTMENT) {
      // Java LowCostHousing: getRelaxHealthEffect() = 3, getRelaxHappinessEffect() = 3
      healthPerTimeUnit = 3;
      happinessPerTimeUnit = 3;
    } else if (building?.type === BuildingType.SECURITY_APARTMENT) {
      // Java SecurityHousing: getRelaxHealthEffect() = 7, getRelaxHappinessEffect() = 7
      healthPerTimeUnit = 7;
      happinessPerTimeUnit = 7;
    }

    // Calculate actual time available (up to REST_DURATION)
    const timeAvailable = Math.min(game.timeUnitsRemaining, RelaxAction.REST_DURATION);

    // Total effect = perTimeUnit * timeSpent (Java formula)
    const healthGain = healthPerTimeUnit * timeAvailable;
    const happinessGain = happinessPerTimeUnit * timeAvailable;

    const changes = StateChangeBuilder.create()
      .health(player.health + healthGain, `Restored ${healthGain} health`)
      .happiness(player.happiness + happinessGain, `Restored ${happinessGain} happiness`)
      .build();

    return ActionResponse.success(
      'zzzzz', // Java message!
      timeAvailable,
      changes
    );
  }

  getRequirements(): IActionRequirement[] {
    return [
      {
        type: 'location',
        value: 'home',
        description: 'Must be at your rented home',
      },
      {
        type: 'time',
        value: this.timeCost,
        description: `Requires ${this.timeCost} time units`,
      },
    ];
  }
}
