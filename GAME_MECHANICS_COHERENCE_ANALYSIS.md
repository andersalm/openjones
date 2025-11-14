# GAME MECHANICS COHERENCE ANALYSIS
## Jones in the Fast Lane (TypeScript Port)

---

## EXECUTIVE SUMMARY

The game exhibits **mixed coherence**. Core progression systems are well-designed and interact synergistically, but several implementation inconsistencies undermine clarity and contain potential exploits:

- **2 HIGH-severity issues** (dead code, test mismatch)
- **2 MEDIUM-severity issues** (duplicate systems, redundancy)
- **2 LOW-severity issues** (inconsistent patterns, unclear limits)

---

## PART 1: COHERENCE ISSUES (Problems)

### ⚠️ HIGH SEVERITY

#### 1. **DEAD STAT: experienceGainPerHour Property Is Never Used**

**Location**: 
- All IJob definitions across 5+ files
- 40+ job definitions in JobSystem.ts and Building classes

**The Problem**:
Every job has an `experienceGainPerHour` field that influences nothing:

```typescript
// JobSystem.ts - defines all jobs with experienceGainPerHour: 1
{
  id: 'factory-janitor',
  title: 'Janitor',
  experienceGainPerHour: 1,  // ← THIS IS NEVER USED
  wagePerHour: 6,
  // ... other properties
}

// Factory.ts - duplicates jobs with experienceGainPerHour: 5  
// Same fields, different value!
{
  experienceGainPerHour: 5,  // ← ALSO NEVER USED
  // ...
}

// WorkAction.ts - completely ignores both values
const experienceGain = timeAvailable;  // Just uses time units!
```

**Why This Happens**:
The experience calculation in WorkAction is hardcoded:
```typescript
// WorkAction.ts, line 109
const experienceGain = timeAvailable;  // 1 per time unit (= 5 per hour)
```

Neither JobSystem's `experienceGainPerHour: 1` nor Factory's `experienceGainPerHour: 5` is consulted.

**Broken Mechanics**:
1. Players cannot optimize based on job properties
2. No differentiation between job types in experience gain
3. Code redundancy - property exists in multiple places with conflicting values
4. The function `JobSystem.calculateExperienceGain()` (line 441-442) exists but is never called:
```typescript
calculateExperienceGain(job: IJob, hours: number): number {
  return job.experienceGainPerHour * hours;  // Orphaned method
}
```

**Impact**: 
- Reduced tactical depth (job selection doesn't matter for experience)
- Confusion when reading code (why define the property if unused?)
- Technical debt (either use it or remove it)

---

#### 2. **TEST/IMPLEMENTATION MISMATCH: Work Health Loss**

**Location**: 
- WorkAction.test.ts (expects health loss)
- WorkAction.ts (explicitly doesn't apply health loss)

**The Problem**:
Tests explicitly expect work to cost health points, but implementation intentionally disables this:

```typescript
// WorkAction.test.ts - lines 217, 249, 267, 285
it('should deduct 2 health per hour worked', () => {
  // ... setup ...
  expect(result.stateChanges?.health).toBe(-8);  // 4 hours × 2 health/hour
  expect(result.stateChanges?.descriptions[1]).toBe('Lost 8 health from work');
});

// ACTUAL WorkAction.ts - lines 120-122
const changes = StateChangeBuilder.create()
  .cash(...)
  .career(...)
  .custom('experience', ...)
  .custom('rentDebt', ...)
  // ← NO .health() call!

// Comment explicitly explains why:
// Java: job.healthEffect() and job.happinessEffect() both return 0
// Work does NOT affect health or happiness in the base implementation
```

**Broken Mechanics**:
1. No consequence for overworking
2. Players can work unlimited hours without health penalty
3. Health/Happiness victory conditions become trivial (just 2 hours of Relax)
4. Work never affects well-being despite being 120+ hours/week available

**Impact**:
- Tests will fail at runtime
- Code compiles but behavior is incorrect
- Removes tension from work-rest balance decisions
- Victory conditions lose strategic meaning

---

### ⚠️ MEDIUM SEVERITY

#### 3. **DUPLICATE RENT PAYMENT SYSTEMS: Inconsistent Time Costs**

**Location**:
- `PayRentAction.ts` (5 units)
- `RentAgency.ts` getAvailableActions() (0 units)

**The Problem**:
Two separate implementations for the same action with different mechanics:

```typescript
// System 1: PayRentAction
// File: actions/PayRentAction.ts
class PayRentAction extends Action {
  constructor() {
    super(
      'pay-rent',
      ActionType.PAY_RENT,
      'Pay Rent',
      'Pay your weekly rent',
      5  // ← Costs 5 time units
    );
  }
  execute(player, game) {
    const rentAmount = player.rentDebt;
    // Pays entire debt
    return ActionResponse.success(
      `Paid rent of $${rentAmount}...`,
      this.timeCost,  // 5 units consumed
      changes
    );
  }
}

// System 2: RentAgency inline action
// File: buildings/RentAgency.ts, lines 144-196
private createPayRentAction(): IAction {
  return {
    timeCost: 0,  // ← Costs 0 time units!
    execute: (player) => {
      const payment = Math.min(player.cash, player.rentDebt);  // Can pay partially
      return ActionResponse.success(
        `Paid $${payment}...`,
        0,  // 0 time consumed
        changes
      );
    }
  };
}
```

**Contradictions**:
| Property | PayRentAction | RentAgency |
|----------|--------------|-----------|
| Time cost | 5 units | 0 units |
| Payment | Full debt only | Partial allowed |
| Location | Any building | RentAgency only |
| Flexibility | Inflexible | Flexible |

**Broken Mechanics**:
1. **Economic exploit**: Use RentAgency (0 cost) instead of PayRentAction (5 cost)
2. **Tactical inconsistency**: Two ways to do same action with different rules
3. **Unclear design intent**: Which is canonical? Should both exist?
4. Players naturally migrate to 0-cost option, making PayRentAction irrelevant

**Impact**:
- GameController registers PayRentAction but players bypass it
- Time cost becomes meaningless for rent payment
- No strategic tradeoff between rent payment and other actions
- Potential code path confusion

---

#### 4. **CONFLICTING JOB DEFINITIONS: JobSystem vs Building Classes**

**Location**:
- `JobSystem.ts` (source of truth)
- `Factory.ts`, `College.ts`, `Restaurant.ts`, `ClothesStore.ts`, `RentAgency.ts`

**The Problem**:
Jobs are defined in TWO different places with DIFFERENT values:

```typescript
// JobSystem.ts - OFFICIAL job definitions
export const JOB_DEFINITIONS: IJob[] = [
  {
    id: 'factory-janitor',
    title: 'Janitor',
    experienceGainPerHour: 1,  // Value A
    wagePerHour: 6,
    rank: 1,
    // ...
  },
  // ... 24 more jobs ...
];

// Factory.ts - DUPLICATE job definitions in building class
private createFactoryJobs(): IJob[] {
  return [
    {
      id: `${this.id}-job-janitor`,
      title: 'Janitor',
      experienceGainPerHour: 5,  // Value B (different!)
      wagePerHour: 6,  // Same
      rank: 1,
      // ...
    },
    // ... duplicates all Factory jobs ...
  ];
}
```

**Conflicting Values**:
- **experienceGainPerHour**: JobSystem=1, Buildings=5 (5x difference!)
- **Job IDs**: Different in each (jobSystem: 'factory-janitor', Factory: 'factory-job-janitor')
- **Wages**: Match (6 for Janitor) - at least this is consistent

**Questions Created**:
1. Which job definitions are actually used?
2. Why duplicate across 5 files?
3. What happens if someone updates JobSystem but not Building classes?
4. Do these jobs ever get compared or merged?

**Impact**:
- Risk of sync errors during maintenance
- Violates DRY (Don't Repeat Yourself) principle
- Future developers won't know which source of truth to update
- Potential for subtle bugs if both are referenced

---

### ⚠️ LOW-MEDIUM SEVERITY

#### 5. **INCONSISTENT LOCATION EFFECTS: Only Relax Responds to Location**

**Location**: 
- `RelaxAction.ts` (location multipliers)
- All other actions (no location effects)

**The Problem**:
Only RelaxAction applies location-based effectiveness changes:

```typescript
// RelaxAction.ts - lines 75-85: HAS location effects
private getLocationMultiplier(player: IPlayerState): number {
  if (player.currentBuilding && player.rentedHome === player.currentBuilding) {
    return 1.5;  // Home bonus
  } else if (!player.currentBuilding) {
    return 0.5;  // Uncomfortable on street
  }
  return 1.0;  // Normal in other buildings
}

// WorkAction - NO location effects (line 48)
if (!this.requiresBuilding(player)) {  // Just checks you're at ANY building
  return false;
}
// Otherwise doesn't care if it's a factory or office

// StudyAction - NO location effects  
if (!this.requiresBuilding(player, this.collegeId)) {
  return false;  // Just requires being at college
}
// No multiplier for elite college vs regular college
```

**Inconsistencies**:
- Relax is **3x effective** at home vs **0.5x** on street
- Work is equally effective anywhere (no fatigue modifiers)
- Study has no difficulty/prestige variance
- No environmental hazards (factory dangers, restaurant noise, etc.)

**Tactical Void**:
Players don't need to consider location beyond binary "inside vs outside":
- Working at any factory pays the same
- Studying at college is same rate as would be elsewhere (if allowed)
- No strategic reason to prefer one workplace over another

**Impact**:
- Reduced environmental interaction
- No emergent strategy around location selection
- RelaxAction feels special but seems inconsistent
- World feels static (location has minimal mechanical impact)

---

#### 6. **UNCLEAR WORK TIME LIMITS**

**Location**: 
- `WorkAction.ts` (lines 14, 83-89)
- `Game.ts` (time management)

**The Problem**:
Work action supports flexible hours but maximum is ambiguous:

```typescript
// WorkAction.ts, line 14
private static readonly WORK_PERIOD_IN_TIME_UNITS = 60;  // 12 hours max

// But construction allows:
new WorkAction(job, 1)   // 1 hour
new WorkAction(job, 4)   // 4 hours
new WorkAction(job, 8)   // 8 hours
new WorkAction(job)      // "Max available" - undefined!

// At execution (lines 83-89), actual hours = minimum of:
const timeAvailable = Math.min(
  game.timeUnitsRemaining,        // Could be >600
  this.hours ? this.hours * 5 : 60  // WORK_PERIOD_IN_TIME_UNITS
);

// Theoretical weekly capacity: 600 / 5 = 120 hours
// WORK_PERIOD max: 60 / 5 = 12 hours
// But player can do WORK_PERIOD multiple times per week
```

**Time Overflow Risk**:
If player takes actions totaling >600 time units in one week:
```typescript
// Game.ts, advanceTime()
timeUnitsRemaining -= units;  // Could go negative

while (timeUnitsRemaining <= 0) {
  processEndOfWeek();  // May skip week or process rent oddly
  timeUnitsRemaining += 600;
}
```

**Unclear Limits**:
1. Can a player work 120 hours/week? (Legally possible with multiple Work actions)
2. Is WORK_PERIOD_IN_TIME_UNITS a soft or hard limit?
3. What happens if you try to work 15 hours? (Capped at 12?)

**Impact**:
- Exploitable if 120 hours/week is possible
- No clear player feedback on weekly work limits
- Edge cases around negative time handling

---

## PART 2: COHERENT MECHANICS (What Works Well)

### ✅ COHERENT: Rent Economy System

Despite the duplicate payment mechanisms, the core rent system has excellent cause-and-effect:

**The Flow**:
1. **Starting position**: 4 weeks of rent prepaid ($1,220 value in low-cost housing)
2. **Weekly consumption**: Each week end, consume 1 prepaid week OR accumulate $305 debt
3. **Debt accumulation**: If weeks=0, debt += weekly_rent
4. **Wage garnishment**: WorkAction garnishes 30% of earnings to pay debt
5. **Debt payoff**: PayRentAction or RentAgency action clears debt
6. **Cycle restarts**: Debt forces work, work enables debt payment, debt prevents idling

**Example Coherent Sequence**:
```
Week 1: Have 4 prepaid weeks, no debt
Week 2: Spend 1 week of rent, have 3 weeks left
Week 5: Last prepaid week consumed, now debt accumulates each week
Week 6: Debt = $305, work 1 hour → earn $6, lose $1.80 to garnishment (30%)
Eventually: Player must work to cover debt, creates resource tension
```

**Why It Works**:
- Clear progression: luxury of prepaid weeks → pressure of debt
- Multiple solutions: work for garnish, or pay lump sum
- Meaningful choice: stay in expensive security apartment or cheap housing
- Natural rubber-banding: falling behind creates catch-up opportunities

---

### ✅ COHERENT: Career Experience Tracking

Career score correctly derives from experience, creating coherent progression:

```typescript
// PlayerState.ts, line 200 - automated tracking
addExperience(rank: number, points: number): void {
  const existingExp = this.experience.find(e => e.rank === rank);
  if (existingExp) {
    existingExp.points += points;
  } else {
    this.experience.push({ rank, points });
  }
  // Career auto-updates from total experience
  this.career = this.getTotalExperience();  // ← Automatic!
}
```

**Coherent Chain**:
- Work 1 hour → gain 5 experience points
- Experience tracked per rank
- Career automatically = total of all experience
- Victory condition checks career ≥ 400
- No disconnect between action and score

**Result**: Players understand "work → career advancement" without confusion

---

### ✅ COHERENT: Job Progression Requirements

Job ranks scale consistently with clear progression path:

```typescript
JobSystem.ts definitions:
Rank 1 (entry):   5 education,  10 experience
Rank 2:          10 education,  20 experience  
Rank 3:          15 education,  30 experience
Rank 4:          20 education,  40 experience
Rank 5:          25 education,  50 experience
...
Rank 8:          40 education,  80 experience
```

**Pattern**: Each rank requires `rank × 5` education and `rank × 10` experience

**Coherence**:
- Consistent 2:1 ratio (experience : education)
- Higher ranks block lower-skilled players (good gatekeeping)
- Progression feels earned (measurable milestones)
- Multiple paths to victory (various jobs at each rank)

---

### ✅ COHERENT: Housing Price Scaling

Clear trade-off between comfort and cost:

```typescript
EconomyModel.ts:
LOW_COST_APARTMENT:    $305/week
SECURITY_APARTMENT:    $445/week  (+46% cost premium)

RelaxAction.ts:
Home relaxation:       1.5x effective
Other relaxation:      1.0x effective
Street relaxation:     0.5x effective
```

**Coherent Logic**:
- Pay more for apartment → better relaxation (1.5x vs 1.0x)
- Creates meaningful choice: "Is better relaxation worth $140/week?"
- At $445/week for security apartment, 1.5x relaxation bonus offers 50% efficiency gain
- Strategic depth: high-earners might prefer security apartment for relaxation ROI

---

### ✅ COHERENT: Victory Condition Feasibility

All victory conditions are achievable with reasonable play:

**Analysis** (see calculations above):
- **Health** (80→100): 2 hours relax = solved ✓
- **Happiness** (70→100): 2 hours relax = solved ✓
- **Wealth** ($1K→$10K): 3 weeks at top job = achievable ✓
- **Career** (0→400): ~80 hours work = easily achievable ✓
- **Education** (50→100): ~1.7 weeks of study = achievable ✓

**Coherence**: No impossible gate-keeping, all conditions within reach of engaged player

---

## PART 3: SUMMARY MATRIX

| Issue | Category | Severity | Type | Root Cause |
|-------|----------|----------|------|-----------|
| experienceGainPerHour unused | Dead Code | HIGH | Design | Implementation never uses property |
| Work health loss mismatch | Broken Test | HIGH | Implementation | Test expects behavior code removes |
| Duplicate rent payments | Duplication | MEDIUM | Architecture | RentAgency + PayRentAction |
| Conflicting job definitions | Redundancy | MEDIUM | Code Quality | JobSystem + Building classes |
| Location effects only on Relax | Inconsistency | LOW-MED | Design | RelaxAction is special case |
| Work time limits unclear | Edge Case | LOW-MED | Documentation | WORK_PERIOD not well documented |
| Rent system logic | ✓ | — | Coherent | Good cause-effect chain |
| Career tracking | ✓ | — | Coherent | Auto-updates from experience |
| Job requirements | ✓ | — | Coherent | Consistent progression |
| Housing prices | ✓ | — | Coherent | Clear trade-offs |
| Victory conditions | ✓ | — | Coherent | All achievable |

---

## RECOMMENDATIONS FOR FIXING

### High Priority (Blocks gameplay):
1. **Fix WorkAction tests**: Either add health loss back or update tests to match actual behavior
2. **Consolidate rent payment**: Choose one system, archive the other

### Medium Priority (Code quality):
3. **Remove/use experienceGainPerHour**: Either use property or delete it everywhere
4. **Centralize job definitions**: Single source of truth in JobSystem

### Low Priority (Polish):
5. **Extend location effects**: Add multipliers to other actions for consistency
6. **Document time limits**: Clarify weekly work limits in code comments

---

## CONCLUSION

The game exhibits **strong core coherence** in economic and progression systems, but **weak implementation coherence** with dead code, test mismatches, and duplicate systems. 

**Verdict**: **MECHANICALLY SOUND but TECHNICALLY MESSY**

The player experience is good (consistent progression, achievable goals), but the codebase has technical debt that will cause maintenance issues.

