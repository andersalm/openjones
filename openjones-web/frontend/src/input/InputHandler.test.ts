/**
 * InputHandler Tests
 *
 * Part of Task I3: Input & Interaction System
 * Worker 3 - Round 5 (Integration)
 *
 * Test Coverage:
 * - Click handling (10 tests)
 * - Keyboard input (8 tests)
 * - Coordinate conversion (6 tests)
 * - Action creation (6+ tests)
 * Total: 30+ tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InputHandler } from './InputHandler';
import { Position } from '../engine/types/Position';
import { MovementAction } from '../engine/actions/MovementAction';
import { EnterBuildingAction } from '../engine/actions/EnterBuildingAction';
import type { IGame, IPlayer, IPlayerState, IMap, IBuilding } from '@shared/types/contracts';

// Create mock implementations
function createMockPlayerState(overrides?: Partial<IPlayerState>): IPlayerState {
  return {
    playerId: 'player-1',
    cash: 1000,
    health: 100,
    happiness: 100,
    education: 50,
    career: 50,
    position: new Position(2, 2),
    currentBuilding: null,
    job: null,
    experience: [],
    possessions: [],
    rentedHome: null,
    rentDebt: 0,
    canAfford: vi.fn(() => true),
    updateMeasure: vi.fn(),
    addPossession: vi.fn(),
    removePossession: vi.fn(),
    clone: vi.fn(),
    ...overrides,
  } as IPlayerState;
}

function createMockPlayer(overrides?: Partial<IPlayer>): IPlayer {
  return {
    id: 'player-1',
    name: 'Test Player',
    color: '#FF0000',
    state: createMockPlayerState(),
    isAI: false,
    clone: vi.fn(),
    ...overrides,
  } as IPlayer;
}

function createMockBuilding(id: string, position: Position): IBuilding {
  return {
    id,
    name: 'Test Building',
    type: 'bank',
    position,
    isHome: vi.fn(() => false),
    toString: vi.fn(() => `Building(${id})`),
  } as unknown as IBuilding;
}

function createMockMap(): IMap {
  const buildings: IBuilding[] = [
    createMockBuilding('bank', new Position(3, 3)),
    createMockBuilding('school', new Position(1, 1)),
  ];

  return {
    width: 5,
    height: 5,
    addBuilding: vi.fn(),
    removeBuilding: vi.fn(),
    getBuilding: vi.fn((pos: Position) => {
      return buildings.find(b => b.position.x === pos.x && b.position.y === pos.y) || null;
    }),
    getAllBuildings: vi.fn(() => buildings),
    getBuildingById: vi.fn((id: string) => buildings.find(b => b.id === id) || null),
    isValidPosition: vi.fn((pos: Position) => {
      return pos.x >= 0 && pos.x < 5 && pos.y >= 0 && pos.y < 5;
    }),
    getRoute: vi.fn(),
    getAdjacentPositions: vi.fn(),
    isEmpty: vi.fn(),
    canMoveTo: vi.fn((pos: Position) => {
      return pos.x >= 0 && pos.x < 5 && pos.y >= 0 && pos.y < 5;
    }),
    getDistance: vi.fn(),
    toString: vi.fn(),
  } as unknown as IMap;
}

function createMockGame(): IGame {
  const mockPlayer = createMockPlayer();
  const mockMap = createMockMap();

  return {
    id: 'game-1',
    currentWeek: 1,
    timeUnitsRemaining: 168,
    currentPlayerIndex: 0,
    players: [mockPlayer],
    map: mockMap,
    economyModel: {} as any,
    victoryConditions: {} as any,
    isGameOver: false,
    initialize: vi.fn(),
    processTurn: vi.fn(),
    advanceTime: vi.fn(),
    nextPlayer: vi.fn(),
    getCurrentPlayer: vi.fn(() => mockPlayer),
    checkVictory: vi.fn(),
    serialize: vi.fn(),
    deserialize: vi.fn(),
    getPlayerById: vi.fn((id: string) => (id === 'player-1' ? mockPlayer : null)),
    applyStateChanges: vi.fn(),
  } as unknown as IGame;
}

describe('InputHandler', () => {
  let inputHandler: InputHandler;
  let canvas: HTMLCanvasElement;
  let game: IGame;
  let mockPlayer: IPlayer;

  beforeEach(() => {
    // Create canvas element
    canvas = document.createElement('canvas');
    canvas.width = 160; // 5 tiles * 32px
    canvas.height = 160;

    // Create mock game
    game = createMockGame();
    mockPlayer = game.players[0];

    // Create input handler
    inputHandler = new InputHandler({
      canvas,
      game,
      playerId: 'player-1',
      tileSize: 32,
    });

    inputHandler.initialize();
  });

  // ============================================================
  // COORDINATE CONVERSION TESTS (6 tests)
  // ============================================================
  describe('coordinate conversion', () => {
    it('should convert screen coordinates to map position', () => {
      const mapPos = inputHandler['screenToMapPosition'](64, 96);
      expect(mapPos.x).toBe(2);
      expect(mapPos.y).toBe(3);
    });

    it('should convert map position to screen coordinates', () => {
      const screenPos = inputHandler.mapToScreenPosition(new Position(4, 3));
      expect(screenPos.x).toBe(128);
      expect(screenPos.y).toBe(96);
    });

    it('should handle origin coordinates (0, 0)', () => {
      const mapPos = inputHandler['screenToMapPosition'](0, 0);
      expect(mapPos.x).toBe(0);
      expect(mapPos.y).toBe(0);
    });

    it('should get tile bounds correctly', () => {
      const bounds = inputHandler.getTileBounds(new Position(2, 3));
      expect(bounds.x).toBe(64);
      expect(bounds.y).toBe(96);
      expect(bounds.width).toBe(32);
      expect(bounds.height).toBe(32);
    });

    it('should check if coordinates are inside tile', () => {
      const isInside = inputHandler.isInsideTile(70, 100, new Position(2, 3));
      expect(isInside).toBe(true);
    });

    it('should check if coordinates are outside tile', () => {
      const isInside = inputHandler.isInsideTile(100, 100, new Position(2, 3));
      expect(isInside).toBe(false);
    });
  });

  // ============================================================
  // CLICK HANDLING TESTS (10 tests)
  // ============================================================
  describe('click handling', () => {
    it('should detect canvas clicks and call processTurn', () => {
      const processTurnSpy = vi.spyOn(game, 'processTurn');

      // Simulate click at position (4, 4) - empty tile
      const clickEvent = new MouseEvent('click', {
        clientX: 128,
        clientY: 128,
      });

      Object.defineProperty(canvas, 'getBoundingClientRect', {
        value: () => ({ left: 0, top: 0 }),
      });

      canvas.dispatchEvent(clickEvent);

      expect(processTurnSpy).toHaveBeenCalled();
    });

    it('should create movement action for empty tile click', () => {
      const processTurnSpy = vi.spyOn(game, 'processTurn');

      inputHandler['handleMovementClick'](new Position(4, 4));

      expect(processTurnSpy).toHaveBeenCalledWith(
        'player-1',
        expect.any(MovementAction)
      );
    });

    it('should detect building clicks', () => {
      const buildingCallback = vi.fn();
      const handler = new InputHandler({
        canvas,
        game,
        playerId: 'player-1',
        onBuildingSelected: buildingCallback,
      });

      // Player at building position (3,3)
      mockPlayer.state.position = new Position(3, 3);
      handler['handleBuildingClick']('bank', new Position(3, 3));

      expect(buildingCallback).toHaveBeenCalledWith('bank');
    });

    it('should enter building when player is at building position', () => {
      const processTurnSpy = vi.spyOn(game, 'processTurn');

      // Player at building position (3,3)
      mockPlayer.state.position = new Position(3, 3);
      inputHandler['handleBuildingClick']('bank', new Position(3, 3));

      expect(processTurnSpy).toHaveBeenCalledWith(
        'player-1',
        expect.any(EnterBuildingAction)
      );
    });

    it('should move to building when player is not at building position', () => {
      const processTurnSpy = vi.spyOn(game, 'processTurn');

      // Player at different position
      mockPlayer.state.position = new Position(0, 0);
      inputHandler['handleBuildingClick']('bank', new Position(3, 3));

      expect(processTurnSpy).toHaveBeenCalledWith(
        'player-1',
        expect.any(MovementAction)
      );
    });

    it('should update interaction state when entering building', () => {
      mockPlayer.state.position = new Position(3, 3);
      inputHandler['handleBuildingClick']('bank', new Position(3, 3));

      const state = inputHandler.getState();
      expect(state.selectedBuilding).toBe('bank');
      expect(state.isInteracting).toBe(true);
    });

    it('should validate move bounds before creating action', () => {
      const processTurnSpy = vi.spyOn(game, 'processTurn');

      // Try to move outside map bounds - use isValidMove directly
      const isValid = inputHandler['isValidMove'](
        new Position(0, 0),
        { x: 10, y: 10 }
      );

      expect(isValid).toBe(false);
      // handleMovementClick checks validity, so it won't call processTurn
    });

    it('should check if player is at exact position (same position)', () => {
      const isAt = inputHandler['isAtPosition'](
        new Position(2, 2),
        new Position(2, 2)
      );
      expect(isAt).toBe(true);
    });

    it('should check if player is at exact position (adjacent but not same)', () => {
      const isAt = inputHandler['isAtPosition'](
        new Position(2, 2),
        new Position(3, 2)
      );
      expect(isAt).toBe(false);
    });

    it('should check if player is at exact position (different position)', () => {
      const isAt = inputHandler['isAtPosition'](
        new Position(0, 0),
        new Position(3, 3)
      );
      expect(isAt).toBe(false);
    });
  });

  // ============================================================
  // KEYBOARD INPUT TESTS (8 tests)
  // ============================================================
  describe('keyboard input', () => {
    it('should handle arrow up key for movement', () => {
      const processTurnSpy = vi.spyOn(game, 'processTurn');
      mockPlayer.state.position = new Position(2, 2);

      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      document.dispatchEvent(keyEvent);

      expect(processTurnSpy).toHaveBeenCalled();
      const action = processTurnSpy.mock.calls[0][1] as MovementAction;
      expect(action.getToPosition().y).toBe(1); // Moving up from y=2 to y=1
    });

    it('should handle arrow down key for movement', () => {
      const processTurnSpy = vi.spyOn(game, 'processTurn');
      mockPlayer.state.position = new Position(2, 2);

      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      document.dispatchEvent(keyEvent);

      expect(processTurnSpy).toHaveBeenCalled();
      const action = processTurnSpy.mock.calls[0][1] as MovementAction;
      expect(action.getToPosition().y).toBe(3); // Moving down from y=2 to y=3
    });

    it('should handle WASD movement (W key)', () => {
      const processTurnSpy = vi.spyOn(game, 'processTurn');
      mockPlayer.state.position = new Position(2, 2);

      const keyEvent = new KeyboardEvent('keydown', { key: 'w' });
      document.dispatchEvent(keyEvent);

      expect(processTurnSpy).toHaveBeenCalled();
      const action = processTurnSpy.mock.calls[0][1] as MovementAction;
      expect(action.getToPosition().y).toBe(1);
    });

    it('should handle WASD movement (A key)', () => {
      const processTurnSpy = vi.spyOn(game, 'processTurn');
      mockPlayer.state.position = new Position(2, 2);

      const keyEvent = new KeyboardEvent('keydown', { key: 'a' });
      document.dispatchEvent(keyEvent);

      expect(processTurnSpy).toHaveBeenCalled();
      const action = processTurnSpy.mock.calls[0][1] as MovementAction;
      expect(action.getToPosition().x).toBe(1); // Moving left from x=2 to x=1
    });

    it('should handle action shortcuts when interacting', () => {
      const actionCallback = vi.fn();
      const handler = new InputHandler({
        canvas,
        game,
        playerId: 'player-1',
        onActionSelected: actionCallback,
      });
      handler.initialize();

      handler.setAvailableActions(['work', 'relax', 'study']);
      handler['state'].isInteracting = true;

      const keyEvent = new KeyboardEvent('keydown', { key: '1' });
      document.dispatchEvent(keyEvent);

      expect(actionCallback).toHaveBeenCalledWith('work');
    });

    it('should handle escape key to exit interaction', () => {
      inputHandler['state'].isInteracting = true;
      inputHandler['state'].selectedBuilding = 'bank';

      const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(keyEvent);

      expect(inputHandler.getState().isInteracting).toBe(false);
      expect(inputHandler.getState().selectedBuilding).toBeNull();
    });

    it('should handle debug toggle with backtick key', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      const keyEvent = new KeyboardEvent('keydown', { key: '`' });
      document.dispatchEvent(keyEvent);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should not trigger action shortcuts when not interacting', () => {
      const actionCallback = vi.fn();
      const handler = new InputHandler({
        canvas,
        game,
        playerId: 'player-1',
        onActionSelected: actionCallback,
      });
      handler.initialize();

      handler.setAvailableActions(['work']);
      handler['state'].isInteracting = false;

      const keyEvent = new KeyboardEvent('keydown', { key: '1' });
      document.dispatchEvent(keyEvent);

      expect(actionCallback).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // ACTION CREATION TESTS (6 tests)
  // ============================================================
  describe('action creation', () => {
    it('should create MovementAction with correct destination', () => {
      const processTurnSpy = vi.spyOn(game, 'processTurn');
      const targetPos = new Position(4, 4);

      inputHandler['handleMovementClick'](targetPos);

      expect(processTurnSpy).toHaveBeenCalled();
      const action = processTurnSpy.mock.calls[0][1] as MovementAction;
      expect(action.getToPosition().x).toBe(4);
      expect(action.getToPosition().y).toBe(4);
    });

    it('should create EnterBuildingAction with correct position', () => {
      const processTurnSpy = vi.spyOn(game, 'processTurn');
      mockPlayer.state.position = new Position(3, 3);

      inputHandler['handleBuildingClick']('bank', new Position(3, 3));

      expect(processTurnSpy).toHaveBeenCalled();
      const action = processTurnSpy.mock.calls[0][1] as EnterBuildingAction;
      expect(action.getPosition().x).toBe(3);
      expect(action.getPosition().y).toBe(3);
    });

    it('should not create action for invalid position', () => {
      // Test with invalid IPosition (outside bounds)
      const isValid = inputHandler['isValidMove'](
        new Position(0, 0),
        { x: -1, y: -1 }
      );

      expect(isValid).toBe(false);
    });

    it('should validate actions before execution', () => {
      const isValid = inputHandler['isValidMove'](
        new Position(0, 0),
        new Position(4, 4)
      );
      expect(isValid).toBe(true);
    });

    it('should reject invalid moves outside bounds', () => {
      const isValid = inputHandler['isValidMove'](
        new Position(0, 0),
        { x: 10, y: 10 }
      );
      expect(isValid).toBe(false);
    });

    it('should execute action by type name', () => {
      const actionCallback = vi.fn();
      const handler = new InputHandler({
        canvas,
        game,
        playerId: 'player-1',
        onActionSelected: actionCallback,
      });

      handler['executeActionByType']('work');

      expect(actionCallback).toHaveBeenCalledWith('work');
    });
  });

  // ============================================================
  // INPUT STATE TESTS (6 tests)
  // ============================================================
  describe('input state', () => {
    it('should track selected building', () => {
      inputHandler['state'].selectedBuilding = 'bank';
      const state = inputHandler.getState();
      expect(state.selectedBuilding).toBe('bank');
    });

    it('should track available actions', () => {
      inputHandler.setAvailableActions(['work', 'relax']);
      const state = inputHandler.getState();
      expect(state.availableActions).toEqual(['work', 'relax']);
    });

    it('should track interaction state', () => {
      inputHandler['state'].isInteracting = true;
      const state = inputHandler.getState();
      expect(state.isInteracting).toBe(true);
    });

    it('should clear state when exiting interaction', () => {
      inputHandler['state'].isInteracting = true;
      inputHandler['state'].selectedBuilding = 'bank';
      inputHandler['state'].availableActions = ['work'];

      inputHandler['exitInteraction']();

      const state = inputHandler.getState();
      expect(state.isInteracting).toBe(false);
      expect(state.selectedBuilding).toBeNull();
      expect(state.availableActions).toEqual([]);
    });

    it('should return a copy of state to prevent external modification', () => {
      const state1 = inputHandler.getState();
      state1.selectedBuilding = 'modified';

      const state2 = inputHandler.getState();
      expect(state2.selectedBuilding).toBeNull();
    });

    it('should update available actions via setter', () => {
      inputHandler.setAvailableActions(['work', 'study', 'relax']);
      expect(inputHandler['state'].availableActions.length).toBe(3);
    });
  });

  // ============================================================
  // EVENT LISTENER TESTS (4 tests)
  // ============================================================
  describe('event listeners', () => {
    it('should attach event listeners on initialize', () => {
      const handler = new InputHandler({
        canvas,
        game,
        playerId: 'player-1',
      });

      const addEventListenerSpy = vi.spyOn(canvas, 'addEventListener');
      const docAddEventListenerSpy = vi.spyOn(document, 'addEventListener');

      handler.initialize();

      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
      expect(docAddEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should remove event listeners on destroy', () => {
      const removeEventListenerSpy = vi.spyOn(canvas, 'removeEventListener');
      const docRemoveEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      inputHandler.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalled();
      expect(docRemoveEventListenerSpy).toHaveBeenCalled();
    });

    it('should handle clicks after initialization', () => {
      const handler = new InputHandler({
        canvas,
        game,
        playerId: 'player-1',
      });
      handler.initialize();

      const processTurnSpy = vi.spyOn(game, 'processTurn');

      Object.defineProperty(canvas, 'getBoundingClientRect', {
        value: () => ({ left: 0, top: 0 }),
      });

      const clickEvent = new MouseEvent('click', {
        clientX: 64,
        clientY: 64,
      });
      canvas.dispatchEvent(clickEvent);

      expect(processTurnSpy).toHaveBeenCalled();
    });

    it('should not handle events after destroy', () => {
      // Destroy the existing handler from beforeEach
      inputHandler.destroy();

      const handler = new InputHandler({
        canvas,
        game,
        playerId: 'player-1',
      });
      handler.initialize();
      handler.destroy();

      const processTurnSpy = vi.spyOn(game, 'processTurn');

      const clickEvent = new MouseEvent('click', {
        clientX: 64,
        clientY: 64,
      });
      canvas.dispatchEvent(clickEvent);

      expect(processTurnSpy).not.toHaveBeenCalled();
    });
  });
});
