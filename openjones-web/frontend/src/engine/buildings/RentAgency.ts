/**
 * RentAgency - Building where players can rent apartments
 *
 * Part of Task B11: Housing Buildings Implementation
 * Worker 2 - Track B (Domain Logic)
 *
 * This building allows players to rent apartments and pay rent.
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
import { PayRentAction } from '../actions/PayRentAction';

export class RentAgency extends Building {
  // Rent prices (weekly) - for future use when apartment registry is available
  // private static readonly LOW_COST_RENT = 305;
  // private static readonly SECURITY_RENT = 445;

  constructor(id: string, name: string, position: IPosition) {
    super(
      id,
      BuildingType.RENT_AGENCY,
      name,
      'Rent an apartment here. Choose between affordable or secure housing.',
      position
    );
  }

  getAvailableActions(player: IPlayerState, _game: IGame): IAction[] {
    const actions: IAction[] = [];

    // Add pay rent action if player has rent debt
    if (player.rentDebt && player.rentDebt > 0) {
      actions.push(new PayRentAction());
    }

    // TODO: Add RentHouseAction when apartment instances are available
    // This will be implemented when the apartment buildings are registered in the game

    return actions;
  }

  getJobOfferings(): IJob[] {
    return []; // Rent agency offers no jobs
  }

  getActionTree(player: IPlayerState, game: IGame): IActionTreeNode {
    const actions = this.getAvailableActions(player, game);

    if (actions.length === 0) {
      // Return empty tree if no actions available
      const emptyAction = Building.createSubmenuAction(
        'no-actions',
        'No Actions Available',
        'Come back when you need to pay rent or want to rent a new place'
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

  canEnter(_player: IPlayerState): boolean {
    return true; // Anyone can enter the rent agency
  }
}
