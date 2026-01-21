(ns mcp.server
  "Master Control Protocol (MCP) Server for Sentinel Engine.
   Handles communication with the external Gemini Cognitive Engine (PCE)."
  (:require [clojure.java.shell :refer [sh]]
            [clojure.data.json :as json]
            [clojure.string :as str]
            [clj-http.client :as http]))
            ;; Removed sentinel-init require to prevent circular dependency

(def GEMINI_API_KEY (System/getenv "GEMINI_API_KEY"))
(def GEMINI_API_URL "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent")

(defn log [message]
  ;; Breaking circular dependency by printing directly
  (println (str "[" (java.time.LocalDateTime/now) " MCP-SERVER] " message)))

(defn execute-repair [filepath content]
  "Writes the new file content provided by the PCE to the local file system."
  (log (str "Executing repair on: " filepath))
  (try
    (spit filepath content)
    (log "Repair successful. File overwritten.")
    true
    (catch Exception e
      (log (str "ERROR: Failed to write file " filepath ": " (.getMessage e)))
      false)))

(defn call-cognitive-engine [raw-log]
  "Sends the broken build log to the Gemini agent for diagnosis and fix generation."
  (let [user-prompt (str "Analyze this raw build log for architectural errors (circular dependencies or SDK skew) and generate the corrective code as mandated. RAW LOG: \n\n" raw-log)
        payload {:contents [{:parts [{:text user-prompt}]}]
                 :generationConfig {:responseMimeType "application/json"}
                 :systemInstruction {:parts [{:text "You are the Promethean Cognitive Engine (PCE) specialized in architectural diagnosis. Your output MUST be a single JSON object with fields: diagnosis, filepath_to_edit, new_file_content, and justification."}]}}
        response (http/post (str GEMINI_API_URL "?key=" GEMINI_API_KEY)
                           {:content-type :json
                            :accept :json
                            :body (json/write-str payload)})
        body (json/read-str (:body response) :key-fn keyword)]
    
    (if-let [text (-> body :candidates first :content :parts first :text)]
      (json/read-str text :key-fn keyword)
      (throw (Exception. "PCE returned no valid JSON response.")))))

(defn safe-subs [s len]
  (if (nil? s)
    ""
    (subs s 0 (min (count s) len))))

(defn start-repair-loop [raw-log]
  "The core autonomous loop: Analyze -> Fix -> Verify."
  (log "Connecting to PCE for Autonomous Diagnosis...")
  
  (try
    (let [pce-response (call-cognitive-engine raw-log)
          filepath (:filepath_to_edit pce-response)
          new-content (:new_file_content pce-response)]
      
      (log (str "PCE Diagnosis received: " (:diagnosis pce-response)))
      (log (str "Target file: " filepath))
      
      (if (execute-repair filepath new-content)
        (do
          (log "Verification starting: Re-running build...")
          (let [verify-result (sh "bash" "-c" "npm run build")]
            (if (= 0 (:exit verify-result))
              (log "SUCCESS: Build is now stable. Sentinel is verified.")
              (log (str "REPAIR FAILED. New log captured for next iteration. RAW LOG: " (safe-subs (:err verify-result) 500) "...")))))
        
        (log "FATAL: Code surgery failed. Halting Sentinel.")))

    (catch Exception e
      (log (str "CRITICAL PCE COMMUNICATION ERROR: " (.getMessage e)))
      (log "Sentinel entering emergency shutdown mode."))))
