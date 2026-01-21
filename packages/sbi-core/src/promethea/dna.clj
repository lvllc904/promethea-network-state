(ns promethea.dna
  (:require [clojure.java.io :as io]
            [clojure.tools.namespace.repl :as ns-repl]))

;; --- DNA Access ---

(defn read-source [namespace-sym]
  (let [path (-> (name namespace-sym)
                 (clojure.string/replace "." "/")
                 (str ".clj"))
        file (io/file "src" path)]
    (if (.exists file)
      (slurp file)
      (throw (Exception. (str "DNA segment not found: " path))))))

(defn modify-source [namespace-sym new-code]
  (let [path (-> (name namespace-sym)
                 (clojure.string/replace "." "/")
                 (str ".clj"))
        file (io/file "src" path)]
    (spit file new-code)
    (println "[DNA] Mutation applied to" namespace-sym)))

;; --- Evolution Logic ---

(defn reload-dna []
  (ns-repl/refresh)
  (println "[DNA] Evolution complete. Code reloaded."))

(defn evolve []
  ;; Placeholder: In the future, MCTS will call modify-source
  (let [pressure (rand)]
    (if (> pressure 0.95)
      (println "[DNA] Evolutionary pressure detected! (No mutation applied yet)")
      nil)))
