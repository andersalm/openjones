/**
 * OpenJones Design System - Theme Configuration
 *
 * Retro game aesthetic inspired by Jones in the Fast Lane (1990)
 * Color palette: Blues, purples, and warm earth tones
 */

export const colors = {
  // Primary palette - Blues and purples (retro game feel)
  primary: {
    dark: '#1a1a3e',      // Deep navy for backgrounds
    main: '#4169e1',      // Royal blue
    light: '#6b8cff',     // Light blue for highlights
    pale: '#b8c9ff',      // Very light blue for hover states
  },

  // Secondary palette - Purples
  secondary: {
    dark: '#4a1a4a',      // Deep purple
    main: '#8b4789',      // Medium purple
    light: '#b57eb5',     // Light purple
    pale: '#d9b8d9',      // Very light purple
  },

  // Accent colors - Warm tones
  accent: {
    gold: '#ffd700',      // Gold for money/wealth
    green: '#3cb371',     // Green for positive/success
    red: '#dc143c',       // Red for warnings/danger
    orange: '#ff8c00',    // Orange for important actions
  },

  // Neutral palette
  neutral: {
    black: '#000000',
    darkGray: '#1e1e1e',
    gray: '#808080',
    lightGray: '#c0c0c0',
    paleGray: '#e8e8e8',
    white: '#ffffff',
  },

  // Game-specific colors
  game: {
    background: '#0a0a1e',     // Dark background for game board
    panel: '#1a1a3e',          // Panels and UI containers
    border: '#4169e1',         // Borders for UI elements
    highlight: '#ffd700',      // Highlights and selections
    text: '#ffffff',           // Primary text color
    textSecondary: '#c0c0c0',  // Secondary text color
  },

  // Status colors
  status: {
    health: '#dc143c',         // Red for health
    happiness: '#ffd700',      // Gold for happiness
    education: '#4169e1',      // Blue for education
    career: '#8b4789',         // Purple for career
    wealth: '#3cb371',         // Green for wealth
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
} as const;

export const typography = {
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"Courier New", Courier, monospace',
    retro: '"Press Start 2P", monospace', // Optional retro font (would need to be loaded)
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '24px',
    xxl: '32px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
} as const;

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
} as const;

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
  retro: '4px 4px 0px rgba(0, 0, 0, 0.8)', // Retro box shadow
} as const;

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '250ms ease-in-out',
  slow: '350ms ease-in-out',
} as const;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Export the complete theme object
export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  transitions,
  zIndex,
} as const;

export type Theme = typeof theme;

export default theme;
