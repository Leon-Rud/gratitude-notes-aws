import re
from typing import Any, Optional, Tuple

from botocore.exceptions import ClientError

from .consts import ID_PATTERN, MAX_ID_LENGTH, MIN_ID_LENGTH


class CustomerIdAlreadyExistsError(Exception):
    """Raised when attempting to insert a customer ID that already exists."""


def put_customer_id_record(table, customer_id: str) -> None:
    """Store the customer ID in DynamoDB with a conditional create."""
    try:
        table.put_item(
            Item={"id": customer_id},
            ConditionExpression="attribute_not_exists(id)",
        )
    except ClientError as err:
        error_code = err.response["Error"].get("Code", "Unknown")
        if error_code == "ConditionalCheckFailedException":
            raise CustomerIdAlreadyExistsError(customer_id) from err
        raise


def sanitize_customer_id(
    raw_value: Any,
    *,
    missing_message: str = "Field 'id' must be a string.",
    length_message: str = "Field 'id' must be 3 to 100 characters after trimming.",
) -> Tuple[Optional[str], Optional[str]]:
    """Validate and normalize the provided customer ID string."""
    if not isinstance(raw_value, str):
        return None, missing_message

    trimmed = raw_value.strip()
    if len(trimmed) < MIN_ID_LENGTH or len(trimmed) > MAX_ID_LENGTH:
        return None, length_message

    if not re.fullmatch(ID_PATTERN, trimmed):
        return None, "Customer ID may only contain letters, numbers, hyphen, or underscore."
        
    return trimmed, None
