---
id: TASK-19
title: Delegere fullmakt til annen bruker
status: Done
assignee:
  - '@espen'
created_date: '2026-03-12 05:48'
updated_date: '2026-05-06 11:33'
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
Implementert delegering av fullmakt til annen bruker via Altinn AM Enduser API.

Endringer:
- src/lib/register.ts: getPartyByPid() — slår opp partyUuid via Altinn Register API
- src/lib/altinnEnduser.ts: exchangeIdPortenToken(), createConnection(), delegatePackage() og delegateAccessPackages() — full delegasjonsflyt som endbruker
- src/app/api/delegate/route.ts: POST-rute som orchestrerer register-oppslag, token-innveksling, connection-oppretting og pakkedelegering
- src/components/DelegereSkjema.tsx: multi-step client component (mottaker → pakkevalg → bekreft → resultat)
- src/app/dashboard/page.tsx: DelegereSkjema vises under vergemålspakker per part

Merk: Maskinporten-scope for register.ts (altinn:register.read) og nøyaktig request-format for delegatePackage() kan måtte justeres ved integrasjonstest mot tt02.
<!-- SECTION:FINAL_SUMMARY:END -->
