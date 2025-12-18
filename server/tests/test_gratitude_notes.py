import json
import sys
from pathlib import Path

# Ensure lambda packages are importable in tests
ROOT = Path(__file__).resolve().parents[1]
LAMBDA_DIR = ROOT / "lambdas"
for path in (str(ROOT), str(LAMBDA_DIR)):
    if path not in sys.path:
        sys.path.insert(0, path)

from lambdas.handlers.api import (
    delete_gratitude_note,
    get_gratitude_note,
    get_today_gratitude_notes,
    post_gratitude_note,
)
from lambdas.handlers.events import step_archive_notes


def _create_note(name="Test User", email="test@example.com", gratitude="line one\nline two"):
    return {
        "body": json.dumps(
            {
                "name": name,
                "email": email,
                "gratitudeText": gratitude,
            }
        )
    }


def test_create_note_and_fetch_details(app_context):
    response = post_gratitude_note.handler(_create_note(), None)
    assert response["statusCode"] == 201
    payload = json.loads(response["body"])
    note_id = payload["id"]

    note_record = app_context.notes.items[note_id]
    assert note_record["name"] == "Test User"
    assert note_record["note_items"] == ["line one", "line two"]

    detail_resp = get_gratitude_note.handler({"pathParameters": {"id": note_id}}, None)
    assert detail_resp["statusCode"] == 200
    detail = json.loads(detail_resp["body"])
    assert detail["note_items"] == ["line one", "line two"]
    assert any(
        entry["DetailType"] == "gratitude.note.created" and json.loads(entry["Detail"])["noteId"] == note_id
        for entry in app_context.events.entries
    )


def test_duplicate_same_day_replaces_existing_note(app_context):
    first = post_gratitude_note.handler(_create_note(gratitude="first"), None)
    assert first["statusCode"] == 201
    first_payload = json.loads(first["body"])
    note_id = first_payload["id"]

    second = post_gratitude_note.handler(_create_note(gratitude="second"), None)
    assert second["statusCode"] == 200
    second_payload = json.loads(second["body"])
    assert second_payload["id"] == note_id

    note_record = app_context.notes.items[note_id]
    assert note_record["note_items"] == ["second"]

    # Should emit the created event (for future features like streak tracking)
    assert any(
        entry["DetailType"] == "gratitude.note.created" and json.loads(entry["Detail"])["noteId"] == note_id
        for entry in app_context.events.entries
    )


def test_delete_then_create_same_day_creates_new_note(app_context):
    create_resp = post_gratitude_note.handler(_create_note(gratitude="first"), None)
    assert create_resp["statusCode"] == 201
    payload = json.loads(create_resp["body"])
    note_id = payload["id"]
    token = app_context.notes.items[note_id]["owner_token"]

    delete_resp = delete_gratitude_note.handler(
        {
            "pathParameters": {"id": note_id},
            "queryStringParameters": {"token": token},
        },
        None,
    )
    assert delete_resp["statusCode"] == 200

    create_again = post_gratitude_note.handler(_create_note(gratitude="second"), None)
    assert create_again["statusCode"] == 201
    payload2 = json.loads(create_again["body"])
    assert payload2["id"] != note_id


def test_public_feed_lists_notes(app_context):
    resp1 = post_gratitude_note.handler(_create_note(name="Alice", email="alice@example.com"), None)
    assert resp1["statusCode"] == 201
    resp2 = post_gratitude_note.handler(_create_note(name="Bob", email="bob@example.com", gratitude="only note"), None)
    assert resp2["statusCode"] == 201

    feed_resp = get_today_gratitude_notes.handler({"queryStringParameters": {}}, None)
    assert feed_resp["statusCode"] == 200
    feed = json.loads(feed_resp["body"])
    names = [item["name"] for item in feed["items"]]
    assert set(names) == {"Alice", "Bob"}


def test_delete_note_marks_status_deleted(app_context):
    create_resp = post_gratitude_note.handler(_create_note(), None)
    payload = json.loads(create_resp["body"])
    note_id = payload["id"]
    token = app_context.notes.items[note_id]["owner_token"]

    delete_resp = delete_gratitude_note.handler(
        {
            "pathParameters": {"id": note_id},
            "queryStringParameters": {"token": token},
        },
        None,
    )
    assert delete_resp["statusCode"] == 200
    assert app_context.notes.items[note_id]["status"] == "deleted"

    fetch_resp = get_gratitude_note.handler({"pathParameters": {"id": note_id}}, None)
    assert fetch_resp["statusCode"] == 404


def test_archive_notes_marks_status_deleted(app_context):
    create_resp = post_gratitude_note.handler(_create_note(), None)
    note_id = json.loads(create_resp["body"])["id"]

    archive_result = step_archive_notes.handler({"eventType": "archive.nightly"}, None)
    assert archive_result["archived"] >= 1
    assert app_context.notes.items[note_id]["status"] == "deleted"

