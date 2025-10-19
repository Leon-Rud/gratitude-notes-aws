"""Shared runtime constants for Lambda handlers."""

import logging
import os

import boto3

# --- logger ---
logger = logging.getLogger()
if not logger.handlers:
    logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.INFO)



# --- DynamoDB resources ---
DYNAMODB = boto3.resource("dynamodb")
CUSTOMER_IDS_TABLE_NAME = os.environ.get("CUSTOMER_IDS_TABLE", "customer_ids")
CUSTOMER_IDS_TABLE = DYNAMODB.Table(CUSTOMER_IDS_TABLE_NAME)
EVENTS = boto3.client("events")
EVENT_SOURCE = "mission1.customer-ids"
EVENT_DETAIL_TYPE = "customer-id.submitted"

# --- Global consts ---
MIN_ID_LENGTH = 3
MAX_ID_LENGTH = 100
ID_PATTERN = r"^[A-Za-z0-9_-]+$"
