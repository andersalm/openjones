import { EnterBuildingAction } from './EnterBuildingAction';
import { MockPlayerState, MockGame, MockPosition } from '@shared/mocks';
import { BuildingType } from '@shared/types/contracts';
import { ActionType } from '@shared/types/contracts';

describe('EnterBuildingAction', () => {
  describe('constructor', () => {
    it('should create action with correct id', () => {
      const position = MockPosition.create(10, 20);
      const action = new EnterBuildingAction(position);

      expect(action.id).toBe('enter-building-10,20');
    });

    it('should have correct action type', () => {
      const position = MockPosition.create(5, 5);
      const action = new EnterBuildingAction(position);

      expect(action.type).toBe(ActionType.ENTER_BUILDING);
    });

    it('should have fixed time cost of 5', () => {
      const position = MockPosition.create(0, 0);
      const action = new EnterBuildingAction(position);

      expect(action.timeCost).toBe(5);
    });

    it('should have name "Enter Building"', () => {
      const position = MockPosition.create(0, 0);
      const action = new EnterBuildingAction(position);

      expect(action.name).toBe('Enter Building');
    });

    it('should have appropriate description', () => {
      const position = MockPosition.create(0, 0);
      const action = new EnterBuildingAction(position);

      expect(action.description).toBe('Enter the building at current position');
    });
  });

  describe('getPosition', () => {
    it('should return the position', () => {
      const position = MockPosition.create(15, 25);
      const action = new EnterBuildingAction(position);

      expect(action.getPosition()).toEqual(position);
    });
  });

  describe('canExecute', () => {
    it('should return true when player is on street at building location', () => {
      const position = MockPosition.create(10, 10);
      const action = new EnterBuildingAction(position);

      const player = MockPlayerState.onStreet(position);
      const game = MockGame.withBuilding('store-1', position);

      expect(action.canExecute(player, game)).toBe(true);
    });

    it('should return false when player is already in a building', () => {
      const position = MockPosition.create(10, 10);
      const action = new EnterBuildingAction(position);

      const player = MockPlayerState.inBuilding('store-1', position);
      const game = MockGame.withBuilding('store-2', position);

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should return false when no building at position', () => {
      const position = MockPosition.create(10, 10);
      const action = new EnterBuildingAction(position);

      const player = MockPlayerState.onStreet(position);
      const game = MockGame.create(); // no buildings

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should return false when player is not at building position', () => {
      const buildingPosition = MockPosition.create(10, 10);
      const playerPosition = MockPosition.create(5, 5);
      const action = new EnterBuildingAction(buildingPosition);

      const player = MockPlayerState.onStreet(playerPosition);
      const game = MockGame.withBuilding('store-1', buildingPosition);

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should return false when player does not have enough time', () => {
      const position = MockPosition.create(10, 10);
      const action = new EnterBuildingAction(position);

      const player = MockPlayerState.create({
        position,
        currentBuilding: null,
        timeRemaining: 4, // less than required 5
      });
      const game = MockGame.withBuilding('store-1', position);

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should return true when player has exactly enough time', () => {
      const position = MockPosition.create(10, 10);
      const action = new EnterBuildingAction(position);

      const player = MockPlayerState.create({
        position,
        currentBuilding: null,
        timeRemaining: 5,
      });
      const game = MockGame.withBuilding('store-1', position);

      expect(action.canExecute(player, game)).toBe(true);
    });

    it('should work with different building types', () => {
      const position = MockPosition.create(10, 10);
      const action = new EnterBuildingAction(position);

      const player = MockPlayerState.onStreet(position);
      const game = MockGame.withBuilding('bank-1', position, BuildingType.BANK);

      expect(action.canExecute(player, game)).toBe(true);
    });

    it('should return false when player x coordinate does not match', () => {
      const buildingPosition = MockPosition.create(10, 10);
      const playerPosition = MockPosition.create(11, 10);
      const action = new EnterBuildingAction(buildingPosition);

      const player = MockPlayerState.onStreet(playerPosition);
      const game = MockGame.withBuilding('store-1', buildingPosition);

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should return false when player y coordinate does not match', () => {
      const buildingPosition = MockPosition.create(10, 10);
      const playerPosition = MockPosition.create(10, 11);
      const action = new EnterBuildingAction(buildingPosition);

      const player = MockPlayerState.onStreet(playerPosition);
      const game = MockGame.withBuilding('store-1', buildingPosition);

      expect(action.canExecute(player, game)).toBe(false);
    });
  });

  describe('execute', () => {
    it('should return success response with building entered', () => {
      const position = MockPosition.create(10, 10);
      const action = new EnterBuildingAction(position);

      const player = MockPlayerState.onStreet(position);
      const game = MockGame.withBuilding('store-1', position);

      const response = action.execute(player, game);

      expect(response.success).toBe(true);
      expect(response.message).toContain('Entered');
    });

    it('should update currentBuilding in state changes', () => {
      const position = MockPosition.create(10, 10);
      const action = new EnterBuildingAction(position);

      const player = MockPlayerState.onStreet(position);
      const game = MockGame.withBuilding('store-1', position);

      const response = action.execute(player, game);

      expect(response.success).toBe(true);
      expect(response.stateChanges).toHaveLength(1);
      expect(response.stateChanges[0].currentBuilding).toBe('store-1');
    });

    it('should return time cost of 5', () => {
      const position = MockPosition.create(10, 10);
      const action = new EnterBuildingAction(position);

      const player = MockPlayerState.onStreet(position);
      const game = MockGame.withBuilding('store-1', position);

      const response = action.execute(player, game);

      expect(response.success).toBe(true);
      expect(response.timeCost).toBe(5);
    });

    it('should include building name in message', () => {
      const position = MockPosition.create(10, 10);
      const action = new EnterBuildingAction(position);

      const player = MockPlayerState.onStreet(position);
      const game = MockGame.withBuilding('store-1', position);

      const response = action.execute(player, game);

      expect(response.success).toBe(true);
      expect(response.message).toBe('Entered Test store');
    });

    it('should return failure when player is already in a building', () => {
      const position = MockPosition.create(10, 10);
      const action = new EnterBuildingAction(position);

      const player = MockPlayerState.inBuilding('bank-1', position);
      const game = MockGame.withBuilding('store-1', position);

      const response = action.execute(player, game);

      expect(response.success).toBe(false);
      expect(response.errors).toContain('Already inside a building');
    });

    it('should return failure when no building at position', () => {
      const position = MockPosition.create(10, 10);
      const action = new EnterBuildingAction(position);

      const player = MockPlayerState.onStreet(position);
      const game = MockGame.create();

      const response = action.execute(player, game);

      expect(response.success).toBe(false);
      expect(response.errors).toContain('No building at this position');
    });

    it('should return failure when not enough time', () => {
      const position = MockPosition.create(10, 10);
      const action = new EnterBuildingAction(position);

      const player = MockPlayerState.create({
        position,
        currentBuilding: null,
        timeRemaining: 3,
      });
      const game = MockGame.withBuilding('store-1', position);

      const response = action.execute(player, game);

      expect(response.success).toBe(false);
      expect(response.errors?.some(e => e.includes('Not enough time'))).toBe(true);
    });

    it('should return failure when player not at building location', () => {
      const buildingPosition = MockPosition.create(10, 10);
      const playerPosition = MockPosition.create(5, 5);
      const action = new EnterBuildingAction(buildingPosition);

      const player = MockPlayerState.onStreet(playerPosition);
      const game = MockGame.withBuilding('store-1', buildingPosition);

      const response = action.execute(player, game);

      expect(response.success).toBe(false);
      expect(response.errors).toContain('Must be at the building location to enter');
    });

    it('should return zero time cost on failure', () => {
      const position = MockPosition.create(10, 10);
      const action = new EnterBuildingAction(position);

      const player = MockPlayerState.inBuilding('store-1', position);
      const game = MockGame.create();

      const response = action.execute(player, game);

      expect(response.success).toBe(false);
      expect(response.timeCost).toBe(0);
    });

    it('should return empty state changes on failure', () => {
      const position = MockPosition.create(10, 10);
      const action = new EnterBuildingAction(position);

      const player = MockPlayerState.inBuilding('store-1', position);
      const game = MockGame.create();

      const response = action.execute(player, game);

      expect(response.success).toBe(false);
      expect(response.stateChanges).toEqual([]);
    });

    it('should include state change description', () => {
      const position = MockPosition.create(10, 10);
      const action = new EnterBuildingAction(position);

      const player = MockPlayerState.onStreet(position);
      const game = MockGame.withBuilding('store-1', position);

      const response = action.execute(player, game);

      expect(response.success).toBe(true);
      expect(response.stateChanges[0].description).toBe('Entered Test store');
    });
  });

  describe('getRequirements', () => {
    it('should return street location requirement', () => {
      const position = MockPosition.create(10, 10);
      const action = new EnterBuildingAction(position);

      const requirements = action.getRequirements();

      const streetReq = requirements.find(r => r.type === 'location' && r.value === 'street');
      expect(streetReq).toBeDefined();
      expect(streetReq?.description).toContain('street');
    });

    it('should return building location requirement', () => {
      const position = MockPosition.create(10, 10);
      const action = new EnterBuildingAction(position);

      const requirements = action.getRequirements();

      const buildingReq = requirements.find(r => r.type === 'location' && r.value === 'building');
      expect(buildingReq).toBeDefined();
      expect(buildingReq?.description).toContain('building location');
    });

    it('should return time requirement', () => {
      const position = MockPosition.create(10, 10);
      const action = new EnterBuildingAction(position);

      const requirements = action.getRequirements();

      const timeReq = requirements.find(r => r.type === 'time');
      expect(timeReq).toBeDefined();
      expect(timeReq?.value).toBe(5);
    });

    it('should have exactly 3 requirements', () => {
      const position = MockPosition.create(10, 10);
      const action = new EnterBuildingAction(position);

      const requirements = action.getRequirements();

      expect(requirements).toHaveLength(3);
    });
  });
});
