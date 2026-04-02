#!/bin/bash
# Phase B: The Great State Migration — REST Genesis Snapshot
# Uses Firestore REST API + gcloud auth to bypass Node/OpenSSL issues.

PROJECT_ID="studio-9105849211-9ba48"
ACCESS_TOKEN=$(gcloud auth print-access-token)

echo "========================================="
echo "🌌 THE GREAT STATE MIGRATION — REST SNAPSHOT"
echo "========================================="

echo "[1/4] Snapshotting Citizens..."
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/citizens?pageSize=100" > scripts/citizens.json
echo "  ✅ Citizens saved to scripts/citizens.json"

echo "[2/4] Snapshotting UVT Ledger..."
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/universal_value_tokens?pageSize=1000" > scripts/uvt.json
echo "  ✅ UVT saved to scripts/uvt.json"

echo "[3/4] Snapshotting Proposals..."
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/proposals?pageSize=100" > scripts/proposals.json
echo "  ✅ Proposals saved to scripts/proposals.json"

echo "[4/4] Snapshotting Votes..."
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/votes?pageSize=1000" > scripts/votes.json
echo "  ✅ Votes saved to scripts/votes.json"

echo "-----------------------------------------"
echo "🎉 REST Snapshots Complete."
echo "📂 Files: scripts/citizens.json, scripts/uvt.json, etc."
echo "========================================="
