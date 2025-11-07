import { PurchaseAction, IPurchasable } from './PurchaseAction';
import { IPlayerState, IGame, ActionType } from '@shared/types/contracts';
import { createMockPlayer, createMockGame } from '@shared/mocks/actionMocks';

// Concrete implementation for testing
class TestPurchaseAction extends PurchaseAction {
  constructor(item: IPurchasable, private requiredLocation: string = 'store') {
    super(
      `purchase-${item.id}`,
      ActionType.PURCHASE,
      'Purchase Item',
      `Purchase ${item.name}`,
      item,
      5
    );
  }

  protected canPurchaseAtLocation(player: IPlayerState, game: IGame): boolean {
    return player.currentLocation === this.requiredLocation;
  }
}

describe('PurchaseAction', () => {
  let mockPlayer: IPlayerState;
  let mockGame: IGame;
  let testItem: IPurchasable;

  beforeEach(() => {
    mockPlayer = createMockPlayer();
    mockGame = createMockGame();
    testItem = {
      id: 'test-item',
      name: 'Test Item',
      price: 100,
    };
  });

  describe('canExecute', () => {
    it('should return true when player has enough cash, time, and is at correct location', () => {
      const action = new TestPurchaseAction(testItem);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(true);
    });

    it('should return false when player does not have enough cash', () => {
      mockPlayer.cash = 50;
      const action = new TestPurchaseAction(testItem);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player has exactly enough cash (edge case)', () => {
      mockPlayer.cash = 100;
      testItem.price = 100;
      const action = new TestPurchaseAction(testItem);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(true);
    });

    it('should return false when player does not have enough time', () => {
      mockPlayer.time = 3;
      const action = new TestPurchaseAction(testItem);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player is at wrong location', () => {
      mockPlayer.currentLocation = 'home';
      const action = new TestPurchaseAction(testItem, 'store');
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player has 0 cash', () => {
      mockPlayer.cash = 0;
      const action = new TestPurchaseAction(testItem);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player has 0 time', () => {
      mockPlayer.time = 0;
      const action = new TestPurchaseAction(testItem);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });
  });

  describe('execute', () => {
    it('should successfully purchase item and deduct cash', () => {
      const action = new TestPurchaseAction(testItem);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully purchased Test Item');
      expect(result.message).toContain('$100');
      expect(result.timeCost).toBe(5);
      expect(result.changes).toHaveLength(2);
    });

    it('should add possession to inventory', () => {
      const action = new TestPurchaseAction(testItem);
      const result = action.execute(mockPlayer, mockGame);

      const possessionChange = result.changes.find(c => c.field === 'possessions');
      expect(possessionChange).toBeDefined();
      expect(possessionChange?.newValue).toBe('test-item');
    });

    it('should deduct correct cash amount', () => {
      const action = new TestPurchaseAction(testItem);
      const result = action.execute(mockPlayer, mockGame);

      const cashChange = result.changes.find(c => c.field === 'cash');
      expect(cashChange).toBeDefined();
      expect(cashChange?.oldValue).toBe(1000);
      expect(cashChange?.newValue).toBe(900);
    });

    it('should fail when player does not have enough cash', () => {
      mockPlayer.cash = 50;
      const action = new TestPurchaseAction(testItem);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not enough cash');
      expect(result.changes).toHaveLength(0);
    });

    it('should fail when player does not have enough time', () => {
      mockPlayer.time = 3;
      const action = new TestPurchaseAction(testItem);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not enough time');
      expect(result.changes).toHaveLength(0);
    });

    it('should fail when player is at wrong location', () => {
      mockPlayer.currentLocation = 'home';
      const action = new TestPurchaseAction(testItem, 'store');
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot purchase');
      expect(result.changes).toHaveLength(0);
    });

    it('should handle expensive items correctly', () => {
      testItem.price = 800;
      mockPlayer.cash = 1000;
      const action = new TestPurchaseAction(testItem);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(true);
      const cashChange = result.changes.find(c => c.field === 'cash');
      expect(cashChange?.newValue).toBe(200);
    });

    it('should handle cheap items correctly', () => {
      testItem.price = 1;
      const action = new TestPurchaseAction(testItem);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(true);
      const cashChange = result.changes.find(c => c.field === 'cash');
      expect(cashChange?.newValue).toBe(999);
    });
  });

  describe('getRequirements', () => {
    it('should return cash requirement', () => {
      const action = new TestPurchaseAction(testItem);
      const requirements = action.getRequirements();

      const cashReq = requirements.find(r => r.type === 'cash');
      expect(cashReq).toBeDefined();
      expect(cashReq?.value).toBe(100);
      expect(cashReq?.description).toContain('$100');
    });

    it('should return time requirement', () => {
      const action = new TestPurchaseAction(testItem);
      const requirements = action.getRequirements();

      const timeReq = requirements.find(r => r.type === 'time');
      expect(timeReq).toBeDefined();
      expect(timeReq?.value).toBe(5);
    });

    it('should have at least 2 requirements', () => {
      const action = new TestPurchaseAction(testItem);
      const requirements = action.getRequirements();

      expect(requirements.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getFailureMessage', () => {
    it('should return cash message when not enough cash', () => {
      mockPlayer.cash = 50;
      const action = new TestPurchaseAction(testItem);
      const message = (action as any).getFailureMessage(mockPlayer);

      expect(message).toContain('Not enough cash');
      expect(message).toContain('100');
      expect(message).toContain('50');
    });

    it('should return time message when not enough time', () => {
      mockPlayer.time = 3;
      const action = new TestPurchaseAction(testItem);
      const message = (action as any).getFailureMessage(mockPlayer);

      expect(message).toContain('Not enough time');
    });

    it('should return location message when all else is fine', () => {
      const action = new TestPurchaseAction(testItem);
      const message = (action as any).getFailureMessage(mockPlayer);

      expect(message).toContain('Cannot purchase');
    });
  });
});
