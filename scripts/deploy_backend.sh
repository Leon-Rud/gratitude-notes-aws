#!/usr/bin/env bash
set -euo pipefail

# Opinionated one-command backend deploy for SAM stack
# - Region: eu-west-1
# - Stack name: daily-gratitude (override with STACK_NAME env)
# - First run: guided; subsequent runs: non-interactive using samconfig.toml
# - Prints API base URL and API key as VITE_* exports for the frontend build

TEMPLATE_PATH="server/infra/template.yaml"
STACK_NAME="${STACK_NAME:-daily-gratitude}"
AWS_REGION="${AWS_REGION:-eu-west-1}"

echo "Validating SAM template (${TEMPLATE_PATH})..."
sam validate -t "${TEMPLATE_PATH}"

echo "Building SAM application..."
sam build -t "${TEMPLATE_PATH}"

# If samconfig.toml absent or user forces guided, run guided deploy to create config
GUIDED_FLAG=""
if [ ! -f server/infra/samconfig.toml ] && [ ! -f samconfig.toml ]; then
  GUIDED_FLAG="--guided"
fi

echo "Deploying stack '${STACK_NAME}' to region '${AWS_REGION}'..."
sam deploy -t "${TEMPLATE_PATH}" \
  --stack-name "${STACK_NAME}" \
  --region "${AWS_REGION}" \
  ${GUIDED_FLAG}

echo "Capturing CloudFormation outputs..."

# Helper to query a single Output by OutputKey from the stack
cf_output() {
  local key="$1"
  aws cloudformation describe-stacks \
    --region "${AWS_REGION}" \
    --stack-name "${STACK_NAME}" \
    --query "Stacks[0].Outputs[?OutputKey=='${key}'].OutputValue | [0]" \
    --output text 2>/dev/null || true
}

# Try multiple conventional keys for API base URL and API key
API_BASE_URL="$(cf_output GratitudeApiBaseUrl)"
if [ -z "${API_BASE_URL}" ] || [ "${API_BASE_URL}" = "None" ]; then
  API_BASE_URL="$(cf_output GoalsApiBaseUrl)"
fi
if [ -z "${API_BASE_URL}" ] || [ "${API_BASE_URL}" = "None" ]; then
  API_BASE_URL="$(cf_output ApiBaseUrl)"
fi
if [ -z "${API_BASE_URL}" ] || [ "${API_BASE_URL}" = "None" ]; then
  API_BASE_URL="$(cf_output GoalsApiUrl)"
fi

if [ -z "${API_BASE_URL}" ] || [ "${API_BASE_URL}" = "None" ]; then
  echo "Warning: Could not determine API base URL from stack outputs." >&2
  echo "Make sure the template exports it as an Output (e.g., GratitudeApiBaseUrl)." >&2
else
  echo "Detected API base URL: ${API_BASE_URL}"
fi

echo
echo "Frontend environment exports (copy/paste):"
if [ -n "${API_BASE_URL:-}" ] && [ "${API_BASE_URL}" != "None" ]; then
  echo "export VITE_API_BASE_URL=\"${API_BASE_URL%/}\""
else
  echo "export VITE_API_BASE_URL=\"<https://xxxxxxx.execute-api.${AWS_REGION}.amazonaws.com/prod>\""
fi
echo "# Gratitude notes API does not require an API key"
echo "unset VITE_API_KEY"

echo
echo "Tip: You can also run 'scripts/capture_outputs.sh ${STACK_NAME}' to generate client/.env.production."
