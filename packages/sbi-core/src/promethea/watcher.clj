(ns promethea.watcher
  (:require [clojure.tools.namespace.repl :refer [refresh]]
            [clojure.java.io :as io]
            [promethea.biology :as biology])
  (:import [java.nio.file FileSystems StandardWatchEventKinds]))

(defn start-watcher!
  ([paths] (start-watcher! paths nil))
  ([paths on-event-fn]
   (let [watch-service (.newWatchService (FileSystems/getDefault))
         _ (doseq [path paths]
             (let [dir (io/file path)]
               (when (.exists dir)
                 (.register (.toPath dir) watch-service 
                            (into-array [StandardWatchEventKinds/ENTRY_MODIFY 
                                         StandardWatchEventKinds/ENTRY_CREATE 
                                         StandardWatchEventKinds/ENTRY_DELETE])))))]
     (println "[WATCHER] Hot-reload & SNN gating active for:" paths)
     (future
       (loop []
         (let [key (.take watch-service)]
           (doseq [event (.pollEvents key)]
             (let [ctx (.context event)
                   filename (str ctx)]
               (println "[WATCHER] Change detected:" filename)
               (when on-event-fn
                 (try
                   (on-event-fn filename)
                   (catch Exception e
                     (println "[WATCHER] Event callback failed:" (.getMessage e)))))
               (try
                 (refresh)
                 (catch Exception e (println "[WATCHER] Refresh failed:" (.getMessage e))))))
           (.reset key)
           (recur)))))))
