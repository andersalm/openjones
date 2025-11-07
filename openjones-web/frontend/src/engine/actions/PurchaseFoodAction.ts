/**
 * PurchaseFoodAction - Action for purchasing food items at stores
 *
 * Part of Task B9: Shopping Buildings (Part 1)
 * Worker 3 - Track B (Domain Logic)
 */

import { PurchaseAction, IPurchasable } from './PurchaseAction';
import { IPlayerState, IGame, ActionType, IActionRequirement, BuildingType } from '@shared/types/contracts';

export class PurchaseFoodAction extends PurchaseAction {
  constructor(
    private food: IPurchasable,
    private buildingType: BuildingType
  ) {
    super(
      `purchase-food-${food.id}`,
      ActionType.PURCHASE,
      `Buy ${food.name}`,
      `Purchase ${food.name} for $${food.price}`,
      food,
      5
    );
  }

  protected canPurchaseAtLocation(player: IPlayerState, game: IGame): boolean {
    // Check if player is in the correct building type
    const currentBuilding = game.map?.getBuildingById(player.currentBuilding || '');
    return currentBuilding?.type === this.buildingType;
  }

  protected addAdditionalRequirements(requirements: IActionRequirement[]): void {
    requirements.push({
      type: 'building',
      value: this.buildingType,
      description: `Must be inside ${this.buildingType}`,
    });
  }

  protected getFailureMessage(player: IPlayerState): string {
    if (!this.hasEnoughCash(player, this.item.price)) {
      return `Not enough cash for ${this.food.name}. Need $${this.food.price}, have $${player.cash}`;
    }
    if (!this.hasEnoughTime(player)) {
      return `Not enough time to purchase food. Need ${this.timeCost} time units`;
    }
    return `Must be inside a ${this.buildingType} to purchase ${this.food.name}`;
  }
}
