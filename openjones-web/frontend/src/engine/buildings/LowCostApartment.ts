/**
 * LowCostApartment - Affordable apartment building
 *
 * Part of Task B11: Housing Buildings Implementation
 * Worker 2 - Track B (Domain Logic)
 *
 * This is an affordable apartment that players can rent for $305/week.
 * Provides basic amenities and a place to rest.
 */

import { Building } from './Building';
import {
  IAction,
  IJob,
  IPlayerState,
  IGame,
  IActionTreeNode,
  BuildingType,
  IPosition,
} from '../../../../shared/types/contracts';
import { RelaxAction } from '../actions/RelaxAction';
import { PayRentAction } from '../actions/PayRentAction';

export class LowCostApartment extends Building {
  public static readonly WEEKLY_RENT = 305;

  constructor(id: string, name: string, position: IPosition) {
    super(
      id,
      BuildingType.LOW_COST_APARTMENT,
      name,
      'Affordable apartment. Rent: $305/week. Basic amenities.',
      position
    );
  }

  getAvailableActions(player: IPlayerState, _game: IGame): IAction[] {
    const actions: IAction[] = [];

    // Only show actions if player actually rents THIS apartment
    if (player.rentedHome === this.id) {
      // Relax action - more effective at home
      // 6 hours = good amount of rest at home
      actions.push(new RelaxAction(6));

      // Pay rent action if rent debt exists
      if (player.rentDebt && player.rentDebt > 0) {
        actions.push(new PayRentAction());
      }
    }

    return actions;
  }

  getJobOfferings(): IJob[] {
    return []; // No jobs at apartment
  }

  getActionTree(player: IPlayerState, game: IGame): IActionTreeNode {
    const actions = this.getAvailableActions(player, game);

    if (actions.length === 0) {
      // Player doesn't rent this apartment
      const emptyAction = Building.createSubmenuAction(
        'not-your-home',
        'Not Your Home',
        'You need to rent this apartment first'
      );
      return Building.createActionTreeNode(emptyAction, [], 0);
    }

    // Create root node with first action
    const rootAction = actions[0];
    const children = actions.slice(1).map((action, index) =>
      Building.createActionTreeNode(action, [], index + 1)
    );

    return Building.createActionTreeNode(rootAction, children, 0);
  }

  canEnter(player: IPlayerState): boolean {
    // Only the renter can enter
    return player.rentedHome === this.id;
  }
}
