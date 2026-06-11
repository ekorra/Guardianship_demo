"use client"

import { useState } from "react"
import { ResourceVelger } from "@/components/ResourceVelger"
import { AktørVelger } from "@/components/AktørVelger"
import type { AktørData } from "@/components/AktørVelger"
import { SkrankepunktFane } from "@/components/SkrankepunktFane"

type Tab = "aktørliste" | "skrankepunkt"

interface Props {
  harSkrankeAccess: boolean
  aktørData: AktørData[]
  loggedInPid: string
  altinnError: string | null
}

export function DashboardTabs({ harSkrankeAccess, aktørData, loggedInPid, altinnError }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("aktørliste")

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("aktørliste")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "aktørliste"
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 border-transparent hover:text-gray-700"
          }`}
        >
          Aktørliste
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

      {activeTab === "aktørliste" && (
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
            <AktørVelger aktører={aktørData} loggedInPid={loggedInPid} />
          )}
        </>
      )}

      {activeTab === "skrankepunkt" && <SkrankepunktFane />}
    </div>
  )
}
