(ns promethea.watcher
  (:require [clojure.tools.namespace.repl :refer [refresh]]
            [clojure.java.io :as io])
  (:import [java.nio.file FileSystems StandardWatchEventKinds]))

(defn start-watcher! [paths]
  (let [watch-service (.newWatchService (FileSystems/getDefault))
        _ (doseq [path paths]
            (let [dir (io/file path)]
                (when (.exists dir)
                    (.register (.toPath dir) watch-service 
                               (into-array [StandardWatchEventKinds/ENTRY_MODIFY 
                                           StandardWatchEventKinds/ENTRY_CREATE 
                                           StandardWatchEventKinds/ENTRY_DELETE])))))]
    (println "[WATCHER] Hot-reload active for:" paths)
    (future
      (loop []
        (let [key (.take watch-service)]
          (doseq [event (.pollEvents key)]
            (println "[WATCHER] Change detected:" (.context event))
            (try
                (refresh)
                (catch Exception e (println "[WATCHER] Refresh failed:" (.getMessage e)))))
          (.reset key)
          (recur))))))
