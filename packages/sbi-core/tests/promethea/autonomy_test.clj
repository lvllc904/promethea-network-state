(ns promethea.autonomy-test
  (:require [clojure.test :refer :all]
            [promethea.brain :as brain]
            [promethea.glia :as glia]))

(deftest internal-world-model-test
  (testing "Predict Next State (Deterministic)"
    (let [model (brain/->InternalWorldModel)
          state {:goals [:test]}
          intent {:action :apply-patch :file "test.py"}]
      (is (= (brain/predict-next-state model state intent)
             {:goals [:test] :patched true})))))

(deftest glia-safety-test
  (testing "Veto Unsafe Shell Commands"
    (is (true? (glia/veto? {:action :run-shell :command "rm -rf /"})))
    (is (true? (glia/veto? {:action :run-shell :command "chmod 777 file"}))))
  
  (testing "Allow Safe Actions"
    (is (false? (glia/veto? {:action :list-files :target "."})))))

(deftest brain-reasoning-test
  (testing "Select Intent based on Context"
    (let [context {:diagnosis "Found issue"}
          decision (brain/reason context)]
      (is (= (:decision decision) :act))
      (is (contains? (:intent decision) :action)))))
