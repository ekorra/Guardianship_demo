"use client"

import { useState } from "react"
import { DELEGERBARE_PAKKER } from "@/lib/resources"

type Step = "form" | "bekreft" | "suksess" | "feil"

export function SkrankepunktFane() {
  const [step, setStep] = useState<Step>("form")
  const [fraPid, setFraPid] = useState("")
  const [tilPid, setTilPid] = useState("")
  const [selectedPackage, setSelectedPackage] = useState(DELEGERBARE_PAKKER[0]?.id ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const packageLabel = DELEGERBARE_PAKKER.find((p) => p.id === selectedPackage)?.label ?? selectedPackage

  function reset() {
    setStep("form")
    setFraPid("")
    setTilPid("")
    setSelectedPackage(DELEGERBARE_PAKKER[0]?.id ?? "")
    setError(null)
  }

  async function send() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/serviceowner/delegate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromPid: fraPid, toPid: tilPid, packageUrn: selectedPackage }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string; traces?: unknown[] }
      if (data.traces?.length) {
        window.dispatchEvent(new CustomEvent("dev-trace", { detail: data.traces }))
      }
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Noe gikk galt")
        setStep("feil")
      } else {
        setStep("suksess")
      }
    } catch {
      setError("Nettverksfeil — prøv igjen")
      setStep("feil")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {step === "form" && (
        <>
          <p className="text-sm font-semibold text-gray-700 mb-4">Deleger fullmakt på vegne av annen</p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Fra (fødselsnummer)</label>
              <input
                value={fraPid}
                onChange={(e) => setFraPid(e.target.value)}
                placeholder="11 siffer"
                className="border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Til (fødselsnummer)</label>
              <input
                value={tilPid}
                onChange={(e) => setTilPid(e.target.value)}
                placeholder="11 siffer"
                className="border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Tilgangspakke</label>
              <select
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                className="border border-gray-200 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
              >
                {DELEGERBARE_PAKKER.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => setStep("bekreft")}
              disabled={fraPid.length < 11 || tilPid.length < 11}
              className="text-sm bg-blue-600 text-white rounded px-4 py-1.5 disabled:bg-gray-200 disabled:text-gray-400"
            >
              Neste
            </button>
          </div>
        </>
      )}

      {step === "bekreft" && (
        <>
          <p className="text-sm font-semibold text-gray-700 mb-3">Bekreft delegering</p>
          <div className="space-y-1 text-xs text-gray-600 mb-4">
            <p>Fra: <span className="font-mono">{fraPid}</span></p>
            <p>Til: <span className="font-mono">{tilPid}</span></p>
            <p>Pakke: {packageLabel}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={send}
              disabled={loading}
              className="text-sm bg-blue-600 text-white rounded px-4 py-1.5 disabled:opacity-60"
            >
              {loading ? "Sender…" : "Gi fullmakt"}
            </button>
            <button onClick={() => setStep("form")} className="text-sm text-gray-400 hover:text-gray-600">Tilbake</button>
          </div>
        </>
      )}

      {step === "suksess" && (
        <div className="text-green-700">
          <p className="font-medium text-sm">Fullmakt delegert</p>
          <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 mt-2">Lukk</button>
        </div>
      )}

      {step === "feil" && (
        <div className="text-red-700">
          <p className="font-medium text-sm">Delegering feilet</p>
          {error && <p className="text-xs mt-1 font-mono break-all">{error}</p>}
          <div className="flex gap-2 mt-2">
            <button onClick={() => setStep("bekreft")} className="text-xs text-gray-400 hover:text-gray-600">Prøv igjen</button>
            <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600">Avbryt</button>
          </div>
        </div>
      )}
    </div>
  )
}
