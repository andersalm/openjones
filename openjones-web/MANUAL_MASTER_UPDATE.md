# Manual Master Branch Update - Step by Step

**Current verified state:**
- Development branch: `claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ` at commit `1cc2902`
- Remote master: at commit `003eb02` (OLD - needs update)
- All 16 completed tasks are on development branch, NOT on master

---

## Step-by-Step Instructions to Update Master

### Step 1: Verify Starting State

```bash
cd /home/user/openjones/openjones-web

# Check you're in the right place
pwd
# Expected output: /home/user/openjones/openjones-web

# Check current branch
git branch --show-current
# Expected output: claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ

# Verify development branch is clean and up to date
git status
# Expected output: "nothing to commit, working tree clean"

# Note the latest commit hash on development branch
git log --oneline -1
# Expected output: 1cc2902 docs: Add git restrictions documentation and session template
```

**STOP if any output doesn't match.** Report what you see.

---

### Step 2: Fetch Latest from Remote

```bash
# Fetch all latest changes
git fetch --all

# Verify remote master state
git log origin/master --oneline -1
# Expected output: 003eb02 Update README.md

# Verify remote development branch state
git log origin/claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ --oneline -1
# Expected output: 1cc2902 docs: Add git restrictions documentation and session template
```

---

### Step 3: Switch to Master Branch

```bash
# Switch to master branch
git checkout master

# Verify you're on master
git branch --show-current
# Expected output: master

# Check master's current commit
git log --oneline -1
# Output will show master's current state (might be ahead or behind origin/master)
```

---

### Step 4: Update Master with Development Branch Content

**Option A: Merge (preserves all commit history)**

```bash
# Merge development branch into master
git merge claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ --no-ff -m "Merge Phase 1 work: 16 tasks complete - Core engine and UI foundation"

# Verify merge succeeded
git log --oneline -1
# Should show the merge commit

# Check that all files are present
ls -la openjones-web/frontend/src/engine/actions/*.ts | wc -l
# Should show multiple action files
```

**Option B: Reset (makes master identical to development branch, simpler history)**

```bash
# Make master exactly match development branch
git reset --hard claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ

# Verify reset succeeded
git log --oneline -1
# Expected output: 1cc2902 docs: Add git restrictions documentation and session template
```

**Which to choose:**
- Use Option A (merge) if you want to preserve commit history
- Use Option B (reset) if you want master to be exactly like development branch

---

### Step 5: Verify Master is Updated Correctly

```bash
# Check files exist that should be there
ls -la NEW_SESSION_START.md SESSION_TEMPLATE.md GIT_STATUS_AND_RESTRICTIONS.md
# All three should exist

# Check a key directory
ls frontend/src/engine/actions/*.ts | head -10
# Should show action implementation files

# Verify commit hash matches
git log --oneline -1
# Should show commit 1cc2902 (if using Option B) or merge commit (if using Option A)

# Check git status
git status
# Expected: "Your branch is ahead of 'origin/master' by X commits"
```

---

### Step 6: Push Master to Remote

```bash
# Push updated master to remote
git push origin master

# Verify push succeeded
git status
# Expected: "Your branch is up to date with 'origin/master'"

# Double-check remote master
git log origin/master --oneline -1
# Should now show 1cc2902 or the merge commit
```

---

### Step 7: Verify Everything is Correct

```bash
# Fetch to ensure remote state
git fetch origin master

# Compare local and remote master
git log master --oneline -1
git log origin/master --oneline -1
# Both should show the same commit

# Check files on remote (via fetch)
git ls-tree --name-only origin/master | grep SESSION
# Should show: SESSION_HANDOFF.md, SESSION_TEMPLATE.md
```

---

### Step 8: Switch Back to Development Branch (Optional)

```bash
# Go back to development branch
git checkout claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ

# Verify
git branch --show-current
# Expected: claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] Master branch exists locally: `git branch | grep master`
- [ ] Master has latest commit: `git log master --oneline -1` shows `1cc2902` or merge commit
- [ ] Master pushed to remote: `git log origin/master --online -1` matches local master
- [ ] Key files exist on master: `git ls-tree origin/master | grep SESSION`
- [ ] No errors during push: Review output from Step 6
- [ ] Currently on correct branch: `git branch --show-current`

---

## If Something Goes Wrong

### If merge/reset fails:
```bash
# Abort and start over
git merge --abort  # if merge failed
git reset --hard origin/master  # reset to remote state

# Return to development branch
git checkout claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ
```

### If push fails:
```bash
# Check error message carefully
# If it says "rejected", you may need to force push (BE CAREFUL)
git push origin master --force-with-lease

# Only use --force-with-lease if you're sure master should match development branch
```

### If you get lost:
```bash
# Check where you are
git branch --show-current
git log --oneline -3

# Return to known good state
git checkout claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ
```

---

## Expected Final State

After successful completion:

```
Remote branches:
- origin/master: at commit 1cc2902 (or merge commit)
- origin/claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ: at commit 1cc2902

Local branches:
- master: matches origin/master
- claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ: unchanged
```

Both master and development branch should have the same content (all 16 tasks, all documentation).

---

## Questions Before You Start?

If anything is unclear or unexpected, STOP and ask:
- What output did you get that doesn't match?
- What error message appeared?
- Which step are you on?

**Don't proceed if verification steps fail - report the discrepancy first.**
