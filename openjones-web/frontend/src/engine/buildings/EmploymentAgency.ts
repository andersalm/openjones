/**
 * EmploymentAgency - Browse and apply for jobs
 *
 * The Employment Agency allows players to browse all available jobs
 * across all buildings and apply for them.
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
} from '../../../../shared/types/contracts';
import { Building } from './Building';
import { ExitBuildingAction } from '../actions/ExitBuildingAction';

export class EmploymentAgency extends Building {
  constructor(id: string, name: string, position: IPosition) {
    super(
      id,
      BuildingType.EMPLOYMENT_AGENCY,
      name,
      'Browse and apply for jobs from all businesses in town',
      position
    );
  }

  /**
   * Employment agency itself doesn't offer jobs
   */
  getJobOfferings(): IJob[] {
    return [];
  }

  /**
   * Get available actions - browse jobs by building
   * Organized by rank for better UX
   */
  getAvailableActions(player: IPlayerState, game: IGame): IAction[] {
    const actions: IAction[] = [];

    if (this.isPlayerInside(player)) {
      // Get all jobs from all buildings
      const allJobs = this.getAllJobsFromBuildings(game);

      // Sort jobs by rank (ascending), then by wage (descending)
      const sortedJobs = allJobs.sort((a, b) => {
        if (a.rank !== b.rank) {
          return a.rank - b.rank; // Lower ranks first
        }
        return b.wagePerHour - a.wagePerHour; // Higher wages first within rank
      });

      // Create apply actions for each job
      for (const job of sortedJobs) {
        // Skip if player already has this job
        if (player.job?.id === job.id) {
          continue;
        }

        actions.push(this.createApplyForJobAction(job, player));
      }

      // Exit action at the end
      actions.push(new ExitBuildingAction());
    }

    return actions;
  }

  /**
   * Get all jobs from all buildings in the game
   */
  private getAllJobsFromBuildings(game: IGame): IJob[] {
    const allJobs: IJob[] = [];

    // Iterate through all buildings and collect jobs
    const buildings = game.map.getAllBuildings();
    for (const building of buildings) {
      const jobs = building.getJobOfferings();
      allJobs.push(...jobs);
    }

    return allJobs;
  }

  /**
   * Get action tree - hierarchical menu of jobs by building
   */
  getActionTree(player: IPlayerState, game: IGame): IActionTreeNode {
    const actions = this.getAvailableActions(player, game);

    if (actions.length === 0) {
      const exitAction = new ExitBuildingAction();
      return Building.createActionTreeNode(exitAction, [], 0);
    }

    // For now, simple flat list
    // TODO: Create hierarchical menu by building type
    const rootAction = actions[0];
    const childNodes = actions.slice(1).map((action, index) =>
      Building.createActionTreeNode(action, [], index + 1)
    );

    return Building.createActionTreeNode(rootAction, childNodes, 0);
  }

  /**
   * Create apply for job action with building name and location
   * Shows if player qualifies
   */
  private createApplyForJobAction(job: IJob, player: IPlayerState): IAction {
    const applyDuration = 5; // 1 hour in time units

    // Get building ID from job ID (format: "building-id-job-job-name")
    const buildingId = job.id.split('-job-')[0];
    const buildingName = buildingId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Store building ID for later use in success message
    const jobBuildingId = buildingId;

    // Check if player meets requirements and format display
    const meetsReqs = player.meetsJobRequirements(job);
    const statusIcon = meetsReqs ? '✓' : '✗';
    const rankLabel = `[R${job.rank}]`;

    return {
      id: `${this.id}-apply-${job.id}`,
      type: ActionType.APPLY_JOB,
      displayName: `${statusIcon} ${rankLabel} ${job.title} at ${buildingName} - $${job.wagePerHour}/hr`,
      description: `Rank ${job.rank} | Needs: ${job.requiredEducation} edu, ${job.requiredExperience} exp (R${job.rank}), L${job.requiredClothesLevel} clothes`,
      timeCost: applyDuration,

      canExecute: (player: IPlayerState, game: IGame) => {
        // Must be inside
        if (!this.isPlayerInside(player)) {
          return false;
        }

        // Must have enough time
        if (game.timeUnitsRemaining < applyDuration) {
          return false;
        }

        // Check if player meets requirements
        return player.meetsJobRequirements(job);
      },

      execute: (player: IPlayerState, game: IGame) => {
        if (!this.isPlayerInside(player)) {
          return {
            success: false,
            message: 'You must be inside the employment agency',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        if (!player.meetsJobRequirements(job)) {
          // Figure out what requirement failed
          const failures: string[] = [];
          if (player.education < job.requiredEducation) {
            failures.push(`need ${job.requiredEducation} education (have ${player.education})`);
          }
          if (player.getExperienceAtRank(job.rank) < job.requiredExperience) {
            failures.push(`need ${job.requiredExperience} experience at rank ${job.rank} (have ${player.getExperienceAtRank(job.rank)})`);
          }
          if (player.getClothesLevel() < job.requiredClothesLevel) {
            failures.push(`need level ${job.requiredClothesLevel} clothes (have level ${player.getClothesLevel()})`);
          }

          return {
            success: false,
            message: `You don't qualify for this job: ${failures.join(', ')}`,
            timeSpent: 0,
            stateChanges: [],
          };
        }

        if (game.timeUnitsRemaining < applyDuration) {
          return {
            success: false,
            message: 'Not enough time remaining',
            timeSpent: 0,
            stateChanges: [],
          };
        }

        // Find the building to get its location
        const building = game.map.getAllBuildings().find(b => b.id === jobBuildingId);
        const locationStr = building
          ? ` Go to ${building.name} at position (${building.position.x}, ${building.position.y}) to start working.`
          : '';

        return {
          success: true,
          message: `You got the job! You are now ${job.title} at ${buildingName}.${locationStr}`,
          timeSpent: applyDuration,
          stateChanges: [
            {
              type: 'job',
              value: job,
              description: `Got job: ${job.title}`,
            },
          ],
        };
      },

      getRequirements: () => [
        {
          type: 'building',
          value: this.id,
          description: 'Must be at Employment Agency',
        },
        {
          type: 'time',
          value: applyDuration,
          description: `Takes ${applyDuration} time units`,
        },
      ],
    };
  }
}
