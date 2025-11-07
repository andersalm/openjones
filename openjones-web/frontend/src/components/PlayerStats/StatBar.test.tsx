import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatBar } from './StatBar';

describe('StatBar', () => {
  describe('Basic Rendering', () => {
    it('should render with label and value', () => {
      render(<StatBar label="Health" value={75} maxValue={100} color="red" />);

      expect(screen.getByText('Health')).toBeInTheDocument();
      expect(screen.getByText('75/100')).toBeInTheDocument();
    });

    it('should render without value when showValue is false', () => {
      render(<StatBar label="Health" value={75} maxValue={100} color="red" showValue={false} />);

      expect(screen.getByText('Health')).toBeInTheDocument();
      expect(screen.queryByText('75/100')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <StatBar label="Health" value={75} maxValue={100} color="red" className="custom-class" />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should have correct test id', () => {
      render(<StatBar label="Health" value={75} maxValue={100} color="red" />);

      expect(screen.getByTestId('stat-bar-health')).toBeInTheDocument();
    });
  });

  describe('Value Calculations', () => {
    it('should display correct percentage width for 50%', () => {
      render(<StatBar label="Health" value={50} maxValue={100} color="red" />);

      const progressBar = screen.getByTestId('stat-bar-fill-health');
      expect(progressBar).toHaveStyle({ width: '50%' });
    });

    it('should display correct percentage width for 0%', () => {
      render(<StatBar label="Health" value={0} maxValue={100} color="red" />);

      const progressBar = screen.getByTestId('stat-bar-fill-health');
      expect(progressBar).toHaveStyle({ width: '0%' });
    });

    it('should display correct percentage width for 100%', () => {
      render(<StatBar label="Health" value={100} maxValue={100} color="red" />);

      const progressBar = screen.getByTestId('stat-bar-fill-health');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('should handle fractional values correctly', () => {
      render(<StatBar label="Health" value={33.33} maxValue={100} color="red" />);

      const progressBar = screen.getByTestId('stat-bar-fill-health');
      expect(progressBar).toHaveStyle({ width: '33.33%' });
    });

    it('should clamp values above maxValue to 100%', () => {
      render(<StatBar label="Health" value={150} maxValue={100} color="red" />);

      const progressBar = screen.getByTestId('stat-bar-fill-health');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('should clamp negative values to 0%', () => {
      render(<StatBar label="Health" value={-50} maxValue={100} color="red" />);

      const progressBar = screen.getByTestId('stat-bar-fill-health');
      expect(progressBar).toHaveStyle({ width: '0%' });
    });

    it('should handle maxValue of 0 gracefully', () => {
      render(<StatBar label="Health" value={50} maxValue={0} color="red" />);

      const progressBar = screen.getByTestId('stat-bar-fill-health');
      expect(progressBar).toHaveStyle({ width: '0%' });
    });
  });

  describe('Color Variants', () => {
    it('should apply red color class for low health values', () => {
      render(<StatBar label="Health" value={25} maxValue={100} color="red" />);

      const progressBar = screen.getByTestId('stat-bar-fill-health');
      expect(progressBar).toHaveClass('bg-red-500');
    });

    it('should apply yellow color class', () => {
      render(<StatBar label="Happiness" value={75} maxValue={100} color="yellow" />);

      const progressBar = screen.getByTestId('stat-bar-fill-happiness');
      expect(progressBar).toHaveClass('bg-yellow-500');
    });

    it('should apply blue color class', () => {
      render(<StatBar label="Education" value={75} maxValue={100} color="blue" />);

      const progressBar = screen.getByTestId('stat-bar-fill-education');
      expect(progressBar).toHaveClass('bg-blue-500');
    });

    it('should apply purple color class', () => {
      render(<StatBar label="Career" value={75} maxValue={100} color="purple" />);

      const progressBar = screen.getByTestId('stat-bar-fill-career');
      expect(progressBar).toHaveClass('bg-purple-500');
    });

    it('should apply green color class', () => {
      render(<StatBar label="Energy" value={75} maxValue={100} color="green" />);

      const progressBar = screen.getByTestId('stat-bar-fill-energy');
      expect(progressBar).toHaveClass('bg-green-500');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA role', () => {
      render(<StatBar label="Health" value={75} maxValue={100} color="red" />);

      const progressBar = screen.getByTestId('stat-bar-fill-health');
      expect(progressBar).toHaveAttribute('role', 'progressbar');
    });

    it('should have proper ARIA valuenow', () => {
      render(<StatBar label="Health" value={75} maxValue={100} color="red" />);

      const progressBar = screen.getByTestId('stat-bar-fill-health');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    });

    it('should have proper ARIA valuemin', () => {
      render(<StatBar label="Health" value={75} maxValue={100} color="red" />);

      const progressBar = screen.getByTestId('stat-bar-fill-health');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    });

    it('should have proper ARIA valuemax', () => {
      render(<StatBar label="Health" value={75} maxValue={100} color="red" />);

      const progressBar = screen.getByTestId('stat-bar-fill-health');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should have proper ARIA label', () => {
      render(<StatBar label="Health" value={75} maxValue={100} color="red" />);

      const progressBar = screen.getByTestId('stat-bar-fill-health');
      expect(progressBar).toHaveAttribute('aria-label', 'Health progress');
    });
  });

  describe('Edge Cases', () => {
    it('should round decimal values in display', () => {
      render(<StatBar label="Health" value={75.7} maxValue={100} color="red" />);

      expect(screen.getByText('76/100')).toBeInTheDocument();
    });

    it('should handle very small maxValue', () => {
      render(<StatBar label="Health" value={0.5} maxValue={1} color="red" />);

      const progressBar = screen.getByTestId('stat-bar-fill-health');
      expect(progressBar).toHaveStyle({ width: '50%' });
    });

    it('should handle very large values', () => {
      render(<StatBar label="Health" value={5000} maxValue={10000} color="red" />);

      const progressBar = screen.getByTestId('stat-bar-fill-health');
      expect(progressBar).toHaveStyle({ width: '50%' });
      expect(screen.getByText('5000/10000')).toBeInTheDocument();
    });
  });
});
