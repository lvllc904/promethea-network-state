import asyncio
from fastapi import WebSocket
from typing import List

class ConnectionManager:
    """
    Manages active WebSocket connections. It allows broadcasting messages
    to all connected clients, which is perfect for a live log stream.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Accepts a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        """Removes a WebSocket connection."""
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        """Sends a message to all connected clients."""
        # We create a list of tasks to send messages concurrently.
        tasks = [connection.send_text(message) for connection in self.active_connections]
        await asyncio.gather(*tasks, return_exceptions=False)

# Create a single, global instance of the manager.
manager = ConnectionManager()