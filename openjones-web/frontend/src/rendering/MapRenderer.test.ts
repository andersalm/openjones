import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MapRenderer } from './MapRenderer';
import type { IMap, IBuilding } from '@shared/types/contracts';
import { BuildingType } from '@shared/types/contracts';

// Mock Canvas API
class MockCanvasRenderingContext2D {
  fillStyle: string = '';
  strokeStyle: string = '';
  lineWidth: number = 1;
  font: string = '';
  textAlign: string = '';
  imageSmoothingEnabled: boolean = true;

  clearRect = vi.fn();
  fillRect = vi.fn();
  strokeRect = vi.fn();
  beginPath = vi.fn();
  moveTo = vi.fn();
  lineTo = vi.fn();
  stroke = vi.fn();
  drawImage = vi.fn();
  fillText = vi.fn();
}

describe('MapRenderer', () => {
  let canvas: HTMLCanvasElement;
  let ctx: MockCanvasRenderingContext2D;
  let spriteManager: any;
  let mapRenderer: MapRenderer;

  beforeEach(() => {
    // Setup mocks
    ctx = new MockCanvasRenderingContext2D();
    canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ctx),
    } as any;

    spriteManager = {
      getSprite: vi.fn(() => null),
    };

    mapRenderer = new MapRenderer(canvas, spriteManager);
  });

  describe('constructor', () => {
    it('should initialize with canvas and sprite manager', () => {
      expect(canvas.getContext).toHaveBeenCalledWith('2d');
      expect(canvas.width).toBe(640); // 5 * 128
      expect(canvas.height).toBe(480); // 5 * 96
    });

    it('should throw error if canvas context is null', () => {
      const badCanvas = {
        getContext: vi.fn(() => null),
      } as any;

      expect(() => new MapRenderer(badCanvas, spriteManager)).toThrow('Failed to get 2D context');
    });

    it('should disable image smoothing for crisp rendering', () => {
      expect(ctx.imageSmoothingEnabled).toBe(false);
    });

    it('should use default options when none provided', () => {
      expect(canvas.width).toBe(640); // 5 * 128
      expect(canvas.height).toBe(480); // 5 * 96
    });

    it('should accept custom render options', () => {
      const customCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => new MockCanvasRenderingContext2D()),
      } as any;

      new MapRenderer(customCanvas, spriteManager, {
        tileWidth: 64,
        tileHeight: 48,
        scale: 2,
      });

      expect(customCanvas.width).toBe(640); // 5 * 64 * 2
      expect(customCanvas.height).toBe(480); // 5 * 48 * 2
    });
  });

  describe('render', () => {
    it('should render map with buildings', () => {
      const mockMap: IMap = {
        width: 5,
        height: 5,
        getAllBuildings: vi.fn(() => []),
      } as any;

      mapRenderer.render(mockMap);

      expect(ctx.clearRect).toHaveBeenCalled();
      expect(ctx.fillRect).toHaveBeenCalled(); // Background
      expect(mockMap.getAllBuildings).toHaveBeenCalled();
    });

    it('should clear canvas before rendering', () => {
      const mockMap: IMap = {
        width: 5,
        height: 5,
        getAllBuildings: vi.fn(() => []),
      } as any;

      mapRenderer.render(mockMap);

      expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 640, 480);
    });

    it('should render background before buildings', () => {
      const mockMap: IMap = {
        width: 5,
        height: 5,
        getAllBuildings: vi.fn(() => []),
      } as any;

      mapRenderer.render(mockMap);

      const clearCallIndex = ctx.clearRect.mock.invocationCallOrder[0];
      const fillCallIndex = ctx.fillRect.mock.invocationCallOrder[0];

      expect(clearCallIndex).toBeLessThan(fillCallIndex);
    });

    it('should render all buildings from map', () => {
      const mockBuildings: IBuilding[] = [
        {
          id: '1',
          type: BuildingType.BANK,
          name: 'Bank',
          position: { x: 0, y: 0 } as any,
        } as any,
        {
          id: '2',
          type: BuildingType.FACTORY,
          name: 'Factory',
          position: { x: 1, y: 1 } as any,
        } as any,
      ];

      const mockMap: IMap = {
        width: 5,
        height: 5,
        getAllBuildings: vi.fn(() => mockBuildings),
      } as any;

      mapRenderer.render(mockMap);

      // Should attempt to get sprites for each building
      expect(spriteManager.getSprite).toHaveBeenCalledTimes(2);
    });
  });

  describe('clear', () => {
    it('should clear the entire canvas', () => {
      mapRenderer.clear();

      expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 640, 480);
    });
  });

  describe('renderBackground', () => {
    it('should render background with grass color', () => {
      const mockMap: IMap = {
        width: 5,
        height: 5,
        getAllBuildings: vi.fn(() => []),
      } as any;

      mapRenderer.render(mockMap);

      expect(ctx.fillStyle).toContain('#4a7c59');
    });

    it('should draw grid lines', () => {
      const mockMap: IMap = {
        width: 5,
        height: 5,
        getAllBuildings: vi.fn(() => []),
      } as any;

      mapRenderer.render(mockMap);

      // Should draw vertical and horizontal grid lines
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });
  });

  describe('renderBuilding', () => {
    it('should render building with sprite when available', () => {
      const mockSprite = {} as HTMLImageElement;
      spriteManager.getSprite.mockReturnValue(mockSprite);

      const mockBuilding: IBuilding = {
        id: '1',
        type: BuildingType.BANK,
        name: 'Bank',
        position: { x: 2, y: 3 } as any,
      } as any;

      const mockMap: IMap = {
        width: 5,
        height: 5,
        getAllBuildings: vi.fn(() => [mockBuilding]),
      } as any;

      mapRenderer.render(mockMap);

      expect(ctx.drawImage).toHaveBeenCalledWith(
        mockSprite,
        256, // 2 * 128
        288, // 3 * 96
        128,
        96
      );
    });

    it('should render placeholder when sprite is not available', () => {
      spriteManager.getSprite.mockReturnValue(null);

      const mockBuilding: IBuilding = {
        id: '1',
        type: BuildingType.BANK,
        name: 'Bank',
        position: { x: 1, y: 1 } as any,
      } as any;

      const mockMap: IMap = {
        width: 5,
        height: 5,
        getAllBuildings: vi.fn(() => [mockBuilding]),
      } as any;

      mapRenderer.render(mockMap);

      // Should render placeholder rectangle
      expect(ctx.fillRect).toHaveBeenCalled();
      expect(ctx.strokeRect).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalledWith('Bank', expect.any(Number), expect.any(Number));
    });
  });

  describe('renderPlaceholder', () => {
    it('should render gray rectangle for placeholder', () => {
      spriteManager.getSprite.mockReturnValue(null);

      const mockBuilding: IBuilding = {
        id: '1',
        type: BuildingType.BANK,
        name: 'Test Building',
        position: { x: 0, y: 0 } as any,
      } as any;

      const mockMap: IMap = {
        width: 5,
        height: 5,
        getAllBuildings: vi.fn(() => [mockBuilding]),
      } as any;

      mapRenderer.render(mockMap);

      // Verify placeholder rectangle and border were drawn
      expect(ctx.fillRect).toHaveBeenCalled();
      expect(ctx.strokeRect).toHaveBeenCalled();
    });

    it('should render building name in placeholder', () => {
      spriteManager.getSprite.mockReturnValue(null);

      const mockBuilding: IBuilding = {
        id: '1',
        type: BuildingType.BANK,
        name: 'My Building',
        position: { x: 0, y: 0 } as any,
      } as any;

      const mockMap: IMap = {
        width: 5,
        height: 5,
        getAllBuildings: vi.fn(() => [mockBuilding]),
      } as any;

      mapRenderer.render(mockMap);

      expect(ctx.fillText).toHaveBeenCalledWith('My Building', expect.any(Number), expect.any(Number));
    });
  });

  describe('getBuildingSpriteId', () => {
    it('should map FACTORY to factory-bot sprite', () => {
      const mockSprite = {} as HTMLImageElement;
      spriteManager.getSprite.mockReturnValue(mockSprite);

      const mockBuilding: IBuilding = {
        id: '1',
        type: BuildingType.FACTORY,
        name: 'Factory',
        position: { x: 0, y: 0 } as any,
      } as any;

      const mockMap: IMap = {
        width: 5,
        height: 5,
        getAllBuildings: vi.fn(() => [mockBuilding]),
      } as any;

      mapRenderer.render(mockMap);

      expect(spriteManager.getSprite).toHaveBeenCalledWith('factory-bot');
    });

    it('should map BANK to bank-bot sprite', () => {
      const mockSprite = {} as HTMLImageElement;
      spriteManager.getSprite.mockReturnValue(mockSprite);

      const mockBuilding: IBuilding = {
        id: '1',
        type: BuildingType.BANK,
        name: 'Bank',
        position: { x: 0, y: 0 } as any,
      } as any;

      const mockMap: IMap = {
        width: 5,
        height: 5,
        getAllBuildings: vi.fn(() => [mockBuilding]),
      } as any;

      mapRenderer.render(mockMap);

      expect(spriteManager.getSprite).toHaveBeenCalledWith('bank-bot');
    });

    it('should map COLLEGE to clock-bot sprite', () => {
      const mockSprite = {} as HTMLImageElement;
      spriteManager.getSprite.mockReturnValue(mockSprite);

      const mockBuilding: IBuilding = {
        id: '1',
        type: BuildingType.COLLEGE,
        name: 'College',
        position: { x: 0, y: 0 } as any,
      } as any;

      const mockMap: IMap = {
        width: 5,
        height: 5,
        getAllBuildings: vi.fn(() => [mockBuilding]),
      } as any;

      mapRenderer.render(mockMap);

      expect(spriteManager.getSprite).toHaveBeenCalledWith('clock-bot');
    });

    it('should use default sprite for unknown building type', () => {
      const mockSprite = {} as HTMLImageElement;
      spriteManager.getSprite.mockReturnValue(mockSprite);

      const mockBuilding: IBuilding = {
        id: '1',
        type: 'UNKNOWN_TYPE' as any,
        name: 'Unknown',
        position: { x: 0, y: 0 } as any,
      } as any;

      const mockMap: IMap = {
        width: 5,
        height: 5,
        getAllBuildings: vi.fn(() => [mockBuilding]),
      } as any;

      mapRenderer.render(mockMap);

      expect(spriteManager.getSprite).toHaveBeenCalledWith('test00');
    });
  });

  describe('screenToGrid', () => {
    it('should convert screen coordinates to grid coordinates', () => {
      const result = mapRenderer.screenToGrid(200, 150);
      expect(result.x).toBe(1); // 200 / 128 = 1.5 -> floor = 1
      expect(result.y).toBe(1); // 150 / 96 = 1.5 -> floor = 1
    });

    it('should handle edge coordinates (0,0)', () => {
      const result = mapRenderer.screenToGrid(0, 0);
      expect(result).toEqual({ x: 0, y: 0 });
    });

    it('should handle coordinates at tile boundaries', () => {
      const result = mapRenderer.screenToGrid(128, 96);
      expect(result).toEqual({ x: 1, y: 1 });
    });

    it('should handle coordinates at max grid position', () => {
      const result = mapRenderer.screenToGrid(500, 400);
      expect(result.x).toBe(3); // 500 / 128 = 3.9 -> floor = 3
      expect(result.y).toBe(4); // 400 / 96 = 4.1 -> floor = 4
    });

    it('should handle mid-tile coordinates', () => {
      const result = mapRenderer.screenToGrid(64, 48);
      expect(result).toEqual({ x: 0, y: 0 });
    });
  });

  describe('resize', () => {
    it('should adjust scale to fit viewport', () => {
      mapRenderer.resize({ width: 320, height: 240 });

      // Scale should be 0.5 (smaller dimension: 320/640 or 240/480)
      const size = mapRenderer.getCanvasSize();
      expect(size.width).toBe(320); // 5 * 128 * 0.5
      expect(size.height).toBe(240); // 5 * 96 * 0.5
    });

    it('should not scale beyond 1', () => {
      mapRenderer.resize({ width: 1280, height: 960 });

      // Scale should be 1 (max)
      const size = mapRenderer.getCanvasSize();
      expect(size.width).toBe(640); // 5 * 128 * 1
      expect(size.height).toBe(480); // 5 * 96 * 1
    });

    it('should maintain aspect ratio', () => {
      mapRenderer.resize({ width: 400, height: 600 });

      const size = mapRenderer.getCanvasSize();
      // Should scale by width (400/640 = 0.625)
      expect(size.width).toBe(400);
      expect(size.height).toBe(300); // 5 * 96 * 0.625
    });

    it('should handle very small viewports', () => {
      mapRenderer.resize({ width: 64, height: 48 });

      const size = mapRenderer.getCanvasSize();
      expect(size.width).toBe(64);
      expect(size.height).toBe(48);
    });
  });

  describe('getCanvasSize', () => {
    it('should return current canvas dimensions', () => {
      const size = mapRenderer.getCanvasSize();
      expect(size.width).toBe(640);
      expect(size.height).toBe(480);
    });

    it('should return updated size after resize', () => {
      mapRenderer.resize({ width: 320, height: 240 });

      const size = mapRenderer.getCanvasSize();
      expect(size.width).toBe(320);
      expect(size.height).toBe(240);
    });
  });

  describe('integration', () => {
    it('should handle multiple buildings at different positions', () => {
      const mockSprite = {} as HTMLImageElement;
      spriteManager.getSprite.mockReturnValue(mockSprite);

      const mockBuildings: IBuilding[] = [
        {
          id: '1',
          type: BuildingType.BANK,
          name: 'Bank',
          position: { x: 0, y: 0 } as any,
        } as any,
        {
          id: '2',
          type: BuildingType.FACTORY,
          name: 'Factory',
          position: { x: 4, y: 4 } as any,
        } as any,
        {
          id: '3',
          type: BuildingType.COLLEGE,
          name: 'College',
          position: { x: 2, y: 2 } as any,
        } as any,
      ];

      const mockMap: IMap = {
        width: 5,
        height: 5,
        getAllBuildings: vi.fn(() => mockBuildings),
      } as any;

      mapRenderer.render(mockMap);

      expect(ctx.drawImage).toHaveBeenCalledTimes(3);
    });

    it('should handle empty map', () => {
      const mockMap: IMap = {
        width: 5,
        height: 5,
        getAllBuildings: vi.fn(() => []),
      } as any;

      mapRenderer.render(mockMap);

      expect(ctx.clearRect).toHaveBeenCalled();
      expect(ctx.fillRect).toHaveBeenCalled(); // Background only
      expect(ctx.drawImage).not.toHaveBeenCalled();
    });

    it('should handle mixed sprite availability', () => {
      const mockSprite = {} as HTMLImageElement;
      spriteManager.getSprite
        .mockReturnValueOnce(mockSprite)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(mockSprite);

      const mockBuildings: IBuilding[] = [
        {
          id: '1',
          type: BuildingType.BANK,
          name: 'Bank',
          position: { x: 0, y: 0 } as any,
        } as any,
        {
          id: '2',
          type: BuildingType.FACTORY,
          name: 'Factory',
          position: { x: 1, y: 1 } as any,
        } as any,
        {
          id: '3',
          type: BuildingType.COLLEGE,
          name: 'College',
          position: { x: 2, y: 2 } as any,
        } as any,
      ];

      const mockMap: IMap = {
        width: 5,
        height: 5,
        getAllBuildings: vi.fn(() => mockBuildings),
      } as any;

      mapRenderer.render(mockMap);

      // Two sprites rendered, one placeholder
      expect(ctx.drawImage).toHaveBeenCalledTimes(2);
      expect(ctx.fillText).toHaveBeenCalledWith('Factory', expect.any(Number), expect.any(Number));
    });
  });
});
