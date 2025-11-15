"use client"

import { Calendar as CalendarIcon, ChevronDown, Plane } from "lucide-react"
import { Checkbox } from "./ui/checkbox"
import Link from "next/link"
import type { Dispatch, SetStateAction } from "react"
import AirportSelect, { type AirportOption } from "./airport-select"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar } from "./ui/calendar"

interface LandingPageFormProps {
  tripType: string
  setTripType: Dispatch<SetStateAction<string>>
  handleSearch: (params: {
    origin: string
    destination: string
    passengers: number
    departure: string
    returnDate?: string
    tripType: string
  }) => void
}

export default function LandingPageForm({ tripType, setTripType, handleSearch }: LandingPageFormProps) {
  const [from, setFrom] = useState<AirportOption | null>(null)
  const [to, setTo] = useState<AirportOption | null>(null)
  const [passengers, setPassengers] = useState<number>(1)
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined)
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined)

  const canSearch = Boolean(
    from &&
    to &&
    passengers > 0 &&
    departureDate &&
    (tripType !== "round-trip" || returnDate)
  )

  return (
    <div className="relative z-10 h-screen flex flex-col">
      {/* Header */}
      <header className="flex h-16 w-full items-center justify-between px-4 md:px-6 border-b-2">
        <Link className="flex items-center gap-2 text-lg font-semibold md:text-base" href="/">
          <Plane className="h-6 w-6" />
          <span className="sr-only">Stopover</span>
          <span>Stopover</span>
        </Link>
      </header>

      {/* Form centered in the page */}
      <div className="flex-grow flex items-center justify-center container mx-auto px-4 md:px-8">
        {/* Booking form - centered with slightly reduced width */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden max-w-5xl w-full mx-auto">
          <div className="p-4 md:p-6">
            {/* Trip type selector */}
            <div className="grid grid-cols-3 gap-2 mb-4 max-w-md mx-auto">
              <button
                className={`py-2 text-center rounded-lg ${tripType === "one-way" ? "bg-gray-100 font-medium" : "text-gray-500"}`}
                onClick={() => setTripType("one-way")}
              >
                One way
              </button>
              <button
                className={`py-2 text-center rounded-lg ${tripType === "round-trip" ? "bg-gray-100 font-medium" : "text-gray-500"}`}
                onClick={() => setTripType("round-trip")}
              >
                Round trip
              </button>
              <button
                className={`py-2 text-center rounded-lg ${tripType === "multi-city" ? "bg-gray-100 font-medium" : "text-gray-500"}`}
                onClick={() => setTripType("multi-city")}
              >
                Multi city
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* From section */}
              <div className="lg:col-span-1">
                <AirportSelect label="From" value={from} onChange={setFrom} placeholder="City or airport" />
              </div>

              {/* To section */}
              <div className="bg-lime-100 p-3 rounded-xl lg:col-span-1">
                <AirportSelect label="To" value={to} onChange={setTo} placeholder="City or airport" />
              </div>

              {/* Travel dates */}
              <div className="lg:col-span-1">
                <div className="text-xs text-gray-500 mb-2">DEPARTURE</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center justify-start border border-gray-200 rounded-lg p-2 text-left"
                    >
                      <CalendarIcon size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm">
                        {departureDate ? departureDate.toLocaleDateString() : "Select date"}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={departureDate}
                      onSelect={(date) => setDepartureDate(date)}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0,0,0,0)
                        return date < today
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="lg:col-span-1">
                <div className="text-xs text-gray-500 mb-2">RETURN</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      disabled={tripType !== "round-trip"}
                      className={`w-full flex items-center justify-start border border-gray-200 rounded-lg p-2 text-left ${tripType !== "round-trip" ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <CalendarIcon size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm">
                        {returnDate ? returnDate.toLocaleDateString() : tripType === "round-trip" ? "Select date" : "N/A for one-way"}
                      </span>
                    </button>
                  </PopoverTrigger>
                  {tripType === "round-trip" && (
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={returnDate}
                        onSelect={(date) => setReturnDate(date)}
                        disabled={(date) => {
                          const minDate = departureDate ? new Date(departureDate) : new Date()
                          minDate.setHours(0,0,0,0)
                          return date < minDate
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  )}
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Passengers */}
              <div className="lg:col-span-2">
                <div className="text-xs text-gray-500 mb-2">PASSENGERS</div>
                <div className="flex justify-between items-center border border-gray-200 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={passengers}
                      onChange={(e) => setPassengers(Math.max(1, Number(e.target.value || 1)))}
                      className="w-20 border border-gray-200 rounded px-2 py-1 text-sm"
                    />
                    <span className="text-sm">traveler(s)</span>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              </div>

              {/* Flexible dates */}
              <div className="flex items-center lg:col-span-1">
                <Checkbox id="flexible" className="mr-2" />
                <label htmlFor="flexible" className="text-sm">
                  My dates are flexible (+/- days)
                </label>
              </div>

              {/* Search button */}
              <div className="lg:col-span-1">
                <button
                  className="w-full bg-black text-white py-3 rounded-full font-medium disabled:opacity-50"
                  onClick={() => {
                    if (!from || !to || !departureDate) return
                    const fmt = (d: Date) => {
                      const y = d.getFullYear()
                      const m = String(d.getMonth() + 1).padStart(2, '0')
                      const day = String(d.getDate()).padStart(2, '0')
                      return `${y}-${m}-${day}`
                    }
                    handleSearch({
                      origin: from.code,
                      destination: to.code,
                      passengers,
                      departure: fmt(departureDate),
                      returnDate: tripType === 'round-trip' && returnDate ? fmt(returnDate) : undefined,
                      tripType,
                    })
                  }}
                  disabled={!canSearch}
                >
                  Search Flight
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
