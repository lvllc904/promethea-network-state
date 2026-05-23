package main

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

type LedgerRepository struct {
	pool *pgxpool.Pool
}

func NewLedgerRepository(pool *pgxpool.Pool) *LedgerRepository {
	return &LedgerRepository{pool: pool}
}

func (r *LedgerRepository) InitializeSchema(ctx context.Context) error {
	query := `
	DO $$ 
	BEGIN 
	  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'citizens') THEN 
	    ALTER TABLE citizens RENAME TO sovereign_profiles; 
	  END IF; 
	END $$;

	CREATE TABLE IF NOT EXISTS sovereign_profiles (
		did TEXT,
		syndicate_id TEXT DEFAULT 'global',
		encrypted_manifest_blob BYTEA,
		entity_type TEXT DEFAULT 'individual',
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW(),
		PRIMARY KEY (did, syndicate_id)
	);

	ALTER TABLE sovereign_profiles ADD COLUMN IF NOT EXISTS syndicate_id TEXT DEFAULT 'global';
	ALTER TABLE sovereign_profiles ADD COLUMN IF NOT EXISTS entity_type TEXT DEFAULT 'individual';

	DO $$
	DECLARE
	    pk_name TEXT;
	    pk_columns TEXT;
	BEGIN
	    SELECT constraint_name INTO pk_name
	    FROM information_schema.table_constraints
	    WHERE table_name = 'sovereign_profiles' AND constraint_type = 'PRIMARY KEY';
	    
	    IF pk_name IS NOT NULL THEN
	        SELECT string_agg(column_name, ',') INTO pk_columns
	        FROM information_schema.key_column_usage
	        WHERE constraint_name = pk_name AND table_name = 'sovereign_profiles';
	        
	        IF pk_columns = 'did' THEN
	            EXECUTE 'ALTER TABLE sovereign_profiles DROP CONSTRAINT ' || pk_name;
	            ALTER TABLE sovereign_profiles ADD PRIMARY KEY (did, syndicate_id);
	        END IF;
	    END IF;
	END $$;

	CREATE TABLE IF NOT EXISTS public_ledger (
		transaction_id TEXT PRIMARY KEY,
		did TEXT NOT NULL,
		event_type TEXT NOT NULL,
		payload JSONB NOT NULL,
		syndicate_id TEXT DEFAULT 'global',
		created_at TIMESTAMPTZ DEFAULT NOW()
	);

	ALTER TABLE public_ledger ADD COLUMN IF NOT EXISTS syndicate_id TEXT DEFAULT 'global';

	CREATE TABLE IF NOT EXISTS crdt_event_chain (
		event_hash TEXT PRIMARY KEY,
		syndicate_id TEXT NOT NULL,
		did TEXT NOT NULL,
		action TEXT NOT NULL,
		previous_hash TEXT,
		encrypted_payload BYTEA,
		created_at TIMESTAMPTZ DEFAULT NOW()
	);
	`
	_, err := r.pool.Exec(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to initialize schema: %w", err)
	}
	log.Println("Sovereign Ledger Schema Initialized.")
	return nil
}

func (r *LedgerRepository) UpsertProfileBlob(ctx context.Context, did string, syndicateID string, blob []byte) error {
	if syndicateID == "" {
		syndicateID = "global"
	}
	query := `
	INSERT INTO sovereign_profiles (did, syndicate_id, encrypted_manifest_blob, updated_at)
	VALUES ($1, $2, $3, NOW())
	ON CONFLICT (did, syndicate_id) DO UPDATE
	SET encrypted_manifest_blob = EXCLUDED.encrypted_manifest_blob,
	    updated_at = NOW();
	`
	_, err := r.pool.Exec(ctx, query, did, syndicateID, blob)
	if err != nil {
		return fmt.Errorf("failed to upsert profile blob: %w", err)
	}
	return nil
}

func (r *LedgerRepository) GetProfileBlob(ctx context.Context, did string, syndicateID string) ([]byte, error) {
	if syndicateID == "" {
		syndicateID = "global"
	}
	var blob []byte
	query := `SELECT encrypted_manifest_blob FROM sovereign_profiles WHERE did = $1 AND syndicate_id = $2`
	err := r.pool.QueryRow(ctx, query, did, syndicateID).Scan(&blob)
	if err != nil {
		return nil, fmt.Errorf("failed to get profile blob: %w", err)
	}
	return blob, nil
}

type CRDTEvent struct {
	EventHash        string `json:"event_hash"`
	SyndicateID      string `json:"syndicate_id"`
	DID              string `json:"did"`
	Action           string `json:"action"`
	PreviousHash     string `json:"previous_hash"`
	EncryptedPayload []byte `json:"encrypted_payload"`
	CreatedAt        string `json:"created_at"`
}

func (r *LedgerRepository) InsertCRDTEvent(ctx context.Context, event CRDTEvent) error {
	query := `
	INSERT INTO crdt_event_chain (event_hash, syndicate_id, did, action, previous_hash, encrypted_payload)
	VALUES ($1, $2, $3, $4, $5, $6)
	ON CONFLICT (event_hash) DO NOTHING
	`
	_, err := r.pool.Exec(ctx, query, event.EventHash, event.SyndicateID, event.DID, event.Action, event.PreviousHash, event.EncryptedPayload)
	if err != nil {
		return fmt.Errorf("failed to insert CRDT event: %w", err)
	}
	return nil
}

func (r *LedgerRepository) GetCRDTEvents(ctx context.Context, syndicateID string, sinceHash string) ([]CRDTEvent, error) {
	var events []CRDTEvent
	
	query := `SELECT event_hash, syndicate_id, did, action, previous_hash, encrypted_payload, created_at FROM crdt_event_chain WHERE syndicate_id = $1 ORDER BY created_at ASC`
	rows, err := r.pool.Query(ctx, query, syndicateID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch CRDT events: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var event CRDTEvent
		err := rows.Scan(&event.EventHash, &event.SyndicateID, &event.DID, &event.Action, &event.PreviousHash, &event.EncryptedPayload, &event.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan CRDT event: %w", err)
		}
		events = append(events, event)
	}
	return events, nil
}
