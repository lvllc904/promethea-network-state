#!/bin/bash
set -e

echo "Promoting Vanguard Canary..."
echo "Dialing traffic for latest promethea-frontend revision up to 100%..."

gcloud run services update-traffic promethea-frontend \
  --region us-central1 \
  --to-latest

echo "Promotion complete. Latest revision is now serving 100% of traffic."
