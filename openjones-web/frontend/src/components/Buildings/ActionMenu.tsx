import React, { useState, useEffect } from 'react';
import { IAction, GAME_CONSTANTS } from '../../../../shared/types/contracts';
import { theme } from '../../theme';

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
      // Number keys 0-9 (support all actions via sequential digits)
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        const digit = parseInt(e.key);
        // For single digit: 1-9 map to index 0-8, 0 maps to index 9
        const index = digit === 0 ? 9 : digit - 1;
        if (actions[index]) {
          onActionSelect(actions[index].id);
        }
      }

      // Arrow keys for navigation
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, actions.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }

      // Page Up/Down for faster navigation
      if (e.key === 'PageDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 5, actions.length - 1));
      }
      if (e.key === 'PageUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 5, 0));
      }

      // Enter key to select
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

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
  };

  const emptyStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: theme.spacing.lg,
    color: theme.colors.neutral.black,
    fontSize: theme.typography.fontSize.sm,
  };

  if (actions.length === 0) {
    return (
      <div style={emptyStyle} className={className} data-testid="action-menu-empty">
        NO ACTIONS AVAILABLE
      </div>
    );
  }

  return (
    <div style={containerStyle} className={className} data-testid="action-menu">
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
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect();
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    textAlign: 'left',
    padding: theme.spacing.sm,
    border: `3px solid ${theme.colors.neutral.black}`,
    background: isSelected ? theme.colors.accent.gold : theme.colors.system.windowGray,
    cursor: 'pointer',
    boxShadow: isPressed ? theme.shadows.win95Pressed : theme.shadows.win95Button,
    transform: isPressed ? 'translate(2px, 2px)' : 'none',
    transition: 'none',
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.xs,
    imageRendering: 'pixelated',
  };

  const contentContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const leftContentStyle: React.CSSProperties = {
    flex: 1,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
  };

  const numberStyle: React.CSSProperties = {
    color: theme.colors.neutral.black,
    minWidth: '16px',
  };

  const titleStyle: React.CSSProperties = {
    color: theme.colors.neutral.black,
    textTransform: 'uppercase',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize.tiny,
    color: theme.colors.neutral.darkGray,
    marginTop: theme.spacing.xs,
    marginLeft: '20px',
    lineHeight: 1.4,
  };

  const timeBadgeStyle: React.CSSProperties = {
    background: theme.colors.primary.background,
    color: theme.colors.neutral.white,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    fontSize: theme.typography.fontSize.tiny,
    border: `2px solid ${theme.colors.neutral.black}`,
    marginLeft: theme.spacing.sm,
  };

  return (
    <button
      style={buttonStyle}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      data-testid={`action-item-${action.id}`}
      aria-label={`Action ${index + 1}: ${action.displayName}`}
    >
      <div style={contentContainerStyle}>
        <div style={leftContentStyle}>
          <div style={headerStyle}>
            <span style={numberStyle}>{index + 1}.</span>
            <span style={titleStyle}>{action.displayName}</span>
          </div>
          {action.description && (
            <div style={descriptionStyle}>{action.description}</div>
          )}
        </div>

        {action.timeCost !== undefined && action.timeCost > 0 && (
          <div style={timeBadgeStyle}>
            {Math.round(action.timeCost / GAME_CONSTANTS.TIME_UNITS_PER_HOUR)}H
          </div>
        )}
      </div>
    </button>
  );
};
