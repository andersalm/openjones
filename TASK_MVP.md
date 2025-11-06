# OpenJones Browser Port - MVP (Minimum Viable Product)

**Goal:** Deliver a playable browser game in 4-5 months
**Focus:** Core functionality, no AI features, minimal polish
**Team Size:** 1-3 developers
**Timeline:** 18-22 weeks solo, 10-14 weeks with team of 3

---

## 🎯 MVP Scope

### What's Included ✅
- Full game logic port from Java (all 13 buildings, actions, economy)
- Canvas-based rendering (5x5 grid, sprites, basic animations)
- Responsive UI (desktop, tablet, mobile)
- Save/load system (localStorage)
- Single-player mode
- Basic AI opponents (Random, Greedy, Search planners)
- Settings (audio, graphics, gameplay)
- Tutorial

### What's NOT Included ❌
- No LLM/AI-generated content (Phase 4)
- No multiplayer (Phase 5)
- No backend/database
- No advanced visual effects (weather, particles)
- No campaign mode (maybe 3 scenarios instead of 10-15)
- Limited achievements (10 instead of 20-30)
- No replay system

---

## 📋 Phase 1: Foundation (6-8 weeks)

See `TASK_PARALLEL.md` for parallel work structure.

### Summary
- Set up project (React + TypeScript + Vite)
- Define all TypeScript interfaces
- Port core game engine (Game, Player, Actions)
- Port domain logic (Buildings, Economy, Map)
- Basic Canvas rendering
- Basic UI components
- Manual testing

**Deliverable:** Playable game with basic UI

---

## 📋 Phase 2: Polish (4-6 weeks)

### Week 9-10: UI/UX Improvements
- [ ] Improve UI components (tooltips, modals, menus)
- [ ] Add animations (Framer Motion or CSS)
- [ ] Responsive design (desktop, tablet, mobile)
- [ ] Add tutorial system
- [ ] Add help documentation

### Week 11-12: Audio & Accessibility
- [ ] Find/add sound effects
- [ ] Find/add background music
- [ ] Implement AudioManager
- [ ] Add ARIA labels for accessibility
- [ ] Keyboard navigation
- [ ] High contrast mode
- [ ] Run accessibility audit (WAVE)

### Week 13-14: QoL & Testing
- [ ] Implement save system (3 save slots)
- [ ] Add settings panel
- [ ] Add statistics view
- [ ] Add quick actions (hotbar)
- [ ] Comprehensive playtesting
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] E2E tests (Playwright)

**Deliverable:** Polished, accessible browser game

---

## 📋 Phase 3: AI & Game Modes (4-6 weeks)

### Week 15-16: AI System
- [ ] Port A* pathfinding
- [ ] Port AI planners (Random, Greedy, Search)
- [ ] Optimize for browser (Web Workers if needed)
- [ ] Add AI vs player mode
- [ ] AI visualization/debug mode

### Week 17-18: Game Modes
- [ ] Create 3-5 campaign scenarios
- [ ] Add custom game configuration UI
- [ ] Add 10 achievements
- [ ] Add victory/game over screens
- [ ] Statistics tracking

**Deliverable:** Complete single-player game with AI opponents

---

## 🚀 Launch (Week 19-20)

### Week 19: Pre-Launch
- [ ] Final bug fixes
- [ ] Performance optimization
- [ ] Security audit (XSS, input validation)
- [ ] Write README.md
- [ ] Write CONTRIBUTING.md
- [ ] Add license (MIT or similar)
- [ ] Create demo video
- [ ] Set up deployment (Vercel/Netlify)

### Week 20: Launch
- [ ] Deploy to production
- [ ] Set up analytics (Plausible)
- [ ] Set up error tracking (Sentry)
- [ ] Announce on Reddit, HackerNews, etc.
- [ ] Monitor for critical bugs
- [ ] Gather user feedback

**Deliverable:** Public, playable game at playopenjones.com

---

## 💰 Costs (MVP)

### Development
- **Solo:** 18-22 weeks (~4-5 months)
- **Team of 3:** 10-14 weeks (~3 months)
- **Labor cost (at $50/hr):**
  - Solo: 720-880 hours = $36K-44K
  - Team: 1,200-1,680 hours = $60K-84K

### Hosting
- **Vercel/Netlify:** $0-20/month (free tier likely sufficient)
- **Domain:** $12/year
- **Total:** **$12-252/year**

### No AI Costs (No Phase 4)

---

## ✅ Success Criteria

### Technical
- [ ] 60 FPS gameplay
- [ ] <3 second load time
- [ ] Lighthouse score >85
- [ ] >70% test coverage
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Works on mobile (iOS + Android)

### User Experience
- [ ] Tutorial completion rate >50%
- [ ] Average session length >10 minutes
- [ ] Game completion rate >15%

### Project
- [ ] Fully open source on GitHub
- [ ] Documentation complete
- [ ] No critical bugs in production

---

## 🎯 Post-MVP Enhancements (Optional)

**After MVP launch, prioritize based on user feedback:**

### High Priority
- [ ] More scenarios (expand from 3 to 10)
- [ ] More achievements (expand from 10 to 30)
- [ ] Replay system
- [ ] Leaderboards (requires simple backend)

### Medium Priority
- [ ] Visual improvements (better sprites, effects)
- [ ] More sound effects and music
- [ ] Localization (i18n)
- [ ] Steam release (Electron wrapper)

### Low Priority (Requires Significant Work)
- [ ] Multiplayer (Phase 5 - requires backend)
- [ ] LLM integration (Phase 4 - requires budget)
- [ ] Mobile apps (React Native/Capacitor)
- [ ] Tournament system

---

## 📊 Parallel Work Structure

For team of 3, see `TASK_PARALLEL.md` for detailed parallel work tracks:
- **Worker 1:** Core Engine (Game, Player, Actions)
- **Worker 2:** Domain Logic (Buildings, Economy, Map)
- **Worker 3:** UI & Rendering (React components, Canvas)

For solo developer:
- Follow tracks sequentially in order: 1 → 2 → 3
- Use mocks to unblock yourself
- Integration every 2 weeks

---

## 🚨 Risk Management

### Risk 1: Timeline Slips
**Mitigation:**
- Add 25% buffer to estimates
- Cut non-essential features
- Regular progress reviews

### Risk 2: Technical Complexity
**Mitigation:**
- Start with simplest implementations
- Refactor later if needed
- Ask for help early (forums, Discord)

### Risk 3: Legal Issues
**Mitigation:**
- Verify you can legally port the game
- Use only open-source assets
- Add clear attribution

### Risk 4: Burnout (Solo Developer)
**Mitigation:**
- Set realistic weekly goals
- Take breaks
- Celebrate small wins
- Don't compare to commercial games

---

## 🎬 Getting Started

### Day 1: Setup
1. Read `TASK_PARALLEL.md` for detailed structure
2. Set up development environment
3. Initialize React + TypeScript + Vite project
4. Create folder structure
5. Define core TypeScript interfaces

### Week 1: Foundation
1. Complete Phase 0 setup (see TASK_PARALLEL.md)
2. Define all contracts
3. Create mock implementations
4. Start coding!

### Week 2-8: Core Development
1. Follow parallel tracks if team, or sequential if solo
2. Weekly integration
3. Regular testing
4. Keep scope tight

---

## 📚 Resources

- `TASK.md` - Full plan with all phases
- `TASK_PARALLEL.md` - Parallel work structure
- `docs/ARCHITECTURE.md` - Technical architecture (create this)
- `docs/SETUP.md` - Development setup (create this)

---

**Let's ship the MVP!** 🚀
