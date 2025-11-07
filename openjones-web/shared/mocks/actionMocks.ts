import { IPlayerState, IGame, IJob } from '@shared/types/contracts';

export const createMockPlayer = (overrides?: Partial<any>): IPlayerState => {
  // Handle legacy field names from worker's test code
  const currentBuilding = overrides?.currentBuilding ?? overrides?.location ?? null;
  const position = overrides?.position ?? { x: 0, y: 0, equals: () => false, toString: () => '0,0' };

  return {
    playerId: overrides?.playerId ?? 'player-1',
    cash: overrides?.cash ?? 100,
    health: overrides?.health ?? 100,
    happiness: overrides?.happiness ?? 50,
    education: overrides?.education ?? 0,
    career: overrides?.career ?? 0,
    currentBuilding,
    position,
    job: overrides?.job ?? null,
    experience: overrides?.experience ?? [],
    possessions: overrides?.possessions ?? [],
    rentedHome: overrides?.rentedHome ?? null,
    rentDebt: overrides?.rentDebt ?? 0,
  } as any;
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
