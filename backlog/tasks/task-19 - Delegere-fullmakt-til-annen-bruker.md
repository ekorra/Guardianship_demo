---
id: TASK-19
title: Delegere fullmakt til annen bruker
status: Done
assignee:
  - '@espen'
created_date: '2026-03-12 05:48'
updated_date: '2026-05-21 14:29'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Innlogget bruker skal kunne delegere en eller flere tilgangspakker til en annen person via Altinn Access Management - Enduser API. Brukeren velger mottaker (PID), velger hvilke pakker som skal delegeres, og bekrefter. Delegeringen sendes til Altinn og resultatet vises.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Bruker kan åpne et «Deleger fullmakt»-skjema fra dashboard
- [x] #2 Bruker kan søke opp / fylle inn PID og etternavn på mottaker
- [x] #3 Bruker kan velge én eller flere tilgangspakker å delegere
- [x] #4 Bekreftelsesvisning vises før innsending
- [x] #5 Delegeringen sendes til Altinn AM API og svar håndteres
- [x] #6 Suksess- og feilmeldinger vises for brukeren
- [x] #7 Kun innlogget bruker kan delegere, og kun på vegne av seg selv — ikke på vegne av vergemålsparter
- [x] #8 Tilgjengelilge pakker for delegering er begrenset til PRECONFIGURED_RESOURCES
- [x] #9 Man skal kunne delegere til personer som ikke er i egen authorized parties-liste (mottaker sendes som personIdentifier+lastName i body)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. src/lib/register.ts — getPartyByPid via Maskinporten + altinn:register.read
2. src/lib/altinnEnduser.ts — exchangeIdPortenToken, createConnection, delegatePackages
3. src/app/api/delegate/route.ts — POST-rute som orchestrerer stegene
4. src/components/DelegereSkjema.tsx — multi-step client component
5. Dashboard — Deleger-knapp per vergepart
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implementert og verifisert delegering av tilgangspakker til annen bruker via Altinn AM Enduser API.

Endringer:
- src/lib/altinnEnduser.ts: Full delegasjonsflyt med trace-støtte — token-innveksling (ID-porten→Altinn), partyUuid-oppslag, opprett kobling, deleger pakke
- src/app/api/delegate/route.ts: POST-rute med trace-retur i dev-modus
- src/components/DelegereSkjema.tsx: Multi-step skjema (mottaker→pakkevalg→bekreft→resultat); bruker DELEGERBARE_PAKKER fra resources.ts; dispatcher dev-trace-event til DevPanel
- src/app/dashboard/page.tsx: DelegereSkjema flyttet til innlogget brukers eget kort (ikke per vergemålspart)
- src/lib/resources.ts: DELEGERBARE_PAKKER-array med forhåndsdefinerte delegerbare pakker
- src/lib/auth.ts: Scopes utvidet med altinn:accessmanagement/enduser:connections:toothers.write og altinn:accessmanagement/authorizedparties

API-detaljer funnet under integrasjonstest:
- /authorizedparties returnerer { data: [...] } (ikke direkt array)
- Pakke-ID sendes som ?package= query-param (ikke i body)
- Mottaker sendes som ?to={toPartyUuid} query-param; toId hentes fra connection-respons
- Ny ID-porten-klient nødvendig for Altinn-scopes
<!-- SECTION:FINAL_SUMMARY:END -->
