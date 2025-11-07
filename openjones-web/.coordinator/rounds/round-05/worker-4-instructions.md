# Worker 4: Task I4 - Main Game App

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
git checkout -b claude/main-app-i4-[YOUR-SESSION-ID]
```

**✅ If all commands succeeded, continue reading below.**
**❌ If any command failed, stop and ask for help.**

---

## 📛 Branch Naming Rules (IMPORTANT!)

Your branch name MUST follow this pattern:

**Pattern:** `claude/[task-name]-[task-id]-[YOUR-SESSION-ID]`

**✅ CORRECT Example for this task:**
- `claude/main-app-i4-011CUv12345678901234567890`

**❌ WRONG Examples (DO NOT USE!):**
- `claude/coordinator-verify-openjones-011CUv...` ← WRONG! Don't use "coordinator" pattern
- `claude/worker-4-011CUv...` ← WRONG! Don't use worker number
- `claude/app-i4-011CUv...` ← WRONG! Use full descriptive name

**Why this matters:**
- Makes it easy for coordinator to find your branch
- Clear what task you worked on
- Prevents confusion with coordinator branch

---

**Session Type:** WORKER
**Branch:** `claude/main-app-i4-[YOUR-SESSION-ID]`
**Date:** 2025-11-07
**Session:** 5
**Task Type:** INTEGRATION (final assembly of all systems)

---

## 🎯 Primary Objective

Create the main App.tsx component that integrates ALL systems into a working, playable game. This is the FINAL INTEGRATION: you'll tie together GameController, RenderCoordinator, InputHandler, and all UI components.

**Goal:** A PLAYABLE game ready to deploy to Vercel!

---

## 📦 Deliverables

- [ ] Updated `frontend/src/App.tsx` (200-250 lines)
- [ ] `frontend/src/App.test.tsx` (25+ tests)
- [ ] New game setup flow
- [ ] All systems integrated
- [ ] Game state → UI synchronization
- [ ] Completion report file

---

## 📚 What ALREADY Exists (DO NOT RECREATE!)

### Core Systems (Session 5 Workers 1-3)
- ✅ GameController (I1) - Game loop management
- ✅ RenderCoordinator (I2) - Visual rendering
- ✅ InputHandler (I3) - Player input

**NOTE:** These might not exist yet if other workers haven't finished. Design your App to work with their interfaces.

### UI Components (Session 3)
- ✅ `BuildingModal` - Building interactions
- ✅ `ActionMenu` - Action selection
- ✅ `PlayerStatsHUD` - Player stats display
- ✅ `VictoryProgress` - Win condition tracking
- ✅ UI primitives: Button, Card, Panel, Container

### Engine (Session 1-2)
- ✅ Game, Player, Map classes
- ✅ All action classes
- ✅ Building classes

**IMPORTANT:** Check what exists:
```bash
ls -la frontend/src/
ls -la frontend/src/components/
ls -la frontend/src/engine/
```

---

## ✅ What You Need to BUILD

### App.tsx - Main Application Component

The App component is the root that:

1. **Initializes All Systems**
   - Create Game instance
   - Create GameController
   - Create RenderCoordinator
   - Create InputHandler
   - Wire them all together

2. **Manages Game Lifecycle**
   - New game setup
   - Start/pause game
   - Save/load (future)
   - Reset game

3. **Connects State to UI**
   - Subscribe to game state changes
   - Update React state when game changes
   - Render UI components with current state
   - Handle UI callbacks

4. **Orchestrates Flow**
   - Main menu → New game → Gameplay → Victory/Loss
   - Building modal display
   - Action menu display
   - Game over screens

---

## 🏗️ Implementation Guide

### Step 1: App Component Structure

```typescript
// frontend/src/App.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Game } from './engine/game/Game';
import { GameController } from './engine/GameController';
import { RenderCoordinator } from './rendering/RenderCoordinator';
import { InputHandler } from './input/InputHandler';
import { PlayerStatsHUD } from './components/PlayerStats/PlayerStatsHUD';
import { VictoryProgress } from './components/PlayerStats/VictoryProgress';
import { BuildingModal } from './components/Buildings/BuildingModal';
import { ActionMenu } from './components/Buildings/ActionMenu';
import { Button } from './components/ui/Button';
import './App.css';

type GamePhase = 'menu' | 'playing' | 'paused' | 'victory' | 'defeat';

interface GameState {
  playerName: string;
  money: number;
  energy: number;
  intelligence: number;
  charm: number;
  currentHour: number;
  currentDay: number;
}

export function App() {
  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // System refs (don't trigger re-renders)
  const gameRef = useRef<Game | null>(null);
  const controllerRef = useRef<GameController | null>(null);
  const rendererRef = useRef<RenderCoordinator | null>(null);
  const inputRef = useRef<InputHandler | null>(null);

  // React state (for UI updates)
  const [gamePhase, setGamePhase] = useState<GamePhase>('menu');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [availableActions, setAvailableActions] = useState<string[]>([]);

  /**
   * Initialize game systems
   */
  const initializeGame = useCallback((playerName: string, difficulty: string) => {
    if (!canvasRef.current) return;

    // Create game instance
    const game = new Game({
      playerName,
      difficulty,
    });
    gameRef.current = game;

    // Create game controller
    const controller = new GameController({ game });
    controllerRef.current = controller;

    // Subscribe to game state changes
    controller.subscribe((updatedGame) => {
      updateReactState(updatedGame);
    });

    // Create render coordinator
    const renderer = new RenderCoordinator({
      canvas: canvasRef.current,
      game,
    });
    rendererRef.current = renderer;

    // Subscribe renderer to game state
    controller.subscribe((updatedGame) => {
      renderer.onGameStateChange(updatedGame);
    });

    // Create input handler
    const input = new InputHandler({
      canvas: canvasRef.current,
      game,
      gameController: controller,
      onBuildingSelected: (buildingId) => {
        setSelectedBuilding(buildingId);
        // Get available actions for this building
        const actions = getAvailableActionsForBuilding(buildingId, game);
        setAvailableActions(actions);
        setShowActionMenu(true);
      },
      onActionSelected: (actionType) => {
        setShowActionMenu(false);
      },
    });
    inputRef.current = input;
    input.initialize();

    // Start systems
    controller.start();
    renderer.start();

    // Update initial state
    updateReactState(game);

    // Set game phase
    setGamePhase('playing');
  }, []);

  /**
   * Update React state from game state
   */
  const updateReactState = (game: Game) => {
    const player = game.getPlayer();
    const state = game.getState();

    setGameState({
      playerName: player.name,
      money: player.money,
      energy: player.energy,
      intelligence: player.intelligence,
      charm: player.charm,
      currentHour: state.currentHour,
      currentDay: state.currentDay,
    });

    // Check win/loss conditions
    if (player.money >= 10000) {
      setGamePhase('victory');
    } else if (player.energy <= 0 && player.money < 50) {
      setGamePhase('defeat');
    }
  };

  /**
   * Get available actions for a building
   */
  const getAvailableActionsForBuilding = (buildingId: string, game: Game): string[] => {
    const building = game.getMap().getBuildings().find(b => b.id === buildingId);
    if (!building) return [];

    // Return actions based on building type
    switch (building.type) {
      case 'job':
        return ['work', 'apply'];
      case 'housing':
        return ['rent', 'relax'];
      case 'education':
        return ['study'];
      case 'shopping':
        return ['purchase'];
      default:
        return [];
    }
  };

  /**
   * Start new game
   */
  const handleNewGame = (playerName: string) => {
    initializeGame(playerName, 'normal');
  };

  /**
   * Pause game
   */
  const handlePause = () => {
    if (controllerRef.current) {
      controllerRef.current.stop();
    }
    if (rendererRef.current) {
      rendererRef.current.stop();
    }
    setGamePhase('paused');
  };

  /**
   * Resume game
   */
  const handleResume = () => {
    if (controllerRef.current) {
      controllerRef.current.start();
    }
    if (rendererRef.current) {
      rendererRef.current.start();
    }
    setGamePhase('playing');
  };

  /**
   * Reset game
   */
  const handleReset = () => {
    // Clean up existing systems
    if (inputRef.current) {
      inputRef.current.destroy();
    }
    if (rendererRef.current) {
      rendererRef.current.destroy();
    }
    if (controllerRef.current) {
      controllerRef.current.stop();
    }

    // Reset refs
    gameRef.current = null;
    controllerRef.current = null;
    rendererRef.current = null;
    inputRef.current = null;

    // Reset state
    setGamePhase('menu');
    setGameState(null);
    setSelectedBuilding(null);
    setShowActionMenu(false);
  };

  /**
   * Handle action selection
   */
  const handleActionSelect = async (actionType: string) => {
    if (!controllerRef.current || !gameRef.current) return;

    // Create appropriate action based on type
    // This is simplified - you'd import actual action classes
    try {
      // Execute action via controller
      // const action = createAction(actionType);
      // await controllerRef.current.executeAction(action);

      setShowActionMenu(false);
      setSelectedBuilding(null);
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  /**
   * Clean up on unmount
   */
  useEffect(() => {
    return () => {
      if (inputRef.current) inputRef.current.destroy();
      if (rendererRef.current) rendererRef.current.destroy();
      if (controllerRef.current) controllerRef.current.stop();
    };
  }, []);

  /**
   * Render based on game phase
   */
  return (
    <div className="app">
      {/* Main Menu */}
      {gamePhase === 'menu' && (
        <MainMenu onNewGame={handleNewGame} />
      )}

      {/* Playing/Paused */}
      {(gamePhase === 'playing' || gamePhase === 'paused') && (
        <div className="game-container">
          {/* Game Canvas */}
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="game-canvas"
          />

          {/* UI Overlay */}
          <div className="ui-overlay">
            {/* Player Stats HUD */}
            {gameState && (
              <PlayerStatsHUD
                money={gameState.money}
                energy={gameState.energy}
                intelligence={gameState.intelligence}
                charm={gameState.charm}
                time={`Day ${gameState.currentDay}, ${gameState.currentHour}:00`}
              />
            )}

            {/* Victory Progress */}
            {gameState && (
              <VictoryProgress currentMoney={gameState.money} targetMoney={10000} />
            )}

            {/* Pause Button */}
            <div className="game-controls">
              {gamePhase === 'playing' ? (
                <Button onClick={handlePause}>Pause</Button>
              ) : (
                <Button onClick={handleResume}>Resume</Button>
              )}
              <Button onClick={handleReset}>Main Menu</Button>
            </div>
          </div>

          {/* Building Modal */}
          {selectedBuilding && (
            <BuildingModal
              buildingId={selectedBuilding}
              onClose={() => {
                setSelectedBuilding(null);
                setShowActionMenu(false);
              }}
            />
          )}

          {/* Action Menu */}
          {showActionMenu && (
            <ActionMenu
              actions={availableActions}
              onActionSelect={handleActionSelect}
              onClose={() => setShowActionMenu(false)}
            />
          )}
        </div>
      )}

      {/* Victory Screen */}
      {gamePhase === 'victory' && (
        <VictoryScreen onMainMenu={handleReset} />
      )}

      {/* Defeat Screen */}
      {gamePhase === 'defeat' && (
        <DefeatScreen onMainMenu={handleReset} />
      )}
    </div>
  );
}

/**
 * Main Menu Component
 */
function MainMenu({ onNewGame }: { onNewGame: (name: string) => void }) {
  const [playerName, setPlayerName] = useState('');

  return (
    <div className="main-menu">
      <h1>OpenJones</h1>
      <div className="menu-content">
        <input
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <Button
          onClick={() => playerName && onNewGame(playerName)}
          disabled={!playerName}
        >
          New Game
        </Button>
      </div>
    </div>
  );
}

/**
 * Victory Screen Component
 */
function VictoryScreen({ onMainMenu }: { onMainMenu: () => void }) {
  return (
    <div className="victory-screen">
      <h1>Victory!</h1>
      <p>You've achieved your goal and become successful!</p>
      <Button onClick={onMainMenu}>Main Menu</Button>
    </div>
  );
}

/**
 * Defeat Screen Component
 */
function DefeatScreen({ onMainMenu }: { onMainMenu: () => void }) {
  return (
    <div className="defeat-screen">
      <h1>Game Over</h1>
      <p>You ran out of energy and money. Better luck next time!</p>
      <Button onClick={onMainMenu}>Main Menu</Button>
    </div>
  );
}

export default App;
```

### Step 2: App Styling

```css
/* frontend/src/App.css */
.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.game-container {
  position: relative;
  width: 800px;
  height: 600px;
}

.game-canvas {
  display: block;
  border: 2px solid #333;
  background: #000;
}

.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.ui-overlay > * {
  pointer-events: auto;
}

.game-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 10px;
}

.main-menu,
.victory-screen,
.defeat-screen {
  text-align: center;
  color: white;
  padding: 40px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
}

.main-menu h1,
.victory-screen h1,
.defeat-screen h1 {
  font-size: 48px;
  margin-bottom: 20px;
}

.menu-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.menu-content input {
  padding: 10px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  width: 250px;
}
```

### Step 3: Integration Tests

```typescript
// frontend/src/App.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  beforeEach(() => {
    // Mock canvas
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      fillStyle: '',
      // Add other canvas methods as needed
    })) as any;
  });

  describe('main menu', () => {
    it('should render main menu initially', () => {
      render(<App />);
      expect(screen.getByText('OpenJones')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    });

    it('should start new game when name entered', async () => {
      render(<App />);

      const input = screen.getByPlaceholderText('Enter your name');
      const button = screen.getByText('New Game');

      fireEvent.change(input, { target: { value: 'Test Player' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.queryByText('OpenJones')).not.toBeInTheDocument();
      });
    });

    it('should disable new game button when name is empty', () => {
      render(<App />);
      const button = screen.getByText('New Game');
      expect(button).toBeDisabled();
    });
  });

  describe('gameplay', () => {
    it('should render game canvas', async () => {
      render(<App />);

      // Start game
      fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
        target: { value: 'Test' },
      });
      fireEvent.click(screen.getByText('New Game'));

      await waitFor(() => {
        const canvas = document.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
      });
    });

    it('should render player stats HUD', async () => {
      render(<App />);

      // Start game
      fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
        target: { value: 'Test' },
      });
      fireEvent.click(screen.getByText('New Game'));

      await waitFor(() => {
        // Look for stats indicators
        expect(screen.getByText(/Day/)).toBeInTheDocument();
      });
    });

    it('should pause game', async () => {
      render(<App />);

      // Start game
      fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
        target: { value: 'Test' },
      });
      fireEvent.click(screen.getByText('New Game'));

      await waitFor(() => {
        const pauseButton = screen.getByText('Pause');
        fireEvent.click(pauseButton);
        expect(screen.getByText('Resume')).toBeInTheDocument();
      });
    });

    it('should return to main menu', async () => {
      render(<App />);

      // Start game
      fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
        target: { value: 'Test' },
      });
      fireEvent.click(screen.getByText('New Game'));

      await waitFor(() => {
        fireEvent.click(screen.getByText('Main Menu'));
        expect(screen.getByText('OpenJones')).toBeInTheDocument();
      });
    });
  });

  describe('game over conditions', () => {
    it('should show victory screen when goal reached', async () => {
      // This would require mocking game state to reach victory
      // Simplified test - actual implementation would manipulate game state
    });

    it('should show defeat screen when resources depleted', async () => {
      // This would require mocking game state to reach defeat
    });
  });
});
```

---

## 🧪 Testing Requirements

**Framework:** Vitest + React Testing Library
**Minimum Tests:** 25+
**Focus:** Integration and user flow

### Test Categories

1. **Menu Flow (6 tests)**
   - Render main menu
   - Start new game
   - Input validation
   - Button states

2. **Game Initialization (6 tests)**
   - Canvas rendered
   - Systems initialized
   - Initial state correct
   - UI components visible

3. **Gameplay (7 tests)**
   - Pause/resume
   - Return to menu
   - State updates
   - UI synchronization

4. **Building Interaction (6+ tests)**
   - Building modal opens
   - Action menu shows
   - Actions execute
   - Modal closes

---

## 🔍 Verification Checklist

**Before claiming completion, verify ALL of these:**

### Code
- [ ] App.tsx updated: `ls -la frontend/src/App.tsx`
- [ ] App.css created: `ls -la frontend/src/App.css`
- [ ] No syntax errors: `npm run type-check`
- [ ] No debug code

### Integration
- [ ] GameController integrated
- [ ] RenderCoordinator integrated
- [ ] InputHandler integrated
- [ ] All UI components used
- [ ] State synchronization works

### Tests
- [ ] Tests written: `ls -la frontend/src/App.test.tsx`
- [ ] Tests pass: `npm test -- App`
- [ ] Test count: 25+

### Build
- [ ] App builds: `npm run build`
- [ ] No build errors
- [ ] Production bundle works

### Git
- [ ] Branch name correct: `claude/main-app-i4-[YOUR-SESSION-ID]`
- [ ] Changes committed: `git log -1 --oneline`
- [ ] Pushed: `git push -u origin claude/main-app-i4-[YOUR-SESSION-ID]`

### Final Commands
```bash
npm run type-check 2>&1 | tail -30
npm test -- App 2>&1 | tail -50
npm run build 2>&1 | tail -30
ls -la frontend/src/App.*
git log -1 --oneline
```

---

## 🚫 Common Mistakes to Avoid

1. **Not checking if App.tsx exists** - Read it first, it might already have content!
2. **Recreating UI components** - Import and use existing ones
3. **State management issues** - Use refs for systems, useState for UI
4. **Memory leaks** - Clean up in useEffect return
5. **Not testing user flows** - Test full interaction sequences
6. **Forgetting build step** - Make sure `npm run build` works!

---

## 📝 Final Report (REQUIRED)

```bash
cat > .coordinator/rounds/round-05/worker-4-report.md <<'EOF'
# Worker 4 Report: Task I4 - Main Game App

**Branch:** claude/main-app-i4-[YOUR-ACTUAL-SESSION-ID]
**Commit:** [paste: git log -1 --format=%h]

## Deliverables
✅ App.tsx (XXX lines)
✅ App.test.tsx (XX tests)
✅ App.css (XX lines)

## Test Results
- Tests run: XX
- Tests passed: XX (100%)

[Paste last 30 lines of test output]

## Build Results
- Build status: ✅ SUCCESS
- Bundle size: XX KB

[Paste last 20 lines of build output]

## Integration Points
- ✅ GameController integrated
- ✅ RenderCoordinator integrated
- ✅ InputHandler integrated
- ✅ All UI components working
- ✅ Game lifecycle complete

## Files Modified
[Paste: ls -la frontend/src/App.*]

## Issues Encountered
[None, or describe any issues]

## Notes for Coordinator
- App fully integrated and working
- Ready for deployment to Vercel
- All systems connected and functional
- Game is PLAYABLE!

## Next Steps for Deployment
1. Verify build: `npm run build`
2. Test production build locally: `npm run preview`
3. Deploy to Vercel: Follow deployment guide
4. Test deployed version

EOF

git add .coordinator/rounds/round-05/worker-4-report.md
git commit -m "docs: Add Worker 4 completion report for Task I4"
git push
```

---

## 💡 Tips for Success

- **Read existing App.tsx first** - Don't overwrite working code
- **Test incrementally** - Start with menu, then add game
- **Use refs wisely** - Systems in refs, UI state in useState
- **Clean up properly** - Prevent memory leaks
- **Test the build** - Make sure production works
- **Deploy ready** - This should be deployable when done!

---

## 🚀 Deployment Notes

Once your App is working:

1. **Build:** `npm run build`
2. **Preview:** `npm run preview`
3. **Deploy:** Follow Vercel deployment guide
4. **Test:** Play the deployed game!

---

**Instructions generated:** 2025-11-07
**Session:** 5 - INTEGRATION FOCUS
**This is it - make it PLAYABLE!** 🎮🚀
