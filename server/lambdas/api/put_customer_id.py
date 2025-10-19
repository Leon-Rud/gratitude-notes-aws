import json
import os

from botocore.exceptions import ClientError

from common import (
    CUSTOMER_IDS_TABLE,
    EVENT_DETAIL_TYPE,
    EVENTS,
    EVENT_SOURCE,
    CustomerIdAlreadyExistsError,
    json_response,
    logger,
    put_customer_id_record,
    sanitize_customer_id,
)

TABLE = CUSTOMER_IDS_TABLE


def _extract_customer_id(event):
    """Validate the incoming JSON payload and return the ID or an error message."""
    try:
        payload = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return None, "Body must be valid JSON."
    customer_id, error = sanitize_customer_id(payload.get("id"))
    if error:
        return None, error
    return customer_id, None


def handler(event, _context):
    """Handle PUT /customer-ids by creating the ID and publishing an event."""

    customer_id, error = _extract_customer_id(event)
    if error:
        return json_response(400, {"message": error})
    logger.info(json.dumps({"action": "put_customer_id", "customer_id": customer_id}))
    stored = True

    try:
        put_customer_id_record(TABLE, customer_id)
    except CustomerIdAlreadyExistsError:
        stored = False
    except Exception:  # pylint: disable=broad-except
        logger.exception("Unexpected error while writing item.")
        return json_response(500, {"message": "Internal server error."})

    _publish_event(customer_id, stored=stored)
    if stored:
        return json_response(201, {"message": "Customer ID stored.", "id": customer_id})

    return json_response(409, {"message": "Customer ID already exists.", "id": customer_id})


def _publish_event(customer_id: str, *, stored: bool) -> None:
    """Publish an EventBridge notification about the submitted customer ID."""
    bus_name = os.getenv("EVENT_BUS_NAME", "default")
    try:
        EVENTS.put_events(
            Entries=[
                {
                    "Source": EVENT_SOURCE,
                    "DetailType": EVENT_DETAIL_TYPE,
                    "EventBusName": bus_name,
                    "Detail": json.dumps({"id": customer_id, "stored": stored}),
                }
            ]
        )
        logger.info(
            json.dumps(
                {
                    "action": "eventbridge_put",
                    "customer_id": customer_id,
                    "event_bus": bus_name,
                    "detail_type": EVENT_DETAIL_TYPE,
                    "stored": stored,
                }
            )
        )
    except ClientError:
        logger.exception("Failed to publish EventBridge event", extra={"customer_id": customer_id})
