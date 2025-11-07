import { PurchaseAction } from './PurchaseAction';
import { StateChangeBuilder } from './ActionResponse';
import { IPlayerState, IGame, ActionType, IActionRequirement } from '@shared/types/contracts';

// Temporary clothing interface until proper types are added
interface IClothing {
  id: string;
  name: string;
  price: number;
  happinessBonus: number;
}

export class PurchaseClothesAction extends PurchaseAction {
  constructor(private clothing: IClothing) {
    super(
      `purchase-clothes-${clothing.id}`,
      ActionType.PURCHASE,
      'Purchase Clothes',
      `Purchase ${clothing.name}`,
      clothing,
      5
    );
  }

  protected canPurchaseAtLocation(player: IPlayerState, _game: IGame): boolean {
    // Can only purchase clothes at a store
    return player.currentBuilding === 'store';
  }

  protected addAdditionalChanges(builder: StateChangeBuilder, player: IPlayerState): void {
    // Add happiness bonus for buying new clothes
    if (this.clothing.happinessBonus > 0) {
      builder.happiness(
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
    if (!player.canAfford(this.clothing.price)) {
      return `Not enough cash for ${this.clothing.name}. Need $${this.clothing.price}, have $${player.cash}`;
    }
    if (!this.hasEnoughTime(player)) {
      return `Not enough time to purchase clothes. Need ${this.timeCost}`;
    }
    if (player.currentBuilding !== 'store') {
      return 'Must be at the Store to purchase clothes';
    }
    return 'Cannot purchase clothes';
  }
}
