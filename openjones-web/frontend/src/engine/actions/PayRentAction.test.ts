import { PayRentAction } from './PayRentAction';
import { IPlayerState, IGame } from '@shared/types/contracts';
import { createMockPlayer, createMockGame } from '@shared/mocks/actionMocks';

describe('PayRentAction', () => {
  let mockPlayer: IPlayerState;
  let mockGame: IGame;
  let action: PayRentAction;

  beforeEach(() => {
    mockPlayer = createMockPlayer({ rentDue: 100 });
    mockGame = createMockGame();
    action = new PayRentAction();
  });

  describe('canExecute', () => {
    it('should return true when player has rent due and enough cash', () => {
      expect(action.canExecute(mockPlayer, mockGame)).toBe(true);
    });

    it('should return true when player has exactly enough cash', () => {
      mockPlayer.cash = 100;
      mockPlayer.rentDue = 100;
      expect(action.canExecute(mockPlayer, mockGame)).toBe(true);
    });

    it('should return false when player has no rent due', () => {
      mockPlayer.rentDue = 0;
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player has negative rent due', () => {
      mockPlayer.rentDue = -10;
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player does not have enough cash', () => {
      mockPlayer.cash = 50;
      mockPlayer.rentDue = 100;
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player has 0 cash but rent is due', () => {
      mockPlayer.cash = 0;
      mockPlayer.rentDue = 100;
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player does not have enough time', () => {
      mockPlayer.time = 3;
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player has 0 time', () => {
      mockPlayer.time = 0;
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return true with high rent amount', () => {
      mockPlayer.rentDue = 500;
      mockPlayer.cash = 1000;
      expect(action.canExecute(mockPlayer, mockGame)).toBe(true);
    });

    it('should return true with low rent amount', () => {
      mockPlayer.rentDue = 1;
      mockPlayer.cash = 1000;
      expect(action.canExecute(mockPlayer, mockGame)).toBe(true);
    });
  });

  describe('execute', () => {
    it('should successfully pay rent', () => {
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Paid rent of $100');
      expect(result.message).toContain('now paid for the week');
      expect(result.timeCost).toBe(5);
    });

    it('should deduct rent amount from cash', () => {
      const result = action.execute(mockPlayer, mockGame);

      const cashChange = result.changes.find(c => c.field === 'cash');
      expect(cashChange).toBeDefined();
      expect(cashChange?.oldValue).toBe(1000);
      expect(cashChange?.newValue).toBe(900);
      expect(cashChange?.description).toContain('$100');
    });

    it('should reset rent due to 0', () => {
      const result = action.execute(mockPlayer, mockGame);

      const rentChange = result.changes.find(c => c.field === 'rentDue');
      expect(rentChange).toBeDefined();
      expect(rentChange?.oldValue).toBe(100);
      expect(rentChange?.newValue).toBe(0);
    });

    it('should have 2 state changes (cash, rentDue)', () => {
      const result = action.execute(mockPlayer, mockGame);

      expect(result.changes).toHaveLength(2);
    });

    it('should handle high rent amount', () => {
      mockPlayer.rentDue = 500;
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(true);
      const cashChange = result.changes.find(c => c.field === 'cash');
      expect(cashChange?.newValue).toBe(500);
    });

    it('should handle low rent amount', () => {
      mockPlayer.rentDue = 1;
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(true);
      const cashChange = result.changes.find(c => c.field === 'cash');
      expect(cashChange?.newValue).toBe(999);
    });

    it('should handle exact cash amount', () => {
      mockPlayer.cash = 100;
      mockPlayer.rentDue = 100;
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(true);
      const cashChange = result.changes.find(c => c.field === 'cash');
      expect(cashChange?.newValue).toBe(0);
    });

    it('should fail when player has no rent due', () => {
      mockPlayer.rentDue = 0;
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(false);
      expect(result.message).toContain('No rent is due');
      expect(result.changes).toHaveLength(0);
    });

    it('should fail when player does not have enough cash', () => {
      mockPlayer.cash = 50;
      mockPlayer.rentDue = 100;
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not enough cash');
      expect(result.message).toContain('$100');
      expect(result.message).toContain('$50');
      expect(result.changes).toHaveLength(0);
    });

    it('should fail when player does not have enough time', () => {
      mockPlayer.time = 3;
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not enough time');
      expect(result.changes).toHaveLength(0);
    });

    it('should include rent amount in success message', () => {
      mockPlayer.rentDue = 250;
      const result = action.execute(mockPlayer, mockGame);

      expect(result.message).toContain('$250');
    });
  });

  describe('getRequirements', () => {
    it('should include cash requirement', () => {
      const requirements = action.getRequirements();

      const cashReq = requirements.find(r => r.type === 'cash');
      expect(cashReq).toBeDefined();
      expect(cashReq?.description).toContain('rent due');
    });

    it('should include time requirement', () => {
      const requirements = action.getRequirements();

      const timeReq = requirements.find(r => r.type === 'time');
      expect(timeReq).toBeDefined();
      expect(timeReq?.value).toBe(5);
    });

    it('should have 2 requirements', () => {
      const requirements = action.getRequirements();

      expect(requirements).toHaveLength(2);
    });
  });

  describe('action properties', () => {
    it('should have correct id', () => {
      expect(action.id).toBe('pay-rent');
    });

    it('should have correct name', () => {
      expect(action.name).toBe('Pay Rent');
    });

    it('should have correct description', () => {
      expect(action.description).toBe('Pay your weekly rent');
    });

    it('should have time cost of 5', () => {
      expect(action.timeCost).toBe(5);
    });
  });
});
