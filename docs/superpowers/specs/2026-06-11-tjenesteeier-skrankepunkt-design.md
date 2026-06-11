# Tjenesteeier Skrankepunkt — Designspesifikasjon

## Mål

Tjenesteeiere skal kunne opptre som skrankepunkt og delegere tilgangspakker fra én person til en annen uten at avgiveren selv utfører delegeringen. Tilgang styres av en PDP-sjekk mot ressursen `ttd-skrankepunkt` med `write`-action. Funksjonaliteten plasseres i en dedikert «Skrankepunkt»-fane på tjenesteeier-dashbordet.

---

## Arkitektur

`page.tsx` er en Server Component som kjører tre asynkrone operasjoner parallelt ved sidelasting:

1. `getAuthorizedParties` — aktørliste (eksisterende)
2. `getAccessPackageMetadata` — pakke-metadata (eksisterende)
3. `checkPdpAccess(pid, pid, traces, "ttd-skrankepunkt", "write")` — **ny**

Resultatet av PDP-sjekken evalueres som `harSkrankeAccess = decision === "Permit"` og sendes som prop til en ny `DashboardTabs`-klientkomponent. `checkPdpAccess` returnerer `PdpDecision` (`"Permit" | "Deny" | "NotApplicable" | "Indeterminate"`). PDP-feil (timeout, nettverksfeil) behandles som `false` — fanen vises men er disabled.

**PDP-parametere for skrankepunkt:**
- `subjectPid`: innlogget brukers PID (fra session)
- `resourcePid`: samme PID (tjenesteeier sjekker sin egen rettighet)
- `resourceId`: `"ttd-skrankepunkt"`
- `action`: `"write"`

---

## Komponenter

### Nye filer

**`src/components/DashboardTabs.tsx`** (Client Component)

Styrer tab-tilstand (`"aktørliste" | "skrankepunkt"`). Props:
```ts
interface Props {
  harSkrankeAccess: boolean
  aktørData: AktørData[]
  loggedInPid: string
}
```

Tab-layout: brukerinfo-kortet er alltid synlig over fanene. Fanene bytter innholdsområdet.

- **Aktørliste-fane:** `ResourceVelger` + `AktørVelger` (eksisterende komponenter)
- **Skrankepunkt-fane:** `SkrankepunktFane` (se under)

Disabled-tilstand for Skrankepunkt-fanen (når `harSkrankeAccess === false`):
- Grå tekst, `cursor-not-allowed`
- Forbudt-ikon (SVG ⊘) foran faneteksten
- `title="Ingen tilgang"` → nettleser-tooltip ved hover
- Kan ikke klikkes

---

**`src/components/SkrankepunktFane.tsx`** (Client Component)

Skjema med flyten `form → bekreft → suksess | feil`.

**Felt i form-steget:**
- Fra (fødselsnummer) — tekstfelt, 11 siffer
- Til (fødselsnummer) — tekstfelt, 11 siffer
- Tilgangspakke — dropdown over `DELEGERBARE_PAKKER` fra `src/lib/resources.ts`
- «Neste»-knapp — disabled til begge PID-felt er 11 siffer

**Bekreft-steget:**
- Viser oppsummering: fra, til, pakkenavn
- «Gi fullmakt»-knapp — kaller `POST /api/serviceowner/delegate`
- «Tilbake»-lenke

**Suksess-steg:** Grønn bekreftelsesmelding, «Lukk»-knapp tilbakestiller skjemaet.

**Feil-steg:** Rød feilmelding med tekst fra API, «Prøv igjen» og «Avbryt».

DevPanel-traces dispatches via `dev-trace`-event (samme mønster som eksisterende komponenter).

---

### Endrede filer

**`src/app/dashboard/page.tsx`**

Legger til PDP-sjekk i `Promise.allSettled`-blokken. Erstatter `<AktørVelger>` direkte i JSX med `<DashboardTabs harSkrankeAccess={...} aktørData={...} loggedInPid={...} />`.

---

**`src/components/TjenesteeierDelegereSkjema.tsx`**

Fjerne 2.2-modus (skrankedelegering) og mode-toggle. Beholde kun 2.1-flyten (normal delegering fra valgt aktør). Forenkle komponenten: fjern `mode`-state, `fraPid`-state, og mode-toggle-knappene.

---

**`src/app/api/serviceowner/delegate/route.ts`**

Legge til PDP-resjekk ved innsending **før** Altinn-kallet:

```ts
const pdpDecision = await checkPdpAccess(pid, pid, isDev ? traces : undefined, "ttd-skrankepunkt", "write")
if (pdpDecision !== "Permit") {
  return NextResponse.json(
    { ok: false, error: "Tilgang til skrankepunkt er trukket tilbake" },
    { status: 403 }
  )
}
```

Ingen ny API-rute nødvendig.

---

## Dataflyt

```
page.tsx (server)
  ├── getAuthorizedParties()        → aktørData
  ├── getAccessPackageMetadata()    → metaMap
  └── checkPdpAccess(skrankepunkt)  → harSkrankeAccess
          ↓
DashboardTabs (client)
  ├── tab="aktørliste"  → ResourceVelger + AktørVelger
  └── tab="skrankepunkt"
        └── SkrankepunktFane (client)
              └── POST /api/serviceowner/delegate
                    ├── checkPdpAccess (resjekk)  → 403 hvis trukket
                    └── serviceowner Altinn API
```

---

## Feilhåndtering

| Scenario | Håndtering |
|---|---|
| PDP-timeout ved sidelasting | `harSkrankeAccess = false`, fane disabled |
| PDP revokert ved innsending | HTTP 403, feilmelding i skjema |
| Altinn API-feil | Feilmelding fra API vises i feil-steget |
| Ugyldig PID-format | «Neste»-knapp disabled til 11 siffer er fylt |

---

## Avgrensninger

- Skrankepunkt-fanen bruker `DELEGERBARE_PAKKER` fra `resources.ts` — samme liste som normal tjenesteeier-delegering.
- `ResourceVelger` og tilgangssjekk-funksjonalitet er kun i Aktørliste-fanen — ikke i Skrankepunkt.
- Ingen endring i `/api/serviceowner/delegate`-ruten utover PDP-resjekken.
