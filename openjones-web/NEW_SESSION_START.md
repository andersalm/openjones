# New Session Startup Instructions

These instructions are for starting a **NEW coordinator session** to continue the OpenJones browser port project using the parallel worker system.

**IMPORTANT**: These instructions assume NO prior context or files from previous sessions. Everything is verified first.

---

## 1. Initial Repository Check

First, verify the current state of the repository and what exists:

```bash
# Check current location
pwd

# Navigate to project if needed
cd /home/user/openjones/openjones-web

# Check current branch
git branch

# Check status
git status

# List key directories and files
ls -la
ls -la frontend/src/engine/actions 2>&1 | head -10
ls -la frontend/src/components 2>&1
ls -la shared 2>&1
```

**What to look for:**
- You should be in `/home/user/openjones/openjones-web`
- Current branch: `claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ` (main development branch)
- Key files that should exist: `TASKS_POOL.md`, `WORKER_STATUS.md`, `package.json`
- Key directories: `frontend/`, `shared/`, `docs/`

---

## 2. Check Project Status Files

Read the status files to understand current progress:

```bash
# Read task pool to see what's completed and pending
cat TASKS_POOL.md | head -50

# Read worker status to see worker performance
cat WORKER_STATUS.md

# Check recent git commits
git log --oneline -10
```

**What you'll learn:**
- TASKS_POOL.md: Shows all 18 tasks (A1-A7, B1-B11, C1-C4) with completion status
- WORKER_STATUS.md: Shows which workers completed which tasks
- Git log: Shows recent integration commits

---

## 3. Verify Development Environment

Check if dependencies are installed:

```bash
# Check if node_modules exists
ls node_modules 2>&1 | head -5

# If not installed, run:
npm install

# Verify Vite and React are available
npm list vite react vitest 2>&1 | head -20
```

---

## 4. Run Tests to Verify Current State

**CRITICAL**: Run tests to see actual current state, not assumed state:

```bash
# Run all tests
npm test 2>&1 | tee test_results.txt

# Or run tests with coverage
npm run test:coverage 2>&1 | tee test_results.txt
```

**Expected results:**
- ~700+ tests total
- Most should pass (70-80% pass rate)
- Some known failures due to compatibility issues

**Review test output** to understand:
- Which action classes are implemented
- Which components are complete
- Which tests are failing and why

---

## 5. Understand the Codebase Structure

Map out what's actually implemented:

```bash
# List all action implementations
ls frontend/src/engine/actions/*.ts | grep -v test

# List all building implementations
ls frontend/src/engine/buildings/*.ts | grep -v test 2>&1

# List all UI components
ls frontend/src/components/*/*.tsx | grep -v test
```

**Current architecture:**
- **Actions**: Abstract base class pattern with validate/execute methods
- **Buildings**: Abstract Building base class with inheritance
- **Components**: React 19 components with TypeScript
- **Contracts**: TypeScript interfaces in `shared/types/contracts.ts`
- **Mocks**: Test utilities in `shared/mocks/`

---

## 6. Review Pending Tasks

Open TASKS_POOL.md and identify incomplete tasks:

**Known incomplete tasks:**
- **Task B8**: Employment Agency (attempted in Java by mistake, needs TypeScript redo)
- **Task B11**: Housing Buildings (attempted twice, not submitted)
- **Task C3**: Building Modal (attempted once, not submitted)

---

## 7. Coordinator Role and Workflow

As coordinator, your responsibilities:

### 7.1 Review Worker Submissions

When workers complete tasks, they push to branches named:
```
claude/[task-name]-[task-id]-[session-id]
```

**Your workflow:**
1. Fetch the worker's branch
2. Review the code for quality and correctness
3. Check tests pass
4. Fix any import path issues
5. Integrate into main development branch
6. Update status files

### 7.2 Create Worker Instructions

When assigning new tasks:

1. **Read TASKS_POOL.md** to find pending tasks
2. **Check dependencies** - make sure prerequisite tasks are done
3. **Prepare context** for the worker:
   - Copy task description from TASKS_POOL.md
   - Provide relevant contract interfaces
   - List available mock utilities
   - Show example implementations
4. **Make instructions self-contained** - workers don't have access to the full codebase

### 7.3 Update Documentation

After integrating work:
- Update TASKS_POOL.md (mark tasks complete)
- Update WORKER_STATUS.md (record worker performance)
- Commit changes with clear messages

---

## 8. Worker Branch Integration Template

When a worker completes a task:

```bash
# Fetch worker branch
git fetch origin claude/[task-name]-[session-id]

# Create local tracking branch
git checkout -b temp-review-[task-name] origin/claude/[task-name]-[session-id]

# Review the changes
ls -la frontend/src/engine/actions/  # or wherever the changes are
cat [new-file].ts

# Run tests on worker's code
npm test -- [new-file].test.ts

# If good, switch to main development branch
git checkout claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ

# Merge or cherry-pick worker changes
git merge temp-review-[task-name] --no-ff -m "feat: Integrate Task [ID] - [description]"

# Fix any issues (import paths, etc.)
# Run tests again
npm test

# Push to development branch
git push -u origin claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ

# Clean up temp branch
git branch -D temp-review-[task-name]
```

---

## 9. Common Integration Issues

### Import Path Standardization

Workers may use inconsistent import paths. Standardize to:
- `@shared/types/contracts` (NOT `@shared/types`)
- `@shared/mocks/actionMocks` (NOT relative paths like `../../shared/mocks`)

**Fix with sed:**
```bash
sed -i "s|from '@shared/types'|from '@shared/types/contracts'|g" *.ts
sed -i "s|from '\\.\\./\\.\\./shared/mocks'|from '@shared/mocks/actionMocks'|g" *.ts
```

### Test Framework

Workers might use Jest instead of Vitest. Convert:
```bash
sed -i 's/jest\.fn()/vi.fn()/g' *.test.ts
sed -i 's/jest\.mock(/vi.mock(/g' *.test.ts
sed -i '1i import { vi } from "vitest";' *.test.ts
```

### Mock Property Names

Some workers use legacy field names:
- `location` → should be `currentBuilding`
- `time` → should be `timeRemaining`

The compatibility layer in `shared/mocks/actionMocks.ts` handles these, but tests may need updates.

---

## 10. Creating Worker Instructions

Template for worker instructions:

```markdown
# Task [ID]: [Name]

You are Worker [N] implementing [task description].

## Current Branch
Work on: `claude/[task-name]-[task-id]-011CUsT3jWbYUM7oTUxpQ5cQ`

## Context
[Provide relevant background, show existing code patterns]

## Requirements
[List specific requirements from TASKS_POOL.md]

## Contracts
[Paste relevant TypeScript interfaces from shared/types/contracts.ts]

## Testing
Use Vitest (NOT Jest):
- Import: `import { vi } from 'vitest'`
- Mocks: `vi.fn()`, `vi.mock()`
- Test structure: `describe()`, `it()`, `expect()`

## Available Mocks
[List and show examples from shared/mocks/]

## Submission
1. Implement the classes/components
2. Write comprehensive tests
3. Verify tests pass: `npm test`
4. Commit your work
5. Push to your branch
6. Report completion with summary
```

---

## 11. Next Steps for This Session

Based on the current state:

1. **Verify**: Run tests and check actual state (Step 4 above)
2. **Review**: Check TASKS_POOL.md for pending tasks (Step 6 above)
3. **Decide**:
   - Option A: Fix known issues (B8, B11, C3)
   - Option B: Assign new batch of tasks to workers
   - Option C: Focus on integration and testing improvements

4. **Check for pending worker submissions**:
```bash
git fetch --all
git branch -r | grep -v "analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ" | grep -v master
```

If there are new worker branches, review and integrate them (Step 8 above).

---

## 12. Critical Reminders

- **NEVER assume files exist** - always verify first
- **Check actual test results** - don't assume tests pass
- **Worker instructions must be self-contained** - workers can't read full codebase
- **Import paths matter** - standardize during integration
- **Use Vitest, not Jest** - for this project
- **Update documentation** - keep TASKS_POOL.md and WORKER_STATUS.md current
- **Branch naming** - must follow `claude/[name]-[sessionid]` pattern for push to work

---

## Summary Checklist

Before starting coordinator work:

- [ ] Verified current branch: `claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ`
- [ ] Read TASKS_POOL.md and WORKER_STATUS.md
- [ ] Ran `npm test` to see actual current state
- [ ] Checked for pending worker branches: `git branch -r`
- [ ] Understand codebase structure (Step 5 above)
- [ ] Ready to either integrate worker submissions OR assign new tasks

**You are now ready to coordinate the parallel worker system.**

For questions or issues, check:
- `frontend/src/engine/actions/README.md` - Action system documentation
- `frontend/src/components/ui/README.md` - UI component guidelines
- `shared/types/contracts.ts` - All TypeScript interfaces
- `shared/mocks/` - Mock utilities for testing
