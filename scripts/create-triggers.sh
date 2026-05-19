#!/bin/bash
# ─── PNS Cloud Build Trigger Instantiator ─────────────────────────────────────
# This script instantiates the 5 targeted 2nd-generation Cloud Build triggers
# in your GCP project to support automated, directory-specific monorepos.
#
# Prerequisite: You must have connected your GitHub repo in GCP Cloud Build.
# ─────────────────────────────────────────────────────────────────────────────

set -e

PROJECT_ID="studio-9105849211-9ba48"
REGION="us-central1"

echo "🛡️ PNS Cloud Build Trigger Instantiator"
echo "========================================"

# Prompt for Connection Name
read -p "Enter your GCP Cloud Build GitHub Connection Name [default: promethea-github-connection]: " CONNECTION_NAME
CONNECTION_NAME=${CONNECTION_NAME:-promethea-github-connection}

# Prompt for Linked Repository Name in GCP
read -p "Enter your Linked Repository Name in GCP [default: lvllc904-promethea-network-state]: " REPO_NAME
REPO_NAME=${REPO_NAME:-lvllc904-promethea-network-state}

REPO_PATH="projects/${PROJECT_ID}/locations/${REGION}/connections/${CONNECTION_NAME}/repositories/${REPO_NAME}"

echo ""
echo "🚀 Creating 2nd-Gen Cloud Build Triggers for:"
echo "   Repository: ${REPO_PATH}"
echo "========================================"

# 1. Frontend Trigger
echo "🌐 Creating Frontend Trigger..."
gcloud builds triggers create github \
  --name="promethea-frontend-trigger" \
  --region="${REGION}" \
  --repository="${REPO_PATH}" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild-frontend.yaml" \
  --included-files="packages/app/**,scripts/purge-cache.js,cloudbuild-frontend.yaml" \
  --description="Rebuilds and deploys Next.js frontend to Cloud Run and purges Cloudflare CDN edge on push to main."

# 2. AI Service Trigger
echo "🤖 Creating AI Service Trigger..."
gcloud builds triggers create github \
  --name="ai-service-trigger" \
  --region="${REGION}" \
  --repository="${REPO_PATH}" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild-ai.yaml" \
  --included-files="packages/services/ai-service/**,cloudbuild-ai.yaml" \
  --description="Rebuilds and deploys AI Service to Cloud Run on push to main."

# 3. Economic Engine Trigger
echo "💰 Creating Economic Engine Trigger..."
gcloud builds triggers create github \
  --name="economic-engine-trigger" \
  --region="${REGION}" \
  --repository="${REPO_PATH}" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild-engine.yaml" \
  --included-files="packages/services/economic-engine/**,cloudbuild-engine.yaml" \
  --description="Rebuilds and deploys Economic Engine to Cloud Run on push to main."

# 4. SBI Core Trigger
echo "🧠 Creating SBI Core Trigger..."
gcloud builds triggers create github \
  --name="sbi-core-trigger" \
  --region="${REGION}" \
  --repository="${REPO_PATH}" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild-sbi.yaml" \
  --included-files="packages/sbi-core/**,cloudbuild-sbi.yaml" \
  --description="Rebuilds and deploys SBI Core to Cloud Run on push to main."

# 5. Authentication Service Trigger
echo "🛡️ Creating Authentication Service Trigger..."
gcloud builds triggers create github \
  --name="authentication-service-trigger" \
  --region="${REGION}" \
  --repository="${REPO_PATH}" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild-auth.yaml" \
  --included-files="packages/services/authentication-service/**,cloudbuild-auth.yaml" \
  --description="Rebuilds and deploys Authentication Service (Guardian) to Cloud Run on push to main."

echo ""
echo "✅ All triggers created successfully!"
echo "You can view them at: https://console.cloud.google.com/cloud-build/triggers?project=${PROJECT_ID}"
