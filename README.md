# Vergeportalen — Demo-app

Demo-applikasjon som viser vergemålsinformasjon og innbyggerfullmakter for innlogget bruker. Appen autentiserer via ID-porten, henter vergeparter og tilgangspakker fra Altinn via Maskinporten, og lar bruker delegere, se og slette tilgangspakker via Altinn enduser-API.

## Arkitektur

```
Browser
  │
  ▼
Next.js 15 (App Router)
  │  Auth.js v5  ──── ID-porten (OIDC, test.idporten.no)
  │                    Innlogging, token-refresh og navn på bruker
  │
  ├── /dashboard                 Server Component — vergeparter og tilgangspakker (Maskinporten-flyt)
  ├── /dashboard/sluttbrukersystem  Server Component — deleger, vis og slett fullmakter (enduser-flyt)
  ├── /login                     Innloggingsside
  ├── /api/logout                RP-initiated logout mot ID-porten
  ├── /api/pdp                   PDP-proxy — sjekker tilgang i Altinn Autorisasjon
  └── /api/delegate              POST delegerer pakker / DELETE sletter enkeltpakke
  │
  ├── Maskinporten (test.maskinporten.no)
  │     Machine-to-machine token — brukes av /dashboard-flyten
  │
  └── Altinn Access Management API
        ├── Vergeparter og tilgangspakker (Maskinporten-token)
        ├── Pakke-metadata (navn, område) fra /meta/info/accesspackages/package/{uuid}
        ├── PDP-sjekk (XACML JSON Profile) mot valgt ressurs
        └── Enduser-API: koblinger, delegering og sletting (ID-porten-token vekslet via exchange)
```

### Nøkkelteknologier

| Teknologi | Formål |
|-----------|--------|
| [Next.js 15](https://nextjs.org) | React-rammeverk med App Router |
| [Auth.js v5](https://authjs.dev) | Autentisering og sesjonshåndtering |
| [ID-porten](https://docs.digdir.no/docs/idporten/) | Norsk nasjonal innloggingstjeneste (OIDC) |
| [Maskinporten](https://docs.digdir.no/docs/Maskinporten/) | Machine-to-machine autentisering |
| [Altinn](https://docs.altinn.studio/api/) | Vergeparter, tilgangspakke-metadata og PDP-sjekk |
| [jose](https://github.com/panva/jose) | JWT-signering for Maskinporten-assertion |
| [Vitest](https://vitest.dev) | Enhetstester og integrasjonstester |

## Kom i gang

### Forutsetninger

- Node.js 20+
- Klienter registrert i [Digdir selvbetjening (test)](https://selvbetjening.test.digdir.no):
  - ID-porten-klient med scopes `openid profile altinn:accessmanagement/enduser:connections:toothers.write altinn:accessmanagement/enduser:connections:toothers.read altinn:accessmanagement/enduser:connections:fromothers.read altinn:accessmanagement/authorizedparties` og riktig redirect URI
  - Maskinporten-klient med nødvendig Altinn-scope

### Oppsett

1. **Klon og installer avhengigheter:**

   ```bash
   git clone <repo-url>
   cd Guardianship_demo
   npm install
   ```

2. **Konfigurer miljøvariabler:**

   ```bash
   cp .env.local.example .env.local
   ```

   Fyll inn verdiene i `.env.local`:

   | Variabel | Beskrivelse |
   |----------|-------------|
   | `AUTH_SECRET` | Tilfeldig streng — generer med `openssl rand -base64 32` |
   | `IDPORTEN_CLIENT_ID` | Client ID fra Digdir selvbetjening |
   | `IDPORTEN_PRIVATE_KEY_JWK` | RSA-privatnøkkel som JWK-JSON (inkl. `kid`) — anbefalt |
   | `IDPORTEN_CLIENT_SECRET` | Fallback hvis `IDPORTEN_PRIVATE_KEY_JWK` ikke er satt |
   | `AUTH_URL` | App-URL (`http://localhost:3000` lokalt) |
   | `MASKINPORTEN_CLIENT_ID` | Client ID for Maskinporten-klient |
   | `MASKINPORTEN_PRIVATE_KEY_JWK` | RSA-privatnøkkel som JWK-JSON (inkl. `kid`) |
   | `ALTINN_SUBSCRIPTION_KEY` | API-nøkkel for Altinn AM (valgfri, men anbefalt) |

3. **Generer RSA-nøkkelpar for Maskinporten** (hvis du ikke allerede har et):

   Bruk [mkjwk.org](https://mkjwk.org) (Key type: RSA, Key size: 2048, Algorithm: RS256) eller et lignende verktøy. Last opp den offentlige nøkkelen som JWK i Maskinporten-klienten i selvbetjening, og legg privatnøkkelens JWK i `MASKINPORTEN_PRIVATE_KEY_JWK`.

### Start utviklingsserver

```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000) i nettleseren.

## Kjøre tester

```bash
# Enhetstester (uten nettverkskall)
npm test

# Integrasjonstester mot test.maskinporten.no (krever .env.local med gyldige verdier)
npm run test:integration

# Watch-modus under utvikling
npm run test:watch
```

### Ende til ende-tester (Playwright)

E2E-testene simulerer en ekte innlogging via ID-porten TestID og verifiserer hele flyten gjennom appen.

```bash
# Kjør e2e-tester (starter dev-server automatisk hvis den ikke kjører)
npm run test:e2e

# Med synlig nettleser (nyttig under utvikling)
npx playwright test --headed

# Vis HTML-rapport etter kjøring
npx playwright show-report
```

**Nødvendige miljøvariabler for e2e:**

| Variabel | Beskrivelse |
|----------|-------------|
| `TEST_PID` | Fødselsnummer for TestID-bruker (11 siffer) |
| `STANDARD_BRUKER` | Valgfritt — overstyrer `TEST_PID` som standardbruker i tester |

Testene bruker `STANDARD_BRUKER ?? TEST_PID` som personidentifikator i ID-porten TestID-innlogging. I GitHub Actions settes disse via repository secrets (se `.github/workflows/e2e.yml`).

## Prosjektstruktur

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # Auth.js handler (callback, session)
│   │   ├── delegate/route.ts             # POST delegerer pakker / DELETE sletter enkeltpakke
│   │   ├── logout/route.ts               # RP-initiated logout mot ID-porten
│   │   └── pdp/route.ts                  # PDP-proxy — videresender tilgangssjekk til Altinn
│   ├── dashboard/
│   │   ├── page.tsx                      # Vergeparter og tilgangspakker (Maskinporten-flyt)
│   │   └── sluttbrukersystem/page.tsx    # Deleger, vis og slett fullmakter (enduser-flyt)
│   ├── login/page.tsx                    # Innloggingsside
│   └── page.tsx                          # Rot — redirect til /dashboard
├── components/
│   ├── DelegereSkjema.tsx               # Multi-stegs skjema for å delegere fullmakt
│   ├── DevPanel.tsx                     # Debug-panel for API-kall (kun dev-modus)
│   ├── ResourceVelger.tsx               # Felles ressursvelger med localStorage-persistering
│   ├── RollerGruppe.tsx                 # Sammenleggbar rolleliste gruppert per provider
│   ├── TilgangKnapp.tsx                 # Knapp for PDP-tilgangssjekk, lytter på ressursskifte
│   ├── TilgangspakkerGruppe.tsx         # Sammenleggbar pakkeliste med slett-støtte
│   └── VergemålDetaljer.tsx             # Accordion for tilgangspakker per vergeperson
├── lib/
│   ├── accesspackages.ts                # Henter og cacher tilgangspakke-metadata (eksport-API)
│   ├── altinn.ts                        # Henter vergeparter og grupperer tilgangspakker
│   ├── altinnEnduser.ts                 # Enduser-token-innveksling, delegering og sletting
│   ├── auth.ts                          # Auth.js v5-konfigurasjon (ID-porten OIDC + refresh)
│   ├── maskinporten.ts                  # Henter og cacher Maskinporten-token
│   ├── packageMeta.ts                   # Henter og cacher pakke-metadata per UUID
│   ├── pdp.ts                           # XACML-forespørsel mot Altinn PDP
│   ├── resources.ts                     # Prekonfigurerte ressurser og localStorage-nøkler
│   ├── roles.ts                         # Henter og cacher rolle-metadata
│   ├── trace.ts                         # TraceEntry-type for API-sporing i dev-modus
│   ├── *.test.ts                        # Enhetstester (Vitest, mocker fetch)
│   └── *.integration.test.ts           # Integrasjonstester mot eksterne API-er
├── middleware.ts                        # Rutebeskyttelse (Next.js middleware)
└── types/
    └── next-auth.d.ts                   # Typeuttvidelse for sesjon (pid, navn, idToken)
e2e/
├── login.spec.ts                        # Playwright e2e-test — innlogging og utlogging
└── pdp.spec.ts                         # Playwright e2e-test — tilgangssjekk-knapp
```

## Viktige konfigurasjonsdetaljer

- **ID-porten** støtter `private_key_jwt` (anbefalt) via `IDPORTEN_PRIVATE_KEY_JWK` — fallback til `client_secret_post`
- **Token-refresh**: access_token fra ID-porten har kort levetid (~120s). JWT-callbacken refresher automatisk via refresh_token hvis tilgjengelig
- **Logout** håndteres via dedikert `/api/logout`-rute som sletter alle `authjs.session-token`-cookies (inkl. chunked `.0`, `.1`, `__Secure-`-varianter) og redirecter til `https://login.test.idporten.no/logout`
- **Maskinporten**-assertion er en RS256-signert JWT med `kid` i headeren — `kid` hentes fra JWK-objektet
- `post_logout_redirect_uri` må registreres i selvbetjening for ID-porten-klienten

### Dev-panel og API-sporing

I utviklingsmodus (`NODE_ENV=development`) vises en **"Dev"-knapp** nederst til høyre. Klikk for å åpne et debug-panel som lister alle HTTP-kall gjort for å bygge siden. Hvert kall kan ekspanderes for å se request og response.

Verbose kall (pakke-metadata, rolle-metadata) er gruppert og skjult som standard — klikk på gruppen for å ekspandere.

Sporingslogikken er implementert via et valgfritt `traces`-parameter i bibliotekfunksjonene:

```ts
const traces: TraceEntry[] = []
const token = await getMaskinportenToken(scope, traces)
const parties = await getAuthorizedParties(pid, traces)
// traces inneholder nå entries med name, request, response, durationMs
```

`access_token` fra Maskinporten er alltid redaktet (`[REDACTED]`) i trace-loggen. Panelet rendres ikke i produksjon.

### Ressursvelger og PDP-tilgangssjekk

Dashboard viser en **ressursvelger** der bruker kan velge hvilken Altinn-ressurs det skal sjekkes tilgang mot. Valget deles av alle «Sjekk tilgang»-knapper på siden via en custom DOM-event (`resource-change`).

**Prekonfigurerte ressurser** er definert i `src/lib/resources.ts`. Bruker kan i tillegg legge til egne ressurser med tre felt:

| Felt | Beskrivelse |
|------|-------------|
| Ressurs-ID | Altinn-ressurs-ID, f.eks. `ttd-vergemalsdemo` |
| Navn | Visningsnavn (fylles inn automatisk hvis tomt) |
| Action | XACML-action, standard `read` |

Egendefinerte ressurser lagres i `localStorage` og gjenopprettes ved neste besøk.

«Sjekk tilgang»-knappen per person sender en XACML JSON-forespørsel til `/api/pdp` som videresender til Altinn Autorisasjon PDP. Mulige svar: `Permit`, `Deny`, `NotApplicable`, `Indeterminate`.

## Oppgaveoversikt

Prosjektet bruker [Backlog.md](https://github.com/MrLesk/Backlog.md) for oppgavehåndtering.

```bash
backlog task list --plain   # List alle oppgaver
backlog board               # Kanban-visning i terminal
```
