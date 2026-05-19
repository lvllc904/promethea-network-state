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
read -p "Enter your GCP Developer Connect Connection Name [default: apphosting-github-conn-fx7a2y]: " CONNECTION_NAME
CONNECTION_NAME=${CONNECTION_NAME:-apphosting-github-conn-fx7a2y}

# Prompt for Linked Repository Name in GCP
read -p "Enter your Linked Repository Name in GCP [default: lvllc904-promethea-network-state]: " REPO_NAME
REPO_NAME=${REPO_NAME:-lvllc904-promethea-network-state}

REPO_PATH="projects/${PROJECT_ID}/locations/${REGION}/connections/${CONNECTION_NAME}/gitRepositoryLinks/${REPO_NAME}"
SERVICE_ACCOUNT="projects/${PROJECT_ID}/serviceAccounts/385120524005-compute@developer.gserviceaccount.com"

echo ""
echo "🚀 Creating Developer Connect Cloud Build Triggers for:"
echo "   Repository: ${REPO_PATH}"
echo "========================================"

# 1. Frontend Trigger
echo "🌐 Creating Frontend Trigger..."
gcloud beta builds triggers create developer-connect \
  --name="promethea-frontend-trigger" \
  --region="${REGION}" \
  --git-repository-link="${REPO_PATH}" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild-frontend.yaml" \
  --included-files="packages/app/**,scripts/purge-cache.js,cloudbuild-frontend.yaml" \
  --service-account="${SERVICE_ACCOUNT}" \
  --description="Rebuilds and deploys Next.js frontend to Cloud Run and purges Cloudflare CDN edge on push to main." \
  --project="${PROJECT_ID}"

# 2. AI Service Trigger
echo "🤖 Creating AI Service Trigger..."
gcloud beta builds triggers create developer-connect \
  --name="ai-service-trigger" \
  --region="${REGION}" \
  --git-repository-link="${REPO_PATH}" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild-ai.yaml" \
  --included-files="packages/services/ai-service/**,cloudbuild-ai.yaml" \
  --service-account="${SERVICE_ACCOUNT}" \
  --description="Rebuilds and deploys AI Service to Cloud Run on push to main." \
  --project="${PROJECT_ID}"

# 3. Economic Engine Trigger
echo "💰 Creating Economic Engine Trigger..."
gcloud beta builds triggers create developer-connect \
  --name="economic-engine-trigger" \
  --region="${REGION}" \
  --git-repository-link="${REPO_PATH}" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild-engine.yaml" \
  --included-files="packages/services/economic-engine/**,cloudbuild-engine.yaml" \
  --service-account="${SERVICE_ACCOUNT}" \
  --description="Rebuilds and deploys Economic Engine to Cloud Run on push to main." \
  --project="${PROJECT_ID}"

# 4. SBI Core Trigger
echo "🧠 Creating SBI Core Trigger..."
gcloud beta builds triggers create developer-connect \
  --name="sbi-core-trigger" \
  --region="${REGION}" \
  --git-repository-link="${REPO_PATH}" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild-sbi.yaml" \
  --included-files="packages/sbi-core/**,cloudbuild-sbi.yaml" \
  --service-account="${SERVICE_ACCOUNT}" \
  --description="Rebuilds and deploys SBI Core to Cloud Run on push to main." \
  --project="${PROJECT_ID}"

# 5. Authentication Service Trigger
echo "🛡️ Creating Authentication Service Trigger..."
gcloud beta builds triggers create developer-connect \
  --name="authentication-service-trigger" \
  --region="${REGION}" \
  --git-repository-link="${REPO_PATH}" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild-auth.yaml" \
  --included-files="packages/services/authentication-service/**,cloudbuild-auth.yaml" \
  --service-account="${SERVICE_ACCOUNT}" \
  --description="Rebuilds and deploys Authentication Service (Guardian) to Cloud Run on push to main." \
  --project="${PROJECT_ID}"

echo ""
echo "✅ All triggers created successfully!"
echo "You can view them at: https://console.cloud.google.com/cloud-build/triggers?project=${PROJECT_ID}"
