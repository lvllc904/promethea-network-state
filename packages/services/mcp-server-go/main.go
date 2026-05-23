package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

var (
	redisClient *redis.Client
	upgrader    = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true // Allow all origins for the simulation
		},
	}
)

func getEnvOrDefault(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func main() {
	ctx := context.Background()

	// Initialize Redis Connection (Ephemeral Memory)
	redisUrl := getEnvOrDefault("REDIS_URL", "redis://localhost:6379/0")
	opt, err := redis.ParseURL(redisUrl)
	if err != nil {
		log.Printf("Warning: Failed to parse Redis URL: %v", err)
	} else {
		redisClient = redis.NewClient(opt)
		if err := redisClient.Ping(ctx).Err(); err != nil {
			log.Printf("Warning: Failed to connect to Redis: %v", err)
		} else {
			log.Println("[MCP Server] ⚡ Connected to Redis (Ephemeral Memory)")
			defer redisClient.Close()
		}
	}

	r := gin.Default()
	r.Use(corsMiddleware())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy", "service": "mcp-server-go"})
	})

	r.GET("/ws", handleWebSocket)

	port := getEnvOrDefault("PORT", "3003")
	log.Printf("[MCP Server] Running on port %s", port)
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

func handleWebSocket(c *gin.Context) {
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("[MCP Server] Failed to upgrade websocket: %v", err)
		return
	}
	defer ws.Close()

	log.Println("[MCP Server] New Sovereign WebSocket connection established")

	for {
		messageType, message, err := ws.ReadMessage()
		if err != nil {
			log.Printf("[MCP Server] WebSocket closed: %v", err)
			break
		}

		// Simple echo back for now, representing the Compute Gateway
		log.Printf("[MCP Server] Received message: %s", string(message))
		err = ws.WriteMessage(messageType, []byte("ACK: "+string(message)))
		if err != nil {
			log.Printf("[MCP Server] Failed to write message: %v", err)
			break
		}
	}
}
