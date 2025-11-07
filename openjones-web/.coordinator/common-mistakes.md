# Common Mistakes & Solutions

**Version:** 1.0
**Last Updated:** 2025-11-07 (Session 1)
**Purpose:** Help future workers avoid known pitfalls

---

## 📚 How to Use This File

**For Workers:**
- Read this BEFORE starting implementation
- Reference specific sections when stuck
- Check if your issue is listed here

**For Coordinators:**
- Add new mistakes after each session
- Update prevention strategies
- Remove items that are no longer relevant

---

## Session 1 Observations (2025-11-07)

### ✅ What Went Well
1. **All 5 workers completed successfully** - Instructions were clear enough
2. **100% test pass rate** - Quality was excellent
3. **No import path issues** - Workers followed patterns correctly
4. **Workers were autonomous** - No clarification questions needed
5. **Test frameworks used correctly** - All used Vitest, not Jest

---

## 🚫 Mistakes to Avoid

### Mistake 1: Duplicate Task Assignment

**Session 1 Example:**
- Worker 1 implemented Task B5 (Possessions)
- Worker 3 ALSO implemented Task B5 (Possessions)
- Both implementations were good quality
- Result: Wasted effort, need to choose one

**Root Cause:** No task locking mechanism

**Solution:**
```bash
# Coordinators: Create lock files when assigning tasks
echo "worker-1" > .coordinator/tasks/assigned/task-b5.locked
echo "2025-11-07" >> .coordinator/tasks/assigned/task-b5.locked

# Workers: Check if task is locked before starting
if [ -f .coordinator/tasks/assigned/task-b5.locked ]; then
  echo "Task already assigned!"
  exit 1
fi
```

**Prevention:** Coordinator must lock tasks during assignment phase

---

### Mistake 2: Using Jest Instead of Vitest

**Problem:** This project uses Vitest, but Jest is more common

**Wrong:**
```typescript
import { jest } from '@jest/globals';

jest.fn();
jest.mock('./module');
```

**Correct:**
```typescript
import { vi } from 'vitest';

vi.fn();
vi.mock('./module');
```

**Prevention:**
- Worker instructions explicitly state "Use Vitest, NOT Jest"
- Examples show correct Vitest imports
- Template includes Vitest setup code

---

### Mistake 3: Incorrect Import Paths

**Problem:** Inconsistent use of path aliases

**Wrong:**
```typescript
import { IGame } from '../../../../shared/types/contracts';
import { mockGame } from '../../../shared/mocks';
```

**Correct:**
```typescript
import { IGame } from '@shared/types/contracts';
import { mockGame } from '@shared/mocks/actionMocks';
```

**Prevention:**
- Always use `@shared/` alias for shared code
- Check existing files for import patterns
- Use absolute imports, not relative

---

### Mistake 4: Not Verifying Files Exist Before Claiming Completion

**Problem:** Worker claims task is done but didn't verify

**Wrong Approach:**
```
"I've created the files and pushed them"
[Worker didn't actually check if files exist]
```

**Correct Approach:**
```bash
# Always verify with actual commands
ls -la frontend/src/engine/possessions/
npm run type-check
npm test -- possessions
git status
git ls-remote origin [branch-name]
```

**Prevention:**
- Worker instructions include verification checklist
- Require command output in final report
- Don't trust memory, verify everything

---

### Mistake 5: Instructions Too Long

**Session 1 Issue:** Worker instructions were 600+ lines

**Problem:** Overwhelming, hard to follow, easy to miss details

**Solution:** Reduce to 300-400 lines by:
- Removing redundant explanations
- Using more concise examples
- Focusing on "what" not "why"
- Linking to reference files instead of repeating content

**Target Structure:**
- Objective: 2-3 sentences
- Deliverables: Bulleted list
- Context: 5-10 lines
- Implementation: Step-by-step, no fluff
- Verification: Simple checklist
- Common mistakes: 3-5 key points

---

### Mistake 6: Not Following Existing Patterns

**Problem:** Worker creates new pattern instead of following existing

**Example:**
```typescript
// Wrong: New pattern
class MyClass {
  constructor(private _value: number) {}
  getValue() { return this._value; }
}

// Correct: Follow existing pattern
class MyClass {
  public readonly value: number;
  constructor(value: number) {
    this.value = value;
  }
}
```

**Prevention:**
- Instructions include "Study Existing Patterns" section
- Point to 2-3 reference files
- Show actual code examples from codebase

---

### Mistake 7: Not Including Enough Tests

**Problem:** Worker writes minimal tests to "pass the requirement"

**Session 1 Good Example:** Worker 1 wrote 119 tests (requested 20+)

**Best Practice:**
- Test happy path
- Test edge cases
- Test error conditions
- Test boundary values
- Test integration points

**Minimum Test Coverage:**
- Each public method: 2-3 tests
- Each class: 5+ tests
- Each component: 10+ tests

---

### Mistake 8: Leaving Debug Code

**Problem:** console.log, commented code, debug flags left in

**Wrong:**
```typescript
export class Game {
  processTurn() {
    console.log('DEBUG: Processing turn');  // ❌ Remove this
    // TODO: Fix this later  // ❌ Remove or implement
    const DEBUG = true;  // ❌ Remove debug flags
  }
}
```

**Prevention:**
- Run linter before committing
- Review code before pushing
- Worker checklist includes "No debug code"

---

### Mistake 9: Not Testing After Merge

**Coordinator Mistake:** Merge all workers then test once

**Problem:** If tests fail, hard to know which worker caused it

**Better Approach:**
```bash
# Test after each worker merge
git merge worker-1-branch
npm test  # Verify still passes
git merge worker-2-branch
npm test  # Verify still passes
```

**Prevention:**
- Coordinator instructions emphasize incremental testing
- Quality gate after each merge
- Rollback immediately if tests fail

---

### Mistake 10: Unclear Branch Names

**Problem:** Branch name doesn't indicate task

**Wrong:**
```bash
claude/implementation-011CUtqkCj8Sk7n5PXuje16S
claude/fix-stuff-011CUtqkCj8Sk7n5PXuje16S
```

**Correct:**
```bash
claude/possessions-system-b5-011CUtqkCj8Sk7n5PXuje16S
claude/housing-buildings-b11-011CUtqkCj8Sk7n5PXuje16S
```

**Pattern:** `claude/[task-name]-[task-id]-[session-id]`

**Prevention:**
- Worker instructions specify exact branch name pattern
- Include task ID in branch name
- Use descriptive, lowercase-with-hyphens

---

## 🎯 Best Practices (From Session 1)

### What Worked Excellently

1. **Comprehensive Examples**
   - Workers followed code examples precisely
   - Reduced guesswork
   - Consistent code style

2. **Clear Verification Steps**
   - Workers knew exactly when they were done
   - Prevented premature completion claims
   - Ensured quality

3. **Self-Contained Instructions**
   - Workers didn't need to ask questions
   - Everything needed was provided
   - References were clear

4. **Test-First Emphasis**
   - Workers wrote extensive tests
   - Quality was excellent
   - Coverage exceeded requirements

5. **Parallel Execution**
   - 5 workers completed simultaneously
   - Massive time savings
   - No coordination issues (except duplicates)

---

## 📊 Quality Patterns

### Green Flags ✅
- Worker asks for verification commands
- Worker reports exact test counts
- Worker includes commit hash in report
- Worker mentions "following existing patterns"
- Worker writes 2x+ requested tests
- Worker includes line counts for all files

### Red Flags 🚫
- Worker claims "should work" without testing
- Worker doesn't mention running tests
- Worker reports issues but no solutions
- Worker asks many clarification questions
- Worker changes task scope without asking
- Worker reports completion without verification

---

## 🔄 Continuous Improvement

**After each session:**
1. Review worker reports for issues
2. Identify recurring patterns
3. Add to this file
4. Update worker template
5. Update coordinator instructions

**Goal:** Each session should have fewer mistakes than the last

---

## 📝 Template for New Entries

```markdown
### Mistake N: [Brief Description]

**Session X Example:**
[What happened]

**Problem:** [Why it's bad]

**Wrong:**
[Code example or approach]

**Correct:**
[Code example or approach]

**Prevention:**
[How to avoid in future]
```

---

**Last Updated:** 2025-11-07 after Session 1
**Next Update:** After Session 2
**Mistakes Documented:** 10
**Best Practices:** 5
