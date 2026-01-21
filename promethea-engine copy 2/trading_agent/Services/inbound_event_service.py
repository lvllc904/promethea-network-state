"""
This service is responsible for handling inbound events from the Promethea Network State
via Google Cloud Pub/Sub.
"""

import json
import logging
from datetime import datetime, timezone
from google.cloud import pubsub_v1
from trading_agent.config import get_settings
from trading_agent.services.mcp_client import post_message

logger = logging.getLogger(__name__)
settings = get_settings()

# In-memory store for proposals. In a production system, this would be a database.
PROPOSALS = {}


def handle_inbound_event(message):
    """
    Callback function to handle incoming Pub/Sub messages.
    """
    logger.info(f"Received message: {message.data}")
    try:
        data = json.loads(message.data)
        event_type = data.get("event_type")
        proposal = data.get("data", {})
        proposal_id = proposal.get("id")

        if event_type == "proposal.created":
            logger.info(f"Tracking new proposal: {proposal_id}")
            PROPOSALS[proposal_id] = proposal
        elif event_type == "proposal.updated":
            if proposal_id in PROPOSALS:
                logger.info(f"Updating proposal: {proposal_id}")
                PROPOSALS[proposal_id].update(proposal)
            else:
                logger.warning(f"Received update for untracked proposal: {proposal_id}")
                PROPOSALS[proposal_id] = proposal # Track it anyway

        # Check if the proposal is a passed RWA Acquisition
        if (
            PROPOSALS.get(proposal_id, {}).get("category") == "RWA Acquisition"
            and PROPOSALS.get(proposal_id, {}).get("status") == "Passed"
        ):
            logger.info(
                f"Proposal {proposal_id} for RWA Acquisition passed. "
                "Triggering tokenization."
            )
            # This is a placeholder for the actual tokenization process.
            asset_tokenized_payload = {
                "event_type": "asset.tokenized",
                "data": {
                    "assetId": f"asset-{proposal_id}",
                    "proposalId": proposal_id,
                    "tokenIds": [f"token-{proposal_id}-1", f"token-{proposal_id}-2"],
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
            }
            post_message(asset_tokenized_payload)

        message.ack()
    except json.JSONDecodeError:
        logger.error("Failed to decode message data.")
        message.nack()
    except Exception as e:
        logger.error(f"Error handling message: {e}")
        message.nack()


def subscribe_to_inbound_events():
    """
    Subscribes to the inbound events topic and starts listening for messages.
    """
    # TODO: These should be in the settings
    gcp_project_id = "promethea-dev"
    subscription_name = "promethea-inbound-events-subscription"

    subscriber = pubsub_v1.SubscriberClient()
    subscription_path = subscriber.subscription_path(gcp_project_id, subscription_name)

    logger.info(f"Listening for messages on {subscription_path}...")
    streaming_pull_future = subscriber.subscribe(
        subscription_path, callback=handle_inbound_event
    )

    try:
        # This will block until the subscriber is cancelled.
        streaming_pull_future.result()
    except KeyboardInterrupt:
        streaming_pull_future.cancel()
    except Exception as e:
        logger.error(f"Error in Pub/Sub subscriber: {e}")
        streaming_pull_future.cancel()