# OpenJones Browser Port - Implementation Task List

**Project Goal:** Port OpenJones from Java/Swing to a modern browser-based game with enhanced UX, AI-generated content, and dynamic narrative capabilities.

**Status:** Planning → Implementation Ready
**Target:** Modern web game with LLM-powered immersion and procedural content
**Timeline:** 16-20 weeks for full implementation

---

## 📋 Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Phase 1: Foundation & Core Port](#phase-1-foundation--core-port-6-8-weeks)
4. [Phase 2: Enhanced UX & Polish](#phase-2-enhanced-ux--polish-4-6-weeks)
5. [Phase 3: AI Agents & Advanced Features](#phase-3-ai-agents--advanced-features-3-4-weeks)
6. [Phase 4: LLM Integration & Generative Content](#phase-4-llm-integration--generative-content-3-4-weeks)
7. [Phase 5: Backend & Multiplayer](#phase-5-backend--multiplayer-optional-6-8-weeks)
8. [AI/LLM Integration Strategy](#aillm-integration-strategy)
9. [Success Criteria](#success-criteria)

---

## Technology Stack

### Frontend Core
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **State Management:** Zustand
- **Rendering:** HTML5 Canvas API (with PixiJS as future upgrade path)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Testing:** Vitest + React Testing Library + Playwright

### AI/LLM Integration
- **Text Generation:** OpenAI GPT-4 API or Anthropic Claude API
- **Image Generation:** Stable Diffusion (via Replicate API) or DALL-E 3
- **Local LLM Option:** Ollama integration for offline play
- **Embedding Search:** Vector database for context retrieval (Pinecone/Weaviate)

### Backend (Phase 5)
- **API Server:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Real-time:** Socket.io
- **Authentication:** JWT + bcrypt
- **Caching:** Redis

### DevOps
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Hosting:** Vercel (frontend) + Railway (backend)
- **Monitoring:** Sentry + Plausible Analytics

---

## Project Structure

```
openjones-web/
├── docs/
│   ├── ARCHITECTURE.md          # Technical architecture
│   ├── API.md                   # API documentation
│   └── AI_INTEGRATION.md        # LLM integration guide
│
├── frontend/
│   ├── src/
│   │   ├── engine/              # Core game logic (ported from Java)
│   │   │   ├── actions/         # Action system
│   │   │   ├── agents/          # AI planning agents
│   │   │   ├── buildings/       # Building logic
│   │   │   ├── economy/         # Economic model
│   │   │   ├── game/            # Game state management
│   │   │   ├── map/             # Map and positioning
│   │   │   ├── measures/        # Player metrics
│   │   │   ├── possessions/     # Items and inventory
│   │   │   └── types/           # TypeScript interfaces
│   │   │
│   │   ├── ai/                  # LLM integration layer
│   │   │   ├── providers/       # API clients (OpenAI, Anthropic, etc.)
│   │   │   ├── generators/      # Content generators
│   │   │   │   ├── NarrativeGenerator.ts
│   │   │   │   ├── EventGenerator.ts
│   │   │   │   ├── DialogueGenerator.ts
│   │   │   │   └── DescriptionGenerator.ts
│   │   │   ├── imageGen/        # Image generation
│   │   │   │   ├── CharacterGenerator.ts
│   │   │   │   ├── BuildingGenerator.ts
│   │   │   │   └── ItemGenerator.ts
│   │   │   ├── prompts/         # Prompt templates
│   │   │   └── cache/           # Response caching
│   │   │
│   │   ├── components/          # React components
│   │   │   ├── GameBoard/       # Main game view
│   │   │   ├── Buildings/       # Building interaction UIs
│   │   │   ├── PlayerStats/     # HUD and stats
│   │   │   ├── Narrative/       # Story/event displays
│   │   │   ├── Menus/           # Game menus
│   │   │   ├── AI/              # AI assistant UI
│   │   │   └── ui/              # shadcn/ui components
│   │   │
│   │   ├── rendering/           # Canvas rendering
│   │   │   ├── MapRenderer.ts
│   │   │   ├── SpriteManager.ts
│   │   │   ├── AnimationEngine.ts
│   │   │   └── EffectsRenderer.ts
│   │   │
│   │   ├── store/               # Zustand stores
│   │   │   ├── gameStore.ts
│   │   │   ├── playerStore.ts
│   │   │   ├── uiStore.ts
│   │   │   ├── aiStore.ts
│   │   │   └── narrativeStore.ts
│   │   │
│   │   ├── api/                 # Backend API client
│   │   ├── assets/              # Static assets
│   │   ├── hooks/               # Custom React hooks
│   │   └── utils/               # Utilities
│   │
│   ├── public/
│   │   ├── images/              # Game sprites
│   │   ├── sounds/              # Audio files
│   │   └── fonts/               # Custom fonts
│   │
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   └── package.json
│
├── backend/ (Phase 5)
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── services/
│   │   ├── websockets/
│   │   └── middleware/
│   │
│   ├── prisma/
│   └── package.json
│
├── shared/                      # Shared TypeScript types
│   └── types/
│
└── scripts/                     # Build and utility scripts
    ├── migrate-java.ts          # Java to TS migration helpers
    └── generate-sprites.ts      # Sprite sheet generation
```

---

## Phase 1: Foundation & Core Port (6-8 weeks)

### Week 1-2: Project Setup & Architecture

#### 1.1 Initialize Project
- [ ] Create monorepo structure (pnpm workspaces or npm workspaces)
- [ ] Initialize React + TypeScript + Vite frontend
- [ ] Set up Tailwind CSS + shadcn/ui
- [ ] Configure ESLint + Prettier
- [ ] Set up Vitest for unit testing
- [ ] Create initial project structure (folders from diagram)
- [ ] Initialize Git repository and .gitignore
- [ ] Set up GitHub Actions CI/CD workflow
  - [ ] Build on PR
  - [ ] Run tests
  - [ ] Deploy previews to Vercel

#### 1.2 Define Core TypeScript Interfaces
- [ ] Create `types/index.ts` with core interfaces:
  - [ ] `IGame` - game state interface
  - [ ] `IPlayerState` - player state interface
  - [ ] `IPlayer` - player interface
  - [ ] `IAction` - action interface
  - [ ] `IBuilding` - building interface
  - [ ] `IPosition` - position interface
  - [ ] `IMap` - map interface
  - [ ] `IMeasure` - measure interface (health, happiness, etc.)
  - [ ] `IPossession` - possession interface
  - [ ] `IJob` - job interface
  - [ ] `IEconomyModel` - economy interface
- [ ] Create enums for action types, building types, job ranks
- [ ] Set up utility types (Result, Option, etc.)

#### 1.3 Development Environment
- [ ] Create `docs/SETUP.md` with setup instructions
- [ ] Create `docs/ARCHITECTURE.md` with architecture overview
- [ ] Set up environment variables (.env.example)
- [ ] Create VS Code workspace settings
- [ ] Add useful VS Code extensions recommendations
- [ ] Set up debugging configurations

### Week 3-4: Core Game Logic Port

#### 1.4 Game State Management
- [ ] Port `Game.java` → `engine/game/Game.ts`
  - [ ] Game initialization
  - [ ] Turn management (600 time units per week)
  - [ ] Player list management
  - [ ] Victory condition checking
  - [ ] Game state serialization
- [ ] Port `PlayerState.java` → `engine/game/PlayerState.ts`
  - [ ] State properties (cash, measures, possessions, job, etc.)
  - [ ] State cloning (for immutability)
  - [ ] State validation
- [ ] Port `Player.java` → `engine/game/Player.ts`
  - [ ] Player initialization
  - [ ] Action execution
  - [ ] Current position tracking
- [ ] Create Zustand `gameStore.ts`
  - [ ] Game state management
  - [ ] Action dispatching
  - [ ] Undo/redo functionality (optional)
  - [ ] State persistence (localStorage)
- [ ] Write unit tests for game logic (>80% coverage)

#### 1.5 Action System
- [ ] Port base `Action.java` → `engine/actions/Action.ts`
  - [ ] Abstract action interface
  - [ ] Time cost calculation
  - [ ] Execution logic
  - [ ] Response handling
- [ ] Port `ActionResponse.java` → `engine/actions/ActionResponse.ts`
  - [ ] Success/failure states
  - [ ] Message handling
  - [ ] State changes
- [ ] Port movement actions:
  - [ ] `Movement.ts` (base movement)
  - [ ] `EnterBuildingMovement.ts`
  - [ ] `ExitBuildingMovement.ts`
- [ ] Port building actions:
  - [ ] `WorkAction.ts`
  - [ ] `RelaxAction.ts`
  - [ ] `StudyAction.ts`
  - [ ] `PurchaseAction.ts`
  - [ ] `PurchaseClothesAction.ts`
  - [ ] `ApplyForJobAction.ts`
  - [ ] `PayRentAction.ts`
  - [ ] `RentHouseAction.ts`
  - [ ] `SubMenuAction.ts`
- [ ] Create action factory/registry
- [ ] Write unit tests for each action type

#### 1.6 Economy & Measures
- [ ] Port `ConstantEconomyModel.java` → `engine/economy/EconomyModel.ts`
  - [ ] Price calculations
  - [ ] Wage calculations
  - [ ] Rent calculations
  - [ ] Stock market simulation (if exists)
- [ ] Port measures system:
  - [ ] `Measure.ts` (base class)
  - [ ] `Health.ts`
  - [ ] `Happiness.ts`
  - [ ] `Education.ts`
  - [ ] `Career.ts`
  - [ ] `Wealth.ts`
  - [ ] Measure decay/growth logic
- [ ] Create economy utilities
- [ ] Write unit tests for economy calculations

#### 1.7 Map & Buildings
- [ ] Port `Map.java` → `engine/map/Map.ts`
  - [ ] 5x5 grid system
  - [ ] Building placement
  - [ ] Position validation
  - [ ] Pathfinding integration
- [ ] Port `Building.java` (base class) → `engine/buildings/Building.ts`
  - [ ] Abstract building interface
  - [ ] Action tree system
  - [ ] Job offerings
  - [ ] Building state
- [ ] Port all building types:
  - [ ] `EmploymentAgency.ts`
  - [ ] `Factory.ts`
  - [ ] `Bank.ts`
  - [ ] `College.ts`
  - [ ] `DepartmentStore.ts`
  - [ ] `ClothesStore.ts`
  - [ ] `ApplianceStore.ts`
  - [ ] `PawnShop.ts`
  - [ ] `Restaurant.ts`
  - [ ] `Supermarket.ts`
  - [ ] `RentAgency.ts`
  - [ ] `LowCostApartment.ts`
  - [ ] `SecurityApartment.ts`
- [ ] Port `Position.java` and `Route.java`
- [ ] Write unit tests for map logic

#### 1.8 Possessions & Jobs
- [ ] Port possession system:
  - [ ] `Possession.ts` (base class)
  - [ ] All possession types (Food, Clothes, Appliance, etc.)
  - [ ] Inventory management
- [ ] Port job system:
  - [ ] `Job.ts` interface
  - [ ] Job ranks (1-9)
  - [ ] Experience tracking
  - [ ] Job requirements validation
  - [ ] `Unemployed.ts`
- [ ] Write unit tests

### Week 5-6: Basic Rendering

#### 1.9 Canvas Setup
- [ ] Create `rendering/MapRenderer.ts`
  - [ ] Initialize canvas context
  - [ ] Set up viewport/camera
  - [ ] Implement tile-based rendering
  - [ ] Handle window resizing
- [ ] Create `rendering/SpriteManager.ts`
  - [ ] Load sprite images
  - [ ] Create sprite atlas/sheet
  - [ ] Manage sprite cache
  - [ ] Handle image loading errors

#### 1.10 Asset Preparation
- [ ] Copy PNG assets from Java project
- [ ] Optimize images (compress, convert to WebP if beneficial)
- [ ] Create sprite sheets using tool (e.g., TexturePacker)
- [ ] Organize assets by type (buildings, characters, items, tiles)
- [ ] Create asset manifest file

#### 1.11 Rendering Implementation
- [ ] Implement map grid rendering
  - [ ] Draw 5x5 grid
  - [ ] Render building tiles
  - [ ] Render empty spaces
- [ ] Implement player sprite rendering
  - [ ] Character positioning
  - [ ] Multiple player support (different colors/sprites)
- [ ] Add basic animations:
  - [ ] Movement transitions
  - [ ] Entrance/exit animations
  - [ ] Idle animations
- [ ] Create `rendering/AnimationEngine.ts`
  - [ ] Frame-based animations
  - [ ] Tween animations (for smooth movement)
  - [ ] Animation queue system

#### 1.12 Rendering Loop
- [ ] Implement requestAnimationFrame loop
- [ ] Add FPS counter (development mode)
- [ ] Implement dirty rectangle optimization
- [ ] Add render layers (background, tiles, sprites, UI)
- [ ] Write rendering tests (snapshot testing)

### Week 7-8: Basic UI Implementation

#### 1.13 Core UI Components
- [ ] Install and configure shadcn/ui
- [ ] Create `GameBoard.tsx` component
  - [ ] Canvas wrapper
  - [ ] Click/touch event handling
  - [ ] Grid position mapping
- [ ] Create `PlayerStatsHUD.tsx`
  - [ ] Display: Cash, Health, Happiness, Education, Career
  - [ ] Time remaining (turns/hours)
  - [ ] Current week number
  - [ ] Victory progress indicators
- [ ] Create `BuildingModal.tsx`
  - [ ] Modal dialog for building interactions
  - [ ] Action menu tree navigation
  - [ ] Action confirmation
  - [ ] Result display
- [ ] Create `ActionMenu.tsx`
  - [ ] Tree-based menu structure
  - [ ] Sub-menu navigation
  - [ ] Action descriptions
  - [ ] Cost/time display

#### 1.14 Game Flow UI
- [ ] Create `MainMenu.tsx`
  - [ ] New game
  - [ ] Load game
  - [ ] Settings
  - [ ] Credits
- [ ] Create `GameSetup.tsx`
  - [ ] Player configuration
  - [ ] Difficulty selection
  - [ ] Victory goal customization
- [ ] Create `TurnProgressUI.tsx`
  - [ ] Turn transition animation
  - [ ] Week summary
  - [ ] Event notifications
- [ ] Create `VictoryScreen.tsx`
  - [ ] Victory animation
  - [ ] Final statistics
  - [ ] Play again option
- [ ] Create `GameOverScreen.tsx`
  - [ ] Loss conditions display
  - [ ] Statistics review

#### 1.15 Integration & Testing
- [ ] Connect UI components to game store
- [ ] Implement action flow: click → modal → action → update
- [ ] Add keyboard shortcuts (ESC to close, number keys for actions)
- [ ] Add loading states and error handling
- [ ] Write component tests (React Testing Library)
- [ ] Create first E2E test (full game playthrough)
- [ ] Manual playtesting and bug fixes

**Phase 1 Deliverable:** Playable single-player browser game with basic UI

---

## Phase 2: Enhanced UX & Polish (4-6 weeks)

### Week 9-10: UI/UX Improvements

#### 2.1 Design System
- [ ] Create Figma mockups (or use Excalidraw for quick wireframes)
  - [ ] Main game view
  - [ ] Building interaction modals
  - [ ] Player stats dashboard
  - [ ] Mobile layout
- [ ] Define color palette
  - [ ] Primary, secondary, accent colors
  - [ ] Success, warning, error states
  - [ ] Dark mode support
- [ ] Define typography scale
- [ ] Create component library documentation

#### 2.2 Advanced UI Components
- [ ] Create `Tooltip.tsx` component
  - [ ] Hover tooltips for all UI elements
  - [ ] Context-aware descriptions
- [ ] Create `Toast.tsx` notification system
  - [ ] Action feedback
  - [ ] Event notifications
  - [ ] Error messages
- [ ] Create `ProgressBar.tsx` variants
  - [ ] Health bar
  - [ ] Happiness bar
  - [ ] Education/career progress
  - [ ] Time remaining bar
- [ ] Create `ContextMenu.tsx`
  - [ ] Right-click menus
  - [ ] Quick actions
- [ ] Improve `BuildingModal.tsx`
  - [ ] Add building image/illustration
  - [ ] Show building description
  - [ ] Preview action outcomes
  - [ ] Disable unavailable actions with reasons

#### 2.3 Animations & Transitions
- [ ] Add Framer Motion library
- [ ] Animate modal open/close (fade + scale)
- [ ] Animate stat changes (count-up effect)
- [ ] Add page transitions
- [ ] Create money transaction animation (coin particles)
- [ ] Add success/failure visual feedback (shake, flash)
- [ ] Smooth character movement on map
- [ ] Building entrance/exit animations

#### 2.4 Responsive Design
- [ ] Implement responsive layouts
  - [ ] Desktop: Side-by-side layout
  - [ ] Tablet: Collapsible sidebar
  - [ ] Mobile: Tabbed interface
- [ ] Add touch gestures
  - [ ] Tap to select building
  - [ ] Swipe to navigate menus
  - [ ] Pinch to zoom (optional)
- [ ] Optimize for different screen sizes
- [ ] Test on real devices (iOS, Android)

#### 2.5 Onboarding & Tutorial
- [ ] Create `Tutorial.tsx` component
  - [ ] Step-by-step walkthrough
  - [ ] Interactive highlights
  - [ ] Dismissible tooltips
- [ ] Add tutorial mode to game
  - [ ] Guided first week
  - [ ] Explain key concepts
  - [ ] Practice scenarios
- [ ] Create help documentation
- [ ] Add contextual help buttons

### Week 11-12: Visual & Audio Enhancements

#### 2.6 Visual Improvements
- [ ] Upgrade existing sprites (optional)
  - [ ] Hire pixel artist on Fiverr/Upwork, OR
  - [ ] Use AI image generation (see Phase 4)
- [ ] Add visual effects:
  - [ ] Particle systems (money, happiness sparkles)
  - [ ] Weather effects (rain, snow - optional)
  - [ ] Time-of-day lighting (optional)
  - [ ] Building glow on hover
  - [ ] Action impact effects
- [ ] Improve UI polish:
  - [ ] Add subtle shadows
  - [ ] Smooth hover states
  - [ ] Loading skeletons
  - [ ] Empty states

#### 2.7 Audio Integration
- [ ] Find/create sound effects:
  - [ ] Click/select sounds
  - [ ] Cash register (money transactions)
  - [ ] Success chime
  - [ ] Error sound
  - [ ] Movement footsteps
  - [ ] Building ambient sounds
- [ ] Find/create background music:
  - [ ] Main menu theme
  - [ ] Gameplay music (loopable)
  - [ ] Victory jingle
- [ ] Implement audio system:
  - [ ] `utils/AudioManager.ts`
  - [ ] Volume controls
  - [ ] Mute toggle
  - [ ] Music crossfading
- [ ] Add audio settings UI
- [ ] Test audio on all browsers

#### 2.8 Accessibility
- [ ] Add ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works everywhere
- [ ] Add focus indicators
- [ ] Test with screen readers (NVDA, VoiceOver)
- [ ] Implement high contrast mode
- [ ] Add text size adjustment
- [ ] Ensure color-blind friendly palette
- [ ] Add skip links
- [ ] Run WAVE accessibility audit

### Week 13-14: Quality of Life Features

#### 2.9 Game Features
- [ ] Add action queue/planning:
  - [ ] Plan multiple actions ahead
  - [ ] Visual queue display
  - [ ] Edit planned actions
- [ ] Add quick actions:
  - [ ] Hotbar for favorite buildings
  - [ ] Quick "Go Home" button
  - [ ] Quick "Go to Work" button
- [ ] Add game speed controls:
  - [ ] Pause
  - [ ] Play
  - [ ] Fast forward (for AI turns)
- [ ] Add statistics view:
  - [ ] Detailed stat breakdowns
  - [ ] Historical graphs
  - [ ] Per-week analysis

#### 2.10 Save System
- [ ] Implement save to localStorage
  - [ ] Auto-save every turn
  - [ ] Manual save slots (3 slots)
  - [ ] Save metadata (date, week, progress)
- [ ] Implement load system
  - [ ] Load from save slot
  - [ ] Save preview
  - [ ] Delete save option
- [ ] Add export/import saves (JSON file)
- [ ] Handle save migration (version compatibility)

#### 2.11 Settings & Preferences
- [ ] Create `Settings.tsx` component
  - [ ] Audio settings
  - [ ] Graphics settings (effects on/off)
  - [ ] Gameplay settings (tutorial on/off)
  - [ ] Accessibility settings
- [ ] Persist settings to localStorage
- [ ] Add reset to defaults option

#### 2.12 Polish & Bug Fixes
- [ ] Comprehensive playtesting
- [ ] Fix all known bugs
- [ ] Performance optimization (profiling)
- [ ] Code cleanup and refactoring
- [ ] Update documentation
- [ ] Increase test coverage to >80%

**Phase 2 Deliverable:** Polished, modern single-player web game

---

## Phase 3: AI Agents & Advanced Features (3-4 weeks)

### Week 15-16: AI Agent System Port

#### 3.1 Pathfinding
- [ ] Port A* algorithm:
  - [ ] `engine/agents/AStar.ts` (from external/AStar.java)
  - [ ] State space node structure
  - [ ] Heuristic functions
- [ ] Optimize for browser (consider Web Workers)
- [ ] Add configurable depth limits
- [ ] Write performance tests

#### 3.2 Planning System
- [ ] Port base classes:
  - [ ] `Agent.ts`
  - [ ] `PlannerAgent.ts`
  - [ ] `Plan.ts`
  - [ ] `PlanMarker.ts`
  - [ ] `PlanScore.ts`
- [ ] Port planner implementations:
  - [ ] `RandomPlanner.ts`
  - [ ] `GreedyPlanner.ts`
  - [ ] `OrderedPlanner.ts`
  - [ ] `SearchPlanner.ts`
- [ ] Port on-demand variants:
  - [ ] `RandomOnDemandPlanner.ts`
  - [ ] `GreedyOnDemandPlanner.ts`
  - [ ] `OrderedOnDemandPlanner.ts`
  - [ ] `SearchOnDemandPlanner.ts`

#### 3.3 Plan Types & Markers
- [ ] Port week plans:
  - [ ] `WorkAllWeekPlan.ts`
  - [ ] `StudyAllWeekPlan.ts`
  - [ ] `RestAllWeekPlan.ts`
- [ ] Port complex plans:
  - [ ] `GetBetterClothesPlan.ts`
  - [ ] `GetABetterJobPlan.ts`
  - [ ] `MoveToPlan.ts`
  - [ ] `AllOrNothingPlan.ts`
- [ ] Port markers:
  - [ ] `MoveMarker.ts`
  - [ ] `GoToWorkMarker.ts`
  - [ ] `GoHomeMarker.ts`
  - [ ] `BuyClothesMarker.ts`
  - [ ] `UpdateJobMarker.ts`
  - [ ] `PushJobsMarker.ts`
  - [ ] `AddBuildingsWithJobsMarker.ts`
  - [ ] All other markers...

#### 3.4 AI Performance Optimization
- [ ] Move heavy AI computation to Web Workers
  - [ ] Create `workers/aiWorker.ts`
  - [ ] Implement message passing
  - [ ] Handle worker errors
- [ ] Add iterative deepening for SearchPlanner
- [ ] Implement time limits for AI turns
- [ ] Add AI progress indicators
- [ ] Cache common AI decisions

#### 3.5 AI Testing & Debugging
- [ ] Port `AgentSimulation.java` → `simulation/AgentSimulation.ts`
- [ ] Create AI testing suite
- [ ] Add AI visualization mode (show planning tree)
- [ ] Create AI debug UI
- [ ] Run simulations to validate AI behavior
- [ ] Write unit tests for AI planners

### Week 17-18: Advanced Game Modes

#### 3.6 AI Opponent Mode
- [ ] Add player vs. AI mode
  - [ ] Select AI difficulty (Random, Greedy, Search)
  - [ ] Multiple AI opponents
  - [ ] Turn order management
- [ ] Create AI turn visualization
  - [ ] Show AI actions
  - [ ] Optional: Show AI "thinking"
  - [ ] Fast-forward through AI turns
- [ ] Add competitive scoring
- [ ] Add victory against AI

#### 3.7 Campaign Mode
- [ ] Design campaign structure
  - [ ] 10-15 scenarios
  - [ ] Progressive difficulty
  - [ ] Unlock system
- [ ] Create scenario system:
  - [ ] `engine/scenarios/Scenario.ts`
  - [ ] Custom starting conditions
  - [ ] Custom victory conditions
  - [ ] Story snippets
- [ ] Implement campaign scenarios:
  - [ ] Tutorial scenario
  - [ ] "Rags to Riches" scenario
  - [ ] "Career Ladder" scenario
  - [ ] "Education First" scenario
  - [ ] "Speed Run" scenario (time limit)
  - [ ] "Hard Mode" (higher goals)
- [ ] Add campaign UI
  - [ ] Scenario selection
  - [ ] Progress tracking
  - [ ] Unlocked/locked indicators

#### 3.8 Custom Game Mode
- [ ] Create custom game configuration UI
  - [ ] Starting cash
  - [ ] Starting stats
  - [ ] Victory goals (sliders)
  - [ ] Number of weeks
  - [ ] Economic difficulty (prices, wages)
  - [ ] AI opponent selection
- [ ] Add preset configurations
- [ ] Save custom configurations
- [ ] Share configurations (export/import)

#### 3.9 Advanced Features
- [ ] Add replay system
  - [ ] Record all actions
  - [ ] Replay viewer UI
  - [ ] Speed controls
  - [ ] Skip to turn
- [ ] Add achievements system (client-side)
  - [ ] Define 20-30 achievements
  - [ ] Track achievement progress
  - [ ] Achievement notifications
  - [ ] Achievement showcase UI
- [ ] Add statistics tracking
  - [ ] Games played
  - [ ] Win rate
  - [ ] Average completion time
  - [ ] Favorite strategies
- [ ] Add challenge mode
  - [ ] Daily challenge (if backend exists)
  - [ ] Random constraints
  - [ ] Leaderboard (Phase 5)

**Phase 3 Deliverable:** Full single-player experience with AI opponents and game modes

---

## Phase 4: LLM Integration & Generative Content (3-4 weeks)

### Week 19-20: LLM Infrastructure

#### 4.1 AI Provider Setup
- [ ] Create `ai/providers/` directory
- [ ] Implement `OpenAIProvider.ts`
  - [ ] API key management
  - [ ] GPT-4 text generation
  - [ ] DALL-E 3 image generation
  - [ ] Error handling and retries
  - [ ] Rate limiting
- [ ] Implement `AnthropicProvider.ts`
  - [ ] Claude API integration
  - [ ] Streaming support
- [ ] Implement `ReplicateProvider.ts`
  - [ ] Stable Diffusion integration
  - [ ] Model selection
- [ ] (Optional) Implement `OllamaProvider.ts`
  - [ ] Local LLM integration for offline play
  - [ ] Model management
- [ ] Create `AIProviderManager.ts`
  - [ ] Provider selection
  - [ ] Fallback handling
  - [ ] Provider health checks

#### 4.2 Prompt Engineering
- [ ] Create `ai/prompts/` directory with templates
- [ ] Create prompt templates:
  - [ ] `buildingDescription.prompt` - Generate rich building descriptions
  - [ ] `actionNarrative.prompt` - Generate action flavor text
  - [ ] `eventGeneration.prompt` - Create random events
  - [ ] `characterDialogue.prompt` - Generate NPC dialogue
  - [ ] `newsHeadline.prompt` - Generate weekly news
  - [ ] `achievementDescription.prompt` - Generate achievement text
  - [ ] `tutorialText.prompt` - Generate helpful hints
- [ ] Implement prompt templating system
- [ ] Add context injection (game state, player stats)
- [ ] Create prompt testing suite

#### 4.3 Response Caching
- [ ] Implement `ai/cache/ResponseCache.ts`
  - [ ] In-memory cache (LRU)
  - [ ] IndexedDB persistence
  - [ ] Cache invalidation strategies
- [ ] Add cache warming (pre-generate common content)
- [ ] Implement cache statistics/monitoring
- [ ] Add cache clear functionality

### Week 21: Text Generation Integration

#### 4.4 Narrative Generation
- [ ] Create `ai/generators/NarrativeGenerator.ts`
  - [ ] Generate building descriptions on hover
  - [ ] Generate action flavor text
  - [ ] Generate turn summaries
  - [ ] Context-aware narrative (player state)
- [ ] Integrate narratives into UI:
  - [ ] Enhanced building modals
  - [ ] Rich action responses
  - [ ] Story-driven turn transitions
- [ ] Add narrative preferences (verbosity levels)

#### 4.5 Dynamic Event System
- [ ] Create `ai/generators/EventGenerator.ts`
  - [ ] Generate random events (positive/negative)
  - [ ] Generate weekly news headlines
  - [ ] Generate economic events (market changes)
  - [ ] Generate weather events (flavor)
- [ ] Create `engine/events/DynamicEvent.ts`
  - [ ] Event effects on game state
  - [ ] Event probability management
  - [ ] Event history tracking
- [ ] Create event UI:
  - [ ] Event notification modal
  - [ ] Event log/history
  - [ ] Event impact visualization

#### 4.6 Character & Dialogue System
- [ ] Create `ai/generators/DialogueGenerator.ts`
  - [ ] Generate building clerk dialogue
  - [ ] Generate boss dialogue (job applications)
  - [ ] Generate professor dialogue (college)
  - [ ] Context-aware responses
- [ ] Create character personality system:
  - [ ] Define personality traits per building type
  - [ ] Inject personality into prompts
- [ ] Add dialogue to building interactions
- [ ] Create conversation history

#### 4.7 AI Assistant
- [ ] Create `ai/generators/AssistantGenerator.ts`
  - [ ] Answer player questions about game mechanics
  - [ ] Suggest strategies based on game state
  - [ ] Explain complex concepts
  - [ ] Provide encouragement
- [ ] Create `AIAssistant.tsx` UI component
  - [ ] Chat interface
  - [ ] Quick question buttons
  - [ ] Conversation history
  - [ ] Minimize/expand
- [ ] Add assistant toggle in settings
- [ ] Implement streaming responses

### Week 22: Image Generation Integration

#### 4.8 Character Portrait Generation
- [ ] Create `ai/imageGen/CharacterGenerator.ts`
  - [ ] Generate player portraits
  - [ ] Generate NPC portraits (building clerks)
  - [ ] Consistent style prompts
  - [ ] Character customization options
- [ ] Add portrait generation to character creation
- [ ] Display portraits in UI:
  - [ ] Player stats HUD
  - [ ] Building clerk dialogue
- [ ] Implement portrait caching (save to localStorage)
- [ ] Add portrait regeneration option

#### 4.9 Building Illustration Generation
- [ ] Create `ai/imageGen/BuildingGenerator.ts`
  - [ ] Generate building exterior illustrations
  - [ ] Generate building interior backgrounds
  - [ ] Maintain consistent art style
- [ ] Replace/supplement existing building sprites
- [ ] Add generated images to building modals
- [ ] Create building image gallery
- [ ] Allow regeneration with different prompts

#### 4.10 Item & Possession Icons
- [ ] Create `ai/imageGen/ItemGenerator.ts`
  - [ ] Generate food item icons
  - [ ] Generate clothing icons
  - [ ] Generate appliance icons
  - [ ] Consistent icon style (pixel art or modern)
- [ ] Integrate into inventory UI
- [ ] Create item showcase gallery
- [ ] Add item descriptions (text generation)

#### 4.11 Dynamic Visual Effects
- [ ] Generate achievement badges
- [ ] Generate event splash images
- [ ] Generate victory screen backgrounds
- [ ] Generate loading screen art
- [ ] Create image variations for replayability

#### 4.12 Image Generation Optimization
- [ ] Implement image compression
- [ ] Add progressive loading (blur-up)
- [ ] Create fallback system (default images)
- [ ] Add generation queue management
- [ ] Implement batch generation
- [ ] Add user-facing generation progress

### Week 23: Advanced AI Features

#### 4.13 Procedural Content Generation
- [ ] Create `ai/generators/ContentGenerator.ts`
  - [ ] Generate new building types dynamically
  - [ ] Generate new job types
  - [ ] Generate new possession types
  - [ ] Generate new random events
- [ ] Design extensible building system
- [ ] Add "modded content" UI section
- [ ] Create content validation system
- [ ] Add community content sharing (Phase 5)

#### 4.14 Adaptive Difficulty
- [ ] Create `ai/AdaptiveDifficulty.ts`
  - [ ] Analyze player performance
  - [ ] Adjust game parameters dynamically
  - [ ] Suggest difficulty changes
- [ ] Track player skill metrics
- [ ] Add optional difficulty auto-adjustment
- [ ] Create difficulty analytics UI

#### 4.15 Personalized Recommendations
- [ ] Create `ai/generators/RecommendationGenerator.ts`
  - [ ] Analyze player strategy
  - [ ] Suggest next actions based on goals
  - [ ] Warn about potential issues (rent due, low health)
  - [ ] Adaptive tips for struggling players
- [ ] Add recommendation UI (subtle hints)
- [ ] Allow disabling recommendations

#### 4.16 AI Integration Polish
- [ ] Add loading states for AI generation
- [ ] Implement graceful degradation (offline mode)
- [ ] Add AI usage tracking (costs)
- [ ] Create AI settings panel:
  - [ ] Enable/disable AI features
  - [ ] Select AI provider
  - [ ] Adjust verbosity
  - [ ] API key management (if user-provided)
- [ ] Write documentation for AI features
- [ ] Create AI feature showcase

**Phase 4 Deliverable:** Immersive game with dynamic AI-generated content and narratives

---

## Phase 5: Backend & Multiplayer (Optional, 6-8 weeks)

### Week 24-26: Backend Infrastructure

#### 5.1 Project Setup
- [ ] Initialize Node.js + Express + TypeScript backend
- [ ] Set up Prisma ORM + PostgreSQL
- [ ] Configure environment variables
- [ ] Set up backend project structure
- [ ] Configure CORS for frontend
- [ ] Set up Railway/Render deployment
- [ ] Configure CI/CD for backend

#### 5.2 Database Schema
- [ ] Design Prisma schema:
  - [ ] User model (email, password hash, profile)
  - [ ] GameSave model (serialized game state)
  - [ ] GameHistory model (completed games)
  - [ ] Achievement model (unlocked achievements)
  - [ ] Leaderboard model (scores, rankings)
  - [ ] MultiplayerGame model (game rooms)
  - [ ] PlayerGameState model (per-player state in multiplayer)
- [ ] Create initial migration
- [ ] Seed database with test data
- [ ] Set up database backup strategy

#### 5.3 Authentication System
- [ ] Implement user registration
  - [ ] Email validation
  - [ ] Password hashing (bcrypt)
  - [ ] Email verification (optional)
- [ ] Implement login
  - [ ] JWT token generation
  - [ ] Refresh token system
- [ ] Implement logout
- [ ] Add password reset flow
- [ ] Implement OAuth (Google, GitHub - optional)
- [ ] Create auth middleware
- [ ] Write auth tests

#### 5.4 Core API Endpoints
- [ ] User endpoints:
  - [ ] `POST /api/auth/register`
  - [ ] `POST /api/auth/login`
  - [ ] `POST /api/auth/logout`
  - [ ] `GET /api/users/me`
  - [ ] `PATCH /api/users/me`
- [ ] Game save endpoints:
  - [ ] `GET /api/saves` - List user's saves
  - [ ] `POST /api/saves` - Create new save
  - [ ] `GET /api/saves/:id` - Get save
  - [ ] `PUT /api/saves/:id` - Update save
  - [ ] `DELETE /api/saves/:id` - Delete save
- [ ] Leaderboard endpoints:
  - [ ] `GET /api/leaderboards/global`
  - [ ] `GET /api/leaderboards/friends`
  - [ ] `POST /api/leaderboards/submit`
- [ ] Statistics endpoints:
  - [ ] `GET /api/stats/user/:id`
  - [ ] `GET /api/stats/global`

#### 5.5 Redis Integration
- [ ] Set up Redis connection
- [ ] Implement session storage
- [ ] Implement rate limiting
- [ ] Cache leaderboard data
- [ ] Cache frequently accessed data

### Week 27-29: Multiplayer Core

#### 5.6 WebSocket Setup
- [ ] Set up Socket.io server
- [ ] Implement connection handling
- [ ] Add authentication for WebSocket
- [ ] Create event handlers structure
- [ ] Implement heartbeat/ping-pong
- [ ] Handle disconnections gracefully

#### 5.7 Game Room System
- [ ] Create `GameRoom` class
  - [ ] Room creation
  - [ ] Player joining/leaving
  - [ ] Room settings (max players, rules)
  - [ ] Room state management
- [ ] Implement room matchmaking:
  - [ ] Quick match
  - [ ] Private rooms (invite codes)
  - [ ] Custom rooms (public list)
- [ ] Add room persistence (database)
- [ ] Implement room cleanup (abandoned games)

#### 5.8 Turn-Based Multiplayer Logic
- [ ] Implement turn order management
- [ ] Synchronize game state across clients
  - [ ] Broadcast state updates
  - [ ] Handle state conflicts
  - [ ] Validate actions server-side
- [ ] Add turn timer
  - [ ] Configurable time limit
  - [ ] Auto-skip on timeout
  - [ ] Pause system
- [ ] Implement simultaneous turns (optional variant)
- [ ] Add reconnection handling:
  - [ ] Save player progress on disconnect
  - [ ] Allow rejoin within time limit
  - [ ] Bot takeover option

#### 5.9 Multiplayer Events
- [ ] Define Socket.io events:
  - [ ] `game:join` - Join game room
  - [ ] `game:leave` - Leave game room
  - [ ] `game:start` - Start game
  - [ ] `game:action` - Submit action
  - [ ] `game:state` - Receive state update
  - [ ] `game:turn` - Turn notification
  - [ ] `game:end` - Game finished
  - [ ] `chat:message` - Send/receive chat
- [ ] Implement event handlers
- [ ] Add event validation
- [ ] Write multiplayer tests

### Week 30-32: Multiplayer Features & Polish

#### 5.10 Frontend Multiplayer Integration
- [ ] Create `multiplayerStore.ts` (Zustand)
- [ ] Create WebSocket client (`api/websocket.ts`)
- [ ] Create multiplayer UI components:
  - [ ] `GameLobby.tsx` - Browse/create rooms
  - [ ] `GameRoom.tsx` - Waiting room
  - [ ] `PlayerList.tsx` - Show all players
  - [ ] `TurnIndicator.tsx` - Whose turn it is
  - [ ] `OpponentStats.tsx` - See other players' stats
  - [ ] `Chat.tsx` - In-game chat
- [ ] Integrate multiplayer into existing game UI
- [ ] Add multiplayer tutorial
- [ ] Handle multiplayer errors gracefully

#### 5.11 Social Features
- [ ] Implement friend system:
  - [ ] Send/accept friend requests
  - [ ] Friend list
  - [ ] Online status
  - [ ] Invite friends to games
- [ ] Create player profiles:
  - [ ] Display name, avatar
  - [ ] Game statistics
  - [ ] Achievement showcase
  - [ ] Match history
- [ ] Add player search
- [ ] Implement blocking/reporting

#### 5.12 Advanced Features
- [ ] Add spectator mode:
  - [ ] Watch ongoing games
  - [ ] Spectator chat
  - [ ] Follow specific player
- [ ] Implement game replays:
  - [ ] Save replay data server-side
  - [ ] Replay viewer UI
  - [ ] Share replay links
- [ ] Create tournament system (optional):
  - [ ] Tournament brackets
  - [ ] Scheduled matches
  - [ ] Prize/reward system
- [ ] Add daily challenges:
  - [ ] Daily scenario
  - [ ] Leaderboard for daily challenge
  - [ ] Rewards for participation

#### 5.13 Moderation & Safety
- [ ] Implement content moderation:
  - [ ] Chat filtering
  - [ ] User reporting
  - [ ] Admin panel
- [ ] Add player blocking
- [ ] Implement timeout/ban system
- [ ] Create moderation logs
- [ ] Add appeal process

#### 5.14 Testing & Optimization
- [ ] Load testing (many concurrent games)
- [ ] Latency optimization
- [ ] Database query optimization
- [ ] WebSocket message batching
- [ ] Frontend multiplayer testing
- [ ] Write E2E multiplayer tests
- [ ] Security audit
- [ ] Performance monitoring

**Phase 5 Deliverable:** Full multiplayer web game with social features

---

## AI/LLM Integration Strategy

### Use Cases for Generative AI

#### 1. Dynamic Narrative & Immersion

**Implementation:** Use LLMs to generate contextual flavor text

**Examples:**
- **Building Descriptions:** "The Employment Agency buzzes with anxious job seekers. A tired clerk eyes you over thick-rimmed glasses."
- **Action Narratives:** "You spend 8 hours filing paperwork at the factory. The monotony is exhausting, but at least it pays."
- **Weekly Summaries:** "This week was a turning point. Your promotion to Level 3 has opened new doors, but your health is declining from overwork."
- **Random Events:** "Economic Boom! Stock prices surge 20%. Your investments are looking golden."

**Benefits:**
- Every playthrough feels unique
- Rich storytelling without hand-writing thousands of strings
- Context-aware descriptions based on player state
- Adaptive difficulty through narrative hints

#### 2. Procedural Content Generation

**Implementation:** Generate new game content dynamically

**Examples:**
- **New Buildings:** Generate "Coffee Shop" with unique actions, jobs, and economics
- **New Jobs:** Create "Social Media Manager" job with appropriate requirements
- **New Events:** Generate "Tech Startup Boom" event affecting job market
- **New Possessions:** Create "Smart Watch" item with stat bonuses

**Benefits:**
- Infinite replayability
- Community content creation
- Modding without coding
- Seasonal/themed content updates

#### 3. AI-Generated Visuals

**Implementation:** Generate game art using Stable Diffusion or DALL-E

**Examples:**
- **Character Portraits:** Generate unique player avatars
- **Building Illustrations:** Create varied building exteriors/interiors
- **Item Icons:** Generate consistent icon style for all possessions
- **Event Splash Art:** Create dramatic event visuals
- **Achievement Badges:** Generate unique badge designs

**Benefits:**
- Cost-effective art creation
- Consistent art style
- Player customization options
- Rapid prototyping of new content

#### 4. Intelligent AI Opponents

**Implementation:** Enhance existing AI planners with LLM reasoning

**Examples:**
- **Strategy Selection:** LLM analyzes game state and suggests high-level strategy
- **Dynamic Planning:** Generate custom plans based on unique situations
- **Opponent Personality:** Each AI has personality affecting decision-making
- **Adaptive Difficulty:** LLM adjusts opponent skill based on player performance

**Benefits:**
- More human-like opponents
- Unpredictable strategies
- Better learning curve
- Engaging single-player experience

#### 5. Intelligent Game Assistant

**Implementation:** In-game AI helper powered by LLM

**Examples:**
- **Questions:** "How do I get a better job?" → Detailed, context-aware answer
- **Suggestions:** "You should pay rent soon to avoid debt"
- **Explanations:** Clarify complex mechanics
- **Tutorials:** Dynamic, adaptive tutorials

**Benefits:**
- Reduced learning curve
- Better new player retention
- Context-aware help
- Reduced support burden

#### 6. Dynamic Dialogue & NPCs

**Implementation:** Building clerks with LLM-powered dialogue

**Examples:**
- **Bank Clerk:** "Back again? You've been quite the investor lately. Want to check your portfolio?"
- **Boss:** "Your experience is impressive, but we need someone at Level 5. Keep working on it."
- **Professor:** "I've seen many students come through here. Few are as dedicated as you."

**Benefits:**
- Immersive interactions
- Memorable characters
- Reduced repetition
- Emotional connection

### Technical Implementation Details

#### API Key Management
```typescript
// Option 1: User provides API keys (free tier)
// Option 2: Backend proxy (paid tier, rate-limited)
// Option 3: Hybrid (free local LLM via Ollama + paid for premium)

interface AIConfig {
  provider: 'openai' | 'anthropic' | 'ollama' | 'replicate';
  apiKey?: string; // Optional for Ollama
  model: string;
  maxTokens: number;
  temperature: number;
}
```

#### Prompt Template System
```typescript
// ai/prompts/templates.ts
export const templates = {
  buildingDescription: `
    Generate a vivid, brief (2-3 sentences) description for a {buildingType} in a life simulation game.

    Context:
    - Time of day: {timeOfDay}
    - Player's current state: {playerState}
    - Economic condition: {economicState}

    Style: {style} (narrative/humorous/dramatic)
    Tone: {tone} (upbeat/neutral/grim)
  `,

  actionNarrative: `
    The player just performed: {actionType} at {building}

    Result: {actionResult}
    Time spent: {timeCost} hours

    Generate a brief (1-2 sentences) narrative description of what happened.
    Make it contextual to the player's situation: {playerContext}
  `
};
```

#### Caching Strategy
```typescript
// Cache generated content to reduce API costs
interface CacheEntry {
  key: string; // Hash of prompt + context
  content: string;
  timestamp: number;
  hits: number;
}

class AICache {
  // In-memory cache (clear on refresh)
  private memoryCache: Map<string, CacheEntry>;

  // IndexedDB cache (persistent across sessions)
  private persistentCache: IDBDatabase;

  // Pre-generate common content
  async warmCache() {
    // Generate building descriptions for all buildings
    // Generate common action narratives
    // Generate tutorial text
  }
}
```

#### Fallback System
```typescript
// Graceful degradation when AI unavailable
class NarrativeGenerator {
  async generate(prompt: string, context: any): Promise<string> {
    try {
      // Try AI generation
      return await this.aiProvider.generate(prompt, context);
    } catch (error) {
      // Fallback to template strings
      return this.templateFallback(context);
    }
  }

  private templateFallback(context: any): string {
    // Return pre-written generic text
    return fallbackTemplates[context.type] || "You complete the action.";
  }
}
```

#### Cost Management
```typescript
// Track AI usage and costs
interface UsageTracker {
  textTokensUsed: number;
  imagesGenerated: number;
  estimatedCost: number;

  track(operation: 'text' | 'image', tokens: number): void;
  getEstimatedCost(): number;
  hasExceededBudget(): boolean;
}
```

### Privacy & Ethical Considerations

- [ ] Add clear disclosure about AI-generated content
- [ ] Allow opt-out of AI features
- [ ] Don't send identifying information to AI providers
- [ ] Cache aggressively to minimize API calls
- [ ] Implement content filtering for inappropriate AI output
- [ ] Add human review for user-generated prompts
- [ ] Comply with AI provider terms of service
- [ ] Consider data retention policies

---

## Success Criteria

### Technical Metrics
- [ ] **Performance:** 60 FPS gameplay, <3s initial load
- [ ] **Quality:** Lighthouse score >90, WAVE 0 errors
- [ ] **Coverage:** >80% test coverage
- [ ] **Reliability:** <0.1% error rate in production
- [ ] **Bundle Size:** <500KB gzipped (excluding assets)

### User Experience Metrics
- [ ] **Usability:** Tutorial completion rate >60%
- [ ] **Accessibility:** Keyboard navigation 100%, screen reader compatible
- [ ] **Responsiveness:** Works on mobile, tablet, desktop
- [ ] **Browser Support:** Chrome, Firefox, Safari, Edge (latest 2 versions)

### Engagement Metrics (Post-Launch)
- [ ] **Retention:** 7-day return rate >30%
- [ ] **Session Length:** Average >15 minutes
- [ ] **Completion Rate:** >20% finish a game
- [ ] **AI Engagement:** >50% use AI features when available

### Project Completion
- [ ] **Documentation:** Complete README, API docs, contribution guide
- [ ] **Tests:** All critical paths covered
- [ ] **Deployment:** Production deployment successful
- [ ] **Open Source:** Repository public, license added
- [ ] **Community:** GitHub Issues, Discussions enabled

---

## Getting Started

### Immediate Next Steps

1. **Review & Approve Plan**
   - [ ] Read through this task list
   - [ ] Identify any concerns or modifications
   - [ ] Approve technology choices
   - [ ] Commit to timeline

2. **Environment Setup**
   - [ ] Install Node.js (v18+), pnpm
   - [ ] Set up code editor (VS Code recommended)
   - [ ] Clone Java project for reference
   - [ ] Create new project structure

3. **Week 1 Kickoff**
   - [ ] Start with Phase 1, Task 1.1
   - [ ] Set up React + TypeScript + Vite
   - [ ] Initialize Git repository
   - [ ] Create first commit

4. **Establish Workflow**
   - [ ] Create GitHub project board
   - [ ] Set up task tracking
   - [ ] Schedule weekly reviews
   - [ ] Define done criteria

---

## Notes & Considerations

### Prioritization
- **MVP:** Focus on Phase 1-2 for minimum viable product
- **AI Features:** Phase 4 can be done in parallel with Phase 3
- **Multiplayer:** Phase 5 is optional, high effort

### Technology Alternatives
- **Frontend:** Can swap React for Vue 3 or Svelte
- **Rendering:** Can upgrade to PixiJS later for better performance
- **AI:** Can use local Ollama instead of paid APIs
- **Backend:** Can use Firebase for rapid prototyping

### Risk Management
- **Scope Creep:** Stick to phased approach, resist feature bloat
- **AI Costs:** Implement aggressive caching, use free tiers initially
- **Performance:** Profile early and often, optimize hot paths
- **Browser Compatibility:** Test on real devices regularly

### Future Enhancements (Post-Launch)
- Mobile apps (React Native or Capacitor)
- Steam release (Electron wrapper)
- Localization (i18n)
- Mod support (custom content loading)
- Esports/competitive mode
- Streaming integration (Twitch, YouTube)

---

## Resources

### Documentation
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [OpenAI API](https://platform.openai.com/docs)
- [Anthropic API](https://docs.anthropic.com/)

### Tools
- [Figma](https://figma.com) - UI design
- [Excalidraw](https://excalidraw.com) - Quick wireframes
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vitest](https://vitest.dev/) - Testing
- [Playwright](https://playwright.dev/) - E2E testing

### Assets
- [OpenGameArt](https://opengameart.org/) - Free game assets
- [Freesound](https://freesound.org/) - Sound effects
- [Incompetech](https://incompetech.com/) - Royalty-free music
- [Kenney](https://kenney.nl/) - Game assets

---

**Last Updated:** 2025-11-06
**Version:** 1.0
**Status:** Ready to Begin

Let's build something amazing! 🚀
