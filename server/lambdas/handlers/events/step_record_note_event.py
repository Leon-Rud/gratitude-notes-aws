from typing import Any, Dict

import boto3

from shared.config import REGION
from shared.logging import log_event

cloudwatch = boto3.client("cloudwatch", region_name=REGION)

# Map event types to CloudWatch metric names
METRIC_NAME_MAP = {
    "note.created": "NoteCreated",
    "note.updated": "NoteUpdated",
    "note.deleted": "NoteDeleted",
}


def handler(event: Dict[str, Any], _context) -> Dict[str, Any]:
    """
    Step Function task that records note lifecycle events to CloudWatch.
    
    Handles note.created, note.updated, and note.deleted events.
    Emits custom metrics and structured logs for observability.
    """
    event_type = event.get("eventType")
    note_id = event.get("noteId")
    
    if not event_type:
        log_event("record_note_event_missing_event_type", {"event": event})
        return {"status": "skipped", "reason": "missing_event_type"}
    
    if not note_id:
        log_event("record_note_event_missing_note_id", {"event": event, "eventType": event_type})
        return {"status": "skipped", "reason": "missing_note_id"}
    
    metric_name = METRIC_NAME_MAP.get(event_type)
    if not metric_name:
        log_event("record_note_event_unsupported_type", {"eventType": event_type, "noteId": note_id})
        return {"status": "skipped", "reason": f"unsupported_event_type: {event_type}"}

    try:
        # Emit CloudWatch custom metric
        cloudwatch.put_metric_data(
            Namespace="DailyGratitude",
            MetricData=[
                {
                    "MetricName": metric_name,
                    "Value": 1,
                    "Unit": "Count",
                    "Dimensions": [
                        {"Name": "EventType", "Value": event_type}
                    ],
                }
            ],
        )
        
        log_event("note_event_recorded", {"noteId": note_id, "eventType": event_type, "metricName": metric_name})
        return {"status": "recorded", "noteId": note_id, "eventType": event_type}
        
    except Exception as err:  # pylint: disable=broad-except
        log_event("record_note_event_error", {"noteId": note_id, "eventType": event_type, "error": str(err)})
        # Return success to avoid failing the Step Functions execution
        # The error is logged for debugging
        return {"status": "error", "noteId": note_id, "eventType": event_type, "error": str(err)}

