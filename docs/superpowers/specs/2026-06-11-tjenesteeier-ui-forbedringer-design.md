# Design: Tjenesteeier UI-forbedringer (TASK-40)

**Dato:** 2026-06-11
**Status:** Godkjent

## Omfang

Seks AC-er fordelt på to kategorier: enkle UI-tweaks og header med tjenesteeierinfo fra Maskinporten + Brønnøysundregistrene.

---

## Del 1: Enkle UI-endringer

### resources.ts
- Legg til `{ id: "urn:altinn:accesspackage:innbygger-stotte-tilskudd", label: "Støtte og tilskudd" }` som første element i `PRECONFIGURED_RESOURCES`. Det første elementet er default ved sidelasting (brukes av `ResourceVelger` som initial `selectedId`).

### ResourceVelger.tsx
- Seksjonstittel: `"Ressurs for tilgangssjekk"` → `"Ressurs"`
- Fjern `<span>action: {effectiveAction}</span>` fra visningen
- Fjern `newAction`-state, action-input og action-label fra legg-til-skjemaet
- `action`-feltet i `Resource`-typen og `dispatchChange`-logikken beholdes uendret — `TilgangKnapp` bruker disse internt

### dashboard/page.tsx
- Fjern `{pid && <TilgangKnapp resourcePid={pid} />}` fra `user-info`-kortet

---

## Del 2: Header med tjenesteeierinfo

### Datakilde
Maskinporten-token (allerede cachet av `getAuthorizedParties`) inneholder et `consumer`-felt:
```json
{ "consumer": { "authority": "iso6523-actorid-upis", "ID": "0192:991825827" } }
```
Orgnr = `consumer.ID` etter å ha fjernet `"0192:"`.

### Brreg-oppslag
`GET https://data.brreg.no/enhetsregisteret/api/enheter/{orgnr}` — offentlig API, ingen auth.
Responsen inneholder `navn`-feltet.

### Implementasjon i dashboard/page.tsx
Inline i server-komponenten, etter at `getAuthorizedParties` er kalt:

```
1. getMaskinportenToken(scope) — returnerer cachet token
2. base64url-decode midtre del av JWT → JSON.parse → consumer.ID
3. Strip "0192:" → orgnr
4. fetch(brreg-url) via Promise.allSettled
5. Suksess → { name, orgnr }
6. Feil → { name: "Ukjent virksomhet", orgnr }
```

### Header-layout
```
[Nav]  Org-navn                     Logg ut
       orgnr: 991825827
```
Erstatter statisk `"Tjenesteeier"` h1 med org-navn som primærtekst og orgnr som subtekst.

### Feilhåndtering
- Brreg-feil: fallback til `"Ukjent virksomhet · {orgnr}"`
- Token-decode-feil (ugyldig JWT): orgnr settes til `null`, header viser bare `"Tjenesteeier"`
- Brreg-kallet inngår ikke i `getAuthorizedParties`-feilen — siden vises uavhengig

---

## Filer som endres

| Fil | Endring |
|-----|---------|
| `src/lib/resources.ts` | Nytt første element i PRECONFIGURED_RESOURCES |
| `src/components/ResourceVelger.tsx` | Rename label, fjern action-visning og action-input |
| `src/app/dashboard/page.tsx` | Fjern TilgangKnapp fra user-info, legg til tjenesteeierinfo i header |

## Filer som ikke endres
- `src/lib/maskinporten.ts` — ingen endring, token-henting er uberørt
- `src/components/TilgangKnapp.tsx` — uberørt
- `src/lib/altinn.ts` — uberørt
