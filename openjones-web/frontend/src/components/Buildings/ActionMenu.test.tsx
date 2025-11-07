import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActionMenu } from './ActionMenu';
import { IAction } from '../../../../shared/types/contracts';

describe('ActionMenu', () => {
  const mockOnActionSelect = jest.fn();

  const mockActions: IAction[] = [
    {
      id: 'work',
      displayName: 'Work',
      description: 'Work to earn money',
      cost: 0,
      timeCost: 8,
      disabled: false,
    },
    {
      id: 'study',
      displayName: 'Study',
      description: 'Improve your skills',
      cost: 50,
      timeCost: 4,
      disabled: false,
    },
    {
      id: 'shop',
      displayName: 'Shop',
      description: 'Buy items',
      cost: 100,
      timeCost: 2,
      disabled: true,
      requirements: ['Need more money'],
    },
  ];

  beforeEach(() => {
    mockOnActionSelect.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    test('renders action menu with actions', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      expect(screen.getByTestId('action-menu')).toBeInTheDocument();
    });

    test('renders all actions', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Study')).toBeInTheDocument();
      expect(screen.getByText('Shop')).toBeInTheDocument();
    });

    test('renders action descriptions', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      expect(screen.getByText('Work to earn money')).toBeInTheDocument();
      expect(screen.getByText('Improve your skills')).toBeInTheDocument();
      expect(screen.getByText('Buy items')).toBeInTheDocument();
    });

    test('renders action numbers 1-9', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      expect(screen.getByText('1.')).toBeInTheDocument();
      expect(screen.getByText('2.')).toBeInTheDocument();
      expect(screen.getByText('3.')).toBeInTheDocument();
    });

    test('renders action costs', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      expect(screen.getByText('$50')).toBeInTheDocument();
      expect(screen.getByText('$100')).toBeInTheDocument();
    });

    test('renders action time costs', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      expect(screen.getByText(/8 units/)).toBeInTheDocument();
      expect(screen.getByText(/4 units/)).toBeInTheDocument();
      expect(screen.getByText(/2 units/)).toBeInTheDocument();
    });

    test('renders empty state when no actions', () => {
      render(<ActionMenu actions={[]} onActionSelect={mockOnActionSelect} />);
      expect(screen.getByTestId('action-menu-empty')).toBeInTheDocument();
      expect(screen.getByText('No actions available')).toBeInTheDocument();
    });

    test('applies custom className', () => {
      render(
        <ActionMenu
          actions={mockActions}
          onActionSelect={mockOnActionSelect}
          className="custom-class"
        />
      );
      const menu = screen.getByTestId('action-menu');
      expect(menu).toHaveClass('custom-class');
    });

    test('renders action with icon', () => {
      const actionsWithIcon: IAction[] = [
        { ...mockActions[0], icon: '💼' },
      ];
      render(<ActionMenu actions={actionsWithIcon} onActionSelect={mockOnActionSelect} />);
      expect(screen.getByText('💼')).toBeInTheDocument();
    });

    test('renders requirements for disabled actions', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      expect(screen.getByText(/Need more money/)).toBeInTheDocument();
    });
  });

  describe('Mouse Interactions', () => {
    test('calls onActionSelect when clicking enabled action', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      const workButton = screen.getByTestId('action-item-work');
      fireEvent.click(workButton);
      expect(mockOnActionSelect).toHaveBeenCalledWith('work');
      expect(mockOnActionSelect).toHaveBeenCalledTimes(1);
    });

    test('does not call onActionSelect when clicking disabled action', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      const shopButton = screen.getByTestId('action-item-shop');
      fireEvent.click(shopButton);
      expect(mockOnActionSelect).not.toHaveBeenCalled();
    });

    test('multiple clicks trigger multiple callbacks', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      const workButton = screen.getByTestId('action-item-work');
      fireEvent.click(workButton);
      fireEvent.click(workButton);
      expect(mockOnActionSelect).toHaveBeenCalledTimes(2);
    });
  });

  describe('Keyboard Navigation - Number Keys', () => {
    test('pressing "1" selects first action', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      fireEvent.keyDown(window, { key: '1' });
      expect(mockOnActionSelect).toHaveBeenCalledWith('work');
    });

    test('pressing "2" selects second action', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      fireEvent.keyDown(window, { key: '2' });
      expect(mockOnActionSelect).toHaveBeenCalledWith('study');
    });

    test('pressing "3" does not select disabled action', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      fireEvent.keyDown(window, { key: '3' });
      expect(mockOnActionSelect).not.toHaveBeenCalled();
    });

    test('pressing number beyond action count does nothing', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      fireEvent.keyDown(window, { key: '9' });
      expect(mockOnActionSelect).not.toHaveBeenCalled();
    });

    test('number keys work for actions 4-9', () => {
      const manyActions: IAction[] = Array.from({ length: 9 }, (_, i) => ({
        id: `action-${i}`,
        displayName: `Action ${i + 1}`,
        disabled: false,
      }));
      render(<ActionMenu actions={manyActions} onActionSelect={mockOnActionSelect} />);

      fireEvent.keyDown(window, { key: '5' });
      expect(mockOnActionSelect).toHaveBeenCalledWith('action-4');

      fireEvent.keyDown(window, { key: '9' });
      expect(mockOnActionSelect).toHaveBeenCalledWith('action-8');
    });
  });

  describe('Keyboard Navigation - Arrow Keys', () => {
    test('ArrowDown moves selection down', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      const firstButton = screen.getByTestId('action-item-work');
      const secondButton = screen.getByTestId('action-item-study');

      // Initially first item should have yellow border (selected)
      expect(firstButton).toHaveClass('border-yellow-500');

      fireEvent.keyDown(window, { key: 'ArrowDown' });

      // After arrow down, second item should be selected
      expect(secondButton).toHaveClass('border-yellow-500');
    });

    test('ArrowUp moves selection up', () => {
      const { container } = render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);

      // Move down twice
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'ArrowDown' });

      // After moving down twice, third item should be selected
      let thirdButton = screen.getByTestId('action-item-shop');
      expect(thirdButton).toHaveClass('border-yellow-500');

      // Move up once
      fireEvent.keyDown(window, { key: 'ArrowUp' });

      // Now second item should be selected
      let secondButton = screen.getByTestId('action-item-study');
      expect(secondButton).toHaveClass('border-yellow-500');
    });

    test('ArrowDown at last item stays at last item', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);

      // Move to last item
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'ArrowDown' });

      const lastButton = screen.getByTestId('action-item-shop');
      expect(lastButton).toHaveClass('border-yellow-500');

      // Try to move down again
      fireEvent.keyDown(window, { key: 'ArrowDown' });

      // Should still be on last item
      expect(lastButton).toHaveClass('border-yellow-500');
    });

    test('ArrowUp at first item stays at first item', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);

      const firstButton = screen.getByTestId('action-item-work');
      expect(firstButton).toHaveClass('border-yellow-500');

      fireEvent.keyDown(window, { key: 'ArrowUp' });

      // Should still be on first item
      expect(firstButton).toHaveClass('border-yellow-500');
    });
  });

  describe('Keyboard Navigation - Enter Key', () => {
    test('Enter key selects currently highlighted action', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);

      fireEvent.keyDown(window, { key: 'Enter' });
      expect(mockOnActionSelect).toHaveBeenCalledWith('work');
    });

    test('Enter key after ArrowDown selects second action', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);

      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'Enter' });

      expect(mockOnActionSelect).toHaveBeenCalledWith('study');
    });

    test('Enter key does not select disabled action', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);

      // Navigate to disabled action
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'Enter' });

      expect(mockOnActionSelect).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Enabled/Disabled', () => {
    test('keyboard navigation disabled when keyboardEnabled is false', () => {
      render(
        <ActionMenu
          actions={mockActions}
          onActionSelect={mockOnActionSelect}
          keyboardEnabled={false}
        />
      );

      fireEvent.keyDown(window, { key: '1' });
      expect(mockOnActionSelect).not.toHaveBeenCalled();

      fireEvent.keyDown(window, { key: 'Enter' });
      expect(mockOnActionSelect).not.toHaveBeenCalled();
    });

    test('mouse clicks still work when keyboard is disabled', () => {
      render(
        <ActionMenu
          actions={mockActions}
          onActionSelect={mockOnActionSelect}
          keyboardEnabled={false}
        />
      );

      const workButton = screen.getByTestId('action-item-work');
      fireEvent.click(workButton);
      expect(mockOnActionSelect).toHaveBeenCalledWith('work');
    });
  });

  describe('Visual States', () => {
    test('enabled actions have pointer cursor', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      const workButton = screen.getByTestId('action-item-work');
      expect(workButton).toHaveClass('cursor-pointer');
    });

    test('disabled actions have not-allowed cursor', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      const shopButton = screen.getByTestId('action-item-shop');
      expect(shopButton).toHaveClass('cursor-not-allowed');
      expect(shopButton).toHaveClass('opacity-50');
    });

    test('selected item has yellow border', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      const firstButton = screen.getByTestId('action-item-work');
      expect(firstButton).toHaveClass('border-yellow-500');
      expect(firstButton).toHaveClass('bg-yellow-50');
    });

    test('non-selected items have gray border', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      const secondButton = screen.getByTestId('action-item-study');
      expect(secondButton).toHaveClass('border-gray-300');
    });
  });

  describe('Accessibility', () => {
    test('action items have aria-label', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      expect(screen.getByLabelText('Action 1: Work')).toBeInTheDocument();
      expect(screen.getByLabelText('Action 2: Study')).toBeInTheDocument();
    });

    test('disabled actions have aria-disabled', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      const shopButton = screen.getByTestId('action-item-shop');
      expect(shopButton).toHaveAttribute('aria-disabled', 'true');
    });

    test('enabled actions have aria-disabled false', () => {
      render(<ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />);
      const workButton = screen.getByTestId('action-item-work');
      expect(workButton).toHaveAttribute('aria-disabled', 'false');
    });
  });

  describe('Action Changes', () => {
    test('selection resets when actions change', () => {
      const { rerender } = render(
        <ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />
      );

      // Move selection down
      fireEvent.keyDown(window, { key: 'ArrowDown' });

      const secondButton = screen.getByTestId('action-item-study');
      expect(secondButton).toHaveClass('border-yellow-500');

      // Change actions
      const newActions: IAction[] = [
        { id: 'new-action', displayName: 'New Action', disabled: false },
      ];
      rerender(<ActionMenu actions={newActions} onActionSelect={mockOnActionSelect} />);

      // Selection should reset to first item
      const newButton = screen.getByTestId('action-item-new-action');
      expect(newButton).toHaveClass('border-yellow-500');
    });
  });

  describe('Edge Cases', () => {
    test('handles single action', () => {
      const singleAction: IAction[] = [mockActions[0]];
      render(<ActionMenu actions={singleAction} onActionSelect={mockOnActionSelect} />);
      expect(screen.getByTestId('action-menu')).toBeInTheDocument();
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    test('handles action with no cost or timeCost', () => {
      const freeAction: IAction[] = [
        { id: 'free', displayName: 'Free Action', disabled: false },
      ];
      render(<ActionMenu actions={freeAction} onActionSelect={mockOnActionSelect} />);
      expect(screen.getByText('Free Action')).toBeInTheDocument();
    });

    test('handles action with zero cost', () => {
      const zeroCostAction: IAction[] = [
        { id: 'zero', displayName: 'Zero Cost', cost: 0, timeCost: 0, disabled: false },
      ];
      render(<ActionMenu actions={zeroCostAction} onActionSelect={mockOnActionSelect} />);
      expect(screen.getByText('Zero Cost')).toBeInTheDocument();
      // Should not show cost badges for 0 values
      expect(screen.queryByText('$0')).not.toBeInTheDocument();
      expect(screen.queryByText('0 units')).not.toBeInTheDocument();
    });

    test('handles action with no description', () => {
      const noDescAction: IAction[] = [
        { id: 'nodesc', displayName: 'No Description', disabled: false },
      ];
      render(<ActionMenu actions={noDescAction} onActionSelect={mockOnActionSelect} />);
      expect(screen.getByText('No Description')).toBeInTheDocument();
    });

    test('handles time cost of 1 unit (singular)', () => {
      const oneUnitAction: IAction[] = [
        { id: 'one', displayName: 'One Unit', timeCost: 1, disabled: false },
      ];
      render(<ActionMenu actions={oneUnitAction} onActionSelect={mockOnActionSelect} />);
      expect(screen.getByText(/1 unit$/)).toBeInTheDocument();
    });

    test('cleans up event listeners on unmount', () => {
      const { unmount } = render(
        <ActionMenu actions={mockActions} onActionSelect={mockOnActionSelect} />
      );

      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});
