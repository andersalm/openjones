# Worker 3: Task I3 - Input & Interaction System

## 🚨 CRITICAL: Run These Commands FIRST!

**Before reading the rest of this document, execute these commands in order:**

```bash
# Step 1: Navigate to project directory
cd /home/user/openjones/openjones-web

# Step 2: Fetch the coordinator branch
git fetch origin claude/coordinator-verify-openjones-session-5-011CUuCQHprJA3z66hEdygJ2

# Step 3: Checkout the coordinator branch
git checkout claude/coordinator-verify-openjones-session-5-011CUuCQHprJA3z66hEdygJ2

# Step 4: Verify you can see this file
pwd  # Should show: /home/user/openjones/openjones-web
ls .coordinator/rounds/round-05/

# Step 5: Install dependencies
npm install

# Step 6: Create YOUR worker branch (follow naming rules below!)
git checkout -b claude/input-system-i3-[YOUR-SESSION-ID]
```

**✅ If all commands succeeded, continue reading below.**
**❌ If any command failed, stop and ask for help.**

---

## 📛 Branch Naming Rules (IMPORTANT!)

Your branch name MUST follow this pattern:

**Pattern:** `claude/[task-name]-[task-id]-[YOUR-SESSION-ID]`

**✅ CORRECT Example for this task:**
- `claude/input-system-i3-011CUv12345678901234567890`

**❌ WRONG Examples (DO NOT USE!):**
- `claude/coordinator-verify-openjones-011CUv...` ← WRONG! Don't use "coordinator" pattern
- `claude/worker-3-011CUv...` ← WRONG! Don't use worker number
- `claude/input-i3-011CUv...` ← WRONG! Use full descriptive name

**Why this matters:**
- Makes it easy for coordinator to find your branch
- Clear what task you worked on
- Prevents confusion with coordinator branch

---

**Session Type:** WORKER
**Branch:** `claude/input-system-i3-[YOUR-SESSION-ID]`
**Date:** 2025-11-07
**Session:** 5
**Task Type:** INTEGRATION (connecting input to game logic)

---

## 🎯 Primary Objective

Create the InputHandler that translates player interactions (clicks, keyboard) into game actions. This is an INTEGRATION task: you'll connect UI events to existing action classes and game logic.

**Goal:** Make the game INTERACTIVE - clicks and keys trigger game actions!

---

## 📦 Deliverables

- [ ] `frontend/src/input/InputHandler.ts` (250-300 lines)
- [ ] `frontend/src/input/InputHandler.test.ts` (30+ tests)
- [ ] Canvas click → map position conversion
- [ ] Keyboard shortcuts system
- [ ] Action selection flow
- [ ] Building interaction handling
- [ ] Completion report file

---

## 📚 What ALREADY Exists (DO NOT RECREATE!)

### Action Classes (Session 1-2)
- ✅ All action classes in `frontend/src/engine/actions/`
- ✅ `MovementAction` - Player movement
- ✅ `EnterBuildingAction` - Enter buildings
- ✅ `ExitBuildingAction` - Exit buildings
- ✅ `WorkAction`, `RelaxAction`, `StudyAction`, etc.

### UI Components (Session 3)
- ✅ `BuildingModal` (C3) - Building interaction UI
- ✅ `ActionMenu` (C4) - Action selection UI

### Map System
- ✅ `Map`, `Position`, `Route` classes
- ✅ Building locations

**IMPORTANT:** Check what exists:
```bash
ls -la frontend/src/engine/actions/
ls -la frontend/src/components/Buildings/
ls -la frontend/src/components/ui/
```

---

## ✅ What You Need to BUILD

### InputHandler Class

The InputHandler bridges player input to game actions:

1. **Click Handling**
   - Canvas click → screen coordinates
   - Screen coordinates → map position
   - Map position → action (move, interact)
   - Building clicks → open BuildingModal

2. **Keyboard Shortcuts**
   - Movement: Arrow keys or WASD
   - Actions: Number keys (1-9)
   - Menu: Space, Esc, Enter
   - Debug: Tilde key for console

3. **Interaction Flow**
   - Click empty tile → MovementAction
   - Click building → EnterBuildingAction or show menu
   - Inside building → ActionMenu appears
   - Select action → Execute action

4. **State Management**
   - Track selected building
   - Track available actions
   - Handle multi-step interactions
   - Prevent invalid inputs

---

## 🏗️ Implementation Guide

### Step 1: Define InputHandler Interface

```typescript
// frontend/src/input/InputHandler.ts
import type { Game } from '../engine/game/Game';
import type { GameController } from '../engine/GameController';
import { Position } from '../engine/map/Position';
import { MovementAction } from '../engine/actions/MovementAction';
import { EnterBuildingAction } from '../engine/actions/EnterBuildingAction';

export interface InputHandlerConfig {
  canvas: HTMLCanvasElement;
  game: Game;
  gameController: GameController;
  tileSize?: number; // Pixels per tile (default: 32)
  onActionSelected?: (actionType: string) => void;
  onBuildingSelected?: (buildingId: string) => void;
}

export interface InputState {
  selectedBuilding: string | null;
  availableActions: string[];
  isInteracting: boolean;
}

export class InputHandler {
  private canvas: HTMLCanvasElement;
  private game: Game;
  private gameController: GameController;
  private tileSize: number;

  private state: InputState = {
    selectedBuilding: null,
    availableActions: [],
    isInteracting: false,
  };

  // Event listeners
  private clickListener?: (e: MouseEvent) => void;
  private keyListener?: (e: KeyboardEvent) => void;

  // Callbacks
  private onActionSelected?: (actionType: string) => void;
  private onBuildingSelected?: (buildingId: string) => void;

  constructor(config: InputHandlerConfig) {
    this.canvas = config.canvas;
    this.game = config.game;
    this.gameController = config.gameController;
    this.tileSize = config.tileSize || 32;
    this.onActionSelected = config.onActionSelected;
    this.onBuildingSelected = config.onBuildingSelected;
  }

  /**
   * Initialize and attach event listeners
   */
  initialize(): void {
    this.clickListener = (e: MouseEvent) => this.handleClick(e);
    this.keyListener = (e: KeyboardEvent) => this.handleKeyPress(e);

    this.canvas.addEventListener('click', this.clickListener);
    document.addEventListener('keydown', this.keyListener);
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    if (this.clickListener) {
      this.canvas.removeEventListener('click', this.clickListener);
    }
    if (this.keyListener) {
      document.removeEventListener('keydown', this.keyListener);
    }
  }

  /**
   * Handle canvas click
   */
  private handleClick(event: MouseEvent): void {
    // Get canvas-relative coordinates
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert to map position
    const mapPos = this.screenToMapPosition(x, y);

    // Determine what was clicked
    this.processClick(mapPos);
  }

  /**
   * Convert screen coordinates to map position
   */
  private screenToMapPosition(screenX: number, screenY: number): Position {
    const mapX = Math.floor(screenX / this.tileSize);
    const mapY = Math.floor(screenY / this.tileSize);
    return new Position(mapX, mapY);
  }

  /**
   * Process click on map position
   */
  private processClick(position: Position): void {
    const map = this.game.getMap();
    const player = this.game.getPlayer();

    // Check if clicked on a building
    const building = map.getBuildingAt(position);

    if (building) {
      this.handleBuildingClick(building.id, position);
    } else {
      // Empty tile - move player
      this.handleMovementClick(position);
    }
  }

  /**
   * Handle click on building
   */
  private handleBuildingClick(buildingId: string, position: Position): void {
    const player = this.game.getPlayer();

    // Check if player is adjacent to building
    const isAdjacent = this.isAdjacentToBuilding(player.getPosition(), position);

    if (isAdjacent) {
      // Enter building
      const action = new EnterBuildingAction(buildingId);
      this.gameController.executeAction(action);

      // Notify UI to show building modal
      if (this.onBuildingSelected) {
        this.onBuildingSelected(buildingId);
      }

      this.state.selectedBuilding = buildingId;
      this.state.isInteracting = true;
    } else {
      // Move to building first
      this.handleMovementClick(position);
    }
  }

  /**
   * Handle click on empty tile (movement)
   */
  private handleMovementClick(position: Position): void {
    const player = this.game.getPlayer();
    const currentPos = player.getPosition();

    // Check if position is reachable
    if (!this.isValidMove(currentPos, position)) {
      console.warn('Invalid move target');
      return;
    }

    // Create movement action
    const action = new MovementAction(position);
    this.gameController.executeAction(action);
  }

  /**
   * Check if move is valid
   */
  private isValidMove(from: Position, to: Position): boolean {
    const map = this.game.getMap();

    // Check map bounds
    if (!map.isInBounds(to)) {
      return false;
    }

    // Check if tile is walkable
    if (!map.isWalkable(to)) {
      return false;
    }

    // Check distance (for now, allow any distance - pathfinding will handle it)
    return true;
  }

  /**
   * Check if two positions are adjacent
   */
  private isAdjacentToBuilding(playerPos: Position, buildingPos: Position): boolean {
    const dx = Math.abs(playerPos.x - buildingPos.x);
    const dy = Math.abs(playerPos.y - buildingPos.y);
    return dx <= 1 && dy <= 1;
  }

  /**
   * Handle keyboard input
   */
  private handleKeyPress(event: KeyboardEvent): void {
    const player = this.game.getPlayer();
    const currentPos = player.getPosition();

    // Movement keys
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.handleMovementClick(new Position(currentPos.x, currentPos.y - 1));
        event.preventDefault();
        break;

      case 'ArrowDown':
      case 's':
      case 'S':
        this.handleMovementClick(new Position(currentPos.x, currentPos.y + 1));
        event.preventDefault();
        break;

      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.handleMovementClick(new Position(currentPos.x - 1, currentPos.y));
        event.preventDefault();
        break;

      case 'ArrowRight':
      case 'd':
      case 'D':
        this.handleMovementClick(new Position(currentPos.x + 1, currentPos.y));
        event.preventDefault();
        break;

      // Action shortcuts
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        this.handleActionShortcut(parseInt(event.key));
        break;

      // Exit interaction
      case 'Escape':
        this.exitInteraction();
        break;

      // Debug
      case '`':
        this.toggleDebug();
        break;
    }
  }

  /**
   * Handle action shortcut keys
   */
  private handleActionShortcut(actionIndex: number): void {
    if (this.state.isInteracting && this.state.availableActions[actionIndex - 1]) {
      const actionType = this.state.availableActions[actionIndex - 1];
      this.executeActionByType(actionType);
    }
  }

  /**
   * Execute action by type name
   */
  private executeActionByType(actionType: string): void {
    // Import and create appropriate action class
    // This requires knowing action constructors
    // Simplified example:
    if (this.onActionSelected) {
      this.onActionSelected(actionType);
    }
  }

  /**
   * Exit building interaction
   */
  private exitInteraction(): void {
    if (this.state.isInteracting) {
      this.state.selectedBuilding = null;
      this.state.isInteracting = false;
      this.state.availableActions = [];
    }
  }

  /**
   * Toggle debug mode
   */
  private toggleDebug(): void {
    // Show debug overlay with position, FPS, etc.
    console.log('Debug:', {
      playerPos: this.game.getPlayer().getPosition(),
      gameTime: this.game.getState().currentHour,
      money: this.game.getPlayer().money,
    });
  }

  /**
   * Get current input state
   */
  getState(): InputState {
    return { ...this.state };
  }

  /**
   * Set available actions (called by UI)
   */
  setAvailableActions(actions: string[]): void {
    this.state.availableActions = actions;
  }
}
```

### Step 2: Coordinate Conversion Utilities

```typescript
/**
 * Convert map position to screen coordinates
 */
mapToScreenPosition(mapPos: Position): { x: number; y: number } {
  return {
    x: mapPos.x * this.tileSize,
    y: mapPos.y * this.tileSize,
  };
}

/**
 * Get tile bounds in screen space
 */
getTileBounds(mapPos: Position): { x: number; y: number; width: number; height: number } {
  const screen = this.mapToScreenPosition(mapPos);
  return {
    x: screen.x,
    y: screen.y,
    width: this.tileSize,
    height: this.tileSize,
  };
}

/**
 * Check if screen coordinates are inside tile
 */
isInsideTile(screenX: number, screenY: number, mapPos: Position): boolean {
  const bounds = this.getTileBounds(mapPos);
  return (
    screenX >= bounds.x &&
    screenX < bounds.x + bounds.width &&
    screenY >= bounds.y &&
    screenY < bounds.y + bounds.height
  );
}
```

### Step 3: Integration with UI Components

```typescript
/**
 * Show building modal (integrate with BuildingModal component)
 */
showBuildingModal(buildingId: string): void {
  // This will be called from React component side
  // For now, use callback
  if (this.onBuildingSelected) {
    this.onBuildingSelected(buildingId);
  }
}

/**
 * Show action menu (integrate with ActionMenu component)
 */
showActionMenu(actions: string[]): void {
  this.state.availableActions = actions;
  this.state.isInteracting = true;

  if (this.onActionSelected) {
    // Callback to update React state
  }
}
```

---

## 🧪 Testing Requirements

**Framework:** Vitest (NOT Jest)
**Minimum Tests:** 30+
**Focus:** Input handling and action creation

### Test Categories

1. **Click Handling (10 tests)**
   - Canvas click detection
   - Screen to map conversion
   - Building click detection
   - Movement click handling
   - Adjacent building detection

2. **Keyboard Input (8 tests)**
   - Arrow key movement
   - WASD movement
   - Action shortcuts
   - Escape key
   - Invalid keys

3. **Coordinate Conversion (6 tests)**
   - Screen to map position
   - Map to screen position
   - Tile bounds calculation
   - Out of bounds handling

4. **Action Creation (6+ tests)**
   - Create MovementAction
   - Create EnterBuildingAction
   - Action validation
   - Invalid action handling

### Example Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InputHandler } from './InputHandler';
import { Game } from '../engine/game/Game';
import { GameController } from '../engine/GameController';

describe('InputHandler', () => {
  let inputHandler: InputHandler;
  let canvas: HTMLCanvasElement;
  let game: Game;
  let gameController: GameController;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    game = new Game({ playerName: 'Test', difficulty: 'easy' });
    gameController = new GameController({ game });

    inputHandler = new InputHandler({
      canvas,
      game,
      gameController,
      tileSize: 32,
    });

    inputHandler.initialize();
  });

  describe('coordinate conversion', () => {
    it('should convert screen coordinates to map position', () => {
      const mapPos = inputHandler['screenToMapPosition'](64, 96);
      expect(mapPos.x).toBe(2);
      expect(mapPos.y).toBe(3);
    });

    it('should convert map position to screen coordinates', () => {
      const screenPos = inputHandler['mapToScreenPosition'](new Position(5, 7));
      expect(screenPos.x).toBe(160);
      expect(screenPos.y).toBe(224);
    });

    it('should handle edge cases', () => {
      const mapPos = inputHandler['screenToMapPosition'](0, 0);
      expect(mapPos.x).toBe(0);
      expect(mapPos.y).toBe(0);
    });
  });

  describe('click handling', () => {
    it('should detect canvas clicks', () => {
      const executeSpy = vi.spyOn(gameController, 'executeAction');

      const clickEvent = new MouseEvent('click', {
        clientX: 100,
        clientY: 100,
      });

      canvas.dispatchEvent(clickEvent);

      expect(executeSpy).toHaveBeenCalled();
    });

    it('should create movement action for empty tile', () => {
      const executeSpy = vi.spyOn(gameController, 'executeAction');

      inputHandler['handleMovementClick'](new Position(5, 5));

      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'movement',
        })
      );
    });

    it('should detect building clicks', () => {
      const buildingCallback = vi.fn();
      inputHandler = new InputHandler({
        canvas,
        game,
        gameController,
        onBuildingSelected: buildingCallback,
      });

      // Place building at position
      const building = game.getMap().getBuildingAt(new Position(3, 3));
      if (building) {
        inputHandler['handleBuildingClick'](building.id, new Position(3, 3));
        expect(buildingCallback).toHaveBeenCalled();
      }
    });
  });

  describe('keyboard input', () => {
    it('should handle arrow key movement', () => {
      const executeSpy = vi.spyOn(gameController, 'executeAction');

      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      document.dispatchEvent(keyEvent);

      expect(executeSpy).toHaveBeenCalled();
    });

    it('should handle WASD movement', () => {
      const executeSpy = vi.spyOn(gameController, 'executeAction');

      const keyEvent = new KeyboardEvent('keydown', { key: 'w' });
      document.dispatchEvent(keyEvent);

      expect(executeSpy).toHaveBeenCalled();
    });

    it('should handle action shortcuts', () => {
      inputHandler.setAvailableActions(['work', 'relax', 'study']);
      const actionCallback = vi.fn();
      inputHandler = new InputHandler({
        canvas,
        game,
        gameController,
        onActionSelected: actionCallback,
      });

      inputHandler.setAvailableActions(['work']);
      const keyEvent = new KeyboardEvent('keydown', { key: '1' });
      document.dispatchEvent(keyEvent);

      // Action should be triggered
    });
  });

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

    it('should exit interaction on escape', () => {
      inputHandler['state'].isInteracting = true;
      inputHandler['state'].selectedBuilding = 'bank';

      inputHandler['exitInteraction']();

      expect(inputHandler.getState().isInteracting).toBe(false);
      expect(inputHandler.getState().selectedBuilding).toBeNull();
    });
  });
});
```

---

## 🔍 Verification Checklist

**Before claiming completion, verify ALL of these:**

### Code
- [ ] InputHandler.ts created: `ls -la frontend/src/input/InputHandler.ts`
- [ ] No syntax errors: `npm run type-check`
- [ ] Imports existing actions
- [ ] No debug code (console.log, TODOs)

### Integration
- [ ] Uses existing action classes
- [ ] Integrates with GameController
- [ ] Canvas events work
- [ ] Keyboard events work
- [ ] Coordinate conversion accurate

### Tests
- [ ] Tests written: `ls -la frontend/src/input/InputHandler.test.ts`
- [ ] Tests pass: `npm test -- InputHandler`
- [ ] Test count: 30+ (MINIMUM)
- [ ] No test errors

### Git
- [ ] Branch name correct: `claude/input-system-i3-[YOUR-SESSION-ID]`
- [ ] Changes committed: `git log -1 --oneline`
- [ ] Pushed: `git push -u origin claude/input-system-i3-[YOUR-SESSION-ID]`

### Final Commands
```bash
npm run type-check 2>&1 | tail -30
npm test -- InputHandler 2>&1 | tail -50
ls -la frontend/src/input/
wc -l frontend/src/input/InputHandler.ts frontend/src/input/InputHandler.test.ts
git log -1 --oneline
```

---

## 🚫 Common Mistakes to Avoid

1. **Recreating action classes** - IMPORT them!
2. **Not creating input directory** - Make `frontend/src/input/` folder first
3. **Incorrect coordinate math** - Test coordinate conversion thoroughly
4. **Memory leaks** - Clean up event listeners in destroy()
5. **Not preventing defaults** - Use event.preventDefault() for arrow keys
6. **Ignoring edge cases** - Test clicks outside canvas, invalid positions

---

## 📝 Final Report (REQUIRED)

```bash
cat > .coordinator/rounds/round-05/worker-3-report.md <<'EOF'
# Worker 3 Report: Task I3 - Input & Interaction System

**Branch:** claude/input-system-i3-[YOUR-ACTUAL-SESSION-ID]
**Commit:** [paste: git log -1 --format=%h]

## Deliverables
✅ InputHandler.ts (XXX lines)
✅ InputHandler.test.ts (XX tests)

## Test Results
- Tests run: XX
- Tests passed: XX (100%)

[Paste last 30 lines of test output]

## Integration Points
- ✅ GameController integration
- ✅ Action classes integration
- ✅ Canvas click handling
- ✅ Keyboard input handling

## Files Created
[Paste: ls -la frontend/src/input/]

## Issues Encountered
[None, or describe any issues]

## Notes for Coordinator
- InputHandler ready for App integration
- All input types handled (click, keyboard)
- Coordinate conversion tested and working

EOF

git add .coordinator/rounds/round-05/worker-3-report.md
git commit -m "docs: Add Worker 3 completion report for Task I3"
git push
```

---

## 💡 Tips for Success

- **Create input directory first:** `mkdir -p frontend/src/input`
- **Test coordinate math** - Off-by-one errors are common
- **Mock events properly** - Use correct MouseEvent/KeyboardEvent constructors
- **Handle edge cases** - Clicks outside bounds, invalid moves
- **Clean up listeners** - Prevent memory leaks

---

**Instructions generated:** 2025-11-07
**Session:** 5 - INTEGRATION FOCUS
**Good luck!** 🚀
