#!/usr/bin/env bash

# Capture CloudFormation stack outputs and export helper variables for local testing.
# Usage: source scripts/capture_outputs.sh [stack-name]

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

STACK_NAME=${1:-customer-id-api-dev}

echo "Fetching outputs for stack: ${STACK_NAME}"

BASE_URL=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiBaseUrl'].OutputValue | [0]" \
  --output text 2>/dev/null || true)

API_KEY=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiKeyForTesting'].OutputValue | [0]" \
  --output text 2>/dev/null || true)

if [[ -z "${BASE_URL}" || "${BASE_URL}" == "None" ]]; then
  abort "Could not find ApiBaseUrl output. Has the stack finished deploying?"
fi

if [[ -z "${API_KEY}" || "${API_KEY}" == "None" ]]; then
  abort "Could not find ApiKeyForTesting output. Has the stack finished deploying?"
fi

export ApiBaseUrl="${BASE_URL}"
export ApiKeyForTesting="${API_KEY}"

echo "Exported ApiBaseUrl=${ApiBaseUrl}"
echo "Exported ApiKeyForTesting=${ApiKeyForTesting}"

if [[ ${IS_SOURCED} -eq 0 ]]; then
  echo
  echo "Tip: run 'source ${SCRIPT_NAME} ${STACK_NAME}' to export the variables into your current shell session."
fi

finish 0
