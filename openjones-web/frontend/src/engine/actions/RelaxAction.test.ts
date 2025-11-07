import { RelaxAction } from './RelaxAction';
import { createMockPlayer, createMockGame } from '@shared/mocks/actionMocks';
import { ActionType } from '@shared/types/contracts';

describe('RelaxAction', () => {
  describe('constructor', () => {
    it('should create a RelaxAction with correct properties for 1 hour', () => {
      const action = new RelaxAction(1);

      expect(action.id).toBe('relax-1h');
      expect(action.type).toBe(ActionType.RELAX);
      expect(action.name).toBe('Relax');
      expect(action.description).toBe('Relax for 1 hours');
      expect(action.timeCost).toBe(60);
    });

    it('should create a RelaxAction with correct properties for 2 hours', () => {
      const action = new RelaxAction(2);

      expect(action.id).toBe('relax-2h');
      expect(action.timeCost).toBe(120);
    });

    it('should create a RelaxAction with correct properties for 4 hours', () => {
      const action = new RelaxAction(4);

      expect(action.id).toBe('relax-4h');
      expect(action.timeCost).toBe(240);
    });

    it('should create a RelaxAction with correct properties for 8 hours', () => {
      const action = new RelaxAction(8);

      expect(action.id).toBe('relax-8h');
      expect(action.description).toBe('Relax for 8 hours');
      expect(action.timeCost).toBe(480);
    });
  });

  describe('canExecute', () => {
    it('should return true when player has enough time', () => {
      const player = createMockPlayer({
        time: 120,
      });
      const game = createMockGame();
      const action = new RelaxAction(2);

      expect(action.canExecute(player, game)).toBe(true);
    });

    it('should return false when player has insufficient time', () => {
      const player = createMockPlayer({
        time: 30,
      });
      const game = createMockGame();
      const action = new RelaxAction(1);

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should return true regardless of location', () => {
      const player = createMockPlayer({
        location: 'street',
        time: 120,
      });
      const game = createMockGame();
      const action = new RelaxAction(2);

      expect(action.canExecute(player, game)).toBe(true);
    });

    it('should return true regardless of cash', () => {
      const player = createMockPlayer({
        cash: 0,
        time: 120,
      });
      const game = createMockGame();
      const action = new RelaxAction(2);

      expect(action.canExecute(player, game)).toBe(true);
    });

    it('should handle edge case with exactly enough time', () => {
      const player = createMockPlayer({
        time: 60,
      });
      const game = createMockGame();
      const action = new RelaxAction(1);

      expect(action.canExecute(player, game)).toBe(true);
    });

    it('should handle edge case with one minute less time', () => {
      const player = createMockPlayer({
        time: 59,
      });
      const game = createMockGame();
      const action = new RelaxAction(1);

      expect(action.canExecute(player, game)).toBe(false);
    });
  });

  describe('execute', () => {
    it('should return failure when canExecute is false', () => {
      const player = createMockPlayer({
        time: 30,
      });
      const game = createMockGame();
      const action = new RelaxAction(1);

      const result = action.execute(player, game);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Cannot relax right now');
      expect(result.timeCost).toBe(0);
      expect(result.stateChanges).toBeUndefined();
    });

    describe('base effectiveness (neutral location)', () => {
      it('should restore correct health for 1 hour', () => {
        const player = createMockPlayer({
          location: 'park',
          time: 60,
        });
        const game = createMockGame();
        const action = new RelaxAction(1);

        const result = action.execute(player, game);

        expect(result.success).toBe(true);
        expect(result.stateChanges?.health).toBe(10); // 1 hour * 10 health
      });

      it('should restore correct happiness for 1 hour', () => {
        const player = createMockPlayer({
          location: 'park',
          time: 60,
        });
        const game = createMockGame();
        const action = new RelaxAction(1);

        const result = action.execute(player, game);

        expect(result.stateChanges?.happiness).toBe(15); // 1 hour * 15 happiness
      });

      it('should restore correct values for 2 hours', () => {
        const player = createMockPlayer({
          location: 'park',
          time: 120,
        });
        const game = createMockGame();
        const action = new RelaxAction(2);

        const result = action.execute(player, game);

        expect(result.success).toBe(true);
        expect(result.stateChanges?.health).toBe(20); // 2 hours * 10 health
        expect(result.stateChanges?.happiness).toBe(30); // 2 hours * 15 happiness
      });

      it('should restore correct values for 4 hours', () => {
        const player = createMockPlayer({
          location: 'park',
          time: 240,
        });
        const game = createMockGame();
        const action = new RelaxAction(4);

        const result = action.execute(player, game);

        expect(result.stateChanges?.health).toBe(40); // 4 hours * 10 health
        expect(result.stateChanges?.happiness).toBe(60); // 4 hours * 15 happiness
      });

      it('should restore correct values for 8 hours', () => {
        const player = createMockPlayer({
          location: 'park',
          time: 480,
        });
        const game = createMockGame();
        const action = new RelaxAction(8);

        const result = action.execute(player, game);

        expect(result.stateChanges?.health).toBe(80); // 8 hours * 10 health
        expect(result.stateChanges?.happiness).toBe(120); // 8 hours * 15 happiness
      });
    });

    describe('home location bonus (1.5x multiplier)', () => {
      it('should apply home bonus to health restoration for 1 hour', () => {
        const player = createMockPlayer({
          location: 'home',
          time: 60,
        });
        const game = createMockGame();
        const action = new RelaxAction(1);

        const result = action.execute(player, game);

        expect(result.success).toBe(true);
        expect(result.stateChanges?.health).toBe(15); // 10 * 1.5 = 15
      });

      it('should apply home bonus to happiness restoration for 1 hour', () => {
        const player = createMockPlayer({
          location: 'home',
          time: 60,
        });
        const game = createMockGame();
        const action = new RelaxAction(1);

        const result = action.execute(player, game);

        expect(result.stateChanges?.happiness).toBe(22); // 15 * 1.5 = 22.5 -> 22
      });

      it('should apply home bonus for 2 hours', () => {
        const player = createMockPlayer({
          location: 'home',
          time: 120,
        });
        const game = createMockGame();
        const action = new RelaxAction(2);

        const result = action.execute(player, game);

        expect(result.stateChanges?.health).toBe(30); // 20 * 1.5 = 30
        expect(result.stateChanges?.happiness).toBe(45); // 30 * 1.5 = 45
      });

      it('should apply home bonus for 4 hours', () => {
        const player = createMockPlayer({
          location: 'home',
          time: 240,
        });
        const game = createMockGame();
        const action = new RelaxAction(4);

        const result = action.execute(player, game);

        expect(result.stateChanges?.health).toBe(60); // 40 * 1.5 = 60
        expect(result.stateChanges?.happiness).toBe(90); // 60 * 1.5 = 90
      });

      it('should include home bonus note in descriptions', () => {
        const player = createMockPlayer({
          location: 'home',
          time: 120,
        });
        const game = createMockGame();
        const action = new RelaxAction(2);

        const result = action.execute(player, game);

        expect(result.stateChanges?.descriptions[0]).toContain('(home bonus)');
        expect(result.stateChanges?.descriptions[1]).toContain('(home bonus)');
      });
    });

    describe('street/uncomfortable location penalty (0.5x multiplier)', () => {
      it('should apply street penalty to health restoration for 1 hour', () => {
        const player = createMockPlayer({
          location: 'street',
          time: 60,
        });
        const game = createMockGame();
        const action = new RelaxAction(1);

        const result = action.execute(player, game);

        expect(result.success).toBe(true);
        expect(result.stateChanges?.health).toBe(5); // 10 * 0.5 = 5
      });

      it('should apply street penalty to happiness restoration for 1 hour', () => {
        const player = createMockPlayer({
          location: 'street',
          time: 60,
        });
        const game = createMockGame();
        const action = new RelaxAction(1);

        const result = action.execute(player, game);

        expect(result.stateChanges?.happiness).toBe(7); // 15 * 0.5 = 7.5 -> 7
      });

      it('should apply street penalty for 2 hours', () => {
        const player = createMockPlayer({
          location: 'street',
          time: 120,
        });
        const game = createMockGame();
        const action = new RelaxAction(2);

        const result = action.execute(player, game);

        expect(result.stateChanges?.health).toBe(10); // 20 * 0.5 = 10
        expect(result.stateChanges?.happiness).toBe(15); // 30 * 0.5 = 15
      });

      it('should apply unknown location penalty', () => {
        const player = createMockPlayer({
          location: 'unknown',
          time: 120,
        });
        const game = createMockGame();
        const action = new RelaxAction(2);

        const result = action.execute(player, game);

        expect(result.stateChanges?.health).toBe(10); // 20 * 0.5 = 10
        expect(result.stateChanges?.happiness).toBe(15); // 30 * 0.5 = 15
      });

      it('should include uncomfortable location note in descriptions', () => {
        const player = createMockPlayer({
          location: 'street',
          time: 120,
        });
        const game = createMockGame();
        const action = new RelaxAction(2);

        const result = action.execute(player, game);

        expect(result.stateChanges?.descriptions[0]).toContain('(uncomfortable location)');
        expect(result.stateChanges?.descriptions[1]).toContain('(uncomfortable location)');
      });
    });

    it('should include state change descriptions', () => {
      const player = createMockPlayer({
        location: 'park',
        time: 120,
      });
      const game = createMockGame();
      const action = new RelaxAction(2);

      const result = action.execute(player, game);

      expect(result.stateChanges?.descriptions).toHaveLength(2);
      expect(result.stateChanges?.descriptions[0]).toContain('Restored 20 health');
      expect(result.stateChanges?.descriptions[1]).toContain('Restored 30 happiness');
    });

    it('should return correct message', () => {
      const player = createMockPlayer({
        location: 'park',
        time: 120,
      });
      const game = createMockGame();
      const action = new RelaxAction(2);

      const result = action.execute(player, game);

      expect(result.message).toBe('Relaxed and restored 20 health and 30 happiness');
    });

    it('should return correct time cost', () => {
      const player = createMockPlayer({
        location: 'park',
        time: 240,
      });
      const game = createMockGame();
      const action = new RelaxAction(4);

      const result = action.execute(player, game);

      expect(result.timeCost).toBe(240);
    });
  });

  describe('getRequirements', () => {
    it('should return one requirement', () => {
      const action = new RelaxAction(2);

      const requirements = action.getRequirements();

      expect(requirements).toHaveLength(1);
    });

    it('should include time requirement for 1 hour', () => {
      const action = new RelaxAction(1);

      const requirements = action.getRequirements();
      const timeReq = requirements.find((r) => r.type === 'time');

      expect(timeReq).toBeDefined();
      expect(timeReq?.value).toBe(60);
      expect(timeReq?.description).toBe('Requires 1 hours');
    });

    it('should include time requirement for 2 hours', () => {
      const action = new RelaxAction(2);

      const requirements = action.getRequirements();
      const timeReq = requirements.find((r) => r.type === 'time');

      expect(timeReq?.value).toBe(120);
      expect(timeReq?.description).toBe('Requires 2 hours');
    });

    it('should include time requirement for 4 hours', () => {
      const action = new RelaxAction(4);

      const requirements = action.getRequirements();
      const timeReq = requirements.find((r) => r.type === 'time');

      expect(timeReq?.value).toBe(240);
      expect(timeReq?.description).toBe('Requires 4 hours');
    });

    it('should include time requirement for 8 hours', () => {
      const action = new RelaxAction(8);

      const requirements = action.getRequirements();
      const timeReq = requirements.find((r) => r.type === 'time');

      expect(timeReq?.value).toBe(480);
      expect(timeReq?.description).toBe('Requires 8 hours');
    });
  });
});
