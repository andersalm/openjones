import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SecurityApartment } from './SecurityApartment';
import { BuildingType } from '../../../../shared/types/contracts';
import { createMockPlayer, createMockGame } from '../../../../shared/mocks/actionMocks';

describe('SecurityApartment', () => {
  const mockPosition = {
    x: 3,
    y: 3,
    equals: vi.fn(),
    toString: () => '(3,3)',
  };

  let apartment: SecurityApartment;

  beforeEach(() => {
    apartment = new SecurityApartment('security-apt-1', 'Premium Heights', mockPosition);
  });

  it('should create with correct properties', () => {
    expect(apartment.id).toBe('security-apt-1');
    expect(apartment.type).toBe(BuildingType.SECURITY_APARTMENT);
    expect(apartment.name).toBe('Premium Heights');
    expect(apartment.isHome()).toBe(true);
  });

  it('should have correct weekly rent', () => {
    expect(SecurityApartment.WEEKLY_RENT).toBe(445);
  });

  it('should have higher rent than low cost apartment', () => {
    const LowCostApartment = require('./LowCostApartment').LowCostApartment;
    expect(SecurityApartment.WEEKLY_RENT).toBeGreaterThan(LowCostApartment.WEEKLY_RENT);
  });

  it('should include rent amount in description', () => {
    expect(apartment.description).toContain('445');
    expect(apartment.description).toContain('Secure');
  });

  it('should offer no job offerings', () => {
    expect(apartment.getJobOfferings()).toEqual([]);
  });

  it('should allow entry only for current renter', () => {
    const renter = createMockPlayer({ currentHome: 'security-apt-1' });
    const nonRenter = createMockPlayer({ currentHome: null });

    expect(apartment.canEnter(renter)).toBe(true);
    expect(apartment.canEnter(nonRenter)).toBe(false);
  });

  it('should not allow entry to other apartment renters', () => {
    const otherRenter = createMockPlayer({ currentHome: 'low-cost-apt-1' });

    expect(apartment.canEnter(otherRenter)).toBe(false);
  });

  it('should offer relax action for renter', () => {
    const mockPlayer = createMockPlayer({ currentHome: 'security-apt-1' });
    const mockGame = createMockGame();

    const actions = apartment.getAvailableActions(mockPlayer, mockGame);

    expect(actions.length).toBeGreaterThan(0);
    expect(actions.some(a => a.displayName.includes('Relax'))).toBe(true);
  });

  it('should offer pay rent action when rent is due', () => {
    const mockPlayer = createMockPlayer({
      currentHome: 'security-apt-1',
      rentDue: 445,
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
    const mockPlayer = createMockPlayer({ currentHome: 'security-apt-1' });
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
