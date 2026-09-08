"use client"

import { useState } from "react"
import { AktørVelger } from "@/components/AktørVelger"
import type { AktørData } from "@/components/AktørVelger"

interface Props {
  aktørData: AktørData[]
  loggedInPid: string
  altinnError: string | null
}

export function AktørSelect({ aktørData, loggedInPid, altinnError }: Props) {
  const defaultAktør = aktørData.find((a) => a.personId === loggedInPid) ?? aktørData[0]
  const [selectedUuid, setSelectedUuid] = useState(defaultAktør?.partyUuid ?? "")

  const selected = aktørData.find((a) => a.partyUuid === selectedUuid)

  return (
    <div>
      {aktørData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
            Aktør
          </label>
          <select
            value={selectedUuid}
            onChange={(e) => setSelectedUuid(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
          >
            {aktørData.map((a) => (
              <option key={a.partyUuid} value={a.partyUuid}>
                {a.name}{a.personId === loggedInPid ? " (deg)" : ""}{" "}
                — {a.personId ?? a.organizationNumber ?? "—"}
              </option>
            ))}
          </select>
        </div>
      )}

      {altinnError ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-red-600">Kunne ikke hente data fra Altinn: {altinnError}</p>
        </div>
      ) : aktørData.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-400 italic">Ingen aktører funnet.</p>
        </div>
      ) : (
        <AktørVelger selected={selected} />
      )}
    </div>
  )
}
