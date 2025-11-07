# Worker 3: Task B9 - Shopping Buildings (Part 1)

**Session Type:** WORKER
**Branch:** `claude/shopping-buildings-part1-b9-[YOUR-SESSION-ID]`
**Date:** 2025-11-07
**Session:** 2

---

## 🎯 Primary Objective

Implement three shopping building classes (DepartmentStore, ClothesStore, ApplianceStore) that extend the Building base class, offering purchase actions for various possessions.

---

## 📦 Deliverables

- [ ] DepartmentStore.ts (general goods, 100-150 lines)
- [ ] DepartmentStore.test.ts (30+ tests)
- [ ] ClothesStore.ts (clothes by level, 100-150 lines)
- [ ] ClothesStore.test.ts (30+ tests)
- [ ] ApplianceStore.ts (appliances for home, 80-120 lines)
- [ ] ApplianceStore.test.ts (25+ tests)
- [ ] Updated index.ts exports
- [ ] All tests passing with 100% success rate

---

## 🚀 Quick Start

```bash
cd /home/user/openjones/openjones-web
git checkout -b claude/shopping-buildings-part1-b9-[YOUR-SESSION-ID]

# Study existing building patterns
cat frontend/src/engine/buildings/Building.ts
cat frontend/src/engine/buildings/Factory.ts | head -50
cat frontend/src/engine/buildings/Bank.ts | head -50

# Study possessions system (dependency)
cat frontend/src/engine/possessions/index.ts
cat frontend/src/engine/possessions/Clothes.ts
cat frontend/src/engine/possessions/Appliance.ts
```

---

## 📚 Context

Shopping buildings allow players to purchase possessions. These buildings extend the Building base class and offer purchase actions.

**Completed dependencies:**
- ✅ B6: Building base class
- ✅ B5: Possessions system (Food, Clothes, Appliance, Stock)
- ✅ B1: Economy model (pricing)

**Existing building patterns to follow:**
- Factory.ts: Shows job offerings and work actions
- Bank.ts: Shows stock purchase actions
- RentAgency.ts: Shows purchase-like actions with state changes

**Key interfaces:**
```typescript
// From shared/types/contracts.ts
interface IBuilding {
  id: string;
  type: BuildingType;
  name: string;
  description: string;
  position: IPosition;
  getAvailableActions(player: IPlayerState): IAction[];
  getJobOfferings(): IJob[];
  getActionTree(): IActionTreeNode;
  canEnter(player: IPlayerState): boolean;
  isHome(): boolean;
}
```

---

## ✅ Implementation Steps

### Step 1: Implement DepartmentStore

```typescript
// frontend/src/engine/buildings/DepartmentStore.ts
import { Building } from './Building';
import { BuildingType } from '@shared/types/contracts';
import type { IPlayerState, IAction, IActionTreeNode } from '@shared/types/contracts';
import { PurchaseAction } from '../actions/PurchaseAction';
import { Food } from '../possessions/Food';
import { EconomyModel } from '../economy/EconomyModel';

/**
 * Department Store - Sells general goods (food items)
 */
export class DepartmentStore extends Building {
  private economy: EconomyModel;

  constructor(id: string, position: IPosition) {
    super({
      id,
      type: BuildingType.DEPARTMENT_STORE,
      name: 'Department Store',
      description: 'Buy food and general goods',
      position
    });

    this.economy = new EconomyModel();
  }

  public getAvailableActions(player: IPlayerState): IAction[] {
    const actions: IAction[] = [];

    // Food purchase actions
    const foodItems = [
      { name: 'Hamburger', cost: 10, nutritionValue: 15 },
      { name: 'Pizza', cost: 15, nutritionValue: 20 },
      { name: 'Steak', cost: 25, nutritionValue: 30 }
    ];

    foodItems.forEach(item => {
      const food = new Food(item.name, item.cost, item.nutritionValue);
      const action = new PurchaseAction(
        `Buy ${item.name}`,
        food,
        item.cost,
        `Purchase ${item.name} for $${item.cost}`
      );
      actions.push(action);
    });

    return actions;
  }

  public getActionTree(): IActionTreeNode {
    return {
      id: 'department-store-root',
      label: 'Department Store',
      action: null,
      children: [
        {
          id: 'buy-food',
          label: 'Buy Food',
          action: null,
          children: [
            {
              id: 'buy-hamburger',
              label: 'Hamburger ($10)',
              action: { type: 'PURCHASE', name: 'Buy Hamburger' },
              children: []
            },
            // Add other food items...
          ]
        }
      ]
    };
  }

  public canEnter(player: IPlayerState): boolean {
    return true; // Anyone can enter
  }

  public isHome(): boolean {
    return false;
  }

  public getJobOfferings(): IJob[] {
    return []; // No jobs at department store
  }
}
```

### Step 2: Implement ClothesStore

```typescript
// frontend/src/engine/buildings/ClothesStore.ts
import { Building } from './Building';
import { BuildingType } from '@shared/types/contracts';
import { Clothes } from '../possessions/Clothes';
import { EconomyModel } from '../economy/EconomyModel';

/**
 * Clothes Store - Sells clothing by quality level (1-9)
 */
export class ClothesStore extends Building {
  private economy: EconomyModel;

  constructor(id: string, position: IPosition) {
    super({
      id,
      type: BuildingType.CLOTHES_STORE,
      name: 'Clothes Store',
      description: 'Buy clothes for different job levels',
      position
    });

    this.economy = new EconomyModel();
  }

  public getAvailableActions(player: IPlayerState): IAction[] {
    const actions: IAction[] = [];

    // Offer clothes for levels 1-9
    for (let level = 1; level <= 9; level++) {
      const price = this.economy.getPrice(`clothes_level_${level}`);
      const clothes = new Clothes(`Level ${level} Clothes`, price, level);

      const action = new PurchaseAction(
        `Buy Level ${level} Clothes`,
        clothes,
        price,
        `Professional attire for level ${level} jobs`
      );

      actions.push(action);
    }

    return actions;
  }

  public getActionTree(): IActionTreeNode {
    return {
      id: 'clothes-store-root',
      label: 'Clothes Store',
      action: null,
      children: [
        {
          id: 'buy-clothes',
          label: 'Buy Clothes',
          action: null,
          children: this.getClothesMenuItems()
        }
      ]
    };
  }

  private getClothesMenuItems(): IActionTreeNode[] {
    const items: IActionTreeNode[] = [];

    for (let level = 1; level <= 9; level++) {
      const price = this.economy.getPrice(`clothes_level_${level}`);
      items.push({
        id: `buy-clothes-${level}`,
        label: `Level ${level} ($${price})`,
        action: { type: 'PURCHASE', name: `Buy Level ${level} Clothes` },
        children: []
      });
    }

    return items;
  }

  public canEnter(player: IPlayerState): boolean {
    return true;
  }

  public isHome(): boolean {
    return false;
  }

  public getJobOfferings(): IJob[] {
    return [];
  }
}
```

### Step 3: Implement ApplianceStore

```typescript
// frontend/src/engine/buildings/ApplianceStore.ts
import { Building } from './Building';
import { BuildingType } from '@shared/types/contracts';
import { Appliance } from '../possessions/Appliance';
import { EconomyModel } from '../economy/EconomyModel';

/**
 * Appliance Store - Sells household appliances
 */
export class ApplianceStore extends Building {
  private economy: EconomyModel;

  constructor(id: string, position: IPosition) {
    super({
      id,
      type: BuildingType.APPLIANCE_STORE,
      name: 'Appliance Store',
      description: 'Buy appliances for your home',
      position
    });

    this.economy = new EconomyModel();
  }

  public getAvailableActions(player: IPlayerState): IAction[] {
    const actions: IAction[] = [];

    const appliances = [
      { name: 'Microwave', cost: 150, effect: 'comfort' },
      { name: 'Television', cost: 300, effect: 'happiness' },
      { name: 'Air Conditioner', cost: 500, effect: 'comfort' },
      { name: 'Computer', cost: 800, effect: 'education' }
    ];

    appliances.forEach(item => {
      const appliance = new Appliance(item.name, item.cost);
      const action = new PurchaseAction(
        `Buy ${item.name}`,
        appliance,
        item.cost,
        `${item.name} for your home`
      );
      actions.push(action);
    });

    // Only show affordable items
    return actions.filter(action =>
      player.canAfford(action.getCost ? action.getCost() : 0)
    );
  }

  public getActionTree(): IActionTreeNode {
    return {
      id: 'appliance-store-root',
      label: 'Appliance Store',
      action: null,
      children: [
        {
          id: 'buy-appliances',
          label: 'Buy Appliances',
          action: null,
          children: [
            { id: 'buy-microwave', label: 'Microwave ($150)', action: { type: 'PURCHASE', name: 'Buy Microwave' }, children: [] },
            { id: 'buy-tv', label: 'Television ($300)', action: { type: 'PURCHASE', name: 'Buy Television' }, children: [] },
            { id: 'buy-ac', label: 'Air Conditioner ($500)', action: { type: 'PURCHASE', name: 'Buy Air Conditioner' }, children: [] },
            { id: 'buy-computer', label: 'Computer ($800)', action: { type: 'PURCHASE', name: 'Buy Computer' }, children: [] }
          ]
        }
      ]
    };
  }

  public canEnter(player: IPlayerState): boolean {
    return true;
  }

  public isHome(): boolean {
    return false;
  }

  public getJobOfferings(): IJob[] {
    return [];
  }
}
```

### Step 4: Write Comprehensive Tests

For each building, test:
- Construction and properties
- getAvailableActions returns correct actions
- Actions are PurchaseActions with correct costs
- getActionTree returns valid tree structure
- canEnter always returns true
- isHome returns false
- getJobOfferings returns empty array
- Purchases correctly create possessions
- Only affordable items shown (for ApplianceStore)

### Step 5: Update Exports

```typescript
// frontend/src/engine/buildings/index.ts
export { Building } from './Building';
export { Factory } from './Factory';
export { College } from './College';
export { Bank } from './Bank';
export { RentAgency } from './RentAgency';
export { LowCostApartment } from './LowCostApartment';
export { SecurityApartment } from './SecurityApartment';
export { DepartmentStore } from './DepartmentStore';
export { ClothesStore } from './ClothesStore';
export { ApplianceStore } from './ApplianceStore';
```

---

## 🧪 Testing Requirements

- **Framework:** Vitest (NOT Jest)
- **Minimum Tests:** 85+ total (30 per store minimum)
- **Coverage:** Construction, actions, pricing, affordability, action trees

**Test pattern:**
```typescript
import { describe, it, expect } from 'vitest';
import { DepartmentStore } from './DepartmentStore';
import type { IPlayerState } from '@shared/types/contracts';

describe('DepartmentStore', () => {
  const mockPosition = { x: 0, y: 0, equals: () => false, toString: () => '0,0' };
  const mockPlayer: IPlayerState = {
    cash: 100,
    canAfford: (amount: number) => mockPlayer.cash >= amount,
    // ... other properties
  };

  it('should create department store with correct properties', () => {
    const store = new DepartmentStore('dept-1', mockPosition);
    expect(store.name).toBe('Department Store');
    expect(store.type).toBe(BuildingType.DEPARTMENT_STORE);
  });

  it('should offer food purchase actions', () => {
    const store = new DepartmentStore('dept-1', mockPosition);
    const actions = store.getAvailableActions(mockPlayer);
    expect(actions.length).toBeGreaterThan(0);
    expect(actions[0].name).toContain('Buy');
  });

  // Add 28+ more tests...
});
```

---

## 🔍 Verification Checklist

**Before claiming completion, verify ALL of these:**

### Code
- [ ] All 3 buildings created: `ls -la frontend/src/engine/buildings/{Department,Clothes,Appliance}Store.ts`
- [ ] No syntax errors: `npm run type-check`
- [ ] Extends Building base class
- [ ] Implements all required methods
- [ ] Uses EconomyModel for pricing
- [ ] Creates Possession instances correctly

### Tests
- [ ] All test files exist: `ls -la frontend/src/engine/buildings/*Store.test.ts`
- [ ] Tests pass: `npm test -- frontend/src/engine/buildings/*Store.test.ts`
- [ ] Test count: 85+ tests total
- [ ] All buildings tested thoroughly

### Git
- [ ] Changes staged: `git status`
- [ ] Committed: `git log -1 --oneline`
- [ ] Pushed: `git push -u origin claude/shopping-buildings-part1-b9-[YOUR-SESSION-ID]`
- [ ] Verified: `git ls-remote origin claude/shopping-buildings-part1-b9-[YOUR-SESSION-ID]`

### Final Commands
```bash
# Run ALL these commands and paste output in your report
npm run type-check 2>&1 | grep -E "Store\.(ts|tsx)" || echo "No errors"
npm test -- frontend/src/engine/buildings/DepartmentStore.test.ts 2>&1 | tail -15
npm test -- frontend/src/engine/buildings/ClothesStore.test.ts 2>&1 | tail -15
npm test -- frontend/src/engine/buildings/ApplianceStore.test.ts 2>&1 | tail -15
ls -la frontend/src/engine/buildings/*Store.{ts,test.ts}
git log -1 --oneline
```

---

## 🚫 Common Mistakes to Avoid

1. **Not following Building pattern** - Extend Building, don't create from scratch
2. **Wrong import paths** - Use `@shared/types/contracts`
3. **Forgetting to use EconomyModel** - Don't hardcode all prices
4. **Not creating Possession instances** - Actions need actual possession objects
5. **Missing action trees** - getActionTree is required for UI

---

## 📝 Final Report Template

```markdown
# Worker 3 Report: Task B9 - Shopping Buildings (Part 1)

**Branch:** claude/shopping-buildings-part1-b9-[actual-session-id]
**Commit:** [paste: git log -1 --format=%h]

## Deliverables
✅ DepartmentStore.ts (XX lines, XX tests)
✅ ClothesStore.ts (XX lines, XX tests)
✅ ApplianceStore.ts (XX lines, XX tests)
✅ All test files
✅ Updated exports

## Test Results
- DepartmentStore: XX tests passing
- ClothesStore: XX tests passing
- ApplianceStore: XX tests passing
- Total: XX/XX tests (100%)

## Type Check
- Status: ✅ PASSED

## Files Verified
[Paste output of: ls -la frontend/src/engine/buildings/*Store.*]

## Issues Encountered
[None, or describe]

## Notes
- All buildings ready for UI integration
- Purchase actions properly configured
- Ready for Part 2 (B10) - PawnShop, Restaurant, Supermarket
```

---

## 💡 Tips for Success

- **Study existing buildings first** - Factory, Bank, RentAgency show patterns
- **Use Possessions system** - Food, Clothes, Appliance classes already exist
- **Test affordability** - Some actions should filter by player cash
- **Action trees matter** - UI will use these for menus
- **Write lots of tests** - Session 1 workers averaged 396% of minimum!

---

## 📚 Reference

**Building Base:** `frontend/src/engine/buildings/Building.ts`
**Existing Buildings:** `frontend/src/engine/buildings/{Factory,Bank,RentAgency}.ts`
**Possessions:** `frontend/src/engine/possessions/`
**Economy:** `frontend/src/engine/economy/EconomyModel.ts`
**Contracts:** `shared/types/contracts.ts`

---

**Instructions generated:** 2025-11-07
**Session:** 2
**Good luck!** 🚀
