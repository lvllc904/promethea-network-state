(ns promethea.vision-check
  (:require [promethea.eyes :as eyes]
            [promethea.env :as env]
            [clojure.string :as str]))

(defn -main []
  (println "--- Vision Recovery Diagnostic ---")
  (let [api-key (env/get-env "GEMINI_API_KEY")]
    (if api-key
      (do
        (println "[DIAGNOSTIC] Sending test request to Gemini 1.5-Flash...")
        (let [start (System/currentTimeMillis)
              response (try
                         (eyes/see "Say 'CONNECTED' if you can read this.")
                         (catch Exception e
                           (println "[DIAGNOSTIC] Exception caught:")
                           (println "  Message:" (.getMessage e))
                           (println "  Data:" (ex-data e))
                           (str "Error: " (.getMessage e))))]
          (let [end (System/currentTimeMillis)]
            (println "[DIAGNOSTIC] Response Time:" (- end start) "ms")
            (println "[DIAGNOSTIC] Response:" response))))
      (println "[ERROR] GEMINI_API_KEY still not found in .env"))))
