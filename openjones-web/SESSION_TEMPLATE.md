# Session Instruction Template

Use this template for all worker/coordinator/verifier sessions to ensure clear objectives and proper verification.

---

## Session Type: [WORKER | COORDINATOR | VERIFIER]

**Session ID:** `[auto-filled by system]`
**Branch:** `claude/[task-name]-[session-id]`
**Date:** `[YYYY-MM-DD]`

---

## 📋 Initial Instructions (What you MUST do)

### Primary Objective
[Single, clear statement of what this session must accomplish]

### Required Deliverables
1. [ ] Deliverable 1 - with specific acceptance criteria
2. [ ] Deliverable 2 - with specific acceptance criteria
3. [ ] Deliverable 3 - with specific acceptance criteria

**IMPORTANT:** Session is NOT complete until ALL deliverables are verified (see Completion Checklist below).

---

## 📂 Context & Setup

### 1. Verify Your Environment
```bash
# Check location
pwd  # Should output: /home/user/openjones/openjones-web

# Check branch
git branch  # Should show: claude/[task-name]-[session-id]

# Verify dependencies
npm list vite react vitest 2>&1 | head -10
```

**STOP if any of these don't match expectations.** Report the issue.

### 2. Read Required Files
- [ ] File 1: `/path/to/file1` - [why you need to read this]
- [ ] File 2: `/path/to/file2` - [why you need to read this]

**Verify these files exist BEFORE proceeding:**
```bash
ls -la [file1] [file2]
```

### 3. Understand the Codebase
[Specific areas to explore, with concrete commands]

```bash
# Example: List existing action classes
ls frontend/src/engine/actions/*.ts | grep -v test
```

---

## 🎯 Detailed Instructions

### Task 1: [Task Name]

**Objective:** [Clear, specific objective]

**Acceptance Criteria:**
- Criterion 1 (measurable)
- Criterion 2 (measurable)
- Criterion 3 (measurable)

**Implementation Steps:**
1. Step 1 - [concrete action]
2. Step 2 - [concrete action]
3. Step 3 - [concrete action]

**Verification:**
```bash
# How to verify this task is complete
npm test -- [specific-test-file]
# Expected: All tests pass
```

---

### Task 2: [Task Name]

[Repeat structure for each task]

---

## ✅ Completion Checklist

**Do NOT end the session until ALL items are verified:**

### Code Verification
- [ ] All required files created/modified (list them)
- [ ] Files exist at expected paths: `ls -la [paths]`
- [ ] No syntax errors: `npm run type-check`
- [ ] Code follows project patterns (import paths, naming conventions)

### Testing Verification
- [ ] Tests written for new functionality
- [ ] Tests pass: `npm test -- [test-files]`
- [ ] Test output shows: `X passing` (specify expected count)
- [ ] No console errors during test run

### Git Verification
- [ ] Changes staged: `git status` shows modified files
- [ ] Committed: `git log -1` shows your commit message
- [ ] Pushed: `git push -u origin [branch-name]` succeeded
- [ ] Verify on remote: `git ls-remote origin [branch-name]` returns commit hash

### Documentation Verification
- [ ] Updated TASKS_POOL.md (if applicable)
- [ ] Updated WORKER_STATUS.md (if applicable)
- [ ] Files saved: `git status` shows changes committed

### Final Verification Commands
```bash
# Run ALL these commands and verify output
git status  # Should show: "Your branch is up to date", "nothing to commit"
git log -1 --oneline  # Should show: your commit
npm test 2>&1 | tail -20  # Should show: passing tests
ls -la [list all deliverable files]  # Should show: files exist with recent timestamps
```

---

## 📊 Success Criteria

**Session is COMPLETE when:**
1. All items in Completion Checklist are checked ✓
2. All verification commands produce expected output
3. You can provide concrete evidence (command output) for each deliverable

**Session is NOT complete if:**
- Any checklist item failed
- Any verification command failed
- You're "pretty sure" but haven't verified
- Tests are "probably passing" but you didn't run them
- Files "should be" there but you didn't check

---

## 📝 Final Report Template

**Copy this template and fill it out before ending session:**

```markdown
## Session Complete - [Task Name]

**Branch:** claude/[task-name]-[session-id]
**Commit:** [commit hash from git log -1]

### Deliverables
1. ✅ [Deliverable 1] - Verified: [how you verified]
2. ✅ [Deliverable 2] - Verified: [how you verified]
3. ✅ [Deliverable 3] - Verified: [how you verified]

### Test Results
- Tests run: [number]
- Tests passed: [number]
- Command used: `npm test -- [args]`
- Output: [paste last 10 lines]

### Files Created/Modified
- File 1: [path] - [size/line count]
- File 2: [path] - [size/line count]

### Git Status
- Committed: ✅ [commit hash]
- Pushed: ✅ [verified with git ls-remote]
- Remote branch: [URL or path]

### Known Issues
[List any issues encountered and how they were resolved, or mark as N/A]

### Next Steps for Coordinator
[What should the coordinator do with this work?]
```

---

## 🚫 Common Mistakes to Avoid

1. **Assuming files exist** - Always verify with `ls` or `cat`
2. **Assuming tests pass** - Always run tests and check output
3. **Assuming git push worked** - Always verify with `git ls-remote`
4. **Marking tasks done without evidence** - Provide command output
5. **Hallucinating success** - If a command failed, report it

---

## 💡 Tips for Success

- When in doubt, verify with a command
- If a command fails, DON'T mark it as complete
- If you can't verify something, ask for help
- Better to under-promise and over-deliver
- Concrete evidence > assumptions

---

**Remember: The session ends when verification is complete, not when you think you're done.**
