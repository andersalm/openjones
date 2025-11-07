# OpenJones UI Design System

Retro game-themed component library for the OpenJones browser port.

## Overview

This design system provides a cohesive set of UI components with a retro aesthetic inspired by the original "Jones in the Fast Lane" game from 1990. The components feature:

- **Retro color palette**: Blues, purples, and warm earth tones
- **Pixel-perfect borders**: Bold borders with retro box shadows
- **Consistent spacing**: Unified spacing system
- **Typography**: Clear, readable fonts with uppercase styling for headers
- **Accessibility**: Semantic HTML and ARIA attributes

## Theme System

All components use the centralized theme configuration from `frontend/src/theme/index.ts`.

### Colors

```typescript
import { theme } from '../../theme';

// Primary colors (blues)
theme.colors.primary.dark   // #1a1a3e
theme.colors.primary.main   // #4169e1
theme.colors.primary.light  // #6b8cff

// Secondary colors (purples)
theme.colors.secondary.main // #8b4789

// Accent colors
theme.colors.accent.gold    // #ffd700
theme.colors.accent.green   // #3cb371
theme.colors.accent.red     // #dc143c

// Game UI colors
theme.colors.game.background // #0a0a1e
theme.colors.game.panel      // #1a1a3e
theme.colors.game.border     // #4169e1
```

### Spacing

```typescript
theme.spacing.xs   // 4px
theme.spacing.sm   // 8px
theme.spacing.md   // 16px
theme.spacing.lg   // 24px
theme.spacing.xl   // 32px
theme.spacing.xxl  // 48px
```

### Typography

```typescript
theme.typography.fontSize.xs   // 12px
theme.typography.fontSize.sm   // 14px
theme.typography.fontSize.md   // 16px
theme.typography.fontSize.lg   // 18px

theme.typography.fontWeight.normal    // 400
theme.typography.fontWeight.semibold  // 600
theme.typography.fontWeight.bold      // 700
```

## Components

### Button

Primary interactive element with multiple variants and sizes.

**Props:**
- `variant`: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `fullWidth`: boolean (default: false)
- `disabled`: boolean (default: false)

**Example:**
```tsx
import { Button } from '@components/ui';

<Button variant="primary" size="md" onClick={handleClick}>
  Start Game
</Button>

<Button variant="accent" size="lg" fullWidth>
  Buy Stock
</Button>

<Button variant="danger" disabled>
  Cannot Afford
</Button>
```

### Card

Container component for grouping related content.

**Props:**
- `variant`: 'default' | 'highlight' | 'dark' (default: 'default')
- `padding`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' (default: 'md')

**Example:**
```tsx
import { Card } from '@components/ui';

<Card variant="default" padding="lg">
  <h3>Player Stats</h3>
  <p>Cash: $500</p>
  <p>Health: 80</p>
</Card>

<Card variant="highlight">
  <p>You earned $100!</p>
</Card>
```

### Panel

Advanced container with optional header for game UI sections.

**Props:**
- `title`: string (optional)
- `variant`: 'default' | 'success' | 'warning' | 'danger' (default: 'default')
- `padding`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' (default: 'md')
- `headerContent`: React.ReactNode (optional)

**Example:**
```tsx
import { Panel } from '@components/ui';

<Panel title="Building Actions" variant="default" padding="lg">
  <ul>
    <li>Work (4 hours) - $50</li>
    <li>Study (2 hours) - $30</li>
  </ul>
</Panel>

<Panel
  title="Warning"
  variant="warning"
  headerContent={<button>×</button>}
>
  <p>Low health! Visit a restaurant.</p>
</Panel>
```

### Container

Layout component for content wrapping and centering.

**Props:**
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | 'full' (default: 'lg')
- `padding`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' (default: 'md')
- `centered`: boolean (default: false)

**Example:**
```tsx
import { Container } from '@components/ui';

<Container maxWidth="lg" centered padding="xl">
  <h1>OpenJones</h1>
  <p>Welcome to the game!</p>
</Container>

<Container maxWidth="full">
  <GameBoard />
</Container>
```

## Usage Patterns

### Combining Components

```tsx
import { Container, Panel, Button, Card } from '@components/ui';

function GameInterface() {
  return (
    <Container maxWidth="xl" centered padding="lg">
      <Panel title="Player Dashboard" variant="default">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <Card variant="default">
            <h3>Stats</h3>
            <p>Health: 80</p>
            <p>Cash: $500</p>
          </Card>
          <Card variant="highlight">
            <h3>Current Location</h3>
            <p>Employment Agency</p>
          </Card>
        </div>
        <Button variant="primary" size="lg" fullWidth>
          Continue
        </Button>
      </Panel>
    </Container>
  );
}
```

### Accessibility

All components support standard HTML attributes including:
- `aria-label`
- `aria-describedby`
- `role`
- `data-testid`

Example:
```tsx
<Button
  aria-label="Start new game"
  data-testid="start-game-button"
  onClick={startGame}
>
  Start Game
</Button>
```

## Testing

All components have comprehensive test coverage using Vitest and React Testing Library.

Run tests:
```bash
npm test                    # Run all tests
npm run test:ui            # Run tests with UI
npm run test:coverage      # Run with coverage report
```

Test files are co-located with components:
- `Button.test.tsx`
- `Card.test.tsx`
- `Panel.test.tsx`
- `Container.test.tsx`

## Customization

Components accept custom styles via the `style` prop:

```tsx
<Button style={{ marginTop: '20px', backgroundColor: 'custom' }}>
  Custom Button
</Button>
```

For global theme changes, modify `frontend/src/theme/index.ts`.

## Future Enhancements

Potential additions to the design system:
- Input components (text, select, checkbox, radio)
- Modal/Dialog components
- Toast/notification system
- Loading spinners and progress bars
- Tooltip component
- Tabs component
- Retro pixel font integration
- Animation utilities
- Dark/light mode toggle

## Contributing

When adding new components:
1. Follow existing naming conventions
2. Use the theme system for all styling
3. Write comprehensive tests
4. Document props and usage examples
5. Maintain retro aesthetic
6. Ensure accessibility

---

**Built for OpenJones - Browser Edition**
