import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { GameBoard, pixelToGrid, gridToPixel } from './GameBoard';

describe('GameBoard Component', () => {
  beforeEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    it('should render canvas element', () => {
      render(<GameBoard />);
      const canvas = screen.getByTestId('game-board-canvas');
      expect(canvas).toBeInTheDocument();
    });

    it('should render with default props', () => {
      const { container } = render(<GameBoard />);
      const canvas = screen.getByTestId('game-board-canvas') as HTMLCanvasElement;
      // Canvas element exists and has proper styling
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveStyle({ maxWidth: '640px', aspectRatio: '1/1' });
    });

    it('should render with custom width props', () => {
      const { container } = render(<GameBoard width={800} height={600} />);
      const canvas = screen.getByTestId('game-board-canvas') as HTMLCanvasElement;
      // Canvas element exists and has proper styling with custom dimensions
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveStyle({ maxWidth: '800px', aspectRatio: '1/1' });
    });

    it('should apply custom className', () => {
      const { container } = render(<GameBoard className="custom-class" />);
      const wrapper = container.querySelector('.custom-class');
      expect(wrapper).toBeInTheDocument();
    });

    it('should render canvas with proper styling classes', () => {
      render(<GameBoard />);
      const canvas = screen.getByTestId('game-board-canvas');
      expect(canvas).toHaveClass('w-full', 'h-auto', 'touch-none', 'cursor-pointer');
    });
  });

  describe('Click Handling', () => {
    it('should call onCellClick when canvas is clicked', () => {
      const mockClick = vi.fn();
      render(<GameBoard onCellClick={mockClick} width={500} height={500} gridSize={5} />);

      const canvas = screen.getByTestId('game-board-canvas');

      // Mock getBoundingClientRect
      canvas.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        right: 500,
        bottom: 500,
        width: 500,
        height: 500,
        x: 0,
        y: 0,
        toJSON: () => ({})
      }));

      fireEvent.click(canvas, { clientX: 50, clientY: 50 });

      expect(mockClick).toHaveBeenCalledWith(0, 0);
    });

    it('should not call onCellClick when callback is not provided', () => {
      render(<GameBoard width={500} height={500} />);
      const canvas = screen.getByTestId('game-board-canvas');

      // Should not throw error
      expect(() => fireEvent.click(canvas, { clientX: 50, clientY: 50 })).not.toThrow();
    });

    it('should calculate correct grid coordinates for center click', () => {
      const mockClick = vi.fn();
      render(<GameBoard onCellClick={mockClick} width={500} height={500} gridSize={5} />);

      const canvas = screen.getByTestId('game-board-canvas');
      canvas.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        right: 500,
        bottom: 500,
        width: 500,
        height: 500,
        x: 0,
        y: 0,
        toJSON: () => ({})
      }));

      // Click in center cell (250, 250) should map to grid (2, 2)
      fireEvent.click(canvas, { clientX: 250, clientY: 250 });

      expect(mockClick).toHaveBeenCalledWith(2, 2);
    });

    it('should calculate correct grid coordinates for bottom-right click', () => {
      const mockClick = vi.fn();
      render(<GameBoard onCellClick={mockClick} width={500} height={500} gridSize={5} />);

      const canvas = screen.getByTestId('game-board-canvas');
      canvas.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        right: 500,
        bottom: 500,
        width: 500,
        height: 500,
        x: 0,
        y: 0,
        toJSON: () => ({})
      }));

      // Click near bottom-right (490, 490) should map to grid (4, 4)
      fireEvent.click(canvas, { clientX: 490, clientY: 490 });

      expect(mockClick).toHaveBeenCalledWith(4, 4);
    });
  });

  describe('Touch Handling', () => {
    it('should call onCellClick when canvas is touched', () => {
      const mockClick = vi.fn();
      render(<GameBoard onCellClick={mockClick} width={500} height={500} gridSize={5} />);

      const canvas = screen.getByTestId('game-board-canvas');
      canvas.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        right: 500,
        bottom: 500,
        width: 500,
        height: 500,
        x: 0,
        y: 0,
        toJSON: () => ({})
      }));

      fireEvent.touchStart(canvas, {
        touches: [{ clientX: 50, clientY: 50 }]
      });

      expect(mockClick).toHaveBeenCalledWith(0, 0);
    });

    it('should not call onCellClick on touch when callback is not provided', () => {
      render(<GameBoard width={500} height={500} />);
      const canvas = screen.getByTestId('game-board-canvas');

      // Should not throw error
      expect(() => fireEvent.touchStart(canvas, {
        touches: [{ clientX: 50, clientY: 50 }]
      })).not.toThrow();
    });

    it('should handle touch events with correct grid mapping', () => {
      const mockClick = vi.fn();
      render(<GameBoard onCellClick={mockClick} width={500} height={500} gridSize={5} />);

      const canvas = screen.getByTestId('game-board-canvas');
      canvas.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        right: 500,
        bottom: 500,
        width: 500,
        height: 500,
        x: 0,
        y: 0,
        toJSON: () => ({})
      }));

      fireEvent.touchStart(canvas, {
        touches: [{ clientX: 450, clientY: 350 }]
      });

      expect(mockClick).toHaveBeenCalledWith(4, 3);
    });
  });

  describe('Mouse Hover Effects', () => {
    it('should update hover state on mouse move', () => {
      render(<GameBoard width={500} height={500} gridSize={5} />);
      const canvas = screen.getByTestId('game-board-canvas');

      canvas.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        right: 500,
        bottom: 500,
        width: 500,
        height: 500,
        x: 0,
        y: 0,
        toJSON: () => ({})
      }));

      // Should not throw error
      expect(() => fireEvent.mouseMove(canvas, { clientX: 50, clientY: 50 })).not.toThrow();
    });

    it('should clear hover state on mouse leave', () => {
      render(<GameBoard width={500} height={500} gridSize={5} />);
      const canvas = screen.getByTestId('game-board-canvas');

      // Should not throw error
      expect(() => fireEvent.mouseLeave(canvas)).not.toThrow();
    });
  });

  describe('Grid Size Variations', () => {
    it('should handle custom grid size', () => {
      const mockClick = vi.fn();
      render(<GameBoard onCellClick={mockClick} width={500} height={500} gridSize={10} />);

      const canvas = screen.getByTestId('game-board-canvas');
      canvas.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        right: 500,
        bottom: 500,
        width: 500,
        height: 500,
        x: 0,
        y: 0,
        toJSON: () => ({})
      }));

      // With 10x10 grid, click at 250 should be grid cell 5
      fireEvent.click(canvas, { clientX: 250, clientY: 250 });

      expect(mockClick).toHaveBeenCalledWith(5, 5);
    });

    it('should handle 3x3 grid', () => {
      const mockClick = vi.fn();
      render(<GameBoard onCellClick={mockClick} width={300} height={300} gridSize={3} />);

      const canvas = screen.getByTestId('game-board-canvas');
      canvas.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        right: 300,
        bottom: 300,
        width: 300,
        height: 300,
        x: 0,
        y: 0,
        toJSON: () => ({})
      }));

      // Click at 150 should be grid cell 1 (middle)
      fireEvent.click(canvas, { clientX: 150, clientY: 150 });

      expect(mockClick).toHaveBeenCalledWith(1, 1);
    });
  });
});

describe('Coordinate Conversion Utilities', () => {
  describe('pixelToGrid', () => {
    it('should convert top-left pixel to grid (0, 0)', () => {
      const result = pixelToGrid(0, 0, 500, 500, 5);
      expect(result).toEqual({ x: 0, y: 0 });
    });

    it('should convert center pixel to grid center', () => {
      const result = pixelToGrid(250, 250, 500, 500, 5);
      expect(result).toEqual({ x: 2, y: 2 });
    });

    it('should convert bottom-right pixel to grid (4, 4)', () => {
      const result = pixelToGrid(499, 499, 500, 500, 5);
      expect(result).toEqual({ x: 4, y: 4 });
    });

    it('should clamp negative coordinates to (0, 0)', () => {
      const result = pixelToGrid(-10, -10, 500, 500, 5);
      expect(result).toEqual({ x: 0, y: 0 });
    });

    it('should clamp coordinates beyond grid bounds', () => {
      const result = pixelToGrid(600, 600, 500, 500, 5);
      expect(result).toEqual({ x: 4, y: 4 });
    });

    it('should work with non-square grids', () => {
      const result = pixelToGrid(400, 300, 800, 600, 5);
      expect(result).toEqual({ x: 2, y: 2 });
    });

    it('should work with different grid sizes', () => {
      const result = pixelToGrid(500, 500, 1000, 1000, 10);
      expect(result).toEqual({ x: 5, y: 5 });
    });
  });

  describe('gridToPixel', () => {
    it('should convert grid (0, 0) to top-left pixel', () => {
      const result = gridToPixel(0, 0, 500, 500, 5);
      expect(result).toEqual({ x: 0, y: 0 });
    });

    it('should convert grid (2, 2) to center pixel', () => {
      const result = gridToPixel(2, 2, 500, 500, 5);
      expect(result).toEqual({ x: 200, y: 200 });
    });

    it('should convert grid (4, 4) to bottom-right cell pixel', () => {
      const result = gridToPixel(4, 4, 500, 500, 5);
      expect(result).toEqual({ x: 400, y: 400 });
    });

    it('should work with non-square grids', () => {
      const result = gridToPixel(2, 2, 800, 600, 5);
      expect(result).toEqual({ x: 320, y: 240 });
    });

    it('should work with different grid sizes', () => {
      const result = gridToPixel(5, 5, 1000, 1000, 10);
      expect(result).toEqual({ x: 500, y: 500 });
    });

    it('should handle grid (1, 0) correctly', () => {
      const result = gridToPixel(1, 0, 500, 500, 5);
      expect(result).toEqual({ x: 100, y: 0 });
    });

    it('should handle grid (0, 1) correctly', () => {
      const result = gridToPixel(0, 1, 500, 500, 5);
      expect(result).toEqual({ x: 0, y: 100 });
    });
  });

  describe('Round-trip Conversion', () => {
    it('should convert pixel to grid and back to same region', () => {
      const pixelX = 250;
      const pixelY = 250;
      const width = 500;
      const height = 500;
      const gridSize = 5;

      const grid = pixelToGrid(pixelX, pixelY, width, height, gridSize);
      const pixel = gridToPixel(grid.x, grid.y, width, height, gridSize);

      // The pixel should be at the top-left corner of the same grid cell
      expect(pixel.x).toBeLessThanOrEqual(pixelX);
      expect(pixel.y).toBeLessThanOrEqual(pixelY);
      expect(pixel.x).toBeGreaterThanOrEqual(pixelX - width / gridSize);
      expect(pixel.y).toBeGreaterThanOrEqual(pixelY - height / gridSize);
    });
  });
});
