# Tjenesteeier UI-forbedringer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Oppdater tjenesteeier-dashbordet med ny standardressurs, ryddigere ressursvelger, fjern tilgangssjekk fra brukerinfo-kortet, og vis tjenesteeierens org-navn og orgnr i headeren.

**Architecture:** Enkle UI-tweaks i eksisterende komponenter + en ny eksportert `decodeOrgnr`-hjelpefunksjon i `maskinporten.ts` som brukes inline i `dashboard/page.tsx` for å hente orgnr fra Maskinporten-JWT og slå opp navn i Brønnøysundregistrene.

**Tech Stack:** Next.js 15 App Router (Server Components), TypeScript, Tailwind CSS, Vitest

---

## Filkart

| Fil | Endring |
|-----|---------|
| `src/lib/resources.ts` | Legg til Støtte og tilskudd som første element i `PRECONFIGURED_RESOURCES` |
| `src/lib/maskinporten.ts` | Legg til eksportert `decodeOrgnr(token: string): string \| null` |
| `src/lib/maskinporten.test.ts` | Legg til tester for `decodeOrgnr` |
| `src/components/ResourceVelger.tsx` | Rename label; fjern action-visning og action-inputfelt |
| `src/app/dashboard/page.tsx` | Fjern `TilgangKnapp` fra user-info; legg til tjenesteeierinfo i header |

---

## Task 1: Legg til Støtte og tilskudd som standardressurs

**Files:**
- Modify: `src/lib/resources.ts`

- [ ] **Steg 1: Oppdater PRECONFIGURED_RESOURCES**

  Åpne `src/lib/resources.ts`. Legg til pakken som **første** element i arrayet (index 0 = default):

  ```ts
  export const PRECONFIGURED_RESOURCES: Resource[] = [
    { id: "urn:altinn:accesspackage:innbygger-stotte-tilskudd", label: "Støtte og tilskudd" },
    { id: "ttd-vergemalsdemo", label: "Vergmålsdemo (TTD)" },
    { id: "ttd-fullmaktdemo", label: "Fullmaktdemo (TTD)" },
    { id: "nav-dagpenger", label: "Dagpenger (NAV)" },
    { id: "skd-skattemelding", label: "Skattemelding (Skatteetaten)" },
    { id: "brg-firmaopplysninger", label: "Firmaopplysninger (Brønnøysund)" },
  ]
  ```

- [ ] **Steg 2: Kjør tester for å sjekke at ingenting er ødelagt**

  ```bash
  npm test
  ```

  Forventet: alle tester passerer (ingen tester avhenger av rekkefølge i PRECONFIGURED_RESOURCES).

- [ ] **Steg 3: Commit**

  ```bash
  git add src/lib/resources.ts
  git commit -m "feat: legg til Støtte og tilskudd som standardressurs (TASK-40)"
  ```

---

## Task 2: Legg til decodeOrgnr i maskinporten.ts

Orgnr hentes fra consumer-feltet i Maskinporten-JWT. JWT-payload er base64url-encodet JSON.

**Files:**
- Modify: `src/lib/maskinporten.ts`
- Modify: `src/lib/maskinporten.test.ts`

- [ ] **Steg 1: Skriv den feilende testen**

  Åpne `src/lib/maskinporten.test.ts`. Legg til denne `describe`-blokken **etter** de eksisterende testene (ikke inni noen describe):

  ```ts
  import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
  import { generateKeyPair, exportJWK } from "jose"
  import { getMaskinportenToken, _resetTokenCache, decodeOrgnr } from "./maskinporten"
  ```

  Erstatt import-linja øverst slik at `decodeOrgnr` er med, og legg til:

  ```ts
  describe("decodeOrgnr", () => {
    function makeJwt(payload: Record<string, unknown>): string {
      const header = Buffer.from(JSON.stringify({ alg: "RS256" })).toString("base64url")
      const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
      return `${header}.${body}.fakesignature`
    }

    it("returnerer orgnr fra consumer.ID med 0192-prefix", () => {
      const token = makeJwt({
        consumer: { authority: "iso6523-actorid-upis", ID: "0192:991825827" },
      })
      expect(decodeOrgnr(token)).toBe("991825827")
    })

    it("returnerer null hvis consumer mangler", () => {
      const token = makeJwt({ iss: "https://test.maskinporten.no/" })
      expect(decodeOrgnr(token)).toBeNull()
    })

    it("returnerer null hvis token er ugyldig base64", () => {
      expect(decodeOrgnr("ikke.et.jwt")).toBeNull()
    })

    it("returnerer ID uendret hvis prefix ikke er 0192:", () => {
      const token = makeJwt({
        consumer: { authority: "iso6523-actorid-upis", ID: "0184:991825827" },
      })
      expect(decodeOrgnr(token)).toBe("0184:991825827")
    })
  })
  ```

- [ ] **Steg 2: Kjør for å bekrefte at testene feiler**

  ```bash
  npm test -- --reporter=verbose 2>&1 | grep -E "decodeOrgnr|FAIL|PASS"
  ```

  Forventet: `decodeOrgnr` er not a function / import error.

- [ ] **Steg 3: Implementer decodeOrgnr i maskinporten.ts**

  Legg til denne funksjonen **nederst** i `src/lib/maskinporten.ts`, etter `_resetTokenCache`:

  ```ts
  /** Dekoder Maskinporten JWT-payload og returnerer orgnr fra consumer.ID. */
  export function decodeOrgnr(token: string): string | null {
    try {
      const parts = token.split(".")
      if (parts.length < 2) return null
      const payload = JSON.parse(
        Buffer.from(parts[1], "base64url").toString("utf-8")
      ) as { consumer?: { ID?: string } }
      const id = payload.consumer?.ID
      if (!id) return null
      return id.startsWith("0192:") ? id.slice(5) : id
    } catch {
      return null
    }
  }
  ```

- [ ] **Steg 4: Kjør tester og bekreft at de passerer**

  ```bash
  npm test
  ```

  Forventet: alle tester inkludert de fire nye `decodeOrgnr`-testene passerer.

- [ ] **Steg 5: Commit**

  ```bash
  git add src/lib/maskinporten.ts src/lib/maskinporten.test.ts
  git commit -m "feat: legg til decodeOrgnr-hjelper i maskinporten (TASK-40)"
  ```

---

## Task 3: Rydd opp i ResourceVelger

Fjern action-visning og action-input. Rename seksjonstittel.

**Files:**
- Modify: `src/components/ResourceVelger.tsx`

- [ ] **Steg 1: Fjern newAction-state og action-inputfeltet**

  I `src/components/ResourceVelger.tsx`:

  1. Fjern denne linja i state-deklarasjonene:
     ```ts
     const [newAction, setNewAction] = useState("")
     ```

  2. I `addCustomResource()`-funksjonen, fjern:
     ```ts
     const action = newAction.trim() || undefined
     const updated = [...customResources, { id, label, ...(action && { action }) }]
     ```
     Erstatt med:
     ```ts
     const updated = [...customResources, { id, label }]
     ```

  3. Fjern disse linjene i samme funksjon:
     ```ts
     setNewAction("")
     ```
     og kall til `dispatchChange(id, action)` → bytt til `dispatchChange(id)`.

  4. Fjern `<span>`-en som viser action i hoveddelen:
     ```tsx
     <span className="text-xs text-gray-400 font-mono shrink-0">
       action: <span className="text-gray-600">{effectiveAction}</span>
     </span>
     ```

  5. Fjern action-inputfeltet i legg-til-skjemaet (hele `<div className="flex flex-col gap-1">` med label `Action` og input for `newAction`).

  6. Rename seksjonstittel linje 82:
     ```tsx
     Ressurs for tilgangssjekk
     ```
     til:
     ```tsx
     Ressurs
     ```

  Resulterende `ResourceVelger.tsx` etter endringene:

  ```tsx
  "use client"

  import { useState, useEffect, useRef } from "react"
  import {
    PRECONFIGURED_RESOURCES,
    LOCALSTORAGE_CUSTOM_KEY,
    LOCALSTORAGE_SELECTED_KEY,
    RESOURCE_CHANGE_EVENT,
  } from "@/lib/resources"
  import type { Resource } from "@/lib/resources"

  function loadCustomResources(): Resource[] {
    try {
      const raw = localStorage.getItem(LOCALSTORAGE_CUSTOM_KEY)
      return raw ? (JSON.parse(raw) as Resource[]) : []
    } catch {
      return []
    }
  }

  function saveCustomResources(resources: Resource[]) {
    localStorage.setItem(LOCALSTORAGE_CUSTOM_KEY, JSON.stringify(resources))
  }

  export function ResourceVelger() {
    const [customResources, setCustomResources] = useState<Resource[]>([])
    const [selectedId, setSelectedId] = useState(PRECONFIGURED_RESOURCES[0].id)
    const [showAdd, setShowAdd] = useState(false)
    const [newId, setNewId] = useState("")
    const [newLabel, setNewLabel] = useState("")
    const addInputRef = useRef<HTMLInputElement>(null)

    const allResources = [...PRECONFIGURED_RESOURCES, ...customResources]

    useEffect(() => {
      const saved = loadCustomResources()
      setCustomResources(saved)
      const savedId = localStorage.getItem(LOCALSTORAGE_SELECTED_KEY)
      if (savedId) setSelectedId(savedId)
    }, [])

    useEffect(() => {
      if (showAdd) addInputRef.current?.focus()
    }, [showAdd])

    function dispatchChange(id: string, action?: string) {
      const resolved = action ?? allResources.find((r) => r.id === id)?.action ?? "read"
      localStorage.setItem(LOCALSTORAGE_SELECTED_KEY, id)
      window.dispatchEvent(
        new CustomEvent(RESOURCE_CHANGE_EVENT, { detail: { id, action: resolved } }),
      )
    }

    function handleSelect(id: string) {
      setSelectedId(id)
      dispatchChange(id)
    }

    function addCustomResource() {
      const id = newId.trim()
      if (!id) return
      const label = newLabel.trim() || id
      const updated = [...customResources, { id, label }]
      setCustomResources(updated)
      saveCustomResources(updated)
      setSelectedId(id)
      dispatchChange(id)
      setNewId("")
      setNewLabel("")
      setShowAdd(false)
    }

    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Ressurs
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedId}
            onChange={(e) => handleSelect(e.target.value)}
            className="text-sm border border-gray-200 rounded px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 flex-1 min-w-0"
          >
            {allResources.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>

          <button
            onClick={() => setShowAdd((v) => !v)}
            title={showAdd ? "Avbryt" : "Legg til ressurs"}
            className="text-sm text-gray-400 hover:text-gray-600 px-2 py-1 rounded border border-gray-200 shrink-0"
          >
            {showAdd ? "✕" : "+ Legg til"}
          </button>
        </div>

        {showAdd && (
          <div className="mt-3 flex flex-wrap items-end gap-2 bg-gray-50 border border-gray-200 rounded p-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Ressurs-ID *</label>
              <input
                ref={addInputRef}
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomResource()}
                placeholder="f.eks. nav-dagpenger"
                className="text-xs border border-gray-200 rounded px-2 py-1.5 w-44 focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Navn</label>
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomResource()}
                placeholder="Visningsnavn (valgfritt)"
                className="text-xs border border-gray-200 rounded px-2 py-1.5 w-40 focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
            </div>
            <button
              onClick={addCustomResource}
              disabled={!newId.trim()}
              className="text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 rounded px-3 py-1.5 font-medium"
            >
              Legg til
            </button>
          </div>
        )}
      </div>
    )
  }
  ```

- [ ] **Steg 2: Kjør tester**

  ```bash
  npm test
  ```

  Forventet: alle tester passerer.

- [ ] **Steg 3: Commit**

  ```bash
  git add src/components/ResourceVelger.tsx
  git commit -m "feat: rename ressursvelger-tittel og fjern action-felter (TASK-40)"
  ```

---

## Task 4: Fjern TilgangKnapp fra user-info-kortet

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Steg 1: Fjern TilgangKnapp fra user-info-seksjonen**

  I `src/app/dashboard/page.tsx`, fjern denne linja i user-info-kortet (ca. linje 76):

  ```tsx
  {pid && <TilgangKnapp resourcePid={pid} />}
  ```

  Importer `TilgangKnapp` brukes ikke lenger — fjern også import-linja:

  ```ts
  import { TilgangKnapp } from "@/components/TilgangKnapp"
  ```

- [ ] **Steg 2: Kjør tester**

  ```bash
  npm test
  ```

  Forventet: alle tester passerer.

- [ ] **Steg 3: Commit**

  ```bash
  git add src/app/dashboard/page.tsx
  git commit -m "feat: fjern TilgangKnapp fra innlogget-som-seksjonen (TASK-40)"
  ```

---

## Task 5: Vis tjenesteeierinfo i header

Orgnr hentes fra cachet Maskinporten-token (allerede hentet av `getAuthorizedParties`). Navn hentes fra Brønnøysundregistrene.

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Steg 1: Legg til tjenesteeierinfo-logikk i server-komponenten**

  Øverst i `src/app/dashboard/page.tsx`, legg til import av `decodeOrgnr` og `getMaskinportenToken`:

  ```ts
  import { getMaskinportenToken } from "@/lib/maskinporten"
  import { decodeOrgnr } from "@/lib/maskinporten"
  ```

  (Kan kombineres til én import-linje.)

  Rett etter `const isDev = ...`-linja, legg til type for tjenesteeierinfo:

  ```ts
  interface TjenesteeierInfo {
    navn: string
    orgnr: string | null
  }
  ```

  I `DashboardPage`-funksjonen, legg til dette **etter** `const pid = session.user?.pid`-linja og **før** `let aktørData`:

  ```ts
  let tjenesteeier: TjenesteeierInfo = { navn: "Tjenesteeier", orgnr: null }

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
  ```

- [ ] **Steg 2: Oppdater header-JSX**

  Finn `<nav>`-blokken i return-verdien og erstatt den eksisterende headeren:

  ```tsx
  <nav className="bg-white shadow-sm">
    <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold text-gray-800">Tjenesteeier</h1>
      <a href="/api/logout" className="text-sm text-gray-500 hover:text-gray-700">
        Logg ut
      </a>
    </div>
  </nav>
  ```

  Med:

  ```tsx
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
  ```

- [ ] **Steg 3: Kjør tester**

  ```bash
  npm test
  ```

  Forventet: alle tester passerer.

- [ ] **Steg 4: Commit**

  ```bash
  git add src/app/dashboard/page.tsx
  git commit -m "feat: vis tjenesteeierens navn og orgnr i header (TASK-40)"
  ```

---

## Task 6: Lukk TASK-40

- [ ] **Steg 1: Marker alle AC-er som fullført**

  ```bash
  backlog task edit 40 --check-ac 1 --check-ac 2 --check-ac 3 --check-ac 4 --check-ac 5 --check-ac 6
  ```

- [ ] **Steg 2: Sett status Done og legg til final summary**

  ```bash
  backlog task edit 40 -s "Done" --final-summary $'Implementerte seks UI-forbedringer på tjenesteeier-dashbordet.\n\nEndringer:\n- resources.ts: Støtte og tilskudd lagt til som første/default ressurs\n- maskinporten.ts: Ny decodeOrgnr-hjelper (eksportert, testet)\n- ResourceVelger.tsx: Tittel "Ressurs for tilgangssjekk" → "Ressurs"; action-felt fjernet fra visning og legg-til-skjema\n- dashboard/page.tsx: TilgangKnapp fjernet fra innlogget-som-kortet; header viser nå org-navn fra Brreg + orgnr fra Maskinporten-token\n\nFallback: "Ukjent virksomhet · {orgnr}" ved Brreg-feil; "Tjenesteeier" ved token/decode-feil.'
  ```

- [ ] **Steg 3: Push**

  ```bash
  git push
  ```
