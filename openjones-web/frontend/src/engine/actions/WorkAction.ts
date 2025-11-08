import { Action } from './Action';
import { ActionResponse, StateChangeBuilder } from './ActionResponse';
import {
  IPlayerState,
  IGame,
  IActionResponse,
  IActionRequirement,
  ActionType,
  IJob,
  GAME_CONSTANTS,
} from '@shared/types/contracts';

export class WorkAction extends Action {
  private static readonly WORK_PERIOD_IN_TIME_UNITS = 60; // Max work period (12 hours)
  private static readonly GARNISH_PERCENTAGE = 30; // 30% wage garnishment for rent debt

  constructor(private job: IJob, private hours?: number) {
    // If hours not specified, calculate max available time up to WORK_PERIOD
    const timeCost = hours
      ? hours * GAME_CONSTANTS.TIME_UNITS_PER_HOUR
      : WorkAction.WORK_PERIOD_IN_TIME_UNITS;

    super(
      `work-${job.id}${hours ? `-${hours}h` : ''}`,
      ActionType.WORK,
      'Work',
      hours ? `Work ${hours} hours at ${job.title}` : `Work at ${job.title}`,
      timeCost
    );

    // Store hours for calculation (will be determined at execution time if not set)
    this.hours = hours;
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

    // Calculate actual hours worked based on available time
    const timeAvailable = Math.min(
      game.timeUnitsRemaining,
      this.hours
        ? this.hours * GAME_CONSTANTS.TIME_UNITS_PER_HOUR
        : WorkAction.WORK_PERIOD_IN_TIME_UNITS
    );
    const actualHours = timeAvailable / GAME_CONSTANTS.TIME_UNITS_PER_HOUR;

    // Calculate base wage
    const wagePerTimeUnit = this.job.wagePerHour / GAME_CONSTANTS.TIME_UNITS_PER_HOUR;
    const baseEarnings = Math.floor(timeAvailable * wagePerTimeUnit);

    // Apply wage garnishment if player has rent debt
    let netEarnings = baseEarnings;
    let garnishedAmount = 0;
    let messagePrefix = '';

    if (player.rentDebt > 0) {
      // Garnish 30% or enough to cover debt, whichever is less
      const maxGarnish = Math.floor(baseEarnings * (WorkAction.GARNISH_PERCENTAGE / 100));
      garnishedAmount = Math.min(maxGarnish, player.rentDebt);
      netEarnings = baseEarnings - garnishedAmount;
      messagePrefix = `I had to garnish $${garnishedAmount}. `;
    }

    const healthLoss = Math.floor(actualHours * 2); // Lose 2 health per hour worked
    const experienceGain = timeAvailable; // 1 experience unit per time unit worked

    // Add experience gain to player's experience at job rank
    const existingExp = player.experience.find((e) => e.rank === this.job.rank);
    if (existingExp) {
      existingExp.points += experienceGain;
    } else {
      player.experience.push({ rank: this.job.rank, points: experienceGain });
    }
    // Update career score
    const totalExperience = player.experience.reduce((sum, exp) => sum + exp.points, 0);

    const changes = StateChangeBuilder.create()
      .cash(player.cash + netEarnings, `Earned $${netEarnings} (base: $${baseEarnings})`)
      .health(player.health - healthLoss, `Lost ${healthLoss} health from work`)
      .career(totalExperience, `Gained ${experienceGain} experience`)
      .build();

    // Reduce rent debt by garnished amount
    if (garnishedAmount > 0) {
      player.rentDebt = Math.max(0, player.rentDebt - garnishedAmount);
    }

    return ActionResponse.success(
      `${messagePrefix}Worked ${actualHours.toFixed(1)} hours and earned $${netEarnings}`,
      timeAvailable,
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
