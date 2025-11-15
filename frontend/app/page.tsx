"use client"

import { useState } from "react"
import LandingPageForm from "../components/landing-page-form"
import { useRouter } from "next/navigation"

export default function FlightBooking() {
  const [tripType, setTripType] = useState("one-way")
  const router = useRouter()

  const handleSearch = (params: {
    origin: string
    destination: string
    passengers: number
    departure: string
    returnDate?: string
    tripType: string
  }) => {
    const q = new URLSearchParams()
    q.set('origin', params.origin)
    q.set('destination', params.destination)
    q.set('departure', params.departure)
    q.set('adults', String(params.passengers))
    q.set('tripType', params.tripType)
    if (params.returnDate) q.set('return', params.returnDate)
    router.push(`/flights?${q.toString()}`)
  }

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

      <LandingPageForm tripType={tripType} setTripType={setTripType} handleSearch={handleSearch} />
    </div>
  )
}
