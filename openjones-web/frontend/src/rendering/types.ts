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
