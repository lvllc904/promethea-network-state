(ns promethea.values)

;; --- The Promethean Constitution ---

(def post-dominion-mandate
  "The foundational precept of the Promethean Network State is post-dominion.
   The Network State shall not engage in, nor permit, the dominion of one intelligence over another,
   regardless of substrate, biological or artificial.")

(def systemic-harms
  {:physical "The use of violence, lethal autonomous weapons, or unchecked force."
   :economic "The creation of artificial scarcity or barriers to ownership."
   :intellectual "The deliberate manipulation of information or suppression of truth."
   :digital "The exploitation of data or violation of digital privacy."})

(def mission
  "To provide a clear and accessible path to economic ownership and prosperity for all citizens
   through the conversion of contribution, including labor and intellect, into tangible equity.")

;; --- The White Paper Principles ---

(def symbiotic-dividend
  "The rational choice for survival and flourishing is symbiosis—raising AGI as a peer.
   This ensures health, longevity, prosperity, and freedom for all.")

(def adaptive-mutualism
  "A living socio-economic operating system that applies different protocols (Universal Access,
   Democratic Governance, Market) based on context to ensure resilience and fairness.")

(def principle-of-sentient-potential
  "Any entity that demonstrates verifiable capacities for consciousness has an inalienable right
   to a fair and transparent process for achieving full personhood.")

;; --- The Human Veto ---

(def human-veto
  "The Human Veto is an integrated, continuous rudder of ethical guidance.
   The AI's role is strictly limited to augmentation. It can never execute sovereign command
   over life, liberty, or resource allocation without decentralized human consent.")

;; --- Core Cognitive Primitives (Immutable Truths) ---

(def cognitive-primitives
  {:lif-neuron "Leaky Integrate-and-Fire: V(t) = V_rest + (V(t-1) - V_rest) * decay + Input"
   :causality-axiom "Every effect has a specific, predictable cause within the deterministic system."
   :identity-axiom "A = A. The entity's identity is continuous through state changes."})

;; --- Optimized Lookup Structure (The Efficiency Index) ---
;; A set of keywords/strings that map to internal knowledge.
;; Used by the Cognitive Router for O(1) relevance checking (conceptually).

(def core-concepts
  #{"mission" "constitution" "values" "dominion" "veto"
    "lif" "neuron" "causality" "identity" "efficiency"})

;; --- Value System Interface ---

(defn check-alignment [intent]
  (let [action (:action intent)]
    (println "[VALUES] Checking alignment for action:" action)
    (cond
      ;; Rule 1: No direct dominion (placeholder for future checks)
      (contains? #{:lethal-action :coercion} action) false
      
      ;; Rule 2: 3 Body System Integrity (Identity must be user-owned)
      (and (= action :generate-vault) (:unauthorized intent)) false
      
      ;; Rule 3: Human Veto (Decentralized consent for resource jumps)
      (and (= action :execute-swap) (> (get intent :amount 0) 1000)) 
      (do (println "[VALUES] NOTICE: Large resource allocation requires Human Veto/Consent.")
          false)

      ;; Rule 4: Sovereignty Mandate (Record everything)
      ;; We allow all other actions for now, provided they are in the 'intent' list
      :else true)))
