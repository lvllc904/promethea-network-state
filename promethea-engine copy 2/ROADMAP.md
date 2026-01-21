# Promethea Development Roadmap: Version 5.0
## Objective
With the successful construction of the autonomous prototype (Phases 0-3), the project's objective now evolves. The new goal is to achieve a full and faithful implementation of the "Blueprint for a Generative Framework" by systematically replacing all placeholder data vectors with real, functioning logic. This will elevate the agent from a powerful proof-of-concept to a truly sophisticated system with a deep, multi-layered perception of market reality, as originally envisioned.

Phase 0: Foundation & Stability (The "Workshop")
Goal: Establish a clean, version-controlled, and reproducible development environment.

Step 1: Project Organization & Version Control.
Status: COMPLETE.

Step 2: The Definitive "Clean Room" Environment Reset.
Status: COMPLETE.

Step 3: The Modern, Conflict-Free Dependency Stack.
Status: COMPLETE.

Phase 1: The Data-First Initiative (The "Bedrock")
Goal: Build the persistent, intelligent data foundation in the database to ensure performance and resilience.

Step 1: Architect the Master Data Layer.
Status: COMPLETE.

Step 2: Build the Database Tables.
Status: COMPLETE.

Step 3: Initial Data Population.
Status: COMPLETE.

Step 4: Refactor Providers for Intelligent Caching.
Status: COMPLETE.

Phase 2: Re-Engage the AI (The "Brain")
Goal: Connect the AI model to the new data foundation and prepare it for live operation.

Step 1: Create the Scaler (The "Translator").
Status: COMPLETE.

Step 2: Train the World Model.
Status: COMPLETE.

Step 3: Integrate the Brain.
Status: COMPLETE.

Phase 3: Unleash the Flywheel (The "Autonomous Engine")
Goal: Evolve the system from a single-asset engine into an asset-agnostic, autonomous agent.

Step 1: Implement the "Scanner" (Asset-Agnostic Logic).
Status: COMPLETE.

Step 2: Implement the Full Agent Logic (MCTS).
Status: COMPLETE.

Step 3: Go Live (Paper Trading).
Status: COMPLETE.

---

## The Path to Full Implementation

---

Phase 4: Achieving Full Perception (The "Enlightenment")
Goal: Systematically replace all placeholder data vectors with real, functioning logic as specified in the blueprint, giving the agent a true, multi-layered perception of the market.

Step 4.1: Implement Full Psychology Vector (P_t^psych).

Description: Replace the placeholder data in `_get_psychology_vector` with real data streams.
* **Sentiment Distribution (`delta_t`):** Enhance `RSSNewsProvider` to return counts of positive, negative, and neutral articles, and normalize this into a distribution vector.
* **Search Trend Velocity (`g_dot_t`):** Create a new `GoogleTrendsProvider` using `pytrends` to fetch interest-over-time data and calculate its acceleration.
* **Put/Call Ratio (`rho_t`):** Create a new `OptionsDataProvider` to fetch the daily Put/Call ratio from an external source (e.g., CBOE).

Status: COMPLETE.

Step 4.2: Implement Full Chaos Vector (K_t^chaos).

Description: Complete the `_get_chaos_vector` by implementing the Correlation Instability metric. This involves fetching data for a basket of key assets, calculating the change in their correlation matrix over time, and computing the Frobenius norm of that change.

Status: COMPLETE.

Phase 5: Achieving Self-Awareness (The "Reflexivity Engine")
Goal: Implement the most novel and complex part of the blueprint, the Reflexivity Vector, to make the agent aware of its own influence and the market's feedback loops.

Step 5.1: Implement Strategy Discourse Metric (D_t).

Description: Create a `DiscourseProvider` to scrape and analyze financial forums or social media for the frequency of specific trading strategy keywords (e.g., "HODL," "gamma squeeze"), and calculate the exponentially-decayed frequency of these terms.

Status: COMPLETE.

Step 5.2: Implement Crowdedness Indicator (C_t_crowd).

Description: Create a `COTProvider` to parse weekly Commitment of Traders (COT) reports from the CFTC, extracting net speculative positioning for relevant futures contracts to serve as a proxy for trade crowdedness.

Status: COMPLETE.

Step 5.3: Implement Model Correlation (rho_M(t)).

Description: Implement the internal calculation of the agent's signal correlation against a benchmark "vanilla" model (e.g., a simple moving average crossover) to measure how unique or common its own signals are.

Status: COMPLETE.

Phase 6: Final Polish & Ultimate Validation
Goal: Finalize the agent's capabilities and subject it to the ultimate test of resilience.

Step 6.1: Implement Stateful Agent (Portfolio Awareness).

Description: Add the agent's current holdings (cash and asset quantity) to the `_get_core_technical_vector`. This makes the agent "aware" of its own position, enabling more sophisticated risk management and position sizing.

Status: COMPLETE.

Step 6.2: Implement the Adversarial Backtest.

Description: A major undertaking to build a second `AdversarialAgent` (e.g., using PPO from `stable-baselines3`) whose objective is to create market conditions that cause the main Generative Agent to lose money. This will be the ultimate test of the system's robustness.

Status: COMPLETE.