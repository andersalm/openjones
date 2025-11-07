# Session 4 Quick Start Guide

**Previous Session:** Session 3 (2025-11-07)
**Status:** ✅ Complete - 4/4 tasks, 206 tests, all passing
**Your Mission:** Coordinate 4 workers for Session 4

---

## 🚀 Quick Start (5 minutes)

```bash
cd /home/user/openjones/openjones-web

# 1. Checkout Session 3's completed branch (has all latest work)
git fetch origin claude/coordinator-verify-openjones-session-3-011CUu35z6CW3Zuq6vwJcxJ6
git checkout claude/coordinator-verify-openjones-session-3-011CUu35z6CW3Zuq6vwJcxJ6
git pull

# 2. Create YOUR Session 4 coordinator branch
git checkout -b claude/coordinator-verify-openjones-session-4-[YOUR-SESSION-ID]

# 3. Update START_HERE.md line 4 with your new branch name
# (Replace Session 3 branch with your Session 4 branch)

# 4. Read key documents
cat .coordinator/IMPROVEMENTS-SESSION-4.md  # Session 3 lessons
cat .coordinator/session-report-session-3.md  # What was completed
cat TASKS_POOL.md | grep -A 3 "Status: Available"  # Available tasks
```

---

## 📋 Recommended Tasks for Session 4

**High Priority (Do These!):**

| Worker | Task | Priority | Estimated | Why |
|--------|------|----------|-----------|-----|
| 1 | **D4: Animation Engine** | 🟠 P1 | 5-6 hours | Complete rendering pipeline |
| 2 | **D5: Effects Renderer** | 🟡 P2 | 4-5 hours | Visual polish, completes rendering |
| 3 | **C2: Player Stats HUD** | 🟠 P1 | 4-5 hours | Essential UI feedback |
| 4 | **A1: Position & Route** | 🔴 P0 | 2-3 hours | Foundation for movement |

**Why these tasks?**
- ✅ No file conflicts (different directories)
- ✅ All dependencies satisfied
- ✅ Completes rendering pipeline (D4, D5 finish D1→D5)
- ✅ Essential foundation (A1 unblocks many tasks)

---

## ⚡ Key Improvements for Session 4

### 1. Worker Instructions MUST Include Startup Commands

**Add this as FIRST section in every worker instruction file:**

```markdown
## 🚨 CRITICAL: Run These Commands FIRST!

\`\`\`bash
cd /home/user/openjones/openjones-web
git fetch origin [YOUR-COORDINATOR-BRANCH]
git checkout [YOUR-COORDINATOR-BRANCH]
ls .coordinator/rounds/round-04/
npm install
git checkout -b claude/[task-name]-[task-id]-[YOUR-SESSION-ID]
\`\`\`
```

### 2. Enforce Branch Naming Rules

**Add clear examples:**
- ✅ CORRECT: `claude/animation-engine-d4-[session-id]`
- ❌ WRONG: `claude/coordinator-verify-[session-id]`

### 3. Check for File Conflicts

Tasks D4, D5, C2, A1 have **zero file overlap** - safe!

---

## 📝 Coordinator Workflow (3 hours)

### Step 1: Setup (15 min)
```bash
# Create round directory
mkdir -p .coordinator/rounds/round-04

# Create task lock files
mkdir -p .coordinator/tasks/assigned
echo "worker-1\n$(date)" > .coordinator/tasks/assigned/task-d4.locked
echo "worker-2\n$(date)" > .coordinator/tasks/assigned/task-d5.locked
echo "worker-3\n$(date)" > .coordinator/tasks/assigned/task-c2.locked
echo "worker-4\n$(date)" > .coordinator/tasks/assigned/task-a1.locked
```

### Step 2: Generate Instructions (30 min)
- Use `.coordinator/worker-template.md`
- Add startup commands section (CRITICAL!)
- Add branch naming rules
- Fill in task details from TASKS_POOL.md
- Save to `.coordinator/rounds/round-04/worker-[1-4]-instructions.md`

### Step 3: Launch Workers (5 min)
Give each worker:
```
cd /home/user/openjones/openjones-web
git fetch origin [YOUR-COORDINATOR-BRANCH]
git checkout [YOUR-COORDINATOR-BRANCH]
cat .coordinator/rounds/round-04/worker-N-instructions.md
```

### Step 4: Wait (1-2 hours)
Workers work autonomously. They'll create reports in:
- `.coordinator/rounds/round-04/worker-[1-4]-report.md`

### Step 5: Review & Merge (30 min)
```bash
git fetch --all
git checkout -b review-worker-1 origin/claude/[worker-1-branch]
# Review, test, repeat for all 4

git checkout [YOUR-COORDINATOR-BRANCH]
git merge review-worker-1 --no-ff -m "feat: Worker 1 - Task D4"
# Repeat for all 4
```

### Step 6: Verify (10 min)
```bash
npm install
npm test -- Animation
npm test -- Effects
npm test -- PlayerStats
npm test -- Position
npm test -- Route
```

### Step 7: Update Docs (20 min)
- TASKS_POOL.md (mark D4, D5, C2, A1 complete)
- WORKER_STATUS.md (add Session 4 workers)
- Generate session report

### Step 8: Commit & Push (5 min)
```bash
git add .
git commit -m "chore(coordinator): Complete Session 4 - [X] tasks"
git push -u origin [YOUR-COORDINATOR-BRANCH]
```

---

## 🎯 Session Success Criteria

**Minimum Success:**
- [ ] 3+ tasks completed (75%)
- [ ] All tests passing
- [ ] Documentation updated

**Ideal Success (aim for this!):**
- [ ] 4/4 tasks completed (100%)
- [ ] 150+ new tests
- [ ] A+ quality
- [ ] Rendering pipeline complete (D1-D5)

---

## 🆘 Common Issues & Solutions

**Issue:** Worker starts in wrong directory
**Solution:** Add explicit `cd /home/user/openjones/openjones-web` as FIRST command

**Issue:** Worker uses wrong branch name pattern
**Solution:** Add clear ✅/❌ examples in instructions

**Issue:** Merge conflict in types.ts or index.ts
**Solution:** Combine both changes with comments, git add, git commit --no-edit

**Issue:** Tests fail after merge
**Solution:** Run `npm install` again, check import paths

---

## 📚 Reference Documents

**Must Read:**
- `.coordinator/IMPROVEMENTS-SESSION-4.md` - Session 3 lessons
- `.coordinator/session-report-session-3.md` - What was completed
- `TASKS_POOL.md` - All available tasks

**Templates:**
- `.coordinator/worker-template.md` - Base template
- `.coordinator/rounds/round-03/worker-*-instructions.md` - Examples

**History:**
- `.coordinator/session-report-session-2.md` - Session 2 results
- `.coordinator/common-mistakes.md` - Patterns to avoid

---

## ✅ Pre-Flight Checklist

Before launching workers:

- [ ] Created Session 4 coordinator branch
- [ ] Updated START_HERE.md with new branch name
- [ ] Read IMPROVEMENTS-SESSION-4.md (Session 3 lessons)
- [ ] Created .coordinator/rounds/round-04/ directory
- [ ] Created task lock files
- [ ] Generated all 4 worker instruction files
- [ ] Added startup commands to ALL instructions
- [ ] Added branch naming rules to ALL instructions
- [ ] Committed and pushed coordinator setup

---

## 📊 Current Project State

**Completed (28 tasks):**
- Session 1: A1-A7, B1-B7, B11, C1-C4, C6, A8
- Session 2: D1, C5, B9, B10
- Session 3: D2, D3, C7, B8

**Available Next:**
- Track A: A1 (Position/Route), plus movement/action tasks
- Track B: Few building/economy tasks remain
- Track C: C2 (Player Stats HUD), C3 needed
- Track D: D4 (Animation), D5 (Effects) ← Completes rendering!
- Track E: AI system (Week 4+)

**After Session 4:**
- Rendering pipeline 100% complete (D1-D5) ✅
- Foundation for movement (Position/Route) ✅
- Player feedback UI (Stats HUD) ✅
- Ready for gameplay integration! 🎮

---

## 🚀 Let's Go!

You have everything you need. Session 3 was a huge success (100% completion, 206 tests). Let's make Session 4 even better!

**Key to Success:**
1. Add startup commands to worker instructions (CRITICAL!)
2. Use recommended tasks (no conflicts)
3. Follow the workflow above
4. Trust the workers (they're excellent!)

Good luck! 🎉

---

**Prepared By:** Session 3 Coordinator
**Date:** 2025-11-07
**For:** Session 4 Coordinator
