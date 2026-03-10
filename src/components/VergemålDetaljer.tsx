"use client"

import { useState } from "react"
import type { VergemålGruppe } from "@/lib/altinn"

interface Props {
  grupper: VergemålGruppe[]
}

export function VergemålDetaljer({ grupper }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
      >
        <span>{open ? "▲" : "▼"}</span>
        <span>{open ? "Skjul vergemålsdetaljer" : "Vis vergemålsdetaljer"}</span>
      </button>

      {open && (
        <dl className="mt-2 space-y-3 border-l-2 border-blue-100 pl-3">
          {grupper.map(({ område, pakker }) => (
            <div key={område}>
              <dt className="text-xs font-semibold text-gray-500 mb-1">
                {område}
              </dt>
              <dd>
                <ul className="space-y-0.5">
                  {pakker.map(({ identifier, tittelNb, mottatt }) => (
                    <li
                      key={identifier}
                      className={`text-xs ${mottatt ? "text-gray-800" : "text-gray-300"}`}
                    >
                      {tittelNb}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
