(ns promethea.list-models
  (:require [clj-http.client :as http]
            [cheshire.core :as json]
            [promethea.env :as env]
            [clojure.string :as str]))

(defn -main []
  (println "--- List Gemini Models ---")
  (let [api-key (env/get-env "GEMINI_API_KEY")]
    (if api-key
      (try
        (let [url (str "https://generativelanguage.googleapis.com/v1beta/models?key=" api-key)
              response (http/get url {:accept :json})
              ignore-list #{"gemini-1.0-pro-vision-latest" "gemini-1.0-pro"  "gemini-pro-vision" "embedding-gecko-001"}
              models (-> response :body (json/parse-string true) :models)]
          (doseq [m models]
            (let [name (:name m)
                  display-name (:displayName m)
                  methods (:supportedGenerationMethods m)]
              (when (and (some #{"generateContent"} methods)
                         (not (some #(str/includes? name %) ignore-list)))
                 (println (str "Model: " name " (" display-name ")"))))))
        (catch Exception e
          (println "Error listing models:")
          (println (.getMessage e))
          (println (ex-data e))))
      (println "NO API KEY FOUND"))))
