import { Action } from './Action';
import { ActionResponse, StateChangeBuilder } from './ActionResponse';
import {
  IPlayerState,
  IGame,
  IActionResponse,
  IActionRequirement,
  ActionType,
} from '@shared/types/contracts';

export class StudyAction extends Action {
  private readonly tuitionCost: number;
  private readonly educationGain: number;
  private readonly collegeId: string = 'college';

  constructor(hours: number) {
    const timeCost = hours * 60; // Convert hours to minutes
    super(
      `study-${hours}h`,
      ActionType.STUDY,
      'Study',
      `Study for ${hours} hours`,
      timeCost
    );

    // Calculate tuition cost and education gain based on hours
    // Tuition: $20 per hour
    // Education: 5 points per hour
    this.tuitionCost = hours * 20;
    this.educationGain = hours * 5;
  }

  canExecute(player: IPlayerState, _game: IGame): boolean {
    // Must have enough time
    if (!this.hasEnoughTime(player)) {
      return false;
    }

    // Must have enough cash for tuition
    if (!player.canAfford(this.tuitionCost)) {
      return false;
    }

    // Must be at college
    if (!this.requiresBuilding(player, this.collegeId)) {
      return false;
    }

    return true;
  }

  execute(player: IPlayerState, game: IGame): IActionResponse {
    if (!this.canExecute(player, game)) {
      return ActionResponse.failure('Cannot study right now');
    }

    const changes = StateChangeBuilder.create()
      .cash(player.cash - this.tuitionCost, `Paid $${this.tuitionCost} tuition`)
      .education(player.education + this.educationGain, `Gained ${this.educationGain} education`)
      .build();

    return ActionResponse.success(
      `Studied and gained ${this.educationGain} education`,
      this.timeCost,
      changes
    );
  }

  getRequirements(): IActionRequirement[] {
    return [
      {
        type: 'cash',
        value: this.tuitionCost,
        description: `Requires $${this.tuitionCost} for tuition`,
      },
      {
        type: 'location',
        value: this.collegeId,
        description: 'Must be at College',
      },
      {
        type: 'time',
        value: this.timeCost,
        description: `Requires ${this.timeCost / 60} hours`,
      },
    ];
  }
}
