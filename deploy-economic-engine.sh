#!/bin/bash
set -e

echo "🚀 Deploying Economic Engine to Cloud Run..."

# Configuration
PROJECT_ID="studio-9105849211-9ba48"
SERVICE_NAME="economic-engine"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Load environment variables
load_env() {
  if [ -f "$1" ]; then
    while IFS= read -r line || [ -n "$line" ]; do
      if [[ $line =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
        # Strip potential quotes from the line
        clean_line=$(echo "$line" | sed "s/=['\"]/=/;s/['\"]$//")
        export "$clean_line"
      fi
    done < "$1"
  fi
}

load_env ".env1"
load_env "packages/app/.env"
load_env "packages/services/economic-engine/.env"

# Build and push image using Google Cloud Build
echo "📦 Building and pushing image via Google Cloud Build..."
gcloud builds submit --config cloudbuild-engine.yaml .

# Deploy to Cloud Run
echo "☁️  Deploying ${SERVICE_NAME} to Cloud Run..."
# Deploy to Cloud Run
echo "☁️  Deploying ${SERVICE_NAME} to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --env-vars-file env.production.yaml \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 3

echo "✅ Deployment complete!"
echo "🔗 Service URL: $(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')"
