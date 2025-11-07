/**
 * BuildingModal - Modal dialog for building interactions
 *
 * Part of Task C3: Building Modal Component
 * Worker 3 - Track C (UI/Frontend)
 *
 * This component displays a modal for interacting with buildings,
 * showing available actions and handling action execution.
 */

import React, { useEffect, useState } from 'react';
import { IBuilding, IPlayerState, IGame, IActionResponse } from '@shared/types/contracts';
import { ActionMenu } from './ActionMenu';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface BuildingModalProps {
  building: IBuilding | null;
  player: IPlayerState;
  game: IGame;
  isOpen: boolean;
  onClose: () => void;
  onActionExecute: (actionId: string) => void;
  actionResult?: IActionResponse | null;
}

export const BuildingModal: React.FC<BuildingModalProps> = ({
  building,
  player,
  game,
  isOpen,
  onClose,
  onActionExecute,
  actionResult,
}) => {
  const [showResult, setShowResult] = useState(false);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Show result when action is executed
  useEffect(() => {
    if (actionResult) {
      setShowResult(true);
    }
  }, [actionResult]);

  // Reset result display when building changes
  useEffect(() => {
    setShowResult(false);
  }, [building?.id]);

  if (!isOpen || !building) {
    return null;
  }

  const actions = building.getAvailableActions(player, game);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="building-modal">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-label="Close modal"
        data-testid="modal-backdrop"
      />

      {/* Modal Content */}
      <Card
        variant="default"
        padding="lg"
        className="relative z-10 w-full max-w-2xl max-h-[80vh] overflow-auto m-4"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {building.name}
            </h2>
            <p className="text-gray-600 text-sm">
              {building.description}
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
            aria-label="Close"
            className="ml-4"
          >
            ✕
          </Button>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-gray-300 my-4" />

        {/* Action Menu or Result Display */}
        {showResult && actionResult ? (
          <div className="space-y-4">
            {/* Result Display */}
            <div
              className={`p-4 rounded border-2 ${
                actionResult.success
                  ? 'bg-green-50 border-green-500'
                  : 'bg-red-50 border-red-500'
              }`}
            >
              <h3 className="font-bold text-lg mb-2">
                {actionResult.success ? '✓ Success' : '✗ Failed'}
              </h3>
              <p className="text-gray-800">{actionResult.message}</p>

              {actionResult.stateChanges && actionResult.stateChanges.length > 0 && (
                <div className="mt-3">
                  <p className="font-semibold text-sm mb-1">Changes:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {actionResult.stateChanges.map((change, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {change.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {actionResult.timeSpent > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Time spent:</span> {actionResult.timeSpent} units
                </div>
              )}
            </div>

            {/* Back to Actions Button */}
            <Button onClick={() => setShowResult(false)} className="w-full" variant="primary">
              Back to Actions
            </Button>
          </div>
        ) : (
          <>
            {/* Action Menu */}
            <div className="mb-4">
              <ActionMenu
                actions={actions}
                onActionSelect={onActionExecute}
                keyboardEnabled={true}
              />
            </div>
          </>
        )}

        {/* Footer */}
        <div className="border-t-2 border-gray-300 mt-4 pt-4">
          <Button onClick={onClose} variant="secondary" className="w-full">
            Exit Building
          </Button>
        </div>
      </Card>
    </div>
  );
};
