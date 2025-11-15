"use client"

import { Checkbox } from "./ui/checkbox"
import { Award, CalendarDays, ChevronDown, ChevronUp, DollarSign, Plane, Users, Zap } from "lucide-react"
import Link from "next/link"
import type { Dispatch, SetStateAction } from "react"

type SortOption = "best" | "cheapest" | "fastest"

interface SearchResultsHeaderProps {
  expandedSearch: boolean
  setExpandedSearch: Dispatch<SetStateAction<boolean>>
  tripType: string
  setTripType: Dispatch<SetStateAction<string>>
  handleSearch: () => void
  filteredFlightsCount: number
  sortOption: SortOption
  setSortOption: Dispatch<SetStateAction<SortOption>>
}

export default function SearchResultsHeader({
  expandedSearch,
  setExpandedSearch,
  tripType,
  setTripType,
  handleSearch,
  filteredFlightsCount,
  sortOption,
  setSortOption,
}: SearchResultsHeaderProps) {
  return (
    <>
      <header className="flex h-16 w-full items-center justify-between px-4 md:px-6 border-b-1">
        <Link className="flex items-center gap-2 text-lg font-semibold md:text-base" href="/">
          <Plane className="h-6 w-6" />
          <span className="sr-only">Stopover</span>
          <span>Stopover</span>
        </Link>
      </header>

      {/* Collapsible search panel - Improved for mobile */}
      <div className="border-t border-gray-100">
        {/* Collapsed search summary bar - more visible and mobile-friendly */}
        <div
          className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
          onClick={() => setExpandedSearch(!expandedSearch)}
        >
          {/* Mobile-optimized layout */}
          <div className="w-full sm:w-auto">
            {/* Route info */}
            <div className="flex items-center mb-2 sm:mb-0">
              <div className="flex items-center">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="flex items-center">
                    <span className="font-medium">Toronto (YYZ)</span>
                    <span className="mx-2">→</span>
                    <span className="font-medium">Seattle (SEA)</span>
                  </div>

                  {/* Date and passengers - stacked on mobile, inline on desktop */}
                  <div className="flex items-center mt-2 sm:mt-0 sm:ml-4 text-sm text-gray-500">
                    <CalendarDays size={14} className="mr-1 hidden sm:inline" />
                    <span>Dec 20, 2023</span>
                    <span className="mx-2 hidden sm:inline">•</span>
                    <Users size={14} className="mr-1 ml-2 sm:ml-0 hidden sm:inline" />
                    <span>2 Adults, 1 Child</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit button - full width on mobile */}
          <button className="flex items-center justify-center bg-white border border-gray-200 px-3 py-1.5 rounded-lg w-full sm:w-auto mt-2 sm:mt-0">
            <span className="text-sm mr-2">{expandedSearch ? "Hide search" : "Edit search"}</span>
            {expandedSearch ? (
              <ChevronUp size={16} className="text-gray-500" />
            ) : (
              <ChevronDown size={16} className="text-gray-500" />
            )}
          </button>
        </div>

        {/* Expanded search panel */}
        {expandedSearch && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            {/* Trip type selector */}
            <div className="grid grid-cols-3 gap-2 mb-6 max-w-md">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* From section */}
              <div className="lg:col-span-1">
                <div className="text-xs text-gray-500 mb-1">FROM</div>
                <div className="text-xl font-bold mb-1">Toronto (YYZ)</div>
                <div className="text-sm text-gray-500">Toronto Pearson International Airport</div>
              </div>

              {/* To section */}
              <div className="bg-lime-100 p-3 rounded-xl lg:col-span-1">
                <div className="text-xs text-gray-500 mb-1">TO</div>
                <div className="text-xl font-bold mb-1">Seattle (SEA)</div>
                <div className="text-sm text-gray-500">Seattle-Tacoma International Airport</div>
              </div>

              {/* Travel dates */}
              <div className="lg:col-span-1">
                <div className="text-xs text-gray-500 mb-2">TRAVEL DATES</div>
                <div className="flex items-center border border-gray-200 rounded-lg p-2 bg-white">
                  <CalendarDays size={16} className="text-gray-400 mr-2" />
                  <span className="text-sm">Tue, December 20, 2023</span>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="text-xs text-gray-500 mb-2">RETURN</div>
                <div className="flex items-center border border-gray-200 rounded-lg p-2 bg-white">
                  <CalendarDays size={16} className="text-gray-400 mr-2" />
                  <span className="text-sm">Sun, March 26, 2024</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Passengers */}
              <div className="lg:col-span-2">
                <div className="text-xs text-gray-500 mb-2">PASSENGERS & CLASS</div>
                <div className="flex justify-between items-center border border-gray-200 rounded-lg p-2 bg-white">
                  <div>
                    <div className="text-sm">2 Adults, 1 Children</div>
                    <div className="text-xs text-gray-500">Business Class</div>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              </div>

              {/* Flexible dates */}
              <div className="flex items-center lg:col-span-1">
                <Checkbox id="flexible-search" className="mr-2" />
                <label htmlFor="flexible-search" className="text-sm">
                  My date are flexible (+/- days)
                </label>
              </div>

              {/* Search button */}
              <div className="lg:col-span-1">
                <button className="w-full bg-black text-white py-3 rounded-full font-medium" onClick={handleSearch}>
                  Update Search
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flight Results Header and Sort Options */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 px-4 md:px-6 py-2">
        <div>
          <h2 className="text-xl font-bold">Flight Results</h2>
          <p className="text-sm text-gray-500">10 flights found from Toronto to Seattle on Tue, Dec 20</p>
        </div>

        {/* Sort options */}
        <div className="flex flex-wrap gap-2 flex-shrink-0 mt-4 md:mt-0">
          <button
            onClick={() => setSortOption("best")}
            className={`flex items-center px-3 py-2 rounded-lg text-sm ${
              sortOption === "best" ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-700"
            }`}
          >
            <Award size={16} className="mr-2" />
            Best
          </button>
          <button
            onClick={() => setSortOption("cheapest")}
            className={`flex items-center px-3 py-2 rounded-lg text-sm ${
              sortOption === "cheapest" ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-700"
            }`}
          >
            <DollarSign size={16} className="mr-2" />
            Cheapest
          </button>
          <button
            onClick={() => setSortOption("fastest")}
            className={`flex items-center px-3 py-2 rounded-lg text-sm ${
              sortOption === "fastest" ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-700"
            }`}
          >
            <Zap size={16} className="mr-2" />
            Fastest
          </button>
        </div>
      </div>
    </>
  )
}
