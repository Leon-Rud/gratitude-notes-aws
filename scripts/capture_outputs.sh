#!/usr/bin/env bash

# Capture CloudFormation stack outputs and export helper variables for local testing
# and optionally generate client/.env.production with VITE_* variables.
# Usage: source scripts/capture_outputs.sh [stack-name] [region]

SCRIPT_NAME=${BASH_SOURCE[0]:-${0}}
IS_SOURCED=0
if [[ "${BASH_SOURCE[0]-}" != "${0}" ]]; then
  IS_SOURCED=1
fi

finish() {
  local exit_code=${1:-0}
  if [[ ${IS_SOURCED} -eq 1 ]]; then
    return "${exit_code}"
  else
    exit "${exit_code}"
  fi
}

abort() {
  echo "$1" >&2
  finish 1
}

STACK_NAME=${1:-daily-gratitude}
AWS_REGION=${2:-eu-west-1}

echo "Fetching outputs for stack: ${STACK_NAME} (region ${AWS_REGION})"

BASE_URL=$(aws cloudformation describe-stacks \
  --region "${AWS_REGION}" \
  --stack-name "${STACK_NAME}" \
  --query "Stacks[0].Outputs[?OutputKey=='GratitudeApiBaseUrl' || OutputKey=='GoalsApiBaseUrl' || OutputKey=='ApiBaseUrl'].OutputValue | [0]" \
  --output text 2>/dev/null || true)

if [[ -z "${BASE_URL}" || "${BASE_URL}" == "None" ]]; then
  abort "Could not find GratitudeApiBaseUrl output. Has the stack finished deploying?"
fi

export ApiBaseUrl="${BASE_URL}"

echo "Exported ApiBaseUrl=${ApiBaseUrl}"

echo "The gratitude notes API is public; no API key is required."

# Create client/.env.production for Vite (overwrites)
ENV_FILE="client/.env.production"
{
  echo "VITE_API_BASE_URL=${ApiBaseUrl%/}"
  echo "# VITE_API_KEY is intentionally unset"
} > "${ENV_FILE}"
echo "Wrote ${ENV_FILE} with VITE_* variables"

if [[ ${IS_SOURCED} -eq 0 ]]; then
  echo
  echo "Tip: run 'source ${SCRIPT_NAME} ${STACK_NAME}' to export the variables into your current shell session."
fi

finish 0
