/**
 * Centralized style constants for ATEMS application
 * Used for inline styles where Tailwind custom classes don't apply correctly
 */

// Color palette matching CSS variables and Tailwind config
export const colors = {
  primary: '#1e3a5f',
  primaryLight: '#2c5282',
  primaryDark: '#1a365d',
  secondary: '#c53030',
  accent: '#d69e2e',
  success: '#38a169',
  warning: '#d69e2e',
  error: '#c53030',
  info: '#3182ce',
  // Derived colors with opacity
  primaryAlpha10: 'rgba(30, 58, 95, 0.1)',
  primaryAlpha20: 'rgba(30, 58, 95, 0.2)',
  secondaryAlpha10: 'rgba(197, 48, 48, 0.1)',
  successAlpha10: 'rgba(56, 161, 105, 0.1)',
  warningAlpha10: 'rgba(214, 158, 46, 0.1)',
  errorAlpha10: 'rgba(197, 48, 48, 0.1)',
  infoAlpha10: 'rgba(49, 130, 206, 0.1)',
} as const;

// Shadow styles matching Tailwind config
export const shadows = {
  govt: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  govtLg: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
} as const;

// Common card style
export const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  boxShadow: shadows.govt,
};

// Button variant styles
export const buttonStyles = {
  primary: {
    backgroundColor: colors.primary,
    color: 'white',
  },
  primaryHover: {
    backgroundColor: colors.primaryLight,
  },
  secondary: {
    backgroundColor: colors.secondary,
    color: 'white',
  },
  secondaryHover: {
    backgroundColor: '#b91c1c',
  },
  danger: {
    backgroundColor: colors.error,
    color: 'white',
  },
  dangerHover: {
    backgroundColor: '#b91c1c',
  },
  outline: {
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
  },
  outlineHover: {
    backgroundColor: '#f9fafb',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#374151',
  },
  ghostHover: {
    backgroundColor: '#f3f4f6',
  },
} as const;

// Focus ring style
export const focusRingStyle = {
  outline: 'none',
  boxShadow: `0 0 0 2px white, 0 0 0 4px ${colors.primary}`,
};

export default { colors, shadows, cardStyle, buttonStyles, focusRingStyle };
