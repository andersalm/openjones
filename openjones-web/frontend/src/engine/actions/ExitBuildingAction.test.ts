import { ExitBuildingAction } from './ExitBuildingAction';
import { MockPlayerState, MockGame, MockPosition } from '@shared/mocks';
import { BuildingType } from '@shared/types/contracts';
import { ActionType } from '@shared/types/contracts';

describe('ExitBuildingAction', () => {
  describe('constructor', () => {
    it('should create action with correct id', () => {
      const action = new ExitBuildingAction();

      expect(action.id).toBe('exit-building');
    });

    it('should have correct action type', () => {
      const action = new ExitBuildingAction();

      expect(action.type).toBe(ActionType.EXIT_BUILDING);
    });

    it('should have fixed time cost of 5', () => {
      const action = new ExitBuildingAction();

      expect(action.timeCost).toBe(5);
    });

    it('should have name "Exit Building"', () => {
      const action = new ExitBuildingAction();

      expect(action.name).toBe('Exit Building');
    });

    it('should have appropriate description', () => {
      const action = new ExitBuildingAction();

      expect(action.description).toBe('Exit the current building to the street');
    });
  });

  describe('canExecute', () => {
    it('should return true when player is inside a building with enough time', () => {
      const action = new ExitBuildingAction();
      const position = MockPosition.create(10, 10);

      const player = MockPlayerState.inBuilding('store-1', position);
      const game = MockGame.withBuilding('store-1', position);

      expect(action.canExecute(player, game)).toBe(true);
    });

    it('should return false when player is on the street', () => {
      const action = new ExitBuildingAction();
      const position = MockPosition.create(10, 10);

      const player = MockPlayerState.onStreet(position);
      const game = MockGame.create();

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should return false when player does not have enough time', () => {
      const action = new ExitBuildingAction();
      const position = MockPosition.create(10, 10);

      const player = MockPlayerState.create({
        position,
        currentBuilding: 'store-1',
        timeRemaining: 4, // less than required 5
      });
      const game = MockGame.withBuilding('store-1', position);

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should return true when player has exactly enough time', () => {
      const action = new ExitBuildingAction();
      const position = MockPosition.create(10, 10);

      const player = MockPlayerState.create({
        position,
        currentBuilding: 'store-1',
        timeRemaining: 5,
      });
      const game = MockGame.withBuilding('store-1', position);

      expect(action.canExecute(player, game)).toBe(true);
    });

    it('should work when in any building type', () => {
      const action = new ExitBuildingAction();
      const position = MockPosition.create(10, 10);

      const player = MockPlayerState.inBuilding('bank-1', position);
      const game = MockGame.withBuilding('bank-1', position, BuildingType.BANK);

      expect(action.canExecute(player, game)).toBe(true);
    });

    it('should return true even if building no longer exists in game', () => {
      // This tests a edge case where player is in a building that was removed
      const action = new ExitBuildingAction();
      const position = MockPosition.create(10, 10);

      const player = MockPlayerState.inBuilding('store-1', position);
      const game = MockGame.create(); // no buildings

      expect(action.canExecute(player, game)).toBe(true);
    });
  });

  describe('execute', () => {
    it('should return success response when exiting building', () => {
      const action = new ExitBuildingAction();
      const position = MockPosition.create(10, 10);

      const player = MockPlayerState.inBuilding('store-1', position);
      const game = MockGame.withBuilding('store-1', position);

      const response = action.execute(player, game);

      expect(response.success).toBe(true);
      expect(response.message).toContain('Exited');
    });

    it('should set currentBuilding to null in state changes', () => {
      const action = new ExitBuildingAction();
      const position = MockPosition.create(10, 10);

      const player = MockPlayerState.inBuilding('store-1', position);
      const game = MockGame.withBuilding('store-1', position);

      const response = action.execute(player, game);

      expect(response.success).toBe(true);
      expect(response.stateChanges).toHaveLength(1);
      expect(response.stateChanges[0].currentBuilding).toBeNull();
    });

    it('should return time cost of 5', () => {
      const action = new ExitBuildingAction();
      const position = MockPosition.create(10, 10);

      const player = MockPlayerState.inBuilding('store-1', position);
      const game = MockGame.withBuilding('store-1', position);

      const response = action.execute(player, game);

      expect(response.success).toBe(true);
      expect(response.timeCost).toBe(5);
    });

    it('should include building name in success message', () => {
      const action = new ExitBuildingAction();
      const position = MockPosition.create(10, 10);

      const player = MockPlayerState.inBuilding('store-1', position);
      const game = MockGame.withBuilding('store-1', position);

      const response = action.execute(player, game);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Exited Test store');
    });

    it('should use "building" as fallback if building not found', () => {
      const action = new ExitBuildingAction();
      const position = MockPosition.create(10, 10);

      const player = MockPlayerState.inBuilding('store-1', position);
      const game = MockGame.create(); // no buildings

      const response = action.execute(player, game);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Exited building');
    });

    it('should return failure when player is not in a building', () => {
      const action = new ExitBuildingAction();
      const position = MockPosition.create(10, 10);

      const player = MockPlayerState.onStreet(position);
      const game = MockGame.create();

      const response = action.execute(player, game);

      expect(response.success).toBe(false);
      expect(response.errors).toContain('Not inside a building');
    });

    it('should return failure when not enough time', () => {
      const action = new ExitBuildingAction();
      const position = MockPosition.create(10, 10);

      const player = MockPlayerState.create({
        position,
        currentBuilding: 'store-1',
        timeRemaining: 3,
      });
      const game = MockGame.withBuilding('store-1', position);

      const response = action.execute(player, game);

      expect(response.success).toBe(false);
      expect(response.errors?.some(e => e.includes('Not enough time'))).toBe(true);
    });

    it('should return zero time cost on failure', () => {
      const action = new ExitBuildingAction();
      const position = MockPosition.create(10, 10);

      const player = MockPlayerState.onStreet(position);
      const game = MockGame.create();

      const response = action.execute(player, game);

      expect(response.success).toBe(false);
      expect(response.timeCost).toBe(0);
    });

    it('should return empty state changes on failure', () => {
      const action = new ExitBuildingAction();
      const position = MockPosition.create(10, 10);

      const player = MockPlayerState.onStreet(position);
      const game = MockGame.create();

      const response = action.execute(player, game);

      expect(response.success).toBe(false);
      expect(response.stateChanges).toEqual([]);
    });

    it('should include state change description', () => {
      const action = new ExitBuildingAction();
      const position = MockPosition.create(10, 10);

      const player = MockPlayerState.inBuilding('store-1', position);
      const game = MockGame.withBuilding('store-1', position);

      const response = action.execute(player, game);

      expect(response.success).toBe(true);
      expect(response.stateChanges[0].description).toBe('Exited Test store');
    });

    it('should work with different building types', () => {
      const action = new ExitBuildingAction();
      const position = MockPosition.create(10, 10);

      const player = MockPlayerState.inBuilding('bank-1', position);
      const game = MockGame.withBuilding('bank-1', position, BuildingType.BANK);

      const response = action.execute(player, game);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Exited Test bank');
    });

    it('should handle exiting from office', () => {
      const action = new ExitBuildingAction();
      const position = MockPosition.create(10, 10);

      const player = MockPlayerState.inBuilding('office-1', position);
      const game = MockGame.withBuilding('office-1', position, BuildingType.OFFICE);

      const response = action.execute(player, game);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Exited Test office');
    });

    it('should handle exiting from school', () => {
      const action = new ExitBuildingAction();
      const position = MockPosition.create(10, 10);

      const player = MockPlayerState.inBuilding('school-1', position);
      const game = MockGame.withBuilding('school-1', position, BuildingType.SCHOOL);

      const response = action.execute(player, game);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Exited Test school');
    });

    it('should handle exiting from house', () => {
      const action = new ExitBuildingAction();
      const position = MockPosition.create(10, 10);

      const player = MockPlayerState.inBuilding('house-1', position);
      const game = MockGame.withBuilding('house-1', position, BuildingType.HOUSE);

      const response = action.execute(player, game);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Exited Test house');
    });
  });

  describe('getRequirements', () => {
    it('should return building location requirement', () => {
      const action = new ExitBuildingAction();

      const requirements = action.getRequirements();

      const buildingReq = requirements.find(r => r.type === 'location' && r.value === 'building');
      expect(buildingReq).toBeDefined();
      expect(buildingReq?.description).toContain('inside a building');
    });

    it('should return time requirement', () => {
      const action = new ExitBuildingAction();

      const requirements = action.getRequirements();

      const timeReq = requirements.find(r => r.type === 'time');
      expect(timeReq).toBeDefined();
      expect(timeReq?.value).toBe(5);
    });

    it('should have exactly 2 requirements', () => {
      const action = new ExitBuildingAction();

      const requirements = action.getRequirements();

      expect(requirements).toHaveLength(2);
    });
  });
});
