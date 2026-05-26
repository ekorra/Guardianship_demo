"use client"

import { useState } from "react"
import { DELEGERBARE_PAKKER } from "@/lib/resources"

type Mode = "2.1" | "2.2"
type Step = "form" | "bekreft" | "suksess" | "feil"

interface Props {
  selectedAktørPid: string
  selectedAktørName: string
}

export function TjenesteeierDelegereSkjema({ selectedAktørPid, selectedAktørName }: Props) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("2.1")
  const [step, setStep] = useState<Step>("form")
  const [fraPid, setFraPid] = useState("")
  const [tilPid, setTilPid] = useState("")
  const [selectedPackage, setSelectedPackage] = useState(DELEGERBARE_PAKKER[0]?.id ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const effectiveFraPid = mode === "2.1" ? selectedAktørPid : fraPid
  const packageLabel = DELEGERBARE_PAKKER.find((p) => p.id === selectedPackage)?.label ?? selectedPackage

  function reset() {
    setStep("form")
    setFraPid("")
    setTilPid("")
    setSelectedPackage(DELEGERBARE_PAKKER[0]?.id ?? "")
    setError(null)
    setOpen(false)
  }

  async function send() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/serviceowner/delegate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromPid: effectiveFraPid, toPid: tilPid, packageUrn: selectedPackage }),
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

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded px-2 py-1"
      >
        Deleger fullmakt
      </button>
    )
  }

  return (
    <div className="mt-3 border border-gray-200 rounded-lg p-4 bg-white text-sm">
      {step === "form" && (
        <>
          <div className="flex gap-3 mb-4 border-b border-gray-100 pb-3">
            <button
              onClick={() => setMode("2.1")}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                mode === "2.1"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              2.1 Normal delegering
            </button>
            <button
              onClick={() => setMode("2.2")}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                mode === "2.2"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              2.2 Skrankedelegering
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {mode === "2.1" ? (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Fra (aktør)</label>
                <div className="border border-gray-200 rounded px-2 py-1.5 text-sm bg-gray-50 text-gray-600">
                  {selectedAktørName} — <span className="font-mono">{selectedAktørPid}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Fra (fødselsnummer)</label>
                <input
                  value={fraPid}
                  onChange={(e) => setFraPid(e.target.value)}
                  placeholder="11 siffer"
                  className="border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                />
              </div>
            )}

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

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setStep("bekreft")}
              disabled={tilPid.length < 11 || (mode === "2.2" && fraPid.length < 11)}
              className="text-xs bg-blue-600 text-white rounded px-3 py-1.5 disabled:bg-gray-200 disabled:text-gray-400"
            >
              Neste
            </button>
            <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600">Avbryt</button>
          </div>
        </>
      )}

      {step === "bekreft" && (
        <>
          <p className="font-medium text-gray-700 mb-2">Bekreft delegering</p>
          <div className="space-y-1 text-xs text-gray-600 mb-3">
            <p>Fra: <span className="font-mono">{effectiveFraPid}</span>{mode === "2.1" ? ` (${selectedAktørName})` : ""}</p>
            <p>Til: <span className="font-mono">{tilPid}</span></p>
            <p>Pakke: {packageLabel}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={send}
              disabled={loading}
              className="text-xs bg-blue-600 text-white rounded px-3 py-1.5 disabled:opacity-60"
            >
              {loading ? "Sender…" : "Deleger"}
            </button>
            <button onClick={() => setStep("form")} className="text-xs text-gray-400 hover:text-gray-600">Tilbake</button>
          </div>
        </>
      )}

      {step === "suksess" && (
        <div className="text-green-700">
          <p className="font-medium">Fullmakt delegert</p>
          <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 mt-2">Lukk</button>
        </div>
      )}

      {step === "feil" && (
        <div className="text-red-700">
          <p className="font-medium">Delegering feilet</p>
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
