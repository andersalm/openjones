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
  // Match Java version exactly
  private static readonly STUDY_DURATION = 20; // Time units per study session
  private static readonly STUDY_COST = 15; // Cost per study session
  private static readonly EDUCATION_POINTS_GAIN = 1; // Education gained per session

  private readonly collegeId: string = 'college';

  constructor() {
    super(
      'study',
      ActionType.STUDY,
      'Study',
      `Study ($${StudyAction.STUDY_COST})`,
      StudyAction.STUDY_DURATION
    );
  }

  canExecute(player: IPlayerState, _game: IGame): boolean {
    // Must have enough time
    if (!this.hasEnoughTime(player)) {
      return false;
    }

    // Must have enough cash for tuition
    if (!player.canAfford(StudyAction.STUDY_COST)) {
      return false;
    }

    // Must be at college
    if (!this.requiresBuilding(player, this.collegeId)) {
      return false;
    }

    return true;
  }

  execute(player: IPlayerState, game: IGame): IActionResponse {
    // Check time first (Study requires full time, no partial)
    if (game.timeUnitsRemaining < this.timeCost) {
      return ActionResponse.failure(
        `Not enough time. Need ${this.timeCost} units, have ${game.timeUnitsRemaining}`
      );
    }

    // Check other requirements
    if (!player.canAfford(StudyAction.STUDY_COST)) {
      return ActionResponse.failure(`Need $${StudyAction.STUDY_COST} for tuition`);
    }

    if (!this.requiresBuilding(player, this.collegeId)) {
      return ActionResponse.failure('Must be at College');
    }

    const changes = StateChangeBuilder.create()
      .cash(player.cash - StudyAction.STUDY_COST, `Paid $${StudyAction.STUDY_COST} tuition`)
      .education(
        player.education + StudyAction.EDUCATION_POINTS_GAIN,
        `Gained ${StudyAction.EDUCATION_POINTS_GAIN} education`
      )
      .build();

    return ActionResponse.success(
      'Another brick in the wall', // Classic Java message!
      this.timeCost,
      changes
    );
  }

  getRequirements(): IActionRequirement[] {
    return [
      {
        type: 'cash',
        value: StudyAction.STUDY_COST,
        description: `Requires $${StudyAction.STUDY_COST} for tuition`,
      },
      {
        type: 'location',
        value: this.collegeId,
        description: 'Must be at College',
      },
      {
        type: 'time',
        value: this.timeCost,
        description: `Requires ${StudyAction.STUDY_DURATION} time units`,
      },
    ];
  }
}
