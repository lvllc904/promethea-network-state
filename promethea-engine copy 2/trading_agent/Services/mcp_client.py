"""
This module implements the client for the Model Context Protocol (MCP).
"""

import json
import logging
import requests
import google.auth
from eth_account import Account
from eth_account.messages import encode_defunct

from trading_agent.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def post_message(payload: dict) -> dict:
    """
    Posts a message to the MCP server.
    """
    try:
        # 1. Construct the payload envelope
        payload_json = json.dumps(payload, separators=(",", ":"))
        message = encode_defunct(text=payload_json)
        signed_message = Account.from_key(settings.signing_key).sign_message(message)
        signature = signed_message.signature.hex()

        envelope = {
            "payload": payload,
            "signature": signature,
            "decentralizedId": settings.did,
        }

        # 2. Obtain Google IAM identity token
        credentials, project = google.auth.default()
        auth_req = google.auth.transport.requests.Request()
        credentials.refresh(auth_req)
        id_token = credentials.id_token

        headers = {
            "Authorization": f"Bearer {id_token}",
            "Content-Type": "application/json",
        }

        # 3. Send the authenticated POST request
        mcp_url = f"{settings.mcp_server_base_url}/messages"
        logger.info(f"Posting message to MCP server at {mcp_url}")
        response = requests.post(mcp_url, headers=headers, json=envelope, timeout=30)
        response.raise_for_status()

        logger.info("Successfully posted message to MCP server.")
        return response.json()

    except requests.exceptions.RequestException as e:
        logger.error(f"Error posting message to MCP server: {e}")
        return {"status": "error", "message": str(e)}
    except Exception as e:
        logger.error(f"An unexpected error occurred in post_message: {e}")
        return {"status": "error", "message": str(e)}


def get_new_messages(since_timestamp: str) -> list:
    """
    Gets new messages from the MCP server.
    """
    print(f"MCP CLIENT: Getting new messages since {since_timestamp}")
    # In the future, this will make a GET request to the MCP server.
    return []


def get_agent_status(agent_id: str) -> dict:
    """
    Gets the status of an agent from the MCP server.
    """
    print(f"MCP CLIENT: Getting status for agent {agent_id}")
    # In the future, this will make a GET request to the MCP server.
    return {"agent_id": agent_id, "status": "mock_status"}