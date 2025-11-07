# Worker 1: Task D4 - Animation Engine

## 🚨 CRITICAL: Run These Commands FIRST!

**Before reading the rest of this document, execute these commands in order:**

```bash
# Step 1: Navigate to project directory
cd /home/user/openjones/openjones-web

# Step 2: Fetch the coordinator branch
git fetch origin claude/coordinator-verify-openjones-session-4-011CUuCQHprJA3z66hEdygJ2

# Step 3: Checkout the coordinator branch
git checkout claude/coordinator-verify-openjones-session-4-011CUuCQHprJA3z66hEdygJ2

# Step 4: Verify you can see this file
pwd  # Should show: /home/user/openjones/openjones-web
ls .coordinator/rounds/round-04/

# Step 5: Install dependencies
npm install

# Step 6: Create YOUR worker branch (follow naming rules below!)
git checkout -b claude/animation-engine-d4-[YOUR-SESSION-ID]
```

**✅ If all commands succeeded, continue reading below.**
**❌ If any command failed, stop and ask for help.**

---

## 📛 Branch Naming Rules (IMPORTANT!)

Your branch name MUST follow this pattern:

**Pattern:** `claude/[task-name]-[task-id]-[YOUR-SESSION-ID]`

**✅ CORRECT Example for this task:**
- `claude/animation-engine-d4-011CUv12345678901234567890`

**❌ WRONG Examples (DO NOT USE!):**
- `claude/coordinator-verify-openjones-011CUv...` ← WRONG! Don't use "coordinator" pattern
- `claude/worker-1-011CUv...` ← WRONG! Don't use worker number
- `claude/task-d4-011CUv...` ← WRONG! Use descriptive name

**Why this matters:**
- Makes it easy for coordinator to find your branch
- Clear what task you worked on
- Prevents confusion with coordinator branch

---

**Session Type:** WORKER
**Branch:** `claude/animation-engine-d4-[YOUR-SESSION-ID]`
**Date:** 2025-11-07
**Session:** 4

---

## 🎯 Primary Objective

Implement the AnimationEngine class for smooth, frame-based animations in the OpenJones browser port. This system will handle player movement animations, building entry/exit transitions, idle animations, and smooth visual transitions using requestAnimationFrame.

---

## 📦 Deliverables

- [ ] `frontend/src/rendering/AnimationEngine.ts` (200-250 lines)
- [ ] `frontend/src/rendering/AnimationEngine.test.ts` (40+ tests)
- [ ] Animation state management and queue system
- [ ] Tween/easing functions for smooth transitions
- [ ] Integration with SpriteManager
- [ ] Completion report file

---

## 📚 Context

The SpriteManager (Task D2) was completed in Session 3. You now have:
- Sprite loading and caching system
- Access to all game sprites (player, buildings, items)
- Foundation for rendering

**Your task:** Create an AnimationEngine that:
1. Manages animation state and queues
2. Provides smooth movement transitions (tweening)
3. Handles entrance/exit animations
4. Supports idle/loop animations
5. Uses requestAnimationFrame for 60fps rendering
6. Provides callback system for animation completion

**This task blocks:** Full visual gameplay, smooth UX

**Dependencies satisfied:**
- ✅ D2 (SpriteManager) - Complete in Session 3
- ✅ Asset preparation - Complete in Session 2

**Reference the SpriteManager pattern:**
```bash
# Note: SpriteManager doesn't exist yet on this branch
# It will be in the Session 3 completed code
# For now, create AnimationEngine to work with a SpriteManager interface
```

---

## ✅ Implementation Steps

### Step 1: Define Animation Types

Create type definitions for the animation system:

```typescript
// frontend/src/rendering/types.ts (add to existing file or create)
export interface AnimationFrame {
  spriteId: string;
  duration: number; // milliseconds
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
  rotation?: number;
}

export interface Animation {
  id: string;
  frames: AnimationFrame[];
  loop: boolean;
  onComplete?: () => void;
}

export interface Tween {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number; // milliseconds
  elapsed: number;
  easing: EasingFunction;
  onUpdate?: (x: number, y: number) => void;
  onComplete?: () => void;
}

export type EasingFunction = (t: number) => number;

export interface AnimationState {
  currentFrame: number;
  elapsed: number;
  playing: boolean;
}
```

### Step 2: Implement Easing Functions

Create smooth interpolation functions:

```typescript
// frontend/src/rendering/easing.ts
export const Easing = {
  linear: (t: number): number => t,

  easeInQuad: (t: number): number => t * t,

  easeOutQuad: (t: number): number => t * (2 - t),

  easeInOutQuad: (t: number): number =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  easeInCubic: (t: number): number => t * t * t,

  easeOutCubic: (t: number): number => {
    const t1 = t - 1;
    return t1 * t1 * t1 + 1;
  },

  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
};
```

### Step 3: Implement AnimationEngine Class

Create `frontend/src/rendering/AnimationEngine.ts`:

```typescript
import type { Animation, Tween, AnimationState, EasingFunction } from './types';
import { Easing } from './easing';

export class AnimationEngine {
  private animations: Map<string, Animation> = new Map();
  private tweens: Map<string, Tween> = new Map();
  private animationStates: Map<string, AnimationState> = new Map();
  private running: boolean = false;
  private lastTimestamp: number = 0;
  private animationFrameId: number | null = null;

  constructor() {
    // Engine starts paused
  }

  /**
   * Start the animation loop
   */
  start(): void {
    if (this.running) return;

    this.running = true;
    this.lastTimestamp = performance.now();
    this.animationFrameId = requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  /**
   * Stop the animation loop
   */
  stop(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main animation loop
   */
  private loop(timestamp: number): void {
    if (!this.running) return;

    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // Update all tweens
    this.updateTweens(deltaTime);

    // Update all animations
    this.updateAnimations(deltaTime);

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame((ts) => this.loop(ts));
  }

  /**
   * Update all active tweens
   */
  private updateTweens(deltaTime: number): void {
    const completedTweens: string[] = [];

    this.tweens.forEach((tween, id) => {
      tween.elapsed += deltaTime;
      const progress = Math.min(tween.elapsed / tween.duration, 1);
      const easedProgress = tween.easing(progress);

      const currentX = tween.startX + (tween.endX - tween.startX) * easedProgress;
      const currentY = tween.startY + (tween.endY - tween.startY) * easedProgress;

      if (tween.onUpdate) {
        tween.onUpdate(currentX, currentY);
      }

      if (progress >= 1) {
        if (tween.onComplete) {
          tween.onComplete();
        }
        completedTweens.push(id);
      }
    });

    // Remove completed tweens
    completedTweens.forEach(id => this.tweens.delete(id));
  }

  /**
   * Update all active animations
   */
  private updateAnimations(deltaTime: number): void {
    const completedAnimations: string[] = [];

    this.animations.forEach((animation, id) => {
      const state = this.animationStates.get(id);
      if (!state || !state.playing) return;

      state.elapsed += deltaTime;

      const currentFrame = animation.frames[state.currentFrame];
      if (state.elapsed >= currentFrame.duration) {
        state.elapsed = 0;
        state.currentFrame++;

        if (state.currentFrame >= animation.frames.length) {
          if (animation.loop) {
            state.currentFrame = 0;
          } else {
            state.playing = false;
            if (animation.onComplete) {
              animation.onComplete();
            }
            completedAnimations.push(id);
          }
        }
      }
    });

    // Remove completed non-looping animations
    completedAnimations.forEach(id => {
      this.animations.delete(id);
      this.animationStates.delete(id);
    });
  }

  /**
   * Create a movement tween
   */
  createTween(
    id: string,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    duration: number,
    easing: EasingFunction = Easing.easeInOutQuad,
    onUpdate?: (x: number, y: number) => void,
    onComplete?: () => void
  ): void {
    this.tweens.set(id, {
      id,
      startX,
      startY,
      endX,
      endY,
      duration,
      elapsed: 0,
      easing,
      onUpdate,
      onComplete,
    });
  }

  /**
   * Cancel a tween
   */
  cancelTween(id: string): void {
    this.tweens.delete(id);
  }

  /**
   * Add an animation
   */
  addAnimation(animation: Animation): void {
    this.animations.set(animation.id, animation);
    this.animationStates.set(animation.id, {
      currentFrame: 0,
      elapsed: 0,
      playing: true,
    });
  }

  /**
   * Remove an animation
   */
  removeAnimation(id: string): void {
    this.animations.delete(id);
    this.animationStates.delete(id);
  }

  /**
   * Pause an animation
   */
  pauseAnimation(id: string): void {
    const state = this.animationStates.get(id);
    if (state) {
      state.playing = false;
    }
  }

  /**
   * Resume an animation
   */
  resumeAnimation(id: string): void {
    const state = this.animationStates.get(id);
    if (state) {
      state.playing = true;
    }
  }

  /**
   * Get current animation frame
   */
  getCurrentFrame(animationId: string): AnimationFrame | null {
    const animation = this.animations.get(animationId);
    const state = this.animationStates.get(animationId);

    if (!animation || !state) return null;

    return animation.frames[state.currentFrame];
  }

  /**
   * Check if tween is active
   */
  isTweening(id: string): boolean {
    return this.tweens.has(id);
  }

  /**
   * Check if animation is playing
   */
  isPlaying(id: string): boolean {
    const state = this.animationStates.get(id);
    return state ? state.playing : false;
  }

  /**
   * Clear all animations and tweens
   */
  clear(): void {
    this.animations.clear();
    this.tweens.clear();
    this.animationStates.clear();
  }

  /**
   * Get animation count (for debugging)
   */
  getAnimationCount(): number {
    return this.animations.size;
  }

  /**
   * Get tween count (for debugging)
   */
  getTweenCount(): number {
    return this.tweens.size;
  }
}
```

### Step 4: Write Comprehensive Tests

Create `frontend/src/rendering/AnimationEngine.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AnimationEngine } from './AnimationEngine';
import { Easing } from './easing';
import type { Animation } from './types';

describe('AnimationEngine', () => {
  let engine: AnimationEngine;

  beforeEach(() => {
    engine = new AnimationEngine();
    vi.useFakeTimers();
  });

  afterEach(() => {
    engine.stop();
    vi.restoreAllMocks();
  });

  describe('start and stop', () => {
    it('should start the animation loop', () => {
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
      engine.start();
      expect(rafSpy).toHaveBeenCalled();
    });

    it('should stop the animation loop', () => {
      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
      engine.start();
      engine.stop();
      expect(cancelSpy).toHaveBeenCalled();
    });

    it('should not start if already running', () => {
      engine.start();
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
      engine.start();
      expect(rafSpy).not.toHaveBeenCalled();
    });
  });

  describe('createTween', () => {
    it('should create a tween', () => {
      engine.createTween('test', 0, 0, 100, 100, 1000);
      expect(engine.isTweening('test')).toBe(true);
    });

    it('should call onUpdate during tween', () => {
      const onUpdate = vi.fn();
      engine.createTween('test', 0, 0, 100, 100, 1000, Easing.linear, onUpdate);

      engine.start();
      vi.advanceTimersByTime(500);

      expect(onUpdate).toHaveBeenCalled();
    });

    it('should call onComplete when tween finishes', () => {
      const onComplete = vi.fn();
      engine.createTween('test', 0, 0, 100, 100, 1000, Easing.linear, undefined, onComplete);

      engine.start();
      vi.advanceTimersByTime(1100);

      expect(onComplete).toHaveBeenCalled();
      expect(engine.isTweening('test')).toBe(false);
    });

    it('should interpolate correctly with linear easing', () => {
      const updates: Array<{x: number, y: number}> = [];
      const onUpdate = (x: number, y: number) => updates.push({x, y});

      engine.createTween('test', 0, 0, 100, 100, 1000, Easing.linear, onUpdate);

      engine.start();
      vi.advanceTimersByTime(500);

      // At 50% progress, should be at (50, 50) approximately
      const lastUpdate = updates[updates.length - 1];
      expect(lastUpdate.x).toBeCloseTo(50, 1);
      expect(lastUpdate.y).toBeCloseTo(50, 1);
    });
  });

  describe('cancelTween', () => {
    it('should cancel an active tween', () => {
      engine.createTween('test', 0, 0, 100, 100, 1000);
      expect(engine.isTweening('test')).toBe(true);

      engine.cancelTween('test');
      expect(engine.isTweening('test')).toBe(false);
    });
  });

  describe('addAnimation', () => {
    it('should add an animation', () => {
      const animation: Animation = {
        id: 'walk',
        frames: [
          { spriteId: 'player-1', duration: 100, x: 0, y: 0 },
          { spriteId: 'player-2', duration: 100, x: 0, y: 0 },
        ],
        loop: true,
      };

      engine.addAnimation(animation);
      expect(engine.isPlaying('walk')).toBe(true);
    });

    it('should advance through frames', () => {
      const animation: Animation = {
        id: 'walk',
        frames: [
          { spriteId: 'player-1', duration: 100, x: 0, y: 0 },
          { spriteId: 'player-2', duration: 100, x: 0, y: 0 },
        ],
        loop: false,
      };

      engine.addAnimation(animation);
      engine.start();

      const frame1 = engine.getCurrentFrame('walk');
      expect(frame1?.spriteId).toBe('player-1');

      vi.advanceTimersByTime(150);

      const frame2 = engine.getCurrentFrame('walk');
      expect(frame2?.spriteId).toBe('player-2');
    });

    it('should loop animations when loop is true', () => {
      const animation: Animation = {
        id: 'idle',
        frames: [
          { spriteId: 'player-1', duration: 100, x: 0, y: 0 },
          { spriteId: 'player-2', duration: 100, x: 0, y: 0 },
        ],
        loop: true,
      };

      engine.addAnimation(animation);
      engine.start();

      vi.advanceTimersByTime(250);
      expect(engine.isPlaying('idle')).toBe(true);

      const frame = engine.getCurrentFrame('idle');
      expect(frame?.spriteId).toBe('player-1'); // Should loop back
    });

    it('should call onComplete when non-looping animation finishes', () => {
      const onComplete = vi.fn();
      const animation: Animation = {
        id: 'exit',
        frames: [
          { spriteId: 'player-1', duration: 100, x: 0, y: 0 },
        ],
        loop: false,
        onComplete,
      };

      engine.addAnimation(animation);
      engine.start();

      vi.advanceTimersByTime(150);

      expect(onComplete).toHaveBeenCalled();
      expect(engine.isPlaying('exit')).toBe(false);
    });
  });

  describe('animation control', () => {
    it('should pause animation', () => {
      const animation: Animation = {
        id: 'test',
        frames: [
          { spriteId: 'player-1', duration: 100, x: 0, y: 0 },
        ],
        loop: true,
      };

      engine.addAnimation(animation);
      expect(engine.isPlaying('test')).toBe(true);

      engine.pauseAnimation('test');
      expect(engine.isPlaying('test')).toBe(false);
    });

    it('should resume animation', () => {
      const animation: Animation = {
        id: 'test',
        frames: [
          { spriteId: 'player-1', duration: 100, x: 0, y: 0 },
        ],
        loop: true,
      };

      engine.addAnimation(animation);
      engine.pauseAnimation('test');

      engine.resumeAnimation('test');
      expect(engine.isPlaying('test')).toBe(true);
    });

    it('should remove animation', () => {
      const animation: Animation = {
        id: 'test',
        frames: [
          { spriteId: 'player-1', duration: 100, x: 0, y: 0 },
        ],
        loop: true,
      };

      engine.addAnimation(animation);
      expect(engine.isPlaying('test')).toBe(true);

      engine.removeAnimation('test');
      expect(engine.isPlaying('test')).toBe(false);
      expect(engine.getCurrentFrame('test')).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all animations and tweens', () => {
      engine.createTween('tween1', 0, 0, 100, 100, 1000);
      engine.addAnimation({
        id: 'anim1',
        frames: [{ spriteId: 'test', duration: 100, x: 0, y: 0 }],
        loop: true,
      });

      expect(engine.getTweenCount()).toBe(1);
      expect(engine.getAnimationCount()).toBe(1);

      engine.clear();

      expect(engine.getTweenCount()).toBe(0);
      expect(engine.getAnimationCount()).toBe(0);
    });
  });

  describe('easing functions', () => {
    it('should apply different easing functions', () => {
      const linearUpdates: number[] = [];
      const easeInUpdates: number[] = [];

      engine.createTween('linear', 0, 0, 100, 0, 1000, Easing.linear, (x) => linearUpdates.push(x));
      engine.createTween('easeIn', 0, 0, 100, 0, 1000, Easing.easeInQuad, (x) => easeInUpdates.push(x));

      engine.start();
      vi.advanceTimersByTime(500);

      // Linear should be near 50 at 50% progress
      const lastLinear = linearUpdates[linearUpdates.length - 1];
      expect(lastLinear).toBeCloseTo(50, 1);

      // EaseIn should be less than 50 at 50% progress (slow start)
      const lastEaseIn = easeInUpdates[easeInUpdates.length - 1];
      expect(lastEaseIn).toBeLessThan(30);
    });
  });
});

// Add 15+ more tests covering:
// - Edge cases (empty frames, zero duration, etc.)
// - Multiple simultaneous animations
// - Multiple simultaneous tweens
// - Boundary conditions
// - Error handling
```

### Step 5: Test Easing Functions

Create `frontend/src/rendering/easing.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { Easing } from './easing';

describe('Easing', () => {
  describe('linear', () => {
    it('should return input value', () => {
      expect(Easing.linear(0)).toBe(0);
      expect(Easing.linear(0.5)).toBe(0.5);
      expect(Easing.linear(1)).toBe(1);
    });
  });

  describe('easeInQuad', () => {
    it('should start slow and accelerate', () => {
      expect(Easing.easeInQuad(0)).toBe(0);
      expect(Easing.easeInQuad(0.5)).toBe(0.25);
      expect(Easing.easeInQuad(1)).toBe(1);
    });
  });

  describe('easeOutQuad', () => {
    it('should start fast and decelerate', () => {
      expect(Easing.easeOutQuad(0)).toBe(0);
      expect(Easing.easeOutQuad(0.5)).toBe(0.75);
      expect(Easing.easeOutQuad(1)).toBe(1);
    });
  });

  // Add tests for all easing functions
});
```

---

## 🧪 Testing Requirements

- **Framework:** Vitest (NOT Jest)
- **Minimum Tests:** 40+
- **Coverage:** All public methods, edge cases, easing functions

**Key test scenarios:**
1. Animation loop start/stop
2. Tween creation and interpolation
3. Animation frame progression
4. Looping vs non-looping animations
5. Callback execution (onComplete, onUpdate)
6. Pause/resume functionality
7. Multiple simultaneous animations/tweens
8. Easing function correctness
9. Edge cases (empty frames, zero duration)
10. Cleanup (clear, remove)

**Mock requestAnimationFrame:**
```typescript
vi.useFakeTimers();
vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
  return setTimeout(cb, 16) as unknown as number; // ~60fps
});
```

---

## 🔍 Verification Checklist

**Before claiming completion, verify ALL of these:**

### Code
- [ ] All files created: `ls -la frontend/src/rendering/AnimationEngine.ts frontend/src/rendering/easing.ts`
- [ ] No syntax errors: `npm run type-check`
- [ ] Follows existing patterns
- [ ] No debug code (console.log, TODOs)
- [ ] Uses requestAnimationFrame correctly
- [ ] Proper cleanup (cancelAnimationFrame)

### Tests
- [ ] Tests written: `ls -la frontend/src/rendering/*.test.ts`
- [ ] Tests pass: `npm test -- AnimationEngine`
- [ ] Test count: 40+ (you should exceed this!)
- [ ] No test errors or warnings
- [ ] Covers all easing functions

### Git
- [ ] Branch name correct: `claude/animation-engine-d4-[YOUR-SESSION-ID]`
- [ ] In correct directory: `/home/user/openjones/openjones-web`
- [ ] Changes staged: `git status`
- [ ] Committed: `git log -1 --oneline`
- [ ] Pushed: `git push -u origin claude/animation-engine-d4-[YOUR-SESSION-ID]`
- [ ] Verified: `git ls-remote origin claude/animation-engine-d4-[YOUR-SESSION-ID]`

### Final Commands
```bash
# Run ALL these commands and paste output in your report
npm run type-check 2>&1 | tail -30
npm test -- AnimationEngine 2>&1 | tail -30
npm test -- easing 2>&1 | tail -20
ls -la frontend/src/rendering/
wc -l frontend/src/rendering/AnimationEngine.ts frontend/src/rendering/easing.ts
git log -1 --oneline
```

---

## 🚫 Common Mistakes to Avoid

1. **Using Jest instead of Vitest** - Import from 'vitest', not 'jest'
2. **Not using fake timers** - Use vi.useFakeTimers() for animation tests
3. **Memory leaks** - Always cancelAnimationFrame in stop()
4. **Precision errors** - Use toBeCloseTo() for float comparisons
5. **Not testing callbacks** - Test onComplete, onUpdate execution
6. **Forgetting cleanup** - Test clear() removes all animations/tweens

---

## 📝 Final Report (REQUIRED)

**When complete, create your completion report:**

```bash
cat > .coordinator/rounds/round-04/worker-1-report.md <<'EOF'
# Worker 1 Report: Task D4 - Animation Engine

**Branch:** claude/animation-engine-d4-[YOUR-ACTUAL-SESSION-ID]
**Commit:** [paste: git log -1 --format=%h]

## Deliverables
✅ AnimationEngine.ts (XX lines)
✅ AnimationEngine.test.ts (XX tests)
✅ easing.ts (XX lines)
✅ easing.test.ts (XX tests)
✅ types.ts updates (XX lines)

## Test Results
- Tests run: XX
- Tests passed: XX (100%)
- Command: `npm test -- AnimationEngine`

[Paste last 20 lines of test output]

## Type Check
- Status: ✅ PASSED (or note any pre-existing errors)
- Command: `npm run type-check`

## Files Created
[Paste: ls -la frontend/src/rendering/]

## Issues Encountered
[None, or describe any issues and how you resolved them]

## Notes for Integration
[Any important information for the coordinator]
EOF

git add .coordinator/rounds/round-04/worker-1-report.md
git commit -m "docs: Add Worker 1 completion report for Task D4"
git push
```

---

## 💡 Tips for Success

- **Study requestAnimationFrame** - It's key to smooth 60fps animations
- **Test with fake timers** - Makes animation tests deterministic
- **Focus on interpolation** - Smooth tweening is critical for UX
- **Write more tests** - Animation bugs are hard to debug
- **Keep it simple** - Don't over-engineer, focus on core functionality

---

## 📚 Reference

**Similar Patterns:** Session 3 rendering implementations (when merged)
**Contracts:** `shared/types/contracts.ts`
**Animation Concepts:** requestAnimationFrame, easing, tweening, keyframes

---

**Instructions generated:** 2025-11-07
**Session:** 4
**Good luck!** 🚀
