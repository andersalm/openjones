# Worker 2: Task I2 - Render Pipeline Integration

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
git checkout -b claude/render-integration-i2-[YOUR-SESSION-ID]
```

**✅ If all commands succeeded, continue reading below.**
**❌ If any command failed, stop and ask for help.**

---

## 📛 Branch Naming Rules (IMPORTANT!)

Your branch name MUST follow this pattern:

**Pattern:** `claude/[task-name]-[task-id]-[YOUR-SESSION-ID]`

**✅ CORRECT Example for this task:**
- `claude/render-integration-i2-011CUv12345678901234567890`

**❌ WRONG Examples (DO NOT USE!):**
- `claude/coordinator-verify-openjones-011CUv...` ← WRONG! Don't use "coordinator" pattern
- `claude/worker-2-011CUv...` ← WRONG! Don't use worker number
- `claude/rendering-i2-011CUv...` ← WRONG! Use full descriptive name

**Why this matters:**
- Makes it easy for coordinator to find your branch
- Clear what task you worked on
- Prevents confusion with coordinator branch

---

**Session Type:** WORKER
**Branch:** `claude/render-integration-i2-[YOUR-SESSION-ID]`
**Date:** 2025-11-07
**Session:** 5
**Task Type:** INTEGRATION (connecting rendering systems)

---

## 🎯 Primary Objective

Create the RenderCoordinator that orchestrates all rendering systems to display game state visually. This is an INTEGRATION task: you'll connect existing rendering components, NOT build them from scratch.

**Goal:** Wire game state changes → visual updates for a smooth, responsive UI!

---

## 📦 Deliverables

- [ ] `frontend/src/rendering/RenderCoordinator.ts` (250-300 lines)
- [ ] `frontend/src/rendering/RenderCoordinator.test.ts` (35+ tests)
- [ ] Integration with AnimationEngine
- [ ] Integration with EffectsRenderer
- [ ] MapRenderer coordination (if exists)
- [ ] SpriteManager coordination (if exists)
- [ ] Completion report file

---

## 📚 What ALREADY Exists (DO NOT RECREATE!)

### Rendering Systems (Session 3-4)
- ✅ `frontend/src/rendering/AnimationEngine.ts` (D4) - Frame-based animations
- ✅ `frontend/src/rendering/EffectsRenderer.ts` (D5) - Visual effects
- ✅ `frontend/src/rendering/easing.ts` - Easing functions
- ✅ `frontend/src/rendering/types.ts` - Rendering types

**Check what else exists:**
```bash
ls -la frontend/src/rendering/
```

### Potential Additional Systems
- MapRenderer (D3) - May or may not exist yet
- SpriteManager (D2) - May or may not exist yet
- Canvas/WebGL renderer

**IMPORTANT:** Before writing code, check:
```bash
ls -la frontend/src/rendering/
find frontend/src -name "*Renderer*" -o -name "*Sprite*"
```

---

## ✅ What You Need to BUILD

### RenderCoordinator Class

The RenderCoordinator connects game state to visual rendering:

1. **Coordinate Multiple Renderers**
   - Manage AnimationEngine lifecycle
   - Manage EffectsRenderer
   - Coordinate MapRenderer (if exists)
   - Handle render order/layers

2. **State → Visual Mapping**
   - Subscribe to game state changes
   - Translate state changes into render commands
   - Queue animations for state transitions
   - Trigger visual effects

3. **Performance Optimization**
   - Batch render updates
   - Avoid redundant renders
   - Handle requestAnimationFrame efficiently
   - Manage canvas/WebGL contexts

4. **Render Lifecycle**
   - Initialize all rendering systems
   - Start/stop rendering loop
   - Clean up resources
   - Handle resize events

---

## 🏗️ Implementation Guide

### Step 1: Define RenderCoordinator Interface

```typescript
// frontend/src/rendering/RenderCoordinator.ts
import { AnimationEngine } from './AnimationEngine';
import { EffectsRenderer } from './EffectsRenderer';
import type { Game } from '../engine/game/Game';
import type { Player } from '../engine/game/Player';

export interface RenderCoordinatorConfig {
  canvas: HTMLCanvasElement;
  game: Game;
  pixelScale?: number; // Scale for retro pixel art (default: 2)
}

export interface RenderLayer {
  name: string;
  zIndex: number;
  visible: boolean;
}

export class RenderCoordinator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private game: Game;

  private animationEngine: AnimationEngine;
  private effectsRenderer: EffectsRenderer;
  // Add MapRenderer, SpriteManager if they exist

  private isRunning: boolean = false;
  private lastRenderTime: number = 0;
  private frameCount: number = 0;

  // Render layers for proper draw order
  private layers: Map<string, RenderLayer> = new Map();

  constructor(config: RenderCoordinatorConfig) {
    this.canvas = config.canvas;
    this.ctx = canvas.getContext('2d')!;
    this.game = config.game;

    // Initialize all renderers
    this.animationEngine = new AnimationEngine();
    this.effectsRenderer = new EffectsRenderer(this.ctx);

    // Set up render layers
    this.initializeLayers();
  }

  /**
   * Initialize render layers (draw order)
   */
  private initializeLayers(): void {
    // Define layers from back to front
    this.layers.set('background', { name: 'background', zIndex: 0, visible: true });
    this.layers.set('map', { name: 'map', zIndex: 1, visible: true });
    this.layers.set('buildings', { name: 'buildings', zIndex: 2, visible: true });
    this.layers.set('player', { name: 'player', zIndex: 3, visible: true });
    this.layers.set('effects', { name: 'effects', zIndex: 4, visible: true });
    this.layers.set('ui', { name: 'ui', zIndex: 5, visible: true });
  }

  /**
   * Start the rendering loop
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.animationEngine.start();
    this.renderLoop();
  }

  /**
   * Stop the rendering loop
   */
  stop(): void {
    this.isRunning = false;
    this.animationEngine.stop();
  }

  /**
   * Main render loop
   */
  private renderLoop(): void {
    if (!this.isRunning) return;

    const now = performance.now();
    const deltaTime = now - this.lastRenderTime;
    this.lastRenderTime = now;

    // Clear canvas
    this.clear();

    // Render all layers in order
    this.renderAllLayers();

    // Update frame counter
    this.frameCount++;

    // Schedule next frame
    requestAnimationFrame(() => this.renderLoop());
  }

  /**
   * Render all layers in z-index order
   */
  private renderAllLayers(): void {
    // Sort layers by zIndex
    const sortedLayers = Array.from(this.layers.values())
      .filter(layer => layer.visible)
      .sort((a, b) => a.zIndex - b.zIndex);

    // Render each layer
    for (const layer of sortedLayers) {
      this.renderLayer(layer.name);
    }
  }

  /**
   * Render a specific layer
   */
  private renderLayer(layerName: string): void {
    switch (layerName) {
      case 'background':
        this.renderBackground();
        break;
      case 'map':
        this.renderMap();
        break;
      case 'buildings':
        this.renderBuildings();
        break;
      case 'player':
        this.renderPlayer();
        break;
      case 'effects':
        this.renderEffects();
        break;
      case 'ui':
        this.renderUI();
        break;
    }
  }

  /**
   * Handle game state change
   */
  onGameStateChange(game: Game): void {
    // Analyze what changed and trigger appropriate renders
    // Example: player moved → animate player sprite
    // Example: action completed → show effect
  }

  /**
   * Animate player movement
   */
  animatePlayerMovement(fromX: number, fromY: number, toX: number, toY: number): void {
    const duration = 300; // ms

    this.animationEngine.createTween(
      'player-move',
      fromX,
      fromY,
      toX,
      toY,
      duration,
      undefined, // Use default easing
      (x, y) => {
        // Update player render position
      },
      () => {
        // Movement complete
      }
    );
  }

  /**
   * Show visual effect
   */
  showEffect(effectType: string, x: number, y: number): void {
    // Use EffectsRenderer to show effect
    this.effectsRenderer.addEffect({
      type: effectType,
      x,
      y,
      duration: 500,
    });
  }

  /**
   * Clear the canvas
   */
  private clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Render background layer
   */
  private renderBackground(): void {
    // Fill with background color or pattern
    this.ctx.fillStyle = '#87CEEB'; // Sky blue
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Render map layer
   */
  private renderMap(): void {
    // If MapRenderer exists, use it
    // Otherwise, render basic grid
  }

  /**
   * Render buildings layer
   */
  private renderBuildings(): void {
    // Render all buildings on the map
    const buildings = this.game.getMap().getBuildings();
    // Draw each building
  }

  /**
   * Render player layer
   */
  private renderPlayer(): void {
    const player = this.game.getPlayer();
    const pos = player.getPosition();

    // If SpriteManager exists, get player sprite
    // Otherwise, render simple rectangle
    this.ctx.fillStyle = '#FF0000';
    this.ctx.fillRect(pos.x * 32, pos.y * 32, 32, 32); // Simple rect for now
  }

  /**
   * Render effects layer
   */
  private renderEffects(): void {
    // EffectsRenderer handles its own rendering
    this.effectsRenderer.render();
  }

  /**
   * Render UI layer (minimal, most UI is React components)
   */
  private renderUI(): void {
    // Debug info, FPS counter, etc.
    this.ctx.fillStyle = '#000';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`FPS: ${this.getFPS()}`, 10, 20);
  }

  /**
   * Get current FPS
   */
  private getFPS(): number {
    // Calculate FPS based on frame timing
    return Math.round(1000 / (performance.now() - this.lastRenderTime));
  }

  /**
   * Handle canvas resize
   */
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    this.animationEngine.clear();
    // Clean up other resources
  }
}
```

### Step 2: Integrate with AnimationEngine

```typescript
/**
 * Create animation for player action
 */
createActionAnimation(actionType: string, duration: number): void {
  const player = this.game.getPlayer();
  const pos = player.getPosition();

  switch (actionType) {
    case 'work':
      // Show work animation
      this.animationEngine.addAnimation({
        id: 'player-work',
        frames: [
          { spriteId: 'player-work-1', duration: 200, x: pos.x, y: pos.y },
          { spriteId: 'player-work-2', duration: 200, x: pos.x, y: pos.y },
        ],
        loop: true,
      });
      break;

    case 'walk':
      this.animationEngine.addAnimation({
        id: 'player-walk',
        frames: [
          { spriteId: 'player-walk-1', duration: 150, x: pos.x, y: pos.y },
          { spriteId: 'player-walk-2', duration: 150, x: pos.x, y: pos.y },
        ],
        loop: false,
      });
      break;

    // Add more animation types
  }
}
```

### Step 3: Integrate with EffectsRenderer

```typescript
/**
 * Trigger effect for game event
 */
triggerGameEffect(eventType: string, position: { x: number; y: number }): void {
  switch (eventType) {
    case 'purchase':
      this.effectsRenderer.addEffect({
        type: 'money',
        x: position.x,
        y: position.y,
        duration: 800,
        intensity: 1.0,
      });
      break;

    case 'level-up':
      this.effectsRenderer.addEffect({
        type: 'sparkle',
        x: position.x,
        y: position.y,
        duration: 1200,
        intensity: 1.5,
      });
      break;

    case 'energy-low':
      this.effectsRenderer.addEffect({
        type: 'warning',
        x: position.x,
        y: position.y,
        duration: 500,
        intensity: 0.8,
      });
      break;
  }
}
```

### Step 4: State Change Handler

```typescript
/**
 * React to game state changes
 */
onGameStateChange(game: Game): void {
  // Check what changed
  const player = game.getPlayer();
  const prevPlayer = this.previousState?.getPlayer();

  // Player moved?
  if (prevPlayer && !player.getPosition().equals(prevPlayer.getPosition())) {
    this.animatePlayerMovement(
      prevPlayer.getPosition().x,
      prevPlayer.getPosition().y,
      player.getPosition().x,
      player.getPosition().y
    );
  }

  // Money changed?
  if (prevPlayer && player.money !== prevPlayer.money) {
    const diff = player.money - prevPlayer.money;
    if (diff > 0) {
      this.triggerGameEffect('money-gain', player.getPosition());
    } else {
      this.triggerGameEffect('money-loss', player.getPosition());
    }
  }

  // Update previous state
  this.previousState = this.cloneGameState(game);
}
```

---

## 🧪 Testing Requirements

**Framework:** Vitest (NOT Jest)
**Minimum Tests:** 35+
**Focus:** Integration between rendering systems

### Test Categories

1. **Initialization (8 tests)**
   - Create RenderCoordinator
   - Initialize all renderers
   - Set up canvas context
   - Configure layers

2. **Render Loop (8 tests)**
   - Start rendering
   - Stop rendering
   - Frame timing
   - Layer order
   - requestAnimationFrame calls

3. **AnimationEngine Integration (7 tests)**
   - Create tweens
   - Create animations
   - Animation callbacks
   - Animation timing

4. **EffectsRenderer Integration (6 tests)**
   - Trigger effects
   - Effect timing
   - Multiple simultaneous effects

5. **State Change Handling (6+ tests)**
   - React to player movement
   - React to stat changes
   - React to game events
   - Multiple changes

### Example Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RenderCoordinator } from './RenderCoordinator';
import { Game } from '../engine/game/Game';

describe('RenderCoordinator', () => {
  let coordinator: RenderCoordinator;
  let canvas: HTMLCanvasElement;
  let game: Game;

  beforeEach(() => {
    // Create canvas mock
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    // Create game instance
    game = new Game({
      playerName: 'Test Player',
      difficulty: 'easy',
    });

    // Create coordinator
    coordinator = new RenderCoordinator({ canvas, game });
  });

  describe('initialization', () => {
    it('should initialize with canvas and game', () => {
      expect(coordinator).toBeDefined();
      expect(coordinator.getCanvas()).toBe(canvas);
    });

    it('should create AnimationEngine', () => {
      expect(coordinator.getAnimationEngine()).toBeDefined();
    });

    it('should create EffectsRenderer', () => {
      expect(coordinator.getEffectsRenderer()).toBeDefined();
    });

    it('should set up render layers', () => {
      const layers = coordinator.getLayers();
      expect(layers.size).toBeGreaterThan(0);
      expect(layers.has('player')).toBe(true);
      expect(layers.has('effects')).toBe(true);
    });
  });

  describe('render loop', () => {
    it('should start rendering', () => {
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
      coordinator.start();
      expect(rafSpy).toHaveBeenCalled();
    });

    it('should stop rendering', () => {
      coordinator.start();
      coordinator.stop();
      expect(coordinator.isRunning()).toBe(false);
    });

    it('should render all visible layers in order', () => {
      const renderSpy = vi.spyOn(coordinator as any, 'renderLayer');
      coordinator.start();
      vi.advanceTimersByTime(16); // One frame

      const layerOrder = renderSpy.mock.calls.map(call => call[0]);
      expect(layerOrder).toEqual([
        'background',
        'map',
        'buildings',
        'player',
        'effects',
        'ui',
      ]);
    });
  });

  describe('animation integration', () => {
    it('should animate player movement', () => {
      const createTweenSpy = vi.spyOn(coordinator.getAnimationEngine(), 'createTween');

      coordinator.animatePlayerMovement(0, 0, 5, 5);

      expect(createTweenSpy).toHaveBeenCalledWith(
        'player-move',
        0,
        0,
        5,
        5,
        expect.any(Number),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should create action animations', () => {
      const addAnimationSpy = vi.spyOn(coordinator.getAnimationEngine(), 'addAnimation');

      coordinator.createActionAnimation('work', 1000);

      expect(addAnimationSpy).toHaveBeenCalled();
      const animation = addAnimationSpy.mock.calls[0][0];
      expect(animation.id).toContain('work');
    });
  });

  describe('effects integration', () => {
    it('should trigger visual effects', () => {
      const addEffectSpy = vi.spyOn(coordinator.getEffectsRenderer(), 'addEffect');

      coordinator.showEffect('sparkle', 10, 10);

      expect(addEffectSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'sparkle',
          x: 10,
          y: 10,
        })
      );
    });
  });

  describe('state change handling', () => {
    it('should react to player movement', () => {
      const animateSpy = vi.spyOn(coordinator, 'animatePlayerMovement');

      const player = game.getPlayer();
      const oldPos = player.getPosition();
      player.setPosition(new Position(5, 5));

      coordinator.onGameStateChange(game);

      expect(animateSpy).toHaveBeenCalled();
    });

    it('should trigger effect on money change', () => {
      const effectSpy = vi.spyOn(coordinator, 'triggerGameEffect');

      const player = game.getPlayer();
      player.money += 100;

      coordinator.onGameStateChange(game);

      expect(effectSpy).toHaveBeenCalledWith('money-gain', expect.any(Object));
    });
  });
});
```

---

## 🔍 Verification Checklist

**Before claiming completion, verify ALL of these:**

### Code
- [ ] RenderCoordinator.ts created: `ls -la frontend/src/rendering/RenderCoordinator.ts`
- [ ] No syntax errors: `npm run type-check`
- [ ] Integrates with AnimationEngine
- [ ] Integrates with EffectsRenderer
- [ ] No debug code (console.log, TODOs)

### Integration
- [ ] Uses existing AnimationEngine
- [ ] Uses existing EffectsRenderer
- [ ] Handles state changes correctly
- [ ] Renders all layers in order
- [ ] requestAnimationFrame works

### Tests
- [ ] Tests written: `ls -la frontend/src/rendering/RenderCoordinator.test.ts`
- [ ] Tests pass: `npm test -- RenderCoordinator`
- [ ] Test count: 35+ (MINIMUM)
- [ ] Integration tests included
- [ ] No test errors

### Git
- [ ] Branch name correct: `claude/render-integration-i2-[YOUR-SESSION-ID]`
- [ ] Changes committed: `git log -1 --oneline`
- [ ] Pushed: `git push -u origin claude/render-integration-i2-[YOUR-SESSION-ID]`
- [ ] Verified: `git ls-remote origin claude/render-integration-i2-[YOUR-SESSION-ID]`

### Final Commands
```bash
npm run type-check 2>&1 | tail -30
npm test -- RenderCoordinator 2>&1 | tail -50
ls -la frontend/src/rendering/RenderCoordinator*
wc -l frontend/src/rendering/RenderCoordinator.ts frontend/src/rendering/RenderCoordinator.test.ts
git log -1 --oneline
```

---

## 🚫 Common Mistakes to Avoid

1. **Recreating renderers** - IMPORT AnimationEngine, EffectsRenderer
2. **Not checking what exists** - Look in frontend/src/rendering/ first!
3. **Forgetting layer order** - Background must render before foreground
4. **Memory leaks** - Clean up requestAnimationFrame
5. **Not testing integration** - Test how systems work TOGETHER
6. **Ignoring performance** - Batch updates, avoid redundant renders

---

## 📝 Final Report (REQUIRED)

```bash
cat > .coordinator/rounds/round-05/worker-2-report.md <<'EOF'
# Worker 2 Report: Task I2 - Render Pipeline Integration

**Branch:** claude/render-integration-i2-[YOUR-ACTUAL-SESSION-ID]
**Commit:** [paste: git log -1 --format=%h]

## Deliverables
✅ RenderCoordinator.ts (XXX lines)
✅ RenderCoordinator.test.ts (XX tests)

## Test Results
- Tests run: XX
- Tests passed: XX (100%)
- Command: `npm test -- RenderCoordinator`

[Paste last 30 lines of test output]

## Integration Points Verified
- ✅ AnimationEngine integration
- ✅ EffectsRenderer integration
- ✅ Layer rendering system
- ✅ State change handling
- ✅ Canvas rendering

## Files Created
[Paste: ls -la frontend/src/rendering/RenderCoordinator*]

## Issues Encountered
[None, or describe any issues]

## Notes for Coordinator
- RenderCoordinator ready to connect to GameController
- All rendering systems orchestrated
- Performance optimized with layer system

EOF

git add .coordinator/rounds/round-05/worker-2-report.md
git commit -m "docs: Add Worker 2 completion report for Task I2"
git push
```

---

## 💡 Tips for Success

- **Check existing code** - See what AnimationEngine and EffectsRenderer provide
- **Test rendering** - Mock canvas and verify draw calls
- **Layer system** - Proper draw order prevents visual glitches
- **State tracking** - Track previous state to detect changes
- **Performance first** - 60fps is the goal

---

**Instructions generated:** 2025-11-07
**Session:** 5 - INTEGRATION FOCUS
**Good luck!** 🚀
