import { Action } from './Action';
import { ActionResponse, StateChangeBuilder } from './ActionResponse';
import { IPlayerState, IGame, IActionResponse, IActionRequirement, ActionType, IApartment } from '@shared/types/contracts';

export class RentHouseAction extends Action {
  constructor(private apartment: IApartment) {
    super(
      `rent-house-${apartment.id}`,
      ActionType.RENT_HOUSE,
      'Rent Apartment',
      `Rent ${apartment.name}`,
      10
    );
  }

  canExecute(player: IPlayerState, game: IGame): boolean {
    // Must have enough cash for first week's rent
    if (!this.hasEnoughCash(player, this.apartment.weeklyRent)) {
      return false;
    }

    // Must have enough time
    if (!this.hasEnoughTime(player)) {
      return false;
    }

    // Player shouldn't already have this apartment
    if (player.currentHome === this.apartment.id) {
      return false;
    }

    return true;
  }

  execute(player: IPlayerState, game: IGame): IActionResponse {
    if (!this.canExecute(player, game)) {
      return ActionResponse.failure(this.getFailureMessage(player));
    }

    const changes = StateChangeBuilder.create()
      .cash(
        player.cash,
        player.cash - this.apartment.weeklyRent,
        `Paid first week rent: $${this.apartment.weeklyRent}`
      )
      .custom('currentHome', this.apartment.id, `Rented ${this.apartment.name}`)
      .rentDue(player.rentDue, 0, 'Rent paid for first week');

    // Add happiness bonus if applicable
    if (this.apartment.happinessBonus > 0) {
      changes.happiness(
        player.happiness,
        player.happiness + this.apartment.happinessBonus,
        `Gained ${this.apartment.happinessBonus} happiness from new home`
      );
    }

    return ActionResponse.success(
      `Successfully rented ${this.apartment.name}! Weekly rent: $${this.apartment.weeklyRent}`,
      this.timeCost,
      changes.build()
    );
  }

  getRequirements(): IActionRequirement[] {
    return [
      {
        type: 'cash',
        value: this.apartment.weeklyRent,
        description: `Cash: $${this.apartment.weeklyRent} (first week)`,
      },
      {
        type: 'time',
        value: this.timeCost,
        description: `Time: ${this.timeCost} units`,
      },
    ];
  }

  private getFailureMessage(player: IPlayerState): string {
    if (player.currentHome === this.apartment.id) {
      return `You are already renting ${this.apartment.name}`;
    }
    if (!this.hasEnoughCash(player, this.apartment.weeklyRent)) {
      return `Not enough cash for first week rent. Need $${this.apartment.weeklyRent}, have $${player.cash}`;
    }
    if (!this.hasEnoughTime(player)) {
      return `Not enough time to rent apartment. Need ${this.timeCost}, have ${player.time}`;
    }
    return 'Cannot rent this apartment';
  }
}
