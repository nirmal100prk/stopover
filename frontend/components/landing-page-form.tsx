"use client"

import { Calendar as CalendarIcon, Check, Minus, Plane, Plus } from "lucide-react"
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

const tripTypeOptions = [
  { id: "one-way", label: "One way" },
  { id: "round-trip", label: "Round trip" },
  { id: "multi-city", label: "Multi city" },
]

export default function LandingPageForm({ tripType, setTripType, handleSearch }: LandingPageFormProps) {
  const [from, setFrom] = useState<AirportOption | null>(null)
  const [to, setTo] = useState<AirportOption | null>(null)
  const [passengers, setPassengers] = useState<number>(1)
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined)
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined)

  const passengerLabel = passengers === 1 ? "traveler" : "travelers"

  const adjustPassengers = (delta: number) => {
    setPassengers((prev) => Math.max(1, prev + delta))
  }

  const canSearch = Boolean(
    from &&
    to &&
    passengers > 0 &&
    departureDate &&
    (tripType !== "round-trip" || returnDate)
  )

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-6">
        <Link className="flex items-center gap-2 text-lg font-semibold text-slate-900" href="/">
          <Plane className="h-6 w-6" />
          <span className="sr-only">Stopover</span>
          <span>Stopover</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-500 md:flex">
          <span className="text-slate-900">Flights</span>
          <span>Hotels</span>
          <span>Support</span>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <button className="rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur transition hover:border-slate-200 hover:text-slate-900">
            Sign in
          </button>
          <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700">
            Create account
          </button>
        </div>
      </header>

      <main className="flex flex-1 items-center">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-16 pt-6 lg:flex-row lg:items-start lg:gap-16">
          <section className="max-w-xl space-y-6 text-slate-900">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-500 shadow-sm backdrop-blur">
              Smart travel
            </span>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Plan your next flight with confidence
            </h1>
            <p className="text-base text-slate-600 sm:text-lg">
              Stopover combines trusted carriers, flexible fares, and curated itineraries so your journey feels effortless from the moment you start searching.
            </p>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 rounded-full bg-lime-200/70 p-1 text-slate-900">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                Transparent pricing with real-time availability.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 rounded-full bg-lime-200/70 p-1 text-slate-900">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                Tailored recommendations based on your preferences.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 rounded-full bg-lime-200/70 p-1 text-slate-900">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                Dedicated support available any time you need help.
              </li>
            </ul>
          </section>

          <section className="w-full lg:max-w-3xl">
            <div className="rounded-3xl border border-white/60 bg-white/80 shadow-2xl backdrop-blur">
              <div className="border-b border-white/60 px-6 pb-6 pt-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">Book</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">Flight itinerary</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Complete the details below to discover the best fares.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 text-sm font-medium text-slate-500">
                    {tripTypeOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setTripType(option.id)}
                        className={`rounded-full px-4 py-2 text-sm transition ${
                          tripType === option.id
                            ? "bg-white text-slate-900 shadow"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6 px-6 py-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <AirportSelect label="From" value={from} onChange={setFrom} placeholder="City or airport" />
                  <AirportSelect label="To" value={to} onChange={setTo} placeholder="City or airport" />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Departure</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="mt-2 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        >
                          <span className="flex items-center gap-3">
                            <span className="rounded-lg bg-slate-900/90 p-2">
                              <CalendarIcon size={16} className="text-white" />
                            </span>
                            <span className="text-slate-700">
                              {departureDate ? departureDate.toLocaleDateString() : "Select date"}
                            </span>
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto rounded-xl border border-slate-200 bg-white p-0 shadow-lg" align="start">
                        <Calendar
                          mode="single"
                          selected={departureDate}
                          onSelect={(date) => setDepartureDate(date)}
                          disabled={(date) => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            return date < today
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Return</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          disabled={tripType !== "round-trip"}
                          aria-disabled={tripType !== "round-trip"}
                          className={`mt-2 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${
                            tripType !== "round-trip"
                              ? "cursor-not-allowed text-slate-400 opacity-60"
                              : "text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <span className="rounded-lg bg-slate-900/90 p-2">
                              <CalendarIcon size={16} className="text-white" />
                            </span>
                            <span>
                              {returnDate
                                ? returnDate.toLocaleDateString()
                                : tripType === "round-trip"
                                ? "Select date"
                                : "Not required"}
                            </span>
                          </span>
                        </button>
                      </PopoverTrigger>
                      {tripType === "round-trip" && (
                        <PopoverContent className="w-auto rounded-xl border border-slate-200 bg-white p-0 shadow-lg" align="start">
                          <Calendar
                            mode="single"
                            selected={returnDate}
                            onSelect={(date) => setReturnDate(date)}
                            disabled={(date) => {
                              const minDate = departureDate ? new Date(departureDate) : new Date()
                              minDate.setHours(0, 0, 0, 0)
                              return date < minDate
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      )}
                    </Popover>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Passengers</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{passengers}</p>
                        <p className="text-sm text-slate-500">{passengerLabel}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => adjustPassengers(-1)}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                          aria-label="Decrease passengers"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <div className="flex h-10 w-14 items-center justify-center rounded-full bg-slate-900/5 text-sm font-semibold text-slate-900">
                          {passengers}
                        </div>
                        <button
                          type="button"
                          onClick={() => adjustPassengers(1)}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-700"
                          aria-label="Increase passengers"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <label htmlFor="flexible" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Flexibility
                    </label>
                    <div className="mt-3 flex items-start gap-3 text-sm text-slate-600">
                      <Checkbox id="flexible" className="mt-0.5" />
                      <span>My dates are flexible (± 4 days)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Secure checkout powered by leading global airlines and agency partners.
                  </p>
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => {
                      if (!from || !to || !departureDate) return
                      const fmt = (d: Date) => {
                        const y = d.getFullYear()
                        const m = String(d.getMonth() + 1).padStart(2, "0")
                        const day = String(d.getDate()).padStart(2, "0")
                        return `${y}-${m}-${day}`
                      }
                      handleSearch({
                        origin: from.code,
                        destination: to.code,
                        passengers,
                        departure: fmt(departureDate),
                        returnDate: tripType === "round-trip" && returnDate ? fmt(returnDate) : undefined,
                        tripType,
                      })
                    }}
                    disabled={!canSearch}
                  >
                    Search flights
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
