import json
import os
import sys
import unittest
from pathlib import Path
from typing import Any, Dict
from unittest.mock import MagicMock

from botocore.exceptions import ClientError

PROJECT_ROOT = Path(__file__).resolve().parents[1]
os.environ.setdefault("CUSTOMER_IDS_TABLE", "customer_ids_test")

sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "lambdas"))

from lambdas import (
    delete_customer_id,
    get_customer_id,
    put_customer_id,
    step_insert_customer_id,
    step_log_customer_event,
    step_validate_customer_id,
)
from common import HEADERS, sanitize_customer_id


class FakeTable:
    def __init__(self):
        self.items: Dict[str, Dict[str, Any]] = {}

    def put_item(self, Item, ConditionExpression=None):
        item_id = Item["id"]
        if item_id in self.items:
            raise ClientError(
                {"Error": {"Code": "ConditionalCheckFailedException", "Message": "Already exists"}},
                "PutItem",
            )
        self.items[item_id] = Item

    def get_item(self, Key):
        item_id = Key["id"]
        item = self.items.get(item_id)
        return {"Item": item} if item else {}

    def delete_item(self, Key, ConditionExpression=None):
        item_id = Key["id"]
        if item_id not in self.items:
            raise ClientError(
                {"Error": {"Code": "ConditionalCheckFailedException", "Message": "Missing"}},
                "DeleteItem",
            )
        del self.items[item_id]


class HandlerTests(unittest.TestCase):
    def setUp(self):
        self.table = FakeTable()
        self._original_tables = {
            put_customer_id: getattr(put_customer_id, "TABLE", None),
            get_customer_id: getattr(get_customer_id, "TABLE", None),
            delete_customer_id: getattr(delete_customer_id, "TABLE", None),
            step_validate_customer_id: getattr(step_validate_customer_id, "TABLE", None),
            step_insert_customer_id: getattr(step_insert_customer_id, "TABLE", None),
        }
        put_customer_id.TABLE = self.table
        get_customer_id.TABLE = self.table
        delete_customer_id.TABLE = self.table
        step_validate_customer_id.TABLE = self.table
        step_insert_customer_id.TABLE = self.table

        self.events_mock = MagicMock()
        self._original_events = getattr(put_customer_id, "EVENTS", None)
        put_customer_id.EVENTS = self.events_mock

    def tearDown(self):
        for module, original_table in self._original_tables.items():
            if original_table is not None:
                module.TABLE = original_table
        if self._original_events is not None:
            put_customer_id.EVENTS = self._original_events

    def _assert_cors_headers(self, response):
        self.assertEqual(response["headers"], HEADERS)

    @staticmethod
    def _make_client_error(code: str, operation: str) -> ClientError:
        return ClientError({"Error": {"Code": code, "Message": code}}, operation)

    def test_put_customer_id_success(self):
        event = {"body": json.dumps({"id": "TEST123"})}
        response = put_customer_id.handler(event, None)
        self.assertEqual(response["statusCode"], 201)
        self.assertIn("TEST123", self.table.items)
        self._assert_cors_headers(response)
        self.events_mock.put_events.assert_called_once()
        entries = self.events_mock.put_events.call_args.kwargs["Entries"]
        self.assertEqual(len(entries), 1)
        detail = json.loads(entries[0]["Detail"])
        self.assertEqual(detail, {"id": "TEST123", "stored": True})

    def test_put_customer_id_duplicate(self):
        self.table.items["TEST123"] = {"id": "TEST123"}
        event = {"body": json.dumps({"id": "TEST123"})}
        response = put_customer_id.handler(event, None)
        self.assertEqual(response["statusCode"], 409)
        self._assert_cors_headers(response)
        self.events_mock.put_events.assert_called_once()
        detail = json.loads(self.events_mock.put_events.call_args.kwargs["Entries"][0]["Detail"])
        self.assertEqual(detail, {"id": "TEST123", "stored": False})

    def test_put_customer_id_invalid_payload(self):
        event = {"body": json.dumps({"id": "ab"})}
        response = put_customer_id.handler(event, None)
        self.assertEqual(response["statusCode"], 400)
        self._assert_cors_headers(response)
        self.events_mock.put_events.assert_not_called()

    def test_put_customer_id_invalid_characters(self):
        event = {"body": json.dumps({"id": "BAD!*"})}
        response = put_customer_id.handler(event, None)
        self.assertEqual(response["statusCode"], 400)
        self._assert_cors_headers(response)
        self.events_mock.put_events.assert_not_called()

    def test_put_customer_id_missing_body(self):
        event = {"body": None}
        response = put_customer_id.handler(event, None)
        self.assertEqual(response["statusCode"], 400)
        self._assert_cors_headers(response)
        self.events_mock.put_events.assert_not_called()

    def test_put_customer_id_invalid_json(self):
        event = {"body": "{not json"}
        response = put_customer_id.handler(event, None)
        self.assertEqual(response["statusCode"], 400)
        self._assert_cors_headers(response)
        self.events_mock.put_events.assert_not_called()

    def test_get_customer_id_found(self):
        self.table.items["TEST123"] = {"id": "TEST123"}
        event = {"pathParameters": {"id": "TEST123"}}
        response = get_customer_id.handler(event, None)
        self.assertEqual(response["statusCode"], 200)
        self.assertIn('"exists": true', response["body"])
        self._assert_cors_headers(response)

    def test_get_customer_id_not_found(self):
        event = {"pathParameters": {"id": "CUST-999"}}
        response = get_customer_id.handler(event, None)
        self.assertEqual(response["statusCode"], 404)
        self._assert_cors_headers(response)

    def test_get_customer_id_invalid_param(self):
        event = {"pathParameters": {"id": "ab"}}
        response = get_customer_id.handler(event, None)
        self.assertEqual(response["statusCode"], 400)
        self._assert_cors_headers(response)

    def test_get_customer_id_missing_path_parameters(self):
        event = {}
        response = get_customer_id.handler(event, None)
        self.assertEqual(response["statusCode"], 400)
        self._assert_cors_headers(response)

    def test_delete_customer_id_success(self):
        self.table.items["TEST123"] = {"id": "TEST123"}
        event = {"pathParameters": {"id": "TEST123"}}
        response = delete_customer_id.handler(event, None)
        self.assertEqual(response["statusCode"], 200)
        self.assertNotIn("TEST123", self.table.items)
        self._assert_cors_headers(response)

    def test_delete_customer_id_missing(self):
        event = {"pathParameters": {"id": "CUST-999"}}
        response = delete_customer_id.handler(event, None)
        self.assertEqual(response["statusCode"], 404)
        self._assert_cors_headers(response)

    def test_delete_customer_id_invalid_param(self):
        event = {"pathParameters": {"id": "  "}}
        response = delete_customer_id.handler(event, None)
        self.assertEqual(response["statusCode"], 400)
        self._assert_cors_headers(response)

    def test_delete_customer_id_missing_path_parameters(self):
        event = {}
        response = delete_customer_id.handler(event, None)
        self.assertEqual(response["statusCode"], 400)
        self._assert_cors_headers(response)

    def test_put_customer_id_unexpected_dynamodb_error(self):
        def failing_put(*args, **kwargs):
            raise self._make_client_error("ProvisionedThroughputExceededException", "PutItem")

        original_put = self.table.put_item
        self.table.put_item = failing_put
        try:
            event = {"body": json.dumps({"id": "FAIL500"})}
            response = put_customer_id.handler(event, None)
        finally:
            self.table.put_item = original_put

        self.assertEqual(response["statusCode"], 500)
        self._assert_cors_headers(response)
        self.events_mock.put_events.assert_not_called()

    def test_get_customer_id_unexpected_dynamodb_error(self):
        def failing_get(*args, **kwargs):
            raise self._make_client_error("InternalServerError", "GetItem")

        original_get = self.table.get_item
        self.table.get_item = failing_get
        try:
            event = {"pathParameters": {"id": "FAIL"}}
            response = get_customer_id.handler(event, None)
        finally:
            self.table.get_item = original_get

        self.assertEqual(response["statusCode"], 500)
        self._assert_cors_headers(response)

    def test_delete_customer_id_unexpected_dynamodb_error(self):
        def failing_delete(*args, **kwargs):
            raise self._make_client_error("InternalServerError", "DeleteItem")

        original_delete = self.table.delete_item
        self.table.delete_item = failing_delete
        try:
            event = {"pathParameters": {"id": "FAIL"}}
            response = delete_customer_id.handler(event, None)
        finally:
            self.table.delete_item = original_delete

        self.assertEqual(response["statusCode"], 500)
        self._assert_cors_headers(response)

    def test_step_validate_customer_id_exists(self):
        self.table.items["TEST123"] = {"id": "TEST123"}
        result = step_validate_customer_id.handler({"id": "TEST123"}, None)
        self.assertTrue(result["valid"])
        self.assertTrue(result["exists"])
        self.assertEqual(result["id"], "TEST123")
        self.assertEqual(set(result.keys()), {"id", "valid", "exists"})

    def test_step_validate_customer_id_not_exists(self):
        result = step_validate_customer_id.handler({"id": "NEWID"}, None)
        self.assertTrue(result["valid"])
        self.assertFalse(result["exists"])
        self.assertEqual(result["id"], "NEWID")
        self.assertEqual(set(result.keys()), {"id", "valid", "exists"})

    def test_step_validate_customer_id_invalid(self):
        result = step_validate_customer_id.handler({}, None)
        self.assertFalse(result["valid"])
        self.assertIn("reason", result)
        self.assertNotIn("id", result)

    def test_step_validate_customer_id_invalid_characters(self):
        result = step_validate_customer_id.handler({"id": "BAD!*"}, None)
        self.assertFalse(result["valid"])
        self.assertIn("letters, numbers", result["reason"])

    def test_step_insert_customer_id_success(self):
        result = step_insert_customer_id.handler({"id": "STEP123"}, None)
        self.assertTrue(result["inserted"])
        self.assertIn("STEP123", self.table.items)

    def test_step_insert_customer_id_conflict_raises(self):
        self.table.items["STEP999"] = {"id": "STEP999"}
        with self.assertRaises(ValueError):
            step_insert_customer_id.handler({"id": "STEP999"}, None)

    def test_step_log_customer_event(self):
        result = step_log_customer_event.handler({"id": "LOGID", "exists": True}, None)
        self.assertTrue(result["logged"])
        self.assertEqual(result["id"], "LOGID")
        self.assertEqual(result["exists"], True)


class SanitizeCustomerIdTests(unittest.TestCase):
    def test_min_length_valid(self):
        value, error = sanitize_customer_id("abc")
        self.assertEqual(value, "abc")
        self.assertIsNone(error)

    def test_max_length_valid(self):
        sample = "A" * 100
        value, error = sanitize_customer_id(sample)
        self.assertEqual(value, sample)
        self.assertIsNone(error)

    def test_length_too_short(self):
        value, error = sanitize_customer_id("ab")
        self.assertIsNone(value)
        self.assertIn("3 to 100", error)

    def test_length_too_long(self):
        sample = "A" * 101
        value, error = sanitize_customer_id(sample)
        self.assertIsNone(value)
        self.assertIn("3 to 100", error)

    def test_trims_whitespace(self):
        value, error = sanitize_customer_id("  TEST_123  ")
        self.assertEqual(value, "TEST_123")
        self.assertIsNone(error)

    def test_allows_hyphen_and_underscore(self):
        value, error = sanitize_customer_id("ID-OK_123")
        self.assertEqual(value, "ID-OK_123")
        self.assertIsNone(error)

    def test_rejects_invalid_characters(self):
        value, error = sanitize_customer_id("BAD!*")
        self.assertIsNone(value)
        self.assertIn("letters, numbers", error)

if __name__ == "__main__":
    unittest.main()
