import { describe, it, expect, vi } from 'vitest';
import { RentAgency } from './RentAgency';
import { BuildingType } from '../../../../shared/types/contracts';
import { createMockPlayer, createMockGame } from '../../../../shared/mocks/actionMocks';

describe('RentAgency', () => {
  const mockPosition = {
    x: 2,
    y: 2,
    equals: vi.fn(),
    toString: () => '(2,2)',
  };

  let rentAgency: RentAgency;

  beforeEach(() => {
    rentAgency = new RentAgency('rent-agency-1', 'City Rent Agency', mockPosition);
  });

  it('should create with correct properties', () => {
    expect(rentAgency.id).toBe('rent-agency-1');
    expect(rentAgency.type).toBe(BuildingType.RENT_AGENCY);
    expect(rentAgency.name).toBe('City Rent Agency');
    expect(rentAgency.isHome()).toBe(false);
  });

  it('should have descriptive description', () => {
    expect(rentAgency.description).toContain('apartment');
    expect(rentAgency.description).toContain('housing');
  });

  it('should offer no job offerings', () => {
    expect(rentAgency.getJobOfferings()).toEqual([]);
  });

  it('should allow anyone to enter', () => {
    const mockPlayer = createMockPlayer();
    expect(rentAgency.canEnter(mockPlayer)).toBe(true);
  });

  it('should offer pay rent action when player has rent debt', () => {
    const mockPlayer = createMockPlayer({ rentDebt: 305 });
    const mockGame = createMockGame();

    const actions = rentAgency.getAvailableActions(mockPlayer, mockGame);

    expect(actions.length).toBeGreaterThan(0);
    expect(actions.some(a => a.displayName.includes('Pay Rent'))).toBe(true);
  });

  it('should not offer pay rent action when no rent is due', () => {
    const mockPlayer = createMockPlayer({ rentDue: 0 });
    const mockGame = createMockGame();

    const actions = rentAgency.getAvailableActions(mockPlayer, mockGame);

    expect(actions.every(a => !a.displayName.includes('Pay Rent'))).toBe(true);
  });

  it('should provide action tree', () => {
    const mockPlayer = createMockPlayer({ rentDue: 305 });
    const mockGame = createMockGame();

    const actionTree = rentAgency.getActionTree(mockPlayer, mockGame);

    expect(actionTree).toBeDefined();
    expect(actionTree.action).toBeDefined();
  });

  it('should handle empty actions gracefully', () => {
    const mockPlayer = createMockPlayer({ rentDue: 0 });
    const mockGame = createMockGame();

    const actionTree = rentAgency.getActionTree(mockPlayer, mockGame);

    expect(actionTree).toBeDefined();
  });
});
