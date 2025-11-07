import { PurchaseAction } from './PurchaseAction';
import { StateChangeBuilder } from './StateChangeBuilder';
import { IPlayerState, IGame, IClothing, ActionType, IActionRequirement } from '@shared/types/contracts';

export class PurchaseClothesAction extends PurchaseAction {
  constructor(private clothing: IClothing) {
    super(
      `purchase-clothes-${clothing.id}`,
      ActionType.PURCHASE_CLOTHES,
      'Purchase Clothes',
      `Purchase ${clothing.name}`,
      clothing,
      5
    );
  }

  protected canPurchaseAtLocation(player: IPlayerState, game: IGame): boolean {
    // Can only purchase clothes at a store
    return player.currentLocation === 'store';
  }

  protected addAdditionalChanges(builder: StateChangeBuilder, player: IPlayerState): void {
    // Add happiness bonus for buying new clothes
    if (this.clothing.happinessBonus > 0) {
      builder.happiness(
        player.happiness,
        player.happiness + this.clothing.happinessBonus,
        `Gained ${this.clothing.happinessBonus} happiness from ${this.clothing.name}`
      );
    }
  }

  protected addAdditionalRequirements(requirements: IActionRequirement[]): void {
    requirements.push({
      type: 'location',
      value: 'store',
      description: 'Must be at Store',
    });
  }

  protected getFailureMessage(player: IPlayerState): string {
    if (!this.hasEnoughCash(player, this.clothing.price)) {
      return `Not enough cash for ${this.clothing.name}. Need $${this.clothing.price}, have $${player.cash}`;
    }
    if (!this.hasEnoughTime(player)) {
      return `Not enough time to purchase clothes. Need ${this.timeCost}, have ${player.time}`;
    }
    if (player.currentLocation !== 'store') {
      return 'Must be at the Store to purchase clothes';
    }
    return 'Cannot purchase clothes';
  }
}
