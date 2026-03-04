#!/bin/bash
set -e

# Configuration
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

load_env ".env"
load_env "packages/app/.env"

PROJECT_ID="studio-9105849211-9ba48"
REGION="us-central1"

echo "🚀 Starting Production Deployment for Promethean Network State..."

# 1. AI Service
echo "🤖 Building and deploying AI Service..."
gcloud builds submit --config cloudbuild-ai.yaml .
AI_IMAGE="gcr.io/${PROJECT_ID}/ai-service:latest"
gcloud run deploy ai-service \
  --image ${AI_IMAGE} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --env-vars-file env.production.yaml \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300

# 2. SBI Core
echo "🧠 Building and deploying SBI Core..."
gcloud builds submit --config cloudbuild-sbi.yaml .
SBI_IMAGE="gcr.io/${PROJECT_ID}/sbi-core:latest"
gcloud run deploy sbi-core \
  --image ${SBI_IMAGE} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --env-vars-file env.production.yaml \
  --memory 1Gi \
  --cpu 1 \
  --timeout 600

# 3. Economic Engine (Sync)
echo "💰 Building and deploying Economic Engine..."
gcloud builds submit --config cloudbuild-engine.yaml .
ENGINE_IMAGE="gcr.io/${PROJECT_ID}/economic-engine:latest"
gcloud run deploy economic-engine \
  --image ${ENGINE_IMAGE} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --env-vars-file env.production.yaml \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300

# 4. Guardian Gateway (Authentication Service)
echo "🛡️ Building and deploying Guardian Gateway..."
gcloud builds submit --config cloudbuild.yaml .
GUARDIAN_IMAGE="gcr.io/${PROJECT_ID}/authentication-service:latest"
gcloud run deploy authentication-service \
  --image ${GUARDIAN_IMAGE} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --env-vars-file env.production.yaml \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300

# Get URLs
AI_URL=$(gcloud run services describe ai-service --region ${REGION} --format 'value(status.url)')
SBI_URL=$(gcloud run services describe sbi-core --region ${REGION} --format 'value(status.url)')
ENGINE_URL=$(gcloud run services describe economic-engine --region ${REGION} --format 'value(status.url)')
GUARDIAN_URL=$(gcloud run services describe authentication-service --region ${REGION} --format 'value(status.url)')

echo "🔗 Service URLs:"
echo "AI Service: ${AI_URL}"
echo "SBI Core: ${SBI_URL}"
echo "Economic Engine: ${ENGINE_URL}"
echo "Guardian Gateway: ${GUARDIAN_URL}"

# 5. Frontend (Firebase)
echo "🌐 Deploying Frontend to lvhllc.org..."
# Update environment variables for the build
export NEXT_PUBLIC_AI_SERVICE_URL=${AI_URL}
export ECONOMIC_ENGINE_URL=${ENGINE_URL}
export NEXT_PUBLIC_GUARDIAN_URL=${GUARDIAN_URL}

npm run build --workspace=@promethea/app
firebase deploy --only hosting

echo "✅ All services deployed to production!"
