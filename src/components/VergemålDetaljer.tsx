"use client"

import { useState } from "react"
import type { PakkeGruppe } from "@/lib/altinn"

interface Props {
  grupper: PakkeGruppe[]
  tittel?: string
  variant?: "vergemål" | "innbygger"
}

const VARIANT = {
  vergemål: {
    headerBg: "bg-blue-50 hover:bg-blue-100",
    border: "border-blue-200",
    iconColor: "text-blue-400",
    badge: "text-blue-700 bg-blue-100",
    dot: "bg-blue-500",
    areaBadge: "text-blue-700 bg-blue-100",
  },
  innbygger: {
    headerBg: "bg-green-50 hover:bg-green-100",
    border: "border-green-200",
    iconColor: "text-green-400",
    badge: "text-green-700 bg-green-100",
    dot: "bg-green-500",
    areaBadge: "text-green-700 bg-green-100",
  },
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export function VergemålDetaljer({ grupper, tittel = "Fullmakter", variant = "vergemål" }: Props) {
  const [sectionOpen, setSectionOpen] = useState(false)
  const [openSet, setOpenSet] = useState<Set<string>>(new Set())

  const v = VARIANT[variant]
  const totalPakker = grupper.reduce((s, g) => s + g.pakker.length, 0)
  const tildeltPakker = grupper.reduce((s, g) => s + g.pakker.filter((p) => p.mottatt).length, 0)
  const HeaderIcon = variant === "innbygger" ? UserIcon : ShieldIcon

  function toggle(område: string) {
    setOpenSet((prev) => {
      const next = new Set(prev)
      if (next.has(område)) next.delete(område)
      else next.add(område)
      return next
    })
  }

  return (
    <div className="mt-3">
      <button
        onClick={() => setSectionOpen((o) => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-left ${v.headerBg} ${v.border} ${sectionOpen ? "rounded-b-none" : ""}`}
      >
        <HeaderIcon className={`w-5 h-5 shrink-0 ${v.iconColor}`} />
        <span className="flex-1 text-sm font-medium text-gray-800">{tittel}</span>
        <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${v.badge}`}>
          {tildeltPakker} av {totalPakker} tildelt
        </span>
        <ChevronIcon open={sectionOpen} />
      </button>

      {sectionOpen && (
        <div className={`border-x border-b rounded-b-lg divide-y overflow-hidden ${v.border}`} style={{ borderColor: undefined }}>
          {grupper.map(({ område, pakker }) => {
            const mottattCount = pakker.filter((p) => p.mottatt).length
            const totalCount = pakker.length
            const isOpen = openSet.has(område)

            return (
              <div key={område}>
                <button
                  onClick={() => toggle(område)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left bg-white hover:bg-gray-50 transition-colors"
                >
                  <LockIcon className="w-5 h-5 text-gray-300 shrink-0" />
                  <span className="flex-1 text-sm text-gray-700">{område}</span>
                  <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${v.areaBadge}`}>
                    {mottattCount} av {totalCount}
                  </span>
                  <ChevronIcon open={isOpen} />
                </button>

                {isOpen && (
                  <ul className="px-4 pb-3 pt-1 space-y-1.5 bg-gray-50">
                    {pakker.map(({ identifier, tittelNb, mottatt }) => (
                      <li
                        key={identifier}
                        className={`flex items-center gap-2 text-xs ${mottatt ? "text-gray-800" : "text-gray-300"}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${mottatt ? v.dot : "bg-gray-200"}`} />
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
