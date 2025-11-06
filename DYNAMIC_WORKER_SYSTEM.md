# 🎯 Dynamic Worker System - Ready to Use!

**Updated:** 2025-11-06
**Status:** ✅ Active - Workers can self-assign now!

---

## 🚀 Quick Start for New Workers

### Copy/Paste This Prompt for AI Workers

```markdown
You are joining the OpenJones browser port project.

⚠️ **CRITICAL - Project Already Exists!**
- Branch: `claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ`
- Location: `/home/user/openjones/openjones-web`
- Phase 0 is COMPLETE - DO NOT create from scratch!

**Your onboarding (6 steps):**

1. **Verify branch & location (FIRST!):**
   ```bash
   pwd  # Should be: /home/user/openjones
   git branch  # Check current branch
   git checkout claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ  # Switch if needed
   ls openjones-web/  # Verify project exists
   ```

2. **Choose worker number:** Open WORKER_STATUS.md, pick any number 1-10, mark it 🔴 Occupied
3. **Choose track:** Read tracks in WORKER_STATUS.md, pick one (A/B/C/D/E), update file
4. **Pick task:** Open TASKS_POOL.md, find a task in your track, mark "In Progress [Worker N]"
5. **Create branch:**
   ```bash
   git checkout claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ
   git checkout -b worker-[N]/[task-name]
   ```
6. **Start coding:** Read contracts.ts, implement your task, use mocks for dependencies

**Essential files:**
- WORKER_STATUS.md ← Pick number & track
- TASKS_POOL.md ← Pick task (41 available)
- shared/types/contracts.ts ← Interfaces to implement
- shared/mocks/index.ts ← Mock dependencies
- docs/INITIALIZE_WORKER.md ← Full guide

**Commands:**
- npm run dev (start dev server)
- npm test (run tests)
- npm run type-check (verify TypeScript)

**Update these files:**
- WORKER_STATUS.md when you join/change status
- TASKS_POOL.md when you claim/complete tasks

Start by reading WORKER_STATUS.md!
```

---

## 📋 What's Different Now

### Before (Static Assignment)
- Team lead assigns workers to tracks
- Tasks defined in TASK_PARALLEL.md
- Workers wait for assignments
- Coordination overhead

### After (Dynamic Self-Assignment)
- **Workers pick their own number** (1-10)
- **Workers choose their own track** (A, B, C, D, E)
- **Workers claim tasks from pool** (41 detailed tasks)
- **Zero coordination needed** - fully self-service!

---

## 🗂️ New Files

### 1. WORKER_STATUS.md
**Purpose:** Worker registration and track assignment

**Contains:**
- Worker number table (1-10, pick any available)
- Track descriptions with capacity (how many workers needed)
- Current worker assignments
- Quick join instructions

**Workers update this when:**
- They join (pick number, pick track)
- They finish work (mark complete)
- Daily (update "last active" timestamp)

---

### 2. TASKS_POOL.md
**Purpose:** Self-service task board

**Contains:**
- **41 detailed tasks** across all tracks
- Task priorities (🔴 P0 = critical, 🟠 P1 = high, 🟡 P2 = medium, 🟢 P3 = low)
- Time estimates (2-10 hours per task)
- Dependencies (what must be done first)
- Status tracking (Available → In Progress → Complete)

**Task breakdown:**
- Track A (Core Engine): 8 tasks
- Track B (Domain Logic): 11 tasks
- Track C (UI Components): 7 tasks
- Track D (Rendering): 5 tasks
- Track E (AI System): 6 tasks (Week 4+)

**Workers update this when:**
- They claim a task (mark "In Progress [Worker N]")
- They complete a task (mark "Complete [Worker N]")

---

### 3. docs/INITIALIZE_WORKER.md
**Purpose:** Complete worker initialization guide

**Contains:**
- Copy/paste prompt for AI workers
- Step-by-step onboarding process
- Examples of claiming tasks
- Checklist for getting started

---

## 🎯 Example: Worker Self-Assigns to Task

**Worker wants to join and work on Game State:**

1. **Open WORKER_STATUS.md**, pick Worker 3:
   ```diff
   - | 3 | 🟢 Available | - | - | - |
   + | 3 | 🔴 Occupied | Track A | 2025-11-06 | 2025-11-06 15:45 |
   ```

2. **Update Track A section:**
   ```diff
   **Current workers:**
   - None yet
   + Worker 3 (Track A) - Started 2025-11-06
   ```

3. **Open TASKS_POOL.md**, claim Task A2:
   ```diff
   #### Task A2: Game State Management
   **Priority:** 🔴 P0
   - **Status:** Available
   + **Status:** In Progress [Worker 3]
   ```

4. **Create branch:**
   ```bash
   git checkout claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ
   git checkout -b worker-3/game-state
   ```

5. **Start coding:**
   - Read `shared/types/contracts.ts` → find `IGame` interface
   - Read `shared/mocks/index.ts` → see `MockGame` example
   - Implement `frontend/src/engine/game/Game.ts`
   - Write tests
   - Use mocks for dependencies

6. **When done:**
   - Update TASKS_POOL.md: `Status: Complete [Worker 3]`
   - Create PR
   - Pick next task!

---

## 📊 Available Tasks Right Now

### High Priority (Start Here)

**Critical Path (🔴 P0):**
- Task A1: Position & Route Classes (2-3 hours) - BLOCKS Map
- Task A2: Game State Management (6-8 hours) - BLOCKS everything
- Task A3: Player State (4-6 hours) - BLOCKS actions
- Task B1: Economy Model (3-4 hours) - BLOCKS pricing
- Task B2: Map System (4-5 hours) - BLOCKS rendering

**High Value (🟠 P1):**
- Task B3: Job System (3-4 hours) - Independent
- Task B4: Measures System (4-5 hours) - Independent
- Task B6: Building Base Class (3-4 hours) - BLOCKS buildings
- Task C1: Design System Setup (4-5 hours) - Independent
- Task D1: Asset Preparation (3-4 hours) - Independent

### Recommended Order
1. A1, B1, A3 (can do in parallel)
2. A2, B2 (needs A1 and A3)
3. Everything else unlocks!

---

## 🎮 Track Recommendations

### If You're the First Worker
**Pick Track A** (Core Engine)
- Most critical
- Unlocks other workers
- Tasks A1, A3, A2 in that order

### If Track A is Taken
**Pick Track B** (Domain Logic)
- Supports 2+ workers
- Many independent tasks
- Start with B1, B3, or B4

### If You Want UI Work
**Pick Track C** (UI Components)
- Can use mocks immediately
- Independent of other tracks
- Start with C1 (Design System)

### If You Want Graphics
**Pick Track D** (Rendering)
- Visual work
- Can use mocks
- Start with D1 (Asset Prep)

---

## 💡 Pro Tips for Workers

### Picking Tasks
- ✅ Start with 🔴 P0 or 🟠 P1 tasks (highest priority)
- ✅ Pick tasks with no dependencies (or use mocks)
- ✅ Check time estimate matches your availability
- ❌ Don't pick Track E tasks until Week 4
- ❌ Don't pick tasks someone else is working on

### Using Mocks
```typescript
// If Task B2 (Map) isn't done yet, use the mock:
import { MockMap } from '@shared/mocks';
const map = new MockMap();

// Later when B2 is done, swap to real:
import { Map } from '@engine/map/Map';
const map = new Map();
```

### Staying Unblocked
- Use mocks for anything you need
- Pick different task if blocked
- Update WORKER_STATUS.md if paused
- Don't wait - there are 41 tasks!

### Communication
- Update WORKER_STATUS.md daily (last active time)
- Update TASKS_POOL.md when claiming/completing
- Commit often (every 1-2 hours)
- Create PRs when task is done

---

## 🔄 Worker Lifecycle

```
Join → Pick Number → Pick Track → Pick Task → Code → Complete → Pick Next Task
  ↓         ↓            ↓           ↓         ↓        ↓
  Update  Update       Update      Create    Write    Update    Create
  STATUS  STATUS       TASKS       Branch    Code     TASKS     PR
```

---

## 📈 Current Status

**Workers:** 0/10 (all available!)
**Tasks:** 41 total, 35 available now, 6 available Week 4+
**Tracks:** All open
**Readiness:** ✅ 100% - Ready for workers!

---

## 🎬 Next Steps

### For You (Team Lead)
1. Share `docs/INITIALIZE_WORKER.md` with potential workers
2. Or use the copy/paste prompt above for AI workers
3. Workers self-assign - no coordination needed!

### For New Workers
1. Open `/home/user/openjones/openjones-web/WORKER_STATUS.md`
2. Pick a number and track
3. Open `TASKS_POOL.md`
4. Pick a task
5. Start coding!

---

## 🆘 Quick Reference

**Files to read:**
- `WORKER_STATUS.md` - Worker & track assignment
- `TASKS_POOL.md` - Task board (41 tasks)
- `docs/INITIALIZE_WORKER.md` - Full onboarding guide
- `shared/types/contracts.ts` - What to implement
- `shared/mocks/index.ts` - How to use mocks

**Location:** `/home/user/openjones/openjones-web/`

**Copy/paste prompts:** See top of this file or `docs/INITIALIZE_WORKER.md`

---

**System is LIVE! Workers can join and self-assign now! 🚀**
