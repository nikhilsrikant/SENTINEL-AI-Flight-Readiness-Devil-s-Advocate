"""Multi-fallback Granite AI client.

Implements the provider chain: watsonx -> Ollama -> HuggingFace -> Mock Mode.
Each provider has a 10-second timeout. On failure, a FallbackEvent is logged
and the next provider in the chain is attempted.
"""

from __future__ import annotations

import asyncio
import logging
import random
import time
from datetime import datetime

import httpx

from backend.config import settings
from backend.models.enums import Provider
from backend.models.granite import FallbackEvent, GraniteResponse
from backend.models.shared import GraniteAttribution

logger = logging.getLogger(__name__)

# Provider timeout in seconds
PROVIDER_TIMEOUT = 10.0


class GraniteClient:
    """Multi-fallback AI client with watsonx -> Ollama -> HuggingFace -> Mock chain.

    Automatically detects mock mode when WATSONX_API_KEY is not configured.
    Provides consistent GraniteAttribution metadata regardless of active provider.
    """

    def __init__(self) -> None:
        self._fallback_events: list[FallbackEvent] = []
        self._active_provider: str = self._determine_initial_provider()
        self._mock_responses: dict[str, str] = self._load_mock_responses()

        logger.info(
            "GraniteClient initialized | mode=%s | active_provider=%s",
            settings.GRANITE_MODE,
            self._active_provider,
        )

    def _determine_initial_provider(self) -> str:
        """Determine the starting provider based on configuration."""
        mode = settings.GRANITE_MODE.lower()
        if mode == "mock":
            return Provider.MOCK.value
        if mode == "watsonx":
            return Provider.WATSONX.value
        if mode == "ollama":
            return Provider.OLLAMA.value
        if mode == "huggingface":
            return Provider.HUGGINGFACE.value

        # Auto mode: check if watsonx credentials are available
        if not settings.WATSONX_API_KEY:
            logger.info(
                "WATSONX_API_KEY not set; activating mock mode automatically."
            )
            return Provider.MOCK.value

        return Provider.WATSONX.value

    def _load_mock_responses(self) -> dict[str, str]:
        """Load built-in mock responses for demo/fallback mode."""
        return {
            "risk_analysis": (
                "Based on analysis of the provided risk factors, I identify three "
                "critical concerns: 1) Thermal protection system degradation shows "
                "patterns consistent with pre-Columbia STS-107 observations. "
                "2) Schedule pressure indicators suggest potential go-fever bias. "
                "3) Cross-system interaction effects remain under-characterized. "
                "Recommend additional thermal inspections and independent review "
                "board assessment before flight readiness certification."
            ),
            "go_fever": (
                "Analysis of the decision document reveals 3 potential go-fever "
                "indicators: (1) Language minimizing risk with phrases like "
                "'acceptable deviation' without quantitative backing. "
                "(2) Schedule-driven phrasing prioritizing timeline over safety margins. "
                "(3) Absence of dissenting viewpoints in the documented discussion. "
                "Overall bias score: 0.67 (WARNING level)."
            ),
            "anomaly": (
                "The telemetry pattern shows an anomalous thermal gradient "
                "developing in sector 4. Rate of change exceeds nominal bounds "
                "by 2.3 sigma. Similar patterns were observed in 3 prior missions, "
                "with escalation occurring in 2 of 3 cases within 48 hours. "
                "Recommend increased monitoring frequency and crew notification."
            ),
            "telemetry": (
                "Telemetry analysis indicates cabin pressure trending 0.02 PSI/hr "
                "below nominal. Current value remains within operational limits but "
                "the trend direction warrants monitoring. No immediate action required. "
                "Historical comparison shows similar trends resolved within 6 hours "
                "in 78% of observed cases."
            ),
            "knowledge": (
                "Based on the knowledge base, the Challenger disaster (1986) and "
                "Columbia disaster (2003) share a common organizational pattern: "
                "normalization of deviance. In both cases, known anomalies were "
                "reclassified as acceptable risks over time. The parallel to the "
                "current scenario involves repeated acceptance of out-of-spec "
                "thermal readings."
            ),
            "mission": (
                "Mission timeline analysis indicates a 12-hour margin deficit on "
                "the critical path. The Pre-Launch systems verification phase "
                "overlaps with crew ingress preparation by 3.5 hours. Recommend "
                "either extending the launch window by 12 hours or parallelizing "
                "the environmental systems checkout with crew suit-up procedures."
            ),
            "orbital": (
                "Conjunction analysis identifies 2 high-priority close approaches "
                "within the next 72 hours. Event #1: miss distance 1.2 km at "
                "T+14:32:00 (Pc = 1.4e-4). Event #2: miss distance 3.8 km at "
                "T+38:15:00 (Pc = 2.1e-5). Recommend monitoring Event #1 for "
                "potential avoidance maneuver decision at T+8:00:00."
            ),
            "academy": (
                "Welcome to the Space Academy training module. This scenario "
                "recreates the decision-making environment of the Challenger "
                "STS-51-L launch decision. You will face pressure from schedule "
                "constraints while evaluating engineer concerns about O-ring "
                "performance at low temperatures. Your decisions will be compared "
                "to historical outcomes."
            ),
            "default": (
                "I've analyzed the available data and identified key patterns "
                "relevant to flight safety. Based on historical precedents and "
                "current telemetry, I recommend a thorough review of the "
                "identified risk factors before proceeding with the mission timeline."
            ),
        }

    def _get_attribution(self) -> GraniteAttribution:
        """Build attribution metadata for the current active provider."""
        return GraniteAttribution(
            model_name=settings.GRANITE_MODEL_ID,
            model_version="2.0",
            provider=self._active_provider,
            badge_text="Powered by IBM Granite",
        )

    def get_active_provider(self) -> str:
        """Return the name of the currently active provider."""
        return self._active_provider

    def is_mock_mode(self) -> bool:
        """Return whether the client is operating in mock mode."""
        return self._active_provider == Provider.MOCK.value

    @property
    def fallback_events(self) -> list[FallbackEvent]:
        """Return the log of fallback events."""
        return list(self._fallback_events)

    # ------------------------------------------------------------------
    # Provider implementations
    # ------------------------------------------------------------------

    async def _call_watsonx(self, prompt: str) -> str:
        """Call IBM watsonx.ai inference endpoint."""
        url = f"{settings.WATSONX_URL}/ml/v1/text/generation?version=2024-03-14"
        headers = {
            "Authorization": f"Bearer {settings.WATSONX_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model_id": settings.GRANITE_MODEL_ID,
            "input": prompt,
            "project_id": settings.WATSONX_PROJECT_ID,
            "parameters": {
                "decoding_method": "greedy",
                "max_new_tokens": 1024,
                "temperature": 0.7,
                "top_p": 0.9,
            },
        }
        async with httpx.AsyncClient(timeout=PROVIDER_TIMEOUT) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data["results"][0]["generated_text"]

    async def _call_ollama(self, prompt: str) -> str:
        """Call local Ollama inference endpoint."""
        url = f"{settings.OLLAMA_URL}/api/generate"
        payload = {
            "model": settings.OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "num_predict": 1024,
            },
        }
        async with httpx.AsyncClient(timeout=PROVIDER_TIMEOUT) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            return data["response"]

    async def _call_huggingface(self, prompt: str) -> str:
        """Call HuggingFace Inference API."""
        url = f"https://api-inference.huggingface.co/models/{settings.HUGGINGFACE_MODEL}"
        headers = {
            "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 1024,
                "temperature": 0.7,
                "top_p": 0.9,
            },
        }
        async with httpx.AsyncClient(timeout=PROVIDER_TIMEOUT) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            if isinstance(data, list):
                return data[0].get("generated_text", "")
            return data.get("generated_text", "")

    async def _call_mock(self, category: str) -> str:
        """Return a mock response with simulated latency."""
        latency_ms = random.randint(
            settings.MOCK_LATENCY_MIN, settings.MOCK_LATENCY_MAX
        )
        await asyncio.sleep(latency_ms / 1000.0)
        return self._mock_responses.get(
            category, self._mock_responses["default"]
        )

    # ------------------------------------------------------------------
    # Main generation method
    # ------------------------------------------------------------------

    async def generate(self, prompt: str, category: str = "default") -> GraniteResponse:
        """Execute prompt through the fallback chain.

        Args:
            prompt: The text prompt to send to the AI provider.
            category: Category key for mock response lookup.

        Returns:
            GraniteResponse containing the generated content and metadata.
        """
        # If already in mock mode (auto-detected or forced), skip the chain
        if self.is_mock_mode():
            return await self._generate_mock(category)

        # Build the provider chain based on current mode
        chain = self._build_chain()

        for i, (provider_name, call_fn) in enumerate(chain):
            start_ms = time.perf_counter() * 1000
            try:
                content = await call_fn(prompt)
                self._active_provider = provider_name
                return GraniteResponse(
                    content=content,
                    model_name=settings.GRANITE_MODEL_ID,
                    model_version="2.0",
                    provider=provider_name,
                    is_mock=False,
                    metadata={
                        "latency_ms": round(time.perf_counter() * 1000 - start_ms, 1),
                        "attribution": self._get_attribution().model_dump(),
                    },
                )
            except Exception as exc:
                elapsed_ms = round(time.perf_counter() * 1000 - start_ms, 1)
                http_status = getattr(exc, "status_code", None)
                next_provider = (
                    chain[i + 1][0] if i + 1 < len(chain) else Provider.MOCK.value
                )

                event = FallbackEvent(
                    failed_provider=provider_name,
                    error_type=type(exc).__name__,
                    http_status=http_status,
                    elapsed_ms=elapsed_ms,
                    next_provider=next_provider,
                    timestamp=datetime.utcnow(),
                )
                self._fallback_events.append(event)
                logger.warning(
                    "Provider %s failed (%s, %.0fms) -> falling back to %s",
                    provider_name,
                    type(exc).__name__,
                    elapsed_ms,
                    next_provider,
                )

        # All providers failed; fall back to mock
        return await self._generate_mock(category)

    async def _generate_mock(self, category: str) -> GraniteResponse:
        """Generate a mock response."""
        self._active_provider = Provider.MOCK.value
        start_ms = time.perf_counter() * 1000
        content = await self._call_mock(category)
        elapsed_ms = round(time.perf_counter() * 1000 - start_ms, 1)

        return GraniteResponse(
            content=content,
            model_name=settings.GRANITE_MODEL_ID,
            model_version="2.0",
            provider=Provider.MOCK.value,
            is_mock=True,
            metadata={
                "latency_ms": elapsed_ms,
                "attribution": self._get_attribution().model_dump(),
            },
        )

    def _build_chain(self) -> list[tuple[str, object]]:
        """Build the ordered provider fallback chain based on config."""
        mode = settings.GRANITE_MODE.lower()

        if mode == "watsonx":
            return [(Provider.WATSONX.value, self._call_watsonx)]
        if mode == "ollama":
            return [(Provider.OLLAMA.value, self._call_ollama)]
        if mode == "huggingface":
            return [(Provider.HUGGINGFACE.value, self._call_huggingface)]

        # Auto mode: full chain
        chain: list[tuple[str, object]] = []
        if settings.WATSONX_API_KEY:
            chain.append((Provider.WATSONX.value, self._call_watsonx))
        if settings.OLLAMA_URL:
            chain.append((Provider.OLLAMA.value, self._call_ollama))
        if settings.HUGGINGFACE_API_KEY:
            chain.append((Provider.HUGGINGFACE.value, self._call_huggingface))
        return chain


# Singleton instance for application-wide usage
granite_client = GraniteClient()
