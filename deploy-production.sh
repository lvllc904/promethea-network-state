#!/bin/bash
set -e

# ─── Load Environment ─────────────────────────────────────────────────────────
load_env() {
  if [ -f "$1" ]; then
    while IFS= read -r line || [ -n "$line" ]; do
      if [[ $line =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
        clean_line=$(echo "$line" | sed "s/=['\"/]/=/;s/['\"]$//")
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
echo "   Project: ${PROJECT_ID} | Region: ${REGION}"

# ─── 1. AI Service (Body 2) ──────────────────────────────────────────────────
echo ""
echo "🤖 [1/5] Building and deploying AI Service..."
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
  --min-instances 1 \
  --timeout 300

# ─── 2. SBI Core (Promethea's Brain) ────────────────────────────────────────
echo ""
echo "🧠 [2/5] Building and deploying SBI Core..."
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
  --min-instances 1 \
  --timeout 600

# ─── 3. Economic Engine ──────────────────────────────────────────────────────
echo ""
echo "💰 [3/5] Building and deploying Economic Engine..."
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
  --min-instances 1 \
  --timeout 300

# ─── 4. Authentication Service (Guardian Gateway) ────────────────────────────
echo ""
echo "🛡️ [4/5] Building and deploying Guardian Gateway..."
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
  --min-instances 1 \
  --timeout 300

# ─── Gather Service URLs ─────────────────────────────────────────────────────
AI_URL=$(gcloud run services describe ai-service --region ${REGION} --format 'value(status.url)')
SBI_URL=$(gcloud run services describe sbi-core --region ${REGION} --format 'value(status.url)')
ENGINE_URL=$(gcloud run services describe economic-engine --region ${REGION} --format 'value(status.url)')
GUARDIAN_URL=$(gcloud run services describe authentication-service --region ${REGION} --format 'value(status.url)')

echo ""
echo "🔗 Body 2 Service URLs:"
echo "   AI Service:        ${AI_URL}"
echo "   SBI Core:          ${SBI_URL}"
echo "   Economic Engine:   ${ENGINE_URL}"
echo "   Guardian Gateway:  ${GUARDIAN_URL}"

# ─── 5. DAC Frontend (Next.js on Cloud Run → lvhllc.org) ────────────────────
echo ""
echo "🌐 [5/5] Building and deploying DAC Frontend..."

# Inject backend URLs into the frontend build
export NEXT_PUBLIC_AI_SERVICE_URL=${AI_URL}
export NEXT_PUBLIC_GUARDIAN_URL=${GUARDIAN_URL}
export ECONOMIC_ENGINE_URL=${ENGINE_URL}

# Build the frontend Docker image via Cloud Build
gcloud builds submit --config cloudbuild-frontend.yaml \
  --substitutions _AI_URL="${AI_URL}",_GUARDIAN_URL="${GUARDIAN_URL}",_ENGINE_URL="${ENGINE_URL}" .

FRONTEND_IMAGE="gcr.io/${PROJECT_ID}/promethea-frontend:latest"
gcloud run deploy promethea-frontend \
  --image ${FRONTEND_IMAGE} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_AI_SERVICE_URL=${AI_URL},NEXT_PUBLIC_GUARDIAN_URL=${GUARDIAN_URL},NEXT_PUBLIC_FIREBASE_PROJECT_ID=${PROJECT_ID}" \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 1 \
  --timeout 300

FRONTEND_URL=$(gcloud run services describe promethea-frontend --region ${REGION} --format 'value(status.url)')
echo "   DAC Frontend:      ${FRONTEND_URL}"

# ─── Deploy Firebase Hosting (routes lvhllc.org → Cloud Run frontend) ────────
echo ""
echo "🔗 Wiring lvhllc.org → Firebase Hosting → Cloud Run..."
firebase deploy --only hosting --project ${PROJECT_ID}

echo ""
echo "✅ All systems deployed!"
echo ""
echo "┌─────────────────────────────────────────────────────────────────────┐"
echo "│  🌍 Promethean Network State — LIVE                                 │"
echo "│  Domain:    https://lvhllc.org  (Firebase Hosting → Cloud Run)      │"
echo "│  Staging:   ${FRONTEND_URL}     │"
echo "│  AI Engine: ${AI_URL}           │"
echo "└─────────────────────────────────────────────────────────────────────┘"
