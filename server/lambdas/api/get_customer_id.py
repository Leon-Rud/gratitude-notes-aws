import json

from botocore.exceptions import ClientError

from common import CUSTOMER_IDS_TABLE, extract_path_customer_id, json_response, logger

TABLE = CUSTOMER_IDS_TABLE


def handler(event, _context):
    """Serve GET /customer-ids/{id} and return existence information."""
    customer_id, error = extract_path_customer_id(event)
    if error:
        return json_response(400, {"message": error})
    logger.info(json.dumps({"action": "get_customer_id", "customer_id": customer_id}))

    try:
        result = TABLE.get_item(Key={"id": customer_id})
    except ClientError:
        logger.exception("Failed to read item.")
        return json_response(500, {"message": "Internal server error."})

    item = result.get("Item")
    if not item:
        logger.info(json.dumps({"action": "get_customer_id_result", "customer_id": customer_id, "exists": False}))
        return json_response(404, {"exists": False, "id": customer_id})

    logger.info(json.dumps({"action": "get_customer_id_result", "customer_id": customer_id, "exists": True}))
    return json_response(200, {"exists": True, "id": item["id"]})
