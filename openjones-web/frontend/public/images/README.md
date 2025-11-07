# OpenJones Visual Assets

This directory contains all visual assets for the OpenJones browser port, organized by category and cataloged in `manifest.json`.

## Directory Structure

```
frontend/public/images/
├── buildings/       # Building sprites (155x96 px typical)
├── characters/      # Player and NPC sprites (155x96 px typical)
├── items/           # Possession icons (155x96 px typical)
├── tiles/           # Map tiles and backgrounds (various sizes)
├── manifest.json    # Asset metadata catalog
└── README.md        # This file
```

## Asset Categories

### Buildings (26 assets)
Visual representations of game buildings including:
- Bank (`bank_bot.png`)
- Factory (`factory_bot.png`)
- Employment Office (`employment_bot.png`, `employment_top.png`)
- Hi-Tech Building (`hitech_bot.png`, `hitech_top.png`, etc.)
- Low-Cost Housing (`lowcost.png`, `lowcost_bot.png`, `lowcost_bot2.png`)
- Rental Properties (`rent.png`, `rent_bot.png`, `rent_bot2.png`)
- Retail Stores (`zmart.png`, `clothing.png`)
- Pawn Shop (`pawn.png`, `pawn_bot.png`)
- Clock Tower (`clock_bot.png`, `clock_top.png`, etc.)
- Socket Building (`socket_bot.png`, `socket_top.png`)

### Characters (4 assets)
Player sprites and animations:
- `black_bot.png` - Character facing down
- `black_top.png` - Character facing up
- `black_right.png` - Character facing right
- `monolith.png` - Special character sprite

### Items (1 asset)
Possession icons:
- `security.png` - Security item

### Tiles (29 assets)
Map tiles, backgrounds, and test assets:
- Map assets: `jones_map.png` (775x480), `jones_map_grass.png` (775x480)
- Background: `Grass_small_blur.png`, `wall.png`
- Test tiles: `test00.png` through `test24.png` (25 test assets)

## Asset Naming Convention

All assets follow these conventions:
- **Lowercase with underscores**: `bank_bot.png`, `jones_map.png`
- **Descriptive names**: Names match or closely relate to game entity IDs
- **No spaces or special characters**: Ensures compatibility across systems
- **Consistent suffixes**: `_bot` (bottom), `_top` (top), `_left` (left), etc. for multi-part sprites

## Manifest File

The `manifest.json` file contains metadata for all assets:

```json
{
  "version": "1.0.0",
  "generated": "2025-11-07T18:13:33.782Z",
  "assets": {
    "buildings": [
      {
        "id": "bank-bot",
        "path": "buildings/bank_bot.png",
        "width": 155,
        "height": 96,
        "filename": "bank_bot.png"
      }
      // ... more assets
    ]
  }
}
```

### Manifest Fields

- **id**: Unique identifier (hyphenated, e.g., `bank-bot`)
- **path**: Relative path from images directory
- **width**: Image width in pixels
- **height**: Image height in pixels
- **filename**: Original filename

## Usage in Code

### Loading the Manifest

```typescript
import manifest from './images/manifest.json';

// Access all building assets
const buildings = manifest.assets.buildings;

// Find a specific asset
const bankAsset = buildings.find(b => b.id === 'bank-bot');
console.log(bankAsset);
// Output: { id: 'bank-bot', path: 'buildings/bank_bot.png', width: 155, height: 96, ... }
```

### Loading Images

```typescript
// In a React component or renderer
const imagePath = `/images/${bankAsset.path}`;
const img = new Image();
img.src = imagePath; // Loads: /images/buildings/bank_bot.png
```

### Using with SpriteManager

```typescript
import { SpriteManager } from '../engine/rendering/SpriteManager';
import manifest from './images/manifest.json';

const spriteManager = new SpriteManager(manifest);
await spriteManager.loadAssets();

// Render a sprite
const bankSprite = spriteManager.getSprite('bank-bot');
spriteManager.render(ctx, bankSprite, x, y);
```

## Asset Statistics

- **Total Assets**: 60 PNG files
- **Buildings**: 26 files
- **Characters**: 4 files
- **Items**: 1 file
- **Tiles**: 29 files

## Regenerating the Manifest

To regenerate the manifest after adding or modifying assets:

```bash
npm run optimize-assets
# or
node scripts/optimize-assets.js
```

This will:
1. Scan all PNG files in subdirectories
2. Read image dimensions
3. Generate/update `manifest.json`
4. Report statistics

## Source

Assets were ported from the original Java implementation located at:
`/home/user/openjones/openjones/images/`

## Notes

- All assets are in PNG format for transparency support
- Most building and character sprites are 155x96 pixels
- Map assets are larger (775x480 pixels)
- Test assets (`test00.png` - `test24.png`) are placeholder/development assets

## Future Enhancements

Potential improvements to the asset system:
- Sprite sheet consolidation for better performance
- WebP format conversion for smaller file sizes
- Retina/2x assets for high-DPI displays
- Animation frame metadata for character sprites
- Asset preloading and caching strategies
