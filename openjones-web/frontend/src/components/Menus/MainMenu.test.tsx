import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MainMenu } from './MainMenu';
import '@testing-library/jest-dom';

describe('MainMenu', () => {
  const mockCallbacks = {
    onNewGame: vi.fn(),
    onLoadGame: vi.fn(),
    onSettings: vi.fn(),
    onCredits: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the game title', () => {
      render(<MainMenu {...mockCallbacks} />);
      expect(screen.getByText(/Jones in the Fast Lane/i)).toBeInTheDocument();
    });

    it('should render the browser edition subtitle', () => {
      render(<MainMenu {...mockCallbacks} />);
      expect(screen.getByText('Browser Edition')).toBeInTheDocument();
    });

    it('should render all menu buttons', () => {
      render(<MainMenu {...mockCallbacks} />);
      expect(screen.getByText('New Game')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Credits')).toBeInTheDocument();
    });

    it('should render the original game credit', () => {
      render(<MainMenu {...mockCallbacks} />);
      expect(screen.getByText('Original game by Sierra On-Line')).toBeInTheDocument();
    });

    it('should render the educational project notice', () => {
      render(<MainMenu {...mockCallbacks} />);
      expect(screen.getByText('Browser port - Educational project')).toBeInTheDocument();
    });
  });

  describe('New Game Button', () => {
    it('should call onNewGame when New Game clicked', () => {
      render(<MainMenu {...mockCallbacks} />);
      fireEvent.click(screen.getByText('New Game'));
      expect(mockCallbacks.onNewGame).toHaveBeenCalledTimes(1);
    });

    it('should not call other callbacks when New Game clicked', () => {
      render(<MainMenu {...mockCallbacks} />);
      fireEvent.click(screen.getByText('New Game'));
      expect(mockCallbacks.onLoadGame).not.toHaveBeenCalled();
      expect(mockCallbacks.onSettings).not.toHaveBeenCalled();
      expect(mockCallbacks.onCredits).not.toHaveBeenCalled();
    });
  });

  describe('Load Game Button', () => {
    it('should disable Load Game when no saved game', () => {
      render(<MainMenu {...mockCallbacks} hasSavedGame={false} />);
      const loadButton = screen.getByText(/No Saved Game/i);
      expect(loadButton).toBeDisabled();
    });

    it('should enable Load Game when saved game exists', () => {
      render(<MainMenu {...mockCallbacks} hasSavedGame={true} />);
      const loadButton = screen.getByText('Load Game');
      expect(loadButton).not.toBeDisabled();
    });

    it('should call onLoadGame when Load Game clicked with saved game', () => {
      render(<MainMenu {...mockCallbacks} hasSavedGame={true} />);
      fireEvent.click(screen.getByText('Load Game'));
      expect(mockCallbacks.onLoadGame).toHaveBeenCalledTimes(1);
    });

    it('should not call onLoadGame when disabled', () => {
      render(<MainMenu {...mockCallbacks} hasSavedGame={false} />);
      const loadButton = screen.getByText(/No Saved Game/i);
      fireEvent.click(loadButton);
      expect(mockCallbacks.onLoadGame).not.toHaveBeenCalled();
    });

    it('should display correct text when saved game exists', () => {
      render(<MainMenu {...mockCallbacks} hasSavedGame={true} />);
      expect(screen.getByText('Load Game')).toBeInTheDocument();
      expect(screen.queryByText('No Saved Game')).not.toBeInTheDocument();
    });

    it('should display correct text when no saved game', () => {
      render(<MainMenu {...mockCallbacks} hasSavedGame={false} />);
      expect(screen.getByText('No Saved Game')).toBeInTheDocument();
      expect(screen.queryByText('Load Game')).not.toBeInTheDocument();
    });
  });

  describe('Settings Button', () => {
    it('should call onSettings when Settings clicked', () => {
      render(<MainMenu {...mockCallbacks} />);
      fireEvent.click(screen.getByText('Settings'));
      expect(mockCallbacks.onSettings).toHaveBeenCalledTimes(1);
    });

    it('should not be disabled', () => {
      render(<MainMenu {...mockCallbacks} />);
      expect(screen.getByText('Settings')).not.toBeDisabled();
    });
  });

  describe('Credits Button', () => {
    it('should call onCredits when Credits clicked', () => {
      render(<MainMenu {...mockCallbacks} />);
      fireEvent.click(screen.getByText('Credits'));
      expect(mockCallbacks.onCredits).toHaveBeenCalledTimes(1);
    });

    it('should not be disabled', () => {
      render(<MainMenu {...mockCallbacks} />);
      expect(screen.getByText('Credits')).not.toBeDisabled();
    });
  });

  describe('Default Props', () => {
    it('should default hasSavedGame to false', () => {
      render(<MainMenu {...mockCallbacks} />);
      expect(screen.getByText('No Saved Game')).toBeDisabled();
    });
  });
});
