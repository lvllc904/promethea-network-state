#!/bin/zsh
set -e

# Source Google Cloud SDK
if [ -f '/Users/officeone/Downloads/google-cloud-sdk/path.zsh.inc' ]; then . '/Users/officeone/Downloads/google-cloud-sdk/path.zsh.inc'; fi

# Load local .env variables
ENV_FILE=""
if [ -f .env ]; then
  ENV_FILE=".env"
elif [ -f ../.env ]; then
  ENV_FILE="../.env"
fi

if [ -n "$ENV_FILE" ]; then
  echo "🔌 Sourcing $ENV_FILE file..."
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ ! "$line" =~ ^# ]] && [[ ! -z "${line//[[:space:]]/}" ]]; then
      export "$line"
    fi
  done < "$ENV_FILE"
fi

PROJECT_ID="studio-9105849211-9ba48"
REGION="us-central1"

echo "⚙️ Initiating Economic Engine Actualization..."
echo "   Revision: Atlas Stabilization Protocol v5.3.3"

# 1. Trigger the targeted Engine Build
gcloud builds submit --config cloudbuild-engine.yaml .

# 2. Re-deploy the image to Cloud Run
gcloud run deploy economic-engine \
  --image gcr.io/${PROJECT_ID}/economic-engine:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=${PROJECT_ID},GEMINI_API_KEY=${GEMINI_API_KEY},JWT_SECRET=promethea-sovereign-intelligence-v5,IBKR_API_URL=https://ibkr-gateway-385120524005.us-central1.run.app/v1/api,IBKR_ACCOUNT_ID=lvhllc904,PUBLIC_METABOLIC_BUCKET=promethea-omni-lake-385120524005" \
  --memory 2Gi \
  --cpu 1 \
  --min-instances 0 \
  --timeout 300

echo "✅ Economic Engine Success. Atlas data streams are now hardened."
