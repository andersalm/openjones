import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameSetup } from './GameSetup';
import '@testing-library/jest-dom';

describe('GameSetup', () => {
  const mockOnStartGame = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render setup form title', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      expect(screen.getByText('New Game Setup')).toBeInTheDocument();
    });

    it('should render player name input', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument();
    });

    it('should render player color section', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      expect(screen.getByText('Player Color')).toBeInTheDocument();
    });

    it('should render difficulty section', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      expect(screen.getByText('Difficulty')).toBeInTheDocument();
    });

    it('should render all difficulty options', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      expect(screen.getByText('easy')).toBeInTheDocument();
      expect(screen.getByText('normal')).toBeInTheDocument();
      expect(screen.getByText('hard')).toBeInTheDocument();
    });

    it('should render AI opponents slider', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      expect(screen.getByText(/AI Opponents:/)).toBeInTheDocument();
    });

    it('should render Start Game button', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      expect(screen.getByText('Start Game')).toBeInTheDocument();
    });

    it('should render Cancel button', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Player Name Validation', () => {
    it('should show error when submitting without name', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      fireEvent.click(screen.getByText('Start Game'));
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(mockOnStartGame).not.toHaveBeenCalled();
    });

    it('should show error when name is too short', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      const nameInput = screen.getByPlaceholderText(/enter your name/i);
      fireEvent.change(nameInput, { target: { value: 'A' } });
      fireEvent.click(screen.getByText('Start Game'));
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
      expect(mockOnStartGame).not.toHaveBeenCalled();
    });

    it('should show error when name is too long', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      const nameInput = screen.getByPlaceholderText(/enter your name/i);
      fireEvent.change(nameInput, { target: { value: 'A'.repeat(21) } });
      fireEvent.click(screen.getByText('Start Game'));
      expect(screen.getByText(/20 characters or less/i)).toBeInTheDocument();
      expect(mockOnStartGame).not.toHaveBeenCalled();
    });

    it('should accept valid name', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      const nameInput = screen.getByPlaceholderText(/enter your name/i);
      fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
      fireEvent.click(screen.getByText('Start Game'));
      expect(mockOnStartGame).toHaveBeenCalled();
    });

    it('should trim whitespace before validation', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      const nameInput = screen.getByPlaceholderText(/enter your name/i);
      fireEvent.change(nameInput, { target: { value: '   ' } });
      fireEvent.click(screen.getByText('Start Game'));
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });

    it('should enforce maxLength on input', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      const nameInput = screen.getByPlaceholderText(/enter your name/i) as HTMLInputElement;
      expect(nameInput).toHaveAttribute('maxLength', '20');
    });
  });

  describe('Player Color Selection', () => {
    it('should default to blue color', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      const nameInput = screen.getByPlaceholderText(/enter your name/i);
      fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
      fireEvent.click(screen.getByText('Start Game'));
      expect(mockOnStartGame).toHaveBeenCalledWith(
        expect.objectContaining({
          players: expect.arrayContaining([
            expect.objectContaining({ color: 'blue' })
          ])
        })
      );
    });

    it('should allow color selection', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      const redButton = screen.getByLabelText('Red');
      fireEvent.click(redButton);

      const nameInput = screen.getByPlaceholderText(/enter your name/i);
      fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
      fireEvent.click(screen.getByText('Start Game'));

      expect(mockOnStartGame).toHaveBeenCalledWith(
        expect.objectContaining({
          players: expect.arrayContaining([
            expect.objectContaining({ color: 'red' })
          ])
        })
      );
    });
  });

  describe('Difficulty Selection', () => {
    it('should default to normal difficulty', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      expect(screen.getByText(/\$500/)).toBeInTheDocument();
    });

    it('should update to easy difficulty and show correct starting cash', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      fireEvent.click(screen.getByText('easy'));
      expect(screen.getByText(/\$1000/)).toBeInTheDocument();
    });

    it('should update to hard difficulty and show correct starting cash', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      fireEvent.click(screen.getByText('hard'));
      expect(screen.getByText(/\$250/)).toBeInTheDocument();
    });

    it('should configure game with easy difficulty settings', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      fireEvent.click(screen.getByText('easy'));

      const nameInput = screen.getByPlaceholderText(/enter your name/i);
      fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
      fireEvent.click(screen.getByText('Start Game'));

      expect(mockOnStartGame).toHaveBeenCalledWith(
        expect.objectContaining({
          startingCash: 1000,
          victoryConditions: expect.objectContaining({
            targetWealth: 7000,
            targetCareer: 35,
            targetEducation: 35,
          })
        })
      );
    });

    it('should configure game with hard difficulty settings', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      fireEvent.click(screen.getByText('hard'));

      const nameInput = screen.getByPlaceholderText(/enter your name/i);
      fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
      fireEvent.click(screen.getByText('Start Game'));

      expect(mockOnStartGame).toHaveBeenCalledWith(
        expect.objectContaining({
          startingCash: 250,
          victoryConditions: expect.objectContaining({
            targetWealth: 13000,
            targetCareer: 65,
            targetEducation: 65,
          })
        })
      );
    });
  });

  describe('AI Opponents Selection', () => {
    it('should default to 1 AI opponent', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      expect(screen.getByText('AI Opponents: 1')).toBeInTheDocument();
    });

    it('should allow changing number of AI opponents', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '2' } });
      expect(screen.getByText('AI Opponents: 2')).toBeInTheDocument();
    });

    it('should configure game with correct number of AI players', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '3' } });

      const nameInput = screen.getByPlaceholderText(/enter your name/i);
      fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
      fireEvent.click(screen.getByText('Start Game'));

      expect(mockOnStartGame).toHaveBeenCalledWith(
        expect.objectContaining({
          players: expect.arrayContaining([
            expect.objectContaining({ isAI: false }),
            expect.objectContaining({ isAI: true }),
            expect.objectContaining({ isAI: true }),
            expect.objectContaining({ isAI: true }),
          ])
        })
      );
    });

    it('should support zero AI opponents', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '0' } });

      const nameInput = screen.getByPlaceholderText(/enter your name/i);
      fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
      fireEvent.click(screen.getByText('Start Game'));

      const call = mockOnStartGame.mock.calls[0][0];
      expect(call.players).toHaveLength(1);
      expect(call.players[0].isAI).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('should call onStartGame with correct player name', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      const nameInput = screen.getByPlaceholderText(/enter your name/i);
      fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
      fireEvent.click(screen.getByText('Start Game'));

      expect(mockOnStartGame).toHaveBeenCalledWith(
        expect.objectContaining({
          players: expect.arrayContaining([
            expect.objectContaining({ name: 'TestPlayer' })
          ])
        })
      );
    });

    it('should include player ID in config', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      const nameInput = screen.getByPlaceholderText(/enter your name/i);
      fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
      fireEvent.click(screen.getByText('Start Game'));

      expect(mockOnStartGame).toHaveBeenCalledWith(
        expect.objectContaining({
          players: expect.arrayContaining([
            expect.objectContaining({ id: 'player-1' })
          ])
        })
      );
    });

    it('should set AI type to greedy for AI players', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      const nameInput = screen.getByPlaceholderText(/enter your name/i);
      fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
      fireEvent.click(screen.getByText('Start Game'));

      const call = mockOnStartGame.mock.calls[0][0];
      const aiPlayer = call.players.find((p: { isAI: boolean }) => p.isAI);
      expect(aiPlayer?.aiType).toBe('greedy');
    });

    it('should include starting stats in config', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      const nameInput = screen.getByPlaceholderText(/enter your name/i);
      fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
      fireEvent.click(screen.getByText('Start Game'));

      expect(mockOnStartGame).toHaveBeenCalledWith(
        expect.objectContaining({
          startingStats: {
            health: 70,
            happiness: 70,
            education: 20,
          }
        })
      );
    });

    it('should include victory conditions in config', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      const nameInput = screen.getByPlaceholderText(/enter your name/i);
      fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
      fireEvent.click(screen.getByText('Start Game'));

      expect(mockOnStartGame).toHaveBeenCalledWith(
        expect.objectContaining({
          victoryConditions: expect.objectContaining({
            targetWealth: expect.any(Number),
            targetHealth: 80,
            targetHappiness: 80,
            targetCareer: expect.any(Number),
            targetEducation: expect.any(Number),
          })
        })
      );
    });
  });

  describe('Cancel Button', () => {
    it('should call onCancel when cancel clicked', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      fireEvent.click(screen.getByText('Cancel'));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should not call onStartGame when cancel clicked', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      fireEvent.click(screen.getByText('Cancel'));
      expect(mockOnStartGame).not.toHaveBeenCalled();
    });
  });
});
