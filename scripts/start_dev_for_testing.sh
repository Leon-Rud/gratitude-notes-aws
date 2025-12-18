#!/usr/bin/env bash
set -euo pipefail

# Quick script to start dev server for UI/UX testing
# Makes it easy to share with designers/testers

echo "🚀 Starting Daily Gratitude Notes for Testing"
echo ""

# Check if API URL is set
if [ -z "${VITE_API_BASE_URL:-}" ]; then
  echo "⚠️  VITE_API_BASE_URL not set. Checking for backend deployment..."
  
  # Try to get it from CloudFormation
  STACK_NAME="${STACK_NAME:-daily-gratitude}"
  AWS_REGION="${AWS_REGION:-eu-west-1}"
  
  API_BASE_URL=$(aws cloudformation describe-stacks \
    --region "${AWS_REGION}" \
    --stack-name "${STACK_NAME}" \
    --query "Stacks[0].Outputs[?OutputKey=='GratitudeApiBaseUrl'].OutputValue | [0]" \
    --output text 2>/dev/null || echo "")
  
  if [ -n "${API_BASE_URL}" ] && [ "${API_BASE_URL}" != "None" ]; then
    export VITE_API_BASE_URL="${API_BASE_URL}"
    echo "✅ Found API URL: ${VITE_API_BASE_URL}"
  else
    echo "❌ Could not find API URL automatically."
    echo ""
    echo "Please set it manually:"
    echo "  export VITE_API_BASE_URL=\"https://xxxxx.execute-api.eu-west-1.amazonaws.com/prod\""
    echo ""
    echo "Or deploy the backend first:"
    echo "  ./scripts/deploy_backend.sh"
    exit 1
  fi
fi

cd client

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

echo ""
echo "🌐 Starting dev server..."
echo ""
echo "📱 To share with others on your network:"
echo "   - Look for the 'Network' URL in the output below"
echo "   - Share that URL (both devices must be on same WiFi)"
echo ""
echo "🌍 To share from anywhere, use ngrok:"
echo "   - Install: brew install ngrok"
echo "   - Run: ngrok http 5173"
echo "   - Share the ngrok URL"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start with --host to allow network access
npm run dev -- --host















