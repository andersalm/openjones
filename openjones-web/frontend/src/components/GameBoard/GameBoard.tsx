import React, { useRef, useEffect, useState } from 'react';
import { Card } from '../ui/Card';

export interface GameBoardProps {
  /** Canvas width in pixels */
  width?: number;
  /** Canvas height in pixels */
  height?: number;
  /** Grid size (default 5x5) */
  gridSize?: number;
  /** Callback when a cell is clicked */
  onCellClick?: (x: number, y: number) => void;
  /** Optional className for customization */
  className?: string;
  /** Show grid lines */
  showGrid?: boolean;
}

/**
 * Convert canvas pixel coordinates to grid coordinates
 *
 * @param pixelX - X coordinate in pixels
 * @param pixelY - Y coordinate in pixels
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @param gridSize - Number of grid cells per side
 * @returns Grid coordinates clamped to valid range
 */
export function pixelToGrid(
  pixelX: number,
  pixelY: number,
  canvasWidth: number,
  canvasHeight: number,
  gridSize: number
): { x: number; y: number } {
  const gridX = Math.floor((pixelX / canvasWidth) * gridSize);
  const gridY = Math.floor((pixelY / canvasHeight) * gridSize);

  return {
    x: Math.max(0, Math.min(gridX, gridSize - 1)),
    y: Math.max(0, Math.min(gridY, gridSize - 1))
  };
}

/**
 * Convert grid coordinates to canvas pixel coordinates (top-left corner of cell)
 *
 * @param gridX - Grid X coordinate
 * @param gridY - Grid Y coordinate
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @param gridSize - Number of grid cells per side
 * @returns Pixel coordinates of top-left corner of the cell
 */
export function gridToPixel(
  gridX: number,
  gridY: number,
  canvasWidth: number,
  canvasHeight: number,
  gridSize: number
): { x: number; y: number } {
  const cellWidth = canvasWidth / gridSize;
  const cellHeight = canvasHeight / gridSize;

  return {
    x: gridX * cellWidth,
    y: gridY * cellHeight
  };
}

/**
 * Draw a grid on the canvas
 *
 * @param ctx - Canvas 2D rendering context
 * @param width - Canvas width
 * @param height - Canvas height
 * @param gridSize - Number of grid cells per side
 */
function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number
): void {
  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;

  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;

  // Draw vertical lines
  for (let i = 0; i <= gridSize; i++) {
    const x = i * cellWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Draw horizontal lines
  for (let i = 0; i <= gridSize; i++) {
    const y = i * cellHeight;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

/**
 * GameBoard component - Main game view container with canvas
 *
 * Provides:
 * - Canvas rendering area for the game map
 * - Click and touch event handling
 * - Grid coordinate mapping
 * - Responsive layout
 *
 * @example
 * <GameBoard
 *   width={640}
 *   height={640}
 *   gridSize={5}
 *   onCellClick={(x, y) => console.log(`Clicked cell: ${x}, ${y}`)}
 * />
 */
export const GameBoard: React.FC<GameBoardProps> = ({
  width = 640,
  height = 640,
  gridSize = 5,
  onCellClick,
  className = '',
  showGrid = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCell, setHoveredCell] = useState<{x: number, y: number} | null>(null);

  // Canvas setup - initialize and draw grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Fill background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, width, height, gridSize);
    }

    // Draw hovered cell highlight
    if (hoveredCell) {
      const { x: pixelX, y: pixelY } = gridToPixel(
        hoveredCell.x,
        hoveredCell.y,
        width,
        height,
        gridSize
      );
      const cellWidth = width / gridSize;
      const cellHeight = height / gridSize;

      ctx.fillStyle = 'rgba(66, 153, 225, 0.3)';
      ctx.fillRect(pixelX, pixelY, cellWidth, cellHeight);
    }
  }, [width, height, gridSize, showGrid, hoveredCell]);

  /**
   * Handle canvas click events
   */
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onCellClick) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert pixel coordinates to grid coordinates
    const { x: gridX, y: gridY } = pixelToGrid(x, y, width, height, gridSize);
    onCellClick(gridX, gridY);
  };

  /**
   * Handle touch events for mobile support
   */
  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onCellClick) return;

    // Prevent default to avoid scrolling
    event.preventDefault();

    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const { x: gridX, y: gridY } = pixelToGrid(x, y, width, height, gridSize);
    onCellClick(gridX, gridY);
  };

  /**
   * Handle mouse move for hover effects
   */
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const { x: gridX, y: gridY } = pixelToGrid(x, y, width, height, gridSize);

    // Only update if cell changed
    if (!hoveredCell || hoveredCell.x !== gridX || hoveredCell.y !== gridY) {
      setHoveredCell({ x: gridX, y: gridY });
    }
  };

  /**
   * Clear hover state when mouse leaves
   */
  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-4xl" padding="md">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onTouchStart={handleTouchStart}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-auto touch-none cursor-pointer"
          style={{ maxWidth: `${width}px`, aspectRatio: '1/1' }}
          data-testid="game-board-canvas"
        />
      </Card>
    </div>
  );
};

export default GameBoard;
