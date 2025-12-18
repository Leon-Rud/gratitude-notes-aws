#!/usr/bin/env bash
set -euo pipefail

# One-command frontend deploy for Vite SPA
# Requires env: VITE_API_BASE_URL
# Optional env: FRONTEND_BUCKET, AWS_REGION (default eu-west-1), CLOUDFRONT_DISTRIBUTION_ID

AWS_REGION="${AWS_REGION:-eu-west-1}"

if [ -z "${VITE_API_BASE_URL:-}" ]; then
  echo "Error: VITE_API_BASE_URL must be exported before building." >&2
  echo "Example: export VITE_API_BASE_URL=\"https://xxxx.execute-api.${AWS_REGION}.amazonaws.com/prod\"" >&2
  exit 1
fi

echo "Building client with VITE envs..."
pushd client >/dev/null
npm ci || npm install
npm run build
popd >/dev/null

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
DEFAULT_BUCKET="daily-gratitude-frontend-${ACCOUNT_ID}-${AWS_REGION}"
FRONTEND_BUCKET="${FRONTEND_BUCKET:-${DEFAULT_BUCKET}}"

echo "Ensuring S3 bucket exists: ${FRONTEND_BUCKET} (region ${AWS_REGION})"
if ! aws s3api head-bucket --bucket "${FRONTEND_BUCKET}" 2>/dev/null; then
  aws s3api create-bucket \
    --bucket "${FRONTEND_BUCKET}" \
    --region "${AWS_REGION}" \
    $( [ "${AWS_REGION}" != "us-east-1" ] && echo --create-bucket-configuration LocationConstraint="${AWS_REGION}" )
fi

# Enable static website hosting (optional but useful without CloudFront)
aws s3 website "s3://${FRONTEND_BUCKET}" --index-document index.html --error-document index.html || true

# Set a simple public-read policy for website hosting (skip if CloudFront is used with OAC)
if [ -z "${CLOUDFRONT_DISTRIBUTION_ID:-}" ]; then
  POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::${FRONTEND_BUCKET}/*"]
    }
  ]
}
EOF
)
  aws s3api put-bucket-policy --bucket "${FRONTEND_BUCKET}" --policy "${POLICY}"
fi

echo "Syncing build to S3..."
aws s3 sync client/dist/ "s3://${FRONTEND_BUCKET}/" --delete --cache-control max-age=31536000,public
aws s3 cp client/dist/index.html "s3://${FRONTEND_BUCKET}/index.html" --cache-control no-cache,private

PUBLIC_URL=""
if [ -n "${CLOUDFRONT_DISTRIBUTION_ID:-}" ]; then
  echo "Creating CloudFront invalidation..."
  aws cloudfront create-invalidation --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" --paths "/*" >/dev/null
  # Try to resolve distribution domain name
  CF_DOMAIN=$(aws cloudfront get-distribution --id "${CLOUDFRONT_DISTRIBUTION_ID}" --query 'Distribution.DomainName' --output text 2>/dev/null || true)
  PUBLIC_URL="https://${CF_DOMAIN}"
else
  # S3 website endpoint
  PUBLIC_URL="http://${FRONTEND_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com"
fi

echo
echo "Site deployed. Public URL: ${PUBLIC_URL}"
