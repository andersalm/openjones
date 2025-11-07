import { WorkAction } from './WorkAction';
import { createMockPlayer, createMockGame, createMockJob } from '@shared/mocks/actionMocks';
import { ActionType } from '@shared/types/contracts';

describe('WorkAction', () => {
  describe('constructor', () => {
    it('should create a WorkAction with correct properties', () => {
      const job = createMockJob();
      const action = new WorkAction(job, 4);

      expect(action.id).toBe('work-job-1-4h');
      expect(action.type).toBe(ActionType.WORK);
      expect(action.name).toBe('Work');
      expect(action.description).toBe('Work 4 hours at Burger Flipper');
      expect(action.timeCost).toBe(240); // 4 hours * 60 minutes
    });

    it('should calculate correct time cost for 1 hour', () => {
      const job = createMockJob();
      const action = new WorkAction(job, 1);

      expect(action.timeCost).toBe(60);
    });

    it('should calculate correct time cost for 8 hours', () => {
      const job = createMockJob();
      const action = new WorkAction(job, 8);

      expect(action.timeCost).toBe(480);
    });

    it('should include job title in description', () => {
      const job = createMockJob({ title: 'Software Engineer' });
      const action = new WorkAction(job, 2);

      expect(action.description).toContain('Software Engineer');
    });
  });

  describe('canExecute', () => {
    it('should return true when all conditions are met', () => {
      const job = createMockJob();
      const player = createMockPlayer({
        job,
        location: job.buildingId,
        time: 240,
      });
      const game = createMockGame();
      const action = new WorkAction(job, 4);

      expect(action.canExecute(player, game)).toBe(true);
    });

    it('should return false when player has no job', () => {
      const job = createMockJob();
      const player = createMockPlayer({
        job: undefined,
        location: job.buildingId,
        time: 240,
      });
      const game = createMockGame();
      const action = new WorkAction(job, 4);

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should return false when player has insufficient time', () => {
      const job = createMockJob();
      const player = createMockPlayer({
        job,
        location: job.buildingId,
        time: 30, // Less than 60 minutes needed for 1 hour work
      });
      const game = createMockGame();
      const action = new WorkAction(job, 1);

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should return false when player is not at workplace', () => {
      const job = createMockJob();
      const player = createMockPlayer({
        job,
        location: 'home', // Wrong location
        time: 240,
      });
      const game = createMockGame();
      const action = new WorkAction(job, 4);

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should return false when job does not match player job', () => {
      const playerJob = createMockJob({ id: 'job-1' });
      const actionJob = createMockJob({ id: 'job-2' });
      const player = createMockPlayer({
        job: playerJob,
        location: actionJob.buildingId,
        time: 240,
      });
      const game = createMockGame();
      const action = new WorkAction(actionJob, 4);

      expect(action.canExecute(player, game)).toBe(false);
    });

    it('should handle edge case with exactly enough time', () => {
      const job = createMockJob();
      const player = createMockPlayer({
        job,
        location: job.buildingId,
        time: 60, // Exactly 1 hour
      });
      const game = createMockGame();
      const action = new WorkAction(job, 1);

      expect(action.canExecute(player, game)).toBe(true);
    });

    it('should handle edge case with one minute less time', () => {
      const job = createMockJob();
      const player = createMockPlayer({
        job,
        location: job.buildingId,
        time: 59, // One minute less than 1 hour
      });
      const game = createMockGame();
      const action = new WorkAction(job, 1);

      expect(action.canExecute(player, game)).toBe(false);
    });
  });

  describe('execute', () => {
    it('should return failure when canExecute is false', () => {
      const job = createMockJob();
      const player = createMockPlayer({
        job: undefined, // No job
        location: job.buildingId,
        time: 240,
      });
      const game = createMockGame();
      const action = new WorkAction(job, 4);

      const result = action.execute(player, game);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Cannot work right now');
      expect(result.timeCost).toBe(0);
      expect(result.stateChanges).toBeUndefined();
    });

    it('should return success with correct earnings for 1 hour at $10/hour', () => {
      const job = createMockJob({ wage: 10 });
      const player = createMockPlayer({
        job,
        location: job.buildingId,
        time: 60,
      });
      const game = createMockGame();
      const action = new WorkAction(job, 1);

      const result = action.execute(player, game);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Worked 1 hours and earned $10');
      expect(result.timeCost).toBe(60);
      expect(result.stateChanges?.cash).toBe(10);
    });

    it('should return success with correct earnings for 4 hours at $10/hour', () => {
      const job = createMockJob({ wage: 10 });
      const player = createMockPlayer({
        job,
        location: job.buildingId,
        time: 240,
      });
      const game = createMockGame();
      const action = new WorkAction(job, 4);

      const result = action.execute(player, game);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Worked 4 hours and earned $40');
      expect(result.stateChanges?.cash).toBe(40);
    });

    it('should return success with correct earnings for 8 hours at $15/hour', () => {
      const job = createMockJob({ wage: 15 });
      const player = createMockPlayer({
        job,
        location: job.buildingId,
        time: 480,
      });
      const game = createMockGame();
      const action = new WorkAction(job, 8);

      const result = action.execute(player, game);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Worked 8 hours and earned $120');
      expect(result.stateChanges?.cash).toBe(120);
    });

    it('should deduct 2 health per hour worked', () => {
      const job = createMockJob();
      const player = createMockPlayer({
        job,
        location: job.buildingId,
        time: 240,
      });
      const game = createMockGame();
      const action = new WorkAction(job, 4);

      const result = action.execute(player, game);

      expect(result.stateChanges?.health).toBe(-8); // 4 hours * 2 health per hour
    });

    it('should gain 1 career point per hour worked', () => {
      const job = createMockJob();
      const player = createMockPlayer({
        job,
        location: job.buildingId,
        time: 240,
      });
      const game = createMockGame();
      const action = new WorkAction(job, 4);

      const result = action.execute(player, game);

      expect(result.stateChanges?.career).toBe(4); // 4 hours * 1 career per hour
    });

    it('should include all state change descriptions', () => {
      const job = createMockJob({ wage: 10 });
      const player = createMockPlayer({
        job,
        location: job.buildingId,
        time: 240,
      });
      const game = createMockGame();
      const action = new WorkAction(job, 4);

      const result = action.execute(player, game);

      expect(result.stateChanges?.descriptions).toHaveLength(3);
      expect(result.stateChanges?.descriptions[0]).toBe('Earned $40');
      expect(result.stateChanges?.descriptions[1]).toBe('Lost 8 health from work');
      expect(result.stateChanges?.descriptions[2]).toBe('Gained 4 career experience');
    });

    it('should handle working 1 hour correctly', () => {
      const job = createMockJob({ wage: 20 });
      const player = createMockPlayer({
        job,
        location: job.buildingId,
        time: 60,
      });
      const game = createMockGame();
      const action = new WorkAction(job, 1);

      const result = action.execute(player, game);

      expect(result.success).toBe(true);
      expect(result.stateChanges?.cash).toBe(20);
      expect(result.stateChanges?.health).toBe(-2);
      expect(result.stateChanges?.career).toBe(1);
    });

    it('should handle working 8 hours correctly', () => {
      const job = createMockJob({ wage: 25 });
      const player = createMockPlayer({
        job,
        location: job.buildingId,
        time: 480,
      });
      const game = createMockGame();
      const action = new WorkAction(job, 8);

      const result = action.execute(player, game);

      expect(result.success).toBe(true);
      expect(result.stateChanges?.cash).toBe(200);
      expect(result.stateChanges?.health).toBe(-16);
      expect(result.stateChanges?.career).toBe(8);
    });
  });

  describe('getRequirements', () => {
    it('should return three requirements', () => {
      const job = createMockJob();
      const action = new WorkAction(job, 4);

      const requirements = action.getRequirements();

      expect(requirements).toHaveLength(3);
    });

    it('should include job requirement', () => {
      const job = createMockJob();
      const action = new WorkAction(job, 4);

      const requirements = action.getRequirements();
      const jobReq = requirements.find((r) => r.type === 'job');

      expect(jobReq).toBeDefined();
      expect(jobReq?.description).toBe('Must have a job');
    });

    it('should include location requirement with building ID', () => {
      const job = createMockJob({ buildingId: 'office-tower', buildingName: 'Office Tower' });
      const action = new WorkAction(job, 4);

      const requirements = action.getRequirements();
      const locationReq = requirements.find((r) => r.type === 'location');

      expect(locationReq).toBeDefined();
      expect(locationReq?.value).toBe('office-tower');
      expect(locationReq?.description).toContain('Office Tower');
    });

    it('should include time requirement with correct value', () => {
      const job = createMockJob();
      const action = new WorkAction(job, 4);

      const requirements = action.getRequirements();
      const timeReq = requirements.find((r) => r.type === 'time');

      expect(timeReq).toBeDefined();
      expect(timeReq?.value).toBe(240);
      expect(timeReq?.description).toContain('4 hours');
    });

    it('should include building name in location requirement', () => {
      const job = createMockJob({ buildingName: 'Tech Corp HQ' });
      const action = new WorkAction(job, 4);

      const requirements = action.getRequirements();
      const locationReq = requirements.find((r) => r.type === 'location');

      expect(locationReq?.description).toContain('Tech Corp HQ');
    });
  });
});
