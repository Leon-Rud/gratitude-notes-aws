import json
from typing import Any, Dict, Optional, Tuple

from botocore.exceptions import ClientError

from common import CUSTOMER_IDS_TABLE, logger, sanitize_customer_id

TABLE = CUSTOMER_IDS_TABLE

def _extract_customer_id(event: Dict[str, Any]) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """Validate the structure of the workflow payload and extract the ID."""
    raw_id = event.get("id") if isinstance(event, dict) else None
    sanitized, error = sanitize_customer_id(
        raw_id,
        missing_message="Event payload must include an 'id' string.",
        length_message="Customer ID must be 3 to 100 characters.",
    )
    return raw_id, sanitized, error


def handler(event: Dict[str, Any], _context) -> Dict[str, Any]:
    """Return validation status and existence information for a customer ID."""
    raw_id, customer_id, error = _extract_customer_id(event)
    if error:
        log_payload = {"action": "step_validate_customer_id", "valid": False, "reason": error}
        if raw_id is not None:
            log_payload["id"] = raw_id
        logger.info(json.dumps(log_payload))
        return {"valid": False, "reason": error}

    try:
        result = TABLE.get_item(Key={"id": customer_id})
        exists = "Item" in result and bool(result["Item"])
    except ClientError:
        reason = "Failed to query customer table."
        log_payload = {
            "action": "step_validate_customer_id",
            "id": customer_id,
            "valid": False,
            "reason": reason,
        }
        logger.info(json.dumps(log_payload))
        logger.exception("Failed to query DynamoDB for validation.")
        return {"valid": False, "reason": reason}

    response = {"id": customer_id, "valid": True, "exists": exists}
    log_payload = {"action": "step_validate_customer_id", "id": customer_id, "valid": True, "exists": exists}
    logger.info(json.dumps(log_payload))
    return response
