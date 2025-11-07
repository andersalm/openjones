import { ApplyForJobAction } from './ApplyForJobAction';
import { IPlayerState, IGame, IJob } from '@shared/types/contracts';
import { createMockPlayer, createMockGame, mockJob, mockJobHighLevel } from '@shared/mocks/actionMocks';

describe('ApplyForJobAction', () => {
  let mockPlayer: IPlayerState;
  let mockGame: IGame;

  beforeEach(() => {
    mockPlayer = createMockPlayer({ currentLocation: 'employment-agency' });
    mockGame = createMockGame();
  });

  describe('canExecute', () => {
    it('should return true when player meets all requirements for entry-level job', () => {
      const action = new ApplyForJobAction(mockJob);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(true);
    });

    it('should return true when player has exact education requirement', () => {
      mockPlayer.education = 5;
      mockPlayer.career = 3;
      const action = new ApplyForJobAction(mockJobHighLevel);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(true);
    });

    it('should return true when player has more than required education', () => {
      mockPlayer.education = 10;
      mockPlayer.career = 5;
      const action = new ApplyForJobAction(mockJobHighLevel);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(true);
    });

    it('should return false when player does not have enough education', () => {
      mockPlayer.education = 3;
      const action = new ApplyForJobAction(mockJobHighLevel);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player has 0 education for job requiring education', () => {
      mockPlayer.education = 0;
      const action = new ApplyForJobAction(mockJobHighLevel);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player does not have enough career', () => {
      mockPlayer.education = 5;
      mockPlayer.career = 1;
      const action = new ApplyForJobAction(mockJobHighLevel);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player has 0 career for job requiring career', () => {
      mockPlayer.education = 5;
      mockPlayer.career = 0;
      const action = new ApplyForJobAction(mockJobHighLevel);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player is not at employment agency', () => {
      mockPlayer.currentLocation = 'store';
      const action = new ApplyForJobAction(mockJob);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player is at home', () => {
      mockPlayer.currentLocation = 'home';
      const action = new ApplyForJobAction(mockJob);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player does not have enough time', () => {
      mockPlayer.time = 10;
      const action = new ApplyForJobAction(mockJob);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return false when player has 0 time', () => {
      mockPlayer.time = 0;
      const action = new ApplyForJobAction(mockJob);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(false);
    });

    it('should return true when player has exactly enough time', () => {
      mockPlayer.time = 15;
      const action = new ApplyForJobAction(mockJob);
      expect(action.canExecute(mockPlayer, mockGame)).toBe(true);
    });
  });

  describe('execute', () => {
    it('should successfully apply for entry-level job', () => {
      const action = new ApplyForJobAction(mockJob);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(true);
      expect(result.message).toContain('You got the job');
      expect(result.message).toContain('Cashier');
      expect(result.message).toContain('$10');
      expect(result.timeCost).toBe(15);
    });

    it('should successfully apply for high-level job when qualified', () => {
      mockPlayer.education = 5;
      mockPlayer.career = 3;
      const action = new ApplyForJobAction(mockJobHighLevel);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Manager');
      expect(result.message).toContain('$25');
    });

    it('should set job in state changes', () => {
      const action = new ApplyForJobAction(mockJob);
      const result = action.execute(mockPlayer, mockGame);

      const jobChange = result.changes.find(c => c.field === 'job');
      expect(jobChange).toBeDefined();
      expect(jobChange?.newValue).toBe(mockJob);
      expect(jobChange?.description).toContain('Cashier');
    });

    it('should have time cost of 15 units', () => {
      const action = new ApplyForJobAction(mockJob);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.timeCost).toBe(15);
    });

    it('should have 1 state change (job)', () => {
      const action = new ApplyForJobAction(mockJob);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.changes).toHaveLength(1);
    });

    it('should fail when player does not have enough education', () => {
      mockPlayer.education = 3;
      const action = new ApplyForJobAction(mockJobHighLevel);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not enough education');
      expect(result.message).toContain('5');
      expect(result.message).toContain('3');
    });

    it('should fail when player does not have enough career', () => {
      mockPlayer.education = 5;
      mockPlayer.career = 1;
      const action = new ApplyForJobAction(mockJobHighLevel);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not enough career');
      expect(result.message).toContain('3');
      expect(result.message).toContain('1');
    });

    it('should fail when player is not at employment agency', () => {
      mockPlayer.currentLocation = 'store';
      const action = new ApplyForJobAction(mockJob);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Must be at Employment Agency');
    });

    it('should fail when player does not have enough time', () => {
      mockPlayer.time = 10;
      const action = new ApplyForJobAction(mockJob);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not enough time');
    });

    it('should return empty changes on failure', () => {
      mockPlayer.education = 0;
      const action = new ApplyForJobAction(mockJobHighLevel);
      const result = action.execute(mockPlayer, mockGame);

      expect(result.changes).toHaveLength(0);
    });
  });

  describe('getRequirements', () => {
    it('should include education requirement', () => {
      const action = new ApplyForJobAction(mockJobHighLevel);
      const requirements = action.getRequirements();

      const eduReq = requirements.find(r => r.type === 'measure' && r.description.includes('Education'));
      expect(eduReq).toBeDefined();
      expect(eduReq?.value).toBe(5);
    });

    it('should include career requirement', () => {
      const action = new ApplyForJobAction(mockJobHighLevel);
      const requirements = action.getRequirements();

      const careerReq = requirements.find(r => r.type === 'measure' && r.description.includes('Career'));
      expect(careerReq).toBeDefined();
      expect(careerReq?.value).toBe(3);
    });

    it('should include location requirement', () => {
      const action = new ApplyForJobAction(mockJob);
      const requirements = action.getRequirements();

      const locationReq = requirements.find(r => r.type === 'location');
      expect(locationReq).toBeDefined();
      expect(locationReq?.value).toBe('employment-agency');
      expect(locationReq?.description).toContain('Employment Agency');
    });

    it('should include time requirement', () => {
      const action = new ApplyForJobAction(mockJob);
      const requirements = action.getRequirements();

      const timeReq = requirements.find(r => r.type === 'time');
      expect(timeReq).toBeDefined();
      expect(timeReq?.value).toBe(15);
    });

    it('should have 4 requirements', () => {
      const action = new ApplyForJobAction(mockJob);
      const requirements = action.getRequirements();

      expect(requirements).toHaveLength(4);
    });

    it('should show 0 requirements for entry-level job', () => {
      const action = new ApplyForJobAction(mockJob);
      const requirements = action.getRequirements();

      const eduReq = requirements.find(r => r.description.includes('Education'));
      expect(eduReq?.value).toBe(0);
    });
  });
});
