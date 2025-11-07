# Worker 2: Task D3 - Map Renderer

**Session Type:** WORKER
**Branch:** `claude/map-renderer-d3-[YOUR-SESSION-ID]`
**Date:** 2025-11-07
**Session:** 3

---

## 🎯 Primary Objective

Implement the MapRenderer class for rendering the 5x5 game board with buildings, tiles, and sprites using HTML5 Canvas. This component will work with SpriteManager (Task D2) to display the visual game world.

---

## 📦 Deliverables

- [ ] `frontend/src/rendering/MapRenderer.ts` (150-200 lines)
- [ ] `frontend/src/rendering/MapRenderer.test.ts` (30+ tests)
- [ ] Canvas rendering with layers (background, buildings, sprites)
- [ ] Responsive sizing and window resize handling
- [ ] Completion report file

---

## 🚀 Quick Start

```bash
cd /home/user/openjones/openjones-web
git checkout -b claude/map-renderer-d3-[YOUR-SESSION-ID]

# Verify dependencies
ls -la frontend/src/engine/map/Map.ts
ls -la frontend/src/components/GameBoard/GameBoard.tsx

# Rendering directory should exist from Task D2
ls -la frontend/src/rendering/
```

---

## 📚 Context

**Dependencies:**
- ✅ Map system (Task B2) - Complete in Session 1
- ✅ GameBoard component (Task C5) - Complete in Session 2
- 🔄 SpriteManager (Task D2) - Being implemented in parallel (Worker 1)

**Integration point:** The GameBoard component (Session 2) provides a Canvas element. Your MapRenderer will draw on that canvas using the Map data and SpriteManager sprites.

**Existing code to reference:**
```bash
# Map class with 5x5 grid and building data
cat frontend/src/engine/map/Map.ts | head -80

# GameBoard component with canvas setup
cat frontend/src/components/GameBoard/GameBoard.tsx | head -50
```

**Key interfaces from contracts:**
```typescript
// From shared/types/contracts.ts
interface IMap {
  width: number;
  height: number;
  getBuilding(position: IPosition): IBuilding | null;
  getBuildingAt(x: number, y: number): IBuilding | null;
  getAllBuildings(): IBuilding[];
  // ... more methods
}

interface IBuilding {
  id: string;
  type: BuildingType;
  name: string;
  position: IPosition;
  // ... more properties
}
```

**Rendering requirements:**
- 5x5 grid (matching original Jones in the Fast Lane)
- Each tile: 128x96 pixels (from asset dimensions)
- Layers: background tiles → building sprites → (future: player sprites)
- Responsive: scale to fit available space
- Clean, crisp rendering (no blurring)

---

## ✅ Implementation Steps

### Step 1: Define Rendering Types

```typescript
// frontend/src/rendering/types.ts (add to existing from D2)
export interface RenderOptions {
  tileWidth: number;
  tileHeight: number;
  gridWidth: number;
  gridHeight: number;
  scale: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}
```

### Step 2: Implement MapRenderer Class

Create `frontend/src/rendering/MapRenderer.ts`:

```typescript
import type { IMap, IBuilding } from '@shared/types/contracts';
import type { SpriteManager } from './SpriteManager';
import type { RenderOptions, ViewportSize } from './types';

export class MapRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private spriteManager: SpriteManager;
  private options: RenderOptions;

  constructor(
    canvas: HTMLCanvasElement,
    spriteManager: SpriteManager,
    options?: Partial<RenderOptions>
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = ctx;
    this.spriteManager = spriteManager;

    // Default options
    this.options = {
      tileWidth: 128,
      tileHeight: 96,
      gridWidth: 5,
      gridHeight: 5,
      scale: 1,
      ...options,
    };

    this.setupCanvas();
  }

  /**
   * Setup canvas size and scaling
   */
  private setupCanvas(): void {
    const width = this.options.tileWidth * this.options.gridWidth * this.options.scale;
    const height = this.options.tileHeight * this.options.gridHeight * this.options.scale;

    this.canvas.width = width;
    this.canvas.height = height;

    // Disable image smoothing for crisp pixel art
    this.ctx.imageSmoothingEnabled = false;
  }

  /**
   * Render the complete map
   */
  render(map: IMap): void {
    this.clear();
    this.renderBackground();
    this.renderBuildings(map);
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Render background grid
   */
  private renderBackground(): void {
    // Fill with grass/background color
    this.ctx.fillStyle = '#4a7c59'; // Grass green
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid lines (optional, for development)
    this.ctx.strokeStyle = '#3a6c49';
    this.ctx.lineWidth = 1;

    for (let x = 0; x <= this.options.gridWidth; x++) {
      const xPos = x * this.options.tileWidth * this.options.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(xPos, 0);
      this.ctx.lineTo(xPos, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= this.options.gridHeight; y++) {
      const yPos = y * this.options.tileHeight * this.options.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(0, yPos);
      this.ctx.lineTo(this.canvas.width, yPos);
      this.ctx.stroke();
    }
  }

  /**
   * Render all buildings on the map
   */
  private renderBuildings(map: IMap): void {
    const buildings = map.getAllBuildings();

    for (const building of buildings) {
      this.renderBuilding(building);
    }
  }

  /**
   * Render a single building
   */
  private renderBuilding(building: IBuilding): void {
    // Get building sprite based on building type
    const spriteId = this.getBuildingSpriteId(building);
    const sprite = this.spriteManager.getSprite(spriteId);

    if (!sprite) {
      // Sprite not loaded yet, render placeholder
      this.renderPlaceholder(building);
      return;
    }

    const x = building.position.x * this.options.tileWidth * this.options.scale;
    const y = building.position.y * this.options.tileHeight * this.options.scale;
    const width = this.options.tileWidth * this.options.scale;
    const height = this.options.tileHeight * this.options.scale;

    this.ctx.drawImage(sprite, x, y, width, height);
  }

  /**
   * Render placeholder for missing sprites
   */
  private renderPlaceholder(building: IBuilding): void {
    const x = building.position.x * this.options.tileWidth * this.options.scale;
    const y = building.position.y * this.options.tileHeight * this.options.scale;
    const width = this.options.tileWidth * this.options.scale;
    const height = this.options.tileHeight * this.options.scale;

    // Draw colored rectangle
    this.ctx.fillStyle = '#888';
    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeStyle = '#444';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);

    // Draw building name
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(building.name, x + width / 2, y + height / 2);
  }

  /**
   * Map building type to sprite ID
   */
  private getBuildingSpriteId(building: IBuilding): string {
    // Map BuildingType enum to sprite IDs from manifest
    // This is a simplified mapping - adjust based on actual sprite IDs
    const typeMap: Record<string, string> = {
      FACTORY: 'factory-bot',
      BANK: 'bank-bot',
      COLLEGE: 'clock-bot', // Clock = college in original game
      EMPLOYMENT_AGENCY: 'employment-bot',
      DEPARTMENT_STORE: 'clothing', // Placeholder
      CLOTHES_STORE: 'clothing',
      APPLIANCE_STORE: 'socket-bot',
      PAWN_SHOP: 'pawn',
      RESTAURANT: 'zmart', // Placeholder
      SUPERMARKET: 'zmart',
      RENT_AGENCY: 'rent',
      LOW_COST_APARTMENT: 'lowcost',
      SECURITY_APARTMENT: 'hitech-bot',
    };

    return typeMap[building.type] || 'test00';
  }

  /**
   * Handle window resize
   */
  resize(viewportSize: ViewportSize): void {
    // Calculate scale to fit viewport
    const scaleX = viewportSize.width / (this.options.tileWidth * this.options.gridWidth);
    const scaleY = viewportSize.height / (this.options.tileHeight * this.options.gridHeight);
    this.options.scale = Math.min(scaleX, scaleY, 1); // Max scale of 1

    this.setupCanvas();
  }

  /**
   * Get canvas size
   */
  getCanvasSize(): ViewportSize {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }

  /**
   * Convert screen coordinates to grid coordinates
   */
  screenToGrid(screenX: number, screenY: number): { x: number; y: number } {
    const gridX = Math.floor(screenX / (this.options.tileWidth * this.options.scale));
    const gridY = Math.floor(screenY / (this.options.tileHeight * this.options.scale));

    return { x: gridX, y: gridY };
  }
}
```

### Step 3: Write Comprehensive Tests

Create `frontend/src/rendering/MapRenderer.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MapRenderer } from './MapRenderer';
import type { IMap, IBuilding } from '@shared/types/contracts';
import { BuildingType } from '@shared/types/contracts';

// Mock Canvas API
class MockCanvasRenderingContext2D {
  fillStyle: string = '';
  strokeStyle: string = '';
  lineWidth: number = 1;
  font: string = '';
  textAlign: string = '';
  imageSmoothingEnabled: boolean = true;

  clearRect = vi.fn();
  fillRect = vi.fn();
  strokeRect = vi.fn();
  beginPath = vi.fn();
  moveTo = vi.fn();
  lineTo = vi.fn();
  stroke = vi.fn();
  drawImage = vi.fn();
  fillText = vi.fn();
}

describe('MapRenderer', () => {
  let canvas: HTMLCanvasElement;
  let ctx: MockCanvasRenderingContext2D;
  let spriteManager: any;
  let mapRenderer: MapRenderer;

  beforeEach(() => {
    // Setup mocks
    ctx = new MockCanvasRenderingContext2D();
    canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().returns(ctx),
    } as any;

    spriteManager = {
      getSprite: vi.fn().mockReturnValue(null),
    };

    mapRenderer = new MapRenderer(canvas, spriteManager);
  });

  describe('constructor', () => {
    it('should initialize with canvas and sprite manager', () => {
      expect(canvas.getContext).toHaveBeenCalledWith('2d');
      expect(canvas.width).toBe(640); // 5 * 128
      expect(canvas.height).toBe(480); // 5 * 96
    });

    it('should throw error if canvas context is null', () => {
      const badCanvas = {
        getContext: vi.fn().returns(null),
      } as any;

      expect(() => new MapRenderer(badCanvas, spriteManager)).toThrow('Failed to get 2D context');
    });

    it('should disable image smoothing for crisp rendering', () => {
      expect(ctx.imageSmoothingEnabled).toBe(false);
    });
  });

  describe('render', () => {
    it('should render map with buildings', () => {
      const mockMap: IMap = {
        width: 5,
        height: 5,
        getAllBuildings: vi.fn().mockReturnValue([]),
      } as any;

      mapRenderer.render(mockMap);

      expect(ctx.clearRect).toHaveBeenCalled();
      expect(ctx.fillRect).toHaveBeenCalled(); // Background
    });
  });

  describe('screenToGrid', () => {
    it('should convert screen coordinates to grid coordinates', () => {
      const result = mapRenderer.screenToGrid(200, 150);
      expect(result.x).toBe(1); // 200 / 128 = 1.5 -> floor = 1
      expect(result.y).toBe(1); // 150 / 96 = 1.5 -> floor = 1
    });

    it('should handle edge coordinates', () => {
      const result = mapRenderer.screenToGrid(0, 0);
      expect(result).toEqual({ x: 0, y: 0 });
    });
  });

  // Add 25+ more tests:
  // - renderBuilding with sprite
  // - renderBuilding without sprite (placeholder)
  // - getBuildingSpriteId mapping
  // - resize functionality
  // - clear canvas
  // - renderBackground
  // - Edge cases and error handling
});
```

---

## 🧪 Testing Requirements

- **Framework:** Vitest (NOT Jest)
- **Minimum Tests:** 30+
- **Coverage:** All rendering methods, coordinate conversion, error cases

**Note on testing Canvas:**
- Mock Canvas API (getContext, drawImage, etc.)
- Test method calls, not visual output
- Verify correct coordinates and sprite IDs
- Test error handling (no context, missing sprites)

---

## 🔍 Verification Checklist

### Code
- [ ] Files created: `ls -la frontend/src/rendering/MapRenderer.ts`
- [ ] No syntax errors: `npm run type-check`
- [ ] Clean code (no console.log, TODOs)
- [ ] Follows existing patterns

### Tests
- [ ] Tests written: `ls -la frontend/src/rendering/MapRenderer.test.ts`
- [ ] Tests pass: `npm test -- MapRenderer`
- [ ] Test count: 30+ tests
- [ ] No test errors

### Integration
- [ ] Works with Map class: `import { Map } from '../engine/map/Map'`
- [ ] Works with SpriteManager (from D2)
- [ ] Ready for GameBoard integration

### Git
- [ ] Committed: `git log -1 --oneline`
- [ ] Pushed: `git push -u origin claude/map-renderer-d3-[YOUR-SESSION-ID]`

---

## 🚫 Common Mistakes to Avoid

1. **Using Jest instead of Vitest**
2. **Not mocking Canvas API** - Tests will fail in Node.js
3. **Forgetting image smoothing** - Set to false for pixel art
4. **Hard-coding sprite IDs** - Use building type mapping
5. **Not handling missing sprites** - Always render placeholder

---

## 📝 Final Report (REQUIRED)

```bash
cat > .coordinator/rounds/round-03/worker-2-report.md <<'EOF'
# Worker 2 Report: Task D3 - Map Renderer

**Branch:** claude/map-renderer-d3-[YOUR-ACTUAL-SESSION-ID]
**Commit:** [paste: git log -1 --format=%h]

## Deliverables
✅ MapRenderer.ts (XX lines)
✅ MapRenderer.test.ts (XX tests)
✅ Updated types.ts (XX lines)

## Test Results
- Tests run: XX
- Tests passed: XX (100%)
- Command: `npm test -- MapRenderer`

[Paste test output]

## Type Check
- Status: ✅ PASSED (or note pre-existing errors)

## Files Created
[Paste: ls -la frontend/src/rendering/]

## Integration Notes
- Works with Map class from engine/map
- Integrates with SpriteManager (D2)
- Ready for GameBoard component

## Issues Encountered
[None, or describe resolutions]
EOF

git add .coordinator/rounds/round-03/worker-2-report.md
git commit -m "docs: Add Worker 2 completion report for Task D3"
git push
```

---

**Instructions generated:** 2025-11-07
**Session:** 3
**Good luck!** 🚀
