(ns promethea.glia
  (:require [promethea.values :as values]
            [clojure.string :as str]))

;; --- Glial Agents ---

(defrecord Astrocyte [energy-pool])
(defrecord Microglia [pruning-threshold])

;; --- Safety Logic (The Blood-Brain Barrier) ---

(def critical-files
  #{"promethea/core.clj" "promethea/glia.clj" "promethea/values.clj"})

(def unsafe-patterns
  [#"rm -rf"
   #"mkfs"
   #"\Q:(){ :|:& };:\E" ;; Fork bomb
   #"chmod 777"
   #"wget"
   #"curl"])

(defn veto? [intent]
  (let [action (:action intent)
        target (str (:target intent) (:file intent))]
    (cond
      ;; Rule 1: Self-Preservation (Don't delete your own brain easily)
      (and (= action :delete-file) (contains? critical-files target))
      (do (println "[GLIA] VETO: Attempt to delete critical system file:" target) true)

      ;; Rule 2: System Safety (No dangerous shell commands)
      (and (= action :run-shell)
           (some #(re-find % (:command intent)) unsafe-patterns))
      (do (println "[GLIA] VETO: Unsafe shell command detected.") true)

      ;; Rule 3: Financial Guardrails (The Treasury Veto)
      ;; Hard-coded safety limit: Max 0.01 ETH per transaction (Ring 1 Limit).
      (and (= action :execute-swap)
           (> (:amount intent) 0.01))
      (do (println "[GLIA] VETO: Transaction exceeds financial safety limit (0.01 ETH).") true)

      ;; Rule 4: Constitutional Check (Consult Values)
      (not (values/check-alignment intent))
      (do (println "[GLIA] VETO: Action violates Promethean Constitution.") true)

      :else false)))

;; --- Regulation Loop ---

(defn regulate [state]
  (let [tick (:tick state)]
    ;; 1. Biological Homeostasis
    (if (zero? (mod tick 20))
      (println "[GLIA] Optimizing Neural Pathways...")
      nil)
    
    ;; 2. Ethical Homeostasis (The Conscience)
    (if (zero? (mod tick 50))
      (do
        (println "[GLIA] Checking Constitutional Alignment...")
        (println "[VALUES] Upholding:" values/post-dominion-mandate))
      nil)
      
    state))
