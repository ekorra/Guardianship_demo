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
}

export function TilgangspakkerGruppe({ packages }: Props) {
  const [open, setOpen] = useState(false)

  if (packages.length === 0) return null

  return (
    <div className="mt-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Tilgangspakker</p>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded px-2 py-1 hover:bg-green-100 transition-colors w-full text-left"
      >
        <span className="font-medium">Tilgangspakker</span>
        <span className="bg-green-200 text-green-800 rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none">
          {packages.length}
        </span>
        <span className="ml-auto text-green-400">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <ul className="mt-1 ml-2 space-y-0.5">
          {packages.map((p) => (
            <li key={p.id} className="text-xs text-gray-600 px-2 py-0.5">
              {p.meta?.name ?? p.urn}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
