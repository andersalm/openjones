# Worker 4: Task B8 - Education & Finance Buildings (Verification & Enhancement)

**Session Type:** WORKER
**Branch:** `claude/education-finance-b8-[YOUR-SESSION-ID]`
**Date:** 2025-11-07
**Session:** 3

---

## ⚠️ IMPORTANT: Verification First!

**Task B8 lists College and Bank as deliverables, but these files already exist from Task B7 (completed earlier). Your first step is to verify whether this task is actually complete or if enhancements are needed.**

---

## 🎯 Primary Objective

**Option A:** If College and Bank are complete → Verify, document, and report completion
**Option B:** If enhancements needed → Implement missing features and update tests

---

## 📦 Initial Verification Steps

```bash
cd /home/user/openjones/openjones-web
git checkout -b claude/education-finance-b8-[YOUR-SESSION-ID]

# Step 1: Check if files exist
ls -la frontend/src/engine/buildings/College.ts
ls -la frontend/src/engine/buildings/Bank.ts
ls -la frontend/src/engine/buildings/College.test.ts
ls -la frontend/src/engine/buildings/Bank.test.ts

# Step 2: Check file sizes and test counts
wc -l frontend/src/engine/buildings/College.* frontend/src/engine/buildings/Bank.*

# Step 3: Review Task B8 requirements vs implementation
cat TASKS_POOL.md | grep -A 20 "Task B8"

# Step 4: Run existing tests
npm test -- College
npm test -- Bank
```

---

## 🔍 Verification Checklist

Compare TASKS_POOL.md Task B8 requirements with existing implementation:

### College Building Requirements

From TASKS_POOL.md:
- [ ] Study actions (various hours) - **Check implementation**
- [ ] Education gain rates - **Verify correct values**
- [ ] Costs for studying - **Verify pricing**
- [ ] Unit tests - **Check coverage**

**Verification commands:**
```bash
# Check College implementation
cat frontend/src/engine/buildings/College.ts | grep -A 5 "study"
cat frontend/src/engine/buildings/College.ts | grep -A 3 "STUDY"

# Check test coverage
npm test -- College 2>&1 | grep -E "Tests|PASS"
```

### Bank Building Requirements

From TASKS_POOL.md:
- [ ] Stock market interactions - **Check implementation**
- [ ] Buy/sell stocks - **Verify actions exist**
- [ ] Account management - **Check features**
- [ ] Unit tests - **Check coverage**

**Verification commands:**
```bash
# Check Bank implementation
cat frontend/src/engine/buildings/Bank.ts | grep -A 5 "stock"
cat frontend/src/engine/buildings/Bank.ts | grep -A 5 "buy\|sell"

# Check test coverage
npm test -- Bank 2>&1 | grep -E "Tests|PASS"
```

---

## 📋 Decision Point

After verification, choose your path:

### Path A: Task is Complete ✅

If College and Bank fully implement Task B8 requirements:

1. **Document the completion:**
   - Verify all requirements met
   - Run all tests (must pass)
   - Check type-check passes
   - Document findings

2. **Create completion report:**
   ```bash
   cat > .coordinator/rounds/round-03/worker-4-report.md <<'EOF'
   # Worker 4 Report: Task B8 - Education & Finance Buildings

   **Status:** ✅ ALREADY COMPLETE (from Task B7)
   **Branch:** claude/education-finance-b8-[YOUR-SESSION-ID]
   **Commit:** [paste: git log -1 --format=%h]

   ## Verification Results

   ### College Building
   ✅ File exists: College.ts (297 lines)
   ✅ Tests exist: College.test.ts (496 lines)
   ✅ Study actions implemented
   ✅ Education gain rates correct
   ✅ Costs configured
   ✅ All tests passing (XX tests)

   **Features verified:**
   - Study action (20 time units, $15 cost, +1 education)
   - Job offerings (Janitor, Teacher, Professor)
   - Proper inheritance from Building base class
   - Comprehensive test coverage

   ### Bank Building
   ✅ File exists: Bank.ts (256 lines)
   ✅ Tests exist: Bank.test.ts (527 lines)
   ✅ Stock market interactions implemented
   ✅ Buy/sell actions exist
   ✅ Account management features
   ✅ All tests passing (XX tests)

   **Features verified:**
   - Buy stock action
   - Sell stock action
   - Stock price tracking
   - Portfolio management
   - Comprehensive test coverage

   ## Test Results
   - College tests: XX passing
   - Bank tests: XX passing
   - Total: XX tests, 100% pass rate

   ## Type Check
   - Status: ✅ PASSED (or note pre-existing errors)

   ## Recommendation
   Task B8 is COMPLETE. No additional work needed. Files were implemented
   in Task B7 and fully satisfy Task B8 requirements. TASKS_POOL.md should
   be updated to mark B8 as complete.

   ## Issues Encountered
   None - Task was already complete from previous session.
   EOF

   git add .coordinator/rounds/round-03/worker-4-report.md
   git commit -m "docs: Task B8 verification - already complete from B7"
   git push -u origin claude/education-finance-b8-[YOUR-SESSION-ID]
   ```

3. **Stop here** - No code changes needed!

---

### Path B: Enhancements Needed 🔧

If College and/or Bank are missing features:

1. **Identify gaps:**
   - List missing features from Task B8
   - Check test coverage gaps
   - Review code quality issues

2. **Implement missing features:**
   - Add missing study action variations
   - Add missing stock market features
   - Enhance test coverage
   - Fix any bugs

3. **Example enhancements if needed:**

```typescript
// College.ts - If study variations missing
private static readonly STUDY_OPTIONS = {
  SHORT: { duration: 10, cost: 10, educationGain: 0.5 },
  NORMAL: { duration: 20, cost: 15, educationGain: 1 },
  LONG: { duration: 40, cost: 25, educationGain: 2.5 },
};

// Bank.ts - If additional features needed
buyStock(stockSymbol: string, shares: number): IActionResponse {
  // Enhanced buy implementation
}

sellStock(stockSymbol: string, shares: number): IActionResponse {
  // Enhanced sell implementation
}

getPortfolio(): StockHolding[] {
  // Portfolio management
}
```

4. **Add tests for enhancements:**
```typescript
// Additional test cases
describe('College - Enhanced Study Options', () => {
  it('should support short study sessions', () => {
    // Test short study
  });

  it('should support long study sessions', () => {
    // Test long study
  });
});

describe('Bank - Portfolio Management', () => {
  it('should track multiple stock holdings', () => {
    // Test portfolio
  });
});
```

5. **Create enhancement report:**
```bash
cat > .coordinator/rounds/round-03/worker-4-report.md <<'EOF'
# Worker 4 Report: Task B8 - Education & Finance Buildings

**Status:** ✅ ENHANCED
**Branch:** claude/education-finance-b8-[YOUR-SESSION-ID]
**Commit:** [paste: git log -1 --format=%h]

## Enhancements Made

### College Building
- [List enhancements made]
- Added XX new tests
- Total: XXX lines, XX tests

### Bank Building
- [List enhancements made]
- Added XX new tests
- Total: XXX lines, XX tests

## Test Results
[Paste test output]

## Type Check
- Status: ✅ PASSED

## Files Modified
[Paste: git diff --stat]

## Issues Encountered
[Describe any issues and resolutions]
EOF

git add .
git commit -m "feat(buildings): Enhance College and Bank for Task B8"
git push
```

---

## 🧪 Testing Requirements

- **Framework:** Vitest (NOT Jest)
- **Minimum:** Verify existing tests pass (should be 80+ total)
- **If enhancing:** Add 10+ tests per enhancement

---

## 📚 Reference Code

**Existing implementations:**
```bash
# Review College implementation
cat frontend/src/engine/buildings/College.ts

# Review Bank implementation
cat frontend/src/engine/buildings/Bank.ts

# Review existing tests
cat frontend/src/engine/buildings/College.test.ts | head -100
cat frontend/src/engine/buildings/Bank.test.ts | head -100

# Check other buildings for patterns
ls -la frontend/src/engine/buildings/
cat frontend/src/engine/buildings/Factory.ts | head -80
```

**Key interfaces:**
```typescript
// From shared/types/contracts.ts
interface IBuilding {
  id: string;
  type: BuildingType;
  name: string;
  description: string;
  position: IPosition;
  getAvailableActions(player: IPlayerState, game: IGame): IAction[];
  getJobOfferings(): IJob[];
  getActionTree(player: IPlayerState, game: IGame): IActionTreeNode | null;
  canEnter(player: IPlayerState, game: IGame): boolean;
  isHome(): boolean;
}
```

---

## 🚫 Common Mistakes to Avoid

1. **Assuming task incomplete without verification** - CHECK FIRST!
2. **Modifying working code unnecessarily** - Only enhance if truly needed
3. **Breaking existing tests** - All tests must still pass
4. **Not documenting findings** - Report is CRITICAL
5. **Creating duplicate work** - If complete, just verify and report

---

## ✅ Final Verification Commands

```bash
# Run before reporting
npm run type-check 2>&1 | tail -30
npm test -- College 2>&1 | tail -30
npm test -- Bank 2>&1 | tail -30
git status
git log -1 --oneline
```

---

## 📝 Summary

**Your job:** Determine if Task B8 is already complete or needs work, then either:
- **Path A:** Verify and report completion ✅
- **Path B:** Implement enhancements and test 🔧

**Most likely outcome:** Path A (task already complete from B7)

---

**Instructions generated:** 2025-11-07
**Session:** 3
**Good luck!** 🚀
