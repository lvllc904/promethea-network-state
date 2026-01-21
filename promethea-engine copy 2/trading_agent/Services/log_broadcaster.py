import logging
import asyncio
from .websocket_manager import manager

class WebSocketLogHandler(logging.Handler):
    """
    A custom logging handler that broadcasts log records to all connected
    WebSocket clients.
    """
    def __init__(self):
        super().__init__()
        self.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s', datefmt='%H:%M:%S'))

    def emit(self, record):
        """
        This method is called for every log record. It formats the message
        and schedules it to be broadcasted via the ConnectionManager.
        """
        msg = self.format(record)
        # Use asyncio.create_task to send the message without blocking the logger.
        asyncio.create_task(manager.broadcast(msg))