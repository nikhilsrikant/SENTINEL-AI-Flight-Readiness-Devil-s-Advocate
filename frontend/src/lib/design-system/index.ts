/**
 * SENTINEL Design System - "Mission Intelligence" Theme
 *
 * Dark theme with NASA ops-center aesthetic.
 * Purple accent for IBM Granite AI content.
 * Status colors for severity level visualization.
 */

export { STATUS_COLORS, getSeverityFromScore, formatRiskScore, getGlowClass } from '../utils';
export type { SeverityLevel } from '../utils';

/**
 * Design tokens for consistent theming across components.
 */
export const DESIGN_TOKENS = {
  // IBM Granite branding
  granite: {
    primary: '#8B5CF6',
    light: '#A78BFA',
    dark: '#6D28D9',
    badge: 'Powered by IBM Granite',
  },

  // Font families
  fonts: {
    ui: 'Inter, system-ui, sans-serif',
    data: 'JetBrains Mono, Fira Code, monospace',
  },

  // Animation durations
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  // Spacing scale
  spacing: {
    module: '2rem',
    section: '1.5rem',
    element: '1rem',
    tight: '0.5rem',
  },
} as const;
