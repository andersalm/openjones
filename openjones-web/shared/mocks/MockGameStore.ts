import { IPlayerState, IVictoryCondition } from '../types';

interface IGameState {
  playerState: IPlayerState;
  currentWeek: number;
  timeRemaining: number;
  victoryConditions: IVictoryCondition[];
  isGameWon: boolean;
}

/**
 * Mock player state for testing and development
 */
export const createMockPlayerState = (overrides?: Partial<IPlayerState>): IPlayerState => ({
  playerId: 'player-1',
  cash: 1000,
  health: 75,
  happiness: 60,
  education: 50,
  career: 40,
  position: { x: 0, y: 0, equals: () => false, toString: () => '0,0' },
  currentBuilding: null,
  job: null,
  experience: [],
  possessions: [],
  rentedHome: null,
  rentDebt: 0,
  ...overrides,
} as any);

/**
 * Mock victory conditions for testing and development
 */
export const createMockVictoryConditions = (): IVictoryCondition[] => [
  {
    id: 'cash-target',
    name: 'Wealth',
    description: 'Accumulate $10,000',
    targetValue: 10000,
    currentValue: 1000,
    isAchieved: false,
    type: 'cash',
  },
  {
    id: 'education-target',
    name: 'Education',
    description: 'Reach Education level 100',
    targetValue: 100,
    currentValue: 50,
    isAchieved: false,
    type: 'education',
  },
  {
    id: 'career-target',
    name: 'Career',
    description: 'Reach Career level 100',
    targetValue: 100,
    currentValue: 40,
    isAchieved: false,
    type: 'career',
  },
  {
    id: 'happiness-target',
    name: 'Happiness',
    description: 'Reach Happiness level 100',
    targetValue: 100,
    currentValue: 60,
    isAchieved: false,
    type: 'happiness',
  },
];

/**
 * Mock game state for testing and development
 */
export const createMockGameState = (overrides?: Partial<IGameState>): IGameState => ({
  playerState: createMockPlayerState(),
  currentWeek: 1,
  timeRemaining: 168, // 168 game units = 1 week
  victoryConditions: createMockVictoryConditions(),
  isGameWon: false,
  ...overrides,
});

/**
 * Create a mock player state with low stats (critical condition)
 */
export const createCriticalPlayerState = (): IPlayerState => ({
  playerId: 'player-1',
  cash: 50,
  health: 15,
  happiness: 20,
  education: 30,
  career: 10,
  position: { x: 0, y: 0, equals: () => false, toString: () => '0,0' },
  currentBuilding: null,
  job: null,
  experience: [],
  possessions: [],
  rentedHome: null,
  rentDebt: 0,
} as any);

/**
 * Create a mock player state with high stats (near victory)
 */
export const createWinningPlayerState = (): IPlayerState => ({
  playerId: 'player-1',
  cash: 9500,
  health: 95,
  happiness: 98,
  education: 95,
  career: 90,
  position: { x: 0, y: 0, equals: () => false, toString: () => '0,0' },
  currentBuilding: null,
  job: null,
  experience: [],
  possessions: [],
  rentedHome: null,
  rentDebt: 0,
} as any);

/**
 * Create mock victory conditions with some achieved
 */
export const createPartiallyAchievedVictoryConditions = (): IVictoryCondition[] => [
  {
    id: 'cash-target',
    name: 'Wealth',
    description: 'Accumulate $10,000',
    targetValue: 10000,
    currentValue: 10500,
    isAchieved: true,
    type: 'cash',
  },
  {
    id: 'education-target',
    name: 'Education',
    description: 'Reach Education level 100',
    targetValue: 100,
    currentValue: 100,
    isAchieved: true,
    type: 'education',
  },
  {
    id: 'career-target',
    name: 'Career',
    description: 'Reach Career level 100',
    targetValue: 100,
    currentValue: 75,
    isAchieved: false,
    type: 'career',
  },
  {
    id: 'happiness-target',
    name: 'Happiness',
    description: 'Reach Happiness level 100',
    targetValue: 100,
    currentValue: 85,
    isAchieved: false,
    type: 'happiness',
  },
];
