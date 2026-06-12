"use client"

import { VergemålDetaljer } from "@/components/VergemålDetaljer"
import { TjenesteeierDelegereSkjema } from "@/components/TjenesteeierDelegereSkjema"
import type { PakkeGruppe } from "@/lib/altinn"

export interface AktørData {
  partyUuid: string
  name: string
  personId?: string
  organizationNumber?: string
  vergemålGrupper: PakkeGruppe[]
  innbyggerGrupper: PakkeGruppe[]
}

export function AktørVelger({ selected }: { selected: AktørData | undefined }) {
  const hasFullmakter =
    selected && (selected.vergemålGrupper.length > 0 || selected.innbyggerGrupper.length > 0)

  if (!selected) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-sm text-gray-400 italic">Ingen aktør valgt.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-4">
        <TjenesteeierDelegereSkjema
          selectedAktørPid={selected.personId ?? ""}
          selectedAktørName={selected.name}
        />
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
