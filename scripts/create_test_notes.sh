#!/usr/bin/env bash
set -euo pipefail

# Script to create 10 test gratitude notes with different emails and varied text sizes
# Usage: ./scripts/create_test_notes.sh

API_BASE_URL="${VITE_API_BASE_URL:-}"
if [ -z "${API_BASE_URL}" ]; then
  echo "Error: VITE_API_BASE_URL must be set" >&2
  echo "Example: export VITE_API_BASE_URL='https://w2ae554d80.execute-api.eu-west-1.amazonaws.com/prod'" >&2
  exit 1
fi

# Remove trailing slash
API_BASE_URL="${API_BASE_URL%/}"

echo "Creating 10 test gratitude notes..."
echo "API URL: ${API_BASE_URL}"
echo ""

# Array of test users with different gratitude text sizes
declare -a USERS=(
  "Alice|alice@example.com|• Morning coffee\n• Sunrise walk\n• Good health"
  "Bob|bob@test.com|• Family time\n• Reading a good book\n• Learning something new\n• Helping a friend\n• Exercise"
  "Charlie|charlie@demo.org|• Waking up healthy\n• Having a job I enjoy\n• Supportive colleagues\n• Weekend plans\n• Home cooked meal\n• Time with pets\n• Beautiful weather"
  "Diana|diana@sample.net|• Gratitude for life\n• Opportunities to grow\n• People who care\n• Moments of peace\n• Technology that connects us\n• Art and music\n• Nature's beauty\n• Second chances"
  "Eve|eve@example.io|• Health\n• Family\n• Friends"
  "Frank|frank@test.org|• Today I'm grateful for the small moments that make life meaningful\n• The way sunlight filters through my window in the morning\n• The sound of rain that helps me sleep\n• A warm cup of tea on a cold day\n• The smile of a stranger\n• The comfort of my favorite sweater\n• The smell of fresh bread\n• The feeling of accomplishment after finishing a task\n• The peace of a quiet evening\n• The joy of discovering something new"
  "Grace|grace@demo.com|• Support system\n• Personal growth\n• New experiences"
  "Henry|henry@sample.io|• Being alive\n• Having food\n• Having shelter\n• Having clothes\n• Access to education\n• Freedom\n• Safety\n• Love\n• Hope\n• Dreams"
  "Ivy|ivy@test.net|• A single moment of clarity that changed my perspective on everything"
  "Jack|jack@example.org|• Health and wellness\n• Meaningful relationships\n• Career opportunities\n• Personal development\n• Creative outlets\n• Travel experiences\n• Learning opportunities\n• Financial stability\n• Emotional support\n• Life lessons"
)

SUCCESS=0
FAILED=0

for user_data in "${USERS[@]}"; do
  IFS='|' read -r name email gratitude_text <<< "$user_data"
  
  echo "Creating note for ${name} (${email})..."
  
  response=$(curl -s -w "\n%{http_code}" -X POST "${API_BASE_URL}/gratitude-notes" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"${name}\",
      \"email\": \"${email}\",
      \"gratitudeText\": \"${gratitude_text}\"
    }")
  
  # Extract HTTP code (last line) and body (everything else)
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -eq 201 ] || [ "$http_code" -eq 409 ]; then
    if [ "$http_code" -eq 201 ]; then
      note_id=$(echo "$body" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
      echo "  ✓ Created note: ${note_id}"
      ((SUCCESS++))
    else
      echo "  ⚠ Note already exists for ${email} today (skipped)"
    fi
  else
    echo "  ✗ Failed (HTTP ${http_code}): ${body}"
    ((FAILED++))
  fi
  echo ""
done

echo "=========================================="
echo "Summary:"
echo "  Successfully created: ${SUCCESS}"
echo "  Already existed: $((10 - SUCCESS - FAILED))"
echo "  Failed: ${FAILED}"
echo "=========================================="















