# How to Initialize the Next Worker

**For:** Team leads or workers who want to spawn additional development agents
**Updated:** 2025-11-06

---

## 🎯 Quick Instructions

When you're ready to add another worker to the project, follow these steps:

### Option 1: Human Worker

**Send them:**
1. Link to the repository
2. Tell them to read `docs/WORKER_SETUP.md`
3. Assign them a track (A, B, C, D, or E)
4. Add them to communication channels (Discord/Slack)

**They should:**
```bash
git clone [repository-url]
cd openjones-web
npm install
npm run dev  # Verify it works
```

Then read `docs/WORKER_SETUP.md` and start coding!

---

### Option 2: AI Agent/Claude Worker

**Provide the agent with this context:**

```markdown
You are Worker [N] on the OpenJones browser port project.

**Your track:** [Track A/B/C/D/E]

**Your responsibilities:**
[Copy from TASK_PARALLEL.md for the specific track]

**Project location:** openjones-web/

**First steps:**
1. Navigate to openjones-web/
2. Read shared/types/contracts.ts (understand the interfaces)
3. Read shared/mocks/index.ts (understand how to use mocks)
4. Read TASK_PARALLEL.md - find your track's section
5. Create your feature branch: `git checkout -b track-[x]/[feature-name]`
6. Start implementing!

**Important files:**
- `shared/types/contracts.ts` - All TypeScript interfaces (your contract)
- `shared/mocks/index.ts` - Mock implementations (use until real ones ready)
- `TASK_PARALLEL.md` - Your weekly tasks
- `COORDINATION.md` - How we work together
- `docs/WORKER_SETUP.md` - Complete setup guide

**Rules:**
1. Only work in your track's directories
2. Use mocks for dependencies from other tracks
3. Write tests for everything you build
4. Commit often with messages like "[Track X] feat: description"
5. Create PRs for review before merging

**Available commands:**
- `npm run dev` - Start development server
- `npm test` - Run tests
- `npm run lint` - Check code quality
- `npm run type-check` - Verify TypeScript

**Your first task:**
[Copy the first task from TASK_PARALLEL.md for this track]

Start coding!
```

---

## 📋 Worker Assignment Matrix

Track availability and status:

| Track | Focus | Worker | Status | Week Started |
|-------|-------|--------|--------|--------------|
| A | Core Engine | - | 🟢 Available | - |
| B | Domain Logic | - | 🟢 Available | - |
| C | UI Components | - | 🟢 Available | - |
| D | Rendering | - | 🟢 Available | - |
| E | AI System | - | 🟡 Starts Week 4 | - |

**Legend:**
- 🟢 Available - Can start immediately
- 🟡 Delayed - Depends on other tracks
- 🔴 Occupied - Worker assigned
- ✅ Complete - Track finished

---

## 🎯 Track Assignments

### Track A: Core Engine

**Directories:**
- `frontend/src/engine/game/`
- `frontend/src/engine/actions/`
- `frontend/src/store/` (game store)

**Interfaces to implement:**
- `IGame`
- `IPlayer`
- `IPlayerState`
- `IAction` (and all action types)
- `IActionResponse`
- `IVictoryConditions`

**Dependencies:**
- None initially (uses contracts)
- Week 4+: Needs buildings from Track B

**Timeline:** Weeks 2-8

---

### Track B: Domain Logic

**Directories:**
- `frontend/src/engine/buildings/`
- `frontend/src/engine/economy/`
- `frontend/src/engine/map/`
- `frontend/src/engine/measures/`
- `frontend/src/engine/possessions/`
- `frontend/src/engine/jobs/`

**Interfaces to implement:**
- `IBuilding` (+ all 13 building types)
- `IMap`
- `IPosition`, `IRoute`
- `IEconomyModel`
- `IJob`, `IPossession`
- Measure classes

**Dependencies:**
- None initially (uses contracts)
- Week 4+: May need actions from Track A

**Timeline:** Weeks 2-8

---

### Track C: UI Components

**Directories:**
- `frontend/src/components/`
- `frontend/src/hooks/`

**Components to build:**
- GameBoard
- PlayerStatsHUD
- BuildingModal
- ActionMenu
- MainMenu, GameSetup
- VictoryScreen, GameOverScreen
- All shadcn/ui components

**Dependencies:**
- Track A: Game, PlayerState (use mocks until ready)
- Track B: Buildings, Map (use mocks until ready)
- Track D: MapRenderer (integration in Week 5+)

**Timeline:** Weeks 2-8

---

### Track D: Rendering

**Directories:**
- `frontend/src/rendering/`
- `frontend/public/images/` (assets)

**Classes to build:**
- MapRenderer
- SpriteManager
- AnimationEngine
- EffectsRenderer

**Dependencies:**
- Track B: Map, IPosition (use mocks until Week 4)

**Timeline:** Weeks 2-8

---

### Track E: AI System

**Directories:**
- `frontend/src/engine/agents/`
- `frontend/src/simulation/`

**Classes to build:**
- A* algorithm
- All planner types
- All plan types
- Agent simulation

**Dependencies:**
- Track A: Game, Player, Actions (starts Week 4 after Track A ready)
- Track B: Buildings, Map

**Timeline:** Weeks 4-8 (starts later)

---

## 🔄 Integration Process

### When Worker Joins

1. **Assign track** (check availability matrix)
2. **Create branch** for them: `track-[x]/setup`
3. **Send onboarding**:
   - Repository URL
   - Track assignment
   - Link to WORKER_SETUP.md
   - Communication channels
   - Daily standup time (9:00 AM)

4. **First day:**
   - Worker reads contracts and mocks
   - Worker sets up environment
   - Worker creates first feature branch
   - Worker attends standup

5. **First week:**
   - Worker completes first task
   - Worker creates first PR
   - Worker participates in Friday integration

---

## 📞 Communication Setup

### Add Worker To:
- [ ] Discord/Slack workspace
- [ ] #general channel
- [ ] #[track-name] channel (if exists)
- [ ] #blockers channel
- [ ] #prs channel
- [ ] Daily standup invite (9:00 AM)
- [ ] Friday integration invite (1:00 PM)
- [ ] GitHub repository (with write access)

---

## ✅ Onboarding Checklist

For each new worker:

**Before First Day:**
- [ ] Track assigned
- [ ] Repository access granted
- [ ] Communication channels set up
- [ ] Standup time communicated
- [ ] WORKER_SETUP.md link sent

**First Day:**
- [ ] Worker runs `npm install` successfully
- [ ] Worker runs `npm run dev` and sees app
- [ ] Worker reads contracts.ts
- [ ] Worker reads mocks/index.ts
- [ ] Worker creates feature branch
- [ ] Worker attends standup

**First Week:**
- [ ] Worker completes at least 1 task
- [ ] Worker creates at least 1 PR
- [ ] Worker participates in code review
- [ ] Worker attends Friday integration
- [ ] Worker feels unblocked and productive

---

## 🎓 Example Worker Initialization

### Example: Adding Worker 3 (UI Track)

**Step 1: Assignment**
```
Track: C (UI Components)
Worker: Alice
Start Date: Week 2, Monday
```

**Step 2: Send Message**
```
Hi Alice!

Welcome to the OpenJones browser port team!

You're assigned to Track C - UI Components. You'll be building all the
React components for the game.

Repository: https://github.com/[...]/openjones-web
Your branch: track-c/ui-setup (create this)

Steps to get started:
1. Clone the repo
2. cd openjones-web && npm install
3. npm run dev (should start on http://localhost:3000)
4. Read docs/WORKER_SETUP.md
5. Read shared/types/contracts.ts
6. Join our Discord: [link]

Daily standup: 9:00 AM (15 min)
Integration: Friday 1:00 PM

Your first task (from TASK_PARALLEL.md):
Week 2 - Design System & Setup (see section 2.1)

Let me know if you have any questions!
```

**Step 3: Track Progress**
Update worker assignment matrix:
- Track C: UI Components | Alice | 🔴 Occupied | Week 2

---

## 🤖 Example: AI Agent Initialization

### Initializing Claude Worker

**Prompt for Claude:**
```
You are Worker 2 on the OpenJones browser port project.

Your track: Track B - Domain Logic
Your role: Implement buildings, economy, map, jobs, and possessions

Project location: /home/user/openjones/openjones-web

Current status: Phase 0 complete - setup done, ready for development

Your first tasks (Week 2):
1. Implement EconomyModel.ts
   - Location: frontend/src/engine/economy/EconomyModel.ts
   - Interface: IEconomyModel (see shared/types/contracts.ts)
   - Methods: getPrice, getWage, getRent, getStockPrice, calculateSellPrice

2. Implement measures system
   - Location: frontend/src/engine/measures/
   - Classes: Measure.ts (base), Health.ts, Happiness.ts, Education.ts, Career.ts
   - Each should track 0-100 values with decay/growth

Commands you'll need:
- npm test -- [filename] (run specific tests)
- npm run type-check (verify TypeScript)
- git checkout -b track-b/economy (create your branch)

Important files to read first:
1. shared/types/contracts.ts (lines 60-100) - IEconomyModel interface
2. shared/mocks/index.ts (lines 50-70) - MockEconomyModel example

Start by implementing EconomyModel.ts. Write tests as you go.

Ready to start?
```

---

## 📊 Monitoring Worker Progress

Track each worker's progress weekly:

**Week 2 Check-in:**
- ✅ Worker completed at least 2 tasks
- ✅ Worker merged at least 1 PR
- ✅ Worker attended all standups
- ✅ Worker participated in code review
- ✅ No major blockers

If any ❌, intervene and help!

---

## 🚨 Common Issues

### Worker Can't Get Started
- Check they have Node.js v18+ installed
- Check they ran `npm install`
- Check they're in correct directory
- Send them WORKER_SETUP.md again

### Worker Blocked on Dependency
- Point them to mock implementations
- Remind them mocks are temporary
- Check if dependency track is on schedule
- Consider helping them create stubs

### Worker Going Too Fast
- Remind them about code review requirement
- Encourage tests and documentation
- Suggest pairing with another worker

### Worker Going Too Slow
- Check for blockers
- Pair them with experienced worker
- Reduce scope of tasks
- Consider reassigning track

---

## 🎉 Success Criteria

A worker is "successfully onboarded" when:
- ✅ They can run the dev server
- ✅ They understand the contracts
- ✅ They know how to use mocks
- ✅ They've created their first PR
- ✅ They attend standups
- ✅ They feel confident and productive

---

**Ready to add more workers? Let's build this together! 🚀**
