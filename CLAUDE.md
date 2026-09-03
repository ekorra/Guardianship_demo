
# Vergeportalen — Prosjektinstruksjoner

## Hva er dette?
Next.js 15 demo-app (App Router) som viser vergemåls- og innbyggerfullmakter for innlogget bruker via ID-porten og Altinn Access Management API.

## Viktige filer

### Autentisering og sesjon
- `src/lib/auth.ts` — Auth.js v5-konfigurasjon med ID-porten OIDC (støtter `private_key_jwt` og `client_secret_post`)
- `src/middleware.ts` — Rutebeskyttelse
- `src/app/api/logout/route.ts` — RP-initiated logout mot ID-porten
- `src/types/next-auth.d.ts` — Session-typeuttvidelse (pid, given_name, family_name, idToken)

### Altinn-integrasjon
- `src/lib/maskinporten.ts` — Maskinporten-token (henter og cacher per scope)
- `src/lib/altinn.ts` — `getAuthorizedParties`, `isVergePart`, `isInnbyggerPart`, `getVergemålGruppert`, `getInnbyggerGruppert`
- `src/lib/accesspackages.ts` — Henter og cacher pakke-metadata fra Altinn AM eksport-API (1t TTL)
- `src/lib/pdp.ts` — PDP-sjekk mot Altinn Authorization API (XACML JSON Profile)
- `src/lib/altinnEnduser.ts` — Enduser-token-innveksling, delegering og sletting:
  - `delegateAccessPackages(accessToken, pid, toPid, toLastName, packageIds[])` — oppretter kobling og delegerer pakker
  - `deleteAccessPackage(accessToken, pid, toPartyUuid, packageId)` — sletter enkeltpakke via `DELETE /enduser/connections/accesspackages?party=&from=&to=&packageId=`
  - `getAllConnections(accessToken, pid)` — henter mottatte og avgitte koblinger parallelt med `&includeAccessPackages=true`
- `src/lib/packageMeta.ts` — Henter og cacher pakke-metadata fra `/meta/info/accesspackages/package/{uuid}` (bruker UUID, ikke URN)
- `src/lib/roles.ts` — Henter og cacher rolle-metadata fra Altinn
- `src/lib/register.ts` — Ubrukt; opprinnelig register-oppslag via Maskinporten (beholdt for referanse)

### API-ruter
- `src/app/api/delegate/route.ts` — POST delegerer tilgangspakker; DELETE sletter enkeltpakke (`toPartyUuid` + `packageId`)

### UI-komponenter
- `src/app/dashboard/page.tsx` — Dashboard (Server Component)
- `src/app/dashboard/sluttbrukersystem/page.tsx` — Sluttbrukersystem-side: DelegereSkjema, mottatte og avgitte fullmakter med pakkenavn
- `src/components/VergemålDetaljer.tsx` — Accordion-liste over tilgangspakker (`variant="vergemål"|"innbygger"`)
- `src/components/TilgangKnapp.tsx` — Knapp for å sjekke PDP-tilgang; lytter på `resource-change`-event
- `src/components/ResourceVelger.tsx` — Felles ressursvelger (nedtrekksliste + legg-til-skjema med action-felt)
- `src/components/DelegereSkjema.tsx` — Multi-stegs skjema (form → velg → bekreft → suksess/feil) for å delegere fullmakt; viser kun `mottatt: true`-pakker; POSTer til `/api/delegate`
- `src/components/RollerGruppe.tsx` — Sammenleggbar liste over roller gruppert per provider
- `src/components/TilgangspakkerGruppe.tsx` — Sammenleggbar liste over tilgangspakker med pakkenavn; støtter inline slett-knapp (✕) med bekreftelsesdialog for avgitte koblinger
- `src/components/DevPanel.tsx` — Dev-panel for å vise API-traces; støtter gruppering (`group`-felt på TraceEntry) for å skjule verbose meta-kall

### Konfigurasjon og CI/CD
- `src/lib/resources.ts` — 5 prekonfigurerte ressurser, localStorage-nøkler, event-navn
- `.github/workflows/ci.yml` — CI: unit → e2e → Vercel prod-deploy (deploy kun når begge grønne)

## Arkitektur: delt ressursvalg uten React Context
`ResourceVelger` dispatches `new CustomEvent("resource-change", { detail: { id, action } })` og skriver til `localStorage`. `TilgangKnapp` lytter via `useEffect`. Dette unngår å wrappe Server Components i en klient-context-provider.

## Arkitektur: DevPanel trace-mønster

Alle kall til eksterne API MÅ støtte trace-innsamling slik at de vises i DevPanel under utvikling.

**Server-side (lib-funksjoner):**
```ts
async function kallEksterntApi(arg: string, traces?: TraceEntry[]): Promise<Result> {
  const t0 = Date.now()
  const response = await fetch(url, { ... })
  const durationMs = Date.now() - t0
  if (!response.ok) {
    const body = await response.text()
    traces?.push({ name: "Navn på kall", request: { method, url }, response: { status: response.status, body }, durationMs })
    throw new Error(`Feilmelding: ${response.status}`)
  }
  const data = await response.json()
  traces?.push({ name: "Navn på kall", request: { method, url }, response: { status: response.status, body: data }, durationMs })
  return data
}
```

**API-rute (route.ts):**
```ts
const isDev = process.env.NODE_ENV === "development"
const traces: TraceEntry[] = []
// kall lib-funksjon med traces-array kun i dev
await kallEksterntApi(arg, isDev ? traces : undefined)
return NextResponse.json({ ..., traces: isDev ? traces : undefined })
```

**Klient-komponent:**
```ts
const data = await res.json()
if (data.traces?.length) {
  window.dispatchEvent(new CustomEvent("dev-trace", { detail: data.traces }))
}
```

`DevPanel` lytter på `dev-trace`-eventet og viser alle entries. Mønsteret brukes i `pdp.ts`, `maskinporten.ts`, `altinn.ts`, `altinnEnduser.ts` og tilhørende ruter/komponenter.

## Kjente tekniske fallgruver

### ID-porten
- **To klienter**: `idporten` (flyt 3, alle enduser-scopes) og `idporten-tjenesteeier` (flyt 2, kun `openid profile`). Begge bruker samme `IDPORTEN_PRIVATE_KEY_JWK`. `idporten-tjenesteeier` aktiveres kun når `IDPORTEN_TJENESTEEIER_CLIENT_ID` er satt. `token.provider` lagres i JWT for å velge riktig `client_id` ved token-refresh.
- **Primær auth-metode**: `private_key_jwt` via `IDPORTEN_PRIVATE_KEY_JWK` — fallback til `client_secret_post` hvis env-variabelen mangler
- **oauth4webapi aud-bug**: `oauth4webapi` sender `aud` som array `[issuer, token_endpoint]` for `private_key_jwt` — ID-porten krever string. Løst med `[customFetch]` fra `@auth/core` som re-signerer JWT med korrekt `aud`
- **jose.importJWK** returnerer `KeyObject`, ikke `CryptoKey` — bruk `crypto.subtle.importKey` i stedet
- **Scopes**: `openid profile` (gir `given_name` og `family_name`)
- **acr**: `idporten-loa-substantial`
- **End session endpoint**: `https://login.test.idporten.no/logout` (IKKE `/connect/endsession`)
- `post_logout_redirect_uri` MÅ registreres i Digdir selvbetjening

### Auth.js v5 logout
- `signOut({ redirectTo: externalUrl })` støtter IKKE eksterne URLer
- Løsning: Dedikert `/api/logout` GET-rute
- **`redirect()` fra `next/navigation` dropper Set-Cookie-headere** i Route Handlers — bruk `NextResponse.redirect()` og sett cookies direkte på response-objektet
- På HTTPS (Vercel) heter cookie `__Secure-authjs.session-token` — begge varianter må slettes ved logout
- **`__Secure-` cookies ignoreres av Chrome ved `cookies.delete()`** fordi Secure-flagget ikke settes. Slett med `response.cookies.set("__Secure-authjs.session-token", "", { maxAge: 0, secure: true, ... })` i stedet

### Maskinporten
- JWT assertion må inkludere `kid` i protected header
- Assertion er RS256-signert med privatnøkkel fra `MASKINPORTEN_PRIVATE_KEY_JWK` (JWK-format)
- Token caches in-memory per scope med 10 sekunders margin før utløp
- Test-endepunkt: `https://test.maskinporten.no/token` / Audience: `https://test.maskinporten.no/`
- **Scopes i bruk**: `altinn:accessmanagement/authorizedparties.resourceowner` (lese parter, flyt 2), `altinn:accessmanagement/authorizedparties.serviceowner` (serviceowner-parter), `altinn:serviceowner/delegations:accesspackage.write` (delegere tilgangspakker via serviceowner-API)
- **POST /serviceowner/connections/accesspackages** body: `{ from: "urn:altinn:person:identifier-no:{pid}", to: "urn:altinn:person:identifier-no:{pid}", packageUrn: "urn:altinn:accesspackage:..." }` — from/to MÅ være URN-format, ikke bare PID

### Altinn PDP (XACML JSON)
- Request MÅ wrappes i `{ Request: { AccessSubject, Action, Resource } }`
- Action value: `"read"`, DataType: `"http://www.w3.org/2001/XMLSchema#string"`
- Maskinporten-token må veksles inn mot Altinn-token før bruk: `GET /authentication/api/v1/exchange/maskinporten`
- Subscription key sendes som `Ocp-Apim-Subscription-Key`-header

### Altinn enduser (brukerstyrt delegering og sletting)
- ID-porten access_token (ikke id_token) veksles til Altinn enduser-token: `GET /authentication/api/v1/exchange/id-porten`
- **`altinn:register.read` er ikke et gyldig Maskinporten-scope** — ikke forsøk å bruke dette
- Krever disse scopene på ID-porten-klienten: `altinn:accessmanagement/enduser:connections:toothers.write`, `altinn:accessmanagement/enduser:connections:toothers.read`, `altinn:accessmanagement/enduser:connections:fromothers.read`, `altinn:accessmanagement/authorizedparties`
- **Separat ID-porten-klient nødvendig** for Altinn-scopes — disse kan ikke legges til en eksisterende klient uten at den er konfigurert for det
- Innlogget brukers `partyUuid` hentes fra `GET /enduser/authorizedparties`; responsen er `{ data: [...] }` (ikke direkte array); filtrer på `personId === pid`
- Kobling opprettes med `POST /enduser/connections?party={partyUuid}` med body `{ personIdentifier, lastName }`; respons inneholder `{ id, toId, fromId, roleId }`
- Tilgangspakker delegeres med `POST /enduser/connections/accesspackages?party={fromPartyUuid}&connection={connectionId}&to={toId}&package={encodeURIComponent(packageId)}` — pakke-ID og mottaker er **query-parametere**, ikke body
- Tilgangspakker slettes med `DELETE /enduser/connections/accesspackages?party={partyUuid}&from={partyUuid}&to={toPartyUuid}&packageId={packageId}` — **ikke** `connection`-parameter, og `packageId` (UUID) brukes fremfor `package` (URN)
- For avgitte koblinger (fra=innlogget bruker) er `conn.party.id` mottakerens `partyUuid` — brukes direkte som `to`-parameter
- Pakke-metadata hentes med UUID (ikke URN) fra `/meta/info/accesspackages/package/{uuid}` — APIet returnerer objekt, ikke array
- `session.accessToken` (ID-porten access_token) brukes til exchange — `session.idToken` beholdes separat for logout (`id_token_hint`)

### Altinn Correspondence API
- Endpoint: `POST https://platform.tt02.altinn.no/correspondence/api/v1/correspondence`
- Autentisering: Maskinporten-token brukes **direkte** (ingen veksling til Altinn-token)
- Scopes: `altinn:serviceowner altinn:correspondence.write`
- Request-body MÅ følge `InitializeCorrespondencesExt`-strukturen:
  ```json
  {
    "correspondence": {
      "resourceId": "ttd-vergemalsdemo-melding",
      "sender": "urn:altinn:organization:identifier-no:{orgnr}",
      "sendersReference": "{uuid}",
      "content": { "language": "nb", "messageTitle": "...", "messageSummary": "...", "messageBody": "<p>...</p>" }
    },
    "recipients": ["urn:altinn:person:identifier-no:{pid}"],
    "request": { "isWithoutReservationRequest": false }
  }
  ```
  Feltnavn i `content` er `messageTitle`/`messageSummary`/`messageBody` — **ikke** `title`/`summary`/`body`
- **`request`-feltet er påkrevd** og må inneholde `isWithoutReservationRequest` eksplisitt (C# `required`-keyword)
- **Sender-orgnr dekodes fra Maskinporten-token** via `consumer.ID`-claimet i payload
- **`hasCompetentAuthority.Organization` MÅ settes i ressursregisteret** — dette er et udokumentert krav for organisasjoner fra Digdirs testorganisasjon (Testdepartementet/TTD). Uten dette feltet returnerer API-et CORR-01036 («ResourceId must match an existing resource»), selv om ressursen finnes. Feltet settes manuelt via Gitea på ressurs-yaml-filen; `resourceType` skal være `CorrespondenceService`
- Subscription key (`Ocp-Apim-Subscription-Key`) er **ikke** nødvendig for Correspondence API

### E2E-tester
- ID-portens TestID-selector-side er ustabil — `click()` er wrapped i `try/catch` med 5s timeout
- `STANDARD_BRUKER` / `TEST_PID` env-variabel må settes i CI for at e2e-tester kjøres

### Testing
- Enhetstester (`npm test`): mocker `fetch` globalt med `vi.stubGlobal`
- Integrasjonstester (`npm run test:integration`): hopper over automatisk hvis env-variabler mangler
- `generateKeyPair` i tester krever `{ extractable: true }` for å eksportere JWK

## Miljøvariabler (.env.local)
- `AUTH_SECRET` — tilfeldig streng
- `AUTH_URL` — app-URL (lokalt: `http://localhost:3000`, prod: `https://guardianship-demo.vercel.app`)
- `IDPORTEN_CLIENT_ID` — flyt 3 (sluttbrukersystem) — har alle enduser-scopes
- `IDPORTEN_CLIENT_SECRET` — kun nødvendig uten private_key_jwt
- `IDPORTEN_PRIVATE_KEY_JWK` — RSA privatnøkkel som JWK-JSON (inkluderer `kid`); deles av begge ID-porten-klienter
- `IDPORTEN_TJENESTEEIER_CLIENT_ID` — flyt 2 (tjenesteeier) — kun `openid profile`; samme JWK registreres i Digdir selvbetjening
- `IDPORTEN_TJENESTEEIER_KID` — `kid` som Digdir selvbetjening tildelte ved opplasting av nøkkel for tjenesteeier-klienten; kan avvike fra `kid` i `IDPORTEN_PRIVATE_KEY_JWK`
- `MASKINPORTEN_CLIENT_ID` — fra selvbetjening.test.digdir.no
- `MASKINPORTEN_PRIVATE_KEY_JWK` — RSA privatnøkkel som JWK-JSON (inkluderer `kid`)
- `ALTINN_SUBSCRIPTION_KEY` — API-nøkkel for Altinn AM (valgfri, men anbefalt)

## Arbeidsprinsipper

### 1. Tenk før du koder

Ikke anta. Ikke skjul usikkerhet. Løft frem avveininger.

Før implementasjon:
- Oppgi antakelser eksplisitt. Er du usikker, spør.
- Hvis flere tolkninger finnes, presenter dem — ikke velg stilltiende.
- Hvis en enklere løsning finnes, si det. Utfordre når det er grunnlag for det.
- Hvis noe er uklart, stopp. Navngi hva som er forvirrende. Spør.

### 2. Enkelhet først

Minimum kode som løser problemet. Ingenting spekulativt.

- Ingen funksjoner utover det som ble bedt om.
- Ingen abstraksjoner for engangsbruk.
- Ingen «fleksibilitet» eller «konfigurerbarhet» som ikke ble etterspurt.
- Ingen feilhåndtering for umulige scenarioer.
- Hvis du skriver 200 linjer og det kunne vært 50, skriv om.

Spør deg selv: «Ville en erfaren utvikler si dette er overkomplisert?» Hvis ja, forenkle.

### 3. Kirurgiske endringer

Berør bare det du må. Rydd bare opp i din egen rot.

Ved redigering av eksisterende kode:
- Ikke «forbedre» tilstøtende kode, kommentarer eller formattering.
- Ikke refaktorer ting som ikke er ødelagt.
- Match eksisterende stil, selv om du ville gjort det annerledes.
- Hvis du oppdager urelatert dødkode, nevn det — ikke slett det.

Når dine endringer skaper foreldreløse elementer:
- Fjern import/variabler/funksjoner som DINE endringer gjør ubrukte.
- Ikke fjern pre-eksisterende dødkode med mindre du blir bedt om det.

Testen: Hver endrede linje skal spore direkte til brukerens forespørsel.

### 4. Målstyrt utførelse

Definer suksesskriterier. Loop til verifisert.

Gjør oppgaver om til verifiserbare mål:
- «Legg til validering» → «Skriv tester for ugyldige inndata, gjør dem grønne»
- «Fiks buggen» → «Skriv en test som reproduserer den, gjør den grønn»
- «Refaktorer X» → «Sørg for at tester passerer før og etter»

For flerstegsoppgaver, oppgi en kort plan:
```
1. [Steg] → verifiser: [sjekk]
2. [Steg] → verifiser: [sjekk]
3. [Steg] → verifiser: [sjekk]
```

<!-- BACKLOG.MD GUIDELINES START -->

Backlog CLI-instruksjoner er i `.claude/skills/backlog-usage/SKILL.md` — invoke with `/backlog-usage`.

<!-- BACKLOG.MD GUIDELINES END -->
