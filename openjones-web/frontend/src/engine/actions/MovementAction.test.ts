import { MovementAction } from './MovementAction';
import { MockPlayerState, MockGame, MockPosition } from '@shared/mocks';
import { ActionType } from '@shared/types/contracts';

// Helper function to calculate distance between two positions
function calculateDistance(from: { x: number; y: number }, to: { x: number; y: number }): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.sqrt(dx * dx + dy * dy);
}

describe('MovementAction', () => {
  describe('constructor', () => {
    it('should create action with correct id', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(10, 10);
      const action = new MovementAction(from, to);

      expect(action.id).toBe('move-0,0-to-10,10');
    });

    it('should have correct action type', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(5, 5);
      const action = new MovementAction(from, to);

      expect(action.type).toBe(ActionType.MOVE);
    });

    it('should calculate time cost based on distance', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(3, 4); // distance = 5
      const action = new MovementAction(from, to);

      const expectedDistance = 5;
      const expectedTimeCost = 5 + Math.round(expectedDistance * 2);

      expect(action.timeCost).toBe(expectedTimeCost);
    });

    it('should have name "Move"', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(1, 1);
      const action = new MovementAction(from, to);

      expect(action.name).toBe('Move');
    });

    it('should have description with target coordinates', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(15, 25);
      const action = new MovementAction(from, to);

      expect(action.description).toBe('Move to (15, 25)');
    });

    it('should calculate correct time cost for zero distance', () => {
      const from = MockPosition.create(5, 5);
      const to = MockPosition.create(5, 5);
      const action = new MovementAction(from, to);

      expect(action.timeCost).toBe(5); // base cost only
    });

    it('should calculate correct time cost for horizontal movement', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(10, 0); // distance = 10
      const action = new MovementAction(from, to);

      const expectedTimeCost = 5 + Math.round(10 * 2);
      expect(action.timeCost).toBe(expectedTimeCost);
    });

    it('should calculate correct time cost for vertical movement', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(0, 10); // distance = 10
      const action = new MovementAction(from, to);

      const expectedTimeCost = 5 + Math.round(10 * 2);
      expect(action.timeCost).toBe(expectedTimeCost);
    });

    it('should calculate correct time cost for diagonal movement', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(6, 8); // distance = 10 (3-4-5 triangle scaled 2x)
      const action = new MovementAction(from, to);

      const distance = calculateDistance(from, to);
      const expectedTimeCost = 5 + Math.round(distance * 2);
      expect(action.timeCost).toBe(expectedTimeCost);
    });
  });

  describe('getFromPosition', () => {
    it('should return from position', () => {
      const from = MockPosition.create(5, 10);
      const to = MockPosition.create(15, 20);
      const action = new MovementAction(from, to);

      expect(action.getFromPosition()).toEqual(from);
    });
  });

  describe('getToPosition', () => {
    it('should return to position', () => {
      const from = MockPosition.create(5, 10);
      const to = MockPosition.create(15, 20);
      const action = new MovementAction(from, to);

      expect(action.getToPosition()).toEqual(to);
    });
  });

  describe('getDistance', () => {
    it('should return calculated distance', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(3, 4);
      const action = new MovementAction(from, to);

      expect(action.getDistance()).toBe(5);
    });

    it('should return zero for same position', () => {
      const from = MockPosition.create(10, 10);
      const to = MockPosition.create(10, 10);
      const action = new MovementAction(from, to);

      expect(action.getDistance()).toBe(0);
    });
  });

  describe('canExecute', () => {
    it('should return true when player is on street with enough time', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(10, 10);
      const action = new MovementAction(from, to);

      const player = MockPlayerState.onStreet(from);
      const game = MockGame.create();

      expect(action.canExecute(player, game)).toBe(true);
    });

    it('should return false when player is in a building', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(10, 10);
      const action = new MovementAction(from, to);

      const player = MockPlayerState.inBuilding('store-1', from);
      const game = MockGame.create();

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should return false when player does not have enough time', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(10, 10);
      const action = new MovementAction(from, to);

      const player = MockPlayerState.create({
        position: from,
        currentBuilding: null,
        timeRemaining: action.timeCost - 1,
      });
      const game = MockGame.create();

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should return false when target position is invalid', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(200, 200); // outside valid range
      const action = new MovementAction(from, to);

      const player = MockPlayerState.onStreet(from);
      const game = MockGame.create();

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should return false when moving to current position', () => {
      const from = MockPosition.create(10, 10);
      const to = MockPosition.create(10, 10);
      const action = new MovementAction(from, to);

      const player = MockPlayerState.onStreet(from);
      const game = MockGame.create();

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should return true when player has exactly enough time', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(5, 5);
      const action = new MovementAction(from, to);

      const player = MockPlayerState.create({
        position: from,
        currentBuilding: null,
        timeRemaining: action.timeCost,
      });
      const game = MockGame.create();

      expect(action.canExecute(player, game)).toBe(true);
    });

    it('should return true for valid positions at boundary', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(100, 100); // at valid boundary
      const action = new MovementAction(from, to);

      const player = MockPlayerState.create({
        position: from,
        currentBuilding: null,
        timeRemaining: 500, // enough time for long movement
      });
      const game = MockGame.create();

      expect(action.canExecute(player, game)).toBe(true);
    });

    it('should return false for negative coordinates', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(-5, 10);
      const action = new MovementAction(from, to);

      const player = MockPlayerState.onStreet(from);
      const game = MockGame.create();

      expect(action.canExecute(player, game)).toBe(false);
    });
  });

  describe('execute', () => {
    it('should return success response with position change', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(10, 10);
      const action = new MovementAction(from, to);

      const player = MockPlayerState.onStreet(from);
      const game = MockGame.create();

      const response = action.execute(player, game);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Moved to (10, 10)');
      expect(response.stateChanges).toHaveLength(1);
      expect(response.stateChanges[0].position).toEqual(to);
    });

    it('should return correct time cost', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(3, 4);
      const action = new MovementAction(from, to);

      const player = MockPlayerState.onStreet(from);
      const game = MockGame.create();

      const response = action.execute(player, game);

      expect(response.timeCost).toBe(action.timeCost);
    });

    it('should return failure when player is in building', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(10, 10);
      const action = new MovementAction(from, to);

      const player = MockPlayerState.inBuilding('store-1', from);
      const game = MockGame.create();

      const response = action.execute(player, game);

      expect(response.success).toBe(false);
      expect(response.errors).toContain('Must be on the street to move');
    });

    it('should return failure when not enough time', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(10, 10);
      const action = new MovementAction(from, to);

      const player = MockPlayerState.create({
        position: from,
        currentBuilding: null,
        timeRemaining: 1,
      });
      const game = MockGame.create();

      const response = action.execute(player, game);

      expect(response.success).toBe(false);
      expect(response.errors?.some(e => e.includes('Not enough time'))).toBe(true);
    });

    it('should return failure when target position is invalid', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(200, 200);
      const action = new MovementAction(from, to);

      const player = MockPlayerState.onStreet(from);
      const game = MockGame.create();

      const response = action.execute(player, game);

      expect(response.success).toBe(false);
      expect(response.errors).toContain('Invalid target position');
    });

    it('should return failure when moving to current position', () => {
      const from = MockPosition.create(10, 10);
      const to = MockPosition.create(10, 10);
      const action = new MovementAction(from, to);

      const player = MockPlayerState.onStreet(from);
      const game = MockGame.create();

      const response = action.execute(player, game);

      expect(response.success).toBe(false);
      expect(response.errors).toContain('Already at target position');
    });

    it('should include state change description', () => {
      const from = MockPosition.create(5, 5);
      const to = MockPosition.create(15, 20);
      const action = new MovementAction(from, to);

      const player = MockPlayerState.onStreet(from);
      const game = MockGame.create();

      const response = action.execute(player, game);

      expect(response.success).toBe(true);
      expect(response.stateChanges[0].description).toBe('Moved to (15, 20)');
    });

    it('should return zero time cost on failure', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(10, 10);
      const action = new MovementAction(from, to);

      const player = MockPlayerState.inBuilding('store-1', from);
      const game = MockGame.create();

      const response = action.execute(player, game);

      expect(response.success).toBe(false);
      expect(response.timeCost).toBe(0);
    });

    it('should return empty state changes on failure', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(10, 10);
      const action = new MovementAction(from, to);

      const player = MockPlayerState.inBuilding('store-1', from);
      const game = MockGame.create();

      const response = action.execute(player, game);

      expect(response.success).toBe(false);
      expect(response.stateChanges).toEqual([]);
    });
  });

  describe('getRequirements', () => {
    it('should return location requirement', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(10, 10);
      const action = new MovementAction(from, to);

      const requirements = action.getRequirements();

      const locationReq = requirements.find(r => r.type === 'location');
      expect(locationReq).toBeDefined();
      expect(locationReq?.value).toBe('street');
    });

    it('should return time requirement', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(10, 10);
      const action = new MovementAction(from, to);

      const requirements = action.getRequirements();

      const timeReq = requirements.find(r => r.type === 'time');
      expect(timeReq).toBeDefined();
      expect(timeReq?.value).toBe(action.timeCost);
    });

    it('should have exactly 2 requirements', () => {
      const from = MockPosition.create(0, 0);
      const to = MockPosition.create(10, 10);
      const action = new MovementAction(from, to);

      const requirements = action.getRequirements();

      expect(requirements).toHaveLength(2);
    });
  });
});
