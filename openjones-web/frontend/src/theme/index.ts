/**
 * OpenJones Design System - Theme Configuration
 *
 * Authentic 1990s retro game aesthetic inspired by:
 * - Jones in the Fast Lane (1990)
 * - SimCity 2000 (1993)
 * - Windows 95 UI
 * - DOS-era 16-color palette with dithering
 */

export const colors = {
  // DOS/Win95 System Colors - Authentic retro palette
  system: {
    // Classic Windows 95 grays
    windowGray: '#C0C0C0',      // Standard window background
    darkGray: '#808080',         // Window borders, disabled text
    buttonFace: '#D4D0C8',       // Button surface (beige-gray)
    buttonShadow: '#808080',     // Button shadow
    buttonDkShadow: '#000000',   // Button dark shadow
    buttonLight: '#FFFFFF',      // Button highlight
    buttonHilight: '#DFDFDF',    // Button light edge
  },

  // DOS-era Earth Tones - Warm, muted palette
  retro: {
    tan: '#D4C4A8',              // Beige/tan backgrounds
    darkTan: '#A89878',          // Darker tan for contrast
    brown: '#8B7355',            // Brown UI panels
    darkBrown: '#6B5345',        // Dark brown borders
    cream: '#F5F5DC',            // Cream for highlights
    olive: '#808000',            // Olive green accent
  },

  // Primary UI Colors - High contrast for readability
  primary: {
    background: '#008080',       // Teal (classic 90s color)
    dark: '#000080',             // Navy blue
    light: '#00FFFF',            // Cyan
    text: '#FFFF00',             // Yellow (high contrast on blue)
  },

  // Accent colors - Limited DOS palette
  accent: {
    gold: '#FFFF00',             // Bright yellow for money
    green: '#00FF00',            // Lime green for success
    red: '#FF0000',              // Pure red for danger
    orange: '#FF8000',           // Orange for warnings
    cyan: '#00FFFF',             // Cyan for info
    magenta: '#FF00FF',          // Magenta for special
  },

  // Neutral palette - DOS black and white
  neutral: {
    black: '#000000',
    darkGray: '#404040',
    gray: '#808080',
    lightGray: '#C0C0C0',
    paleGray: '#E0E0E0',
    white: '#FFFFFF',
  },

  // Game-specific colors - Earthy retro feel
  game: {
    background: '#8B7355',       // Brown background
    boardBg: '#D4C4A8',          // Tan game board
    panel: '#C0C0C0',            // Gray UI panels
    border: '#000000',           // Black borders (thick and bold)
    highlight: '#FFFF00',        // Yellow highlights
    text: '#000000',             // Black text on light backgrounds
    textLight: '#FFFFFF',        // White text on dark backgrounds
    gridLine: '#A89878',         // Subtle grid lines
  },

  // Status colors - Vibrant for visibility
  status: {
    health: '#FF0000',           // Bright red
    happiness: '#FFFF00',        // Bright yellow
    education: '#0000FF',        // Bright blue
    career: '#800080',           // Purple
    wealth: '#00FF00',           // Bright green
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
    primary: '"Press Start 2P", "Courier New", monospace', // Pixel font primary
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"Courier New", Courier, monospace',
    retro: '"Press Start 2P", monospace',
  },
  fontSize: {
    tiny: '6px',   // For very small retro text
    xs: '8px',     // Small pixel text
    sm: '10px',    // Medium pixel text
    md: '12px',    // Standard pixel text
    lg: '16px',    // Large pixel text
    xl: '20px',    // XL pixel text
    xxl: '24px',   // XXL pixel text
  },
  fontWeight: {
    normal: 400,   // Press Start 2P only has one weight
  },
  lineHeight: {
    tight: 1.0,    // Tighter for pixel fonts
    normal: 1.4,   // Normal for readability
    relaxed: 1.6,  // Relaxed for body text
  },
} as const;

export const borderRadius = {
  none: '0',        // Retro aesthetic = no rounded corners!
  pixel: '0',       // All corners are sharp pixels
} as const;

export const shadows = {
  none: 'none',
  // Retro hard-edged drop shadows (no blur)
  retro1: '2px 2px 0px #000000',           // Small retro shadow
  retro2: '4px 4px 0px #000000',           // Medium retro shadow
  retro3: '6px 6px 0px #000000',           // Large retro shadow
  // Windows 95 style beveled edges (inset/outset)
  win95Raised: 'inset -1px -1px 0px #000000, inset 1px 1px 0px #FFFFFF, inset -2px -2px 0px #808080, inset 2px 2px 0px #DFDFDF',
  win95Sunken: 'inset 1px 1px 0px #000000, inset -1px -1px 0px #FFFFFF, inset 2px 2px 0px #808080, inset -2px -2px 0px #DFDFDF',
  win95Button: 'inset -1px -1px 0px #000000, inset 1px 1px 0px #FFFFFF, inset -2px -2px 0px #808080, inset 2px 2px 0px #DFDFDF',
  win95Pressed: 'inset 1px 1px 0px #000000, inset 2px 2px 0px #808080',
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
