---
id: TASK-15
title: Integrer mot Altinn Autorisasjon PDP
status: Done
assignee:
  - '@claude'
created_date: '2026-03-10 16:10'
updated_date: '2026-03-11 14:09'
labels:
  - altinn
  - authorization
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Innlogget bruker skal kunne sjekke om de har tilgang til å representere en part via Altinn PDP (Policy Decision Point). PDP-kallet bruker XACML JSON Profile og returnerer Permit/Deny/NotApplicable.\n\nKonfigurasjon (hardkodet i første versjon):\n- Ressurs: ttd-vergemaldemo\n- Handling: les\n- Maskinporten scope: altinn:authorization/authorize\n- PDP-endepunkt: https://platform.tt02.altinn.no/authorization/api/v1/authorize\n\nXACML-request-struktur:\n- AccessSubject: urn:altinn:person:identifier-no = innlogget brukers pid\n- Action: urn:altinn:action-id = les\n- Resource: urn:altinn:resource = ttd-vergemaldemo + urn:altinn:person:identifier-no = valgt parts personId\n\nInnlogget bruker kan sjekke tilgang for:\n- Alle vergeparter i listen (personId)\n- Seg selv (eget pid)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Hver part i listen har en 'Sjekk tilgang'-knapp
- [x] #2 Innlogget bruker vises øverst i listen med mulighet til å sjekke tilgang for seg selv
- [x] #3 Klikk på knappen kaller Next.js API-rute POST /api/pdp som videresender til Altinn PDP med Maskinporten-token (scope: altinn:authorization/authorize)
- [x] #4 Permit vises som grønn badge, Deny som rød badge, NotApplicable som grå badge
- [x] #5 Badge vises ved siden av partens navn etter sjekk er utført
- [x] #6 PDP-kallet er synlig i dev-panel (traces) med request og response
- [x] #7 Enhetstester for PDP-klientfunksjonen (mock fetch)
- [x] #8 Integrasjonstest mot Altinn PDP test-miljø (hopper over uten env-variabler)
- [x] #9 E2e-test verifiserer at 'Sjekk tilgang'-knapp vises og badge rendres etter klikk
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Opprett src/lib/pdp.ts med checkPdpAccess(subjectPid, resourcePid, traces?) -> PdpDecision
   - Henter Maskinporten-token med scope altinn:authorization/authorize
   - Bygger XACML JSON request (AccessSubject=subjectPid, Action=les, Resource=ttd-vergemaldemo + resourcePid)
   - POST til https://platform.tt02.altinn.no/authorization/api/v1/authorize
   - Returnerer "Permit" | "Deny" | "NotApplicable"
   - Legger trace-entry
2. Opprett src/app/api/pdp/route.ts (POST)
   - Valider sesjon (redirect til /login hvis ikke innlogget)
   - Les resourcePid fra request body
   - Kall checkPdpAccess(session.pid, resourcePid)
   - Returner { decision } JSON
3. Opprett src/components/TilgangKnapp.tsx (Client Component)
   - Props: resourcePid, label?
   - State: idle | loading | Permit | Deny | NotApplicable
   - Knapp kaller POST /api/pdp med { resourcePid }
   - Badge: grønn (Permit), rød (Deny), grå (NotApplicable)
4. Oppdater src/app/dashboard/page.tsx
   - Legg til TilgangKnapp for innlogget bruker (selv-sjekk, resourcePid=pid) øverst i brukerinfo-kortet
   - Legg til TilgangKnapp for hver part i listen
5. Opprett src/lib/pdp.test.ts - enhetstester (mock fetch)
6. Opprett src/lib/pdp.integration.test.ts - integrasjonstest (skip uten env)
7. Opprett e2e/pdp.spec.ts - e2e-test
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implementert Altinn Autorisasjon PDP-integrasjon.

Endringer:
- src/lib/pdp.ts: checkPdpAccess(subjectPid, resourcePid, traces?) — bygger XACML JSON-forespørsel og kaller Altinn PDP med Maskinporten-scope altinn:authorization/authorize. Returnerer "Permit" | "Deny" | "NotApplicable".
- src/app/api/pdp/route.ts: POST /api/pdp — validerer sesjon, leser resourcePid fra body og kaller checkPdpAccess.
- src/components/TilgangKnapp.tsx: Client Component med knapp og badge-visning (grønn/rød/grå).
- src/app/dashboard/page.tsx: TilgangKnapp lagt til for innlogget bruker (selv-sjekk) og for hver Person-part i listen.

Tester:
- 7 enhetstester i pdp.test.ts (alle grønne, 30 totalt i test-suite)
- Integrasjonstest i pdp.integration.test.ts (hopper over uten env-variabler)
- E2e-test i e2e/pdp.spec.ts (verifiserer knapp og badge for selv-sjekk og vergeparter)

Post-implementasjon justeringer:
- Altinn token-innveksling lagt til (GET /authentication/api/v1/exchange/maskinporten) før PDP-kall
- Maskinporten token-cache gjort scope-nøklet (Map<string, TokenCache>) for å unngå at feil token gjenbrukes
- XACML request pakket inn i { Request: ... } wrapper som Altinn PDP krever
- Action AttributeId endret til urn:oasis:names:tc:xacml:1.0:action:action-id, Value til "read" med DataType http://www.w3.org/2001/XMLSchema#string
- RESOURCE_ID oppdatert til ttd-vergemalsdemo
- Subscription key (Ocp-Apim-Subscription-Key) lagt til for Altinn APIM
- Indeterminate lagt til som gyldig PdpDecision med varseltrekant i UI (brukes ved syntaksfeil)
- Tester oppdatert for å reflektere Request-wrapper, read-action og ttd-vergemalsdemo
<!-- SECTION:FINAL_SUMMARY:END -->
