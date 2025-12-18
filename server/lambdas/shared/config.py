"""
Centralized configuration for the new backend layout.

This is the single source of truth for:
- environment variables
- AWS clients/table getters

We intentionally keep this strict/simple for the portfolio project.
"""

from __future__ import annotations

import os
from functools import lru_cache

import boto3

# --- environment ---

REGION: str = os.environ.get("REGION") or os.environ.get("AWS_REGION", "eu-west-1")

# DynamoDB
NOTES_TABLE: str = os.environ.get("NOTES_TABLE", "gratitude_notes")

# Email / URLs
SENDER_EMAIL: str = os.environ.get("SENDER_EMAIL", "")
CLIENT_BASE_URL: str = os.environ.get("CLIENT_BASE_URL", "")
PUBLIC_BASE_URL: str = os.environ.get("PUBLIC_BASE_URL", "https://example.com")

# EventBridge
EVENT_BUS_NAME: str = os.environ.get("EVENT_BUS_NAME", "default")

# Networking links
LINKEDIN_URL: str = os.environ.get("LINKEDIN_URL", "https://linkedin.com/in/yourprofile")
GITHUB_URL: str = os.environ.get("GITHUB_URL", "https://github.com/yourusername")
CV_URL: str = os.environ.get("CV_URL", "")

# Archival (nightly deletion) timezone. Use an IANA tz name, e.g. "Europe/London".
ARCHIVE_TIMEZONE: str = os.environ.get("ARCHIVE_TIMEZONE", "UTC")


# --- AWS clients/resources ---

@lru_cache(maxsize=1)
def dynamodb_resource():
    return boto3.resource("dynamodb", region_name=REGION)


@lru_cache(maxsize=1)
def ses_client():
    return boto3.client("ses", region_name=REGION)


@lru_cache(maxsize=1)
def events_client():
    return boto3.client("events", region_name=REGION)


def notes_table():
    return dynamodb_resource().Table(NOTES_TABLE)


