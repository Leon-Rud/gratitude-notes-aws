import json
from typing import Any, Dict

from common import (
    CUSTOMER_IDS_TABLE,
    CustomerIdAlreadyExistsError,
    logger,
    put_customer_id_record,
    sanitize_customer_id,
)

TABLE = CUSTOMER_IDS_TABLE


def _extract_customer_id(event: Dict[str, Any]) -> str:
    """Normalize and validate the customer ID from the state input."""

    customer_id = event.get("id") if isinstance(event, dict) else None
    normalized, error = sanitize_customer_id(
        customer_id,
        missing_message="Event payload must include an 'id' string.",
        length_message="Customer ID must be 3 to 100 characters.",
    )
    if error:
        raise ValueError(error)
    return normalized


def handler(event: Dict[str, Any], _context) -> Dict[str, Any]:
    """Insert the customer ID into DynamoDB when it is not already present."""

    customer_id = _extract_customer_id(event)
    logger.info(json.dumps({"action": "step_insert_customer_id_attempt", "customer_id": customer_id}))

    try:
        put_customer_id_record(TABLE, customer_id)
    except CustomerIdAlreadyExistsError as err:
        logger.warning(
            json.dumps(
                {
                    "action": "step_insert_customer_id_conflict",
                    "customer_id": customer_id,
                    "message": "ID already exists",
                }
            )
        )
        raise ValueError(f"Customer ID {customer_id} already exists.") from err
    except Exception:
        logger.exception("Unexpected error inserting customer ID.")
        raise
    
    payload = {"id": customer_id, "inserted": True}
    logger.info(json.dumps({"action": "step_insert_customer_id_success", **payload}))
    return payload
