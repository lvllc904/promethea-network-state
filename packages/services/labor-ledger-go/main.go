package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	dbPool *pgxpool.Pool
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
		log.Println("[Labor Ledger] 🏰 Connected to PostgreSQL (Sovereign Ledger)")
		defer dbPool.Close()
		if err := initDB(ctx); err != nil {
			log.Printf("Warning: Failed to initialize database schema: %v", err)
		}
	}

	r := gin.Default()
	r.Use(corsMiddleware())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy", "service": "labor-ledger-go"})
	})

	r.GET("/labor", getLaborRecords)
	r.POST("/labor", logLabor)

	port := getEnvOrDefault("PORT", "8081")
	log.Printf("[Labor Ledger] Running on port %s", port)
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
		CREATE TABLE IF NOT EXISTS labor_records (
			id SERIAL PRIMARY KEY,
			citizen_did VARCHAR(255) NOT NULL,
			task_description TEXT NOT NULL,
			hours_logged REAL NOT NULL,
			value_generated REAL DEFAULT 0,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		return fmt.Errorf("failed to initialize database schema: %w", err)
	}
	return nil
}

type LaborEntry struct {
	CitizenDID      string  `json:"citizen_did" binding:"required"`
	TaskDescription string  `json:"task_description" binding:"required"`
	HoursLogged     float64 `json:"hours_logged" binding:"required"`
}

func logLabor(c *gin.Context) {
	var entry LaborEntry
	if err := c.ShouldBindJSON(&entry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	if dbPool == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not connected"})
		return
	}

	var id int
	err := dbPool.QueryRow(c.Request.Context(),
		"INSERT INTO labor_records (citizen_did, task_description, hours_logged) VALUES ($1, $2, $3) RETURNING id",
		entry.CitizenDID, entry.TaskDescription, entry.HoursLogged).Scan(&id)

	if err != nil {
		log.Printf("Failed to insert labor record: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to log labor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "record_id": id})
}

func getLaborRecords(c *gin.Context) {
	if dbPool == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not connected"})
		return
	}

	did := c.Query("did")
	var query string
	var args []interface{}

	if did != "" {
		query = "SELECT id, citizen_did, task_description, hours_logged, value_generated, created_at FROM labor_records WHERE citizen_did = $1 ORDER BY created_at DESC"
		args = append(args, did)
	} else {
		query = "SELECT id, citizen_did, task_description, hours_logged, value_generated, created_at FROM labor_records ORDER BY created_at DESC LIMIT 100"
	}

	rows, err := dbPool.Query(c.Request.Context(), query, args...)
	if err != nil {
		log.Printf("Failed to query labor records: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve records"})
		return
	}
	defer rows.Close()

	var records []map[string]interface{}
	for rows.Next() {
		var id int
		var citizenDid, taskDesc string
		var hours, value float64
		var createdAt interface{}

		err := rows.Scan(&id, &citizenDid, &taskDesc, &hours, &value, &createdAt)
		if err != nil {
			log.Printf("Failed to scan row: %v", err)
			continue
		}

		records = append(records, map[string]interface{}{
			"id":               id,
			"citizen_did":      citizenDid,
			"task_description": taskDesc,
			"hours_logged":     hours,
			"value_generated":  value,
			"created_at":       createdAt,
		})
	}

	c.JSON(http.StatusOK, records)
}
