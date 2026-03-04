# Vergeportalen — Demo-app

Demo-applikasjon som viser vergemålsinformasjon for innlogget bruker. Appen autentiserer via ID-porten og henter rolledata fra Altinn via Maskinporten.

## Arkitektur

```
Browser
  │
  ▼
Next.js 16 (App Router)
  │  Auth.js v5  ──── ID-porten (OIDC, test.idporten.no)
  │                    Innlogging og navn på bruker
  │
  ├── /dashboard    Server Component — viser innlogget bruker og vergerolle
  ├── /login        Innloggingsside
  └── /api/logout   RP-initiated logout mot ID-porten
  │
  ▼
Maskinporten (test.maskinporten.no)
  Machine-to-machine token med RSA-signert JWT assertion
  │
  ▼
Altinn Autorisasjon API
  Henter vergerolle (hvem brukeren er verge for)
```

### Nøkkelteknologier

| Teknologi | Formål |
|-----------|--------|
| [Next.js 16](https://nextjs.org) | React-rammeverk med App Router |
| [Auth.js v5](https://authjs.dev) | Autentisering og sesjonshåndtering |
| [ID-porten](https://docs.digdir.no/docs/idporten/) | Norsk nasjonal innloggingstjeneste (OIDC) |
| [Maskinporten](https://docs.digdir.no/docs/Maskinporten/) | Machine-to-machine autentisering |
| [Altinn](https://docs.altinn.studio/api/) | Hente vergerolle og rolledata |
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

## Prosjektstruktur

```
src/
├── app/
│   ├── api/logout/route.ts     # RP-initiated logout mot ID-porten
│   ├── dashboard/page.tsx      # Hovedside etter innlogging
│   ├── login/page.tsx          # Innloggingsside
│   └── page.tsx                # Rot — redirect til /dashboard
├── lib/
│   ├── auth.ts                 # Auth.js v5-konfigurasjon (ID-porten OIDC)
│   ├── maskinporten.ts         # Henter og cacher Maskinporten-token
│   ├── maskinporten.test.ts    # Enhetstester
│   └── maskinporten.integration.test.ts  # Integrasjonstester
├── middleware.ts                # Rutebeskyttelse (krever innlogging)
└── types/
    └── next-auth.d.ts          # Typeuttvidelse for sesjon (pid, navn, idToken)
```

## Viktige konfigurasjonsdetaljer

- **ID-porten** krever `token_endpoint_auth_method: "client_secret_post"` (ikke standard `basic`)
- **Logout** håndteres via dedikert `/api/logout`-rute som sletter `authjs.session-token`-cookie og redirecter til ID-portens `end_session`-endepunkt (`https://login.test.idporten.no/logout`)
- **Maskinporten**-assertion er en RS256-signert JWT med `kid` i headeren — `kid` hentes fra JWK-objektet
- `post_logout_redirect_uri` må registreres i selvbetjening for ID-porten-klienten

## Oppgaveoversikt

Prosjektet bruker [Backlog.md](https://github.com/MrLesk/Backlog.md) for oppgavehåndtering.

```bash
backlog task list --plain   # List alle oppgaver
backlog board               # Kanban-visning i terminal
```
