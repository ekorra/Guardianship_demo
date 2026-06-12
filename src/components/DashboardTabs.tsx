"use client"

import { useState } from "react"
import { ResourceVelger } from "@/components/ResourceVelger"
import { AktørVelger } from "@/components/AktørVelger"
import type { AktørData } from "@/components/AktørVelger"
import { SkrankepunktFane } from "@/components/SkrankepunktFane"

type Tab = "fullmakter" | "skrankepunkt"

interface Props {
  harSkrankeAccess: boolean
  aktørData: AktørData[]
  loggedInPid: string
  altinnError: string | null
}

export function DashboardTabs({ harSkrankeAccess: initialHarSkrankeAccess, aktørData, loggedInPid, altinnError }: Props) {
  const defaultAktør =
    aktørData.find((a) => a.personId === loggedInPid) ?? aktørData[0]

  const [activeTab, setActiveTab] = useState<Tab>("fullmakter")
  const [selectedUuid, setSelectedUuid] = useState(defaultAktør?.partyUuid ?? "")
  const [harSkrankeAccess, setHarSkrankeAccess] = useState(initialHarSkrankeAccess)

  const selected = aktørData.find((a) => a.partyUuid === selectedUuid)

  async function onAktørChange(uuid: string) {
    setSelectedUuid(uuid)
    const aktør = aktørData.find((a) => a.partyUuid === uuid)
    if (!aktør) return

    const params = new URLSearchParams()
    if (aktør.organizationNumber) {
      params.set("orgnr", aktør.organizationNumber)
    } else if (aktør.personId) {
      params.set("personId", aktør.personId)
    }

    try {
      const res = await fetch(`/api/serviceowner/skrankepunkt-access?${params}`)
      const data = (await res.json()) as { hasAccess: boolean; traces?: unknown[] }
      if (data.traces?.length) {
        window.dispatchEvent(new CustomEvent("dev-trace", { detail: data.traces }))
      }
      setHarSkrankeAccess(data.hasAccess)
    } catch {
      setHarSkrankeAccess(false)
    }
  }

  return (
    <div>
      {aktørData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
            Aktør
          </label>
          <select
            value={selectedUuid}
            onChange={(e) => onAktørChange(e.target.value)}
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

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("fullmakter")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "fullmakter"
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 border-transparent hover:text-gray-700"
          }`}
        >
          Fullmakter
        </button>
        {harSkrankeAccess ? (
          <button
            onClick={() => setActiveTab("skrankepunkt")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "skrankepunkt"
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            Skrankepunkt
          </button>
        ) : (
          <span
            title="Ingen tilgang"
            className="px-4 py-2 text-sm font-medium text-gray-300 cursor-not-allowed flex items-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            Skrankepunkt
          </span>
        )}
      </div>

      {activeTab === "fullmakter" && (
        <>
          <ResourceVelger />
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
        </>
      )}

      {activeTab === "skrankepunkt" && <SkrankepunktFane />}
    </div>
  )
}
