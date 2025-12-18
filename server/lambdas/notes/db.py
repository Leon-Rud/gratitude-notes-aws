"""
Data access for notes (DynamoDB).
"""
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key

from shared.config import notes_table
from shared.logging import log_event

TABLE = notes_table()


class NoteAlreadyExistsError(Exception):
    """Raised when attempting to create a note that already exists."""


def put_note(item: Dict[str, Any]) -> None:
    try:
        TABLE.put_item(
            Item=item,
            ConditionExpression="attribute_not_exists(id)",
        )
    except ClientError as err:
        code = err.response["Error"].get("Code")
        if code == "ConditionalCheckFailedException":
            raise NoteAlreadyExistsError(item["id"]) from err
        log_event("put_note_dynamo_error", {"id": item.get("id"), "code": code})
        raise


def find_note_for_day(email: str, date_str: str) -> List[Dict[str, Any]]:
    # Shortcut for fake tables used in tests
    if hasattr(TABLE, "items"):
        return [
            item
            for item in TABLE.items.values()
            if item.get("email") == email
            and item.get("date") == date_str
            and item.get("status") != "deleted"
        ]
    try:
        resp = TABLE.query(
            IndexName="gsi_email_date",
            KeyConditionExpression=Key("email").eq(email) & Key("date").eq(date_str),
            # We may have deleted items for the day; fetch a few and filter in code.
            Limit=10,
            ScanIndexForward=False,
        )
        items = [it for it in resp.get("Items", []) if it.get("status") != "deleted"]
        return items[:1]
    except Exception as err:  # pylint: disable=broad-except
        log_event(
            "find_note_for_day_error",
            {"email": email, "date": date_str, "error": str(err)},
        )
        return []


def update_note_items(note_id: str, note_items: List[str], *, now_iso: Optional[str] = None) -> None:
    """Overwrite note_items for an existing note (used for 'replace instead of 409')."""
    now_iso = now_iso or datetime.now(timezone.utc).isoformat()
    if hasattr(TABLE, "items"):
        item = TABLE.items.get(note_id)
        if item:
            item["note_items"] = note_items
            item["updated_at"] = int(datetime.now(timezone.utc).timestamp())
            item["updated_at_iso"] = now_iso
            item["status"] = "active"
        return
    try:
        TABLE.update_item(
            Key={"id": note_id},
            UpdateExpression="SET note_items = :items, updated_at_iso = :now, #s = :active",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={":items": note_items, ":now": now_iso, ":active": "active"},
        )
    except Exception as err:  # pylint: disable=broad-except
        log_event("update_note_items_error", {"id": note_id, "error": str(err)})
        raise


def get_note(note_id: str) -> Optional[Dict[str, Any]]:
    if hasattr(TABLE, "items"):
        return TABLE.items.get(note_id)
    try:
        res = TABLE.get_item(Key={"id": note_id})
        return res.get("Item")
    except Exception as err:  # pylint: disable=broad-except
        log_event("get_note_dynamo_error", {"id": note_id, "error": str(err)})
        raise


def list_notes_for_date(date_str: str) -> List[Dict[str, Any]]:
    try:
        res = TABLE.query(
            IndexName="gsi_date",
            KeyConditionExpression=Key("date").eq(date_str),
            ScanIndexForward=False,
        )
        return res.get("Items", [])
    except Exception as err:  # pylint: disable=broad-except
        log_event("list_notes_for_date_error", {"date": date_str, "error": str(err)})
        raise


def mark_deleted(note_id: str, *, now_iso: Optional[str] = None) -> None:
    now_iso = now_iso or datetime.now(timezone.utc).isoformat()
    if hasattr(TABLE, "items"):
        item = TABLE.items.get(note_id)
        if item:
            item["status"] = "deleted"
            item["deleted_at"] = now_iso
        return
    try:
        TABLE.update_item(
            Key={"id": note_id},
            UpdateExpression="SET #s = :deleted, deleted_at = :now",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={":deleted": "deleted", ":now": now_iso},
        )
    except Exception as err:  # pylint: disable=broad-except
        log_event("mark_deleted_error", {"id": note_id, "error": str(err)})
        raise

