/**
 * Mawaeedak Theme Tokens
 * Shared between Web and Mobile
 */

// Primary Colors
export const GOLD = '#C9A063';
export const BROWN = '#8A6B3D';
export const INK = '#2F2B25';

// Backgrounds
export const PAPER = '#FAF7F2';
export const CREAM = '#F5EFE4';
export const SURFACE = '#FFFFFF';

// Text
export const TEXT_PRIMARY = '#2F2B25';
export const TEXT_SECONDARY = '#6F6557';

// Semantic
export const ERROR = '#B9483F';
export const SUCCESS = '#7A9A74';
export const INFO = '#4A7FB5';

// Border
export const BORDER = 'rgba(201,160,99,0.16)';
export const BORDER_GOLD = 'rgba(201,160,99,0.30)';

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Border Radius
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Shadows
export const SHADOWS = {
  sm: '0 2px 8px rgba(138,107,61,0.08)',
  md: '0 4px 12px rgba(138,107,61,0.12)',
  lg: '0 8px 24px rgba(138,107,61,0.16)',
};

// Typography
export const FONT = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 21,
    xxl: 28,
    xxxl: 36,
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

// Animation
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Export theme object
export const theme = {
  colors: {
    primary: GOLD,
    secondary: BROWN,
    ink: INK,
    background: PAPER,
    surface: SURFACE,
    text: TEXT_PRIMARY,
    textSecondary: TEXT_SECONDARY,
    error: ERROR,
    success: SUCCESS,
    info: INFO,
  },
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
  font: FONT,
  animation: ANIMATION,
};

export default theme;
