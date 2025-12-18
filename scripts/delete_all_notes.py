#!/usr/bin/env python3
"""
Script to delete all gratitude notes from DynamoDB.
Requires AWS credentials configured (via AWS CLI, environment variables, or IAM role).

Usage:
    python3 scripts/delete_all_notes.py
    # Or with explicit table name:
    python3 scripts/delete_all_notes.py --table-name gratitude_notes
"""

import argparse
import boto3
import sys
from datetime import datetime, timezone
from botocore.exceptions import ClientError

def delete_all_notes(table_name: str = "gratitude_notes", region: str = "eu-west-1"):
    """Delete all gratitude notes by marking them as deleted."""
    dynamodb = boto3.resource("dynamodb", region_name=region)
    table = dynamodb.Table(table_name)
    
    print(f"Connecting to DynamoDB table: {table_name} in region: {region}")
    print("")
    
    deleted_count = 0
    error_count = 0
    now_iso = datetime.now(timezone.utc).isoformat()
    
    try:
        # Scan the table to get all items
        print("Scanning table for all notes...")
        response = table.scan()
        items = response.get("Items", [])
        
        # Handle pagination
        while "LastEvaluatedKey" in response:
            response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
            items.extend(response.get("Items", []))
        
        total_items = len(items)
        print(f"Found {total_items} note(s) in table")
        print("")
        
        if total_items == 0:
            print("No notes to delete.")
            return
        
        # Delete each note
        for item in items:
            note_id = item.get("id", "unknown")
            status = item.get("status", "active")
            
            # Skip already deleted items
            if status == "deleted":
                print(f"  ⊘ {note_id} - Already deleted (skipped)")
                continue
            
            try:
                table.update_item(
                    Key={"id": note_id},
                    UpdateExpression="SET #s = :deleted, deleted_at = :now",
                    ExpressionAttributeNames={"#s": "status"},
                    ExpressionAttributeValues={":deleted": "deleted", ":now": now_iso},
                )
                print(f"  ✓ {note_id} - Deleted")
                deleted_count += 1
            except ClientError as e:
                error_code = e.response.get("Error", {}).get("Code", "Unknown")
                print(f"  ✗ {note_id} - Error: {error_code}")
                error_count += 1
        
        print("")
        print("==========================================")
        print("Summary:")
        print(f"  Total notes found: {total_items}")
        print(f"  Successfully deleted: {deleted_count}")
        print(f"  Already deleted: {total_items - deleted_count - error_count}")
        print(f"  Errors: {error_count}")
        print("==========================================")
        
    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code", "Unknown")
        error_message = e.response.get("Error", {}).get("Message", "Unknown error")
        print(f"Error accessing DynamoDB: {error_code} - {error_message}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Delete all gratitude notes from DynamoDB")
    parser.add_argument(
        "--table-name",
        default="gratitude_notes",
        help="DynamoDB table name (default: gratitude_notes)"
    )
    parser.add_argument(
        "--region",
        default="eu-west-1",
        help="AWS region (default: eu-west-1)"
    )
    parser.add_argument(
        "--confirm",
        action="store_true",
        help="Skip confirmation prompt"
    )
    
    args = parser.parse_args()
    
    if not args.confirm:
        print("⚠️  WARNING: This will delete ALL gratitude notes in the table!")
        print(f"   Table: {args.table_name}")
        print(f"   Region: {args.region}")
        print("")
        response = input("Are you sure you want to continue? (yes/no): ")
        if response.lower() not in ["yes", "y"]:
            print("Cancelled.")
            sys.exit(0)
        print("")
    
    delete_all_notes(args.table_name, args.region)















