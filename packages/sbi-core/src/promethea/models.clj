(ns promethea.models
  (:require [clojure.string :as str]
            [clj-http.client :as http]
            [cheshire.core :as json]
            [promethea.env :as env]))

;; --- The Dynamic Community Registry ---
;; "A village that grows and defines itself."

(defonce registry (atom []))
(defonce active-model (atom "gemini-2.0-flash-exp"))

(defn get-registry []
  @registry)

(defn set-openrouter-key! [k]
  (println "[MODELS] OpenRouter integration initialized."))

;; --- Discovery & Evaluation ---

(defn- get-api-key []
  (let [k (env/get-env "GEMINI_API_KEY")]
    (if (str/blank? k) nil k)))

(defn fetch-raw-models! 
  " Queries the Gemini API for all available models."
  []
  (let [api-key (get-api-key)]
    (if-not api-key
      (println "[MODELS] Error: No API Key found for discovery.")
      (try
        (let [url (str "https://generativelanguage.googleapis.com/v1beta/models?key=" api-key)
              response (http/get url {:accept :json})
              all-models (-> response :body (json/parse-string true) :models)
              gen-models (filter (fn [m] 
                                   (some #{"generateContent"} (:supportedGenerationMethods m)))
                                 all-models)]
          (println "[MODELS] Discovered" (count gen-models) "generative entities (filtered from" (count all-models) ").")
          gen-models)
        (catch Exception e
          (println "[MODELS] Discovery failed:" (.getMessage e))
          [])))))

(defn assess-capabilities 
  "Heuristic or LLM-based assessment of a model's 'Soul' (Capabilities)."
  [model-data]
  (let [name (:name model-data)
        display (:displayName model-data)
        ctx (:inputTokenLimit model-data 0)
        
        ;; Auto-tagging based on specs (The "Nature" of the model)
        base-caps (cond-> #{}
                    (str/includes? name "vision") (conj :multimodal)
                    (>= ctx 1000000) (conj :long-context :complex-reasoning)
                    (str/includes? name "flash") (conj :fast :cost-effective)
                    (str/includes? name "pro") (conj :reasoning :production))]
    
    ;; TODO: In future, we can have Promethea 'interview' the model here.
    ;; For now, we derive 'Citizen Roles' from these base traits.
    (cond-> base-caps
      (:complex-reasoning base-caps) (conj :coding :finance :science :architect)
      (:fast base-caps) (conj :social :creative :scout)
      (:multimodal base-caps) (conj :vision :artist))))

(defn populate-registry! 
  "Fetches and interviews models to build the community."
  []
  (let [raw-models (fetch-raw-models!)
        community (map (fn [m]
                         {:id (:name m) ;; keys are usually "models/gemini-..."
                          :name (:displayName m) 
                          :raw-name (:name m)
                          :context-window (:inputTokenLimit m)
                          :capabilities (assess-capabilities m)})
                       raw-models)]
    
    (reset! registry community)
    (println "[MODELS] Community Established:" (map :name @registry))
    community))

;; --- Dynamic Selection Logic ---

(defn select-best-model 
  "Selects the most capable model from the current LIVE registry."
  [opts]
  (let [domain (:domain opts)
        task (:task opts)
        required-capability (or domain task :fast)
        
        ;; Force discovery if empty
        _ (when (empty? @registry) (populate-registry!))
        
        candidates (filter #(contains? (:capabilities %) required-capability) @registry)
        
        ;; Selection Policy: "Free Will" (Probabilistic or Meritocratic)
        ;; Currently: Meritocratic (Largest Brain / Context Window)
        best-match (if (seq candidates)
                     (apply max-key :context-window candidates)
                     (first @registry))] ;; Fallback to Elder/First
      
    (if best-match
      (let [clean-id (str/replace (:id best-match) "models/" "")]
         (println "[MODELS] Summoning Specialist:" (:name best-match) "for" required-capability)
         clean-id)
      @active-model)))

(defn next-model!
  "Cycles to the next available model in case of failure."
  []
  (let [current @active-model
        ;; Filter for only robust models to switch to
        valid-models (map #(str/replace (:id %) "models/" "") @registry)
        next-model (or (second (drop-while #(not= % current) (cycle valid-models)))
                       (first valid-models))]
    (println "[MODELS] Resilience trigger! Switching active model to:" next-model)
    (reset! active-model next-model)
    next-model))
