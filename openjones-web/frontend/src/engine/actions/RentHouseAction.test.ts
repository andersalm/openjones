import { RentHouseAction } from './RentHouseAction';
import { IPlayerState, IGame } from '@shared/types/contracts';
import {
  createMockPlayer,
  createMockGame,
  mockApartmentLowCost,
  mockApartmentSecurity,
} from '@shared/mocks/actionMocks';

describe('RentHouseAction', () => {
  let mockPlayer: IPlayerState;
  let mockGame: IGame;

  beforeEach(() => {
    mockPlayer = createMockPlayer({ currentHome: null });
    mockGame = createMockGame();
  });

  describe('canExecute', () => {
    it('should return true when player can rent low-cost apartment', () => {
      const action = new RentHouseAction(mockApartmentLowCost);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(true);
    });

    it('should return true when player can rent security apartment', () => {
      const action = new RentHouseAction(mockApartmentSecurity);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(true);
    });

    it('should return true when player has exactly enough cash', () => {
      mockPlayer.cash = 100;
      const action = new RentHouseAction(mockApartmentLowCost);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(true);
    });

    it('should return false when player does not have enough cash for low-cost', () => {
      mockPlayer.cash = 50;
      const action = new RentHouseAction(mockApartmentLowCost);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player does not have enough cash for security', () => {
      mockPlayer.cash = 150;
      const action = new RentHouseAction(mockApartmentSecurity);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player has 0 cash', () => {
      mockPlayer.cash = 0;
      const action = new RentHouseAction(mockApartmentLowCost);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player does not have enough time', () => {
      mockPlayer.time = 5;
      const action = new RentHouseAction(mockApartmentLowCost);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player has 0 time', () => {
      mockPlayer.time = 0;
      const action = new RentHouseAction(mockApartmentLowCost);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player already rents this apartment', () => {
      mockPlayer.currentHome = 'apt-low';
      const action = new RentHouseAction(mockApartmentLowCost);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return true when player rents different apartment', () => {
      mockPlayer.currentHome = 'apt-security';
      const action = new RentHouseAction(mockApartmentLowCost);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(true);
    });

    it('should return true when switching from low-cost to security', () => {
      mockPlayer.currentHome = 'apt-low';
      const action = new RentHouseAction(mockApartmentSecurity);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(true);
    });
  });

  describe('execute', () => {
    it('should successfully rent low-cost apartment', () => {
      const action = new RentHouseAction(mockApartmentLowCost);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully rented');
      expect(result.message).toContain('Low-cost Apartment');
      expect(result.message).toContain('$100');
      expect(result.timeCost).toBe(10);
    });

    it('should successfully rent security apartment', () => {
      const action = new RentHouseAction(mockApartmentSecurity);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Security Apartment');
      expect(result.message).toContain('$200');
    });

    it('should deduct first week rent for low-cost apartment', () => {
      const action = new RentHouseAction(mockApartmentLowCost);
      const result = action.execute(mockPlayer, mockGame);

      const cashChange = result.changes.find(c => c.field === 'cash');
      expect(cashChange).toBeDefined();
      expect(cashChange?.oldValue).toBe(1000);
      expect(cashChange?.newValue).toBe(900);
      expect(cashChange?.description).toContain('$100');
    });

    it('should deduct first week rent for security apartment', () => {
      const action = new RentHouseAction(mockApartmentSecurity);
      const result = action.execute(mockPlayer, mockGame);

      const cashChange = result.changes.find(c => c.field === 'cash');
      expect(cashChange?.newValue).toBe(800);
      expect(cashChange?.description).toContain('$200');
    });

    it('should set currentHome to apartment id', () => {
      const action = new RentHouseAction(mockApartmentLowCost);
      const result = action.execute(mockPlayer, mockGame);

      const homeChange = result.changes.find(c => c.field === 'currentHome');
      expect(homeChange).toBeDefined();
      expect(homeChange?.newValue).toBe('apt-low');
      expect(homeChange?.description).toContain('Low-cost Apartment');
    });

    it('should reset rent due to 0', () => {
      mockPlayer.rentDue = 50;
      const action = new RentHouseAction(mockApartmentLowCost);
      const result = action.execute(mockPlayer, mockGame);

      const rentChange = result.changes.find(c => c.field === 'rentDue');
      expect(rentChange).toBeDefined();
      expect(rentChange?.oldValue).toBe(50);
      expect(rentChange?.newValue).toBe(0);
    });

    it('should increase happiness by 1 for low-cost apartment', () => {
      const action = new RentHouseAction(mockApartmentLowCost);
      const result = action.execute(mockPlayer, mockGame);

      const happinessChange = result.changes.find(c => c.field === 'happiness');
      expect(happinessChange).toBeDefined();
      expect(happinessChange?.oldValue).toBe(50);
      expect(happinessChange?.newValue).toBe(51);
    });

    it('should increase happiness by 3 for security apartment', () => {
      const action = new RentHouseAction(mockApartmentSecurity);
      const result = action.execute(mockPlayer, mockGame);

      const happinessChange = result.changes.find(c => c.field === 'happiness');
      expect(happinessChange).toBeDefined();
      expect(happinessChange?.oldValue).toBe(50);
      expect(happinessChange?.newValue).toBe(53);
    });

    it('should have 4 changes for low-cost apartment (cash, home, rentDue, happiness)', () => {
      const action = new RentHouseAction(mockApartmentLowCost);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.changes).toHaveLength(4);
    });

    it('should have 4 changes for security apartment', () => {
      const action = new RentHouseAction(mockApartmentSecurity);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.changes).toHaveLength(4);
    });

    it('should fail when player already rents this apartment', () => {
      mockPlayer.currentHome = 'apt-low';
      const action = new RentHouseAction(mockApartmentLowCost);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(false);
      expect(result.message).toContain('already renting');
      expect(result.changes).toHaveLength(0);
    });

    it('should fail when player does not have enough cash', () => {
      mockPlayer.cash = 50;
      const action = new RentHouseAction(mockApartmentLowCost);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not enough cash');
      expect(result.message).toContain('$100');
      expect(result.message).toContain('$50');
      expect(result.changes).toHaveLength(0);
    });

    it('should fail when player does not have enough time', () => {
      mockPlayer.time = 5;
      const action = new RentHouseAction(mockApartmentLowCost);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not enough time');
      expect(result.changes).toHaveLength(0);
    });

    it('should handle switching apartments', () => {
      mockPlayer.currentHome = 'apt-low';
      const action = new RentHouseAction(mockApartmentSecurity);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(true);
      const homeChange = result.changes.find(c => c.field === 'currentHome');
      expect(homeChange?.newValue).toBe('apt-security');
    });

    it('should handle edge case with exact cash amount', () => {
      mockPlayer.cash = 100;
      const action = new RentHouseAction(mockApartmentLowCost);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(true);
      const cashChange = result.changes.find(c => c.field === 'cash');
      expect(cashChange?.newValue).toBe(0);
    });
  });

  describe('getRequirements', () => {
    it('should include cash requirement for low-cost apartment', () => {
      const action = new RentHouseAction(mockApartmentLowCost);
      const requirements = action.getRequirements();

      const cashReq = requirements.find(r => r.type === 'cash');
      expect(cashReq).toBeDefined();
      expect(cashReq?.value).toBe(100);
      expect(cashReq?.description).toContain('$100');
      expect(cashReq?.description).toContain('first week');
    });

    it('should include cash requirement for security apartment', () => {
      const action = new RentHouseAction(mockApartmentSecurity);
      const requirements = action.getRequirements();

      const cashReq = requirements.find(r => r.type === 'cash');
      expect(cashReq?.value).toBe(200);
      expect(cashReq?.description).toContain('$200');
    });

    it('should include time requirement', () => {
      const action = new RentHouseAction(mockApartmentLowCost);
      const requirements = action.getRequirements();

      const timeReq = requirements.find(r => r.type === 'time');
      expect(timeReq).toBeDefined();
      expect(timeReq?.value).toBe(10);
    });

    it('should have 2 requirements', () => {
      const action = new RentHouseAction(mockApartmentLowCost);
      const requirements = action.getRequirements();

      expect(requirements).toHaveLength(2);
    });
  });

  describe('action properties', () => {
    it('should have correct id for low-cost apartment', () => {
      const action = new RentHouseAction(mockApartmentLowCost);
      expect(action.id).toBe('rent-house-apt-low');
    });

    it('should have correct id for security apartment', () => {
      const action = new RentHouseAction(mockApartmentSecurity);
      expect(action.id).toBe('rent-house-apt-security');
    });

    it('should have correct name', () => {
      const action = new RentHouseAction(mockApartmentLowCost);
      expect(action.name).toBe('Rent Apartment');
    });

    it('should have correct description', () => {
      const action = new RentHouseAction(mockApartmentLowCost);
      expect(action.description).toContain('Rent');
      expect(action.description).toContain('Low-cost Apartment');
    });

    it('should have time cost of 10', () => {
      const action = new RentHouseAction(mockApartmentLowCost);
      expect(action.timeCost).toBe(10);
    });
  });
});
