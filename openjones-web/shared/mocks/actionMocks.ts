import { IPlayerState, IGame, IJob } from '@shared/types/contracts';

export const createMockPlayer = (overrides?: Partial<any>): IPlayerState => {
  // Handle legacy field names from worker's test code
  const currentBuilding = overrides?.currentBuilding ?? overrides?.location ?? null;
  const timeRemaining = overrides?.timeRemaining ?? overrides?.time ?? 480;

  return {
    cash: overrides?.cash ?? 100,
    health: overrides?.health ?? 100,
    happiness: overrides?.happiness ?? 50,
    education: overrides?.education ?? 0,
    career: overrides?.career ?? 0,
    timeRemaining,
    currentBuilding,
    position: overrides?.position ?? { x: 0, y: 0 },
    job: overrides?.job ?? null,
    possessions: overrides?.possessions ?? [],
    canAfford: (amount: number) => (overrides?.cash ?? 100) >= amount,
  } as IPlayerState;
};

export const createMockJob = (overrides?: Partial<IJob>): IJob => {
  return {
    id: 'job-1',
    title: 'Burger Flipper',
    wage: 10,
    buildingId: 'burger-joint',
    buildingName: 'Burger Joint',
    requiredEducation: 0,
    requiredCareer: 0,
    rank: 1,
    ...overrides,
  } as IJob;
};

export const createMockGame = (overrides?: Partial<IGame>): IGame => {
  return {
    isValidPosition: () => true,
    getBuilding: () => null,
    ...overrides,
  } as IGame;
};
