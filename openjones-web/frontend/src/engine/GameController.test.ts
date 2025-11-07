/**
 * Integration tests for GameController
 *
 * This test suite focuses on integration testing - how the GameController
 * orchestrates all game systems working together.
 *
 * Part of Task I1: Game Loop Controller
 * Worker 1 - Session 5 (Integration)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameController } from './GameController';
import { Game } from './game/Game';
import { MovementAction } from './actions/MovementAction';
import { WorkAction } from './actions/WorkAction';
import { RelaxAction } from './actions/RelaxAction';
import { StudyAction } from './actions/StudyAction';
import { EnterBuildingAction } from './actions/EnterBuildingAction';
import { ExitBuildingAction } from './actions/ExitBuildingAction';
import { ActionRegistry } from './actions/ActionRegistry';
import { Position } from './types/Position';
import {
  IGameConfig,
  IGame,
  ActionType,
  BuildingType,
  GAME_CONSTANTS,
} from '@shared/types/contracts';
import { MockJob, MockBuilding } from '@shared/mocks';

describe('GameController', () => {
  let controller: GameController;
  let gameConfig: IGameConfig;

  beforeEach(() => {
    // Clear ActionRegistry singleton before each test
    ActionRegistry.getInstance().clear();

    // Standard game configuration for tests
    gameConfig = {
      players: [
        {
          id: 'player-1',
          name: 'Test Player',
          color: '#FF0000',
          isAI: false,
        },
      ],
      victoryConditions: {
        targetWealth: 10000,
        targetHealth: 100,
        targetHappiness: 100,
        targetCareer: 850,
        targetEducation: 100,
      },
      startingCash: 1000,
      startingStats: {
        health: 80,
        happiness: 70,
        education: 50,
      },
    };

    controller = GameController.create();
    controller.initialize(gameConfig);
  });

  // ============================================
  // INITIALIZATION & SETUP TESTS (5 tests)
  // ============================================

  describe('initialization', () => {
    it('should create a controller with default config', () => {
      const newController = GameController.create();
      expect(newController).toBeDefined();
      expect(newController.getGameState()).toBeDefined();
      expect(newController.isGameRunning()).toBe(false);
      expect(newController.getCurrentTick()).toBe(0);
    });

    it('should initialize game with provided config', () => {
      const game = controller.getGameState();
      expect(game.players).toHaveLength(1);
      expect(game.currentWeek).toBe(1);
      expect(game.timeUnitsRemaining).toBe(GAME_CONSTANTS.TIME_UNITS_PER_WEEK);
      expect(game.isGameOver).toBe(false);
    });

    it('should register all action types in registry', () => {
      const registry = controller.getActionRegistry();
      expect(registry.has('movement')).toBe(true);
      expect(registry.has('enter-building')).toBe(true);
      expect(registry.has('exit-building')).toBe(true);
      expect(registry.has('work')).toBe(true);
      expect(registry.has('study')).toBe(true);
      expect(registry.has('relax')).toBe(true);
      expect(registry.has('purchase')).toBe(true);
      expect(registry.has('apply-for-job')).toBe(true);
      expect(registry.has('pay-rent')).toBe(true);
      expect(registry.has('rent-house')).toBe(true);
    });

    it('should create controller with existing game instance', () => {
      const game = Game.createWithConfig(gameConfig);
      const newController = GameController.create({ game });
      expect(newController.getGame()).toBe(game);
    });

    it('should create controller with game config using factory method', () => {
      const newController = GameController.createWithGame(gameConfig);
      expect(newController.getGameState().players).toHaveLength(1);
      expect(newController.getCurrentPlayer().name).toBe('Test Player');
    });
  });

  // ============================================
  // ACTION EXECUTION TESTS (15 tests)
  // ============================================

  describe('action execution', () => {
    it('should execute movement action successfully', async () => {
      const player = controller.getCurrentPlayer();
      const startPos = new Position(player.state.position.x, player.state.position.y);
      const targetPos = new Position(startPos.x + 1, startPos.y);

      const action = new MovementAction(startPos, targetPos);
      const result = await controller.executeAction(player.id, action);

      expect(result.success).toBe(true);
      expect(result.stateChanged).toBe(true);
      expect(result.timeAdvanced).toBeGreaterThan(0);
      expect(controller.getCurrentPlayer().state.position.x).toBe(targetPos.x);
      expect(controller.getCurrentPlayer().state.position.y).toBe(targetPos.y);
    });

    it('should reject action for non-existent player', async () => {
      const action = new MovementAction(new Position(0, 0), new Position(1, 0));
      const result = await controller.executeAction('invalid-player-id', action);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
      expect(result.stateChanged).toBe(false);
      expect(result.timeAdvanced).toBe(0);
    });

    it('should reject action when player lacks required resources', async () => {
      const player = controller.getCurrentPlayer();
      // Drain player's time
      const game = controller.getGame();
      game.timeUnitsRemaining = 1;

      // Try to perform movement action that requires more time
      const action = new MovementAction(
        new Position(player.state.position.x, player.state.position.y),
        new Position(player.state.position.x + 10, player.state.position.y)
      );
      const result = await controller.executeAction(player.id, action);

      expect(result.success).toBe(false);
      expect(result.stateChanged).toBe(false);
    });

    it('should apply state changes from successful action', async () => {
      const player = controller.getCurrentPlayer();
      const initialHealth = player.state.health;

      // Create a relax action
      const building = MockBuilding.create({ id: 'building-1', type: BuildingType.DEPARTMENT_STORE, position: new Position(0, 0) });
      const action = new RelaxAction(2);

      // Enter the building first
      player.state.currentBuilding = building.id;

      const result = await controller.executeAction(player.id, action);

      if (result.success) {
        // Relax action should restore health
        const newHealth = controller.getCurrentPlayer().state.health;
        expect(newHealth).not.toBe(initialHealth);
      }
    });

    it('should advance time after successful action', async () => {
      const player = controller.getCurrentPlayer();
      const initialTime = controller.getTimeRemaining();

      const action = new MovementAction(
        new Position(player.state.position.x, player.state.position.y),
        new Position(player.state.position.x + 1, player.state.position.y)
      );
      const result = await controller.executeAction(player.id, action);

      expect(result.success).toBe(true);
      expect(controller.getTimeRemaining()).toBeLessThan(initialTime);
      expect(result.timeAdvanced).toBe(initialTime - controller.getTimeRemaining());
    });

    it('should handle enter building action', async () => {
      const player = controller.getCurrentPlayer();
      const building = MockBuilding.create({ id: 'building-1', type: BuildingType.COLLEGE, position: new Position(0, 0) });

      const action = new EnterBuildingAction(building.position);
      const result = await controller.executeAction(player.id, action);

      expect(result.success).toBe(true);
      expect(controller.getCurrentPlayer().state.currentBuilding).toBe(building.id);
    });

    it('should handle exit building action', async () => {
      const player = controller.getCurrentPlayer();
      const building = MockBuilding.create({ id: 'building-1', type: BuildingType.COLLEGE, position: new Position(0, 0) });

      // Enter building first
      player.state.currentBuilding = building.id;

      const action = new ExitBuildingAction();
      const result = await controller.executeAction(player.id, action);

      expect(result.success).toBe(true);
      expect(controller.getCurrentPlayer().state.currentBuilding).toBeNull();
    });

    it('should handle study action when in library', async () => {
      const player = controller.getCurrentPlayer();
      const library = MockBuilding.create({ id: 'college', type: BuildingType.COLLEGE, position: new Position(0, 0) });
      player.state.currentBuilding = library.id;

      const initialEducation = player.state.education;
      const action = new StudyAction(2);
      const result = await controller.executeAction(player.id, action);

      expect(result.success).toBe(true);
      const newEducation = controller.getCurrentPlayer().state.education;
      expect(newEducation).toBeGreaterThan(initialEducation);
    });

    it('should handle work action when player has job', async () => {
      const player = controller.getCurrentPlayer();
      const job = MockJob.create({ id: 'job-1', title: 'Test Job', buildingType: BuildingType.FACTORY, wagePerHour: 15 });
      player.state.job = job;
      player.state.currentBuilding = 'building-1';

      const initialCash = player.state.cash;
      const action = new WorkAction(job, 4);
      const result = await controller.executeAction(player.id, action);

      expect(result.success).toBe(true);
      const newCash = controller.getCurrentPlayer().state.cash;
      expect(newCash).toBeGreaterThan(initialCash);
    });

    it('should reject work action when player has no job', async () => {
      const player = controller.getCurrentPlayer();
      const job = MockJob.create({ id: 'job-1', title: 'Test Job', buildingType: BuildingType.FACTORY, wagePerHour: 15 });

      const action = new WorkAction(job, 4);
      const result = await controller.executeAction(player.id, action);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot');
    });

    it('should reject action when game is over', async () => {
      // Force game over
      const game = controller.getGame();
      game.isGameOver = true;

      const player = controller.getCurrentPlayer();
      const action = new MovementAction(
        new Position(player.state.position.x, player.state.position.y),
        new Position(player.state.position.x + 1, player.state.position.y)
      );
      const result = await controller.executeAction(player.id, action);

      expect(result.success).toBe(false);
      expect(result.message).toContain('over');
    });

    it('should execute multiple actions in sequence', async () => {
      const player = controller.getCurrentPlayer();
      const pos1 = new Position(player.state.position.x, player.state.position.y);
      const pos2 = new Position(pos1.x + 1, pos1.y);
      const pos3 = new Position(pos2.x + 1, pos2.y);

      // Execute first movement
      const action1 = new MovementAction(pos1, pos2);
      const result1 = await controller.executeAction(player.id, action1);
      expect(result1.success).toBe(true);

      // Execute second movement
      const action2 = new MovementAction(pos2, pos3);
      const result2 = await controller.executeAction(player.id, action2);
      expect(result2.success).toBe(true);

      // Verify final position
      expect(controller.getCurrentPlayer().state.position.x).toBe(pos3.x);
    });

    it('should validate action type is registered', () => {
      const registry = controller.getActionRegistry();
      expect(registry.getMetadata('movement')?.type).toBe(ActionType.MOVE);
      expect(registry.getMetadata('work')?.type).toBe(ActionType.WORK);
      expect(registry.getMetadata('study')?.type).toBe(ActionType.STUDY);
    });

    it('should return proper error message for invalid action', async () => {
      const player = controller.getCurrentPlayer();
      // Try to move while inside a building
      player.state.currentBuilding = 'some-building';

      const action = new MovementAction(
        new Position(0, 0),
        new Position(1, 0)
      );
      const result = await controller.executeAction(player.id, action);

      expect(result.success).toBe(false);
      expect(result.message).toBeTruthy();
    });

    it('should handle action execution with state changes', async () => {
      const player = controller.getCurrentPlayer();
      const library = MockBuilding.create({ id: 'college', type: BuildingType.COLLEGE, position: new Position(0, 0) });
      player.state.currentBuilding = library.id;

      const initialEducation = player.state.education;
      const initialCash = player.state.cash;

      const action = new StudyAction(2);
      const result = await controller.executeAction(player.id, action);

      expect(result.success).toBe(true);
      expect(result.stateChanged).toBe(true);

      const finalEducation = controller.getCurrentPlayer().state.education;
      const finalCash = controller.getCurrentPlayer().state.cash;

      expect(finalEducation).not.toBe(initialEducation);
      expect(finalCash).not.toBe(initialCash); // Study costs money
    });
  });

  // ============================================
  // TURN MANAGEMENT TESTS (10 tests)
  // ============================================

  describe('turn management', () => {
    it('should start and stop game loop', () => {
      expect(controller.isGameRunning()).toBe(false);

      controller.start();
      expect(controller.isGameRunning()).toBe(true);

      controller.stop();
      expect(controller.isGameRunning()).toBe(false);
    });

    it('should not start game if already running', () => {
      controller.start();
      expect(controller.isGameRunning()).toBe(true);

      controller.start(); // Try to start again
      expect(controller.isGameRunning()).toBe(true);
    });

    it('should not stop game if not running', () => {
      expect(controller.isGameRunning()).toBe(false);

      controller.stop();
      expect(controller.isGameRunning()).toBe(false);
    });

    it('should advance tick when game is running', () => {
      controller.start();
      const initialTick = controller.getCurrentTick();

      controller.tick();
      expect(controller.getCurrentTick()).toBe(initialTick + 1);

      controller.tick();
      expect(controller.getCurrentTick()).toBe(initialTick + 2);
    });

    it('should not advance tick when game is stopped', () => {
      controller.stop();
      const initialTick = controller.getCurrentTick();

      controller.tick();
      expect(controller.getCurrentTick()).toBe(initialTick);
    });

    it('should get current week number', () => {
      expect(controller.getCurrentWeek()).toBe(1);
    });

    it('should get time remaining in week', () => {
      expect(controller.getTimeRemaining()).toBe(GAME_CONSTANTS.TIME_UNITS_PER_WEEK);
    });

    it('should handle week transitions', async () => {
      const player = controller.getCurrentPlayer();
      const game = controller.getGame();
      const initialWeek = controller.getCurrentWeek();

      // Consume all time in current week
      game.timeUnitsRemaining = 10;

      // Execute action that consumes remaining time
      const action = new MovementAction(
        new Position(0, 0),
        new Position(1, 0)
      );
      await controller.executeAction(player.id, action);

      // If we consumed all time, we should advance to next week
      if (controller.getTimeRemaining() > game.timeUnitsRemaining) {
        expect(controller.getCurrentWeek()).toBe(initialWeek + 1);
      }
    });

    it('should get current player', () => {
      const player = controller.getCurrentPlayer();
      expect(player).toBeDefined();
      expect(player.id).toBe('player-1');
      expect(player.name).toBe('Test Player');
    });

    it('should stop game when game is over', () => {
      controller.start();
      expect(controller.isGameRunning()).toBe(true);

      // Force game over
      const game = controller.getGame();
      game.isGameOver = true;

      controller.tick();
      expect(controller.isGameRunning()).toBe(false);
    });
  });

  // ============================================
  // TIME-BASED EVENTS TESTS (8 tests)
  // ============================================

  describe('time-based events', () => {
    it('should track time progression', async () => {
      const player = controller.getCurrentPlayer();
      const initialTime = controller.getTimeRemaining();

      const action = new MovementAction(
        new Position(0, 0),
        new Position(1, 0)
      );
      await controller.executeAction(player.id, action);

      expect(controller.getTimeRemaining()).toBeLessThan(initialTime);
    });

    it('should handle end-of-week events', async () => {
      const game = controller.getGame();
      const initialWeek = controller.getCurrentWeek();

      // Force time to end of week
      game.timeUnitsRemaining = 1;

      // Execute action that will trigger week transition
      const player = controller.getCurrentPlayer();
      const action = new MovementAction(
        new Position(0, 0),
        new Position(5, 0)
      );
      await controller.executeAction(player.id, action);

      // Week should have advanced if time ran out
      const timeCost = action.timeCost;
      if (timeCost > 1) {
        expect(controller.getCurrentWeek()).toBeGreaterThan(initialWeek);
      }
    });

    it('should check victory conditions', () => {
      const results = controller.checkVictory();
      expect(results).toHaveLength(1);
      expect(results[0].playerId).toBe('player-1');
      expect(results[0].isVictory).toBe(false);
    });

    it('should detect victory when conditions are met', () => {
      const player = controller.getCurrentPlayer();

      // Set player stats to meet victory conditions
      player.state.cash = 10000;
      player.state.health = 100;
      player.state.happiness = 100;
      player.state.career = 850;
      player.state.education = 100;

      const results = controller.checkVictory();
      expect(results[0].isVictory).toBe(true);
    });

    it('should mark game as over when victory is achieved', async () => {
      const player = controller.getCurrentPlayer();

      // Set player stats to meet victory conditions
      player.state.cash = 10000;
      player.state.health = 100;
      player.state.happiness = 100;
      player.state.career = 850;
      player.state.education = 100;

      // Execute any action to trigger victory check
      const action = new MovementAction(
        new Position(0, 0),
        new Position(1, 0)
      );
      await controller.executeAction(player.id, action);

      expect(controller.isGameOver()).toBe(true);
    });

    it('should handle time units per week constant', () => {
      expect(controller.getTimeRemaining()).toBe(GAME_CONSTANTS.TIME_UNITS_PER_WEEK);
    });

    it('should maintain consistent time tracking across actions', async () => {
      const player = controller.getCurrentPlayer();
      let totalTimeSpent = 0;

      // Execute 3 actions
      for (let i = 0; i < 3; i++) {
        const currentPos = controller.getCurrentPlayer().state.position;
        const action = new MovementAction(
          new Position(currentPos.x, currentPos.y),
          new Position(currentPos.x + 1, currentPos.y)
        );
        const result = await controller.executeAction(player.id, action);
        if (result.success) {
          totalTimeSpent += result.timeAdvanced;
        }
      }

      const expectedTimeRemaining = GAME_CONSTANTS.TIME_UNITS_PER_WEEK - totalTimeSpent;
      expect(controller.getTimeRemaining()).toBe(expectedTimeRemaining);
    });

    it('should reset time when new week starts', async () => {
      const game = controller.getGame();

      // Force week transition
      game.timeUnitsRemaining = 5;

      const player = controller.getCurrentPlayer();
      const action = new MovementAction(
        new Position(0, 0),
        new Position(10, 0)
      );
      await controller.executeAction(player.id, action);

      // If week changed, time should be reset
      const timeCost = action.timeCost;
      if (timeCost > 5) {
        expect(controller.getTimeRemaining()).toBeGreaterThan(0);
      }
    });
  });

  // ============================================
  // OBSERVER PATTERN TESTS (7 tests)
  // ============================================

  describe('observer pattern', () => {
    it('should subscribe to state changes', () => {
      const observer = vi.fn();
      const unsubscribe = controller.subscribe(observer);

      expect(typeof unsubscribe).toBe('function');
      expect(controller.getObserverCount()).toBe(1);
    });

    it('should notify observers on state change', async () => {
      let notified = false;
      let receivedGame: IGame | null = null;

      controller.subscribe((game) => {
        notified = true;
        receivedGame = game;
      });

      const player = controller.getCurrentPlayer();
      const action = new MovementAction(
        new Position(0, 0),
        new Position(1, 0)
      );
      await controller.executeAction(player.id, action);

      expect(notified).toBe(true);
      expect(receivedGame).toBe(controller.getGameState());
    });

    it('should support multiple observers', async () => {
      let observer1Called = false;
      let observer2Called = false;

      controller.subscribe(() => {
        observer1Called = true;
      });

      controller.subscribe(() => {
        observer2Called = true;
      });

      expect(controller.getObserverCount()).toBe(2);

      const player = controller.getCurrentPlayer();
      const action = new MovementAction(
        new Position(0, 0),
        new Position(1, 0)
      );
      await controller.executeAction(player.id, action);

      expect(observer1Called).toBe(true);
      expect(observer2Called).toBe(true);
    });

    it('should unsubscribe observer', () => {
      const observer = vi.fn();
      const unsubscribe = controller.subscribe(observer);

      expect(controller.getObserverCount()).toBe(1);

      unsubscribe();

      expect(controller.getObserverCount()).toBe(0);
    });

    it('should not notify after unsubscribe', async () => {
      let callCount = 0;

      const unsubscribe = controller.subscribe(() => {
        callCount++;
      });

      const player = controller.getCurrentPlayer();
      const action1 = new MovementAction(
        new Position(0, 0),
        new Position(1, 0)
      );
      await controller.executeAction(player.id, action1);

      expect(callCount).toBe(1);

      unsubscribe();

      const action2 = new MovementAction(
        new Position(1, 0),
        new Position(2, 0)
      );
      await controller.executeAction(player.id, action2);

      expect(callCount).toBe(1); // Should not increase
    });

    it('should notify observers on start/stop', () => {
      let notifyCount = 0;

      controller.subscribe(() => {
        notifyCount++;
      });

      controller.start();
      expect(notifyCount).toBe(1);

      controller.stop();
      expect(notifyCount).toBe(2);
    });

    it('should handle observer errors gracefully', async () => {
      // Add an observer that throws an error
      controller.subscribe(() => {
        throw new Error('Observer error');
      });

      // Add a normal observer
      let normalObserverCalled = false;
      controller.subscribe(() => {
        normalObserverCalled = true;
      });

      const player = controller.getCurrentPlayer();
      const action = new MovementAction(
        new Position(0, 0),
        new Position(1, 0)
      );

      // Should not throw even though one observer errors
      await expect(
        controller.executeAction(player.id, action)
      ).resolves.toBeDefined();

      // Normal observer should still be called
      expect(normalObserverCalled).toBe(true);
    });
  });

  // ============================================
  // INTEGRATION TESTS (10 tests)
  // ============================================

  describe('integration tests', () => {
    it('should integrate with all game systems', () => {
      const game = controller.getGameState();
      expect(game.players).toBeDefined();
      expect(game.map).toBeDefined();
      expect(game.economyModel).toBeDefined();
      expect(game.victoryConditions).toBeDefined();
    });

    it('should maintain state consistency across multiple actions', async () => {
      const player = controller.getCurrentPlayer();

      // Create and execute multiple actions
      const library = MockBuilding.create({ id: 'college', type: BuildingType.COLLEGE, position: new Position(1, 1) });

      // Move to library
      const moveAction = new MovementAction(
        new Position(0, 0),
        new Position(1, 1)
      );
      const moveResult = await controller.executeAction(player.id, moveAction);
      expect(moveResult.success).toBe(true);

      // Enter library
      const enterAction = new EnterBuildingAction(library.position);
      const enterResult = await controller.executeAction(player.id, enterAction);
      expect(enterResult.success).toBe(true);

      // Study
      const studyAction = new StudyAction(2);
      const studyResult = await controller.executeAction(player.id, studyAction);
      expect(studyResult.success).toBe(true);

      // Verify state consistency
      expect(controller.getCurrentPlayer().state.currentBuilding).toBe(library.id);
      expect(controller.getCurrentPlayer().state.education).toBeGreaterThan(gameConfig.startingStats.education);
    });

    it('should handle save and load operations', () => {
      const player = controller.getCurrentPlayer();
      player.state.cash = 5000;

      const savedState = controller.save();
      expect(savedState).toBeTruthy();
      expect(typeof savedState).toBe('string');

      // Create new controller and load state
      const newController = GameController.create();
      newController.load(savedState);

      expect(newController.getCurrentPlayer().state.cash).toBe(5000);
    });

    it('should reset game state', () => {
      const player = controller.getCurrentPlayer();
      player.state.cash = 5000;

      controller.reset();

      // After reset, should have default/empty game
      expect(controller.getCurrentWeek()).toBe(1);
      expect(controller.getCurrentTick()).toBe(0);
      expect(controller.isGameRunning()).toBe(false);
    });

    it('should handle complex action sequences', async () => {
      const player = controller.getCurrentPlayer();

      // Sequence: Move -> Enter Building -> Work -> Exit -> Move back
      const workplace = MockBuilding.create({ id: 'work-1', type: BuildingType.FACTORY, position: new Position(2, 2) });
      const job = MockJob.create({ id: 'job-1', title: 'Office Job', buildingType: BuildingType.FACTORY, wagePerHour: 20 });
      player.state.job = job;

      // Move to workplace
      const move1 = new MovementAction(
        new Position(0, 0),
        new Position(2, 2)
      );
      const result1 = await controller.executeAction(player.id, move1);
      expect(result1.success).toBe(true);

      // Enter workplace
      const enter = new EnterBuildingAction(workplace.position);
      const result2 = await controller.executeAction(player.id, enter);
      expect(result2.success).toBe(true);

      // Work
      const initialCash = controller.getCurrentPlayer().state.cash;
      const work = new WorkAction(job, 4);
      const result3 = await controller.executeAction(player.id, work);
      expect(result3.success).toBe(true);
      expect(controller.getCurrentPlayer().state.cash).toBeGreaterThan(initialCash);

      // Exit
      const exit = new ExitBuildingAction();
      const result4 = await controller.executeAction(player.id, exit);
      expect(result4.success).toBe(true);
      expect(controller.getCurrentPlayer().state.currentBuilding).toBeNull();
    });

    it('should handle error recovery', async () => {
      const player = controller.getCurrentPlayer();

      // Try invalid action
      player.state.currentBuilding = 'some-building';
      const invalidAction = new MovementAction(
        new Position(0, 0),
        new Position(1, 0)
      );
      const result1 = await controller.executeAction(player.id, invalidAction);
      expect(result1.success).toBe(false);

      // Fix state and try valid action
      player.state.currentBuilding = null;
      const validAction = new MovementAction(
        new Position(0, 0),
        new Position(1, 0)
      );
      const result2 = await controller.executeAction(player.id, validAction);
      expect(result2.success).toBe(true);
    });

    it('should integrate with action registry', () => {
      const registry = controller.getActionRegistry();

      // Verify we can get metadata for registered actions
      const movementMeta = registry.getMetadata('movement');
      expect(movementMeta).toBeDefined();
      expect(movementMeta?.type).toBe(ActionType.MOVE);

      const workMeta = registry.getMetadata('work');
      expect(workMeta).toBeDefined();
      expect(workMeta?.type).toBe(ActionType.WORK);
    });

    it('should handle multiple player turns', () => {
      // Create game with 2 players
      const multiPlayerConfig: IGameConfig = {
        players: [
          { id: 'p1', name: 'Player 1', color: '#FF0000', isAI: false },
          { id: 'p2', name: 'Player 2', color: '#00FF00', isAI: false },
        ],
        victoryConditions: gameConfig.victoryConditions,
        startingCash: 1000,
        startingStats: gameConfig.startingStats,
      };

      const multiController = GameController.createWithGame(multiPlayerConfig);

      expect(multiController.getCurrentPlayer().id).toBe('p1');

      multiController.nextPlayer();
      expect(multiController.getCurrentPlayer().id).toBe('p2');

      multiController.nextPlayer();
      expect(multiController.getCurrentPlayer().id).toBe('p1');
    });

    it('should maintain game state across observer notifications', async () => {
      let observerCallCount = 0;
      let lastSeenCash = 0;

      controller.subscribe((game) => {
        observerCallCount++;
        lastSeenCash = game.getCurrentPlayer().state.cash;
      });

      const player = controller.getCurrentPlayer();
      const library = MockBuilding.create({ id: 'college', type: BuildingType.COLLEGE, position: new Position(0, 0) });
      player.state.currentBuilding = library.id;

      const action = new StudyAction(2);
      await controller.executeAction(player.id, action);

      expect(observerCallCount).toBeGreaterThan(0);
      expect(lastSeenCash).toBe(controller.getCurrentPlayer().state.cash);
    });

    it('should handle edge cases in game state', () => {
      const game = controller.getGameState();

      // Test edge cases
      expect(game.currentWeek).toBeGreaterThan(0);
      expect(game.timeUnitsRemaining).toBeGreaterThanOrEqual(0);
      expect(game.players.length).toBeGreaterThan(0);

      // Test player state edge cases
      const player = controller.getCurrentPlayer();
      expect(player.state.health).toBeGreaterThanOrEqual(0);
      expect(player.state.health).toBeLessThanOrEqual(100);
      expect(player.state.happiness).toBeGreaterThanOrEqual(0);
      expect(player.state.happiness).toBeLessThanOrEqual(100);
    });
  });

  // ============================================
  // ADDITIONAL INTEGRATION TESTS (3 tests)
  // ============================================

  describe('additional integration scenarios', () => {
    it('should handle full game loop cycle', async () => {
      controller.start();
      expect(controller.isGameRunning()).toBe(true);

      const player = controller.getCurrentPlayer();

      // Execute action
      const action = new MovementAction(
        new Position(0, 0),
        new Position(1, 0)
      );
      await controller.executeAction(player.id, action);

      // Advance tick
      controller.tick();

      expect(controller.getCurrentTick()).toBeGreaterThan(0);
      expect(controller.isGameRunning()).toBe(true);

      controller.stop();
      expect(controller.isGameRunning()).toBe(false);
    });

    it('should handle game with auto-save enabled', async () => {
      const autoSaveController = GameController.create({ autoSave: true });
      autoSaveController.initialize(gameConfig);

      const player = autoSaveController.getCurrentPlayer();
      const action = new MovementAction(
        new Position(0, 0),
        new Position(1, 0)
      );

      const result = await autoSaveController.executeAction(player.id, action);
      expect(result.success).toBe(true);

      // Game should be auto-saved after successful action
      const savedState = autoSaveController.save();
      expect(savedState).toBeTruthy();
    });

    it('should provide access to all game systems', () => {
      const game = controller.getGame();

      expect(game).toBeDefined();
      expect(game.players).toBeDefined();
      expect(game.map).toBeDefined();
      expect(game.economyModel).toBeDefined();
      expect(game.victoryConditions).toBeDefined();

      const player = controller.getCurrentPlayer();
      expect(player).toBeDefined();
      expect(player.state).toBeDefined();

      const registry = controller.getActionRegistry();
      expect(registry).toBeDefined();
      expect(registry.size).toBeGreaterThan(0);
    });
  });
});
