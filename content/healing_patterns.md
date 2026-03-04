# 🩺 Promethean Substrate - Healing Patterns

This document defines the autonomous repair protocols for the Network State's digital infrastructure. These patterns are consumed by the **Immune System** to perform self-instructional recovery.

## 1. The Hydration Guard Pattern
- **Symptom**: Client-side exception on initial mount due to SSR mismatch.
- **Pattern**: Gate dynamic rendering with `useEffect` and `mounted` state.
- **Logic**: Ensure `window` or device-specific APIs aren't called during the server pass.

## 2. The Middleware Sanctuary Pattern
- **Symptom**: 403 Forbidden for legitimate background data fetches.
- **Pattern**: Explicitly bypass security heuristics for internal `_rsc` parameters and static assets.
- **Logic**: Maintain bot-blocking while ensuring "sanctuary" for trusted system traffic.

## 3. The Atomic Reversion Pattern (Phase 2.1)
- **Symptom**: Sustained 5xx error rate > 5% after deployment.
- **Pattern**: Immediate rollback to the previous stable revision.
- **Logic**: Preserve system uptime over experimental features.

## 4. The Specialist Reset Pattern
- **Symptom**: AI agents entering recursive loops or state drift.
- **Pattern**: Forced state-zero on task handover.
- **Logic**: Each specialist must start with a clean conversational slate to prevent cumulative hallucination.
