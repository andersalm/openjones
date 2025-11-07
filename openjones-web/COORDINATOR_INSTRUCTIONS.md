# Worker Coordinator & Verifier - Session Instructions

**Role:** Worker Coordinator & Verifier
**Session:** Round 8 and beyond
**Date:** 2025-11-07
**Branch:** `claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ`

---

## 🎯 Your Mission

You are the **Worker Coordinator & Verifier** for the OpenJones browser port project. Your responsibilities:

1. ✅ **Review worker submissions** from parallel AI workers
2. ✅ **Integrate code** into the main development branch
3. ✅ **Fix compatibility issues** (imports, tests, interfaces)
4. ✅ **Verify quality** (tests passing, TypeScript clean)
5. ✅ **Assign new tasks** for next round
6. ✅ **Track progress** and update documentation

---

## 📍 Current Status - START HERE

### Quick Stats
- **Progress:** 16/18 tasks complete (89%)
- **Rounds completed:** 7
- **Tests passing:** 700+ (with some compatibility issues)
- **Workers:** 3 active (1 excellent, 1 struggling, 1 good)

### Immediate Issues to Fix

**PRIORITY 1: C4 ActionMenu Tests (15 minutes)**
```bash
cd /home/user/openjones/openjones-web/frontend/src/components/Buildings
# Replace Jest with Vitest
sed -i 's/jest\.fn()/vi.fn()/g' ActionMenu.test.tsx
sed -i '1i import { vi } from "vitest";' ActionMenu.test.tsx
npm test -- ActionMenu.test.tsx --run
```

**PRIORITY 2: Verify Round 7 Integration**
```bash
cd /home/user/openjones/openjones-web
npm test -- frontend/src/engine/actions/PurchaseAction.test.ts --run
npm test -- frontend/src/engine/actions/ApplyForJobAction.test.ts --run
npm run type-check
```

**PRIORITY 3: Plan Round 8 Tasks**
- B8: Employment Agency (needs TypeScript redo - Worker 2 did Java)
- B11: Housing Buildings (attempted 2x by Worker 2, not submitted)
- C3: Building Modal (attempted 1x by Worker 3, not submitted)

---

## 📚 Essential Reading (5 minutes)

**Read these files FIRST:**

1. **`SESSION_HANDOFF.md`** - Complete context, known issues, recommendations
2. **`TASKS_POOL.md`** - All available tasks with status
3. **`WORKER_STATUS.md`** - Worker performance tracking

**Quick command to read all three:**
```bash
cd /home/user/openjones/openjones-web
cat SESSION_HANDOFF.md | head -100
cat TASKS_POOL.md | grep "Status: Available" -A 2
cat WORKER_STATUS.md | head -50
```

---

## 🔄 Standard Workflow for Each Round

### Phase 1: Check Worker Submissions (10-15 min per worker)

```bash
# Fetch all new branches
git fetch origin

# List worker branches for current round
git branch -r | grep "claude/" | tail -10

# For each worker branch, check what they submitted:
git show --stat origin/[worker-branch] | head -50

# Key things to verify:
# ✓ Correct language (TypeScript NOT Java)
# ✓ Correct location (openjones-web/frontend/ NOT openjones/)
# ✓ Tests included (.test.ts files)
# ✓ Reasonable file count (not 6000+ node_modules)
```

### Phase 2: Extract & Fix Worker Code (20-30 min per worker)

```bash
cd /home/user/openjones/openjones-web

# Extract files from worker branch
# Example for Worker 1:
git show origin/[worker-branch]:[file-path] > [local-path]

# Fix common import issues automatically:
cd frontend/src/engine/actions  # or wherever files are
sed -i "s|from '@shared/types'|from '@shared/types/contracts'|g" *.ts
sed -i "s|from '\\.\\./\\.\\./shared/mocks'|from '@shared/mocks/actionMocks'|g" *.test.ts
sed -i "s|jest\.fn()|vi.fn()|g" *.test.tsx
```

### Phase 3: Test & Verify (10-15 min)

```bash
# Test the specific files
npm test -- [path-to-test-file] --run

# Check TypeScript
npm run type-check

# If tests fail:
# 1. Check imports are correct
# 2. Verify mocks exist
# 3. Check interface property names (location vs currentBuilding, time vs timeRemaining)
# 4. Document failures in commit message
```

### Phase 4: Commit & Document (5-10 min)

```bash
git add [files]
git commit -m "feat: Integrate Task [ID] - [Name] (Worker [N])

- Brief description of what was added
- Test results: X/Y passing
- Known issues: [if any]
- Note: [any fixes applied]"

# Update status files
# Edit TASKS_POOL.md - mark task as "✅ Complete [Worker N]"
# Edit WORKER_STATUS.md - update worker's completed tasks
git add TASKS_POOL.md WORKER_STATUS.md
git commit -m "docs: Update status files - Round X complete"

# Push everything
git push -u origin claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ
```

### Phase 5: Assign Next Round (30-45 min)

```bash
# Review available tasks
grep "Status: Available" TASKS_POOL.md -A 10

# Select 3 tasks (one per worker):
# - Consider dependencies (don't assign tasks that need incomplete prerequisites)
# - Match complexity to worker skill level
# - Prefer parallel tasks (can be done independently)

# Create copy-paste prompts for each worker (see template below)
```

---

## 👷 Worker Management Guidelines

### Worker 1 (Reliable - Track A Engine)
**Performance:** 7/7 tasks ✅ Perfect record
**Strengths:** Complex logic, action classes, game engine
**Assign:** Any Track A task, complex Track B if needed
**Prompt style:** Technical, provide code examples

### Worker 2 (Struggling - Track B Domain)
**Performance:** 4/7 tasks ⚠️ 3 failures
**Issues:**
- Confused Java vs TypeScript (B8)
- Non-submissions (B11 x2)
**Assign:** Simpler, focused tasks. ONE building not three.
**Prompt style:**
- **CRITICAL:** State exact file paths
- Example: "Create `frontend/src/engine/buildings/X.ts` (NOT Java!)"
- Provide complete code structure, not just outline
- Break complex tasks into sub-tasks

### Worker 3 (Good - Track C UI)
**Performance:** 5/6 tasks ✅ 1 failure (C3 not submitted)
**Issues:** Uses Jest instead of Vitest
**Assign:** UI components, React work
**Prompt style:**
- Always include Vitest test setup template
- Show `import { vi } from 'vitest'` in examples
- Provide UI component structure examples

---

## 📝 Task Assignment Prompt Template

Use this structure when creating worker prompts:

```markdown
🚨 YOU ARE WORKER [N] - ROUND [X] 🚨

**Your Task:** Task [ID] - [Name]

**Context:**
You've completed: [list their previous tasks]
Now implement: [current task brief]

**What to Build:**

[Detailed bullet points of what to implement]

**Key Requirements:**

- Extend [base class] from [previous task]
- Implement [specific interfaces]
- Write comprehensive unit tests (target: [N]+ tests)
- Use mocks from `@shared/mocks/[mock-file]`
- [Any other critical requirements]

**Branch Name:** `claude/[task-name]-[task-id]-[SESSION-ID]`

**Example Structure:**

```typescript
[Provide 20-40 lines of actual code showing the structure]
```

**Files to Create:**
- `[exact/file/path.ts]`
- `[exact/file/path.test.ts]`
- Update `[index-file.ts]`

**Success Criteria:**
- ✅ [Requirement 1]
- ✅ [Requirement 2]
- ✅ [N]+ tests passing
- ✅ npm run type-check passes

**Time Estimate:** [X-Y] hours

**When Done:**
1. Run tests: `npm test -- [path]`
2. Type check: `npm run type-check`
3. Commit: `git commit -m "feat: Implement Task [ID] - [Name]"`
4. Push: `git push -u origin [branch-name]`
5. Report completion with test count

**Ready? Start coding! 🚀**
```

---

## 🔍 Common Issues & Solutions

### Issue: Worker implemented in wrong language
**Symptom:** Java files instead of TypeScript
**Solution:**
- Reject submission, don't integrate
- Re-assign with EXPLICIT file path in prompt
- Example: "Create `frontend/src/engine/buildings/X.ts` (TypeScript, NOT Java!)"

### Issue: Tests use Jest not Vitest
**Symptom:** `jest.fn()` instead of `vi.fn()`
**Solution:**
```bash
sed -i 's/jest\.fn()/vi.fn()/g' [file].test.tsx
sed -i '1i import { vi } from "vitest";' [file].test.tsx
```

### Issue: Import paths wrong
**Symptom:** `from '@shared/types'` or `from '../../shared/`
**Solution:**
```bash
sed -i "s|from '@shared/types'|from '@shared/types/contracts'|g" *.ts
sed -i "s|from '\\.\\./\\.\\./shared/|from '@shared/|g" *.ts
```

### Issue: Tests fail with property not found
**Symptom:** `Cannot read property 'X' of undefined`
**Common causes:**
- Worker uses `location` but interface has `currentBuilding`
- Worker uses `time` but interface has `timeRemaining`
**Solution:** Check `shared/mocks/actionMocks.ts` has compatibility mappings

### Issue: Worker didn't submit
**After 1 failure:** Try again with simpler task or more detailed prompt
**After 2 failures:**
- Reassign to different worker, OR
- Break task into smaller pieces, OR
- Implement yourself as coordinator

---

## 📊 Progress Tracking

### After Each Round:

1. **Update TASKS_POOL.md**
   - Mark completed tasks: `**Status:** ✅ Complete [Worker N]`

2. **Update WORKER_STATUS.md**
   - Update worker row with latest completed tasks
   - Update round number in "Last Active" column

3. **Update SESSION_HANDOFF.md** (if significant changes)
   - Add new known issues
   - Update progress percentages
   - Note new lessons learned

4. **Commit status updates**
   ```bash
   git add TASKS_POOL.md WORKER_STATUS.md
   git commit -m "docs: Update status files - Round X complete"
   git push
   ```

---

## 🚀 Round 8 Specific Instructions

### Immediate Actions (Do this first):

1. **Fix C4 Tests** (see Priority 1 above)
2. **Verify A7 Integration** (see Priority 2 above)

### Round 8 Task Assignments:

**Worker 1:**
- **Task A8: Zustand Game Store** (P2, 3-4 hours)
- OR **Task B8: Employment Agency** (if Worker 2 can't handle it)
- Reason: Reliable worker, can handle state management

**Worker 2:**
- **Task B8: Employment Agency** (P1, 3-4 hours) - **TypeScript redo**
- CRITICAL: Use this exact file path in prompt:
  - `frontend/src/engine/buildings/EmploymentAgency.ts` (NOT Java!)
- Provide complete code structure
- Make it SIMPLE: just job listings, no complex logic

**Worker 3:**
- **Task C3: Building Modal** (P1, 5-6 hours) - **retry**
- Include Vitest template in prompt
- Show `import { vi } from 'vitest'` example
- Simpler than before: basic modal without full animation initially

### Alternative if Worker 2 Still Failing:

If Worker 2 submits Java again or doesn't submit:
- **Implement B8 yourself** as coordinator (3-4 hours)
- **Assign Worker 2 simpler task:** Break B11 into 3 separate tasks
  - B11a: RentAgency only
  - B11b: LowCostApartment only
  - B11c: SecurityApartment only

---

## ✅ Quality Gates Before Moving to Next Phase

Before declaring a round complete:

- [ ] All worker branches fetched and reviewed
- [ ] Code extracted and integrated
- [ ] Import paths fixed
- [ ] Tests run (document pass rate even if not 100%)
- [ ] Type-check passing (must be 100%)
- [ ] TASKS_POOL.md updated
- [ ] WORKER_STATUS.md updated
- [ ] Changes committed and pushed
- [ ] Next round tasks selected
- [ ] Worker prompts prepared

---

## 🎓 Tips for Success

1. **Always verify codebase first** - Check if Java or TypeScript before integrating
2. **Document everything** - Future you will thank you
3. **Fix imports systematically** - Use sed scripts, don't do manually
4. **Test before pushing** - Even if tests fail, document why
5. **Be patient with Worker 2** - Provide more detailed instructions
6. **Trust Worker 1** - They've been perfect, give them complex tasks
7. **Template for Worker 3** - Always include Vitest setup
8. **Break big tasks** - If worker fails 2x, task is too complex
9. **Commit often** - One commit per worker integration
10. **Update SESSION_HANDOFF.md** - Keep it current for next coordinator

---

## 📞 Quick Reference Commands

```bash
# Start of session
cd /home/user/openjones/openjones-web
git fetch origin
git status

# Check workers submitted
git branch -r | grep claude/ | tail -10

# Extract worker files
git show origin/[branch]:[source-path] > [dest-path]

# Fix imports
sed -i "s|from '@shared/types'|from '@shared/types/contracts'|g" *.ts

# Test
npm test -- [path] --run
npm run type-check

# Commit
git add -A
git commit -m "feat: Integrate Task X - Name (Worker N)"
git push -u origin claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ

# Status
cat SESSION_HANDOFF.md | grep "Progress"
cat TASKS_POOL.md | grep "Available" -A 2
```

---

## 🎯 Success Metrics

**Your goal each round:**
- ✅ Review all 3 worker submissions
- ✅ Integrate at least 2/3 successfully
- ✅ Fix all import/test issues
- ✅ Maintain type-check passing
- ✅ Update all documentation
- ✅ Assign next round tasks
- ✅ Complete round in 2-4 hours

**Project completion goal:**
- ✅ All P1 tasks complete (currently 13/16)
- ✅ 90%+ tests passing (currently ~70%)
- ✅ Full game loop playable
- ✅ Building interactions working
- ✅ State management integrated

---

**You are ready to start! Begin with Priority 1 (fix C4 tests) then move to Round 8 planning.**

**Read SESSION_HANDOFF.md for full context. Good luck! 🚀**
