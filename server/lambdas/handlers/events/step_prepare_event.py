from typing import Any, Dict

from shared.logging import log_event


def handler(event: Dict[str, Any], _context) -> Dict[str, Any]:
    """
    Step Function task that prepares archive.nightly events for processing.
    
    Validates the event payload and returns normalized event data for the archive workflow.
    """
    if not isinstance(event, dict):
        raise ValueError("Event payload must be an object.")

    event_type = event.get("eventType")
    if event_type != "archive.nightly":
        raise ValueError(f"Unsupported event type: {event_type}. Only 'archive.nightly' is supported.")

    log_event("step_prepare_event", {"eventType": event_type})
    return {"eventType": event_type}

