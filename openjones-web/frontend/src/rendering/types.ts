// Sprite Manager types (Worker 1)
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

// Map Renderer types (Worker 2)
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
