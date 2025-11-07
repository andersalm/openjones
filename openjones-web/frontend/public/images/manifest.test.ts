import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Asset Manifest', () => {
  const manifestPath = join(__dirname, 'manifest.json');
  let manifest: any;

  beforeAll(() => {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  });

  describe('Manifest Structure', () => {
    it('should have valid version field', () => {
      expect(manifest).toHaveProperty('version');
      expect(manifest.version).toBe('1.0.0');
    });

    it('should have generated timestamp', () => {
      expect(manifest).toHaveProperty('generated');
      expect(typeof manifest.generated).toBe('string');
      expect(() => new Date(manifest.generated)).not.toThrow();
    });

    it('should have assets object', () => {
      expect(manifest).toHaveProperty('assets');
      expect(typeof manifest.assets).toBe('object');
    });

    it('should have all required categories', () => {
      expect(manifest.assets).toHaveProperty('buildings');
      expect(manifest.assets).toHaveProperty('characters');
      expect(manifest.assets).toHaveProperty('items');
      expect(manifest.assets).toHaveProperty('tiles');
    });

    it('should have arrays for all categories', () => {
      expect(Array.isArray(manifest.assets.buildings)).toBe(true);
      expect(Array.isArray(manifest.assets.characters)).toBe(true);
      expect(Array.isArray(manifest.assets.items)).toBe(true);
      expect(Array.isArray(manifest.assets.tiles)).toBe(true);
    });
  });

  describe('Asset Entries', () => {
    it('should have required fields for all building assets', () => {
      manifest.assets.buildings.forEach((asset: any) => {
        expect(asset).toHaveProperty('id');
        expect(asset).toHaveProperty('path');
        expect(asset).toHaveProperty('width');
        expect(asset).toHaveProperty('height');
        expect(asset).toHaveProperty('filename');
      });
    });

    it('should have required fields for all character assets', () => {
      manifest.assets.characters.forEach((asset: any) => {
        expect(asset).toHaveProperty('id');
        expect(asset).toHaveProperty('path');
        expect(asset).toHaveProperty('width');
        expect(asset).toHaveProperty('height');
      });
    });

    it('should have valid dimensions (positive integers)', () => {
      const allAssets = [
        ...manifest.assets.buildings,
        ...manifest.assets.characters,
        ...manifest.assets.items,
        ...manifest.assets.tiles
      ];

      allAssets.forEach((asset: any) => {
        expect(asset.width).toBeGreaterThan(0);
        expect(asset.height).toBeGreaterThan(0);
        expect(Number.isInteger(asset.width)).toBe(true);
        expect(Number.isInteger(asset.height)).toBe(true);
      });
    });

    it('should have valid path format', () => {
      const allAssets = [
        ...manifest.assets.buildings,
        ...manifest.assets.characters,
        ...manifest.assets.items,
        ...manifest.assets.tiles
      ];

      allAssets.forEach((asset: any) => {
        expect(asset.path).toMatch(/^(buildings|characters|items|tiles)\/.+\.png$/);
      });
    });

    it('should have non-empty IDs', () => {
      const allAssets = [
        ...manifest.assets.buildings,
        ...manifest.assets.characters,
        ...manifest.assets.items,
        ...manifest.assets.tiles
      ];

      allAssets.forEach((asset: any) => {
        expect(asset.id).toBeTruthy();
        expect(asset.id.length).toBeGreaterThan(0);
      });
    });
  });

  describe('File Existence', () => {
    it('should have all building asset files exist', () => {
      manifest.assets.buildings.forEach((asset: any) => {
        const assetPath = join(__dirname, asset.path);
        expect(existsSync(assetPath)).toBe(true);
      });
    });

    it('should have all character asset files exist', () => {
      manifest.assets.characters.forEach((asset: any) => {
        const assetPath = join(__dirname, asset.path);
        expect(existsSync(assetPath)).toBe(true);
      });
    });

    it('should have all item asset files exist', () => {
      manifest.assets.items.forEach((asset: any) => {
        const assetPath = join(__dirname, asset.path);
        expect(existsSync(assetPath)).toBe(true);
      });
    });

    it('should have all tile asset files exist', () => {
      manifest.assets.tiles.forEach((asset: any) => {
        const assetPath = join(__dirname, asset.path);
        expect(existsSync(assetPath)).toBe(true);
      });
    });
  });

  describe('Asset Categorization', () => {
    it('should categorize building assets correctly', () => {
      manifest.assets.buildings.forEach((asset: any) => {
        expect(asset.path).toMatch(/^buildings\//);
      });
      // Verify we have expected building assets
      expect(manifest.assets.buildings.length).toBeGreaterThan(0);
    });

    it('should categorize character assets correctly', () => {
      manifest.assets.characters.forEach((asset: any) => {
        expect(asset.path).toMatch(/^characters\//);
      });
    });

    it('should categorize item assets correctly', () => {
      manifest.assets.items.forEach((asset: any) => {
        expect(asset.path).toMatch(/^items\//);
      });
    });

    it('should categorize tile assets correctly', () => {
      manifest.assets.tiles.forEach((asset: any) => {
        expect(asset.path).toMatch(/^tiles\//);
      });
    });
  });

  describe('Data Integrity', () => {
    it('should not have duplicate IDs', () => {
      const allAssets = [
        ...manifest.assets.buildings,
        ...manifest.assets.characters,
        ...manifest.assets.items,
        ...manifest.assets.tiles
      ];

      const ids = allAssets.map((a: any) => a.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should not have duplicate paths', () => {
      const allAssets = [
        ...manifest.assets.buildings,
        ...manifest.assets.characters,
        ...manifest.assets.items,
        ...manifest.assets.tiles
      ];

      const paths = allAssets.map((a: any) => a.path);
      const uniquePaths = new Set(paths);
      expect(paths.length).toBe(uniquePaths.size);
    });

    it('should have expected total asset count', () => {
      const total =
        manifest.assets.buildings.length +
        manifest.assets.characters.length +
        manifest.assets.items.length +
        manifest.assets.tiles.length;

      expect(total).toBeGreaterThan(0);
      expect(total).toBe(60); // We know we have 60 assets
    });
  });

  describe('Required Assets', () => {
    it('should have bank building assets', () => {
      const bankAsset = manifest.assets.buildings.find((a: any) =>
        a.id.includes('bank') || a.filename.includes('bank')
      );
      expect(bankAsset).toBeDefined();
    });

    it('should have factory building assets', () => {
      const factoryAsset = manifest.assets.buildings.find((a: any) =>
        a.id.includes('factory') || a.filename.includes('factory')
      );
      expect(factoryAsset).toBeDefined();
    });

    it('should have character sprites', () => {
      expect(manifest.assets.characters.length).toBeGreaterThan(0);
      // Should have at least one character sprite
      const characterSprite = manifest.assets.characters.find((a: any) =>
        a.id.includes('black') || a.filename.includes('black')
      );
      expect(characterSprite).toBeDefined();
    });

    it('should have map tiles', () => {
      expect(manifest.assets.tiles.length).toBeGreaterThan(0);
      // Should have the main map asset
      const mapAsset = manifest.assets.tiles.find((a: any) =>
        a.id.includes('jones-map') || a.filename.includes('jones_map')
      );
      expect(mapAsset).toBeDefined();
    });
  });

  describe('Filename Consistency', () => {
    it('should have filename match path', () => {
      const allAssets = [
        ...manifest.assets.buildings,
        ...manifest.assets.characters,
        ...manifest.assets.items,
        ...manifest.assets.tiles
      ];

      allAssets.forEach((asset: any) => {
        expect(asset.path).toContain(asset.filename);
        expect(asset.path).toMatch(new RegExp(asset.filename + '$'));
      });
    });

    it('should have PNG extension in all filenames', () => {
      const allAssets = [
        ...manifest.assets.buildings,
        ...manifest.assets.characters,
        ...manifest.assets.items,
        ...manifest.assets.tiles
      ];

      allAssets.forEach((asset: any) => {
        expect(asset.filename).toMatch(/\.png$/);
      });
    });
  });
});
