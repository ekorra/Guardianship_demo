"use client"

import { useState, useEffect, useRef } from "react"
import type { PdpDecision } from "@/lib/pdp"
import type { TraceEntry } from "@/lib/trace"
import { PRECONFIGURED_RESOURCES, LOCALSTORAGE_KEY } from "@/lib/resources"
import type { Resource } from "@/lib/resources"

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

function loadCustomResources(): Resource[] {
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Resource[]
  } catch {
    return []
  }
}

function saveCustomResources(resources: Resource[]) {
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(resources))
}

export function TilgangKnapp({ resourcePid }: Props) {
  const [state, setState] = useState<State>("idle")
  const [customResources, setCustomResources] = useState<Resource[]>([])
  const [selectedId, setSelectedId] = useState(PRECONFIGURED_RESOURCES[0].id)
  const [showAdd, setShowAdd] = useState(false)
  const [newId, setNewId] = useState("")
  const [newLabel, setNewLabel] = useState("")
  const addInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = loadCustomResources()
    setCustomResources(saved)
  }, [])

  useEffect(() => {
    if (showAdd) addInputRef.current?.focus()
  }, [showAdd])

  const allResources = [...PRECONFIGURED_RESOURCES, ...customResources]

  function handleSelectChange(id: string) {
    setSelectedId(id)
    setState("idle")
  }

  async function check() {
    setState("loading")
    try {
      const res = await fetch("/api/pdp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourcePid, resourceId: selectedId }),
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

  function addCustomResource() {
    const id = newId.trim()
    const label = newLabel.trim() || id
    if (!id) return
    const updated = [...customResources, { id, label }]
    setCustomResources(updated)
    saveCustomResources(updated)
    setSelectedId(id)
    setState("idle")
    setNewId("")
    setNewLabel("")
    setShowAdd(false)
  }

  const badge = state !== "idle" && state !== "loading" && typeof state !== "object" ? BADGE[state] : null

  return (
    <div className="flex flex-col gap-1.5 items-end">
      <div className="flex items-center gap-1">
        <select
          value={selectedId}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="text-xs border border-gray-200 rounded px-1.5 py-0.5 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
        >
          {allResources.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>

        <button
          onClick={() => setShowAdd((v) => !v)}
          title="Legg til ressurs"
          className="text-xs text-gray-400 hover:text-gray-600 px-1"
        >
          {showAdd ? "✕" : "+"}
        </button>

        {state === "loading" ? (
          <span className="text-xs text-gray-400">Sjekker…</span>
        ) : badge ? (
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
        ) : typeof state === "object" ? (
          <span className="text-xs text-red-600" title={state.error}>Feil</span>
        ) : (
          <button
            onClick={check}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Sjekk tilgang
          </button>
        )}
      </div>

      {showAdd && (
        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-2 py-1.5">
          <input
            ref={addInputRef}
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomResource()}
            placeholder="ressurs-id"
            className="text-xs border border-gray-200 rounded px-1.5 py-0.5 w-36 focus:outline-none focus:ring-1 focus:ring-blue-300"
          />
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomResource()}
            placeholder="navn (valgfritt)"
            className="text-xs border border-gray-200 rounded px-1.5 py-0.5 w-28 focus:outline-none focus:ring-1 focus:ring-blue-300"
          />
          <button
            onClick={addCustomResource}
            disabled={!newId.trim()}
            className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-300 font-medium"
          >
            Legg til
          </button>
        </div>
      )}
    </div>
  )
}
