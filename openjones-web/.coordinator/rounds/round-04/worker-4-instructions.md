# Worker 4: Task A1 - Position & Route Classes

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
git checkout -b claude/position-route-a1-[YOUR-SESSION-ID]
```

**✅ If all commands succeeded, continue reading below.**
**❌ If any command failed, stop and ask for help.**

---

## 📛 Branch Naming Rules (IMPORTANT!)

Your branch name MUST follow this pattern:

**Pattern:** `claude/[task-name]-[task-id]-[YOUR-SESSION-ID]`

**✅ CORRECT Example for this task:**
- `claude/position-route-a1-011CUv12345678901234567890`

**❌ WRONG Examples (DO NOT USE!):**
- `claude/coordinator-verify-openjones-011CUv...` ← WRONG! Don't use "coordinator" pattern
- `claude/worker-4-011CUv...` ← WRONG! Don't use worker number
- `claude/task-a1-011CUv...` ← WRONG! Use descriptive name

**Why this matters:**
- Makes it easy for coordinator to find your branch
- Clear what task you worked on
- Prevents confusion with coordinator branch

---

**Session Type:** WORKER
**Branch:** `claude/position-route-a1-[YOUR-SESSION-ID]`
**Date:** 2025-11-07
**Session:** 4

---

## 🎯 Primary Objective

Implement the Position and Route classes for the OpenJones browser port. These are foundational types for the game's spatial system, used for player location, building positions, movement calculations, and pathfinding. This is a critical P0 task that unblocks many other features.

---

## 📦 Deliverables

- [ ] `frontend/src/engine/types/Position.ts` (80-100 lines)
- [ ] `frontend/src/engine/types/Route.ts` (80-100 lines)
- [ ] `frontend/src/engine/types/Position.test.ts` (15+ tests)
- [ ] `frontend/src/engine/types/Route.test.ts` (10+ tests)
- [ ] Complete implementation of IPosition and IRoute interfaces
- [ ] Completion report file

---

## 📚 Context

The contracts are defined in `shared/types/contracts.ts`. You'll be implementing concrete classes that fulfill these interfaces:

```typescript
// From shared/types/contracts.ts
export interface IPosition {
  x: number; // 0-4
  y: number; // 0-4
  equals(other: IPosition): boolean;
  toString(): string;
}

export interface IRoute {
  start: IPosition;
  end: IPosition;
  positions: IPosition[];
  distance: number;
}
```

**Your task:** Create Position and Route classes that:
1. Implement the contract interfaces
2. Provide utility methods (equals, toString, distance)
3. Validate grid boundaries (0-4 for both x and y)
4. Calculate Manhattan distance
5. Generate simple routes (straight lines initially)
6. Are immutable where appropriate
7. Have comprehensive tests

**This task blocks:** Map implementation (B2), movement actions (A5), pathfinding (E1)

**Dependencies:** None - this is a foundational task

---

## ✅ Implementation Steps

### Step 1: Review the Contracts

First, read the full IPosition and IRoute interfaces:

```bash
cat shared/types/contracts.ts | grep -A 10 "interface IPosition"
cat shared/types/contracts.ts | grep -A 10 "interface IRoute"
```

### Step 2: Implement Position Class

Create `frontend/src/engine/types/Position.ts`:

```typescript
import { IPosition } from '@shared/types/contracts';

/**
 * Represents a position on the game grid (5x5)
 * Coordinates are 0-indexed: (0,0) is top-left, (4,4) is bottom-right
 */
export class Position implements IPosition {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    // Validate grid boundaries
    if (!Position.isValid(x, y)) {
      throw new Error(`Invalid position: (${x}, ${y}). Must be 0-4 for both x and y.`);
    }

    this.x = x;
    this.y = y;
  }

  /**
   * Check if coordinates are valid (0-4)
   */
  static isValid(x: number, y: number): boolean {
    return x >= 0 && x <= 4 && y >= 0 && y <= 4;
  }

  /**
   * Check equality with another position
   */
  equals(other: IPosition): boolean {
    return this.x === other.x && this.y === other.y;
  }

  /**
   * String representation
   */
  toString(): string {
    return `(${this.x}, ${this.y})`;
  }

  /**
   * Calculate Manhattan distance to another position
   */
  distanceTo(other: IPosition): number {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }

  /**
   * Get adjacent positions (up, down, left, right)
   * Only returns valid positions within grid
   */
  getAdjacentPositions(): Position[] {
    const adjacent: Position[] = [];
    const directions = [
      { dx: 0, dy: -1 }, // up
      { dx: 0, dy: 1 },  // down
      { dx: -1, dy: 0 }, // left
      { dx: 1, dy: 0 },  // right
    ];

    for (const { dx, dy } of directions) {
      const newX = this.x + dx;
      const newY = this.y + dy;

      if (Position.isValid(newX, newY)) {
        adjacent.push(new Position(newX, newY));
      }
    }

    return adjacent;
  }

  /**
   * Create a copy of this position
   */
  clone(): Position {
    return new Position(this.x, this.y);
  }

  /**
   * Create position from JSON
   */
  static fromJSON(json: { x: number; y: number }): Position {
    return new Position(json.x, json.y);
  }

  /**
   * Convert to JSON
   */
  toJSON(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
```

### Step 3: Implement Route Class

Create `frontend/src/engine/types/Route.ts`:

```typescript
import { IRoute, IPosition } from '@shared/types/contracts';
import { Position } from './Position';

/**
 * Represents a route between two positions
 * Initially uses simple Manhattan (straight-line) pathfinding
 */
export class Route implements IRoute {
  readonly start: IPosition;
  readonly end: IPosition;
  readonly positions: IPosition[];
  readonly distance: number;

  constructor(start: IPosition, end: IPosition) {
    this.start = start;
    this.end = end;
    this.positions = Route.calculatePositions(start, end);
    this.distance = this.positions.length - 1; // Exclude start position from count
  }

  /**
   * Calculate route positions using Manhattan (straight-line) movement
   * Moves horizontally first, then vertically
   */
  private static calculatePositions(start: IPosition, end: IPosition): IPosition[] {
    const positions: IPosition[] = [];
    let currentX = start.x;
    let currentY = start.y;

    // Add start position
    positions.push(new Position(currentX, currentY));

    // Move horizontally first
    while (currentX !== end.x) {
      currentX += currentX < end.x ? 1 : -1;
      positions.push(new Position(currentX, currentY));
    }

    // Then move vertically
    while (currentY !== end.y) {
      currentY += currentY < end.y ? 1 : -1;
      positions.push(new Position(currentX, currentY));
    }

    return positions;
  }

  /**
   * Get the next position in the route after the given position
   * Returns null if position is not in route or is the end
   */
  getNextPosition(current: IPosition): IPosition | null {
    const index = this.positions.findIndex(pos =>
      pos.x === current.x && pos.y === current.y
    );

    if (index === -1 || index === this.positions.length - 1) {
      return null;
    }

    return this.positions[index + 1];
  }

  /**
   * Check if a position is on this route
   */
  containsPosition(position: IPosition): boolean {
    return this.positions.some(pos => pos.x === position.x && pos.y === position.y);
  }

  /**
   * Get remaining distance from a position on the route
   * Returns -1 if position is not on route
   */
  getRemainingDistance(from: IPosition): number {
    const index = this.positions.findIndex(pos =>
      pos.x === from.x && pos.y === from.y
    );

    if (index === -1) {
      return -1;
    }

    return this.positions.length - index - 1;
  }

  /**
   * Reverse this route (swap start and end)
   */
  reverse(): Route {
    return new Route(this.end, this.start);
  }

  /**
   * String representation
   */
  toString(): string {
    const posStrings = this.positions.map(p => `(${p.x},${p.y})`).join(' -> ');
    return `Route[${posStrings}] (distance: ${this.distance})`;
  }

  /**
   * Create route from JSON
   */
  static fromJSON(json: { start: { x: number; y: number }; end: { x: number; y: number } }): Route {
    const start = Position.fromJSON(json.start);
    const end = Position.fromJSON(json.end);
    return new Route(start, end);
  }

  /**
   * Convert to JSON
   */
  toJSON(): { start: { x: number; y: number }; end: { x: number; y: number }; distance: number } {
    return {
      start: { x: this.start.x, y: this.start.y },
      end: { x: this.end.x, y: this.end.y },
      distance: this.distance,
    };
  }
}
```

### Step 4: Write Position Tests

Create `frontend/src/engine/types/Position.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { Position } from './Position';

describe('Position', () => {
  describe('constructor', () => {
    it('should create valid position', () => {
      const pos = new Position(2, 3);
      expect(pos.x).toBe(2);
      expect(pos.y).toBe(3);
    });

    it('should create position at (0, 0)', () => {
      const pos = new Position(0, 0);
      expect(pos.x).toBe(0);
      expect(pos.y).toBe(0);
    });

    it('should create position at (4, 4)', () => {
      const pos = new Position(4, 4);
      expect(pos.x).toBe(4);
      expect(pos.y).toBe(4);
    });

    it('should throw error for x < 0', () => {
      expect(() => new Position(-1, 2)).toThrow('Invalid position');
    });

    it('should throw error for x > 4', () => {
      expect(() => new Position(5, 2)).toThrow('Invalid position');
    });

    it('should throw error for y < 0', () => {
      expect(() => new Position(2, -1)).toThrow('Invalid position');
    });

    it('should throw error for y > 4', () => {
      expect(() => new Position(2, 5)).toThrow('Invalid position');
    });
  });

  describe('isValid', () => {
    it('should return true for valid coordinates', () => {
      expect(Position.isValid(0, 0)).toBe(true);
      expect(Position.isValid(4, 4)).toBe(true);
      expect(Position.isValid(2, 3)).toBe(true);
    });

    it('should return false for invalid coordinates', () => {
      expect(Position.isValid(-1, 0)).toBe(false);
      expect(Position.isValid(0, -1)).toBe(false);
      expect(Position.isValid(5, 0)).toBe(false);
      expect(Position.isValid(0, 5)).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for same position', () => {
      const pos1 = new Position(2, 3);
      const pos2 = new Position(2, 3);
      expect(pos1.equals(pos2)).toBe(true);
    });

    it('should return false for different positions', () => {
      const pos1 = new Position(2, 3);
      const pos2 = new Position(3, 2);
      expect(pos1.equals(pos2)).toBe(false);
    });

    it('should work with IPosition interface', () => {
      const pos = new Position(2, 3);
      const ipos = { x: 2, y: 3, equals: () => true, toString: () => '' };
      expect(pos.equals(ipos)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const pos = new Position(2, 3);
      expect(pos.toString()).toBe('(2, 3)');
    });
  });

  describe('distanceTo', () => {
    it('should calculate Manhattan distance', () => {
      const pos1 = new Position(0, 0);
      const pos2 = new Position(3, 4);
      expect(pos1.distanceTo(pos2)).toBe(7);
    });

    it('should return 0 for same position', () => {
      const pos1 = new Position(2, 2);
      const pos2 = new Position(2, 2);
      expect(pos1.distanceTo(pos2)).toBe(0);
    });

    it('should calculate distance for adjacent positions', () => {
      const pos1 = new Position(2, 2);
      const pos2 = new Position(2, 3);
      expect(pos1.distanceTo(pos2)).toBe(1);
    });
  });

  describe('getAdjacentPositions', () => {
    it('should return 4 adjacent positions for center position', () => {
      const pos = new Position(2, 2);
      const adjacent = pos.getAdjacentPositions();
      expect(adjacent).toHaveLength(4);
    });

    it('should return 2 adjacent positions for corner (0,0)', () => {
      const pos = new Position(0, 0);
      const adjacent = pos.getAdjacentPositions();
      expect(adjacent).toHaveLength(2);
      expect(adjacent.some(p => p.x === 1 && p.y === 0)).toBe(true);
      expect(adjacent.some(p => p.x === 0 && p.y === 1)).toBe(true);
    });

    it('should return 3 adjacent positions for edge position', () => {
      const pos = new Position(0, 2);
      const adjacent = pos.getAdjacentPositions();
      expect(adjacent).toHaveLength(3);
    });

    it('should not return positions outside grid', () => {
      const pos = new Position(4, 4);
      const adjacent = pos.getAdjacentPositions();
      expect(adjacent.every(p => Position.isValid(p.x, p.y))).toBe(true);
    });
  });

  describe('clone', () => {
    it('should create a copy', () => {
      const pos = new Position(2, 3);
      const clone = pos.clone();
      expect(clone.x).toBe(pos.x);
      expect(clone.y).toBe(pos.y);
      expect(clone).not.toBe(pos);
    });
  });

  describe('JSON serialization', () => {
    it('should serialize to JSON', () => {
      const pos = new Position(2, 3);
      const json = pos.toJSON();
      expect(json).toEqual({ x: 2, y: 3 });
    });

    it('should deserialize from JSON', () => {
      const json = { x: 2, y: 3 };
      const pos = Position.fromJSON(json);
      expect(pos.x).toBe(2);
      expect(pos.y).toBe(3);
    });
  });
});
```

### Step 5: Write Route Tests

Create `frontend/src/engine/types/Route.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { Route } from './Route';
import { Position } from './Position';

describe('Route', () => {
  describe('constructor', () => {
    it('should create route from start to end', () => {
      const start = new Position(0, 0);
      const end = new Position(2, 2);
      const route = new Route(start, end);

      expect(route.start.x).toBe(0);
      expect(route.start.y).toBe(0);
      expect(route.end.x).toBe(2);
      expect(route.end.y).toBe(2);
    });

    it('should calculate correct distance', () => {
      const start = new Position(0, 0);
      const end = new Position(3, 4);
      const route = new Route(start, end);

      // Manhattan distance: 3 + 4 = 7
      expect(route.distance).toBe(7);
    });

    it('should include start and end in positions', () => {
      const start = new Position(0, 0);
      const end = new Position(2, 0);
      const route = new Route(start, end);

      expect(route.positions).toHaveLength(3);
      expect(route.positions[0].x).toBe(0);
      expect(route.positions[0].y).toBe(0);
      expect(route.positions[2].x).toBe(2);
      expect(route.positions[2].y).toBe(0);
    });
  });

  describe('route calculation', () => {
    it('should move horizontally then vertically', () => {
      const start = new Position(0, 0);
      const end = new Position(2, 2);
      const route = new Route(start, end);

      // Should go: (0,0) -> (1,0) -> (2,0) -> (2,1) -> (2,2)
      expect(route.positions).toHaveLength(5);
      expect(route.positions[1].x).toBe(1);
      expect(route.positions[1].y).toBe(0);
      expect(route.positions[2].x).toBe(2);
      expect(route.positions[2].y).toBe(0);
      expect(route.positions[3].x).toBe(2);
      expect(route.positions[3].y).toBe(1);
    });

    it('should handle same position route', () => {
      const start = new Position(2, 2);
      const end = new Position(2, 2);
      const route = new Route(start, end);

      expect(route.positions).toHaveLength(1);
      expect(route.distance).toBe(0);
    });

    it('should handle horizontal-only route', () => {
      const start = new Position(0, 2);
      const end = new Position(4, 2);
      const route = new Route(start, end);

      expect(route.positions).toHaveLength(5);
      expect(route.positions.every(p => p.y === 2)).toBe(true);
    });

    it('should handle vertical-only route', () => {
      const start = new Position(2, 0);
      const end = new Position(2, 4);
      const route = new Route(start, end);

      expect(route.positions).toHaveLength(5);
      expect(route.positions.every(p => p.x === 2)).toBe(true);
    });
  });

  describe('getNextPosition', () => {
    it('should return next position in route', () => {
      const route = new Route(new Position(0, 0), new Position(2, 0));
      const next = route.getNextPosition(new Position(0, 0));

      expect(next).not.toBeNull();
      expect(next!.x).toBe(1);
      expect(next!.y).toBe(0);
    });

    it('should return null for end position', () => {
      const route = new Route(new Position(0, 0), new Position(2, 0));
      const next = route.getNextPosition(new Position(2, 0));

      expect(next).toBeNull();
    });

    it('should return null for position not in route', () => {
      const route = new Route(new Position(0, 0), new Position(2, 0));
      const next = route.getNextPosition(new Position(0, 1));

      expect(next).toBeNull();
    });
  });

  describe('containsPosition', () => {
    it('should return true for position in route', () => {
      const route = new Route(new Position(0, 0), new Position(2, 2));
      expect(route.containsPosition(new Position(1, 0))).toBe(true);
      expect(route.containsPosition(new Position(2, 1))).toBe(true);
    });

    it('should return false for position not in route', () => {
      const route = new Route(new Position(0, 0), new Position(2, 0));
      expect(route.containsPosition(new Position(0, 1))).toBe(false);
    });
  });

  describe('getRemainingDistance', () => {
    it('should return correct remaining distance', () => {
      const route = new Route(new Position(0, 0), new Position(3, 0));
      expect(route.getRemainingDistance(new Position(0, 0))).toBe(3);
      expect(route.getRemainingDistance(new Position(1, 0))).toBe(2);
      expect(route.getRemainingDistance(new Position(2, 0))).toBe(1);
      expect(route.getRemainingDistance(new Position(3, 0))).toBe(0);
    });

    it('should return -1 for position not in route', () => {
      const route = new Route(new Position(0, 0), new Position(2, 0));
      expect(route.getRemainingDistance(new Position(0, 1))).toBe(-1);
    });
  });

  describe('reverse', () => {
    it('should reverse the route', () => {
      const route = new Route(new Position(0, 0), new Position(2, 2));
      const reversed = route.reverse();

      expect(reversed.start.x).toBe(2);
      expect(reversed.start.y).toBe(2);
      expect(reversed.end.x).toBe(0);
      expect(reversed.end.y).toBe(0);
      expect(reversed.distance).toBe(route.distance);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const route = new Route(new Position(0, 0), new Position(2, 0));
      const str = route.toString();

      expect(str).toContain('(0,0)');
      expect(str).toContain('(2,0)');
      expect(str).toContain('distance: 2');
    });
  });

  describe('JSON serialization', () => {
    it('should serialize to JSON', () => {
      const route = new Route(new Position(0, 0), new Position(2, 2));
      const json = route.toJSON();

      expect(json.start).toEqual({ x: 0, y: 0 });
      expect(json.end).toEqual({ x: 2, y: 2 });
      expect(json.distance).toBe(4);
    });

    it('should deserialize from JSON', () => {
      const json = { start: { x: 0, y: 0 }, end: { x: 2, y: 2 } };
      const route = Route.fromJSON(json);

      expect(route.start.x).toBe(0);
      expect(route.start.y).toBe(0);
      expect(route.end.x).toBe(2);
      expect(route.end.y).toBe(2);
    });
  });
});
```

---

## 🧪 Testing Requirements

- **Framework:** Vitest (NOT Jest)
- **Minimum Tests:** 25+ total (15+ Position, 10+ Route)
- **Coverage:** All methods, edge cases, validation

**Key test scenarios:**
1. Valid and invalid position creation
2. Position equality and comparison
3. Distance calculations
4. Adjacent positions (corners, edges, center)
5. Route calculation (horizontal, vertical, diagonal)
6. Route navigation (next position, contains)
7. Remaining distance calculation
8. Route reversal
9. JSON serialization/deserialization
10. Boundary validation

---

## 🔍 Verification Checklist

**Before claiming completion, verify ALL of these:**

### Code
- [ ] All files created: `ls -la frontend/src/engine/types/Position.ts frontend/src/engine/types/Route.ts`
- [ ] No syntax errors: `npm run type-check`
- [ ] Implements IPosition and IRoute interfaces correctly
- [ ] Uses `@shared/types/contracts` import path
- [ ] No debug code (console.log, TODOs)
- [ ] Proper TypeScript types

### Tests
- [ ] Tests written: `ls -la frontend/src/engine/types/*.test.ts`
- [ ] Tests pass: `npm test -- Position`
- [ ] Tests pass: `npm test -- Route`
- [ ] Test count: 25+ total
- [ ] No test errors or warnings
- [ ] Edge cases covered

### Git
- [ ] Branch name correct: `claude/position-route-a1-[YOUR-SESSION-ID]`
- [ ] In correct directory: `/home/user/openjones/openjones-web`
- [ ] Changes staged: `git status`
- [ ] Committed: `git log -1 --oneline`
- [ ] Pushed: `git push -u origin claude/position-route-a1-[YOUR-SESSION-ID]`
- [ ] Verified: `git ls-remote origin claude/position-route-a1-[YOUR-SESSION-ID]`

### Final Commands
```bash
# Run ALL these commands and paste output in your report
npm run type-check 2>&1 | tail -30
npm test -- Position 2>&1 | tail -20
npm test -- Route 2>&1 | tail -20
ls -la frontend/src/engine/types/
wc -l frontend/src/engine/types/Position.ts frontend/src/engine/types/Route.ts
git log -1 --oneline
```

---

## 🚫 Common Mistakes to Avoid

1. **Using Jest instead of Vitest** - Import from 'vitest', not 'jest'
2. **Wrong import path** - Use `@shared/types/contracts`, not relative paths
3. **Not validating boundaries** - Grid is 0-4, validate in constructor
4. **Mutable properties** - Use `readonly` for x, y in Position
5. **Off-by-one errors** - Distance excludes start position
6. **Not testing edge cases** - Test corners, edges, boundaries

---

## 📝 Final Report (REQUIRED)

**When complete, create your completion report:**

```bash
cat > .coordinator/rounds/round-04/worker-4-report.md <<'EOF'
# Worker 4 Report: Task A1 - Position & Route Classes

**Branch:** claude/position-route-a1-[YOUR-ACTUAL-SESSION-ID]
**Commit:** [paste: git log -1 --format=%h]

## Deliverables
✅ Position.ts (XX lines)
✅ Route.ts (XX lines)
✅ Position.test.ts (XX tests)
✅ Route.test.ts (XX tests)

## Test Results
- Position tests: XX passed
- Route tests: XX passed
- Total tests: XX
- Command: `npm test -- Position Route`

[Paste last 20 lines of test output]

## Type Check
- Status: ✅ PASSED (or note any pre-existing errors)
- Command: `npm run type-check`

## Files Created
[Paste: ls -la frontend/src/engine/types/]

## Issues Encountered
[None, or describe any issues and how you resolved them]

## Notes for Integration
- Position and Route classes are ready for use by Map, Movement, and Pathfinding systems
- Manhattan distance calculation is simple but effective for initial implementation
- Can be enhanced later with A* pathfinding for smarter routes
EOF

git add .coordinator/rounds/round-04/worker-4-report.md
git commit -m "docs: Add Worker 4 completion report for Task A1"
git push
```

---

## 💡 Tips for Success

- **Read the contracts carefully** - Your classes must match IPosition and IRoute exactly
- **Validate early** - Check boundaries in constructor, not later
- **Test thoroughly** - Edge cases (corners, boundaries) are where bugs hide
- **Keep it simple** - Manhattan pathfinding is fine for now, A* comes later
- **Immutability** - Use readonly for properties that shouldn't change

---

## 📚 Reference

**Contracts:** `shared/types/contracts.ts` (IPosition, IRoute)
**Grid Size:** 5x5 (0-4 for both x and y)
**Distance:** Manhattan distance (|x1-x2| + |y1-y2|)

---

**Instructions generated:** 2025-11-07
**Session:** 4
**Good luck!** 🚀
