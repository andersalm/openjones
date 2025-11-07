# Worker Branch Cleanup - Delete Integrated Branches

**Purpose:** Delete 20 worker branches that have been integrated into development branch
**Status:** All listed branches have been integrated and are no longer needed
**Date:** 2025-11-07

---

## Branches to Delete

All of these branches have been integrated into `claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ`:

```
claude/action-menu-c4-011CUteUj9FPQGPBVDr9Z2nm
claude/add-action-classes-011CUtci3t1D5fFrJQfi2jyq
claude/analyze-project-depth-011CUsY6WRDBFh8EX9yDwqje
claude/base-action-classes-011CUshDBLVPrkCGtyRfsBVn
claude/building-base-class-011CUsfmHHLGcdx9kBCD364a
claude/core-buildings-b7-011CUshDoGipdu6CKS3oXGwv
claude/design-system-setup-011CUshG1NnwgpMuSdJen8H1
claude/economic-actions-a7-011CUteMhmhUXQvGd4vcmZfN
claude/employment-agency-b8-011CUteQn2mbqNGsR9vmxzGr
claude/game-state-management-011CUseioTqBNh22GNZBT1ET
claude/game-state-management-011CUsfjfdwjxWvtcNZyeUjK
claude/implement-job-system-011CUsenJAa4pJpToSH7H3dW
claude/implement-measures-system-011CUsfk9dfsiZyTzGhrL3k1
claude/movement-actions-a5-011CUt1dd54tWwxs8YogpRjF
claude/movement-actions-a5-011CUt1frw4KVgbYbVGZ9k2W
claude/player-stats-hud-c2-011CUt1gS2Nwc1RZXTfRNTTr
claude/work-study-actions-a6-011CUtca5bDSXRJW9QsYWuBM
claude/worker-2-economy-model-011CUsaR81pvsD5zZEVG4hXy
claude/worker-2-map-system-011CUsekxjzZwexL3Fg4WXXd
claude/worker-3-onboarding-011CUsbVerxPxZyBBAdjZDK2
```

**Total: 20 branches**

---

## Pre-Deletion Verification

**Before deleting, verify these branches exist:**

```bash
cd /home/user/openjones/openjones-web

# List all remote claude branches
git fetch --all
git branch -r | grep claude

# Count how many
git branch -r | grep claude | wc -l
# Should show: 21 (20 to delete + 1 active development branch)
```

---

## Option 1: Delete All at Once (Recommended)

**Copy and paste this entire command:**

```bash
cd /home/user/openjones/openjones-web && \
git push origin --delete \
  claude/action-menu-c4-011CUteUj9FPQGPBVDr9Z2nm \
  claude/add-action-classes-011CUtci3t1D5fFrJQfi2jyq \
  claude/analyze-project-depth-011CUsY6WRDBFh8EX9yDwqje \
  claude/base-action-classes-011CUshDBLVPrkCGtyRfsBVn \
  claude/building-base-class-011CUsfmHHLGcdx9kBCD364a \
  claude/core-buildings-b7-011CUshDoGipdu6CKS3oXGwv \
  claude/design-system-setup-011CUshG1NnwgpMuSdJen8H1 \
  claude/economic-actions-a7-011CUteMhmhUXQvGd4vcmZfN \
  claude/employment-agency-b8-011CUteQn2mbqNGsR9vmxzGr \
  claude/game-state-management-011CUseioTqBNh22GNZBT1ET \
  claude/game-state-management-011CUsfjfdwjxWvtcNZyeUjK \
  claude/implement-job-system-011CUsenJAa4pJpToSH7H3dW \
  claude/implement-measures-system-011CUsfk9dfsiZyTzGhrL3k1 \
  claude/movement-actions-a5-011CUt1dd54tWwxs8YogpRjF \
  claude/movement-actions-a5-011CUt1frw4KVgbYbVGZ9k2W \
  claude/player-stats-hud-c2-011CUt1gS2Nwc1RZXTfRNTTr \
  claude/work-study-actions-a6-011CUtca5bDSXRJW9QsYWuBM \
  claude/worker-2-economy-model-011CUsaR81pvsD5zZEVG4hXy \
  claude/worker-2-map-system-011CUsekxjzZwexL3Fg4WXXd \
  claude/worker-3-onboarding-011CUsbVerxPxZyBBAdjZDK2
```

**Expected output:**
```
To http://...
 - [deleted]         claude/action-menu-c4-011CUteUj9FPQGPBVDr9Z2nm
 - [deleted]         claude/add-action-classes-011CUtci3t1D5fFrJQfi2jyq
 ...
 - [deleted]         claude/worker-3-onboarding-011CUsbVerxPxZyBBAdjZDK2
```

---

## Option 2: Delete One by One (Safer, Slower)

If you want to verify each deletion:

```bash
cd /home/user/openjones/openjones-web

# Delete first branch
git push origin --delete claude/action-menu-c4-011CUteUj9FPQGPBVDr9Z2nm

# Verify it's gone
git ls-remote origin | grep action-menu-c4
# Should return nothing

# Repeat for each branch...
```

---

## Option 3: Automated Script with Verification

**Save this as `cleanup.sh`:**

```bash
#!/bin/bash

cd /home/user/openjones/openjones-web || exit 1

# List of branches to delete
BRANCHES=(
  "claude/action-menu-c4-011CUteUj9FPQGPBVDr9Z2nm"
  "claude/add-action-classes-011CUtci3t1D5fFrJQfi2jyq"
  "claude/analyze-project-depth-011CUsY6WRDBFh8EX9yDwqje"
  "claude/base-action-classes-011CUshDBLVPrkCGtyRfsBVn"
  "claude/building-base-class-011CUsfmHHLGcdx9kBCD364a"
  "claude/core-buildings-b7-011CUshDoGipdu6CKS3oXGwv"
  "claude/design-system-setup-011CUshG1NnwgpMuSdJen8H1"
  "claude/economic-actions-a7-011CUteMhmhUXQvGd4vcmZfN"
  "claude/employment-agency-b8-011CUteQn2mbqNGsR9vmxzGr"
  "claude/game-state-management-011CUseioTqBNh22GNZBT1ET"
  "claude/game-state-management-011CUsfjfdwjxWvtcNZyeUjK"
  "claude/implement-job-system-011CUsenJAa4pJpToSH7H3dW"
  "claude/implement-measures-system-011CUsfk9dfsiZyTzGhrL3k1"
  "claude/movement-actions-a5-011CUt1dd54tWwxs8YogpRjF"
  "claude/movement-actions-a5-011CUt1frw4KVgbYbVGZ9k2W"
  "claude/player-stats-hud-c2-011CUt1gS2Nwc1RZXTfRNTTr"
  "claude/work-study-actions-a6-011CUtca5bDSXRJW9QsYWuBM"
  "claude/worker-2-economy-model-011CUsaR81pvsD5zZEVG4hXy"
  "claude/worker-2-map-system-011CUsekxjzZwexL3Fg4WXXd"
  "claude/worker-3-onboarding-011CUsbVerxPxZyBBAdjZDK2"
)

echo "=== Starting Worker Branch Cleanup ==="
echo "Total branches to delete: ${#BRANCHES[@]}"
echo ""

DELETED=0
FAILED=0

for branch in "${BRANCHES[@]}"; do
  echo "Deleting: $branch"
  if git push origin --delete "$branch" 2>&1; then
    echo "  ✓ Deleted successfully"
    ((DELETED++))
  else
    echo "  ✗ Failed to delete"
    ((FAILED++))
  fi
  echo ""
done

echo "=== Cleanup Complete ==="
echo "Deleted: $DELETED"
echo "Failed: $FAILED"
echo ""

# Verify remaining claude branches
echo "Remaining claude branches:"
git branch -r | grep claude
echo ""
echo "Expected: Only claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ should remain"
```

**To use:**
```bash
chmod +x cleanup.sh
./cleanup.sh
```

---

## Post-Deletion Verification

**After deleting, verify cleanup was successful:**

```bash
# Fetch latest remote state
git fetch --prune

# List remaining claude branches
git branch -r | grep claude

# Expected output: Only 1 branch should remain:
# origin/claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ

# Count remaining branches
git branch -r | grep claude | wc -l
# Expected: 1

# Verify no worker branches remain
git branch -r | grep claude | grep -v "analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ"
# Expected: No output
```

---

## Clean Up Local Tracking Branches (Optional)

After deleting remote branches, clean up local references:

```bash
# Remove stale remote-tracking references
git fetch --prune

# List local branches (shouldn't have worker branches, but check)
git branch -a

# If any local worker branches exist, delete them
git branch -d [branch-name]

# If branch has unmerged changes and you're SURE you want to delete
git branch -D [branch-name]
```

---

## Verification Checklist

After cleanup, verify:

- [ ] Ran deletion command (Option 1, 2, or 3)
- [ ] Saw "deleted" messages for each branch
- [ ] No error messages appeared
- [ ] `git branch -r | grep claude | wc -l` returns `1`
- [ ] Only `analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ` remains
- [ ] Ran `git fetch --prune` to clean local refs
- [ ] Development branch still exists and works: `git checkout claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ`

---

## If Something Goes Wrong

### If deletion fails with 403 error:

**This should NOT happen** if you have admin access. If it does:
1. Check you're using the correct git credentials
2. Verify you have admin/push access to the repository
3. Try deleting a single branch to test

### If you accidentally delete the wrong branch:

**Prevention:** The command above explicitly lists each branch name, so accidental deletion is unlikely.

**Recovery:** If the development branch was accidentally deleted:
1. Don't panic - it's still in local repository
2. Push it again: `git push -u origin claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ`

### If unsure about a specific branch:

**Before deleting, check what's in it:**
```bash
# Fetch the branch
git fetch origin claude/[branch-name]

# Check its latest commit
git log origin/claude/[branch-name] --oneline -5

# Check what files it modified
git diff origin/master...origin/claude/[branch-name] --name-only
```

---

## Expected Final State

After successful cleanup:

**Remote branches:**
```
origin/master
origin/claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ
```

**Total remote branches:** 2

**All worker branches deleted:** 20

---

## Questions?

If anything is unclear:
- Which option should I use? → **Option 1 (all at once) is recommended**
- What if a branch is missing from the list? → That's fine, it may have been deleted already
- What if I see extra branches? → Report which ones, and we'll verify if they should be deleted
- Can I undo this? → No, but all code is integrated into development branch, so nothing is lost

**Do not proceed if:**
- You're unsure which branch is the development branch
- You see unexpected branches you don't recognize
- The development branch doesn't exist
- You're not confident in the command

**Ask first if uncertain!**
