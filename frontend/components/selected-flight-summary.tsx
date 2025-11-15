"use client"

import Image from "next/image"
import { ArrowLeft, Clock } from "lucide-react"

interface SelectedFlightSummaryProps {
  selectedFlightData: {
    id: number
    airline: string
    logo: string
    departureTime: string
    arrivalTime: string
    duration: string
    departureAirport: string
    arrivalAirport: string
    price: string
    stops: string
    amenities: string[]
    checkedBag: boolean
    handBaggage: boolean
    rating: number
  } | null
  handleBackToResults: () => void
}

export default function SelectedFlightSummary({ selectedFlightData, handleBackToResults }: SelectedFlightSummaryProps) {
  if (!selectedFlightData) return null

  return (
    <>
      <div className="mb-4">
        <button onClick={handleBackToResults} className="flex items-center text-gray-600 hover:text-black mb-4">
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to results</span>
        </button>

        <h2 className="text-xl font-bold">Compare Booking Options</h2>
        <p className="text-sm text-gray-500">
          {selectedFlightData.airline} flight from Toronto to Seattle on Tue, Dec 20
        </p>
      </div>

      {/* Selected flight summary */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 mr-3 relative">
              <Image
                src={selectedFlightData.logo || "/placeholder.svg"}
                alt={selectedFlightData.airline}
                fill
                className="object-contain"
              />
            </div>
            <span className="font-medium">{selectedFlightData.airline}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="text-xl font-bold">{selectedFlightData.departureTime}</div>
            <div className="text-sm text-gray-500">{selectedFlightData.departureAirport}</div>
          </div>

          <div className="flex-1 mx-4">
            <div className="h-[1px] flex-1 bg-gray-300"></div>
            <div className="mx-2 text-xs text-gray-500 flex items-center">
              <Clock size={12} className="mr-1" />
              {selectedFlightData.duration}
            </div>
            <div className="h-[1px] flex-1 bg-gray-300"></div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold">{selectedFlightData.arrivalTime}</div>
            <div className="text-sm text-gray-500">{selectedFlightData.arrivalAirport}</div>
          </div>
        </div>
      </div>
    </>
  )
}
