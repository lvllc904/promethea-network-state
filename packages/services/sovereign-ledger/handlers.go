package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
)

type LedgerHandler struct {
	repo *LedgerRepository
}

func NewLedgerHandler(repo *LedgerRepository) *LedgerHandler {
	return &LedgerHandler{repo: repo}
}

// GetBlobHandler retrieves the encrypted blob for a specific DID.
func (h *LedgerHandler) GetBlobHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	did := r.URL.Query().Get("did")
	if did == "" {
		http.Error(w, "Missing did parameter", http.StatusBadRequest)
		return
	}

	syndicateID := r.URL.Query().Get("syndicate_id")
	if syndicateID == "" {
		syndicateID = "global"
	}

	blob, err := h.repo.GetProfileBlob(r.Context(), did, syndicateID)
	if err != nil {
		log.Printf("Error fetching blob for DID %s: %v", did, err)
		http.Error(w, "Failed to retrieve blob", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/octet-stream")
	w.Write(blob)
}

// PutBlobHandler stores the encrypted blob for a specific DID.
func (h *LedgerHandler) PutBlobHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	did := r.URL.Query().Get("did")
	if did == "" {
		http.Error(w, "Missing did parameter", http.StatusBadRequest)
		return
	}

	syndicateID := r.URL.Query().Get("syndicate_id")
	if syndicateID == "" {
		syndicateID = "global"
	}

	blob, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	if len(blob) == 0 {
		http.Error(w, "Empty blob", http.StatusBadRequest)
		return
	}

	err = h.repo.UpsertProfileBlob(r.Context(), did, syndicateID, blob)
	if err != nil {
		log.Printf("Error upserting blob for DID %s: %v", did, err)
		http.Error(w, "Failed to store blob", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

// GetCRDTEventsHandler retrieves the CRDT event chain for a specific syndicate.
func (h *LedgerHandler) GetCRDTEventsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	syndicateID := r.URL.Query().Get("syndicate_id")
	if syndicateID == "" {
		syndicateID = "global"
	}

	sinceHash := r.URL.Query().Get("since_hash")

	events, err := h.repo.GetCRDTEvents(r.Context(), syndicateID, sinceHash)
	if err != nil {
		log.Printf("Error fetching CRDT events for syndicate %s: %v", syndicateID, err)
		http.Error(w, "Failed to retrieve events", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

// PostCRDTEventsHandler receives a new CRDT event to append to the chain.
func (h *LedgerHandler) PostCRDTEventsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var event CRDTEvent
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if event.SyndicateID == "" {
		event.SyndicateID = "global"
	}

	if event.EventHash == "" || event.DID == "" || event.Action == "" {
		http.Error(w, "Missing required event fields", http.StatusBadRequest)
		return
	}

	err := h.repo.InsertCRDTEvent(r.Context(), event)
	if err != nil {
		log.Printf("Error inserting CRDT event: %v", err)
		http.Error(w, "Failed to store event", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "event_hash": event.EventHash})
}
