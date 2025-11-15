package test

// import (
// 	"context"
// 	"encoding/json"
// 	"log"
// 	"net/http"
// 	"os"
// 	"sync"
// 	"time"

// 	"github.com/joho/godotenv"
// 	"github.com/rs/cors"
// )

// // Global variable to store the latest search results
// var (
// 	latestResults *FlightSearchResponseWrapper
// 	resultsMutex  sync.RWMutex
// )

// // Handler for the /api/flights endpoint
// func getFlightsHandler(w http.ResponseWriter, r *http.Request) {
// 	resultsMutex.RLock()
// 	defer resultsMutex.RUnlock()

// 	if latestResults == nil {
// 		http.Error(w, "No flight data available", http.StatusNotFound)
// 		return
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(latestResults)
// }

// // Function to perform flight search
// func performFlightSearch(client *Client, token, marker, host string) {
// 	ctx := context.Background()

// 	// Prepare your search request (populate with real data)
// 	req := FlightSearchRequest{
// 		Marker:    marker,           // Your partner marker
// 		Host:      host,             // The host from which the search is performed
// 		UserIP:    "73.115.209.223", // User's IP address
// 		Locale:    "en",             // Language for the search results
// 		TripClass: "Y",              // Economy class. Use "B" for Business, "F" for First Class
// 		Passengers: PassengerInfo{
// 			Adults:   1,
// 			Children: 0,
// 			Infants:  0,
// 		},
// 		Segments: []Segment{
// 			{
// 				Origin:      "DEL",        // Delhi Airport
// 				Destination: "COK",        // Cochin Airport
// 				Date:        "2025-10-01", // Date should be within reasonable future date
// 			},
// 		},
// 	}

// 	log.Printf("Request provided: %+v", req)

// 	// Generate the signature and add it to the request
// 	req.Signature = GenerateSignature(
// 		token,
// 		req.Marker,
// 		req.Host,
// 		req.Locale,
// 		req.TripClass,
// 		req.UserIP,
// 		req.Passengers,
// 		req.Segments,
// 	)

// 	log.Printf("Request with signature: %+v", req)

// 	// Call InitSearch
// 	initResp, err := client.InitSearch(ctx, req)
// 	if err != nil {
// 		log.Printf("Failed to initialize search: %v", err)
// 		return
// 	}

// 	log.Printf("Search initialized with ID: %s", initResp.SearchID)

// 	// Fetch results using the search ID with polling
// 	// Configure polling parameters: 10 attempts with 2 second intervals
// 	results, err := client.GetSearchResultsWithPolling(ctx, initResp.SearchID, 10, 2*time.Second)
// 	if err != nil {
// 		log.Printf("Failed to get search results: %v", err)
// 		return
// 	}

// 	// Store the results in the global variable
// 	resultsMutex.Lock()
// 	latestResults = results
// 	resultsMutex.Unlock()

// 	log.Printf("Search results updated")
// }

// func main() {
// 	InitLogger("aviasales.log")

// 	log.Println("Starting Aviasales API client and server")

// 	// Load .env file
// 	err := godotenv.Load()
// 	if err != nil {
// 		log.Fatalf("Error loading .env file: %v", err)
// 	}

// 	// Get values from environment variables
// 	token := os.Getenv("AVIASALES_TOKEN")
// 	marker := os.Getenv("AVIASALES_MARKER")
// 	host := os.Getenv("AVIASALES_HOST")

// 	log.Printf("Token: %s\nMarker: %s\nHost: %s", token, marker, host)

// 	// Initialize client with your token, marker, host
// 	client := NewClient(token, marker, host,)

// 	// Perform initial flight search
// 	go performFlightSearch(client, token, marker, host)

// 	// Set up CORS middleware
// 	corsMiddleware := cors.New(cors.Options{
// 		AllowedOrigins:   []string{"http://localhost:3000"},
// 		AllowedMethods:   []string{"GET", "OPTIONS"},
// 		AllowCredentials: true,
// 	})

// 	// Set up HTTP server
// 	mux := http.NewServeMux()
// 	mux.HandleFunc("/api/flights", getFlightsHandler)

// 	// Apply CORS middleware
// 	handler := corsMiddleware.Handler(mux)

// 	// Start the server
// 	log.Println("Starting server on :8080")
// 	if err := http.ListenAndServe(":8080", handler); err != nil {
// 		log.Fatalf("Failed to start server: %v", err)
// 	}
// }
