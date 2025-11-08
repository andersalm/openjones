/**
 * AssetLoader - Loads and manages game sprites
 */

import { BuildingType } from '@shared/types/contracts';

export class AssetLoader {
  private sprites: Map<string, HTMLImageElement> = new Map();
  private loaded: boolean = false;
  private loadPromise: Promise<void> | null = null;

  /**
   * Mapping of building types to their sprite filenames
   */
  private readonly BUILDING_SPRITES: Record<BuildingType, string> = {
    [BuildingType.EMPLOYMENT_AGENCY]: 'employment.png',
    [BuildingType.FACTORY]: 'factory.png',
    [BuildingType.BANK]: 'bank_bot.png',
    [BuildingType.COLLEGE]: 'hitech.png',
    [BuildingType.DEPARTMENT_STORE]: 'zmart.png',
    [BuildingType.CLOTHES_STORE]: 'gt.png',
    [BuildingType.APPLIANCE_STORE]: 'socket_bot.png',
    [BuildingType.PAWN_SHOP]: 'pawn.png',
    [BuildingType.RESTAURANT]: 'monolith.png',
    [BuildingType.SUPERMARKET]: 'zmart.png',
    [BuildingType.RENT_AGENCY]: 'rent.png',
    [BuildingType.LOW_COST_APARTMENT]: 'lowcost.png',
    [BuildingType.SECURITY_APARTMENT]: 'security.png',
  };

  /**
   * Load all game assets
   */
  async load(): Promise<void> {
    if (this.loaded) {
      return;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.loadAssets();
    await this.loadPromise;
    this.loaded = true;
  }

  /**
   * Load all sprite images
   */
  private async loadAssets(): Promise<void> {
    const promises: Promise<void>[] = [];

    // Load building sprites
    for (const [buildingType, filename] of Object.entries(this.BUILDING_SPRITES)) {
      promises.push(this.loadSprite(buildingType, filename));
    }

    // Load player sprite
    promises.push(this.loadSprite('player', 'pawn.png'));

    // Load background/ground sprites
    promises.push(this.loadSprite('grass', 'grass.png'));

    await Promise.all(promises);
    console.log(`✅ Loaded ${this.sprites.size} sprites`);
  }

  /**
   * Load a single sprite
   */
  private loadSprite(key: string, filename: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.sprites.set(key, img);
        resolve();
      };
      img.onerror = () => {
        console.warn(`⚠️ Failed to load sprite: ${filename}, using placeholder`);
        // Create a placeholder colored rectangle
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#' + Math.floor(Math.random()*16777215).toString(16);
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = '#000';
        ctx.font = '10px sans-serif';
        ctx.fillText(key.substring(0, 8), 5, 30);

        const placeholderImg = new Image();
        placeholderImg.src = canvas.toDataURL();
        this.sprites.set(key, placeholderImg);
        resolve();
      };
      img.src = `/assets/sprites/${filename}`;
    });
  }

  /**
   * Get sprite for a building type
   */
  getBuildingSprite(buildingType: BuildingType): HTMLImageElement | null {
    return this.sprites.get(buildingType) || null;
  }

  /**
   * Get sprite by key
   */
  getSprite(key: string): HTMLImageElement | null {
    return this.sprites.get(key) || null;
  }

  /**
   * Check if assets are loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }
}

// Global singleton instance
export const assetLoader = new AssetLoader();
