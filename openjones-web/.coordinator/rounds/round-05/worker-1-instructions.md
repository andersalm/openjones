# Worker 1: Task I1 - Game Loop Controller

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
git checkout -b claude/game-controller-i1-[YOUR-SESSION-ID]
```

**✅ If all commands succeeded, continue reading below.**
**❌ If any command failed, stop and ask for help.**

---

## 📛 Branch Naming Rules (IMPORTANT!)

Your branch name MUST follow this pattern:

**Pattern:** `claude/[task-name]-[task-id]-[YOUR-SESSION-ID]`

**✅ CORRECT Example for this task:**
- `claude/game-controller-i1-011CUv12345678901234567890`

**❌ WRONG Examples (DO NOT USE!):**
- `claude/coordinator-verify-openjones-011CUv...` ← WRONG! Don't use "coordinator" pattern
- `claude/worker-1-011CUv...` ← WRONG! Don't use worker number
- `claude/task-i1-011CUv...` ← WRONG! Use descriptive name

**Why this matters:**
- Makes it easy for coordinator to find your branch
- Clear what task you worked on
- Prevents confusion with coordinator branch

---

**Session Type:** WORKER
**Branch:** `claude/game-controller-i1-[YOUR-SESSION-ID]`
**Date:** 2025-11-07
**Session:** 5
**Task Type:** INTEGRATION (connecting existing systems)

---

## 🎯 Primary Objective

Create the GameController - the heart of the game loop that orchestrates all existing systems into a playable game. This is an INTEGRATION task: you'll wire together existing code, NOT build from scratch.

**Goal:** By end of Session 5, the game should be PLAYABLE and deployable to Vercel!

---

## 📦 Deliverables

- [ ] `frontend/src/engine/GameController.ts` (300-350 lines)
- [ ] `frontend/src/engine/GameController.test.ts` (40+ tests)
- [ ] Integration with all action classes
- [ ] Turn management system
- [ ] Time progression logic
- [ ] Player input → action execution pipeline
- [ ] Completion report file

---

## 📚 What ALREADY Exists (DO NOT RECREATE!)

### Engine Systems (Session 1-2)
- ✅ `frontend/src/engine/game/Game.ts` - Core game class
- ✅ `frontend/src/engine/game/Player.ts` - Player state
- ✅ `frontend/src/engine/game/GameState.ts` - Game state management
- ✅ `frontend/src/engine/map/Map.ts` - Map system
- ✅ `frontend/src/engine/map/Position.ts` - Position/coordinates
- ✅ `frontend/src/engine/map/Route.ts` - Pathfinding

### Action System (Session 1-2)
- ✅ `frontend/src/engine/actions/Action.ts` - Base action class
- ✅ `frontend/src/engine/actions/ActionRegistry.ts` - Action registration
- ✅ `frontend/src/engine/actions/MovementAction.ts` (A1)
- ✅ `frontend/src/engine/actions/EnterBuildingAction.ts` (A2)
- ✅ `frontend/src/engine/actions/ExitBuildingAction.ts` (A3)
- ✅ `frontend/src/engine/actions/WorkAction.ts` (A4)
- ✅ `frontend/src/engine/actions/RelaxAction.ts` (A5)
- ✅ `frontend/src/engine/actions/PurchaseAction.ts` (A6)
- ✅ `frontend/src/engine/actions/StudyAction.ts` (A7)

### Buildings (Session 1-2)
- ✅ All building classes in `frontend/src/engine/buildings/`

### IMPORTANT
Check what's in these directories before writing code:
```bash
ls -la frontend/src/engine/
ls -la frontend/src/engine/actions/
ls -la frontend/src/engine/game/
```

---

## ✅ What You Need to BUILD

### GameController Class

The GameController orchestrates the main game loop:

1. **Turn Management**
   - Initialize game state
   - Process player actions
   - Update game state
   - Advance turns/time

2. **Action Pipeline**
   - Receive player input
   - Validate actions
   - Execute actions via ActionRegistry
   - Handle action responses
   - Update game state based on results

3. **Time System**
   - Track game time (hours, days)
   - Handle time-based events (rent due, work shifts)
   - Trigger automatic actions (energy drain, etc.)

4. **State Synchronization**
   - Keep Game, Player, Map in sync
   - Notify observers of state changes
   - Handle save/load if needed

---

## 🏗️ Implementation Guide

### Step 1: Define GameController Interface

```typescript
// frontend/src/engine/GameController.ts
import { Game } from './game/Game';
import { Player } from './game/Player';
import { ActionRegistry } from './actions/ActionRegistry';
import { ActionResponse } from './actions/ActionResponse';
import type { Action } from './actions/Action';

export interface GameControllerConfig {
  game: Game;
  autoSave?: boolean;
  tickRate?: number; // ms per game tick (default: 60fps = 16ms)
}

export interface TurnResult {
  success: boolean;
  message: string;
  stateChanged: boolean;
  timeAdvanced: number; // hours advanced
}

export class GameController {
  private game: Game;
  private actionRegistry: ActionRegistry;
  private isRunning: boolean = false;
  private currentTick: number = 0;
  private observers: Set<(game: Game) => void> = new Set();

  constructor(config: GameControllerConfig) {
    this.game = config.game;
    this.actionRegistry = new ActionRegistry();
    this.registerAllActions();
  }

  /**
   * Register all available actions
   */
  private registerAllActions(): void {
    // Register all action classes from actions directory
    // Use the ActionRegistry to register each action type
  }

  /**
   * Start the game loop
   */
  start(): void {
    // Initialize game state
    // Start processing turns
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    // Pause game processing
  }

  /**
   * Execute a player action
   */
  async executeAction(action: Action): Promise<TurnResult> {
    // 1. Validate action
    // 2. Execute via ActionRegistry
    // 3. Process ActionResponse
    // 4. Update game state
    // 5. Advance time if needed
    // 6. Notify observers
    // 7. Return result
  }

  /**
   * Advance game time by one turn
   */
  tick(): void {
    // Update time-based systems
    // Check for automatic events
    // Drain energy over time
    // Check win/lose conditions
  }

  /**
   * Subscribe to game state changes
   */
  subscribe(observer: (game: Game) => void): () => void {
    // Add observer
    // Return unsubscribe function
  }

  /**
   * Get current game state
   */
  getGameState(): Game {
    return this.game;
  }

  /**
   * Reset game to initial state
   */
  reset(): void {
    // Reset all systems
  }
}
```

### Step 2: Implement Action Execution Pipeline

**Key Integration Points:**
- Use existing `ActionRegistry.execute()` method
- Handle `ActionResponse` objects from actions
- Update Player state based on action outcomes
- Update Map/Position when player moves
- Trigger side effects (energy drain, money changes, etc.)

```typescript
async executeAction(action: Action): Promise<TurnResult> {
  // Validate player can perform action
  const player = this.game.getPlayer();

  // Check prerequisites (energy, money, location, etc.)
  if (!this.canExecuteAction(action, player)) {
    return {
      success: false,
      message: 'Cannot perform action',
      stateChanged: false,
      timeAdvanced: 0,
    };
  }

  // Execute action via registry
  const response = await this.actionRegistry.execute(action, this.game);

  // Process response
  if (response.success) {
    this.applyActionEffects(response);
    this.advanceTime(response.timeConsumed || 0);
    this.notifyObservers();

    return {
      success: true,
      message: response.message,
      stateChanged: true,
      timeAdvanced: response.timeConsumed || 0,
    };
  }

  return {
    success: false,
    message: response.message,
    stateChanged: false,
    timeAdvanced: 0,
  };
}

private applyActionEffects(response: ActionResponse): void {
  const player = this.game.getPlayer();

  // Update player stats based on action effects
  if (response.effects) {
    // Apply money changes
    // Apply energy changes
    // Apply position changes
    // Apply inventory changes
    // etc.
  }
}
```

### Step 3: Implement Time System

```typescript
private advanceTime(hours: number): void {
  const state = this.game.getState();

  // Update game time
  state.currentHour += hours;

  // Handle day transitions
  if (state.currentHour >= 24) {
    state.currentDay += Math.floor(state.currentHour / 24);
    state.currentHour = state.currentHour % 24;
  }

  // Check for time-based events
  this.checkTimeBasedEvents();
}

private checkTimeBasedEvents(): void {
  const state = this.game.getState();

  // Check for rent due
  if (state.currentDay % 7 === 0) {
    // Trigger rent payment
  }

  // Check for energy drain over time
  // Check for victory conditions
  // etc.
}
```

### Step 4: Observer Pattern for State Changes

```typescript
subscribe(observer: (game: Game) => void): () => void {
  this.observers.add(observer);

  // Return unsubscribe function
  return () => {
    this.observers.delete(observer);
  };
}

private notifyObservers(): void {
  this.observers.forEach(observer => observer(this.game));
}
```

---

## 🧪 Testing Requirements

**Framework:** Vitest (NOT Jest)
**Minimum Tests:** 40+
**Focus:** Integration testing (testing connections between systems)

### Test Categories

1. **Action Execution (15 tests)**
   - Execute movement action
   - Execute building enter/exit
   - Execute work/relax/study
   - Handle invalid actions
   - Handle insufficient resources
   - Verify state updates

2. **Turn Management (10 tests)**
   - Start/stop game loop
   - Advance turns
   - Time progression
   - Day/night transitions
   - Multiple turns in sequence

3. **Time-Based Events (8 tests)**
   - Rent payment triggers
   - Energy drain over time
   - Victory condition checks
   - Time-based random events

4. **Observer Pattern (7 tests)**
   - Subscribe to changes
   - Unsubscribe
   - Multiple observers
   - Observer notifications

5. **Integration Tests (10+ tests)**
   - Full action sequences
   - State consistency across systems
   - Error recovery
   - Edge cases

### Example Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { GameController } from './GameController';
import { Game } from './game/Game';
import { MovementAction } from './actions/MovementAction';
import { Position } from './map/Position';

describe('GameController', () => {
  let controller: GameController;
  let game: Game;

  beforeEach(() => {
    game = new Game({
      playerName: 'Test Player',
      difficulty: 'easy',
    });

    controller = new GameController({ game });
  });

  describe('action execution', () => {
    it('should execute movement action successfully', async () => {
      const startPos = game.getPlayer().getPosition();
      const targetPos = new Position(startPos.x + 1, startPos.y);

      const action = new MovementAction(targetPos);
      const result = await controller.executeAction(action);

      expect(result.success).toBe(true);
      expect(result.stateChanged).toBe(true);
      expect(game.getPlayer().getPosition()).toEqual(targetPos);
    });

    it('should reject action if player lacks resources', async () => {
      // Drain player energy
      const player = game.getPlayer();
      player.energy = 0;

      // Try to perform action requiring energy
      const action = new WorkAction();
      const result = await controller.executeAction(action);

      expect(result.success).toBe(false);
      expect(result.message).toContain('energy');
    });

    // Add 38+ more tests
  });

  describe('time progression', () => {
    it('should advance time when action completes', async () => {
      const initialHour = game.getState().currentHour;

      const action = new WorkAction(); // Takes 8 hours
      await controller.executeAction(action);

      expect(game.getState().currentHour).toBe(initialHour + 8);
    });

    it('should handle day transitions', async () => {
      const state = game.getState();
      state.currentHour = 20;

      const action = new WorkAction(); // 8 hours
      await controller.executeAction(action);

      expect(state.currentDay).toBe(1); // Next day
      expect(state.currentHour).toBe(4); // 20 + 8 = 28 -> 4 (next day)
    });
  });

  describe('observer pattern', () => {
    it('should notify observers on state change', async () => {
      let notified = false;

      controller.subscribe((updatedGame) => {
        notified = true;
        expect(updatedGame).toBe(game);
      });

      const action = new MovementAction(new Position(0, 1));
      await controller.executeAction(action);

      expect(notified).toBe(true);
    });
  });
});
```

---

## 🔍 Verification Checklist

**Before claiming completion, verify ALL of these:**

### Code
- [ ] GameController.ts created: `ls -la frontend/src/engine/GameController.ts`
- [ ] No syntax errors: `npm run type-check`
- [ ] Imports existing classes (not recreating them!)
- [ ] No debug code (console.log, TODOs)
- [ ] Follows existing code patterns
- [ ] Proper error handling

### Integration
- [ ] Uses ActionRegistry correctly
- [ ] Integrates with Game class
- [ ] Updates Player state
- [ ] Handles Map/Position updates
- [ ] Observer pattern works

### Tests
- [ ] Tests written: `ls -la frontend/src/engine/GameController.test.ts`
- [ ] Tests pass: `npm test -- GameController`
- [ ] Test count: 40+ (MINIMUM)
- [ ] Integration tests included
- [ ] No test errors or warnings

### Git
- [ ] Branch name correct: `claude/game-controller-i1-[YOUR-SESSION-ID]`
- [ ] In correct directory: `/home/user/openjones/openjones-web`
- [ ] Changes committed: `git log -1 --oneline`
- [ ] Pushed: `git push -u origin claude/game-controller-i1-[YOUR-SESSION-ID]`
- [ ] Verified: `git ls-remote origin claude/game-controller-i1-[YOUR-SESSION-ID]`

### Final Commands
```bash
# Run ALL these commands and paste output in your report
npm run type-check 2>&1 | tail -30
npm test -- GameController 2>&1 | tail -50
ls -la frontend/src/engine/GameController*
wc -l frontend/src/engine/GameController.ts frontend/src/engine/GameController.test.ts
git log -1 --oneline
git diff --stat origin/claude/coordinator-verify-openjones-session-5-011CUuCQHprJA3z66hEdygJ2
```

---

## 🚫 Common Mistakes to Avoid

1. **Recreating existing classes** - IMPORT them, don't rebuild them
2. **Not checking existing code** - Look at what's in engine/ first!
3. **Using Jest instead of Vitest** - Import from 'vitest', not 'jest'
4. **Unit tests only** - Focus on INTEGRATION tests (systems working together)
5. **Ignoring ActionRegistry** - Use the existing registry, don't bypass it
6. **Not testing edge cases** - Test error conditions, invalid states
7. **Forgetting observers** - State changes must notify subscribers

---

## 📝 Final Report (REQUIRED)

**When complete, create your completion report:**

```bash
cat > .coordinator/rounds/round-05/worker-1-report.md <<'EOF'
# Worker 1 Report: Task I1 - Game Loop Controller

**Branch:** claude/game-controller-i1-[YOUR-ACTUAL-SESSION-ID]
**Commit:** [paste: git log -1 --format=%h]

## Deliverables
✅ GameController.ts (XXX lines)
✅ GameController.test.ts (XX tests)

## Test Results
- Tests run: XX
- Tests passed: XX (100%)
- Command: `npm test -- GameController`

[Paste last 30 lines of test output]

## Type Check
- Status: ✅ PASSED
- Command: `npm run type-check`

## Integration Points Verified
- ✅ ActionRegistry integration
- ✅ Game class integration
- ✅ Player state updates
- ✅ Map/Position updates
- ✅ Observer pattern working

## Files Created/Modified
[Paste: ls -la frontend/src/engine/GameController*]

## Issues Encountered
[None, or describe any issues and how you resolved them]

## Notes for Coordinator
- GameController ready for integration with rendering system
- All existing actions work through the controller
- Time system fully functional
- Ready for UI integration

EOF

git add .coordinator/rounds/round-05/worker-1-report.md
git commit -m "docs: Add Worker 1 completion report for Task I1"
git push
```

---

## 💡 Tips for Success

- **Study existing code FIRST** - Spend 30 minutes reading Game, Player, Action classes
- **Integration over implementation** - Wire systems together, don't rebuild
- **Test connections** - Focus on how systems interact, not individual methods
- **Think game loop** - Player input → Action → State update → Render (next worker)
- **Ask questions** - If ActionRegistry behavior is unclear, check the tests
- **Keep it playable** - Focus on making the game WORK, not perfect architecture

---

## 📚 Reference

**Key Files to Study:**
- `frontend/src/engine/game/Game.ts` - Game state management
- `frontend/src/engine/actions/ActionRegistry.ts` - How actions are executed
- `frontend/src/engine/actions/Action.ts` - Base action interface
- `frontend/src/engine/game/Player.ts` - Player state

**Patterns:**
- Observer pattern for state changes
- Command pattern for actions (already implemented)
- Game loop architecture

---

**Instructions generated:** 2025-11-07
**Session:** 5 - INTEGRATION FOCUS
**Good luck! Let's make this game PLAYABLE!** 🚀
