import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BuildingModal, ActionResult } from './BuildingModal';
import type { IBuilding } from '../../../../shared/types/contracts';

describe('BuildingModal', () => {
  const mockBuilding: IBuilding = {
    id: 'bank',
    name: 'City Bank',
    description: 'Manage your finances and investments',
    type: 'BANK' as any,
    position: { x: 1, y: 1 } as any,
    actions: [
      {
        id: 'deposit',
        displayName: 'Deposit Money',
        description: 'Deposit cash into savings',
        timeCost: 5,
        cost: 0,
        disabled: false,
      },
      {
        id: 'withdraw',
        displayName: 'Withdraw Money',
        description: 'Withdraw from savings',
        timeCost: 5,
        cost: 0,
        disabled: false,
      },
    ],
  } as any;

  const mockOnClose = vi.fn();
  const mockOnActionSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render when open', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      expect(screen.getByTestId('building-modal')).toBeInTheDocument();
      expect(screen.getByTestId('building-name')).toHaveTextContent('City Bank');
    });

    it('should not render when closed', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={false}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      expect(screen.queryByTestId('building-modal')).not.toBeInTheDocument();
    });

    it('should not render when building is null', () => {
      render(
        <BuildingModal
          building={null}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      expect(screen.queryByTestId('building-modal')).not.toBeInTheDocument();
    });

    it('should display building description', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      expect(screen.getByTestId('building-description')).toHaveTextContent(
        'Manage your finances and investments'
      );
    });

    it('should render actions menu', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      expect(screen.getByText('Deposit Money')).toBeInTheDocument();
      expect(screen.getByText('Withdraw Money')).toBeInTheDocument();
    });

    it('should display overlay', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      expect(screen.getByTestId('building-modal-overlay')).toBeInTheDocument();
    });

    it('should display close button', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      expect(screen.getByTestId('close-button')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          className="custom-class"
        />
      );

      const modal = screen.getByTestId('building-modal');
      expect(modal.className).toContain('custom-class');
    });
  });

  describe('interactions', () => {
    it('should call onClose when close button clicked', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      fireEvent.click(screen.getByTestId('close-button'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when overlay clicked', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      fireEvent.click(screen.getByTestId('building-modal-overlay'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when modal content clicked', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      fireEvent.click(screen.getByTestId('building-modal'));
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should call onClose when ESC key pressed', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when ESC pressed and modal closed', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={false}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should call onActionSelect when action selected', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      fireEvent.click(screen.getByTestId('action-item-deposit'));
      expect(mockOnActionSelect).toHaveBeenCalledWith('deposit');
    });

    it('should not interfere with other key presses', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      fireEvent.keyDown(window, { key: 'Enter' });
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('action result display', () => {
    it('should display success result', () => {
      const result: ActionResult = {
        success: true,
        message: 'Successfully deposited $500',
        effects: {
          cashChange: -500,
        },
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      expect(screen.getByTestId('action-result')).toBeInTheDocument();
      expect(screen.getByTestId('result-message')).toHaveTextContent('Successfully deposited $500');
    });

    it('should display failure result', () => {
      const result: ActionResult = {
        success: false,
        message: 'Insufficient funds',
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      expect(screen.getByTestId('action-result')).toBeInTheDocument();
      expect(screen.getByTestId('result-message')).toHaveTextContent('Insufficient funds');
    });

    it('should display cash change positive', () => {
      const result: ActionResult = {
        success: true,
        message: 'Transaction complete',
        effects: {
          cashChange: 100,
        },
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      expect(screen.getByTestId('cash-change')).toBeInTheDocument();
      expect(screen.getByTestId('cash-change')).toHaveTextContent('+$100');
    });

    it('should display cash change negative', () => {
      const result: ActionResult = {
        success: true,
        message: 'Transaction complete',
        effects: {
          cashChange: -50,
        },
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      expect(screen.getByTestId('cash-change')).toBeInTheDocument();
      expect(screen.getByTestId('cash-change')).toHaveTextContent('-$50');
    });

    it('should display multiple effects', () => {
      const result: ActionResult = {
        success: true,
        message: 'Work shift completed',
        effects: {
          cashChange: 50,
          healthChange: -10,
          careerChange: 5,
          timeSpent: 40,
        },
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      expect(screen.getByTestId('cash-change')).toHaveTextContent('+$50');
      expect(screen.getByTestId('health-change')).toHaveTextContent('-10');
      expect(screen.getByTestId('career-change')).toHaveTextContent('+5');
      expect(screen.getByTestId('time-spent')).toHaveTextContent('40 units');
    });

    it('should have dismiss button on result', () => {
      const result: ActionResult = {
        success: true,
        message: 'Done',
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      expect(screen.getByTestId('dismiss-button')).toBeInTheDocument();
    });

    it('should call onActionSelect when dismiss clicked', () => {
      const result: ActionResult = {
        success: true,
        message: 'Done',
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      fireEvent.click(screen.getByTestId('dismiss-button'));
      expect(mockOnActionSelect).toHaveBeenCalledWith('');
    });

    it('should display health change positive', () => {
      const result: ActionResult = {
        success: true,
        message: 'Feeling great',
        effects: {
          healthChange: 20,
        },
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      expect(screen.getByTestId('health-change')).toHaveTextContent('+20');
    });

    it('should display happiness change positive', () => {
      const result: ActionResult = {
        success: true,
        message: 'Happy times',
        effects: {
          happinessChange: 15,
        },
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      expect(screen.getByTestId('happiness-change')).toHaveTextContent('+15');
    });

    it('should display education change positive', () => {
      const result: ActionResult = {
        success: true,
        message: 'Learned something',
        effects: {
          educationChange: 10,
        },
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      expect(screen.getByTestId('education-change')).toHaveTextContent('+10');
    });

    it('should not display zero effects', () => {
      const result: ActionResult = {
        success: true,
        message: 'No change',
        effects: {
          cashChange: 0,
          healthChange: 0,
        },
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      expect(screen.queryByTestId('cash-change')).not.toBeInTheDocument();
      expect(screen.queryByTestId('health-change')).not.toBeInTheDocument();
    });

    it('should display success indicator for success', () => {
      const result: ActionResult = {
        success: true,
        message: 'Success',
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      const resultDiv = screen.getByTestId('action-result');
      expect(resultDiv.textContent).toContain('✓');
    });

    it('should display failure indicator for failure', () => {
      const result: ActionResult = {
        success: false,
        message: 'Failed',
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      const resultDiv = screen.getByTestId('action-result');
      expect(resultDiv.textContent).toContain('✗');
    });
  });

  describe('animations', () => {
    it('should have animation classes', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      const modal = screen.getByTestId('building-modal');
      expect(modal.className).toContain('transition');
    });

    it('should start with animation state', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      const modal = screen.getByTestId('building-modal');
      expect(modal.className).toMatch(/scale-95|scale-100/);
    });
  });

  describe('accessibility', () => {
    it('should have close button aria-label', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      const closeButton = screen.getByTestId('close-button');
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal');
    });

    it('should show keyboard shortcuts', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      expect(screen.getByText('ESC')).toBeInTheDocument();
      expect(screen.getByText('1-9')).toBeInTheDocument();
    });

    it('should show keyboard shortcut descriptions', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      expect(screen.getByText('to close')).toBeInTheDocument();
      expect(screen.getByText('to select action')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle building without description', () => {
      const buildingNoDesc = {
        ...mockBuilding,
        description: '',
      };

      render(
        <BuildingModal
          building={buildingNoDesc}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      expect(screen.queryByTestId('building-description')).not.toBeInTheDocument();
    });

    it('should handle result without effects', () => {
      const result: ActionResult = {
        success: true,
        message: 'Done',
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      expect(screen.queryByTestId('action-effects')).not.toBeInTheDocument();
    });

    it('should handle result with empty effects', () => {
      const result: ActionResult = {
        success: true,
        message: 'Done',
        effects: {},
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      expect(screen.getByTestId('action-effects')).toBeInTheDocument();
    });

    it('should handle building without actions', () => {
      const buildingNoActions = {
        ...mockBuilding,
        actions: undefined,
      };

      render(
        <BuildingModal
          building={buildingNoActions as any}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      expect(screen.getByTestId('building-modal')).toBeInTheDocument();
    });

    it('should handle result with newActions', () => {
      const result: ActionResult = {
        success: true,
        message: 'Choose next action',
        newActions: [
          {
            id: 'next1',
            displayName: 'Next Action 1',
            description: 'First next action',
            timeCost: 5,
          } as any,
        ],
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      expect(screen.getByText('Next Actions:')).toBeInTheDocument();
      expect(screen.getByText('Next Action 1')).toBeInTheDocument();
    });
  });
});
