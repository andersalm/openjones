# Worker 3: Task C3 - Building Modal

## 🚨 CRITICAL: Run These Commands FIRST!

**Before reading the rest of this document, execute these commands in order:**

```bash
# Step 1: Navigate to project directory
cd /home/user/openjones/openjones-web

# Step 2: Fetch the coordinator branch
git fetch origin claude/coordinator-verify-openjones-session-4-011CUuCQHprJA3z66hEdygJ2

# Step 3: Checkout the coordinator branch
git checkout claude/coordinator-verify-openjones-session-4-011CUuCQHprJA3z66hEdygJ2

# Step 4: Verify you can see this file
pwd  # Should show: /home/user/openjones/openjones-web
ls .coordinator/rounds/round-04/

# Step 5: Install dependencies
npm install

# Step 6: Create YOUR worker branch (follow naming rules below!)
git checkout -b claude/building-modal-c3-[YOUR-SESSION-ID]
```

**✅ If all commands succeeded, continue reading below.**
**❌ If any command failed, stop and ask for help.**

---

## 📛 Branch Naming Rules (IMPORTANT!)

Your branch name MUST follow this pattern:

**Pattern:** `claude/[task-name]-[task-id]-[YOUR-SESSION-ID]`

**✅ CORRECT Example for this task:**
- `claude/building-modal-c3-011CUv12345678901234567890`

**❌ WRONG Examples (DO NOT USE!):**
- `claude/coordinator-verify-openjones-011CUv...` ← WRONG! Don't use "coordinator" pattern
- `claude/worker-3-011CUv...` ← WRONG! Don't use worker number
- `claude/task-c3-011CUv...` ← WRONG! Use descriptive name

**Why this matters:**
- Makes it easy for coordinator to find your branch
- Clear what task you worked on
- Prevents confusion with coordinator branch

---

**Session Type:** WORKER
**Branch:** `claude/building-modal-c3-[YOUR-SESSION-ID]`
**Date:** 2025-11-07
**Session:** 4

---

## 🎯 Primary Objective

Implement the BuildingModal component for building interactions in the OpenJones browser port. This modal dialog will be the primary interface for players to interact with buildings (work, study, shop, etc.) by displaying building information, action menus, and results.

---

## 📦 Deliverables

- [ ] `frontend/src/components/Buildings/BuildingModal.tsx` (200-250 lines)
- [ ] `frontend/src/components/Buildings/BuildingModal.test.tsx` (35+ tests)
- [ ] Modal dialog with building information
- [ ] Action menu integration
- [ ] Action result display
- [ ] Entry/exit animations
- [ ] Completion report file

---

## 📚 Context

The Design System (Task C1) and ActionMenu (Task C4) were completed in Session 3. You now have:
- UI components (Button, Panel, Card)
- ActionMenu component with keyboard navigation
- Design patterns and styling

**Your task:** Create a BuildingModal that:
1. Displays building name and description
2. Integrates ActionMenu for action selection
3. Shows action results (success, failure, cost, time)
4. Handles entry/exit with smooth transitions
5. Supports keyboard controls (ESC to close)
6. Responsive design for different screen sizes

**This task provides:** Core building interaction UI

**Dependencies satisfied:**
- ✅ C1 (Design System) - Complete in Session 1
- ✅ C4 (ActionMenu) - Complete in Session 3

**Reference existing components:**
```bash
frontend/src/components/PlayerStats/PlayerStatsHUD.tsx
frontend/src/components/Buildings/ActionMenu.tsx
frontend/src/components/ui/Panel.tsx
```

---

## ✅ Implementation Steps

### Step 1: Review Existing Component Patterns

First, examine the ActionMenu component:

```bash
cat frontend/src/components/Buildings/ActionMenu.tsx
```

Study how it handles:
- Action display
- Keyboard navigation
- Callbacks
- TypeScript props

### Step 2: Define Component Types

```typescript
// frontend/src/components/Buildings/BuildingModal.tsx
import React, { useEffect, useState } from 'react';
import { IAction, IBuilding } from '../../../../shared/types/contracts';
import { ActionMenu } from './ActionMenu';
import { Panel } from '../ui/Panel';

export interface BuildingModalProps {
  /** The building being interacted with */
  building: IBuilding | null;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when action is selected */
  onActionSelect: (actionId: string) => void;
  /** Current action result to display (optional) */
  actionResult?: ActionResult;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Optional className for customization */
  className?: string;
}

export interface ActionResult {
  /** Whether the action succeeded */
  success: boolean;
  /** Message to display */
  message: string;
  /** Effects of the action */
  effects?: {
    cashChange?: number;
    healthChange?: number;
    happinessChange?: number;
    educationChange?: number;
    careerChange?: number;
    timeSpent?: number;
  };
  /** New actions to display (after action) */
  newActions?: IAction[];
}
```

### Step 3: Implement BuildingModal Component

```typescript
export const BuildingModal: React.FC<BuildingModalProps> = ({
  building,
  onClose,
  onActionSelect,
  actionResult,
  isOpen,
  className = '',
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Animation on open
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !building) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
      data-testid="building-modal-overlay"
    >
      <div
        className={`
          bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden
          transform transition-all duration-300
          ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
        data-testid="building-modal"
      >
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" data-testid="building-name">
              {building.name}
            </h2>
            {building.description && (
              <p className="text-blue-100 text-sm mt-1" data-testid="building-description">
                {building.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors text-3xl font-bold leading-none"
            aria-label="Close modal"
            data-testid="close-button"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {actionResult ? (
            <ActionResultDisplay result={actionResult} onDismiss={() => onActionSelect('')} />
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                What would you like to do?
              </h3>
              <ActionMenu
                actions={building.actions || []}
                onActionSelect={onActionSelect}
                keyboardEnabled={isOpen}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-3 flex justify-between items-center text-sm text-gray-600">
          <div>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded shadow-sm font-mono text-xs">
              ESC
            </kbd>
            <span className="ml-2">to close</span>
          </div>
          <div>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded shadow-sm font-mono text-xs">
              1-9
            </kbd>
            <span className="ml-2">to select action</span>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Step 4: Implement ActionResultDisplay

```typescript
interface ActionResultDisplayProps {
  result: ActionResult;
  onDismiss: () => void;
}

const ActionResultDisplay: React.FC<ActionResultDisplayProps> = ({ result, onDismiss }) => {
  return (
    <div className="space-y-4" data-testid="action-result">
      {/* Result Status */}
      <div
        className={`
          p-4 rounded-lg border-2
          ${result.success
            ? 'bg-green-50 border-green-500 text-green-900'
            : 'bg-red-50 border-red-500 text-red-900'
          }
        `}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {result.success ? '✓' : '✗'}
          </span>
          <span className="font-semibold text-lg" data-testid="result-message">
            {result.message}
          </span>
        </div>
      </div>

      {/* Effects Display */}
      {result.effects && (
        <div className="bg-gray-50 p-4 rounded-lg" data-testid="action-effects">
          <h4 className="font-semibold text-gray-800 mb-3">Effects:</h4>
          <div className="grid grid-cols-2 gap-3">
            {result.effects.cashChange !== undefined && result.effects.cashChange !== 0 && (
              <EffectItem
                label="Cash"
                value={result.effects.cashChange}
                prefix="$"
                testId="cash-change"
              />
            )}
            {result.effects.healthChange !== undefined && result.effects.healthChange !== 0 && (
              <EffectItem
                label="Health"
                value={result.effects.healthChange}
                testId="health-change"
              />
            )}
            {result.effects.happinessChange !== undefined && result.effects.happinessChange !== 0 && (
              <EffectItem
                label="Happiness"
                value={result.effects.happinessChange}
                testId="happiness-change"
              />
            )}
            {result.effects.educationChange !== undefined && result.effects.educationChange !== 0 && (
              <EffectItem
                label="Education"
                value={result.effects.educationChange}
                testId="education-change"
              />
            )}
            {result.effects.careerChange !== undefined && result.effects.careerChange !== 0 && (
              <EffectItem
                label="Career"
                value={result.effects.careerChange}
                testId="career-change"
              />
            )}
            {result.effects.timeSpent !== undefined && result.effects.timeSpent > 0 && (
              <div className="flex items-center justify-between" data-testid="time-spent">
                <span className="text-gray-700">Time Spent:</span>
                <span className="font-semibold text-blue-600">
                  {result.effects.timeSpent} units
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onDismiss}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          data-testid="dismiss-button"
        >
          Continue
        </button>
      </div>

      {/* New Actions (if any) */}
      {result.newActions && result.newActions.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Next Actions:</h4>
          <ActionMenu
            actions={result.newActions}
            onActionSelect={() => {}}
            keyboardEnabled={false}
          />
        </div>
      )}
    </div>
  );
};

interface EffectItemProps {
  label: string;
  value: number;
  prefix?: string;
  testId: string;
}

const EffectItem: React.FC<EffectItemProps> = ({ label, value, prefix = '', testId }) => {
  const isPositive = value > 0;
  const color = isPositive ? 'text-green-600' : 'text-red-600';
  const sign = isPositive ? '+' : '';

  return (
    <div className="flex items-center justify-between" data-testid={testId}>
      <span className="text-gray-700">{label}:</span>
      <span className={`font-semibold ${color}`}>
        {sign}{prefix}{value}
      </span>
    </div>
  );
};
```

### Step 5: Write Comprehensive Tests

Create `frontend/src/components/Buildings/BuildingModal.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BuildingModal, ActionResult } from './BuildingModal';
import type { IBuilding } from '../../../../shared/types/contracts';

describe('BuildingModal', () => {
  const mockBuilding: IBuilding = {
    id: 'bank',
    name: 'City Bank',
    description: 'Manage your finances and investments',
    type: 'BANK',
    position: { x: 1, y: 1 },
    actions: [
      {
        id: 'deposit',
        displayName: 'Deposit Money',
        description: 'Deposit cash into savings',
        timeCost: 5,
        cost: 0,
        disabled: false,
      },
      {
        id: 'withdraw',
        displayName: 'Withdraw Money',
        description: 'Withdraw from savings',
        timeCost: 5,
        cost: 0,
        disabled: false,
      },
    ],
  };

  const mockOnClose = vi.fn();
  const mockOnActionSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render when open', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      expect(screen.getByTestId('building-modal')).toBeInTheDocument();
      expect(screen.getByTestId('building-name')).toHaveTextContent('City Bank');
    });

    it('should not render when closed', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={false}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      expect(screen.queryByTestId('building-modal')).not.toBeInTheDocument();
    });

    it('should not render when building is null', () => {
      render(
        <BuildingModal
          building={null}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      expect(screen.queryByTestId('building-modal')).not.toBeInTheDocument();
    });

    it('should display building description', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      expect(screen.getByTestId('building-description')).toHaveTextContent(
        'Manage your finances and investments'
      );
    });

    it('should render actions menu', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      expect(screen.getByText('Deposit Money')).toBeInTheDocument();
      expect(screen.getByText('Withdraw Money')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onClose when close button clicked', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      fireEvent.click(screen.getByTestId('close-button'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when overlay clicked', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      fireEvent.click(screen.getByTestId('building-modal-overlay'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when modal content clicked', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      fireEvent.click(screen.getByTestId('building-modal'));
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should call onClose when ESC key pressed', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onActionSelect when action selected', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      fireEvent.click(screen.getByTestId('action-item-deposit'));
      expect(mockOnActionSelect).toHaveBeenCalledWith('deposit');
    });
  });

  describe('action result display', () => {
    it('should display success result', () => {
      const result: ActionResult = {
        success: true,
        message: 'Successfully deposited $500',
        effects: {
          cashChange: -500,
        },
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      expect(screen.getByTestId('action-result')).toBeInTheDocument();
      expect(screen.getByTestId('result-message')).toHaveTextContent('Successfully deposited $500');
    });

    it('should display failure result', () => {
      const result: ActionResult = {
        success: false,
        message: 'Insufficient funds',
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      expect(screen.getByTestId('action-result')).toBeInTheDocument();
      expect(screen.getByTestId('result-message')).toHaveTextContent('Insufficient funds');
    });

    it('should display cash change', () => {
      const result: ActionResult = {
        success: true,
        message: 'Transaction complete',
        effects: {
          cashChange: 100,
        },
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      expect(screen.getByTestId('cash-change')).toBeInTheDocument();
      expect(screen.getByTestId('cash-change')).toHaveTextContent('+$100');
    });

    it('should display multiple effects', () => {
      const result: ActionResult = {
        success: true,
        message: 'Work shift completed',
        effects: {
          cashChange: 50,
          healthChange: -10,
          careerChange: 5,
          timeSpent: 40,
        },
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      expect(screen.getByTestId('cash-change')).toHaveTextContent('+$50');
      expect(screen.getByTestId('health-change')).toHaveTextContent('-10');
      expect(screen.getByTestId('career-change')).toHaveTextContent('+5');
      expect(screen.getByTestId('time-spent')).toHaveTextContent('40 units');
    });

    it('should have dismiss button on result', () => {
      const result: ActionResult = {
        success: true,
        message: 'Done',
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      expect(screen.getByTestId('dismiss-button')).toBeInTheDocument();
    });

    it('should call onActionSelect when dismiss clicked', () => {
      const result: ActionResult = {
        success: true,
        message: 'Done',
      };

      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
          actionResult={result}
        />
      );

      fireEvent.click(screen.getByTestId('dismiss-button'));
      expect(mockOnActionSelect).toHaveBeenCalledWith('');
    });
  });

  describe('animations', () => {
    it('should have animation classes', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      const modal = screen.getByTestId('building-modal');
      expect(modal.className).toContain('transition');
    });
  });

  describe('accessibility', () => {
    it('should have close button aria-label', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      const closeButton = screen.getByTestId('close-button');
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal');
    });

    it('should show keyboard shortcuts', () => {
      render(
        <BuildingModal
          building={mockBuilding}
          isOpen={true}
          onClose={mockOnClose}
          onActionSelect={mockOnActionSelect}
        />
      );

      expect(screen.getByText('ESC')).toBeInTheDocument();
      expect(screen.getByText('1-9')).toBeInTheDocument();
    });
  });
});
```

---

## 🧪 Testing Requirements

- **Framework:** Vitest (NOT Jest)
- **Minimum Tests:** 35+
- **Coverage:** All component states, interactions, results

**Key test scenarios:**
1. Modal open/close states
2. Building information display
3. Action menu integration
4. Close button functionality
5. Overlay click handling
6. ESC key handling
7. Action result display (success/failure)
8. Effect displays (cash, health, etc.)
9. Dismiss button functionality
10. Animations and transitions
11. Accessibility features

**Use React Testing Library:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
```

---

## 🔍 Verification Checklist

**Before claiming completion, verify ALL of these:**

### Code
- [ ] All files created: `ls -la frontend/src/components/Buildings/BuildingModal.tsx`
- [ ] No syntax errors: `npm run type-check`
- [ ] Follows existing component patterns
- [ ] Uses shared types from contracts.ts
- [ ] No debug code (console.log, TODOs)
- [ ] Proper TypeScript types

### Tests
- [ ] Tests written: `ls -la frontend/src/components/Buildings/BuildingModal.test.tsx`
- [ ] Tests pass: `npm test -- BuildingModal`
- [ ] Test count: 35+ (you should exceed this!)
- [ ] No test errors or warnings
- [ ] Tests cover all interactions

### Git
- [ ] Branch name correct: `claude/building-modal-c3-[YOUR-SESSION-ID]`
- [ ] In correct directory: `/home/user/openjones/openjones-web`
- [ ] Changes staged: `git status`
- [ ] Committed: `git log -1 --oneline`
- [ ] Pushed: `git push -u origin claude/building-modal-c3-[YOUR-SESSION-ID]`
- [ ] Verified: `git ls-remote origin claude/building-modal-c3-[YOUR-SESSION-ID]`

### Final Commands
```bash
# Run ALL these commands and paste output in your report
npm run type-check 2>&1 | tail -30
npm test -- BuildingModal 2>&1 | tail -30
ls -la frontend/src/components/Buildings/
wc -l frontend/src/components/Buildings/BuildingModal.tsx
git log -1 --oneline
```

---

## 🚫 Common Mistakes to Avoid

1. **Using Jest instead of Vitest** - Import from 'vitest', not 'jest'
2. **Wrong import paths** - Use `@testing-library/react` for testing
3. **Not stopping event propagation** - Modal content clicks should not close modal
4. **Missing cleanup** - Remove event listeners in useEffect cleanup
5. **Hard-coded values** - Use building props, not mock data

---

## 📝 Final Report (REQUIRED)

**When complete, create your completion report:**

```bash
cat > .coordinator/rounds/round-04/worker-3-report.md <<'EOF'
# Worker 3 Report: Task C3 - Building Modal

**Branch:** claude/building-modal-c3-[YOUR-ACTUAL-SESSION-ID]
**Commit:** [paste: git log -1 --format=%h]

## Deliverables
✅ BuildingModal.tsx (XX lines)
✅ BuildingModal.test.tsx (XX tests)

## Test Results
- Tests run: XX
- Tests passed: XX (100%)
- Command: `npm test -- BuildingModal`

[Paste last 20 lines of test output]

## Type Check
- Status: ✅ PASSED (or note any pre-existing errors)
- Command: `npm run type-check`

## Files Created
[Paste: ls -la frontend/src/components/Buildings/]

## Issues Encountered
[None, or describe any issues and how you resolved them]

## Notes for Integration
[Any important information for the coordinator]
EOF

git add .coordinator/rounds/round-04/worker-3-report.md
git commit -m "docs: Add Worker 3 completion report for Task C3"
git push
```

---

## 💡 Tips for Success

- **Study existing components** - PlayerStatsHUD and ActionMenu are good examples
- **Focus on UX** - Smooth animations, clear feedback
- **Test interactions** - ESC key, overlay clicks, button clicks
- **Responsive design** - Works on different screen sizes
- **Accessibility** - Keyboard navigation, aria labels

---

## 📚 Reference

**Similar Components:**
- `frontend/src/components/PlayerStats/PlayerStatsHUD.tsx`
- `frontend/src/components/Buildings/ActionMenu.tsx`
- `frontend/src/components/ui/Panel.tsx`

**Contracts:** `shared/types/contracts.ts` (IBuilding, IAction)
**Testing:** React Testing Library documentation

---

**Instructions generated:** 2025-11-07
**Session:** 4
**Good luck!** 🚀
