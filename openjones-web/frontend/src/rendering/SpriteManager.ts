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
    return this.manifest!;
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
