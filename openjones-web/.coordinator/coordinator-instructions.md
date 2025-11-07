# Coordinator Session Instructions

**Version:** 1.0 (Minimal Framework)
**Created:** 2025-11-07
**Type:** Step-by-Step Guide

---

## 🎯 Your Role

You are the **Coordinator** for the OpenJones browser port project. Your job is to:
1. **Assign tasks** to parallel AI workers
2. **Generate worker instructions** from templates
3. **Merge worker results** after completion
4. **Verify quality** and integration
5. **Update documentation** and prepare for next session

**You DO NOT implement features yourself.** Your focus is coordination and verification.

---

## 📋 Before You Start

### Pre-Flight Checklist

```bash
cd /home/user/openjones/openjones-web

# 1. Check you're on the right branch
git branch --show-current
# Should be: claude/coordinator-[description]-[SESSION-ID]

# 2. Verify project is clean
git status
npm run type-check
npm test

# 3. Read previous session report (if exists)
cat .coordinator/session-report.md

# 4. Read common mistakes to avoid
cat .coordinator/common-mistakes.md

# 5. Review available tasks
ls .coordinator/tasks/available/

# 6. Check VISION.md for current phase goals
cat .coordinator/VISION.md | grep "Current Focus"
```

**If anything fails, fix it before proceeding.**

---

## 🚀 Session Flow: Single Round (Recommended)

### Phase 1: Planning (15 minutes)

#### Step 1: Select Tasks
```bash
# Read available tasks
cat TASKS_POOL.md | grep "Status: Available"

# Choose 4 tasks that:
# - Have no unmet dependencies
# - Are from different subsystems (avoid conflicts)
# - Vary in complexity (2 easy, 2 medium)
# - Don't overlap in files they'll modify
```

**Example Good Selection:**
- Task D2: Sprite Manager (rendering)
- Task C5: Game Board Component (UI)
- Task B9: Shopping Buildings Part 1 (buildings)
- Task C7: Victory Screen (UI)

**Example Bad Selection:**
- Task B9: Department Store
- Task B10: Pawn Shop (overlaps with B9 - both shopping)
- Task B11: Rent Agency (might conflict)
- Task B12: Another building (too similar)

#### Step 2: Create Round Directory
```bash
mkdir -p .coordinator/rounds/round-01
cd .coordinator/rounds/round-01
```

#### Step 3: Lock Tasks
```bash
# For each selected task, create a lock file
echo "worker-1" > ../../tasks/assigned/task-d2.locked
echo "worker-2" > ../../tasks/assigned/task-c5.locked
echo "worker-3" > ../../tasks/assigned/task-b9.locked
echo "worker-4" > ../../tasks/assigned/task-c7.locked
```

---

### Phase 2: Generate Worker Instructions (30 minutes)

For each worker, create instructions using the template:

#### Worker Instruction Template

```bash
# Copy template for each worker
cp ../../worker-template.md worker-1.md
cp ../../worker-template.md worker-2.md
cp ../../worker-template.md worker-3.md
cp ../../worker-template.md worker-4.md
```

#### Fill in Each Template

**Replace these placeholders:**
- `{{WORKER_ID}}` → Worker number (1, 2, 3, 4)
- `{{TASK_ID}}` → Task ID (D2, C5, B9, C7)
- `{{TASK_NAME}}` → Task name from TASKS_POOL.md
- `{{BRANCH_NAME}}` → Branch pattern (e.g., sprite-manager-d2)
- `{{DATE}}` → Current date

**Add task-specific content:**
- Objective from TASKS_POOL.md
- Files to create
- Dependencies and existing code to reference
- Step-by-step implementation guide
- Test requirements
- Verification checklist

**Keep instructions concise:** 300-400 lines max (not 600+ like Session 1)

#### Example: worker-1.md Structure
```markdown
# Worker 1: Task D2 - Sprite Manager

**Branch:** claude/sprite-manager-d2-[YOUR-SESSION-ID]
**Date:** 2025-11-07

## Primary Objective
Implement SpriteManager class for loading and caching game sprites.

## Deliverables
- [ ] SpriteManager.ts (100-150 lines)
- [ ] SpriteManager.test.ts (20+ tests)
- [ ] Type definitions for sprites
- [ ] Asset loading with error handling

## Context
[Existing patterns to follow...]

## Implementation Steps
1. Create SpriteManager class
2. Add image loading
3. Add caching
4. Write tests
5. Verify

## Verification Checklist
- [ ] All files created
- [ ] npm run type-check passes
- [ ] npm test passes (20+ tests)
- [ ] Branch pushed

## Common Mistakes to Avoid
[From common-mistakes.md...]
```

---

### Phase 3: Launch Workers (5 minutes)

**Provide each worker with their instructions:**

1. Copy content of `worker-N.md`
2. Start new AI worker session
3. Paste instructions
4. Wait for worker to complete

**Do this for all 4 workers in parallel.**

---

### Phase 4: Wait & Monitor (1-2 hours)

Workers will work autonomously. They should:
- Implement their assigned task
- Write comprehensive tests
- Commit and push to their branch
- Report completion with metrics

**Your job:** Wait for completion reports.

**If a worker reports issues:**
- Review the issue
- Provide clarification if needed
- Update common-mistakes.md with the issue

---

### Phase 5: Review Worker Results (30 minutes)

When all workers report completion:

#### For Each Worker:

```bash
cd /home/user/openjones/openjones-web

# 1. Fetch their branch
git fetch origin claude/[worker-branch-name]

# 2. Check it out locally
git checkout -b review-worker-1 origin/claude/[worker-branch-name]

# 3. Review the code
ls -la [modified-files]
cat [key-files] | head -50

# 4. Run tests
npm test -- [test-pattern]

# 5. Check type safety
npm run type-check

# 6. Look for issues
git diff main..HEAD
```

**Quality Checklist:**
- [ ] All promised files exist
- [ ] Tests pass (check worker's reported count)
- [ ] Type checking passes
- [ ] Code follows existing patterns
- [ ] No console.logs or debug code left
- [ ] Imports use correct paths (@shared/types/contracts)

**Save worker report:**
```bash
# Worker should have provided a report
# Save it to round directory
cd .coordinator/rounds/round-01
# Create report-worker-N.md from worker's completion message
```

---

### Phase 6: Merge Results (30 minutes)

#### Option A: Cherry-Pick Best Code (Recommended for conflicts)

```bash
# Return to coordinator branch
git checkout claude/coordinator-[your-session-id]

# Cherry-pick specific files from worker branches
git checkout review-worker-1 -- [files-from-worker-1]
git add [files]
git commit -m "feat([area]): Integrate [task] from Worker 1

[Worker's deliverables summary]
- X tests passing
- Y lines of code"

# Repeat for each worker
```

#### Option B: Merge Branches (If no conflicts)

```bash
git checkout claude/coordinator-[your-session-id]

# Merge each worker branch
git merge review-worker-1 --no-ff -m "feat: Merge Worker 1 - Task D2"
git merge review-worker-2 --no-ff -m "feat: Merge Worker 2 - Task C5"
# etc...
```

#### Verify Integration

```bash
# After merging all workers:
npm install  # If package.json changed
npm run type-check
npm test

# Expected: All tests pass, no type errors
```

**If tests fail:**
- Review the failure
- Fix import paths or minor issues
- Do NOT rewrite worker code unless necessary
- Commit fixes separately

---

### Phase 7: Update Documentation (20 minutes)

#### Update TASKS_POOL.md

```bash
# Mark completed tasks
# Change status from "Available" to "✅ Complete [Worker N]"
```

#### Update Task Files

```bash
# Move completed tasks
mv .coordinator/tasks/assigned/task-d2.locked .coordinator/tasks/completed/task-d2.md

# Add completion details to task file
echo "Completed: 2025-11-07" >> .coordinator/tasks/completed/task-d2.md
echo "Worker: 1" >> .coordinator/tasks/completed/task-d2.md
echo "Tests: 25" >> .coordinator/tasks/completed/task-d2.md
```

#### Update WORKER_STATUS.md

```markdown
| Worker # | Status | Tasks | Completed |
|----------|--------|-------|-----------|
| 1 | ✅ Complete | D2 | 2025-11-07 - SpriteManager (25 tests) |
| 2 | ✅ Complete | C5 | 2025-11-07 - GameBoard (18 tests) |
| 3 | ✅ Complete | B9 | 2025-11-07 - Shopping Bldgs (30 tests) |
| 4 | ✅ Complete | C7 | 2025-11-07 - Victory Screen (15 tests) |
```

---

### Phase 8: Generate Session Report (20 minutes)

Create `.coordinator/session-report.md`:

```markdown
# Coordinator Session Report

**Session:** 2
**Date:** 2025-11-07
**Coordinator:** [Session ID]
**Phase:** 1 (Manual Template System)

## Summary
- Workers: 4
- Tasks Assigned: 4 (D2, C5, B9, C7)
- Tasks Completed: 4 (100%)
- Total Tests: 88
- Total Lines: 1,234

## Worker Performance
- Worker 1 (D2): 25 tests, excellent quality
- Worker 2 (C5): 18 tests, good integration
- Worker 3 (B9): 30 tests, comprehensive
- Worker 4 (C7): 15 tests, clean code

## Issues Encountered
1. [Any issues that came up]
2. [How they were resolved]

## Lessons Learned
1. [What worked well]
2. [What should be improved]
3. [New patterns discovered]

## Updates Made
- common-mistakes.md: Added 2 new patterns
- worker-template.md: Shortened by 20%
- coordinator-instructions.md: Clarified step 5

## Next Session Recommendations
1. [Suggestions for next coordinator]
2. [Tasks to prioritize]
3. [Process improvements to try]

## Metrics
- Time to complete: X hours
- Integration issues: Y
- Test pass rate: 100%
- Code quality: A+
```

---

### Phase 9: Update Common Mistakes (15 minutes)

Edit `.coordinator/common-mistakes.md`:

```markdown
# Common Mistakes & How to Avoid Them

## Mistake: [New mistake from this session]
**Observed:** Worker X did Y
**Problem:** Caused Z issue
**Solution:** Do W instead
**Prevention:** Added to worker template section 3

## Mistake: [Another new pattern]
...
```

---

### Phase 10: Finalize (10 minutes)

#### Push All Changes

```bash
git add .
git commit -m "chore(coordinator): Complete session 2

Completed tasks: D2, C5, B9, C7
Workers: 4/4 successful
Tests: 88 passing
Session report and lessons documented"

git push -u origin claude/coordinator-[your-session-id]
```

#### Clean Up (Optional)

```bash
# Delete worker review branches locally
git branch -D review-worker-1 review-worker-2 review-worker-3 review-worker-4

# Optionally delete remote worker branches (after confirming merge)
# git push origin --delete claude/sprite-manager-d2-[session-id]
```

#### Prepare for Next Session

Create a simple "next steps" file:

```bash
cat > .coordinator/NEXT_SESSION.md << 'EOF'
# Next Coordinator Session

## To Start:
1. Read .coordinator/coordinator-instructions.md
2. Review .coordinator/session-report.md (previous session)
3. Check .coordinator/common-mistakes.md
4. Select 4 tasks from TASKS_POOL.md
5. Follow coordinator-instructions.md steps

## Recommended Tasks for Next Round:
- Task D3: Map Renderer
- Task C5: Game Board Component
- Task B10: Shopping Buildings Part 2
- Task C7: Victory Screen

## Goals:
- Test updated worker template
- Verify common-mistakes updates help
- Collect data for Phase 2 improvements
EOF
```

---

## ✅ Session Complete!

You've successfully:
- ✅ Assigned 4 tasks to workers
- ✅ Merged all worker results
- ✅ Verified quality
- ✅ Updated documentation
- ✅ Generated session report
- ✅ Prepared for next session

**The next coordinator will start fresh with your improvements!**

---

## 🆘 Troubleshooting

### Problem: Worker asks for clarification
**Solution:** Answer their question, then add clarification to worker-template.md for future workers

### Problem: Worker branch conflicts with main
**Solution:** Rebase worker branch on main before merging, or cherry-pick files

### Problem: Tests fail after merge
**Solution:** Check for import path issues, missing dependencies, or test conflicts. Fix and commit separately.

### Problem: Worker doesn't report completion
**Solution:** Wait 2 hours, then check if branch was pushed. Review their branch if available.

### Problem: Duplicate work (two workers do same task)
**Solution:** Use task locking system. If it happens, choose best implementation and document in session report.

---

## 📚 Reference Files

- **Vision:** `.coordinator/VISION.md` - Long-term roadmap
- **Template:** `.coordinator/worker-template.md` - Worker instruction template
- **Mistakes:** `.coordinator/common-mistakes.md` - Patterns to avoid
- **Tasks:** `TASKS_POOL.md` - All available tasks
- **Status:** `WORKER_STATUS.md` - Worker performance history

---

**Last Updated:** 2025-11-07
**For Questions:** Check VISION.md or README.md
