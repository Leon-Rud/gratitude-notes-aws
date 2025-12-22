"""
Data access for notes (DynamoDB).
"""
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key

from shared.config import notes_table
from shared.logging import log_event
from notes.service import build_note_item

TABLE = notes_table()


class NoteAlreadyExistsError(Exception):
    """Raised when attempting to create a note that already exists."""

def create_or_replace_note(
    normalized: Dict[str, Any],
    *,
    date_str: str,
    now_iso: Optional[str] = None,
    allow_multiple_per_day: bool = False,
) -> Tuple[Dict[str, Any], bool]:
    """
    Single entry point for the POST note handler.

    Returns (note_item, created_bool).
    - If allow_multiple_per_day is False and a note exists for (email, date), we update it and return created=False.
    - Otherwise we create a new note and return created=True.

    This function exists mainly to provide a single seam for unit tests
    (so tests don't need to patch multiple DB helpers).
    """
    now_iso = now_iso or datetime.now(timezone.utc).isoformat()
    if not allow_multiple_per_day:
        existing = find_note_for_day(normalized["email"], date_str)
        if existing:
            existing_item = existing[0]
            update_note_items(existing_item["id"], normalized["note_items"], now_iso=now_iso)
            merged = {**existing_item, "note_items": normalized["note_items"]}
            return merged, False

    item = build_note_item(normalized)
    item["date"] = date_str
    put_note(item)
    return item, True


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


def archive_notes_by_date(date_str: str, *, now_iso: Optional[str] = None) -> int:
    """
    Mark all notes for a given date as deleted and set archived_at.

    Returns number of notes archived.
    This is the persistence seam for the archive step handler.
    """
    now_iso = now_iso or datetime.now(timezone.utc).isoformat()
    archived = 0

    exclusive_start_key = None
    while True:
        query_kwargs = {
            "IndexName": "gsi_date",
            "KeyConditionExpression": Key("date").eq(date_str),
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

    return archived

