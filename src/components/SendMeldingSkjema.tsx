"use client"

import { useState } from "react"

type Step = "form" | "bekreft" | "suksess" | "feil"

export function SendMeldingSkjema() {
  const [step, setStep] = useState<Step>("form")
  const [tilPid, setTilPid] = useState("")
  const [tittel, setTittel] = useState("")
  const [innhold, setInnhold] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setStep("form")
    setTilPid("")
    setTittel("")
    setInnhold("")
    setError(null)
  }

  async function send() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/serviceowner/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientPid: tilPid, title: tittel, body: innhold }),
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
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Send melding</p>

      {step === "form" && (
        <>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Mottakers fødselsnummer</label>
              <input
                value={tilPid}
                onChange={(e) => setTilPid(e.target.value)}
                placeholder="11 siffer"
                className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Tittel</label>
              <input
                value={tittel}
                onChange={(e) => setTittel(e.target.value)}
                placeholder="Tittel på meldingen"
                className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Meldingstekst</label>
              <textarea
                value={innhold}
                onChange={(e) => setInnhold(e.target.value)}
                placeholder="Skriv meldingen her..."
                rows={4}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => setStep("bekreft")}
              disabled={tilPid.length < 11 || !tittel.trim() || !innhold.trim()}
              className="text-sm bg-blue-600 text-white rounded px-4 py-1.5 disabled:bg-gray-200 disabled:text-gray-400"
            >
              Neste
            </button>
          </div>
        </>
      )}

      {step === "bekreft" && (
        <>
          <p className="text-sm font-medium text-gray-700 mb-3">Bekreft sending</p>
          <div className="space-y-1 text-xs text-gray-600 mb-4">
            <p>Til: <span className="font-mono">{tilPid}</span></p>
            <p>Tittel: {tittel}</p>
            <p className="italic">{innhold.slice(0, 100)}{innhold.length > 100 ? "…" : ""}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={send}
              disabled={loading}
              className="text-sm bg-blue-600 text-white rounded px-4 py-1.5 disabled:opacity-60"
            >
              {loading ? "Sender…" : "Send melding"}
            </button>
            <button onClick={() => setStep("form")} className="text-sm text-gray-400 hover:text-gray-600">
              Tilbake
            </button>
          </div>
        </>
      )}

      {step === "suksess" && (
        <div className="text-green-700">
          <p className="font-medium text-sm">Melding sendt</p>
          <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 mt-2">
            Send ny melding
          </button>
        </div>
      )}

      {step === "feil" && (
        <div className="text-red-700">
          <p className="font-medium text-sm">Sending feilet</p>
          {error && <p className="text-xs mt-1 font-mono break-all">{error}</p>}
          <div className="flex gap-2 mt-2">
            <button onClick={() => setStep("bekreft")} className="text-xs text-gray-400 hover:text-gray-600">
              Prøv igjen
            </button>
            <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600">
              Avbryt
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
