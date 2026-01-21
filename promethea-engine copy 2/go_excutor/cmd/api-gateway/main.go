package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux" // This is an external library we'll install soon
)

// rootHandler is a function that handles requests to the very first page of our API (the "/")
func rootHandler(w http.ResponseWriter, r *http.Request) {
	// w means 'writer' - we write our response here
	// r means 'request' - this contains information about the incoming request
	fmt.Fprint(w, "Go API Gateway is running!") // This sends a text message back to the browser/client
}

// healthCheckHandler is a function to check if our API is running and healthy
func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK) // This tells the client that the request was successful (HTTP status 200)
	fmt.Fprint(w, `{"status": "healthy", "service": "Go API Gateway"}`) // This sends a JSON message back
}

// main is the special function where our Go program starts executing
func main() {
	// Create a new router. A router helps direct incoming web requests to the right handler function.
	router := mux.NewRouter()

	// Define the routes (URLs) and which functions should handle them:
	// If someone visits "/", call rootHandler
	router.HandleFunc("/", rootHandler).Methods("GET") // .Methods("GET") means it only responds to GET requests
	// If someone visits "/health", call healthCheckHandler
	router.HandleFunc("/health", healthCheckHandler).Methods("GET")

	// --- Placeholder for later: This is where we would add routes to talk to the Python ML service ---
	// For example: router.HandleFunc("/predict_action", predictActionHandler).Methods("POST")

	// Get the port number from the computer's environment settings.
	// If no port is specified (e.g., in a Docker container), use 8080 as a default.
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Our API will listen on port 8080 by default
	}

	// Set up the HTTP server with our router and some timeouts
	server := &http.Server{
		Addr:         ":" + port, // This means the server will listen on all available network interfaces on the specified port (e.g., 0.0.0.0:8080)
		Handler:      router,     // Tells the server to use our 'router' to handle requests
		ReadTimeout:  10 * time.Second,  // Maximum time to read the entire request, including the body
		WriteTimeout: 10 * time.Second,  // Maximum time to write the response
		IdleTimeout:  120 * time.Second, // Maximum amount of time a Keep-Alive connection will remain idle before closing itself
	}

	log.Printf("Go API Gateway starting on port %s", port) // Print a message to the terminal saying the server is starting
	// Start the HTTP server. This line will block (wait) until the server is stopped.
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server failed to start: %v", err) // If there's an error starting the server, print it and exit
	}
}