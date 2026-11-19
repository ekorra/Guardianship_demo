"use client"

import { useState } from "react"
import { DELEGERBARE_PAKKER } from "@/lib/resources"
import { EnkelttjenesteVelger, actionLabel } from "@/components/EnkelttjenesteVelger"
import type { EnkelttjenesteValg } from "@/components/EnkelttjenesteVelger"
import type { AltinnProblem } from "@/lib/serviceowner"

type Mode = "gi" | "be"
type Step = "form" | "bekreft" | "suksess" | "feil"
type ValgType = "package" | "resource"

interface Props {
  selectedAktørPid: string
  selectedAktørName: string
}

interface RequestItem {
  id: string
  status: string
  typeLabel: string
  detailLabel: string
  toPid: string
  detailsLink?: string
  loading: boolean
}

const STATUS_LABELS: Record<string, string> = {
  None: "Ukjent",
  Draft: "Utkast",
  Pending: "Venter på godkjenning",
  Approved: "Godkjent",
  Rejected: "Avvist",
  Withdrawn: "Trukket tilbake",
}

// Kantlinje + ikon + tekst, slik at status ikke formidles med farge alene (WCAG 1.4.1)
const STATUS_COLORS: Record<string, string> = {
  None: "bg-gray-50 text-gray-700 border-gray-300",
  Draft: "bg-gray-50 text-gray-700 border-gray-300",
  Pending: "bg-yellow-50 text-yellow-800 border-yellow-400",
  Approved: "bg-green-50 text-green-800 border-green-500",
  Rejected: "bg-red-50 text-red-800 border-red-500",
  Withdrawn: "bg-gray-50 text-gray-700 border-gray-300",
}

const STATUS_ICONS: Record<string, string> = {
  None: "?",
  Draft: "✎",
  Pending: "⏳",
  Approved: "✓",
  Rejected: "✕",
  Withdrawn: "↩",
}

const AVSLUTTET_STATUS = ["Approved", "Rejected", "Withdrawn"]

// Kjente valideringskoder fra Altinn oversatt til forklarende norsk tekst
const ALTINN_FEILKODER: Record<string, string> = {
  "AMSO.VLD-00006":
    "Tjenesten eies ikke av denne tjenesteeieren. En tjenesteeier kan bare be om tilgang til egne tjenester.",
}

function AltinnFeil({
  tittel,
  error,
  problem,
  onRetry,
  onCancel,
}: {
  tittel: string
  error: string | null
  problem: AltinnProblem | null
  onRetry: () => void
  onCancel: () => void
}) {
  return (
    <div role="alert" className="border border-red-300 bg-red-50 rounded p-3 text-red-800">
      <p className="font-medium flex items-center gap-1.5">
        <span aria-hidden="true">✕</span>
        {problem ? "Altinn avviste kallet" : tittel}
      </p>
      {problem?.validationErrors?.length ? (
        <ul className="text-sm mt-1 list-disc pl-5">
          {problem.validationErrors.map((v, i) => (
            <li key={i}>{(v.code && ALTINN_FEILKODER[v.code]) ?? v.detail}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm mt-1">{problem?.detail ?? (problem ? null : error)}</p>
      )}
      {problem && (
        <details className="mt-2 text-xs">
          <summary className="cursor-pointer text-red-700">Tekniske detaljer</summary>
          <pre className="mt-1 p-2 bg-white border border-red-200 rounded font-mono whitespace-pre-wrap break-all text-gray-700">
            {JSON.stringify(problem, null, 2)}
          </pre>
        </details>
      )}
      <div className="flex gap-2 mt-2">
        <button onClick={onRetry} className="text-xs text-gray-500 hover:text-gray-700">Prøv igjen</button>
        <button onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-700">Avbryt</button>
      </div>
    </div>
  )
}

const TOM_ENKELTTJENESTE: EnkelttjenesteValg = { resourceId: "", title: "", actions: [] }

function dispatchTraces(data: { traces?: unknown[] }) {
  if (data.traces?.length) {
    window.dispatchEvent(new CustomEvent("dev-trace", { detail: data.traces }))
  }
}

function TypeKort({
  valgt,
  tittel,
  forklaring,
  onClick,
}: {
  valgt: boolean
  tittel: string
  forklaring: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-lg border-[1.5px] p-2 flex gap-2 items-start ${
        valgt ? "border-blue-600 bg-blue-50" : "border-gray-200"
      }`}
    >
      <div
        className={`w-3.5 h-3.5 rounded-full border-[1.5px] mt-0.5 shrink-0 flex items-center justify-center ${
          valgt ? "border-blue-600" : "border-gray-300"
        }`}
      >
        {valgt && <div className="w-2 h-2 rounded-full bg-blue-600" />}
      </div>
      <div>
        <p className={`text-xs font-semibold ${valgt ? "text-blue-900" : "text-gray-700"}`}>{tittel}</p>
        <p className={`text-[10.5px] leading-snug mt-0.5 ${valgt ? "text-blue-500" : "text-gray-400"}`}>
          {forklaring}
        </p>
      </div>
    </button>
  )
}

export function TjenesteeierDelegereSkjema({ selectedAktørPid, selectedAktørName }: Props) {
  const [mode, setMode] = useState<Mode>("gi")
  const [step, setStep] = useState<Step>("form")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [problem, setProblem] = useState<AltinnProblem | null>(null)

  // "Gi fullmakt"
  const [giTilPid, setGiTilPid] = useState("")
  const [giType, setGiType] = useState<ValgType>("package")
  const [giPackage, setGiPackage] = useState(DELEGERBARE_PAKKER[0]?.id ?? "")
  const [giEnkelttjeneste, setGiEnkelttjeneste] = useState<EnkelttjenesteValg>(TOM_ENKELTTJENESTE)

  // "Be om fullmakt"
  const [beTilPid, setBeTilPid] = useState("")
  const [beType, setBeType] = useState<ValgType>("package")
  const [bePackage, setBePackage] = useState(DELEGERBARE_PAKKER[0]?.id ?? "")
  const [beEnkelttjeneste, setBeEnkelttjeneste] = useState<EnkelttjenesteValg>(TOM_ENKELTTJENESTE)

  const [requests, setRequests] = useState<RequestItem[]>([])

  const giPackageLabel = DELEGERBARE_PAKKER.find((p) => p.id === giPackage)?.label ?? giPackage
  const bePackageLabel = DELEGERBARE_PAKKER.find((p) => p.id === bePackage)?.label ?? bePackage

  function switchMode(next: Mode) {
    setMode(next)
    setStep("form")
    setError(null)
  }

  function resetGi() {
    setStep("form")
    setGiTilPid("")
    setGiType("package")
    setGiPackage(DELEGERBARE_PAKKER[0]?.id ?? "")
    setGiEnkelttjeneste(TOM_ENKELTTJENESTE)
    setError(null)
  }

  function resetBe() {
    setStep("form")
    setBeTilPid("")
    setError(null)
  }

  async function sendGi() {
    setLoading(true)
    setError(null)
    setProblem(null)
    try {
      const body =
        giType === "package"
          ? { fromPid: selectedAktørPid, toPid: giTilPid, packageUrn: giPackage }
          : {
              fromPid: selectedAktørPid,
              toPid: giTilPid,
              resourceId: giEnkelttjeneste.resourceId,
              rightKeys: giEnkelttjeneste.actions,
            }
      const res = await fetch("/api/serviceowner/delegate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string; problem?: AltinnProblem; traces?: unknown[] }
      dispatchTraces(data)
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Noe gikk galt")
        setProblem(data.problem ?? null)
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

  async function sendBe() {
    // Åpnes synkront i klikk-handleren, ellers blokkeres popupen etter await
    const altinnFane = window.open("", "_blank")
    setLoading(true)
    setError(null)
    setProblem(null)
    try {
      const body =
        beType === "package"
          ? { type: "package", fromPid: selectedAktørPid, toPid: beTilPid, packageUrn: bePackage }
          : {
              type: "resource",
              fromPid: selectedAktørPid,
              toPid: beTilPid,
              resourceId: beEnkelttjeneste.resourceId,
              rightKeys: beEnkelttjeneste.actions,
            }
      const res = await fetch("/api/serviceowner/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        problem?: AltinnProblem
        traces?: unknown[]
        request?: { id: string; status: string; links?: { detailsLink?: string | null } }
      }
      dispatchTraces(data)
      const detailsLink = data.request?.links?.detailsLink ?? undefined
      if (altinnFane) {
        if (detailsLink) {
          altinnFane.opener = null
          altinnFane.location.href = detailsLink
        } else {
          altinnFane.close()
        }
      }
      if (!res.ok || !data.ok || !data.request) {
        setError(data.error ?? "Noe gikk galt")
        setProblem(data.problem ?? null)
        setStep("feil")
      } else {
        setRequests((prev) => [
          {
            id: data.request!.id,
            status: data.request!.status,
            typeLabel: beType === "package" ? "Tilgangspakke" : "Enkelttjeneste",
            detailLabel:
              beType === "package"
                ? bePackageLabel
                : `${beEnkelttjeneste.title} (${beEnkelttjeneste.actions.map(actionLabel).join(", ")})`,
            toPid: beTilPid,
            detailsLink,
            loading: false,
          },
          ...prev,
        ])
        setStep("suksess")
      }
    } catch {
      altinnFane?.close()
      setError("Nettverksfeil — prøv igjen")
      setStep("feil")
    } finally {
      setLoading(false)
    }
  }

  async function refreshStatus(id: string) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, loading: true } : r)))
    try {
      const res = await fetch(`/api/serviceowner/request/${id}`)
      const data = (await res.json()) as {
        ok?: boolean
        traces?: unknown[]
        request?: { status: string }
      }
      dispatchTraces(data)
      if (data.ok && data.request) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: data.request!.status, loading: false } : r)),
        )
      } else {
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, loading: false } : r)))
      }
    } catch {
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, loading: false } : r)))
    }
  }

  async function withdraw(id: string) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, loading: true } : r)))
    try {
      const res = await fetch(`/api/serviceowner/request/${id}`, { method: "PUT" })
      const data = (await res.json()) as {
        ok?: boolean
        traces?: unknown[]
        request?: { status: string }
      }
      dispatchTraces(data)
      if (data.ok && data.request) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: data.request!.status, loading: false } : r)),
        )
      } else {
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, loading: false } : r)))
      }
    } catch {
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, loading: false } : r)))
    }
  }

  const giNesteDisabled =
    giTilPid.length < 11 || (giType === "resource" && giEnkelttjeneste.actions.length === 0)
  const beNesteDisabled =
    beTilPid.length < 11 || (beType === "resource" && beEnkelttjeneste.actions.length === 0)

  return (
    <div className="border-t border-gray-100 pt-4 mt-2 text-sm">
      <div className="inline-flex bg-gray-100 rounded-md p-0.5 mb-3">
        <button
          type="button"
          onClick={() => switchMode("gi")}
          className={`text-xs font-medium rounded px-3 py-1 ${
            mode === "gi" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Gi fullmakt
        </button>
        <button
          type="button"
          onClick={() => switchMode("be")}
          className={`text-xs font-medium rounded px-3 py-1 ${
            mode === "be" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Be om fullmakt
        </button>
      </div>

      {mode === "gi" && (
        <>
          {step === "form" && (
            <>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Fra (aktør)</label>
                  <div className="border border-gray-200 rounded px-2 py-1.5 text-sm bg-gray-50 text-gray-600">
                    {selectedAktørName} — <span className="font-mono">{selectedAktørPid}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Til (fødselsnummer)</label>
                  <input
                    value={giTilPid}
                    onChange={(e) => setGiTilPid(e.target.value)}
                    placeholder="11 siffer"
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-300"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500">Hva skal det gis fullmakt til?</label>
                  <div className="flex flex-col gap-1.5">
                    <TypeKort
                      valgt={giType === "package"}
                      tittel="Tilgangspakke"
                      forklaring="En samlepakke med flere rettigheter, f.eks. «Støtte og tilskudd»."
                      onClick={() => setGiType("package")}
                    />
                    <TypeKort
                      valgt={giType === "resource"}
                      tittel="Enkelttjeneste"
                      forklaring="Tilgang til én bestemt tjeneste, f.eks. «Dagpenger (NAV)»."
                      onClick={() => setGiType("resource")}
                    />
                  </div>
                </div>

                {giType === "package" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Tilgangspakke</label>
                    <select
                      value={giPackage}
                      onChange={(e) => setGiPackage(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
                    >
                      {DELEGERBARE_PAKKER.map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {giType === "resource" && (
                  <EnkelttjenesteVelger value={giEnkelttjeneste} onChange={setGiEnkelttjeneste} allowCustom />
                )}
              </div>
              <div className="mt-3">
                <button
                  onClick={() => setStep("bekreft")}
                  disabled={giNesteDisabled}
                  className="text-xs bg-blue-600 text-white rounded px-3 py-1.5 disabled:bg-gray-200 disabled:text-gray-400"
                >
                  Neste
                </button>
              </div>
            </>
          )}

          {step === "bekreft" && (
            <>
              <p className="font-medium text-gray-700 mb-2">Bekreft delegering</p>
              <div className="space-y-1 text-xs text-gray-600 mb-3">
                <p>Fra: <span className="font-mono">{selectedAktørPid}</span> ({selectedAktørName})</p>
                <p>Til: <span className="font-mono">{giTilPid}</span></p>
                <p>
                  {giType === "package"
                    ? `Pakke: ${giPackageLabel}`
                    : `Enkelttjeneste: ${giEnkelttjeneste.title} (${giEnkelttjeneste.actions.map(actionLabel).join(", ")})`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={sendGi}
                  disabled={loading}
                  className="text-xs bg-blue-600 text-white rounded px-3 py-1.5 disabled:opacity-60"
                >
                  {loading ? "Sender…" : "Gi fullmakt"}
                </button>
                <button onClick={() => setStep("form")} className="text-xs text-gray-400 hover:text-gray-600">Tilbake</button>
              </div>
            </>
          )}

          {step === "suksess" && (
            <div className="text-green-700">
              <p className="font-medium">Fullmakt delegert</p>
              <button onClick={resetGi} className="text-xs text-gray-400 hover:text-gray-600 mt-2">Lukk</button>
            </div>
          )}

          {step === "feil" && (
            <AltinnFeil
              tittel="Delegering feilet"
              error={error}
              problem={problem}
              onRetry={() => setStep("bekreft")}
              onCancel={resetGi}
            />
          )}
        </>
      )}

      {mode === "be" && (
        <>
          {step === "form" && (
            <>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Fra (aktør)</label>
                  <div className="border border-gray-200 rounded px-2 py-1.5 text-sm bg-gray-50 text-gray-600">
                    {selectedAktørName} — <span className="font-mono">{selectedAktørPid}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">Til (fødselsnummer)</label>
                  <input
                    value={beTilPid}
                    onChange={(e) => setBeTilPid(e.target.value)}
                    placeholder="11 siffer"
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-300"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500">Hva skal det bes om?</label>
                  <div className="flex flex-col gap-1.5">
                    <TypeKort
                      valgt={beType === "package"}
                      tittel="Tilgangspakke"
                      forklaring="En samlepakke med flere rettigheter, f.eks. «Støtte og tilskudd»."
                      onClick={() => setBeType("package")}
                    />
                    <TypeKort
                      valgt={beType === "resource"}
                      tittel="Enkelttjeneste"
                      forklaring="Tilgang til én bestemt tjeneste, f.eks. «Dagpenger (NAV)»."
                      onClick={() => setBeType("resource")}
                    />
                  </div>
                </div>

                {beType === "package" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Tilgangspakke</label>
                    <select
                      value={bePackage}
                      onChange={(e) => setBePackage(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
                    >
                      {DELEGERBARE_PAKKER.map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {beType === "resource" && (
                  <EnkelttjenesteVelger value={beEnkelttjeneste} onChange={setBeEnkelttjeneste} allowCustom />
                )}
              </div>

              <div className="mt-3">
                <button
                  onClick={() => setStep("bekreft")}
                  disabled={beNesteDisabled}
                  className="text-xs bg-blue-600 text-white rounded px-3 py-1.5 disabled:bg-gray-200 disabled:text-gray-400"
                >
                  Neste
                </button>
              </div>
            </>
          )}

          {step === "bekreft" && (
            <>
              <p className="font-medium text-gray-700 mb-2">Bekreft forespørsel</p>
              <div className="space-y-1 text-xs text-gray-600 mb-3">
                <p>Fra: <span className="font-mono">{selectedAktørPid}</span> ({selectedAktørName})</p>
                <p>Til: <span className="font-mono">{beTilPid}</span></p>
                <p>
                  {beType === "package"
                    ? `Tilgangspakke: ${bePackageLabel}`
                    : `Enkelttjeneste: ${beEnkelttjeneste.title} (${beEnkelttjeneste.actions.map(actionLabel).join(", ")})`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={sendBe}
                  disabled={loading}
                  className="text-xs bg-blue-600 text-white rounded px-3 py-1.5 disabled:opacity-60"
                >
                  {loading ? "Sender…" : "Be om fullmakt"}
                </button>
                <button onClick={() => setStep("form")} className="text-xs text-gray-400 hover:text-gray-600">Tilbake</button>
              </div>
            </>
          )}

          {step === "suksess" && (
            <div className="text-green-700">
              <p className="font-medium">Forespørsel opprettet som utkast</p>
              <p className="text-xs mt-1">
                Fullfør forespørselen i Altinn-fanen som ble åpnet. Den sendes ikke til mottakeren før du har
                bekreftet den der. Ble ingen fane åpnet, bruk «Fullfør i Altinn» under.
              </p>
              <button onClick={resetBe} className="text-xs text-gray-400 hover:text-gray-600 mt-2">Lukk</button>
            </div>
          )}

          {step === "feil" && (
            <AltinnFeil
              tittel="Forespørsel feilet"
              error={error}
              problem={problem}
              onRetry={() => setStep("bekreft")}
              onCancel={resetBe}
            />
          )}

          {requests.length > 0 && (
            <div className="mt-4 border-t border-gray-100 pt-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Sendte forespørsler (denne økten)
              </p>
              <div className="flex flex-col gap-2">
                {requests.map((r) => (
                  <div key={r.id} className="border border-gray-200 rounded p-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-gray-700">
                        {r.typeLabel}: {r.detailLabel} → <span className="font-mono">{r.toPid}</span>
                      </p>
                      <span
                        role="status"
                        aria-live="polite"
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-medium whitespace-nowrap ${STATUS_COLORS[r.status] ?? STATUS_COLORS.None}`}
                      >
                        <span aria-hidden="true">{STATUS_ICONS[r.status] ?? STATUS_ICONS.None}</span>
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-1.5">
                      {r.status === "Draft" && r.detailsLink && (
                        <a
                          href={r.detailsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          Fullfør i Altinn
                        </a>
                      )}
                      {!AVSLUTTET_STATUS.includes(r.status) && (
                        <button
                          onClick={() => refreshStatus(r.id)}
                          disabled={r.loading}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-60"
                        >
                          Sjekk status på nytt
                        </button>
                      )}
                      <button
                        onClick={() => withdraw(r.id)}
                        disabled={r.loading || AVSLUTTET_STATUS.includes(r.status)}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-60"
                      >
                        Trekk tilbake
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
