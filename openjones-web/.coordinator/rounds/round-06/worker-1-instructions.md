# Worker 1: TypeScript Build Fixes (I5)

**Session:** 6 - FINAL PUSH TO VERCEL DEPLOYMENT
**Task:** Fix TypeScript errors blocking the build
**Estimated Time:** 2-3 hours
**Branch:** `claude/ts-build-fixes-i5-[session-id]`

---

## Priority

**FIX ONLY errors that prevent `npm run build` from succeeding.**

Skip test-only errors and non-critical warnings. Focus on making the production build pass.

---

## Critical Build-Blocking Errors to Fix

### 1. WorkAction.ts - IJob Interface Mismatches
- Check `src/types/WorkAction.ts` for IJob interface definition
- Find all usages that don't match the interface signature
- Update class implementations to match interface contracts

### 2. Game.ts - Possession Errors
- `addPossession()` and `removePossession()` method definitions/calls
- Check method signatures in Game.ts
- Verify all callers match the signature
- Fix type mismatches in possession data structure

### 3. MockGameStore.ts - Import Error
- Locate import statement causing the error
- Verify the correct path/export
- Fix relative imports if necessary

### 4. actionMocks.ts - Type Errors
- Check action mock object shapes
- Ensure they match action interface contracts
- Fix any missing or mistyped properties

### 5. InputHandler.test.ts - IPosition Mismatches
- Find IPosition interface definition
- Update test mocks to match interface
- Fix any position-related type errors

### 6. App.tsx - Button Variant Error
- Locate Button component usage
- Check available variant prop values
- Fix invalid variant value

### 7. Other Critical Errors
- Run `npm run build` and scan output for errors
- Fix any other build-blocking issues
- Ignore warnings for now

---

## What to SKIP

- Test file errors that don't block the production build
- Unused variable warnings (TS6133)
- Test-specific type definition errors in `.test.tsx` files
- ESLint warnings that don't affect compilation

---

## Success Criteria

- [x] `npm run build` succeeds without errors
- [x] `dist/` folder is created
- [x] App loads in browser (basic functionality check)

---

## Startup Commands

```bash
cd /home/user/openjones/openjones-web
git fetch origin claude/coordinator-verify-openjones-session-6-011CUuCQHprJA3z66hEdygJ2
git checkout claude/coordinator-verify-openjones-session-6-011CUuCQHprJA3z66hEdygJ2
npm install
git checkout -b claude/ts-build-fixes-i5-[YOUR-SESSION-ID]
```

## Verification Steps

1. **Run the build:**
   ```bash
   npm run build
   ```

2. **Check for errors:**
   - No TypeScript errors in console
   - No build failures
   - dist/ folder exists and has content

3. **Quick browser test (optional):**
   ```bash
   npm start
   ```
   - App renders without console errors

## Notes

- Focus on compilation errors, not linting
- Consult git history if unclear about intended types
- Check interfaces in `src/types/` for reference
- Commit frequently with clear messages like "fix: resolve WorkAction interface in [filename]"

---

**Return to Coordinator:** When build succeeds, create PR to main with results
