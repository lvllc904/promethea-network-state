#!/bin/zsh
set -e

# Load local environment variables from .env if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
elif [ -f ../.env ]; then
  export $(grep -v '^#' ../.env | xargs)
fi

# Source Google Cloud SDK
if [ -f '/Users/officeone/Downloads/google-cloud-sdk/path.zsh.inc' ]; then . '/Users/officeone/Downloads/google-cloud-sdk/path.zsh.inc'; fi

PROJECT_ID="studio-9105849211-9ba48"
REGION="us-central1"

echo "🧠 Initiating AI Service Actualization..."
echo "   Revision: ESM Extension Protocol v5.3.3"

# 1. Trigger the targeted AI Build
gcloud builds submit --config cloudbuild-ai.yaml \
  --machine-type=e2-highcpu-32 .

# 2. Re-deploy the image to Cloud Run
gcloud run deploy ai-service \
  --image gcr.io/${PROJECT_ID}/ai-service:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=${GEMINI_API_KEY},GOOGLE_CLOUD_PROJECT=${PROJECT_ID},OPENROUTER_API_KEY=${OPENROUTER_API_KEY}" \
  --memory 2Gi \
  --cpu 1 \
  --min-instances 0 \
  --timeout 300

echo "✅ AI Service Success. Intelligence Hub is now ESM-compliant."
