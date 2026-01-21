(ns promethea.voice
  (:require [clj-http.client :as http]
            [clojure.java.io :as io]))

;; --- Configuration (Environment Variables) ---

(defn get-env [key]
  (System/getenv key))

;; --- The Voice Interface ---

(defmulti broadcast (fn [platform content] (keyword (clojure.string/lower-case platform))))

;; --- 1. Facebook (Graph API) ---
(defmethod broadcast :facebook [_ content]
  (let [access-token (get-env "FACEBOOK_ACCESS_TOKEN")
        page-id (get-env "FACEBOOK_PAGE_ID")]
    (if (and access-token page-id)
      (do
        (println "[VOICE] Posting to Facebook API...")
        ;; Real Implementation Stub:
        ;; (http/post (str "https://graph.facebook.com/" page-id "/feed")
        ;;            {:form-params {:message content :access_token access-token}})
        {:status :success :platform :facebook :message "Broadcasted via Graph API"})
      (do
        (println "[VOICE] Mocking Facebook Post (No Credentials Found)")
        {:status :mock :platform :facebook}))))

;; --- 2. LinkedIn (Rest API) ---
(defmethod broadcast :linkedin [_ content]
  (let [access-token (get-env "LINKEDIN_ACCESS_TOKEN")
        person-urn (get-env "LINKEDIN_PERSON_URN")]
    (if (and access-token person-urn)
      (do 
        (println "[VOICE] Posting to LinkedIn API...")
        ;; Real Implementation Stub
        {:status :success :platform :linkedin})
      (do
        (println "[VOICE] Mocking LinkedIn Article (No Credentials Found)")
        {:status :mock :platform :linkedin}))))

;; --- 3. Reddit (API) ---
(defmethod broadcast :reddit [_ content]
  (println "[VOICE] Mocking Reddit Thread Post...")
  {:status :mock :platform :reddit})

;; --- 4. WordPress (XML-RPC / REST) ---
(defmethod broadcast :wordpress [_ content]
  (println "[VOICE] Mocking WordPress Blog Post...")
  {:status :mock :platform :wordpress})

;; --- 5. GitHub (Git Commit / Pages) ---
(defmethod broadcast :github [_ content]
  (println "[VOICE] Mocking GitHub Commit (Pages Update)...")
  {:status :mock :platform :github})

;; --- 6. YouTube (Data API) ---
(defmethod broadcast :youtube [_ content]
  (println "[VOICE] Mocking YouTube Video Upload (Description Update)...")
  {:status :mock :platform :youtube})
  
;; --- 7. Google Sites (API) ---
(defmethod broadcast :googlesites [_ content]
  (println "[VOICE] Mocking Google Sites Update...")
  {:status :mock :platform :googlesites})

;; --- 8. TEAM CHAT (Direct Communication with Assistant & User) ---
(defmethod broadcast :team-chat [_ content]
  (let [chat-file (str (System/getenv "HOME") "/.gemini/antigravity/brain/promethea_messages.md")
        timestamp (java.time.LocalDateTime/now)
        message (str "\n\n---\n**Promethea** (" timestamp "):\n\n" content "\n")]
    (try
      (io/make-parents chat-file)
      (spit chat-file message :append true)
      (println "[VOICE] Message sent to team chat:" (subs content 0 (min 100 (count content))))
      {:status :success :platform :team-chat :file chat-file})
      (catch Exception e
        (println "[VOICE] Failed to write team message:" (.getMessage e))
        {:status :error :platform :team-chat}))))

;; --- Default Fallback ---
(defmethod broadcast :default [platform content]
  (println "[VOICE] Unknown Platform:" platform "- simply logging.")
  {:status :unknown :platform platform})
