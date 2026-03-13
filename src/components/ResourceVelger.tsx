"use client"

import { useState, useEffect, useRef } from "react"
import {
  PRECONFIGURED_RESOURCES,
  LOCALSTORAGE_CUSTOM_KEY,
  LOCALSTORAGE_SELECTED_KEY,
  RESOURCE_CHANGE_EVENT,
} from "@/lib/resources"
import type { Resource } from "@/lib/resources"

function loadCustomResources(): Resource[] {
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_CUSTOM_KEY)
    return raw ? (JSON.parse(raw) as Resource[]) : []
  } catch {
    return []
  }
}

function saveCustomResources(resources: Resource[]) {
  localStorage.setItem(LOCALSTORAGE_CUSTOM_KEY, JSON.stringify(resources))
}

export function ResourceVelger() {
  const [customResources, setCustomResources] = useState<Resource[]>([])
  const [selectedId, setSelectedId] = useState(PRECONFIGURED_RESOURCES[0].id)
  const [showAdd, setShowAdd] = useState(false)
  const [newId, setNewId] = useState("")
  const [newLabel, setNewLabel] = useState("")
  const [newAction, setNewAction] = useState("")
  const addInputRef = useRef<HTMLInputElement>(null)

  const allResources = [...PRECONFIGURED_RESOURCES, ...customResources]

  useEffect(() => {
    const saved = loadCustomResources()
    setCustomResources(saved)
    const savedId = localStorage.getItem(LOCALSTORAGE_SELECTED_KEY)
    if (savedId) setSelectedId(savedId)
  }, [])

  useEffect(() => {
    if (showAdd) addInputRef.current?.focus()
  }, [showAdd])

  function dispatchChange(id: string, action?: string) {
    const resolved = action ?? allResources.find((r) => r.id === id)?.action ?? "read"
    localStorage.setItem(LOCALSTORAGE_SELECTED_KEY, id)
    window.dispatchEvent(
      new CustomEvent(RESOURCE_CHANGE_EVENT, { detail: { id, action: resolved } }),
    )
  }

  function handleSelect(id: string) {
    setSelectedId(id)
    dispatchChange(id)
  }

  function addCustomResource() {
    const id = newId.trim()
    if (!id) return
    const label = newLabel.trim() || id
    const action = newAction.trim() || undefined
    const updated = [...customResources, { id, label, ...(action && { action }) }]
    setCustomResources(updated)
    saveCustomResources(updated)
    setSelectedId(id)
    dispatchChange(id, action)
    setNewId("")
    setNewLabel("")
    setNewAction("")
    setShowAdd(false)
  }

  const selectedResource = allResources.find((r) => r.id === selectedId)
  const effectiveAction = selectedResource?.action ?? "read"

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
        Ressurs for tilgangssjekk
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={selectedId}
          onChange={(e) => handleSelect(e.target.value)}
          className="text-sm border border-gray-200 rounded px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 flex-1 min-w-0"
        >
          {allResources.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>

        <span className="text-xs text-gray-400 font-mono shrink-0">
          action: <span className="text-gray-600">{effectiveAction}</span>
        </span>

        <button
          onClick={() => setShowAdd((v) => !v)}
          title={showAdd ? "Avbryt" : "Legg til ressurs"}
          className="text-sm text-gray-400 hover:text-gray-600 px-2 py-1 rounded border border-gray-200 shrink-0"
        >
          {showAdd ? "✕" : "+ Legg til"}
        </button>
      </div>

      {showAdd && (
        <div className="mt-3 flex flex-wrap items-end gap-2 bg-gray-50 border border-gray-200 rounded p-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Ressurs-ID *</label>
            <input
              ref={addInputRef}
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomResource()}
              placeholder="f.eks. nav-dagpenger"
              className="text-xs border border-gray-200 rounded px-2 py-1.5 w-44 focus:outline-none focus:ring-1 focus:ring-blue-300"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Navn</label>
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomResource()}
              placeholder="Visningsnavn (valgfritt)"
              className="text-xs border border-gray-200 rounded px-2 py-1.5 w-40 focus:outline-none focus:ring-1 focus:ring-blue-300"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Action</label>
            <input
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomResource()}
              placeholder='read (standard)'
              className="text-xs border border-gray-200 rounded px-2 py-1.5 w-28 focus:outline-none focus:ring-1 focus:ring-blue-300"
            />
          </div>
          <button
            onClick={addCustomResource}
            disabled={!newId.trim()}
            className="text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 rounded px-3 py-1.5 font-medium"
          >
            Legg til
          </button>
        </div>
      )}
    </div>
  )
}
