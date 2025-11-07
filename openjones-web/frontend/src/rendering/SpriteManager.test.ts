import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SpriteManager } from './SpriteManager';
import type { AssetManifest } from './types';

// Mock Image class
class MockImage {
  onload: (() => void) | null = null;
  onerror: ((error: Error) => void) | null = null;
  src: string = '';
  width: number = 100;
  height: number = 100;

  constructor() {
    // Simulate successful load after a microtask
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }

  // Simulate error
  triggerError() {
    if (this.onerror) this.onerror(new Error('Image load failed'));
  }
}

// Store original Image
const originalImage = global.Image;

// Mock manifest data
const mockManifest: AssetManifest = {
  version: '1.0.0',
  generated: '2025-11-07T18:13:33.782Z',
  assets: {
    buildings: [
      {
        id: 'bank-bot',
        path: 'buildings/bank_bot.png',
        width: 155,
        height: 96,
        filename: 'bank_bot.png',
      },
      {
        id: 'clock-bot',
        path: 'buildings/clock_bot.png',
        width: 155,
        height: 96,
        filename: 'clock_bot.png',
      },
    ],
    characters: [
      {
        id: 'player',
        path: 'characters/player.png',
        width: 32,
        height: 32,
        filename: 'player.png',
      },
    ],
    items: [
      {
        id: 'coin',
        path: 'items/coin.png',
        width: 16,
        height: 16,
        filename: 'coin.png',
      },
    ],
    tiles: [
      {
        id: 'grass',
        path: 'tiles/grass.png',
        width: 32,
        height: 32,
        filename: 'grass.png',
      },
    ],
  },
};

describe('SpriteManager', () => {
  let spriteManager: SpriteManager;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    spriteManager = new SpriteManager('/images');
    // Mock global Image
    global.Image = MockImage as any;
    // Mock global fetch
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    // Restore original Image
    global.Image = originalImage;
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default basePath', () => {
      const manager = new SpriteManager();
      expect(manager).toBeInstanceOf(SpriteManager);
    });

    it('should create instance with custom basePath', () => {
      const manager = new SpriteManager('/custom/path');
      expect(manager).toBeInstanceOf(SpriteManager);
    });
  });

  describe('loadManifest', () => {
    it('should load manifest successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      });

      const manifest = await spriteManager.loadManifest();

      expect(manifest.version).toBe('1.0.0');
      expect(manifest.assets.buildings).toHaveLength(2);
      expect(mockFetch).toHaveBeenCalledWith('/images/manifest.json');
    });

    it('should throw error if manifest fetch fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(spriteManager.loadManifest()).rejects.toThrow('Failed to load manifest: Not Found');
    });

    it('should throw error if manifest fetch throws', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(spriteManager.loadManifest()).rejects.toThrow('Network error');
    });

    it('should store manifest internally', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      });

      await spriteManager.loadManifest();

      // Test that manifest is stored by calling getAllSprites
      const sprites = spriteManager.getAllSprites();
      expect(sprites).toHaveLength(5); // 2 buildings + 1 character + 1 item + 1 tile
    });
  });

  describe('getAllSprites', () => {
    it('should throw error if manifest not loaded', () => {
      expect(() => spriteManager.getAllSprites()).toThrow('Manifest not loaded');
    });

    it('should return all sprites from manifest', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      });

      await spriteManager.loadManifest();
      const sprites = spriteManager.getAllSprites();

      expect(sprites).toHaveLength(5);
      expect(sprites[0].id).toBe('bank-bot');
      expect(sprites[1].id).toBe('clock-bot');
      expect(sprites[2].id).toBe('player');
    });

    it('should flatten all asset categories', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      });

      await spriteManager.loadManifest();
      const sprites = spriteManager.getAllSprites();

      // Verify all categories are included
      const ids = sprites.map(s => s.id);
      expect(ids).toContain('bank-bot'); // building
      expect(ids).toContain('player'); // character
      expect(ids).toContain('coin'); // item
      expect(ids).toContain('grass'); // tile
    });
  });

  describe('loadSprite', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      });
      await spriteManager.loadManifest();
    });

    it('should load sprite successfully', async () => {
      const img = await spriteManager.loadSprite('bank-bot');

      expect(img).toBeInstanceOf(MockImage);
      expect(img.src).toBe('/images/buildings/bank_bot.png');
    });

    it('should cache loaded sprites', async () => {
      const img1 = await spriteManager.loadSprite('bank-bot');
      const img2 = await spriteManager.loadSprite('bank-bot');

      // Should return same instance
      expect(img1).toBe(img2);
    });

    it('should throw error for unknown sprite ID', async () => {
      await expect(spriteManager.loadSprite('unknown-sprite')).rejects.toThrow('Sprite not found: unknown-sprite');
    });

    it('should handle concurrent loads of same sprite', async () => {
      // Start two loads simultaneously
      const promise1 = spriteManager.loadSprite('player');
      const promise2 = spriteManager.loadSprite('player');

      const [img1, img2] = await Promise.all([promise1, promise2]);

      // Should get same image
      expect(img1).toBe(img2);
    });

    it('should load multiple different sprites', async () => {
      const img1 = await spriteManager.loadSprite('bank-bot');
      const img2 = await spriteManager.loadSprite('player');

      expect(img1.src).toBe('/images/buildings/bank_bot.png');
      expect(img2.src).toBe('/images/characters/player.png');
      expect(img1).not.toBe(img2);
    });

    it('should handle image load errors', async () => {
      // Mock Image to trigger error
      class ErrorImage {
        onload: (() => void) | null = null;
        onerror: ((error: Error) => void) | null = null;
        src: string = '';
        width: number = 100;
        height: number = 100;

        constructor() {
          // Simulate error after a microtask
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('Image load failed'));
            }
          }, 0);
        }
      }
      global.Image = ErrorImage as any;

      await expect(spriteManager.loadSprite('coin')).rejects.toThrow('Failed to load sprite: coin from items/coin.png');
    });

    it('should throw error if manifest not loaded', async () => {
      const freshManager = new SpriteManager();
      await expect(freshManager.loadSprite('bank-bot')).rejects.toThrow('Manifest not loaded');
    });
  });

  describe('loadAllSprites', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      });
      await spriteManager.loadManifest();
    });

    it('should load all sprites', async () => {
      const progress = await spriteManager.loadAllSprites();

      expect(progress.loaded).toBe(5);
      expect(progress.total).toBe(5);
      expect(progress.percentage).toBe(100);
    });

    it('should cache all loaded sprites', async () => {
      await spriteManager.loadAllSprites();

      // Verify all sprites are cached
      expect(spriteManager.isLoaded('bank-bot')).toBe(true);
      expect(spriteManager.isLoaded('player')).toBe(true);
      expect(spriteManager.isLoaded('coin')).toBe(true);
      expect(spriteManager.isLoaded('grass')).toBe(true);
    });

    it('should return progress with all sprites loaded', async () => {
      const progress = await spriteManager.loadAllSprites();

      expect(progress).toEqual({
        loaded: 5,
        total: 5,
        percentage: 100,
      });
    });
  });

  describe('getSprite', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      });
      await spriteManager.loadManifest();
    });

    it('should return null for unloaded sprite', () => {
      const img = spriteManager.getSprite('bank-bot');
      expect(img).toBeNull();
    });

    it('should return loaded sprite', async () => {
      await spriteManager.loadSprite('bank-bot');
      const img = spriteManager.getSprite('bank-bot');

      expect(img).not.toBeNull();
      expect(img).toBeInstanceOf(MockImage);
    });

    it('should return null for unknown sprite ID', () => {
      const img = spriteManager.getSprite('unknown');
      expect(img).toBeNull();
    });
  });

  describe('isLoaded', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      });
      await spriteManager.loadManifest();
    });

    it('should return false for unloaded sprite', () => {
      expect(spriteManager.isLoaded('bank-bot')).toBe(false);
    });

    it('should return true for loaded sprite', async () => {
      await spriteManager.loadSprite('bank-bot');
      expect(spriteManager.isLoaded('bank-bot')).toBe(true);
    });

    it('should return false for unknown sprite', () => {
      expect(spriteManager.isLoaded('unknown')).toBe(false);
    });
  });

  describe('getProgress', () => {
    it('should return zero progress when manifest not loaded', () => {
      const progress = spriteManager.getProgress();

      expect(progress).toEqual({
        loaded: 0,
        total: 0,
        percentage: 0,
      });
    });

    it('should return partial progress', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      });
      await spriteManager.loadManifest();

      // Load 2 out of 5 sprites
      await spriteManager.loadSprite('bank-bot');
      await spriteManager.loadSprite('player');

      const progress = spriteManager.getProgress();

      expect(progress.loaded).toBe(2);
      expect(progress.total).toBe(5);
      expect(progress.percentage).toBe(40);
    });

    it('should return full progress after loading all', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      });
      await spriteManager.loadManifest();
      await spriteManager.loadAllSprites();

      const progress = spriteManager.getProgress();

      expect(progress.loaded).toBe(5);
      expect(progress.total).toBe(5);
      expect(progress.percentage).toBe(100);
    });
  });

  describe('clear', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      });
      await spriteManager.loadManifest();
    });

    it('should clear loaded sprites', async () => {
      await spriteManager.loadSprite('bank-bot');
      await spriteManager.loadSprite('player');

      expect(spriteManager.isLoaded('bank-bot')).toBe(true);

      spriteManager.clear();

      expect(spriteManager.isLoaded('bank-bot')).toBe(false);
      expect(spriteManager.isLoaded('player')).toBe(false);
    });

    it('should reset progress to zero', async () => {
      await spriteManager.loadAllSprites();

      spriteManager.clear();

      const progress = spriteManager.getProgress();
      expect(progress.loaded).toBe(0);
      expect(progress.total).toBe(5); // manifest still loaded
      expect(progress.percentage).toBe(0);
    });

    it('should allow reloading after clear', async () => {
      await spriteManager.loadSprite('bank-bot');
      spriteManager.clear();

      const img = await spriteManager.loadSprite('bank-bot');
      expect(img).toBeInstanceOf(MockImage);
      expect(spriteManager.isLoaded('bank-bot')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty manifest', async () => {
      const emptyManifest: AssetManifest = {
        version: '1.0.0',
        assets: {
          buildings: [],
          characters: [],
          items: [],
          tiles: [],
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => emptyManifest,
      });

      await spriteManager.loadManifest();
      const sprites = spriteManager.getAllSprites();

      expect(sprites).toHaveLength(0);
    });

    it('should handle custom basePath', async () => {
      const customManager = new SpriteManager('/custom/path');

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      });

      await customManager.loadManifest();
      expect(mockFetch).toHaveBeenCalledWith('/custom/path/manifest.json');
    });

    it('should handle basePath without leading slash', async () => {
      const manager = new SpriteManager('images');

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      });

      await manager.loadManifest();
      expect(mockFetch).toHaveBeenCalledWith('images/manifest.json');
    });
  });
});
