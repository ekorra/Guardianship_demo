"use client"

import { useState, useEffect } from "react"
import type { PdpDecision } from "@/lib/pdp"
import type { TraceEntry } from "@/lib/trace"
import {
  PRECONFIGURED_RESOURCES,
  LOCALSTORAGE_SELECTED_KEY,
  LOCALSTORAGE_CUSTOM_KEY,
  RESOURCE_CHANGE_EVENT,
} from "@/lib/resources"
import type { Resource, ResourceChangeDetail } from "@/lib/resources"

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

function getInitialResource(): { id: string; action: string } {
  try {
    const savedId = localStorage.getItem(LOCALSTORAGE_SELECTED_KEY)
    if (!savedId) return { id: PRECONFIGURED_RESOURCES[0].id, action: "read" }

    const allResources: Resource[] = [
      ...PRECONFIGURED_RESOURCES,
      ...JSON.parse(localStorage.getItem(LOCALSTORAGE_CUSTOM_KEY) ?? "[]"),
    ]
    const found = allResources.find((r) => r.id === savedId)
    return { id: savedId, action: found?.action ?? "read" }
  } catch {
    return { id: PRECONFIGURED_RESOURCES[0].id, action: "read" }
  }
}

export function TilgangKnapp({ resourcePid }: Props) {
  const [state, setState] = useState<State>("idle")
  const [resource, setResource] = useState<{ id: string; action: string }>(
    () => ({ id: PRECONFIGURED_RESOURCES[0].id, action: "read" }),
  )

  useEffect(() => {
    setResource(getInitialResource())

    function onResourceChange(e: Event) {
      const detail = (e as CustomEvent<ResourceChangeDetail>).detail
      setResource({ id: detail.id, action: detail.action })
      setState("idle")
    }

    window.addEventListener(RESOURCE_CHANGE_EVENT, onResourceChange)
    return () => window.removeEventListener(RESOURCE_CHANGE_EVENT, onResourceChange)
  }, [])

  async function check() {
    setState("loading")
    try {
      const res = await fetch("/api/pdp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourcePid, resourceId: resource.id, action: resource.action }),
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
        <button
          onClick={() => setState("idle")}
          className="text-xs text-gray-400 hover:text-gray-600"
          title="Nullstill"
        >
          ✕
        </button>
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
