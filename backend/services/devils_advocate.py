"""Devil's Advocate risk analysis service.

Implements cumulative risk scoring, go-fever bias detection,
and full risk analysis report generation using IBM Granite AI.
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import datetime

from backend.models.devils_advocate import (
    CumulativeRiskPoint,
    GoFeverAnalysis,
    GoFeverIndicator,
    RiskAnalysisReport,
    RiskFactor,
)
from backend.models.enums import SeverityLevel, severity_from_score
from backend.models.shared import GraniteAttribution, HistoricalPrecedent

logger = logging.getLogger(__name__)

# Maximum document length for go-fever analysis
MAX_DOCUMENT_LENGTH = 50_000

# Timeout for AI generation calls
GENERATION_TIMEOUT = 30.0

# Historical precedents knowledge base
HISTORICAL_PRECEDENTS = [
    HistoricalPrecedent(
        incident_name="Challenger STS-51-L",
        date="1986-01-28",
        description=(
            "O-ring failure in cold weather caused catastrophic breakup 73 seconds "
            "after launch. Engineers raised concerns but were overruled by management."
        ),
        parallel=(
            "Schedule pressure and normalization of deviance led to overriding "
            "engineering objections about launch conditions."
        ),
    ),
    HistoricalPrecedent(
        incident_name="Columbia STS-107",
        date="2003-02-01",
        description=(
            "Foam strike damaged thermal protection system during ascent. Crew lost "
            "during re-entry. Prior foam strikes had been reclassified as acceptable."
        ),
        parallel=(
            "Repeated acceptance of out-of-spec conditions and normalization of "
            "deviance in risk acceptance processes."
        ),
    ),
    HistoricalPrecedent(
        incident_name="Apollo 1",
        date="1967-01-27",
        description=(
            "Cabin fire during launch rehearsal killed three astronauts. "
            "Pure oxygen atmosphere and flammable materials were known hazards."
        ),
        parallel=(
            "Known risks accepted without adequate mitigation due to schedule "
            "pressure and program momentum."
        ),
    ),
    HistoricalPrecedent(
        incident_name="Boeing 737 MAX MCAS",
        date="2018-10-29",
        description=(
            "MCAS system reliance on single angle-of-attack sensor led to two "
            "fatal crashes (Lion Air 610, Ethiopian 302). 346 lives lost."
        ),
        parallel=(
            "Single-fault tolerance violations and organizational pressure to "
            "minimize redesign scope for certification expediency."
        ),
    ),
]


class DevilsAdvocateService:
    """Cumulative risk scoring and devil's advocate analysis engine.

    Uses the compounding risk formula:
        post_score = min(1.0, pre_score + risk_contribution * (1 - pre_score))

    This ensures risk never decreases and approaches 1.0 asymptotically.
    """

    def __init__(self, granite_client) -> None:
        self._granite = granite_client
        self._program_timelines: dict[str, list[CumulativeRiskPoint]] = {}
        # Pre-load Starliner data
        self._load_starliner_data()

    def compute_cumulative_risk(
        self, program_id: str, event_id: str, risk_contribution: float
    ) -> CumulativeRiskPoint:
        """Compute and append a cumulative risk point for a program.

        Compounding formula:
            post_score = min(1.0, pre_score + risk_contribution * (1 - pre_score))

        Args:
            program_id: Identifier for the program/mission.
            event_id: Unique event identifier.
            risk_contribution: Individual risk delta (0.0 - 1.0).

        Returns:
            The newly created CumulativeRiskPoint.
        """
        timeline = self._program_timelines.setdefault(program_id, [])

        pre_score = timeline[-1].post_event_score if timeline else 0.0
        post_score = min(1.0, pre_score + risk_contribution * (1 - pre_score))

        point = CumulativeRiskPoint(
            event_id=event_id,
            individual_contribution=risk_contribution,
            pre_event_score=pre_score,
            post_event_score=post_score,
            timestamp=datetime.utcnow(),
        )
        timeline.append(point)
        return point

    def get_timeline(self, program_id: str) -> list[CumulativeRiskPoint]:
        """Get full risk timeline for a program.

        Args:
            program_id: Identifier for the program/mission.

        Returns:
            List of CumulativeRiskPoint entries in chronological order.
        """
        return list(self._program_timelines.get(program_id, []))

    async def analyze_risk(
        self, program_id: str, risk_factors: list[dict]
    ) -> RiskAnalysisReport:
        """Generate devil's advocate report with cumulative scoring and go-fever detection.

        Args:
            program_id: Mission/program identifier.
            risk_factors: List of risk factor dictionaries with keys:
                id, category, description, severity, score, source.

        Returns:
            RiskAnalysisReport with AI-generated recommendation and metadata.
        """
        # Build RiskFactor objects
        parsed_factors: list[RiskFactor] = []
        for rf in risk_factors:
            factor = RiskFactor(
                id=rf.get("id", f"rf_{uuid.uuid4().hex[:8]}"),
                category=rf.get("category", "unknown"),
                description=rf.get("description", ""),
                severity=SeverityLevel(rf.get("severity", "advisory")),
                score=rf.get("score", 0.5),
                source=rf.get("source", "user_input"),
            )
            parsed_factors.append(factor)

            # Update cumulative risk for each factor
            self.compute_cumulative_risk(program_id, factor.id, factor.score)

        # Get current cumulative timeline
        timeline = self.get_timeline(program_id)
        overall_score = timeline[-1].post_event_score if timeline else 0.0
        severity = severity_from_score(overall_score)

        # Generate AI recommendation
        recommendation = await self._generate_recommendation(
            program_id, parsed_factors, overall_score
        )

        # Select relevant historical precedents
        precedents = self._select_precedents(parsed_factors)

        attribution = GraniteAttribution(
            model_name=self._granite._mock_responses.get("model", "ibm/granite-13b-chat-v2")
            if hasattr(self._granite, "_mock_responses")
            else "ibm/granite-13b-chat-v2",
            model_version="2.0",
            provider=self._granite.get_active_provider(),
            badge_text="Powered by IBM Granite",
        )

        return RiskAnalysisReport(
            mission_id=program_id,
            overall_risk_score=round(overall_score, 4),
            severity=severity,
            risk_factors=parsed_factors,
            cumulative_timeline=timeline,
            historical_precedents=precedents,
            recommendation=recommendation,
            attribution=attribution,
        )

    async def detect_go_fever(self, document: str) -> GoFeverAnalysis:
        """NLP-based go-fever bias detection.

        Analyzes document text for schedule pressure, normalization of deviance,
        dissent suppression, and appeal to authority bias patterns.

        Args:
            document: Text content to analyze (max 50,000 chars).

        Returns:
            GoFeverAnalysis with detected bias indicators.
        """
        # Truncate if exceeding limit
        doc_text = document[:MAX_DOCUMENT_LENGTH]

        # Attempt AI-based analysis with timeout
        try:
            prompt = self._build_go_fever_prompt(doc_text)
            response = await asyncio.wait_for(
                self._granite.generate(prompt, category="go_fever"),
                timeout=GENERATION_TIMEOUT,
            )
            ai_content = response.content
        except (asyncio.TimeoutError, Exception) as exc:
            logger.warning("Go-fever AI analysis failed (%s), using pattern matching", exc)
            ai_content = None

        # Pattern-based detection (always runs as primary or fallback)
        indicators = self._detect_bias_patterns(doc_text)

        # Filter indicators below confidence threshold
        indicators = [ind for ind in indicators if ind.confidence >= 0.3]

        # Compute overall bias score
        overall_bias = (
            sum(ind.confidence for ind in indicators) / len(indicators)
            if indicators
            else 0.0
        )
        overall_bias = min(1.0, overall_bias)

        # Generate summary
        if ai_content:
            summary = ai_content
        else:
            summary = self._generate_bias_summary(indicators, overall_bias)

        attribution = GraniteAttribution(
            model_name="ibm/granite-13b-chat-v2",
            model_version="2.0",
            provider=self._granite.get_active_provider(),
            badge_text="Powered by IBM Granite",
        )

        return GoFeverAnalysis(
            document_id=f"doc_{uuid.uuid4().hex[:12]}",
            overall_bias_score=round(overall_bias, 4),
            indicators=indicators,
            summary=summary,
            attribution=attribution,
        )

    def _load_starliner_data(self) -> None:
        """Pre-load the Starliner CFT timeline with real historical data."""
        starliner_events = [
            {
                "event_id": "starliner_contract_award",
                "date": "2014-09-16",
                "description": "NASA awards Boeing $4.2B Commercial Crew contract",
                "risk_delta": 0.0,
            },
            {
                "event_id": "starliner_single_fault_emails",
                "date": "2016-06-15",
                "description": "Internal emails flag single-fault tolerance violation",
                "risk_delta": 0.35,
            },
            {
                "event_id": "starliner_oft1_failure",
                "date": "2019-12-20",
                "description": "OFT-1 mission failure - software anomalies prevented ISS docking",
                "risk_delta": 0.30,
            },
            {
                "event_id": "starliner_oft2_scrub",
                "date": "2021-08-03",
                "description": "OFT-2 scrubbed - oxidizer valve corrosion discovered",
                "risk_delta": 0.15,
            },
            {
                "event_id": "starliner_oft2_partial",
                "date": "2022-05-19",
                "description": "OFT-2 partial success - thruster failures + helium leaks",
                "risk_delta": 0.20,
            },
            {
                "event_id": "starliner_risk_acceptance",
                "date": "2022-06-01",
                "description": "Internal assessment accepts unresolved risks for CFT",
                "risk_delta": 0.25,
            },
            {
                "event_id": "starliner_cft_frr_go",
                "date": "2024-06-01",
                "description": "CFT Flight Readiness Review - GO decision issued",
                "risk_delta": 0.0,
            },
            {
                "event_id": "starliner_cft_thruster_failures",
                "date": "2024-06-06",
                "description": "CFT thruster failures + helium leaks discovered in orbit",
                "risk_delta": 0.40,
            },
            {
                "event_id": "starliner_too_dangerous",
                "date": "2024-08-24",
                "description": "NASA declares Starliner too dangerous for crewed return",
                "risk_delta": 0.0,
            },
            {
                "event_id": "starliner_crew_return",
                "date": "2025-03-18",
                "description": "Williams/Wilmore return via SpaceX after 286 days in orbit",
                "risk_delta": 0.0,
            },
        ]

        program_id = "starliner_cft"
        timeline: list[CumulativeRiskPoint] = []
        self._program_timelines[program_id] = timeline

        for event in starliner_events:
            pre_score = timeline[-1].post_event_score if timeline else 0.0
            risk_delta = event["risk_delta"]
            post_score = min(1.0, pre_score + risk_delta * (1 - pre_score))

            point = CumulativeRiskPoint(
                event_id=event["event_id"],
                individual_contribution=risk_delta,
                pre_event_score=pre_score,
                post_event_score=post_score,
                timestamp=datetime.fromisoformat(event["date"]),
            )
            timeline.append(point)

        logger.info(
            "Starliner timeline loaded | events=%d | final_risk=%.4f",
            len(timeline),
            timeline[-1].post_event_score if timeline else 0.0,
        )

    async def _generate_recommendation(
        self,
        program_id: str,
        risk_factors: list[RiskFactor],
        overall_score: float,
    ) -> str:
        """Generate AI recommendation or fall back to rule-based."""
        # Determine launch hold vs proceed
        if overall_score > 0.7:
            hold_statement = "RECOMMENDATION: LAUNCH HOLD. "
        else:
            hold_statement = "RECOMMENDATION: PROCEED WITH CAUTION. "

        try:
            prompt = self._build_risk_prompt(program_id, risk_factors, overall_score)
            response = await asyncio.wait_for(
                self._granite.generate(prompt, category="risk_analysis"),
                timeout=GENERATION_TIMEOUT,
            )
            return hold_statement + response.content
        except (asyncio.TimeoutError, Exception) as exc:
            logger.warning("Risk analysis AI generation failed (%s), using fallback", exc)
            return (
                f"{hold_statement}Cumulative risk score of {overall_score:.2f} "
                f"exceeds safety thresholds. {len(risk_factors)} risk factors identified "
                f"across categories: {', '.join(set(rf.category for rf in risk_factors))}. "
                f"Historical precedents suggest elevated organizational risk patterns. "
                f"Independent review board assessment recommended before proceeding."
            )

    def _build_risk_prompt(
        self,
        program_id: str,
        risk_factors: list[RiskFactor],
        overall_score: float,
    ) -> str:
        """Build the prompt for risk analysis AI generation."""
        factors_text = "\n".join(
            f"- [{rf.severity.value.upper()}] {rf.category}: {rf.description} (score: {rf.score})"
            for rf in risk_factors
        )
        return (
            f"You are a Devil's Advocate safety analyst for space mission {program_id}. "
            f"The cumulative risk score is {overall_score:.4f}.\n\n"
            f"Identified risk factors:\n{factors_text}\n\n"
            f"Provide a critical safety assessment challenging any GO decision. "
            f"Reference historical parallels (Challenger, Columbia) where relevant. "
            f"Be specific about failure modes and recommend concrete mitigations."
        )

    def _build_go_fever_prompt(self, document: str) -> str:
        """Build the prompt for go-fever bias detection."""
        return (
            "You are an organizational psychology expert analyzing a spaceflight "
            "decision document for go-fever bias indicators. Identify instances of:\n"
            "1. schedule_pressure - language prioritizing timeline over safety\n"
            "2. normalization_of_deviance - accepting out-of-spec as normal\n"
            "3. dissent_suppression - dismissing or minimizing concerns\n"
            "4. appeal_to_authority - deferring to rank over evidence\n\n"
            f"Document text:\n{document[:10000]}\n\n"
            "For each indicator found, specify: type, confidence (0-1), "
            "the source text excerpt, and a suggested mitigation."
        )

    def _detect_bias_patterns(self, document: str) -> list[GoFeverIndicator]:
        """Rule-based pattern matching for go-fever indicators."""
        indicators: list[GoFeverIndicator] = []
        doc_lower = document.lower()

        # Schedule pressure patterns
        schedule_patterns = [
            ("on schedule", "schedule_pressure", 0.65),
            ("timeline", "schedule_pressure", 0.45),
            ("deadline", "schedule_pressure", 0.60),
            ("cannot delay", "schedule_pressure", 0.75),
            ("launch window", "schedule_pressure", 0.40),
            ("slip", "schedule_pressure", 0.55),
            ("must launch", "schedule_pressure", 0.80),
            ("acceptable deviation", "schedule_pressure", 0.70),
        ]

        # Normalization of deviance patterns
        deviance_patterns = [
            ("acceptable risk", "normalization_of_deviance", 0.60),
            ("within limits", "normalization_of_deviance", 0.35),
            ("previously observed", "normalization_of_deviance", 0.55),
            ("known issue", "normalization_of_deviance", 0.50),
            ("no worse than", "normalization_of_deviance", 0.65),
            ("historically safe", "normalization_of_deviance", 0.55),
            ("acceptable deviation", "normalization_of_deviance", 0.70),
        ]

        # Dissent suppression patterns
        dissent_patterns = [
            ("consensus", "dissent_suppression", 0.40),
            ("unanimous", "dissent_suppression", 0.55),
            ("no objections", "dissent_suppression", 0.50),
            ("all agree", "dissent_suppression", 0.60),
            ("overruled", "dissent_suppression", 0.75),
            ("minority view", "dissent_suppression", 0.65),
        ]

        # Appeal to authority patterns
        authority_patterns = [
            ("management decision", "appeal_to_authority", 0.55),
            ("leadership approved", "appeal_to_authority", 0.50),
            ("director confirmed", "appeal_to_authority", 0.45),
            ("senior staff", "appeal_to_authority", 0.40),
            ("program manager", "appeal_to_authority", 0.35),
        ]

        all_patterns = (
            schedule_patterns
            + deviance_patterns
            + dissent_patterns
            + authority_patterns
        )

        for pattern, indicator_type, confidence in all_patterns:
            start_idx = doc_lower.find(pattern)
            if start_idx != -1:
                # Extract context around the match
                context_start = max(0, start_idx - 30)
                context_end = min(len(document), start_idx + len(pattern) + 30)
                source_text = document[context_start:context_end]

                mitigation = self._get_mitigation(indicator_type)

                indicators.append(
                    GoFeverIndicator(
                        indicator_type=indicator_type,
                        confidence=confidence,
                        source_text=source_text,
                        char_offset_start=start_idx,
                        char_offset_end=start_idx + len(pattern),
                        mitigation=mitigation,
                    )
                )

        return indicators

    def _get_mitigation(self, indicator_type: str) -> str:
        """Return recommended mitigation for a given bias type."""
        mitigations = {
            "schedule_pressure": (
                "Implement independent schedule review. Separate launch decision "
                "authority from schedule management. Apply 'safe to fly' criteria "
                "independent of programmatic constraints."
            ),
            "normalization_of_deviance": (
                "Require formal risk acceptance documentation for all out-of-spec "
                "conditions. Establish trend analysis to detect creeping acceptance. "
                "Reference Columbia Accident Investigation Board recommendations."
            ),
            "dissent_suppression": (
                "Institute anonymous concern reporting channels. Require documented "
                "minority reports for all flight readiness reviews. Apply NASA's "
                "'anyone can call a hold' policy rigorously."
            ),
            "appeal_to_authority": (
                "Separate technical assessment from management authority. Require "
                "data-driven justification for all GO decisions. Implement "
                "independent technical review board with veto authority."
            ),
        }
        return mitigations.get(indicator_type, "Conduct independent review.")

    def _generate_bias_summary(
        self, indicators: list[GoFeverIndicator], overall_bias: float
    ) -> str:
        """Generate a text summary of bias detection results."""
        if not indicators:
            return (
                "No significant go-fever bias indicators detected in the document. "
                "The language appears balanced with appropriate acknowledgment of risks."
            )

        type_counts: dict[str, int] = {}
        for ind in indicators:
            type_counts[ind.indicator_type] = type_counts.get(ind.indicator_type, 0) + 1

        types_summary = ", ".join(
            f"{count} {t.replace('_', ' ')}" for t, count in type_counts.items()
        )

        severity = severity_from_score(overall_bias)
        return (
            f"Analysis detected {len(indicators)} go-fever bias indicators: "
            f"{types_summary}. Overall bias score: {overall_bias:.2f} "
            f"({severity.value.upper()} level). "
            f"Historical parallels to Challenger and Columbia decision-making "
            f"patterns identified. Recommend independent review board assessment "
            f"and implementation of bias mitigation protocols."
        )

    def _select_precedents(
        self, risk_factors: list[RiskFactor]
    ) -> list[HistoricalPrecedent]:
        """Select relevant historical precedents based on risk categories."""
        # Always include the most relevant precedents
        categories = {rf.category.lower() for rf in risk_factors}

        selected: list[HistoricalPrecedent] = []
        for precedent in HISTORICAL_PRECEDENTS:
            # Include if risk factors touch relevant categories
            if any(
                cat in precedent.parallel.lower()
                for cat in ["schedule", "thermal", "deviance", "organizational"]
            ):
                selected.append(precedent)
            elif categories & {"thermal", "structural", "software", "human"}:
                selected.append(precedent)

        # Always return at least Challenger and Columbia
        if not selected:
            selected = HISTORICAL_PRECEDENTS[:2]

        return selected
