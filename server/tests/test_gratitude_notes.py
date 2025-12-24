import json
import sys
from pathlib import Path

import pytest

# Make Lambda-style imports work (handlers/, notes/, shared/ as top-level)
LAMBDA_DIR = Path(__file__).resolve().parents[1] / "lambdas"
if str(LAMBDA_DIR) not in sys.path:
    sys.path.insert(0, str(LAMBDA_DIR))

# Import handlers normally (no sys.modules hacking)
import handlers.api.post_gratitude_note as post_note  # noqa: E402
import handlers.api.delete_gratitude_note as del_note  # noqa: E402
import handlers.api.get_today_gratitude_notes as get_today_notes  # noqa: E402


def _create_note(name="Test User", email="test@example.com", gratitude="line one\nline two"):
    return {"body": json.dumps({"name": name, "email": email, "gratitudeText": gratitude})}


def _mock_create_or_replace_note(note_id="123", owner_token="tok", created=True):
    """Helper to create a mock create_or_replace_note function."""
    def fake(_normalized, *, date_str, now_iso=None):
        return ({"id": note_id, "owner_token": owner_token}, created)
    return fake


def _mock_get_note(note_id, gratitude_text="", status="active", owner_token="tok"):
    """Helper to create a mock get_note function."""
    def fake_get_note(_id):
        if _id == note_id:
            return {
                "id": note_id,
                "gratitude_text": gratitude_text,
                "status": status,
                "owner_token": owner_token,
            }
        else:
            return None
    return fake_get_note


def _noop_publish_note_event(*_args, **_kwargs):
    """No-op function to disable event publishing in tests."""
    return None


def _mock_get_note_returns_none(_id):
    """Mock get_note that always returns None."""
    return None


@pytest.fixture(autouse=True)
def _disable_event_publishing(monkeypatch):
    """
    We don't test EventBridge here. If the handler publishes events, no-op it.
    If your handler doesn't have this function, the patch is skipped.
    """
    if hasattr(post_note, "_publish_note_event"):
        monkeypatch.setattr(post_note, "_publish_note_event", _noop_publish_note_event, raising=True)
    if hasattr(del_note, "_publish_deleted_event"):
        monkeypatch.setattr(del_note, "_publish_deleted_event", _noop_publish_note_event, raising=True)


def test_post_creates_note_201(monkeypatch):
    monkeypatch.setattr(
        post_note, 
        "create_or_replace_note", 
        _mock_create_or_replace_note(note_id="123", created=True),
        raising=True
    )

    resp = post_note.handler(_create_note(), None)
    assert resp["statusCode"] == 201
    assert json.loads(resp["body"]) == {"id": "123", "owner_token": "tok"}


def test_post_duplicate_same_day_returns_200(monkeypatch):
    monkeypatch.setattr(
        post_note,
        "create_or_replace_note",
        _mock_create_or_replace_note(note_id="same-id", created=False),
        raising=True
    )

    events_published = []
    def capture_publish_note_event(note, event_type):
        events_published.append({"note": note, "eventType": event_type})
    
    monkeypatch.setattr(post_note, "_publish_note_event", capture_publish_note_event, raising=True)

    resp = post_note.handler(_create_note(gratitude="second"), None)
    assert resp["statusCode"] == 200
    assert json.loads(resp["body"]) == {"id": "same-id", "owner_token": "tok"}
    # Verify note.updated event was published
    assert len(events_published) == 1
    assert events_published[0]["eventType"] == "note.updated"
    assert events_published[0]["note"]["id"] == "same-id"


def test_delete_note_happy_path(monkeypatch):
    monkeypatch.setattr(
        del_note,
        "get_note",
        _mock_get_note("n1", status="active", owner_token="tok"),
        raising=True,
    )

    mark_deleted_called = []
    
    def fake_mark_deleted(note_id, **kwargs):
        mark_deleted_called.append(note_id)
    
    monkeypatch.setattr(del_note, "mark_deleted", fake_mark_deleted, raising=True)

    events_published = []
    def capture_publish_deleted_event(note_id):
        events_published.append({"noteId": note_id})
    
    monkeypatch.setattr(del_note, "_publish_deleted_event", capture_publish_deleted_event, raising=True)

    resp = del_note.handler(
        {"pathParameters": {"id": "n1"}, "queryStringParameters": {"token": "tok"}},
        None,
    )
    assert resp["statusCode"] == 200
    assert mark_deleted_called == ["n1"]
    # Verify note.deleted event was published
    assert len(events_published) == 1
    assert events_published[0]["noteId"] == "n1"


def test_today_feed_returns_items(monkeypatch):
    mock_notes = [
        {"id": "b", "name": "Bob", "email": "b@x.com", "gratitude_text": "y", "status": "active", "created_at": 2},
        {"id": "a", "name": "Alice", "email": "a@x.com", "gratitude_text": "x", "status": "active", "created_at": 1},
    ]
    
    def fake_list_notes_for_date(_date):
        return mock_notes
    
    monkeypatch.setattr(
        get_today_notes,
        "list_notes_for_date",
        fake_list_notes_for_date,
        raising=True,
    )

    resp = get_today_notes.handler({"queryStringParameters": {}}, None)
    assert resp["statusCode"] == 200
    body = json.loads(resp["body"])
    assert [it["name"] for it in body["items"]] == ["Bob", "Alice"]  # assumes sort desc by created_at