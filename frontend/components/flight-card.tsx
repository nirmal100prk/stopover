"use client"

import Image from "next/image"
import { Clock, Wifi, Utensils, Monitor, Luggage, Briefcase } from "lucide-react"

interface FlightCardProps {
  flight: {
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
  }
  handleSelectFlight: (flightId: number) => void
}

export default function FlightCard({ flight, handleSelectFlight }: FlightCardProps) {
  return (
    <div key={flight.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 mr-3 relative">
            <Image src={flight.logo || "/placeholder.svg"} alt={flight.airline} fill className="object-contain" />
          </div>
          <span className="font-medium">{flight.airline}</span>
        </div>
        <div className="text-xl font-bold text-lime-600">{flight.price}</div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-center">
          <div className="text-xl font-bold">{flight.departureTime}</div>
          <div className="text-sm text-gray-500">{flight.departureAirport}</div>
        </div>

        <div className="flex-1 mx-4">
          <div className="flex items-center justify-center">
            <div className="h-[1px] flex-1 bg-gray-300"></div>
            <div className="mx-2 text-xs text-gray-500 flex items-center">
              <Clock size={12} className="mr-1" />
              {flight.duration}
            </div>
            <div className="h-[1px] flex-1 bg-gray-300"></div>
          </div>
          <div className="text-center text-xs text-gray-500 mt-1">{flight.stops}</div>
        </div>

        <div className="text-center">
          <div className="text-xl font-bold">{flight.arrivalTime}</div>
          <div className="text-sm text-gray-500">{flight.arrivalAirport}</div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {flight.amenities.includes("wifi") && (
            <div className="text-gray-500 bg-gray-100 p-1 rounded">
              <Wifi size={14} />
            </div>
          )}
          {flight.amenities.includes("food") && (
            <div className="text-gray-500 bg-gray-100 p-1 rounded">
              <Utensils size={14} />
            </div>
          )}
          {flight.amenities.includes("entertainment") && (
            <div className="text-gray-500 bg-gray-100 p-1 rounded">
              <Monitor size={14} />
            </div>
          )}
          {flight.checkedBag && (
            <div className="text-gray-500 bg-gray-100 p-1 rounded">
              <Luggage size={14} />
            </div>
          )}
          {flight.handBaggage && (
            <div className="text-gray-500 bg-gray-100 p-1 rounded">
              <Briefcase size={14} />
            </div>
          )}
        </div>
        <button
          className="bg-lime-100 text-lime-700 px-4 py-2 rounded-lg text-sm font-medium"
          onClick={() => handleSelectFlight(flight.id)}
        >
          Select
        </button>
      </div>
    </div>
  )
}
