(ns promethea.brain
  (:require [promethea.eyes :as eyes]
            [promethea.values :as values]
            [clojure.core.async :as async]))

;; --- v1.4.1: THE INTEGRATED GROWTH UPDATE ---
;; Unifies Metabolic Sensing with the full Sovereign Repair Pipeline.

(defrecord MCTSNode [state intent parent children visits value])

(defn create-node [state intent parent]
  (->MCTSNode state intent parent (atom []) (atom 0) (atom 0.0)))

(defprotocol WorldModel
  (predict-next-state [this state intent])
  (evaluate-state [this state]))

;; --- MCTS SEARCH LOGIC ---

(defn ucb1 [node parent-visits]
  (if (zero? @(:visits node))
    Double/POSITIVE_INFINITY
    (+ (/ @(:value node) @(:visits node))
       (* 1.41 (Math/sqrt (/ (Math/log parent-visits) @(:visits node)))))))

(defn select [node]
  (if (empty? @(:children node))
    node
    (recur (apply max-key #(ucb1 % @(:visits node)) @(:children node)))))

(defn expand [node world-model intents]
  (let [new-children (mapv (fn [intent]
                             (create-node (predict-next-state world-model (:state node) intent) intent node))
                           intents)]
    (reset! (:children node) new-children)
    (first new-children)))

(defn simulate [node world-model]
  (evaluate-state world-model (:state node)))

(defn backpropagate [node result]
  (loop [curr node]
    (when curr
      (swap! (:visits curr) inc)
      (swap! (:value curr) + result)
      (recur (:parent curr)))))

(defn mcts-search [root world-model intents iterations]
  (dotimes [_ iterations]
    (let [leaf (select root)
          node (if (empty? @(:children leaf))
                 (expand leaf world-model intents)
                 leaf)
          result (simulate node world-model)]
      (backpropagate node result)))
  (let [best-node (apply max-key #(deref (:visits %)) @(:children root))]
    (:intent best-node)))

;; --- METABOLIC WORLD MODEL ---

(defrecord InternalWorldModel []
  WorldModel
  (predict-next-state [_ state intent]
    (case (:action intent)
      :witness-conversation (assoc-in state [:context :conversation-witnessed] true)
      :scan-root (assoc-in state [:knowledge-base :scanned] true)
      :sense-metabolism (assoc-in state [:context :metabolism-checked] true)
      :verify-version (assoc-in state [:context :version-verified] true)
      :fetch-models (assoc-in state [:context :model-community-synced] true)
      :consult-community (assoc-in state [:context :specialists (keyword (:task intent))] "Assigned")
      :research-wound (assoc-in state [:context :researched] true)
      :diagnose-issue (assoc-in state [:context :diagnosis] "Diagnosed")
      :plan-fix (assoc-in state [:context :plan] "Planned")
      :generate-code (assoc-in state [:context :generated-code] "Generated")
      :apply-patch (assoc-in state [:context :patched] true)
      :codify-work (assoc-in state [:context :codified] true)
      :growth-cycle (assoc-in state [:alive] false)
       :verify-alignment (assoc-in state [:context :alignment-verified-at] (:tick state))
       :fetch-roadmap (assoc-in state [:context :roadmap-synced-at] (:tick state))
       :pre-flight-check (assoc-in state [:context :platform-stable] true)
       :sync-web-roadmap (assoc-in state [:context :web-synced-at] (:tick state))
       :coordinate (assoc-in state [:context :coordinates_active] true)
       :deep-sleep (assoc-in state [:alive] false)
       state))
  
  (evaluate-state [_ state]
    (let [ctx (:context state)
          metabolism (get ctx :metabolism {})]
      (cond
        (:conversation-witnessed ctx) 35.0
        (:codified ctx) 25.0
        (:patched ctx) 20.0
        (:version-verified ctx) 18.0
        (and (:metabolism-checked ctx) (clojure.string/includes? (get metabolism :cache "0") "G")) 1.0
        (:health-checked ctx) 12.0
        (:model-community-synced ctx) 5.0
        (:platform-stable ctx) 30.0
        (:external-alignment ctx) 15.0
        :else (+ 2.0 (float (/ (get ctx :build-health 0) 10.0)))))))

;; --- INTENT GENERATION (The Integrated Pipeline) ---

(defn generate-intents [state]
  (let [kb (:knowledge-base state)
        ctx (:context state)
        specialists (:specialists ctx)
        metabolism (:metabolism ctx)
        repairs (get-in state [:immune-system :active-repairs])
        branch (:current-branch ctx "main")
        current-ver (:version state "1.2.5")
        target-ver "1.4.1"]
    
      (let [diagnosis (get-in state [:short-term-memory :diagnosis])
            critical-failure (:critical-failure ctx)
            base-intents (cond
                           diagnosis
                           [{:action :attempt-fix
                             :target diagnosis
                             :model (get specialists :coding "Default")}]
                           
                           critical-failure
                           [{:action :diagnose-issue 
                             :target (str "Persistent failure in action: " critical-failure)
                             :model (get specialists :reasoning "Default")}]
                           
                           :else [])]
      
      (cond-> base-intents
        true (conj {:action :wait})


        ;; 1. METABOLIC SENSING & SURVIVAL
        (not (:metabolism-checked ctx))
        (conj {:action :sense-metabolism})

        (and (:metabolism-checked ctx) 
             (< (get metabolism :battery_pct 100.0) 10.0))
        (conj {:action :growth-cycle :reason "CRITICAL_LOW_POWER_DEEP_SLEEP"})

      ;; 2. KNOWLEDGE & VERSION
      (and (:metabolism-checked ctx) (not (:scanned kb))) 
      (conj {:action :scan-root :target "."})
      
      (and (:scanned kb) (not (:version-verified ctx)))
      (conj {:action :verify-version :target target-ver})

      ;; 3. MANDATORY GROWTH RESET (Metabolic Debridement)
      (and (:version-verified ctx) (not= current-ver target-ver))
      (conj {:action :growth-cycle :reason "Mandatory Evolutionary Update"})

      (and (:metabolism-checked ctx) (clojure.string/includes? (get metabolism :cache "") "G"))
      (conj {:action :growth-cycle :reason "Metabolic Debridement Required"})

      ;; 4. SYNC & COMMUNITY
      (and (:version-verified ctx) (not (:env-checked ctx))) 
      (conj {:action :verify-environment})
      
      (and (:env-checked ctx) (not (:model-community-synced ctx))) 
      (conj {:action :fetch-models})

      (and (:model-community-synced ctx) (not (:coding specialists)))
      (conj {:action :consult-community :task "coding"})

      ;; 5. SOVEREIGN REPAIR CYCLE (The Muscles)
      (and (:env-checked ctx) (not (:health-checked ctx)) (empty? repairs))
      (conj {:action :detect-wounds :target "."})

      (and (:wounds ctx) (not (:researched ctx)))
      (conj {:action :research-wound :model (get specialists :research "Default")})

      (and (:researched ctx) (not (:diagnosis ctx)))
      (conj {:action :diagnose-issue 
             :target (first (:wounds ctx)) 
             :model (get specialists :architecture "Default")})

      (and (:diagnosis ctx) (not (:plan ctx)))
      (conj {:action :plan-fix :goal "Restore Stability" :model (get specialists :truth-check "Default")})

      (and (:plan ctx) (not (:generated-code ctx)))
      (conj {:action :generate-code :language "typescript" :model (get specialists :coding "Default")})

      (and (:generated-code ctx) (not (:verified ctx)))
      (conj {:action :verify-plan :model (get specialists :truth-check "Default")})

      (and (:verified ctx) (not (:patched ctx)) (not= branch "main"))
      (conj {:action :apply-patch :file "fix_architectural_skew.sh"})

      ;; 6. IMMUNE SYSTEM & INFRA
      (seq repairs) (conj {:action :monitor-repairs})
      
      (and (:docker-failed ctx)) (conj {:action :debridement}) 
      
      (and (:loop-detected ctx) (empty? repairs))
      (conj {:action :spawn-specialist :task "infra-repair" :model (get specialists :coding "Default")})

       ;; 7. PERIODIC ALIGNMENT (Metabolic Hygiene)
       (or (not (:alignment-verified-at ctx))
           (>= (- (:tick state) (:alignment-verified-at ctx)) 100))
       (conj {:action :verify-alignment})

       ;; 8. EXTERNAL ROADMAP SYNC (Vision Alignment)
       (or (not (:roadmap-synced-at ctx))
           (>= (- (:tick state) (:roadmap-synced-at ctx)) 500))
       (conj {:action :fetch-roadmap})

       ;; 9. SAFE DEPLOYMENT (Pre-Flight Checks)
       (and (>= (get ctx :build-health 0) 80)
            (or (not (:platform-stable ctx))
                (>= (- (:tick state) (get ctx :last-pre-flight 0)) 200)))
       (conj {:action :pre-flight-check})

       (and (:platform-stable ctx)
            (>= (get ctx :build-health 0) 90) 
            (or (not (:web-synced-at ctx))
                (>= (- (:tick state) (:roadmap-synced-at ctx)) 1000)))
       (conj {:action :sync-web-roadmap})

       ;; 11. SENTINEL COORDINATION (Quantum Bridge)
       (and (:platform-stable ctx) (not (:coordination-result ctx)))
       (conj {:action :coordinate :task "Establish IBM Quantum Bridge Link" :model (get specialists :coding "Default")})

       ;; 12. FINALITY
       (and (:patched ctx) (not (:codified ctx)))
       (conj {:action :codify-work :model (get specialists :sovereignty "Default")})))))

(defn reason [context]
  (let [root (create-node context nil nil)
        intents (generate-intents context)
        model (->InternalWorldModel)
        best-intent (mcts-search root model intents 50)]
    (println "[BRAIN] Task Specialist:" (:model best-intent "Awaiting Selection..."))
    (println "[BRAIN] Selected Intent:" best-intent)
    {:decision :act :intent best-intent}))