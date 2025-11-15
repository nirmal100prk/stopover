package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"stopover.backend/config"
	"stopover.backend/pkg/aviasales"

	"github.com/gin-gonic/gin"
)

type FlightHandler struct {
	FlightApi aviasales.FlightIntegrationAPI
	Config    *config.Config
}

func NewFlightHandler(flightApi aviasales.FlightIntegrationAPI, config *config.Config) *FlightHandler {
	return &FlightHandler{
		FlightApi: flightApi,
		Config:    config,
	}
}

// SearchFlightsAPI handles GET /api/flights with query params and proxies to Aviasales
func (f *FlightHandler) SearchFlightsAPI(c *gin.Context) {
	ctx := c.Request.Context()
	ip := c.ClientIP()

	origin := c.Query("origin")
	destination := c.Query("destination")
	departure := c.Query("departure") // YYYY-MM-DD
	returnDate := c.Query("return")   // optional YYYY-MM-DD
	adultsStr := c.DefaultQuery("adults", "1")
	tripType := c.DefaultQuery("tripType", "one-way")

	if origin == "" || destination == "" || departure == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing required params: origin, destination, departure"})
		return
	}

	adults := 1
	if n, err := strconv.Atoi(adultsStr); err == nil && n > 0 {
		adults = n
	}

	segments := []aviasales.Segment{
		{Origin: origin, Destination: destination, Date: departure},
	}
	if tripType == "round-trip" && returnDate != "" {
		segments = append(segments, aviasales.Segment{Origin: destination, Destination: origin, Date: returnDate})
	}

	req := aviasales.FlightSearchRequest{
		Marker:    f.Config.AviaSalesConfig.AviaSalesMarker,
		Host:      f.Config.AviaSalesConfig.AviaSalesHost,
		UserIP:    ip,
		Locale:    "en",
		TripClass: "Y",
		Passengers: aviasales.PassengerInfo{
			Adults:   adults,
			Children: 0,
			Infants:  0,
		},
		Segments: segments,
	}

	// Signature generated inside client as well, but safe to set here
	req.Signature = aviasales.GenerateSignature(
		f.Config.AviaSalesConfig.AviaSalesToken,
		req.Marker,
		req.Host,
		req.Locale,
		req.TripClass,
		req.UserIP,
		req.Passengers,
		req.Segments,
	)

	initResp, err := f.FlightApi.InitSearch(ctx, req)
	if err != nil {
		log.Printf("InitSearch error: %v", err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to initialize flight search"})
		return
	}

	results, err := f.FlightApi.GetSearchResultsWithPolling(ctx, initResp.SearchID, 10, 2*time.Second)
	if err != nil {
		log.Printf("Polling error: %v", err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to get search results"})
		return
	}

	c.JSON(http.StatusOK, results)
}

func (f *FlightHandler) SearchFlight(c *gin.Context) {
	ctx := c.Request.Context()
	ip := c.ClientIP()

	log.Printf("Received request from IP: %s", ip)

	// Build request
	req := aviasales.FlightSearchRequest{
		Marker:    f.Config.AviaSalesConfig.AviaSalesMarker,
		Host:      f.Config.AviaSalesConfig.AviaSalesHost,
		UserIP:    ip,
		Locale:    "en",
		TripClass: "Y", // Economy

		Passengers: aviasales.PassengerInfo{
			Adults:   1,
			Children: 0,
			Infants:  0,
		},

		Segments: []aviasales.Segment{
			{
				Origin:      "DEL",
				Destination: "COK",
				Date:        "2025-10-01", // Should be validated or set from user input
			},
		},
	}

	// Generate signature
	req.Signature = aviasales.GenerateSignature(
		f.Config.AviaSalesConfig.AviaSalesToken,
		req.Marker,
		req.Host,
		req.Locale,
		req.TripClass,
		req.UserIP,
		req.Passengers,
		req.Segments,
	)

	log.Printf("[InitSearch] Request: %+v", req)

	// Initialize search
	initResp, err := f.FlightApi.InitSearch(ctx, req)
	if err != nil {
		log.Printf("InitSearch error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize flight search"})
		return
	}

	log.Printf("[InitSearch] Success. Search ID: %s", initResp.SearchID)

	// Poll for results
	results, err := f.FlightApi.GetSearchResultsWithPolling(ctx, initResp.SearchID, 10, 2*time.Second)
	if err != nil {
		log.Printf("Polling error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get search results"})
		return
	}

	log.Printf("[Polling] Success. Found %d results.", len(results.Proposals))
	c.JSON(http.StatusOK, results)
}

// AirportsAutocomplete proxies Aviasales airport autocomplete and returns a simplified payload
func (f *FlightHandler) AirportsAutocomplete(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing query parameter 'q'"})
		return
	}

	// Aviasales autocomplete public endpoint (no auth required)
	url := "https://autocomplete.travelpayouts.com/places2?types[]=airport&locale=en&term=" + q

	resp, err := http.Get(url)
	if err != nil {
		log.Printf("autocomplete request failed: %v", err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to fetch suggestions"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusBadGateway, gin.H{"error": "upstream error", "status": resp.StatusCode})
		return
	}

	var raw []map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "invalid upstream response"})
		return
	}

	type item struct {
		Code    string `json:"code"`
		Name    string `json:"name"`
		City    string `json:"city"`
		Country string `json:"country"`
	}

	res := make([]item, 0, len(raw))
	for _, r := range raw {
		// Aviasales fields: code, name, city_name, country_name
		code, _ := r["code"].(string)
		name, _ := r["name"].(string)
		city, _ := r["city_name"].(string)
		country, _ := r["country_name"].(string)
		if code == "" || name == "" {
			continue
		}
		res = append(res, item{Code: code, Name: name, City: city, Country: country})
	}

	c.JSON(http.StatusOK, gin.H{"items": res})
}
