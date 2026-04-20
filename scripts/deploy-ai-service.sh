#!/bin/zsh
set -e

# Source Google Cloud SDK
if [ -f '/Users/officeone/Downloads/google-cloud-sdk/path.zsh.inc' ]; then . '/Users/officeone/Downloads/google-cloud-sdk/path.zsh.inc'; fi

PROJECT_ID="studio-9105849211-9ba48"
REGION="us-central1"

echo "🧠 Initiating AI Service Actualization..."
echo "   Revision: ESM Extension Protocol v5.3.3"

# 1. Trigger the targeted AI Build
gcloud builds submit --config cloudbuild-ai.yaml \
  --substitutions _CACHE_BUSTER=$(date +%s) .

# 2. Re-deploy the image to Cloud Run
gcloud run deploy ai-service \
  --image gcr.io/${PROJECT_ID}/ai-service:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --min-instances 0 \
  --timeout 300

echo "✅ AI Service Success. Intelligence Hub is now ESM-compliant."
