import { Action } from './Action';
import { ActionResponse, StateChangeBuilder } from './ActionResponse';
import { IPlayerState, IGame, IActionResponse, IActionRequirement, ActionType } from '@shared/types/contracts';

export class PayRentAction extends Action {
  constructor() {
    super(
      'pay-rent',
      ActionType.PAY_RENT,
      'Pay Rent',
      'Pay your weekly rent',
      5
    );
  }

  canExecute(player: IPlayerState, _game: IGame): boolean {
    // Must have rent due
    if (player.rentDebt <= 0) {
      return false;
    }

    // Must have enough cash to pay rent
    if (!player.canAfford(player.rentDebt)) {
      return false;
    }

    // Must have enough time
    if (!this.hasEnoughTime(player)) {
      return false;
    }

    return true;
  }

  execute(player: IPlayerState, game: IGame): IActionResponse {
    if (!this.canExecute(player, game)) {
      return ActionResponse.failure(this.getFailureMessage(player));
    }

    const rentAmount = player.rentDebt;

    const changes = StateChangeBuilder.create()
      .cash(player.cash - rentAmount, `Paid rent: $${rentAmount}`)
      .custom('rentDebt', 0, 'Rent paid for the week')
      .build();

    return ActionResponse.success(
      `Paid rent of $${rentAmount}. Rent is now paid for the week.`,
      this.timeCost,
      changes
    );
  }

  getRequirements(): IActionRequirement[] {
    return [
      {
        type: 'cash',
        value: 0,
        description: 'Cash: Enough to cover rent due',
      },
      {
        type: 'time',
        value: this.timeCost,
        description: `Time: ${this.timeCost} units`,
      },
    ];
  }

  private getFailureMessage(player: IPlayerState): string {
    if (player.rentDebt <= 0) {
      return 'No rent is due at this time';
    }
    if (!player.canAfford(player.rentDebt)) {
      return `Not enough cash to pay rent. Need $${player.rentDebt}, have $${player.cash}`;
    }
    if (!this.hasEnoughTime(player)) {
      return `Not enough time to pay rent. Need ${this.timeCost}`;
    }
    return 'Cannot pay rent';
  }
}
