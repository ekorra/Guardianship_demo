"use client"

import { useState } from "react"
import { VergemålDetaljer } from "@/components/VergemålDetaljer"
import type { PakkeGruppe } from "@/lib/altinn"

export interface AktørData {
  partyUuid: string
  name: string
  personId?: string
  vergemålGrupper: PakkeGruppe[]
  innbyggerGrupper: PakkeGruppe[]
}

export function AktørVelger({ aktører, loggedInPid }: { aktører: AktørData[]; loggedInPid: string }) {
  const defaultUuid =
    aktører.find((a) => a.personId === loggedInPid)?.partyUuid ?? aktører[0]?.partyUuid ?? ""
  const [selectedUuid, setSelectedUuid] = useState(defaultUuid)

  const selected = aktører.find((a) => a.partyUuid === selectedUuid)
  const hasFullmakter =
    selected && (selected.vergemålGrupper.length > 0 || selected.innbyggerGrupper.length > 0)

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Fullmakter</h2>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
          Aktør
        </label>
        <select
          value={selectedUuid}
          onChange={(e) => setSelectedUuid(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
        >
          {aktører.map((a) => (
            <option key={a.partyUuid} value={a.partyUuid}>
              {a.name}{a.personId === loggedInPid ? " (deg)" : ""} — {a.personId ?? "—"}
            </option>
          ))}
        </select>
      </div>

      {hasFullmakter ? (
        <div>
          {selected.vergemålGrupper.length > 0 && (
            <VergemålDetaljer grupper={selected.vergemålGrupper} tittel="Vergemålsfullmakter" variant="vergemål" />
          )}
          {selected.innbyggerGrupper.length > 0 && (
            <VergemålDetaljer grupper={selected.innbyggerGrupper} tittel="Innbyggerfullmakter" variant="innbygger" />
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">Ingen registrerte fullmakter for valgt aktør.</p>
      )}
    </div>
  )
}
