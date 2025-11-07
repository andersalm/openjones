/**
 * CORE CONTRACTS - OpenJones Browser Port
 *
 * This file defines all TypeScript interfaces that form the contracts
 * between different development tracks.
 *
 * IMPORTANT: These contracts are locked during Week 1 and should not be
 * changed without team discussion and approval.
 *
 * Last Updated: 2025-11-06
 * Status: Phase 0 - Initial Definition
 */

// ============================================
// ENUMS & CONSTANTS
// ============================================

export enum ActionType {
  MOVE = 'MOVE',
  ENTER_BUILDING = 'ENTER_BUILDING',
  EXIT_BUILDING = 'EXIT_BUILDING',
  WORK = 'WORK',
  STUDY = 'STUDY',
  RELAX = 'RELAX',
  PURCHASE = 'PURCHASE',
  SELL = 'SELL',
  APPLY_JOB = 'APPLY_JOB',
  PAY_RENT = 'PAY_RENT',
  RENT_HOME = 'RENT_HOME',
  SUBMENU = 'SUBMENU',
}

export enum BuildingType {
  EMPLOYMENT_AGENCY = 'EMPLOYMENT_AGENCY',
  FACTORY = 'FACTORY',
  BANK = 'BANK',
  COLLEGE = 'COLLEGE',
  DEPARTMENT_STORE = 'DEPARTMENT_STORE',
  CLOTHES_STORE = 'CLOTHES_STORE',
  APPLIANCE_STORE = 'APPLIANCE_STORE',
  PAWN_SHOP = 'PAWN_SHOP',
  RESTAURANT = 'RESTAURANT',
  SUPERMARKET = 'SUPERMARKET',
  RENT_AGENCY = 'RENT_AGENCY',
  LOW_COST_APARTMENT = 'LOW_COST_APARTMENT',
  SECURITY_APARTMENT = 'SECURITY_APARTMENT',
}

export enum MeasureType {
  HEALTH = 'HEALTH',
  HAPPINESS = 'HAPPINESS',
  EDUCATION = 'EDUCATION',
  CAREER = 'CAREER',
  WEALTH = 'WEALTH',
}

export enum PossessionType {
  FOOD = 'FOOD',
  CLOTHES = 'CLOTHES',
  APPLIANCE = 'APPLIANCE',
  STOCK = 'STOCK',
}

export const GAME_CONSTANTS = {
  TIME_UNITS_PER_WEEK: 600,
  TIME_UNITS_PER_HOUR: 5,
  GRID_WIDTH: 5,
  GRID_HEIGHT: 5,
  MAX_HEALTH: 100,
  MAX_HAPPINESS: 100,
  MAX_EDUCATION: 100,
  MAX_JOB_RANK: 9,
} as const;

// ============================================
// POSITION & MAP
// Owner: Worker 2 (Track B)
// ============================================

export interface IPosition {
  x: number; // 0-4
  y: number; // 0-4
  equals(other: IPosition): boolean;
  toString(): string;
}

export interface IRoute {
  start: IPosition;
  end: IPosition;
  positions: IPosition[];
  distance: number;
}

export interface IMap {
  width: number; // 5
  height: number; // 5

  getBuilding(position: IPosition): IBuilding | null;
  getAllBuildings(): IBuilding[];
  getBuildingById(id: string): IBuilding | null;
  isValidPosition(position: IPosition): boolean;
  getRoute(from: IPosition, to: IPosition): IRoute;
  getAdjacentPositions(position: IPosition): IPosition[];
}

// ============================================
// JOB SYSTEM
// Owner: Worker 2 (Track B)
// ============================================

export interface IJob {
  id: string;
  title: string;
  rank: number; // 1-9
  requiredEducation: number;
  requiredExperience: number; // Experience at this rank or higher
  requiredClothesLevel: number;
  wagePerHour: number;
  experienceGainPerHour: number;
  buildingType: BuildingType;
}

export interface IExperience {
  rank: number;
  points: number;
}

// ============================================
// POSSESSIONS
// Owner: Worker 2 (Track B)
// ============================================

export interface IPossessionEffect {
  measure: MeasureType;
  delta: number;
  duration?: number; // in time units, undefined means permanent
}

export interface IPossession {
  id: string;
  type: PossessionType;
  name: string;
  value: number; // Worth in dollars
  purchasePrice: number;
  effects: IPossessionEffect[];

  // Food-specific
  spoilTime?: number; // Week when it spoils

  // Clothes-specific
  clothesLevel?: number;
}

// ============================================
// ECONOMY
// Owner: Worker 2 (Track B)
// ============================================

export interface IEconomyModel {
  getPrice(itemId: string, buildingType: BuildingType): number;
  getWage(job: IJob, hoursWorked: number): number;
  getRent(homeType: BuildingType): number;
  getStockPrice(week: number): number;
  calculateSellPrice(possession: IPossession): number;
}

// ============================================
// PLAYER STATE
// Owner: Worker 1 (Track A)
// ============================================

export interface IPlayerState {
  playerId: string;

  // Core stats
  cash: number;
  health: number; // 0-100
  happiness: number; // 0-100
  education: number; // 0-100
  career: number; // Sum of experience across all ranks

  // Position & location
  position: IPosition;
  currentBuilding: string | null; // building ID or null if on street

  // Employment
  job: IJob | null;
  experience: IExperience[]; // Experience at each rank level

  // Possessions & housing
  possessions: IPossession[];
  rentedHome: string | null; // building ID or null
  rentDebt: number;

  // Methods
  clone(): IPlayerState;
  updateMeasure(measure: MeasureType, delta: number): void;
  canAfford(cost: number): boolean;
  meetsJobRequirements(job: IJob): boolean;
  getClothesLevel(): number;
  getTotalExperience(): number;
  getExperienceAtRank(rank: number): number;
}

export interface IPlayer {
  id: string;
  name: string;
  color: string; // For rendering
  state: IPlayerState;
  isAI: boolean;
}

// ============================================
// ACTIONS
// Owner: Worker 1 (Track A)
// ============================================

export interface IActionRequirement {
  type: 'cash' | 'measure' | 'job' | 'possession' | 'building' | 'location' | 'time';
  value: number | string;
  comparison?: 'gte' | 'lte' | 'eq';
  description: string;
}

export interface IStateChange {
  type: 'cash' | 'measure' | 'possession_add' | 'possession_remove' | 'job' | 'position' | 'location' | 'time';
  measure?: MeasureType;
  value: number | string | IPossession | IJob | IPosition;
  description: string;
}

export interface IActionResponse {
  success: boolean;
  message: string;
  timeSpent: number;
  stateChanges: IStateChange[];
  nextActions?: IAction[]; // For sub-menus
}

export interface IAction {
  id: string;
  type: ActionType;
  displayName: string;
  description: string;
  timeCost: number; // in time units (5 units = 1 hour)

  canExecute(player: IPlayerState, game: IGame): boolean;
  execute(player: IPlayerState, game: IGame): IActionResponse;
  getRequirements(): IActionRequirement[];
}

export interface IActionTreeNode {
  action: IAction;
  children: IActionTreeNode[];
  index: number; // For menu selection
}

// ============================================
// BUILDINGS
// Owner: Worker 2 (Track B)
// ============================================

export interface IBuilding {
  id: string;
  type: BuildingType;
  name: string;
  description: string;
  position: IPosition;

  getAvailableActions(player: IPlayerState, game: IGame): IAction[];
  getJobOfferings(): IJob[];
  getActionTree(player: IPlayerState, game: IGame): IActionTreeNode;
  canEnter(player: IPlayerState): boolean;
  isHome(): boolean; // True for apartments
}

// ============================================
// VICTORY CONDITIONS
// Owner: Worker 1 (Track A)
// ============================================

export interface IVictoryConditions {
  targetWealth: number;
  targetHealth: number;
  targetHappiness: number;
  targetCareer: number;
  targetEducation: number;
}

export interface IVictoryResult {
  playerId: string;
  playerName: string;
  week: number;
  conditionsMet: {
    wealth: boolean;
    health: boolean;
    happiness: boolean;
    career: boolean;
    education: boolean;
  };
  isVictory: boolean;
}

export interface IVictoryCondition {
  id: string;
  name?: string;
  type: 'measure' | 'cash' | 'education' | 'career' | 'happiness';
  description: string;
  targetValue: number;
  currentValue: number;
  measureType?: string;
  isAchieved?: boolean;
}

// ============================================
// GAME CONFIGURATION
// Owner: Worker 1 (Track A)
// ============================================

export interface IGameConfig {
  players: Array<{
    id: string;
    name: string;
    color: string;
    isAI: boolean;
    aiType?: 'random' | 'greedy' | 'ordered' | 'search';
  }>;
  victoryConditions: IVictoryConditions;
  startingCash: number;
  startingStats: {
    health: number;
    happiness: number;
    education: number;
  };
}

// ============================================
// GAME STATE & MAIN GAME
// Owner: Worker 1 (Track A)
// ============================================

export interface IGame {
  id: string;
  currentWeek: number;
  timeUnitsRemaining: number; // 600 units per week
  currentPlayerIndex: number;
  players: IPlayer[];
  map: IMap;
  economyModel: IEconomyModel;
  victoryConditions: IVictoryConditions;
  isGameOver: boolean;

  // Lifecycle
  initialize(config: IGameConfig): void;

  // Turn management
  processTurn(playerId: string, action: IAction): IActionResponse;
  advanceTime(units: number): void;
  nextPlayer(): void;
  getCurrentPlayer(): IPlayer;

  // Victory checking
  checkVictory(): IVictoryResult[];

  // Serialization
  serialize(): string;
  deserialize(data: string): void;

  // Helper methods
  getPlayerById(playerId: string): IPlayer | null;
  applyStateChanges(player: IPlayer, changes: IStateChange[]): void;
}

// ============================================
// EVENTS & GAME ANNOUNCEMENTS
// Owner: Worker 1 (Track A)
// ============================================

export type GameEvent =
  | { type: 'GAME_STARTED'; gameId: string; players: string[] }
  | { type: 'WEEK_STARTED'; week: number }
  | { type: 'WEEK_ENDED'; week: number }
  | { type: 'TURN_STARTED'; playerId: string; playerName: string }
  | { type: 'ACTION_EXECUTED'; playerId: string; action: string; success: boolean }
  | { type: 'MEASURE_CHANGED'; playerId: string; measure: MeasureType; oldValue: number; newValue: number }
  | { type: 'JOB_CHANGED'; playerId: string; oldJob: string | null; newJob: string }
  | { type: 'RENT_DUE'; playerId: string; amount: number; paid: boolean }
  | { type: 'VICTORY_ACHIEVED'; playerId: string; playerName: string; week: number }
  | { type: 'GAME_OVER'; winners: string[] };

export interface IGameAnnouncement {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  playerId?: string;
}

// ============================================
// AI AGENT SYSTEM
// Owner: Worker 5 (Track E)
// ============================================

export interface IAgent {
  id: string;
  name: string;
  playerId: string;

  selectAction(player: IPlayerState, game: IGame): IAction | null;
  reset(): void;
}

export interface IPlan {
  id: string;
  name: string;
  description: string;

  isComplete(player: IPlayerState, game: IGame): boolean;
  getNextAction(player: IPlayerState, game: IGame): IAction | null;
  reset(): void;
}

export interface IPlanScore {
  plan: IPlan;
  score: number;
  projectedState: IPlayerState;
}

// ============================================
// RENDERING (UI/GRAPHICS)
// Owner: Worker 4 (Track D)
// ============================================

export interface ISpriteData {
  id: string;
  path: string;
  width: number;
  height: number;
}

export interface IAnimationFrame {
  spriteId: string;
  duration: number; // milliseconds
}

export interface IAnimation {
  id: string;
  frames: IAnimationFrame[];
  loop: boolean;
}

// ============================================
// UTILITY TYPES
// ============================================

export type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

export type Copyable<T> = {
  clone(): T;
};

// ============================================
// TYPE GUARDS
// ============================================

export function isPosition(obj: unknown): obj is IPosition {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'x' in obj &&
    'y' in obj &&
    typeof (obj as IPosition).x === 'number' &&
    typeof (obj as IPosition).y === 'number'
  );
}

export function isAction(obj: unknown): obj is IAction {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'type' in obj &&
    'execute' in obj
  );
}
