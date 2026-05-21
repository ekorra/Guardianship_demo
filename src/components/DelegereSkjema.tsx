"use client"

import { useState } from "react"
import type { TraceEntry } from "@/lib/trace"
import { DELEGERBARE_PAKKER } from "@/lib/resources"

type Step = "form" | "velg" | "bekreft" | "suksess" | "feil"

export function DelegereSkjema() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("form")
  const [toPid, setToPid] = useState("")
  const [toLastName, setToLastName] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const mottattPakker = DELEGERBARE_PAKKER

  function reset() {
    setStep("form")
    setToPid("")
    setToLastName("")
    setSelected(new Set())
    setError(null)
    setOpen(false)
  }

  function togglePackage(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function sendDelegering() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/delegate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toPid,
          toLastName,
          packageIds: [...selected],
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string; traces?: TraceEntry[] }
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
          <p className="font-medium text-gray-700 mb-3">Hvem skal motta fullmakt?</p>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Fødselsnummer</label>
              <input
                value={toPid}
                onChange={(e) => setToPid(e.target.value)}
                placeholder="11 siffer"
                className="border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Etternavn</label>
              <input
                value={toLastName}
                onChange={(e) => setToLastName(e.target.value)}
                placeholder="Etternavn"
                className="border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setStep("velg")}
              disabled={toPid.length < 11 || !toLastName.trim()}
              className="text-xs bg-blue-600 text-white rounded px-3 py-1.5 disabled:bg-gray-200 disabled:text-gray-400"
            >
              Neste
            </button>
            <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600">
              Avbryt
            </button>
          </div>
        </>
      )}

      {step === "velg" && (
        <>
          <p className="font-medium text-gray-700 mb-3">Velg pakker å delegere</p>
          {mottattPakker.length === 0 ? (
            <p className="text-gray-400 italic text-xs">Ingen tilgangspakker å delegere.</p>
          ) : (
            <ul className="space-y-1 max-h-48 overflow-y-auto">
              {mottattPakker.map((p) => (
                <li key={p.id}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => togglePackage(p.id)}
                      className="rounded"
                    />
                    <span className="text-gray-700">{p.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setStep("bekreft")}
              disabled={selected.size === 0}
              className="text-xs bg-blue-600 text-white rounded px-3 py-1.5 disabled:bg-gray-200 disabled:text-gray-400"
            >
              Neste
            </button>
            <button onClick={() => setStep("form")} className="text-xs text-gray-400 hover:text-gray-600">
              Tilbake
            </button>
          </div>
        </>
      )}

      {step === "bekreft" && (
        <>
          <p className="font-medium text-gray-700 mb-2">Bekreft delegering</p>
          <p className="text-gray-600 text-xs mb-1">
            Mottaker: <span className="font-mono">{toPid}</span> ({toLastName})
          </p>
          <ul className="text-xs text-gray-600 list-disc list-inside mb-3">
            {[...selected].map((id) => {
              const pakke = mottattPakker.find((p) => p.id === id)
              return <li key={id}>{pakke?.label ?? id}</li>
            })}
          </ul>
          <div className="flex gap-2">
            <button
              onClick={sendDelegering}
              disabled={loading}
              className="text-xs bg-blue-600 text-white rounded px-3 py-1.5 disabled:opacity-60"
            >
              {loading ? "Sender…" : "Bekreft og deleger"}
            </button>
            <button onClick={() => setStep("velg")} className="text-xs text-gray-400 hover:text-gray-600">
              Tilbake
            </button>
          </div>
        </>
      )}

      {step === "suksess" && (
        <div className="text-green-700">
          <p className="font-medium">Delegering sendt</p>
          <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 mt-2">
            Lukk
          </button>
        </div>
      )}

      {step === "feil" && (
        <div className="text-red-700">
          <p className="font-medium">Delegering feilet</p>
          {error && <p className="text-xs mt-1 font-mono">{error}</p>}
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
