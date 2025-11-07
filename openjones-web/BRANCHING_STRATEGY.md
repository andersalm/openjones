# Branching Strategy and Branch Management

**Last Updated:** 2025-11-07

---

## Overview

This document defines the branching strategy for the OpenJones browser port project using AI workers.

---

## Branch Types

### 1. Master Branch

**Name:** `master`
**Purpose:** Production-ready code, stable releases
**Who can push:** User with admin access only
**When updated:** After coordinator verifies and integrates worker submissions

**Rules:**
- Only tested, verified code
- Must have passing tests
- Documentation must be up to date
- Code must compile without errors

**Current State:**
- Needs manual update (see `MANUAL_MASTER_UPDATE.md`)
- AI sessions cannot push to master (403 restriction)

---

### 2. Development/Coordinator Branch

**Name:** `claude/[description]-[session-id]`
**Example:** `claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ`
**Purpose:** Active development, integration of worker submissions
**Who can push:** Coordinator AI with matching session ID
**Lifespan:** Long-lived (multiple rounds of work)

**Rules:**
- Coordinator integrates worker code here
- Tests should mostly pass (70%+ pass rate acceptable during development)
- Documentation updated after each integration
- This is the "working" branch for active development

**Current Active Branch:**
```
claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ
- 16/18 tasks complete
- 700+ tests
- Latest commit: 1cc2902
```

---

### 3. Worker Task Branches

**Name:** `claude/[task-name]-[task-id]-[session-id]`
**Examples:**
- `claude/action-menu-c4-011CUteUj9FPQGPBVDr9Z2nm`
- `claude/economic-actions-a7-011CUteMhmhUXQvGd4vcmZfN`
- `claude/player-stats-hud-c2-011CUt1gS2Nwc1RZXTfRNTTr`

**Purpose:** Individual worker implements a specific task
**Who can push:** Worker AI with matching session ID
**Lifespan:** Short-lived (single task, then integrated and deleted)

**Rules:**
- One task per branch
- Worker implements feature and tests
- Pushed to remote when complete
- Coordinator reviews and integrates
- **Deleted after integration**

---

## Branch Lifecycle

### Worker Branch Lifecycle

```
1. Worker creates branch
   └─> git checkout -b claude/task-a5-011CUsXXX

2. Worker implements feature
   └─> Write code, tests, commit

3. Worker pushes to remote
   └─> git push -u origin claude/task-a5-011CUsXXX

4. Coordinator reviews
   └─> Fetch worker branch, test locally

5. Coordinator integrates
   └─> Merge/cherry-pick to development branch
   └─> Update TASKS_POOL.md, WORKER_STATUS.md
   └─> Push development branch

6. Worker branch deleted
   └─> git push origin --delete claude/task-a5-011CUsXXX
   └─> git branch -d claude/task-a5-011CUsXXX (local cleanup)
```

**Current Problem:** 21 worker branches were NOT deleted after integration (step 6 failed)

---

## Branch Cleanup Strategy

### When to Delete a Worker Branch

Delete a worker branch when **ALL** of these are true:
- [ ] Code has been integrated into development/coordinator branch
- [ ] Integration commit has been pushed to remote
- [ ] Tests pass on development branch
- [ ] No follow-up work needed on that specific task

### How to Delete Worker Branches

**Manual deletion (requires admin access):**

```bash
# Delete a single worker branch
git push origin --delete claude/[branch-name]

# Verify deletion
git branch -r | grep [branch-name]
# Should return nothing

# Clean up local tracking branch
git fetch --prune
```

**Bulk deletion of integrated branches:**

See `CLEANUP_WORKER_BRANCHES.md` for the script to delete all 21 currently integrated branches.

---

## Current Branch Status

### Active Branches (Keep)

| Branch | Purpose | Status | Action |
|--------|---------|--------|--------|
| `master` | Production | Needs update | Manual update (see MANUAL_MASTER_UPDATE.md) |
| `claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ` | Active development | ✅ Current | Keep - this is where work continues |

### Integrated Worker Branches (Delete)

| Branch | Task | Status | Action |
|--------|------|--------|--------|
| `claude/action-menu-c4-011CUteUj9FPQGPBVDr9Z2nm` | C4 | Integrated | Delete |
| `claude/add-action-classes-011CUtci3t1D5fFrJQfi2jyq` | Multiple | Integrated | Delete |
| `claude/base-action-classes-011CUshDBLVPrkCGtyRfsBVn` | A1 | Integrated | Delete |
| `claude/building-base-class-011CUsfmHHLGcdx9kBCD364a` | B3 | Integrated | Delete |
| `claude/core-buildings-b7-011CUshDoGipdu6CKS3oXGwv` | B7 | Integrated | Delete |
| `claude/design-system-setup-011CUshG1NnwgpMuSdJen8H1` | C1 | Integrated | Delete |
| `claude/economic-actions-a7-011CUteMhmhUXQvGd4vcmZfN` | A7 | Integrated | Delete |
| `claude/employment-agency-b8-011CUteQn2mbqNGsR9vmxzGr` | B8 | Failed (wrong language) | Delete |
| `claude/game-state-management-011CUseioTqBNh22GNZBT1ET` | A2 | Integrated | Delete |
| `claude/game-state-management-011CUsfjfdwjxWvtcNZyeUjK` | A2 (duplicate) | Integrated | Delete |
| `claude/implement-job-system-011CUsenJAa4pJpToSH7H3dW` | B2 | Integrated | Delete |
| `claude/implement-measures-system-011CUsfk9dfsiZyTzGhrL3k1` | B1 | Integrated | Delete |
| `claude/movement-actions-a5-011CUt1dd54tWwxs8YogpRjF` | A5 | Integrated | Delete |
| `claude/movement-actions-a5-011CUt1frw4KVgbYbVGZ9k2W` | A5 (duplicate) | Integrated | Delete |
| `claude/player-stats-hud-c2-011CUt1gS2Nwc1RZXTfRNTTr` | C2 | Integrated | Delete |
| `claude/work-study-actions-a6-011CUtca5bDSXRJW9QsYWuBM` | A6 | Integrated | Delete |
| `claude/worker-2-economy-model-011CUsaR81pvsD5zZEVG4hXy` | B4 | Integrated | Delete |
| `claude/worker-2-map-system-011CUsekxjzZwexL3Fg4WXXd` | B6 | Integrated | Delete |
| `claude/worker-3-onboarding-011CUsbVerxPxZyBBAdjZDK2` | Setup | Integrated | Delete |
| `claude/analyze-project-depth-011CUsY6WRDBFh8EX9yDwqje` | Old coordinator | Superseded | Delete |

**Total: 20 branches to delete**

---

## Branching Workflow for Future Rounds

### Starting a New Round of Work

**Coordinator session:**

1. Verify current state
   ```bash
   git checkout claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ
   git pull origin claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ
   ```

2. Check for pending worker submissions
   ```bash
   git fetch --all
   git branch -r | grep -v "analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ" | grep -v master
   ```

3. Review TASKS_POOL.md for pending tasks

4. Assign tasks to workers (create instructions)

**Worker session:**

1. Worker creates branch with session ID
   ```bash
   # This happens automatically in AI sessions
   # Branch name: claude/[task-name]-[session-id]
   ```

2. Worker implements task, tests, commits

3. Worker pushes branch
   ```bash
   git push -u origin claude/[task-name]-[session-id]
   ```

4. Worker reports completion to coordinator

**After integration:**

1. Coordinator integrates worker code

2. Coordinator updates docs (TASKS_POOL.md, WORKER_STATUS.md)

3. Coordinator pushes development branch

4. **Coordinator or user deletes worker branch** (this was skipped!)

---

## Branch Naming Rules

### Mandatory Format

All branches MUST follow: `claude/[description]-[session-id]`

**Session ID format:** `011CU` followed by alphanumeric characters

**Why:** Git push restrictions enforce this pattern. Branches not matching cannot be pushed by AI sessions.

### Examples

✅ **Good:**
- `claude/implement-actions-011CUsT3jWbYUM7oTUxpQ5cQ`
- `claude/task-a5-movement-011CUt1dd54tWwxs8YogpRjF`
- `claude/round-8-coordinator-011CUxyzABCDEFGHIJKLMNOP`

❌ **Bad:**
- `feature/actions` (no session ID)
- `task-a5` (no claude prefix)
- `claude/actions` (no session ID)
- `master` (reserved)

---

## Best Practices

### For Coordinators

1. **After integrating worker code:**
   - Update TASKS_POOL.md
   - Update WORKER_STATUS.md
   - Commit changes
   - Push development branch
   - **Mark worker branch for deletion**

2. **Before starting new round:**
   - Clean up old worker branches
   - Verify development branch is clean
   - Check tests pass

3. **Document everything:**
   - Which branches are active
   - Which are integrated and need deletion
   - Any issues encountered

### For Workers

1. **Stay on your assigned branch**
2. **Don't switch branches unless instructed**
3. **Push when complete**
4. **Report completion clearly**

---

## Recovery Procedures

### If unsure which branch to use:

```bash
# List all local branches
git branch

# List all remote branches
git branch -r

# Check current branch
git branch --show-current

# If lost, return to development branch
git checkout claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ
```

### If branch name doesn't match session ID:

**Problem:** Worker created branch without proper session ID, can't push

**Solution:**
1. Don't panic
2. Ask coordinator for help
3. Coordinator may need to create proper branch and cherry-pick commits

### If accidentally pushed to wrong branch:

**Solution:**
1. Report immediately
2. Coordinator can revert or delete if needed
3. Don't try to fix yourself

---

## Summary Table

| Branch Type | Pattern | Lifespan | Who Pushes | When Delete |
|-------------|---------|----------|------------|-------------|
| Master | `master` | Permanent | Admin/User | Never |
| Development | `claude/[desc]-[sessionid]` | Long | Coordinator | When replaced |
| Worker Task | `claude/[task]-[sessionid]` | Short | Worker | After integration |

---

## Automated Cleanup Script (Future)

For future rounds, coordinator should run cleanup after each integration:

```bash
# List integrated branches
git branch -r | grep claude | grep -v "$(git branch --show-current)"

# Create cleanup list
# [Coordinator manually reviews which are integrated]

# Delete in bulk
git push origin --delete [branch1] [branch2] [branch3]...
```

This is currently a manual process requiring user/admin access.

---

**Next Step:** See `CLEANUP_WORKER_BRANCHES.md` for script to delete all 20 integrated worker branches.
