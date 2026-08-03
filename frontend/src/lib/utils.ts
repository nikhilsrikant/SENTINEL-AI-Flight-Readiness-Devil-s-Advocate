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
 * Format a risk score for display (e.g., 0.75 -> "0.75").
 */
export function formatRiskScore(score: number): string {
  return score.toFixed(2);
}

/**
 * Format a risk score as a percentage (e.g., 0.75 -> "75%").
 */
export function formatRiskPercent(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/**
 * Format a date string for display.
 * Handles ISO strings and returns a human-readable format.
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const defaults: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  try {
    return new Date(dateString).toLocaleDateString('en-US', options || defaults);
  } catch {
    return dateString;
  }
}

/**
 * Format a date string showing only the date portion (no time).
 */
export function formatDateShort(dateString: string): string {
  return formatDate(dateString, { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Truncate text to a specified length with ellipsis.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trimEnd() + '...';
}

/**
 * Get the Tailwind CSS class for a severity level's glow effect.
 */
export function getGlowClass(level: SeverityLevel): string {
  return `glow-${level}`;
}

/**
 * Get the Tailwind CSS background class for a severity level.
 */
export function getSeverityBgClass(level: SeverityLevel): string {
  const map: Record<SeverityLevel, string> = {
    nominal: 'bg-green-500/10 border-green-500/30',
    advisory: 'bg-blue-500/10 border-blue-500/30',
    caution: 'bg-yellow-500/10 border-yellow-500/30',
    warning: 'bg-orange-500/10 border-orange-500/30',
    critical: 'bg-red-500/10 border-red-500/30',
  };
  return map[level];
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
