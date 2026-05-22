"use client"

import { useState } from "react"
import type { RoleMeta } from "@/lib/roles"

interface RoleEntry {
  id: string
  meta: RoleMeta | null
}

interface Props {
  roles: RoleEntry[]
}

export function RollerGruppe({ roles }: Props) {
  const [open, setOpen] = useState<string | null>(null)

  // Grupper etter provider.code fra meta (fallback til id hvis meta mangler)
  const groups = new Map<string, { providerName: string; entries: RoleEntry[] }>()
  for (const r of roles) {
    const key = r.meta?.provider?.code ?? r.id
    const existing = groups.get(key) ?? { providerName: r.meta?.provider?.name ?? key, entries: [] }
    existing.entries.push(r)
    groups.set(key, existing)
  }

  if (groups.size === 0) return null

  return (
    <div className="mt-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Roller</p>
      <ul className="space-y-1">
        {[...groups.entries()].map(([providerCode, { providerName, entries }]) => (
          <li key={providerCode}>
            <button
              onClick={() => setOpen(open === providerCode ? null : providerCode)}
              className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 rounded px-2 py-1 hover:bg-blue-100 transition-colors w-full text-left"
            >
              <span className="font-medium">{providerName}</span>
              <span className="bg-blue-200 text-blue-800 rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none">
                {entries.length}
              </span>
              <span className="ml-auto text-blue-400">{open === providerCode ? "▲" : "▼"}</span>
            </button>
            {open === providerCode && (
              <ul className="mt-1 ml-2 space-y-0.5">
                {entries.map((e) => (
                  <li key={e.id} className="text-xs text-gray-600 px-2 py-0.5">
                    {e.meta?.name ?? e.id}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
