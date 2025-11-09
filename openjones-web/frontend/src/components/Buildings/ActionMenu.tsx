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
        className={`text-center py-10 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 ${className}`}
        data-testid="action-menu-empty"
      >
        <div className="text-4xl mb-2">🏢</div>
        <div className="font-semibold">No actions available</div>
        <div className="text-sm mt-1">Try entering the building first</div>
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
    'w-full text-left px-5 py-4 border-2 rounded-xl transition-all duration-200 transform';
  const selectedClasses = isSelected
    ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg scale-[1.02] ring-2 ring-amber-200'
    : 'border-slate-300 bg-white shadow-sm';
  const interactionClasses = 'hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99]';

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
            <span
              className="font-bold text-slate-500 min-w-[2rem] text-base"
              style={{
                textShadow: isSelected ? '0 0 8px rgba(245, 158, 11, 0.3)' : 'none'
              }}
            >
              {index + 1}.
            </span>
            <span className="font-bold text-slate-900 text-lg tracking-tight">
              {action.displayName}
            </span>
          </div>
          {action.description && (
            <div className="text-sm text-slate-600 mt-2 ml-11 leading-relaxed">
              {action.description}
            </div>
          )}
        </div>

        <div className="text-sm ml-4 flex flex-col items-end gap-1.5">
          {action.timeCost !== undefined && action.timeCost > 0 && (
            <span
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm"
              style={{
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
              }}
            >
              ⏱ {action.timeCost}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
