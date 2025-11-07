import { Action } from './Action';
import { ActionResponse, StateChangeBuilder } from './ActionResponse';
import { IPlayerState, IGame, IActionResponse, IActionRequirement, ActionType } from '@shared/types/contracts';

export interface IPurchasable {
  id: string;
  name: string;
  price: number;
}

export abstract class PurchaseAction extends Action {
  constructor(
    id: string,
    type: ActionType,
    name: string,
    description: string,
    protected item: IPurchasable,
    timeCost: number = 5
  ) {
    super(id, type, name, description, timeCost);
  }

  canExecute(player: IPlayerState, game: IGame): boolean {
    // Check if player has enough cash
    if (!player.canAfford(this.item.price)) {
      return false;
    }

    // Check if player has enough time
    if (!this.hasEnoughTime(player)) {
      return false;
    }

    // Check if player is at the correct location
    if (!this.canPurchaseAtLocation(player, game)) {
      return false;
    }

    return true;
  }

  execute(player: IPlayerState, game: IGame): IActionResponse {
    if (!this.canExecute(player, game)) {
      return ActionResponse.failure(this.getFailureMessage(player));
    }

    const changes = StateChangeBuilder.create()
      .cash(player.cash - this.item.price, `Purchased ${this.item.name}`);

    this.addAdditionalChanges(changes, player);

    return ActionResponse.success(
      `Successfully purchased ${this.item.name} for $${this.item.price}`,
      this.timeCost,
      changes.build()
    );
  }

  getRequirements(): IActionRequirement[] {
    const requirements: IActionRequirement[] = [
      {
        type: 'cash',
        value: this.item.price,
        description: `Cash: $${this.item.price}`,
      },
      {
        type: 'time',
        value: this.timeCost,
        description: `Time: ${this.timeCost} units`,
      },
    ];

    this.addAdditionalRequirements(requirements);

    return requirements;
  }

  protected abstract canPurchaseAtLocation(player: IPlayerState, game: IGame): boolean;

  protected addAdditionalChanges(_builder: StateChangeBuilder, _player: IPlayerState): void {
    // Override in subclasses to add specific changes
  }

  protected addAdditionalRequirements(_requirements: IActionRequirement[]): void {
    // Override in subclasses to add specific requirements
  }

  protected getFailureMessage(player: IPlayerState): string {
    if (!player.canAfford(this.item.price)) {
      return `Not enough cash. Need $${this.item.price}, have $${player.cash}`;
    }
    if (!this.hasEnoughTime(player)) {
      return `Not enough time. Need ${this.timeCost}`;
    }
    return 'Cannot purchase this item at current location';
  }
}
