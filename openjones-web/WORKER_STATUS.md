# Worker Status & Task Assignment

**Last Updated:** 2025-11-06
**Update this file when you claim a track or task!**

---

## 🎯 How to Join as a Worker

### Step 1: Pick Your Worker Number
Choose any available number (1-10):

| Worker # | Status | Track | Started | Last Active |
|----------|--------|-------|---------|-------------|
| 1 | 🟢 Available | - | - | - |
| 2 | 🟢 Available | - | - | - |
| 3 | 🟢 Available | - | - | - |
| 4 | 🟢 Available | - | - | - |
| 5 | 🟢 Available | - | - | - |
| 6 | 🟢 Available | - | - | - |
| 7 | 🟢 Available | - | - | - |
| 8 | 🟢 Available | - | - | - |
| 9 | 🟢 Available | - | - | - |
| 10 | 🟢 Available | - | - | - |

**Legend:**
- 🟢 Available - Open slot
- 🔴 Occupied - Worker active
- 🟡 Paused - Worker taking a break
- ✅ Complete - Worker finished

### Step 2: Choose Your Track

Look at the Track Availability below and pick one that needs work!

---

## 📊 Track Status & Availability

### Track A: Core Engine
**Focus:** Game logic, player state, action system
**Directories:** `frontend/src/engine/game/`, `frontend/src/engine/actions/`
**Status:** 🟢 Available (0/1 workers)
**Priority:** High (other tracks need this)

**Current workers:**
- None yet

**Available tasks:** See Week 2-8 tasks in TASKS_POOL.md

---

### Track B: Domain Logic
**Focus:** Buildings, economy, map, jobs, possessions
**Directories:** `frontend/src/engine/{buildings,economy,map,measures,possessions,jobs}/`
**Status:** 🟢 Available (0/2 workers)
**Priority:** High (many independent tasks)

**Current workers:**
- None yet

**Available tasks:** See Week 2-8 tasks in TASKS_POOL.md

---

### Track C: UI Components
**Focus:** React components, user interface
**Directories:** `frontend/src/components/`
**Status:** 🟢 Available (0/1 workers)
**Priority:** Medium (can use mocks)

**Current workers:**
- None yet

**Available tasks:** See Week 2-8 tasks in TASKS_POOL.md

---

### Track D: Rendering
**Focus:** Canvas rendering, sprites, animations
**Directories:** `frontend/src/rendering/`
**Status:** 🟢 Available (0/1 workers)
**Priority:** Medium (can use mocks)

**Current workers:**
- None yet

**Available tasks:** See Week 2-8 tasks in TASKS_POOL.md

---

### Track E: AI System
**Focus:** AI agents, planning algorithms, A* pathfinding
**Directories:** `frontend/src/engine/agents/`
**Status:** 🟡 Delayed (0/1 workers)
**Priority:** Low (starts Week 4, needs Track A first)

**Current workers:**
- None yet

**Available tasks:** See Week 4+ tasks in TASKS_POOL.md

---

## 🎯 Task Assignment System

### How to Claim a Task

1. **Check TASKS_POOL.md** - See all available tasks
2. **Pick a task** - Choose one marked as "Available"
3. **Update TASKS_POOL.md** - Change status to "In Progress" and add your name
4. **Update this file** - Add yourself to the worker table
5. **Create your branch** - `git checkout -b worker-[N]/[task-name]`
6. **Start coding!**

### When You Complete a Task

1. **Update TASKS_POOL.md** - Mark task as "Complete"
2. **Create PR** - Submit for review
3. **Pick next task** - Grab another from the pool!

---

## 📋 Quick Join Instructions

### For AI Workers (Copy/Paste This)

```markdown
You are joining the OpenJones browser port project as a worker.

**Step 1 - Choose your identity:**
1. Pick an available worker number (1-10) from WORKER_STATUS.md
2. Claim it by updating the table (change status to 🔴 Occupied)
3. You are now "Worker [N]"

**Step 2 - Choose your track:**
1. Read track descriptions in WORKER_STATUS.md
2. Pick a track that needs workers (look for 🟢 Available)
3. Update WORKER_STATUS.md with your choice

**Step 3 - Pick your first task:**
1. Open TASKS_POOL.md
2. Find tasks for your track marked "Available"
3. Pick one that interests you (start with "Priority: High" tasks)
4. Update TASKS_POOL.md - change status to "In Progress [Worker N]"

**Step 4 - Set up:**
1. Location: /home/user/openjones/openjones-web
2. Create branch: git checkout -b worker-[N]/[task-name]
3. Read shared/types/contracts.ts (understand interfaces)
4. Read shared/mocks/index.ts (use mocks for dependencies)

**Step 5 - Start coding:**
1. Implement your task following the contracts
2. Write tests as you go
3. Use mocks for dependencies from other tracks
4. Commit often: "[Worker N] feat: description"

**Available now at:**
/home/user/openjones/openjones-web

**What to read first:**
1. This file (WORKER_STATUS.md) - Pick your number and track
2. TASKS_POOL.md - Pick your first task
3. docs/WORKER_SETUP.md - Setup guide
4. shared/types/contracts.ts - Interfaces to implement

**Commands:**
- npm run dev (start development server)
- npm test (run tests)
- npm run type-check (verify TypeScript)
- npm run lint (check code quality)

**Ready to claim your spot?**
```

---

## 🔄 How to Update This File

### When You Join

1. Edit this file
2. Update the Worker table - add your info
3. Update your chosen Track section - add yourself to "Current workers"
4. Commit: `git commit -m "[Worker N] Join as Worker N on Track X"`
5. Push: `git push`

### Example

**Before:**
```markdown
| 1 | 🟢 Available | - | - | - |
```

**After:**
```markdown
| 1 | 🔴 Occupied | Track A | 2025-11-06 | 2025-11-06 15:30 |
```

**Track section before:**
```markdown
**Current workers:**
- None yet
```

**Track section after:**
```markdown
**Current workers:**
- Worker 1 (Track A) - Started 2025-11-06
```

---

## 📞 Coordination

### Daily Check-in
Update your "Last Active" timestamp in the worker table daily.

### Weekly Sync
Every Friday, update:
- Your status (still active? paused? complete?)
- Tasks completed this week
- Any blockers

### Need Help?
- Post in #general with your worker number
- Tag other workers on your track
- Check COORDINATION.md for workflow

---

## 🎯 Current Project Priorities

**Week 2 Priorities** (Pick these first):
1. **Track A:** Game.ts, PlayerState.ts - CRITICAL (blocks others)
2. **Track B:** EconomyModel.ts, Map.ts - HIGH (needed by many)
3. **Track B:** Building implementations - HIGH (many parallel tasks)
4. **Track C:** Design system setup - MEDIUM
5. **Track D:** Asset preparation - MEDIUM

**Track Capacity:**
- Track A: Needs 1 worker (core engine)
- Track B: Can support 2+ workers (many independent tasks)
- Track C: Needs 1 worker (UI)
- Track D: Needs 1 worker (rendering)

**Recommendation:** If multiple workers join, prioritize Track B (can work in parallel on different buildings).

---

## 📊 Progress Tracking

### Week 2 (Current)
**Target:** Setup complete, first implementations started
**Status:** Just started

### Week 3 Milestone
**Target:** First integration - everything compiles together
**Tasks:** Core classes implemented, basic tests passing

### Week 5 Milestone
**Target:** Replace mocks with real implementations
**Tasks:** Track A & B complete enough to swap mocks

### Week 8 Milestone
**Target:** Fully playable game
**Tasks:** All tracks integrated, end-to-end tests passing

---

## ✅ Self-Assignment Checklist

When you join, make sure you:
- [ ] Picked a worker number (1-10)
- [ ] Updated the worker table in this file
- [ ] Picked a track (A, B, C, D, or E)
- [ ] Updated the track section with your name
- [ ] Picked your first task from TASKS_POOL.md
- [ ] Updated TASKS_POOL.md with task status
- [ ] Created your feature branch
- [ ] Read contracts.ts and mocks/index.ts
- [ ] Started coding!

---

**Last updated:** 2025-11-06
**Next update:** When first worker joins!
