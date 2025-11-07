import { Action } from './Action';
import { ActionResponse, StateChangeBuilder } from './ActionResponse';
import {
  IPlayerState,
  IGame,
  IActionResponse,
  IActionRequirement,
  ActionType,
  IJob,
} from '@shared/types/contracts';

export class WorkAction extends Action {
  constructor(private job: IJob, private hours: number) {
    const timeCost = hours * 60; // Convert hours to minutes
    super(
      `work-${job.id}-${hours}h`,
      ActionType.WORK,
      'Work',
      `Work ${hours} hours at ${job.title}`,
      timeCost
    );
  }

  canExecute(player: IPlayerState, _game: IGame): boolean {
    // Must have a job
    if (!player.job) {
      return false;
    }

    // Must have enough time
    if (!this.hasEnoughTime(player)) {
      return false;
    }

    // Must be at workplace (in any building)
    if (!this.requiresBuilding(player)) {
      return false;
    }

    // Job must match player's current job
    if (player.job.id !== this.job.id) {
      return false;
    }

    return true;
  }

  execute(player: IPlayerState, game: IGame): IActionResponse {
    if (!this.canExecute(player, game)) {
      return ActionResponse.failure('Cannot work right now');
    }

    const earnings = this.job.wagePerHour * this.hours;
    const healthLoss = this.hours * 2; // Lose 2 health per hour worked
    const careerGain = this.hours * 1; // Gain 1 career point per hour

    const changes = StateChangeBuilder.create()
      .cash(player.cash + earnings, `Earned $${earnings}`)
      .health(player.health - healthLoss, `Lost ${healthLoss} health from work`)
      .career(player.career + careerGain, `Gained ${careerGain} career experience`)
      .build();

    return ActionResponse.success(
      `Worked ${this.hours} hours and earned $${earnings}`,
      this.timeCost,
      changes
    );
  }

  getRequirements(): IActionRequirement[] {
    return [
      {
        type: 'job',
        value: this.job.id,
        description: 'Must have a job',
      },
      {
        type: 'building',
        value: this.job.buildingType,
        description: `Must be at a ${this.job.buildingType} building`,
      },
      {
        type: 'time',
        value: this.timeCost,
        description: `Requires ${this.hours} hours`,
      },
    ];
  }
}
