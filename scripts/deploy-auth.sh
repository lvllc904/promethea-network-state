#!/bin/zsh
set -e

# Source Google Cloud SDK
if [ -f '/Users/officeone/Downloads/google-cloud-sdk/path.zsh.inc' ]; then . '/Users/officeone/Downloads/google-cloud-sdk/path.zsh.inc'; fi

PROJECT_ID="studio-9105849211-9ba48"
REGION="us-central1"

echo "🔐 Initiating Sovereign Auth Actualization..."
echo "   Revision: Zero-Firebase Protocol v1.0.0"

# 1. Trigger the targeted Auth Build
gcloud builds submit --config cloudbuild-auth.yaml \
  --substitutions _CACHE_BUSTER=$(date +%s) .

# 2. Re-deploy the image to Cloud Run
gcloud run deploy authentication-service \
  --image gcr.io/${PROJECT_ID}/authentication-service:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars "JWT_SECRET=promethea-sovereign-intelligence-v5,ALLOWED_ORIGINS=*" \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --timeout 300

echo "✅ Sovereign Auth Success. Authentication is now fully decentralized."
