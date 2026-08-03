"""WebSocket connection manager for real-time updates.

Supports up to 50 concurrent connections with a 5-minute message buffer
for clients that temporarily disconnect.
"""

from __future__ import annotations

import logging
import time
import uuid
from collections import deque

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class WebSocketManager:
    """Manages WebSocket connections, broadcasting, and message buffering.

    Attributes:
        MAX_CONNECTIONS: Maximum simultaneous WebSocket connections.
        BUFFER_DURATION_SECONDS: How long to retain messages for disconnected clients.
    """

    MAX_CONNECTIONS = 50
    BUFFER_DURATION_SECONDS = 300

    def __init__(self) -> None:
        self._active_connections: dict[str, WebSocket] = {}
        self._message_buffers: dict[str, deque[tuple[float, dict]]] = {}

    @property
    def active_connection_count(self) -> int:
        """Return the number of currently active connections."""
        return len(self._active_connections)

    async def connect(self, websocket: WebSocket) -> str:
        """Accept a WebSocket connection and register it.

        Args:
            websocket: The incoming WebSocket connection.

        Returns:
            A unique client_id assigned to this connection.

        Raises:
            ConnectionRefusedError: If MAX_CONNECTIONS is reached.
        """
        if len(self._active_connections) >= self.MAX_CONNECTIONS:
            await websocket.close(code=1013, reason="Maximum connections reached")
            raise ConnectionRefusedError(
                f"Connection limit of {self.MAX_CONNECTIONS} reached"
            )

        await websocket.accept()
        client_id = f"ws_{uuid.uuid4().hex[:12]}"
        self._active_connections[client_id] = websocket

        # Flush any buffered messages to the reconnecting client
        if client_id in self._message_buffers:
            await self._flush_buffer(client_id, websocket)

        logger.info(
            "WebSocket connected | client_id=%s | total=%d",
            client_id,
            len(self._active_connections),
        )
        return client_id

    async def disconnect(self, client_id: str) -> None:
        """Remove a client from active connections.

        The client's message buffer is retained for BUFFER_DURATION_SECONDS
        to support reconnection scenarios.

        Args:
            client_id: The client identifier to disconnect.
        """
        self._active_connections.pop(client_id, None)
        logger.info(
            "WebSocket disconnected | client_id=%s | remaining=%d",
            client_id,
            len(self._active_connections),
        )

    async def broadcast(self, message: dict) -> None:
        """Send a message to all active connections.

        Failed sends are logged and the connection is removed.

        Args:
            message: JSON-serializable message dictionary.
        """
        disconnected: list[str] = []

        for client_id, websocket in self._active_connections.items():
            try:
                await websocket.send_json(message)
            except Exception as exc:
                logger.warning(
                    "Broadcast failed for client %s: %s", client_id, exc
                )
                disconnected.append(client_id)
                # Buffer the message for potential reconnection
                self.buffer_for_client(client_id, message)

        # Clean up failed connections
        for client_id in disconnected:
            self._active_connections.pop(client_id, None)

    def buffer_for_client(self, client_id: str, message: dict) -> None:
        """Store a message in the client's buffer for later delivery.

        Messages older than BUFFER_DURATION_SECONDS are pruned.

        Args:
            client_id: Target client identifier.
            message: JSON-serializable message dictionary.
        """
        if client_id not in self._message_buffers:
            self._message_buffers[client_id] = deque()

        now = time.time()
        self._message_buffers[client_id].append((now, message))

        # Prune expired messages
        self._prune_buffer(client_id, now)

    def _prune_buffer(self, client_id: str, current_time: float) -> None:
        """Remove messages older than BUFFER_DURATION_SECONDS."""
        buffer = self._message_buffers.get(client_id)
        if not buffer:
            return

        cutoff = current_time - self.BUFFER_DURATION_SECONDS
        while buffer and buffer[0][0] < cutoff:
            buffer.popleft()

        # Remove empty buffers
        if not buffer:
            del self._message_buffers[client_id]

    async def _flush_buffer(self, client_id: str, websocket: WebSocket) -> None:
        """Send all buffered messages to a reconnected client."""
        buffer = self._message_buffers.pop(client_id, None)
        if not buffer:
            return

        now = time.time()
        cutoff = now - self.BUFFER_DURATION_SECONDS

        for timestamp, message in buffer:
            if timestamp >= cutoff:
                try:
                    await websocket.send_json(message)
                except Exception as exc:
                    logger.warning(
                        "Failed to flush buffered message to %s: %s",
                        client_id,
                        exc,
                    )
                    break


# Singleton instance
ws_manager = WebSocketManager()
