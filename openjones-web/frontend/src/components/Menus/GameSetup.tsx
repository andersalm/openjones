import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { IGameConfig } from '@shared/types/contracts';

interface GameSetupProps {
  onStartGame: (config: IGameConfig) => void;
  onCancel: () => void;
}

type Difficulty = 'easy' | 'normal' | 'hard';

interface FormState {
  playerName: string;
  playerColor: string;
  difficulty: Difficulty;
  aiOpponents: number;
}

const DIFFICULTY_SETTINGS = {
  easy: {
    startingCash: 1000,
    victoryMultiplier: 0.7,
  },
  normal: {
    startingCash: 500,
    victoryMultiplier: 1.0,
  },
  hard: {
    startingCash: 250,
    victoryMultiplier: 1.3,
  },
};

const PLAYER_COLORS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
];

export const GameSetup: React.FC<GameSetupProps> = ({ onStartGame, onCancel }) => {
  const [form, setForm] = useState<FormState>({
    playerName: '',
    playerColor: 'blue',
    difficulty: 'normal',
    aiOpponents: 1,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.playerName.trim()) {
      newErrors.playerName = 'Player name is required';
    } else if (form.playerName.length < 2) {
      newErrors.playerName = 'Name must be at least 2 characters';
    } else if (form.playerName.length > 20) {
      newErrors.playerName = 'Name must be 20 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const difficultySettings = DIFFICULTY_SETTINGS[form.difficulty];
    const multiplier = difficultySettings.victoryMultiplier;

    const config: IGameConfig = {
      players: [
        {
          id: 'player-1',
          name: form.playerName,
          color: form.playerColor,
          isAI: false,
        },
        ...Array.from({ length: form.aiOpponents }, (_, i) => ({
          id: `ai-${i + 1}`,
          name: `AI Player ${i + 1}`,
          color: PLAYER_COLORS[(i + 1) % PLAYER_COLORS.length].value,
          isAI: true,
          aiType: 'greedy' as const,
        })),
      ],
      victoryConditions: {
        targetWealth: Math.round(10000 * multiplier),
        targetHealth: 80,
        targetHappiness: 80,
        targetCareer: Math.round(50 * multiplier),
        targetEducation: Math.round(50 * multiplier),
      },
      startingCash: difficultySettings.startingCash,
      startingStats: {
        health: 70,
        happiness: 70,
        education: 20,
      },
    };

    onStartGame(config);
  };

  return (
    <Container className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-700">
      <Card className="w-full max-w-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          New Game Setup
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Player Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Player Name
            </label>
            <input
              type="text"
              value={form.playerName}
              onChange={(e) => setForm({ ...form, playerName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              maxLength={20}
            />
            {errors.playerName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.playerName}
              </p>
            )}
          </div>

          {/* Player Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Player Color
            </label>
            <div className="flex gap-3">
              {PLAYER_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setForm({ ...form, playerColor: color.value })}
                  className={`w-16 h-16 rounded-lg ${color.class}
                             ${form.playerColor === color.value ? 'ring-4 ring-white' : ''}
                             hover:scale-110 transition-transform`}
                  aria-label={color.label}
                />
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['easy', 'normal', 'hard'] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setForm({ ...form, difficulty: diff })}
                  className={`px-4 py-3 rounded-lg border-2 font-medium capitalize
                             ${form.difficulty === diff
                               ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                               : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                             }`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Starting cash: ${DIFFICULTY_SETTINGS[form.difficulty].startingCash}
            </p>
          </div>

          {/* AI Opponents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI Opponents: {form.aiOpponents}
            </label>
            <input
              type="range"
              min="0"
              max="3"
              value={form.aiOpponents}
              onChange={(e) => setForm({ ...form, aiOpponents: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>0</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1" size="lg">
              Start Game
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              variant="secondary"
              className="flex-1"
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </Container>
  );
};
