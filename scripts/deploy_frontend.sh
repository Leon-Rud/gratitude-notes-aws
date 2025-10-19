#!/usr/bin/env bash
set -euo pipefail

pushd client
npm ci || npm install
npm run build
popd

BUCKET="customer-id-frontend" 
DIST_ID="EETTBUVQTK0KF"

aws s3 sync client/dist/ "s3://${BUCKET}/" --delete
aws cloudfront create-invalidation --distribution-id "${DIST_ID}" --paths "/*"
