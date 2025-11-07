import { Action } from './Action';
import { ActionResponse, StateChangeBuilder } from './ActionResponse';
import {
  IPlayerState,
  IGame,
  IActionResponse,
  IActionRequirement,
  ActionType,
} from '@shared/types/contracts';

export class RelaxAction extends Action {
  private readonly healthGain: number;
  private readonly happinessGain: number;

  constructor(hours: number) {
    const timeCost = hours * 60; // Convert hours to minutes
    super(
      `relax-${hours}h`,
      ActionType.RELAX,
      'Relax',
      `Relax for ${hours} hours`,
      timeCost
    );

    // Calculate health and happiness gains based on hours
    // Base rates: 10 health per hour, 15 happiness per hour
    this.healthGain = hours * 10;
    this.happinessGain = hours * 15;
  }

  canExecute(player: IPlayerState, _game: IGame): boolean {
    // Must have enough time
    if (!this.hasEnoughTime(player)) {
      return false;
    }

    return true;
  }

  execute(player: IPlayerState, game: IGame): IActionResponse {
    if (!this.canExecute(player, game)) {
      return ActionResponse.failure('Cannot relax right now');
    }

    // Location-based effectiveness multiplier
    const locationMultiplier = this.getLocationMultiplier(player);
    const actualHealthGain = Math.floor(this.healthGain * locationMultiplier);
    const actualHappinessGain = Math.floor(this.happinessGain * locationMultiplier);

    const locationNote = this.getLocationNote(player, locationMultiplier);

    const changes = StateChangeBuilder.create()
      .health(actualHealthGain, `Restored ${actualHealthGain} health${locationNote}`)
      .happiness(actualHappinessGain, `Restored ${actualHappinessGain} happiness${locationNote}`)
      .build();

    return ActionResponse.success(
      `Relaxed and restored ${actualHealthGain} health and ${actualHappinessGain} happiness`,
      this.timeCost,
      changes
    );
  }

  getRequirements(): IActionRequirement[] {
    return [
      {
        type: 'time',
        value: this.timeCost,
        description: `Requires ${this.timeCost / 60} hours`,
      },
    ];
  }

  private getLocationMultiplier(player: IPlayerState): number {
    // At home: 1.5x effectiveness
    // At street or unknown: 0.5x effectiveness (uncomfortable)
    // Other locations: 1x effectiveness
    if (player.location === 'home') {
      return 1.5;
    } else if (player.location === 'street' || player.location === 'unknown') {
      return 0.5;
    }
    return 1.0;
  }

  private getLocationNote(_player: IPlayerState, multiplier: number): string {
    if (multiplier > 1.0) {
      return ' (home bonus)';
    } else if (multiplier < 1.0) {
      return ' (uncomfortable location)';
    }
    return '';
  }
}
