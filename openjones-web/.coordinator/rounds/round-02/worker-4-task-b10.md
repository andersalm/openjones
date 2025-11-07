# Worker 4: Task B10 - Shopping Buildings (Part 2)

**Session Type:** WORKER
**Branch:** `claude/shopping-buildings-part2-b10-[YOUR-SESSION-ID]`
**Date:** 2025-11-07
**Session:** 2

---

## 🎯 Primary Objective

Implement three additional shopping building classes (PawnShop, Restaurant, Supermarket) that complete the shopping system, with PawnShop offering sell actions and the others offering food purchases at different price points.

---

## 📦 Deliverables

- [ ] PawnShop.ts (selling possessions, 120-180 lines)
- [ ] PawnShop.test.ts (35+ tests)
- [ ] Restaurant.ts (expensive prepared food, 80-120 lines)
- [ ] Restaurant.test.ts (25+ tests)
- [ ] Supermarket.ts (affordable groceries, 80-120 lines)
- [ ] Supermarket.test.ts (25+ tests)
- [ ] Updated index.ts exports
- [ ] All tests passing with 100% success rate

---

## 🚀 Quick Start

```bash
cd /home/user/openjones/openjones-web
git checkout -b claude/shopping-buildings-part2-b10-[YOUR-SESSION-ID]

# Study existing building patterns
cat frontend/src/engine/buildings/Building.ts
cat frontend/src/engine/buildings/Bank.ts | head -80
cat frontend/src/engine/buildings/RentAgency.ts | head -80

# Study possessions system (dependency)
cat frontend/src/engine/possessions/index.ts
cat frontend/src/engine/possessions/Food.ts
```

---

## 📚 Context

This task completes the shopping building system. The three buildings have distinct roles:

**PawnShop:**
- Unique: Allows SELLING possessions (reverse of purchase)
- Calculates sell price (typically 50% of purchase price)
- Players exchange possessions for cash

**Restaurant:**
- Sells expensive prepared food
- Higher prices but convenient
- Premium dining experience

**Supermarket:**
- Sells affordable groceries
- Cheaper than restaurant
- Budget-friendly option

**Completed dependencies:**
- ✅ B6: Building base class
- ✅ B5: Possessions system
- ✅ B1: Economy model

**Existing patterns to follow:**
- Bank.ts: Stock purchase/sell mechanics
- Factory.ts: Multiple action offerings
- RentAgency.ts: State-modifying actions

---

## ✅ Implementation Steps

### Step 1: Implement PawnShop

```typescript
// frontend/src/engine/buildings/PawnShop.ts
import { Building } from './Building';
import { BuildingType } from '@shared/types/contracts';
import type { IPlayerState, IAction, IActionTreeNode, IPossession } from '@shared/types/contracts';
import { EconomyModel } from '../economy/EconomyModel';

/**
 * Pawn Shop - Sell possessions for cash
 */
export class PawnShop extends Building {
  private economy: EconomyModel;

  constructor(id: string, position: IPosition) {
    super({
      id,
      type: BuildingType.PAWN_SHOP,
      name: 'Pawn Shop',
      description: 'Sell your possessions for cash',
      position
    });

    this.economy = new EconomyModel();
  }

  public getAvailableActions(player: IPlayerState): IAction[] {
    const actions: IAction[] = [];

    // Create sell actions for each possession player owns
    player.possessions.forEach((possession: IPossession) => {
      const sellPrice = this.economy.calculateSellPrice(possession);

      // Create a custom SellAction or use a generic action
      const action = {
        name: `Sell ${possession.name}`,
        description: `Sell ${possession.name} for $${sellPrice}`,
        cost: -sellPrice, // Negative cost means gaining money
        execute: (state: IPlayerState) => {
          // Remove possession from player
          const newPossessions = state.possessions.filter(p => p.id !== possession.id);

          return {
            success: true,
            message: `Sold ${possession.name} for $${sellPrice}`,
            newState: {
              ...state,
              cash: state.cash + sellPrice,
              possessions: newPossessions
            }
          };
        }
      };

      actions.push(action as IAction);
    });

    // If player has no possessions
    if (actions.length === 0) {
      return [{
        name: 'No items to sell',
        description: 'You have no possessions to sell',
        cost: 0,
        execute: (state: IPlayerState) => ({
          success: false,
          message: 'No possessions available',
          newState: state
        })
      } as IAction];
    }

    return actions;
  }

  public getActionTree(): IActionTreeNode {
    return {
      id: 'pawn-shop-root',
      label: 'Pawn Shop',
      action: null,
      children: [
        {
          id: 'sell-items',
          label: 'Sell Items',
          action: null,
          children: [] // Dynamically populated based on player possessions
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

  /**
   * Helper to calculate sell price (50% of original value)
   */
  private calculateSellPrice(possession: IPossession): number {
    // Use economy model or calculate 50% of purchase price
    const originalPrice = possession.value || 0;
    return Math.floor(originalPrice * 0.5);
  }
}
```

### Step 2: Implement Restaurant

```typescript
// frontend/src/engine/buildings/Restaurant.ts
import { Building } from './Building';
import { BuildingType } from '@shared/types/contracts';
import { Food } from '../possessions/Food';
import { PurchaseAction } from '../actions/PurchaseAction';
import { EconomyModel } from '../economy/EconomyModel';

/**
 * Restaurant - Expensive prepared food
 */
export class Restaurant extends Building {
  private economy: EconomyModel;

  constructor(id: string, position: IPosition) {
    super({
      id,
      type: BuildingType.RESTAURANT,
      name: 'Restaurant',
      description: 'Fine dining - expensive but convenient',
      position
    });

    this.economy = new EconomyModel();
  }

  public getAvailableActions(player: IPlayerState): IAction[] {
    const actions: IAction[] = [];

    // Premium food items
    const menu = [
      { name: 'Gourmet Burger', cost: 35, nutrition: 25 },
      { name: 'Lobster Dinner', cost: 75, nutrition: 40 },
      { name: 'Filet Mignon', cost: 100, nutrition: 50 },
      { name: 'Chef Special', cost: 125, nutrition: 60 }
    ];

    menu.forEach(item => {
      const food = new Food(item.name, item.cost, item.nutrition);
      const action = new PurchaseAction(
        `Order ${item.name}`,
        food,
        item.cost,
        `Fine dining: ${item.name}`
      );

      // Only show if player can afford
      if (player.canAfford(item.cost)) {
        actions.push(action);
      }
    });

    return actions;
  }

  public getActionTree(): IActionTreeNode {
    return {
      id: 'restaurant-root',
      label: 'Restaurant',
      action: null,
      children: [
        {
          id: 'order-food',
          label: 'Order Food',
          action: null,
          children: [
            { id: 'burger', label: 'Gourmet Burger ($35)', action: { type: 'PURCHASE', name: 'Order Gourmet Burger' }, children: [] },
            { id: 'lobster', label: 'Lobster Dinner ($75)', action: { type: 'PURCHASE', name: 'Order Lobster Dinner' }, children: [] },
            { id: 'steak', label: 'Filet Mignon ($100)', action: { type: 'PURCHASE', name: 'Order Filet Mignon' }, children: [] },
            { id: 'special', label: 'Chef Special ($125)', action: { type: 'PURCHASE', name: 'Order Chef Special' }, children: [] }
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

### Step 3: Implement Supermarket

```typescript
// frontend/src/engine/buildings/Supermarket.ts
import { Building } from './Building';
import { BuildingType } from '@shared/types/contracts';
import { Food } from '../possessions/Food';
import { PurchaseAction } from '../actions/PurchaseAction';
import { EconomyModel } from '../economy/EconomyModel';

/**
 * Supermarket - Affordable groceries
 */
export class Supermarket extends Building {
  private economy: EconomyModel;

  constructor(id: string, position: IPosition) {
    super({
      id,
      type: BuildingType.SUPERMARKET,
      name: 'Supermarket',
      description: 'Buy affordable groceries',
      position
    });

    this.economy = new EconomyModel();
  }

  public getAvailableActions(player: IPlayerState): IAction[] {
    const actions: IAction[] = [];

    // Budget food items
    const groceries = [
      { name: 'Bread', cost: 3, nutrition: 5 },
      { name: 'Milk', cost: 4, nutrition: 6 },
      { name: 'Eggs', cost: 5, nutrition: 8 },
      { name: 'Chicken', cost: 8, nutrition: 12 },
      { name: 'Rice', cost: 6, nutrition: 10 },
      { name: 'Vegetables', cost: 7, nutrition: 9 }
    ];

    groceries.forEach(item => {
      const food = new Food(item.name, item.cost, item.nutrition);
      const action = new PurchaseAction(
        `Buy ${item.name}`,
        food,
        item.cost,
        `Grocery shopping: ${item.name}`
      );
      actions.push(action);
    });

    return actions;
  }

  public getActionTree(): IActionTreeNode {
    return {
      id: 'supermarket-root',
      label: 'Supermarket',
      action: null,
      children: [
        {
          id: 'buy-groceries',
          label: 'Buy Groceries',
          action: null,
          children: [
            { id: 'bread', label: 'Bread ($3)', action: { type: 'PURCHASE', name: 'Buy Bread' }, children: [] },
            { id: 'milk', label: 'Milk ($4)', action: { type: 'PURCHASE', name: 'Buy Milk' }, children: [] },
            { id: 'eggs', label: 'Eggs ($5)', action: { type: 'PURCHASE', name: 'Buy Eggs' }, children: [] },
            { id: 'chicken', label: 'Chicken ($8)', action: { type: 'PURCHASE', name: 'Buy Chicken' }, children: [] },
            { id: 'rice', label: 'Rice ($6)', action: { type: 'PURCHASE', name: 'Buy Rice' }, children: [] },
            { id: 'veg', label: 'Vegetables ($7)', action: { type: 'PURCHASE', name: 'Buy Vegetables' }, children: [] }
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
- PawnShop: Sell actions for each possession, correct sell prices
- Restaurant: Premium pricing, only affordable items shown
- Supermarket: Budget pricing, all items available
- Action execution (especially PawnShop selling)
- getActionTree returns valid tree structure
- canEnter, isHome, getJobOfferings

### Step 5: Update Exports

```typescript
// Add to frontend/src/engine/buildings/index.ts
export { PawnShop } from './PawnShop';
export { Restaurant } from './Restaurant';
export { Supermarket } from './Supermarket';
```

---

## 🧪 Testing Requirements

- **Framework:** Vitest (NOT Jest)
- **Minimum Tests:** 85+ total (35 PawnShop, 25 each for Restaurant/Supermarket)
- **Coverage:** Construction, actions, selling mechanics, pricing, affordability

**PawnShop specific tests:**
```typescript
it('should calculate correct sell price (50% of value)', () => {
  const shop = new PawnShop('pawn-1', mockPosition);
  const possession = new Clothes('Suit', 200, 5);

  const sellPrice = shop['calculateSellPrice'](possession);
  expect(sellPrice).toBe(100); // 50% of 200
});

it('should create sell actions for player possessions', () => {
  const playerWithItems: IPlayerState = {
    ...mockPlayer,
    possessions: [
      new Food('Pizza', 15, 20),
      new Clothes('Shirt', 50, 2)
    ]
  };

  const shop = new PawnShop('pawn-1', mockPosition);
  const actions = shop.getAvailableActions(playerWithItems);

  expect(actions.length).toBe(2);
  expect(actions[0].name).toContain('Sell');
});

it('should remove possession and add cash when sold', () => {
  // Test action execution
});
```

---

## 🔍 Verification Checklist

**Before claiming completion, verify ALL of these:**

### Code
- [ ] All 3 buildings created: `ls -la frontend/src/engine/buildings/{PawnShop,Restaurant,Supermarket}.ts`
- [ ] No syntax errors: `npm run type-check`
- [ ] PawnShop implements sell mechanics correctly
- [ ] Restaurant has premium pricing
- [ ] Supermarket has budget pricing
- [ ] All extend Building base class

### Tests
- [ ] All test files exist: `ls -la frontend/src/engine/buildings/{PawnShop,Restaurant,Supermarket}.test.ts`
- [ ] Tests pass: `npm test -- frontend/src/engine/buildings/{PawnShop,Restaurant,Supermarket}.test.ts`
- [ ] Test count: 85+ tests total
- [ ] PawnShop sell mechanics thoroughly tested

### Git
- [ ] Changes staged: `git status`
- [ ] Committed: `git log -1 --oneline`
- [ ] Pushed: `git push -u origin claude/shopping-buildings-part2-b10-[YOUR-SESSION-ID]`
- [ ] Verified: `git ls-remote origin claude/shopping-buildings-part2-b10-[YOUR-SESSION-ID]`

### Final Commands
```bash
# Run ALL these commands and paste output in your report
npm run type-check 2>&1 | grep -E "(PawnShop|Restaurant|Supermarket)" || echo "No errors"
npm test -- PawnShop.test.ts 2>&1 | tail -15
npm test -- Restaurant.test.ts 2>&1 | tail -15
npm test -- Supermarket.test.ts 2>&1 | tail -15
ls -la frontend/src/engine/buildings/{PawnShop,Restaurant,Supermarket}.*
git log -1 --oneline
```

---

## 🚫 Common Mistakes to Avoid

1. **PawnShop complexity** - Selling is opposite of buying, test carefully
2. **Not filtering by affordability** - Restaurant should only show affordable items
3. **Wrong sell price calculation** - Use economy model or 50% rule
4. **Not testing possession removal** - PawnShop must remove items from inventory
5. **Inconsistent pricing** - Restaurant expensive, Supermarket cheap

---

## 📝 Final Report Template

```markdown
# Worker 4 Report: Task B10 - Shopping Buildings (Part 2)

**Branch:** claude/shopping-buildings-part2-b10-[actual-session-id]
**Commit:** [paste: git log -1 --format=%h]

## Deliverables
✅ PawnShop.ts (XX lines, XX tests)
✅ Restaurant.ts (XX lines, XX tests)
✅ Supermarket.ts (XX lines, XX tests)
✅ All test files
✅ Updated exports

## Test Results
- PawnShop: XX tests passing
- Restaurant: XX tests passing
- Supermarket: XX tests passing
- Total: XX/XX tests (100%)

## Type Check
- Status: ✅ PASSED

## Files Verified
[Paste output of: ls -la frontend/src/engine/buildings/{PawnShop,Restaurant,Supermarket}.*]

## Issues Encountered
[None, or describe]

## Notes
- PawnShop sell mechanics fully tested
- Shopping system complete (B9 + B10)
- All buildings ready for UI integration
```

---

## 💡 Tips for Success

- **PawnShop is unique** - Study Bank.ts for buy/sell patterns
- **Test sell mechanics thoroughly** - Most complex of the three
- **Price differentiation** - Restaurant 3-5x more expensive than Supermarket
- **Use existing actions** - PurchaseAction already exists
- **Think about gameplay** - Players should see strategic pricing choices

---

## 📚 Reference

**Building Base:** `frontend/src/engine/buildings/Building.ts`
**Similar Patterns:** `frontend/src/engine/buildings/Bank.ts` (buy/sell stocks)
**Possessions:** `frontend/src/engine/possessions/Food.ts`
**Economy:** `frontend/src/engine/economy/EconomyModel.ts`
**Actions:** `frontend/src/engine/actions/PurchaseAction.ts`

---

**Instructions generated:** 2025-11-07
**Session:** 2
**Good luck!** 🚀
