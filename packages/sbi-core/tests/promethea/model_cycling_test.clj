(ns promethea.model-cycling-test
  (:require [clojure.test :refer :all]
            [promethea.models :as models]
            [promethea.eyes :as eyes]))

(deftest test-community-selection
  (testing "Selection of 'The Architect' for Coding"
    (let [model-id (models/select-best-model {:domain :coding})]
      (is (not (nil? model-id)))
      (println "Coding ->" model-id)))

  (testing "Selection of 'The Auditor' for Finance"
    (let [model-id (models/select-best-model {:domain :finance})]
      (is (not (nil? model-id)))
      (println "Finance ->" model-id)))

  (testing "Selection of 'The Scout' for General Knowledge (Default)"
    (let [model-id (models/select-best-model {:domain :general-knowledge})]
      (is (not (nil? model-id)))
      (println "General ->" model-id)))

  (testing "Selection of 'The Socialite' for Creative/Social"
    (let [model-id (models/select-best-model {:domain :social})]
      (is (not (nil? model-id)))
      (println "Social ->" model-id)))
      
  (testing "Fallback for Unknown Domain"
    (let [model-id (models/select-best-model {:domain :xenobiology})]
      (is (not (nil? model-id)))
      (println "Unknown ->" model-id))))

(run-tests 'promethea.model-cycling-test)
