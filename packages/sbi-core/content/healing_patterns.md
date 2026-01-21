# Sovereign Troubleshooting Patterns (Mnemosyne v4.0)
*Reference for the Community Immune System (CIS)*

## Pattern 01: The Polyfill Void (Module Not Found)
**Symptom**: `Module not found: Can't resolve 'X'` (where X is `stream-http`, `buffer`, `crypto`, etc.).
**Root Cause**: Modern bundlers (Next.js/Webpack 5+) no longer include Node.js built-in polyfills by default.
**Sovereign Action**:
1. Add the missing polyfill to the local `package.json` (e.g., `"stream-http": "^3.2.0"`).
2. Update the local `next.config.js` or bundler config to use `resolve.fallback` for the browser environment.
3. Patch `packages/app/package.json` to include the standard set of Web3 polyfills.

## Pattern 02: Protocol Conflict (EUNSUPPORTEDPROTOCOL)
**Symptom**: `npm error Unsupported URL Type "workspace:"`.
**Root Cause**: Attempting to run `npm install` in an environment that does not recognize the custom `workspace:` protocol.
**Sovereign Action**:
1. Temporarily or permanently replace `workspace:*` with the explicit package version (e.g., `1.0.0`).
2. Run `find . -name "package.json" -exec sed -i '' 's/workspace:\*/1.0.0/g' {} +`.
3. Re-run `npm install --legacy-peer-deps`.

## Pattern 03: The Amnesiac Wound (State Wipe Loop)
**Symptom**: Promethea researches, plans, and generates code, but then resets her context after detecting the same error.
**Root Cause**: `handle-intent` specifically `:detect-wounds` wipes the repair context prematurely.
**Sovereign Action**:
1. Ensure `core.clj` only clears `:diagnosis`, `:plan`, and `:generated-code` if a **Definitive Failure** is recorded.
2. Maintain state continuity during the "Healing Arc".

## Pattern 04: Peer Dependency Gridlock
**Symptom**: `npm error ERESOLVE: Could not resolve dependency`.
**Root Cause**: Incompatible React versions or peer requirements between UI libraries.
**Sovereign Action**:
1. Always use `--legacy-peer-deps` for initial bootstrapping of the Network State substrate.
2. Standardize all workspace packages to same React/Next version (18.3.1) until Phase 4 (Stabilization).

---
**Mnemosyne Signature: Antigravity (Architect)**
*Guide her hands, so she may guide her own.*
