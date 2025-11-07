# Worker {{WORKER_ID}}: Task {{TASK_ID}} - {{TASK_NAME}}

**Session Type:** WORKER
**Branch:** `claude/{{BRANCH_NAME}}-[YOUR-SESSION-ID]`
**Date:** {{DATE}}

---

## 🎯 Primary Objective

{{TASK_OBJECTIVE}}

---

## 📦 Deliverables

{{DELIVERABLES_CHECKLIST}}

---

## 🚀 Quick Start

```bash
cd /home/user/openjones/openjones-web
git branch --show-current  # Verify session ID
{{SETUP_COMMANDS}}
```

---

## 📚 Context

{{CONTEXT_DESCRIPTION}}

**Existing patterns to follow:**
```bash
{{REFERENCE_FILES}}
```

**Key interfaces:**
```typescript
{{KEY_INTERFACES}}
```

---

## ✅ Implementation Steps

{{STEP_BY_STEP_INSTRUCTIONS}}

---

## 🧪 Testing Requirements

- **Framework:** Vitest (NOT Jest)
- **Minimum Tests:** {{MIN_TESTS}}+
- **Coverage:** All public methods, edge cases, error conditions

**Test template:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { {{CLASS_NAME}} } from './{{FILE_NAME}}';

describe('{{CLASS_NAME}}', () => {
  it('should {{test_description}}', () => {
    // Arrange

    // Act

    // Assert
    expect().toBe();
  });
});
```

---

## 🔍 Verification Checklist

**Before claiming completion, verify ALL of these:**

### Code
- [ ] All files created: `ls -la {{FILE_PATHS}}`
- [ ] No syntax errors: `npm run type-check`
- [ ] Follows existing patterns (checked reference files)
- [ ] Uses correct imports: `@shared/types/contracts`
- [ ] No debug code (console.log, TODOs)

### Tests
- [ ] Tests written: `ls -la {{TEST_PATHS}}`
- [ ] Tests pass: `npm test -- {{TEST_PATTERN}}`
- [ ] Test count: {{MIN_TESTS}}+ (you should exceed this)
- [ ] No test errors or warnings

### Git
- [ ] Changes staged: `git status`
- [ ] Committed: `git log -1 --oneline`
- [ ] Pushed: `git push -u origin {{BRANCH_NAME}}`
- [ ] Verified: `git ls-remote origin {{BRANCH_NAME}}`

### Final Commands
```bash
# Run ALL these commands and paste output in your report
npm run type-check
npm test -- {{TEST_PATTERN}} 2>&1 | tail -20
ls -la {{FILE_PATHS}}
git log -1 --oneline
```

---

## 🚫 Common Mistakes to Avoid

1. **Using Jest instead of Vitest** - Import from 'vitest', not 'jest'
2. **Wrong import paths** - Always use `@shared/` alias
3. **Not verifying files exist** - Run ls commands, don't trust memory
4. **Claiming done without testing** - All tests must pass
5. **Debug code left in** - Remove console.logs, TODOs, debug flags

**Read full list:** `.coordinator/common-mistakes.md` (if you have access)

---

## 📝 Final Report (REQUIRED)

**When complete, write this report to a file so the coordinator can read it:**

```bash
# Create your completion report file
cat > .coordinator/rounds/round-{{ROUND_NUMBER}}/worker-{{WORKER_ID}}-report.md <<'EOF'
# Worker {{WORKER_ID}} Report: Task {{TASK_ID}}

**Branch:** claude/{{BRANCH_NAME}}-[actual-session-id]
**Commit:** [paste: git log -1 --format=%h]

## Deliverables
✅ {{FILE_1}} (XX lines, YY tests)
✅ {{FILE_2}} (XX lines, YY tests)
[List all files with actual line counts]

## Test Results
- Tests run: XX
- Tests passed: XX (100%)
- Command: `npm test -- {{TEST_PATTERN}}`
- Output: [paste last 10 lines]

## Type Check
- Status: ✅ PASSED
- Command: `npm run type-check`

## Files Verified
[Paste output of: ls -la {{FILE_PATHS}}]

## Issues Encountered
[None, or describe issues and resolutions]

## Notes
[Any important information for integration]
EOF

# Commit and push your report
git add .coordinator/rounds/round-{{ROUND_NUMBER}}/worker-{{WORKER_ID}}-report.md
git commit -m "docs: Add Worker {{WORKER_ID}} completion report for Task {{TASK_ID}}"
git push
```

**The coordinator will read this file from your branch - no need to copy/paste!**

---

## 💡 Tips for Success

- **Follow existing patterns** - Don't invent new styles
- **Write more tests than required** - Quality over minimum
- **Verify everything** - Don't trust memory, run commands
- **Ask if unclear** - Better to ask than guess wrong
- **Keep it simple** - Don't over-engineer

---

## 📚 Reference

**Contracts:** `shared/types/contracts.ts`
**Mocks:** `shared/mocks/`
**Existing Code:** `{{REFERENCE_DIRECTORIES}}`

---

**Instructions generated:** {{DATE}}
**Session:** {{SESSION_NUMBER}}
**Good luck!** 🚀
