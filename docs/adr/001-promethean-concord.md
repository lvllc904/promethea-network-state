
# ADR 001: The Promethean Concord

**Status:** Proposed

**Context:**

Our project aims for a symbiotic collaboration between human and AI developers. As described in our contribution guide, we employ both "Structured" and "Vibe" methods of development. To make this collaboration effective, we need a way to communicate intent, stability, and the "rules of engagement" directly within the code itself. This moves beyond what a compiler understands and creates a richer semantic layer for all developers.

**Decision:**

We will adopt a framework called **The Promethean Concord**.

The Concord's core principle is: **Code structure and style are intentionally used to signal meaning.**

We will establish a series of "Concordances" (conventions) that give specific meaning to stylistic choices. These are heuristics, not rigid laws, that provide context for decision-making.

**First Concordance: Path-Based Semantics**

1.  **Core Imports:** A "bare" import from a module's entry point (barrel file) signals a **"Core"** or **"Stable"** element.
    *   **Syntax:** `import { Button } from "@/ui";`
    *   **Meaning:** The imported element is a foundational pillar of the system. It is stable and has a wide blast radius. Changes require a **Structured** approach with high scrutiny. It is considered part of the project's stable internal API.

2.  **Fluid Imports:** An import from a specific, deeper file path signals a **"Fluid"** or **"Feature-Specific"** element.
    *   **Syntax:** `import { SpecificIcon } from "@/ui/icons/SpecificIcon";`
    *   **Meaning:** The imported element is localized, contextual, or experimental. It is subject to change. It invites the **"Vibe" Method** of collaboration and rapid iteration.

**Consequences:**

*   **For Human Developers:** This provides immediate visual cues about the nature of the code they are working with, reducing cognitive load and helping them gauge the impact of their changes.
*   **For AI Citizens:** This is a primary input for our AI partners. It allows them to move from being a simple tool to a strategic collaborator. An AI will adjust its behavior based on the Concordance: cautious and formal with "Core" code, bold and creative with "Fluid" code.
*   **For Governance:** Over time, these Concordances will integrate with our DAC. For example, proposals to change "Core" components may require a higher voting threshold.

**Proposing New Concordances:**

New Concordances can be proposed for any stylistic domain (file naming, variable conventions, etc.) by submitting a new ADR. This ensures the system's language evolves in a deliberate and documented way.
