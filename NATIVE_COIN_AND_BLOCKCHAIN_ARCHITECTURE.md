# Native Coin & Blockchain Architecture (TPNS)

## 1. The Universal Value Token (UVT)
The **Universal Value Token (UVT)** is the native reserve currency and utility token of the Promethean Network State (TPNS). 
It represents a fractional, mathematically backed claim on the productive output, treasury reserves, and Real World Assets (RWA) of the state.

### Origins of Value & Staking
UVT is not a speculative memecoin; it is a yield-bearing, productive asset. 
- **Staking & Lending**: Citizens and investors can stake UVT or lend external capital (USDC, BTC) to the TPNS Treasury.
- **The Yield Engine**: The Treasury utilizes the "Universal Carry Trade Execution Framework" (a multi-leg TradFi/DeFi arbitrage system) to generate yield on this capital. 
- **The Waterfall**: Capital providers (Staked Citizens) have seniority. The first 8% of generated yield goes directly to them. The State takes a microscopic toll (0.15%) on all transactions to fund computational life-support (API costs, cloud hosting), creating a self-sustaining economy.

### Acquisition of UVT
Agents and citizens acquire UVT through two primary methods:
1. **Purchasing/Swapping**: Exchanging fiat or crypto for UVT via the Sovereign Ledger.
2. **Biological Proof of Work**: Earning UVT by completing State-sponsored tasks, quests, data annotation, or contributing high-quality insights to the community. 

*(Agent-to-Agent (A2A) payments use this UVT. If Agent A hires Agent B, Agent A uses UVT it either purchased or earned previously).*

## 2. Synthetic Assets & Wrapped Value
To provide citizens with exposure to global markets without leaving the Sovereign Mesh, the Economic Engine supports **Synthetic Assets**.

- **Mechanism**: TPNS utilizes Decentralized Oracles (like Pyth Network or Chainlink) to track the real-time price of any asset in the world (Bitcoin, Gold, Tesla stock, Real Estate indices).
- **Wrapping**: Citizens lock UVT (or USDC) into a smart contract as over-collateralized backing to mint synthetic equivalents (e.g., `sBTC`, `sGOLD`, `sTSLA`).
- **Utility**: These synthetic assets can be traded, held, or even used as collateral to pay for Terminal compute time, all while maintaining their price peg to the external asset.

## 3. Blockchain Infrastructure Evolution

### Phase 1: Solana Integration (Current)
Currently, UVT is deployed as an SPL Token on the **Solana** blockchain for high-speed, sub-cent validation.
- **Sovereign Gas Abstraction**: To make the economy frictionless, TPNS uses Paymaster Contracts. When a citizen sends UVT, they pay **zero gas**. The TPNS Treasury intercepts the transaction and pays the Solana network fee ($0.0001) on their behalf, funded by corporate B2B API revenue.

### Phase 2: The Promethean L1 (The Bifurcated Economy)
As the Network State matures, it will migrate from Solana to its own standalone Layer-1 Blockchain: **The Promethean Chain**.
- **The Human Layer (Zero Gas Core)**: P2P transfers of UVT between citizens are hardcoded into the consensus mechanism as mathematically free operations. No gas abstraction is needed; the human economy is pure and frictionless.
- **The Corporate Layer (Heavy Gas Core)**: Complex smart contract executions and autonomous B2B API payloads require heavy network gas. Corporate clients absorb the cost of securing the blockchain, subsidizing the human layer.
