import { StudyAction } from './StudyAction';
import { createMockPlayer, createMockGame } from '@shared/mocks/actionMocks';
import { ActionType } from '@shared/types/contracts';

describe('StudyAction', () => {
  describe('constructor', () => {
    it('should create a StudyAction with correct properties for 1 hour', () => {
      const action = new StudyAction(1);

      expect(action.id).toBe('study-1h');
      expect(action.type).toBe(ActionType.STUDY);
      expect(action.name).toBe('Study');
      expect(action.description).toBe('Study for 1 hours');
      expect(action.timeCost).toBe(60); // 1 hour * 60 minutes
    });

    it('should create a StudyAction with correct properties for 2 hours', () => {
      const action = new StudyAction(2);

      expect(action.id).toBe('study-2h');
      expect(action.timeCost).toBe(120); // 2 hours * 60 minutes
    });

    it('should create a StudyAction with correct properties for 4 hours', () => {
      const action = new StudyAction(4);

      expect(action.id).toBe('study-4h');
      expect(action.timeCost).toBe(240); // 4 hours * 60 minutes
    });

    it('should create a StudyAction with correct properties for 8 hours', () => {
      const action = new StudyAction(8);

      expect(action.id).toBe('study-8h');
      expect(action.description).toBe('Study for 8 hours');
      expect(action.timeCost).toBe(480); // 8 hours * 60 minutes
    });
  });

  describe('canExecute', () => {
    it('should return true when all conditions are met', () => {
      const player = createMockPlayer({
        location: 'college',
        cash: 100,
        time: 120,
      });
      const game = createMockGame();
      const action = new StudyAction(2);

      expect(action.canExecute(player, game)).toBe(true);
    });

    it('should return false when player has insufficient time', () => {
      const player = createMockPlayer({
        location: 'college',
        cash: 100,
        time: 30, // Less than 60 minutes
      });
      const game = createMockGame();
      const action = new StudyAction(1);

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should return false when player has insufficient cash', () => {
      const player = createMockPlayer({
        location: 'college',
        cash: 10, // Less than $20 needed for 1 hour
        time: 60,
      });
      const game = createMockGame();
      const action = new StudyAction(1);

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should return false when player is not at college', () => {
      const player = createMockPlayer({
        location: 'home', // Wrong location
        cash: 100,
        time: 120,
      });
      const game = createMockGame();
      const action = new StudyAction(2);

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should handle edge case with exactly enough cash', () => {
      const player = createMockPlayer({
        location: 'college',
        cash: 20, // Exactly $20 for 1 hour
        time: 60,
      });
      const game = createMockGame();
      const action = new StudyAction(1);

      expect(action.canExecute(player, game)).toBe(true);
    });

    it('should handle edge case with one dollar less cash', () => {
      const player = createMockPlayer({
        location: 'college',
        cash: 19, // One dollar less than $20
        time: 60,
      });
      const game = createMockGame();
      const action = new StudyAction(1);

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should handle edge case with exactly enough time', () => {
      const player = createMockPlayer({
        location: 'college',
        cash: 100,
        time: 240, // Exactly 4 hours
      });
      const game = createMockGame();
      const action = new StudyAction(4);

      expect(action.canExecute(player, game)).toBe(true);
    });

    it('should handle edge case with one minute less time', () => {
      const player = createMockPlayer({
        location: 'college',
        cash: 100,
        time: 239, // One minute less than 4 hours
      });
      const game = createMockGame();
      const action = new StudyAction(4);

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should require enough cash for 8 hours of study', () => {
      const player = createMockPlayer({
        location: 'college',
        cash: 150, // Less than $160 needed
        time: 480,
      });
      const game = createMockGame();
      const action = new StudyAction(8);

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should pass with enough cash for 8 hours of study', () => {
      const player = createMockPlayer({
        location: 'college',
        cash: 160, // Exactly $160 needed
        time: 480,
      });
      const game = createMockGame();
      const action = new StudyAction(8);

      expect(action.canExecute(player, game)).toBe(true);
    });
  });

  describe('execute', () => {
    it('should return failure when canExecute is false', () => {
      const player = createMockPlayer({
        location: 'home', // Wrong location
        cash: 100,
        time: 120,
      });
      const game = createMockGame();
      const action = new StudyAction(2);

      const result = action.execute(player, game);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Cannot study right now');
      expect(result.timeCost).toBe(0);
      expect(result.stateChanges).toBeUndefined();
    });

    it('should return success and deduct correct tuition for 1 hour', () => {
      const player = createMockPlayer({
        location: 'college',
        cash: 100,
        time: 60,
      });
      const game = createMockGame();
      const action = new StudyAction(1);

      const result = action.execute(player, game);

      expect(result.success).toBe(true);
      expect(result.stateChanges?.cash).toBe(-20); // $20 per hour
    });

    it('should return success and gain correct education for 1 hour', () => {
      const player = createMockPlayer({
        location: 'college',
        cash: 100,
        time: 60,
      });
      const game = createMockGame();
      const action = new StudyAction(1);

      const result = action.execute(player, game);

      expect(result.success).toBe(true);
      expect(result.stateChanges?.education).toBe(5); // 5 points per hour
    });

    it('should return success with correct values for 2 hours', () => {
      const player = createMockPlayer({
        location: 'college',
        cash: 100,
        time: 120,
      });
      const game = createMockGame();
      const action = new StudyAction(2);

      const result = action.execute(player, game);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Studied and gained 10 education');
      expect(result.timeCost).toBe(120);
      expect(result.stateChanges?.cash).toBe(-40); // 2 hours * $20
      expect(result.stateChanges?.education).toBe(10); // 2 hours * 5 points
    });

    it('should return success with correct values for 4 hours', () => {
      const player = createMockPlayer({
        location: 'college',
        cash: 100,
        time: 240,
      });
      const game = createMockGame();
      const action = new StudyAction(4);

      const result = action.execute(player, game);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Studied and gained 20 education');
      expect(result.stateChanges?.cash).toBe(-80); // 4 hours * $20
      expect(result.stateChanges?.education).toBe(20); // 4 hours * 5 points
    });

    it('should return success with correct values for 8 hours', () => {
      const player = createMockPlayer({
        location: 'college',
        cash: 200,
        time: 480,
      });
      const game = createMockGame();
      const action = new StudyAction(8);

      const result = action.execute(player, game);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Studied and gained 40 education');
      expect(result.stateChanges?.cash).toBe(-160); // 8 hours * $20
      expect(result.stateChanges?.education).toBe(40); // 8 hours * 5 points
    });

    it('should include state change descriptions', () => {
      const player = createMockPlayer({
        location: 'college',
        cash: 100,
        time: 120,
      });
      const game = createMockGame();
      const action = new StudyAction(2);

      const result = action.execute(player, game);

      expect(result.stateChanges?.descriptions).toHaveLength(2);
      expect(result.stateChanges?.descriptions[0]).toBe('Paid $40 tuition');
      expect(result.stateChanges?.descriptions[1]).toBe('Gained 10 education');
    });

    it('should return correct time cost', () => {
      const player = createMockPlayer({
        location: 'college',
        cash: 100,
        time: 240,
      });
      const game = createMockGame();
      const action = new StudyAction(4);

      const result = action.execute(player, game);

      expect(result.timeCost).toBe(240);
    });
  });

  describe('getRequirements', () => {
    it('should return three requirements', () => {
      const action = new StudyAction(2);

      const requirements = action.getRequirements();

      expect(requirements).toHaveLength(3);
    });

    it('should include cash requirement for 1 hour', () => {
      const action = new StudyAction(1);

      const requirements = action.getRequirements();
      const cashReq = requirements.find((r) => r.type === 'cash');

      expect(cashReq).toBeDefined();
      expect(cashReq?.value).toBe(20);
      expect(cashReq?.description).toBe('Requires $20 for tuition');
    });

    it('should include cash requirement for 2 hours', () => {
      const action = new StudyAction(2);

      const requirements = action.getRequirements();
      const cashReq = requirements.find((r) => r.type === 'cash');

      expect(cashReq).toBeDefined();
      expect(cashReq?.value).toBe(40);
      expect(cashReq?.description).toBe('Requires $40 for tuition');
    });

    it('should include cash requirement for 8 hours', () => {
      const action = new StudyAction(8);

      const requirements = action.getRequirements();
      const cashReq = requirements.find((r) => r.type === 'cash');

      expect(cashReq).toBeDefined();
      expect(cashReq?.value).toBe(160);
      expect(cashReq?.description).toBe('Requires $160 for tuition');
    });

    it('should include location requirement', () => {
      const action = new StudyAction(2);

      const requirements = action.getRequirements();
      const locationReq = requirements.find((r) => r.type === 'location');

      expect(locationReq).toBeDefined();
      expect(locationReq?.value).toBe('college');
      expect(locationReq?.description).toBe('Must be at College');
    });

    it('should include time requirement for 1 hour', () => {
      const action = new StudyAction(1);

      const requirements = action.getRequirements();
      const timeReq = requirements.find((r) => r.type === 'time');

      expect(timeReq).toBeDefined();
      expect(timeReq?.value).toBe(60);
      expect(timeReq?.description).toBe('Requires 1 hours');
    });

    it('should include time requirement for 4 hours', () => {
      const action = new StudyAction(4);

      const requirements = action.getRequirements();
      const timeReq = requirements.find((r) => r.type === 'time');

      expect(timeReq).toBeDefined();
      expect(timeReq?.value).toBe(240);
      expect(timeReq?.description).toBe('Requires 4 hours');
    });

    it('should include time requirement for 8 hours', () => {
      const action = new StudyAction(8);

      const requirements = action.getRequirements();
      const timeReq = requirements.find((r) => r.type === 'time');

      expect(timeReq).toBeDefined();
      expect(timeReq?.value).toBe(480);
      expect(timeReq?.description).toBe('Requires 8 hours');
    });
  });
});
