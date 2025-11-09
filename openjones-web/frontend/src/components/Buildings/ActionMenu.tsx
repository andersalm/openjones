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
        if (actions[index]) {
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
        if (action) {
          onActionSelect(action.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [actions, selectedIndex, onActionSelect, keyboardEnabled]);

  if (actions.length === 0) {
    return (
      <div
        className={`text-center py-12 text-zinc-500 bg-zinc-800/30 rounded-lg border border-dashed border-zinc-700 ${className}`}
        data-testid="action-menu-empty"
      >
        <div className="font-semibold text-base">No actions available</div>
        <div className="text-sm mt-2 text-zinc-600">Try entering the building first</div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`} data-testid="action-menu">
      {actions.map((action, index) => (
        <ActionMenuItem
          key={action.id}
          action={action}
          index={index}
          isSelected={index === selectedIndex}
          onSelect={() => onActionSelect(action.id)}
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
    'w-full text-left px-5 py-4 border rounded-lg transition-all duration-150';
  const selectedClasses = isSelected
    ? 'border-blue-600 bg-blue-950/50 shadow-md'
    : 'border-zinc-700 bg-zinc-800/50';
  const interactionClasses = 'hover:border-zinc-600 hover:bg-zinc-800 cursor-pointer hover:shadow-sm';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect();
  };

  return (
    <button
      className={`${baseClasses} ${selectedClasses} ${interactionClasses}`}
      onClick={handleClick}
      data-testid={`action-item-${action.id}`}
      aria-label={`Action ${index + 1}: ${action.displayName}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-bold text-zinc-600 min-w-[1.75rem] text-base">
              {index + 1}.
            </span>
            <span className="font-semibold text-white text-base">
              {action.displayName}
            </span>
          </div>
          {action.description && (
            <div className="text-sm text-zinc-400 mt-2 ml-10">
              {action.description}
            </div>
          )}
        </div>

        <div className="text-sm ml-4 flex flex-col items-end">
          {action.timeCost !== undefined && action.timeCost > 0 && (
            <span className="bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-md text-xs font-bold border border-blue-600/30">
              {action.timeCost}u
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
