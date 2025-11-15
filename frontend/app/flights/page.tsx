"use client"

import { useState, useRef, useEffect } from "react"

import SearchResultsHeader from "../../components/search-results-header"
import FlightFilters from "../../components/flight-filters"
import FlightCard from "../../components/flight-card"
import FlightPagination from "../../components/flight-pagination"
import NoFlightsFound from "../../components/no-flights-found"
import SelectedFlightSummary from "../../components/selected-flight-summary"

// Sort options
type SortOption = "best" | "cheapest" | "fastest"

// Interface for flight data from API
interface ApiFlightDetail {
  aircraft: string
  arrival: string
  arrival_date: string
  arrival_time: string
  departure: string
  departure_date: string
  departure_time: string
  duration: number
  marketing_carrier: string
  number: string
  operating_carrier: string
}

interface ApiSegment {
  flight: ApiFlightDetail[]
}

interface ApiTerms {
  [key: string]: {
    currency: string
    price: number
    unified_price: number
  }
}

interface ApiProposal {
  terms: ApiTerms
  segment: ApiSegment[]
}

// Helper function to create a default flight object when data is missing
function createDefaultFlightObject(index: number, price: number) {
  const formattedPrice = Math.round(price)

  return {
    id: index + 1,
    airline: "Unknown Airline",
    logo: "/placeholder.svg?height=40&width=40",
    departureTime: "00:00",
    arrivalTime: "00:00",
    duration: "0h 0m",
    durationMinutes: 0,
    departureAirport: "N/A",
    arrivalAirport: "N/A",
    price: `$${formattedPrice.toLocaleString('en-US')}`,
    priceValue: formattedPrice,
    stops: "N/A",
    stopCount: 0,
    amenities: [],
    checkedBag: false,
    handBaggage: true,
    rating: 3.0,
  }
}

// Helper function to get airline name from carrier code
function getAirlineName(carrierCode: string | undefined): string {
  if (!carrierCode) return "Unknown Airline"

  const airlineMap: {[key: string]: string} = {
    "IX": "Air India Express",
    "AI": "Air India",
    "UK": "Vistara",
    "6E": "IndiGo",
    "SG": "SpiceJet",
    "G8": "GoAir",
    "I5": "AirAsia India",
    "QP": "Akasa Air"
  }

  return airlineMap[carrierCode] || `${carrierCode} Airlines`
}

// Add a small helper at top-level
function formatCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Math.round(value))
  } catch {
    // Fallback if currency code is unrecognized
    return `${currency} ${Math.round(value).toLocaleString('en-US')}`
  }
}

// Inside transformApiFlights
const transformApiFlights = (apiFlights: ApiProposal[] | null): any[] => {
  if (!apiFlights || apiFlights.length === 0) return []

  return apiFlights.map((proposal, index) => {
    try {
      if (!proposal.segment || proposal.segment.length === 0 ||
          !proposal.segment[0].flight || proposal.segment[0].flight.length === 0) {
        return createDefaultFlightObject(index, 0)
      }

      const segment = proposal.segment[0]
      const flights = segment.flight
      const totalDuration = flights.reduce((total, f) => total + (f.duration || 0), 0)
      const firstFlight = flights[0]
      const lastFlight = flights[flights.length - 1]
      const airline = getAirlineName(firstFlight.marketing_carrier)
      const stopCount = Math.max(0, flights.length - 1)

      const termKey = Object.keys(proposal.terms)[0]
      const term = termKey ? proposal.terms[termKey] : undefined

      const originalPrice = term?.price ?? 0
      const currency = term?.currency ?? 'USD' // default safe fallback

      // Prefer `unified_price` for sorting across mixed currencies (if provided by API)
      const sortValue = term?.unified_price ?? originalPrice

      return {
        id: index + 1,
        airline,
        logo: "/placeholder.svg?height=40&width=40",
        departureTime: firstFlight.departure_time || "00:00",
        arrivalTime: lastFlight.arrival_time || "00:00",
        duration: `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`,
        durationMinutes: totalDuration,
        departureAirport: firstFlight.departure || "N/A",
        arrivalAirport: lastFlight.arrival || "N/A",

        // Display the original currency
        price: formatCurrency(originalPrice, currency),

        // Keep a numeric value for sorting/pagination (normalized when possible)
        priceValue: Math.round(sortValue),

        // Also keep these if you want to use/show them elsewhere
        originalPriceValue: Math.round(originalPrice),
        currency,

        stops: stopCount === 0 ? "Nonstop" : `${stopCount} stop${stopCount > 1 ? 's' : ''}`,
        stopCount,
        amenities: [],
        checkedBag: sortValue > 100, // heuristic, unchanged
        handBaggage: true,
        rating: 3.5,
      }
    } catch (error) {
      console.error(`Error transforming proposal at index ${index}:`, error)
      return createDefaultFlightObject(index, 0)
    }
  })
}

export default function FlightsPage() {
  const [tripType, setTripType] = useState("one-way")
  const [selectedFlight, setSelectedFlight] = useState<number | null>(null)
  const [filters, setFilters] = useState({
    checkedBag: false,
    handBaggage: false,
    airlines: [] as string[],
  })
  const [expandedSearch, setExpandedSearch] = useState(false)
  const [showAllAirlines, setShowAllAirlines] = useState(false)
  const [sortOption, setSortOption] = useState<SortOption>("best")
  const [currentPage, setCurrentPage] = useState(1)
  const resultsRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const resultsPerPage = 5
  const [showFilters, setShowFilters] = useState(false)
  const [flightResults, setFlightResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [airlines, setAirlines] = useState<string[]>([])

  // Fetch flight data from API
  useEffect(() => {
    const fetchFlightData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Build API base similar to AirportSelect normalization
        const raw = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8084'
        let apiBase = ''
        try {
          const u = new URL(raw)
          apiBase = `${u.origin}/api`
        } catch {
          const origin = raw.replace(/\/$/, '')
          apiBase = /\/api(\/|$)/.test(origin) ? origin.replace(/\/api(?:\/.*)?$/, '/api') : `${origin}/api`
        }

        // Read query params from the current URL
        const params = new URLSearchParams(window.location.search)
        const originCode = params.get('origin')
        const destinationCode = params.get('destination')
        const departure = params.get('departure')
        const ret = params.get('return')
        const adults = params.get('adults') || '1'
        const tripType = params.get('tripType') || 'one-way'

        if (!originCode || !destinationCode || !departure) {
          throw new Error('Missing required search parameters in URL')
        }

        const qs = new URLSearchParams()
        qs.set('origin', originCode)
        qs.set('destination', destinationCode)
        qs.set('departure', departure)
        qs.set('adults', adults)
        qs.set('tripType', tripType)
        if (ret) qs.set('return', ret)

        const response = await fetch(`${apiBase}/flights?${qs.toString()}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
        })

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        // Check if data has the expected structure
        if (!data || !data.proposals || !Array.isArray(data.proposals)) {
          throw new Error('API response missing expected data structure')
        }

        // Transform API data to frontend format
        const transformedFlights = transformApiFlights(data.proposals)

        if (transformedFlights.length > 0) {
          setFlightResults(transformedFlights)
          const uniqueAirlines = [...new Set(transformedFlights.map(flight => flight.airline))]
          setAirlines(uniqueAirlines)
        } else {
          setError('No flights found from API')
        }
      } catch (err) {
        console.error("Error fetching flight data:", err)

        let errorMessage = "Failed to fetch flight data"

        if (err instanceof Error) {
          if (err.message.includes('missing expected data structure')) {
            errorMessage = "The API response format was invalid"
          } else if (err.message.includes('API request failed with status')) {
            errorMessage = `The API server returned an error: ${err.message}`
          } else {
            errorMessage += `: ${err.message}`
          }
        }

        if (err instanceof TypeError && err.message.includes('fetch')) {
          errorMessage = "Cannot connect to backend server. Please ensure the backend is running at " +
                         (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8084')
        }

        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFlightData()
  }, [])

  // Check if mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setShowAllAirlines(true)
      }
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const handleSearch = () => {
    setSelectedFlight(null)
    setExpandedSearch(false)
    setFilters({
      checkedBag: false,
      handBaggage: false,
      airlines: [],
    })
    setSortOption("best")
    setCurrentPage(1)
    setShowFilters(false)

    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  const handleSelectFlight = (flightId: number) => {
    setSelectedFlight(flightId)
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleBackToResults = () => {
    setSelectedFlight(null)
  }

  const toggleAirlineFilter = (airline: string) => {
    setFilters((prev) => {
      const newAirlines = prev.airlines.includes(airline)
        ? prev.airlines.filter((a) => a !== airline)
        : [...prev.airlines, airline]
      return { ...prev, airlines: newAirlines }
    })
  }

  const toggleFilter = (filterName: "checkedBag" | "handBaggage") => {
    setFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }))
  }

  const clearFilters = () => {
    setFilters({
      checkedBag: false,
      handBaggage: false,
      airlines: [],
    })
  }

  // Apply filters to flight results
  const filteredFlights = flightResults.filter((flight) => {
    if (filters.checkedBag && !flight.checkedBag) return false
    if (filters.handBaggage && !flight.handBaggage) return false
    if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline)) return false
    return true
  })

  // Sort flights based on selected option
  const sortedFlights = [...filteredFlights].sort((a, b) => {
    switch (sortOption) {
      case "cheapest":
        return a.priceValue - b.priceValue
      case "fastest":
        return a.durationMinutes - b.durationMinutes
      case "best":
      default:
        // Simple best value calculation: price + duration weight
        const aScore = a.priceValue * 0.7 + a.durationMinutes * 0.3
        const bScore = b.priceValue * 0.7 + b.durationMinutes * 0.3
        return aScore - bScore
    }
  })

  // Paginate flights
  const totalPages = Math.ceil(sortedFlights.length / resultsPerPage)
  const paginatedFlights = sortedFlights.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage)

  // Get the selected flight data
  const selectedFlightData = selectedFlight ? flightResults.find((flight) => flight.id === selectedFlight) : null

  // Check if any filters are active
  const hasActiveFilters = filters.checkedBag || filters.handBaggage || filters.airlines.length > 0

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gray-900/5"></div>

      {/* Background circles */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gray-200/80"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gray-200/80"></div>
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-lime-300/70"></div>
      <div className="absolute -bottom-10 left-20 w-16 h-16 rounded-full bg-white/70"></div>
      <div className="absolute bottom-40 right-40 w-8 h-8 rounded-full bg-white/70"></div>

      <div className="container mx-auto py-10 px-4 md:px-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <SearchResultsHeader
            expandedSearch={expandedSearch}
            setExpandedSearch={setExpandedSearch}
            tripType={tripType}
            setTripType={setTripType}
            handleSearch={handleSearch}
            filteredFlightsCount={filteredFlights.length}
            sortOption={sortOption}
            setSortOption={setSortOption}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div ref={resultsRef} className="lg:col-span-12 p-6 bg-gray-50">
              {selectedFlight === null ? (
                <>
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-12 h-12 border-4 border-lime-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-4 text-gray-600">Loading flights...</p>
                    </div>
                  ) : (
                    <>
                      {error && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-yellow-700">{error}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Currency indicator */}
                      {flightResults.length > 0 && (
                        <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm text-blue-800">
                             Prices shown in original currencies
                          </div>
                          <div className="text-sm text-blue-600">
                            {filteredFlights.length} flights found
                          </div>
                        </div>
                      )}
                      
                      <FlightFilters
                        showFilters={showFilters}
                        setShowFilters={setShowFilters}
                        hasActiveFilters={hasActiveFilters}
                        clearFilters={clearFilters}
                        filters={filters}
                        toggleFilter={toggleFilter}
                        toggleAirlineFilter={toggleAirlineFilter}
                        airlines={airlines}
                        showAllAirlines={showAllAirlines}
                        setShowAllAirlines={setShowAllAirlines}
                        isMobile={isMobile}
                        filteredFlightsCount={filteredFlights.length}
                      />

                      {paginatedFlights.length > 0 ? (
                        <div className="space-y-4">
                          {paginatedFlights.map((flight) => (
                            <FlightCard key={flight.id} flight={flight} handleSelectFlight={handleSelectFlight} />
                          ))}
                        </div>
                      ) : (
                        <NoFlightsFound clearFilters={clearFilters} />
                      )}

                      <FlightPagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
                    </>
                  )}
                </>
              ) : (
                <SelectedFlightSummary
                  selectedFlightData={selectedFlightData}
                  handleBackToResults={handleBackToResults}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}