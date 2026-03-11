"use client"

import { useState } from "react"
import type { PdpDecision } from "@/lib/pdp"
import type { TraceEntry } from "@/lib/trace"

type State = "idle" | "loading" | PdpDecision | { error: string }

const BADGE: Record<PdpDecision, { label: string; className: string; warning?: string }> = {
  Permit: { label: "Tilgang", className: "text-green-700 bg-green-100" },
  Deny: { label: "Ingen tilgang", className: "text-red-700 bg-red-100" },
  NotApplicable: { label: "Ikke aktuelt", className: "text-gray-500 bg-gray-100" },
  Indeterminate: { label: "Ikke aktuelt", className: "text-gray-500 bg-gray-100", warning: "Syntaksfeil i PDP-forespørsel" },
}

interface Props {
  resourcePid: string
}

export function TilgangKnapp({ resourcePid }: Props) {
  const [state, setState] = useState<State>("idle")

  async function check() {
    setState("loading")
    try {
      const res = await fetch("/api/pdp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourcePid }),
      })
      const data = (await res.json()) as { decision?: PdpDecision; traces?: TraceEntry[]; error?: string }
      if (data.traces?.length) {
        window.dispatchEvent(new CustomEvent("dev-trace", { detail: data.traces }))
      }
      if (data.error) {
        setState({ error: data.error })
      } else {
        const valid = new Set<string>(["Permit", "Deny", "NotApplicable", "Indeterminate"])
        const decision: PdpDecision = valid.has(data.decision ?? "") ? (data.decision as PdpDecision) : "NotApplicable"
        setState(decision)
      }
    } catch (e) {
      setState({ error: e instanceof Error ? e.message : "Ukjent feil" })
    }
  }

  if (state !== "idle" && state !== "loading") {
    if (typeof state === "object") {
      return (
        <span className="text-xs text-red-600" title={state.error}>
          Feil ved tilgangssjekk
        </span>
      )
    }
    const badge = BADGE[state]
    return (
      <span className="inline-flex items-center gap-1">
        <span className={`text-xs rounded px-2 py-0.5 font-medium ${badge.className}`}>
          {badge.label}
        </span>
        {badge.warning && (
          <span title={badge.warning} className="text-yellow-500 text-sm">⚠️</span>
        )}
      </span>
    )
  }

  return (
    <button
      onClick={check}
      disabled={state === "loading"}
      className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
    >
      {state === "loading" ? "Sjekker…" : "Sjekk tilgang"}
    </button>
  )
}
