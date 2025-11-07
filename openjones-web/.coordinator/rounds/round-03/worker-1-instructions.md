# Worker 1: Task D2 - Sprite Manager

**Session Type:** WORKER
**Branch:** `claude/sprite-manager-d2-[YOUR-SESSION-ID]`
**Date:** 2025-11-07
**Session:** 3

---

## 🎯 Primary Objective

Implement the SpriteManager class for loading, caching, and managing game sprites (images) for the OpenJones browser port. This is a critical rendering component that will be used by the MapRenderer and other rendering systems.

---

## 📦 Deliverables

- [ ] `frontend/src/rendering/SpriteManager.ts` (100-150 lines)
- [ ] `frontend/src/rendering/SpriteManager.test.ts` (25+ tests)
- [ ] Type definitions for sprite loading
- [ ] Error handling for missing/failed images
- [ ] Completion report file

---

## 🚀 Quick Start

```bash
cd /home/user/openjones/openjones-web
git checkout -b claude/sprite-manager-d2-[YOUR-SESSION-ID]

# Verify assets exist
ls -la frontend/public/images/manifest.json
cat frontend/public/images/manifest.json | head -30

# Create rendering directory
mkdir -p frontend/src/rendering
```

---

## 📚 Context

The asset preparation (Task D1) was completed in Session 2. All PNG assets are now organized in `frontend/public/images/` with a manifest file that describes:
- 60 PNG assets (buildings, characters, items, tiles)
- Organized into subdirectories
- Manifest with dimensions and metadata

**Your task:** Create a SpriteManager class that:
1. Loads the manifest.json file
2. Loads sprite images asynchronously
3. Caches loaded images for reuse
4. Provides sprite lookup by ID
5. Handles loading errors gracefully
6. Tracks loading progress

**This task blocks:** MapRenderer (D3), AnimationEngine (D4), all visual rendering

**Existing asset structure:**
```bash
frontend/public/images/
├── buildings/     # 20+ building sprites
├── characters/    # Player and NPC sprites
├── items/         # Possessions sprites
├── tiles/         # Map tiles
└── manifest.json  # Asset metadata
```

**Manifest format:**
```json
{
  "version": "1.0.0",
  "assets": {
    "buildings": [
      { "id": "bank-bot", "path": "buildings/bank_bot.png", "width": 155, "height": 96 }
    ],
    "characters": [...],
    "items": [...],
    "tiles": [...]
  }
}
```

---

## ✅ Implementation Steps

### Step 1: Define Types

Create type definitions for the sprite system:

```typescript
// frontend/src/rendering/types.ts
export interface SpriteMetadata {
  id: string;
  path: string;
  width: number;
  height: number;
  filename?: string;
}

export interface AssetManifest {
  version: string;
  generated?: string;
  assets: {
    buildings: SpriteMetadata[];
    characters: SpriteMetadata[];
    items: SpriteMetadata[];
    tiles: SpriteMetadata[];
  };
}

export interface LoadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
```

### Step 2: Implement SpriteManager Class

Create `frontend/src/rendering/SpriteManager.ts`:

```typescript
import type { AssetManifest, SpriteMetadata, LoadProgress } from './types';

export class SpriteManager {
  private manifest: AssetManifest | null = null;
  private sprites: Map<string, HTMLImageElement> = new Map();
  private loading: Map<string, Promise<HTMLImageElement>> = new Map();
  private basePath: string;

  constructor(basePath: string = '/images') {
    this.basePath = basePath;
  }

  /**
   * Load the asset manifest from JSON file
   */
  async loadManifest(): Promise<AssetManifest> {
    const response = await fetch(`${this.basePath}/manifest.json`);
    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.statusText}`);
    }
    this.manifest = await response.json();
    return this.manifest;
  }

  /**
   * Get all sprite metadata from manifest
   */
  getAllSprites(): SpriteMetadata[] {
    if (!this.manifest) {
      throw new Error('Manifest not loaded');
    }
    return [
      ...this.manifest.assets.buildings,
      ...this.manifest.assets.characters,
      ...this.manifest.assets.items,
      ...this.manifest.assets.tiles,
    ];
  }

  /**
   * Load a single sprite by ID
   */
  async loadSprite(spriteId: string): Promise<HTMLImageElement> {
    // Check cache first
    if (this.sprites.has(spriteId)) {
      return this.sprites.get(spriteId)!;
    }

    // Check if already loading
    if (this.loading.has(spriteId)) {
      return this.loading.get(spriteId)!;
    }

    // Find sprite metadata
    const allSprites = this.getAllSprites();
    const metadata = allSprites.find(s => s.id === spriteId);
    if (!metadata) {
      throw new Error(`Sprite not found: ${spriteId}`);
    }

    // Start loading
    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.sprites.set(spriteId, img);
        this.loading.delete(spriteId);
        resolve(img);
      };
      img.onerror = () => {
        this.loading.delete(spriteId);
        reject(new Error(`Failed to load sprite: ${spriteId} from ${metadata.path}`));
      };
      img.src = `${this.basePath}/${metadata.path}`;
    });

    this.loading.set(spriteId, loadPromise);
    return loadPromise;
  }

  /**
   * Load all sprites
   */
  async loadAllSprites(): Promise<LoadProgress> {
    const allSprites = this.getAllSprites();
    const promises = allSprites.map(sprite => this.loadSprite(sprite.id));

    await Promise.all(promises);

    return {
      loaded: this.sprites.size,
      total: allSprites.length,
      percentage: (this.sprites.size / allSprites.length) * 100,
    };
  }

  /**
   * Get a loaded sprite (synchronous)
   */
  getSprite(spriteId: string): HTMLImageElement | null {
    return this.sprites.get(spriteId) || null;
  }

  /**
   * Check if sprite is loaded
   */
  isLoaded(spriteId: string): boolean {
    return this.sprites.has(spriteId);
  }

  /**
   * Get loading progress
   */
  getProgress(): LoadProgress {
    const total = this.manifest ? this.getAllSprites().length : 0;
    const loaded = this.sprites.size;
    return {
      loaded,
      total,
      percentage: total > 0 ? (loaded / total) * 100 : 0,
    };
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.sprites.clear();
    this.loading.clear();
  }
}
```

### Step 3: Write Comprehensive Tests

Create `frontend/src/rendering/SpriteManager.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpriteManager } from './SpriteManager';

describe('SpriteManager', () => {
  let spriteManager: SpriteManager;

  beforeEach(() => {
    spriteManager = new SpriteManager('/images');
  });

  describe('loadManifest', () => {
    it('should load manifest successfully', async () => {
      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ version: '1.0.0', assets: { buildings: [], characters: [], items: [], tiles: [] } }),
      });

      const manifest = await spriteManager.loadManifest();
      expect(manifest.version).toBe('1.0.0');
    });

    it('should throw error if manifest fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, statusText: 'Not Found' });

      await expect(spriteManager.loadManifest()).rejects.toThrow('Failed to load manifest');
    });
  });

  describe('loadSprite', () => {
    it('should load sprite successfully', async () => {
      // Setup manifest
      // Mock Image loading
      // Test sprite loading
    });

    it('should cache loaded sprites', async () => {
      // Test caching behavior
    });

    it('should throw error for unknown sprite ID', async () => {
      // Test error handling
    });
  });

  describe('getProgress', () => {
    it('should track loading progress', async () => {
      // Test progress tracking
    });
  });

  // Add 20+ more tests covering:
  // - getAllSprites()
  // - getSprite()
  // - isLoaded()
  // - clear()
  // - Error cases
  // - Edge cases (empty manifest, duplicate loads, etc.)
});
```

---

## 🧪 Testing Requirements

- **Framework:** Vitest (NOT Jest)
- **Minimum Tests:** 25+
- **Coverage:** All public methods, edge cases, error conditions

**Key test scenarios:**
1. Manifest loading (success, failure, network errors)
2. Single sprite loading (success, failure, caching)
3. Bulk sprite loading (progress tracking)
4. Error handling (missing sprites, failed loads)
5. Cache management (get, clear, reuse)
6. Progress tracking (empty, partial, complete)

**Mock global Image:**
```typescript
class MockImage {
  onload: (() => void) | null = null;
  onerror: ((error: Error) => void) | null = null;
  src: string = '';

  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
}

global.Image = MockImage as any;
```

---

## 🔍 Verification Checklist

**Before claiming completion, verify ALL of these:**

### Code
- [ ] Files created: `ls -la frontend/src/rendering/SpriteManager.ts frontend/src/rendering/types.ts`
- [ ] No syntax errors: `npm run type-check`
- [ ] Clean code (no console.log, TODOs, debug flags)

### Tests
- [ ] Tests written: `ls -la frontend/src/rendering/SpriteManager.test.ts`
- [ ] Tests pass: `npm test -- SpriteManager`
- [ ] Test count: 25+ (you should exceed this!)
- [ ] No test errors or warnings

### Git
- [ ] Changes staged: `git status`
- [ ] Committed: `git log -1 --oneline`
- [ ] Pushed: `git push -u origin claude/sprite-manager-d2-[YOUR-SESSION-ID]`
- [ ] Verified: `git ls-remote origin claude/sprite-manager-d2-[YOUR-SESSION-ID]`

### Final Commands
```bash
# Run ALL these commands and capture output for your report
npm run type-check 2>&1 | tail -30
npm test -- SpriteManager 2>&1 | tail -30
ls -la frontend/src/rendering/
wc -l frontend/src/rendering/*.ts frontend/src/rendering/*.test.ts
git log -1 --oneline
```

---

## 🚫 Common Mistakes to Avoid

1. **Using Jest instead of Vitest** - Import from 'vitest', not 'jest'
2. **Not mocking Image properly** - Browser Image API needs mocking in tests
3. **Not handling async loading** - Use Promises correctly
4. **Forgetting error cases** - Test failed loads, missing sprites
5. **Not caching sprites** - Reuse loaded images, don't reload

---

## 📝 Final Report (REQUIRED)

**When complete, create your completion report:**

```bash
cat > .coordinator/rounds/round-03/worker-1-report.md <<'EOF'
# Worker 1 Report: Task D2 - Sprite Manager

**Branch:** claude/sprite-manager-d2-[YOUR-ACTUAL-SESSION-ID]
**Commit:** [paste: git log -1 --format=%h]

## Deliverables
✅ SpriteManager.ts (XX lines)
✅ SpriteManager.test.ts (XX tests)
✅ types.ts (XX lines)

## Test Results
- Tests run: XX
- Tests passed: XX (100%)
- Command: `npm test -- SpriteManager`

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

git add .coordinator/rounds/round-03/worker-1-report.md
git commit -m "docs: Add Worker 1 completion report for Task D2"
git push
```

---

## 📚 Reference

**Manifest:** `frontend/public/images/manifest.json`
**Assets:** `frontend/public/images/{buildings,characters,items,tiles}/`

---

**Instructions generated:** 2025-11-07
**Session:** 3
**Good luck!** 🚀
