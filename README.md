# Vergeportalen — Demo-app

Demo-applikasjon som viser vergemålsinformasjon for innlogget bruker. Appen autentiserer via ID-porten, henter vergeparter og tilgangspakker fra Altinn via Maskinporten, og lar bruker sjekke PDP-tilgang mot valgbare Altinn-ressurser.

## Arkitektur

```
Browser
  │
  ▼
Next.js 16 (App Router)
  │  Auth.js v5  ──── ID-porten (OIDC, test.idporten.no)
  │                    Innlogging og navn på bruker
  │
  ├── /dashboard    Server Component — viser innlogget bruker, vergeparter og tilgangspakker
  ├── /login        Innloggingsside
  ├── /api/logout   RP-initiated logout mot ID-porten
  └── /api/pdp      PDP-proxy — sjekker tilgang i Altinn Autorisasjon
  │
  ▼
Maskinporten (test.maskinporten.no)
  Machine-to-machine token med RSA-signert JWT assertion
  │
  ▼
Altinn Autorisasjon API
  ├── Henter vergeparter og tilgangspakker (hvem brukeren er verge for)
  ├── Henter metadata for tilgangspakker (navn, område)
  └── PDP-sjekk (XACML JSON Profile) mot valgt ressurs
```

### Nøkkelteknologier

| Teknologi | Formål |
|-----------|--------|
| [Next.js 16](https://nextjs.org) | React-rammeverk med App Router |
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
  - ID-porten-klient med `openid profile`-scope og riktig redirect URI
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
   | `IDPORTEN_CLIENT_SECRET` | Client Secret fra Digdir selvbetjening |
   | `AUTH_URL` | App-URL (`http://localhost:3000` lokalt) |
   | `MASKINPORTEN_CLIENT_ID` | Client ID for Maskinporten-klient |
   | `MASKINPORTEN_PRIVATE_KEY_JWK` | RSA-privatnøkkel som JWK-JSON |

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
│   │   ├── auth/[...nextauth]/route.ts  # Auth.js handler (callback, session)
│   │   ├── logout/route.ts             # RP-initiated logout mot ID-porten
│   │   └── pdp/route.ts               # PDP-proxy — videresender tilgangssjekk til Altinn
│   ├── dashboard/page.tsx              # Hovedside etter innlogging
│   ├── login/page.tsx                  # Innloggingsside
│   └── page.tsx                        # Rot — redirect til /dashboard
├── components/
│   ├── DevPanel.tsx                    # Debug-panel for API-kall (kun dev-modus)
│   ├── ResourceVelger.tsx              # Felles ressursvelger med localStorage-persistering
│   ├── TilgangKnapp.tsx               # Knapp for PDP-tilgangssjekk, lytter på ressursskifte
│   └── VergemålDetaljer.tsx           # Accordion for tilgangspakker per vergeperson
├── lib/
│   ├── accesspackages.ts              # Henter og cacher tilgangspakke-metadata fra Altinn
│   ├── altinn.ts                       # Henter vergeparter og grupperer tilgangspakker
│   ├── auth.ts                         # Auth.js v5-konfigurasjon (ID-porten OIDC)
│   ├── maskinporten.ts                 # Henter og cacher Maskinporten-token
│   ├── pdp.ts                          # XACML-forespørsel mot Altinn PDP
│   ├── resources.ts                   # Prekonfigurerte ressurser og localStorage-nøkler
│   ├── trace.ts                        # TraceEntry-type for API-sporing i dev-modus
│   ├── *.test.ts                       # Enhetstester (Vitest, mocker fetch)
│   └── *.integration.test.ts          # Integrasjonstester mot eksterne API-er
├── middleware.ts                       # Rutebeskyttelse (Next.js middleware)
└── types/
    └── next-auth.d.ts                  # Typeuttvidelse for sesjon (pid, navn, idToken)
e2e/
├── login.spec.ts                       # Playwright e2e-test — innlogging og utlogging
└── pdp.spec.ts                        # Playwright e2e-test — tilgangssjekk-knapp
```

## Viktige konfigurasjonsdetaljer

- **ID-porten** krever `token_endpoint_auth_method: "client_secret_post"` (ikke standard `basic`)
- **Logout** håndteres via dedikert `/api/logout`-rute som sletter `authjs.session-token`-cookie og redirecter til ID-portens `end_session`-endepunkt (`https://login.test.idporten.no/logout`)
- **Maskinporten**-assertion er en RS256-signert JWT med `kid` i headeren — `kid` hentes fra JWK-objektet
- `post_logout_redirect_uri` må registreres i selvbetjening for ID-porten-klienten

### Dev-panel og API-sporing

I utviklingsmodus (`NODE_ENV=development`) vises en **"Dev"-knapp** nederst til høyre på dashboard-siden. Klikk på den for å åpne et debug-panel som lister alle HTTP-kall som ble gjort for å bygge siden (Maskinporten-token og Altinn-oppslag). Hvert kall kan ekspanderes for å se request og response.

Sporingslogikken er implementert via et valgfritt `traces`-parameter i bibliotekfunksjonene:

```ts
// Samle traces manuelt (gjøres automatisk av dashboard i dev-modus):
const traces: TraceEntry[] = []
const token = await getMaskinportenToken(scope, traces)
const parties = await getAuthorizedParties(pid, traces)
// traces inneholder nå to entries: "Maskinporten token" og "Altinn vergemål"
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
