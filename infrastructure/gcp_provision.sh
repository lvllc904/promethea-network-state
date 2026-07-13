#!/bin/bash
set -e

# ==============================================================================
# TPNS "Citadel" Outpost Provisioning Script (Phase 5)
# This script provisions a Google Cloud Compute Engine instance and configures
# it as a secure remote development environment for TPNS.
# ==============================================================================

echo "🔥 Initializing Promethean GCP Outpost Provisioning 🔥"

# 1. Check for gcloud
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI could not be found. Please install Google Cloud SDK."
    exit 1
fi

# 2. Authenticate if necessary
if ! gcloud auth print-access-token &> /dev/null; then
    echo "🔑 You are not authenticated with GCP. Triggering login..."
    gcloud auth login
fi

# 3. Set Project
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
read -p "Enter your GCP Project ID [$CURRENT_PROJECT]: " PROJECT_ID
PROJECT_ID=${PROJECT_ID:-$CURRENT_PROJECT}

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: A GCP Project ID is required."
    exit 1
fi

echo "⚙️ Setting project to $PROJECT_ID..."
gcloud config set project "$PROJECT_ID"

# 4. Enable Compute API
echo "🚀 Enabling Compute Engine API..."
gcloud services enable compute.googleapis.com

# 5. Configuration Variables
INSTANCE_NAME="tpns-outpost-01"
ZONE="us-central1-a"
MACHINE_TYPE="e2-standard-2" # 2 vCPU, 8GB RAM - Good for Dev/Docker
IMAGE_FAMILY="ubuntu-2204-lts"
IMAGE_PROJECT="ubuntu-os-cloud"
DISK_SIZE="50GB"

# 6. Create the Compute Instance
echo "🖥️ Provisioning Compute Instance ($INSTANCE_NAME)..."
if gcloud compute instances describe "$INSTANCE_NAME" --zone="$ZONE" &> /dev/null; then
    echo "⚠️ Instance $INSTANCE_NAME already exists. Skipping creation."
else
    gcloud compute instances create "$INSTANCE_NAME" \
        --zone="$ZONE" \
        --machine-type="$MACHINE_TYPE" \
        --image-family="$IMAGE_FAMILY" \
        --image-project="$IMAGE_PROJECT" \
        --boot-disk-size="$DISK_SIZE" \
        --tags="http-server,https-server,tpns-node"
fi

# 7. Create Firewall Rules (Optional, allowing external access if needed for testing)
echo "🛡️ Configuring Firewall..."
if ! gcloud compute firewall-rules describe "tpns-dev-ports" &> /dev/null; then
    gcloud compute firewall-rules create "tpns-dev-ports" \
        --allow tcp:3000,tcp:8080 \
        --target-tags="tpns-node" \
        --description="Allow TPNS Dev Ports"
else
    echo "⚠️ Firewall rule tpns-dev-ports already exists."
fi

# 8. Wait for SSH to be ready
echo "⏳ Waiting for SSH to be available..."
sleep 15

# 9. Configure Remote Instance (Install Docker)
echo "🐳 Installing Docker on $INSTANCE_NAME..."
gcloud compute ssh "$INSTANCE_NAME" --zone="$ZONE" --command="
    if ! command -v docker &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y ca-certificates curl gnupg
        sudo install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        sudo chmod a+r /etc/apt/keyrings/docker.gpg
        echo \"deb [arch=\$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \$(lsb_release -cs) stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        sudo usermod -aG docker \$USER
        echo '✅ Docker installed successfully.'
    else
        echo '✅ Docker is already installed.'
    fi
"

# 10. Transfer Docker Compose Files
echo "📦 Transferring infrastructure configuration to Outpost..."
gcloud compute scp ./infrastructure/docker-compose.yml "$INSTANCE_NAME":~/docker-compose.yml --zone="$ZONE"

echo "======================================================="
echo "🎉 PROMETHEAN OUTPOST PROVISIONED SUCCESSFULLY 🎉"
echo "======================================================="
echo ""
echo "To connect to your remote workspace, run:"
echo "gcloud compute ssh $INSTANCE_NAME --zone=$ZONE"
echo ""
echo "To start the infrastructure, SSH in and run:"
echo "docker compose up -d"
echo ""
echo "For VS Code:"
echo "1. Install the 'Remote - SSH' extension."
echo "2. Edit your local ~/.ssh/config to add the GCP instance IP."
echo "======================================================="
