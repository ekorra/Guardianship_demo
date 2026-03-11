"use client"

import { useState, useEffect } from "react"
import type { TraceEntry } from "@/lib/trace"

function DevIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  )
}

function TraceItem({ entry }: { entry: TraceEntry }) {
  const [open, setOpen] = useState(false)
  return (
    <li className="border border-gray-200 rounded">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-3 text-sm">
          <span
            className={`font-mono text-xs px-1.5 py-0.5 rounded ${entry.response.status >= 400 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
          >
            {entry.response.status}
          </span>
          <span className="font-medium text-gray-800">{entry.name}</span>
          <span className="text-gray-400 text-xs">{entry.durationMs} ms</span>
        </span>
        <span className="text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-gray-200 divide-y divide-gray-100">
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              Request — {entry.request.method} {entry.request.url}
            </p>
            {entry.request.body !== undefined && (
              <pre className="text-xs text-gray-700 bg-gray-50 rounded p-2 overflow-auto max-h-48 whitespace-pre-wrap break-all">
                {JSON.stringify(entry.request.body, null, 2)}
              </pre>
            )}
          </div>
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              Response — {entry.response.status}
            </p>
            <pre className="text-xs text-gray-700 bg-gray-50 rounded p-2 overflow-auto max-h-64 whitespace-pre-wrap break-all">
              {JSON.stringify(entry.response.body, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </li>
  )
}

export function DevPanel({ traces: initialTraces }: { traces: TraceEntry[] }) {
  const [open, setOpen] = useState(false)
  const [traces, setTraces] = useState(initialTraces)

  useEffect(() => {
    function onDevTrace(e: Event) {
      const entries = (e as CustomEvent<TraceEntry[]>).detail
      setTraces((prev) => [...prev, ...entries])
    }
    window.addEventListener("dev-trace", onDevTrace)
    return () => window.removeEventListener("dev-trace", onDevTrace)
  }, [])

  return (
    <>
      {/* Toggle-knapp — alltid synlig nederst til høyre */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="Dev mode"
        className={`fixed bottom-4 right-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full shadow-lg text-sm font-medium transition-colors ${
          open
            ? "bg-indigo-600 text-white"
            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
        }`}
      >
        <DevIcon />
        <span>Dev</span>
      </button>

      {/* Debug-panel */}
      {open && (
        <div className="fixed bottom-14 right-4 z-40 w-[580px] max-h-[70vh] bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-semibold text-gray-700">
              API-kall ({traces.length})
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              aria-label="Lukk dev-panel"
            >
              ×
            </button>
          </div>
          <ul className="overflow-auto p-3 space-y-2 flex-1">
            {traces.length === 0 ? (
              <li className="text-sm text-gray-400 italic text-center py-4">
                Ingen API-kall registrert.
              </li>
            ) : (
              traces.map((entry, i) => <TraceItem key={i} entry={entry} />)
            )}
          </ul>
        </div>
      )}
    </>
  )
}
