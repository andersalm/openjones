/**
 * SecurityApartment - High-quality apartment with security and amenities
 *
 * Part of Task B11: Housing Buildings Implementation
 * Worker 2 - Track B (Domain Logic)
 *
 * This is a premium apartment that players can rent for $445/week.
 * Provides enhanced amenities, security, and better rest quality.
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

export class SecurityApartment extends Building {
  public static readonly WEEKLY_RENT = 445;

  constructor(id: string, name: string, position: IPosition) {
    super(
      id,
      BuildingType.SECURITY_APARTMENT,
      name,
      'Secure apartment with amenities. Rent: $445/week. Enhanced comfort.',
      position
    );
  }

  getAvailableActions(player: IPlayerState, _game: IGame): IAction[] {
    const actions: IAction[] = [];

    // Only show actions if player actually rents THIS apartment
    if (player.rentedHome === this.id) {
      // Relax action - even more effective at this nicer apartment
      // Security apartments provide better rest, so slightly longer relaxation
      // 8 hours = full night's rest with enhanced benefits
      actions.push(new RelaxAction(8));

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
