# Team Coordination Guide

**For:** OpenJones Browser Port
**Team Size:** 3-5 developers/agents working in parallel
**Last Updated:** 2025-11-06

---

## 🎯 Quick Reference

### Daily Rhythm
- **9:00 AM:** Daily standup (15 min)
- **Work:** Independent coding on your track
- **4:00 PM:** Commit and push to your feature branch
- **Friday PM:** Integration session (merge + test)

### Communication Channels
- **Instant:** Slack/Discord for quick questions
- **Async:** GitHub Issues for bugs/features
- **Code Review:** GitHub PRs (required before merge)
- **Decisions:** Document in `docs/DECISIONS.md`

---

## 📅 Week 1: Setup Week (Everyone Together)

### Day 1 (Monday): Project Initialization

#### Morning (All Together)
**9:00-10:00 - Kickoff Meeting**
- Review `TASK_PARALLEL.md`
- Assign tracks to workers:
  - Worker 1: Core Engine
  - Worker 2: Domain Logic
  - Worker 3: UI Components
  - Worker 4: Rendering & Assets
  - Worker 5: AI (optional, can start Week 4)
- Agree on:
  - Branch naming: `track-a/feature-name`, `track-b/feature-name`, etc.
  - Commit message format: `[Track A] feat: description`
  - PR size: Aim for <500 lines
  - Review process: 1 approval required

**10:00-12:00 - Project Setup**
All workers together:
```bash
# Clone repo
git clone https://github.com/yourusername/openjones-web
cd openjones-web

# Initialize project
npm init -y
npm install -D typescript vite @vitejs/plugin-react
npx tsc --init

# Create folder structure
mkdir -p frontend/src/{engine,components,rendering,store,hooks,utils}
mkdir -p frontend/src/engine/{game,actions,agents,buildings,economy,map,measures,possessions,jobs,types}
mkdir -p shared/{types,mocks}
mkdir -p docs

# Set up Git
git checkout -b develop
git push origin develop
```

#### Afternoon (All Together)
**1:00-4:00 - Define Contracts**

**Lead:** Worker 1 (others review and contribute)

Create `shared/types/contracts.ts`:

```typescript
// ============================================
// CORE CONTRACTS - DO NOT CHANGE WITHOUT TEAM APPROVAL
// ============================================

/**
 * Main game state interface
 * Owner: Worker 1 (Track A)
 */
export interface IGame {
  id: string;
  currentWeek: number;
  timeUnitsRemaining: number; // 600 units per week
  players: IPlayer[];
  map: IMap;
  economyModel: IEconomyModel;
  victoryConditions: IVictoryConditions;

  // Methods
  initialize(config: IGameConfig): void;
  processTurn(playerId: string, action: IAction): IActionResponse;
  advanceTime(units: number): void;
  checkVictory(): IVictoryResult[];
  serialize(): string;
  deserialize(data: string): void;
}

/**
 * Player state interface
 * Owner: Worker 1 (Track A)
 */
export interface IPlayerState {
  playerId: string;
  cash: number;
  health: number; // 0-100
  happiness: number; // 0-100
  education: number; // 0-100
  career: number; // sum of experience across ranks
  position: IPosition;
  currentBuilding: string | null; // building ID or null
  job: IJob | null;
  possessions: IPossession[];
  rentedHome: string | null; // building ID or null
  rentDebt: number;

  // Methods
  clone(): IPlayerState;
  updateMeasure(measure: MeasureType, delta: number): void;
  canAfford(cost: number): boolean;
  meetsJobRequirements(job: IJob): boolean;
}

/**
 * Action interface
 * Owner: Worker 1 (Track A)
 */
export interface IAction {
  id: string;
  type: ActionType;
  displayName: string;
  description: string;
  timeCost: number; // in time units (5 units = 1 hour)

  canExecute(player: IPlayerState, game: IGame): boolean;
  execute(player: IPlayerState, game: IGame): IActionResponse;
  getRequirements(): IActionRequirement[];
}

/**
 * Action response
 * Owner: Worker 1 (Track A)
 */
export interface IActionResponse {
  success: boolean;
  message: string;
  timeSpent: number;
  stateChanges: IStateChange[];
  nextActions?: IAction[]; // for sub-menus
}

/**
 * Building interface
 * Owner: Worker 2 (Track B)
 */
export interface IBuilding {
  id: string;
  type: BuildingType;
  name: string;
  description: string;
  position: IPosition;

  getAvailableActions(player: IPlayerState, game: IGame): IAction[];
  getJobOfferings(): IJob[];
  getActionTree(): IActionTreeNode;
  canEnter(player: IPlayerState): boolean;
}

/**
 * Map interface
 * Owner: Worker 2 (Track B)
 */
export interface IMap {
  width: number; // 5
  height: number; // 5

  getBuilding(position: IPosition): IBuilding | null;
  getAllBuildings(): IBuilding[];
  isValidPosition(position: IPosition): boolean;
  getRoute(from: IPosition, to: IPosition): IRoute;
  getAdjacentPositions(position: IPosition): IPosition[];
}

/**
 * Economy model interface
 * Owner: Worker 2 (Track B)
 */
export interface IEconomyModel {
  getPrice(item: string, building: IBuilding): number;
  getWage(job: IJob, hoursWorked: number): number;
  getRent(home: IBuilding): number;
  getStockPrice(week: number): number;
}

/**
 * Position interface
 * Owner: Worker 2 (Track B)
 */
export interface IPosition {
  x: number; // 0-4
  y: number; // 0-4
  equals(other: IPosition): boolean;
}

/**
 * Job interface
 * Owner: Worker 2 (Track B)
 */
export interface IJob {
  id: string;
  title: string;
  rank: number; // 1-9
  requiredEducation: number;
  requiredExperience: number;
  requiredClothesLevel: number;
  wagePerHour: number;
  experienceGainPerHour: number;
}

/**
 * Possession interface
 * Owner: Worker 2 (Track B)
 */
export interface IPossession {
  id: string;
  type: PossessionType;
  name: string;
  value: number;
  effects: IPossessionEffect[];
}

// Enums
export enum ActionType {
  MOVE = 'MOVE',
  ENTER_BUILDING = 'ENTER_BUILDING',
  EXIT_BUILDING = 'EXIT_BUILDING',
  WORK = 'WORK',
  STUDY = 'STUDY',
  RELAX = 'RELAX',
  PURCHASE = 'PURCHASE',
  SELL = 'SELL',
  APPLY_JOB = 'APPLY_JOB',
  PAY_RENT = 'PAY_RENT',
  RENT_HOME = 'RENT_HOME',
  SUBMENU = 'SUBMENU',
}

export enum BuildingType {
  EMPLOYMENT_AGENCY = 'EMPLOYMENT_AGENCY',
  FACTORY = 'FACTORY',
  BANK = 'BANK',
  COLLEGE = 'COLLEGE',
  DEPARTMENT_STORE = 'DEPARTMENT_STORE',
  CLOTHES_STORE = 'CLOTHES_STORE',
  APPLIANCE_STORE = 'APPLIANCE_STORE',
  PAWN_SHOP = 'PAWN_SHOP',
  RESTAURANT = 'RESTAURANT',
  SUPERMARKET = 'SUPERMARKET',
  RENT_AGENCY = 'RENT_AGENCY',
  LOW_COST_APARTMENT = 'LOW_COST_APARTMENT',
  SECURITY_APARTMENT = 'SECURITY_APARTMENT',
}

export enum MeasureType {
  HEALTH = 'HEALTH',
  HAPPINESS = 'HAPPINESS',
  EDUCATION = 'EDUCATION',
  CAREER = 'CAREER',
  WEALTH = 'WEALTH',
}

export enum PossessionType {
  FOOD = 'FOOD',
  CLOTHES = 'CLOTHES',
  APPLIANCE = 'APPLIANCE',
  STOCK = 'STOCK',
}

// ... (add more interfaces as needed)
```

Create `shared/mocks/index.ts`:

```typescript
import { IGame, IPlayerState, IMap, IBuilding } from '../types/contracts';

/**
 * Mock game for UI development
 * Worker 3 can use this until Worker 1 delivers real implementation
 */
export class MockGame implements IGame {
  id = 'mock-game-1';
  currentWeek = 1;
  timeUnitsRemaining = 600;
  players = [MockPlayerState.create()];
  map = new MockMap();
  economyModel = new MockEconomyModel();
  victoryConditions = MockVictoryConditions.create();

  initialize(config: any): void {
    console.log('MockGame.initialize', config);
  }

  processTurn(playerId: string, action: any): any {
    console.log('MockGame.processTurn', playerId, action);
    return { success: true, message: 'Mock action executed' };
  }

  advanceTime(units: number): void {
    this.timeUnitsRemaining -= units;
    if (this.timeUnitsRemaining <= 0) {
      this.currentWeek++;
      this.timeUnitsRemaining = 600;
    }
  }

  checkVictory(): any[] {
    return [];
  }

  serialize(): string {
    return JSON.stringify(this);
  }

  deserialize(data: string): void {
    Object.assign(this, JSON.parse(data));
  }
}

/**
 * Mock player state for UI development
 */
export class MockPlayerState implements IPlayerState {
  playerId = 'player-1';
  cash = 1000;
  health = 80;
  happiness = 70;
  education = 50;
  career = 100;
  position = { x: 0, y: 0, equals: (other: any) => true };
  currentBuilding = null;
  job = null;
  possessions = [];
  rentedHome = null;
  rentDebt = 0;

  static create(): MockPlayerState {
    return new MockPlayerState();
  }

  clone(): IPlayerState {
    return Object.assign(new MockPlayerState(), this);
  }

  updateMeasure(measure: any, delta: number): void {
    console.log('MockPlayerState.updateMeasure', measure, delta);
  }

  canAfford(cost: number): boolean {
    return this.cash >= cost;
  }

  meetsJobRequirements(job: any): boolean {
    return true;
  }
}

// ... (add more mocks as needed)
```

**4:00-5:00 - Review & Planning**
- Review contracts together
- Make adjustments
- Vote to approve contracts
- **Lock contracts** (changes require team discussion)
- Assign Week 2 tasks
- Create feature branches

---

### Day 2-5 (Tue-Fri): Setup & Documentation

#### Each Worker
- [ ] Read assigned sections of Java code
- [ ] Create detailed task breakdown for your track
- [ ] Set up your feature branch
- [ ] Write design docs if needed
- [ ] Start coding basic scaffolding

#### Documentation Tasks
- [ ] Worker 1: Write `docs/ENGINE_ARCHITECTURE.md`
- [ ] Worker 2: Write `docs/DOMAIN_MODEL.md`
- [ ] Worker 3: Write `docs/UI_COMPONENTS.md`
- [ ] Worker 4: Write `docs/RENDERING.md`

#### Friday Afternoon (Week 1)
**Integration Session #0**
- [ ] Each worker demos their progress (5 min each)
- [ ] Discuss any contract changes needed
- [ ] Merge any ready PRs
- [ ] Plan Week 2 in detail
- [ ] Celebrate Week 1 completion! 🎉

---

## 📅 Weeks 2-8: Parallel Development

### Daily Routine (Mon-Thu)

#### 9:00 AM - Standup (15 min)
**Format:**
- Go around in order (Worker 1 → 5)
- Each person answers:
  1. What I completed yesterday
  2. What I'm working on today
  3. Any blockers?
  4. Any help needed?

**Example:**
> **Worker 1:** "Yesterday I finished PlayerState with cloning. Today I'm starting the Action system. No blockers. Could use a review on my PlayerState PR."
>
> **Worker 2:** "Yesterday I completed the EconomyModel. Today I'm starting the Map class. Blocked on: need IPosition interface clarified - should it be a class or just an interface? Need 5 min discussion after standup."
>
> **Worker 3:** "Yesterday I finished the base UI components. Today I'm creating PlayerStatsHUD. No blockers."

**After standup:**
- Quickly resolve blockers (5-10 min max)
- Longer discussions → schedule separate meeting

#### 9:30 AM - 4:00 PM - Deep Work
- Focus on your track
- Push commits frequently (every hour)
- Ask questions in Slack/Discord
- Review others' PRs when tagged
- Take breaks!

#### 4:00 PM - End of Day
- [ ] Push all work to feature branch
- [ ] Update task board (move tickets to correct column)
- [ ] Write brief summary in Discord: "Today I completed X, tomorrow working on Y"

### Friday - Integration Day

#### 9:00 AM - Standup
Normal standup, but focus on:
- What's ready to merge today?
- Any integration concerns?

#### 9:30 AM - 12:00 PM - Pre-Integration Work
- Finish your current tasks
- Write tests for new code
- Self-review your PRs
- Clean up console.logs, comments

#### 1:00 PM - 2:00 PM - Integration
**Process:**
1. Worker 1 merges first (others likely depend on them)
2. Worker 2 merges second
3. Workers 3, 4, 5 merge (order doesn't matter)

**For each merge:**
- [ ] Pull latest `develop`
- [ ] Merge `develop` into your feature branch
- [ ] Fix conflicts
- [ ] Run tests locally
- [ ] Push
- [ ] Create PR
- [ ] Wait for CI to pass
- [ ] Get 1 approval
- [ ] Merge

#### 2:00 PM - 4:00 PM - Integration Testing
**All workers together:**
- [ ] Pull latest `develop`
- [ ] Run app locally
- [ ] Manual testing (30 min)
  - Try to play the game
  - Click all UI elements
  - Check console for errors
- [ ] Document bugs in GitHub Issues
- [ ] Fix critical bugs together (P0: blocking, P1: important, P2: minor)

#### 4:00 PM - 5:00 PM - Retro & Planning
**Retrospective (15 min):**
- What went well this week?
- What could be improved?
- Any process changes needed?

**Week Planning (45 min):**
- Review next week's tasks
- Adjust estimates if needed
- Assign tasks
- Identify dependencies
- Celebrate progress! 🎉

---

## 🔄 Code Review Process

### PR Requirements
- [ ] Title: `[Track X] type: description`
  - Example: `[Track A] feat: implement PlayerState cloning`
  - Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
- [ ] Description: What, why, how
- [ ] Tests included (or explain why not)
- [ ] Self-review completed
- [ ] CI passing (build + tests)
- [ ] Size: <500 lines (split if larger)

### Review Checklist
**For Reviewer:**
- [ ] Code follows TypeScript best practices
- [ ] Implements the contract correctly
- [ ] Has tests
- [ ] No console.logs or debug code
- [ ] Comments explain "why" not "what"
- [ ] No performance red flags
- [ ] Approve or request changes

**For Author:**
- [ ] Address all comments
- [ ] Push changes
- [ ] Re-request review
- [ ] Merge once approved

### Review SLA
- **Small PRs (<100 lines):** Review within 4 hours
- **Medium PRs (100-300 lines):** Review within 1 day
- **Large PRs (300-500 lines):** Review within 2 days

---

## 🚨 Handling Blockers

### Types of Blockers

#### 1. Waiting on Dependency
**Example:** Worker 4 needs `IMap` from Worker 2
**Solution:**
- Check with Worker 2 on ETA
- If >1 day away, use MockMap
- Continue with other tasks
- Switch back when ready

#### 2. Contract Unclear
**Example:** Not sure what `canExecute()` should return in edge cases
**Solution:**
- Post question in Discord: `@team Contract question: ...`
- Quick discussion (5-10 min)
- Document decision in `docs/DECISIONS.md`
- Update contract if needed

#### 3. Technical Problem
**Example:** Can't figure out how to implement deep cloning
**Solution:**
- Try for 30 min
- Google/StackOverflow for 15 min
- Ask in Discord: `@team Need help with...`
- Screen share if needed
- Document solution for others

#### 4. Scope Creep
**Example:** Realized we need a feature not in plan
**Solution:**
- **Don't implement it yet**
- Create GitHub Issue: "Enhancement: ..."
- Discuss in next planning session
- Add to backlog or future phase
- Stay focused on current tasks

---

## 🛠️ Tools & Workflows

### Branch Strategy
```
main (production, locked)
  ├─ develop (integration branch)
      ├─ track-a/game-state (Worker 1)
      ├─ track-a/actions (Worker 1)
      ├─ track-b/economy (Worker 2)
      ├─ track-b/map (Worker 2)
      ├─ track-c/ui-components (Worker 3)
      └─ track-d/rendering (Worker 4)
```

### Git Commands
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b track-a/my-feature

# Regular commits
git add .
git commit -m "[Track A] feat: implement feature"
git push origin track-a/my-feature

# Update with latest develop
git checkout develop
git pull origin develop
git checkout track-a/my-feature
git merge develop
# Fix conflicts if any
git push origin track-a/my-feature

# Create PR
# Go to GitHub, click "New Pull Request"
# Base: develop, Compare: track-a/my-feature
```

### Testing Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test
npm test -- PlayerState.test.ts

# Check coverage
npm test -- --coverage
```

### Useful Scripts
```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint src --ext ts,tsx",
    "format": "prettier --write src",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 📊 Progress Tracking

### GitHub Projects Board
**Columns:**
- 📋 Backlog (not started)
- 🏗️ In Progress (being worked on)
- 👀 Review (waiting for PR review)
- ✅ Done (merged to develop)

**Labels:**
- `track-a`, `track-b`, `track-c`, `track-d`, `track-e`
- `priority-high`, `priority-medium`, `priority-low`
- `blocked` (add blocker details in comment)
- `bug`, `feature`, `refactor`, `docs`

### Weekly Metrics
Track in shared spreadsheet:
- % tasks completed per track
- PRs merged per track
- Test coverage per track
- Bugs found vs fixed
- Average PR review time

---

## 🎯 Integration Milestones

### Milestone 1 (Week 3)
**Goal:** Everything compiles together
- [ ] All tracks merge to develop
- [ ] No TypeScript errors
- [ ] No runtime errors on startup
- [ ] Can render game (even if data is mocked)

### Milestone 2 (Week 5)
**Goal:** Replace mocks with real implementations
- [ ] UI uses real Game and PlayerState
- [ ] Rendering uses real Map data
- [ ] Can execute at least 3 actions
- [ ] Game loop works (turn → action → update)

### Milestone 3 (Week 8)
**Goal:** Fully playable game
- [ ] All actions implemented
- [ ] All buildings functional
- [ ] Can play complete game (week 1 → victory)
- [ ] Save/load works
- [ ] No critical bugs

---

## 📞 Communication Guidelines

### Discord/Slack
- **#general:** Team chat, casual questions
- **#standups:** Daily standup summaries
- **#blockers:** Post blockers here for visibility
- **#prs:** PR notifications
- **#ci:** CI/CD notifications

### Response Time Expectations
- **Urgent (blocker):** <1 hour during work hours
- **Important:** <4 hours
- **Normal:** <1 day
- **Low priority:** <2 days

### Meeting Schedule
- **Daily Standup:** 9:00 AM (15 min) - Required
- **Friday Integration:** 1:00 PM (3 hours) - Required
- **Ad-hoc:** As needed, schedule in advance

---

## ✅ Definition of Done

### For a Feature
- [ ] Code written and committed
- [ ] Unit tests pass (>80% coverage for the feature)
- [ ] Integration tests pass (if applicable)
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Merged to develop
- [ ] Tested in integration environment

### For a Week
- [ ] All planned tasks completed (or explicitly moved to next week)
- [ ] All PRs merged or have clear plan
- [ ] All tests passing
- [ ] No P0 bugs
- [ ] Integration milestone achieved (if scheduled)

### For a Phase
- [ ] All features in phase completed
- [ ] All tracks integrated
- [ ] End-to-end tests passing
- [ ] Manual testing completed
- [ ] Performance targets met
- [ ] Documentation complete
- [ ] Ready for next phase

---

## 🚀 Quick Start Checklist

### For New Team Member
- [ ] Read `TASK_PARALLEL.md`
- [ ] Read this file (`COORDINATION.md`)
- [ ] Set up dev environment (see `docs/SETUP.md`)
- [ ] Review contracts (`shared/types/contracts.ts`)
- [ ] Review your track assignment
- [ ] Clone repo and get it running locally
- [ ] Attend first standup
- [ ] Introduce yourself in Discord
- [ ] Pick up first task!

---

## 📚 Additional Resources

- **Task Plans:** `TASK.md`, `TASK_MVP.md`, `TASK_PARALLEL.md`
- **Contracts:** `shared/types/contracts.ts`
- **Mocks:** `shared/mocks/`
- **Docs:** `docs/` directory
- **Project Board:** GitHub Projects
- **Communication:** Discord/Slack

---

**Let's build this together! 🚀**
