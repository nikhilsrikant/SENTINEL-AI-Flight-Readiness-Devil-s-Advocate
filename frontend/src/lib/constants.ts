import type { ModuleName, SeverityLevel, StatusColors } from './types';

/**
 * SENTINEL Platform - Application Constants
 */

// ---------------------------------------------------------------------------
// Status Colors (Design System)
// ---------------------------------------------------------------------------

export const STATUS_COLORS: StatusColors = {
  nominal: '#10B981',
  advisory: '#3B82F6',
  caution: '#F59E0B',
  warning: '#F97316',
  critical: '#EF4444',
};

export const STATUS_COLORS_RGB = {
  nominal: '16, 185, 129',
  advisory: '59, 130, 246',
  caution: '245, 158, 11',
  warning: '249, 115, 22',
  critical: '239, 68, 68',
} as const;

// ---------------------------------------------------------------------------
// Severity Thresholds
// ---------------------------------------------------------------------------

export const SEVERITY_THRESHOLDS: Record<SeverityLevel, { min: number; max: number }> = {
  nominal: { min: 0, max: 0.2 },
  advisory: { min: 0.2, max: 0.4 },
  caution: { min: 0.4, max: 0.6 },
  warning: { min: 0.6, max: 0.8 },
  critical: { min: 0.8, max: 1.0 },
};

export const CRITICAL_RISK_THRESHOLD = 0.7;
export const NO_GO_THRESHOLD = 0.8;

// ---------------------------------------------------------------------------
// Module Navigation
// ---------------------------------------------------------------------------

export interface ModuleNavItem {
  id: ModuleName;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  path: string;
}

export const MODULE_NAV_ITEMS: ModuleNavItem[] = [
  {
    id: 'devils_advocate',
    label: "Devil's Advocate",
    shortLabel: 'Advocate',
    description: 'AI-powered counter-argument engine for flight readiness decisions',
    icon: '⚠️',
    path: '/modules/devils-advocate',
  },
  {
    id: 'anomaly_tracker',
    label: 'Anomaly Tracker',
    shortLabel: 'Anomalies',
    description: 'Real-time anomaly detection and pattern matching',
    icon: '🔍',
    path: '/modules/anomaly-tracker',
  },
  {
    id: 'mission_planner',
    label: 'Mission Planner',
    shortLabel: 'Mission',
    description: 'AI-assisted mission timeline planning with risk awareness',
    icon: '🚀',
    path: '/modules/mission-planner',
  },
  {
    id: 'orbital_monitor',
    label: 'Orbital Monitor',
    shortLabel: 'Orbital',
    description: '3D orbital visualization and conjunction analysis',
    icon: '🛰️',
    path: '/modules/orbital-monitor',
  },
  {
    id: 'telemetry_engine',
    label: 'Telemetry Engine',
    shortLabel: 'Telemetry',
    description: 'Real-time telemetry streaming and visualization',
    icon: '📊',
    path: '/modules/telemetry-engine',
  },
  {
    id: 'knowledge_graph',
    label: 'Knowledge Graph',
    shortLabel: 'Knowledge',
    description: 'RAG-powered incident knowledge base',
    icon: '🧠',
    path: '/modules/knowledge-graph',
  },
  {
    id: 'space_academy',
    label: 'Space Academy',
    shortLabel: 'Academy',
    description: 'Interactive learning from organizational failures',
    icon: '🎓',
    path: '/modules/space-academy',
  },
];

// ---------------------------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------------------------

export const API_ENDPOINTS = {
  // System
  health: '/api/v1/health',
  status: '/api/v1/status',

  // Devil's Advocate
  devilsAdvocate: {
    analyze: '/api/v1/devils_advocate/analyze',
    history: '/api/v1/devils_advocate/history',
    scenarios: '/api/v1/devils_advocate/scenarios',
  },

  // Anomaly Tracker
  anomalyTracker: {
    anomalies: '/api/v1/anomaly_tracker/anomalies',
    patterns: '/api/v1/anomaly_tracker/patterns',
    goFever: '/api/v1/anomaly_tracker/go_fever',
  },

  // Mission Planner
  missionPlanner: {
    missions: '/api/v1/mission_planner/missions',
    create: '/api/v1/mission_planner/missions',
    timeline: '/api/v1/mission_planner/timeline',
  },

  // Orbital Monitor
  orbitalMonitor: {
    objects: '/api/v1/orbital_monitor/objects',
    conjunctions: '/api/v1/orbital_monitor/conjunctions',
    propagate: '/api/v1/orbital_monitor/propagate',
  },

  // Telemetry Engine
  telemetryEngine: {
    streams: '/api/v1/telemetry_engine/streams',
    websocket: '/api/v1/telemetry_engine/stream',
    history: '/api/v1/telemetry_engine/history',
  },

  // Knowledge Graph
  knowledgeGraph: {
    query: '/api/v1/knowledge_graph/query',
    incidents: '/api/v1/knowledge_graph/incidents',
    graph: '/api/v1/knowledge_graph/graph',
    search: '/api/v1/knowledge_graph/search',
  },

  // Space Academy
  spaceAcademy: {
    lessons: '/api/v1/space_academy/lessons',
    quiz: '/api/v1/space_academy/quiz',
    progress: '/api/v1/space_academy/progress',
  },
} as const;

// ---------------------------------------------------------------------------
// WebSocket Configuration
// ---------------------------------------------------------------------------

export const WS_CONFIG = {
  maxRetries: 5,
  baseDelay: 1000,
  maxDelay: 16000,
  heartbeatInterval: 30000,
} as const;

// ---------------------------------------------------------------------------
// UI Constants
// ---------------------------------------------------------------------------

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
} as const;

export const CHART_CONFIG = {
  defaultWidth: 800,
  defaultHeight: 400,
  margin: { top: 20, right: 30, bottom: 40, left: 50 },
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#06B6D4',
    grid: '#1E293B',
    text: '#94A3B8',
  },
} as const;

// ---------------------------------------------------------------------------
// Platform Metadata
// ---------------------------------------------------------------------------

export const PLATFORM = {
  name: 'SENTINEL',
  fullName: 'SENTINEL AI Flight Readiness Platform',
  tagline: "AI-Powered Devil's Advocate for Spaceflight Safety",
  version: '1.0.0',
} as const;
