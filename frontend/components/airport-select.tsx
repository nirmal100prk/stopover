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
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <div className="relative mt-2">
        <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-900/10">
          <input
            className="w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
            placeholder={placeholder || "Search airport or city"}
            value={value ? `${value.city ? value.city + " — " : ""}${value.name} (${value.code})` : query}
            onChange={(e) => {
              onChange(null)
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
          />
        </div>
        {open && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            {loading && <div className="px-4 py-3 text-sm text-slate-500">Searching…</div>}
            {!loading && options.length === 0 && query.length >= 2 && (
              <div className="px-4 py-3 text-sm text-slate-500">No matching airports</div>
            )}
            {!loading && options.length > 0 && (
              <ul className="max-h-60 overflow-auto py-1">
                {options.map((opt) => (
                  <li key={opt.code + opt.name}>
                    <button
                      type="button"
                      className="flex w-full flex-col gap-0.5 px-4 py-2 text-left transition hover:bg-slate-50"
                      onClick={() => {
                        onChange(opt)
                        setQuery("")
                        setOpen(false)
                      }}
                    >
                      <span className="text-sm font-semibold text-slate-900">
                        {opt.city ? `${opt.city} — ` : ""}
                        {opt.name} ({opt.code})
                      </span>
                      <span className="text-xs text-slate-500">{opt.country}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
