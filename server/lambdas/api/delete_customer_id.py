import json

from botocore.exceptions import ClientError

from common import CUSTOMER_IDS_TABLE, extract_path_customer_id, json_response, logger

TABLE = CUSTOMER_IDS_TABLE


def handler(event, _context):
    """Serve DELETE /customer-ids/{id} and remove the item if present."""
    customer_id, error = extract_path_customer_id(event)
    if error:
        return json_response(400, {"message": error})
    logger.info(json.dumps({"action": "delete_customer_id", "customer_id": customer_id}))
    
    try:
        TABLE.delete_item(
            Key={"id": customer_id},
            ConditionExpression="attribute_exists(id)",  # Only delete when the ID is present.
        )
    except ClientError as err:
        if err.response["Error"]["Code"] == "ConditionalCheckFailedException":
            logger.info(
                json.dumps({"action": "delete_customer_id_result", "customer_id": customer_id, "deleted": False})
            )
            return json_response(404, {"message": "Customer ID not found.", "id": customer_id})

        logger.exception("Unexpected error while deleting item.")
        return json_response(500, {"message": "Internal server error."})

    logger.info(json.dumps({"action": "delete_customer_id_result", "customer_id": customer_id, "deleted": True}))
    return json_response(200, {"message": "Customer ID deleted.", "id": customer_id})
