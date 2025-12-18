from datetime import datetime, timezone
from typing import Any, Dict

from boto3.dynamodb.conditions import Key
from zoneinfo import ZoneInfo

from shared.config import ARCHIVE_TIMEZONE, notes_table
from shared.logging import log_event

TABLE = notes_table()


def _archive_date() -> str:
    try:
        tz = ZoneInfo(ARCHIVE_TIMEZONE)
    except Exception:
        tz = timezone.utc
    return datetime.now(tz).date().isoformat()


def handler(event: Dict[str, Any], _context) -> Dict[str, Any]:
    target_date = event.get("date") or _archive_date()
    archived = 0
    now_iso = datetime.now(timezone.utc).isoformat()

    exclusive_start_key = None
    while True:
        query_kwargs = {
            "IndexName": "gsi_date",
            "KeyConditionExpression": Key("date").eq(target_date),
        }
        if exclusive_start_key:
            query_kwargs["ExclusiveStartKey"] = exclusive_start_key
        response = TABLE.query(**query_kwargs)
        for item in response.get("Items", []):
            if item.get("status") == "deleted":
                continue
            TABLE.update_item(
                Key={"id": item["id"]},
                UpdateExpression="SET #s = :deleted, archived_at = :now",
                ExpressionAttributeNames={"#s": "status"},
                ExpressionAttributeValues={":deleted": "deleted", ":now": now_iso},
            )
            archived += 1
        exclusive_start_key = response.get("LastEvaluatedKey")
        if not exclusive_start_key:
            break

    log_event("step_archive_notes", {"date": target_date, "archived": archived})
    return {"date": target_date, "archived": archived}

