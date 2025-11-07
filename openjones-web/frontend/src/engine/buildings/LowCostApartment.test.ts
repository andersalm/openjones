import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LowCostApartment } from './LowCostApartment';
import { BuildingType } from '../../../../shared/types/contracts';
import { createMockPlayer, createMockGame } from '../../../../shared/mocks/actionMocks';

describe('LowCostApartment', () => {
  const mockPosition = {
    x: 1,
    y: 1,
    equals: vi.fn(),
    toString: () => '(1,1)',
  };

  let apartment: LowCostApartment;

  beforeEach(() => {
    apartment = new LowCostApartment('low-cost-apt-1', 'Sunset Apartments', mockPosition);
  });

  it('should create with correct properties', () => {
    expect(apartment.id).toBe('low-cost-apt-1');
    expect(apartment.type).toBe(BuildingType.LOW_COST_APARTMENT);
    expect(apartment.name).toBe('Sunset Apartments');
    expect(apartment.isHome()).toBe(true);
  });

  it('should have correct weekly rent', () => {
    expect(LowCostApartment.WEEKLY_RENT).toBe(305);
  });

  it('should include rent amount in description', () => {
    expect(apartment.description).toContain('305');
    expect(apartment.description).toContain('Affordable');
  });

  it('should offer no job offerings', () => {
    expect(apartment.getJobOfferings()).toEqual([]);
  });

  it('should allow entry only for current renter', () => {
    const renter = createMockPlayer({ currentHome: 'low-cost-apt-1' });
    const nonRenter = createMockPlayer({ currentHome: null });

    expect(apartment.canEnter(renter)).toBe(true);
    expect(apartment.canEnter(nonRenter)).toBe(false);
  });

  it('should offer relax action for renter', () => {
    const mockPlayer = createMockPlayer({ currentHome: 'low-cost-apt-1' });
    const mockGame = createMockGame();

    const actions = apartment.getAvailableActions(mockPlayer, mockGame);

    expect(actions.length).toBeGreaterThan(0);
    expect(actions.some(a => a.displayName.includes('Relax'))).toBe(true);
  });

  it('should offer pay rent action when rent is due', () => {
    const mockPlayer = createMockPlayer({
      currentHome: 'low-cost-apt-1',
      rentDue: 305,
    });
    const mockGame = createMockGame();

    const actions = apartment.getAvailableActions(mockPlayer, mockGame);

    expect(actions.some(a => a.displayName.includes('Pay Rent'))).toBe(true);
  });

  it('should not offer actions for non-renters', () => {
    const mockPlayer = createMockPlayer({ currentHome: null });
    const mockGame = createMockGame();

    const actions = apartment.getAvailableActions(mockPlayer, mockGame);

    expect(actions).toHaveLength(0);
  });

  it('should provide action tree for renter', () => {
    const mockPlayer = createMockPlayer({ currentHome: 'low-cost-apt-1' });
    const mockGame = createMockGame();

    const actionTree = apartment.getActionTree(mockPlayer, mockGame);

    expect(actionTree).toBeDefined();
    expect(actionTree.action).toBeDefined();
  });

  it('should handle non-renter action tree', () => {
    const mockPlayer = createMockPlayer({ currentHome: null });
    const mockGame = createMockGame();

    const actionTree = apartment.getActionTree(mockPlayer, mockGame);

    expect(actionTree).toBeDefined();
    expect(actionTree.action.displayName).toContain('Not Your Home');
  });
});
