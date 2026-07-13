package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

var (
	dbPool      *pgxpool.Pool
	redisClient *redis.Client
	jwtSecret   = []byte(getEnvOrDefault("JWT_SECRET", "promethea-sovereign-intelligence-v5"))
)

func getEnvOrDefault(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func main() {
	ctx := context.Background()

	// Initialize PostgreSQL Connection
	dbUrl := getEnvOrDefault("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/promethea")
	var err error
	dbPool, err = pgxpool.New(ctx, dbUrl)
	if err != nil {
		log.Printf("Warning: Failed to connect to PostgreSQL (Sovereign Ledger): %v", err)
	} else {
		log.Println("[Auth Service] 🏰 Connected to PostgreSQL (Sovereign Ledger)")
		defer dbPool.Close()
		if err := initDB(ctx); err != nil {
			log.Printf("Warning: Failed to initialize database schema: %v", err)
		}
	}

	// Initialize Redis Connection
	redisUrl := getEnvOrDefault("REDIS_URL", "redis://localhost:6379/0")
	opt, err := redis.ParseURL(redisUrl)
	if err != nil {
		log.Printf("Warning: Failed to parse Redis URL: %v", err)
	} else {
		redisClient = redis.NewClient(opt)
		if err := redisClient.Ping(ctx).Err(); err != nil {
			log.Printf("Warning: Failed to connect to Redis: %v", err)
		} else {
			log.Println("[Auth Service] ⚡ Connected to Redis (Ephemeral Memory)")
			defer redisClient.Close()
		}
	}

	r := gin.Default()
	r.Use(corsMiddleware())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy", "service": "authentication-go"})
	})

	r.POST("/auth/challenge", handleChallenge)
	r.POST("/auth/verify", handleVerify)
	r.POST("/auth/register", handleRegister)
	r.POST("/auth/add-syndicate", handleAddSyndicate)

	port := getEnvOrDefault("PORT", "8080")
	log.Printf("[Auth Service] Running on port %s", port)
	r.Run(":" + port)
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

func initDB(ctx context.Context) error {
	_, err := dbPool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS citizens (
			uid VARCHAR(255) PRIMARY KEY,
			decentralized_id VARCHAR(255) UNIQUE NOT NULL,
			display_name VARCHAR(255),
			email VARCHAR(255),
			reputation REAL DEFAULT 0,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);
		CREATE TABLE IF NOT EXISTS citizen_syndicates (
			uid VARCHAR(255),
			syndicate_id VARCHAR(255),
			role VARCHAR(255),
			PRIMARY KEY (uid, syndicate_id)
		);
	`)
	if err != nil {
		return fmt.Errorf("failed to initialize database schema: %w", err)
	}
	return nil
}

type ChallengeRequest struct {
	DID string `json:"did" binding:"required"`
}

func handleChallenge(c *gin.Context) {
	var req ChallengeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "DID is required"})
		return
	}

	address := strings.TrimPrefix(req.DID, "did:prmth:")
	if !common.IsHexAddress(address) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid DID format"})
		return
	}

	challengeBytes := make([]byte, 32)
	rand.Read(challengeBytes)
	challengeHex := hex.EncodeToString(challengeBytes)

	challenge := fmt.Sprintf("Sign this message to authenticate with Promethea Network State:\n\nChallenge: %s\nTimestamp: %d", challengeHex, time.Now().UnixMilli())

	if redisClient != nil {
		err := redisClient.Set(c.Request.Context(), "challenge:"+req.DID, challenge, 5*time.Minute).Err()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store challenge"})
			return
		}
	} else {
		log.Println("Redis not available, challenge not stored (ephemeral memory down)")
	}

	log.Printf("[Auth Service] Challenge generated for DID: %s", req.DID)
	c.JSON(http.StatusOK, gin.H{"challenge": challenge})
}

type VerifyRequest struct {
	DID       string `json:"did" binding:"required"`
	Signature string `json:"signature" binding:"required"`
	UID       string `json:"uid" binding:"required"`
}

func handleVerify(c *gin.Context) {
	var req VerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "DID, signature, and UID are required"})
		return
	}

	if redisClient == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Redis not available"})
		return
	}

	challenge, err := redisClient.Get(c.Request.Context(), "challenge:"+req.DID).Result()
	if err == redis.Nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No challenge found or expired"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve challenge"})
		return
	}

	address := strings.TrimPrefix(req.DID, "did:prmth:")

	// EIP-191 Personal Sign verification
	msg := fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(challenge), challenge)
	hash := crypto.Keccak256Hash([]byte(msg))

	sigBytes, err := hexutil.Decode(req.Signature)
	if err != nil || len(sigBytes) != 65 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid signature format"})
		return
	}
	if sigBytes[64] == 27 || sigBytes[64] == 28 {
		sigBytes[64] -= 27
	}

	pubKey, err := crypto.SigToPub(hash.Bytes(), sigBytes)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Invalid signature"})
		return
	}

	recoveredAddress := crypto.PubkeyToAddress(*pubKey).Hex()
	if !strings.EqualFold(recoveredAddress, address) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Signature mismatch"})
		return
	}

	redisClient.Del(c.Request.Context(), "challenge:"+req.DID)

	syndicates := map[string]string{
		"global":         "citizen",
		"syndicate_zero": "admin",
	}

	if dbPool != nil {
		rows, err := dbPool.Query(c.Request.Context(), "SELECT syndicate_id, role FROM citizen_syndicates WHERE uid = $1", req.UID)
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var syndicateID, role string
				if err := rows.Scan(&syndicateID, &role); err == nil {
					syndicates[syndicateID] = role
				}
			}
		} else {
			log.Printf("Warning: Failed to fetch citizen syndicates: %v", err)
		}
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"uid":        req.UID,
		"did":        req.DID,
		"address":    address,
		"exp":        time.Now().Add(24 * time.Hour).Unix(),
		"syndicates": syndicates,
	})

	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	log.Printf("[Auth Service] Sovereign Authentication successful for DID: %s", req.DID)
	c.JSON(http.StatusOK, gin.H{
		"token":         tokenString,
		"did":           req.DID,
		"authenticated": true,
	})
}

type RegisterRequest struct {
	Email       string `json:"email" binding:"required"`
	Password    string `json:"password" binding:"required"`
	DisplayName string `json:"displayName" binding:"required"`
	DID         string `json:"did" binding:"required"`
}

func handleRegister(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	address := strings.TrimPrefix(req.DID, "did:prmth:")
	if !common.IsHexAddress(address) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid DID format"})
		return
	}

	uidBytes := make([]byte, 16)
	rand.Read(uidBytes)
	uid := hex.EncodeToString(uidBytes)

	if dbPool != nil {
		_, err := dbPool.Exec(c.Request.Context(), 
			"INSERT INTO citizens (uid, decentralized_id, display_name, email) VALUES ($1, $2, $3, $4)",
			uid, req.DID, req.DisplayName, req.Email)
		
		if err != nil {
			log.Printf("Failed to register citizen: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register citizen"})
			return
		}
	} else {
		log.Println("PostgreSQL not connected. Registration logic skipped.")
	}

	log.Printf("[Auth Service] New Sovereign Citizen registered: %s", req.DID)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"uid":     uid,
		"did":     req.DID,
	})
}

type AddSyndicateRequest struct {
	UID         string `json:"uid" binding:"required"`
	SyndicateID string `json:"syndicate_id" binding:"required"`
	Role        string `json:"role" binding:"required"`
	DID         string `json:"did"`
}

func handleAddSyndicate(c *gin.Context) {
	var req AddSyndicateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "uid, syndicate_id, and role are required"})
		return
	}

	if dbPool != nil {
		_, err := dbPool.Exec(c.Request.Context(),
			"INSERT INTO citizen_syndicates (uid, syndicate_id, role) VALUES ($1, $2, $3) ON CONFLICT (uid, syndicate_id) DO UPDATE SET role = $3",
			req.UID, req.SyndicateID, req.Role)
		if err != nil {
			log.Printf("Failed to insert or replace citizen syndicate: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add syndicate"})
			return
		}
	} else {
		log.Println("PostgreSQL not connected. Add syndicate logic skipped.")
	}

	var refreshedToken string
	if req.DID != "" {
		address := strings.TrimPrefix(req.DID, "did:prmth:")
		syndicates := map[string]string{
			"global":         "citizen",
			"syndicate_zero": "admin",
		}
		if dbPool != nil {
			rows, err := dbPool.Query(c.Request.Context(), "SELECT syndicate_id, role FROM citizen_syndicates WHERE uid = $1", req.UID)
			if err == nil {
				defer rows.Close()
				for rows.Next() {
					var syndicateID, role string
					if err := rows.Scan(&syndicateID, &role); err == nil {
						syndicates[syndicateID] = role
					}
				}
			}
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"uid":        req.UID,
			"did":        req.DID,
			"address":    address,
			"exp":        time.Now().Add(24 * time.Hour).Unix(),
			"syndicates": syndicates,
		})
		var err error
		refreshedToken, err = token.SignedString(jwtSecret)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate refreshed token"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "token": refreshedToken})
}
