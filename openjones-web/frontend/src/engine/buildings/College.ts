/**
 * College - Education building offering study actions and teaching jobs
 *
 * Part of Task B7: Core Buildings (Factory, College, Bank)
 * Worker 2 - Track B (Domain Logic)
 *
 * The College allows players to increase their education level through study actions.
 * It also offers teaching and janitorial jobs for those with sufficient qualifications.
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

/**
 * College building - education and learning
 * Offers study actions and teaching jobs
 */
export class College extends Building {
  // Wage rates per hour (from Java reference)
  private static readonly JANITOR_BASE_WAGE = 6;
  private static readonly TEACHER_BASE_WAGE = 12;
  private static readonly PROFESSOR_BASE_WAGE = 27;

  // Study action constants (from Java StudyAction.java)
  private static readonly STUDY_DURATION = 20; // time units (4 hours)
  private static readonly STUDY_COST = 15; // dollars
  private static readonly EDUCATION_POINTS_GAIN = 1; // education increase

  // Job offerings for this building
  private jobs: IJob[];

  constructor(id: string, name: string, position: IPosition) {
    super(
      id,
      BuildingType.COLLEGE,
      name,
      'Educational institution where you can study to increase your education level',
      position
    );
    this.jobs = this.createCollegeJobs();
  }

  /**
   * Create all job offerings for the College
   * Based on Java reference: College.java
   */
  private createCollegeJobs(): IJob[] {
    return [
      // Rank 1 - Janitor
      {
        id: `${this.id}-job-janitor`,
        title: 'Janitor',
        rank: 1,
        requiredEducation: 5, // rank * 5
        requiredExperience: 10, // rank * 10
        requiredClothesLevel: 1,
        wagePerHour: College.JANITOR_BASE_WAGE,
        experienceGainPerHour: 5, // 1 experience per time unit
        buildingType: BuildingType.COLLEGE,
      },

      // Rank 4 - Teacher
      {
        id: `${this.id}-job-teacher`,
        title: 'Teacher',
        rank: 4,
        requiredEducation: 20, // rank * 5
        requiredExperience: 40, // rank * 10
        requiredClothesLevel: 2,
        wagePerHour: College.TEACHER_BASE_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.COLLEGE,
      },

      // Rank 9 - Professor (highest rank)
      {
        id: `${this.id}-job-professor`,
        title: 'Professor',
        rank: 9,
        requiredEducation: 45, // rank * 5
        requiredExperience: 90, // rank * 10
        requiredClothesLevel: 3,
        wagePerHour: College.PROFESSOR_BASE_WAGE,
        experienceGainPerHour: 5,
        buildingType: BuildingType.COLLEGE,
      },
    ];
  }

  /**
   * Get all job offerings at this College
   */
  getJobOfferings(): IJob[] {
    return [...this.jobs];
  }

  /**
   * Get available actions for a player at this building
   * College offers study actions and exit
   */
  getAvailableActions(player: IPlayerState, game: IGame): IAction[] {
    const actions: IAction[] = [];

    if (this.isPlayerInside(player)) {
      // Study actions with different durations
      actions.push(this.createStudyAction());

      // Exit action
      actions.push(this.createExitAction());
    }

    return actions;
  }

  /**
   * Get the action tree for building interaction
   * College has a simple tree with study and exit actions
   */
  getActionTree(player: IPlayerState, game: IGame): IActionTreeNode {
    const actions = this.getAvailableActions(player, game);

    if (actions.length === 0) {
      // Fallback to exit action
      const exitAction = this.createExitAction();
      return Building.createActionTreeNode(exitAction, [], 0);
    }

    // Create tree with all actions
    const rootAction = actions[0];
    const childNodes = actions.slice(1).map((action, index) =>
      Building.createActionTreeNode(action, [], index + 1)
    );

    return Building.createActionTreeNode(rootAction, childNodes, 0);
  }

  /**
   * Create the study action
   * Based on Java StudyAction.java
   */
  private createStudyAction(): IAction {
    return {
      id: `${this.id}-study`,
      type: ActionType.STUDY,
      displayName: `Study ($${College.STUDY_COST})`,
      description: `Study for ${College.STUDY_DURATION / GAME_CONSTANTS.TIME_UNITS_PER_HOUR} hours to increase your education`,
      timeCost: College.STUDY_DURATION,

      canExecute: (player: IPlayerState, game: IGame) => {
        // Must be inside the college
        if (!this.isPlayerInside(player)) {
          return false;
        }

        // Must have enough cash
        if (!player.canAfford(College.STUDY_COST)) {
          return false;
        }

        // Must have enough time remaining
        if (game.timeUnitsRemaining < College.STUDY_DURATION) {
          return false;
        }

        return true;
      },

      execute: (player: IPlayerState, game: IGame) => {
        // Check preconditions
        if (!this.isPlayerInside(player)) {
          return {
            success: false,
            message: 'You must be inside the college to study',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        if (!player.canAfford(College.STUDY_COST)) {
          return {
            success: false,
            message: `You need $${College.STUDY_COST} to study`,
            timeSpent: 0,
            stateChanges: [],
          };
        }

        if (game.timeUnitsRemaining < College.STUDY_DURATION) {
          return {
            success: false,
            message: 'Not enough time remaining this week',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        // Execute study action
        const newCash = player.cash - College.STUDY_COST;
        const newEducation = Math.min(
          GAME_CONSTANTS.MAX_EDUCATION,
          player.education + College.EDUCATION_POINTS_GAIN
        );

        return {
          success: true,
          message: 'Another brick in the wall', // Easter egg from Java code!
          timeSpent: College.STUDY_DURATION,
          stateChanges: [
            {
              type: 'cash',
              value: newCash,
              description: `Paid $${College.STUDY_COST} for studying`,
            },
            {
              type: 'measure',
              measure: MeasureType.EDUCATION,
              value: newEducation,
              description: `Education increased by ${College.EDUCATION_POINTS_GAIN}`,
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'building',
          value: this.id,
          description: 'Must be inside the college',
        },
        {
          type: 'cash',
          value: College.STUDY_COST,
          comparison: 'gte',
          description: `Need $${College.STUDY_COST}`,
        },
      ],
    };
  }

  /**
   * Create the exit building action
   */
  private createExitAction(): IAction {
    return {
      id: `${this.id}-exit`,
      type: ActionType.EXIT_BUILDING,
      displayName: 'Exit College',
      description: 'Leave the college and return to the street',
      timeCost: 0,

      canExecute: (player: IPlayerState) => this.isPlayerInside(player),

      execute: (player: IPlayerState, game: IGame) => {
        if (!this.isPlayerInside(player)) {
          return {
            success: false,
            message: 'You are not inside the college',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        return {
          success: true,
          message: 'You exit the college',
          timeSpent: 0,
          stateChanges: [
            {
              type: 'position',
              value: this.position,
              description: 'Moved to college position',
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'building',
          value: this.id,
          description: 'Must be inside the college',
        },
      ],
    };
  }
}
