# OpenJones - Browser Edition

Modern browser-based port of the classic 1990 life simulation game "Jones in the Fast Lane" by Sierra Entertainment.

**Status:** 🏗️ Phase 0 Complete - Ready for Development
**Team:** Parallel development with 3-5 workers
**Timeline:** 10-14 weeks (team of 3) | 18-22 weeks (solo)

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

### Essential Reading
1. **`docs/WORKER_SETUP.md`** - Start here if you're new! ⭐
2. **`shared/types/contracts.ts`** - All TypeScript interfaces
3. **`TASK_PARALLEL.md`** - Complete parallel development plan
4. **`COORDINATION.md`** - Daily team workflow

### Additional Docs
- `TASK_MVP.md` - MVP scope and timeline
- `TASK.md` - Full vision (includes optional features)
- `PROJECT_STATUS.md` - Current project state

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

### Phase 1: Core Port (Weeks 2-8)
- [ ] Game engine (Track A)
- [ ] Domain logic (Track B)
- [ ] UI components (Track C)
- [ ] Rendering system (Track D)
- [ ] Integration & testing

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

**Current Phase:** Phase 0 Complete → Ready for Phase 1
**Next Milestone:** Week 3 Integration (First compile)
**Team Size:** TBD (1-5 workers)

See `PROJECT_STATUS.md` for detailed status.

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
