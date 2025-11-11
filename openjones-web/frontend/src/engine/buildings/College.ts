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
  IPosition,
} from '../../../../shared/types/contracts';
import { Building } from './Building';
import { StudyAction } from '../actions/StudyAction';
import { ExitBuildingAction } from '../actions/ExitBuildingAction';

/**
 * College building - education and learning
 * Offers study actions and teaching jobs
 */
export class College extends Building {
  // Wage rates per hour (from Java reference)
  private static readonly JANITOR_BASE_WAGE = 6;
  private static readonly TEACHER_BASE_WAGE = 12;
  private static readonly PROFESSOR_BASE_WAGE = 27;

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
  getAvailableActions(player: IPlayerState, _game: IGame): IAction[] {
    const actions: IAction[] = [];

    if (this.isPlayerInside(player)) {
      // Study action using the new StudyAction class
      const studyAction = new StudyAction();
      actions.push(studyAction);

      // Exit action
      actions.push(new ExitBuildingAction());
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
      const exitAction = new ExitBuildingAction();
      return Building.createActionTreeNode(exitAction, [], 0);
    }

    // Create tree with all actions
    const rootAction = actions[0];
    const childNodes = actions.slice(1).map((action, index) =>
      Building.createActionTreeNode(action, [], index + 1)
    );

    return Building.createActionTreeNode(rootAction, childNodes, 0);
  }
}
