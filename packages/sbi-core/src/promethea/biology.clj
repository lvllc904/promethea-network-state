(ns promethea.biology
  (:require [clojure.core.async :as async]))

;; --- SNN Constants ---
(def V_REST -70.0)
(def V_THRESH -55.0)
(def V_RESET -75.0)
(def TAU_M 20.0)
(def DT 1.0)

;; --- Data Structures ---

(defrecord Neuron [id v last-spike-time])
(defrecord Synapse [from to weight last-activity])

(defn create-neuron [id]
  (->Neuron id V_REST -1.0))

(defn create-synapse [from to weight]
  (->Synapse from to weight 0.0))

;; --- LIF Logic ---

(defn update-neuron [neuron input-current]
  (let [dv (/ (+ (- V_REST (:v neuron)) input-current) TAU_M)
        new-v (+ (:v neuron) (* dv DT))
        spike? (>= new-v V_THRESH)]
    (if spike?
      (assoc neuron :v V_RESET :last-spike-time (System/currentTimeMillis))
      (assoc neuron :v new-v))))

;; --- STDP Logic ---

(defn update-synapse [synapse pre-neuron post-neuron]
  ;; Placeholder for STDP weight update based on spike timing
  synapse)

;; --- Population Logic ---

(defn tick-neurons [state]
  ;; For now, just a dummy update to show it's alive
  (let [tick (:tick state)]
    (if (zero? (mod tick 10))
      (println "[BIOLOGY] SNN Spike Event!")
      nil)
    state))
