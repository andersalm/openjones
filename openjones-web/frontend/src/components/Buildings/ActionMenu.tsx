import React, { useState, useEffect } from 'react';
import { IAction } from '../../../../shared/types/contracts';

export interface ActionMenuProps {
  /** List of available actions */
  actions: IAction[];
  /** Callback when action is selected */
  onActionSelect: (actionId: string) => void;
  /** Optional className */
  className?: string;
  /** Whether keyboard navigation is enabled (default: true) */
  keyboardEnabled?: boolean;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  actions,
  onActionSelect,
  className = '',
  keyboardEnabled = true,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selection when actions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [actions]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!keyboardEnabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Number keys 1-9
      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (actions[index] && !actions[index].disabled) {
          onActionSelect(actions[index].id);
        }
      }

      // Arrow keys
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, actions.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }

      // Enter key
      if (e.key === 'Enter') {
        e.preventDefault();
        const action = actions[selectedIndex];
        if (action && !action.disabled) {
          onActionSelect(action.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [actions, selectedIndex, onActionSelect, keyboardEnabled]);

  if (actions.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`} data-testid="action-menu-empty">
        No actions available
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`} data-testid="action-menu">
      {actions.map((action, index) => (
        <ActionMenuItem
          key={action.id}
          action={action}
          index={index}
          isSelected={index === selectedIndex}
          onSelect={() => {
            if (!action.disabled) {
              onActionSelect(action.id);
            }
          }}
        />
      ))}
    </div>
  );
};

interface ActionMenuItemProps {
  action: IAction;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

const ActionMenuItem: React.FC<ActionMenuItemProps> = ({
  action,
  index,
  isSelected,
  onSelect,
}) => {
  const baseClasses =
    'w-full text-left px-4 py-3 border-2 rounded transition-all duration-150';
  const selectedClasses = isSelected
    ? 'border-yellow-500 bg-yellow-50 shadow-md'
    : 'border-gray-300 bg-white';
  const disabledClasses = action.disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'hover:border-blue-500 hover:bg-blue-50 cursor-pointer hover:shadow-sm';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!action.disabled) {
      onSelect();
    }
  };

  return (
    <button
      className={`${baseClasses} ${selectedClasses} ${disabledClasses}`}
      onClick={handleClick}
      disabled={action.disabled}
      data-testid={`action-item-${action.id}`}
      aria-label={`Action ${index + 1}: ${action.displayName}`}
      aria-disabled={action.disabled}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-500 min-w-[1.5rem]">
              {index + 1}.
            </span>
            <span className="font-semibold text-gray-900">
              {action.displayName}
            </span>
            {action.icon && (
              <span className="text-sm" role="img" aria-label="icon">
                {action.icon}
              </span>
            )}
          </div>
          {action.description && (
            <div className="text-sm text-gray-600 mt-1 ml-8">
              {action.description}
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500 ml-4 flex flex-col items-end gap-1">
          {action.timeCost !== undefined && action.timeCost > 0 && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
              ⏱ {action.timeCost} {action.timeCost === 1 ? 'unit' : 'units'}
            </span>
          )}
          {action.cost !== undefined && action.cost > 0 && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
              ${action.cost}
            </span>
          )}
        </div>
      </div>

      {action.disabled && action.requirements && action.requirements.length > 0 && (
        <div className="text-xs text-red-600 mt-2 ml-8 bg-red-50 px-2 py-1 rounded">
          <strong>Requirements:</strong> {action.requirements.join(', ')}
        </div>
      )}
    </button>
  );
};
