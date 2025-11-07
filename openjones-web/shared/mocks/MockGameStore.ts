import { IPlayerState, IGameState, IVictoryCondition } from '../types';

/**
 * Mock player state for testing and development
 */
export const createMockPlayerState = (overrides?: Partial<IPlayerState>): IPlayerState => ({
  cash: 1000,
  health: 75,
  happiness: 60,
  education: 50,
  career: 40,
  currentJob: 'Entry Level Developer',
  weeklyIncome: 500,
  ...overrides,
});

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
  cash: 50,
  health: 15,
  happiness: 20,
  education: 30,
  career: 10,
  currentJob: 'Unemployed',
  weeklyIncome: 0,
});

/**
 * Create a mock player state with high stats (near victory)
 */
export const createWinningPlayerState = (): IPlayerState => ({
  cash: 9500,
  health: 95,
  happiness: 98,
  education: 95,
  career: 90,
  currentJob: 'Senior Developer',
  weeklyIncome: 2000,
});

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
