"use client"

import { useState } from "react"
import type { PackageMeta } from "@/lib/packageMeta"

interface PackageEntry {
  id: string
  urn: string
  meta: PackageMeta | null
}

interface Props {
  packages: PackageEntry[]
  toId?: string
}

function SletteKnapp({
  packageEntry,
  toId,
  onDeleted,
}: {
  packageEntry: PackageEntry
  toId: string
  onDeleted: (packageId: string) => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/delegate", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toPartyUuid: toId, packageId: packageEntry.id }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string; traces?: unknown[] }
      if (data.traces?.length) {
        window.dispatchEvent(new CustomEvent("dev-trace", { detail: data.traces }))
      }
      if (!res.ok) {
        setError(data.error ?? "Ukjent feil")
        setLoading(false)
        setConfirming(false)
        return
      }
      onDeleted(packageEntry.id)
    } catch {
      setError("Nettverksfeil")
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1">
        <span className="text-xs text-gray-500">Slette?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs text-white bg-red-600 hover:bg-red-700 rounded px-1.5 py-0.5 disabled:opacity-50"
        >
          {loading ? "…" : "Ja"}
        </button>
        <button
          onClick={() => { setConfirming(false); setError(null) }}
          disabled={loading}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Avbryt
        </button>
        {error && <span className="text-xs text-red-600 ml-1">{error}</span>}
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-red-400 hover:text-red-600 ml-auto shrink-0"
      title="Slett tilgangspakke"
    >
      ✕
    </button>
  )
}

export function TilgangspakkerGruppe({ packages, toId }: Props) {
  const [open, setOpen] = useState(false)
  const [localPackages, setLocalPackages] = useState(packages)

  const canDelete = !!toId

  function handleDeleted(packageId: string) {
    setLocalPackages((prev) => prev.filter((p) => p.id !== packageId))
  }

  if (localPackages.length === 0) return null

  return (
    <div className="mt-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Tilgangspakker</p>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded px-2 py-1 hover:bg-green-100 transition-colors w-full text-left"
      >
        <span className="font-medium">Tilgangspakker</span>
        <span className="bg-green-200 text-green-800 rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none">
          {localPackages.length}
        </span>
        <span className="ml-auto text-green-400">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <ul className="mt-1 ml-2 space-y-0.5">
          {localPackages.map((p) => (
            <li key={p.id} className="flex items-center gap-1 text-xs text-gray-600 px-2 py-0.5">
              <span className="flex-1">{p.meta?.name ?? p.urn}</span>
              {canDelete && (
                <SletteKnapp
                  packageEntry={p}
                  toId={toId}
                  onDeleted={handleDeleted}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
