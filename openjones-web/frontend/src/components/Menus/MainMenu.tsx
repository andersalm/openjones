import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';

interface MainMenuProps {
  onNewGame: () => void;
  onLoadGame: () => void;
  onSettings: () => void;
  onCredits: () => void;
  hasSavedGame?: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onNewGame,
  onLoadGame,
  onSettings,
  onCredits,
  hasSavedGame = false,
}) => {
  return (
    <Container className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-700">
      <Card className="w-full max-w-md p-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Jones in the Fast Lane
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browser Edition
          </p>
        </div>

        {/* Menu Options */}
        <div className="space-y-4">
          <Button
            onClick={onNewGame}
            className="w-full"
            size="lg"
          >
            New Game
          </Button>

          <Button
            onClick={onLoadGame}
            className="w-full"
            size="lg"
            variant="secondary"
            disabled={!hasSavedGame}
          >
            {hasSavedGame ? 'Load Game' : 'No Saved Game'}
          </Button>

          <Button
            onClick={onSettings}
            className="w-full"
            size="lg"
            variant="secondary"
          >
            Settings
          </Button>

          <Button
            onClick={onCredits}
            className="w-full"
            size="lg"
            variant="secondary"
          >
            Credits
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Original game by Sierra On-Line</p>
          <p className="mt-1">Browser port - Educational project</p>
        </div>
      </Card>
    </Container>
  );
};
