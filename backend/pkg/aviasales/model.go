package aviasales

import (
	"encoding/json"
	"fmt"
)

// Request structures
type PassengerInfo struct {
	Adults   int `json:"adults"`
	Children int `json:"children"`
	Infants  int `json:"infants"`
}

type Segment struct {
	Origin      string `json:"origin"`
	Destination string `json:"destination"`
	Date        string `json:"date"`
}

type FlightSearchRequest struct {
	Signature  string        `json:"signature"`
	Marker     string        `json:"marker"`
	Host       string        `json:"host"`
	UserIP     string        `json:"user_ip"`
	Locale     string        `json:"locale"`
	TripClass  string        `json:"trip_class"`
	Passengers PassengerInfo `json:"passengers"`
	Segments   []Segment     `json:"segments"`
}

// Response structures
type FlightSearchInitResponse struct {
	SearchID string `json:"search_id"`
	UUID     string `json:"uuid"`
}

type FlightSearchResponseWrapper struct {
	Proposals []Proposal         `json:"proposals"`
	SearchID  string             `json:"search_id"`
	Airports  map[string]Airport `json:"airports,omitempty"`
	Airlines  map[string]Airline `json:"airlines,omitempty"`
	Currency  string             `json:"currency,omitempty"`
}

// Core flight data structures
type Proposal struct {
	Terms         map[string]TermData `json:"terms"`
	Segment       []FlightSegment     `json:"segment"`
	TotalDuration int                 `json:"total_duration"`
	Carriers      []string            `json:"carriers"`
	IsDirect      bool                `json:"is_direct"`
	Sign          string              `json:"sign"`
}

// FlexibleURL handles both string and number types for URL field
type FlexibleURL struct {
	Value interface{}
}

// UnmarshalJSON implements custom unmarshaling for FlexibleURL
func (f *FlexibleURL) UnmarshalJSON(data []byte) error {
	// First try to unmarshal as string
	var str string
	if err := json.Unmarshal(data, &str); err == nil {
		f.Value = str
		return nil
	}

	// If that fails, try as number
	var num float64
	if err := json.Unmarshal(data, &num); err == nil {
		f.Value = num
		return nil
	}

	// If both fail, try as null
	var null interface{}
	if err := json.Unmarshal(data, &null); err == nil && null == nil {
		f.Value = nil
		return nil
	}

	return fmt.Errorf("cannot unmarshal %s into FlexibleURL", data)
}

// String returns string representation of the URL
func (f *FlexibleURL) String() string {
	if f.Value == nil {
		return ""
	}
	switch v := f.Value.(type) {
	case string:
		return v
	case float64:
		return fmt.Sprintf("%.0f", v)
	default:
		return fmt.Sprintf("%v", v)
	}
}

type TermData struct {
	Currency     string      `json:"currency"`
	Price        float64     `json:"price"`
	UnifiedPrice float64     `json:"unified_price"`
	URL          FlexibleURL `json:"url"`
}

type FlightSegment struct {
	Flight []Flight `json:"flight"`
}

type Flight struct {
	Aircraft         string `json:"aircraft"`
	Arrival          string `json:"arrival"`
	ArrivalDate      string `json:"arrival_date"`
	ArrivalTime      string `json:"arrival_time"`
	Departure        string `json:"departure"`
	DepartureDate    string `json:"departure_date"`
	DepartureTime    string `json:"departure_time"`
	Duration         int    `json:"duration"`
	MarketingCarrier string `json:"marketing_carrier"`
	OperatingCarrier string `json:"operating_carrier"`
	Number           string `json:"number"`
	TripClass        string `json:"trip_class"`
}

// Metadata structures
type Airport struct {
	Name        string `json:"name"`
	City        string `json:"city"`
	CityCode    string `json:"city_code"`
	Country     string `json:"country"`
	CountryCode string `json:"country_code"`
	TimeZone    string `json:"time_zone"`
}

type Airline struct {
	IATA string `json:"iata"`
	Name string `json:"name"`
}
