"""Business logic services for all 7 SENTINEL modules."""

from backend.services.devils_advocate import DevilsAdvocateService
from backend.services.websocket_manager import WebSocketManager, ws_manager

__all__ = [
    "DevilsAdvocateService",
    "WebSocketManager",
    "ws_manager",
]
