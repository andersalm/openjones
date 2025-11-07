# Worker 2: Integration Wiring & Vercel Setup (I6)

**Session:** 6 - FINAL PUSH TO VERCEL DEPLOYMENT
**Task:** Wire all integration classes together and prepare for Vercel deployment
**Estimated Time:** 3-4 hours
**Branch:** `claude/vercel-integration-i6-[session-id]`

---

## Objective

Take the existing integration classes (GameController, RenderCoordinator, InputHandler) and wire them together in App.tsx, then prepare the project for deployment to Vercel.

---

## Task 1: Update App.tsx to Use Integration Classes

### Current State
- App.tsx likely uses the Game class directly
- No coordination between GameController, RenderCoordinator, InputHandler
- No canvas element for rendering

### What to Build

1. **Create Game Instance and Controllers**
   ```
   - Instantiate Game class
   - Create GameController instance
   - Create RenderCoordinator instance
   - Create InputHandler instance
   ```

2. **Wire Observer Pattern**
   - GameController should emit game state changes
   - RenderCoordinator should subscribe to GameController updates
   - RenderCoordinator should render to canvas on updates

3. **Add Canvas Element**
   - Add `<canvas id="gameCanvas"></canvas>` to App.tsx JSX
   - Get canvas reference in useEffect
   - Pass to RenderCoordinator for rendering

4. **Wire Input Handler**
   - Connect InputHandler to canvas element
   - Bind click/input events
   - Pass user input to GameController

5. **Start Game Loop**
   - Initialize game in useEffect
   - Start game controller loop
   - Clean up on unmount

### Implementation Approach
- Create `useGameIntegration()` custom hook (optional but cleaner)
- Or implement directly in App component useEffect
- Ensure proper initialization order: Game → Controllers → Event handlers

---

## Task 2: Create Vercel Configuration

### vercel.json
Create `/home/user/openjones/openjones-web/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "NODE_ENV": "production"
  },
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Update package.json (if needed)
- Verify `build` command is correct: `vite build`
- Verify `preview` command exists: `vite preview`
- Check Node version compatibility (should support Node 18+)

### Build Configuration Check
- Verify `vite.config.ts` has correct output settings
- Check base path is correct for root domain

---

## Task 3: Create Deployment Guide

### Create `/home/user/openjones/openjones-web/DEPLOY_TO_VERCEL.md`

Include:

1. **Prerequisites**
   - Node.js 18+ installed
   - npm or yarn installed
   - Vercel account created
   - Project pushed to GitHub

2. **Step-by-Step Deployment**
   - Connect GitHub repository to Vercel
   - Configure build settings
   - Deploy and verify

3. **Environment Setup**
   - Environment variables (if any)
   - API endpoints

4. **Post-Deployment Checks**
   - Visit deployed URL
   - Test game functionality
   - Check browser console for errors

5. **Troubleshooting Section**
   - Build failing? Check Node version, npm install
   - Game not rendering? Check canvas element, RenderCoordinator
   - Input not working? Verify InputHandler wiring
   - Common errors and solutions

6. **Rollback Instructions**
   - How to revert to previous deployment
   - Using Vercel dashboard

---

## Task 4: Test Integration

### Before Deployment

1. **Local Testing**
   ```bash
   npm install
   npm run build
   npm run preview
   ```

2. **Verify Each Component**
   - [ ] Game initializes without console errors
   - [ ] Canvas renders on page
   - [ ] Game loop is running (check console, check updates)
   - [ ] Can click on canvas
   - [ ] Game responds to input
   - [ ] Rendering updates on each frame

3. **Check for Runtime Errors**
   - Open browser DevTools (F12)
   - Look for any red errors in console
   - Test clicking game area - should respond
   - Verify no 404s or missing files

4. **Performance Check**
   - Game should run smoothly
   - No memory leaks
   - Rendering should be efficient

### Fix Any Integration Issues

If something doesn't work:
1. Check browser console for errors
2. Verify GameController.start() is called
3. Verify RenderCoordinator is subscribed to updates
4. Verify InputHandler is connected to canvas
5. Check that game loop is running (setInterval/requestAnimationFrame)

---

## Success Criteria

- [x] Game renders on canvas
- [x] Can click canvas to move or interact
- [x] Game loop runs and updates are visible
- [x] No console errors on load or interaction
- [x] `npm run build` succeeds
- [x] `npm run preview` shows working game
- [x] vercel.json configured correctly
- [x] DEPLOY_TO_VERCEL.md created with clear instructions
- [x] Ready for Vercel deployment

---

## Startup Commands

```bash
cd /home/user/openjones/openjones-web
git fetch origin claude/coordinator-verify-openjones-session-6-011CUuCQHprJA3z66hEdygJ2
git checkout claude/coordinator-verify-openjones-session-6-011CUuCQHprJA3z66hEdygJ2
npm install
git checkout -b claude/vercel-integration-i6-[YOUR-SESSION-ID]
```

## Development Workflow

1. **Implement wiring in App.tsx**
   - Test in `npm start` dev server
   - Verify each component works
   - Commit: "feat: wire integration classes in App.tsx"

2. **Create Vercel configuration**
   - Add vercel.json
   - Update package.json if needed
   - Test build: `npm run build`
   - Commit: "config: add Vercel configuration"

3. **Create deployment guide**
   - Write DEPLOY_TO_VERCEL.md
   - Include screenshots/commands
   - Commit: "docs: add Vercel deployment guide"

4. **Final testing**
   - Test preview build: `npm run preview`
   - Verify all features work
   - Commit: "test: verify integration and build"

5. **Create PR**
   - Push branch to origin
   - Create PR to main with summary of changes

## Notes

- Test on localhost first before Vercel deployment
- Keep error messages clear for debugging
- Use console.log() for debugging (remove before final PR)
- Ensure game is playable and responsive
- Check that no TypeScript errors from Worker 1 are reintroduced

---

**Return to Coordinator:** When app is ready and verified, create PR to main
