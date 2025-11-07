# Task Pool - OpenJones Browser Port

**Self-Service Task Board**
**Pick any "Available" task and mark it "In Progress [Worker N]"**

**Last Updated:** 2025-11-06

---

## 🎯 How to Use This Task Pool

1. **Find a task** marked "Available" below
2. **Claim it** by changing status to "In Progress [Worker N]"
3. **Update WORKER_STATUS.md** with your assignment
4. **Create branch** `git checkout -b worker-[N]/[task-name]`
5. **Start coding** following the task description
6. **When done** mark task "Complete [Worker N]" and create PR

**Priority levels:**
- 🔴 P0 - Critical (blocks other work)
- 🟠 P1 - High (important, many dependencies)
- 🟡 P2 - Medium (useful, some dependencies)
- 🟢 P3 - Low (nice to have, few dependencies)

---

## 📋 WEEK 2 TASKS

### Track A: Core Engine

#### Task A1: Position & Route Classes
**Priority:** 🔴 P0
**Status:** Available
**Estimated:** 2-3 hours
**Files:** `frontend/src/engine/types/Position.ts`, `Route.ts`
**Description:**
- Implement `Position` class (IPosition interface)
- Implement `Route` class (IRoute interface)
- Methods: `equals()`, `toString()`, distance calculation
- Write comprehensive unit tests

**Dependencies:** None
**Blocks:** Map implementation (Task B2)

---

#### Task A2: Game State Management
**Priority:** 🔴 P0
**Status:** ✅ Complete [Worker 1]
**Estimated:** 6-8 hours
**Files:** `frontend/src/engine/game/Game.ts`
**Description:**
- Implement `Game` class (IGame interface)
- Methods: `initialize()`, `processTurn()`, `advanceTime()`, `nextPlayer()`
- Turn management (600 time units per week)
- Victory checking
- Serialization (save/load)
- Write unit tests

**Dependencies:** Task A3 (can use MockPlayerState initially)
**Blocks:** Everything (critical foundation)

---

#### Task A3: Player State
**Priority:** 🔴 P0
**Status:** ✅ Complete [Worker 3]
**Estimated:** 4-6 hours
**Files:** `frontend/src/engine/game/PlayerState.ts`, `Player.ts`
**Description:**
- Implement `PlayerState` class (IPlayerState interface)
- All properties: cash, health, happiness, education, career, etc.
- Methods: `clone()`, `updateMeasure()`, `canAfford()`, `meetsJobRequirements()`
- Implement `Player` class (IPlayer interface)
- Write unit tests with edge cases

**Dependencies:** None
**Blocks:** Task A2, all actions

---

#### Task A4: Base Action Classes
**Priority:** 🟠 P1
**Status:** ✅ Complete [Worker 1]
**Estimated:** 3-4 hours
**Files:** `frontend/src/engine/actions/Action.ts`, `ActionResponse.ts`
**Description:**
- Implement `Action` abstract class (IAction interface)
- Implement `ActionResponse` (IActionResponse interface)
- Action factory/registry pattern
- Write base tests

**Dependencies:** Task A3 (PlayerState)
**Blocks:** All specific actions

---

#### Task A5: Movement Actions
**Priority:** 🟠 P1
**Status:** ✅ Complete [Worker 1]
**Estimated:** 3-4 hours
**Files:** `frontend/src/engine/actions/Movement.ts`, `EnterBuildingMovement.ts`, `ExitBuildingMovement.ts`
**Description:**
- Implement movement action classes
- Time cost calculations
- Position updates
- Building entry/exit logic
- Write unit tests

**Dependencies:** Task A4 (base actions), Task B2 (Map - use mock)
**Blocks:** Game playability

---

#### Task A6: Work & Study Actions
**Priority:** 🟠 P1
**Status:** ✅ Complete [Worker 1]
**Estimated:** 4-5 hours
**Files:** `frontend/src/engine/actions/WorkAction.ts`, `StudyAction.ts`, `RelaxAction.ts`
**Description:**
- Implement `WorkAction` (earn money, gain experience, lose health)
- Implement `StudyAction` (gain education, cost money, spend time)
- Implement `RelaxAction` (restore happiness/health)
- Write unit tests for all three

**Dependencies:** Task A3 (PlayerState), Task B3 (Jobs - use mock)
**Blocks:** Core gameplay loop

---

#### Task A7: Purchase & Economic Actions
**Priority:** 🟠 P1
**Status:** Available
**Estimated:** 5-6 hours
**Files:** `frontend/src/engine/actions/PurchaseAction.ts`, `PurchaseClothesAction.ts`, `ApplyForJobAction.ts`, `PayRentAction.ts`, `RentHouseAction.ts`
**Description:**
- Implement all economic action classes
- Price checking, affordability validation
- Possession management
- Job application logic
- Rent payment and debt handling
- Write unit tests

**Dependencies:** Task A3, Task B1 (Economy), Task B3 (Jobs)
**Blocks:** Full game functionality

---

#### Task A8: Zustand Game Store
**Priority:** 🟡 P2
**Status:** Available
**Estimated:** 3-4 hours
**Files:** `frontend/src/store/gameStore.ts`
**Description:**
- Create Zustand store for game state
- Actions: start game, process turn, save/load
- State persistence to localStorage
- Selectors for UI components
- Integration tests

**Dependencies:** Task A2 (Game)
**Blocks:** UI integration

---

### Track B: Domain Logic

#### Task B1: Economy Model
**Priority:** 🔴 P0
**Status:** ✅ Complete [Worker 2]
**Estimated:** 3-4 hours
**Files:** `frontend/src/engine/economy/EconomyModel.ts`
**Description:**
- Implement `EconomyModel` class (IEconomyModel interface)
- Methods: `getPrice()`, `getWage()`, `getRent()`, `getStockPrice()`, `calculateSellPrice()`
- Port constants from Java ConstantEconomyModel
- Write unit tests with various scenarios

**Dependencies:** None
**Blocks:** All economic actions, building interactions

---

#### Task B2: Map System
**Priority:** 🔴 P0
**Status:** ✅ Complete [Worker 2]
**Estimated:** 4-5 hours
**Files:** `frontend/src/engine/map/Map.ts`
**Description:**
- Implement `Map` class (IMap interface)
- 5x5 grid initialization
- Building placement and lookup
- Position validation
- Route finding (simple Manhattan distance initially)
- `getAdjacentPositions()` for movement
- Write unit tests

**Dependencies:** Task A1 (Position)
**Blocks:** Rendering, movement actions

---

#### Task B3: Job System
**Priority:** 🟠 P1
**Status:** ✅ Complete [Worker 3]
**Estimated:** 3-4 hours
**Files:** `frontend/src/engine/jobs/Job.ts`, `Unemployed.ts`
**Description:**
- Implement `Job` class structure
- Job ranks (1-9) with requirements
- Experience tracking per rank
- Requirements validation (education, experience, clothes)
- Create `Unemployed` job type
- Write unit tests

**Dependencies:** None
**Blocks:** Work actions, building job offerings

---

#### Task B4: Measures System
**Priority:** 🟠 P1
**Status:** ✅ Complete [Worker 2]
**Estimated:** 4-5 hours
**Files:** `frontend/src/engine/measures/Measure.ts`, `Health.ts`, `Happiness.ts`, `Education.ts`, `Career.ts`, `Wealth.ts`
**Description:**
- Implement base `Measure` class
- Implement all 5 measure types
- Value constraints (0-100 for most)
- Decay/growth logic
- Effects on gameplay
- Write unit tests for each

**Dependencies:** None
**Blocks:** Player state updates, victory conditions

---

#### Task B5: Possessions System
**Priority:** 🟡 P2
**Status:** Available
**Estimated:** 4-5 hours
**Files:** `frontend/src/engine/possessions/Possession.ts`, `Food.ts`, `Clothes.ts`, `Appliance.ts`, `Stock.ts`
**Description:**
- Implement base `Possession` class (IPossession interface)
- Implement possession types (Food, Clothes, Appliance, Stock)
- Effects system (health boost, happiness, etc.)
- Food spoilage logic (if time permits)
- Inventory management helpers
- Write unit tests

**Dependencies:** None
**Blocks:** Purchase actions, inventory UI

---

#### Task B6: Building Base Class
**Priority:** 🟠 P1
**Status:** ✅ Complete [Worker 3]
**Estimated:** 3-4 hours
**Files:** `frontend/src/engine/buildings/Building.ts`
**Description:**
- Implement abstract `Building` class (IBuilding interface)
- Action tree system (for menus)
- Job offerings structure
- Entry validation
- `isHome()` helper
- Write base tests

**Dependencies:** Task B2 (Map for position)
**Blocks:** All specific buildings

---

#### Task B7: Core Buildings (Factory, College, Bank)
**Priority:** 🟠 P1
**Status:** ✅ Complete [Worker 2]
**Estimated:** 5-6 hours
**Files:** `frontend/src/engine/buildings/EmploymentAgency.ts`, `Factory.ts`
**Description:**
- Implement `EmploymentAgency` building
  - View all available jobs
  - Apply for jobs
  - Action tree structure
- Implement `Factory` building
  - Work actions (different ranks)
  - Job offerings (rank 1-5)
- Write unit tests for both

**Dependencies:** Task B6 (Building base), Task B3 (Jobs)
**Blocks:** Employment gameplay

---

#### Task B8: Education & Finance Buildings
**Priority:** 🟠 P1
**Status:** Available
**Estimated:** 5-6 hours
**Files:** `frontend/src/engine/buildings/College.ts`, `Bank.ts`
**Description:**
- Implement `College` building
  - Study actions (various hours)
  - Education gain rates
  - Costs
- Implement `Bank` building
  - Stock market interactions
  - Buy/sell stocks
  - Account management
- Write unit tests for both

**Dependencies:** Task B6 (Building base)
**Blocks:** Education and investment gameplay

---

#### Task B9: Shopping Buildings (Part 1)
**Priority:** 🟡 P2
**Status:** Available
**Estimated:** 6-7 hours
**Files:** `frontend/src/engine/buildings/DepartmentStore.ts`, `ClothesStore.ts`, `ApplianceStore.ts`
**Description:**
- Implement `DepartmentStore` (general goods)
- Implement `ClothesStore` (clothes by level)
- Implement `ApplianceStore` (appliances for home)
- Purchase actions
- Inventory available items
- Price calculations
- Write unit tests

**Dependencies:** Task B6 (Building), Task B5 (Possessions), Task B1 (Economy)
**Blocks:** Shopping gameplay

---

#### Task B10: Shopping Buildings (Part 2)
**Priority:** 🟡 P2
**Status:** Available
**Estimated:** 4-5 hours
**Files:** `frontend/src/engine/buildings/PawnShop.ts`, `Restaurant.ts`, `Supermarket.ts`
**Description:**
- Implement `PawnShop` (sell possessions)
- Implement `Restaurant` (buy prepared food, expensive)
- Implement `Supermarket` (buy groceries, cheaper)
- Sell calculations (pawn shop)
- Write unit tests

**Dependencies:** Task B6, Task B5, Task B1
**Blocks:** Full shopping experience

---

#### Task B11: Housing Buildings
**Priority:** 🟠 P1
**Status:** Available
**Estimated:** 5-6 hours
**Files:** `frontend/src/engine/buildings/RentAgency.ts`, `LowCostApartment.ts`, `SecurityApartment.ts`
**Description:**
- Implement `RentAgency` (rent/manage homes)
- Implement `LowCostApartment` ($305/week)
- Implement `SecurityApartment` ($445/week)
- Rent payment logic
- Debt tracking
- Home benefits (relax effectiveness)
- Write unit tests

**Dependencies:** Task B6, Task B1
**Blocks:** Housing gameplay, rent management

---

### Track C: UI Components

#### Task C1: Design System Setup
**Priority:** 🟡 P2
**Status:** ✅ Complete [Worker 3]
**Estimated:** 4-5 hours
**Files:** `frontend/src/components/ui/*`, Tailwind config
**Description:**
- Install and configure Tailwind CSS (if not already done)
- Install shadcn/ui
- Define color palette (light/dark mode)
- Define typography scale
- Create base components: Button, Card, Input, Select
- Document component library

**Dependencies:** None
**Blocks:** All UI components

---

#### Task C2: Player Stats HUD
**Priority:** 🟠 P1
**Status:** ✅ Complete [Worker 3]
**Estimated:** 4-5 hours
**Files:** `frontend/src/components/PlayerStats/PlayerStatsHUD.tsx`
**Description:**
- Create HUD component showing:
  - Cash, Health, Happiness, Education, Career
  - Current week number
  - Time remaining (units/hours)
  - Victory progress indicators
- Connect to game store (use mock initially)
- Responsive design
- Write component tests

**Dependencies:** Task C1 (design system), Task A8 (game store - use mock)
**Blocks:** Game UI

---

#### Task C3: Building Modal
**Priority:** 🟠 P1
**Status:** Available
**Estimated:** 5-6 hours
**Files:** `frontend/src/components/Buildings/BuildingModal.tsx`
**Description:**
- Modal dialog for building interactions
- Display building name, description
- Action menu (tree structure)
- Action selection and confirmation
- Result display
- Entry/exit transitions
- Write component tests

**Dependencies:** Task C1
**Blocks:** Building interactions

---

#### Task C4: Action Menu System
**Priority:** 🟠 P1
**Status:** Available
**Estimated:** 4-5 hours
**Files:** `frontend/src/components/Buildings/ActionMenu.tsx`
**Description:**
- Tree-based menu navigation
- Sub-menu support
- Display action costs (time, money)
- Show requirements (disabled if not met)
- Keyboard navigation (number keys)
- Write component tests

**Dependencies:** Task C1
**Blocks:** Building interaction UX

---

#### Task C5: Game Board Component
**Priority:** 🟡 P2
**Status:** Available
**Estimated:** 3-4 hours
**Files:** `frontend/src/components/GameBoard/GameBoard.tsx`
**Description:**
- Main game view container
- Canvas wrapper
- Click/touch event handling
- Grid position mapping (canvas to game coords)
- Responsive layout
- Write component tests

**Dependencies:** Task C1, Task D2 (rendering - can integrate later)
**Blocks:** Full game UI

---

#### Task C6: Main Menu & Game Setup
**Priority:** 🟡 P2
**Status:** Available
**Estimated:** 4-5 hours
**Files:** `frontend/src/components/Menus/MainMenu.tsx`, `GameSetup.tsx`
**Description:**
- Create `MainMenu` with options: New Game, Load Game, Settings, Credits
- Create `GameSetup` for configuring new game:
  - Player name, color
  - Difficulty selection
  - Victory goals customization
  - Starting conditions
- Form validation
- Write component tests

**Dependencies:** Task C1
**Blocks:** Game initialization UX

---

#### Task C7: Victory & Game Over Screens
**Priority:** 🟢 P3
**Status:** Available
**Estimated:** 3-4 hours
**Files:** `frontend/src/components/Menus/VictoryScreen.tsx`, `GameOverScreen.tsx`
**Description:**
- Victory screen with:
  - Celebration animation
  - Final statistics
  - Play again option
- Game over screen with:
  - Conditions not met display
  - Statistics review
- Write component tests

**Dependencies:** Task C1
**Blocks:** Game completion UX

---

### Track D: Rendering

#### Task D1: Asset Preparation
**Priority:** 🟠 P1
**Status:** Available
**Estimated:** 3-4 hours
**Files:** `frontend/public/images/*`, `scripts/optimize-assets.js`
**Description:**
- Copy PNG assets from Java project (`../../openjones/openjones/images/`)
- Optimize images (compress, convert to WebP if beneficial)
- Organize by type: buildings/, characters/, items/, tiles/
- Create asset manifest file
- Document asset structure

**Dependencies:** None
**Blocks:** Rendering implementation

---

#### Task D2: Sprite Manager
**Priority:** 🟠 P1
**Status:** Available
**Estimated:** 4-5 hours
**Files:** `frontend/src/rendering/SpriteManager.ts`
**Description:**
- Implement `SpriteManager` class
- Load sprite images asynchronously
- Image caching system
- Sprite lookup by ID
- Handle loading errors gracefully
- Progress tracking (for loading screens)
- Write unit tests

**Dependencies:** Task D1 (assets)
**Blocks:** All rendering

---

#### Task D3: Map Renderer
**Priority:** 🟠 P1
**Status:** Available
**Estimated:** 5-6 hours
**Files:** `frontend/src/rendering/MapRenderer.ts`
**Description:**
- Implement `MapRenderer` class
- Initialize Canvas context
- Render 5x5 grid
- Render building tiles
- Render empty spaces
- Handle window resizing
- Render layers (background, tiles, sprites, UI)
- Write rendering tests

**Dependencies:** Task D2 (SpriteManager), Task B2 (Map - use mock)
**Blocks:** Visual game board

---

#### Task D4: Animation Engine
**Priority:** 🟡 P2
**Status:** Available
**Estimated:** 5-6 hours
**Files:** `frontend/src/rendering/AnimationEngine.ts`
**Description:**
- Implement frame-based animation system
- Tween animations for smooth movement
- Animation queue management
- Player sprite rendering with animations:
  - Movement transitions
  - Entrance/exit animations
  - Idle animations
- RequestAnimationFrame loop
- Write tests

**Dependencies:** Task D2
**Blocks:** Smooth game visuals

---

#### Task D5: Effects Renderer
**Priority:** 🟢 P3
**Status:** Available
**Estimated:** 4-5 hours
**Files:** `frontend/src/rendering/EffectsRenderer.ts`
**Description:**
- Particle systems (money, sparkles)
- Action impact effects
- Building glow on hover
- Visual feedback for state changes
- FPS counter (dev mode)
- Write tests

**Dependencies:** Task D3
**Blocks:** Visual polish

---

### Track E: AI System (Week 4+)

#### Task E1: A* Pathfinding
**Priority:** 🟠 P1 (Week 4)
**Status:** Not Yet Available
**Estimated:** 6-8 hours
**Files:** `frontend/src/engine/agents/AStar.ts`
**Description:**
- Port A* algorithm from Java
- State space node structure
- Heuristic functions
- Configurable depth limits
- Optimize for browser performance
- Consider Web Workers for heavy computation
- Write performance tests

**Dependencies:** Task A2, Task A3 (Game, PlayerState)
**Available:** Week 4+

---

#### Task E2: Base Agent Classes
**Priority:** 🟠 P1 (Week 4)
**Status:** Not Yet Available
**Estimated:** 4-5 hours
**Files:** `frontend/src/engine/agents/Agent.ts`, `PlannerAgent.ts`, `Plan.ts`, `PlanMarker.ts`
**Description:**
- Implement base `Agent` interface
- Implement `PlannerAgent` base class
- Implement `Plan` and `PlanMarker` interfaces
- Plan scoring system
- Write base tests

**Dependencies:** Task A2
**Available:** Week 4+

---

#### Task E3: AI Planners
**Priority:** 🟡 P2 (Week 5)
**Status:** Not Yet Available
**Estimated:** 8-10 hours
**Files:** `frontend/src/engine/agents/RandomPlanner.ts`, `GreedyPlanner.ts`, `OrderedPlanner.ts`, `SearchPlanner.ts`
**Description:**
- Implement `RandomPlanner` (random action selection)
- Implement `GreedyPlanner` (short-term optimization)
- Implement `OrderedPlanner` (follows predefined plan)
- Implement `SearchPlanner` (uses A* for optimal planning)
- Write tests for each

**Dependencies:** Task E1, Task E2
**Available:** Week 5+

---

## 📊 Task Statistics

**Total tasks:** 41
**Available now:** 35 (Week 2-3 tasks)
**Available later:** 6 (Week 4+, AI system)

**By Track:**
- Track A: 8 tasks
- Track B: 11 tasks
- Track C: 7 tasks
- Track D: 5 tasks
- Track E: 6 tasks (starts Week 4)

**By Priority:**
- 🔴 P0 (Critical): 5 tasks
- 🟠 P1 (High): 18 tasks
- 🟡 P2 (Medium): 12 tasks
- 🟢 P3 (Low): 2 tasks

---

## 🎯 Recommended Task Order

### Week 2 (Start Here)
**Critical path (do these first):**
1. Task A1 - Position & Route (enables Map)
2. Task B1 - Economy Model (enables pricing)
3. Task A3 - Player State (enables Game)
4. Task A2 - Game State (enables everything)
5. Task B2 - Map System (enables rendering)

**High value parallel work:**
- Task B3 - Job System
- Task B4 - Measures System
- Task B6 - Building Base Class
- Task C1 - Design System
- Task D1 - Asset Preparation

### Week 3
**After core is ready:**
- Task A4, A5, A6, A7 - All actions
- Task B7-B11 - All buildings
- Task C2, C3, C4 - Core UI components
- Task D2, D3 - Rendering system

### Week 4+
- Task E1, E2, E3 - AI system
- Task C5, C6, C7 - Additional UI
- Task D4, D5 - Animation and effects

---

## 📝 Task Template

When you want to add a new task, use this format:

```markdown
#### Task [Track][Number]: [Task Name]
**Priority:** 🔴/🟠/🟡/🟢 P0-P3
**Status:** Available | In Progress [Worker N] | Complete [Worker N]
**Estimated:** X-Y hours
**Files:** `path/to/files.ts`
**Description:**
- What needs to be implemented
- Key requirements
- Expected outcomes

**Dependencies:** Task IDs or "None"
**Blocks:** What depends on this task
```

---

**Last updated:** 2025-11-06
**Update this file when claiming or completing tasks!**
