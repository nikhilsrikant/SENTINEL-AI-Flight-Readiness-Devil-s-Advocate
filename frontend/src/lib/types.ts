/**
 * SENTINEL Platform - Shared TypeScript Type Definitions
 *
 * These types mirror the backend Pydantic models to ensure
 * type safety across the full stack.
 */

// ---------------------------------------------------------------------------
// Enums & Primitives
// ---------------------------------------------------------------------------

export type SeverityLevel = 'nominal' | 'advisory' | 'caution' | 'warning' | 'critical';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export type GraniteProvider = 'watsonx' | 'ollama' | 'huggingface' | 'mock';

export type ModuleName =
  | 'devils_advocate'
  | 'anomaly_tracker'
  | 'mission_planner'
  | 'orbital_monitor'
  | 'telemetry_engine'
  | 'knowledge_graph'
  | 'space_academy';

export type MissionPhase =
  | 'pre_launch'
  | 'launch'
  | 'ascent'
  | 'orbit_insertion'
  | 'on_orbit'
  | 'deorbit'
  | 'reentry'
  | 'landing';

// ---------------------------------------------------------------------------
// Status & Colors
// ---------------------------------------------------------------------------

export interface StatusColors {
  nominal: string;
  advisory: string;
  caution: string;
  warning: string;
  critical: string;
}

// ---------------------------------------------------------------------------
// Granite AI Attribution
// ---------------------------------------------------------------------------

export interface GraniteAttribution {
  model_id: string;
  provider: GraniteProvider;
  inference_time_ms: number;
  token_count: number;
  confidence: number;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Devil's Advocate Module
// ---------------------------------------------------------------------------

export interface RiskFactor {
  id: string;
  name: string;
  category: string;
  severity: SeverityLevel;
  score: number;
  description: string;
  evidence: string[];
  historical_parallels: string[];
  mitigation_status: 'unmitigated' | 'partially_mitigated' | 'mitigated';
}

export interface CumulativeRiskPoint {
  timestamp: string;
  score: number;
  event_id: string;
  event_label: string;
  severity: SeverityLevel;
  contributing_factors: string[];
}

export interface CounterArgument {
  id: string;
  claim: string;
  counter: string;
  evidence: string[];
  severity: SeverityLevel;
  confidence: number;
}

export interface RiskAnalysisReport {
  id: string;
  mission_id: string;
  timestamp: string;
  overall_risk_score: number;
  overall_severity: SeverityLevel;
  recommendation: 'go' | 'no_go' | 'hold';
  risk_factors: RiskFactor[];
  cumulative_risk_timeline: CumulativeRiskPoint[];
  counter_arguments: CounterArgument[];
  feynman_questions: string[];
  granite_attribution: GraniteAttribution;
}

// ---------------------------------------------------------------------------
// Anomaly Tracker Module
// ---------------------------------------------------------------------------

export interface GoFeverIndicator {
  id: string;
  name: string;
  description: string;
  current_value: number;
  threshold: number;
  is_triggered: boolean;
  category: 'schedule_pressure' | 'normalization' | 'communication' | 'authority';
}

export interface AnomalyRecord {
  id: string;
  timestamp: string;
  system: string;
  subsystem: string;
  description: string;
  severity: SeverityLevel;
  confidence: number;
  pattern_match: string | null;
  historical_incidents: string[];
  is_acknowledged: boolean;
  resolution_status: 'open' | 'investigating' | 'resolved' | 'accepted_risk';
}

// ---------------------------------------------------------------------------
// Telemetry Engine Module
// ---------------------------------------------------------------------------

export interface TelemetryDataPoint {
  timestamp: string;
  parameter: string;
  value: number;
  unit: string;
  nominal_range: { min: number; max: number };
  is_anomalous: boolean;
  severity: SeverityLevel | null;
}

export interface TelemetryStream {
  stream_id: string;
  system: string;
  parameters: string[];
  sample_rate_hz: number;
  is_active: boolean;
}

// ---------------------------------------------------------------------------
// Knowledge Graph Module
// ---------------------------------------------------------------------------

export interface IncidentRecord {
  id: string;
  name: string;
  mission: string;
  date: string;
  vehicle: string;
  outcome: string;
  summary: string;
  root_causes: {
    technical: string;
    organizational: string;
    cultural: string;
  };
  warning_signs: string[];
  lessons_learned: string[];
  sentinel_relevance: {
    pattern_type: string;
    go_fever_score: number;
    preventability_score: number;
    key_parallel: string;
  };
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'incident' | 'factor' | 'decision' | 'person' | 'organization' | 'lesson';
  severity?: SeverityLevel;
  metadata: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  weight: number;
  metadata: Record<string, unknown>;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface RAGQueryResult {
  answer: string;
  sources: RAGSource[];
  confidence: number;
  granite_attribution: GraniteAttribution;
}

export interface RAGSource {
  id: string;
  title: string;
  relevance_score: number;
  excerpt: string;
  incident_id?: string;
}

// ---------------------------------------------------------------------------
// Mission Planner Module
// ---------------------------------------------------------------------------

export interface MissionPlan {
  id: string;
  name: string;
  vehicle: string;
  target: string;
  launch_date: string;
  phases: MissionPhaseDetail[];
  risk_score: number;
  status: 'planning' | 'review' | 'approved' | 'active' | 'completed';
}

export interface MissionPhaseDetail {
  phase: MissionPhase;
  start_time: string;
  duration_hours: number;
  risk_factors: string[];
  hold_points: HoldPoint[];
}

export interface HoldPoint {
  id: string;
  name: string;
  criteria: string;
  is_mandatory: boolean;
  historical_basis: string;
}

// ---------------------------------------------------------------------------
// Orbital Monitor Module
// ---------------------------------------------------------------------------

export interface OrbitalObject {
  id: string;
  name: string;
  norad_id: number;
  object_type: 'payload' | 'debris' | 'rocket_body';
  orbit: OrbitalElements;
  last_updated: string;
}

export interface OrbitalElements {
  semi_major_axis_km: number;
  eccentricity: number;
  inclination_deg: number;
  raan_deg: number;
  arg_perigee_deg: number;
  mean_anomaly_deg: number;
  epoch: string;
}

export interface ConjunctionEvent {
  id: string;
  primary_object: string;
  secondary_object: string;
  tca: string; // Time of closest approach
  miss_distance_km: number;
  probability_of_collision: number;
  severity: SeverityLevel;
}

// ---------------------------------------------------------------------------
// Space Academy Module
// ---------------------------------------------------------------------------

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  incident_id?: string;
  objectives: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// ---------------------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------------------

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  based_on_incident?: string;
  parameters: SimulationParameter[];
  expected_outcome: string;
  risk_trajectory: CumulativeRiskPoint[];
}

export interface SimulationParameter {
  name: string;
  type: 'numeric' | 'boolean' | 'enum';
  current_value: number | boolean | string;
  range?: { min: number; max: number };
  options?: string[];
  description: string;
}

// ---------------------------------------------------------------------------
// API Envelope
// ---------------------------------------------------------------------------

export interface APIResponse<T = unknown> {
  status: 'success' | 'error';
  data: T | null;
  error: APIError | null;
}

export interface APIError {
  message: string;
  id: string;
  validation_errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  constraint: string;
  rejected_value: unknown;
}

// ---------------------------------------------------------------------------
// Platform Health
// ---------------------------------------------------------------------------

export interface PlatformHealth {
  platform: string;
  version: string;
  modules: ModuleName[];
  ai_provider: GraniteProvider;
  mock_mode: boolean;
}

export interface ModuleStatus {
  state: 'healthy' | 'degraded' | 'unavailable';
  last_check: string | null;
}
