"use client"

import { Check, ChevronDown, ChevronUp, Filter, X, Luggage, Briefcase } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"

interface FlightFiltersProps {
  showFilters: boolean
  setShowFilters: Dispatch<SetStateAction<boolean>>
  hasActiveFilters: boolean
  clearFilters: () => void
  filters: {
    checkedBag: boolean
    handBaggage: boolean
    airlines: string[]
  }
  toggleFilter: (filterName: "checkedBag" | "handBaggage") => void
  toggleAirlineFilter: (airline: string) => void
  airlines: string[]
  showAllAirlines: boolean
  setShowAllAirlines: Dispatch<SetStateAction<boolean>>
  isMobile: boolean
  filteredFlightsCount: number
}

export default function FlightFilters({
  showFilters,
  setShowFilters,
  hasActiveFilters,
  clearFilters,
  filters,
  toggleFilter,
  toggleAirlineFilter,
  airlines,
  showAllAirlines,
  setShowAllAirlines,
  isMobile,
}: FlightFiltersProps) {
  const displayedAirlines = isMobile || showAllAirlines ? airlines : airlines.slice(0, 6)
  const hasMoreAirlines = airlines.length > 6

  return (
    <>
      {/* Mobile-optimized filter button */}
      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full sm:w-auto flex items-center justify-center bg-white border border-gray-200 px-4 py-3 rounded-lg shadow-sm"
        >
          <Filter size={16} className="mr-2" />
          <span className="font-medium">Filters</span>
          {hasActiveFilters && (
            <div className="ml-2 bg-lime-100 text-lime-700 text-xs px-2 py-0.5 rounded-full">
              {Object.values(filters).flat().filter(Boolean).length}
            </div>
          )}
          {showFilters ? (
            <ChevronUp size={16} className="ml-2 text-gray-500" />
          ) : (
            <ChevronDown size={16} className="ml-2 text-gray-500" />
          )}
        </button>
      </div>

      {/* Filters section - collapsible */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-100 mb-6 overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b border-gray-100">
            <div className="flex items-center">
              <Filter size={16} className="mr-2" />
              <h3 className="font-medium">Filters</h3>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-gray-500 flex items-center hover:text-black">
                <X size={14} className="mr-1" />
                Clear all
              </button>
            )}
          </div>

          <div className="p-4">
            {/* Baggage filters */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Baggage</h4>
              <div className="space-y-3">
                <div
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                    filters.checkedBag ? "bg-lime-50 border border-lime-200" : "border border-gray-200"
                  }`}
                  onClick={() => toggleFilter("checkedBag")}
                >
                  <div className="flex items-center">
                    <Luggage size={16} className="mr-2 text-gray-500" />
                    <span className="text-sm">Checked bag included</span>
                  </div>
                  {filters.checkedBag && <Check size={16} className="text-lime-600" />}
                </div>
                <div
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                    filters.handBaggage ? "bg-lime-50 border border-lime-200" : "border border-gray-200"
                  }`}
                  onClick={() => toggleFilter("handBaggage")}
                >
                  <div className="flex items-center">
                    <Briefcase size={16} className="mr-2 text-gray-500" />
                    <span className="text-sm">Hand baggage included</span>
                  </div>
                  {filters.handBaggage && <Check size={16} className="text-lime-600" />}
                </div>
              </div>
            </div>

            {/* Airlines filter */}
            <div>
              <h4 className="text-sm font-medium mb-3">Airlines</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                {displayedAirlines.map((airline) => (
                  <div
                    key={airline}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                      filters.airlines.includes(airline)
                        ? "bg-lime-50 border border-lime-200"
                        : "border border-gray-200"
                    }`}
                    onClick={() => toggleAirlineFilter(airline)}
                  >
                    <span className="text-sm">{airline}</span>
                    {filters.airlines.includes(airline) && <Check size={16} className="text-lime-600" />}
                  </div>
                ))}
              </div>
              {hasMoreAirlines && !showAllAirlines && !isMobile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAllAirlines(true)
                  }}
                  className="mt-3 text-sm text-lime-600 hover:text-lime-700"
                >
                  Show all airlines
                </button>
              )}
              {showAllAirlines && !isMobile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAllAirlines(false)
                  }}
                  className="mt-3 text-sm text-lime-600 hover:text-lime-700"
                >
                  Show less
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.checkedBag && (
            <div className="bg-lime-50 text-lime-700 text-xs px-3 py-1 rounded-full flex items-center">
              Checked bag
              <button
                onClick={() => toggleFilter("checkedBag")}
                className="ml-1 hover:text-lime-900"
                aria-label="Remove checked bag filter"
              >
                <X size={12} />
              </button>
            </div>
          )}
          {filters.handBaggage && (
            <div className="bg-lime-50 text-lime-700 text-xs px-3 py-1 rounded-full flex items-center">
              Hand baggage
              <button
                onClick={() => toggleFilter("handBaggage")}
                className="ml-1 hover:text-lime-900"
                aria-label="Remove hand baggage filter"
              >
                <X size={12} />
              </button>
            </div>
          )}
          {filters.airlines.map((airline) => (
            <div key={airline} className="bg-lime-50 text-lime-700 text-xs px-3 py-1 rounded-full flex items-center">
              {airline}
              <button
                onClick={() => toggleAirlineFilter(airline)}
                className="ml-1 hover:text-lime-900"
                aria-label={`Remove ${airline} filter`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
