# Worker Setup Guide

**For:** New workers/developers joining the OpenJones browser port project
**Last Updated:** 2025-11-06
**Phase:** 0 - Initial Setup Complete

---

## 🎯 Welcome!

You're joining a parallel development team working on porting OpenJones to the browser. This guide will get you set up and coding in **under 30 minutes**.

---

## 📋 Prerequisites

Before you start, ensure you have:

- [ ] **Node.js** v18+ installed ([download](https://nodejs.org/))
- [ ] **Git** installed
- [ ] **VS Code** (recommended) or your preferred editor
- [ ] **Terminal** access (bash, zsh, or PowerShell)

---

## 🚀 Quick Start (5 minutes)

### Step 1: Clone and Install

```bash
# Clone the repository
cd openjones-web

# Install dependencies
npm install

# Verify everything works
npm run dev
```

You should see the development server start at `http://localhost:3000`. Open it in your browser and you should see the Phase 0 welcome screen! 🎉

### Step 2: Verify Your Setup

```bash
# Run tests (should pass with no tests yet)
npm test

# Check TypeScript (should have no errors)
npm run type-check

# Run linter (should pass)
npm run lint
```

If all commands succeed, you're ready to code!

---

## 🎯 Choose Your Track

We have 5 parallel work tracks. Choose one based on your interests:

### Track A: Core Engine (Worker 1)
**What:** Game logic, player state, actions
**Skills:** TypeScript, game state management, business logic
**Files:** `frontend/src/engine/game/`, `frontend/src/engine/actions/`
**Good for:** Backend developers, logic-focused developers

### Track B: Domain Logic (Worker 2)
**What:** Buildings, economy, map, jobs, possessions
**Skills:** TypeScript, domain modeling, data structures
**Files:** `frontend/src/engine/buildings/`, `frontend/src/engine/economy/`, etc.
**Good for:** Backend developers, systems thinkers

### Track C: UI Components (Worker 3)
**What:** React components, user interface
**Skills:** React, TypeScript, CSS, UX
**Files:** `frontend/src/components/`
**Good for:** Frontend developers, UI/UX developers

### Track D: Rendering (Worker 4)
**What:** Canvas rendering, sprites, animations
**Skills:** Canvas API, graphics programming
**Files:** `frontend/src/rendering/`
**Good for:** Graphics programmers, game developers

### Track E: AI System (Worker 5)
**What:** AI agents, planning algorithms, A* pathfinding
**Skills:** Algorithms, AI, game AI
**Files:** `frontend/src/engine/agents/`
**Good for:** Algorithm enthusiasts, AI developers
**Note:** Can start Week 4 (after core engine is ready)

---

## 📂 Project Structure

```
openjones-web/
├── frontend/
│   ├── src/
│   │   ├── engine/          # ← Track A & B work here
│   │   ├── components/      # ← Track C works here
│   │   ├── rendering/       # ← Track D works here
│   │   ├── store/           # Zustand stores (shared)
│   │   └── main.tsx         # App entry point
│   └── tests/               # Tests for your track
│
├── shared/
│   ├── types/
│   │   └── contracts.ts     # ⭐ READ THIS FIRST
│   └── mocks/
│       └── index.ts         # Mock implementations
│
└── docs/                    # Documentation
```

---

## 🔧 Development Workflow

### 1. Create Your Feature Branch

```bash
# Create and switch to your feature branch
# Format: track-X/feature-name
git checkout -b track-a/game-state  # Example for Track A

# Push to remote
git push -u origin track-a/game-state
```

### 2. Read the Contracts

**MOST IMPORTANT STEP:**

```bash
# Open the contracts file
cat shared/types/contracts.ts
```

This file defines **all the interfaces** you need to implement. Read it carefully!

### 3. Use Mocks While Developing

If you need something that another track is building, use the mocks:

```typescript
// Example: Track C (UI) needs Game, but Track A isn't done yet
import { MockGame } from '@shared/mocks';

const game = new MockGame();
// Now you can develop your UI without waiting!
```

### 4. Write Tests

For every feature you implement, write tests:

```bash
# Create a test file next to your implementation
# Example: frontend/src/engine/game/Game.test.ts

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

### 5. Commit Often

```bash
# Stage your changes
git add .

# Commit with good message
# Format: [Track X] type: description
git commit -m "[Track A] feat: implement Game state management"

# Push to your branch
git push
```

### 6. Create Pull Request

When your feature is ready:

1. Go to GitHub
2. Click "New Pull Request"
3. Base: `develop` ← Compare: `your-branch`
4. Fill in description (what, why, how)
5. Request review from at least 1 teammate
6. Merge after approval ✅

---

## 📚 Key Files to Read

### Before You Start Coding

1. **`shared/types/contracts.ts`** - All interfaces (30 min read)
   - Understand what you need to implement
   - See what other tracks provide

2. **`shared/mocks/index.ts`** - Mock implementations (15 min read)
   - See how to use mocks
   - Understand return values

3. **`TASK_PARALLEL.md`** - Your track's tasks (20 min read)
   - Weekly breakdown of work
   - Integration milestones

### As You Code

4. **`docs/COORDINATION.md`** - Daily workflow
   - Standup format
   - Code review process
   - Integration schedule

---

## 🛠️ Useful Commands

### Development

```bash
# Start dev server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run all tests
npm test

# Run tests in UI mode (visual)
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type check (no build)
npm run type-check
```

### Debugging

```bash
# Start with inspect flag for debugging
npm run dev -- --debug

# Check what TypeScript sees
npx tsc --noEmit --listFiles
```

---

## 💡 Path Aliases (Shortcuts)

We have path aliases set up for easier imports:

```typescript
// Instead of: import { Game } from '../../../engine/game/Game'
// Use:
import { Game } from '@engine/game/Game';

// Available aliases:
import { Something } from '@/...'          // frontend/src/
import { Contract } from '@shared/...'     // shared/
import { Engine } from '@engine/...'       // frontend/src/engine/
import { Component } from '@components/...' // frontend/src/components/
import { Renderer } from '@rendering/...'  // frontend/src/rendering/
import { Store } from '@store/...'         // frontend/src/store/
import { Hook } from '@hooks/...'          // frontend/src/hooks/
import { Util } from '@utils/...'          // frontend/src/utils/
```

---

## 🎯 Your First Task

Let's verify you can code by creating a simple test implementation:

### Track A Example: Create a Position class

```typescript
// File: frontend/src/engine/types/Position.ts

import { IPosition } from '@shared/types/contracts';

export class Position implements IPosition {
  constructor(
    public x: number,
    public y: number
  ) {}

  equals(other: IPosition): boolean {
    return this.x === other.x && this.y === other.y;
  }

  toString(): string {
    return `(${this.x}, ${this.y})`;
  }
}
```

### Write a Test

```typescript
// File: frontend/src/engine/types/Position.test.ts

import { describe, it, expect } from 'vitest';
import { Position } from './Position';

describe('Position', () => {
  it('should create a position with x and y', () => {
    const pos = new Position(1, 2);
    expect(pos.x).toBe(1);
    expect(pos.y).toBe(2);
  });

  it('should check equality correctly', () => {
    const pos1 = new Position(1, 2);
    const pos2 = new Position(1, 2);
    const pos3 = new Position(2, 3);

    expect(pos1.equals(pos2)).toBe(true);
    expect(pos1.equals(pos3)).toBe(false);
  });

  it('should convert to string', () => {
    const pos = new Position(3, 4);
    expect(pos.toString()).toBe('(3, 4)');
  });
});
```

### Run the Test

```bash
npm test Position.test.ts
```

If it passes, congrats! You're ready to start real work! 🎉

---

## 🤝 Communication

### Daily Standup (9:00 AM)

Every morning, we have a 15-minute standup. Prepare to share:
1. What did you complete yesterday?
2. What are you working on today?
3. Any blockers?

### Ask Questions

- **Quick questions:** Post in Discord/Slack #general
- **Blockers:** Post in #blockers channel
- **Code review:** Tag someone in your PR
- **Design decisions:** Create a GitHub Discussion

### Response Time Expectations

- Urgent (blocking): <1 hour
- Important: <4 hours
- Normal: <1 day

---

## 🔗 Integration Schedule

### Weekly Integration (Every Friday)

1:00 PM - 5:00 PM: Integration session

**What happens:**
- Everyone merges their week's work to `develop`
- We test everything together
- Fix critical bugs as a team
- Plan next week

**You need to:**
- Have your code ready by 1:00 PM Friday
- Be available for the session
- Help test other tracks' work

---

## 🎨 Code Style Guide

### TypeScript

```typescript
// Use interfaces for contracts
interface IMyInterface {
  doSomething(): void;
}

// Use classes for implementations
class MyClass implements IMyInterface {
  doSomething(): void {
    // ...
  }
}

// Use const for constants
const MAX_HEALTH = 100;

// Use enum for related constants
enum ActionType {
  MOVE = 'MOVE',
  WORK = 'WORK',
}

// Use type for unions
type Result<T> = { success: true; value: T } | { success: false; error: Error };
```

### Naming Conventions

- **Interfaces:** Start with `I` (e.g., `IGame`, `IPlayer`)
- **Classes:** PascalCase (e.g., `Game`, `PlayerState`)
- **Functions:** camelCase (e.g., `processTurn`, `checkVictory`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `GAME_CONSTANTS`)
- **Files:** Match class name (e.g., `Game.ts` for `Game` class)
- **Tests:** Same name + `.test.ts` (e.g., `Game.test.ts`)

### Comments

```typescript
// Good: Explain WHY, not WHAT
// Calculate Manhattan distance because diagonal movement not allowed
const distance = Math.abs(x2 - x1) + Math.abs(y2 - y1);

// Bad: Explains obvious WHAT
// Add x2 and x1
const distance = x2 + x1;
```

---

## 🐛 Troubleshooting

### "Module not found" error

```bash
# Make sure path alias is configured correctly
# Check: tsconfig.json and vite.config.ts

# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Tests not running

```bash
# Make sure vitest is installed
npm install -D vitest

# Check setup file exists
ls frontend/tests/setup.ts

# Run with verbose output
npm test -- --reporter=verbose
```

### Linter errors

```bash
# Auto-fix what can be fixed
npm run lint:fix

# Format code
npm run format

# If still failing, check .eslintrc.json
```

### TypeScript errors

```bash
# Check full error output
npm run type-check

# Common fix: Restart TS server
# In VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

## 📖 Additional Resources

### Documentation
- `../TASK_PARALLEL.md` - Full task breakdown
- `../COORDINATION.md` - Team workflow
- `../TASK_MVP.md` - Project scope
- `shared/types/contracts.ts` - All interfaces

### External Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Docs](https://react.dev/)
- [Vitest Docs](https://vitest.dev/)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)

### Original Java Code
- `../../openjones/src/` - Reference implementation

---

## ✅ Checklist: Am I Ready to Start?

- [ ] Node.js v18+ installed
- [ ] Repository cloned
- [ ] `npm install` completed successfully
- [ ] `npm run dev` starts server
- [ ] `npm test` runs (even if no tests)
- [ ] Read `shared/types/contracts.ts`
- [ ] Read `shared/mocks/index.ts`
- [ ] Chosen my track (A, B, C, D, or E)
- [ ] Created my feature branch
- [ ] Joined team communication channel
- [ ] Know when daily standup is
- [ ] Understand integration schedule

---

## 🚀 Next Steps

1. **Join the daily standup** (9:00 AM)
2. **Pick your first task** from `TASK_PARALLEL.md`
3. **Start coding!**
4. **Commit often** (every few hours)
5. **Ask questions** when stuck
6. **Have fun!** 🎉

---

## 🆘 Need Help?

- **Setup issues:** Check #setup channel or create GitHub issue
- **Code questions:** Ask in #general or tag someone
- **Urgent blocker:** Post in #blockers and @mention team

---

**Welcome to the team! Let's build something amazing together! 🚀**

---

Last Updated: 2025-11-06 by Claude
