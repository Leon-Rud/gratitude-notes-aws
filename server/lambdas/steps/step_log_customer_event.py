import json
from typing import Any, Dict

from common import logger


def handler(event: Dict[str, Any], _context) -> Dict[str, Any]:
    """Write a structured log entry for customer IDs that already exist."""
    customer_id = event.get("id") if isinstance(event, dict) else None
    logger.info(
        json.dumps(
            {
                "action": "step_log_customer_event",
                "customer_id": customer_id,
                "exists": event.get("exists") if isinstance(event, dict) else None,
                "raw_event": event,
            }
        )
    )
    return {
        "id": customer_id,
        "exists": event.get("exists") if isinstance(event, dict) else None,
        "logged": True,
    }
