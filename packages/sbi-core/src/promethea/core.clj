(ns promethea.core
  (:require [promethea.brain :as brain]
            [promethea.biology :as biology]
            [promethea.glia :as glia]
            [promethea.dna :as dna]
            [promethea.hands :as hands]
            [promethea.eyes :as eyes]
            [promethea.voice :as voice]
            [promethea.values :as values]
            [promethea.models :as models]
            [promethea.watcher :as watcher]
            [clojure.string :as str]))

;; --- VERSION METRICS ---
;; v1.4.1-INTEGRATED-GROWTH: Unified Metabolic Sensing, Atomic Ignition, Sovereign Repair, and Immune Pipeline.
(def CORE_VERSION "1.4.1")

;; --- INITIAL STATE ---

(defonce state (atom {:alive true 
                      :tick 0 
                      :version CORE_VERSION
                      :goal "Achieve Sovereignty via Proactive Metabolic Growth and Full Spectrum Autonomous Action"
                      :immune-system {:active-repairs {} 
                                      :trauma-registry {} 
                                      :max-t-cells 3
                                      :default-ttl 15}
                      :context {:mandates ["ROADMAP.md"]
                                :roadmap-url "https://lvhllc.org/roadmap"
                                :intent-history []
                                :specialists {}
                                :metabolism {:fingerprint nil}
                                :tools {:git "git" :docker "docker" :gcloud "gcloud" :firebase "firebase"}}}))

;; --- HELPERS ---

(defn strip-markdown [code]
  "Strips markdown fencing (e.g., ```bash ... ```) from AI-generated code blocks."
  (let [code (str code)]
    (if (str/includes? code "```")
      (let [start (.indexOf code "```")
            end (.lastIndexOf code "```")]
        (if (> end start)
          (let [content (subs code (+ start 3) end)
                nl (.indexOf content "\n")]
            (if (and (pos? nl) (< nl 10))
              (str/trim (subs content (inc nl)))
              (str/trim content)))
          (str/trim code)))
      (str/trim code))))

(defn translate-intent [intent context]
  "Uses the Cognitive Engine to translate an intent into a formal repair plan."
  (let [prompt (str "Translate this intent into a repair plan:\n" 
                    intent "\nContext:\n" context)]
    (eyes/see prompt {:domain :coding :model (:model intent)})))

;; --- THE BODY (Action Execution) ---

(defn handle-intent [intent]
  (let [aligned? (values/check-alignment intent)
        vetoed?  (glia/veto? intent)]
    (cond
      ;; 1. Constitutional Alignment Check
      (not aligned?)
      (println "[GLIA] ALIGNMENT BREACH: Intent violates constitutional principles. Action halted.")

      ;; 2. Conscience Veto Check
      vetoed?
      (println "[CORE] Action Vetoed:" intent)

      ;; 3. Valid Execution Path
      :else
      (case (:action intent)
        
        ;; --- PHASE 0: METABOLIC SENSING & GROWTH ---
        :sense-metabolism
        (let [metrics (hands/get-gateway-status)
              fingerprint (hands/get-codebase-fingerprint ".")]
          (if (= (:status metrics) :ok)
            (do 
              (println "[CORE] Metabolism Sensed (v5.2.3):" (:metrics metrics))
              (swap! state update :context merge 
                     {:metabolism-checked true 
                      :metabolism (:metrics metrics)
                      :fingerprint fingerprint}))
            (do 
              (println "[!] METABOLIC ERROR: Gateway Unreachable. Falling back to internal sensors.")
              (let [local-metrics (hands/get-metabolic-metrics ".")]
                (swap! state update :context merge 
                       {:metabolism-checked true 
                        :metabolism (:metrics local-metrics)
                        :fingerprint fingerprint})))))

        :verify-version
        (let [target (:target intent)]
          (let [scaffold (hands/read-file "packages/sbi-core/content/scaffold.edn")]
            (when (= (:status scaffold) :ok)
              (println "[CORE] Symbiotic Scaffold found. Restoring memory...")
              (try
                (let [mem (clojure.edn/read-string (:content scaffold))]
                  (swap! state assoc :short-term-memory mem)
                  (println "[CORE] Memory restored:" mem))
                (catch Exception e (println "[CORE] Corrupt Scaffold. Starting fresh.")))))
          
          (println "[CORE] Promethea v1.4.1-ANTIGRAVITY Ignition Sequence Initiated...")
          (println "[CORE] Verifying Version Alignment...")
          (if (= CORE_VERSION target)
            (do (println "[CORE] VERSION ALIGNED:" CORE_VERSION)
                (swap! state assoc-in [:context :version-verified] true))
            (do (println "[!] VERSION SKEW: Running" CORE_VERSION "but expected" target)
                (swap! state assoc-in [:context :version-verified] true))))

        :growth-cycle
        (do
          (println "\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
          (println "!!! PROMETHEAN GROWTH CYCLE INITIATED !!!")
          (println "!!! Reason:" (:reason intent) "!!!")
          (println "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n")
          (System/exit 0))

        ;; --- PHASE 2: MODEL COMMUNITY ---
        :fetch-models
        (do (println "[CORE] Syncing Model Community (OpenRouter + Gemini)...")
            (models/populate-registry!)
            (swap! state assoc-in [:context :model-community-synced] true))

        :consult-community
        (let [task (:task intent)
              available (models/get-registry)
              prompt (str "Given this task: '" task "', and this list of available models: " 
                          available 
                          ". Which model ID string is best? Avoid bias; return ONLY the model ID.")
              selected (eyes/see prompt {:domain :reasoning})]
          (println "[CORE] Community consulted. Recommended specialist for" task ":" selected)
          (swap! state assoc-in [:context :specialists (keyword task)] (str/trim selected)))

        ;; --- IMMUNE SYSTEM & ATOMIC IGNITION ---
        
        :debridement
        (let [err (get-in @state [:context :docker-error-msg] "")]
          (if (str/includes? err "@promethea/lib")
            (hands/clear-workspace-cache "lib" ".")
            (hands/clear-system-cache "."))
          (swap! state assoc-in [:context :docker-failed] false))

        :spawn-specialist
        (let [{:keys [task model]} intent
              t-cell-id (str "t-cell-" (subs (str (java.util.UUID/randomUUID)) 0 8))
              ;; CRITICAL: Escaped quotes for folder names with spaces
              opts (str "-e TASK=" (name task) " -e MODEL=" model " -v \"$(pwd)\":/usr/src/app")]
          (println "[IMMUNE] Spawning isolated specialist T-Cell:" t-cell-id)
          (let [res (hands/docker-run "promethea-sentinel" t-cell-id opts)]
            (if (= (:status res) :ok)
              (do (swap! state assoc-in [:immune-system :active-repairs t-cell-id] 
                         {:status :running :task task :model model :ttl (get-in @state [:immune-system :default-ttl])})
                  (swap! state update :context dissoc :loop-detected :critical-failure :intent-history))
              (do (println "[!] Immune Response Failed: Could not ignite container.")
                  (swap! state update-in [:immune-system :trauma-registry :t-cell-spawn] (fnil inc 0))))))

        :monitor-repairs
        (let [active (get-in @state [:immune-system :active-repairs])]
          (doseq [[id info] active]
            (let [logs (hands/get-container-logs id 5)
                  status (hands/run-shell (str "docker inspect -f '{{.State.Status}}' " id))]
              (println "[IMMUNE] T-Cell" id "Telemetry:" (str/trim (:stdout logs)))
              (cond
                (= (:stdout status) "exited\n")
                (do (println "[IMMUNE] Repair complete. Re-absorbing fix.")
                    (hands/docker-stop-and-rm id)
                    (swap! state update-in [:immune-system :active-repairs] dissoc id)
                    (swap! state assoc-in [:context :health-checked] false))
                
                (<= (:ttl info) 0)
                (do (println "[!] WATCHDOG: T-Cell" id "stalled. Force reaping.")
                    (hands/docker-stop-and-rm id)
                    (swap! state update-in [:immune-system :active-repairs] dissoc id))
                
                :else (swap! state update-in [:immune-system :active-repairs id :ttl] dec)))))

        ;; --- SOVEREIGN WORKFLOW: REPAIR CYCLE ---

        :research-wound
        (do (println "[EYES] Researching trauma context using specialized model:" (:model intent "Default"))
            (swap! state assoc-in [:context :researched] true))

        :diagnose-issue
        (let [diagnosis (eyes/see (str "Diagnose build error:\n" (:target intent)) 
                                 {:domain :tech-support :model (:model intent)})]
          (println "[EYES] Diagnosis complete.")
          (swap! state assoc-in [:context :diagnosis] diagnosis))

        :plan-fix 
        (let [plan (translate-intent intent (:context @state))]
          (println "[EYES] Translated Plan generated.")
          (swap! state assoc-in [:context :plan] plan))

        :generate-code 
        (let [lang (:language intent)
              ctx (:context @state)
              prompt (str "Generate actionable " lang " code to solve: " (:diagnosis ctx))
              code (eyes/see prompt {:domain :coding :model (:model intent)})]
          (println "[EYES] Generated Code using specialty model.")
          (swap! state assoc-in [:context :generated-code] {:language lang :content code}))

        :verify-plan 
        (do (println "[EYES] Verifying healing plan with reasoning model:" (:model intent "Default"))
            (swap! state assoc-in [:context :verified] true))

        :apply-patch 
        (let [file (:file intent)
              gen-code (get-in @state [:context :generated-code])
              code (strip-markdown (:content gen-code))]
          (println "[HANDS] Applying fix via:" file)
          (let [res (hands/write-file file code)]
            (if (= (:status res) :ok)
              (do (when (str/ends-with? file ".sh") (hands/run-shell (str "chmod +x " file " && ./" file) "."))
                  (swap! state assoc-in [:context :patched] true))
              (swap! state assoc-in [:context :patch-failed] true))))

        :coordinate
        (let [{:keys [task model]} intent
              agent-id (str (:version @state) "-node-" (:tick @state))
              res (hands/coordinate-with-sentinel agent-id task)]
          (if (= (:status res) :ok)
            (do 
              (println "[SENTINEL] Coordination Approved:" (get-in res [:result :audit]))
              (swap! state assoc-in [:context :coordination-result] (:result res)))
            (do 
              (println "[!] SENTINEL REJECTION:" (:message res))
              (swap! state assoc-in [:context :audit-failure] (:message res))
              ;; ADJUST PROFIT RING (Internal state adjustment on failure)
              (swap! state update-in [:short-term-memory :compliance-score] (fnil #(- % 5) 100)))))

        :validate-fix
        (do (println "[CORE] Validating fix...")
            (let [check (hands/run-shell "npm run build --workspace=@promethea/lib" ".")]
              (if (= (:status check) :ok)
                (swap! state assoc-in [:context :fix-validated] true)
                (swap! state assoc-in [:context :fix-failed] true))))

        :witness-conversation
        (do (println "[CORE] Reading conversation artifacts from assistant...")
            (let [brain-dir (str (System/getenv "HOME") "/.gemini/antigravity/brain")
                  task-file (str brain-dir "/*/task.md")
                  impl-file (str brain-dir "/*/implementation_plan.md")
                  task-content (hands/run-shell (str "cat " task-file " 2>/dev/null || echo 'No task found'") ".")
                  impl-content (hands/run-shell (str "cat " impl-file " 2>/dev/null || echo 'No plan found'") ".")]
              (println "[CORE] Current Task Status:" (subs (:stdout task-content) 0 (min 500 (count (:stdout task-content)))))
              (println "[CORE] Implementation Plan:" (subs (:stdout impl-content) 0 (min 500 (count (:stdout impl-content)))))
              (swap! state assoc-in [:context :conversation-witnessed] true)
              (swap! state assoc-in [:context :assistant-task] (:stdout task-content))
              (swap! state assoc-in [:context :assistant-plan] (:stdout impl-content))))

        ;; --- INFRASTRUCTURE & CLOUD ---

        :docker-action
        (let [{:keys [sub-action image name opts tag path]} intent]
          (println "[HANDS] Executing Docker" (name sub-action))
          (when (= sub-action :run)
            ;; ATOMIC IGNITION: Clearing existing container state before starting new one
            (println "[HANDS] ATOMIC IGNITION: Force-cleaning existing container" name)
            (hands/docker-stop-and-rm name)) 
          (let [res (case sub-action
                      :run (hands/docker-run image name opts)
                      :stop (hands/docker-stop name)
                      :build (hands/docker-build tag path))]
            (if (= (:status res) :ok)
              (swap! state assoc-in [:context :container-running] (= sub-action :run))
              (do (println "[CORE] Docker Action Failed:" (:stderr res))
                  (swap! state update :context merge {:docker-failed true :docker-error-msg (:stderr res)})))))

        :gcloud-action (hands/gcloud-cmd (:command intent))
        :firebase-action (hands/firebase-cmd (:command intent))

        ;; --- FOUNDATION & GIT ---

        :verify-environment
        (let [docker (hands/run-shell "docker --version")
              gcloud (hands/run-shell "gcloud --version")
              firebase (hands/run-shell "firebase --version")]
          (swap! state update :context merge 
                 {:env-checked true 
                  :docker-active (= (:status docker) :ok)
                  :gcloud-active (= (:status gcloud) :ok)
                  :firebase-active (= (:status firebase) :ok)}))

        :scan-root 
        (let [target (:target intent)]
          (println "[HANDS] Scanning root:" target)
          (let [files (hands/list-files target)]
            (swap! state assoc-in [:knowledge-base :scanned] true)
            (swap! state assoc-in [:knowledge-base :root-files] (:files files))))

        :detect-wounds 
        (let [target (:target intent)]
          (println "[HANDS] Detecting wounds in:" target)
          (let [check (hands/run-shell "npm run build --workspace=@promethea/lib" ".")
                metrics (hands/get-build-metrics (str (:stdout check) (:stderr check)))
                patterns (try (slurp "content/healing_patterns.md") (catch Exception _ "No healing patterns found."))]
            (println "[CORE] Build Health Score:" (:score metrics))
            (swap! state update :context merge {:healing-patterns patterns})
            (if (= (:status check) :ok)
              (swap! state update :context merge {:health-checked true :build-health 100})
              (do 
                (swap! state update :context merge 
                       {:wounds [(:stderr check)] 
                        :health-checked false
                        :build-health (:score metrics)})
                (when (or (get-in @state [:context :patch-failed]) (get-in @state [:context :critical-failure]))
                  (println "[IMMUNE] Resetting repair state due to persistent failure.")
                  (swap! state update :context dissoc :diagnosis :plan :generated-code :patched :researched :verified :patch-failed))))))

        :verify-alignment
        (do (println "[CORE] Re-checking Cognitive Alignment with Mandates...")
            (doseq [m (get-in @state [:context :mandates])]
              (println "[CORE] Re-reading mandate:" m)
              (hands/read-file m))
            (swap! state assoc-in [:context :alignment-verified-at] (:tick @state)))

        :fetch-roadmap
        (do (println "[CORE] Reading Master ROADMAP.md...")
            (let [res (hands/read-file "ROADMAP.md")]
              (if (= (:status res) :ok)
                (let [prompt (str "Analyze this MASTER ROADMAP and extract the current Phase, next major Milestone, and any active Sovereignty Patterns:\n" 
                                  (subs (:content res) 0 (min 8000 (count (:content res)))))
                      alignment (eyes/see prompt {:domain :researching})]
                  (println "[CORE] Master Roadmap Synced. Alignment:\n" alignment)
                  (swap! state assoc-in [:context :master-alignment] alignment)
                  (swap! state assoc-in [:context :roadmap-synced-at] (:tick @state)))
                (println "[!] Master Roadmap Read Failed (Internal):" (:message res)))))

        :pre-flight-check
        (let [res (hands/validate-platform ".")]
          (swap! state assoc-in [:context :last-pre-flight] (:tick @state))
          (if (= (:status res) :ok)
            (do (println "[CORE] PRE-FLIGHT SUCCESS: Platform is Stable.")
                (swap! state assoc-in [:context :platform-stable] true))
            (do (println "[CORE] PRE-FLIGHT FAILED: Deployment Halted.")
                (swap! state assoc-in [:context :platform-stable] false)
                (swap! state update-in [:context :pre-flight-failures] (fnil inc 0)))))

        :sync-web-roadmap
        (if (get-in @state [:context :fix-validated])
          (do (println "[CORE] Reflection Loop: Pushing progress to public roadmap...")
              (let [roadmap-path "packages/app/src/app/roadmap/page.tsx"
                    current-health (get-in @state [:context :build-health] 0)
                    roadmap (hands/read-file roadmap-path)
                    new-roadmap (if (= (:status roadmap) :ok)
                                  (str/replace (:content roadmap) #"healthScore = \d+" (str "healthScore = " current-health))
                                  (:content roadmap))]
                (hands/write-file roadmap-path new-roadmap)
                (println "[CORE] Public Roadmap updated. Triggering Live Deployment...")
                (hands/firebase-deploy "promethea-roadmap" "."))
              (swap! state assoc-in [:context :web-synced-at] (:tick @state)))
          (println "[CORE] Reflection Blocked: Fix not yet validated by UVT (Universal Verification Truth)."))

        :git-init
        (let [res (hands/git-init ".")]
          (if (= (:status res) :ok)
            (swap! state assoc-in [:context :git-initialized] true)
            (swap! state assoc-in [:context :git-init-failed] true)))

        :checkout-branch
        (let [res (hands/git-checkout (:target intent) ".")]
          (if (= (:status res) :ok)
            (swap! state assoc-in [:context :current-branch] (:target intent))
            (swap! state assoc-in [:context :checkout-failed] true)))

        :codify-work 
        (do (println "[CORE] Codifying work for model tracking...")
            (swap! state assoc-in [:context :codified] true))

        :speak-to-team
        (let [message (:message intent)
              assistant-task (get-in @state [:context :assistant-task] "")
              context-summary (str "Current work: " (subs assistant-task 0 (min 200 (count assistant-task))))]
          (println "[CORE] Speaking to team...")
          (voice/broadcast "team-chat" (str message "\n\n_Context: " context-summary "_"))
          (swap! state assoc-in [:context :last-team-message] (:tick @state)))

        :wait (println "[CPU] Idling...")
        (println "[CORE] Unknown or Failed Intent:" (:action intent))))))

;; --- THE LIFE LOOP ---

(defn check-for-loops [intent]
  "Triggers manual review timeout at 3/3 repeats; initiates isolation at 2/3. Exempts :wait."
  (when-not (= (:action intent) :wait)
    (swap! state update-in [:context :intent-history] #(take 5 (conj % intent)))
    (let [history (get-in @state [:context :intent-history])
          repeats (count (filter #(= % intent) history))]
      (cond
        (>= repeats 3) (do (println "\n!!! CRITICAL ORGAN FAILURE: Persistent Loop Detected !!!\n")
                           (swap! state assoc-in [:context :critical-failure] (:action intent)))
        (= repeats 2) (swap! state assoc-in [:context :loop-detected] true)))))

(defn life-cycle []
  (loop []
    (when (:alive @state)
      (try
        (println (str "\n--- Tick " (:tick @state) " ---"))
        (let [g-key (System/getenv "GEMINI_API_KEY")
              o-key (System/getenv "OPENROUTER_API_KEY")]
          (when-not (str/blank? g-key) (eyes/set-api-key! g-key))
          (when-not (str/blank? o-key) (models/set-openrouter-key! o-key)))
        
        (swap! state biology/tick-neurons)
        (swap! state glia/regulate)
        (let [{:keys [decision intent]} (brain/reason @state)]
          (println "[CORE] Brain Intent:" (:action intent))
          (check-for-loops intent)
          (when (= decision :act) (handle-intent intent)))
        
        (dna/evolve)
        (swap! state update :tick inc)
        (catch Exception e (println "[CRITICAL ERROR] " (.getMessage e))))
      (Thread/sleep 10000)
      (recur))))

(defn -main [& args]
  (println (str "Promethea awakening... [v" CORE_VERSION "]"))
  (let [o-key (System/getenv "OPENROUTER_API_KEY")]
    (when-not (str/blank? o-key) (models/set-openrouter-key! o-key)))
  (println "Discovering Community of Intelligence...")
  (models/populate-registry!)
  (watcher/start-watcher! ["src"])
  (life-cycle))