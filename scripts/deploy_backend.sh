#!/usr/bin/env bash
set -euo pipefail

sam validate -t server/infra/template.yaml
sam build -t server/infra/template.yaml
sam deploy --guided -t server/infra/template.yaml
