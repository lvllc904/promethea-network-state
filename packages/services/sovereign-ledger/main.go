package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	log.Println("Sovereign Ledger (PostgreSQL) Service Starting...")

	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		dbUrl = "postgres://sovereign:sovereign_password@localhost:5432/sovereign_ledger"
	}

	pool, err := pgxpool.New(context.Background(), dbUrl)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer pool.Close()

	repo := NewLedgerRepository(pool)
	err = repo.InitializeSchema(context.Background())
	if err != nil {
		log.Fatalf("Failed to initialize schema: %v\n", err)
	}

	handler := NewLedgerHandler(repo)

	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/blob", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			handler.GetBlobHandler(w, r)
		case http.MethodPut:
			handler.PutBlobHandler(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/v1/crdt/events", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			handler.GetCRDTEventsHandler(w, r)
		case http.MethodPost:
			handler.PostCRDTEventsHandler(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "4001"
	}
	addr := ":" + port
	log.Printf("Sovereign Ledger Service listening on %s", addr)
	
	// Apply UCS-ADM Middleware
	protectedMux := UCSADMMiddleware(mux)
	
	if err := http.ListenAndServe(addr, protectedMux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

// UCSADMMiddleware intercepts requests to validate syndicate access claims
func UCSADMMiddleware(next http.Handler) http.Handler {
	jwtSecret := []byte(os.Getenv("JWT_SECRET"))
	if len(jwtSecret) == 0 {
		jwtSecret = []byte("promethea-sovereign-intelligence-v5")
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		syndicateID := r.URL.Query().Get("syndicate_id")
		if syndicateID == "" {
			syndicateID = "global"
		}

		// Allow completely public health checks if we had any, otherwise enforce auth
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing Authorization Header", http.StatusUnauthorized)
			return
		}

		parts := strings.Split(authHeader, "Bearer ")
		if len(parts) != 2 {
			http.Error(w, "Invalid Authorization Header", http.StatusUnauthorized)
			return
		}
		tokenString := parts[1]

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, "Invalid token claims", http.StatusUnauthorized)
			return
		}

		syndicatesInterface, ok := claims["syndicates"]
		if !ok {
			http.Error(w, "Missing syndicates map in token", http.StatusForbidden)
			return
		}

		syndicates, ok := syndicatesInterface.(map[string]interface{})
		if !ok {
			http.Error(w, "Invalid syndicates map format", http.StatusForbidden)
			return
		}

		// Validation check
		if _, authorized := syndicates[syndicateID]; !authorized {
			log.Printf("[UCS-ADM] Blocked unauthorized access. DID: %s requested %s", claims["did"], syndicateID)
			http.Error(w, "Forbidden: You are not authorized for this syndicate", http.StatusForbidden)
			return
		}

		// Pass the validated request to the actual handler
		next.ServeHTTP(w, r)
	})
}
