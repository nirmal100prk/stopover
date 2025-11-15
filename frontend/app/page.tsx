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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-lime-50 via-white to-slate-100">
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-lime-100/60"></div>
      <div className="pointer-events-none absolute -top-24 -right-10 h-72 w-72 rounded-full bg-lime-200/70 blur-2xl"></div>
      <div className="pointer-events-none absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-slate-200/80 blur-2xl"></div>
      <div className="pointer-events-none absolute left-1/2 top-16 h-40 w-40 -translate-x-1/2 rounded-full bg-white/60 blur-xl"></div>
      <div className="pointer-events-none absolute bottom-28 right-24 h-24 w-24 rounded-full bg-lime-300/40 blur-lg"></div>

      <LandingPageForm tripType={tripType} setTripType={setTripType} handleSearch={handleSearch} />
    </div>
  )
}
