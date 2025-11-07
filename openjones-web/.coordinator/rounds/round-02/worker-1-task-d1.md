# Worker 1: Task D1 - Asset Preparation

**Session Type:** WORKER
**Branch:** `claude/asset-preparation-d1-[YOUR-SESSION-ID]`
**Date:** 2025-11-07
**Session:** 2

---

## 🎯 Primary Objective

Prepare and organize all visual assets for the OpenJones browser port by copying PNG images from the Java project, optimizing them, and creating an organized asset structure with a manifest file.

---

## 📦 Deliverables

- [ ] All PNG assets copied from `../../openjones/openjones/images/`
- [ ] Assets organized into subdirectories: buildings/, characters/, items/, tiles/
- [ ] Asset optimization script (`scripts/optimize-assets.js`)
- [ ] Asset manifest file (`frontend/public/images/manifest.json`)
- [ ] Documentation (`frontend/public/images/README.md`)
- [ ] Unit tests for asset manifest validation (15+ tests)

---

## 🚀 Quick Start

```bash
cd /home/user/openjones/openjones-web
git checkout -b claude/asset-preparation-d1-[YOUR-SESSION-ID]

# Verify Java assets exist
ls ../../openjones/openjones/images/ 2>&1 | head -20

# Create directory structure
mkdir -p frontend/public/images/{buildings,characters,items,tiles}
mkdir -p scripts
```

---

## 📚 Context

The original Jones in the Fast Lane game has PNG image assets that need to be ported to the browser version. These assets include:
- **Buildings:** Visual representations of all game buildings (Bank, Factory, College, etc.)
- **Characters:** Player sprites and animations
- **Items:** Possessions (food, clothes, appliances, stocks)
- **Tiles:** Map tiles and background elements

**This task blocks:** All rendering tasks (D2, D3, D4, D5) depend on these assets

**Asset organization pattern:**
```
frontend/public/images/
├── buildings/
│   ├── bank.png
│   ├── factory.png
│   ├── college.png
│   └── ...
├── characters/
│   ├── player-blue.png
│   ├── player-red.png
│   └── ...
├── items/
│   ├── food-*.png
│   ├── clothes-*.png
│   └── ...
├── tiles/
│   └── *.png
├── manifest.json
└── README.md
```

---

## ✅ Implementation Steps

### Step 1: Explore and Copy Assets

```bash
# Explore Java asset structure
cd /home/user/openjones/openjones/images
find . -name "*.png" -type f | sort

# Copy all PNG assets to web project
cd /home/user/openjones/openjones-web
cp -r ../../openjones/openjones/images/*.png frontend/public/images/
```

### Step 2: Organize by Category

Create a Node.js script to organize assets by type:

```bash
# Create organization script
cat > scripts/organize-assets.js << 'EOF'
// This script organizes assets into categories
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../frontend/public/images');
const categories = {
  buildings: ['bank', 'factory', 'college', 'rent', 'apartment', 'store', 'shop', 'restaurant'],
  characters: ['player', 'person', 'character'],
  items: ['food', 'clothes', 'appliance', 'stock'],
  tiles: ['tile', 'background', 'ground']
};

// Organize files...
// [Implementation details]
EOF
```

### Step 3: Create Asset Manifest

Create `frontend/public/images/manifest.json`:

```json
{
  "version": "1.0.0",
  "assets": {
    "buildings": [
      { "id": "bank", "path": "buildings/bank.png", "width": 128, "height": 128 },
      { "id": "factory", "path": "buildings/factory.png", "width": 128, "height": 128 }
    ],
    "characters": [
      { "id": "player-blue", "path": "characters/player-blue.png", "width": 32, "height": 32 }
    ],
    "items": [],
    "tiles": []
  }
}
```

### Step 4: Create Optimization Script

Create `scripts/optimize-assets.js`:

```javascript
#!/usr/bin/env node
/**
 * Asset optimization script
 * - Validates all images exist
 * - Generates manifest.json
 * - Reports asset statistics
 */

const fs = require('fs');
const path = require('path');

function optimizeAssets() {
  const imagesDir = path.join(__dirname, '../frontend/public/images');

  // Scan for all PNG files
  // Create manifest entries
  // Validate dimensions
  // Generate manifest.json

  console.log('Asset optimization complete!');
}

optimizeAssets();
```

### Step 5: Create Documentation

Create `frontend/public/images/README.md`:

```markdown
# OpenJones Visual Assets

## Directory Structure

- **buildings/**: Building sprites (128x128 px)
- **characters/**: Player and NPC sprites (32x32 px)
- **items/**: Possession icons (24x24 px)
- **tiles/**: Map tiles and backgrounds (64x64 px)

## Asset Naming Convention

- Lowercase with hyphens: `low-cost-apartment.png`
- Descriptive names matching building/item IDs
- No spaces or special characters

## Manifest File

`manifest.json` contains metadata for all assets:
- Asset ID (matches game entity ID)
- File path
- Dimensions
- Category

## Usage

```typescript
import manifest from './images/manifest.json';

const bankAsset = manifest.assets.buildings.find(b => b.id === 'bank');
// Load: frontend/public/images/buildings/bank.png
```
```

### Step 6: Create Manifest Validation Tests

Create `frontend/public/images/manifest.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Asset Manifest', () => {
  const manifestPath = join(__dirname, 'manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  it('should have valid structure', () => {
    expect(manifest).toHaveProperty('version');
    expect(manifest).toHaveProperty('assets');
    expect(manifest.assets).toHaveProperty('buildings');
    expect(manifest.assets).toHaveProperty('characters');
  });

  it('should have all building assets exist', () => {
    manifest.assets.buildings.forEach((asset: any) => {
      const assetPath = join(__dirname, asset.path);
      expect(existsSync(assetPath)).toBe(true);
    });
  });

  // Add 13+ more tests...
});
```

---

## 🧪 Testing Requirements

- **Framework:** Vitest (NOT Jest)
- **Minimum Tests:** 15+
- **Coverage:** Manifest validation, file existence, proper categorization

**Test areas:**
1. Manifest structure validation
2. All referenced assets exist
3. No broken paths
4. Proper categorization
5. Valid dimensions
6. No duplicate IDs
7. Required assets present (bank, factory, etc.)

---

## 🔍 Verification Checklist

**Before claiming completion, verify ALL of these:**

### Code & Assets
- [ ] Assets copied: `ls -la frontend/public/images/ | wc -l`
- [ ] Organized by category: `ls frontend/public/images/buildings/ | head -10`
- [ ] Manifest exists: `cat frontend/public/images/manifest.json | head -20`
- [ ] Optimization script: `cat scripts/optimize-assets.js | head -20`
- [ ] Documentation: `cat frontend/public/images/README.md | head -20`
- [ ] No broken symlinks or empty files

### Tests
- [ ] Tests written: `ls -la frontend/public/images/*.test.ts`
- [ ] Tests pass: `npm test -- manifest.test.ts`
- [ ] Test count: 15+ tests (you should exceed this)
- [ ] All assets validated

### Git
- [ ] Changes staged: `git status`
- [ ] Committed: `git log -1 --oneline`
- [ ] Pushed: `git push -u origin claude/asset-preparation-d1-[YOUR-SESSION-ID]`
- [ ] Verified: `git ls-remote origin claude/asset-preparation-d1-[YOUR-SESSION-ID]`

### Final Commands
```bash
# Run ALL these commands and paste output in your report
npm run type-check 2>&1 | grep -E "(error|warning)" || echo "No errors"
npm test -- manifest.test.ts 2>&1 | tail -20
ls -la frontend/public/images/ | head -20
ls -la frontend/public/images/buildings/ | head -10
cat frontend/public/images/manifest.json | head -30
git log -1 --oneline
```

---

## 🚫 Common Mistakes to Avoid

1. **Copying instead of organizing** - Don't just dump all files, organize by category
2. **Missing manifest** - Must create manifest.json for SpriteManager to use
3. **Broken paths** - Verify all paths in manifest are correct
4. **Not testing** - Write tests to validate manifest structure
5. **Missing documentation** - README.md is required for future developers

---

## 📝 Final Report Template

**When complete, provide this report:**

```markdown
# Worker 1 Report: Task D1 - Asset Preparation

**Branch:** claude/asset-preparation-d1-[actual-session-id]
**Commit:** [paste: git log -1 --format=%h]

## Deliverables
✅ Assets copied and organized (XX files total)
✅ manifest.json (XX assets cataloged)
✅ scripts/optimize-assets.js (XX lines)
✅ frontend/public/images/README.md (documentation)
✅ manifest.test.ts (XX tests)

## Asset Statistics
- Buildings: XX assets
- Characters: XX assets
- Items: XX assets
- Tiles: XX assets
- Total: XX assets

## Test Results
- Tests run: XX
- Tests passed: XX (100%)
- Command: `npm test -- manifest.test.ts`
- Output: [paste last 10 lines]

## Type Check
- Status: ✅ PASSED
- Command: `npm run type-check`

## Files Verified
[Paste output of: ls -la frontend/public/images/]

## Issues Encountered
[None, or describe issues and resolutions]

## Notes
- All assets ready for SpriteManager (Task D2)
- Manifest format designed for easy loading
- Documentation complete for future reference
```

---

## 💡 Tips for Success

- **Check Java assets first** - Make sure source files exist
- **Organize as you copy** - Don't just dump everything
- **Test the manifest** - SpriteManager will depend on it being correct
- **Document everything** - Future developers will thank you
- **Keep it simple** - Basic organization and manifest, no over-engineering

---

## 📚 Reference

**Source Assets:** `/home/user/openjones/openjones/images/`
**Target Directory:** `frontend/public/images/`
**Script Directory:** `scripts/`

**Similar patterns in codebase:**
- Look at `shared/types/contracts.ts` for enum patterns
- Check `package.json` scripts for Node.js script patterns

---

**Instructions generated:** 2025-11-07
**Session:** 2
**Good luck!** 🚀
