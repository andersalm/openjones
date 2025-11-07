import { Action } from './Action';
import { ActionResponse, StateChangeBuilder } from './ActionResponse';
import { IPlayerState, IGame, IActionResponse, IActionRequirement, ActionType } from '@shared/types/contracts';

// Temporary apartment interface until proper types are added
interface IApartment {
  id: string;
  name: string;
  weeklyRent: number;
  happinessBonus?: number;
}

export class RentHouseAction extends Action {
  constructor(private apartment: IApartment) {
    super(
      `rent-house-${apartment.id}`,
      ActionType.RENT_HOME,
      'Rent Apartment',
      `Rent ${apartment.name}`,
      10
    );
  }

  canExecute(player: IPlayerState, _game: IGame): boolean {
    // Must have enough cash for first week's rent
    if (!player.canAfford(this.apartment.weeklyRent)) {
      return false;
    }

    // Must have enough time
    if (!this.hasEnoughTime(player)) {
      return false;
    }

    // Player shouldn't already have this apartment
    if (player.rentedHome === this.apartment.id) {
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
        player.cash - this.apartment.weeklyRent,
        `Paid first week rent: $${this.apartment.weeklyRent}`
      )
      .custom('rentedHome', this.apartment.id, `Rented ${this.apartment.name}`)
      .custom('rentDebt', 0, 'Rent paid for first week');

    // Add happiness bonus if applicable
    if (this.apartment.happinessBonus && this.apartment.happinessBonus > 0) {
      changes.happiness(
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
    if (player.rentedHome === this.apartment.id) {
      return `You are already renting ${this.apartment.name}`;
    }
    if (!player.canAfford(this.apartment.weeklyRent)) {
      return `Not enough cash for first week rent. Need $${this.apartment.weeklyRent}, have $${player.cash}`;
    }
    if (!this.hasEnoughTime(player)) {
      return `Not enough time to rent apartment. Need ${this.timeCost}`;
    }
    return 'Cannot rent this apartment';
  }
}
