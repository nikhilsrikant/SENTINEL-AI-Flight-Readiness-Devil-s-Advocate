# Implementation Plan: SENTINEL AI Flight Readiness Platform

## Overview

This implementation plan builds the SENTINEL platform end-to-end, starting with shared infrastructure (Granite Client, Mock Mode, RAG Pipeline, API envelope, Design System), then implementing modules in priority order: Devil's Advocate Engine (flagship), Knowledge Graph, Anomaly Tracker, Telemetry Engine, Mission Planner, Orbital Monitor, and Space Academy. The backend uses Python 3.11+/FastAPI and the frontend uses Next.js 14/TypeScript.

## Tasks

- [ ] 1. Project Scaffolding and Shared Infrastructure


  - [ ] 1.1 Initialize backend project structure with FastAPI and dependencies
    - Create `backend/` directory with `main.py`, `requirements.txt`, and package structure
    - Set up FastAPI app with Uvicorn, CORS middleware (allow origin port 3000, methods GET/POST/PUT/DELETE)
    - Create directory structure: `backend/clients/`, `backend/services/`, `backend/routers/`, `backend/models/`, `backend/connectors/`, `backend/mock_data/`
    - Install dependencies: fastapi, uvicorn, pydantic, langchain, chromadb, sentence-transformers, scikit-learn, sgp4, pandas, numpy, networkx, websockets, httpx, hypothesis
    - _Requirements: 12.1, 12.7, 17.4_

  - [ ] 1.2 Initialize frontend project structure with Next.js 14 App Router
    - Create `frontend/` directory with Next.js 14 App Router configuration
    - Configure TypeScript, Tailwind CSS, and install dependencies: shadcn/ui, framer-motion, recharts, d3, @react-three/fiber, @react-three/drei
    - Set up app directory structure with layout.tsx and module route directories
    - Configure JetBrains Mono and Inter fonts
    - _Requirements: 13.1, 13.4, 14.5_


  - [ ] 1.3 Implement shared Pydantic data models and API envelope
    - Create `backend/models/shared.py` with `APIResponse[T]`, `APIError`, `ValidationFailure` envelope models
    - Create `backend/models/granite.py` with `GraniteResponse`, `FallbackEvent`, `GraniteAttribution` models
    - Create `backend/models/enums.py` with `SeverityLevel` enum (nominal, advisory, caution, warning, critical) and score-range mappings
    - Implement custom exception handlers returning standard error envelope (422 for validation, 404 for not found, 500 with opaque error ID)
    - _Requirements: 12.2, 12.3, 12.4, 12.5, 14.1_

  - [ ]* 1.4 Write property tests for API serialization round-trip
    - **Property 2: API Serialization Round-Trip**
    - Use Hypothesis to generate arbitrary valid Pydantic model instances and verify JSON serialization/deserialization produces identical field values
    - **Validates: Requirements 12.6**

  - [ ] 1.5 Implement Granite Client with multi-fallback provider chain
    - Create `backend/clients/granite_client.py` with `GraniteClient` class
    - Implement watsonx provider with 10-second timeout using httpx async client
    - Implement Ollama local provider fallback with 10-second timeout
    - Implement HuggingFace inference fallback with 10-second timeout
    - Implement Mock Mode as final fallback (< 500ms response from pre-generated store)
    - Attach IBM Granite attribution metadata (model_name, model_version, provider, is_mock) to every response
    - Log fallback events: failed provider, error type, elapsed time, next provider
    - Auto-activate Mock Mode when watsonx API key environment variable is not set
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 17.5_


  - [ ]* 1.6 Write property tests for Granite Client structural equivalence
    - **Property 5: Granite Client Structural Equivalence**
    - Verify that for any valid prompt, responses from all providers contain the same top-level JSON keys and value types
    - **Validates: Requirements 1.7**

  - [ ]* 1.7 Write unit tests for Granite Client fallback transitions
    - Test each fallback transition (watsonx->Ollama, Ollama->HuggingFace, HuggingFace->Mock) for timeout, connection error, and HTTP error scenarios
    - Test attribution metadata present on all responses regardless of provider
    - Test Mock Mode auto-activation when no API key is set
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ] 1.8 Implement Mock Mode response store and latency simulation
    - Create `backend/mock_data/` directory with JSON response files for all 7 modules
    - Implement `MockResponseStore` class that loads pre-generated responses keyed by category/prompt pattern
    - Implement simulated latency (200-800ms random) when serving mock responses
    - Ensure mock responses use identical JSON schema as live responses
    - Create mock data for Starliner CFT case study (at least 8 timeline events with risk scores, bias detections, recommendations)
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_


  - [ ]* 1.9 Write property tests for Mock Mode schema equivalence
    - **Property 14: Mock Mode Schema Equivalence**
    - Verify that mock mode responses have identical JSON schema (same top-level keys, value types, envelope structure) as live mode responses for every endpoint
    - **Validates: Requirements 18.3**

  - [ ] 1.10 Implement RAG Pipeline with ChromaDB integration
    - Create `backend/services/rag_pipeline.py` with `RAGPipeline` class
    - Implement document embedding using sentence-transformers, chunking by logical sections (cause, contributing factors, lessons learned) with max 512 tokens per chunk
    - Implement retrieval: top-k (default 5) from ChromaDB ranked by cosine similarity, minimum threshold 0.3
    - Implement prompt construction with retrieved context ordered by descending similarity, user query, and system prompt instructing Granite to reference only provided context
    - Include source citations in every response (incident name, section title, similarity score)
    - Implement keyword-based fallback search when ChromaDB is unavailable (5-second connection timeout)
    - Validate query length (reject > 1000 characters with error)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ]* 1.11 Write property tests for RAG Pipeline thresholds and round-trip
    - **Property 4: RAG Embedding/Retrieval Round-Trip**
    - **Property 10: RAG Similarity Threshold and Query Length Validation**
    - Verify embedded documents appear in top-1 results when queried by exact content
    - Verify returned chunks all have similarity >= 0.3, and queries > 1000 chars are rejected
    - **Validates: Requirements 10.8, 10.2, 10.7**


  - [ ] 1.12 Implement WebSocket Manager for real-time streaming
    - Create `backend/services/websocket_manager.py` with `WebSocketManager` class
    - Implement connection management: accept connections within 5 seconds, assign client_id, max 50 concurrent connections
    - Implement independent message delivery to each client (slow client does not block others)
    - Implement message buffering for disconnected clients (up to 300 seconds of data)
    - Implement graceful disconnect with resource release within 2 seconds
    - Implement data source unavailability notification to all clients
    - _Requirements: 8.1, 8.2, 8.4, 8.6, 8.7, 8.8_

  - [ ]* 1.13 Write property tests for WebSocket message schema validity
    - **Property 11: WebSocket Message Schema Validity**
    - Verify every broadcast message contains exactly: timestamp (ISO 8601), parameter (non-empty string), value (numeric), unit (non-empty string), status (one of the 5 severity levels)
    - **Validates: Requirements 8.5**

- [ ] 2. Checkpoint - Infrastructure Validation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Frontend Design System and App Shell


  - [ ] 3.1 Implement Design System: theme, status colors, and shared components
    - Create `frontend/lib/design-system/` with status color constants (nominal=green, advisory=blue, caution=yellow, warning=orange, critical=red)
    - Implement dark theme ("Mission Intelligence") with NASA ops-center aesthetic using Tailwind CSS
    - Implement `StatusBadge` component with color + non-color indicator (icon/text label) for accessibility
    - Implement `GraniteAttribution` component: purple accent, "Powered by IBM Granite" badge at 12px minimum font, within 8px of AI content boundary
    - Configure Framer Motion transitions (150-400ms duration range)
    - Ensure minimum 4.5:1 contrast ratio for normal text, 3:1 for large text on dark background
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 23.1, 23.2, 23.4_

  - [ ] 3.2 Implement App Shell with persistent navigation and lazy-loading
    - Create root layout with persistent navigation bar listing all 7 modules
    - Implement active module visual distinction in navigation
    - Configure client-side routing with lazy-loaded module bundles (dynamic imports)
    - Implement shell bundle optimization (target ≤ 200KB compressed)
    - Implement module load error boundary: display error message with retry action, other modules remain accessible
    - Implement Mock Mode visible indicator in the UI header
    - _Requirements: 13.1, 13.2, 13.3, 13.6, 13.7, 22.2_

  - [ ] 3.3 Implement WebSocket hook with reconnection logic
    - Create `frontend/hooks/useWebSocket.ts` with exponential backoff reconnection (1s, 2s, 4s, 8s, 16s), max 5 attempts, max 30s delay
    - Implement resume-from-last-acknowledged-data-point on successful reconnection
    - Implement connection status indicator (connected/disconnected/reconnecting)
    - Handle final close with error message after all attempts exhausted
    - _Requirements: 8.3, 8.7, 25.1_


  - [ ]* 3.4 Write unit tests for Design System and App Shell components
    - Test StatusBadge renders correct color and non-color indicator for each severity level
    - Test GraniteAttribution badge presence, font size, and purple accent styling
    - Test lazy-loading error boundary shows retry action without disrupting navigation
    - Test WebSocket hook reconnection backoff timing and max attempts
    - _Requirements: 14.1, 14.6, 13.7, 8.3_

- [ ] 4. Devil's Advocate Engine (Flagship Module)

  - [ ] 4.1 Implement cumulative risk scoring service
    - Create `backend/services/devils_advocate.py` with `DevilsAdvocateService` class
    - Implement compounding formula: `post_score = min(1.0, pre_score + risk_contribution * (1 - pre_score))`
    - Implement baseline of 0.0 for programs with no prior risk events
    - Store for each risk point: event_id, individual_contribution, pre_event_score, post_event_score
    - Implement severity level classification from cumulative score (nominal 0-0.2, advisory 0.2-0.4, caution 0.4-0.6, warning 0.6-0.8, critical 0.8-1.0)
    - Implement recalculation and timeline update within 5 seconds of new risk event
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 2.2, 2.5_

  - [ ]* 4.2 Write property tests for cumulative risk scoring
    - **Property 6: Cumulative Risk Score Bounds and Monotonicity**
    - **Property 7: Cumulative Risk Compounding Formula Correctness**
    - **Property 8: Severity Level Classification Determinism**
    - **Property 13: Cumulative Risk Timeline Auditability**
    - Verify scores remain in [0.0, 1.0], monotonically non-decreasing, formula matches `min(1.0, S + R*(1-S))`, and all stored points are auditable
    - **Validates: Requirements 19.1, 19.2, 19.3, 19.5, 2.5**


  - [ ] 4.3 Implement go-fever bias detection
    - Implement `detect_go_fever()` method with NLP-based analysis via Granite
    - Categorize indicators: schedule_pressure, normalization_of_deviance, dissent_suppression, appeal_to_authority
    - Assign confidence scores (0.0-1.0), only include indicators with confidence >= 0.3
    - Identify flagged text passages by character offset range in source document
    - Provide 1-3 historical precedent references per detected pattern
    - Support documents up to 50,000 characters, return results within 10 seconds
    - Return empty result with metadata (document length, processing time) if no indicators found
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 2.3, 2.4_

  - [ ]* 4.4 Write property tests for go-fever confidence threshold filtering
    - **Property 9: Go-Fever Confidence Threshold Filtering**
    - Verify output only includes indicators with confidence >= 0.3 and excludes all below 0.3
    - **Validates: Requirements 20.3**

  - [ ] 4.5 Implement full risk analysis report generation
    - Implement `analyze_risk()` method generating devil's advocate arguments
    - Include: identified risk factors with severity, historical precedents per risk, cumulative score, go-fever indicators, final recommendation (proceed/caution/hold)
    - Generate "launch hold" recommendation when cumulative score > 0.7 (with contributing factors, historical precedent, score breakdown)
    - Implement 30-second timeout with error response if exceeded
    - Fall back to pre-generated mock analysis if AI provider fails
    - _Requirements: 2.1, 2.6, 2.7, 2.8_


  - [ ] 4.6 Implement Starliner CFT Case Study Demo data and endpoints
    - Create pre-generated mock data for Starliner CFT timeline with at least 8 chronological events
    - Each event includes: date, title, anomaly description, risk severity level
    - Include cumulative risk scores, bias detections, and recommendations per event
    - Implement endpoint `GET /api/v1/devils_advocate/case_study/starliner` returning full timeline
    - Implement endpoint `GET /api/v1/devils_advocate/timeline/{program_id}` returning risk timeline
    - Handle missing mock data gracefully (error indication, remain on previous content)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ] 4.7 Implement Devil's Advocate REST API router
    - Create `backend/routers/devils_advocate.py` with endpoints:
      - `POST /api/v1/devils_advocate/analyze` - Full risk analysis
      - `POST /api/v1/devils_advocate/go_fever` - Bias detection
      - `GET /api/v1/devils_advocate/timeline/{program_id}` - Risk timeline
      - `GET /api/v1/devils_advocate/case_study/starliner` - Starliner demo
    - Apply Pydantic validation to all request bodies
    - Return standard API envelope responses
    - _Requirements: 12.1, 12.2, 12.5_

  - [ ]* 4.8 Write unit tests for Devil's Advocate Engine
    - Test risk report with score > 0.7 triggers "hold" recommendation
    - Test severity classification boundary values (0.0, 0.2, 0.4, 0.6, 0.8, 1.0)
    - Test fallback to mock response on AI provider failure
    - Test 30-second timeout handling
    - Test Starliner demo returns at least 8 events with required fields
    - _Requirements: 2.1, 2.5, 2.6, 2.7, 2.8, 3.1_


  - [ ] 4.9 Implement Devil's Advocate frontend module
    - Create Devil's Advocate page with risk analysis request form
    - Implement cumulative risk timeline chart (Recharts): X-axis = chronological events, Y-axis = cumulative score (0.0-1.0)
    - Apply status color coding to data points based on severity thresholds
    - Implement event selection showing per-event risk analysis detail panel
    - Display go-fever indicators with flagged text passages
    - Implement Starliner CFT case study timeline visualization
    - Include IBM Granite attribution badge on all AI-generated content with purple accent
    - _Requirements: 3.2, 3.3, 3.5, 19.4, 23.1, 23.2_

- [ ] 5. Checkpoint - Devil's Advocate Complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Knowledge Graph Module (RAG Backbone)

  - [ ] 6.1 Implement incident data corpus and storage
    - Create `backend/services/knowledge_graph.py` with `KnowledgeGraphService` class
    - Implement incident storage with mandatory fields: date, mission, vehicle, root_cause, contributing_factors (1-10), outcome, lessons_learned, related_incidents
    - Store "unknown" value and flag as incomplete when mandatory field unavailable
    - Include at least 40 real spaceflight incidents from NASA databases spanning 4+ decades (1960s-2024), minimum 3 per decade
    - Maintain bidirectional relationship links between incidents sharing root cause, vehicle, or contributing factor
    - _Requirements: 24.1, 24.2, 24.3, 24.5, 9.1_


  - [ ] 6.2 Implement Knowledge Graph RAG query and indexing
    - Implement ChromaDB embedding of incident corpus (chunk by root_cause, contributing_factors, lessons_learned sections, max 512 tokens per chunk)
    - Implement `query()` method: retrieve top-k (default 5) from ChromaDB by cosine similarity, generate response via Granite referencing only retrieved context
    - Include source citations (incident name, section title, similarity score) in every response
    - Implement `add_incident()` with re-indexing in ChromaDB within 30 seconds
    - Implement causal chain identification (2+ incidents sharing common factor, up to 5 links)
    - Handle no-results case (display message suggesting alternative search terms)
    - Fall back to pre-generated mock results when RAG/Granite unavailable
    - _Requirements: 9.2, 9.5, 9.6, 9.8, 9.9, 24.4_

  - [ ]* 6.3 Write property tests for incident storage/retrieval round-trip
    - **Property 3: Incident Storage/Retrieval Round-Trip**
    - Verify that storing a complete incident and querying by unique ID returns all fields and relationships identical to the original
    - **Validates: Requirements 9.7**

  - [ ] 6.4 Implement Knowledge Graph REST API router
    - Create `backend/routers/knowledge_graph.py` with endpoints:
      - `POST /api/v1/knowledge_graph/query` - RAG-powered query (within 5 seconds)
      - `GET /api/v1/knowledge_graph/graph` - Graph visualization data (max 200 nodes)
      - `GET /api/v1/knowledge_graph/incident/{id}` - Incident detail
      - `POST /api/v1/knowledge_graph/incident` - Add new incident
    - Apply Pydantic validation, return standard API envelope
    - _Requirements: 9.2, 9.3, 9.4, 12.1, 12.2_


  - [ ] 6.5 Implement D3.js Knowledge Graph frontend visualization
    - Create Knowledge Graph page with D3.js force-directed graph (up to 500 nodes, initial render < 3 seconds)
    - Implement node types: incident, cause, system, mission with 4 visually distinct colors
    - Size nodes proportionally to connection count (min 8px, max 40px radius)
    - Implement node click: show detail panel within 500ms with full incident record and connected nodes
    - Implement search: case-insensitive substring match (1-200 chars) highlighting matched nodes and 1-hop neighbors
    - Display "no matching nodes" message when search returns zero results
    - Support zoom, pan, node-drag interactions at 60fps target
    - Handle data load failure with error message and retry action
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

  - [ ]* 6.6 Write unit tests for Knowledge Graph service
    - Test causal chain identification with shared contributing factors
    - Test incident storage with incomplete fields (marked as incomplete)
    - Test bidirectional relationship links
    - Test query with no results above similarity threshold
    - _Requirements: 9.5, 9.7, 9.8, 24.2_

- [ ] 7. Anomaly Tracker Module

  - [ ] 7.1 Implement Anomaly Tracker service with pattern detection
    - Create `backend/services/anomaly_tracker.py` with `AnomalyTrackerService` class
    - Implement `ingest_data()`: analyze telemetry/incident data for anomalous patterns using statistical and ML-based detection, return results within 10 seconds
    - Classify anomalies with severity level and cross-reference against historical records within the same program
    - Track anomaly frequency, severity, and time-between-occurrences per category for program lifetime
    - Identify systemic failure modes (same category in 2+ missions within a program)
    - _Requirements: 4.1, 4.2, 4.3, 4.5_


  - [ ] 7.2 Implement escalation detection and alerting
    - Implement `detect_escalation()`: check for severity increase (1+ levels) or frequency increase (2x+) in rolling 30-day window vs prior 30-day window
    - Generate escalation alerts with: anomaly category, current severity, frequency trend, time-between-occurrences trend, historical precedents
    - Correlate anomalies across multiple missions by matching category and affected system
    - Handle detection failure with error response (failure reason, last successful analysis timestamp, last known valid state)
    - _Requirements: 4.4, 4.5, 4.7_

  - [ ] 7.3 Implement Anomaly Tracker REST API router
    - Create `backend/routers/anomaly_tracker.py` with endpoints:
      - `POST /api/v1/anomaly_tracker/ingest` - Ingest new data
      - `GET /api/v1/anomaly_tracker/patterns/{program_id}` - Pattern analysis
      - `GET /api/v1/anomaly_tracker/alerts/{program_id}` - Active escalation alerts
    - Apply Pydantic validation, return standard API envelope
    - _Requirements: 12.1, 12.2_

  - [ ] 7.4 Implement Anomaly Tracker frontend module
    - Create Anomaly Tracker page with real-time detection results alongside historical pattern analysis
    - Display timeline of occurrences, severity trend chart (Recharts), and frequency metrics in a single view
    - Apply design system status colors to severity indicators
    - Show escalation alerts with cross-mission correlation details
    - _Requirements: 4.6, 14.1, 14.2_

  - [ ]* 7.5 Write unit tests for Anomaly Tracker
    - Test escalation detection at 2x frequency threshold boundary
    - Test systemic failure mode identification (2+ missions)
    - Test severity classification boundaries
    - Test error handling with last known valid state
    - _Requirements: 4.4, 4.5, 4.7_


- [ ] 8. Telemetry Insight Engine Module

  - [ ] 8.1 Implement Telemetry Engine service with translation and trend analysis
    - Create `backend/services/telemetry_engine.py` with `TelemetryEngineService` class
    - Implement `translate()`: convert raw telemetry to plain-English summary (parameter name, value with unit, status classification, one-sentence interpretation) within 2 seconds
    - Implement `classify_trend()`: classify as improving/stable/degrading based on rolling history (min 5 data points for trend, maintain at least 60 data points per parameter)
    - Include trend direction and rate of change in parameter summary
    - _Requirements: 7.1, 7.2, 7.5_

  - [ ] 8.2 Implement telemetry recommendations and WebSocket streaming
    - Implement `generate_recommendation()` for out-of-bounds parameters: condition description, up to 3 possible causes from RAG/knowledge base, at least 1 suggested response action
    - Stream translated insights to all connected clients via WebSocket within 500ms of processing
    - Implement configurable push interval (100ms-10s, default 1s)
    - Implement message buffering for disconnected clients (300 seconds)
    - Deliver buffered data in chronological order upon reconnection
    - Fall back to template-based summary (parameter, value, unit, status) without AI interpretation on provider failure
    - _Requirements: 7.3, 7.4, 7.6, 7.7, 8.2_

  - [ ] 8.3 Implement Telemetry Engine REST API and WebSocket endpoint
    - Create `backend/routers/telemetry_engine.py` with:
      - WebSocket endpoint `ws://localhost:8000/api/v1/telemetry_engine/stream`
      - REST endpoints for telemetry history and parameter status
    - Wire WebSocket Manager for broadcast and client management
    - _Requirements: 8.1, 12.1_


  - [ ] 8.4 Implement Telemetry Engine frontend module
    - Create Telemetry Engine page with real-time streaming telemetry display
    - Render parameter summaries with plain-English interpretations
    - Display trend indicators (improving/stable/degrading) with visual cues
    - Apply status colors and GraniteAttribution to AI-generated insights
    - Use JetBrains Mono font for all numeric and telemetry data values
    - Implement connection status indicator showing WebSocket state
    - _Requirements: 7.1, 13.4, 14.1, 23.1_

  - [ ]* 8.5 Write unit tests for Telemetry Engine
    - Test trend classification with exactly 5 data points (minimum)
    - Test template-based fallback when AI provider fails
    - Test WebSocket message schema compliance
    - Test buffering and chronological delivery on reconnection
    - _Requirements: 7.2, 7.7, 8.5_

- [ ] 9. Checkpoint - Core Modules Complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Mission Planner Module

  - [ ] 10.1 Implement Mission Planner service with timeline generation
    - Create `backend/services/mission_planner.py` with `MissionPlannerService` class
    - Implement `generate_plan()`: accept mission parameters (vehicle type, duration, crew size, destination), generate timeline with phases, milestones, resource allocations
    - Ensure safety margin buffers of at least 10% of each phase duration
    - Incorporate risk assessments from Devil's Advocate Engine; flag phases with risk >= 0.7 as warning/critical
    - Generate pre-flight checklist with description and pass/fail criterion per item
    - Detect and present resource conflicts (conflicting activities, contested resource, overlap period)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_


  - [ ]* 10.2 Write property tests for mission phase safety margins
    - **Property 12: Mission Phase Safety Margins**
    - Verify every generated phase has safety_margin_hours >= 0.1 * duration_hours
    - **Validates: Requirements 5.1**

  - [ ] 10.3 Implement Mission Planner recalculation and degraded mode
    - Implement `recalculate()`: update affected timeline segments and resource budgets within 5 seconds of risk factor change
    - Implement degraded-mode operation when Devil's Advocate Engine is unavailable (generate timeline without risk annotations, show degraded indicator)
    - _Requirements: 5.5, 5.7_

  - [ ] 10.4 Implement Mission Planner REST API router
    - Create `backend/routers/mission_planner.py` with endpoints:
      - `POST /api/v1/mission_planner/generate` - Generate mission plan
      - `GET /api/v1/mission_planner/plan/{plan_id}` - Retrieve plan
      - `POST /api/v1/mission_planner/plan/{plan_id}/recalculate` - Recalculate on change
      - `GET /api/v1/mission_planner/plan/{plan_id}/checklist` - Pre-flight checklist
    - Apply Pydantic validation, return standard API envelope
    - _Requirements: 12.1, 12.2_

  - [ ] 10.5 Implement Mission Planner frontend module
    - Create Mission Planner page with timeline visualization
    - Render phases with risk-level visual indicators using design system status colors
    - Display pre-flight checklist with pass/fail verification
    - Show resource conflicts with overlap details
    - Apply GraniteAttribution on AI-generated timeline content
    - _Requirements: 5.6, 14.1, 23.1_

  - [ ]* 10.6 Write unit tests for Mission Planner
    - Test resource conflict detection between overlapping activities
    - Test safety margin enforcement (10% minimum)
    - Test recalculation time constraint (< 5 seconds)
    - Test degraded mode indicator when Devil's Advocate unavailable
    - _Requirements: 5.1, 5.4, 5.5, 5.7_


- [ ] 11. Orbital Hazard Monitor Module

  - [ ] 11.1 Implement Orbital Monitor service with TLE parsing and SGP4 propagation
    - Create `backend/services/orbital_monitor.py` with `OrbitalMonitorService` class
    - Implement `load_tle_data()`: parse TLE orbital elements using SGP4 propagation library, compute current positions within 5 seconds of data receipt
    - Handle malformed/corrupted TLE input: reject invalid records, display error with failed count, continue with valid data
    - _Requirements: 6.1, 6.7_

  - [ ]* 11.2 Write property tests for TLE parsing round-trip
    - **Property 1: TLE Parsing Round-Trip**
    - Verify parsing TLE -> formatting to TLE -> parsing again produces orbital elements within ±1e-8 of original values
    - **Validates: Requirements 6.6**

  - [ ] 11.3 Implement conjunction detection and collision risk assessment
    - Implement `compute_conjunctions()`: identify objects predicted to pass within 10km of each other
    - Implement `assess_collision_risk()`: compute collision probability and time-to-closest-approach
    - Generate collision avoidance alert when probability exceeds configurable threshold (default 1e-4): involved objects, probability, time-to-closest-approach, recommended maneuver window within 24 hours
    - _Requirements: 6.3, 6.4_

  - [ ] 11.4 Implement Orbital Monitor REST API router
    - Create `backend/routers/orbital_monitor.py` with endpoints:
      - `GET /api/v1/orbital_monitor/objects` - List tracked objects (paginated)
      - `GET /api/v1/orbital_monitor/conjunctions` - Active conjunction warnings
      - `GET /api/v1/orbital_monitor/conjunction/{id}` - Conjunction detail
      - `POST /api/v1/orbital_monitor/tle/load` - Load/refresh TLE data
    - Apply Pydantic validation, return standard API envelope
    - _Requirements: 12.1, 12.2_


  - [ ] 11.5 Implement 3D Orbital Visualization frontend module
    - Create Orbital Monitor page with React Three Fiber 3D Earth-centered scene
    - Render orbital paths and tracked objects within 3 seconds of view initialization
    - Limit simultaneously rendered objects to 500 (prioritize conjunction-alert objects, then nearest to camera frustum)
    - Implement level-of-detail optimization for 30fps minimum (24fps during transitions)
    - Visually distinguish conjunction-alert objects (distinct color or pulsing animation) with predicted closest approach geometry line/arc
    - Support rotate, zoom, pan at 60fps target (16ms input response)
    - Display indicator showing total object count vs currently rendered when exceeding 500
    - Handle WebGL unavailability: show error with suggestion for alternative 2D view
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 6.2, 6.5_

  - [ ]* 11.6 Write unit tests for Orbital Monitor
    - Test conjunction alert generation at < 10km approach distance
    - Test collision probability threshold triggering
    - Test TLE parse failure handling (invalid records rejected, valid data continues)
    - Test 500-object rendering budget enforcement
    - _Requirements: 6.3, 6.4, 6.7, 15.2_

- [ ] 12. Space Academy Module

  - [ ] 12.1 Implement Space Academy service with simulations and quizzes
    - Create `backend/services/space_academy.py` with `SpaceAcademyService` class
    - Implement `start_simulation()`: present historical decision scenario with time pressure, limited data, conflicting advisories mirroring actual conditions
    - Implement `submit_decision()`: reveal historical outcome, explain what happened, provide AI analysis within 5 seconds
    - Implement `generate_quiz()`: generate 5-10 multiple-choice questions (4 options each) from incident data via Granite, testing root causes, contributing factors, lessons learned
    - Implement difficulty adaptation: >80% advance, <50% descend, 50-80% maintain across 3 levels (beginner, intermediate, advanced)
    - Provide summary score (0-100%) and 1-3 personalized learning recommendations on completion
    - Include at least 3 case studies with timeline visualizations, risk charts, key decision-point annotations
    - Fall back to pre-generated mock content when Granite unavailable
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_


  - [ ] 12.2 Implement Space Academy REST API router
    - Create `backend/routers/space_academy.py` with endpoints:
      - `POST /api/v1/space_academy/simulation/start` - Start simulation
      - `POST /api/v1/space_academy/simulation/decide` - Submit decision
      - `POST /api/v1/space_academy/quiz/generate` - Generate quiz
      - `POST /api/v1/space_academy/quiz/submit` - Submit quiz answers
    - Apply Pydantic validation, return standard API envelope
    - _Requirements: 12.1, 12.2_

  - [ ] 12.3 Implement Space Academy frontend module
    - Create Space Academy page with "What Would You Decide?" simulation interface
    - Display historical scenarios with time pressure and conflicting advisories
    - Show outcome reveal with AI analysis and decision factors
    - Implement quiz interface with multiple-choice questions and scoring
    - Display difficulty level and personalized recommendations
    - Include case study visualizations with timeline and risk charts
    - Apply GraniteAttribution and reduced-functionality indicator on mock content
    - _Requirements: 11.1, 11.2, 11.6, 23.1_

  - [ ]* 12.4 Write unit tests for Space Academy
    - Test difficulty advancement at >80% score boundary
    - Test difficulty descent at <50% score boundary
    - Test quiz generation produces 5-10 questions with 4 options each
    - Test fallback to pre-generated mock content
    - _Requirements: 11.4, 11.3, 11.7_

- [ ] 13. Checkpoint - All Modules Complete
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 14. Data Source Connectors and External Integrations

  - [ ] 14.1 Implement external data source connectors
    - Create `backend/connectors/nasa_connector.py`: poll NASA APIs every 24h, 30s timeout, 3 retries (10s spacing)
    - Create `backend/connectors/space_track_connector.py`: retrieve TLE data from Space-Track.org and CelesTrak every 4h, 30s timeout, 3 retries
    - Create `backend/connectors/noaa_connector.py`: retrieve space weather from NOAA SWPC every 60min, 30s timeout, 3 retries
    - Validate response schema before ingestion; reject malformed data with logged violation (source, timestamp, description)
    - Implement cache with 72-hour staleness threshold; display stale warning with cache age if threshold exceeded
    - Serve cached data after 3 consecutive failures; display freshness timestamp
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6_

  - [ ]* 14.2 Write integration tests for data source connectors
    - Test retry logic (3 retries with 10s spacing)
    - Test schema validation rejection of malformed data
    - Test cache serving after source failure
    - Test staleness warning at 72-hour threshold
    - _Requirements: 21.3, 21.5, 21.6_

- [ ] 15. Error Handling, Graceful Degradation, and Module Health

  - [ ] 15.1 Implement platform-wide error handling and module health state machine
    - Implement module health states: Healthy -> Degraded (3 consecutive failures) -> Unavailable
    - Mark degraded modules with "temporarily unavailable" indicator, disable UI entry points
    - Emit system-level notification events on state transitions (module name, failure reason, timestamp)
    - Implement platform status API endpoint for health monitoring
    - Log all errors with: unique ID, ISO 8601 timestamp, module name, error category (network/data/processing/unknown), top 10 stack frames
    - Implement frontend connection status indicator (disconnected state with cached data < 10 min, or "no data available")
    - Implement ChromaDB unavailability handling: keyword fallback with "reduced accuracy" banner
    - Implement TLE source unreachable handling: last known positions with "data stale" indicator and timestamp
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6_


  - [ ]* 15.2 Write integration tests for graceful degradation scenarios
    - Test module degradation after 3 consecutive failures (other modules unaffected)
    - Test ChromaDB fallback to keyword search
    - Test frontend cached data serving when backend unreachable
    - Test TLE stale data indicator
    - _Requirements: 25.1, 25.2, 25.3, 25.4_

- [ ] 16. Frontend Performance Optimization

  - [ ] 16.1 Implement frontend performance optimizations
    - Apply React.memo and useMemo to telemetry data components (prevent unnecessary re-renders)
    - Implement virtualized rendering for datasets of 100+ rows (max 50 DOM nodes visible + 10-node overscan buffer)
    - Verify shell bundle ≤ 200KB compressed with module lazy-loading
    - Verify LCP < 2.5s on initial page load with mock data (simulated 10Mbps, 40ms RTT)
    - Implement 500-object budget for 3D orbital visualization with level-of-detail culling at 30fps
    - Handle module bundle load failure: retry 2 attempts within 10 seconds each, then show error with manual retry
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6_

- [ ] 17. Docker Deployment Configuration

  - [ ] 17.1 Create Docker Compose orchestration for full platform
    - Create `docker-compose.yml` with services: ChromaDB, Backend (FastAPI), Frontend (Next.js)
    - Configure dependency order: ChromaDB first, then Backend, then Frontend
    - Initialize ChromaDB vector store with pre-embedded data for 40+ spaceflight incidents on startup
    - Seed mock responses for all 7 modules before backend accepts requests
    - Expose frontend on port 3000, backend on port 8000 (configurable via environment variables)
    - Full operational state within 60 seconds in demo mode (no watsonx key)
    - Exit with non-zero status and stderr message if any service fails to start
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.6_


  - [ ]* 17.2 Write integration tests for deployment and startup
    - Test Docker Compose startup sequence completes within 60 seconds (demo mode)
    - Test all 7 module endpoints respond with valid mock data after startup
    - Test Mock Mode auto-activates with warning log when no watsonx key is set
    - Test non-zero exit code on service startup failure
    - _Requirements: 17.2, 17.3, 17.5, 17.6_

- [ ] 18. Final Checkpoint - Full Platform Integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key integration points
- Property tests validate universal correctness properties from the design document (14 properties)
- Unit tests validate specific examples and edge cases
- The backend uses Python 3.11+ with FastAPI/Pydantic v2; the frontend uses TypeScript with Next.js 14
- Module implementation order follows design document priority: Devil's Advocate (flagship) → Knowledge Graph → Anomaly Tracker → Telemetry → Mission Planner → Orbital Monitor → Space Academy
- All AI-generated content must display IBM Granite attribution with purple accent styling
- Mock Mode guarantees 100% demo reliability without external API dependencies


## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "3.1"] },
    { "id": 2, "tasks": ["1.4", "1.5", "3.2", "3.3"] },
    { "id": 3, "tasks": ["1.6", "1.7", "1.8", "3.4"] },
    { "id": 4, "tasks": ["1.9", "1.10", "1.12"] },
    { "id": 5, "tasks": ["1.11", "1.13", "4.1"] },
    { "id": 6, "tasks": ["4.2", "4.3", "4.6"] },
    { "id": 7, "tasks": ["4.4", "4.5", "4.7"] },
    { "id": 8, "tasks": ["4.8", "4.9"] },
    { "id": 9, "tasks": ["6.1"] },
    { "id": 10, "tasks": ["6.2", "6.4"] },
    { "id": 11, "tasks": ["6.3", "6.5", "6.6"] },
    { "id": 12, "tasks": ["7.1"] },
    { "id": 13, "tasks": ["7.2", "7.3"] },
    { "id": 14, "tasks": ["7.4", "7.5", "8.1"] },
    { "id": 15, "tasks": ["8.2", "8.3"] },
    { "id": 16, "tasks": ["8.4", "8.5", "10.1"] },
    { "id": 17, "tasks": ["10.2", "10.3", "10.4"] },
    { "id": 18, "tasks": ["10.5", "10.6", "11.1"] },
    { "id": 19, "tasks": ["11.2", "11.3", "11.4"] },
    { "id": 20, "tasks": ["11.5", "11.6", "12.1"] },
    { "id": 21, "tasks": ["12.2", "12.3", "12.4"] },
    { "id": 22, "tasks": ["14.1"] },
    { "id": 23, "tasks": ["14.2", "15.1"] },
    { "id": 24, "tasks": ["15.2", "16.1"] },
    { "id": 25, "tasks": ["17.1"] },
    { "id": 26, "tasks": ["17.2"] }
  ]
}
```
