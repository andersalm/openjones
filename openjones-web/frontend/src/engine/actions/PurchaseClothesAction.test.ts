import { PurchaseClothesAction } from './PurchaseClothesAction';
import { IPlayerState, IGame, IClothing } from '@shared/types/contracts';
import {
  createMockPlayer,
  createMockGame,
  mockClothingCasual,
  mockClothingBusiness,
  mockClothingFormal,
} from '@shared/mocks/actionMocks';

describe('PurchaseClothesAction', () => {
  let mockPlayer: IPlayerState;
  let mockGame: IGame;

  beforeEach(() => {
    mockPlayer = createMockPlayer({ currentLocation: 'store' });
    mockGame = createMockGame();
  });

  describe('canExecute', () => {
    it('should return true when player can purchase casual clothes', () => {
      const action = new PurchaseClothesAction(mockClothingCasual);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(true);
    });

    it('should return true when player can purchase business clothes', () => {
      const action = new PurchaseClothesAction(mockClothingBusiness);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(true);
    });

    it('should return true when player can purchase formal clothes', () => {
      const action = new PurchaseClothesAction(mockClothingFormal);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(true);
    });

    it('should return false when player does not have enough cash for casual clothes', () => {
      mockPlayer.cash = 40;
      const action = new PurchaseClothesAction(mockClothingCasual);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player does not have enough cash for business clothes', () => {
      mockPlayer.cash = 100;
      const action = new PurchaseClothesAction(mockClothingBusiness);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player does not have enough cash for formal clothes', () => {
      mockPlayer.cash = 250;
      const action = new PurchaseClothesAction(mockClothingFormal);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player is not at store', () => {
      mockPlayer.currentLocation = 'home';
      const action = new PurchaseClothesAction(mockClothingCasual);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player is at employment agency', () => {
      mockPlayer.currentLocation = 'employment-agency';
      const action = new PurchaseClothesAction(mockClothingCasual);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player does not have enough time', () => {
      mockPlayer.time = 3;
      const action = new PurchaseClothesAction(mockClothingCasual);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should handle edge case when player has exactly enough cash', () => {
      mockPlayer.cash = 50;
      const action = new PurchaseClothesAction(mockClothingCasual);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(true);
    });
  });

  describe('execute', () => {
    it('should successfully purchase casual clothes', () => {
      const action = new PurchaseClothesAction(mockClothingCasual);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Casual Clothes');
      expect(result.message).toContain('$50');
      expect(result.timeCost).toBe(5);
    });

    it('should deduct correct amount for casual clothes', () => {
      const action = new PurchaseClothesAction(mockClothingCasual);
      const result = action.execute(mockPlayer, mockGame);

      const cashChange = result.changes.find(c => c.field === 'cash');
      expect(cashChange?.oldValue).toBe(1000);
      expect(cashChange?.newValue).toBe(950);
    });

    it('should deduct correct amount for business clothes', () => {
      const action = new PurchaseClothesAction(mockClothingBusiness);
      const result = action.execute(mockPlayer, mockGame);

      const cashChange = result.changes.find(c => c.field === 'cash');
      expect(cashChange?.oldValue).toBe(1000);
      expect(cashChange?.newValue).toBe(850);
    });

    it('should deduct correct amount for formal clothes', () => {
      const action = new PurchaseClothesAction(mockClothingFormal);
      const result = action.execute(mockPlayer, mockGame);

      const cashChange = result.changes.find(c => c.field === 'cash');
      expect(cashChange?.oldValue).toBe(1000);
      expect(cashChange?.newValue).toBe(700);
    });

    it('should add casual clothes to possessions', () => {
      const action = new PurchaseClothesAction(mockClothingCasual);
      const result = action.execute(mockPlayer, mockGame);

      const possessionChange = result.changes.find(c => c.field === 'possessions');
      expect(possessionChange).toBeDefined();
      expect(possessionChange?.newValue).toBe('clothes-casual');
    });

    it('should add business clothes to possessions', () => {
      const action = new PurchaseClothesAction(mockClothingBusiness);
      const result = action.execute(mockPlayer, mockGame);

      const possessionChange = result.changes.find(c => c.field === 'possessions');
      expect(possessionChange?.newValue).toBe('clothes-business');
    });

    it('should add formal clothes to possessions', () => {
      const action = new PurchaseClothesAction(mockClothingFormal);
      const result = action.execute(mockPlayer, mockGame);

      const possessionChange = result.changes.find(c => c.field === 'possessions');
      expect(possessionChange?.newValue).toBe('clothes-formal');
    });

    it('should increase happiness by 1 for casual clothes', () => {
      const action = new PurchaseClothesAction(mockClothingCasual);
      const result = action.execute(mockPlayer, mockGame);

      const happinessChange = result.changes.find(c => c.field === 'happiness');
      expect(happinessChange).toBeDefined();
      expect(happinessChange?.oldValue).toBe(50);
      expect(happinessChange?.newValue).toBe(51);
    });

    it('should increase happiness by 2 for business clothes', () => {
      const action = new PurchaseClothesAction(mockClothingBusiness);
      const result = action.execute(mockPlayer, mockGame);

      const happinessChange = result.changes.find(c => c.field === 'happiness');
      expect(happinessChange).toBeDefined();
      expect(happinessChange?.oldValue).toBe(50);
      expect(happinessChange?.newValue).toBe(52);
    });

    it('should increase happiness by 3 for formal clothes', () => {
      const action = new PurchaseClothesAction(mockClothingFormal);
      const result = action.execute(mockPlayer, mockGame);

      const happinessChange = result.changes.find(c => c.field === 'happiness');
      expect(happinessChange).toBeDefined();
      expect(happinessChange?.oldValue).toBe(50);
      expect(happinessChange?.newValue).toBe(53);
    });

    it('should have 3 changes (cash, possession, happiness)', () => {
      const action = new PurchaseClothesAction(mockClothingCasual);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.changes).toHaveLength(3);
    });

    it('should fail when player does not have enough cash', () => {
      mockPlayer.cash = 40;
      const action = new PurchaseClothesAction(mockClothingCasual);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not enough cash');
      expect(result.changes).toHaveLength(0);
    });

    it('should fail when player is not at store', () => {
      mockPlayer.currentLocation = 'home';
      const action = new PurchaseClothesAction(mockClothingCasual);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Must be at the Store');
    });

    it('should fail when player does not have enough time', () => {
      mockPlayer.time = 3;
      const action = new PurchaseClothesAction(mockClothingCasual);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not enough time');
    });
  });

  describe('getRequirements', () => {
    it('should include cash requirement for casual clothes', () => {
      const action = new PurchaseClothesAction(mockClothingCasual);
      const requirements = action.getRequirements();

      const cashReq = requirements.find(r => r.type === 'cash');
      expect(cashReq).toBeDefined();
      expect(cashReq?.value).toBe(50);
    });

    it('should include cash requirement for business clothes', () => {
      const action = new PurchaseClothesAction(mockClothingBusiness);
      const requirements = action.getRequirements();

      const cashReq = requirements.find(r => r.type === 'cash');
      expect(cashReq?.value).toBe(150);
    });

    it('should include cash requirement for formal clothes', () => {
      const action = new PurchaseClothesAction(mockClothingFormal);
      const requirements = action.getRequirements();

      const cashReq = requirements.find(r => r.type === 'cash');
      expect(cashReq?.value).toBe(300);
    });

    it('should include time requirement', () => {
      const action = new PurchaseClothesAction(mockClothingCasual);
      const requirements = action.getRequirements();

      const timeReq = requirements.find(r => r.type === 'time');
      expect(timeReq).toBeDefined();
      expect(timeReq?.value).toBe(5);
    });

    it('should include location requirement', () => {
      const action = new PurchaseClothesAction(mockClothingCasual);
      const requirements = action.getRequirements();

      const locationReq = requirements.find(r => r.type === 'location');
      expect(locationReq).toBeDefined();
      expect(locationReq?.value).toBe('store');
      expect(locationReq?.description).toContain('Store');
    });

    it('should have 3 requirements', () => {
      const action = new PurchaseClothesAction(mockClothingCasual);
      const requirements = action.getRequirements();

      expect(requirements).toHaveLength(3);
    });
  });
});
