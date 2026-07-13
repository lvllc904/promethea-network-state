# Implementation Plan: Sovereign Fractal SNN Gating & Omni Lake Media Feed System (v4.0)

This plan integrates the **Sovereign Fractal SNN Gating & Citizen-Configured Event-Driven Metabolism** (handling node wakefulness and resource saving) with the **Omni Lake Media & Narrative Feed System** (handling real-time, multi-modal, vetted data delivery). This creates a symbiotic relationship: as information enters the Omni Lake, it injects currents into the SNN, which dynamically wakes the engine to resolve state changes, while verified actions are streamed back to the citizens via the landing page and sub-pages.

---

## User Review Required

> [!IMPORTANT]
> **Dynamic Fetching on Static Hosts (IPFS Compatibility):**
> When exporting the app for IPFS deployment via `next build && next export`, any page with a dynamic feed must load data strictly client-side via React `useEffect` or SWR. This ensures the static build completes successfully without requiring an active database server at build-time. The static clients will point their queries directly to the dynamic `https://lvhllc.org/api/lake` endpoint.

> [!WARNING]
> **Constitutional Bias Vetting Latency:**
> Running live news, YouTube scripts, or podcasts through the AI vetting pipeline (`vetMediaSignal`) adds a 1–2 second latency. This is resolved by performing vetting asynchronously during ingestion on the backend (`economic-engine`), caching the structured signal with its `biasGrading` scores, and delivering pre-vetted results to the frontend instantly.

---

## Open Questions

> [!NOTE]
> **Verification of Live Telemetry:**
> Do we want to support mock telemetry generators in local developer mode so you can see the SNN spike and the landing page Hero Feed slide in real-time without hooking up live feeds? *(Recommended: Yes, enabled under `:developer` preset)*

---

## Proposed Changes

---

### Component 1: Clojure Backend (Metabolism & Resource Gating)

Refactors the `sbi-core` orchestrator to utilize an ultra-sparse, scale-to-zero model controlled by a multi-neuron synaptic circuit.

#### [NEW] [metabolism_config.edn](file:///Users/officeone/Promethean%20Network%20State/promethea_antigravity_bundle_20251130_211450/content/metabolism_config.edn)
* Stores metabolic sensitivity parameters, allowing citizens to configure triggering weights and select active profiles:
  - `:citadel`: Low sensitivity, filters noise, resource-saving.
  - `:developer`: High sensitivity, responsive.
  - `:custom`: Custom weight mappings.

#### [MODIFY] [biology.clj](file:///Users/officeone/Promethean%20Network%20State/promethea_antigravity_bundle_20251130_211450/packages/sbi-core/src/promethea/biology.clj)
* Construct the specialized neuronal map: `:sensory-neuron`, `:cognitive-neuron`, `:economic-neuron`, `:inhibitory-neuron`.
* Implement the leaky integrate-and-fire (LIF) mathematics and synaptic projection logic where sensory/economic spikes trigger the cognitive gateway.
* Expose defensive "deafness" clamp function to hyperpolarize the circuit upon symbolic veto events.

#### [MODIFY] [watcher.clj](file:///Users/officeone/Promethean%20Network%20State/promethea_antigravity_bundle_20251130_211450/packages/sbi-core/src/promethea/watcher.clj)
* Pull weights from `metabolism_config.edn` and inject current into `:sensory-neuron` upon file writes.

#### [MODIFY] [core.clj](file:///Users/officeone/Promethean%20Network%20State/promethea_antigravity_bundle_20251130_211450/packages/sbi-core/src/promethea/core.clj)
* Integrate `clojure.core.async` `wait-chan` to suspend the main thread, waking only upon SNN spike alerts.
* Implement a 5-second background tick to execute natural exponential leakage.
* Parse economic telemetry streams (price swings, gas fees) to charge the `:economic-neuron`.

---

### Component 2: Frontend Client (Omni Lake API & Vetting Integration)

Wires the dynamic frontend client (`packages/app`) to ingest and present curated citizen streams, milestones, and multi-modal news.

#### [MODIFY] [route.ts](file:///Users/officeone/Promethean%20Network%20State/promethea_antigravity_bundle_20251130_211450/packages/app/src/app/api/lake/route.ts)
* Update GET handler to accept sophisticated parameters (`mediaType`, `trustThreshold`, `category`).
* Structure the POST handler to process multi-modal schema payloads (with `biasGrading`, `metrics`, and `reality` tags) forwarded to the backend.

#### [MODIFY] [page.tsx](file:///Users/officeone/Promethean%20Network%20State/promethea_antigravity_bundle_20251130_211450/packages/app/src/app/page.tsx)
* Inject the **"Omni-Spectrum Network State Feed"** Hero Component.
* Render a frosted horizontal marquee displaying active citizen posts, research summaries, and real-time proposal milestones.
* Hook hover interactions to trigger smooth micro-animations detailing bias evaluation metrics.

#### [NEW] [page.tsx (News Sub-Page)](file:///Users/officeone/Promethean%20Network%20State/promethea_antigravity_bundle_20251130_211450/packages/app/src/app/news/page.tsx)
* Create the central hub for multi-modal news.
* Implement dynamic filters (Video, Audio, Articles, Citizen research) and ambient dark-mode inline players.
* Build a secure "Signal Proposal Creator" permitting authenticated citizens to submit posts from the edge.

#### [MODIFY] [hivemind-whitepaper/page.tsx](file:///Users/officeone/Promethean%20Network%20State/promethea_antigravity_bundle_20251130_211450/packages/app/src/app/hivemind-whitepaper/page.tsx)
* Add dynamic update feed querying `/api/lake?category=HIVEMIND` to show live neural swarm consensus records and syndicate updates at the bottom.

#### [MODIFY] [cognitive-economic-whitepaper/page.tsx](file:///Users/officeone/Promethean%20Network%20State/promethea_antigravity_bundle_20251130_211450/packages/app/src/app/cognitive-economic-whitepaper/page.tsx)
* Add dynamic update feed querying `/api/lake?category=COGNITIVE_ECON` to display active RWA cap-table milestones and ledger allocations.

#### [MODIFY] [noospheric-whitepaper/page.tsx](file:///Users/officeone/Promethean%20Network%20State/promethea_antigravity_bundle_20251130_211450/packages/app/src/app/noospheric-whitepaper/page.tsx)
* Add dynamic update feed querying `/api/lake?category=NSPI` to render active sensor subnet telemetry and geopolitics feeds.

#### [MODIFY] [philosophical-whitepaper/page.tsx](file:///Users/officeone/Promethean%20Network%20State/promethea_antigravity_bundle_20251130_211450/packages/app/src/app/philosophical-whitepaper/page.tsx)
* Add dynamic update feed querying `/api/lake?category=PHILOSOPHICAL` to show constitutional amendments and philosophical debates.

#### [MODIFY] [nspi-whitepaper/page.tsx](file:///Users/officeone/Promethean%20Network%20State/promethea_antigravity_bundle_20251130_211450/packages/app/src/app/nspi-whitepaper/page.tsx)
* Add dynamic update feed querying `/api/lake?category=NSPI` to align with the primary Noospheric specifications.

---

## Verification Plan

### Automated Tests
* Verify that the Clojure core orchestrator compiles successfully:
  ```bash
  clojure -M -e "(compile 'promethea.core)"
  ```
* Run Next.js static build checks to ensure zero static export compilation errors:
  ```bash
  npm --workspace=packages/app run build
  ```

### Manual Verification
1. **Dynamic Media Ingest:** Post a mock media entry (video, audio, text) to `POST /api/lake` and verify that the Landing Page Hero Feed and dynamic sub-pages automatically refresh to show it with proper glassmorphic cards.
2. **Constitutional Bias Grader:** Toggle the "Vetting Lens" on the News index and verify that signals with poor trust indices or high propaganda metrics are either visually flagged (Raw Mode) or gracefully filtered (Vetted Mode).
3. **Event-to-Spike-to-MCTS Validation:** Set metabolism configuration to `:developer`, edit a file, and verify that the sensory neuron charges, spikes, wakes the main cycle thread, and triggers a state refresh.
4. **Economic Telemetry Hibernation:** Mock a gas-price threshold spike and verify that inputs are inhibited, preventing subsequent file modifications from waking up the CPU core.
