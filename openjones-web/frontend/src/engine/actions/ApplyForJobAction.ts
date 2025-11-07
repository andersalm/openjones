import { Action } from './Action';
import { ActionResponse } from './ActionResponse';
import { StateChangeBuilder } from './StateChangeBuilder';
import { IPlayerState, IGame, IActionResponse, IActionRequirement, ActionType, IJob } from '@shared/types/contracts';

export class ApplyForJobAction extends Action {
  constructor(private job: IJob) {
    super(
      `apply-job-${job.id}`,
      ActionType.APPLY_JOB,
      'Apply for Job',
      `Apply for ${job.title}`,
      15
    );
  }

  canExecute(player: IPlayerState, game: IGame): boolean {
    // Check education requirement
    if (player.education < this.job.requiredEducation) {
      return false;
    }

    // Check career requirement
    if (player.career < this.job.requiredCareer) {
      return false;
    }

    // Must have enough time
    if (!this.hasEnoughTime(player)) {
      return false;
    }

    // Must be at employment agency
    if (!this.requiresBuilding(player, 'employment-agency')) {
      return false;
    }

    return true;
  }

  execute(player: IPlayerState, game: IGame): IActionResponse {
    if (!this.canExecute(player, game)) {
      return ActionResponse.failure(this.getFailureMessage(player));
    }

    const changes = StateChangeBuilder.create()
      .custom('job', this.job, `Got job: ${this.job.title}`)
      .build();

    return ActionResponse.success(
      `You got the job as ${this.job.title}! Wage: $${this.job.wage}/hour`,
      this.timeCost,
      changes
    );
  }

  getRequirements(): IActionRequirement[] {
    return [
      {
        type: 'measure',
        value: this.job.requiredEducation,
        description: `Education: ${this.job.requiredEducation}`,
      },
      {
        type: 'measure',
        value: this.job.requiredCareer,
        description: `Career: ${this.job.requiredCareer}`,
      },
      {
        type: 'location',
        value: 'employment-agency',
        description: 'Must be at Employment Agency',
      },
      {
        type: 'time',
        value: this.timeCost,
        description: `Time: ${this.timeCost} units`,
      },
    ];
  }

  private getFailureMessage(player: IPlayerState): string {
    if (player.education < this.job.requiredEducation) {
      return `Not enough education. Need ${this.job.requiredEducation}, have ${player.education}`;
    }
    if (player.career < this.job.requiredCareer) {
      return `Not enough career experience. Need ${this.job.requiredCareer}, have ${player.career}`;
    }
    if (!this.hasEnoughTime(player)) {
      return `Not enough time. Need ${this.timeCost}, have ${player.time}`;
    }
    if (player.currentLocation !== 'employment-agency') {
      return 'Must be at Employment Agency to apply for jobs';
    }
    return 'Cannot apply for this job';
  }
}
