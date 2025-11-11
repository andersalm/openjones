/**
 * LowCostApartment - Basic housing option
 *
 * The Low-Cost Apartment is the cheapest housing option available.
 * Players start here by default. Provides basic relax bonuses.
 */

import {
  IJob,
  IAction,
  IPlayerState,
  IGame,
  IActionTreeNode,
  BuildingType,
  ActionType,
  IPosition,
  MeasureType,
  GAME_CONSTANTS,
} from '../../../../shared/types/contracts';
import { Building } from './Building';
import { ExitBuildingAction } from '../actions/ExitBuildingAction';

export class LowCostApartment extends Building {
  // From Java MapManager.java
  private static readonly BASE_RENT = 305; // Per week
  private static readonly RELAX_HEALTH_BONUS = 3; // Per time unit
  private static readonly RELAX_HAPPINESS_BONUS = 3; // Per time unit
  private static readonly MAX_RELAX_PERIOD = 24; // Max time units per relax

  constructor(id: string, name: string, position: IPosition) {
    super(
      id,
      BuildingType.LOW_COST_APARTMENT,
      name,
      'Basic apartment - $305/week rent. Relax: +3 health/happiness per time unit',
      position
    );
  }

  /**
   * Get rent cost per week
   */
  getRentPerWeek(): number {
    return LowCostApartment.BASE_RENT;
  }

  /**
   * Low-cost apartments don't offer jobs
   */
  getJobOfferings(): IJob[] {
    return [];
  }

  /**
   * Get available actions - relax and exit
   */
  getAvailableActions(player: IPlayerState, _game: IGame): IAction[] {
    const actions: IAction[] = [];

    if (this.isPlayerInside(player)) {
      // Only allow relax if this is the player's rented home
      if (player.rentedHome === this.id) {
        actions.push(this.createRelaxAction());
      }

      // Exit action
      actions.push(new ExitBuildingAction());
    }

    return actions;
  }

  /**
   * Get action tree for building interaction
   */
  getActionTree(player: IPlayerState, game: IGame): IActionTreeNode {
    const actions = this.getAvailableActions(player, game);

    if (actions.length === 0) {
      const exitAction = new ExitBuildingAction();
      return Building.createActionTreeNode(exitAction, [], 0);
    }

    const rootAction = actions[0];
    const childNodes = actions.slice(1).map((action, index) =>
      Building.createActionTreeNode(action, [], index + 1)
    );

    return Building.createActionTreeNode(rootAction, childNodes, 0);
  }

  /**
   * Create relax action - restore health and happiness
   */
  private createRelaxAction(): IAction {
    return {
      id: `${this.id}-relax`,
      type: ActionType.RELAX,
      displayName: 'Relax',
      description: `Rest at home to restore health and happiness (+${LowCostApartment.RELAX_HEALTH_BONUS}/${LowCostApartment.RELAX_HAPPINESS_BONUS} per time unit)`,
      timeCost: LowCostApartment.MAX_RELAX_PERIOD,

      canExecute: (player: IPlayerState, game: IGame) => {
        return (
          this.isPlayerInside(player) &&
          player.rentedHome === this.id &&
          game.timeUnitsRemaining >= LowCostApartment.MAX_RELAX_PERIOD
        );
      },

      execute: (player: IPlayerState, game: IGame) => {
        if (!this.isPlayerInside(player) || player.rentedHome !== this.id) {
          return {
            success: false,
            message: 'You must be in your rented home to relax',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        // Calculate actual relax time based on available time
        const actualTime = Math.min(
          game.timeUnitsRemaining,
          LowCostApartment.MAX_RELAX_PERIOD
        );

        const healthGain = actualTime * LowCostApartment.RELAX_HEALTH_BONUS;
        const happinessGain = actualTime * LowCostApartment.RELAX_HAPPINESS_BONUS;

        const newHealth = Math.min(
          GAME_CONSTANTS.MAX_HEALTH,
          player.health + healthGain
        );
        const newHappiness = Math.min(
          GAME_CONSTANTS.MAX_HAPPINESS,
          player.happiness + happinessGain
        );

        return {
          success: true,
          message: `Relaxed for ${actualTime / GAME_CONSTANTS.TIME_UNITS_PER_HOUR} hours. Feeling refreshed!`,
          timeSpent: actualTime,
          stateChanges: [
            {
              type: 'measure',
              measure: MeasureType.HEALTH,
              value: newHealth,
              description: `Health increased by ${healthGain}`,
            },
            {
              type: 'measure',
              measure: MeasureType.HAPPINESS,
              value: newHappiness,
              description: `Happiness increased by ${happinessGain}`,
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'building',
          value: this.id,
          description: 'Must be in your rented home',
        },
      ],
    };
  }
}
