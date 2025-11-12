/**
 * MOCK IMPLEMENTATIONS
 *
 * These mocks allow workers to develop independently without waiting for
 * other tracks to complete their implementations.
 *
 * Workers can import these mocks and use them until real implementations
 * are ready, then swap them out (same interface).
 *
 * Example:
 * ```
 * // Week 2: Use mock
 * import { MockGame } from '@shared/mocks';
 * const game = new MockGame();
 *
 * // Week 5: Swap to real implementation
 * import { Game } from '@engine/game/Game';
 * const game = new Game();
 * ```
 */

import {
  IGame,
  IPlayer,
  IPlayerState,
  IMap,
  IBuilding,
  IAction,
  IActionResponse,
  IPosition,
  IRoute,
  IJob,
  IPossession,
  IEconomyModel,
  IVictoryConditions,
  IVictoryResult,
  IGameConfig,
  IStateChange,
  IActionTreeNode,
  BuildingType,
  MeasureType,
  ActionType,
  PossessionType,
  GAME_CONSTANTS,
} from '../types/contracts';

// ============================================
// MOCK POSITION
// ============================================

export class MockPosition implements IPosition {
  constructor(
    public x: number = 0,
    public y: number = 0
  ) {}

  equals(other: IPosition): boolean {
    return this.x === other.x && this.y === other.y;
  }

  toString(): string {
    return `(${this.x}, ${this.y})`;
  }

  static create(x: number = 0, y: number = 0): MockPosition {
    return new MockPosition(x, y);
  }
}

// ============================================
// MOCK ECONOMY MODEL
// ============================================

export class MockEconomyModel implements IEconomyModel {
  getPrice(_itemId: string, _buildingType: BuildingType): number {
    return 100;
  }

  getWage(job: IJob, hoursWorked: number): number {
    return job.wagePerHour * hoursWorked;
  }

  getRent(homeType: BuildingType): number {
    return homeType === BuildingType.LOW_COST_APARTMENT ? 305 : 445;
  }

  getStockPrice(_week: number): number {
    return 50;
  }

  calculateSellPrice(possession: IPossession): number {
    return Math.floor(possession.value * 0.5);
  }
}

// ============================================
// MOCK JOB
// ============================================

export class MockJob implements IJob {
  id = 'job-factory-1';
  title = 'Factory Worker';
  rank = 1;
  requiredEducation = 0;
  requiredExperience = 0;
  requiredClothesLevel = 1;
  wagePerHour = 15;
  experienceGainPerHour = 5;
  buildingType = BuildingType.FACTORY;

  static create(overrides?: Partial<IJob>): MockJob {
    const job = new MockJob();
    return Object.assign(job, overrides);
  }
}

// ============================================
// MOCK POSSESSION
// ============================================

export class MockPossession implements IPossession {
  id = 'possession-food-1';
  type = PossessionType.FOOD;
  name = 'Burger';
  value = 10;
  purchasePrice = 15;
  effects = [{ measure: MeasureType.HEALTH, delta: 5 }];

  static create(overrides?: Partial<IPossession>): MockPossession {
    const possession = new MockPossession();
    return Object.assign(possession, overrides);
  }
}

// ============================================
// MOCK PLAYER STATE
// ============================================

export class MockPlayerState implements IPlayerState {
  playerId = 'player-1';
  cash = 1000;
  health = 80;
  happiness = 70;
  education = 50;
  career = 100;
  position = new MockPosition(0, 0);
  currentBuilding = null;
  job = null;
  experience = [
    { rank: 1, points: 50 },
    { rank: 2, points: 30 },
  ];
  possessions: IPossession[] = [];
  rentedHome = null;
  rentDebt = 0;

  clone(): IPlayerState {
    const cloned = new MockPlayerState();
    Object.assign(cloned, this);
    cloned.position = new MockPosition(this.position.x, this.position.y);
    cloned.possessions = [...this.possessions];
    cloned.experience = [...this.experience];
    return cloned;
  }

  updateMeasure(measure: MeasureType, delta: number): void {
    switch (measure) {
      case MeasureType.HEALTH:
        this.health = Math.max(0, Math.min(100, this.health + delta));
        break;
      case MeasureType.HAPPINESS:
        this.happiness = Math.max(0, Math.min(100, this.happiness + delta));
        break;
      case MeasureType.EDUCATION:
        this.education = Math.max(0, Math.min(100, this.education + delta));
        break;
      case MeasureType.CAREER:
        this.career += delta;
        break;
    }
  }

  canAfford(cost: number): boolean {
    return this.cash >= cost;
  }

  meetsJobRequirements(job: IJob): boolean {
    const hasEducation = this.education >= job.requiredEducation;
    const hasExperience = this.getExperienceAtRank(job.rank) >= job.requiredExperience;
    const hasClothes = this.getClothesLevel() >= job.requiredClothesLevel;
    return hasEducation && hasExperience && hasClothes;
  }

  getClothesLevel(): number {
    // Find best clothes possession
    const clothes = this.possessions
      .filter((p) => p.type === PossessionType.CLOTHES)
      .sort((a, b) => (b.clothesLevel || 0) - (a.clothesLevel || 0));
    return clothes.length > 0 ? clothes[0].clothesLevel || 0 : 0;
  }

  getTotalExperience(): number {
    return this.experience.reduce((sum, exp) => sum + exp.points, 0);
  }

  getExperienceAtRank(rank: number): number {
    const exp = this.experience.find((e) => e.rank === rank);
    return exp ? exp.points : 0;
  }

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

  static create(overrides?: Partial<IPlayerState>): MockPlayerState {
    const state = new MockPlayerState();
    return Object.assign(state, overrides);
  }
}

// ============================================
// MOCK PLAYER
// ============================================

export class MockPlayer implements IPlayer {
  id = 'player-1';
  name = 'Player 1';
  color = '#FF0000';
  state = new MockPlayerState();
  isAI = false;

  static create(overrides?: Partial<IPlayer>): MockPlayer {
    const player = new MockPlayer();
    return Object.assign(player, overrides);
  }
}

// ============================================
// MOCK ACTION
// ============================================

export class MockAction implements IAction {
  id = 'action-work';
  type = ActionType.WORK;
  displayName = 'Work 8 hours';
  description = 'Work at your current job for 8 hours';
  timeCost = 40; // 8 hours * 5 units

  canExecute(player: IPlayerState, _game: IGame): boolean {
    return player.job !== null;
  }

  execute(player: IPlayerState, _game: IGame): IActionResponse {
    if (!player.job) {
      return {
        success: false,
        message: 'You need a job to work',
        timeSpent: 0,
        stateChanges: [],
      };
    }

    const earnings = player.job.wagePerHour * 8;
    return {
      success: true,
      message: `You worked 8 hours and earned $${earnings}`,
      timeSpent: this.timeCost,
      stateChanges: [
        {
          type: 'cash',
          value: player.cash + earnings,
          description: `Earned $${earnings}`,
        },
        {
          type: 'measure',
          measure: MeasureType.HEALTH,
          value: player.health - 5,
          description: 'Lost 5 health from work',
        },
      ],
    };
  }

  getRequirements() {
    return [
      {
        type: 'job' as const,
        value: 'any',
        description: 'Must have a job',
      },
    ];
  }

  static create(overrides?: Partial<IAction>): MockAction {
    const action = new MockAction();
    return Object.assign(action, overrides);
  }
}

// ============================================
// MOCK BUILDING
// ============================================

export class MockBuilding implements IBuilding {
  id = 'building-factory';
  type = BuildingType.FACTORY;
  name = 'Factory';
  description = 'A place to work and earn money';
  position = new MockPosition(1, 1);

  getAvailableActions(_player: IPlayerState, _game: IGame): IAction[] {
    return [
      MockAction.create({ id: 'exit', type: ActionType.EXIT_BUILDING, displayName: 'Exit' }),
      MockAction.create({ id: 'work', type: ActionType.WORK, displayName: 'Work 8 hours' }),
      MockAction.create({ id: 'relax', type: ActionType.RELAX, displayName: 'Relax' }),
    ];
  }

  getJobOfferings(): IJob[] {
    return [
      MockJob.create({ id: 'factory-1', title: 'Worker', rank: 1 }),
      MockJob.create({ id: 'factory-3', title: 'Supervisor', rank: 3 }),
    ];
  }

  getActionTree(_player: IPlayerState, _game: IGame): IActionTreeNode {
    const actions = this.getAvailableActions(_player, _game);
    return {
      action: actions[0],
      index: 0,
      children: actions.slice(1).map((action, i) => ({
        action,
        index: i + 1,
        children: [],
      })),
    };
  }

  canEnter(_player: IPlayerState): boolean {
    return true;
  }

  isHome(): boolean {
    return (
      this.type === BuildingType.LOW_COST_APARTMENT ||
      this.type === BuildingType.SECURITY_APARTMENT
    );
  }

  static create(overrides?: Partial<IBuilding>): MockBuilding {
    const building = new MockBuilding();
    return Object.assign(building, overrides);
  }
}

// ============================================
// MOCK MAP
// ============================================

export class MockMap implements IMap {
  width = GAME_CONSTANTS.GRID_WIDTH;
  height = GAME_CONSTANTS.GRID_HEIGHT;
  private buildings: IBuilding[] = [
    MockBuilding.create({ id: 'factory', position: new MockPosition(1, 1) }),
    MockBuilding.create({
      id: 'bank',
      type: BuildingType.BANK,
      name: 'Bank',
      position: new MockPosition(2, 2),
    }),
    MockBuilding.create({
      id: 'college',
      type: BuildingType.COLLEGE,
      name: 'College',
      position: new MockPosition(3, 3),
    }),
  ];

  getBuilding(position: IPosition): IBuilding | null {
    return this.buildings.find((b) => b.position.equals(position)) || null;
  }

  getAllBuildings(): IBuilding[] {
    return this.buildings;
  }

  getBuildingById(id: string): IBuilding | null {
    return this.buildings.find((b) => b.id === id) || null;
  }

  isValidPosition(position: IPosition): boolean {
    return position.x >= 0 && position.x < this.width && position.y >= 0 && position.y < this.height;
  }

  getRoute(from: IPosition, to: IPosition): IRoute {
    // Simple Manhattan distance route
    const positions: IPosition[] = [from];
    let current = new MockPosition(from.x, from.y);

    while (!current.equals(to)) {
      if (current.x < to.x) {
        current = new MockPosition(current.x + 1, current.y);
      } else if (current.x > to.x) {
        current = new MockPosition(current.x - 1, current.y);
      } else if (current.y < to.y) {
        current = new MockPosition(current.x, current.y + 1);
      } else if (current.y > to.y) {
        current = new MockPosition(current.x, current.y - 1);
      }
      positions.push(new MockPosition(current.x, current.y));
    }

    return {
      start: from,
      end: to,
      positions,
      distance: Math.abs(to.x - from.x) + Math.abs(to.y - from.y),
    };
  }

  getAdjacentPositions(position: IPosition): IPosition[] {
    const adjacent: IPosition[] = [];
    const deltas = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    for (const [dx, dy] of deltas) {
      const newPos = new MockPosition(position.x + dx, position.y + dy);
      if (this.isValidPosition(newPos)) {
        adjacent.push(newPos);
      }
    }

    return adjacent;
  }

  static create(): MockMap {
    return new MockMap();
  }
}

// ============================================
// MOCK GAME
// ============================================

export class MockGame implements IGame {
  id = 'mock-game-1';
  currentWeek = 1;
  timeUnitsRemaining = GAME_CONSTANTS.TIME_UNITS_PER_WEEK;
  currentPlayerIndex = 0;
  players: IPlayer[] = [MockPlayer.create()];
  map = MockMap.create();
  economyModel = new MockEconomyModel();
  victoryConditions: IVictoryConditions = {
    targetWealth: 10000,
    targetHealth: 100,
    targetHappiness: 100,
    targetCareer: 850,
    targetEducation: 100,
  };
  isGameOver = false;

  initialize(config: IGameConfig): void {
    console.log('[MockGame] initialize', config);
    this.players = config.players.map((p) =>
      MockPlayer.create({
        id: p.id,
        name: p.name,
        color: p.color,
        isAI: p.isAI,
        state: MockPlayerState.create({
          playerId: p.id,
          cash: config.startingCash,
          health: config.startingStats.health,
          happiness: config.startingStats.happiness,
          education: config.startingStats.education,
        }),
      })
    );
    this.victoryConditions = config.victoryConditions;
  }

  processTurn(playerId: string, action: IAction): IActionResponse {
    const player = this.getPlayerById(playerId);
    if (!player) {
      return {
        success: false,
        message: 'Player not found',
        timeSpent: 0,
        stateChanges: [],
      };
    }

    const response = action.execute(player.state, this);
    if (response.success) {
      this.applyStateChanges(player, response.stateChanges);
      this.advanceTime(response.timeSpent);
    }

    return response;
  }

  advanceTime(units: number): void {
    this.timeUnitsRemaining -= units;
    if (this.timeUnitsRemaining <= 0) {
      this.currentWeek++;
      this.timeUnitsRemaining = GAME_CONSTANTS.TIME_UNITS_PER_WEEK;
      // Apply weekly events (rent, etc.)
    }
  }

  nextPlayer(): void {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  }

  getCurrentPlayer(): IPlayer {
    return this.players[this.currentPlayerIndex];
  }

  checkVictory(): IVictoryResult[] {
    return this.players.map((player) => {
      const state = player.state;
      const conditionsMet = {
        wealth: state.cash >= this.victoryConditions.targetWealth,
        health: state.health >= this.victoryConditions.targetHealth,
        happiness: state.happiness >= this.victoryConditions.targetHappiness,
        career: state.career >= this.victoryConditions.targetCareer,
        education: state.education >= this.victoryConditions.targetEducation,
      };

      const isVictory = Object.values(conditionsMet).every((v) => v);

      return {
        playerId: player.id,
        playerName: player.name,
        week: this.currentWeek,
        conditionsMet,
        isVictory,
      };
    });
  }

  serialize(): string {
    return JSON.stringify(this);
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    Object.assign(this, parsed);
  }

  getPlayerById(playerId: string): IPlayer | null {
    return this.players.find((p) => p.id === playerId) || null;
  }

  applyStateChanges(player: IPlayer, changes: IStateChange[]): void {
    for (const change of changes) {
      switch (change.type) {
        case 'cash':
          player.state.cash = change.value as number;
          break;
        case 'measure':
          if (change.measure) {
            player.state.updateMeasure(change.measure, change.value as number);
          }
          break;
        case 'possession_add':
          player.state.possessions.push(change.value as IPossession);
          break;
        case 'possession_remove':
          {
            const index = player.state.possessions.findIndex(
              (p) => p.id === (change.value as IPossession).id
            );
            if (index >= 0) {
              player.state.possessions.splice(index, 1);
            }
          }
          break;
        case 'job':
          player.state.job = (change.value as IJob) || null;
          break;
        case 'position':
          player.state.position = change.value as IPosition;
          break;
      }
    }
  }

  static create(): MockGame {
    return new MockGame();
  }
}

// ============================================
// EXPORTS
// ============================================

export const createMockGame = () => MockGame.create();
export const createMockPlayer = (overrides?: Partial<IPlayer>) => MockPlayer.create(overrides);
export const createMockPlayerState = (overrides?: Partial<IPlayerState>) =>
  MockPlayerState.create(overrides);
export const createMockBuilding = (overrides?: Partial<IBuilding>) =>
  MockBuilding.create(overrides);
export const createMockAction = (overrides?: Partial<IAction>) => MockAction.create(overrides);
