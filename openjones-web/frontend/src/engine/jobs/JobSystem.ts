/**
 * JobSystem - Manages all jobs in the game
 *
 * Part of Task B3: Job System
 * Worker 3 - Track B (Domain Logic)
 *
 * Provides:
 * - Job definitions for all buildings
 * - Job application and quitting logic
 * - Job requirement validation
 * - Salary calculations
 */

import {
  IJob,
  IPlayerState,
  BuildingType,
  GAME_CONSTANTS,
} from '../../../../shared/types/contracts';

/**
 * Job definitions for each building type and rank
 * Based on the Java implementation from the original OpenJones game
 */
export const JOB_DEFINITIONS: IJob[] = [
  // UNEMPLOYED - Starting job
  {
    id: 'unemployed',
    title: 'Unemployed',
    rank: 0,
    requiredEducation: 0,
    requiredExperience: 0,
    requiredClothesLevel: 0,
    wagePerHour: 0,
    experienceGainPerHour: 0,
    buildingType: BuildingType.EMPLOYMENT_AGENCY,
  },

  // FACTORY JOBS (Rank 1-8)
  {
    id: 'factory-janitor',
    title: 'Janitor',
    rank: 1,
    requiredEducation: 5, // 5 * rank
    requiredExperience: 10, // 10 * rank
    requiredClothesLevel: 1,
    wagePerHour: 6,
    experienceGainPerHour: 1,
    buildingType: BuildingType.FACTORY,
  },
  {
    id: 'factory-assembly-worker',
    title: 'Assembly Worker',
    rank: 1,
    requiredEducation: 5,
    requiredExperience: 10,
    requiredClothesLevel: 1,
    wagePerHour: 7,
    experienceGainPerHour: 1,
    buildingType: BuildingType.FACTORY,
  },
  {
    id: 'factory-secretary',
    title: 'Secretary',
    rank: 2,
    requiredEducation: 10,
    requiredExperience: 20,
    requiredClothesLevel: 2,
    wagePerHour: 8,
    experienceGainPerHour: 1,
    buildingType: BuildingType.FACTORY,
  },
  {
    id: 'factory-machinist-helper',
    title: 'Machinist Helper',
    rank: 3,
    requiredEducation: 15,
    requiredExperience: 30,
    requiredClothesLevel: 1,
    wagePerHour: 9,
    experienceGainPerHour: 1,
    buildingType: BuildingType.FACTORY,
  },
  {
    id: 'factory-executive-secretary',
    title: 'Executive Secretary',
    rank: 4,
    requiredEducation: 20,
    requiredExperience: 40,
    requiredClothesLevel: 3,
    wagePerHour: 18,
    experienceGainPerHour: 1,
    buildingType: BuildingType.FACTORY,
  },
  {
    id: 'factory-machinist',
    title: 'Machinist',
    rank: 5,
    requiredEducation: 25,
    requiredExperience: 50,
    requiredClothesLevel: 1,
    wagePerHour: 19,
    experienceGainPerHour: 1,
    buildingType: BuildingType.FACTORY,
  },
  {
    id: 'factory-department-manager',
    title: 'Department Manager',
    rank: 6,
    requiredEducation: 30,
    requiredExperience: 60,
    requiredClothesLevel: 3,
    wagePerHour: 21,
    experienceGainPerHour: 1,
    buildingType: BuildingType.FACTORY,
  },
  {
    id: 'factory-engineer',
    title: 'Engineer',
    rank: 7,
    requiredEducation: 35,
    requiredExperience: 70,
    requiredClothesLevel: 2,
    wagePerHour: 23,
    experienceGainPerHour: 1,
    buildingType: BuildingType.FACTORY,
  },
  {
    id: 'factory-general-manager',
    title: 'General Manager',
    rank: 8,
    requiredEducation: 40,
    requiredExperience: 80,
    requiredClothesLevel: 3,
    wagePerHour: 25,
    experienceGainPerHour: 1,
    buildingType: BuildingType.FACTORY,
  },

  // RESTAURANT JOBS (Rank 1-4)
  {
    id: 'restaurant-cook',
    title: 'Cook',
    rank: 1,
    requiredEducation: 5,
    requiredExperience: 0, // Special case in Java: cook requires 0 experience
    requiredClothesLevel: 1,
    wagePerHour: 3,
    experienceGainPerHour: 1,
    buildingType: BuildingType.RESTAURANT,
  },
  {
    id: 'restaurant-clerk',
    title: 'Clerk',
    rank: 2,
    requiredEducation: 10,
    requiredExperience: 20,
    requiredClothesLevel: 1,
    wagePerHour: 5,
    experienceGainPerHour: 1,
    buildingType: BuildingType.RESTAURANT,
  },
  {
    id: 'restaurant-assistant-manager',
    title: 'Assistant Manager',
    rank: 3,
    requiredEducation: 15,
    requiredExperience: 30,
    requiredClothesLevel: 2,
    wagePerHour: 7,
    experienceGainPerHour: 1,
    buildingType: BuildingType.RESTAURANT,
  },
  {
    id: 'restaurant-manager',
    title: 'Manager',
    rank: 4,
    requiredEducation: 20,
    requiredExperience: 40,
    requiredClothesLevel: 3,
    wagePerHour: 9,
    experienceGainPerHour: 1,
    buildingType: BuildingType.RESTAURANT,
  },

  // COLLEGE JOBS (Rank 1, 4, 9)
  {
    id: 'college-janitor',
    title: 'Janitor',
    rank: 1,
    requiredEducation: 5,
    requiredExperience: 10,
    requiredClothesLevel: 1,
    wagePerHour: 6,
    experienceGainPerHour: 1,
    buildingType: BuildingType.COLLEGE,
  },
  {
    id: 'college-teacher',
    title: 'Teacher',
    rank: 4,
    requiredEducation: 20,
    requiredExperience: 40,
    requiredClothesLevel: 2,
    wagePerHour: 12,
    experienceGainPerHour: 1,
    buildingType: BuildingType.COLLEGE,
  },
  {
    id: 'college-professor',
    title: 'Professor',
    rank: 9,
    requiredEducation: 45,
    requiredExperience: 90,
    requiredClothesLevel: 3,
    wagePerHour: 27,
    experienceGainPerHour: 1,
    buildingType: BuildingType.COLLEGE,
  },

  // CLOTHES STORE JOBS (Rank 2-4)
  {
    id: 'clothesstore-salesperson',
    title: 'Salesperson',
    rank: 2,
    requiredEducation: 10,
    requiredExperience: 20,
    requiredClothesLevel: 1,
    wagePerHour: 6,
    experienceGainPerHour: 1,
    buildingType: BuildingType.CLOTHES_STORE,
  },
  {
    id: 'clothesstore-assistant-manager',
    title: 'Assistant Manager',
    rank: 3,
    requiredEducation: 15,
    requiredExperience: 30,
    requiredClothesLevel: 2,
    wagePerHour: 9,
    experienceGainPerHour: 1,
    buildingType: BuildingType.CLOTHES_STORE,
  },
  {
    id: 'clothesstore-manager',
    title: 'Manager',
    rank: 4,
    requiredEducation: 20,
    requiredExperience: 40,
    requiredClothesLevel: 3,
    wagePerHour: 11,
    experienceGainPerHour: 1,
    buildingType: BuildingType.CLOTHES_STORE,
  },
];

/**
 * Result type for job application attempts
 */
export interface JobApplicationResult {
  success: boolean;
  message: string;
  job?: IJob;
  failedRequirements?: string[];
}

/**
 * JobSystem - Main system for managing jobs
 */
export class JobSystem {
  private jobs: IJob[];

  constructor() {
    this.jobs = [...JOB_DEFINITIONS];
  }

  /**
   * Get all available jobs (optionally filtered by building type)
   */
  getAvailableJobs(buildingType?: BuildingType): IJob[] {
    if (buildingType) {
      return this.jobs.filter((job) => job.buildingType === buildingType);
    }
    return [...this.jobs];
  }

  /**
   * Get a job by ID
   */
  getJobById(jobId: string): IJob | null {
    return this.jobs.find((job) => job.id === jobId) || null;
  }

  /**
   * Get all jobs for a specific rank
   */
  getJobsByRank(rank: number): IJob[] {
    return this.jobs.filter((job) => job.rank === rank);
  }

  /**
   * Get the unemployed job
   */
  getUnemployedJob(): IJob {
    const unemployed = this.jobs.find((job) => job.id === 'unemployed');
    if (!unemployed) {
      throw new Error('Unemployed job not found in job definitions');
    }
    return unemployed;
  }

  /**
   * Apply for a job
   * Returns a result indicating success or failure with reasons
   */
  applyForJob(player: IPlayerState, jobId: string): JobApplicationResult {
    const job = this.getJobById(jobId);

    if (!job) {
      return {
        success: false,
        message: `Job with id '${jobId}' not found`,
      };
    }

    // Check if player already has this job
    if (player.job && player.job.id === jobId) {
      return {
        success: false,
        message: `You already have the ${job.title} position`,
      };
    }

    // Validate requirements
    const validation = this.validateJobRequirements(player, job);

    if (!validation.success) {
      return {
        success: false,
        message: `You don't meet the requirements for ${job.title}`,
        failedRequirements: validation.failedRequirements,
      };
    }

    // Success! Player can have this job
    return {
      success: true,
      message: `Congratulations! You got the job as ${job.title} at ${this.getBuildingName(job.buildingType)}`,
      job,
    };
  }

  /**
   * Quit the current job
   * Returns the player to unemployed status
   */
  quitJob(player: IPlayerState): JobApplicationResult {
    if (!player.job || player.job.id === 'unemployed') {
      return {
        success: false,
        message: 'You are already unemployed',
      };
    }

    const unemployedJob = this.getUnemployedJob();

    return {
      success: true,
      message: `You quit your job as ${player.job.title}. You are now unemployed.`,
      job: unemployedJob,
    };
  }

  /**
   * Validate if a player meets the requirements for a job
   */
  validateJobRequirements(
    player: IPlayerState,
    job: IJob
  ): { success: boolean; failedRequirements: string[] } {
    const failedRequirements: string[] = [];

    // Check education requirement
    if (player.education < job.requiredEducation) {
      failedRequirements.push(
        `Education: ${player.education}/${job.requiredEducation} required`
      );
    }

    // Check experience requirement
    // According to Java code, we check current rank and one rank below
    const hasExperience = this.checkExperienceRequirement(player, job);
    if (!hasExperience) {
      failedRequirements.push(
        `Experience: Need ${job.requiredExperience} points at rank ${job.rank} or ${Math.max(1, job.rank - 1)}`
      );
    }

    // Check clothes level requirement
    const clothesLevel = player.getClothesLevel();
    if (clothesLevel < job.requiredClothesLevel) {
      failedRequirements.push(
        `Clothes: Level ${clothesLevel}/${job.requiredClothesLevel} required`
      );
    }

    return {
      success: failedRequirements.length === 0,
      failedRequirements,
    };
  }

  /**
   * Check if player has enough experience for a job
   * Based on Java's LOWER_EXPERIENCE_RANKS_ACCEPTABLE = 1
   * We check current rank and one rank below
   */
  private checkExperienceRequirement(player: IPlayerState, job: IJob): boolean {
    const lowestAcceptableRank = Math.max(1, job.rank - 1);

    for (let rank = lowestAcceptableRank; rank <= job.rank; rank++) {
      const experienceAtRank = player.getExperienceAtRank(rank);
      if (experienceAtRank >= job.requiredExperience) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate wage for working at a job for a certain number of hours
   */
  calculateWage(job: IJob, hours: number): number {
    return job.wagePerHour * hours;
  }

  /**
   * Calculate experience gain for working at a job for a certain number of hours
   */
  calculateExperienceGain(job: IJob, hours: number): number {
    return job.experienceGainPerHour * hours;
  }

  /**
   * Get a human-readable building name from BuildingType
   */
  private getBuildingName(buildingType: BuildingType): string {
    const names: Record<BuildingType, string> = {
      [BuildingType.EMPLOYMENT_AGENCY]: 'Employment Agency',
      [BuildingType.FACTORY]: 'Factory',
      [BuildingType.BANK]: 'Bank',
      [BuildingType.COLLEGE]: 'College',
      [BuildingType.DEPARTMENT_STORE]: 'Department Store',
      [BuildingType.CLOTHES_STORE]: 'Clothes Store',
      [BuildingType.APPLIANCE_STORE]: 'Appliance Store',
      [BuildingType.PAWN_SHOP]: 'Pawn Shop',
      [BuildingType.RESTAURANT]: 'Restaurant',
      [BuildingType.SUPERMARKET]: 'Supermarket',
      [BuildingType.RENT_AGENCY]: 'Rent Agency',
      [BuildingType.LOW_COST_APARTMENT]: 'Low Cost Apartment',
      [BuildingType.SECURITY_APARTMENT]: 'Security Apartment',
    };
    return names[buildingType] || buildingType;
  }

  /**
   * Get all jobs that a player qualifies for
   */
  getQualifiedJobs(player: IPlayerState): IJob[] {
    return this.jobs.filter((job) => {
      const validation = this.validateJobRequirements(player, job);
      return validation.success;
    });
  }

  /**
   * Get the best job a player qualifies for (highest wage)
   */
  getBestQualifiedJob(player: IPlayerState): IJob | null {
    const qualifiedJobs = this.getQualifiedJobs(player);
    if (qualifiedJobs.length === 0) {
      return null;
    }

    return qualifiedJobs.reduce((best, current) =>
      current.wagePerHour > best.wagePerHour ? current : best
    );
  }
}

/**
 * Singleton instance for convenience
 */
export const jobSystem = new JobSystem();
