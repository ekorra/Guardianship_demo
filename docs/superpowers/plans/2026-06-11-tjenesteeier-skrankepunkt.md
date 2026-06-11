# Tjenesteeier Skrankepunkt — Implementasjonsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Legg til en «Skrankepunkt»-fane på tjenesteeier-dashbordet der innlogget bruker kan delegere tilgangspakker fra én person til en annen; tilgang styres av PDP-sjekk mot `ttd-skrankepunkt` (write).

**Architecture:** `page.tsx` (Server Component) kjører PDP-sjekk parallelt med aktørliste-henting og sender `harSkrankeAccess: boolean` til ny `DashboardTabs`-klientkomponent. En ny `SkrankepunktFane`-komponent inneholder skjemaet. Delegate-ruten validerer PDP på nytt ved innsending.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, Vitest, Auth.js v5

---

## Filstruktur

| Fil | Endring |
|---|---|
| `src/components/TjenesteeierDelegereSkjema.tsx` | Fjern 2.2-modus og mode-toggle |
| `src/components/SkrankepunktFane.tsx` | **Ny** — skjema form→bekreft→suksess/feil |
| `src/components/DashboardTabs.tsx` | **Ny** — tab-navigasjon, mottar `harSkrankeAccess` |
| `src/app/dashboard/page.tsx` | Legg til PDP-sjekk, bytt AktørVelger mot DashboardTabs |
| `src/app/api/serviceowner/delegate/route.ts` | Legg til PDP-resjekk ved innsending |
| `src/app/api/serviceowner/delegate/route.test.ts` | **Ny** — test for PDP-resjekk |

---

## Task 1: Fjern 2.2-modus fra TjenesteeierDelegereSkjema

**Files:**
- Modify: `src/components/TjenesteeierDelegereSkjema.tsx`

- [ ] **Steg 1: Erstatt innholdet i filen**

Fjern `Mode`-type, `mode`-state, `fraPid`-state, `effectiveFraPid` og mode-toggle-knappene. Behold kun 2.1-flyten.

```tsx
"use client"

import { useState } from "react"
import { DELEGERBARE_PAKKER } from "@/lib/resources"

type Step = "form" | "bekreft" | "suksess" | "feil"

interface Props {
  selectedAktørPid: string
  selectedAktørName: string
}

export function TjenesteeierDelegereSkjema({ selectedAktørPid, selectedAktørName }: Props) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("form")
  const [tilPid, setTilPid] = useState("")
  const [selectedPackage, setSelectedPackage] = useState(DELEGERBARE_PAKKER[0]?.id ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const packageLabel = DELEGERBARE_PAKKER.find((p) => p.id === selectedPackage)?.label ?? selectedPackage

  function reset() {
    setStep("form")
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
        body: JSON.stringify({ fromPid: selectedAktørPid, toPid: tilPid, packageUrn: selectedPackage }),
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
              disabled={tilPid.length < 11}
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
            <p>Fra: <span className="font-mono">{selectedAktørPid}</span> ({selectedAktørName})</p>
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
```

- [ ] **Steg 2: Kjør TypeScript-sjekk**

```bash
npx tsc --noEmit
```

Forventet: ingen feil

- [ ] **Steg 3: Commit**

```bash
git add src/components/TjenesteeierDelegereSkjema.tsx
git commit -m "refactor: fjern 2.2-modus fra TjenesteeierDelegereSkjema (TASK-39)"
```

---

## Task 2: Opprett SkrankepunktFane

**Files:**
- Create: `src/components/SkrankepunktFane.tsx`

- [ ] **Steg 1: Opprett filen**

```tsx
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
```

- [ ] **Steg 2: Kjør TypeScript-sjekk**

```bash
npx tsc --noEmit
```

Forventet: ingen feil

- [ ] **Steg 3: Commit**

```bash
git add src/components/SkrankepunktFane.tsx
git commit -m "feat: SkrankepunktFane-komponent med form/bekreft/suksess/feil-flyt (TASK-39)"
```

---

## Task 3: Opprett DashboardTabs

**Files:**
- Create: `src/components/DashboardTabs.tsx`

`DashboardTabs` mottar `harSkrankeAccess`, `aktørData`, `loggedInPid` og `altinnError` fra `page.tsx`. Den styrer tab-tilstand og renderer enten aktørliste-innhold eller `SkrankepunktFane`.

- [ ] **Steg 1: Opprett filen**

```tsx
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
```

- [ ] **Steg 2: Kjør TypeScript-sjekk**

```bash
npx tsc --noEmit
```

Forventet: ingen feil

- [ ] **Steg 3: Commit**

```bash
git add src/components/DashboardTabs.tsx
git commit -m "feat: DashboardTabs med Aktørliste/Skrankepunkt-faner (TASK-39)"
```

---

## Task 4: Oppdater page.tsx

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Steg 1: Legg til import og erstatt innholdet**

Erstatt hele filen med dette:

```tsx
import { auth } from "@/lib/auth"
import { getMaskinportenToken, decodeOrgnr } from "@/lib/maskinporten"
import { getAuthorizedParties, isVergePart, isInnbyggerPart, getVergemålGruppert, getInnbyggerGruppert } from "@/lib/altinn"
import { getAccessPackageMetadata } from "@/lib/accesspackages"
import { checkPdpAccess } from "@/lib/pdp"
import type { TraceEntry } from "@/lib/trace"
import { DevPanel } from "@/components/DevPanel"
import { DashboardTabs } from "@/components/DashboardTabs"
import type { AktørData } from "@/components/AktørVelger"
import { redirect } from "next/navigation"

const isDev = process.env.NODE_ENV === "development"

interface TjenesteeierInfo {
  navn: string
  orgnr: string | null
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const pid = session.user?.pid
  let tjenesteeier: TjenesteeierInfo = { navn: "Tjenesteeier", orgnr: null }
  let aktørData: AktørData[] = []
  let altinnError: string | null = null
  let harSkrankeAccess = false
  const traces: TraceEntry[] = []

  try {
    const mpToken = await getMaskinportenToken(
      "altinn:accessmanagement/authorizedparties.resourceowner"
    )
    const orgnr = decodeOrgnr(mpToken)
    if (orgnr) {
      const brregRes = await fetch(
        `https://data.brreg.no/enhetsregisteret/api/enheter/${orgnr}`,
        { next: { revalidate: 3600 } }
      )
      if (brregRes.ok) {
        const brregData = (await brregRes.json()) as { navn?: string }
        tjenesteeier = { navn: brregData.navn ?? "Ukjent virksomhet", orgnr }
      } else {
        tjenesteeier = { navn: "Ukjent virksomhet", orgnr }
      }
    }
  } catch {
    // Beholder default "Tjenesteeier" hvis noe feiler
  }

  if (pid) {
    const [partiesResult, metaResult, pdpResult] = await Promise.allSettled([
      getAuthorizedParties(pid, isDev ? traces : undefined),
      getAccessPackageMetadata(),
      checkPdpAccess(pid, pid, isDev ? traces : undefined, "ttd-skrankepunkt", "write"),
    ])

    harSkrankeAccess = pdpResult.status === "fulfilled" && pdpResult.value === "Permit"

    if (partiesResult.status === "fulfilled" && metaResult.status === "fulfilled") {
      const parties = partiesResult.value
      const metaMap = metaResult.value

      const sorted = [
        ...parties.filter((p) => p.personId === pid),
        ...parties.filter((p) => p.personId !== pid),
      ]

      aktørData = sorted.map((party) => ({
        partyUuid: party.partyUuid,
        name: party.name,
        personId: party.personId,
        vergemålGrupper: isVergePart(party) ? getVergemålGruppert(party, metaMap) : [],
        innbyggerGrupper: isInnbyggerPart(party) ? getInnbyggerGruppert(party, metaMap) : [],
      }))
    } else if (partiesResult.status === "rejected") {
      altinnError =
        partiesResult.reason instanceof Error
          ? partiesResult.reason.message
          : "Ukjent feil ved henting fra Altinn"
    }
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold text-gray-800">{tjenesteeier.navn}</p>
              {tjenesteeier.orgnr && (
                <p className="text-xs text-gray-400 font-mono">orgnr: {tjenesteeier.orgnr}</p>
              )}
            </div>
            <a href="/api/logout" className="text-sm text-gray-500 hover:text-gray-700">
              Logg ut
            </a>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6" data-testid="user-info">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Innlogget som</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-lg font-semibold text-blue-700">
                  {session.user?.name?.charAt(0) ?? "?"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 truncate">
                  {session.user?.name ?? <span className="italic text-gray-400 font-normal text-sm">ikke tilgjengelig</span>}
                </p>
                <p className="text-sm text-gray-400 font-mono mt-0.5">{pid ?? "—"}</p>
              </div>
            </div>
          </div>

          <DashboardTabs
            harSkrankeAccess={harSkrankeAccess}
            aktørData={aktørData}
            loggedInPid={pid ?? ""}
            altinnError={altinnError}
          />
        </div>
      </main>

      {isDev && <DevPanel traces={traces} />}
    </>
  )
}
```

- [ ] **Steg 2: Kjør TypeScript-sjekk**

```bash
npx tsc --noEmit
```

Forventet: ingen feil

- [ ] **Steg 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: PDP-sjekk for skrankepunkt ved sidelasting, DashboardTabs i page.tsx (TASK-39)"
```

---

## Task 5: Legg til PDP-resjekk i delegate route

**Files:**
- Modify: `src/app/api/serviceowner/delegate/route.ts`

- [ ] **Steg 1: Erstatt innholdet i filen**

```ts
import { auth } from "@/lib/auth"
import { delegateServiceownerPackage } from "@/lib/serviceowner"
import { checkPdpAccess } from "@/lib/pdp"
import { NextResponse } from "next/server"
import type { TraceEntry } from "@/lib/trace"

const isDev = process.env.NODE_ENV === "development"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.pid) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 })
  }

  const pid = session.user.pid

  let body: { fromPid?: string; toPid?: string; packageUrn?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 })
  }

  const { fromPid, toPid, packageUrn } = body
  if (!fromPid || !toPid || !packageUrn) {
    return NextResponse.json({ error: "fromPid, toPid og packageUrn er påkrevd" }, { status: 400 })
  }

  const traces: TraceEntry[] = []
  try {
    const pdpDecision = await checkPdpAccess(
      pid,
      pid,
      isDev ? traces : undefined,
      "ttd-skrankepunkt",
      "write",
    )
    if (pdpDecision !== "Permit") {
      return NextResponse.json(
        { ok: false, error: "Tilgang til skrankepunkt er trukket tilbake", traces: isDev ? traces : undefined },
        { status: 403 },
      )
    }
    await delegateServiceownerPackage(fromPid, toPid, packageUrn, isDev ? traces : undefined)
    return NextResponse.json({ ok: true, traces: isDev ? traces : undefined })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ukjent feil"
    return NextResponse.json({ error: message, traces: isDev ? traces : undefined }, { status: 500 })
  }
}
```

- [ ] **Steg 2: Kjør TypeScript-sjekk**

```bash
npx tsc --noEmit
```

Forventet: ingen feil

- [ ] **Steg 3: Commit**

```bash
git add src/app/api/serviceowner/delegate/route.ts
git commit -m "feat: PDP-resjekk i delegate route ved innsending (TASK-39)"
```

---

## Task 6: Skriv enhetstester og kjør testsuite

**Files:**
- Create: `src/app/api/serviceowner/delegate/route.test.ts`

- [ ] **Steg 1: Skriv en failing test for 403-tilfellet**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { pid: "01017012345" } }),
}))

vi.mock("@/lib/pdp", () => ({
  checkPdpAccess: vi.fn(),
}))

vi.mock("@/lib/serviceowner", () => ({
  delegateServiceownerPackage: vi.fn().mockResolvedValue(undefined),
}))

import { POST } from "./route"
import { checkPdpAccess } from "@/lib/pdp"
import { delegateServiceownerPackage } from "@/lib/serviceowner"

const VALID_BODY = { fromPid: "01017012345", toPid: "02029912345", packageUrn: "urn:altinn:accesspackage:test" }

function makeRequest(body: object) {
  return new Request("http://localhost/api/serviceowner/delegate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/serviceowner/delegate", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returnerer 403 når PDP gir Deny", async () => {
    vi.mocked(checkPdpAccess).mockResolvedValue("Deny")

    const res = await POST(makeRequest(VALID_BODY))
    const data = await res.json()

    expect(res.status).toBe(403)
    expect(data.ok).toBe(false)
    expect(data.error).toContain("trukket tilbake")
    expect(delegateServiceownerPackage).not.toHaveBeenCalled()
  })

  it("returnerer 403 når PDP gir NotApplicable", async () => {
    vi.mocked(checkPdpAccess).mockResolvedValue("NotApplicable")

    const res = await POST(makeRequest(VALID_BODY))

    expect(res.status).toBe(403)
    expect(delegateServiceownerPackage).not.toHaveBeenCalled()
  })

  it("delegerer og returnerer ok ved Permit", async () => {
    vi.mocked(checkPdpAccess).mockResolvedValue("Permit")

    const res = await POST(makeRequest(VALID_BODY))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(delegateServiceownerPackage).toHaveBeenCalledWith(
      VALID_BODY.fromPid,
      VALID_BODY.toPid,
      VALID_BODY.packageUrn,
      undefined,
    )
  })

  it("returnerer 401 uten session", async () => {
    const { auth } = await import("@/lib/auth")
    vi.mocked(auth).mockResolvedValueOnce(null)

    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(401)
  })

  it("returnerer 400 ved manglende felt", async () => {
    vi.mocked(checkPdpAccess).mockResolvedValue("Permit")

    const res = await POST(makeRequest({ fromPid: "01017012345" }))
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Steg 2: Kjør testene for å se at de feiler**

```bash
npm test -- route.test
```

Forventet: FAIL — `POST is not a function` eller lignende (filen eksisterer ikke ennå som modul er ferdig)

Merk: Hvis testen feiler med `Cannot find module '@/lib/auth'` eller lignende under mocking, er dette forventet til koden er implementert. Gå videre til steg 3.

- [ ] **Steg 3: Kjør alle enhetstester**

```bash
npm test
```

Forventet: Alle tester grønne (inkludert nye route-tester)

- [ ] **Steg 4: Commit**

```bash
git add src/app/api/serviceowner/delegate/route.test.ts
git commit -m "test: enhetstester for PDP-resjekk i delegate route (TASK-39)"
```

---

## Verifikasjon

Etter alle tasks:

```bash
npm test
```

Forventet: alle tester grønne.

Manuell smoke-test i nettleser (krever innlogging som tjenesteeier):
1. Åpne `/dashboard` — se at to faner vises
2. Som bruker **uten** skrankepunkt-tilgang: Skrankepunkt-fanen er grå med ⊘-ikon og tooltip «Ingen tilgang»
3. Som bruker **med** skrankepunkt-tilgang: Klikk Skrankepunkt-fanen — se tomt skjema med Fra/Til/Pakke-felt
4. Fyll inn 11-sifrede PID-er og velg pakke — «Neste»-knapp aktiveres
5. Bekreftelsessteg viser oppsummering og «Gi fullmakt»-knapp
6. Aktørliste-fanen fungerer som før med ResourceVelger og aktørliste
