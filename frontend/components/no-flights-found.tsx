"use client"

import { Filter } from "lucide-react"

interface NoFlightsFoundProps {
  clearFilters: () => void
}

export default function NoFlightsFound({ clearFilters }: NoFlightsFoundProps) {
  return (
    <div className="bg-white rounded-xl p-8 text-center">
      <div className="text-gray-400 mb-2">
        <Filter size={48} className="mx-auto" />
      </div>
      <h3 className="text-lg font-medium mb-2">No flights match your filters</h3>
      <p className="text-gray-500 mb-4">Try adjusting your filters to see more results</p>
      <button onClick={clearFilters} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium">
        Clear all filters
      </button>
    </div>
  )
}
