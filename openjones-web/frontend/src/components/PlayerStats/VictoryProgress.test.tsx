import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VictoryProgress } from './VictoryProgress';
import { IVictoryCondition } from '../../../../shared/types';

describe('VictoryProgress', () => {
  const mockConditions: IVictoryCondition[] = [
    {
      id: 'cash-target',
      name: 'Wealth',
      description: 'Accumulate $10,000',
      targetValue: 10000,
      currentValue: 5000,
      isAchieved: false,
      type: 'cash',
    },
    {
      id: 'education-target',
      name: 'Education',
      description: 'Reach Education level 100',
      targetValue: 100,
      currentValue: 100,
      isAchieved: true,
      type: 'education',
    },
  ];

  describe('Basic Rendering', () => {
    it('should render victory progress component', () => {
      render(<VictoryProgress victoryConditions={mockConditions} />);

      expect(screen.getByTestId('victory-progress')).toBeInTheDocument();
    });

    it('should render title', () => {
      render(<VictoryProgress victoryConditions={mockConditions} />);

      expect(screen.getByText('Victory Conditions')).toBeInTheDocument();
    });

    it('should display correct completion count', () => {
      render(<VictoryProgress victoryConditions={mockConditions} />);

      expect(screen.getByText(/1 of 2 completed/i)).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <VictoryProgress victoryConditions={mockConditions} className="custom-class" />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Victory Conditions Display', () => {
    it('should render all victory conditions', () => {
      render(<VictoryProgress victoryConditions={mockConditions} />);

      expect(screen.getByText('Wealth')).toBeInTheDocument();
      expect(screen.getByText('Education')).toBeInTheDocument();
    });

    it('should render condition descriptions', () => {
      render(<VictoryProgress victoryConditions={mockConditions} />);

      expect(screen.getByText('Accumulate $10,000')).toBeInTheDocument();
      expect(screen.getByText('Reach Education level 100')).toBeInTheDocument();
    });

    it('should display current and target values', () => {
      render(<VictoryProgress victoryConditions={mockConditions} />);

      expect(screen.getByText(/5,000\/10,000/)).toBeInTheDocument();
      expect(screen.getByText(/100\/100/)).toBeInTheDocument();
    });

    it('should show checkmark for achieved conditions', () => {
      render(<VictoryProgress victoryConditions={mockConditions} />);

      expect(screen.getByTestId('achieved-badge-education-target')).toBeInTheDocument();
      expect(screen.queryByTestId('achieved-badge-cash-target')).not.toBeInTheDocument();
    });
  });

  describe('Progress Bars', () => {
    it('should render progress bars for all conditions', () => {
      render(<VictoryProgress victoryConditions={mockConditions} />);

      expect(screen.getByTestId('progress-bar-cash-target')).toBeInTheDocument();
      expect(screen.getByTestId('progress-bar-education-target')).toBeInTheDocument();
    });

    it('should set correct width for 50% progress', () => {
      render(<VictoryProgress victoryConditions={mockConditions} />);

      const cashProgressBar = screen.getByTestId('progress-bar-cash-target');
      expect(cashProgressBar).toHaveStyle({ width: '50%' });
    });

    it('should set correct width for 100% progress', () => {
      render(<VictoryProgress victoryConditions={mockConditions} />);

      const educationProgressBar = screen.getByTestId('progress-bar-education-target');
      expect(educationProgressBar).toHaveStyle({ width: '100%' });
    });

    it('should use green color for achieved conditions', () => {
      render(<VictoryProgress victoryConditions={mockConditions} />);

      const educationProgressBar = screen.getByTestId('progress-bar-education-target');
      expect(educationProgressBar).toHaveClass('bg-green-500');
    });

    it('should use blue color for unachieved conditions', () => {
      render(<VictoryProgress victoryConditions={mockConditions} />);

      const cashProgressBar = screen.getByTestId('progress-bar-cash-target');
      expect(cashProgressBar).toHaveClass('bg-blue-500');
    });
  });

  describe('Styling and States', () => {
    it('should apply green styling to achieved conditions', () => {
      render(<VictoryProgress victoryConditions={mockConditions} />);

      const educationCondition = screen.getByTestId('victory-condition-education-target');
      expect(educationCondition).toHaveClass('border-green-500', 'bg-green-50');
    });

    it('should apply default styling to unachieved conditions', () => {
      render(<VictoryProgress victoryConditions={mockConditions} />);

      const cashCondition = screen.getByTestId('victory-condition-cash-target');
      expect(cashCondition).toHaveClass('border-gray-300', 'bg-white');
    });
  });

  describe('Victory State', () => {
    it('should show victory message when all conditions are achieved', () => {
      const allAchievedConditions: IVictoryCondition[] = [
        {
          id: 'condition-1',
          name: 'Condition 1',
          description: 'Complete condition 1',
          targetValue: 100,
          currentValue: 100,
          isAchieved: true,
          type: 'cash',
        },
        {
          id: 'condition-2',
          name: 'Condition 2',
          description: 'Complete condition 2',
          targetValue: 100,
          currentValue: 100,
          isAchieved: true,
          type: 'education',
        },
      ];

      render(<VictoryProgress victoryConditions={allAchievedConditions} />);

      expect(screen.getByTestId('victory-achieved')).toBeInTheDocument();
      expect(screen.getByText(/Victory!/i)).toBeInTheDocument();
    });

    it('should not show victory message when not all conditions are achieved', () => {
      render(<VictoryProgress victoryConditions={mockConditions} />);

      expect(screen.queryByTestId('victory-achieved')).not.toBeInTheDocument();
    });

    it('should not show victory message for empty conditions', () => {
      render(<VictoryProgress victoryConditions={[]} />);

      expect(screen.queryByTestId('victory-achieved')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty victory conditions array', () => {
      render(<VictoryProgress victoryConditions={[]} />);

      expect(screen.getByText(/0 of 0 completed/i)).toBeInTheDocument();
    });

    it('should handle 0 target value gracefully', () => {
      const zeroTargetConditions: IVictoryCondition[] = [
        {
          id: 'zero-target',
          name: 'Zero Target',
          description: 'Zero target test',
          targetValue: 0,
          currentValue: 0,
          isAchieved: false,
          type: 'cash',
        },
      ];

      render(<VictoryProgress victoryConditions={zeroTargetConditions} />);

      const progressBar = screen.getByTestId('progress-bar-zero-target');
      expect(progressBar).toHaveStyle({ width: '0%' });
    });

    it('should cap progress at 100% when current exceeds target', () => {
      const exceededConditions: IVictoryCondition[] = [
        {
          id: 'exceeded',
          name: 'Exceeded',
          description: 'Exceeded target test',
          targetValue: 100,
          currentValue: 150,
          isAchieved: true,
          type: 'cash',
        },
      ];

      render(<VictoryProgress victoryConditions={exceededConditions} />);

      const progressBar = screen.getByTestId('progress-bar-exceeded');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('should format large numbers with commas', () => {
      const largeValueConditions: IVictoryCondition[] = [
        {
          id: 'large-value',
          name: 'Large Value',
          description: 'Large value test',
          targetValue: 1000000,
          currentValue: 500000,
          isAchieved: false,
          type: 'cash',
        },
      ];

      render(<VictoryProgress victoryConditions={largeValueConditions} />);

      expect(screen.getByText(/500,000\/1,000,000/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA role for progress bars', () => {
      render(<VictoryProgress victoryConditions={mockConditions} />);

      const progressBar = screen.getByTestId('progress-bar-cash-target');
      expect(progressBar).toHaveAttribute('role', 'progressbar');
    });

    it('should have proper ARIA valuenow', () => {
      render(<VictoryProgress victoryConditions={mockConditions} />);

      const progressBar = screen.getByTestId('progress-bar-cash-target');
      expect(progressBar).toHaveAttribute('aria-valuenow', '5000');
    });

    it('should have proper ARIA valuemin', () => {
      render(<VictoryProgress victoryConditions={mockConditions} />);

      const progressBar = screen.getByTestId('progress-bar-cash-target');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    });

    it('should have proper ARIA valuemax', () => {
      render(<VictoryProgress victoryConditions={mockConditions} />);

      const progressBar = screen.getByTestId('progress-bar-cash-target');
      expect(progressBar).toHaveAttribute('aria-valuemax', '10000');
    });

    it('should have proper ARIA label', () => {
      render(<VictoryProgress victoryConditions={mockConditions} />);

      const progressBar = screen.getByTestId('progress-bar-cash-target');
      expect(progressBar).toHaveAttribute('aria-label', 'Wealth progress');
    });
  });
});
