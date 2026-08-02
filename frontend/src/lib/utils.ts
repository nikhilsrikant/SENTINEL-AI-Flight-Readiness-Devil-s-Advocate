import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with conflict resolution.
 * Uses clsx for conditional classes and tailwind-merge for deduplication.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * SENTINEL Design System - Status Colors
 * Maps severity levels to their hex color values.
 */
export const STATUS_COLORS = {
  nominal: '#10B981',   // green
  advisory: '#3B82F6',  // blue
  caution: '#F59E0B',   // yellow
  warning: '#F97316',   // orange
  critical: '#EF4444',  // red
} as const;

export type SeverityLevel = keyof typeof STATUS_COLORS;

/**
 * Get severity level from a cumulative risk score.
 * Based on the defined score-range mappings.
 */
export function getSeverityFromScore(score: number): SeverityLevel {
  if (score <= 0.2) return 'nominal';
  if (score <= 0.4) return 'advisory';
  if (score <= 0.6) return 'caution';
  if (score <= 0.8) return 'warning';
  return 'critical';
}

/**
 * Format a risk score for display.
 */
export function formatRiskScore(score: number): string {
  return score.toFixed(2);
}

/**
 * Get the Tailwind CSS class for a severity level's glow effect.
 */
export function getGlowClass(level: SeverityLevel): string {
  return `glow-${level}`;
}

/**
 * API base URL for backend communication.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * WebSocket URL for telemetry streaming.
 */
export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/v1/telemetry_engine/stream';
