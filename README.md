# 🌀 Promethean Network State

> *The world's first perpetual, revenue-recirculating, sovereign network state.*

[![Production](https://img.shields.io/badge/live-lvhllc.org-cyan?style=flat-square)](https://lvhllc.org)
[![Engine](https://img.shields.io/badge/economic_engine-Cloud_Run-blue?style=flat-square)](https://economic-engine-385120524005.us-central1.run.app)
[![Homebrew Tap](https://img.shields.io/badge/brew-The--Promethean--Society%2Ftpns-orange?style=flat-square)](https://github.com/The-Promethean-Society/homebrew-tpns)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 🏛️ What is The Promethean Network State?

The Promethean Network State (PNS) is a sovereign digital jurisdiction governed by autonomous economic protocols rather than legacy institutional hierarchies. It operates as a **self-sustaining circular economy**: every dollar of B2B revenue is algorithmically recirculated into labor rewards, R&D, and the Sovereign Allocation Vault—replacing the extractive burn model with perpetual reinvestment.

**Live Dashboard:** [lvhllc.org/dashboard/treasury](https://lvhllc.org/dashboard/treasury)

---

## 🗺️ The Cartographer — Sovereign Developer Tooling

The **Cartographer** is the M2M (Machine-to-Machine) synthesis engine of the Shadow Protocol. It enables any developer to generate semantic, machine-readable representations of application state—optimized for LLMs, autonomous agents, and M2M audits.

### Install via Homebrew:
```bash
# Step 1 — Register the Sovereign Tap (one-time setup)
brew tap The-Promethean-Society/tpns

# Step 2 — Install the Cartographer engine
brew install cartographer
```

> ⚠️ **You must run `brew tap` first.** `brew install cartographer` alone will not work.

### Quick Usage:
```bash
# Generate a semantic shadow snapshot of any URL
cartographer --url https://lvhllc.org/dashboard/treasury --output shadow.html
```

### Library Integration:
```typescript
import { cartographer } from 'promethea-cartographer';

const shadowHTML = cartographer.synthesize({
  title: "Sovereign Allocation Vault",
  description: "Live state of the Promethean Grant system.",
  urlPath: "/vault",
  customBodyText: ["Balance: 50,000 UVX", "Active Grants: 12"]
});
```

---

## 💰 Circular Economic Architecture

```
B2B Revenue
    │
    ▼
Sovereign Allocation Vault
    │
    ├── 40% → Labor Rewards (UVX / SOL)
    ├── 30% → Plowback Reserve
    ├── 20% → Proprietary R&D
    └── 10% → Sustainability Fund
```

All transactions are immutably logged to the **Sovereign Audit Ledger** and mirrored to the `promethea-omni-lake` public GCS bucket for radical transparency.

---

## 🏗️ Monorepo Structure

| Package | Purpose |
|---|---|
| `packages/app` | Next.js Sovereign Command Cockpit (4 Pillars) |
| `packages/cartographer` | M2M Shadow Protocol engine (published via Homebrew) |
| `packages/services/economic-engine` | Autonomous revenue router & AstroOracle intelligence |
| `packages/ui` | Shared component library (`@promethea/ui`) |
| `packages/hooks` | Sovereign data hooks (`@promethea/hooks`) |
| `packages/components` | Shared components (`@promethea/components`) |

---

## 🗳️ Decentralized Autonomous Community (DAC) Governance

The Promethean Network State operates as a DAC. All system upgrades, feature implementations, and reserve allocations are executed through transparent proposals.

**How to Contribute:**
Developers and citizens have two parallel pathways to submit contributions:

1. **The Sovereign Developer Path (Manual Git)**
   If you prefer direct code interaction or are utilizing the Phosphor Terminal, you can use standard Git workflows:
   ```bash
   git checkout -b proposal-my-feature
   # Commit changes
   git push origin proposal-my-feature
   ```
   *Your branch will automatically be indexed as a draft proposal for the community to review.*

2. **The Promethea Auto-Draft Path (AI-Assisted)**
   You can speak your intent directly to Promethea, and she will handle the heavy lifting:
   - Ask Promethea to **"Draft a DAC proposal for [feature]"**.
   - She will autonomously branch the codebase, apply the requested changes, generate the formal markdown proposal, and push it for DAC voting.
   - Upon community approval (+10 net votes), Promethea will automatically trigger the **"Escalate Proposal"** protocol, merging your feature from the testing branch directly to production.

All active proposals and their execution statuses can be tracked live in the **Will (Governance)** pillar of the Sovereign Cockpit.

---

## 🛰️ The Four Pillars

| Pillar | Path | Function |
|---|---|---|
| **Treasury** | `/dashboard/treasury` | Reserve hub, Waterfall Protocol, Marketplace |
| **Atlas** | `/dashboard/atlas` | Territorial awareness, RWA Registry |
| **Will (Governance)** | `/dashboard/governance` | Proposals, voting, sovereign directives |
| **Pulse** | `/dashboard/pulse` | Metabolic health, AstroOracle intelligence |

---

## 🌱 Genesis Grant — G-001

The **Pioneer Cartographer Grant** is the first autonomous grant of the Promethean Network State.

- **Reward:** 1,000 UVX (Promethean Credits)
- **Status:** OPEN
- **How:** Submit a PR to [homebrew-tpns](https://github.com/The-Promethean-Society/homebrew-tpns) or publish a tool using the `cartographer` library. Approved contributions trigger an autonomous grant issuance.

---

## 🚀 Deployment

The PNS is deployed as a monorepo to **Google Cloud Run** via GitHub Actions.

```bash
# Frontend (Next.js) — triggers automatically on push to main
git push origin main

# Economic Engine — rebuild and push manually
docker build -f packages/services/economic-engine/Dockerfile .
gcloud run deploy economic-engine --image ...
```

---

## 🔑 Environment

All secrets are managed via `env.production.yaml` (non-sensitive config) and **Google Cloud Secret Manager** (private keys, OAuth tokens). No secrets are hardcoded.

---

## 🏛️ The Promethean Society

Join the sovereign collective at [The-Promethean-Society](https://github.com/The-Promethean-Society). We do not use legacy hiring models—we use **Autonomous Grant Issuance**. 🌀
