# Worker 3: Task C7 - Victory & Game Over Screens

**Session Type:** WORKER
**Branch:** `claude/victory-gameover-screens-c7-[YOUR-SESSION-ID]`
**Date:** 2025-11-07
**Session:** 3

---

## 🎯 Primary Objective

Implement VictoryScreen and GameOverScreen React components for displaying end-game states. These screens will show when players win (reach victory goals) or lose (run out of time/resources), with statistics, animations, and replay options.

---

## 📦 Deliverables

- [ ] `frontend/src/components/Menus/VictoryScreen.tsx` (100-150 lines)
- [ ] `frontend/src/components/Menus/VictoryScreen.test.tsx` (20+ tests)
- [ ] `frontend/src/components/Menus/GameOverScreen.tsx` (100-150 lines)
- [ ] `frontend/src/components/Menus/GameOverScreen.test.tsx` (20+ tests)
- [ ] Update `frontend/src/components/Menus/index.ts` with exports
- [ ] Completion report file

---

## 🚀 Quick Start

```bash
cd /home/user/openjones/openjones-web
git checkout -b claude/victory-gameover-screens-c7-[YOUR-SESSION-ID]

# Verify design system exists (Task C1, Session 1)
ls -la frontend/src/components/ui/

# Check existing menu components for patterns
cat frontend/src/components/Menus/MainMenu.tsx | head -40
cat frontend/src/components/Menus/GameSetup.tsx | head -40
```

---

## 📚 Context

**Dependencies:**
- ✅ Design system (Task C1) - Complete in Session 1
- ✅ MainMenu & GameSetup (Task C6) - Complete in Session 1
- ✅ Game store (Task A8) - Complete in Session 1

**Integration points:**
- Called when game ends (victory or defeat)
- Connected to game store for final statistics
- Provides "Play Again" and "Main Menu" options

**Victory conditions (from original game):**
Players win by meeting all victory goals within the time limit:
- Wealth: Reach target net worth (default: $10,000)
- Health: Maintain minimum health
- Happiness: Maintain minimum happiness
- Education: Reach education level
- Career: Reach career level

**Game over conditions:**
Players lose if:
- Time runs out without meeting goals
- Health drops to 0
- Bankruptcy with no recovery options

**Existing menu patterns to follow:**
```bash
# Check MainMenu for styling patterns
cat frontend/src/components/Menus/MainMenu.tsx

# Check GameSetup for button patterns
cat frontend/src/components/Menus/GameSetup.tsx
```

---

## ✅ Implementation Steps

### Step 1: Define Types

```typescript
// frontend/src/components/Menus/types.ts (create if needed)
export interface GameStats {
  finalWealth: number;
  finalHealth: number;
  finalHappiness: number;
  finalEducation: number;
  finalCareer: number;
  weeksPlayed: number;
  goalsAchieved: string[];
  goalsMissed: string[];
}

export interface VictoryScreenProps {
  stats: GameStats;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export interface GameOverScreenProps {
  stats: GameStats;
  reason: 'timeout' | 'death' | 'bankruptcy';
  onPlayAgain: () => void;
  onMainMenu: () => void;
}
```

### Step 2: Implement VictoryScreen Component

Create `frontend/src/components/Menus/VictoryScreen.tsx`:

```typescript
import React from 'react';
import type { VictoryScreenProps } from './types';

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  stats,
  onPlayAgain,
  onMainMenu,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4">
        {/* Victory Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-2 animate-bounce">
            🎉 VICTORY! 🎉
          </h1>
          <p className="text-2xl text-yellow-900">
            Congratulations! You've made it in the fast lane!
          </p>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Final Statistics
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <StatItem label="Wealth" value={`$${stats.finalWealth.toLocaleString()}`} />
            <StatItem label="Weeks Played" value={stats.weeksPlayed.toString()} />
            <StatItem label="Health" value={`${stats.finalHealth}%`} />
            <StatItem label="Happiness" value={`${stats.finalHappiness}%`} />
            <StatItem label="Education" value={`Level ${stats.finalEducation}`} />
            <StatItem label="Career" value={`Level ${stats.finalCareer}`} />
          </div>

          {/* Goals Achieved */}
          {stats.goalsAchieved.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                ✅ Goals Achieved:
              </h3>
              <ul className="list-disc list-inside text-gray-700">
                {stats.goalsAchieved.map((goal, index) => (
                  <li key={index}>{goal}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={onMainMenu}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper component for stat items
const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
    <span className="font-medium text-gray-700">{label}:</span>
    <span className="font-bold text-gray-900">{value}</span>
  </div>
);
```

### Step 3: Implement GameOverScreen Component

Create `frontend/src/components/Menus/GameOverScreen.tsx`:

```typescript
import React from 'react';
import type { GameOverScreenProps } from './types';

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  stats,
  reason,
  onPlayAgain,
  onMainMenu,
}) => {
  const getReasonMessage = (): string => {
    switch (reason) {
      case 'timeout':
        return "Time ran out! You didn't reach your goals in time.";
      case 'death':
        return "Your health dropped to zero. Game over!";
      case 'bankruptcy':
        return "You're bankrupt with no way to recover.";
      default:
        return "Game over!";
    }
  };

  const getReasonColor = (): string => {
    switch (reason) {
      case 'timeout':
        return 'from-orange-500 to-orange-700';
      case 'death':
        return 'from-red-500 to-red-700';
      case 'bankruptcy':
        return 'from-purple-500 to-purple-700';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className={`bg-gradient-to-b ${getReasonColor()} rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4`}>
        {/* Game Over Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-2">
            GAME OVER
          </h1>
          <p className="text-xl text-white opacity-90">
            {getReasonMessage()}
          </p>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Your Performance
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <StatItem label="Wealth" value={`$${stats.finalWealth.toLocaleString()}`} />
            <StatItem label="Weeks Survived" value={stats.weeksPlayed.toString()} />
            <StatItem label="Health" value={`${stats.finalHealth}%`} />
            <StatItem label="Happiness" value={`${stats.finalHappiness}%`} />
            <StatItem label="Education" value={`Level ${stats.finalEducation}`} />
            <StatItem label="Career" value={`Level ${stats.finalCareer}`} />
          </div>

          {/* Goals Status */}
          {stats.goalsMissed.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-red-700 mb-2">
                ❌ Goals Not Achieved:
              </h3>
              <ul className="list-disc list-inside text-gray-700">
                {stats.goalsMissed.map((goal, index) => (
                  <li key={index}>{goal}</li>
                ))}
              </ul>
            </div>
          )}

          {stats.goalsAchieved.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                ✅ Goals Achieved:
              </h3>
              <ul className="list-disc list-inside text-gray-700">
                {stats.goalsAchieved.map((goal, index) => (
                  <li key={index}>{goal}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onMainMenu}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper component (same as VictoryScreen)
const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
    <span className="font-medium text-gray-700">{label}:</span>
    <span className="font-bold text-gray-900">{value}</span>
  </div>
);
```

### Step 4: Write Comprehensive Tests

Create test files for both components:

```typescript
// frontend/src/components/Menus/VictoryScreen.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VictoryScreen } from './VictoryScreen';

describe('VictoryScreen', () => {
  const mockStats = {
    finalWealth: 15000,
    finalHealth: 85,
    finalHappiness: 90,
    finalEducation: 7,
    finalCareer: 8,
    weeksPlayed: 52,
    goalsAchieved: ['Wealth Goal', 'Career Goal'],
    goalsMissed: [],
  };

  const mockOnPlayAgain = vi.fn();
  const mockOnMainMenu = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render victory message', () => {
    render(
      <VictoryScreen
        stats={mockStats}
        onPlayAgain={mockOnPlayAgain}
        onMainMenu={mockOnMainMenu}
      />
    );

    expect(screen.getByText(/VICTORY!/i)).toBeInTheDocument();
  });

  it('should display final statistics', () => {
    render(
      <VictoryScreen
        stats={mockStats}
        onPlayAgain={mockOnPlayAgain}
        onMainMenu={mockOnMainMenu}
      />
    );

    expect(screen.getByText('$15,000')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('52')).toBeInTheDocument();
  });

  it('should call onPlayAgain when Play Again clicked', () => {
    render(
      <VictoryScreen
        stats={mockStats}
        onPlayAgain={mockOnPlayAgain}
        onMainMenu={mockOnMainMenu}
      />
    );

    fireEvent.click(screen.getByText('Play Again'));
    expect(mockOnPlayAgain).toHaveBeenCalledTimes(1);
  });

  it('should call onMainMenu when Main Menu clicked', () => {
    render(
      <VictoryScreen
        stats={mockStats}
        onPlayAgain={mockOnPlayAgain}
        onMainMenu={mockOnMainMenu}
      />
    );

    fireEvent.click(screen.getByText('Main Menu'));
    expect(mockOnMainMenu).toHaveBeenCalledTimes(1);
  });

  it('should display goals achieved', () => {
    render(
      <VictoryScreen
        stats={mockStats}
        onPlayAgain={mockOnPlayAgain}
        onMainMenu={mockOnMainMenu}
      />
    );

    expect(screen.getByText('Wealth Goal')).toBeInTheDocument();
    expect(screen.getByText('Career Goal')).toBeInTheDocument();
  });

  // Add 15+ more tests for edge cases, accessibility, etc.
});

// GameOverScreen.test.tsx - Similar structure with 20+ tests
```

### Step 5: Update Exports

```typescript
// frontend/src/components/Menus/index.ts
export { MainMenu } from './MainMenu';
export { GameSetup } from './GameSetup';
export { VictoryScreen } from './VictoryScreen';
export { GameOverScreen } from './GameOverScreen';
```

---

## 🧪 Testing Requirements

- **Framework:** Vitest + React Testing Library
- **Minimum Tests:** 40+ total (20+ per component)
- **Coverage:** All props, user interactions, conditional rendering

**Key test scenarios:**
1. Component rendering
2. Statistics display (all variations)
3. Button callbacks
4. Different game over reasons
5. Goals achieved/missed lists
6. Edge cases (zero stats, empty goals)
7. Accessibility (ARIA labels, keyboard nav)

---

## 🔍 Verification Checklist

### Code
- [ ] Files created: `ls -la frontend/src/components/Menus/VictoryScreen.tsx frontend/src/components/Menus/GameOverScreen.tsx`
- [ ] No syntax errors: `npm run type-check`
- [ ] Tailwind classes applied correctly
- [ ] Responsive design (mobile + desktop)

### Tests
- [ ] Tests written for both components
- [ ] Tests pass: `npm test -- Victory` and `npm test -- GameOver`
- [ ] Test count: 40+ tests total
- [ ] No warnings

### Visual
- [ ] Colors match game theme
- [ ] Text readable on all backgrounds
- [ ] Buttons have hover states
- [ ] Layout responsive

### Git
- [ ] Committed: `git log -1 --oneline`
- [ ] Pushed: `git push -u origin claude/victory-gameover-screens-c7-[YOUR-SESSION-ID]`

---

## 🚫 Common Mistakes to Avoid

1. **Using Jest instead of Vitest**
2. **Not testing button callbacks** - Verify onClick functions called
3. **Missing accessibility** - Add ARIA labels
4. **Hard-coded values** - Use props for all data
5. **Not handling edge cases** - Test with zero/empty values

---

## 📝 Final Report (REQUIRED)

```bash
cat > .coordinator/rounds/round-03/worker-3-report.md <<'EOF'
# Worker 3 Report: Task C7 - Victory & Game Over Screens

**Branch:** claude/victory-gameover-screens-c7-[YOUR-ACTUAL-SESSION-ID]
**Commit:** [paste: git log -1 --format=%h]

## Deliverables
✅ VictoryScreen.tsx (XX lines)
✅ VictoryScreen.test.tsx (XX tests)
✅ GameOverScreen.tsx (XX lines)
✅ GameOverScreen.test.tsx (XX tests)
✅ Updated index.ts exports

## Test Results
- Tests run: XX
- Tests passed: XX (100%)
- Commands:
  - `npm test -- Victory`
  - `npm test -- GameOver`

[Paste test output]

## Type Check
- Status: ✅ PASSED

## Files Created
[Paste: ls -la frontend/src/components/Menus/]

## Visual Verification
- VictoryScreen: Gold/yellow theme with celebration
- GameOverScreen: Colored by reason (red/orange/purple)
- Both: Responsive, accessible, clear CTAs

## Issues Encountered
[None, or describe resolutions]
EOF

git add .coordinator/rounds/round-03/worker-3-report.md
git commit -m "docs: Add Worker 3 completion report for Task C7"
git push
```

---

**Instructions generated:** 2025-11-07
**Session:** 3
**Good luck!** 🚀
