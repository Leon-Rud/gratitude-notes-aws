import json
import os
import sys
import types
from pathlib import Path
from datetime import datetime, timezone
from typing import Any, Dict

import pytest
from botocore.exceptions import ClientError


class FakeDynamoTable:
    def __init__(self, pk_name: str):
        self.pk_name = pk_name
        self.items: Dict[str, Dict[str, Any]] = {}

    def put_item(self, *, Item, ConditionExpression=None):
        key = Item[self.pk_name]
        if (
            ConditionExpression
            and "attribute_not_exists" in ConditionExpression
            and key in self.items
        ):
            raise ClientError(
                {
                    "Error": {
                        "Code": "ConditionalCheckFailedException",
                        "Message": "Exists",
                    }
                },
                "PutItem",
            )
        self.items[key] = Item

    def get_item(self, *, Key):
        key = Key[self.pk_name]
        item = self.items.get(key)
        return {"Item": item} if item else {}

    def update_item(
        self,
        *,
        Key,
        UpdateExpression=None,
        ExpressionAttributeValues=None,
        ExpressionAttributeNames=None,
    ):
        key = Key[self.pk_name]
        item = self.items.setdefault(key, {self.pk_name: key})

        if UpdateExpression and UpdateExpression.startswith("SET "):
            clauses = UpdateExpression[4:].split(",")
            for raw_clause in clauses:
                clause = raw_clause.strip()
                if "=" not in clause:
                    continue
                lhs, rhs = [x.strip() for x in clause.split("=", 1)]
                if lhs.startswith("#") and ExpressionAttributeNames:
                    attr = ExpressionAttributeNames[lhs]
                else:
                    attr = lhs.replace("#", "")

                if rhs.startswith(":") and ExpressionAttributeValues:
                    item[attr] = ExpressionAttributeValues[rhs]
        return {"Attributes": item}


class FakeSES:
    def __init__(self):
        self.sent = []

    def send_email(self, **kwargs):
        self.sent.append(kwargs)


class FakeEvents:
    def __init__(self):
        self.entries = []

    def put_events(self, *, Entries):
        self.entries.extend(Entries)
        return {"Entries": [{"EventId": "TEST"} for _ in Entries]}


@pytest.fixture(autouse=True)
def _env_defaults(monkeypatch):
    project_root = Path(__file__).resolve().parents[1]
    lambdas_dir = project_root / "lambdas"
    sys.path.insert(0, str(project_root))
    sys.path.insert(0, str(lambdas_dir))
    monkeypatch.setenv("AWS_REGION", "eu-west-1")
    monkeypatch.setenv("REGION", "eu-west-1")
    monkeypatch.setenv("NOTES_TABLE", "gratitude_notes")
    monkeypatch.setenv("SENDER_EMAIL", "sender@example.com")
    monkeypatch.setenv("CLIENT_BASE_URL", "https://example.com")
    monkeypatch.setenv("PUBLIC_BASE_URL", "https://example.com")
    yield


@pytest.fixture()
def app_context(monkeypatch):
    notes = FakeDynamoTable("id")
    notes.items.clear()
    ses = FakeSES()
    events = FakeEvents()

    # Adjust paths for new layout
    project_root = Path(__file__).resolve().parents[1]
    lambdas_dir = project_root / "lambdas"
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))
    if str(lambdas_dir) not in sys.path:
        sys.path.insert(0, str(lambdas_dir))

    # Patch shared/config to return fakes
    from lambdas.shared import config

    monkeypatch.setattr(config, "NOTES_TABLE", "notes", raising=False)

    def fake_notes_table():
        return notes

    def fake_ses_client():
        return ses

    def fake_events_client():
        return events

    monkeypatch.setattr(config, "notes_table", fake_notes_table, raising=False)
    monkeypatch.setattr(config, "ses_client", fake_ses_client, raising=False)
    monkeypatch.setattr(config, "events_client", fake_events_client, raising=False)

    # Patch config values used in handlers
    monkeypatch.setattr(config, "SENDER_EMAIL", "sender@example.com", raising=False)
    monkeypatch.setattr(config, "CLIENT_BASE_URL", "https://example.com", raising=False)
    monkeypatch.setattr(config, "PUBLIC_BASE_URL", "https://example.com", raising=False)
    monkeypatch.setattr(config, "LINKEDIN_URL", "https://linkedin.com/in/yourprofile", raising=False)
    monkeypatch.setattr(config, "GITHUB_URL", "https://github.com/yourusername", raising=False)
    monkeypatch.setattr(config, "CV_URL", "", raising=False)

    # Now import handlers (they'll use the patched functions)
    from lambdas.handlers.api import (
        delete_gratitude_note,
        get_gratitude_note,
        get_today_gratitude_notes,
        post_gratitude_note,
    )
    from lambdas.handlers.events import step_archive_notes, step_prepare_event
    from lambdas.notes import db, service

    # Fake repository helpers bound to the in-memory table
    def fake_put_note(item):
        notes.put_item(Item=item, ConditionExpression="attribute_not_exists(id)")

    def fake_find_note_for_day(email: str, date_str: str):
        return [
            item
            for item in notes.items.values()
            if item.get("email") == email
            and item.get("date") == date_str
            and item.get("status") != "deleted"
        ]

    def fake_get_note(note_id: str):
        return notes.get_item(Key={"id": note_id}).get("Item")

    def fake_list_notes_for_date(date_str: str):
        items = [
            item
            for item in notes.items.values()
            if item.get("date") == date_str and item.get("status") != "deleted"
        ]
        items.sort(key=lambda x: x.get("created_at", 0), reverse=True)
        return items

    def fake_mark_deleted(note_id: str, *, now_iso: str = None):
        item = notes.items.get(note_id)
        if item:
            item["status"] = "deleted"
            item["deleted_at"] = now_iso or datetime.now(timezone.utc).isoformat()

    def fake_update_note_items(note_id: str, note_items, *, now_iso: str = None):
        item = notes.items.get(note_id)
        if item:
            item["note_items"] = note_items
            item["updated_at_iso"] = now_iso or datetime.now(timezone.utc).isoformat()
            item["status"] = "active"

    monkeypatch.setattr(db, "TABLE", notes, raising=False)
    monkeypatch.setattr(db, "put_note", fake_put_note, raising=False)
    monkeypatch.setattr(db, "find_note_for_day", fake_find_note_for_day, raising=False)
    monkeypatch.setattr(db, "get_note", fake_get_note, raising=False)
    monkeypatch.setattr(db, "list_notes_for_date", fake_list_notes_for_date, raising=False)
    monkeypatch.setattr(db, "mark_deleted", fake_mark_deleted, raising=False)
    monkeypatch.setattr(db, "update_note_items", fake_update_note_items, raising=False)

    # Patch module-level tables/clients after import
    monkeypatch.setattr(post_gratitude_note, "find_note_for_day", fake_find_note_for_day, raising=False)
    monkeypatch.setattr(post_gratitude_note, "put_note", fake_put_note, raising=False)
    monkeypatch.setattr(post_gratitude_note, "update_note_items", fake_update_note_items, raising=False)
    monkeypatch.setattr(post_gratitude_note, "EVENTS", events, raising=False)
    monkeypatch.setattr(get_gratitude_note, "get_note", fake_get_note, raising=False)
    monkeypatch.setattr(delete_gratitude_note, "get_note", fake_get_note, raising=False)
    monkeypatch.setattr(delete_gratitude_note, "mark_deleted", fake_mark_deleted, raising=False)
    monkeypatch.setattr(get_today_gratitude_notes, "list_notes_for_date", fake_list_notes_for_date, raising=False)

    # Step handlers
    monkeypatch.setattr(step_prepare_event, "get_note", db.get_note, raising=False)
    monkeypatch.setattr(step_archive_notes, "TABLE", notes, raising=False)

    def table_query(self, IndexName=None, **kwargs):
        if IndexName == "gsi_date":
            from datetime import datetime, timezone
            key_condition = kwargs.get("KeyConditionExpression")
            date_str = kwargs.get("DateEq")
            if key_condition and hasattr(key_condition, "attribute_value"):
                date_str = key_condition.attribute_value
            if not date_str:
                date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            items = [
                item
                for item in self.items.values()
                if item.get("date") == date_str
            ]
            reverse = not kwargs.get("ScanIndexForward", True)
            items.sort(key=lambda x: x.get("created_at", 0), reverse=reverse)
            return {"Items": items}
        elif IndexName == "gsi_email_date":
            key_condition = kwargs.get("KeyConditionExpression")
            email = None
            date_str = None
            if key_condition and hasattr(key_condition, "operands"):
                for operand in key_condition.operands:
                    if hasattr(operand, "attribute_name") and hasattr(operand, "attribute_value"):
                        if operand.attribute_name == "email":
                            email = operand.attribute_value
                        elif operand.attribute_name == "date":
                            date_str = operand.attribute_value
            if not email or not date_str:
                return {"Items": []}
            items = [
                item
                for item in self.items.values()
                if item.get("email") == email
                and item.get("date") == date_str
                and item.get("status") != "deleted"
            ]
            return {"Items": items}
        return {"Items": []}

    monkeypatch.setattr(
        notes,
        "query",
        types.MethodType(table_query, notes),
        raising=False,
    )

    return types.SimpleNamespace(
        notes=notes,
        ses=ses,
        events=events,
    )


def today_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def today_date_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


