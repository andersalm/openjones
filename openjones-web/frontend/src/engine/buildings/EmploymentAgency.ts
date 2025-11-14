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
  // Track which building's jobs are currently being viewed (null = show all companies)
  private selectedBuildingId: string | null = null;

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
   * Get available actions - two-step menu: companies first, then jobs
   */
  getAvailableActions(player: IPlayerState, game: IGame): IAction[] {
    const actions: IAction[] = [];

    if (this.isPlayerInside(player)) {
      if (this.selectedBuildingId === null) {
        // STEP 1: Show all companies that have jobs
        actions.push(...this.getCompanyBrowseActions(game));
      } else {
        // STEP 2: Show jobs from selected company
        actions.push(this.getBackAction());
        actions.push(...this.getJobsForBuilding(this.selectedBuildingId, player, game));
      }

      // Exit action always at the end
      actions.push(new ExitBuildingAction());
    }

    return actions;
  }

  /**
   * Get company browse actions - shows list of companies hiring
   */
  private getCompanyBrowseActions(game: IGame): IAction[] {
    const actions: IAction[] = [];
    const buildings = game.map.getAllBuildings();

    // Group buildings by those that have jobs
    const buildingsWithJobs = buildings.filter(b => b.getJobOfferings().length > 0);

    // Sort by building name
    buildingsWithJobs.sort((a, b) => a.name.localeCompare(b.name));

    for (const building of buildingsWithJobs) {
      const jobCount = building.getJobOfferings().length;
      actions.push({
        id: `${this.id}-browse-${building.id}`,
        type: ActionType.SUBMENU,
        displayName: `${building.name} (${jobCount} job${jobCount !== 1 ? 's' : ''})`,
        description: `Browse job openings at ${building.name}`,
        timeCost: 0,

        canExecute: () => true,

        execute: () => {
          // Set selected building to show its jobs
          this.selectedBuildingId = building.id;
          return {
            success: true,
            message: `Browsing jobs at ${building.name}`,
            timeSpent: 0,
            stateChanges: [],
          };
        },

        getRequirements: () => [],
      });
    }

    return actions;
  }

  /**
   * Get back action to return to company list
   */
  private getBackAction(): IAction {
    return {
      id: `${this.id}-back`,
      type: ActionType.SUBMENU,
      displayName: '← Back to Companies',
      description: 'Return to company list',
      timeCost: 0,

      canExecute: () => true,

      execute: () => {
        this.selectedBuildingId = null;
        return {
          success: true,
          message: 'Returned to company list',
          timeSpent: 0,
          stateChanges: [],
        };
      },

      getRequirements: () => [],
    };
  }

  /**
   * Get jobs for a specific building
   */
  private getJobsForBuilding(buildingId: string, player: IPlayerState, game: IGame): IAction[] {
    const actions: IAction[] = [];
    const buildings = game.map.getAllBuildings();
    const building = buildings.find(b => b.id === buildingId);

    if (!building) {
      return actions;
    }

    const jobs = building.getJobOfferings();

    // Sort jobs by rank (ascending), then by wage (descending)
    const sortedJobs = jobs.sort((a, b) => {
      if (a.rank !== b.rank) {
        return a.rank - b.rank;
      }
      return b.wagePerHour - a.wagePerHour;
    });

    for (const job of sortedJobs) {
      // Skip if player already has this job
      if (player.job?.id === job.id) {
        continue;
      }

      actions.push(this.createApplyForJobAction(job, player, building.name));
    }

    return actions;
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
  private createApplyForJobAction(job: IJob, player: IPlayerState, buildingName: string): IAction {
    const applyDuration = 5; // 1 hour in time units

    // Get building ID from job ID (format: "building-id-job-job-name")
    const buildingId = job.id.split('-job-')[0];
    const jobBuildingId = buildingId;

    // Check if player meets requirements and format display
    const meetsReqs = player.meetsJobRequirements(job);
    const statusIcon = meetsReqs ? '✓' : '✗';
    const rankLabel = `[R${job.rank}]`;

    return {
      id: `${this.id}-apply-${job.id}`,
      type: ActionType.APPLY_JOB,
      displayName: `${statusIcon} ${rankLabel} ${job.title} - $${job.wagePerHour}/hr`,
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
