
(ns promethea.eyes
  (:require [clj-http.client :as http]
            [cheshire.core :as json]
            [clojure.string :as str]
            [promethea.env :as env]
            [promethea.models :as models]))

(defonce api-key-atom (atom nil))
(def base-url "https://generativelanguage.googleapis.com/v1beta/models/")

(defn set-api-key! [new-key]
  (reset! api-key-atom new-key))

(defn- get-active-key []
  (let [k @api-key-atom]
    (if (str/blank? k)
      (let [env-k (env/get-env "GEMINI_API_KEY")]
        (if (str/blank? env-k)
          nil
          env-k))
      k)))

(defn get-api-url [model-id]
  (str base-url model-id ":generateContent"))

(defn- api-call [url body key]
  (http/post (str url "?key=" key)
             {:body body
              :content-type :json
              :accept :json
              :connection-timeout 30000
              :socket-timeout 30000}))

(defn- retryable? [msg]
  (let [m (str/lower-case (or msg ""))]
    (or (str/includes? m "failed to respond")
        (str/includes? m "timeout")
        (str/includes? m "connection reset")
        (str/includes? m "refused"))))

(defn see
  "Analyzes the input (text or image) using the Gemini API.
   Supports optional second argument map for task criteria, e.g. {:task :coding}.
   Rotates models on failure."
  ([input] (see input nil))
  ([input opts]
   (let [key (get-active-key)]
     (if-not key
       {:status :error :message "GEMINI_API_KEY not found"}
       (let [model-id (models/select-best-model opts)
             api-url (get-api-url model-id)
             request-body (if (map? input) ;; Handle image input if checks later
                            input ;; Placeholder for actual image construct if needed, assuming input is correctly formatted body or text
                            {:contents [{:parts [{:text input}]}]})
             body (json/generate-string request-body)]
         (loop [attempt 1]
           (let [result (try
                          {:status :success
                           :data (let [response (api-call api-url body key)]
                                   (-> response
                                       :body
                                       (json/parse-string true)
                                       :candidates
                                       first
                                       :content
                                       :parts
                                       first
                                       :text))}
                          (catch Exception e
                            (let [status (:status (ex-data e))]
                              (when (= status 404)
                                (println "[EYES] Model 404, rotating..."))
                              {:status :error :message (.getMessage e) :data (ex-data e)})))]
             (if (= (:status result) :success)
               (:data result)
               (if (and (<= attempt 3) (retryable? (:message result)))
                 (do
                   (println (str "[EYES] Vision glitch (attempt " attempt "/3): " (:message result) ". Retrying in 2s..."))
                   (when (or (str/includes? (:message result) "404")
                             (str/includes? (:message result) "not found"))
                     (models/next-model!))
                   (Thread/sleep 2000)
                   (recur (inc attempt)))
                 (do
                   (println "[EYES] Vision blurred:" (:message result))
                   (println "[EYES] Debug Data:" (:data result))
                   (str "Error: " (:message result))))))))))))

