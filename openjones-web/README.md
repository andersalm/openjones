# OpenJones - Browser Edition

Modern browser-based port of the classic 1990 life simulation game "Jones in the Fast Lane" by Sierra Entertainment.

**Status:** 🚀 Phase 1 In Progress - Core Engine & UI Foundation (16/18 tasks complete)
**Team:** Parallel AI worker system with coordinator
**Current Branch:** `claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ`

---

## 🎮 About

OpenJones is a turn-based life simulation where players manage work, education, health, happiness, and finances to achieve victory conditions. This browser port brings the classic gameplay to modern web technologies.

### Original Game
- **Title:** Jones in the Fast Lane
- **Developer:** Sierra Entertainment (1990)
- **Java Port:** [openjones](../openjones) by dimidd

---

## 🚀 Quick Start

### For New Workers

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

**Then:** Read `docs/WORKER_SETUP.md` to get started! 📖

### For Project Leads

See `TASK_PARALLEL.md` for the complete parallel development plan.

---

## 📁 Project Structure

```
openjones-web/
├── frontend/          # Main application
│   ├── src/
│   │   ├── engine/    # Game logic (Track A & B)
│   │   ├── components/ # React UI (Track C)
│   │   ├── rendering/ # Canvas graphics (Track D)
│   │   └── store/     # State management
│   └── tests/         # Test files
│
├── shared/
│   ├── types/         # TypeScript contracts
│   └── mocks/         # Mock implementations
│
└── docs/              # Documentation
```

---

## 🎯 Technology Stack

- **Framework:** React 19 + TypeScript
- **Build:** Vite 7
- **State:** Zustand
- **Rendering:** HTML5 Canvas
- **Testing:** Vitest + React Testing Library
- **Code Quality:** ESLint + Prettier

---

## 📋 Available Scripts

### Development
```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Testing
```bash
npm test             # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage report
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

---

## 👥 Team Structure

### Parallel Work Tracks

**Track A - Core Engine** (Worker 1)
- Game state, player state, action system
- Files: `frontend/src/engine/game/`, `frontend/src/engine/actions/`

**Track B - Domain Logic** (Worker 2)
- Buildings, economy, map, jobs, possessions
- Files: `frontend/src/engine/{buildings,economy,map,measures,possessions,jobs}/`

**Track C - UI Components** (Worker 3)
- React components, user interface
- Files: `frontend/src/components/`

**Track D - Rendering** (Worker 4)
- Canvas rendering, sprites, animations
- Files: `frontend/src/rendering/`

**Track E - AI System** (Worker 5)
- AI agents, planning algorithms
- Files: `frontend/src/engine/agents/`

---

## 📖 Documentation

### For Coordinators (New Sessions)
**⭐ START HERE:** **`NEW_SESSION_START.md`** - Complete guide for starting a new coordinator session

This file includes:
- How to verify current state (don't assume anything!)
- How to review worker submissions
- How to assign new tasks
- Integration workflow and troubleshooting

### For Understanding the Codebase
1. **`TASKS_POOL.md`** - All 18 tasks with completion status
2. **`WORKER_STATUS.md`** - Worker performance tracking
3. **`shared/types/contracts.ts`** - All TypeScript interfaces
4. **`frontend/src/engine/actions/README.md`** - Action system docs
5. **`frontend/src/components/ui/README.md`** - UI component guidelines

### Original Planning Docs (Reference Only)
- `TASK_PARALLEL.md` - Initial parallel development plan
- `TASK_MVP.md` - MVP scope and timeline
- `COORDINATION.md` - Original workflow design

---

## 🔧 Development Workflow

### 1. Choose Your Track
Read `TASK_PARALLEL.md` and pick a track based on your skills.

### 2. Create Feature Branch
```bash
git checkout -b track-a/my-feature
```

### 3. Implement & Test
```typescript
// Use mocks for dependencies
import { MockGame } from '@shared/mocks';

// Implement your feature
class MyFeature implements IMyFeature {
  // ...
}

// Write tests
describe('MyFeature', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
```

### 4. Commit & Push
```bash
git add .
git commit -m "[Track A] feat: implement my feature"
git push
```

### 5. Create Pull Request
- Base: `develop`
- Get 1 approval
- Merge ✅

### 6. Weekly Integration (Fridays)
All tracks merge to `develop` and test together.

---

## 🎯 Milestones

### Phase 0: Setup ✅ (Complete)
- [x] Project structure
- [x] TypeScript contracts
- [x] Mock implementations
- [x] Development environment

### Phase 1: Core Port 🏗️ (In Progress - 16/18 tasks complete)
- [x] Game engine foundation (Track A) - 7/7 tasks
- [x] Core buildings system (Track B) - 6/11 tasks
- [x] UI components (Track C) - 3/4 tasks
- [ ] Remaining: Employment Agency (B8), Housing Buildings (B11), Building Modal (C3)
- [x] 700+ tests written with Vitest

**Current Status:** Action system complete, basic buildings done, UI foundation ready

**Deliverable:** Playable browser game

### Phase 2: Polish (Weeks 9-14)
- [ ] UI/UX improvements
- [ ] Audio integration
- [ ] Accessibility
- [ ] Testing & bug fixes

**Deliverable:** Polished game ready for launch

### Phase 3: AI & Features (Weeks 15-18)
- [ ] AI agent system (Track E)
- [ ] Campaign scenarios
- [ ] Achievements

**Deliverable:** Complete single-player experience

---

## 🤝 Contributing

### For Team Members
1. Read `docs/WORKER_SETUP.md`
2. Choose your track
3. Create feature branch
4. Implement, test, commit
5. Create PR for review
6. Attend daily standups (9:00 AM)
7. Participate in Friday integrations

### Code Standards
- Follow TypeScript strict mode
- Write tests for new features (>80% coverage goal)
- Format code with Prettier
- Pass ESLint checks
- Document complex logic

---

## 📊 Project Status

**Current Phase:** Phase 1 - Core Port (16/18 tasks complete)
**Branch:** `claude/analyze-project-depth-011CUsT3jWbYUM7oTUxpQ5cQ`
**Tests:** 700+ tests, ~70-80% pass rate
**Next:** Complete remaining 2 tasks (B8, B11, C3) or start Phase 2

**Latest Integration:** Round 7 complete - Economic Actions & Action Menu

See `TASKS_POOL.md` for detailed task status and `WORKER_STATUS.md` for worker performance.

---

## 🐛 Troubleshooting

### Common Issues

**"Module not found"**
```bash
# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

**Tests not running**
```bash
npm install -D vitest
npm test -- --reporter=verbose
```

**Build errors**
```bash
npm run type-check  # See all TypeScript errors
npm run lint        # See all linting errors
```

See `docs/WORKER_SETUP.md` for more troubleshooting tips.

---

## 📜 License

MIT License - See LICENSE file for details

Original game "Jones in the Fast Lane" © Sierra Entertainment (1990)

---

## 🙏 Acknowledgments

- Original game by Sierra Entertainment
- Java port by dimidd ([openjones](https://github.com/dimidd/openjones))
- Browser port team (contributors welcome!)

---

## 📞 Contact

- **Issues:** Create a GitHub issue
- **Questions:** Check `docs/` folder first
- **Team Chat:** [Discord/Slack link]

---

**Let's build something amazing! 🚀**
