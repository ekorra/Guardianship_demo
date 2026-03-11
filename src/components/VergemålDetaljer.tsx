"use client"

import { useState } from "react"
import type { PakkeGruppe } from "@/lib/altinn"

interface Props {
  grupper: PakkeGruppe[]
  tittel?: string
}

function LockIcon() {
  return (
    <svg
      className="w-5 h-5 text-gray-400 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export function VergemålDetaljer({ grupper, tittel = "fullmakter" }: Props) {
  const [sectionOpen, setSectionOpen] = useState(false)
  const [openSet, setOpenSet] = useState<Set<string>>(new Set())

  function toggle(område: string) {
    setOpenSet((prev) => {
      const next = new Set(prev)
      if (next.has(område)) next.delete(område)
      else next.add(område)
      return next
    })
  }

  return (
    <div className="mt-2">
      <button
        onClick={() => setSectionOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-2"
      >
        <ChevronIcon open={sectionOpen} />
        <span>{sectionOpen ? `Skjul ${tittel}` : `Vis ${tittel}`}</span>
      </button>

      {sectionOpen && (
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
      {grupper.map(({ område, pakker }) => {
        const mottattCount = pakker.filter((p) => p.mottatt).length
        const totalCount = pakker.length
        const isOpen = openSet.has(område)

        return (
          <div key={område}>
            <button
              onClick={() => toggle(område)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <LockIcon />
              <span className="flex-1 text-sm font-medium text-gray-800">
                {område}
              </span>
              <span className="text-xs font-medium text-green-700 bg-green-100 rounded-full px-2.5 py-0.5">
                {mottattCount} av {totalCount}
              </span>
              <ChevronIcon open={isOpen} />
            </button>

            {isOpen && (
              <ul className="px-4 pb-3 pt-1 space-y-1.5 bg-gray-50">
                {pakker.map(({ identifier, tittelNb, mottatt }) => (
                  <li
                    key={identifier}
                    className={`flex items-center gap-2 text-xs ${
                      mottatt ? "text-gray-800" : "text-gray-300"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${mottatt ? "bg-green-500" : "bg-gray-200"}`} />
                    {tittelNb}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
      </div>
      )}
    </div>
  )
}
