# Requirements Document

## Introduction

SENTINEL (AI Flight Readiness Intelligence & Mission Safety Platform) is a 7-module AI-powered space mission safety platform designed to address organizational blindness in spaceflight — the root cause of disasters such as Challenger (1986), Columbia (2003), and Starliner CFT (2024-2025). Built for a competitive hackathon (300+ teams), SENTINEL leverages IBM Granite/watsonx to provide pre-flight risk analysis, real-time anomaly tracking, mission planning, orbital hazard monitoring, telemetry interpretation, knowledge graph exploration, and public space education. The platform demonstrates what could have been different if AI-powered devil's advocacy existed during historical spaceflight decision-making.

## Glossary

- **SENTINEL**: The overall AI Flight Readiness Intelligence & Mission Safety Platform
- **Devil_s_Advocate_Engine**: The flagship module that generates the strongest case AGAINST launching, performing bias detection and cumulative risk scoring
- **Anomaly_Tracker**: Module for real-time and historical anomaly detection with cross-mission pattern correlation
- **Mission_Planner**: AI-powered mission timeline planning module with risk-aware scheduling
- **Orbital_Monitor**: Space debris tracking and collision risk assessment module using real TLE data
- **Telemetry_Engine**: Module that translates raw telemetry data into plain-English summaries and recommendations
- **Knowledge_Graph**: RAG-powered knowledge base with interactive graph visualization of spaceflight incidents
- **Space_Academy**: Interactive public education module with historical decision simulations
- **Granite_Client**: Multi-fallback AI client supporting watsonx, Ollama, HuggingFace, and Mock mode
- **RAG_Pipeline**: Retrieval-Augmented Generation pipeline using ChromaDB over spaceflight incident data
- **Cumulative_Risk_Score**: A compounding risk metric that accumulates across missions rather than resetting
- **Go_Fever**: Organizational pressure to proceed with a launch despite unresolved safety concerns
- **TLE_Data**: Two-Line Element set data describing satellite orbital parameters
- **Mock_Mode**: Pre-generated response mode ensuring demo reliability without live AI calls
- **Design_System**: The "Mission Intelligence" dark theme with NASA ops-center aesthetic
- **WebSocket_Stream**: Real-time bidirectional communication channel for telemetry data
- **Case_Study_Demo**: The Starliner CFT timeline demonstration showing what SENTINEL could have detected

---

## Requirements

### Requirement 1: Multi-Fallback Granite Client

**User Story:** As a platform operator, I want the AI client to gracefully fall back through multiple providers, so that the platform remains functional regardless of service availability.

#### Acceptance Criteria

1. WHEN a request is sent to the watsonx API and it returns an HTTP 2xx response with a valid JSON body within 10 seconds, THE Granite_Client SHALL return the watsonx response with IBM Granite attribution metadata including the model version used and the active provider name.
2. IF the watsonx API fails to respond within 10 seconds, returns an HTTP 4xx/5xx status, or the connection cannot be established, THEN THE Granite_Client SHALL automatically attempt the request via the Ollama local provider using the same 10-second timeout.
3. IF both watsonx and Ollama fail (timeout, connection error, or HTTP error response), THEN THE Granite_Client SHALL attempt the request via HuggingFace inference using the same 10-second timeout.
4. IF all three live AI providers fail within a total maximum fallback duration of 30 seconds, THEN THE Granite_Client SHALL serve the pre-generated Mock_Mode response matching the requested prompt category and return it within 500 milliseconds.
5. THE Granite_Client SHALL attach IBM Granite branding and attribution metadata to every response regardless of the active provider, including the fields: model name, model version, active provider identifier, and a boolean flag indicating whether the response is mock-generated.
6. WHEN switching between providers due to a failure, THE Granite_Client SHALL log the fallback event including the failed provider name, the error type (timeout, connection error, or HTTP error code), the elapsed time on the failed attempt, and the provider selected next.
7. FOR ALL valid prompt inputs, encoding the prompt for Granite and decoding the response SHALL produce a structurally equivalent result across all providers, where structural equivalence means the response JSON contains the same top-level keys and value types regardless of which provider generated it.

---

### Requirement 2: Devil's Advocate Risk Analysis

**User Story:** As a flight director, I want SENTINEL to generate the strongest possible case against launching, so that organizational blindness and go-fever bias are surfaced before a launch decision.

#### Acceptance Criteria

1. WHEN a pre-flight risk assessment is requested for a mission, THE Devil_s_Advocate_Engine SHALL analyze all known risk factors and generate an argument against proceeding with launch containing at minimum: a list of identified risk factors with severity assignments, historical precedents for each risk, a cumulative risk score, detected go-fever indicators (if decision documents are provided), and a final launch recommendation.
2. WHEN generating a risk report, THE Devil_s_Advocate_Engine SHALL assign a cumulative risk score between 0.0 and 1.0, where the score compounds from prior mission history rather than resetting.
3. WHEN decision documents are submitted for analysis, THE Devil_s_Advocate_Engine SHALL perform NLP-based go-fever bias detection and identify phrases indicating organizational pressure to launch.
4. WHEN go-fever indicators are detected, THE Devil_s_Advocate_Engine SHALL flag each indicator with a confidence score between 0.0 and 1.0, the source text passage that triggered detection, and a recommended mitigation action.
5. THE Devil_s_Advocate_Engine SHALL categorize all identified risks using severity levels mapped to cumulative risk score ranges: nominal (0.0-0.2), advisory (above 0.2-0.4), caution (above 0.4-0.6), warning (above 0.6-0.8), and critical (above 0.8-1.0).
6. WHEN a cumulative risk score exceeds 0.7, THE Devil_s_Advocate_Engine SHALL generate a "launch hold" recommendation that includes at minimum: the contributing risk factors that drove the score above 0.7, at least one historical precedent where similar risks led to mission failure, and the current cumulative score with breakdown.
7. IF the AI provider fails during analysis, THEN THE Devil_s_Advocate_Engine SHALL return the pre-generated mock analysis for the requested mission scenario.
8. WHEN a risk analysis is requested, THE Devil_s_Advocate_Engine SHALL return the complete analysis result within 30 seconds; IF processing exceeds 30 seconds, THEN THE Devil_s_Advocate_Engine SHALL return a timeout error indicating the analysis could not be completed.

---

### Requirement 3: Starliner CFT Case Study Demo

**User Story:** As a hackathon judge, I want to see a compelling demonstration of what SENTINEL would have detected during the Starliner CFT mission, so that I can evaluate the platform's real-world applicability.

#### Acceptance Criteria

1. THE Case_Study_Demo SHALL present a timeline of the Boeing Starliner CFT mission (2024-2025) containing at least 8 chronological events, where each event annotation includes an event date, event title, a description of the anomaly or decision, and the associated risk severity level (nominal, advisory, caution, warning, or critical).
2. WHEN the Starliner demo is activated, THE Devil_s_Advocate_Engine SHALL display a cumulative risk timeline chart as the primary visualization, plotting the Cumulative_Risk_Score (0.0 to 1.0) on the Y-axis against mission events in chronological order on the X-axis, showing how risk compounded across mission events.
3. WHEN a user selects a specific event on the Starliner timeline, THE Devil_s_Advocate_Engine SHALL display the risk analysis for that event including: the cumulative risk score at that point, identified risk factors with severity levels, any detected go-fever bias indicators, and a launch recommendation (proceed, caution, or hold).
4. THE Case_Study_Demo SHALL include pre-generated mock responses for every timeline event to ensure demo reliability without live AI dependency.
5. WHEN the cumulative risk timeline is rendered, THE Design_System SHALL apply status color coding to each data point based on defined score thresholds mapped to severity levels: nominal (green) for scores 0.0-0.2, advisory (blue) for scores above 0.2-0.4, caution (yellow) for scores above 0.4-0.6, warning (orange) for scores above 0.6-0.8, and critical (red) for scores above 0.8-1.0.
6. IF a pre-generated mock response is unavailable for a selected timeline event, THEN THE Case_Study_Demo SHALL display an error indication stating that demo data is missing for that event and remain on the previously displayed content without crashing.

---

### Requirement 4: Anomaly Pattern Tracking

**User Story:** As a mission safety engineer, I want to detect recurring and escalating anomalies across a program's lifetime, so that I can identify systemic issues before they cause mission failure.

#### Acceptance Criteria

1. WHEN new telemetry or incident data is ingested, THE Anomaly_Tracker SHALL analyze the data for anomalous patterns using statistical and ML-based detection and return detection results within 10 seconds of ingestion.
2. WHEN an anomaly is detected, THE Anomaly_Tracker SHALL classify it with a severity level (nominal, advisory, caution, warning, or critical) and cross-reference it against historical anomaly records within the same program to identify recurring patterns, where "recurring" means 2 or more occurrences of the same anomaly category.
3. WHILE monitoring a mission program, THE Anomaly_Tracker SHALL track anomaly frequency, severity level, and time-between-occurrences for each anomaly category, retaining the full history for the lifetime of the program.
4. WHEN an anomaly pattern shows escalation - defined as either a severity increase of one or more levels or a frequency increase of 2x or more within a rolling 30-day window compared to the prior 30-day window - THE Anomaly_Tracker SHALL generate an escalation alert containing the anomaly category, current severity, frequency trend, time-between-occurrences trend, and references to historical precedents from the same program.
5. THE Anomaly_Tracker SHALL correlate anomalies across multiple missions within the same program by matching anomaly category and affected system to identify systemic failure modes (defined as the same anomaly category occurring in 2 or more missions within a program).
6. WHEN presenting anomaly data, THE Anomaly_Tracker SHALL display real-time detection results alongside historical pattern analysis in a single view that includes a timeline of occurrences, severity trend chart, and frequency metrics.
7. IF anomaly detection processing fails, THEN THE Anomaly_Tracker SHALL return an error response indicating the failure reason, the timestamp of the last successful analysis, and the last known valid anomaly state data for the affected program.

---

### Requirement 5: Mission Timeline Planning

**User Story:** As a mission planner, I want AI-assisted scheduling with risk-aware resource budgeting, so that mission timelines account for safety margins and resource constraints.

#### Acceptance Criteria

1. WHEN a new mission plan is requested with mission parameters (vehicle type, mission duration, crew size, and destination), THE Mission_Planner SHALL generate a timeline containing phases, milestones, resource allocations, and safety margin buffers of at least 10% of each phase duration.
2. WHEN generating a timeline, THE Mission_Planner SHALL incorporate risk assessments from the Devil_s_Advocate_Engine and flag any phase whose associated risk score is 0.7 or higher using the Design_System "warning" or "critical" status classification.
3. WHEN a mission plan is generated, THE Mission_Planner SHALL automatically produce a pre-flight checklist with items derived from the mission profile, vehicle type, and identified risk factors, where each checklist item includes a description and a pass/fail verification criterion.
4. WHEN resource constraints are specified, THE Mission_Planner SHALL schedule activities within those constraints and present each detected conflict as a structured entry identifying the conflicting activities, the contested resource, and the overlap period.
5. WHEN a risk factor changes during an active planning session, THE Mission_Planner SHALL recalculate affected timeline segments and update resource budgets within 5 seconds of the change event.
6. WHEN the mission timeline is displayed, THE Mission_Planner SHALL render each phase with a visual risk-level indicator using the Design_System status colors (nominal, advisory, caution, warning, critical) corresponding to the phase's risk score.
7. IF the Devil_s_Advocate_Engine is unavailable during timeline generation, THEN THE Mission_Planner SHALL generate the timeline without risk annotations and display a degraded-mode indicator informing the user that risk assessment data is unavailable.

---

### Requirement 6: Orbital Hazard Monitoring

**User Story:** As a flight dynamics officer, I want real-time space debris tracking with collision risk assessment, so that I can make informed trajectory decisions.

#### Acceptance Criteria

1. WHEN TLE data is loaded from Space-Track.org or CelesTrak, THE Orbital_Monitor SHALL parse the orbital elements using SGP4 propagation and compute current positions for all tracked objects within 5 seconds of data receipt.
2. THE Orbital_Monitor SHALL render tracked objects in a 3D visualization using React Three Fiber with no more than 500 objects simultaneously.
3. WHEN two tracked objects are predicted to pass within 10 km of each other, THE Orbital_Monitor SHALL compute the collision probability and time-to-closest-approach and display both values in the conjunction detail panel.
4. WHEN collision probability exceeds a configurable threshold (default: 1e-4), THE Orbital_Monitor SHALL generate a collision avoidance alert specifying the involved objects, the collision probability value, time-to-closest-approach, and at least one recommended maneuver window within the next 24 hours.
5. WHILE rendering the 3D orbital view, THE Orbital_Monitor SHALL maintain a minimum frame rate of 30 fps by limiting rendered objects to 500 and using level-of-detail optimization.
6. FOR ALL valid TLE input strings, parsing then formatting back to TLE format then parsing again SHALL produce orbital element values within plus/minus 1e-8 of the original parsed values (round-trip property for TLE parsing).
7. IF TLE data fails to parse due to malformed or corrupted input, THEN THE Orbital_Monitor SHALL reject the invalid records, display an error indication specifying the count of failed records, and continue operating with previously loaded valid data.

---

### Requirement 7: Telemetry Insight Engine

**User Story:** As a mission controller, I want raw telemetry data translated into plain-English summaries with actionable recommendations, so that non-specialist team members can understand vehicle status.

#### Acceptance Criteria

1. WHEN raw telemetry data is received via WebSocket_Stream, THE Telemetry_Engine SHALL process and translate the data into a plain-English status summary - including the parameter name, current value with unit, status classification (nominal/advisory/caution/warning/critical), and a one-sentence interpretation - within 2 seconds of receipt.
2. WHEN a new telemetry data point is recorded and at least 5 data points exist in the rolling history for that parameter, THE Telemetry_Engine SHALL classify the trend as improving, stable, or degrading based on the direction of change over the history window and include the trend direction and rate of change in the parameter summary.
3. WHEN a telemetry parameter exceeds its configured nominal bounds, THE Telemetry_Engine SHALL generate an actionable recommendation that includes the out-of-bounds condition description, up to 3 possible causes sourced from the RAG_Pipeline or pre-configured knowledge base, and at least one suggested response action.
4. WHEN a translated insight is produced, THE Telemetry_Engine SHALL stream it to all connected clients via WebSocket within 500 milliseconds of processing completion.
5. WHILE receiving telemetry data, THE Telemetry_Engine SHALL maintain a rolling history window for trend analysis covering at least the last 60 data points per parameter.
6. IF the WebSocket connection to a client drops, THEN THE Telemetry_Engine SHALL buffer incoming translated insights for that client for up to 300 seconds of data, and deliver the buffered data in chronological order upon reconnection.
7. IF the AI provider fails during telemetry translation, THEN THE Telemetry_Engine SHALL fall back to a structured template-based summary containing the parameter name, value, unit, and status classification without AI-generated interpretation, and indicate reduced functionality to the client.

---

### Requirement 8: WebSocket Real-Time Streaming

**User Story:** As a frontend developer, I want reliable real-time telemetry streaming, so that the UI displays live mission data without polling.

#### Acceptance Criteria

1. WHEN a client connects to the telemetry WebSocket endpoint, THE WebSocket_Stream SHALL establish a bidirectional connection within 5 seconds and begin pushing telemetry data on the next scheduled interval tick.
2. WHILE a WebSocket connection is active, THE WebSocket_Stream SHALL push telemetry updates at a configurable interval between 100ms and 10 seconds (default: 1 second).
3. IF a WebSocket connection is interrupted, THEN THE WebSocket_Stream SHALL attempt reconnection with exponential backoff starting at 1 second, doubling each attempt up to a maximum of 5 retry attempts and a maximum delay of 30 seconds, and resume streaming from the last acknowledged data point upon successful reconnection.
4. WHEN multiple clients connect simultaneously, THE WebSocket_Stream SHALL maintain independent message delivery to each connected client such that a slow or failing client does not block or delay delivery to other clients, supporting up to 50 concurrent connections.
5. THE WebSocket_Stream SHALL format all messages as structured JSON with fields: timestamp (ISO 8601 format), parameter name (string), value (numeric), unit (string), and status (one of: nominal, advisory, caution, warning, critical).
6. IF the upstream telemetry data source becomes unavailable while a WebSocket connection is active, THEN THE WebSocket_Stream SHALL send a status message indicating data source unavailability to all connected clients and resume normal streaming when the source recovers.
7. IF all reconnection attempts are exhausted after a connection interruption, THEN THE WebSocket_Stream SHALL close the connection and send a final error message indicating the connection could not be re-established.
8. WHEN a client disconnects gracefully, THE WebSocket_Stream SHALL release all resources associated with that client connection within 2 seconds and stop queuing messages for that client.

---

### Requirement 9: Mission Knowledge Graph

**User Story:** As a safety researcher, I want to explore 50+ years of spaceflight incidents through an interactive knowledge graph, so that I can discover connections between historical failures.

#### Acceptance Criteria

1. THE Knowledge_Graph SHALL ingest and index at least 40 real spaceflight incidents spanning from the 1960s to the present using the RAG_Pipeline.
2. WHEN a user queries the knowledge base, THE Knowledge_Graph SHALL retrieve the top-k most relevant incidents (default k=5) from ChromaDB embeddings ranked by cosine similarity and generate a response via IBM Granite that references only the retrieved incident data, within 5 seconds of query submission.
3. WHEN presenting search results, THE Knowledge_Graph SHALL render an interactive force-directed graph visualization using D3.js showing relationships between incidents, causes, and systems, limited to a maximum of 200 nodes per view.
4. WHEN a user selects a node in the graph, THE Knowledge_Graph SHALL display detailed information about that incident including date, mission, root cause, contributing factors, and lessons learned.
5. THE Knowledge_Graph SHALL identify and visualize causal chains between incidents where a causal chain is defined as two or more incidents sharing at least one common contributing factor or root cause, displayed as connected paths of up to 5 links in the graph.
6. WHEN new incident data is added to the knowledge base, THE Knowledge_Graph SHALL re-index the data in ChromaDB and update graph relationships within 30 seconds of submission.
7. FOR ALL indexed incidents, querying the incident by its unique identifier SHALL return the complete incident record (all fields: date, mission, vehicle, root cause, contributing factors, outcome, lessons learned, and relationship links) with all relationships intact (round-trip property for incident storage/retrieval).
8. IF a user query returns no matching incidents above the similarity threshold, THEN THE Knowledge_Graph SHALL display a message indicating no relevant incidents were found and suggest alternative search terms.
9. IF the RAG_Pipeline or IBM Granite is unavailable during a query, THEN THE Knowledge_Graph SHALL return pre-generated mock results for the query topic and indicate that results are served from cached data.

---

### Requirement 10: RAG Pipeline

**User Story:** As an AI engineer, I want a robust retrieval-augmented generation pipeline, so that AI responses are grounded in real spaceflight incident data rather than hallucinations.

#### Acceptance Criteria

1. THE RAG_Pipeline SHALL embed all incident documents using sentence-transformers and store embeddings in ChromaDB, chunking documents by logical sections (cause, contributing factors, lessons learned) with each chunk not exceeding 512 tokens.
2. WHEN a query is received, THE RAG_Pipeline SHALL validate that the query length does not exceed 1000 characters, retrieve the top-k most relevant document chunks (configurable, default k=5) based on cosine similarity, and exclude any chunk with a similarity score below 0.3.
3. IF a query returns no document chunks meeting the minimum similarity threshold of 0.3, THEN THE RAG_Pipeline SHALL return a response indicating that no relevant incident data was found for the query, without generating an AI answer.
4. WHEN constructing a prompt for IBM Granite, THE RAG_Pipeline SHALL include retrieved context chunks ordered by descending similarity score, the user query, and a system prompt instructing the model to reference only the provided context and cite sources for each claim.
5. THE RAG_Pipeline SHALL include source citations in every generated response, where each citation contains the incident name, document section title, and chunk similarity score.
6. IF ChromaDB is unavailable (connection fails within 5 seconds), THEN THE RAG_Pipeline SHALL fall back to keyword-based search over the raw document store, returning the same number of results (k) in the same response schema, and indicate to the caller that results are from keyword fallback.
7. IF a query exceeds 1000 characters, THEN THE RAG_Pipeline SHALL reject the query and return an error message indicating the maximum allowed query length.
8. FOR ALL documents in the corpus, embedding a document then retrieving it by exact content match SHALL return that document in the top-1 results (round-trip property for embedding/retrieval).

---

### Requirement 11: Space Academy Education Module

**User Story:** As a member of the public, I want to learn about spaceflight safety through interactive decision simulations, so that I understand the human factors behind mission failures.

#### Acceptance Criteria

1. WHEN a user starts a "What Would You Decide?" simulation, THE Space_Academy SHALL present a historical spaceflight decision scenario sourced from the incident corpus, including time pressure constraints, limited available data, and conflicting advisory inputs that mirror the actual historical decision conditions.
2. WHEN the user makes a decision in the simulation, THE Space_Academy SHALL reveal the historical outcome, explain what actually happened, and provide AI-generated analysis of the decision factors within 5 seconds of the user's submission.
3. THE Space_Academy SHALL generate multiple-choice quiz questions (4 answer options each, 5 to 10 questions per session) from incident data using IBM Granite, testing understanding of root causes, contributing factors, and lessons learned.
4. WHEN generating educational content, THE Space_Academy SHALL adapt difficulty across 3 levels (beginner, intermediate, advanced) based on the user's prior quiz score: users scoring above 80% advance one level, users scoring below 50% move down one level, and users between 50%-80% remain at their current level.
5. THE Space_Academy SHALL present at least 3 case studies with timeline visualizations, risk charts, and key decision-point annotations sourced from the incident corpus.
6. WHEN a quiz or simulation is completed, THE Space_Academy SHALL provide a summary score as a percentage (0-100%) and 1 to 3 personalized learning recommendations based on the topic areas where the user answered incorrectly or made suboptimal simulation decisions.
7. IF the IBM Granite provider fails during quiz generation or simulation analysis, THEN THE Space_Academy SHALL serve pre-generated mock educational content for the requested scenario and indicate reduced functionality to the user.

---

### Requirement 12: REST API Architecture

**User Story:** As a frontend developer, I want well-structured REST endpoints for all 7 modules, so that the UI can reliably consume platform data.

#### Acceptance Criteria

1. THE SENTINEL SHALL expose REST API endpoints for each of the 7 modules using the URL path pattern /api/v1/{module-name}/{action}, where {module-name} matches the module's snake_case identifier and each module exposes at least one endpoint.
2. THE SENTINEL SHALL return structured JSON responses from all API endpoints using an envelope schema where every response contains a "status" field (string: "success" or "error"), a "data" field (object or null), and an "error" field (object with "message" and "id" subfields, or null), ensuring "data" is non-null on success and "error" is non-null on failure.
3. WHEN an API request contains invalid parameters, THE SENTINEL SHALL return a 422 Unprocessable Entity response with the error envelope containing a list of validation failures, where each failure specifies the field name, the constraint violated, and the rejected value.
4. WHEN an API endpoint encounters an internal error, THE SENTINEL SHALL return a 500 response with the error envelope containing a unique error identifier (opaque string) and a generic error message, excluding stack traces, file paths, or internal variable names.
5. THE SENTINEL SHALL validate all incoming request bodies using Pydantic models with type checking, required field enforcement, and constraint validation (including minimum/maximum values and string length limits as defined per model).
6. FOR ALL valid API request payloads, serializing the request to JSON then deserializing it back SHALL produce a Pydantic model with identical field names, types, and values (round-trip property for API serialization).
7. THE SENTINEL SHALL enable CORS for the frontend origin (port 3000) on all API endpoints, allowing GET, POST, PUT, and DELETE methods with JSON content type.
8. WHEN a valid API request is received, THE SENTINEL SHALL return a complete response within 2 seconds, excluding AI inference time which is governed by the Granite_Client fallback chain.
9. WHEN an API endpoint receives a request for a resource that does not exist, THE SENTINEL SHALL return a 404 Not Found response using the standard error envelope with an error message indicating the requested resource was not found.

---

### Requirement 13: Frontend Application Shell

**User Story:** As a user, I want a cohesive single-page application with module-based navigation, so that I can access all SENTINEL capabilities from a unified interface.

#### Acceptance Criteria

1. THE SENTINEL SHALL render a Next.js 14 App Router application with a persistent navigation bar listing all 7 modules (Devil_s_Advocate_Engine, Anomaly_Tracker, Mission_Planner, Orbital_Monitor, Telemetry_Engine, Knowledge_Graph, Space_Academy), where the currently active module is visually distinguished from inactive modules.
2. WHEN a user navigates between modules, THE SENTINEL SHALL use client-side routing with lazy-loaded module bundles so that navigation occurs without a full page reload.
3. THE SENTINEL SHALL apply the Design_System dark theme ("Mission Intelligence") with NASA ops-center aesthetic across all modules, with no module rendering default browser or unstyled elements.
4. WHILE rendering data values, THE SENTINEL SHALL use JetBrains Mono font for all numeric and telemetry data, and Inter font for UI text.
5. WHEN displaying AI-generated content, THE SENTINEL SHALL apply a purple accent color and include a user-facing "Powered by IBM Granite" attribution text adjacent to the AI-generated content.
6. THE SENTINEL SHALL maintain full functionality on viewport widths of 1280px and wider, with no interactive elements clipped, overlapped, or hidden at that minimum width.
7. IF a lazy-loaded module bundle fails to load, THEN THE SENTINEL SHALL display an error message indicating the module could not be loaded and offer a retry action, without disrupting access to other modules via the navigation bar.

---

### Requirement 14: Design System and Status Colors

**User Story:** As a UI designer, I want a consistent status color system across the platform, so that users can quickly assess severity levels at a glance.

#### Acceptance Criteria

1. THE Design_System SHALL apply the following status colors across all modules and components that display status information: nominal (green), advisory (blue), caution (yellow), warning (orange), and critical (red), with each status level mapped to exactly one color.
2. WHEN a risk level or status changes, THE Design_System SHALL update the visual indicator color within 500 milliseconds to reflect the new severity.
3. THE Design_System SHALL render all module interfaces using a dark background theme with text and data elements meeting a minimum contrast ratio of 4.5:1 against their background for normal text and 3:1 for large text.
4. WHEN displaying AI-generated content, THE Design_System SHALL visually distinguish it from user-generated or system content using a purple accent border or background highlight and a text label indicating AI origin.
5. THE Design_System SHALL use Framer Motion for all UI transitions and state changes with transition durations between 150 milliseconds and 400 milliseconds.
6. THE Design_System SHALL provide a non-color indicator (icon or text label) alongside each status color so that status severity is perceivable without relying solely on color differentiation.

---

### Requirement 15: 3D Orbital Visualization

**User Story:** As a flight dynamics analyst, I want a performant 3D view of orbital objects, so that I can visually assess conjunction geometry and debris density.

#### Acceptance Criteria

1. WHEN the orbital view is loaded, THE Orbital_Monitor SHALL render a 3D Earth-centered scene using React Three Fiber displaying orbital paths and tracked objects within 3 seconds of view initialization.
2. WHILE rendering the 3D scene, THE Orbital_Monitor SHALL limit the number of simultaneously rendered objects to 500, prioritizing objects involved in active conjunction alerts, then objects nearest to the current camera view frustum.
3. WHEN a user interacts with the 3D view (rotate, zoom, pan), THE Orbital_Monitor SHALL respond to input within 16ms (60fps target).
4. WHILE a conjunction alert is active, THE Orbital_Monitor SHALL visually distinguish the involved objects from other objects using a distinct color or pulsing animation and render a line or arc representing the predicted closest approach geometry between the two objects.
5. THE Orbital_Monitor SHALL maintain a frame rate of at least 30fps during scene idle and at least 24fps during camera transitions, preventing unnecessary re-renders of static orbital elements.
6. IF WebGL or 3D rendering is unavailable or fails to initialize, THEN THE Orbital_Monitor SHALL display an error message indicating that 3D visualization is unsupported and suggest using an alternative 2D view.
7. WHEN the number of trackable objects exceeds 500, THE Orbital_Monitor SHALL display an indicator showing the total object count and the number currently rendered.

---

### Requirement 16: D3.js Knowledge Graph Visualization

**User Story:** As a researcher, I want an interactive force-directed graph of spaceflight incidents, so that I can explore causal relationships visually.

#### Acceptance Criteria

1. WHEN the knowledge graph view is loaded, THE Knowledge_Graph SHALL render a D3.js force-directed graph with nodes representing incidents, causes, systems, and missions, displaying up to 500 nodes simultaneously and completing the initial render within 3 seconds.
2. WHEN a user clicks a graph node, THE Knowledge_Graph SHALL display a detail panel within 500ms showing the incident record (date, mission name, vehicle, root cause, contributing factors, outcome, lessons learned) and a list of directly connected nodes.
3. WHEN a user enters a search term of 1 to 200 characters, THE Knowledge_Graph SHALL highlight nodes whose label or attributes contain the search term (case-insensitive substring match) and their immediate connections (1-hop neighbors) in the graph.
4. IF a search term matches zero nodes, THEN THE Knowledge_Graph SHALL display a message indicating no matching nodes were found and leave the graph in its current unfiltered state.
5. WHILE the graph is rendered, THE Knowledge_Graph SHALL support zoom, pan, and node-drag interactions with input response within 16ms (60fps target).
6. THE Knowledge_Graph SHALL color-code nodes by type (incident, cause, system, mission) using four visually distinct colors and size nodes proportionally to their connection count with a minimum radius of 8px and a maximum radius of 40px.
7. IF the graph data fails to load or the data source is unavailable, THEN THE Knowledge_Graph SHALL display an error message indicating the data could not be retrieved and offer a retry action.

---

### Requirement 17: Deployment Configuration

**User Story:** As a hackathon judge, I want to start the entire platform with a single command, so that evaluation setup takes minimal time.

#### Acceptance Criteria

1. THE SENTINEL SHALL provide a container orchestration configuration that starts the backend (FastAPI), frontend (Next.js), and ChromaDB services with a single command.
2. WHEN services start, THE SENTINEL SHALL start them in dependency order (ChromaDB first, then backend, then frontend), initialize the ChromaDB vector store with pre-embedded data for at least 40 spaceflight incidents, and seed mock responses for all 7 modules before the backend accepts client requests.
3. WHEN starting in demo mode (no watsonx API key set), THE SENTINEL SHALL be fully operational - defined as all 7 module API endpoints returning valid mock responses and the frontend rendering the application shell - within 60 seconds of startup.
4. THE SENTINEL SHALL expose the frontend on port 3000 and the backend API on port 8000 by default, configurable via environment variables.
5. IF the watsonx API key environment variable is not set, THEN THE Granite_Client SHALL automatically activate Mock_Mode and log a warning message to standard output indicating that Mock_Mode is active.
6. IF any service fails to start or data initialization fails, THEN THE SENTINEL SHALL exit with a non-zero status code and output a message to standard error indicating which service failed to start.

---

### Requirement 18: Mock Mode and Demo Reliability

**User Story:** As a demo presenter, I want guaranteed platform functionality regardless of network or API availability, so that live demonstrations never fail due to external dependencies.

#### Acceptance Criteria

1. THE Mock_Mode SHALL provide pre-generated responses for every AI-powered feature across all 7 modules, covering at minimum one complete request-response pair per API endpoint that invokes AI generation.
2. WHILE Mock_Mode is active, THE SENTINEL SHALL serve pre-generated responses with the same JSON structure and response schema as live AI responses, and SHALL display a visible mode indicator in the UI showing Mock Mode status.
3. WHEN switching between Mock_Mode and live mode, THE SENTINEL SHALL produce responses with identical schema structures so the frontend requires no conditional rendering logic.
4. THE Mock_Mode SHALL include pre-generated data for the complete Starliner CFT case study timeline covering at least 8 mission events, each with associated risk scores, bias detections, and recommendations.
5. WHILE Mock_Mode is active, THE SENTINEL SHALL apply response latency between 200ms and 800ms (randomly distributed) to simulate live AI behavior.
6. IF a pre-generated mock response is unavailable for a requested feature, THEN THE SENTINEL SHALL return a valid response with an empty data payload conforming to the expected schema and a metadata field indicating the mock data is missing for that feature.

---

### Requirement 19: Cumulative Risk Scoring

**User Story:** As a safety analyst, I want risk scores that compound across missions rather than resetting, so that systemic deterioration is visible over a program's lifetime.

#### Acceptance Criteria

1. WHEN computing a risk score for a mission event, THE Devil_s_Advocate_Engine SHALL incorporate the accumulated risk from all chronologically prior events in the same program, producing a cumulative score between 0.0 and 1.0 inclusive.
2. THE Devil_s_Advocate_Engine SHALL compute the cumulative risk using a compounding formula where each new risk factor multiplies against the existing cumulative score rather than replacing it, clamping the result to a maximum of 1.0 if the multiplication would exceed that bound.
3. WHEN a program has no prior risk events recorded, THE Devil_s_Advocate_Engine SHALL use 0.0 as the initial cumulative risk baseline before applying the first event's risk factor.
4. WHEN the cumulative risk score is displayed, THE Devil_s_Advocate_Engine SHALL render a timeline chart with the X-axis representing program events in chronological order and the Y-axis representing the cumulative risk score from 0.0 to 1.0.
5. THE Devil_s_Advocate_Engine SHALL store for each computed risk point: the event identifier, the individual risk contribution value, the pre-event cumulative score, and the post-event cumulative score, so that any point on the timeline can be audited.
6. WHEN a new risk event is added to a program, THE Devil_s_Advocate_Engine SHALL recalculate the cumulative score and update the timeline visualization within 5 seconds of the event being recorded.

---

### Requirement 20: Go-Fever Bias Detection

**User Story:** As a decision-making researcher, I want NLP-based detection of organizational pressure patterns in decision documents, so that groupthink and launch pressure are quantified and visible.

#### Acceptance Criteria

1. WHEN decision documents or meeting transcripts are submitted, THE Devil_s_Advocate_Engine SHALL analyze the text for linguistic patterns associated with go-fever bias and return results within 10 seconds per document up to 50,000 characters in length.
2. WHEN go-fever indicators are detected, THE Devil_s_Advocate_Engine SHALL categorize each indicator by type from a defined set of at least 4 categories including schedule pressure, normalization of deviance, dissent suppression, and appeal to authority.
3. THE Devil_s_Advocate_Engine SHALL assign a confidence score between 0.0 and 1.0 to each detected bias indicator and only include indicators with a confidence score of 0.3 or higher in the results.
4. WHEN presenting bias detection results, THE Devil_s_Advocate_Engine SHALL identify each flagged text passage by its character offset range within the source document and annotate it with the indicator type and confidence score.
5. WHEN bias patterns are detected, THE Devil_s_Advocate_Engine SHALL provide at least 1 and at most 3 historical precedent references per pattern, each including the incident name, date, and a description of the specific parallel to the detected pattern.
6. IF no go-fever bias indicators are detected in a submitted document, THEN THE Devil_s_Advocate_Engine SHALL return a result indicating no bias patterns were found along with the overall analysis metadata including document length analyzed and processing time.

---

### Requirement 21: Data Source Integration

**User Story:** As a data engineer, I want reliable connections to NASA and space data sources, so that the platform operates on real-world data.

#### Acceptance Criteria

1. THE SENTINEL SHALL retrieve mission data, lessons learned, and mishap reports from NASA APIs at a configurable polling interval no less frequent than once every 24 hours, with a connection timeout of 30 seconds per request.
2. THE SENTINEL SHALL retrieve and parse TLE data from Space-Track.org and CelesTrak for orbital object tracking at a configurable interval no less frequent than once every 4 hours, with a connection timeout of 30 seconds per request.
3. IF a data source API returns an HTTP 5xx error, connection timeout after 30 seconds, or DNS resolution failure after 3 consecutive retry attempts spaced 10 seconds apart, THEN THE SENTINEL SHALL serve cached data from the most recent successful retrieval, display the data freshness timestamp to the user, and flag the data as stale if the cache age exceeds 72 hours.
4. THE SENTINEL SHALL retrieve space weather data from NOAA SWPC including solar flare alerts, geomagnetic storm indices, and solar wind measurements at a configurable interval no less frequent than once every 60 minutes, with a connection timeout of 30 seconds per request.
5. WHEN data is retrieved from external sources, THE SENTINEL SHALL validate the response against the expected schema before ingestion and reject malformed data by logging the source identifier, timestamp, and description of the schema violation.
6. IF cached data for a source exceeds 72 hours since last successful retrieval and the source remains unavailable, THEN THE SENTINEL SHALL display a warning indicating that the data may be unreliable and include the age of the cached data.

---

### Requirement 22: Frontend Performance Optimization

**User Story:** As a user, I want the application to remain responsive even when displaying complex visualizations and real-time data, so that my workflow is not interrupted by lag.

#### Acceptance Criteria

1. WHEN rendering telemetry data components, THE SENTINEL SHALL apply React.memo and useMemo so that components do not re-render unless at least one prop or memoized value has changed between render cycles.
2. THE SENTINEL SHALL lazy-load each module bundle so that initial page load transfers only the shell and active module code, with the shell bundle not exceeding 200 KB (compressed).
3. WHILE the 3D orbital visualization is active, THE SENTINEL SHALL maintain rendering within the 500-object budget using level-of-detail culling and sustain a minimum frame rate of 30 fps on a standard desktop GPU.
4. WHEN a dataset of 100 or more rows is displayed in a table or list, THE SENTINEL SHALL use virtualized rendering so that no more than 50 DOM nodes are rendered in the visible viewport at any time, plus a 10-node overscan buffer above and below.
5. THE SENTINEL SHALL achieve a Largest Contentful Paint (LCP) under 2.5 seconds on initial page load with mock data active, measured on a simulated broadband connection (10 Mbps download, 40 ms RTT).
6. WHEN a module bundle is requested via lazy-loading, IF the bundle fails to load after 2 retry attempts within 10 seconds each, THEN THE SENTINEL SHALL display an error message indicating the module could not be loaded and offer a manual retry option.

---

### Requirement 23: IBM Granite Attribution

**User Story:** As a hackathon participant, I want all AI-generated content clearly branded with IBM Granite, so that judges recognize the required technology integration.

#### Acceptance Criteria

1. WHEN any AI-generated content is displayed, THE SENTINEL SHALL render a "Powered by IBM Granite" attribution badge within 8px of the AI content boundary, at a minimum font size of 12px, visible without scrolling or hovering.
2. THE SENTINEL SHALL apply the purple accent color to all AI-generated content borders or backgrounds to visually distinguish AI output from static system data, using the same purple color value across all modules.
3. WHEN AI responses are returned via the API, THE SENTINEL SHALL include a metadata field specifying the Granite model version used and the active provider.
4. THE SENTINEL SHALL display the IBM Granite attribution badge with identical font size, color, and placement position relative to AI content across all 7 modules.
5. IF AI-generated content fails to load or returns an error, THEN THE SENTINEL SHALL display the attribution badge alongside an indication that AI content is unavailable, rather than hiding the attribution entirely.

---

### Requirement 24: Incident Data Corpus

**User Story:** As a knowledge engineer, I want a comprehensive corpus of real spaceflight incidents, so that the RAG pipeline and knowledge graph have authoritative source material.

#### Acceptance Criteria

1. THE Knowledge_Graph SHALL include structured data for at least 40 real spaceflight incidents sourced from NASA Lessons Learned Database and NASA Mishap Reports, where each incident entry is considered complete only when all mandatory fields specified in criterion 2 are populated.
2. WHEN an incident is stored, THE Knowledge_Graph SHALL capture the following mandatory fields: date, mission name, vehicle, root cause, contributing factors (at least 1, up to 10), outcome, lessons learned, and related incidents. IF any mandatory field is unavailable from the source material, THEN THE Knowledge_Graph SHALL store the field with a value of "unknown" and flag the incident entry as incomplete.
3. THE Knowledge_Graph SHALL include incidents distributed across at least 4 distinct decades within the range 1960-2024, with a minimum of 3 incidents per decade represented.
4. WHEN incident data is embedded for RAG, THE RAG_Pipeline SHALL chunk each incident document into separate sections for root cause, contributing factors, and lessons learned, with each chunk containing no more than 512 tokens.
5. THE Knowledge_Graph SHALL maintain bidirectional relationship links between incidents that share at least one identical root cause category, the same vehicle, or at least one identical contributing factor as determined by matching normalized field values.

---

### Requirement 25: Error Handling and Graceful Degradation

**User Story:** As a platform operator, I want the system to degrade gracefully when components fail, so that partial functionality is always available.

#### Acceptance Criteria

1. IF the backend API becomes unreachable (no successful response within 5 seconds), THEN THE SENTINEL frontend SHALL display a visible connection status indicator showing "disconnected" state, and serve cached data if the cache age is less than 10 minutes; IF no cached data is available, THEN THE SENTINEL frontend SHALL display an explicit "no data available" message in place of the content area.
2. IF ChromaDB is unavailable, THEN THE RAG_Pipeline SHALL fall back to keyword-based document search over the raw document store and display a persistent banner indicating reduced search accuracy to the user.
3. WHEN any module encounters an error that persists after 3 consecutive retry attempts, THE SENTINEL SHALL mark that module as degraded, disable its UI entry points with a "temporarily unavailable" indicator, and maintain full functionality in all other modules without affecting their response times.
4. IF TLE data sources are unreachable (no successful response within 10 seconds), THEN THE Orbital_Monitor SHALL display the last known orbital positions with a "data stale" indicator and the timestamp of the last successful data retrieval.
5. WHEN an error occurs in any module, THE SENTINEL SHALL log the error with a unique identifier, ISO 8601 timestamp, module name, error category (network, data, processing, or unknown), and the call stack limited to the top 10 frames.
6. WHEN a module transitions from healthy to degraded state, THE SENTINEL SHALL emit a system-level notification event containing the module name, failure reason, and degradation timestamp, accessible via the platform status API endpoint.
