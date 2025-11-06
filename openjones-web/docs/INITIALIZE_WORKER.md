# Initialize a New Worker - Dynamic System

**Quick Guide for Spawning Workers (Human or AI)**

---

## 🚀 Quick Start - Copy/Paste This

### For AI Workers (Claude, GPT, etc.)

```markdown
You are joining the OpenJones browser port project.

**Project:** Browser-based port of "Jones in the Fast Lane" game
**Tech Stack:** React 19 + TypeScript + Vite
**Location:** /home/user/openjones/openjones-web

---

## 🎯 Your Onboarding Process

**Step 1: Choose Your Identity**

Open WORKER_STATUS.md and:
1. Pick an available worker number (1-10)
2. Update the worker table - change your row to 🔴 Occupied
3. Add your start date
4. You are now "Worker [N]"

**Step 2: Choose Your Track**

Read the track descriptions in WORKER_STATUS.md:
- **Track A:** Core Engine (Game logic, actions) - Priority: HIGH
- **Track B:** Domain Logic (Buildings, economy, map) - Priority: HIGH, can support 2+ workers
- **Track C:** UI Components (React components) - Priority: MEDIUM
- **Track D:** Rendering (Canvas, sprites) - Priority: MEDIUM
- **Track E:** AI System (starts Week 4) - Priority: LOW (wait)

Pick a track that:
- Shows 🟢 Available
- Needs workers (check capacity)
- Interests you
- Matches your skills

Update WORKER_STATUS.md with your track choice.

**Step 3: Pick Your First Task**

Open TASKS_POOL.md and:
1. Look for tasks in your chosen track
2. Start with 🔴 P0 or 🟠 P1 priority tasks
3. Pick one marked "Available"
4. Update the task status to "In Progress [Worker N]"
5. Note the task ID (e.g., "Task A2")

**Step 4: Set Up Your Environment**

```bash
cd /home/user/openjones/openjones-web
git checkout -b worker-[N]/[task-name]
# Example: git checkout -b worker-1/game-state
```

**Step 5: Read the Contracts**

CRITICAL - Read these files to understand the system:
1. `shared/types/contracts.ts` - All TypeScript interfaces
2. `shared/mocks/index.ts` - Mock implementations for dependencies
3. Your task description in TASKS_POOL.md

**Step 6: Start Coding**

- Implement the interface from contracts.ts
- Use mocks for dependencies from other tracks
- Write tests as you go (Vitest)
- Commit often: `git commit -m "[Worker N] feat: description"`

**Commands you'll need:**
```bash
npm run dev          # Start development server
npm test             # Run tests
npm test -- [file]   # Run specific test
npm run type-check   # Verify TypeScript
npm run lint         # Check code quality
```

**When you're stuck:**
- Check shared/mocks/index.ts for examples
- Look at the Java reference: ../../openjones/openjones/src/
- Use MockGame, MockPlayerState, etc. for dependencies
- Ask questions (update WORKER_STATUS.md with blockers)

**When you finish a task:**
1. Update TASKS_POOL.md - mark "Complete [Worker N]"
2. Create PR with description
3. Pick your next task from TASKS_POOL.md
4. Repeat!

---

## 📚 Essential Reading (Priority Order)

1. **WORKER_STATUS.md** ← Start here (pick number & track)
2. **TASKS_POOL.md** ← Pick your first task
3. **shared/types/contracts.ts** ← Understand interfaces
4. **shared/mocks/index.ts** ← See examples & use mocks
5. **docs/WORKER_SETUP.md** ← Detailed setup guide (if needed)

---

## 🎯 Quick Examples

**Good first tasks for each track:**

**Track A (Core Engine):**
- Task A1: Position & Route Classes (easy, 2-3 hours)
- Task A3: Player State (critical, 4-6 hours)

**Track B (Domain Logic):**
- Task B1: Economy Model (critical, 3-4 hours)
- Task B3: Job System (independent, 3-4 hours)

**Track C (UI):**
- Task C1: Design System Setup (foundation, 4-5 hours)
- Task C2: Player Stats HUD (core UI, 4-5 hours)

**Track D (Rendering):**
- Task D1: Asset Preparation (easy, 3-4 hours)
- Task D2: Sprite Manager (core, 4-5 hours)

---

## ✅ Self-Assignment Checklist

Before you start coding:
- [ ] Updated WORKER_STATUS.md with my worker number
- [ ] Updated WORKER_STATUS.md with my track
- [ ] Picked a task from TASKS_POOL.md
- [ ] Updated TASKS_POOL.md task status to "In Progress"
- [ ] Created my feature branch
- [ ] Read shared/types/contracts.ts
- [ ] Read shared/mocks/index.ts
- [ ] Understand what interface I'm implementing
- [ ] Know what to do if I need a dependency (use mocks!)

---

## 🚀 You're Ready!

Your workspace: /home/user/openjones/openjones-web
Your branch: worker-[N]/[task-name]
Your task: [Task ID from TASKS_POOL.md]

Start coding! Remember:
- Use contracts from contracts.ts
- Use mocks for dependencies
- Write tests
- Commit often
- Update status files when done

Good luck! 🎉
```

---

## 🧪 Example: Worker Claiming Task A2

**Step 1: Pick worker number**
Edit WORKER_STATUS.md:
```diff
- | 1 | 🟢 Available | - | - | - |
+ | 1 | 🔴 Occupied | Track A | 2025-11-06 | 2025-11-06 14:30 |
```

**Step 2: Update track section**
Edit WORKER_STATUS.md Track A section:
```diff
**Current workers:**
- None yet
+ Worker 1 (Track A) - Started 2025-11-06
```

**Step 3: Claim task**
Edit TASKS_POOL.md Task A2:
```diff
**Priority:** 🔴 P0
- **Status:** Available
+ **Status:** In Progress [Worker 1]
**Estimated:** 6-8 hours
```

**Step 4: Create branch**
```bash
cd /home/user/openjones/openjones-web
git checkout -b worker-1/game-state
```

**Step 5: Start coding**
Read contracts.ts, find IGame interface, implement Game.ts!

---

## 📞 For Team Leads

### To Add Multiple Workers at Once

1. Share this file with all workers
2. Have them self-assign (pick numbers 1-10)
3. They update WORKER_STATUS.md and TASKS_POOL.md themselves
4. They create branches and start coding
5. No coordination needed - fully self-service!

### Recommended Initial Assignments

**For team of 3:**
- Worker 1: Track A (critical path)
- Worker 2: Track B (lots of parallel work)
- Worker 3: Track C or D (can use mocks)

**For team of 5:**
- Worker 1: Track A
- Worker 2-3: Track B (multiple buildings in parallel)
- Worker 4: Track C
- Worker 5: Track D

---

## 🔄 Worker Lifecycle

**Join:**
1. Pick number from WORKER_STATUS.md
2. Pick track from WORKER_STATUS.md
3. Pick task from TASKS_POOL.md
4. Update both files
5. Start coding

**Work:**
1. Implement task
2. Write tests
3. Commit regularly
4. Use mocks for dependencies

**Complete Task:**
1. Update TASKS_POOL.md - mark complete
2. Create PR
3. Pick next task
4. Repeat!

**Leave:**
1. Update WORKER_STATUS.md - mark paused/complete
2. Document any WIP
3. Hand off tasks if needed

---

## 💡 Pro Tips

**For efficient self-organization:**
- Check WORKER_STATUS.md to see who's working on what
- Pick tasks that don't depend on incomplete tasks
- If blocked, pick a different task (don't wait!)
- Update status files frequently (helps coordination)
- Track A & B workers should coordinate (A blocks others)

**For AI workers:**
- You have full autonomy to choose
- Pick tasks matching your track
- Don't switch tracks mid-task
- Update status files after every major change
- Commit at least hourly

---

Last Updated: 2025-11-06
