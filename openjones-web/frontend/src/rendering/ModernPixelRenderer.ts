/**
 * ModernPixelRenderer - Modern retro pixel art rendering system
 *
 * Creates cohesive, beautiful pixel art using:
 * - Procedural generation for tiles
 * - SVG-based building sprites
 * - Modern color palette with retro aesthetic
 * - Smooth animations with pixel-perfect rendering
 */

import { IBuilding, IPlayer, BuildingType } from '@shared/types/contracts';

/**
 * Modern retro color palette - carefully chosen for cohesion
 */
export const PIXEL_PALETTE = {
  // Background colors
  grass: {
    light: '#7FC87F',
    base: '#5EAA5E',
    dark: '#4A8F4A',
    shadow: '#366636',
  },

  // Building colors (vibrant but cohesive)
  buildings: {
    factory: {
      base: '#8B4513',
      accent: '#CD853F',
      shadow: '#5C3010',
      highlight: '#DEB887',
    },
    employment: {
      base: '#4169E1',
      accent: '#6495ED',
      shadow: '#1E3A8A',
      highlight: '#87CEEB',
    },
    bank: {
      base: '#FFD700',
      accent: '#FFA500',
      shadow: '#B8860B',
      highlight: '#FFEC8B',
    },
    college: {
      base: '#9370DB',
      accent: '#BA55D3',
      shadow: '#6A4C93',
      highlight: '#DDA0DD',
    },
    restaurant: {
      base: '#DC143C',
      accent: '#FF6B6B',
      shadow: '#8B0000',
      highlight: '#FFB6C1',
    },
    clothes: {
      base: '#FF1493',
      accent: '#FF69B4',
      shadow: '#C71585',
      highlight: '#FFB6D9',
    },
    rent: {
      base: '#32CD32',
      accent: '#90EE90',
      shadow: '#228B22',
      highlight: '#98FB98',
    },
    apartment: {
      base: '#708090',
      accent: '#B0C4DE',
      shadow: '#4B5563',
      highlight: '#D3D3D3',
    },
  },

  // Player colors
  player: {
    primary: '#FFD700',
    shadow: '#B8860B',
    highlight: '#FFEC8B',
  },

  // UI colors
  ui: {
    border: '#2C2C2C',
    text: '#FFFFFF',
    shadow: '#000000',
  },
};

/**
 * Render a pixel-perfect grass tile
 */
export function renderGrassTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number = 0
): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // Base grass color
  ctx.fillStyle = PIXEL_PALETTE.grass.base;
  ctx.fillRect(x, y, width, height);

  // Add procedural grass details (pixel-perfect)
  const pixelSize = 4; // 4x4 pixel blocks for retro feel
  const cols = Math.floor(width / pixelSize);
  const rows = Math.floor(height / pixelSize);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Pseudo-random but consistent
      const hash = (row * cols + col + seed) * 2654435761;
      const rand = (hash % 100) / 100;

      let color: string;
      if (rand < 0.05) {
        color = PIXEL_PALETTE.grass.light; // Lighter patches
      } else if (rand < 0.1) {
        color = PIXEL_PALETTE.grass.dark; // Darker patches
      } else if (rand < 0.12) {
        color = PIXEL_PALETTE.grass.shadow; // Shadow patches
      } else {
        continue; // Keep base color
      }

      ctx.fillStyle = color;
      ctx.fillRect(x + col * pixelSize, y + row * pixelSize, pixelSize, pixelSize);
    }
  }

  ctx.restore();
}

/**
 * Render a modern isometric building
 */
export function renderModernBuilding(
  ctx: CanvasRenderingContext2D,
  building: IBuilding,
  x: number,
  y: number,
  width: number,
  height: number,
  isSelected: boolean = false
): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // Get building colors
  const colors = getBuildingColors(building.type);

  // Building dimensions
  const buildingWidth = width - 20;
  const buildingHeight = height - 30;
  const bx = x + 10;
  const by = y + 10;

  // Shadow (isometric pseudo-3D effect)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(bx + 8, by + buildingHeight - 8, buildingWidth, 8);

  // Main building body (isometric front face)
  ctx.fillStyle = colors.base;
  ctx.fillRect(bx, by + 20, buildingWidth, buildingHeight - 20);

  // Roof (isometric top face)
  ctx.fillStyle = colors.shadow;
  const roofHeight = 20;
  ctx.beginPath();
  ctx.moveTo(bx, by + roofHeight);
  ctx.lineTo(bx + buildingWidth / 2, by);
  ctx.lineTo(bx + buildingWidth, by + roofHeight);
  ctx.lineTo(bx, by + roofHeight);
  ctx.fill();

  // Windows (pixel grid)
  const windowSize = 8;
  const windowSpacing = 12;
  const windowsPerRow = Math.floor((buildingWidth - 20) / windowSpacing);
  const windowRows = Math.floor((buildingHeight - 40) / windowSpacing);

  ctx.fillStyle = colors.accent;
  for (let row = 0; row < windowRows; row++) {
    for (let col = 0; col < windowsPerRow; col++) {
      const wx = bx + 10 + col * windowSpacing;
      const wy = by + 30 + row * windowSpacing;

      // Window with highlight
      ctx.fillStyle = '#FFE5B4'; // Light yellow for windows
      ctx.fillRect(wx, wy, windowSize, windowSize);

      // Window frame
      ctx.strokeStyle = colors.shadow;
      ctx.lineWidth = 1;
      ctx.strokeRect(wx, wy, windowSize, windowSize);
    }
  }

  // Selection highlight
  if (isSelected) {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.strokeRect(bx - 2, by - 2, buildingWidth + 4, buildingHeight + 4);
  }

  // Building name plate (modern style)
  const namePlateHeight = 18;
  const namePlateY = by + buildingHeight + 2;

  // Nameplate background with gradient
  const gradient = ctx.createLinearGradient(bx, namePlateY, bx, namePlateY + namePlateHeight);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
  ctx.fillStyle = gradient;
  ctx.fillRect(bx, namePlateY, buildingWidth, namePlateHeight);

  // Building name text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let displayName = building.name;
  if (displayName.length > 13) {
    displayName = displayName.substring(0, 11) + '..';
  }

  ctx.fillText(displayName, bx + buildingWidth / 2, namePlateY + namePlateHeight / 2);

  ctx.restore();
}

/**
 * Render a modern pixel-art player sprite
 */
export function renderModernPlayer(
  ctx: CanvasRenderingContext2D,
  player: IPlayer,
  x: number,
  y: number,
  size: number
): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  const centerX = Math.floor(x);
  const centerY = Math.floor(y);

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + size * 0.4, size * 0.5, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Player body (pixel-perfect circle approximation)
  const bodyRadius = size * 0.4;
  ctx.fillStyle = player.color;

  // Draw pixelated circle
  drawPixelCircle(ctx, centerX, centerY, bodyRadius);

  // Outline for definition
  ctx.strokeStyle = darkenColor(player.color, 30);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, bodyRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Eyes (simple pixels)
  const eyeSize = 4;
  const eyeY = centerY - bodyRadius * 0.3;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(centerX - bodyRadius * 0.3, eyeY, eyeSize, eyeSize);
  ctx.fillRect(centerX + bodyRadius * 0.3 - eyeSize, eyeY, eyeSize, eyeSize);

  // Pupils
  ctx.fillStyle = '#000000';
  const pupilSize = 2;
  ctx.fillRect(centerX - bodyRadius * 0.3 + 1, eyeY + 1, pupilSize, pupilSize);
  ctx.fillRect(centerX + bodyRadius * 0.3 - eyeSize + 1, eyeY + 1, pupilSize, pupilSize);

  // Name label
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const nameY = centerY + size * 0.5;
  ctx.fillRect(centerX - 25, nameY, 50, 14);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(player.name, centerX, nameY + 2);

  ctx.restore();
}

/**
 * Helper: Draw pixel-perfect circle
 */
function drawPixelCircle(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number
): void {
  const pixelSize = 2;
  const steps = Math.ceil(radius * 2 / pixelSize);

  for (let i = -steps; i <= steps; i++) {
    for (let j = -steps; j <= steps; j++) {
      const px = centerX + i * pixelSize;
      const py = centerY + j * pixelSize;
      const dist = Math.sqrt(Math.pow(i * pixelSize, 2) + Math.pow(j * pixelSize, 2));

      if (dist <= radius) {
        ctx.fillRect(px, py, pixelSize, pixelSize);
      }
    }
  }
}

/**
 * Helper: Get building colors by type
 */
function getBuildingColors(type: BuildingType): {
  base: string;
  accent: string;
  shadow: string;
  highlight: string;
} {
  const mapping: Record<string, keyof typeof PIXEL_PALETTE.buildings> = {
    [BuildingType.FACTORY]: 'factory',
    [BuildingType.EMPLOYMENT_AGENCY]: 'employment',
    [BuildingType.BANK]: 'bank',
    [BuildingType.COLLEGE]: 'college',
    [BuildingType.RESTAURANT]: 'restaurant',
    [BuildingType.CLOTHES_STORE]: 'clothes',
    [BuildingType.RENT_AGENCY]: 'rent',
    [BuildingType.LOW_COST_APARTMENT]: 'apartment',
    [BuildingType.SECURITY_APARTMENT]: 'apartment',
  };

  const colorKey = mapping[type] || 'apartment';
  return PIXEL_PALETTE.buildings[colorKey];
}

/**
 * Helper: Darken a color
 */
function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.floor((num >> 16) * (1 - percent / 100)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - percent / 100)));
  const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - percent / 100)));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}
