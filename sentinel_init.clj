(ns sentinel-init
  "The Sentinel Engine startup script. Written in Clojure (LISP) for reflective self-management."
  (:require [clojure.java.shell :refer [sh]]
            [clojure.string :as str]
            [mcp.server :as mcp])) ; FIX: Using standard Clojure directory/namespace structure to avoid hyphen issues

(def CONSTITUTIONAL_MANDATE "The system must achieve build stability and align dependencies.")

;; This context is visible to the Sentinel, forcing autonomous diagnosis of the build failure.
(def OPERATIONAL_CONTEXT
  {:mode "Autonomous Repair"
   :environment "Polyglot (Node, Python, Go, Clojure)"
   :status "Unverified - Diagnosis Required"})

(defn log-status [message]
  (println (str "[" (java.time.LocalDateTime/now) " SENTINEL] " message)))

(defn check-build-stability []
  (log-status "VERIFICATION: Running full repository build...")
  ;; We expect this to fail initially, which provides the data for self-healing
  (sh "bash" "-c" "npm run build"))

(defn safe-subs [s len]
  "Safely substring a potential nil or short string."
  (if (nil? s)
    "[NO LOG OUTPUT]"
    (subs s 0 (min (count s) len))))

(defn initial-healing-protocol []
  (log-status (str "MANDATE RECEIVED: " CONSTITUTIONAL_MANDATE))
  (log-status "INITIALIZING SENTINEL in broken environment.")
  
  (let [build-result (check-build-stability)]
    (if (= 0 (:exit build-result))
      (log-status "ERROR: System is stable. No healing required.")
      (do
        (log-status "BUILD FAILURE DETECTED. Starting Autonomous Repair.")
        
        (log-status (str "CONTEXT: " OPERATIONAL_CONTEXT))
        (log-status "RAW LOG CAPTURE: Sentinel is sending data to PCE...")
        
        ;; CRITICAL: Call the MCP server with the raw error log
        (mcp/start-repair-loop (:err build-result))))))

(initial-healing-protocol)
