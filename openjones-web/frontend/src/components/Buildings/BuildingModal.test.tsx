import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BuildingModal } from './BuildingModal';
import { BuildingType } from '../../../../shared/types/contracts';

describe('BuildingModal', () => {
  const mockBuilding = {
    id: 'test-building',
    type: BuildingType.FACTORY,
    name: 'Test Factory',
    description: 'A test factory building',
    position: { x: 0, y: 0, equals: vi.fn(), toString: vi.fn() },
    getAvailableActions: vi.fn(() => []),
    getJobOfferings: vi.fn(() => []),
    getActionTree: vi.fn(),
    canEnter: vi.fn(() => true),
    isHome: vi.fn(() => false),
  };

  const mockPlayer = {
    cash: 100,
    health: 100,
    happiness: 50,
    education: 0,
    career: 0,
    timeRemaining: 480,
    currentBuilding: null,
    position: { x: 0, y: 0 },
    job: null,
    possessions: [],
  } as any;

  const mockGame = {} as any;
  const mockOnClose = vi.fn();
  const mockOnActionExecute = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnActionExecute.mockClear();
    mockBuilding.getAvailableActions.mockReturnValue([]);
  });

  afterEach(() => {
    cleanup();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <BuildingModal
        building={mockBuilding}
        player={mockPlayer}
        game={mockGame}
        isOpen={false}
        onClose={mockOnClose}
        onActionExecute={mockOnActionExecute}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <BuildingModal
        building={mockBuilding}
        player={mockPlayer}
        game={mockGame}
        isOpen={true}
        onClose={mockOnClose}
        onActionExecute={mockOnActionExecute}
      />
    );

    expect(screen.getByTestId('building-modal')).toBeInTheDocument();
    expect(screen.getByText('Test Factory')).toBeInTheDocument();
    expect(screen.getByText('A test factory building')).toBeInTheDocument();
  });

  it('should not render when building is null', () => {
    const { container } = render(
      <BuildingModal
        building={null}
        player={mockPlayer}
        game={mockGame}
        isOpen={true}
        onClose={mockOnClose}
        onActionExecute={mockOnActionExecute}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <BuildingModal
        building={mockBuilding}
        player={mockPlayer}
        game={mockGame}
        isOpen={true}
        onClose={mockOnClose}
        onActionExecute={mockOnActionExecute}
      />
    );

    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    fireEvent.click(closeButtons[0]);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    render(
      <BuildingModal
        building={mockBuilding}
        player={mockPlayer}
        game={mockGame}
        isOpen={true}
        onClose={mockOnClose}
        onActionExecute={mockOnActionExecute}
      />
    );

    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when ESC key is pressed', () => {
    render(
      <BuildingModal
        building={mockBuilding}
        player={mockPlayer}
        game={mockGame}
        isOpen={true}
        onClose={mockOnClose}
        onActionExecute={mockOnActionExecute}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display action result when provided', () => {
    const actionResult = {
      success: true,
      message: 'Action completed successfully',
      timeSpent: 10,
      stateChanges: [
        { type: 'cash', value: 100, description: 'Earned $100' },
      ],
    };

    render(
      <BuildingModal
        building={mockBuilding}
        player={mockPlayer}
        game={mockGame}
        isOpen={true}
        onClose={mockOnClose}
        onActionExecute={mockOnActionExecute}
        actionResult={actionResult as any}
      />
    );

    expect(screen.getByText(/success/i)).toBeInTheDocument();
    expect(screen.getByText('Action completed successfully')).toBeInTheDocument();
    expect(screen.getByText(/Earned \$100/)).toBeInTheDocument();
  });

  it('should display failure result with correct styling', () => {
    const actionResult = {
      success: false,
      message: 'Action failed',
      timeSpent: 0,
      stateChanges: [],
    };

    render(
      <BuildingModal
        building={mockBuilding}
        player={mockPlayer}
        game={mockGame}
        isOpen={true}
        onClose={mockOnClose}
        onActionExecute={mockOnActionExecute}
        actionResult={actionResult as any}
      />
    );

    expect(screen.getByText(/failed/i)).toBeInTheDocument();
    expect(screen.getByText('Action failed')).toBeInTheDocument();
  });

  it('should show back to actions button when result is displayed', () => {
    const actionResult = {
      success: true,
      message: 'Done',
      timeSpent: 5,
      stateChanges: [],
    };

    render(
      <BuildingModal
        building={mockBuilding}
        player={mockPlayer}
        game={mockGame}
        isOpen={true}
        onClose={mockOnClose}
        onActionExecute={mockOnActionExecute}
        actionResult={actionResult as any}
      />
    );

    expect(screen.getByText(/Back to Actions/i)).toBeInTheDocument();
  });

  it('should call getAvailableActions on building', () => {
    render(
      <BuildingModal
        building={mockBuilding}
        player={mockPlayer}
        game={mockGame}
        isOpen={true}
        onClose={mockOnClose}
        onActionExecute={mockOnActionExecute}
      />
    );

    expect(mockBuilding.getAvailableActions).toHaveBeenCalledWith(mockPlayer, mockGame);
  });

  it('should display exit building button', () => {
    render(
      <BuildingModal
        building={mockBuilding}
        player={mockPlayer}
        game={mockGame}
        isOpen={true}
        onClose={mockOnClose}
        onActionExecute={mockOnActionExecute}
      />
    );

    expect(screen.getByText(/Exit Building/i)).toBeInTheDocument();
  });
});
