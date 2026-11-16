"use client"

import { useEffect, useRef, useState } from "react"
import { POC_RESOURCE_IDS } from "@/lib/resourceRegistry"

export interface EnkelttjenesteValg {
  resourceId: string
  title: string
  actions: string[]
}

interface ServiceInfo {
  id: string
  title: string
  actions: string[]
  loading: boolean
  error: string | null
}

interface Props {
  value: EnkelttjenesteValg
  onChange: (value: EnkelttjenesteValg) => void
  allowCustom?: boolean
}

const ACTION_LABELS: Record<string, string> = {
  read: "Les",
  write: "Skriv",
}

export function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action.charAt(0).toUpperCase() + action.slice(1)
}

function dispatchTraces(data: { traces?: unknown[] }) {
  if (data.traces?.length) {
    window.dispatchEvent(new CustomEvent("dev-trace", { detail: data.traces }))
  }
}

async function fetchResourceInfo(
  ids: string[],
): Promise<Map<string, { title: string; actions: string[]; error?: string }>> {
  const res = await fetch(`/api/resource-registry?ids=${ids.map(encodeURIComponent).join(",")}`)
  const data = (await res.json()) as {
    resources?: { id: string; title?: string; actions?: string[]; error?: string }[]
    traces?: unknown[]
  }
  dispatchTraces(data)
  const map = new Map<string, { title: string; actions: string[]; error?: string }>()
  for (const r of data.resources ?? []) {
    map.set(r.id, r.error ? { title: r.id, actions: [], error: r.error } : { title: r.title ?? r.id, actions: r.actions ?? [] })
  }
  return map
}

export function EnkelttjenesteVelger({ value, onChange, allowCustom = false }: Props) {
  const [services, setServices] = useState<ServiceInfo[]>(
    POC_RESOURCE_IDS.map((id) => ({ id, title: id, actions: [], loading: true, error: null })),
  )
  const [customServices, setCustomServices] = useState<ServiceInfo[]>([])
  const [expanded, setExpanded] = useState(false)
  const [showAddResource, setShowAddResource] = useState(false)
  const [newResourceId, setNewResourceId] = useState("")
  const [newResourceLabel, setNewResourceLabel] = useState("")
  const [addingCustom, setAddingCustom] = useState(false)
  const initialized = useRef(false)

  const allServices = [...services, ...customServices]
  const selected = allServices.find((s) => s.id === value.resourceId)

  useEffect(() => {
    let cancelled = false
    fetchResourceInfo([...POC_RESOURCE_IDS])
      .then((map) => {
        if (cancelled) return
        setServices((prev) =>
          prev.map((s) => {
            const info = map.get(s.id)
            if (!info) return { ...s, loading: false }
            return { ...s, title: info.title, actions: info.actions, loading: false, error: info.error ?? null }
          }),
        )
        if (!initialized.current) {
          initialized.current = true
          const first = map.get(POC_RESOURCE_IDS[0])
          if (first) {
            onChange({ resourceId: POC_RESOURCE_IDS[0], title: first.title, actions: [...first.actions] })
          }
        }
      })
      .catch(() => {
        if (cancelled) return
        setServices((prev) => prev.map((s) => ({ ...s, loading: false, error: "Kunne ikke hente tjenesteinfo" })))
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function selectService(id: string) {
    const service = allServices.find((s) => s.id === id)
    if (!service) return
    onChange({ resourceId: service.id, title: service.title, actions: [...service.actions] })
  }

  function toggleAction(action: string) {
    const next = value.actions.includes(action)
      ? value.actions.filter((a) => a !== action)
      : [...value.actions, action]
    onChange({ ...value, actions: next })
  }

  function selectAllActions() {
    onChange({ ...value, actions: [...(selected?.actions ?? [])] })
  }

  async function addCustomResource() {
    const id = newResourceId.trim()
    if (!id) return
    setAddingCustom(true)
    try {
      const map = await fetchResourceInfo([id])
      const info = map.get(id)
      if (info && !info.error) {
        const service: ServiceInfo = { id, title: newResourceLabel.trim() || info.title, actions: info.actions, loading: false, error: null }
        setCustomServices((prev) => [...prev, service])
        onChange({ resourceId: id, title: service.title, actions: [...service.actions] })
      } else {
        // Fallback: ressursen ble ikke funnet i registeret — bruk manuell innskriving med generiske handlinger
        const service: ServiceInfo = {
          id,
          title: newResourceLabel.trim() || id,
          actions: ["read", "write"],
          loading: false,
          error: "Fant ikke ressursen i ressursregisteret — bruker manuelle handlinger",
        }
        setCustomServices((prev) => [...prev, service])
        onChange({ resourceId: id, title: service.title, actions: ["read"] })
      }
    } catch {
      const service: ServiceInfo = {
        id,
        title: newResourceLabel.trim() || id,
        actions: ["read", "write"],
        loading: false,
        error: "Fant ikke ressursen i ressursregisteret — bruker manuelle handlinger",
      }
      setCustomServices((prev) => [...prev, service])
      onChange({ resourceId: id, title: service.title, actions: ["read"] })
    } finally {
      setAddingCustom(false)
      setNewResourceId("")
      setNewResourceLabel("")
      setShowAddResource(false)
      setExpanded(true)
    }
  }

  const availableActions = selected?.actions ?? []
  const allSelected = availableActions.length > 0 && availableActions.every((a) => value.actions.includes(a))

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Tjeneste</label>
        <select
          value={value.resourceId}
          onChange={(e) => selectService(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
        >
          {allServices.map((s) => (
            <option key={s.id} value={s.id}>
              {s.loading ? `${s.id} (henter navn…)` : s.title}
            </option>
          ))}
        </select>
        {selected?.error && <p className="text-[10.5px] text-yellow-600">{selected.error}</p>}
      </div>

      <div className="border border-gray-200 rounded">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-gray-600 hover:text-gray-800"
        >
          <span>Tilgang til hele tjenesten ({value.actions.length}/{availableActions.length} handlinger valgt)</span>
          <span className="text-gray-400">{expanded ? "−" : "+"}</span>
        </button>
        {expanded && (
          <div className="border-t border-gray-100 px-2 py-2 flex flex-col gap-1.5">
            {availableActions.length === 0 && !selected?.loading && (
              <p className="text-[10.5px] text-gray-400">Ingen handlinger funnet for denne tjenesten.</p>
            )}
            {availableActions.map((action) => (
              <label key={action} className="flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={value.actions.includes(action)}
                  onChange={() => toggleAction(action)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-300"
                />
                {actionLabel(action)}
              </label>
            ))}
            {availableActions.length > 1 && (
              <button
                type="button"
                onClick={selectAllActions}
                disabled={allSelected}
                className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-300 w-fit mt-1"
              >
                Velg alle handlinger
              </button>
            )}
          </div>
        )}
      </div>

      {allowCustom && (
        <>
          {!showAddResource && (
            <button
              type="button"
              onClick={() => setShowAddResource(true)}
              className="text-xs text-blue-600 hover:text-blue-700 w-fit"
            >
              + Legg til egen tjeneste
            </button>
          )}

          {showAddResource && (
            <div className="flex flex-wrap items-end gap-2 bg-gray-50 border border-gray-200 rounded p-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Ressurs-ID *</label>
                <input
                  value={newResourceId}
                  onChange={(e) => setNewResourceId(e.target.value)}
                  placeholder="f.eks. nav-dagpenger"
                  className="text-xs border border-gray-200 rounded px-2 py-1.5 w-40 focus:outline-none focus:ring-1 focus:ring-blue-300"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Navn</label>
                <input
                  value={newResourceLabel}
                  onChange={(e) => setNewResourceLabel(e.target.value)}
                  placeholder="Visningsnavn (valgfritt, hentes automatisk hvis tomt)"
                  className="text-xs border border-gray-200 rounded px-2 py-1.5 w-52 focus:outline-none focus:ring-1 focus:ring-blue-300"
                />
              </div>
              <button
                type="button"
                onClick={addCustomResource}
                disabled={!newResourceId.trim() || addingCustom}
                className="text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 rounded px-3 py-1.5 font-medium"
              >
                {addingCustom ? "Slår opp…" : "Legg til"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddResource(false)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Avbryt
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
