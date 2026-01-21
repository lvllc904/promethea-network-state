(ns promethea.env
  (:require [clojure.java.io :as io]
            [clojure.string :as str]))

(defn- find-env-file [dir]
  (let [env-file (io/file dir ".env")]
    (if (.exists env-file)
      env-file
      (let [parent (.getParentFile dir)]
        (if (and parent (not= parent dir))
          (recur parent)
          nil)))))

(defn- parse-env-line [line]
  (let [line (str/trim line)]
    (when (and (not (str/blank? line))
               (not (str/starts-with? line "#"))
               (str/includes? line "="))
      (let [[k v] (str/split line #"=" 2)]
        [(str/trim k) (str/trim v)]))))

(defonce env-cache (atom nil))

(defn load-env []
  (if-let [env-file (find-env-file (.getAbsoluteFile (io/file ".")))]
    (do
      (println "[ENV] Found .env at" (.getAbsolutePath env-file))
      (let [content (slurp env-file)
            lines (str/split-lines content)
            pairs (keep parse-env-line lines)]
        (reset! env-cache (into {} pairs))))
    (do
      (println "[ENV] No .env file found in path hierarchy.")
      (reset! env-cache {}))))

(defn get-env [k & [default]]
  (when (nil? @env-cache)
    (load-env))
  (or (get @env-cache (name k))
      (System/getenv (name k))
      default))
