import { Action } from './Action';
import { ActionResponse, StateChangeBuilder } from './ActionResponse';
import { IPlayerState, IGame, IActionResponse, IActionRequirement, ActionType, IJob } from '@shared/types/contracts';

export class ApplyForJobAction extends Action {
  private static readonly APPLY_DURATION = 5; // Java: ApplyForJobAction.APPLY_DURATION

  constructor(private job: IJob) {
    super(
      `apply-job-${job.id}`,
      ActionType.APPLY_JOB,
      'Apply for Job',
      `Apply for ${job.title}`,
      ApplyForJobAction.APPLY_DURATION // Was 15, should be 5!
    );
  }

  canExecute(player: IPlayerState, _game: IGame): boolean {
    // Check education requirement
    if (player.education < this.job.requiredEducation) {
      return false;
    }

    // Check experience requirement
    // Java: Check experience from (rank - 1) to rank (LOWER_EXPERIENCE_RANKS_ACCEPTABLE = 1)
    if (!this.hasEnoughExperience(player)) {
      return false;
    }

    // Check clothes level requirement (was missing!)
    if (player.getClothesLevel() < this.job.requiredClothesLevel) {
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

  /**
   * Check if player has enough experience for this job
   * Java: Checks experience from (rank - 1) to rank
   */
  private hasEnoughExperience(player: IPlayerState): boolean {
    // Calculate lowest acceptable rank (minimum is 1)
    const lowestRank = Math.max(this.job.rank - 1, 1);

    // Check if player has required experience at ANY rank from lowestRank to job.rank
    for (let rank = lowestRank; rank <= this.job.rank; rank++) {
      if (player.getExperienceAtRank(rank) >= this.job.requiredExperience) {
        return true;
      }
    }

    return false;
  }

  execute(player: IPlayerState, game: IGame): IActionResponse {
    if (!this.canExecute(player, game)) {
      return ActionResponse.failure(this.getFailureMessage(player));
    }

    const changes = StateChangeBuilder.create()
      .custom('job', this.job, `Got job: ${this.job.title}`)
      .build();

    return ActionResponse.success(
      `You got the job as ${this.job.title}! Wage: $${this.job.wagePerHour}/hour`,
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
        value: this.job.requiredExperience,
        description: `Experience: ${this.job.requiredExperience}`,
      },
      {
        type: 'measure',
        value: this.job.requiredClothesLevel,
        description: `Clothes level: ${this.job.requiredClothesLevel}`,
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
    if (!this.hasEnoughExperience(player)) {
      // Show experience from relevant ranks
      const lowestRank = Math.max(this.job.rank - 1, 1);
      const expAtCurrentRank = player.getExperienceAtRank(this.job.rank);
      const expAtLowerRank = lowestRank < this.job.rank ? player.getExperienceAtRank(lowestRank) : 0;

      if (lowestRank < this.job.rank) {
        return `Not enough experience. Need ${this.job.requiredExperience} at rank ${lowestRank} or ${this.job.rank}. You have: Rank ${lowestRank}=${expAtLowerRank}, Rank ${this.job.rank}=${expAtCurrentRank}`;
      } else {
        return `Not enough experience. Need ${this.job.requiredExperience} at rank ${this.job.rank}, have ${expAtCurrentRank}`;
      }
    }
    if (player.getClothesLevel() < this.job.requiredClothesLevel) {
      return `Not dressed properly. Need clothes level ${this.job.requiredClothesLevel}, have ${player.getClothesLevel()}`;
    }
    if (!this.hasEnoughTime(player)) {
      return `Not enough time. Need ${this.timeCost} time units`;
    }
    if (player.currentBuilding !== 'employment-agency') {
      return 'Must be at Employment Agency to apply for jobs';
    }
    return 'Cannot apply for this job';
  }
}
