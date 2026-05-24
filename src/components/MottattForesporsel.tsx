"use client"

import { useState } from "react"
import type { AccessRequest } from "@/lib/altinnEnduser"

interface Props {
  request: AccessRequest
}

export function MottattForesporsel({ request }: Props) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<"approved" | "rejected" | null>(null)

  async function respond(action: "approve" | "reject") {
    setLoading(action)
    setError(null)
    try {
      const res = await fetch("/api/requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: request.id, action }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string; traces?: unknown[] }
      if (data.traces?.length) {
        window.dispatchEvent(new CustomEvent("dev-trace", { detail: data.traces }))
      }
      if (!res.ok) {
        setError(data.error ?? "Ukjent feil")
        setLoading(null)
        return
      }
      setDone(action === "approve" ? "approved" : "rejected")
    } catch {
      setError("Nettverksfeil")
      setLoading(null)
    }
  }

  const fromName = request.from?.name ?? request.from?.id ?? "Ukjent"
  const packageLabel = request.package?.name ?? request.package?.urn ?? request.package?.id ?? "Ukjent pakke"

  if (done) {
    return (
      <li className="bg-gray-50 rounded-lg p-4 flex items-center gap-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${done === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {done === "approved" ? "Godkjent" : "Avvist"}
        </span>
        <span className="text-sm text-gray-500">{fromName} — {packageLabel}</span>
      </li>
    )
  }

  return (
    <li className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">{fromName}</p>
          <p className="text-xs text-gray-500 mt-0.5">{packageLabel}</p>
          {request.created && (
            <p className="text-xs text-gray-400 mt-0.5">{new Date(request.created).toLocaleDateString("nb-NO")}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => respond("approve")}
            disabled={!!loading}
            className="text-xs bg-green-600 hover:bg-green-700 text-white rounded px-3 py-1.5 disabled:opacity-50"
          >
            {loading === "approve" ? "…" : "Godkjenn"}
          </button>
          <button
            onClick={() => respond("reject")}
            disabled={!!loading}
            className="text-xs bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded px-3 py-1.5 disabled:opacity-50"
          >
            {loading === "reject" ? "…" : "Avvis"}
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </li>
  )
}
