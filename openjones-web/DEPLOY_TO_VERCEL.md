# Deploying OpenJones to Vercel

This guide will walk you through deploying the OpenJones browser game to Vercel.

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** installed on your machine
- **npm** or **yarn** package manager
- **Git** installed and repository pushed to GitHub
- **Vercel account** (free tier works fine) - [Sign up here](https://vercel.com/signup)
- **GitHub account** with this repository accessible

## Step 1: Prepare Your Project

### 1.1 Install Dependencies

```bash
cd /path/to/openjones-web
npm install
```

### 1.2 Test Build Locally

Before deploying, verify that your project builds successfully:

```bash
npm run build
```

This should create a `dist` folder with your compiled application. If you see any errors, fix them before proceeding.

### 1.3 Test Preview Build

Run the preview server to test the production build locally:

```bash
npm run preview
```

Visit `http://localhost:4173` (or the port shown in terminal) and verify:
- Game loads without errors
- Canvas renders correctly
- You can click to start a game
- Player can move and interact
- No console errors in browser DevTools (F12)

## Step 2: Connect GitHub to Vercel

### 2.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

### 2.2 Import Your Repository

1. From Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find your `openjones` repository in the list
3. Click **"Import"**

## Step 3: Configure Build Settings

Vercel should auto-detect the configuration from `vercel.json`, but verify these settings:

### Build & Development Settings

- **Framework Preset:** Other (or leave as detected)
- **Root Directory:** `openjones-web` (if in monorepo) or `.` (if standalone)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Environment Variables

If your app needs any environment variables, add them here. Currently, OpenJones doesn't require any, but you can add:

- `NODE_ENV` → `production` (optional, already in vercel.json)

## Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will:
   - Clone your repository
   - Install dependencies
   - Run the build command
   - Deploy to their CDN
3. Wait for deployment to complete (usually 1-3 minutes)

## Step 5: Verify Deployment

### 5.1 Visit Your Deployed Site

Once deployment completes, Vercel will show you a URL like:
```
https://openjones-web-[random-string].vercel.app
```

Click on it to open your deployed game.

### 5.2 Post-Deployment Checks

Open the site and verify:

- [ ] **Main menu loads** - No blank screen or errors
- [ ] **Can start new game** - Enter name and click "Start Game"
- [ ] **Canvas renders** - Game map/grid appears
- [ ] **Player appears on map** - Blue circle with player name
- [ ] **Can click to move** - Click tiles to move player
- [ ] **Keyboard controls work** - Arrow keys or WASD to move
- [ ] **FPS counter visible** - Shows in top-left (if enabled)
- [ ] **HUD displays stats** - Cash, health, happiness, etc.
- [ ] **Game loop runs** - Time decrements, week advances
- [ ] **No console errors** - Open DevTools (F12) → Console tab

### 5.3 Check Browser Console

Press **F12** to open Developer Tools, then check the **Console** tab for:
- ❌ Red errors - These need to be fixed
- ⚠️ Warnings - Generally okay but review them
- ℹ️ Info messages - Normal

## Step 6: Custom Domain (Optional)

### Add a Custom Domain

1. Go to your project in Vercel dashboard
2. Click **"Settings"** → **"Domains"**
3. Enter your domain name (e.g., `openjones.yourdomain.com`)
4. Follow Vercel's instructions to configure DNS

## Troubleshooting

### Build Fails

**Error:** `npm run build` fails

**Solutions:**
1. Check that `package.json` has correct build script
2. Verify Node.js version compatibility (needs 18+)
3. Look at build logs in Vercel dashboard for specific errors
4. Try building locally first: `npm install && npm run build`

### TypeScript Errors

**Error:** `TS2307: Cannot find module '@shared/types/contracts'`

**Solutions:**
1. Check `tsconfig.json` has correct path mappings
2. Verify all imports use correct aliases
3. Run `npm run type-check` locally to catch errors

### Game Not Rendering

**Error:** Canvas shows black screen or doesn't appear

**Solutions:**
1. Open browser DevTools (F12) → Console
2. Look for errors related to:
   - `RenderCoordinator` - Canvas not found
   - `GameController` - Game not initializing
   - `InputHandler` - Event listener errors
3. Check that canvas element exists in DOM
4. Verify `App.tsx` properly creates canvas ref

### Input Not Working

**Error:** Can't click or use keyboard to interact

**Solutions:**
1. Check `InputHandler.initialize()` is called
2. Verify canvas element receives focus
3. Check browser console for input-related errors
4. Test with both mouse and keyboard inputs

### Performance Issues

**Error:** Game runs slowly or stutters

**Solutions:**
1. Check FPS counter (should be 50-60 FPS)
2. Open DevTools → Performance tab
3. Record performance and look for bottlenecks
4. Verify `RenderCoordinator` is using `requestAnimationFrame`
5. Check for memory leaks in long-running sessions

### Build Size Too Large

**Error:** Deployment succeeds but loads slowly

**Solutions:**
1. Enable tree-shaking in Vite config
2. Check for large dependencies in `package.json`
3. Consider code splitting for lazy loading
4. Run `npm run build` and check `dist` folder size

### Module Not Found Errors

**Error:** `Cannot find module './engine/GameController'`

**Solutions:**
1. Verify file paths are correct and case-sensitive
2. Check that all files exist in repository
3. Ensure imports use correct relative paths
4. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Rollback Instructions

If something goes wrong after deployment, you can quickly rollback:

### Using Vercel Dashboard

1. Go to your project in Vercel
2. Click **"Deployments"** tab
3. Find the last working deployment
4. Click **"..."** → **"Promote to Production"**

### Using Git

1. Identify the last working commit:
   ```bash
   git log --oneline
   ```
2. Revert to that commit:
   ```bash
   git revert <commit-hash>
   git push
   ```
3. Vercel will auto-deploy the reverted version

## Continuous Deployment

Vercel automatically deploys when you push to your GitHub repository:

- **Push to main branch** → Deploys to production
- **Push to other branches** → Creates preview deployment
- **Pull requests** → Creates preview deployment with unique URL

### Disable Auto-Deploy (Optional)

If you want manual control:

1. Go to project **"Settings"** → **"Git"**
2. Toggle off **"Production Branch"** auto-deploy
3. Deploy manually from Vercel dashboard

## Monitoring and Analytics

### View Deployment Logs

1. Go to **"Deployments"** tab
2. Click on any deployment
3. Click **"Building"** or **"Functions"** to see logs

### Analytics (Pro Plan)

Vercel Pro includes:
- **Real-time analytics** - Page views, visitors
- **Web Vitals** - Performance metrics
- **Serverless function logs** - If you add API routes

## Environment-Specific Configuration

If you need different settings for development vs. production:

### vercel.json (Already Configured)

```json
{
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Runtime Detection

In your code:
```typescript
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;
```

## Next Steps

After successful deployment:

1. **Share your game** - Send the URL to testers
2. **Monitor errors** - Set up error tracking (e.g., Sentry)
3. **Gather feedback** - Ask users to report bugs
4. **Iterate** - Push updates and deploy improvements
5. **Custom domain** - Consider adding your own domain
6. **Performance** - Monitor Core Web Vitals

## Support

### Vercel Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Troubleshooting Builds](https://vercel.com/docs/concepts/deployments/troubleshoot-a-build)

### OpenJones Issues
- Report bugs on GitHub Issues
- Check existing documentation in `docs/` folder

## Common Commands Reference

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Type check
npm run type-check

# Lint code
npm run lint
```

## Deployment Checklist

Before deploying:

- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Preview works: `npm run preview`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No linting errors: `npm run lint`
- [ ] Code committed and pushed to GitHub
- [ ] vercel.json configured correctly
- [ ] Environment variables set (if needed)

After deploying:

- [ ] Site loads at Vercel URL
- [ ] No console errors
- [ ] Game is playable
- [ ] All features work as expected
- [ ] Performance is acceptable (check FPS)

---

**Congratulations!** Your OpenJones game is now live on Vercel! 🎉
