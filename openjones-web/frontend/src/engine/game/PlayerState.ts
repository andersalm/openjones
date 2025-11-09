/**
 * PlayerState - Represents the complete state of a player
 *
 * Part of Task A3: Player State
 * Worker 3 - Track A (Core Engine)
 */

import {
  IPlayerState,
  IPosition,
  IJob,
  IPossession,
  IExperience,
  MeasureType,
  PossessionType,
  GAME_CONSTANTS,
} from '../../../../shared/types/contracts';
import { Position } from '../types/Position';

export class PlayerState implements IPlayerState {
  playerId: string;

  // Core stats
  cash: number;
  health: number;
  happiness: number;
  education: number;
  career: number;

  // Position & location
  position: IPosition;
  currentBuilding: string | null;

  // Employment
  job: IJob | null;
  experience: IExperience[];

  // Possessions & housing
  possessions: IPossession[];
  rentedHome: string | null;
  rentDebt: number;
  weeksOfRentRemaining: number; // Prepaid rent weeks remaining

  constructor(params: {
    playerId: string;
    cash?: number;
    health?: number;
    happiness?: number;
    education?: number;
    career?: number;
    position?: IPosition;
    currentBuilding?: string | null;
    job?: IJob | null;
    experience?: IExperience[];
    possessions?: IPossession[];
    rentedHome?: string | null;
    rentDebt?: number;
    weeksOfRentRemaining?: number;
  }) {
    this.playerId = params.playerId;
    this.cash = params.cash ?? 0;
    this.health = this.clampValue(params.health ?? GAME_CONSTANTS.MAX_HEALTH, 0, GAME_CONSTANTS.MAX_HEALTH);
    this.happiness = this.clampValue(params.happiness ?? GAME_CONSTANTS.MAX_HAPPINESS, 0, GAME_CONSTANTS.MAX_HAPPINESS);
    this.education = this.clampValue(params.education ?? 0, 0, GAME_CONSTANTS.MAX_EDUCATION);
    this.career = params.career ?? 0;
    this.position = params.position ?? new Position(0, 0);
    this.currentBuilding = params.currentBuilding ?? null;
    this.job = params.job ?? null;
    this.experience = params.experience ?? [];
    this.possessions = params.possessions ?? [];
    this.rentedHome = params.rentedHome ?? null;
    this.rentDebt = params.rentDebt ?? 0;
    this.weeksOfRentRemaining = params.weeksOfRentRemaining ?? 0;
  }

  /**
   * Helper method to clamp a value between min and max
   */
  private clampValue(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Create a deep clone of this PlayerState
   */
  clone(): IPlayerState {
    return new PlayerState({
      playerId: this.playerId,
      cash: this.cash,
      health: this.health,
      happiness: this.happiness,
      education: this.education,
      career: this.career,
      position: new Position(this.position.x, this.position.y),
      currentBuilding: this.currentBuilding,
      job: this.job ? { ...this.job } : null,
      experience: this.experience.map(exp => ({ ...exp })),
      possessions: this.possessions.map(p => ({ ...p })),
      rentedHome: this.rentedHome,
      rentDebt: this.rentDebt,
      weeksOfRentRemaining: this.weeksOfRentRemaining,
    });
  }

  /**
   * Update a measure by a delta value
   * Automatically clamps values to valid ranges
   */
  updateMeasure(measure: MeasureType, delta: number): void {
    switch (measure) {
      case MeasureType.HEALTH:
        this.health = this.clampValue(this.health + delta, 0, GAME_CONSTANTS.MAX_HEALTH);
        break;
      case MeasureType.HAPPINESS:
        this.happiness = this.clampValue(this.happiness + delta, 0, GAME_CONSTANTS.MAX_HAPPINESS);
        break;
      case MeasureType.EDUCATION:
        this.education = this.clampValue(this.education + delta, 0, GAME_CONSTANTS.MAX_EDUCATION);
        break;
      case MeasureType.CAREER:
        // Career can grow indefinitely
        this.career = Math.max(0, this.career + delta);
        break;
      case MeasureType.WEALTH:
        // Wealth is represented by cash, which can be negative (debt)
        this.cash += delta;
        break;
    }
  }

  /**
   * Check if the player can afford a given cost
   */
  canAfford(cost: number): boolean {
    return this.cash >= cost;
  }

  /**
   * Check if the player meets the requirements for a job
   */
  meetsJobRequirements(job: IJob): boolean {
    const hasEducation = this.education >= job.requiredEducation;
    const hasExperience = this.getExperienceAtRank(job.rank) >= job.requiredExperience;
    const hasClothes = this.getClothesLevel() >= job.requiredClothesLevel;
    return hasEducation && hasExperience && hasClothes;
  }

  /**
   * Get the level of the best clothes the player owns
   */
  getClothesLevel(): number {
    const clothesPossessions = this.possessions
      .filter((p) => p.type === PossessionType.CLOTHES)
      .filter((p) => p.clothesLevel !== undefined);

    if (clothesPossessions.length === 0) {
      return 0;
    }

    return Math.max(...clothesPossessions.map((p) => p.clothesLevel || 0));
  }

  /**
   * Get the total experience points across all ranks
   */
  getTotalExperience(): number {
    return this.experience.reduce((sum, exp) => sum + exp.points, 0);
  }

  /**
   * Get the experience points at a specific rank
   */
  getExperienceAtRank(rank: number): number {
    const exp = this.experience.find((e) => e.rank === rank);
    return exp ? exp.points : 0;
  }

  /**
   * Add experience points at a specific rank
   */
  addExperience(rank: number, points: number): void {
    const existingExp = this.experience.find((e) => e.rank === rank);
    if (existingExp) {
      existingExp.points += points;
    } else {
      this.experience.push({ rank, points });
    }
    // Update career (sum of all experience)
    this.career = this.getTotalExperience();
  }

  /**
   * Add a possession to the player's inventory
   */
  addPossession(possession: IPossession): void {
    this.possessions.push(possession);
  }

  /**
   * Remove a possession from the player's inventory
   */
  removePossession(possessionId: string): boolean {
    const index = this.possessions.findIndex((p) => p.id === possessionId);
    if (index >= 0) {
      this.possessions.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Factory method to create a PlayerState with default values
   */
  static create(playerId: string, overrides?: Partial<IPlayerState>): PlayerState {
    return new PlayerState({
      playerId,
      ...overrides,
    });
  }

  /**
   * Factory method to create a PlayerState from IPlayerState interface
   */
  static from(state: IPlayerState): PlayerState {
    return new PlayerState({
      playerId: state.playerId,
      cash: state.cash,
      health: state.health,
      happiness: state.happiness,
      education: state.education,
      career: state.career,
      position: state.position,
      currentBuilding: state.currentBuilding,
      job: state.job,
      experience: state.experience,
      possessions: state.possessions,
      rentedHome: state.rentedHome,
      rentDebt: state.rentDebt,
      weeksOfRentRemaining: state.weeksOfRentRemaining,
    });
  }
}
