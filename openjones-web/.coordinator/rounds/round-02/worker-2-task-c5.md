# Worker 2: Task C5 - Game Board Component

**Session Type:** WORKER
**Branch:** `claude/game-board-component-c5-[YOUR-SESSION-ID]`
**Date:** 2025-11-07
**Session:** 2

---

## 🎯 Primary Objective

Implement the GameBoard React component as the main game view container with canvas wrapper, click/touch event handling, grid position mapping, and responsive layout.

---

## 📦 Deliverables

- [ ] GameBoard.tsx (main component, 150-200 lines)
- [ ] GameBoard.test.tsx (comprehensive tests, 18+ tests)
- [ ] index.ts (component exports)
- [ ] Type definitions for click handlers
- [ ] Responsive layout with Tailwind CSS
- [ ] Grid position coordinate mapping functions

---

## 🚀 Quick Start

```bash
cd /home/user/openjones/openjones-web
git checkout -b claude/game-board-component-c5-[YOUR-SESSION-ID]

# Create component directory
mkdir -p frontend/src/components/GameBoard

# Check existing UI patterns
cat frontend/src/components/PlayerStats/PlayerStatsHUD.tsx | head -30
cat frontend/src/components/ui/Card.tsx
```

---

## 📚 Context

The GameBoard is the main game container that will hold the rendered map. It's a React component that wraps a canvas element and handles user interactions (clicking buildings, touch events).

**Completed dependencies:**
- ✅ C1: Design system (Button, Card, Panel components)
- ✅ C2: PlayerStatsHUD component
- ✅ A8: Game store (Zustand)

**This component will:**
- Contain the canvas rendering area (5x5 grid)
- Handle click events and map them to grid coordinates
- Be responsive (adapt to screen size)
- Connect to game store for state
- Support both mouse and touch input

**Future integration:**
- Task D3 (MapRenderer) will draw on this canvas
- Task D2 (SpriteManager) will provide images to render

---

## ✅ Implementation Steps

### Step 1: Create Component Structure

```typescript
// frontend/src/components/GameBoard/GameBoard.tsx
import React, { useRef, useEffect, useState } from 'react';
import { Card } from '../ui/Card';

interface GameBoardProps {
  width?: number;  // Canvas width in pixels
  height?: number; // Canvas height in pixels
  gridSize?: number; // Grid size (default 5x5)
  onCellClick?: (x: number, y: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  width = 640,
  height = 640,
  gridSize = 5,
  onCellClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCell, setHoveredCell] = useState<{x: number, y: number} | null>(null);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initial canvas setup
    canvas.width = width;
    canvas.height = height;

    // Draw placeholder grid
    drawGrid(ctx, width, height, gridSize);
  }, [width, height, gridSize]);

  // Handle click events
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onCellClick) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert pixel coordinates to grid coordinates
    const gridX = Math.floor((x / width) * gridSize);
    const gridY = Math.floor((y / height) * gridSize);

    if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
      onCellClick(gridX, gridY);
    }
  };

  return (
    <Card className="game-board-container">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="game-board-canvas"
      />
    </Card>
  );
};
```

### Step 2: Add Grid Drawing Helper

```typescript
function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number
): void {
  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;

  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;

  // Draw vertical lines
  for (let i = 0; i <= gridSize; i++) {
    const x = i * cellWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Draw horizontal lines
  for (let i = 0; i <= gridSize; i++) {
    const y = i * cellHeight;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}
```

### Step 3: Add Coordinate Mapping Utilities

```typescript
/**
 * Convert canvas pixel coordinates to grid coordinates
 */
export function pixelToGrid(
  pixelX: number,
  pixelY: number,
  canvasWidth: number,
  canvasHeight: number,
  gridSize: number
): { x: number; y: number } {
  const gridX = Math.floor((pixelX / canvasWidth) * gridSize);
  const gridY = Math.floor((pixelY / canvasHeight) * gridSize);

  return {
    x: Math.max(0, Math.min(gridX, gridSize - 1)),
    y: Math.max(0, Math.min(gridY, gridSize - 1))
  };
}

/**
 * Convert grid coordinates to canvas pixel coordinates (top-left corner)
 */
export function gridToPixel(
  gridX: number,
  gridY: number,
  canvasWidth: number,
  canvasHeight: number,
  gridSize: number
): { x: number; y: number } {
  const cellWidth = canvasWidth / gridSize;
  const cellHeight = canvasHeight / gridSize;

  return {
    x: gridX * cellWidth,
    y: gridY * cellHeight
  };
}
```

### Step 4: Add Touch Support

```typescript
const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
  const canvas = canvasRef.current;
  if (!canvas || !onCellClick) return;

  const touch = event.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  const { x: gridX, y: gridY } = pixelToGrid(x, y, width, height, gridSize);
  onCellClick(gridX, gridY);
};
```

### Step 5: Add Responsive Layout

```typescript
// Use Tailwind CSS for responsive container
<div className="flex flex-col items-center justify-center p-4">
  <Card className="w-full max-w-4xl">
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      onTouchStart={handleTouchStart}
      className="w-full h-auto touch-none"
      style={{ maxWidth: '640px', aspectRatio: '1/1' }}
    />
  </Card>
</div>
```

### Step 6: Create Exports

```typescript
// frontend/src/components/GameBoard/index.ts
export { GameBoard } from './GameBoard';
export { pixelToGrid, gridToPixel } from './GameBoard';
export type { GameBoardProps } from './GameBoard';
```

---

## 🧪 Testing Requirements

- **Framework:** Vitest + React Testing Library (NOT Jest)
- **Minimum Tests:** 18+
- **Coverage:** Rendering, click handling, coordinate conversion, responsive behavior

**Test template:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameBoard, pixelToGrid, gridToPixel } from './GameBoard';

describe('GameBoard', () => {
  it('should render canvas element', () => {
    render(<GameBoard />);
    const canvas = screen.getByRole('img'); // Canvas has implicit img role
    expect(canvas).toBeInTheDocument();
  });

  it('should call onCellClick when canvas is clicked', () => {
    const mockClick = vi.fn();
    render(<GameBoard onCellClick={mockClick} width={500} height={500} />);

    const canvas = screen.getByRole('img');
    fireEvent.click(canvas, { clientX: 50, clientY: 50 });

    expect(mockClick).toHaveBeenCalledWith(0, 0);
  });

  it('should convert pixel coordinates to grid coordinates', () => {
    const result = pixelToGrid(250, 250, 500, 500, 5);
    expect(result).toEqual({ x: 2, y: 2 });
  });

  // Add 15+ more tests...
});
```

---

## 🔍 Verification Checklist

**Before claiming completion, verify ALL of these:**

### Code
- [ ] Component created: `cat frontend/src/components/GameBoard/GameBoard.tsx | head -20`
- [ ] No syntax errors: `npm run type-check`
- [ ] Follows React 19 patterns
- [ ] Uses Tailwind CSS classes
- [ ] Touch events supported
- [ ] Coordinate mapping functions exported

### Tests
- [ ] Tests written: `ls -la frontend/src/components/GameBoard/GameBoard.test.tsx`
- [ ] Tests pass: `npm test -- GameBoard.test.tsx`
- [ ] Test count: 18+ tests (you should exceed this)
- [ ] Tests cover: rendering, clicks, touch, coordinate conversion

### Git
- [ ] Changes staged: `git status`
- [ ] Committed: `git log -1 --oneline`
- [ ] Pushed: `git push -u origin claude/game-board-component-c5-[YOUR-SESSION-ID]`
- [ ] Verified: `git ls-remote origin claude/game-board-component-c5-[YOUR-SESSION-ID]`

### Final Commands
```bash
# Run ALL these commands and paste output in your report
npm run type-check 2>&1 | grep GameBoard || echo "No errors"
npm test -- GameBoard.test.tsx 2>&1 | tail -20
ls -la frontend/src/components/GameBoard/
git log -1 --oneline
```

---

## 🚫 Common Mistakes to Avoid

1. **Using Jest instead of Vitest** - Import from 'vitest', use React Testing Library
2. **Not handling edge cases** - Grid boundaries, null canvas, missing callbacks
3. **Forgetting touch events** - Mobile support is important
4. **Canvas size issues** - Make sure canvas renders correctly at different sizes
5. **Not exporting utilities** - pixelToGrid and gridToPixel should be exported

---

## 📝 Final Report Template

```markdown
# Worker 2 Report: Task C5 - Game Board Component

**Branch:** claude/game-board-component-c5-[actual-session-id]
**Commit:** [paste: git log -1 --format=%h]

## Deliverables
✅ GameBoard.tsx (XX lines)
✅ GameBoard.test.tsx (XX tests)
✅ index.ts (exports)
✅ Coordinate mapping utilities

## Test Results
- Tests run: XX
- Tests passed: XX (100%)
- Command: `npm test -- GameBoard.test.tsx`
- Output: [paste last 10 lines]

## Type Check
- Status: ✅ PASSED
- Command: `npm run type-check`

## Files Verified
[Paste output of: ls -la frontend/src/components/GameBoard/]

## Issues Encountered
[None, or describe issues and resolutions]

## Notes
- Canvas ready for MapRenderer integration (Task D3)
- Touch and mouse events both supported
- Responsive design with Tailwind CSS
```

---

## 💡 Tips for Success

- **Check existing components** - Look at PlayerStatsHUD for React patterns
- **Test coordinate conversion** - This is critical for click handling
- **Keep canvas logic simple** - Just container for now, rendering comes later
- **Use React 19 features** - Hooks, functional components
- **Responsive design** - Test on different screen sizes

---

## 📚 Reference

**Existing UI Components:** `frontend/src/components/PlayerStats/`, `frontend/src/components/ui/`
**Game Store:** `frontend/src/store/gameStore.ts`
**Contracts:** `shared/types/contracts.ts`

---

**Instructions generated:** 2025-11-07
**Session:** 2
**Good luck!** 🚀
