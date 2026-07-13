(ns promethea.biology
  (:require [clojure.core.async :as async]
            [clojure.edn :as edn]
            [clojure.java.io :as io]
            [cheshire.core :as json]
            [clj-http.client :as client]))

;; --- SNN Constants ---
(def V_REST -70.0)
(def V_THRESH -55.0)
(def V_RESET -75.0)
(def TAU_M 20.0)
(def DT 1.0)

;; --- Helper to Resolve Paths ---
(defn resolve-path [path]
  (let [root (System/getProperty "user.dir")]
    (cond
      (.exists (io/file path)) path
      (.exists (io/file (str root "/" path))) (str root "/" path)
      (.exists (io/file (str "packages/sbi-core/" path))) (str "packages/sbi-core/" path)
      :else path)))

;; --- Config Loading ---
(defn load-config []
  (try
    (let [path (resolve-path "content/metabolism_config.edn")
          config (edn/read-string (slurp path))
          preset-key (:active-preset config)
          preset (get-in config [:presets preset-key])]
      (println "[BIOLOGY] Loaded SNN Preset:" preset-key preset)
      (or preset {:sensory-weight 15.0 :economic-weight 15.0 :fire-threshold -55.0 :leak-factor 0.95}))
    (catch Exception e
      (println "[BIOLOGY] Warning: Failed to load metabolism config, using developer defaults. Error:" (.getMessage e))
      {:sensory-weight 15.0 :economic-weight 15.0 :fire-threshold -55.0 :leak-factor 0.95})))

;; --- Initial Neurons State ---
(defn init-neurons []
  {:sensory-neuron    {:v V_REST :last-spike-time -1}
   :cognitive-neuron  {:v V_REST :last-spike-time -1}
   :economic-neuron   {:v V_REST :last-spike-time -1}
   :inhibitory-neuron {:v V_REST :last-spike-time -1}})

;; --- SNN Core Logic ---

(defn inject-current [neurons neuron-id amount]
  (if-let [current-v (get-in neurons [neuron-id :v])]
    (let [new-v (+ current-v amount)]
      (assoc-in neurons [neuron-id :v] new-v))
    neurons))

(defn clamp-deafness [neurons]
  (println "[BIOLOGY] Glia veto triggered defensive deafness clamp. Inhibiting cognitive-neuron.")
  (-> neurons
      (assoc-in [:cognitive-neuron :v] -150.0)
      (assoc-in [:inhibitory-neuron :v] 50.0))) ; Charge inhibitory to active

;; --- Hardware Telemetry Feed ---

(defn fetch-hardware-telemetry []
  (try
    (let [res (client/get "http://localhost:4005/telemetry" {:conn-timeout 1000 :socket-timeout 1000})
          body (:body res)
          data (json/parse-string body true)]
      (println "[BIOLOGY] Live hardware telemetry retrieved successfully:" data)
      data)
    (catch Exception e
      ;; Falling back to baseline simulation
      {:cpu-temp 45.0 :memory-utilization 35.0 :thermal-throttling false})))

(defn tick-neurons [state]
  (let [tick (:tick state 0)
        config (load-config)
        telemetry (fetch-hardware-telemetry)
        cpu-temp (:cpu-temp telemetry 45.0)
        mem-util (:memory-utilization telemetry 35.0)
        
        ;; Determine stress vs optimal conditions
        high-stress? (or (> cpu-temp 75.0) (> mem-util 80.0))
        optimal? (not high-stress?)

        neurons (or (:neurons state) (init-neurons))
        
        ;; Apply stress or steady state input currents
        stressed-neurons (cond
                           high-stress?
                           (do
                             (println "[BIOLOGY] 🛑 High stress detected! Injecting positive current to inhibitory-neuron. Temp:" cpu-temp "°C, Mem:" mem-util "%")
                             (inject-current neurons :inhibitory-neuron 25.0))
                           
                           optimal?
                           (do
                             (println "[BIOLOGY] ✨ Operating in optimal conditions. Injecting steady current to sensory-neuron.")
                             (inject-current neurons :sensory-neuron 10.0))
                           
                           :else neurons)

        leak-factor (:leak-factor config 0.95)
        fire-thresh (:fire-threshold config V_THRESH)
        
        ;; 1. Apply Leakage to all neurons (exponential decay towards V_REST)
        leaked-neurons (into {} (for [[id neuron] stressed-neurons]
                                  [id (update neuron :v (fn [v] (+ V_REST (* (- v V_REST) leak-factor))))]))
        
        ;; 2. Detect spikes from sensory or economic neurons first to project synaptic currents
        sensory-spike? (>= (get-in leaked-neurons [:sensory-neuron :v]) fire-thresh)
        economic-spike? (>= (get-in leaked-neurons [:economic-neuron :v]) fire-thresh)
        high-stress-spike? (and high-stress? (>= (get-in leaked-neurons [:inhibitory-neuron :v]) fire-thresh))
        inhibitory-spike? (or (>= (get-in leaked-neurons [:inhibitory-neuron :v]) fire-thresh) high-stress-spike?)
        
        ;; 3. Handle inhibitory suppression: if inhibitory spiked, hyperpolarize cognitive neuron
        cognitive-input-current (+ (if sensory-spike? (:sensory-weight config 15.0) 0.0)
                                   (if economic-spike? (:economic-weight config 15.0) 0.0)
                                   (if inhibitory-spike? -50.0 0.0))
        
        ;; Apply current to cognitive neuron
        neurons-with-current (if (not= 0.0 cognitive-input-current)
                               (update-in leaked-neurons [:cognitive-neuron :v] + cognitive-input-current)
                               leaked-neurons)
        
        ;; 4. Check all neurons for final spikes and reset potentials
        now (System/currentTimeMillis)
        final-neurons (into {} (for [[id neuron] neurons-with-current]
                                 (let [v (:v neuron)
                                       spiked? (>= v fire-thresh)]
                                   [id (if spiked?
                                         (do
                                           (println (str "[BIOLOGY] " (name id) " SPIKED!"))
                                           (assoc neuron :v V_RESET :last-spike-time now))
                                         neuron)])))
        
        ;; Cognitive spike wakes up the orchestrator
        cognitive-spike? (>= (get-in neurons-with-current [:cognitive-neuron :v]) fire-thresh)]
    
    (cond-> (assoc state :neurons final-neurons)
      cognitive-spike? (assoc-in [:context :cognitive-spike-alert] now))))
