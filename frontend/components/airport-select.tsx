"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"

export type AirportOption = {
  code: string
  name: string
  city?: string
  country?: string
}

interface AirportSelectProps {
  label: string
  value: AirportOption | null
  onChange: (airport: AirportOption | null) => void
  placeholder?: string
}

export default function AirportSelect({ label, value, onChange, placeholder }: AirportSelectProps) {
  const [query, setQuery] = useState("")
  const [options, setOptions] = useState<AirportOption[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  const apiBase = useMemo(() => {
    // Resolve a robust API base regardless of how NEXT_PUBLIC_BACKEND_URL is set.
    // Supported examples:
    // - http://localhost:8084                -> http://localhost:8084/api
    // - http://localhost:8084/               -> http://localhost:8084/api
    // - http://localhost:8084/api            -> http://localhost:8084/api
    // - http://localhost:8080/api/flights    -> http://localhost:8080/api
    const raw = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8084"
    try {
      const u = new URL(raw)
      // If path already contains /api, normalize to that root; otherwise append /api
      const path = u.pathname.replace(/\/$/, "")
      const hasApi = path === "/api" || path.startsWith("/api/")
      const basePath = hasApi ? "/api" : "/api"
      return `${u.origin}${basePath}`
    } catch (_) {
      // Fallback: treat as origin string
      const origin = raw.replace(/\/$/, "")
      // If it already ends with /api or contains /api/ deeper, normalize to /api
      if (/\/api(\/|$)/.test(origin)) {
        return origin.replace(/\/api(?:\/.*)?$/, "/api")
      }
      return `${origin}/api`
    }
  }, [])

  useEffect(() => {
    if (!query || query.length < 2) {
      setOptions([])
      return
    }

    setLoading(true)
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`${apiBase}/airports/autocomplete?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const items = (data?.items || []) as any[]
        setOptions(
          items.map((i) => ({
            code: i.code,
            name: i.name,
            city: i.city,
            country: i.country,
          }))
        )
      } catch (e) {
        if ((e as any).name !== "AbortError") {
          console.error("Autocomplete failed", e)
          setOptions([])
        }
      } finally {
        setLoading(false)
      }
    }, 250) // debounce

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [query, apiBase])

  return (
    <div className="w-full">
      <div className="text-xs text-gray-500 mb-1">{label.toUpperCase()}</div>
      <div className="relative">
        <input
          className="w-full border border-gray-200 rounded-lg p-2 text-sm"
          placeholder={placeholder || "Search airport or city"}
          value={value ? `${value.city ? value.city + " - " : ""}${value.name} (${value.code})` : query}
          onChange={(e) => {
            onChange(null)
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
        />
        {open && (options.length > 0 || loading) && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md max-h-64 overflow-auto">
            {loading && <div className="p-3 text-sm text-gray-500">Loading…</div>}
            {!loading && options.length === 0 && (
              <div className="p-3 text-sm text-gray-500">No results</div>
            )}
            {!loading &&
              options.map((opt) => (
                <button
                  key={opt.code + opt.name}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-gray-50"
                  onClick={() => {
                    onChange(opt)
                    setQuery("")
                    setOpen(false)
                  }}
                >
                  <div className="text-sm font-medium">
                    {opt.city ? `${opt.city} — ` : ""}
                    {opt.name} ({opt.code})
                  </div>
                  <div className="text-xs text-gray-500">{opt.country}</div>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
