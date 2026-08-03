"""Application configuration loaded from environment variables.

Uses pydantic-settings for type-safe environment variable parsing with defaults.
"""

from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """SENTINEL platform configuration.

    All settings can be overridden via environment variables.
    """

    # ---------- Granite / AI Provider Settings ----------
    GRANITE_MODE: str = "auto"
    """Provider mode: auto, watsonx, ollama, huggingface, mock.

    In 'auto' mode the client attempts watsonx first, falling back through the chain.
    If WATSONX_API_KEY is not set in 'auto' mode, mock mode is activated immediately.
    """

    WATSONX_URL: str = "https://us-south.ml.cloud.ibm.com"
    """IBM watsonx.ai API endpoint URL."""

    WATSONX_API_KEY: str = ""
    """IBM watsonx.ai API key. Empty string means watsonx is unavailable."""

    WATSONX_PROJECT_ID: str = ""
    """IBM watsonx.ai project/space ID."""

    GRANITE_MODEL_ID: str = "ibm/granite-13b-chat-v2"
    """Default Granite model ID for inference."""

    # ---------- Ollama Settings ----------
    OLLAMA_URL: str = "http://localhost:11434"
    """Ollama local inference server URL."""

    OLLAMA_MODEL: str = "granite-code:8b"
    """Model name to use with Ollama."""

    # ---------- HuggingFace Settings ----------
    HUGGINGFACE_API_KEY: str = ""
    """HuggingFace Inference API key."""

    HUGGINGFACE_MODEL: str = "ibm-granite/granite-3.0-8b-instruct"
    """HuggingFace model ID."""

    # ---------- Mock Mode Settings ----------
    MOCK_LATENCY_MIN: int = 200
    """Minimum simulated latency in milliseconds for mock responses."""

    MOCK_LATENCY_MAX: int = 800
    """Maximum simulated latency in milliseconds for mock responses."""

    # ---------- Server Settings ----------
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False

    # ---------- ChromaDB Settings ----------
    CHROMADB_HOST: str = "localhost"
    CHROMADB_PORT: int = 8500

    # ---------- External Data ----------
    NASA_API_KEY: str = "DEMO_KEY"
    SPACETRACK_USERNAME: str = ""
    SPACETRACK_PASSWORD: str = ""

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


# Singleton instance
settings = Settings()
